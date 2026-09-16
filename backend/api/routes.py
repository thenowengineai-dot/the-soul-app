import os
import json
import uuid
import re
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
from genesis.redis_hot import GenesisRedisHotCache
from engine.identity import (
    build_session_id,
    generate_guest_id,
    parse_session_id,
    get_redis_session_keys,
    get_redis_character_blueprint_key,
    get_redis_user_coins_key,
)

from engine.transitions import SceneTransitionManager, resolve_world_file_path
from engine.gcs_storage import upload_base64_image

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

        # 🌟 โอนย้าย Session จาก Guest (Silent Handover ใน Redis RAM + Neon DB)
        migrated_count = 0
        if request.guest_id and request.guest_id.startswith("gst_"):
            pool = await pg.get_pool()
            async with pool.acquire() as conn:
                active_rows = await conn.fetch(
                    "SELECT id, character_id FROM game_sessions WHERE user_id = $1 AND status = 'active';",
                    request.guest_id
                )

            redis_hot = RedisHotCache()
            for row in active_rows:
                old_sid = row["id"]
                char_id = row["character_id"]
                new_sid = build_session_id(user_id, char_id)

                # 1. ⚡ Silent Handover ใน Redis RAM (~5ms)
                redis_hot.migrate_session(old_sid, new_sid, user_id)
                redis_hot.clear_active_session(request.guest_id, char_id)
                redis_hot.set_active_session(user_id, char_id, new_sid)
                redis_hot.set_session_owner(new_sid, user_id)

                # 2. 💾 ย้าย Session ใน Neon DB
                await pg.migrate_guest_session(old_sid, new_sid, user_id)
                migrated_count += 1
                logger.info(f"🔄 Silent Handover completed: {old_sid} -> {new_sid} for user: {user_id}")

            # 🪙 โอนย้ายกระเป๋าเหรียญและประวัติคูปองจาก Guest -> Member
            await pg.migrate_guest_wallet(request.guest_id, user_id)
            member_wallet = await pg.get_wallet(user_id)
            if member_wallet:
                redis_hot.set_user_coins(user_id, member_wallet["balance"])
            redis_hot.clear_user_coins(request.guest_id)

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
# 🪙 WALLET & COUPON ENDPOINTS (Neon PostgreSQL + Redis Hot Cache)
# ==========================================

class RedeemCouponRequest(BaseModel):
    user_id: str
    code: str

@router.get("/wallet/balance/{user_id}")
async def get_wallet_balance_endpoint(user_id: str):
    """
    ดึงยอดเหรียญคงเหลือของผู้ใช้ (Upstash Redis Fast Path -> Neon Postgres Fallback)
    """
    try:
        redis_hot = RedisHotCache()
        cached_coins = redis_hot.get_user_coins(user_id)

        pg = get_postgres_core()
        wallet = await pg.get_or_create_wallet(user_id)

        if cached_coins is None:
            redis_hot.set_user_coins(user_id, wallet["balance"])
            cached_coins = wallet["balance"]

        return {
            "status": "success",
            "user_id": user_id,
            "balance": wallet["balance"],
            "total_earned": wallet["total_earned"],
            "total_spent": wallet["total_spent"]
        }
    except Exception as e:
        logger.error(f"Error getting wallet balance for {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/wallet/redeem")
