import os
import json
import time
import logging
from typing import Dict, Any, List, Optional
try:
    from genesis.the_muse import TheMuse
    from genesis.factory import GenesisFactory
    from genesis.the_auditor import TheAuditor
    from genesis.postgres_world import PostgresWorld
    from genesis.redis_hot import GenesisRedisHotCache
except (ImportError, ModuleNotFoundError):
    from the_muse import TheMuse
    from factory import GenesisFactory
    from the_auditor import TheAuditor
    from postgres_world import PostgresWorld
    from redis_hot import GenesisRedisHotCache

logger = logging.getLogger("GENESIS_PIPELINE")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s - \033[94m[PIPELINE]\033[0m - %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class GenesisPipeline:
    """
    Orchestration Pipeline for World Building & The Muse Engine
    ----------------------------------------------------------
    Coordinates AI agents, Neon Serverless PostgreSQL (JSONB), and Upstash Redis Hot Cache.
    Replaces legacy Supabase with full native Neon + Redis parity.
    """

    def __init__(self):
        self.muse = TheMuse()
        self.factory = GenesisFactory()
        self.auditor = TheAuditor()
        self.db = PostgresWorld()
        self.redis = GenesisRedisHotCache()
        logger.info("🚀 [GENESIS_PIPELINE] Initialized with Neon PostgreSQL & Upstash Redis Hot Cache.")

    def process_chat(
        self,
        message: str,
        history: List[Dict[str, Any]],
        mode: str,
        image_base64: Optional[str] = None,
        scratchpad_state: Optional[Dict[str, Any]] = None
    ) -> str:
        """Processes real-time conversation with The Muse."""
        return self.muse.chat_turn(message, history, mode, image_base64, scratchpad_state)

    def draft_master_brief(
        self,
        history: List[Dict[str, Any]],
        mode: str,
        current_draft: Optional[str] = None
    ) -> str:
        """Distills chat history into a cohesive Master Brief."""
        return self.muse.distill_master_brief(history, mode, current_draft)

    def extract_storyboard(self, history: List[Dict[str, Any]], mode: str) -> Dict[str, Any]:
        """Extracts timeline structure for visual storyboard display."""
        return self.muse.extract_timeline(history, mode)

    def build_final_json(
        self,
        history: List[Dict[str, Any]],
        mode: str,
        character_data: Optional[Dict[str, Any]] = None,
        master_brief: Optional[str] = None,
        timeline_json: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Compiles final character or world JSON card from Master Brief."""
        if not master_brief:
            master_brief = self.draft_master_brief(history, mode)

        if mode == "character":
            return self.factory.build_character(master_brief)
        else:
            return self.factory.build_world(master_brief, character_data or {})

    def extract_color(self, base64_str: str) -> str:
        """Extracts dominant theme color from character portrait."""
        if "," in base64_str:
            header, base64_data = base64_str.split(",", 1)
            mime_type = header.split(":")[1].split(";")[0]
        else:
            base64_data = base64_str
            mime_type = "image/jpeg"
        return self.factory.extract_theme_color(base64_data, mime_type)

    def inject_beat(
        self,
        prev_beat: Optional[Dict[str, Any]],
        next_beat: Optional[Dict[str, Any]],
        prompt: str,
        master_brief: Optional[str] = None,
        character_data: Optional[Dict[str, Any]] = None
    ) -> list:
        return self.factory.inject_beat(prev_beat, next_beat, prompt, master_brief, character_data)

    def improve_beat(
        self,
        beats: List[Dict[str, Any]],
        prompt: str,
        master_brief: Optional[str] = None,
        character_data: Optional[Dict[str, Any]] = None
    ) -> list:
        return self.factory.improve_beat(beats, prompt, master_brief, character_data)

    def validate_world(self, world_data: Dict[str, Any]) -> Dict[str, Any]:
        """Audits world data against The Engine Manifesto."""
        return self.auditor.validate_world(world_data)

    # =========================================================================
    # 💾 Database & Cache Operations (Neon PostgreSQL + Upstash Redis)
    # =========================================================================

    async def save_draft(self, data: Dict[str, Any], mode: str, user_id: str) -> str:
        """Saves world and character draft to Neon Postgres and caches active state."""
        world_id = data.get("id") or data.get("world_id") or f"draft_{int(time.time())}"
        data["world_id"] = world_id
        name = data.get("worldTitle") or data.get("name") or data.get("thai_name") or "Untitled World"

        character_data = data.get("linked_character") or data.get("character_data") or {}
        if isinstance(character_data, dict):
            if not character_data.get("name") and data.get("title"):
                character_data["name"] = data.get("title")
            if data.get("image"):
                character_data["avatar_url"] = data.get("image")
            elif not character_data.get("avatar_url") and data.get("avatar_url"):
                character_data["avatar_url"] = data.get("avatar_url")
            if data.get("images") and isinstance(data.get("images"), list):
                character_data["images"] = data.get("images")

        workspace_meta = data.get("workspace_meta") or {
            "isPinned": data.get("isPinned", False),
            "themeColor": data.get("themeColor", "#EF264C"),
            "description": data.get("description", ""),
            "mode": mode,
        }

        # Save to Neon Postgres
        saved_id = await self.db.save_draft(
            world_id=world_id,
            creator_id=user_id,
            name=name,
            world_data=data,
            character_data=character_data,
            workspace_meta=workspace_meta
        )

        # Cache in Redis RAM
        self.redis.cache_draft(world_id, {
            "world_id": world_id,
            "name": name,
            "data": data,
            "character_data": character_data,
            "workspace_meta": workspace_meta
        })

        return saved_id

    async def load_draft(self, world_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Loads draft from Redis Hot Cache or Neon Postgres fallback."""
        # Try Hot Cache first
        cached = self.redis.get_cached_draft(world_id)
        if cached:
            return cached

        # Fallback to Neon
        row = await self.db.load_draft(world_id, user_id)
        if row:
            self.redis.cache_draft(world_id, row)
        return row

    async def list_drafts(self, user_id: str) -> List[Dict[str, Any]]:
        """Lists drafts for sidebar display."""
        return await self.db.list_user_drafts(user_id)

    async def delete_draft(self, world_id: str, user_id: Optional[str] = None) -> bool:
        """Deletes draft from Neon and clears Hot Cache."""
        success = await self.db.delete_draft(world_id, user_id)
        if success:
            self.redis.unpublish_character_and_world(f"char_{world_id}", world_id)
        return success

    async def publish_draft(self, world_id: str, user_id: Optional[str] = None) -> bool:
        """
        ⚡ PUBLISH TO PRODUCTION:
        1. Updates status = 'published' in Neon PostgreSQL
        2. Injects full World & Character JSON directly into Upstash Redis Hot Cache
        3. Player Chat Engine can play instantly (0.002s) without DB delays!
        """
        result = await self.db.publish_draft(world_id, user_id)
        if not result:
            logger.error(f"❌ [PIPELINE] Failed to publish draft {world_id} in Neon DB.")
            return False

        char_id = result.get("character_id")
        char_data = result.get("character_data") or {}
        world_data = result.get("world_data") or {}

        # Inject to Upstash Redis Hot Cache
        if char_id:
            self.redis.publish_character_and_world(char_id, char_data, world_id, world_data)

        logger.info(f"🚀 [PIPELINE] Campaign {world_id} published & injected into Hot Cache!")
        return True

    async def unpublish_draft(self, world_id: str, user_id: Optional[str] = None) -> bool:
        """Reverts campaign back to draft and removes from Hot Cache."""
        success = await self.db.unpublish_draft(world_id, user_id)
        if success:
            draft = await self.db.load_draft(world_id, user_id)
            char_id = draft.get("character_id") if draft else None
            if char_id:
                self.redis.unpublish_character_and_world(char_id, world_id)
        return success

    # =========================================================================
    # 💬 The Muse Conversation Persistence (JSONB)
    # =========================================================================

    async def save_muse_chat(
        self,
        draft_id: str,
        user_id: str,
        messages: List[Dict[str, Any]],
        scratchpad: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Saves Muse conversation history as JSONB."""
        return await self.db.save_muse_conversation(draft_id, user_id, messages, scratchpad)

    async def load_muse_chat(self, draft_id: str) -> Dict[str, Any]:
        """Loads Muse conversation history from JSONB."""
        return await self.db.load_muse_conversation(draft_id)
