import os
import json
import uuid
import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

# นำเข้า Schema และ Pipeline
from api.schemas import ChatRequest
from engine.pipeline import GamePipeline

# 🌟 นำเข้า Neon PostgreSQL & Upstash Redis Hot Cache
from engine.postgres_core import get_postgres_core
from engine.redis_cache import RedisHotCache

# 🌟 นำเข้า Database Core เดิมสำหรับดึงแคมเปญ (Read-only Catalog)
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
# 👤 IDENTITY & AUTH ENDPOINTS (Neon PostgreSQL)
# ==========================================

class GuestAuthRequest(BaseModel):
    guest_id: Optional[str] = None
    name: Optional[str] = "นักเดินทางนิรนาม"

class GoogleAuthRequest(BaseModel):
    credential: str
    guest_id: Optional[str] = None

@router.post("/auth/guest")
async def auth_guest_endpoint(request: GuestAuthRequest):
    """
    สร้างหรือยืนยัน Guest Identity ใน Neon PostgreSQL
    """
    guest_id = request.guest_id or f"gst_{uuid.uuid4()}"
    pg = get_postgres_core()
    user = await pg.get_or_create_user(
        user_id=guest_id,
        name=request.name or "นักเดินทางนิรนาม",
        is_guest=True
    )
    return {
        "status": "success",
        "user_id": user["id"],
        "name": user["name"],
        "is_guest": True,
        "created_at": str(user.get("created_at", ""))
    }

@router.post("/auth/google")
async def auth_google_endpoint(request: GoogleAuthRequest):
    """
    ตรวจสอบ Google ID Token, บันทึกผู้ใช้ลง Neon PostgreSQL, และโอนย้าย Session จาก Guest (ถ้ามี)
    """
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests

    try:
        # ตรวจสอบ token กับ Google
        idinfo = id_token.verify_oauth2_token(
            request.credential,
            google_requests.Request()
        )
        google_id = idinfo.get("sub")
        email = idinfo.get("email")
        name = idinfo.get("name") or "ผู้ใช้ Google"
        picture = idinfo.get("picture")

        if not google_id:
            raise HTTPException(status_code=400, detail="Invalid Google Token: Missing sub")

        user_id = f"usr_{google_id[:12]}"
        pg = get_postgres_core()
        user = await pg.get_or_create_user(
            user_id=user_id,
            name=name,
            email=email,
            avatar_url=picture,
            google_id=google_id,
            is_guest=False
        )

        # 🌟 โอนย้าย Session จาก Guest (ถ้าผู้ใช้เคยเล่นในโหมด Guest มาก่อน)
        migrated_count = 0
        if request.guest_id and request.guest_id.startswith("gst_"):
            pool = await pg.get_pool()
            async with pool.acquire() as conn:
                res = await conn.execute(
                    "UPDATE game_sessions SET user_id = $1 WHERE user_id = $2;",
                    user_id, request.guest_id
                )
                migrated_count = int(res.split(" ")[-1]) if "UPDATE" in res else 0
                logger.info(f"🔄 Migrated {migrated_count} sessions from {request.guest_id} to {user_id}")

        return {
            "status": "success",
            "user_id": user["id"],
            "email": user.get("email"),
            "name": user.get("name"),
            "avatar_url": user.get("avatar_url"),
            "is_guest": False,
            "migrated_sessions": migrated_count
        }
    except Exception as e:
        logger.error(f"Google Auth Error: {e}")
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

@router.get("/auth/me/{user_id}")
async def get_current_user_endpoint(user_id: str):
    """
    ดึงข้อมูลโปรไฟล์ผู้ใช้จาก Neon PostgreSQL
    """
    pg = get_postgres_core()
    user = await pg.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "success", "user": user}