async def redeem_coupon_endpoint(request: RedeemCouponRequest):
    """
    แลกรับรหัสคูปองเพื่อเพิ่มเหรียญ (Atomic Transaction ป้องกันแลกเกินโควตาและแลกซ้ำ)
    """
    try:
        pg = get_postgres_core()
        result = await pg.redeem_coupon(request.user_id, request.code)

        if result.get("success"):
            redis_hot = RedisHotCache()
            redis_hot.set_user_coins(request.user_id, result["balance"])
            return {
                "status": "success",
                "message": result["message"],
                "coins_added": result.get("coins_added", 0),
                "new_balance": result.get("balance", 0)
            }
        else:
            return {
                "status": "error",
                "message": result.get("message", "ไม่สามารถแลกคูปองได้")
            }
    except Exception as e:
        logger.error(f"Error redeeming coupon for {request.user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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
    try:
        data = await request.json()
    except Exception:
        data = {}
    world_id = data.get("world_id") or request.query_params.get("world_id")
    
    # 1. ล้างแคชหน้า Hub (5 นาที) ให้เป็นศูนย์
    global HUB_CATALOG_CACHE
    HUB_CATALOG_CACHE["last_updated"] = 0
    logger.info("🧹 [CACHE CLEAR] รีเซ็ตแคชหน้า Hub เรียบร้อยแล้ว (Real-time update)")
    
    # 2. ยิงลบข้อมูลโลกใน Redis (ถ้ามีการระบุ world_id)
    if world_id:
        try:
            r_hot = GenesisRedisHotCache()
            r_hot.execute_command(["DEL", f"campaign_v3:{world_id}"])
            logger.info(f"🧹 [CACHE CLEAR] ลบ Redis Cache (v3) ของโลก {world_id} เรียบร้อยแล้ว")
        except Exception as e:
            logger.error(f"❌ [CACHE CLEAR] เกิดข้อผิดพลาดในการลบ Redis Cache: {e}")
            
    return {"status": "success", "message": "Cache cleared in real-time"}
 
# ==========================================
# ☁️ GOOGLE CLOUD STORAGE UPLOAD ENDPOINT
# ==========================================

class UploadImageRequest(BaseModel):
    image_base64: str
    user_id: Optional[str] = "anonymous"
    folder: Optional[str] = "characters"
    filename: Optional[str] = None

@router.post("/upload-image")
@router.post("/api/upload-image")
async def upload_image_endpoint(req: UploadImageRequest):
    """
    Uploads an image to Google Cloud Storage (Bucket: the-soul-media-storage).
    Returns public CDN URL to avoid database bloat and ensure cross-device consistency.
    """
    try:
        result = upload_base64_image(
            image_base64=req.image_base64,
            user_id=req.user_id,
            folder=req.folder or "characters",
            filename=req.filename
        )
        return result
    except Exception as e:
        logger.error(f"Error in /upload-image: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

def _get_postgres_world():
    try:
        from genesis.postgres_world import PostgresWorld
        return PostgresWorld()
    except ImportError:
        import sys
        current_dir = os.path.dirname(os.path.abspath(__file__))
        root_dir = os.path.dirname(os.path.dirname(current_dir))
        if root_dir not in sys.path:
            sys.path.insert(0, root_dir)
        try:
            from genesis.postgres_world import PostgresWorld
            return PostgresWorld()
        except Exception as e:
            logger.warning(f"Could not import PostgresWorld: {e}")
            return None

@router.get("/published_campaigns")
async def get_published_campaigns():
    """ดึงรายชื่อแคมเปญที่ Publish แล้วทั้งหมด จาก Neon PostgreSQL และ Upstash Redis Hot Cache (Zero Supabase)"""
    global HUB_CATALOG_CACHE
    
    # 🌟 เช็ก Cache ก่อน ถ้ายังไม่หมดอายุ (5 นาที) ให้เสิร์ฟจาก RAM ทันที (0.001 วิ)
    if HUB_CATALOG_CACHE["data"] and (time.time() - HUB_CATALOG_CACHE["last_updated"] < CACHE_TTL_SECONDS):
        logger.info("🚀 [CACHE HIT] Serving Hub Catalog from In-Memory Cache")
        return {"status": "success", "data": HUB_CATALOG_CACHE["data"], "cached": True}

    logger.info("🔄 [CACHE MISS] Fetching Hub Catalog from Neon PostgreSQL & Redis Hot Cache...")
    published_chars = []
    
    # 1. 🐘 ลองดึงจาก Neon PostgreSQL (Authoritative DB)
    try:
        pg_world = _get_postgres_world()
        if pg_world:
            published_chars = await pg_world.list_published_campaigns()
            if published_chars and len(published_chars) > 0:
                logger.info(f"✅ [NEON DB] Fetched {len(published_chars)} published campaigns from Neon DB")
    except Exception as e:
        logger.warning(f"Error fetching from Neon DB: {e}")

    # 2. ⚡ Fallback ไป Upstash Redis Hot Cache ถ้า Neon DB ยังว่างหรือ error
    if not published_chars:
        try:
            r_hot = GenesisRedisHotCache()
            pub_worlds = r_hot.execute_command(["SMEMBERS", "published_world_ids"]) or []
            seen_chars = set()
            for w_id in pub_worlds:
                camp = r_hot.get_campaign_v3(w_id)
                if not camp:
                    pg_world = _get_postgres_world()
                    if pg_world:
                        camp = await pg_world.get_published_campaign(w_id)
                if camp:
                    cdata = camp.get("character_data", {})
                    wdata = camp.get("world_data", {})
                    c_id = cdata.get("character_id") or camp.get("character_id") or w_id
                    if c_id in seen_chars:
                        continue
                    seen_chars.add(c_id)

                    avatar_url = cdata.get("avatar_url") or wdata.get("image") or ""
                    photos = [avatar_url] if avatar_url else []
                    if cdata.get("images") and isinstance(cdata.get("images"), list):
                        photos = [img for img in cdata["images"] if img]

                    starting_state = wdata.get("starting_state", {})
                    initial_env = {
                        "time": starting_state.get("time") or "ยามค่ำคืน",
                        "location": starting_state.get("location") or "ห้อง VIP บาร์หรู",
                        "weather": starting_state.get("weather") or "แอร์เย็นสบาย",
                    }
                    published_chars.append({
                        "id": w_id,
                        "character_id": c_id,
                        "name": cdata.get("name", "Unknown"),
                        "status": cdata.get("description", ""),
                        "photos": photos,
                        "hashtags": cdata.get("hashtags", []),
                        "age": "25",
                        "distance": "1 km",
                        "default_world": w_id,
                        "background_story": cdata.get("background_story", []),
                        "core_stats": cdata.get("core_stats", {}),
                        "stats": cdata.get("core_stats", {}),
                        "initial_environment": initial_env,
                        "initial_outfit": starting_state.get("initial_outfit_key", "ชุดเริ่มต้น"),
                        "initial_pose": starting_state.get("initial_a_pos", "ยืนตรงหน้า"),
                        "memories": [],
                        "comments": []
                    })
            if published_chars:
                logger.info(f"⚡ [REDIS HOT CACHE] Fetched {len(published_chars)} published campaigns from Redis")
        except Exception as e:
            logger.warning(f"Error fetching from Redis Hot Cache: {e}")

    # 3. 📂 Local Fallback ถ้ายังไม่มี ให้โหลดจาก local files
    if not published_chars:
        base_dir = os.path.join(os.path.dirname(__file__), "..", "data")
        baisom_char_file = os.path.join(base_dir, "characters", "char_1788786310.json")
        baisom_world_file = os.path.join(base_dir, "worlds", "world_1788786310.json")
        if os.path.exists(baisom_char_file) and os.path.exists(baisom_world_file):
            try:
                with open(baisom_char_file, "r", encoding="utf-8") as f:
                    cdata = json.load(f)
                with open(baisom_world_file, "r", encoding="utf-8") as f:
                    wdata = json.load(f)
                starting_state = wdata.get("starting_state", {})
                published_chars.append({
                    "id": "world_1788786310",
                    "character_id": "char_1788786310",
                    "name": cdata.get("name", "ใบส้ม (Baisom)"),
                    "status": cdata.get("description", ""),
                    "photos": [cdata.get("avatar_url", "")],
                    "hashtags": cdata.get("hashtags", []),
                    "age": "25",
                    "distance": "1 km",
                    "default_world": "world_1788786310",
                    "background_story": cdata.get("background_story", []),
                    "core_stats": cdata.get("core_stats", {}),
                    "stats": cdata.get("core_stats", {}),
                    "initial_environment": {
                        "time": starting_state.get("time", "ยามค่ำคืน"),
                        "location": starting_state.get("location", "VIP Bar"),
                        "weather": starting_state.get("weather", "แอร์เย็นสบาย"),
                    },
                    "initial_outfit": "cherry_night_shift",
                    "initial_pose": starting_state.get("initial_a_pos", "ยืนตรงหน้าของ [PLAYER] โดยมีโต๊ะคั่นกลาง"),
                    "memories": [],
                    "comments": []
                })
                logger.info("📂 [LOCAL FALLBACK] Loaded published campaign from local data files")
            except Exception as e:
                logger.error(f"Error loading local fallback: {e}")

    # อัปเดต In-Memory RAM Cache
    if published_chars:
        HUB_CATALOG_CACHE["data"] = published_chars
        HUB_CATALOG_CACHE["last_updated"] = time.time()
        return {"status": "success", "data": published_chars, "cached": False}
    elif HUB_CATALOG_CACHE["data"]:
        return {"status": "success", "data": HUB_CATALOG_CACHE["data"], "cached": True, "stale": True}

    return {"status": "success", "data": [], "cached": False}

@router.get("/characters/{character_id}")
async def get_character_profile(character_id: str):
    """ส่งข้อมูลโปรไฟล์ตัวละครให้ Frontend เอาไปจัด UI (Neon & Redis First)"""
    data = None
    # 1. ลองหาจาก Upstash Redis Hot Cache ก่อน
    try:
        from genesis.redis_hot import GenesisRedisHotCache
        redis_gen = GenesisRedisHotCache()
        data = redis_gen.get_character_data(character_id)
        if not data:
            camp = redis_gen.get_campaign_v3(character_id)
            if camp and camp.get("character_data"):
                data = camp.get("character_data")
    except Exception as e:
        logger.warning(f"Failed to fetch character {character_id} from Redis: {e}")

    # 2. ลองหาจาก Neon PostgreSQL
    if not data:
        try:
            from genesis.postgres_world import PostgresWorld
            pw = PostgresWorld()
            pool = await pw.get_pool()
            async with pool.acquire() as conn:
                row = await conn.fetchrow("""
                    SELECT ch.character_data, ch.avatar_url, ch.name
                    FROM world_characters ch
                    WHERE ch.id = $1;
                """, character_id)
                if not row:
                    row = await conn.fetchrow("""
                        SELECT ch.character_data, ch.avatar_url, ch.name
                        FROM world_campaigns c
                        LEFT JOIN world_characters ch ON c.character_id = ch.id
                        WHERE c.id = $1;
                    """, character_id)
                if row and row["character_data"]:
                    cdata = row["character_data"]
                    if isinstance(cdata, str):
                        try:
                            cdata = json.loads(cdata)
                        except Exception:
                            cdata = {}
                    data = cdata
                    if row["avatar_url"] and "avatar_url" not in data:
                        data["avatar_url"] = row["avatar_url"]
        except Exception as e:
            logger.warning(f"Failed to fetch character {character_id} from Neon: {e}")

    # 3. Fallback ไปหาไฟล์ Local เผื่อเป็นตัวละครแบบ Static
    if not data:
        file_path = f"data/characters/{character_id}.json"
        if not os.path.exists(file_path) and character_id == "may_base":
            file_path = "data/characters/may.json"
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        else:
            raise HTTPException(status_code=404, detail="Character not found")

    return {
        "character_id": data.get("character_id", character_id),
        "name": data.get("name"),
        "archetype": data.get("archetype"),
        "description": data.get("description", ""),
        "hashtags": data.get("hashtag_dna", data.get("hashtags", [])),
        "current_phase": data.get("current_phase", 1),
        "avatar_url": data.get("avatar_url"),
        "reference_urls": data.get("reference_urls", []),
        "background_story": data.get("background_story", []),
        "core_stats": data.get("core_stats", {})
    }

@router.get("/worlds/{world_id}")
async def get_world_data(world_id: str):
    """ส่งข้อมูลฉากเริ่มต้น ระบบสภาพอากาศ และ Event ให้ Frontend (Neon & Redis First)"""
    # 1. Upstash Redis Hot Cache
    try:
        from genesis.redis_hot import GenesisRedisHotCache
        redis_gen = GenesisRedisHotCache()
        wdata = redis_gen.get_world_data(world_id)
        if wdata:
            return wdata
        camp = redis_gen.get_campaign_v3(world_id)
        if camp and camp.get("world_data"):
            return camp.get("world_data")
    except Exception as e:
        logger.warning(f"Failed to fetch world {world_id} from Redis: {e}")

    # 2. Neon PostgreSQL
    try:
        from genesis.postgres_world import PostgresWorld
        pw = PostgresWorld()
        pool = await pw.get_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("SELECT world_data FROM world_campaigns WHERE id = $1;", world_id)
            if row and row["world_data"]:
                wdata = row["world_data"]
                if isinstance(wdata, str):
                    try:
                        wdata = json.loads(wdata)
                    except Exception:
                        wdata = {}
                return wdata
    except Exception as e:
        logger.warning(f"Failed to fetch world {world_id} from Neon: {e}")

    # 3. Fallback ไปหาไฟล์ Local
    file_path = f"data/worlds/{world_id}.json"
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)

    raise HTTPException(status_code=404, detail="World not found")


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
        # 1. โหลดข้อมูลตัวละคร (JSON) เต็มรูปแบบสำหรับใช้ใน Engine (Redis Hot Cache & Neon First)
        character_data = None
        campaign = None
        target_world = request.world_id or request.character_id
        try:
            from genesis.redis_hot import GenesisRedisHotCache
            redis_gen = GenesisRedisHotCache()
            if target_world:
                camp = redis_gen.get_campaign_v3(target_world)
                if camp:
                    campaign = camp
                    if camp.get("character_data"):
                        character_data = camp.get("character_data")
            if not character_data:
                character_data = redis_gen.get_character_data(request.character_id)
        except Exception as e:
            logger.warning(f"Redis char fetch in chat_endpoint: {e}")

        if not character_data and target_world:
            try:
                from genesis.postgres_world import PostgresWorld
                pw = PostgresWorld()
                camp = await pw.get_published_campaign(target_world)
                if camp:
                    campaign = camp
                    if camp.get("character_data"):
                        character_data = camp.get("character_data")
            except Exception as e:
                logger.warning(f"Neon char fetch in chat_endpoint: {e}")

        if not character_data:
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

        # ⚡ [DETERMINISTIC SESSION] ถ้าไม่ได้ส่ง session_id มา ให้คำนวณแบบ Deterministic ses_{user_id}_{char_id}
        if not request.session_id and request.user_id and request.character_id:
            request.session_id = build_session_id(request.user_id, request.character_id)

        # 🔒 [SECURITY CHECK] ตรวจสอบสิทธิ์ความเป็นเจ้าของ Session (IDOR Protection)
        if request.session_id and request.user_id:
            redis_hot = RedisHotCache()
            owner = redis_hot.get_session_owner(request.session_id)
            if not owner:
                pg_check = get_postgres_core()
                session_rec = await pg_check.get_game_session(request.session_id)
                if session_rec and session_rec.get("user_id"):
                    owner = session_rec["user_id"]
                    redis_hot.set_session_owner(request.session_id, owner)
                elif not session_rec:
                    # ⚡ [ZERO-HANDSHAKE] Auto-init session in DB on first turn
                    target_campaign = request.world_id or request.character_id
                    await pg_check.create_game_session(
                        session_id=request.session_id,
                        user_id=request.user_id,
                        campaign_id=target_campaign,
                        character_id=request.character_id
                    )
                    owner = request.user_id
                    redis_hot.set_active_session(request.user_id, request.character_id, request.session_id)
                    redis_hot.set_session_owner(request.session_id, owner)

            if owner and owner != request.user_id:
                logger.warning(f"🚨 [UNAUTHORIZED CHAT] User {request.user_id} attempted unauthorized access to session {request.session_id} belonging to {owner}")
                raise HTTPException(status_code=403, detail="Unauthorized session access")

        # 🪙 [TOKEN ECONOMY PRE-FLIGHT GATE] ตรวจสอบเหรียญก่อนส่งเข้าโมเดล AI (< 2ms)
        COIN_COST_PER_ROUND = 10
        if request.user_id:
            redis_hot = RedisHotCache()
            cached_coins = redis_hot.get_user_coins(request.user_id)
            if cached_coins is None:
                pg_wallet = get_postgres_core()
                wallet = await pg_wallet.get_or_create_wallet(request.user_id)
                cached_coins = wallet.get("balance", 0)
                redis_hot.set_user_coins(request.user_id, cached_coins)

            if cached_coins < COIN_COST_PER_ROUND:
                logger.warning(f"🚫 [TOKEN GATE BLOCKED] User {request.user_id} has insufficient coins: {cached_coins} < {COIN_COST_PER_ROUND}")
                raise HTTPException(
                    status_code=402,
                    detail={
                        "code": "INSUFFICIENT_COINS",
                        "message": f"เหรียญไม่เพียงพอสำหรับการสนทนา (ต้องการ {COIN_COST_PER_ROUND} เหรียญ/รอบ) กรุณากรอกรหัสคูปองเพื่อรับเหรียญเพิ่ม",
                        "balance": cached_coins,
                        "required": COIN_COST_PER_ROUND
                    }
                )
        
        # 👑 [ROLE & PERMISSION GATING] ตรวจสอบสิทธิ์ Admin / Creator
        user_role = "player"
        is_creator = False
        if request.user_id:
            pg = get_postgres_core()
            user_rec = await pg.get_user(request.user_id)
            user_email = (user_rec.get("email") or "").lower() if user_rec else ""
            ADMIN_EMAILS = set(filter(None, [
                e.strip().lower() for e in os.getenv("ADMIN_EMAILS", "aliceer@gmail.com,admin@maomoi.ai,traveler@gmail.com").split(",")
            ]))
            if (
                user_email in ADMIN_EMAILS or 
                user_email.startswith("aliceer") or 
                request.user_id.startswith("usr_admin_") or
                request.user_id.startswith("gst_") or
                os.getenv("ENVIRONMENT", "development") != "production"
            ):
                user_role = "admin"
                is_creator = True
            elif campaign and campaign.get("creator_id") and campaign.get("creator_id") == request.user_id:
                user_role = "creator"
                is_creator = True
            elif character_data and character_data.get("creator_id") == request.user_id:
                user_role = "creator"
                is_creator = True
            elif request.user_id.startswith("usr_creator_"):
                # Creator ทดสอบโลกของตัวเองใน Production/Staging environment (เห็นเฉพาะเควสต์/บีท ไม่เห็น Prompt)
                user_role = "creator"
                is_creator = True

        logger.info(f"🛡️ [SECURITY GATE] User: {request.user_id} | Role: {user_role} | is_creator: {is_creator}")

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
            is_regenerate=request.is_regenerate,
            user_role=user_role,
            is_creator=is_creator
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
        logger.info(f"🔄 [API] Fetching all active sessions summary from Neon DB for user_id: {user_id}")
        pg = get_postgres_core()
        summaries = await pg.get_user_active_sessions_summary(user_id)
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
        pg = get_postgres_core()
        sessions = await pg.get_user_sessions_by_character(user_id, character_id)
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
        session_id = build_session_id(user_id, character_id)
        
        # 1. Archive in Neon DB
        pg = get_postgres_core()
        await pg.archive_session(session_id)

        # 2. Clear Redis cache
        redis_hot = RedisHotCache()
        redis_hot.clear_session(session_id)
        redis_hot.clear_active_session(user_id, character_id)

        return {"status": "success", "message": "Session archived"}
    except Exception as e:
        logger.error(f"Error archiving session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/load_session")
async def load_session_endpoint(request: LoadSessionRequest):
    """
    ดึงข้อมูล Session และประวัติการแชทเก่ากลับมาแสดงผลที่หน้าบ้าน
    ลำดับการดึง:
    1. ⚡ Fast Path: ตรวจสอบ Upstash Redis Index & Hot Cache ก่อน (0.001s)
    2. 🐢 Cold Path Fallback: ตรวจสอบ Neon PostgreSQL JSONB
    3. 🌟 Legacy Fallback: ไปยัง Supabase เดิม
    """
    try:
        # 1. 🌟 ตรวจสอบ Upstash Redis Hot Cache & Neon PostgreSQL
        pg = get_postgres_core()
        redis = RedisHotCache()

        user_id = (request.user_id or "").strip()
        character_id = (request.character_id or "").strip()
        session_id = request.session_id

        # ⚡ Deterministic Session ID
        if not session_id and user_id and character_id:
            session_id = build_session_id(user_id, character_id)

        cached_rounds = None
        live_state = None
        neon_session = None

        # ⚡ FAST PATH 1: Single Pipeline Round-Trip to Upstash Redis (~2ms)
        if session_id:
            bundle = redis.get_session_bundle(session_id, limit=20)
            if bundle and bundle.get("has_started"):
                session_owner = bundle.get("owner")
                # 🔒 ตรวจสอบสิทธิ์ IDOR
                if user_id and session_owner and session_owner != user_id:
                    logger.warning(f"🚨 [UNAUTHORIZED LOAD] User {user_id} attempted to load session {session_id} belonging to {session_owner}")
                    raise HTTPException(status_code=403, detail="Unauthorized session access")

                cached_rounds = bundle.get("rounds", [])
                live_state = bundle.get("state", {})
                logger.info(f"⚡ [FAST PATH HIT] Loaded session bundle ({len(cached_rounds)} rounds) in ~2ms from Redis: {session_id}")

        # 🐢 COLD PATH FALLBACK: ถ้าไม่มีใน Redis ให้ค้นหาจาก Neon PostgreSQL
        if not cached_rounds and session_id:
            neon_session = await pg.get_game_session(session_id)
            if not neon_session and user_id and character_id:
                pool = await pg.get_pool()
                async with pool.acquire() as conn:
                    row = await conn.fetchrow("""
                        SELECT * FROM game_sessions 
                        WHERE user_id = $1 AND character_id = $2 AND status = 'active'
                        ORDER BY updated_at DESC LIMIT 1;
                    """, user_id, character_id)
                    if row:
                        neon_session = dict(row)

            if neon_session:
                # 🔒 ตรวจสอบสิทธิ์ IDOR จาก Neon
                if user_id and neon_session.get("user_id") and neon_session["user_id"] != user_id:
                    logger.warning(f"🚨 [UNAUTHORIZED LOAD] User {user_id} attempted to load session {neon_session['id']} belonging to {neon_session['user_id']}")
                    raise HTTPException(status_code=403, detail="Unauthorized session access")

                session_id = neon_session["id"]
                # 🌟 บันทึก Index และ Owner ลง Redis ทันที เพื่อให้รอบถัดไปเป็น Fast Path 2ms!
                redis.set_active_session(neon_session["user_id"], neon_session["character_id"], session_id)
                redis.set_session_owner(session_id, neon_session["user_id"])

                cached_rounds = await pg.get_rounds(session_id, limit=20)
                if live_state is None:
                    live_state = redis.get_live_state(session_id) or {}

        if session_id and cached_rounds is not None:
            last_round_state = (cached_rounds[-1].get("state") if cached_rounds else {}) or {}
            live_state = live_state or {}

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
                "activeEventId": live_state.get("active_event_id") or last_round_state.get("active_event_id") or (neon_session.get("active_event_id") if neon_session else None),
                "activeSceneId": live_state.get("active_scene_id") or live_state.get("scene_id") or last_round_state.get("active_phase_id") or (neon_session.get("active_phase_id") if neon_session else None),
                "activeEventPhase": live_state.get("active_scene_id") or live_state.get("active_phase_id") or last_round_state.get("active_phase_id") or live_state.get("scene_id") or (neon_session.get("active_phase_id") if neon_session else None),
                "activeBeatId": live_state.get("active_beat_id") or last_round_state.get("active_beat_id") or live_state.get("beat_id") or (neon_session.get("active_beat_id") if neon_session else None),
                "sandboxTurnCount": live_state.get("sandbox_turn_count") or last_round_state.get("sandbox_turn_count", len(cached_rounds)),
                "beatTurnCount": live_state.get("beat_turn_count") or last_round_state.get("beat_turn_count", len(cached_rounds)),
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

        # 2. หากไม่มีใน Redis RAM และไม่มีใน Neon DB ให้ถือว่ายังไม่เคยมี Session
        return {"has_started": False, "session_id": session_id, "messages": []}
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
        character_data = None
        try:
            from genesis.redis_hot import GenesisRedisHotCache
            redis_gen = GenesisRedisHotCache()
            if world_id:
                camp = redis_gen.get_campaign_v3(world_id)
                if camp and camp.get("character_data"):
                    character_data = camp.get("character_data")
            if not character_data:
                character_data = redis_gen.get_character_data(character_id)
        except Exception as e:
            logger.warning(f"Redis char fetch in background_initial_chat_task: {e}")

        if not character_data and world_id:
            try:
                from genesis.postgres_world import PostgresWorld
                pw = PostgresWorld()
                pool = await pw.get_pool()
                async with pool.acquire() as conn:
                    row = await conn.fetchrow("""
                        SELECT ch.character_data
                        FROM world_characters ch
                        WHERE ch.id = $1;
                    """, character_id)
                    if not row:
                        row = await conn.fetchrow("""
                            SELECT ch.character_data
                            FROM world_campaigns c
                            LEFT JOIN world_characters ch ON c.character_id = ch.id
                            WHERE c.id = $1;
                        """, world_id)
                    if row and row["character_data"]:
                        cdata = row["character_data"]
                        character_data = cdata if isinstance(cdata, dict) else json.loads(cdata)
            except Exception as e:
                logger.warning(f"Neon char fetch in background_initial_chat_task: {e}")

        if not character_data:
            file_path = f"data/characters/{character_id}.json"
            if not os.path.exists(file_path) and character_id == "may_base":
                file_path = "data/characters/may.json"
            if os.path.exists(file_path):
                with open(file_path, "r", encoding="utf-8") as f:
                    character_data = json.load(f)
            else:
                character_data = {}
                    
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
    user_id = (request.user_id or "").strip() or generate_guest_id()
    character_id = request.character_id.strip()
    raw_world_id = request.world_id or character_id
    resolved_world_id, world_file_path = resolve_world_file_path(raw_world_id)
    session_id = build_session_id(user_id, character_id)

    logger.info(f"🔄 [NEW GAME] User: {user_id} starting session: {session_id} for char: {character_id} (World: {resolved_world_id})")

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
            campaign_id=resolved_world_id,
            character_id=character_id
        )
        # ล้างประวัติรอบเดิมใน Neon PostgreSQL เพื่อความสะอาดสำหรับ New Game
        await pg.clear_session_rounds(session_id)

        # 2. ⚡ ล้างและเตรียมพื้นที่ใน Upstash Redis Hot Cache พร้อมบันทึก Active Index & Owner
        redis_cache = RedisHotCache()
        redis_cache.clear_session(session_id)
        redis_cache.set_active_session(user_id, character_id, session_id)
        redis_cache.set_session_owner(session_id, user_id)

        # 3. 🚀 ดึงข้อมูลเริ่มต้นจาก World Data ใน Redis Hot Cache, Neon หรือ Local World File
        world_data = None
        char_data = None
        try:
            from genesis.redis_hot import GenesisRedisHotCache
            redis_gen = GenesisRedisHotCache()
            camp = redis_gen.get_campaign_v3(resolved_world_id)
            if camp:
                world_data = camp.get("world_data")
                char_data = camp.get("character_data")
            if not world_data:
                world_data = redis_gen.get_world_data(resolved_world_id)
            if not char_data:
                char_data = redis_gen.get_character_data(character_id)
        except Exception as e:
            logger.warning(f"Redis campaign fetch in start_session: {e}")

        if not world_data:
            try:
                from genesis.postgres_world import PostgresWorld
                pw = PostgresWorld()
                pool = await pw.get_pool()
                async with pool.acquire() as conn:
                    row = await conn.fetchrow("""
                        SELECT c.world_data, ch.character_data
                        FROM world_campaigns c
                        LEFT JOIN world_characters ch ON c.character_id = ch.id
                        WHERE c.id = $1;
                    """, resolved_world_id)
                    if row:
                        if row["world_data"]:
                            world_data = row["world_data"] if isinstance(row["world_data"], dict) else json.loads(row["world_data"])
                        if row["character_data"]:
                            char_data = row["character_data"] if isinstance(row["character_data"], dict) else json.loads(row["character_data"])
            except Exception as e:
                logger.warning(f"Neon campaign fetch in start_session: {e}")

        if not world_data and os.path.exists(world_file_path):
            try:
                with open(world_file_path, "r", encoding="utf-8") as f:
                    world_data = json.load(f)
            except Exception as e:
                logger.warning(f"Failed to load fallback world file {world_file_path}: {e}")

        if not char_data:
            char_file_path = f"data/characters/{character_id}.json"
            if os.path.exists(char_file_path):
                try:
                    with open(char_file_path, "r", encoding="utf-8") as f:
                        char_data = json.load(f)
                except Exception as e:
                    logger.warning(f"Failed to load fallback char file {char_file_path}: {e}")

        world_data = world_data or {}
        char_data = char_data or {}
        starting_state = world_data.get("starting_state", {}) or {}
        initial_scene = world_data.get("initial_scene", {}) or {}
        appearance_data = char_data.get("appearance", {})
        raw_wardrobe = appearance_data.get("wardrobe") or char_data.get("wardrobe", {})
        target_outfit_key = starting_state.get("initial_outfit_key")
        
        initial_outfit = "ชุดเริ่มต้น"
        if isinstance(raw_wardrobe, dict) and raw_wardrobe:
            matched_items = raw_wardrobe.get(target_outfit_key) if target_outfit_key else None
            if not matched_items and target_outfit_key:
                clean_target = re.sub(r'[\s/_]+', '', str(target_outfit_key).lower())
                for k, v in raw_wardrobe.items():
                    if re.sub(r'[\s/_]+', '', str(k).lower()) == clean_target:
                        matched_items = v
                        break
            if not matched_items:
                matched_items = list(raw_wardrobe.values())[0]
            initial_outfit = ", ".join(matched_items) if isinstance(matched_items, list) else str(matched_items)
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

        # 🌟 ดึง opening scenario แรกเพื่อหา scene_id และ beat_id จริง (Modern Scene Architecture)
        first_event_id = None
        first_scene_id = None
        first_beat_id = None
        opening_scenarios = world_data.get("opening_scenarios") or []
        if opening_scenarios:
            first_event = opening_scenarios[0]
            first_event_id = first_event.get("id")
            first_scene_id, first_beat_id = SceneTransitionManager.get_first_scene_and_beat(first_event)

        init_state = {
            "affection": 0,
            "desire": 0,
            "a_pos": initial_a_pos,
            "p_pos": initial_p_pos,
            "current_outfit": initial_outfit,
            "scene_id": first_scene_id or starting_state.get("scene_id") or "scene_opening",
            "beat_id": first_beat_id or starting_state.get("beat_id") or "beat_01",
            "active_event_id": first_event_id,
            "active_scene_id": first_scene_id,
            "active_phase_id": first_scene_id,
            "active_beat_id": first_beat_id,
            "stance": "neutral",
            "environment": initial_env
        }
        redis_cache.save_live_state(session_id, init_state)

        logger.info(f"✅ [NEW GAME READY] Session {session_id} created successfully on Neon & Redis (Event: {first_event_id}, Scene: {first_scene_id}, Beat: {first_beat_id})")

        if request.trigger_initial_vo:
            background_tasks.add_task(
                background_initial_chat_task,
                user_id=user_id,
                character_id=character_id,
                session_id=session_id,
                world_id=resolved_world_id,
                user_message=request.initial_message or "[SYSTEM] เริ่มต้นเกม"
            )

        return {
            "status": "success",
            "session_id": session_id,
            "user_id": user_id,
            "character_id": character_id,
            "world_id": resolved_world_id,
            "initial_state": init_state,
            "initial_environment": initial_env,
            "initial_outfit": initial_outfit,
            "initial_pose": initial_a_pos,
            "message": "New game session created on Neon Postgres & Redis."
        }
    except Exception as e:
        logger.error(f"[START SESSION ERROR]: {e}")
        raise HTTPException(status_code=500, detail=str(e))
