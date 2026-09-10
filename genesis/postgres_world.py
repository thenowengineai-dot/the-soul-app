import os
import json
import time
import logging
from typing import Dict, Any, List, Optional
import asyncpg

logger = logging.getLogger("POSTGRES_WORLD")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s - \033[96m[WORLD_DB]\033[0m - %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class PostgresWorld:
    """
    Asynchronous PostgreSQL Adapter for World Creator & The Genesis Engine
    --------------------------------------------------------------------
    Manages persistent storage on Neon Serverless PostgreSQL for:
    1. world_campaigns (World JSONB Lore, Scenarios, Locations, Spawns)
    2. world_characters (Character JSONB Personas, Kinematics, Dialogue)
    3. the_muse_conversations (The Muse Chat History & Scratchpad JSONB)
    """

    _pool: Optional[asyncpg.Pool] = None

    def __init__(self, database_url: Optional[str] = None):
        raw_url = database_url or os.getenv("DATABASE_URL", "")
        if not raw_url:
            self._load_env_fallback()
            raw_url = os.getenv("DATABASE_URL", "")

        self.database_url = raw_url.strip("\"'")
        if self.database_url:
            self.clean_url = self.database_url.split("?")[0]
        else:
            self.clean_url = ""
            logger.warning("DATABASE_URL not found for PostgresWorld.")

    def _load_env_fallback(self):
        env_paths = [
            os.path.join(os.getcwd(), ".env"),
            os.path.join(os.path.dirname(__file__), ".env"),
            os.path.join(os.path.dirname(__file__), "..", ".env"),
            os.path.join(os.path.dirname(__file__), "..", "backend", ".env"),
        ]
        for path in env_paths:
            if os.path.exists(path):
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        for line in f:
                            line = line.strip()
                            if line.startswith("#") or "=" not in line:
                                continue
                            k, v = line.split("=", 1)
                            os.environ[k.strip()] = v.strip().strip("\"'")
                except Exception as e:
                    logger.warning(f"Failed to read fallback .env from {path}: {e}")

    async def get_pool(self) -> asyncpg.Pool:
        """Lazily initializes and returns the connection pool."""
        if PostgresWorld._pool is None or PostgresWorld._pool._closed:
            if not self.clean_url:
                raise RuntimeError("DATABASE_URL is not configured.")
            logger.info("Initializing Neon PostgreSQL asyncpg pool for World Engine...")
            PostgresWorld._pool = await asyncpg.create_pool(
                self.clean_url,
                ssl="require",
                min_size=1,
                max_size=10,
                command_timeout=30.0
            )
            logger.info("✅ Neon PostgreSQL pool ready for World Engine.")
        return PostgresWorld._pool

    async def close_pool(self):
        """Gracefully closes connection pool."""
        if PostgresWorld._pool and not PostgresWorld._pool._closed:
            await PostgresWorld._pool.close()
            logger.info("PostgresWorld pool closed.")

    # =========================================================================
    # 🌍 World & Character Draft Operations
    # =========================================================================

    async def save_draft(
        self,
        world_id: str,
        creator_id: str,
        name: str,
        world_data: Dict[str, Any],
        character_data: Dict[str, Any],
        workspace_meta: Dict[str, Any]
    ) -> str:
        """Saves or updates a draft world and character as JSONB in Neon Postgres."""
        pool = await self.get_pool()
        character_id = character_data.get("character_id") or f"char_{int(time.time())}"
        character_data["character_id"] = character_id
        char_name = character_data.get("name") or name or "Unknown Character"

        avatar_url = (
            workspace_meta.get("character_image_base64")
            or character_data.get("avatar_url")
            or ""
        )

        async with pool.acquire() as conn:
            async with conn.transaction():
                # 0. Ensure creator user exists in users table
                await conn.execute("""
                    INSERT INTO users (id, name, is_guest, created_at, updated_at)
                    VALUES ($1, 'Creator', TRUE, NOW(), NOW())
                    ON CONFLICT (id) DO NOTHING;
                """, creator_id)

                # 1. Upsert world_characters
                await conn.execute("""
                    INSERT INTO world_characters (id, creator_id, name, avatar_url, status, character_data, updated_at)
                    VALUES ($1, $2, $3, $4, 'draft', $5::jsonb, NOW())
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), world_characters.avatar_url),
                        character_data = EXCLUDED.character_data,
                        updated_at = NOW();
                """, character_id, creator_id, char_name, avatar_url, json.dumps(character_data, ensure_ascii=False))

                # 2. Upsert world_campaigns
                await conn.execute("""
                    INSERT INTO world_campaigns (id, creator_id, name, character_id, status, world_data, workspace_meta, updated_at)
                    VALUES ($1, $2, $3, $4, 'draft', $5::jsonb, $6::jsonb, NOW())
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        character_id = EXCLUDED.character_id,
                        world_data = EXCLUDED.world_data,
                        workspace_meta = EXCLUDED.workspace_meta,
                        updated_at = NOW();
                """, world_id, creator_id, name, character_id, json.dumps(world_data, ensure_ascii=False), json.dumps(workspace_meta, ensure_ascii=False))

        logger.info(f"💾 [WORLD_DB] Saved draft {world_id} (Char: {character_id}) for creator {creator_id}")
        return world_id

    async def load_draft(self, world_id: str, creator_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Loads a draft world and linked character data."""
        pool = await self.get_pool()
        async with pool.acquire() as conn:
            if creator_id:
                row = await conn.fetchrow("""
                    SELECT wc.*, wc.character_id as linked_char_id, ch.character_data, ch.avatar_url as char_avatar
                    FROM world_campaigns wc
                    LEFT JOIN world_characters ch ON wc.character_id = ch.id
                    WHERE wc.id = $1 AND wc.creator_id = $2;
                """, world_id, creator_id)
            else:
                row = await conn.fetchrow("""
                    SELECT wc.*, wc.character_id as linked_char_id, ch.character_data, ch.avatar_url as char_avatar
                    FROM world_campaigns wc
                    LEFT JOIN world_characters ch ON wc.character_id = ch.id
                    WHERE wc.id = $1;
                """, world_id)

            if not row:
                return None

            world_data = row["world_data"]
            if isinstance(world_data, str):
                world_data = json.loads(world_data)

            workspace_meta = row["workspace_meta"]
            if isinstance(workspace_meta, str):
                workspace_meta = json.loads(workspace_meta)

            character_data = row["character_data"] or {}
            if isinstance(character_data, str):
                character_data = json.loads(character_data)

            if row["char_avatar"] and not character_data.get("avatar_url"):
                character_data["avatar_url"] = row["char_avatar"]

            return {
                "world_id": row["id"],
                "name": row["name"],
                "status": row["status"],
                "creator_id": row["creator_id"],
                "character_id": row["character_id"],
                "world_data": world_data,
                "character_data": character_data,
                "linked_character": character_data,
                "workspace_meta": workspace_meta,
                "created_at": row["created_at"].isoformat() if row["created_at"] else None,
                "updated_at": row["updated_at"].isoformat() if row["updated_at"] else None,
            }

    async def list_user_drafts(self, creator_id: str) -> List[Dict[str, Any]]:
        """Lists all draft and published worlds for a given creator."""
        pool = await self.get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT wc.id, wc.name, wc.character_id, wc.status, wc.created_at, wc.updated_at,
                       wc.workspace_meta, ch.name as character_name, ch.avatar_url
                FROM world_campaigns wc
                LEFT JOIN world_characters ch ON wc.character_id = ch.id
                WHERE wc.creator_id = $1
                ORDER BY wc.updated_at DESC;
            """, creator_id)

            drafts = []
            for r in rows:
                meta = r["workspace_meta"]
                if isinstance(meta, str):
                    try:
                        meta = json.loads(meta)
                    except Exception:
                        meta = {}

                avatar = r["avatar_url"] or meta.get("character_image_base64") or ""
                drafts.append({
                    "id": r["id"],
                    "title": r["character_name"] or r["name"] or "Untitled",
                    "worldTitle": r["name"] or "Untitled World",
                    "character_id": r["character_id"],
                    "status": r["status"],
                    "avatar_url": avatar,
                    "image": avatar,
                    "createdAt": r["created_at"].strftime("%Y-%m-%d %H:%M") if r["created_at"] else "วันนี้",
                    "updatedAt": r["updated_at"].strftime("%Y-%m-%d %H:%M") if r["updated_at"] else "เมื่อสักครู่",
                    "workspace_meta": meta
                })
            return drafts

    async def delete_draft(self, world_id: str, creator_id: Optional[str] = None) -> bool:
        """Deletes a world campaign and its Muse conversation."""
        pool = await self.get_pool()
        async with pool.acquire() as conn:
            async with conn.transaction():
                # Check character_id first
                row = await conn.fetchrow("SELECT character_id FROM world_campaigns WHERE id = $1;", world_id)
                char_id = row["character_id"] if row else None

                if creator_id:
                    res = await conn.execute(
                        "DELETE FROM world_campaigns WHERE id = $1 AND creator_id = $2;",
                        world_id, creator_id
                    )
                else:
                    res = await conn.execute("DELETE FROM world_campaigns WHERE id = $1;", world_id)

                await conn.execute("DELETE FROM the_muse_conversations WHERE draft_id = $1;", world_id)

                if char_id:
                    # Optional: clean up character if not referenced by other campaigns
                    await conn.execute("DELETE FROM world_characters WHERE id = $1;", char_id)

                return "DELETE" in res

    async def publish_draft(self, world_id: str, creator_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Sets status to published for world and character, returning data for Hot Cache."""
        pool = await self.get_pool()
        async with pool.acquire() as conn:
            async with conn.transaction():
                if creator_id:
                    row = await conn.fetchrow("""
                        UPDATE world_campaigns 
                        SET status = 'published', updated_at = NOW() 
                        WHERE id = $1 AND creator_id = $2
                        RETURNING *;
                    """, world_id, creator_id)
                else:
                    row = await conn.fetchrow("""
                        UPDATE world_campaigns 
                        SET status = 'published', updated_at = NOW() 
                        WHERE id = $1
                        RETURNING *;
                    """, world_id)

                if not row:
                    return None

                char_id = row["character_id"]
                char_row = None
                if char_id:
                    char_row = await conn.fetchrow("""
                        UPDATE world_characters
                        SET status = 'published', updated_at = NOW()
                        WHERE id = $1
                        RETURNING *;
                    """, char_id)

                world_data = row["world_data"]
                if isinstance(world_data, str):
                    world_data = json.loads(world_data)

                char_data = char_row["character_data"] if char_row else {}
                if isinstance(char_data, str):
                    char_data = json.loads(char_data)

                logger.info(f"🚀 [WORLD_DB] Published campaign {world_id} and character {char_id}")
                return {
                    "world_id": world_id,
                    "character_id": char_id,
                    "world_data": world_data,
                    "character_data": char_data,
                    "avatar_url": char_row["avatar_url"] if char_row else None
                }

    async def unpublish_draft(self, world_id: str, creator_id: Optional[str] = None) -> bool:
        """Reverts published world and character back to draft."""
        pool = await self.get_pool()
        async with pool.acquire() as conn:
            async with conn.transaction():
                if creator_id:
                    row = await conn.fetchrow("""
                        UPDATE world_campaigns 
                        SET status = 'draft', updated_at = NOW() 
                        WHERE id = $1 AND creator_id = $2
                        RETURNING character_id;
                    """, world_id, creator_id)
                else:
                    row = await conn.fetchrow("""
                        UPDATE world_campaigns 
                        SET status = 'draft', updated_at = NOW() 
                        WHERE id = $1
                        RETURNING character_id;
                    """, world_id)

                if not row:
                    return False

                char_id = row["character_id"]
                if char_id:
                    await conn.execute("""
                        UPDATE world_characters 
                        SET status = 'draft', updated_at = NOW() 
                        WHERE id = $1;
                    """, char_id)

                logger.info(f"🔙 [WORLD_DB] Reverted campaign {world_id} to draft")
                return True

    # =========================================================================
    # 🎭 The Muse Conversation Operations (JSONB Array of MuseMessage)
    # =========================================================================

    async def save_muse_conversation(
        self,
        draft_id: str,
        creator_id: str,
        messages: List[Dict[str, Any]],
        scratchpad: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Saves conversation history with The Muse as JSONB."""
        pool = await self.get_pool()
        async with pool.acquire() as conn:
            # Ensure creator user exists in users table
            await conn.execute("""
                INSERT INTO users (id, name, is_guest, created_at, updated_at)
                VALUES ($1, 'Creator', TRUE, NOW(), NOW())
                ON CONFLICT (id) DO NOTHING;
            """, creator_id)

            await conn.execute("""
                INSERT INTO the_muse_conversations (draft_id, creator_id, messages, scratchpad, updated_at)
                VALUES ($1, $2, $3::jsonb, $4::jsonb, NOW())
                ON CONFLICT (draft_id) DO UPDATE SET
                    messages = EXCLUDED.messages,
                    scratchpad = COALESCE(EXCLUDED.scratchpad, the_muse_conversations.scratchpad),
                    updated_at = NOW();
            """, draft_id, creator_id, json.dumps(messages, ensure_ascii=False), json.dumps(scratchpad or {}, ensure_ascii=False))
            logger.info(f"💬 [WORLD_DB] Saved {len(messages)} Muse messages for draft {draft_id}")
            return True

    async def load_muse_conversation(self, draft_id: str) -> Dict[str, Any]:
        """Loads conversation history with The Muse."""
        pool = await self.get_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT messages, scratchpad, updated_at
                FROM the_muse_conversations
                WHERE draft_id = $1;
            """, draft_id)

            if not row:
                return {"messages": [], "scratchpad": {}}

            messages = row["messages"]
            if isinstance(messages, str):
                messages = json.loads(messages)

            scratchpad = row["scratchpad"]
            if isinstance(scratchpad, str):
                scratchpad = json.loads(scratchpad)

            return {
                "messages": messages or [],
                "scratchpad": scratchpad or {},
                "updated_at": row["updated_at"].isoformat() if row["updated_at"] else None
            }

    async def list_published_characters(self) -> List[Dict[str, Any]]:
        """Fetches all published characters for immediate play selection."""
        pool = await self.get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, name, avatar_url, character_data, updated_at
                FROM world_characters
                WHERE status = 'published'
                ORDER BY updated_at DESC;
            """)
            result = []
            for r in rows:
                cdata = r["character_data"]
                if isinstance(cdata, str):
                    cdata = json.loads(cdata)
                result.append({
                    "id": r["id"],
                    "name": r["name"],
                    "avatar_url": r["avatar_url"],
                    "character_data": cdata,
                    "updated_at": r["updated_at"].isoformat() if r["updated_at"] else None
                })
            return result