# ==========================================
# 🌟 Endpoints สำหรับให้ Frontend ดึงข้อมูลไปแสดงผล
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
        # 🌟 [CRITICAL FIX] Join กับ genesis_characters และดึง world_data ด้วย
        response = await db._request("GET", "genesis_campaigns", params={"select": "id, name, character_data, world_data, genesis_characters(*)", "status": "eq.published"})
        if response:
            for row in response:
                char_data = row.get("character_data", {})
                world_data = row.get("world_data") or {}
                
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

                starting_state = world_data.get("starting_state", {})
                initial_scene = world_data.get("initial_scene", {})
                appearance_data = char_data.get("appearance", {})
                raw_wardrobe = appearance_data.get("wardrobe") or char_data.get("wardrobe", {})
                
                initial_outfit = "ชุดเริ่มต้น"
                if isinstance(raw_wardrobe, dict) and raw_wardrobe:
                    first_val = list(raw_wardrobe.values())[0]
                    initial_outfit = ", ".join(first_val) if isinstance(first_val, list) else str(first_val)
                elif isinstance(raw_wardrobe, list) and raw_wardrobe:
                    first_item = raw_wardrobe[0]
                    if isinstance(first_item, dict):
                        items = first_item.get("items", ["ชุดเริ่มต้น"])
                        initial_outfit = ", ".join(items) if isinstance(items, list) else str(items)
                    elif isinstance(first_item, str):
                        initial_outfit = first_item

                initial_env = {
                    "time": starting_state.get("initial_time") or initial_scene.get("time") or "14:00 น.",
                    "location": starting_state.get("initial_location") or initial_scene.get("location") or world_data.get("world_name") or "สถานที่นัดพบ",
                    "weather": starting_state.get("initial_weather") or initial_scene.get("weather") or "ปกติ แจ่มใส",
                }
                initial_pose = starting_state.get("initial_a_pos") or "ยืน/นั่งอิสระตามบริบท"

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
                    "initial_environment": initial_env,
                    "initial_outfit": initial_outfit,
                    "initial_pose": initial_pose,
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
        # ลองหาจาก Supabase ก่อน (ใช้ world_id หรือ character_id เป็นตัวอ้างอิงแคมเปญ)
        target_world = request.world_id or request.character_id
        campaign = await db.get_published_campaign(target_world) if target_world else None
        
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
    ดึงข้อมูล Session และประวัติการแชทเก่ากลับมาแสดงผลที่หน้าบ้าน
    ลำดับการดึง:
    1. ตรวจสอบ Neon PostgreSQL & Upstash Redis Hot Cache ก่อน (Zero-latency / Intact JSONB)
    2. ถ้าไม่พบ ให้ Fallback ไปยัง Supabase เดิม (Legacy Session)
    """
    try:
        # 1. 🌟 ตรวจสอบ Neon PostgreSQL ก่อน
        pg = get_postgres_core()
        redis = RedisHotCache()
        neon_session = None

        if request.session_id:
            neon_session = await pg.get_game_session(request.session_id)
        elif request.user_id and request.character_id:
            pool = await pg.get_pool()
            async with pool.acquire() as conn:
                row = await conn.fetchrow("""
                    SELECT * FROM game_sessions 
                    WHERE user_id = $1 AND character_id = $2 AND status = 'active'
                    ORDER BY updated_at DESC LIMIT 1;
                """, request.user_id, request.character_id)
                if row:
                    neon_session = dict(row)

        if neon_session:
            session_id = neon_session["id"]
            # ⚡ ดึงรอบการเล่นจาก Upstash Redis Hot Cache ก่อน (0.001s)
            cached_rounds = redis.get_recent_rounds(session_id, limit=20)
            if not cached_rounds:
                # 💾 ถ้า Redis ไม่มีหรือหมดอายุ ดึงจาก Neon PostgreSQL JSONB
                cached_rounds = await pg.get_rounds(session_id, limit=20)

            live_state = redis.get_live_state(session_id) or {}
            last_round_state = (cached_rounds[-1].get("state") if cached_rounds else {}) or {}

            messages = []
            chat_history = []
            for rnd in cached_rounds:
                round_id = rnd.get("round_id", f"rnd_{rnd.get('round_number', 0)}")
                player = rnd.get("player")
                if player and player.get("text") and not player["text"].startswith("[SYSTEM]"):
                    messages.append({
                        "id": f"{round_id}_p",
                        "role": "user",
                        "content": player["text"],
                        "status": "read"
                    })
                    chat_history.append({"role": "user", "content": player["text"]})

                for seg in rnd.get("response", []):
                    seg_type = seg.get("type")
                    seg_text = seg.get("text", "")
                    seg_order = seg.get("order", 0)
                    if seg_type in ["vo_main", "vo_intimate"]:
                        messages.append({
                            "id": f"{round_id}_vo_{seg_order}",
                            "role": "vo",
                            "content": seg_text
                        })
                    elif seg_type == "action":
                        messages.append({
                            "id": f"{round_id}_act_{seg_order}",
                            "role": "ai",
                            "action": seg_text,
                            "dialogue": None
                        })
                    elif seg_type == "dialogue":
                        messages.append({
                            "id": f"{round_id}_dia_{seg_order}",
                            "role": "ai",
                            "action": None,
                            "dialogue": seg_text
                        })
                        chat_history.append({"role": "assistant", "content": seg_text})

            affection = live_state.get("affection", last_round_state.get("affection", 10))
            desire = live_state.get("desire", last_round_state.get("desire", 5))
            a_pos = live_state.get("a_pos", last_round_state.get("a_pos", "ยืน/นั่งอิสระตามบริบท"))
            p_pos = live_state.get("p_pos", last_round_state.get("p_pos", "ยืน/นั่งอิสระตามบริบท"))
            stance = live_state.get("stance", last_round_state.get("stance", "neutral"))

            return {
                "has_started": True,
                "session_id": session_id,
                "messages": messages,
                "chatHistory": chat_history,
                "activeEventId": None,
                "activeEventPhase": live_state.get("scene_id", "scene_opening"),
                "activeBeatId": live_state.get("beat_id", "beat_01"),
                "sandboxTurnCount": len(cached_rounds),
                "beatTurnCount": len(cached_rounds),
                "chaosLevel": "low",
                "currentStance": stance,
                "tensionGauge": live_state.get("tension_gauge", 0),
                "playerPosture": p_pos,
                "actorPosture": a_pos,
                "dominanceState": live_state.get("dominance_state", "NEUTRAL"),
                "actionLock": live_state.get("action_lock", False),
                "contactPoints": [],
                "worldState": {"time": "บ่าย 2 โมง", "location": "ฉากปัจจุบัน", "weather": "ปกติ"},
                "characterStats": {
                    "affection": affection,
                    "affUnlock": 20,
                    "desire": desire,
                    "desUnlock": 50,
                    "phase": 1
                }
            }

        # 2. 🌟 Fallback ไปยัง Supabase (Legacy Session)
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
        if raw_logs and raw_logs[0].get("turn_number", 0) > 1:
            initial_logs = await db.get_initial_chat_logs(session["id"])
            existing_ids = {str(log.get("id")) for log in raw_logs}
            filtered_initial = [log for log in initial_logs if str(log.get("id")) not in existing_ids]
            raw_logs = filtered_initial + raw_logs
            
        messages = []
        chat_history = []
        
        for log in raw_logs:
            role = log.get("role")
            content = log.get("message")
            action = log.get("action")
            msg_id = str(log.get("id", ""))
            
            if role == "user":
                if content and content.strip().startswith("[SYSTEM]"):
                    continue
                messages.append({"id": msg_id, "role": "user", "content": content, "status": "read"})
                chat_history.append({"role": "user", "content": content})
            elif role == "system":
                if content and ("คุณคือ " in content or "ภารกิจหลัก:" in content):
                    messages.append({"id": msg_id, "role": "intro_brief", "content": content})
                else:
                    messages.append({"id": msg_id, "role": "vo", "content": content})
            elif role == "intro_brief":
                messages.append({"id": msg_id, "role": "intro_brief", "content": content})
            elif role in ["ai", "assistant"]:
                messages.append({"id": msg_id, "role": "ai", "action": action, "dialogue": content})
                chat_history.append({"role": "assistant", "content": content})
            elif role == "director_vo":
                messages.append({"id": msg_id, "role": "vo", "content": content})
        
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
    สร้างเซฟเกมใหม่ (New Game) บน Neon PostgreSQL + Upstash Redis
    """
    user_id = request.user_id or f"gst_{uuid.uuid4()}"
    character_id = request.character_id
    world_id = request.world_id or character_id
    session_id = f"sess_{uuid.uuid4()}"

    logger.info(f"🔄 [NEW GAME] User: {user_id} starting session: {session_id} for char: {character_id}")

    try:
        # 1. 🌟 บันทึก/อัปเดตผู้ใช้ และ สร้าง Session ใน Neon PostgreSQL
        pg = get_postgres_core()
        is_guest = user_id.startswith("gst_")
        await pg.get_or_create_user(
            user_id=user_id,
            name="นักเดินทางนิรนาม" if is_guest else f"User_{user_id[-4:]}",
            is_guest=is_guest
        )

        session_record = await pg.create_game_session(
            session_id=session_id,
            user_id=user_id,
            campaign_id=world_id,
            character_id=character_id
        )

        # 2. ⚡ ล้างและเตรียมพื้นที่ใน Upstash Redis Hot Cache
        redis_cache = RedisHotCache()
        redis_cache.clear_session(session_id)

        # 3. 🚀 ดึงข้อมูลเริ่มต้นจาก World Data ใน Supabase
        db = DatabaseCore()
        target_world = world_id or character_id
        campaign = await db.get_published_campaign(target_world) if target_world else None
        
        world_data = (campaign.get("world_data") if campaign else {}) or {}
        starting_state = world_data.get("starting_state", {})
        initial_scene = world_data.get("initial_scene", {})
        char_data = (campaign.get("character_data") if campaign else {}) or {}
        appearance_data = char_data.get("appearance", {})
        raw_wardrobe = appearance_data.get("wardrobe") or char_data.get("wardrobe", {})
        
        initial_outfit = "ชุดเริ่มต้น"
        if isinstance(raw_wardrobe, dict) and raw_wardrobe:
            first_val = list(raw_wardrobe.values())[0]
            initial_outfit = ", ".join(first_val) if isinstance(first_val, list) else str(first_val)
        elif isinstance(raw_wardrobe, list) and raw_wardrobe:
            first_item = raw_wardrobe[0]
            if isinstance(first_item, dict):
                items = first_item.get("items", ["ชุดเริ่มต้น"])
                initial_outfit = ", ".join(items) if isinstance(items, list) else str(items)
            elif isinstance(first_item, str):
                initial_outfit = first_item

        initial_env = {
            "time": starting_state.get("initial_time") or initial_scene.get("time") or "14:00 น.",
            "location": starting_state.get("initial_location") or initial_scene.get("location") or world_data.get("world_name") or "สถานที่นัดพบ",
            "weather": starting_state.get("initial_weather") or initial_scene.get("weather") or "ปกติ แจ่มใส",
        }
        initial_a_pos = starting_state.get("initial_a_pos") or "ยืน/นั่งอิสระตามบริบท"
        initial_p_pos = starting_state.get("initial_p_pos") or "ยืน/นั่งอิสระตามบริบท"

        init_state = {
            "affection": 0,
            "desire": 0,
            "a_pos": initial_a_pos,
            "p_pos": initial_p_pos,
            "current_outfit": initial_outfit,
            "scene_id": starting_state.get("scene_id") or "scene_opening",
            "beat_id": starting_state.get("beat_id") or "beat_01",
            "stance": "neutral",
            "environment": initial_env
        }
        redis_cache.save_live_state(session_id, init_state)

        logger.info(f"✅ [NEW GAME READY] Session {session_id} created successfully on Neon & Redis (Affection: 0, Desire: 0, Outfit: '{initial_outfit}')")

        if request.trigger_initial_vo:
            background_tasks.add_task(
                background_initial_chat_task,
                user_id=user_id,
                character_id=character_id,
                session_id=session_id,
                world_id=world_id,
                user_message=request.initial_message or "[SYSTEM] เริ่มต้นเกม"
            )

        return {
            "status": "success",
            "session_id": session_id,
            "user_id": user_id,
            "character_id": character_id,
            "world_id": world_id,
            "initial_state": init_state,
            "initial_environment": initial_env,
            "initial_outfit": initial_outfit,
            "initial_pose": initial_a_pos,
            "message": "New game session created on Neon Postgres & Redis."
        }
    except Exception as e:
        logger.error(f"[START SESSION ERROR]: {e}")
        raise HTTPException(status_code=500, detail=str(e))
