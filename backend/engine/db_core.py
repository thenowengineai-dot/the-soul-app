import os
import httpx
import asyncio
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv
from loguru import logger

# โหลดตัวแปรจากไฟล์ .env
load_dotenv()

class DatabaseCore:
    """
    ผู้จัดการฐานข้อมูล (Supabase REST API Connector)
    ทำหน้าที่เป็นตัวกลางในการอ่าน/เขียนข้อมูลทั้งหมดของเกมโดยไม่พึ่งพาแพ็กเกจ supabase
    """
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # 🚨 บังคับใช้ Service Role Key เท่านั้น
        
        # 🌟 Upstash Redis Configuration
        self.redis_url = os.getenv("UPSTASH_REDIS_REST_URL")
        self.redis_token = os.getenv("UPSTASH_REDIS_REST_TOKEN")
        
        if not self.supabase_url or not self.supabase_key:
            logger.error("❌ ขาด SUPABASE_URL หรือ SUPABASE_SERVICE_ROLE_KEY ในไฟล์ .env!")
        else:
            logger.success("✅ เชื่อมต่อ Supabase สำเร็จ! (REST API Mode - Async)")
            
        if self.redis_url and self.redis_token:
            logger.success("🚀 เชื่อมต่อ Upstash Redis Cache สำเร็จ! (Zero Latency Mode)")
        else:
            logger.warning("⚠️ ไม่พบการตั้งค่า Upstash Redis ใน .env ระบบจะดึงข้อมูลจาก Supabase ตรงๆ (ช้ากว่า)")

    async def _request(self, method: str, table: str, params: dict = None, json_data: Any = None, return_representation: bool = False) -> Optional[List[Dict[str, Any]]]:
        """Helper function สำหรับยิง HTTP Request ไปที่ Supabase REST API แบบ Asynchronous"""
        if not self.supabase_url or not self.supabase_key:
            return None
            
        url = f"{self.supabase_url}/rest/v1/{table}"
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json"
        }
        
        if return_representation:
            headers["Prefer"] = "return=representation"
            
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.request(method, url, headers=headers, params=params, json=json_data)
                response.raise_for_status()
                if response.text:
                    return response.json()
                return []
        except httpx.HTTPStatusError as e:
            error_msg = f"Supabase API Error ({method} {table}): {e}"
            if hasattr(e, "response") and e.response is not None:
                error_msg += f" | Response: {e.response.text}"
            logger.error(error_msg)
            return None
        except Exception as e:
            logger.error(f"Supabase API Error ({method} {table}): {e}")
            return None

    async def _redis_request(self, command: str, key: str, value: Any = None, ex: int = 86400) -> Optional[Any]:
        """Helper สำหรับเรียก Upstash Redis ผ่าน REST API"""
        if not self.redis_url or not self.redis_token:
            return None
            
        headers = {"Authorization": f"Bearer {self.redis_token}"}
        
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                if command == "GET":
                    url = f"{self.redis_url}/get/{key}"
                    response = await client.get(url, headers=headers)
                    response.raise_for_status()
                    res_json = response.json()
                    if res_json.get("result"):
                        import json
                        return json.loads(res_json["result"])
                    return None
                    
                elif command == "SET":
                    import json
                    url = f"{self.redis_url}/set/{key}"
                    # ex = 86400 (24 hours TTL)
                    payload = json.dumps(value)
                    # ใช้ content=payload แทน json=payload เพื่อป้องกันการเข้ารหัสซ้อนสองชั้น (Double JSON Encode)
                    response = await client.post(url, headers=headers, content=payload, params={"EX": ex})
                    response.raise_for_status()
                    return True
                elif command == "DEL":
                    url = f"{self.redis_url}/del/{key}"
                    response = await client.get(url, headers=headers)
                    response.raise_for_status()
                    return True
        except Exception as e:
            logger.error(f"Redis API Error ({command}): {e}")
            return None

    # ==========================================
    # 👤 PROFILE MANAGEMENT
    # ==========================================
    async def get_or_create_profile(self, user_id: str, username: str = "Player") -> str:
        """ตรวจสอบว่ามีผู้เล่นนี้หรือยัง ถ้ายังให้สร้างใหม่ (ใช้ user_id แบบ UUID)"""
        try:
            response = await self._request("GET", "profiles", params={"select": "id", "id": f"eq.{user_id}"})
            if not response:
                await self._request("POST", "profiles", json_data={"id": user_id, "username": username})
                logger.debug(f"👤 สร้าง Profile ใหม่สำเร็จ: {user_id}")
            return user_id
        except Exception as e:
            logger.error(f"Error in get_or_create_profile: {e}")
            return user_id

    # ==========================================
    # 🌍 CAMPAIGN MANAGEMENT (Genesis Engine Integration)
    # ==========================================
    async def get_published_campaign(self, campaign_id: str) -> Optional[Dict[str, Any]]:
        """ดึงข้อมูลแคมเปญ (World + Character) ที่ Publish แล้วจาก Supabase (รองรับ Redis Cache)"""
        # 🌟 [CACHE BYPASS] เปลี่ยนชื่อ Key เป็น v3 เพื่อหนี Cache เก่าที่พัง (Double Encode)
        cache_key = f"campaign_v3:{campaign_id}"
        
        # 1. 🚀 ลองดึงจาก Redis ก่อน (Cache Hit = เร็ว 0.001 วิ)
        cached_campaign = await self._redis_request("GET", cache_key)
        if cached_campaign:
            logger.debug(f"⚡ [CACHE HIT] โหลดข้อมูลโลก {campaign_id} จาก Redis ทันที!")
            return cached_campaign
            
        # 2. 🐢 ถ้าไม่มีใน Redis ค่อยดึงจาก Supabase
        try:
            # 🌟 [CRITICAL FIX] Join กับ genesis_characters เพื่อดึงตัวละครจริงมาประกอบกับโลก
            response = await self._request("GET", "genesis_campaigns", params={"select": "*, genesis_characters(*)", "id": f"eq.{campaign_id}", "status": "eq.published"})
            if response and len(response) > 0:
                campaign_data = response[0]
                
                # นำข้อมูลจาก genesis_characters มาทับ character_data เดิม
                genesis_char = campaign_data.get("genesis_characters")
                if genesis_char and isinstance(genesis_char, dict):
                    campaign_data["character_data"] = genesis_char.get("character_data", campaign_data.get("character_data", {}))
                    # อัปเดต avatar_url
                    if "avatar_url" in genesis_char and genesis_char["avatar_url"]:
                        campaign_data["character_data"]["avatar_url"] = genesis_char["avatar_url"]
                
                # 3. 💾 เซฟลง Redis เพื่อให้ครั้งหน้าโหลดเร็วขึ้น (อายุ 24 ชม.)
                await self._redis_request("SET", cache_key, campaign_data)
                logger.info(f"💾 [CACHE STORE] เซฟข้อมูลโลก {campaign_id} ลง Redis แล้ว!")
                
                return campaign_data
            return None
        except Exception as e:
            logger.error(f"Error fetching published campaign '{campaign_id}': {e}")
            return None

    # ==========================================
    # 🎭 CHARACTER MANAGEMENT (The UUID Resolver)
    # ==========================================
    async def get_or_create_character(self, codename: str) -> str:
        """
        🌟 [NEW FEATURE] วุ้นแปลภาษา (V2): แปลงตัวแปรที่รับมา (อาจเป็น World ID หรือ Character Codename) 
        ให้กลายเป็น Character ID ที่แท้จริง (ไม่สร้างขยะใน DB แล้ว)
        """
        try:
            # 1. 🌍 ลองตรวจสอบว่า codename ที่ส่งมา คือ World ID (campaign_id) หรือเปล่า
            camp_res = await self._request("GET", "genesis_campaigns", params={"select": "character_id", "id": f"eq.{codename}"})
            if camp_res and len(camp_res) > 0 and camp_res[0].get("character_id"):
                return camp_res[0]["character_id"]
                
            # 2. 🎭 ลองตรวจสอบว่าเป็น Character ID ใน genesis_characters ไหม
            g_char_res = await self._request("GET", "genesis_characters", params={"select": "id", "id": f"eq.{codename}"})
            if g_char_res and len(g_char_res) > 0:
                return g_char_res[0]["id"]
                
            # 3. (Legacy) ลองค้นหาด้วย codename ว่ามีตัวละครนี้ในระบบเก่า (ตาราง characters) หรือยัง
            response = await self._request("GET", "characters", params={"select": "id", "codename": f"eq.{codename}"})
            if response and len(response) > 0:
                return response[0]["id"]
            
            # 4. ถ้ายังไม่มี ให้สร้างขึ้นมาใหม่ในตาราง characters (Legacy Fallback)
            payload = {
                "codename": codename,
                "name": codename.capitalize(), # เปลี่ยน may เป็น May ชั่วคราว
                "core_data": {} # ใส่ช่องว่างไว้ก่อน เผื่อให้แอดมินมาเติมทีหลัง
            }
            new_res = await self._request("POST", "characters", json_data=payload, return_representation=True)
            if new_res:
                logger.success(f"🌟 [AUTO-INIT] สร้างบัญชีตัวละครใหม่ใน DB สำเร็จ: {codename}")
                return new_res[0]["id"]
        except Exception as e:
            logger.error(f"Error resolving Character UUID for '{codename}': {e}")
        return codename # หากพังให้ส่งตัวเดิมกลับไป

    # ==========================================
    # 🎮 SESSION MANAGEMENT (The Heart of State)
    # ==========================================
    async def get_active_session(self, user_id: str, character_codename: str) -> Optional[Dict[str, Any]]:
        """ดึง Session ปัจจุบันที่ยัง 'active' อยู่ของผู้เล่นคนนี้กับตัวละครนี้ (ระบบเก่าแบบงมหาเซฟ)"""
        # 🌟 สั่งให้วุ้นแปลภาษาหา UUID ของนางฟ้าก่อน!
        char_uuid = await self.get_or_create_character(character_codename)
        
        try:
            response = await self._request("GET", "game_sessions", params={
                "select": "*",
                "user_id": f"eq.{user_id}",
                "character_id": f"eq.{char_uuid}",
                "status": "eq.active",
                "order": "created_at.desc",
                "limit": "1"
            })
            
            if response and len(response) > 0:
                return response[0]
            return None
        except Exception as e:
            logger.error(f"Error getting active session: {e}")
            return None

    async def get_session_by_id(self, session_id: str) -> Optional[Dict[str, Any]]:
        """ดึง Session แบบเจาะจงผ่าน session_id (ระบบใหม่: Save Slot)"""
        try:
            response = await self._request("GET", "game_sessions", params={
                "select": "*",
                "id": f"eq.{session_id}",
                "limit": "1"
            })
            if response and len(response) > 0:
                return response[0]
            return None
        except Exception as e:
            logger.error(f"Error getting session by ID: {e}")
            return None

    async def get_all_sessions(self, user_id: str, character_codename: str) -> List[Dict[str, Any]]:
        """ดึงรายการ Save File ทั้งหมดของผู้เล่นกับตัวละครนี้ (สำหรับทำหน้า Load Game)"""
        char_uuid = await self.get_or_create_character(character_codename)
        try:
            response = await self._request("GET", "game_sessions", params={
                "select": "id, created_at, status, beat_turn_count",
                "user_id": f"eq.{user_id}",
                "character_id": f"eq.{char_uuid}",
                "order": "created_at.desc"
            })
            return response if response else []
        except Exception as e:
            logger.error(f"Error getting all sessions: {e}")
            return []

    async def get_user_active_sessions_summary(self, user_id: str) -> List[Dict[str, Any]]:
        """ดึงรายการ Session ล่าสุดที่ Active ของ user_id นี้ (ทุกตัวละคร) พร้อมข้อความล่าสุด"""
        try:
            logger.info(f"🔍 [DB] Querying active game_sessions for user: {user_id}")
            # 1. ดึง sessions ที่สถานะ active ของ user นี้ พร้อมดึง chat_logs ล่าสุดมาด้วยใน Query เดียว (ลด N+1)
            response = await self._request("GET", "game_sessions", params={
                "select": "id, character_id, created_at, status, chat_logs(id, role, message, action, created_at)",
                "user_id": f"eq.{user_id}",
                "status": "eq.active",
                "order": "created_at.desc",
                "chat_logs.order": "created_at.desc",
                "chat_logs.limit": "1"
            })
            
            if not response:
                logger.info(f"ℹ️ [DB] No active sessions found for user: {user_id}")
                return []
                
            # 2. คัดกรองให้เหลือ 1 session ล่าสุดต่อ 1 ตัวละคร (เผื่อพลาดมี active ซ้ำ)
            character_sessions = {}
            char_uuids = set()
            for session in response:
                char_id = session.get("character_id")
                if char_id and char_id not in character_sessions:
                    character_sessions[char_id] = session
                    char_uuids.add(char_id)
            
            logger.info(f"🔍 [DB] Found {len(char_uuids)} unique active characters. Resolving codenames...")
            
            # 3. แมป UUID กลับเป็น codename
            char_res = await self._request("GET", "characters", params={
                "select": "id, codename",
                "id": f"in.({','.join(char_uuids)})"
            })
            
            uuid_to_codename = {}
            if char_res:
                for c in char_res:
                    uuid_to_codename[c["id"]] = c["codename"]
            
            logger.info(f"✅ [DB] Resolved codenames: {uuid_to_codename}")
            
            # 4. ประกอบร่างข้อความล่าสุด (ไม่ต้องยิง N+1 แล้ว!)
            summaries = []
            for sess in character_sessions.values():
                sess["character_codename"] = uuid_to_codename.get(sess["character_id"], sess["character_id"])
                
                # ดึงจากที่ PostgREST join มาให้แล้ว
                logs = sess.pop("chat_logs", [])
                sess["last_message"] = logs[0] if logs else None
                summaries.append(sess)
            
            logger.info(f"✅ [DB] Successfully fetched {len(summaries)} session summaries with Single Batch Query.")
            return summaries
        except Exception as e:
            logger.error(f"Error getting active sessions summary: {e}")
            return []

    async def archive_active_session(self, user_id: str, character_codename: str) -> bool:
        """ซ่อนเซฟ (เปลี่ยนสถานะจาก active เป็น archived)"""
        try:
            char_uuid = await self.get_or_create_character(character_codename)
            
            # อัปเดตสถานะของ session ที่ active อยู่ ให้เป็น archived
            response = await self._request("PATCH", "game_sessions", params={
                "user_id": f"eq.{user_id}",
                "character_id": f"eq.{char_uuid}",
                "status": "eq.active"
            }, json_data={
                "status": "archived"
            })
            
            logger.info(f"🗑️ [DB] Archived session for user {user_id}, character {character_codename}")
            return True
        except Exception as e:
            logger.error(f"Error archiving session: {e}")
            return False


    async def create_new_session(self, user_id: str, character_codename: str, world_id: str = None, ng_plus_from_session_id: str = None, player_vibe_override: str = None, pronouns_override: str = None, nicknames_override: str = None, main_quest_override: str = None) -> Optional[Dict[str, Any]]:
        """สร้าง Session ใหม่ (New Game / Save Slot ใหม่)"""
        char_uuid = await self.get_or_create_character(character_codename)

        initial_desire = 0
        initial_affection = 0
        initial_shatter_count = 0

        # พยายามดึง world_data เพื่อหา Initial States (Pre-heated Scene)
        try:
            if not world_id:
                camp_res = await self._request("GET", "genesis_campaigns", params={
                    "select": "id, world_data",
                    "character_id": f"eq.{char_uuid}",
                    "status": "eq.published",
                    "limit": "1"
                })
                if camp_res and len(camp_res) > 0:
                    world_id = camp_res[0]["id"]
                    world_data = camp_res[0].get("world_data", {})
                    if world_data and "initial_states" in world_data:
                        initial_desire = world_data["initial_states"].get("desire", 0)
                        initial_affection = world_data["initial_states"].get("affection", 0)
                        initial_shatter_count = world_data["initial_states"].get("shatter_count", 0)
            else:
                camp_res = await self._request("GET", "genesis_campaigns", params={
                    "select": "world_data",
                    "id": f"eq.{world_id}"
                })
                if camp_res and len(camp_res) > 0:
                    world_data = camp_res[0].get("world_data", {})
                    if world_data and "initial_states" in world_data:
                        initial_desire = world_data["initial_states"].get("desire", 0)
                        initial_affection = world_data["initial_states"].get("affection", 0)
                        initial_shatter_count = world_data["initial_states"].get("shatter_count", 0)
        except Exception as e:
            logger.error(f"Error finding paired world or initial states: {e}")

        try:
            # 🌟 [CHANGE] เราจะไม่แอบ Archive อันเก่าแล้ว ปล่อยไว้เป็น Save Slot 
            
            # สร้าง Session ใหม่เอี่ยมแบบหน้ากระดาษเปล่า (หรือฉบับ Pre-heated)
            new_session_data = {
                "user_id": user_id,
                "character_id": char_uuid,
                "status": "active",
                "world_id": world_id,
                "actor_posture": None,
                "player_posture": None,
                "current_outfit": None,
                "sandbox_turn_count": 0,
                "beat_turn_count": 0,
                "tension_gauge": 0,
                "chaos_level": "low",
                "current_stance": "neutral",
                "affection": initial_affection,
                "desire": initial_desire,
                "shatter_count": initial_shatter_count,
                "peaceful_turns_count": 0,
                "player_vibe_override": player_vibe_override,
                "pronouns_override": pronouns_override,
                "nicknames_override": nicknames_override,
                "main_quest_override": main_quest_override
            }
            response = await self._request("POST", "game_sessions", json_data=new_session_data, return_representation=True)
            
            if response and len(response) > 0:
                new_session = response[0]
                new_session_id = new_session["id"]
                logger.success(f"🔄 สร้าง Save Slot ใหม่สำเร็จ! Session ID: {new_session_id}")

                # 🧠 [NEW GAME PLUS] ถ้ามีการสั่งสืบทอดความจำ ให้ไปก๊อปปี้มาเลย!
                if ng_plus_from_session_id:
                    logger.info(f"🧠 [NG+] กำลังคัดลอกความจำจากเซฟเก่า: {ng_plus_from_session_id}")
                    old_memories = await self._request("GET", "extracted_memories", params={
                        "select": "*",
                        "session_id": f"eq.{ng_plus_from_session_id}"
                    })
                    if old_memories:
                        ng_memories_payload = []
                        for mem in old_memories:
                            deja_vu_text = f"[รู้สึกคุ้นเคยอย่างประหลาด] {mem['memory_text']}"
                            ng_memories_payload.append({
                                "user_id": user_id,
                                "character_id": char_uuid,
                                "memory_text": deja_vu_text,
                                "session_id": new_session_id,
                                "inherited_from": ng_plus_from_session_id
                            })
                        # ยิง Bulk Insert ความจำเก่าลงสมองใหม่
                        await self._request("POST", "extracted_memories", json_data=ng_memories_payload)
                        logger.success(f"🧠 [NG+] คัดลอกความจำสำเร็จ {len(ng_memories_payload)} รายการ")
                        
                        # 🌟 [QDRANT] ซิงค์ความจำที่สืบทอดมา ลง Vector Database ด้วย
                        try:
                            from engine.memory_core import MemoryCore
                            memory_sync = MemoryCore()
                            for mem in ng_memories_payload:
                                await memory_sync.save_memory(
                                    user_id=mem["user_id"],
                                    character_id=mem["character_id"],
                                    memory_text=mem["memory_text"],
                                    session_id=mem["session_id"]
                                )
                            logger.success(f"🧠 [NG+] ซิงค์ความจำข้ามมิติลง Qdrant สำเร็จ!")
                        except Exception as sync_err:
                            logger.error(f"❌ [NG+] Error syncing to Qdrant: {sync_err}")
                
                return new_session
            return None
        except Exception as e:
            logger.error(f"Error creating new session: {e}")
            return None

    async def update_session_state(self, session_id: str, update_payload: Dict[str, Any]):
        """
        อัปเดตสเตตัสในเกม เช่น เสื้อผ้าขาด, ขยับ Phase, เปลี่ยน Tension
        """
        try:
            await self._request("PATCH", "game_sessions", params={"id": f"eq.{session_id}"}, json_data=update_payload)
            logger.debug(f"💾 [SUPABASE] อัปเดต State ถาวรลง Session: {session_id}")
        except Exception as e:
            logger.error(f"Error updating session state: {e}")

    # ==========================================
    # 💬 CHAT LOG & HISTORY
    # ==========================================
    async def log_chat(self, session_id: str, role: str, message: str, action: str = None, turn_number: int = 0):
        """จดบันทึกการพูดคุยลง Database"""
        try:
            payload = {
                "session_id": session_id,
                "role": role,
                "message": message,
                "action": action,
                "turn_number": turn_number
            }
            await self._request("POST", "chat_logs", json_data=payload)
        except Exception as e:
            logger.error(f"Error logging chat: {e}")

    async def log_chat_bulk(self, logs: List[Dict[str, Any]]):
        """
        🌟 [NEW] ยิงเซฟแชทหลายๆ แถวพร้อมกันใน 1 Request (Bulk Insert)
        เพื่อป้องกันคอขวดเวลาดึงข้อมูลและเพิ่มความเร็วแบบทวีคูณ
        """
        if not logs:
            return
        try:
            await self._request("POST", "chat_logs", json_data=logs)
            logger.debug(f"💾 [SUPABASE] Bulk Insert ประวัติแชทสำเร็จ {len(logs)} รายการ")
        except Exception as e:
            logger.error(f"Error in log_chat_bulk: {e}")

    async def delete_turn_chat_logs(self, session_id: str, turn_number: int):
        """
        🌟 [PHASE 4] ลบคำตอบเก่าของ AI (Actor & Director) ในเทิร์นนี้ทิ้ง
        ใช้สำหรับปราบผีซ้ำซ้อนตอนผู้เล่นกดปุ่ม Regenerate
        """
        try:
            # ลบข้อความที่ role ไม่ใช่ user ในเทิร์นนี้
            await self._request("DELETE", "chat_logs", params={
                "session_id": f"eq.{session_id}",
                "turn_number": f"eq.{turn_number}",
                "role": "neq.user" # ลบ ai, assistant, director_vo ทิ้งให้หมด
            })
            logger.info(f"🗑️ [SUPABASE] Deleted old AI answers for session {session_id} turn {turn_number}")
        except Exception as e:
            logger.error(f"Error deleting turn chat logs: {e}")

    async def get_chat_history(self, session_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """ดึงประวัติแชทล่าสุดของ Session นี้ เพื่อโยนให้ AI อ่าน"""
        try:
            response = await self._request("GET", "chat_logs", params={
                "select": "*",
                "session_id": f"eq.{session_id}",
                "order": "turn_number.desc,chunk_sequence.desc",
                "limit": str(limit)
            })
            
            # ต้อง reverse กลับเพื่อให้บทสนทนาเรียงจากเก่าไปใหม่ตามปกติที่ AI ควรอ่าน
            history = response[::-1] if response else []
            return history
        except Exception as e:
            logger.error(f"Error getting chat history: {e}")
            return []

    async def get_initial_chat_logs(self, session_id: str) -> List[Dict[str, Any]]:
        """🌟 [PHASE 6] ดึงประวัติแชทเริ่มต้น (เทิร์น 0-1) เสมอ เพื่อให้ Intro Brief และฉากเปิดไม่หายไปเมื่อโหลดเซสชันลึกๆ"""
        try:
            response = await self._request("GET", "chat_logs", params={
                "select": "*",
                "session_id": f"eq.{session_id}",
                "turn_number": "lte.1",
                "order": "turn_number.asc,chunk_sequence.asc"
            })
            return response if response else []
        except Exception as e:
            logger.error(f"Error getting initial chat logs: {e}")
            return []

    # ==========================================
    # 🧠 LONG-TERM MEMORY
    # ==========================================
    async def save_extracted_memory(self, user_id: str, character_codename: str, memory_text: str, session_id: str):
        """บันทึกความทรงจำถาวรที่ Evaluator สกัดออกมาได้ โดยผูกติดกับ Session นั้นๆ"""
        char_uuid = await self.get_or_create_character(character_codename)
        
        try:
            payload = {
                "user_id": user_id,
                "character_id": char_uuid,
                "memory_text": memory_text,
                "session_id": session_id
            }
            await self._request("POST", "extracted_memories", json_data=payload)
            logger.opt(colors=True).info(f"🧠 <green>[SUPABASE MEMORY]</green> ฝังความจำสำเร็จ: {memory_text} (Save: {session_id[:8]})")
        except Exception as e:
            logger.error(f"Error saving extracted memory: {e}")
