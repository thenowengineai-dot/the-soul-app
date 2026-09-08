import asyncio
import json
import time
import os
import sys
import random
import re
from typing import Dict, Any, List, AsyncGenerator, Optional

from loguru import logger

from agents.director_agent import DirectorAgent
from agents.actor_agent import ActorAgent
from agents.evaluator_agent import EvaluatorAgent
from engine.state_manager import StateManager
import tempfile
from engine.context_builder import ContextBuilder
from engine.db_core import DatabaseCore 
from engine.postgres_core import get_postgres_core
from engine.transitions import SceneTransitionManager 
from engine.memory_core import MemoryCore

# ==========================================
# ⚙️ MONITORING CONFIGURATION
# ==========================================
logger.remove()
FORMAT = (
    "<cyan>🕒 {time:HH:mm:ss}</cyan> | "
    "<level>{level: <8}</level> | "
    "{message}"
)
logger.add(sys.stdout, colorize=True, format=FORMAT, level="DEBUG")

# ==========================================
# 🔐 AUTHENTICATION (GCP vs GEMINI API KEY)
# ==========================================
if os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
    logger.info("✅ [AUTH] GOOGLE_APPLICATION_CREDENTIALS is already set.")
elif "GCP_CREDENTIALS_JSON" in os.environ:
    try:
        creds_json = os.environ["GCP_CREDENTIALS_JSON"]
        fd, path = tempfile.mkstemp(suffix=".json")
        with os.fdopen(fd, 'w') as f:
            f.write(creds_json)
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = path
        logger.info("✅ [AUTH] Successfully loaded GCP credentials from Secret.")
    except Exception as e:
        logger.error(f"❌ [AUTH] Failed to load GCP credentials: {e}")
elif "GEMINI_API_KEY" in os.environ:
    logger.info("✅ [AUTH] Using GEMINI_API_KEY for authentication.")
else:
    logger.warning("⚠️ [AUTH] No GCP_CREDENTIALS_JSON or GEMINI_API_KEY found. API calls may fail.")

from engine.round_assembler import assemble_interaction_round
from engine.redis_cache import RedisHotCache

