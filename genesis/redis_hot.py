import os
import json
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional

logger = logging.getLogger("GENESIS_REDIS_HOT")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s - \033[92m[GENESIS_REDIS]\033[0m - %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class GenesisRedisHotCache:
    """
    Upstash Redis Hot Cache Client for Genesis Engine
    -------------------------------------------------
    Provides instant in-memory storage for:
    1. Instant Play on Publish: Injects newly published characters & worlds into RAM
       so the player chat engine (the-soul-backend) can load them in 1-2 ms.
    2. Draft State caching & Fast retrieval.
    """

    def __init__(self, rest_url: Optional[str] = None, rest_token: Optional[str] = None):
        self.url = (rest_url or os.getenv("UPSTASH_REDIS_REST_URL", "")).strip("\"'").rstrip("/")
        self.token = (rest_token or os.getenv("UPSTASH_REDIS_REST_TOKEN", "")).strip("\"'")

        if not self.url or not self.token:
            self._load_env_fallback()

        if not self.url or not self.token:
            logger.warning("Upstash Redis credentials not found for GenesisRedisHotCache.")
        else:
            logger.info(f"GenesisRedisHotCache configured with endpoint: {self.url}")

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
                            k = k.strip()
                            v = v.strip().strip("\"'")
                            if k == "UPSTASH_REDIS_REST_URL" and not self.url:
                                self.url = v.rstrip("/")
                            elif k == "UPSTASH_REDIS_REST_TOKEN" and not self.token:
                                self.token = v
                except Exception as e:
                    logger.warning(f"Failed to read fallback .env from {path}: {e}")

    def execute_command(self, command_args: List[Any], timeout: int = 5) -> Any:
        """Executes a single Redis command via Upstash REST API."""
        if not self.url or not self.token:
            logger.warning("Redis credentials missing. Skipping cache operation.")
            return None

        req = urllib.request.Request(
            self.url,
            data=json.dumps(command_args).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=timeout) as response:
                result = json.loads(response.read().decode("utf-8"))
                return result.get("result")
        except urllib.error.HTTPError as e:
            logger.error(f"Redis HTTP Error {e.code}: {e.read().decode('utf-8')}")
            return None
        except Exception as e:
            logger.error(f"Redis Command Error ({command_args[0]}): {e}")
            return None

    def publish_character_and_world(
        self,
        character_id: str,
        character_data: Dict[str, Any],
        world_id: str,
        world_data: Dict[str, Any]
    ) -> bool:
        """
        ⚡ HOT CACHE INJECTION:
        Injects published character and world JSON directly into Redis RAM.
        Player chat room can now open in 0.002s without waiting for database queries!
        """
        try:
            char_json = json.dumps(character_data, ensure_ascii=False)
            world_json = json.dumps(world_data, ensure_ascii=False)

            # Store character and world JSON payloads
            self.execute_command(["SET", f"char:{character_id}:data", char_json])
            self.execute_command(["SET", f"world:{world_id}:data", world_json])

            # Store combined campaign for the chat engine (the-soul-backend Service 1)
            combined_campaign = {
                "id": world_id,
                "name": world_data.get("name") or world_data.get("world_name") or "Untitled World",
                "character_id": character_id,
                "character_data": character_data,
                "world_data": world_data,
                "status": "published"
            }
            combined_json = json.dumps(combined_campaign, ensure_ascii=False)
            self.execute_command(["SET", f"campaign_v3:{world_id}", combined_json])
            self.execute_command(["SET", f"campaign_v3:{character_id}", combined_json])

            # Add to published sets for instant catalog display
            self.execute_command(["SADD", "published_character_ids", character_id])
            self.execute_command(["SADD", "published_world_ids", world_id])

            logger.info(f"⚡ [HOT CACHE INJECTED] Successfully cached {character_id} and {world_id} to Redis RAM!")
            return True
        except Exception as e:
            logger.error(f"Failed to inject to Redis Hot Cache: {e}")
            return False

    def unpublish_character_and_world(self, character_id: str, world_id: str) -> bool:
        """Removes character and world from active published sets."""
        try:
            self.execute_command(["SREM", "published_character_ids", character_id])
            self.execute_command(["SREM", "published_world_ids", world_id])
            self.execute_command(["DEL", f"char:{character_id}:data"])
            self.execute_command(["DEL", f"world:{world_id}:data"])
            self.execute_command(["DEL", f"campaign_v3:{world_id}"])
            self.execute_command(["DEL", f"campaign_v3:{character_id}"])
            logger.info(f"🔙 [HOT CACHE CLEARED] Removed {character_id} and {world_id} from Redis RAM.")
            return True
        except Exception as e:
            logger.error(f"Failed to clear Redis Hot Cache: {e}")
            return False

    def cache_draft(self, draft_id: str, data: Dict[str, Any], ttl_seconds: int = 86400) -> bool:
        """Caches active draft for fast editing sessions."""
        try:
            val = json.dumps(data, ensure_ascii=False)
            self.execute_command(["SETEX", f"draft:{draft_id}", ttl_seconds, val])
            return True
        except Exception as e:
            logger.error(f"Failed to cache draft: {e}")
            return False

    def get_cached_draft(self, draft_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves cached draft from RAM."""
        try:
            val = self.execute_command(["GET", f"draft:{draft_id}"])
            if val:
                return json.loads(val)
        except Exception as e:
            logger.error(f"Failed to get cached draft: {e}")
        return None
