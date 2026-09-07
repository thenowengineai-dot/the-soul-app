import os
import json
import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel # 🌟 เพิ่มสำหรับ ResetRequest

# นำเข้า Schema และ Pipeline
from api.schemas import ChatRequest
from engine.pipeline import GamePipeline

# 🌟 นำเข้า Database Core สำหรับปุ่ม Reset
from engine.db_core import DatabaseCore

logger = logging.getLogger("API_ROUTES")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - \033[96m[ROUTER]\033[0m - %(message)s")

# สร้าง Router แทน app
router = APIRouter()

# 🌟 แก้ปัญหา Qdrant โดนแย่งกันใช้งานตอนรันเซิร์ฟเวอร์ (Lazy Initialization)
game_pipeline = None

def get_pipeline():
    global game_pipeline
    if game_pipeline is None:
        logger.info("Starting up Game Engine Pipeline...")
        game_pipeline = GamePipeline()
    return game_pipeline

def load_json_data(file_path: str, error_msg: str) -> Dict[str, Any]:
    """Helper function สำหรับโหลดไฟล์ JSON"""
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading {file_path}: {e}")
            raise HTTPException(status_code=500, detail=f"{error_msg} file is corrupted.")
            
    logger.error(f"File '{file_path}' not found!")
    raise HTTPException(status_code=404, detail=error_msg)

# ==========================================
# 🌟 NEW: Endpoints สำหรับให้ Frontend ดึงข้อมูลไปแสดงผล
# ==========================================

import time

# 🚀 [IN-MEMORY CACHE] ลดภาระ Supabase จาก 1 ล้าน request เหลือ 1 request / 5 นาที
HUB_CATALOG_CACHE = {
    "data": None,
    "last_updated": 0
}
CACHE_TTL_SECONDS = 300 # 5 นาที

@router.post("/clear_cache")
async def clear_cache(request: Request):
    """ล้างแคชหน้า Hub และลบ Redis ทันทีเพื่อรองรับ Real-time Publish"""
    data = await request.json()
    world_id = data.get("world_id")
    
    # 1. ล้างแคชหน้า Hub (5 นาที) ให้เป็นศูนย์
    global HUB_CATALOG_CACHE
    HUB_CATALOG_CACHE["last_updated"] = 0
    logger.info("🧹 [CACHE CLEAR] รีเซ็ตแคชหน้า Hub เรียบร้อยแล้ว (Real-time update)")
    
    # 2. ยิงลบข้อมูลโลกใน Redis (ถ้ามีการระบุ world_id)
    if world_id:
        try:
            db = DatabaseCore()
            await db._redis_request("DEL", f"campaign_v3:{world_id}")
            logger.info(f"🧹 [CACHE CLEAR] ลบ Redis Cache (v3) ของโลก {world_id} เรียบร้อยแล้ว")
        except Exception as e:
            logger.error(f"❌ [CACHE CLEAR] เกิดข้อผิดพลาดในการลบ Redis Cache: {e}")
            
    return {"status": "success", "message": "Cache cleared in real-time"}

@router.get("/published_campaigns")
async def get_published_campaigns():
    """ดึงรายชื่อแคมเปญที่ Publish แล้วทั้งหมด เพื่อไปแสดงในหน้า Hub"""
    global HUB_CATALOG_CACHE
    
    # 🌟 เช็ก Cache ก่อน ถ้ายังไม่หมดอายุ (5 นาที) ให้เสิร์ฟจาก RAM ทันที (0.001 วิ)
    if HUB_CATALOG_CACHE["data"] and (time.time() - HUB_CATALOG_CACHE["last_updated"] < CACHE_TTL_SECONDS):
        logger.info("🚀 [CACHE HIT] Serving Hub Catalog from In-Memory Cache")
        return {"status": "success", "data": HUB_CATALOG_CACHE["data"], "cached": True}

    logger.info("🔄 [CACHE MISS] Fetching Hub Catalog from Supabase...")
    db = DatabaseCore()
    published_chars = []
    try:
        # 🌟 [CRITICAL FIX] Join กับ genesis_characters ด้วย
        response = await db._request("GET", "genesis_campaigns", params={"select": "id, name, character_data, genesis_characters(*)", "status": "eq.published"})
        if response:
            for row in response:
                char_data = row.get("character_data", {})
                
                # พยายามดึงข้อมูลจาก genesis_characters
                genesis_char = row.get("genesis_characters")
                if genesis_char and isinstance(genesis_char, dict):
                    char_data = genesis_char.get("character_data", char_data)
                    avatar_url = genesis_char.get("avatar_url") or char_data.get("avatar_url")
                else:
                    avatar_url = char_data.get("avatar_url")
                
                # รวมรูปภาพทั้งหมด (รูปหลัก + รูปอ้างอิง)
                photos = [avatar_url or "https://img2.pic.in.th/dontlove3.png"]
                if char_data.get("reference_urls"):
                    photos.extend(char_data.get("reference_urls"))

                published_chars.append({
                    "id": row["id"],
                    "name": char_data.get("name", "Unknown"),
                    "status": char_data.get("description", "No description available"),
                    "photos": photos,
                    "hashtags": char_data.get("hashtag_dna", char_data.get("hashtags", [])),
                    "age": "20",
                    "distance": "1 km",
                    "default_world": row["id"],
                    "background_story": char_data.get("background_story", []),
                    "core_stats": char_data.get("core_stats", {}),
                    "stats": char_data.get("core_stats", {}),
                    "memories": [],
                    "comments": []
                })
    except Exception as e:
        logger.error(f"Error fetching published campaigns: {e}")
        # ถ้าพังตอนดึงข้อมูลใหม่ ให้ใช้ข้อมูลเก่าจาก Cache (ถ้ามี)
        if HUB_CATALOG_CACHE["data"]:
            return {"status": "success", "data": HUB_CATALOG_CACHE["data"], "cached": True, "stale": True}
        return {"status": "error", "data": []}
        
    # อัปเดต Cache
    HUB_CATALOG_CACHE["data"] = published_chars
    HUB_CATALOG_CACHE["last_updated"] = time.time()
    
    return {"status": "success", "data": published_chars, "cached": False}

@router.get("/characters/{character_id}")
async def get_character_profile(character_id: str):
    """ส่งข้อมูลโปรไฟล์ตัวละครให้ Frontend เอาไปจัด UI"""
    db = DatabaseCore()
    # ในระบบใหม่ character_id อาจจะถูกส่งมาเป็น world_id (เพราะมันผูกกันเป็นแคมเปญ)
    campaign = await db.get_published_campaign(character_id)
    
    if not campaign:
        # Fallback ไปหาไฟล์ Local เผื่อเป็นตัวละครเก่า
        file_path = f"data/characters/{character_id}.json"
        if not os.path.exists(file_path) and character_id == "may_base":
            file_path = "data/characters/may.json"
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        else:
            raise HTTPException(status_code=404, detail="Character not found")
    else:
        # ดึงจาก genesis_characters ก่อน ถ้าไม่มีใช้ character_data จากโลก
        genesis_char = campaign.get("genesis_characters")
        if genesis_char and isinstance(genesis_char, dict):
            data = genesis_char.get("character_data", {})
            if "avatar_url" not in data and genesis_char.get("avatar_url"):
                data["avatar_url"] = genesis_char["avatar_url"]
        else:
            data = campaign.get("character_data", {})

    return {
        "character_id": data.get("character_id", character_id),
        "name": data.get("name"),
        "archetype": data.get("archetype"),
        "description": data.get("description", ""),
        "hashtags": data.get("hashtag_dna", data.get("hashtags", [])),
        "current_phase": data.get("current_phase", 1),
        "avatar_url": data.get("avatar_url"), # 🌟 ส่ง URL รูปภาพหลัก
        "reference_urls": data.get("reference_urls", []), # 🌟 ส่ง URL รูปภาพอ้างอิงทั้งหมด
        "background_story": data.get("background_story", []), # 🌟 ส่งปูมหลัง
        "core_stats": data.get("core_stats", {}) # 🌟 ส่งสเตตัส
    }

@router.get("/worlds/{world_id}")
async def get_world_data(world_id: str):
    """ส่งข้อมูลฉากเริ่มต้น ระบบสภาพอากาศ และ Event ให้ Frontend"""
    db = DatabaseCore()
    campaign = await db.get_published_campaign(world_id)
    
    if not campaign:
        # Fallback ไปหาไฟล์ Local
        file_path = f"data/worlds/{world_id}.json"
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        raise HTTPException(status_code=404, detail="World not found")
        
    return campaign.get("world_data", {})


# ==========================================
# 👁️ [NEW ENGINE 5.5] GOD'S EYE TELEMETRY ENDPOINT
# ==========================================
@router.get("/telemetry")
async def get_telemetry():
    """
    Endpoint สำหรับดึงข้อมูล Telemetry เฉพาะในโหมด Development
    """
    if os.getenv("ENVIRONMENT", "development").lower() == "production":
        raise HTTPException(status_code=403, detail="Telemetry endpoint is disabled in production.")
        
    file_path = "data/telemetry.json"
    
    # ถ้ายังไม่เคยคุยกันเลย (ยังไม่มีไฟล์) ให้ส่งสถานะ 404 กลับไปบอกหน้าบ้าน
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="ยังไม่มีข้อมูล Telemetry กรุณาเริ่มแชทอย่างน้อย 1 เทิร์น")
        
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        logger.error(f"Error reading telemetry.json: {e}")
        raise HTTPException(status_code=500, detail="ไฟล์ Telemetry เสียหายหรือกำลังถูกใช้งาน")


# ==========================================
# 💬 MAIN CORE: Endpoint สำหรับคุยแชท (SSE Streaming)
# ==========================================

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Endpoint หลักที่ Frontend จะยิงข้อความเข้ามา (/api/chat)
    """
    # 🌟 [SUPABASE EDITION] ลบตัวแปรฟิสิกส์ออกจากการดักรับข้อมูลหน้าบ้าน
    logger.info(f"Received Request -> UserID: {request.user_id} | Char: {request.character_id} | Message: '{request.message}'")
    
    try:
        # 1. โหลดข้อมูลตัวละคร (JSON) เต็มรูปแบบสำหรับใช้ใน Engine
        db = DatabaseCore()
        # ลองหาจาก Supabase ก่อน (ใช้ world_id เป็นตัวอ้างอิงแคมเปญ)
        campaign = await db.get_published_campaign(request.world_id)
        
        if campaign and campaign.get("character_data"):
            character_data = campaign.get("character_data")
        else:
            # Fallback ไปหาไฟล์ Local
            char_id = request.character_id
            file_path = f"data/characters/{char_id}.json"
            if not os.path.exists(file_path) and char_id == "may_base":
                file_path = "data/characters/may.json"
            if os.path.exists(file_path):
                with open(file_path, "r", encoding="utf-8") as f:
                    character_data = json.load(f)
            else:
                raise HTTPException(status_code=404, detail="Character data not found")
        
        # 2. โหลด Pipeline ขึ้นมา
        pipeline = get_pipeline()
        
        # 3. 🌟 [SUPABASE EDITION] โยนเฉพาะข้อมูลที่จำเป็นเข้า Pipeline (สเตตัสอื่นๆ Pipeline จะไปดึงจาก Database เอง)
        stream_generator = await pipeline.process_chat_turn(
            user_id=request.user_id,
            character_id=request.character_id,
            session_id=request.session_id,
            user_message=request.message,
            character_data=character_data,
            history=request.history,
            current_world_state=request.world_state,
            world_id=request.world_id,
            is_regenerate=request.is_regenerate
        )
        
        # 4. ส่ง Stream กลับไปให้ Frontend แบบ Server-Sent Events (SSE)
        return StreamingResponse(stream_generator, media_type="text/event-stream")

    except Exception as e:
        logger.error(f"Error in chat_endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# 📥 [NEW] Endpoint สำหรับโหลดข้อมูล Session เก่า
# ==========================================
class LoadSessionRequest(BaseModel):
    user_id: str
    character_id: str
    session_id: Optional[str] = None
@router.get("/sessions/all/{user_id}")
async def get_all_user_sessions_summary_endpoint(user_id: str):
    """
    ดึงสรุป Session ล่าสุดของทุกตัวละครสำหรับแสดงใน Sidebar
    """
    try:
        logger.info(f"🔄 [API] Fetching all active sessions summary for user_id: {user_id}")
        db = DatabaseCore()
        summaries = await db.get_user_active_sessions_summary(user_id)
        logger.info(f"✅ [API] Found {len(summaries)} active sessions for user_id: {user_id}")
        return {"status": "success", "sessions": summaries}
    except Exception as e:
        logger.error(f"Error fetching all sessions summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{user_id}/{character_id}")
async def get_user_sessions_endpoint(user_id: str, character_id: str):
    """
    ดึงรายชื่อ Save Slots ทั้งหมดของผู้เล่นกับตัวละครนี้
    """
    try:
        db = DatabaseCore()
        sessions = await db.get_all_sessions(user_id, character_id)
        return {"status": "success", "sessions": sessions}
    except Exception as e:
        logger.error(f"Error fetching sessions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/sessions/{user_id}/{character_id}")
async def archive_user_session_endpoint(user_id: str, character_id: str):
    """
    ปิดการใช้งาน (Archive/Soft Delete) เซฟล่าสุดของตัวละครนี้ เพื่อให้หน้าบ้านหายไป
    """
    try:
        db = DatabaseCore()
        success = await db.archive_active_session(user_id, character_id)
        if success:
            return {"status": "success", "message": "Session archived"}
        else:
            raise HTTPException(status_code=500, detail="Failed to archive session")
    except Exception as e:
        logger.error(f"Error archiving session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/load_session")
async def load_session_endpoint(request: LoadSessionRequest):
    """
    ดึงข้อมูล Session และประวัติการแชทเก่าจาก Database กลับมาแสดงผลที่หน้าบ้าน
    """
    try:
        db = DatabaseCore()
        if request.session_id:
            session = await db.get_session_by_id(request.session_id)
        else:
            session = await db.get_active_session(request.user_id, request.character_id)
        
        if not session:
            return {"has_started": False}
            
        # ดึงประวัติแชท (Shallow Hydration: จำกัดแค่ 20 เทิร์นล่าสุด เพื่อให้โหลดไวปานสายฟ้า)
        raw_logs = await db.get_chat_history(session["id"], limit=20)
        
        # 🌟 [PHASE 6] Deep Hydration: ตรวจสอบว่า "เทิร์นแรกสุด" โดนตัดทิ้งไปหรือไม่
        # ถ้า raw_logs ก้อนที่เก่าที่สุดมี turn_number > 1 แปลว่าตกขอบไปแล้ว ให้งัดกลับมาต่อหัว
        if raw_logs and raw_logs[0].get("turn_number", 0) > 1:
            initial_logs = await db.get_initial_chat_logs(session["id"])
            # กรองเพื่อไม่ให้เอามาซ้ำ (ถึงแม้ลอจิกจะไม่ซ้ำอยู่แล้วก็ตาม)
            existing_ids = {str(log.get("id")) for log in raw_logs}
            filtered_initial = [log for log in initial_logs if str(log.get("id")) not in existing_ids]
            raw_logs = filtered_initial + raw_logs
            
        messages = []
        chat_history = []
        
        # วนลูปดึงข้อความ (get_chat_history เรียงจากเก่าไปใหม่มาให้แล้ว)
        for log in raw_logs:
            role = log.get("role")
            content = log.get("message")
            action = log.get("action")
            msg_id = str(log.get("id", "")) # ใช้ ID เป็น string
            
            if role == "user":
                if content and content.strip().startswith("[SYSTEM]"):
                    continue # 🌟 [FIX] ซ่อนข้อความระบบ และ action พิเศษ ไม่ให้ผู้เล่นเห็นในแชทประวัติ
                messages.append({"id": msg_id, "role": "user", "content": content, "status": "read"})
                chat_history.append({"role": "user", "content": content})
            elif role == "system":
                # 🌟 [PHASE 8] คืนร่าง Role Disguise: แยกแยะ system กลับเป็น intro_brief และ vo
                if content and ("คุณคือ " in content or "ภารกิจหลัก:" in content):
                    messages.append({"id": msg_id, "role": "intro_brief", "content": content})
                else:
                    messages.append({"id": msg_id, "role": "vo", "content": content})
            elif role == "intro_brief": # เผื่อของเก่าหลงเหลือ
                # 🌟 [PHASE 5] ดึงข้อความภารกิจกลับมาโชว์ตอนรีเฟรชหน้าจอ!
                messages.append({"id": msg_id, "role": "intro_brief", "content": content})
                # ไม่จำเป็นต้องใส่ chat_history เพราะ Model ได้รับจาก system prompt แล้ว
            elif role in ["ai", "assistant"]:
                messages.append({"id": msg_id, "role": "ai", "action": action, "dialogue": content})
                chat_history.append({"role": "assistant", "content": content})
            elif role == "director_vo": # เผื่อของเก่าหลงเหลือ
                messages.append({"id": msg_id, "role": "vo", "content": content})
                # เราไม่จำเป็นต้องส่ง vo กลับไปใน chat_history เพราะมันแค่บรรยายฉาก
        
        return {
            "has_started": True,
            "session_id": session["id"],
            "messages": messages,
            "chatHistory": chat_history,
            "activeEventId": session.get("active_event_id"),
            "activeEventPhase": session.get("active_event_phase"),
            "activeBeatId": session.get("active_beat_id"),
            "sandboxTurnCount": session.get("sandbox_turn_count", 0),
            "beatTurnCount": session.get("beat_turn_count", 0),
            "chaosLevel": session.get("chaos_level", "low"),
            "currentStance": session.get("current_stance", "neutral"),
            "tensionGauge": session.get("tension_gauge", 0),
            "playerPosture": session.get("player_posture", "ยืน/นั่งอิสระตามบริบท"),
            "actorPosture": session.get("actor_posture", "ยืน/นั่งอิสระตามบริบท"),
            "dominanceState": session.get("dominance_state", "NEUTRAL"),
            "actionLock": session.get("action_lock", False),
            "contactPoints": session.get("contact_points", []),
            "worldState": session.get("current_world_state", {"time": "บ่าย 2 โมง", "location": "ซอกมุมอับใต้โครงเหล็ก", "weather": "แดดจัด"}),
            "characterStats": {
                "affection": session.get("affection_score", 0),
                "affUnlock": 20,
                "desire": session.get("desire_score", 0),
                "desUnlock": 50,
                "phase": 1
            }
        }
    except Exception as e:
        logger.error(f"Error loading session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# 🔄 [NEW] Endpoint สำหรับปุ่ม "เริ่มเกมใหม่ / New Game Plus"
# ==========================================
class StartSessionRequest(BaseModel):
    user_id: str
    character_id: str
    world_id: str = None
    ng_plus_from_session_id: str = None
    player_vibe_override: str = None
    pronouns_override: str = None
    nicknames_override: str = None
    main_quest_override: str = None
    trigger_initial_vo: bool = False
    initial_message: str = "[SYSTEM] เริ่มต้นเกม"

async def background_initial_chat_task(user_id: str, character_id: str, session_id: str, world_id: str, user_message: str):
    """รัน AI เบื้องหลังโดยไม่ต้องส่ง Stream กลับไปหน้าบ้าน"""
    try:
        logger.info(f"🚀 [BACKGROUND VO] เริ่มต้นปั่น VO ล่วงหน้าสำหรับ Session: {session_id}")
        db = DatabaseCore()
        campaign = await db.get_published_campaign(world_id) if world_id else None
        
        character_data = {}
        if campaign and campaign.get("character_data"):
            character_data = campaign.get("character_data")
        else:
            file_path = f"data/characters/{character_id}.json"
            if not os.path.exists(file_path) and character_id == "may_base":
                file_path = "data/characters/may.json"
            if os.path.exists(file_path):
                with open(file_path, "r", encoding="utf-8") as f:
                    character_data = json.load(f)
                    
        pipeline = get_pipeline()
        stream_generator = await pipeline.process_chat_turn(
            user_id=user_id,
            character_id=character_id,
            session_id=session_id,
            user_message=user_message,
            character_data=character_data,
            current_world_state={"time": "บ่าย 2 โมง", "location": "ฉากเริ่มต้น", "weather": "ปกติ"},
            world_id=world_id
        )
        
        # วนลูป Generator เพื่อให้มันทำงานจนจบและเซฟลง DB
        async for _ in stream_generator:
            pass
            
        logger.info(f"✅ [BACKGROUND VO] ทำงานเสร็จสมบูรณ์สำหรับ Session: {session_id}")
    except Exception as e:
        logger.error(f"❌ [BACKGROUND VO ERROR]: {e}")

@router.post("/start_session")
async def start_session_endpoint(request: StartSessionRequest, background_tasks: BackgroundTasks):
    """
    สร้างเซฟเกมใหม่ (New Game หรือ NG+)
    """
    logger.warning("="*80)
    logger.warning(f"🔄 [TIME PARADOX] - ผู้เล่น {request.user_id} สร้าง Save Slot ใหม่ของ {request.character_id}!")
    
    try:
        db = DatabaseCore()
        
        # 🌟 [FIX] ตรวจสอบและสร้าง Profile ให้แน่ใจก่อนสร้าง Session ป้องกัน Foreign Key Error
        await db.get_or_create_profile(request.user_id, f"User_{request.user_id[-4:]}")
        
        # เรียกคำสั่งสร้าง Session ใหม่
        new_session = await db.create_new_session(
            user_id=request.user_id,
            character_codename=request.character_id,
            world_id=request.world_id,
            ng_plus_from_session_id=request.ng_plus_from_session_id,
            player_vibe_override=request.player_vibe_override,
            pronouns_override=request.pronouns_override,
            nicknames_override=request.nicknames_override,
            main_quest_override=request.main_quest_override
        )
        
        if new_session:
            logger.info(f"✅ [TIME PARADOX] - สร้างไทม์ไลน์ใหม่สำเร็จ: {new_session['id']}")
            
            # 🚀 [FEATURE: PRE-FETCH VO] ถ้าร้องขอให้รัน VO เบื้องหลัง
            if request.trigger_initial_vo:
                background_tasks.add_task(
                    background_initial_chat_task,
                    user_id=request.user_id,
                    character_id=request.character_id,
                    session_id=new_session["id"],
                    world_id=request.world_id,
                    user_message=request.initial_message
                )
                
            return {"status": "success", "session_id": new_session["id"], "message": "New save slot created."}
        else:
            logger.error("❌ [TIME PARADOX] - ไม่สามารถสร้างไทม์ไลน์ใหม่ใน Database ได้")
            raise HTTPException(status_code=500, detail="Failed to reset session in Supabase")
            
    except Exception as e:
        logger.error(f"[TIME PARADOX ERROR]: {e}")
        raise HTTPException(status_code=500, detail=str(e))