class GamePipeline:
    def __init__(self):
        logger.opt(colors=True).info("<white>🚀 Engine 5.5 Pipeline: ระบบ Supabase Cloud State พร้อมทำงาน...</white>")
        self.director = DirectorAgent()
        self.actor = ActorAgent()
        self.evaluator = EvaluatorAgent()
        self.state_manager = StateManager()
        self.context_builder = ContextBuilder()
        self.db = DatabaseCore() 
        self.memory = MemoryCore()
        self.redis = RedisHotCache()

    # 🚨 Signature เดิมเป๊ะ ไม่แตะต้องตัวแปรใดๆ ของกัปตัน
    async def process_chat_turn(
        self,
        user_id: str,
        character_id: str,
        session_id: str,
        user_message: str,
        character_data: Dict[str, Any],
        history: list = None,
        current_world_state: Dict[str, Any] = None,
        world_id: str = None,
        is_regenerate: bool = False
    ) -> AsyncGenerator[str, None]:
        
        turn_start_time = time.time()
        logger.info(f"🕒 📥 [USER] Message: '{user_message}'")
        
        def get_t():
            return f"{time.time() - turn_start_time:.2f}"

        # ==================================================
        # 💾 [DATABASE] STEP 1: โหลด State ล่าสุดจาก Database ด้วย session_id โดยตรง
        # ==================================================
        pg = get_postgres_core()
        session = await pg.get_game_session(session_id)
        is_neon_session = session is not None
        if not session:
            # Fallback ไปยัง Supabase (Legacy Session)
            await self.db.get_or_create_profile(user_id, f"User_{user_id[-4:]}")
            session = await self.db.get_session_by_id(session_id)
            
        if not session:
            logger.error(f"❌ [CRITICAL] ไม่พบ Save Slot (Session ID: {session_id})")
            async def error_gen():
                yield "data: [ERROR] ไม่พบเซฟเกม กรุณารีเฟรชหน้าต่าง\n\n"
            return error_gen()
        
        # คลายซิปตัวแปร
        active_event_id = session.get("active_event_id")
        active_event_phase = session.get("active_phase_id")
        active_beat_id = session.get("active_beat_id")
        is_sandbox_locked = session.get("is_sandbox_locked", False)
        sandbox_turn_count = session.get("sandbox_turn_count", 0)
        beat_turn_count = session.get("beat_turn_count", 0)
        
        # 🌟 [PURE MATH] นับเทิร์นเฉพาะเมื่อเป็นข้อความจากผู้เล่นจริงๆ
        if not user_message.startswith("[SYSTEM]"):
            if active_event_id:
                beat_turn_count += 1
            else:
                sandbox_turn_count += 1
            
        chaos_level = session.get("chaos_level", "low")
        current_stance = session.get("current_stance", "neutral")
        tension_gauge = session.get("tension_gauge", 0)
        current_inside_jokes = session.get("inside_jokes", [])
        
        # 🌟 [IMMEDIATE PERSISTENCE] เซฟข้อความของผู้เล่นลง DB ทันที (สำหรับ legacy Supabase session)
        current_turn = beat_turn_count if active_event_id else sandbox_turn_count
        if not is_neon_session and not is_regenerate and not user_message.startswith("[SYSTEM]"):
            logger.info(f"💾 [DATABASE] Saving User Message immediately for safety (Turn: {current_turn})")
            asyncio.create_task(self.db.log_chat_bulk([{
                "session_id": session_id,
                "role": "user",
                "message": user_message,
                "action": None,
                "turn_number": current_turn,
                "chunk_sequence": 0
            }]))
        elif not is_neon_session and is_regenerate:
            # 🌟 [PHASE 4] ปราบผีซ้ำซ้อน: ถ้าเป็นการขอตอบใหม่ ต้องไปลบคำตอบเก่าของ AI ทิ้งก่อน
            logger.info(f"🧹 [DATABASE] Regenerate Triggered! Deleting old AI answers for Turn: {current_turn}")
            await self.db.delete_turn_chat_logs(session_id, current_turn)
        

        # ==================================================
        # 🧠 [MEMORY] STEP 1.5: Qdrant Memory Retrieval (RAG)
        # ==================================================
        retrieved_memory = ""
        if not user_message.startswith("[SYSTEM]"):
            retrieved_memory = await self.memory.retrieve_relevant_memories(
                user_id=user_id,
                character_id=character_id,
                current_input=user_message,
                session_id=session_id,
                limit=3,
                threshold=0.5
            )

        # --------------------------------------------------
        # 🌍 STEP 2: WORLD BIBLE LOADING (ย้ายมาโหลดก่อนเพื่อดึงค่าเริ่มต้น)
        # --------------------------------------------------
        current_time = current_world_state.get("time", "ไม่ระบุ")
        current_loc = current_world_state.get("location", "ไม่ระบุ")
        current_weather = current_world_state.get("weather", "ไม่ระบุ")

        # 🌟 [STRICT MODE] ดึง world_id จากหน้าบ้านก่อน ถ้าไม่มีให้ดูใน Session (ไม่มี Fallback มั่วซั่วอีกต่อไป)
        actual_world_id = world_id or session.get("world_id")
        
        if not actual_world_id:
            logger.error("❌ [CRITICAL] ไม่พบ world_id! ระบบไม่สามารถโหลดไฟล์โลกได้")
            # ปล่อยให้ actual_world_id เป็น None เพื่อให้ Fail-Fast และเห็นบั๊กชัดเจน
            
        # 🌟 [SUPABASE EDITION] ดึงข้อมูลโลกจากแคมเปญที่ Publish แล้ว
        world_data_json = {}
        campaign = await self.db.get_published_campaign(actual_world_id)
        if campaign and campaign.get("world_data"):
            world_data_json = campaign.get("world_data")
        else:
            # Fallback Local
            world_file_path = f"data/worlds/{actual_world_id}.json"
            if os.path.exists(world_file_path):
                with open(world_file_path, "r", encoding="utf-8") as f:
                    world_data_json = json.load(f)

        starting_state = world_data_json.get("starting_state", {})

        # ฟิสิกส์ & เสื้อผ้า & ความรู้สึก (ดึงจาก DB ก่อน ถ้าไม่มีให้ใช้จาก World File)
        player_posture = session.get("player_posture") or starting_state.get("initial_p_pos", "ยืน/นั่งอิสระตามบริบท")
        actor_posture = session.get("actor_posture") or starting_state.get("initial_a_pos", "ยืน/นั่งอิสระตามบริบท")
        current_dominance_state = session.get("dominance_state", "NEUTRAL")
        current_action_lock = session.get("action_lock", False)

        # 🌟 [FIX] ดึงชุดเริ่มต้นจากไฟล์ World และจับคู่กับตู้เสื้อผ้าตัวละคร
        outfit_key = starting_state.get("initial_outfit_key", "default")
        
        # 🌟 [UNIVERSAL ADAPTER] รองรับทั้งโครงสร้าง AI (appearance) และโครงสร้าง Frontend (Root level)
        appearance_data = character_data.get("appearance", {})
        
        raw_wardrobe = appearance_data.get("wardrobe") or character_data.get("wardrobe", {})
        wardrobe_dict = {}
        # แปลงโครงสร้าง Array ของหน้าบ้านให้กลายเป็น Dict ที่ Engine เข้าใจ
        if isinstance(raw_wardrobe, list):
            for w in raw_wardrobe:
                cat = w.get("category", "OUTFIT")
                wardrobe_dict[cat] = w.get("items", [])
        elif isinstance(raw_wardrobe, dict):
            wardrobe_dict = raw_wardrobe
            
        default_outfit = wardrobe_dict.get(outfit_key)
        if not default_outfit and wardrobe_dict:
            default_outfit = list(wardrobe_dict.values())[0] # ดึงชุดแรกถ้าหา key ไม่เจอ
        if not default_outfit:
            default_outfit = "ชุดเสื้อผ้าทั่วไป"
            
        if isinstance(default_outfit, list):
            default_outfit = ", ".join(default_outfit)

        saved_outfit = session.get("current_outfit")
        # ตรวจสอบว่า saved_outfit เป็นแค่ Key หรือไม่ ถ้าใช่ให้ดึงคำอธิบายเต็มมา
        if saved_outfit and saved_outfit in wardrobe_dict:
            current_outfit = wardrobe_dict[saved_outfit]
        else:
            current_outfit = saved_outfit or default_outfit
            
        if isinstance(current_outfit, list):
            current_outfit = ", ".join(current_outfit)

        affection_val = session.get("affection", 0)
        desire_val = session.get("desire", 0)

        # ⚡ [REDIS HOT CACHE] ดึง Live Kinematics (a_pos, p_pos) และ Stats จาก Redis RAM ก่อน
        try:
            cached_state = self.redis.get_live_state(session_id)
            if cached_state and isinstance(cached_state, dict):
                c_a_pos = cached_state.get("a_pos")
                c_p_pos = cached_state.get("p_pos")
                if c_a_pos and str(c_a_pos).lower() not in ["none", "null", "", "ยืน/นั่งอิสระตามบริบท"]:
                    actor_posture = c_a_pos
                if c_p_pos and str(c_p_pos).lower() not in ["none", "null", "", "ยืน/นั่งอิสระตามบริบท"]:
                    player_posture = c_p_pos
                if "affection" in cached_state and cached_state["affection"] is not None:
                    affection_val = int(cached_state["affection"])
                if "desire" in cached_state and cached_state["desire"] is not None:
                    desire_val = int(cached_state["desire"])
                logger.info(f"⚡ [REDIS HOT CACHE HIT] Live State Loaded -> A_POS: '{actor_posture}', P_POS: '{player_posture}', Affection: {affection_val}, Desire: {desire_val}")
        except Exception as cache_err:
            logger.warning(f"⚠️ [REDIS HOT CACHE] Could not load live state from cache: {cache_err}")
        shatter_count = session.get("shatter_count", 0)
        peaceful_turns_count = session.get("peaceful_turns_count", 0)
        player_vibe_override = session.get("player_vibe_override")
        pronouns_override = session.get("pronouns_override")
        nicknames_override = session.get("nicknames_override")
        main_quest_override = session.get("main_quest_override")
        current_scene_vibe = session.get("scene_vibe", "ยังไม่มีเหตุการณ์สำคัญ")
        
        # 🌟 [ENGINE 5.5] THE HEART LOCKS: Relationship Stages
        relationship_stages = world_data_json.get("player_persona", {}).get("relationship_stages", [])
        current_stage_level = session.get("current_relationship_stage_level", 1)
        current_stage = next((s for s in relationship_stages if s.get("stage_level") == current_stage_level), {})
        next_stage = next((s for s in relationship_stages if s.get("stage_level") == current_stage_level + 1), None)
        
        # อั้นค่า Affection หากติดเพดาน (Cap)
        affection_cap = current_stage.get("affection_cap", 100)
        if affection_val >= affection_cap:
            affection_val = affection_cap # ติดหลอด
            
        unlock_condition = None
        next_stage_title = None
        if affection_val == affection_cap and next_stage and next_stage.get("unlock_condition"):
            unlock_condition = next_stage["unlock_condition"]
            next_stage_title = next_stage.get("title", f"ระดับ {current_stage_level + 1}")

        # 🌟 Override main_quest in world_data if exists
        if main_quest_override and "player_persona" in world_data_json:
            world_data_json["player_persona"]["main_quest"] = main_quest_override


        # ดึง Contact Points เดิมมา (ป้องกัน Null)
        raw_cp = session.get("contact_points", "[]")
        try:
            contact_points_list = json.loads(raw_cp) if isinstance(raw_cp, str) else raw_cp
        except:
            contact_points_list = []
        if not isinstance(contact_points_list, list): contact_points_list = []

        is_new_phase = False

        # 🌟 [PHASE 3] "The Trust Fall" - รับ History จากหน้าบ้านโดยตรง
        # หั่น Database Read ทิ้ง 1 ครั้ง (จากเดิมที่ต้องไปดึง raw_history = await self.db.get_chat_history...)
        raw_history = history[-12:] if history else []
        
        # 🌟 [CRITICAL FIX] ป้องกัน LiteLLM Crash: โมเดล AI ไม่รู้จัก Role ที่ชื่อ 'director_vo' 
        # ต้องแปลงกลับเป็น 'system' ก่อนโยนเข้า AI (แต่ใน DB ยังคงเป็น director_vo เหมือนเดิม)
        chat_history = []
        for row in raw_history:
            role = row.get("role", "user")
            original_role = role
            if role == "director_vo":
                role = "system"
            
            chat_history.append({
                "role": role, 
                "original_role": original_role, # เก็บไว้ให้ Director แยกแยะได้
                "content": row.get("content", row.get("message", "")), # รองรับ format ของหน้าบ้าน
                "action": row.get("action")
            })

        # 🌟 [BULK PREPARATION] เตรียมกล่องเก็บแชทที่จะยิงทีเดียวหลังจบเทิร์น (เฉพาะ AI และ Director)
        chat_logs_to_insert = []
        loc_data = world_data_json.get("locations", {}).get(current_loc, {})
        spatial_layout = loc_data.get("spatial_layout", "ไม่ระบุโครงสร้าง")
        key_furniture = loc_data.get("key_furniture", "ไม่ระบุเฟอร์นิเจอร์")
        choke_points = loc_data.get("choke_points", "ไม่มีจุดอับ")

        appearance = character_data.get("appearance", {})
        
        # 🌟 [UNIVERSAL ADAPTER] ดึงข้อมูลสรีระและท่าทาง (ควานหาจากทุกกล่องที่เป็นไปได้)
        anatomy_list = appearance.get("anatomy_features") or character_data.get("anatomy", [])
        anatomy = "\n".join([f"- {a}" for a in anatomy_list]) if anatomy_list else "ไม่ระบุ"
        
        postures_list = appearance.get("signature_postures") or character_data.get("postures", [])
        signature_postures = "\n".join([f"- {p}" for p in postures_list]) if postures_list else "ไม่ระบุ"

        logger.info("="*80)
        logger.opt(colors=True).info(f"👤 <cyan>[USER: {user_id[-8:]}]</cyan> | 💬 <white>\"{user_message}\"</white>")
        logger.info("-" * 80)

        # ==================================================
        # 🚨 [CRITICAL FIX] ระบบดักจับคำสั่งเริ่มเควสต์/เปิดฉากจากหน้าบ้าน
        # ==================================================
        if user_message.startswith("[SYSTEM]"):
            openings = world_data_json.get("opening_scenarios", [])
            matched_op = None
            if user_message.startswith("[SYSTEM] เริ่มต้นเกมด้วยฉาก:"):
                scenario_name = user_message.replace("[SYSTEM] เริ่มต้นเกมด้วยฉาก:", "").strip()
                for op in openings:
                    if op.get("name") == scenario_name or op.get("id") == scenario_name:
                        matched_op = op
                        break
            if not matched_op and openings:
                matched_op = openings[0]

            if matched_op:
                active_event_id = matched_op.get("id")
                active_event_phase = matched_op["scenes"][0].get("scene_id") if matched_op.get("scenes") else None
                is_new_phase = True
                active_beat_id = None
                beat_turn_count = 0  # 🌟 นับเป็น 0 เสมอเมื่อระบบเริ่มฉาก รอผู้เล่นพิมพ์ค่อยนับ
                sandbox_turn_count = 0
                chaos_level = matched_op.get("initial_chaos_level", "low")
                logger.info(f"🎬 [OPENING SCENARIO LOADED] Active Event: '{matched_op.get('name', active_event_id)}' (Phase: {active_event_phase})")

        # 🌟 [AUTO-START OPENING SCENARIO] ถ้าเพิ่งเริ่มแชทใหม่ และยังไม่มี Event ให้ดึงฉากเปิดตัวมาใช้เลยอัตโนมัติ
        elif not active_event_id and not is_sandbox_locked and sandbox_turn_count <= 1:
            openings = world_data_json.get("opening_scenarios", [])
            if openings:
                op = openings[0]  # ดึงฉากเปิดตัวแรกสุดมาบังคับใช้
                active_event_id = op.get("id")
                active_event_phase = op["scenes"][0].get("scene_id") if op.get("scenes") else None
                is_new_phase = True
                active_beat_id = None
                beat_turn_count = 1
                sandbox_turn_count = 0
                chaos_level = op.get("initial_chaos_level", "low")

        # 🍞 SMART BREADCRUMB INJECTOR (สุ่มเควสต์) - REMOVED BY CAPTAIN'S ORDER
        # ระบบเก่าถูกถอดถอนเพื่อป้องกันผู้เล่นโดนลักพาตัวสุ่มเข้า Event ใหม่ตอนอยู่โหมด Sandbox
        
        async def response_generator():
            nonlocal active_event_id, active_event_phase, active_beat_id, is_sandbox_locked, is_new_phase, current_stance, tension_gauge, player_posture, actor_posture, sandbox_turn_count, beat_turn_count, current_dominance_state, current_action_lock, current_outfit, chaos_level, affection_val, desire_val, contact_points_list, shatter_count, peaceful_turns_count, current_scene_vibe, current_stage_level, pronouns_override, nicknames_override
            if active_event_id and active_event_phase and not active_beat_id:
                try:
                    _event_data = world_data_json.get("story_events", {}).get(active_event_id, {})
                    if not _event_data:
                        for op in world_data_json.get("opening_scenarios", []):
                            if op.get("id") == active_event_id:
                                _event_data = op
                                break
                    active_phase_data = next((s for s in _event_data.get("scenes", []) if s.get("scene_id") == active_event_phase), {})
                    
                    # 🌪️ [NEW] The Jobs-Ive Sounding Board: กระชากอารมณ์ด้วย forced_chaos_level 
                    forced_chaos = active_phase_data.get("forced_chaos_level")
                    if forced_chaos:
                        chaos_level = forced_chaos # Overwrite ทับค่าเดิมทันที
                    
                    b_list = active_phase_data.get("beats", [])
                    if b_list: active_beat_id = b_list[0].get("beat_id")
                except: pass

            # 🌟 [ENGINE 5.5] ดึง System Choices และ Director Cue จาก Beat ปัจจุบัน
            current_system_choices_dict = {}
            pending_director_cue_str = ""
            if active_event_id and active_event_phase and active_beat_id:
                try:
                    _event_data = world_data_json.get("story_events", {}).get(active_event_id, {})
                    if not _event_data:
                        for op in world_data_json.get("opening_scenarios", []):
                            if op.get("id") == active_event_id:
                                _event_data = op
                                break
                    _scene = next((s for s in _event_data.get("scenes", []) if s.get("scene_id") == active_event_phase), {})
                    _beats = _scene.get("beats", [])
                    _curr_beat = next((b for b in _beats if b.get("beat_id") == active_beat_id), {})
                    
                    # 🌟 [FIX] ส่ง System Choices และ Director Cue เฉพาะเทิร์นแรกของบีตเท่านั้น (ป้องกันการส่งซ้ำซาก)
                    if beat_turn_count <= 1:
                        current_system_choices_dict = _curr_beat.get("system_choices", {})
                            
                        # 🌟 [NEW] ดึง Director Cue (แต่ถ้าเพิ่งเปลี่ยน Phase ให้ความสำคัญกับ DIRECTOR SETUP ก่อนเสมอ)
                        raw_director_cue = _curr_beat.get("director_cue")
                        if raw_director_cue and str(raw_director_cue).strip() and not is_new_phase:
                            pending_director_cue_str = (
                                f"\n🎬 [DIRECTOR CUE: คิวแทรกแซงกะทันหัน] 🎬\n"
                                f"- เหตุการณ์: '{raw_director_cue}'\n"
                                f"- หน้าที่ของคุณ: บังคับเข้า GEAR 4 (The Sudden Strike) และนำเหตุการณ์นี้ไปเขียนเป็น Voice Over นำร่องทันที เพื่อปูทางให้นักแสดง ห้ามเยิ่นเย้อ!"
                            )
                except: pass

            eval_hist = chat_history + [{"role": "user", "content": user_message, "action": None}]
            
            def format_eval_msg(msg):
                parts = []
                if msg.get('action'): parts.append(f"({msg['action']})")
                if msg.get('content'): parts.append(str(msg['content']))
                return f"{msg['role'].upper()}: {' '.join(parts).strip()}"
                
            eval_chat_text = "\n".join([format_eval_msg(msg) for msg in eval_hist[-4:] if msg.get('action') or msg.get('content')])
            
            max_desire_temp = character_data.get("max_desire", 1000)
            current_desire_percentage = int((desire_val / max_desire_temp) * 100) if max_desire_temp > 0 else 0
            
            evaluator_prompt = self.context_builder.build_evaluator_prompt(
                character_data=character_data, recent_chat_history=eval_chat_text,
                world_data=world_data_json, active_event_id=active_event_id, 
                active_event_phase=active_event_phase, active_beat_id=active_beat_id,
                shatter_count=shatter_count,
                current_affection=affection_val,
                current_desire=current_desire_percentage,
                current_scene_vibe=current_scene_vibe,
                unlock_condition=unlock_condition,
                next_stage_title=next_stage_title,
                inside_jokes=current_inside_jokes
            )
            
            yield f"data: {json.dumps({'type': 'debug_prompt', 'agent': 'evaluator', 'prompt': evaluator_prompt}, ensure_ascii=False)}\n\n"

            # 📡 2. สัญญาณสอง: เริ่มทำงานสอดแนมความเร็วสูง (Evaluator)
            if user_message.strip().startswith("[SYSTEM]"):
                logger.info("🕒 🕵️‍♂️ [EVALUATOR] Bypassed for [SYSTEM] message.")
                from api.schemas import EvaluatorOutput
                eval_result = EvaluatorOutput(
                    affection_delta=0,
                    desire_delta=0,
                    reasoning="Bypassed for SYSTEM initialization.",
                    memory_extracted=None,
                    beat_action="chaos_escalation",
                    player_stance="neutral",
                    player_posture="คงท่าเดิม",
                    bullshit_detected=False,
                    wardrobe_update=None,
                    inhibition_shield="active"
                )
                yield f"data: {json.dumps({'type': 'debug_response', 'agent': 'evaluator', 'response': eval_result.model_dump()}, ensure_ascii=False)}\n\n"
                
                # 🌟 [UX BUFFER] ยิง System Briefing ปลอมตัวเป็น VO ไปแสดงผลทันทีเพื่อซื้อเวลาให้ผู้เล่นอ่าน
                if beat_turn_count <= 1:
                    prologue = world_data_json.get("prologue", {})
                    prologue_premise = prologue.get("premise")
                    
                    if prologue_premise and prologue_premise.strip():
                        briefing_text = prologue_premise.strip()
                    else:
                        player_persona = world_data_json.get("player_persona", {})
                        role_text = player_persona.get("identity", {}).get("title", "ผู้เล่น")
                        main_quest = player_persona.get("main_quest", "เอาชีวิตรอดและสำรวจเนื้อเรื่อง")
                        briefing_text = f"คุณคือ {role_text} ภารกิจหลัก: {main_quest}"
                    yield f"data: {json.dumps({'type': 'intro_brief', 'content': briefing_text}, ensure_ascii=False)}\n\n"
                    
                    # 🌟 [PHASE 5/8] เซฟลง DB ให้ถูก Role (ใช้ system เพื่อผ่านด่าน Check Constraint) และต้องมี chunk_sequence=1
                    chat_logs_to_insert.append({
                        "session_id": session_id,
                        "role": "system",
                        "message": briefing_text,
                        "action": None,
                        "turn_number": beat_turn_count,
                        "chunk_sequence": 1
                    })
                    
            else:
                eval_result = await self.evaluator.evaluate_interaction(evaluator_prompt=evaluator_prompt)
                
                if getattr(eval_result, "memory_extracted", None):
                    await self.db.save_extracted_memory(user_id, character_id, eval_result.memory_extracted, session_id=session_id)
                    # 🌟 [QDRANT] ซิงค์ความจำลง Vector Database
                    await self.memory.save_memory(user_id, character_id, eval_result.memory_extracted, session_id=session_id)
    
                yield f"data: {json.dumps({'type': 'debug_response', 'agent': 'evaluator', 'response': eval_result.model_dump()}, ensure_ascii=False)}\n\n"

            # ==================================================
            # 🧠 3. อัปเดตสเตตัสทันทีหลัง Evaluator เสร็จ (State Update)
            # ==================================================
            new_player_posture = getattr(eval_result, "player_posture", "คงท่าเดิม")
            if new_player_posture and new_player_posture != "คงท่าเดิม": player_posture = new_player_posture
            new_scene_vibe = getattr(eval_result, "scene_vibe", None)
            if new_scene_vibe: current_scene_vibe = new_scene_vibe
            wardrobe_update = getattr(eval_result, "wardrobe_update", None)
            if wardrobe_update: current_outfit = wardrobe_update

            inhibition_shield_status = getattr(eval_result, 'inhibition_shield', 'active').lower()
            if inhibition_shield_status == "shattered":
                shatter_count += 1

            affection_val = min(100, max(0, affection_val + getattr(eval_result, 'affection_delta', 0)))
            
            # 🌟 [ENGINE 5.5] THE HEART LOCKS: ตรวจสอบการปลดล็อก
            stage_unlocked = getattr(eval_result, "stage_unlocked", False)
            if stage_unlocked and next_stage:
                current_stage_level += 1
                if next_stage.get("unlocked_pronouns"):
                    pronouns_override = next_stage["unlocked_pronouns"]
                if next_stage.get("unlocked_nicknames"):
                    nicknames_override = next_stage["unlocked_nicknames"]
                # สามารถดันคะแนนทะลุกำแพงเดิมไปได้เลยในเทิร์นที่ปลดล็อก
                affection_val = min(100, affection_val + 5) 

            # 🌟 [ENGINE 5.5] DYNAMIC NOMENCLATURE: ตรวจสอบการเปลี่ยนชื่อ
            pronouns_update = getattr(eval_result, "pronouns_update", None)
            if pronouns_update:
                pronouns_override = pronouns_update
                
            nicknames_update = getattr(eval_result, "nicknames_update", None)
            if nicknames_update:
                nicknames_override = nicknames_update
            elif affection_val >= affection_cap:
                affection_val = affection_cap # ถ้ายังไม่ปลดล็อก ก็อั้นไว้ที่เดิม

            # 🌟 [ENGINE 5.5] CHEMISTRY DICTIONARY: เก็บมุกวงในใหม่
            new_inside_joke = getattr(eval_result, "new_inside_joke", None)
            if new_inside_joke:
                current_inside_jokes.append(new_inside_joke)
            
            # 🌟 [FIX] THE DESIRE PHYSICS (สมการความปรารถนาคุมด้วย Python)
            max_desire = character_data.get("max_desire", 1000)
            raw_desire_delta = getattr(eval_result, 'desire_delta', 0)
            
            sensibility = character_data.get("core_stats", {}).get("sensibility", 5)
            original_desire_delta = raw_desire_delta
            
            if raw_desire_delta > 0:
                # 🌟 [ENGINE 5.5] Smooth Linear Scaling for Sensibility
                sensibility_multiplier = sensibility / 5.0
                raw_desire_delta = int(raw_desire_delta * sensibility_multiplier)
                    
            is_arousal_shock = (sensibility >= 8 and original_desire_delta > 0)
            old_desire_val = desire_val
            
            if raw_desire_delta > 0:
                resistance_threshold = max_desire * 0.8
                if desire_val >= resistance_threshold:
                    raw_desire_delta = int(raw_desire_delta / 2)
                desire_val = min(max_desire, desire_val + raw_desire_delta)
            else:
                # 🌟 [ENGINE 5.5] Exponential Decay (30% crash) for biological realism
                desire_val = max(0, desire_val - int(desire_val * 0.30))

            is_frustrated = False
            if raw_desire_delta <= 0 and old_desire_val >= (max_desire * 0.4):
                is_frustrated = True

            desire_percentage = int((desire_val / max_desire) * 100) if max_desire > 0 else 0

            new_stance = eval_result.player_stance.lower()
            if new_stance != "neutral":
                current_stance = new_stance
            else:
                current_stance = "neutral"

            # 🌟 [ENGINE 5.5] THE DESIRE-LOCKED TENSION CLAMP
            if desire_percentage <= 30:
                tension_gauge = 0
            elif desire_percentage <= 60:
                tension_gauge = 1
            elif desire_percentage <= 89:
                tension_gauge = 2
            else:
                tension_gauge = 3

            # 🌟 [ENGINE 5.5] THE SHIELD COOLDOWN MECHANICS
            if tension_gauge == 0:
                peaceful_turns_count += 1
            else:
                peaceful_turns_count = 0

            if peaceful_turns_count >= 3:
                shatter_count = max(0, shatter_count - 3)
                peaceful_turns_count = 0

            event_cancelled = False
            pacing_control_triggered = False
            current_override_resolution = None
            is_improvising = False
            beat_director_setup = None
            transition_bridge = None
            
            if eval_result and active_event_id:
                beat_action = getattr(eval_result, "beat_action", "chaos_escalation").lower()
                if beat_action in ["interrupt", "golden_interrupt"]:
                    is_improvising = True
                
                if beat_action == "golden_interrupt":
                    eval_result.affection_delta = getattr(eval_result, "affection_delta", 0) + 2
                    eval_result.desire_delta = getattr(eval_result, "desire_delta", 0) + 5
                matched_path = getattr(eval_result, "matched_path", None)
                
                try:
                    _event_data = world_data_json.get("story_events", {}).get(active_event_id, {})
                    if not _event_data:
                        for op in world_data_json.get("opening_scenarios", []):
                            if op.get("id") == active_event_id:
                                _event_data = op
                                break
                    current_phase_data = next((s for s in _event_data.get("scenes", []) if s.get("scene_id") == active_event_phase), {})
                    beats = current_phase_data.get("beats", [])
                    current_beat = next((b for b in beats if b.get("beat_id") == active_beat_id), {})
                    
                    beat_director_setup = current_beat.get("director_setup")
                    
                    # 🌟 [STRICT MODE] รองรับเฉพาะ pacing_control ตามมาตรฐานใหม่
                    pacing_control_data = current_beat.get("pacing_control", {})
                    if pacing_control_data:
                        max_turns = pacing_control_data.get("max_turns", 999)
                        # 🛑 [THE INFINITE IMPROV] ถ้ามี interrupt จะไม่ถูก Pacing Control บังคับตัดจบ
                        if beat_turn_count >= max_turns and beat_action != "interrupt":
                            beat_action = pacing_control_data.get("action", "illusion_trigger").lower()
                            matched_path = pacing_control_data.get("matched_path")
                            current_override_resolution = pacing_control_data.get("inevitable_consequence")
                            pacing_control_triggered = True
                except Exception as e:
                    pass
                
                if beat_action == "cancel":
                    yield f"data: {json.dumps({'system_event': 'quest_cancelled'}, ensure_ascii=False)}\n\n"
                    active_event_id, active_event_phase, active_beat_id = None, None, None
                    is_sandbox_locked = True
                    beat_turn_count = 0
                    event_cancelled = True
                elif beat_action in ["illusion_trigger", "progress", "golden_interrupt"]:
                    try:
                        resolved_scene, resolved_beat, transition_bridge = SceneTransitionManager.resolve_next_beat(
                            event_data=_event_data,
                            current_scene_id=active_event_phase,
                            current_beat_id=active_beat_id,
                            matched_path=matched_path
                        )
                        
                        if resolved_scene == "completed":
                            yield f"data: {json.dumps({'system_event': 'event_triggered', 'event_id': active_event_id, 'new_phase': 'completed', 'new_beat': None}, ensure_ascii=False)}\n\n"
                            active_event_id, active_event_phase, active_beat_id = None, None, None
                            is_sandbox_locked = True
                            beat_turn_count = 0
                            event_cancelled = True 
                        else:
                            is_new_phase = (active_event_phase != resolved_scene)
                            active_event_phase = resolved_scene
                            active_beat_id = resolved_beat
                            beat_turn_count = 0
                            if transition_bridge:
                                logger.info(f"🌉 \033[93m[DIRECTOR BRIDGE]\033[0m: ทำงานสำหรับ Scene {active_event_phase}")
                    except Exception as e:
                        error_msg = str(e)
                        logger.error(f"❌ [TRANSITION FAILED] {error_msg}")
                        beat_action = "chaos_escalation"

            if not event_cancelled and active_event_id:
                yield f"data: {json.dumps({'system_event': 'event_triggered', 'event_id': active_event_id, 'new_phase': active_event_phase, 'new_beat': active_beat_id}, ensure_ascii=False)}\n\n"

            yield f"data: {json.dumps({'system_event': 'stats_update', 'affection_delta': getattr(eval_result, 'affection_delta', 0), 'desire_delta': getattr(eval_result, 'desire_delta', 0)}, ensure_ascii=False)}\n\n"

            # ==================================================
            # 🎬 4. เตรียม Prompt สำหรับ Director & Actor เพื่อวิ่ง Parallel
            # ==================================================
            import copy
            director_world_data = copy.deepcopy(world_data_json)
            if not is_new_phase and active_event_id and active_event_phase:
                masking_text = "[LOOP MODE]: ห้ามบรรยายสภาพแวดล้อมซ้ำเด็ดขาด ให้โฟกัสเฉพาะปฏิกิริยาของตัวละคร"
                for op in director_world_data.get("opening_scenarios", []):
                    if op.get("id") == active_event_id:
                        if op.get("scenes"):
                            for s in op["scenes"]:
                                if s.get("scene_id") == active_event_phase:
                                    s["director_setup"] = masking_text
                        elif active_event_phase in op.get("phases", {}):
                            op["phases"][active_event_phase]["director_setup"] = masking_text

            director_prompt = self.context_builder.build_director_prompt(
                user_message=user_message, current_time=current_time, current_location=current_loc,
                current_weather=current_weather, world_data=director_world_data, chaos_level=chaos_level,
                active_event_id=active_event_id, active_event_phase=active_event_phase,
                chat_history=chat_history, is_new_phase=is_new_phase,
                spatial_layout=spatial_layout, key_furniture=key_furniture, choke_points=choke_points,
                pending_director_cue=pending_director_cue_str,
                is_cinematic_moment=getattr(eval_result, "is_cinematic_moment", False),
                beat_director_setup=beat_director_setup,
                beat_turn_count=beat_turn_count,
                transition_bridge=transition_bridge
            )

            # Director context ปลอมสำหรับ Actor เพราะมันวิ่งคู่ขนานกัน Actor จะไม่รู้ว่า Director แต่งประโยคว่าอะไร
            director_context = {
                "time_shift": None, 
                "location_shift": None, 
                "current_weather": current_weather, 
                "mood_modifier": "neutral",
                "voice_over": "ไม่มีการบรรยายพิเศษในเทิร์นนี้ (คู่ขนาน)"
            }
            
            mask_integrity = character_data.get("core_stats", {}).get("mask_integrity", 5)
            is_mask_dropped = False
            
            if mask_integrity <= 3:
                if desire_percentage >= 40 or tension_gauge >= 2:
                    is_mask_dropped = True
            elif mask_integrity >= 8:
                if desire_percentage >= 95 and tension_gauge >= 3:
                    is_mask_dropped = True
            else:
                if desire_percentage >= 70 or tension_gauge >= 3:
                    is_mask_dropped = True

            actor_prompt = self.context_builder.build_actor_prompt(
                character_data=character_data, director_context=director_context, retrieved_memory=retrieved_memory,
                world_data=world_data_json, current_location=current_loc, chaos_level=chaos_level,
                active_event_id=active_event_id, active_event_phase=active_event_phase, active_beat_id=active_beat_id,
                player_stance=current_stance, tension_gauge=tension_gauge, current_player_posture=player_posture,
                current_actor_posture=actor_posture, current_dominance_state=current_dominance_state,
                current_action_lock=current_action_lock, anatomy=anatomy, current_outfit=current_outfit, signature_postures=signature_postures,
                desire_level=desire_percentage, is_frustrated=is_frustrated, is_improvising=is_improvising,
                inhibition_shield=inhibition_shield_status, shatter_count=shatter_count,
                bullshit_detected=getattr(eval_result, "bullshit_detected", False),
                sensibility=sensibility, raw_desire_delta=original_desire_delta, is_arousal_shock=is_arousal_shock,
                mask_integrity=mask_integrity, is_mask_dropped=is_mask_dropped, player_vibe_override=player_vibe_override,
                pronouns_override=pronouns_override, nicknames_override=nicknames_override, scene_vibe=current_scene_vibe,
                allow_nickname=getattr(eval_result, "allow_nickname", False),
                nomenclature_rejection=getattr(eval_result, "nomenclature_rejection", None),
                triggered_inside_joke=getattr(eval_result, "triggered_inside_joke", None)
            )

            if pacing_control_triggered:
                resolution_text = f"ลงมือทำสิ่งต่อไปนี้ด้วยตัวเองทันที: '{current_override_resolution}'" if current_override_resolution else "'ตัดจบบทสนทนาเดิม/แก้ปัญหาตรงหน้าด้วยตัวเอง'"
                secret_directive = f"\n\n[🔥 SYSTEM OVERRIDE (LOSS OF CONTROL)]: ผู้เล่นใช้เวลาลีลานานเกินไปจนหมดเวลา! บังคับให้คุณหมดความอดทนและ {resolution_text} ห้ามขอให้ผู้เล่นช่วยอีกต่อไป แสดงให้เห็นว่าโลกนี้เดินหน้าได้โดยไม่ต้องง้อผู้เล่น จากนั้นให้ดำเนินเรื่องเข้าสู่เป้าหมายใหม่ทันที!"
                actor_prompt += secret_directive

            yield f"data: {json.dumps({'type': 'debug_prompt', 'agent': 'director', 'prompt': director_prompt}, ensure_ascii=False)}\n\n"
            yield f"data: {json.dumps({'type': 'debug_prompt', 'agent': 'actor', 'prompt': actor_prompt}, ensure_ascii=False)}\n\n"

            # ==================================================
            # 🚀 5. รันคู่ขนาน: DIRECTOR vs ACTOR
            # ==================================================
            logger.info("🕒 🔀 [PIPELINE] Building Prompts & Spawning Concurrent Tasks...")

            async def timed_director():
                res = await self.director.analyze_scene(director_prompt=director_prompt)
                return ("director", res)
            
            async def timed_actor():
                actor_history = chat_history if user_message.startswith("[SYSTEM]") else chat_history + [{"role": "user", "content": user_message}]
                res = await self.actor.generate_response(actor_prompt=actor_prompt, chat_history=actor_history)
                return ("actor", res)
                
            director_out = None
            actor_out = None
            pending_actor_yields = []
            
            for completed_task in asyncio.as_completed([timed_director(), timed_actor()]):
                agent_type, res = await completed_task
                if agent_type == "director":
                    director_out = res
                    if getattr(director_out, "voice_over", None):
                        director_out.voice_over = " ".join(re.sub(r'\[.*?\]|\(.*?\)', '', director_out.voice_over).split())
                        yield f"data: {json.dumps({'type': 'voice_over', 'content': director_out.voice_over}, ensure_ascii=False)}\n\n"
                    yield f"data: {json.dumps({'type': 'debug_response', 'agent': 'director', 'response': director_out.model_dump()}, ensure_ascii=False)}\n\n"
                    
                    # 🌟 [SYNC]: พอ Director คายข้อมูลเสร็จ ถ้า Actor รออยู่แล้ว ให้คาย Actor ตามทันที!
                    for pending_yield in pending_actor_yields:
                        yield pending_yield
                    pending_actor_yields.clear()
                    
                else:
                    actor_out = res
                    
                    # 🌟 [SYNC]: เตรียมข้อมูล Actor ไว้ก่อน
                    actor_yields = [
                        f"data: {json.dumps({'type': 'chat_message_array', 'sequence': [s.model_dump() for s in actor_out.response_sequence], 'system_choices': current_system_choices_dict}, ensure_ascii=False)}\n\n",
                        f"data: {json.dumps({'type': 'debug_response', 'agent': 'actor', 'response': actor_out.model_dump()}, ensure_ascii=False)}\n\n"
                    ]
                    
                    if director_out is None:
                        # ถ้านักแสดงเสร็จก่อนผู้กำกับ ให้รอผู้กำกับก่อน (กันบั๊ก UI สลับที่)
                        pending_actor_yields.extend(actor_yields)
                    else:
                        # ถ้าผู้กำกับสั่งการเสร็จแล้ว ปล่อยนักแสดงออกไปได้เลย!
                        for y in actor_yields:
                            yield y
                    
                    new_a_pos = getattr(actor_out, "a_pos", None)
                    new_p_pos = getattr(actor_out, "p_pos", None)
                    current_dominance_state = getattr(actor_out, "dominance_state", "NEUTRAL")
                    current_action_lock = getattr(actor_out, "action_lock", False)
                    contact_points_list = getattr(actor_out, "contact_points", [])

                    if new_a_pos and str(new_a_pos).lower() not in ["none", "null", "", "ยืน/นั่งอิสระตามบริบท"]: 
                        actor_posture = new_a_pos
                    
                    if new_p_pos and str(new_p_pos).lower() not in ["none", "null", "", "ยืน/นั่งอิสระตามบริบท"]:
                        if "[FORCED]" in str(new_p_pos).upper():
                            player_posture = new_p_pos

            yield f"data: {json.dumps({'system_event': 'physics_update', 'stance': current_stance, 'tension': tension_gauge, 'player_posture': player_posture, 'actor_posture': actor_posture, 'dominance_state': current_dominance_state, 'action_lock': current_action_lock, 'contact_points': contact_points_list, 'current_outfit': current_outfit}, ensure_ascii=False)}\n\n"
            yield f"data: {json.dumps({'system_event': 'turn_sync', 'beat_turn_count': beat_turn_count}, ensure_ascii=False)}\n\n"


            # ==================================================
            # 💾 [SUPABASE] STEP 6: เซฟสเตตัสรอบสุดท้าย
            # ==================================================
            update_payload = {
                "active_event_id": active_event_id,
                "active_phase_id": active_event_phase,
                "active_beat_id": active_beat_id,
                "is_sandbox_locked": is_sandbox_locked,
                "sandbox_turn_count": sandbox_turn_count,
                "beat_turn_count": beat_turn_count,
                "chaos_level": chaos_level,
                "current_stance": current_stance,
                "tension_gauge": tension_gauge,
                "current_outfit": current_outfit,
                "actor_posture": actor_posture,
                "player_posture": player_posture,
                "dominance_state": current_dominance_state,
                "action_lock": current_action_lock,
                "contact_points": json.dumps(contact_points_list, ensure_ascii=False), 
                "affection": affection_val,
                "desire": desire_val, # 💾 Save the raw max value to DB so it persists correctly
                "shatter_count": shatter_count,
                "peaceful_turns_count": peaceful_turns_count,
                "scene_vibe": current_scene_vibe,
                "current_relationship_stage_level": current_stage_level,
                "pronouns_override": pronouns_override,
                "nicknames_override": nicknames_override,
                "inside_jokes": current_inside_jokes,
                "world_id": actual_world_id # 🌟 บันทึก world_id ที่ถูกต้องลง Session
            }
                

            if not is_neon_session:
                await self.db.update_session_state(session_id, update_payload)
            
            # ==================================================
            # 📦 [UNIFIED ROUND SPEC] ประกอบร่างเป็น 1 กล่องสมบูรณ์ (ตาม UNIFIED_ROUND_SPEC.md)
            # ==================================================
            player_payload = None
            if not user_message.startswith("[SYSTEM]"):
                player_payload = {
                    "text": user_message.strip(),
                    "action": None,
                    "selected_choice_id": None
                }

            choices_list = []
            if current_system_choices_dict:
                if isinstance(current_system_choices_dict, dict):
                    for cid, cval in current_system_choices_dict.items():
                        choices_list.append({
                            "choice_id": cid,
                            "text": cval if isinstance(cval, str) else cval.get("text", str(cval)),
                            "matched_path": cval.get("path") if isinstance(cval, dict) else cid
                        })
                elif isinstance(current_system_choices_dict, list):
                    choices_list = current_system_choices_dict

            unified_round = assemble_interaction_round(
                round_number=beat_turn_count,
                session_id=session_id,
                player_input=player_payload,
                director_out=director_out,
                actor_out=actor_out,
                current_state=update_payload,
                system_choices=choices_list
            )

            # 🌟 [SSE STREAM] ส่งมอบกล่องสมบูรณ์ให้ Frontend ทันที
            yield f"data: {json.dumps({'type': 'unified_round', 'data': unified_round}, ensure_ascii=False)}\n\n"
            logger.info(f"🕒 📦 [UNIFIED ROUND] Assembled Round {beat_turn_count} with {len(unified_round['response'])} segments successfully!")

            # ⚡ [REDIS HOT CACHE] ซิงก์ 20 เทิร์นล่าสุด และ Live Kinematics (a_pos / p_pos) ลง Redis
            try:
                live_state_snapshot = {
                    "a_pos": actor_posture,
                    "p_pos": player_posture,
                    "affection": affection_val,
                    "desire": desire_val,
                    "scene_id": active_event_phase,
                    "beat_id": active_beat_id,
                    "current_outfit": current_outfit,
                    "dominance_state": current_dominance_state,
                    "action_lock": current_action_lock,
                    "tension_gauge": tension_gauge,
                    "stance": current_stance
                }
                self.redis.save_live_state(session_id, live_state_snapshot)
                self.redis.push_round(session_id, unified_round, max_window=20)
                logger.info(f"⚡ [REDIS HOT CACHE] Synchronized Round {beat_turn_count} & Kinematics (A_POS: '{actor_posture}', P_POS: '{player_posture}') to Redis!")

                # 💾 [NEON POSTGRESQL] แอบเซฟสำเนาถาวร (JSONB) เบื้องหลังแบบ Asynchronous
                asyncio.create_task(
                    get_postgres_core().save_round(
                        session_id=session_id,
                        round_number=beat_turn_count,
                        round_data=unified_round
                    )
                )
            except Exception as r_sync_err:
                logger.warning(f"⚠️ [HOT CACHE / POSTGRES] Failed to sync cache/db: {r_sync_err}")

            total_elapsed = time.time() - turn_start_time
            logger.info(f"🕒 ✅ [PIPELINE] Turn Complete | Total Latency: {total_elapsed:.2f}s")

            yield "data: [DONE]\n\n"

        return response_generator()
