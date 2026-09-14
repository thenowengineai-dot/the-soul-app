import os
import json
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional

try:
    from engine.identity import (
        get_redis_session_keys,
        get_redis_character_blueprint_key,
        get_redis_user_coins_key,
        build_session_id,
        parse_session_id,
    )
except ImportError:
    from identity import (
        get_redis_session_keys,
        get_redis_character_blueprint_key,
        get_redis_user_coins_key,
        build_session_id,
        parse_session_id,
    )

logger = logging.getLogger("REDIS_HOT_CACHE")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s - \033[92m[REDIS]\033[0m - %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class RedisHotCache:
    """
    Upstash Redis Hot Cache Client
    ------------------------------
    Manages fast in-memory storage for:
    1. Sliding window of recent rounds (session:{session_id}:rounds) -> Default: 20 rounds
    2. Live character/player state (session:{session_id}:state) -> Fast state sync
    """

    def __init__(self, rest_url: Optional[str] = None, rest_token: Optional[str] = None):
        self.url = (rest_url or os.getenv("UPSTASH_REDIS_REST_URL", "")).strip("\"'").rstrip("/")
        self.token = (rest_token or os.getenv("UPSTASH_REDIS_REST_TOKEN", "")).strip("\"'")

        # Fallback: parse .env if not found in os.environ
        if not self.url or not self.token:
            self._load_env_fallback()

        if not self.url or not self.token:
            logger.warning("Upstash Redis credentials not found in environment or .env file.")
        else:
            logger.info(f"RedisHotCache configured with endpoint: {self.url}")

    def _load_env_fallback(self):
        env_paths = [
            os.path.join(os.getcwd(), ".env"),
            os.path.join(os.path.dirname(__file__), "..", ".env"),
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
            raise RuntimeError("Redis credentials missing.")

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
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if "error" in data:
                    raise RuntimeError(f"Upstash error: {data['error']}")
                return data.get("result")
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8") if e.fp else str(e)
            logger.error(f"HTTP error executing command {command_args[0]}: {err_body}")
            raise
        except Exception as e:
            logger.error(f"Network/Execution error in command {command_args[0]}: {e}")
            raise

    def execute_pipeline(self, pipeline_commands: List[List[Any]], timeout: int = 5) -> List[Any]:
        """Executes multiple Redis commands in a single atomic HTTP round-trip."""
        if not self.url or not self.token:
            raise RuntimeError("Redis credentials missing.")

        endpoint = f"{self.url}/pipeline"
        req = urllib.request.Request(
            endpoint,
            data=json.dumps(pipeline_commands).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                results = json.loads(resp.read().decode("utf-8"))
                parsed = []
                for item in results:
                    if isinstance(item, dict) and "error" in item:
                        raise RuntimeError(f"Pipeline item error: {item['error']}")
                    parsed.append(item.get("result") if isinstance(item, dict) else item)
                return parsed
        except Exception as e:
            logger.error(f"Pipeline error: {e}")
            raise

    def ping(self) -> bool:
        """Pings the Redis server to verify connectivity."""
        try:
            res = self.execute_command(["PING"])
            return res == "PONG"
        except Exception:
            return False

    # -------------------------------------------------------------
    # Unified Interaction Round Operations (Sliding Window List)
    # -------------------------------------------------------------

    def push_round(self, session_id: str, round_data: Dict[str, Any], max_window: int = 20, ttl_days: int = 7) -> bool:
        """
        Pushes a completed Unified Interaction Round to Redis.
        Automatically trims the list to retain only the most recent `max_window` rounds.
        Refreshes TTL (default: 7 days) to reclaim RAM automatically.
        Executes via atomic pipeline in a single round-trip.
        """
        key = f"session:{session_id}:rounds"
        round_json = json.dumps(round_data, ensure_ascii=False)
        ttl_seconds = ttl_days * 86400

        pipeline = [
            ["RPUSH", key, round_json],
            ["LTRIM", key, -max_window, -1],
            ["EXPIRE", key, ttl_seconds],
        ]
        try:
            self.execute_pipeline(pipeline)
            logger.info(f"Pushed Round {round_data.get('round_number')} to session '{session_id}' (capped at {max_window}).")
            return True
        except Exception as e:
            logger.error(f"Failed to push round to Redis for session {session_id}: {e}")
            return False

    def get_recent_rounds(self, session_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Retrieves the most recent rounds from Redis for context building.
        Returns a list of parsed round dicts ordered chronologically.
        """
        key = f"session:{session_id}:rounds"
        start_index = -limit if limit > 0 else 0
        try:
            raw_list = self.execute_command(["LRANGE", key, start_index, -1])
            if not raw_list:
                return []
            rounds = []
            for item in raw_list:
                if isinstance(item, str):
                    rounds.append(json.loads(item))
                elif isinstance(item, dict):
                    rounds.append(item)
            return rounds
        except Exception as e:
            logger.error(f"Failed to fetch recent rounds for session {session_id}: {e}")
            return []

    # -------------------------------------------------------------
    # Live State Operations (Snapshot storage)
    # -------------------------------------------------------------

    def save_live_state(self, session_id: str, state_data: Dict[str, Any], ttl_days: int = 7) -> bool:
        """Saves the latest character and player state snapshot with automatic TTL (default 7 days)."""
        key = f"session:{session_id}:state"
        state_json = json.dumps(state_data, ensure_ascii=False)
        ttl_seconds = ttl_days * 86400
        try:
            res = self.execute_command(["SET", key, state_json, "EX", ttl_seconds])
            return res == "OK"
        except Exception as e:
            logger.error(f"Failed to save live state for session {session_id}: {e}")
            return False

    def get_live_state(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves the latest state snapshot for a session."""
        key = f"session:{session_id}:state"
        try:
            val = self.execute_command(["GET", key])
            if val:
                return json.loads(val) if isinstance(val, str) else val
            return None
        except Exception as e:
            logger.error(f"Failed to get live state for session {session_id}: {e}")
            return None

    # -------------------------------------------------------------
    # ⚡ Zero-Handshake Session Bundle (Single Round-Trip ~2ms)
    # -------------------------------------------------------------

    def get_session_bundle(self, session_id: str, limit: int = 20) -> Dict[str, Any]:
        """
        ⚡ ZERO-HANDSHAKE FAST PATH:
        Fetches state, recent rounds, and ownership in 1 single pipeline round-trip (~2ms).
        """
        keys = get_redis_session_keys(session_id)
        start_index = -limit if limit > 0 else 0
        pipeline = [
            ["GET", keys["state"]],
            ["LRANGE", keys["rounds"], start_index, -1],
            ["GET", keys["owner"]],
        ]
        try:
            results = self.execute_pipeline(pipeline)
            raw_state = results[0] if len(results) > 0 else None
            raw_rounds = results[1] if len(results) > 1 else None
            owner = results[2] if len(results) > 2 else None

            state = json.loads(raw_state) if isinstance(raw_state, str) else (raw_state or {})
            rounds = []
            if raw_rounds and isinstance(raw_rounds, list):
                for item in raw_rounds:
                    if isinstance(item, str):
                        try:
                            rounds.append(json.loads(item))
                        except Exception:
                            pass
                    elif isinstance(item, dict):
                        rounds.append(item)

            return {
                "session_id": session_id,
                "state": state,
                "rounds": rounds,
                "owner": owner,
                "has_started": bool(rounds or state),
            }
        except Exception as e:
            logger.error(f"Failed to fetch session bundle for {session_id}: {e}")
            return {
                "session_id": session_id,
                "state": {},
                "rounds": [],
                "owner": None,
                "has_started": False,
            }

    def clear_session(self, session_id: str) -> bool:
        """Cleans up cache keys for a specific session."""
        keys = get_redis_session_keys(session_id)
        try:
            self.execute_pipeline([["DEL", keys["rounds"]], ["DEL", keys["state"]], ["DEL", keys["owner"]]])
            return True
        except Exception as e:
            logger.error(f"Failed to clear session {session_id}: {e}")
            return False

    # -------------------------------------------------------------
    # ⚡ Hot Character Blueprint Cache
    # -------------------------------------------------------------

    def save_character_blueprint(self, character_id: str, blueprint: Dict[str, Any]) -> bool:
        """Saves published character blueprint (12 stats, persona, prompt) in Redis RAM."""
        key = get_redis_character_blueprint_key(character_id)
        data_str = json.dumps(blueprint, ensure_ascii=False)
        try:
            res = self.execute_command(["SET", key, data_str])
            return res == "OK"
        except Exception as e:
            logger.error(f"Failed to save blueprint for {character_id}: {e}")
            return False

    def get_character_blueprint(self, character_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves published character blueprint from Redis Hot Cache."""
        key = get_redis_character_blueprint_key(character_id)
        try:
            res = self.execute_command(["GET", key])
            if res and isinstance(res, str):
                return json.loads(res)
            return None
        except Exception as e:
            logger.error(f"Failed to get blueprint for {character_id}: {e}")
            return None

    # -------------------------------------------------------------
    # 🚀 Silent Handover (Session Migration from Guest -> Registered)
    # -------------------------------------------------------------

    def migrate_session(self, old_session_id: str, new_session_id: str, new_user_id: str) -> bool:
        """
        🚀 SILENT HANDOVER:
        Transfers session state and rounds from old_session_id (guest) to new_session_id (registered user)
        in Redis RAM in ~5ms.
        """
        old_keys = get_redis_session_keys(old_session_id)
        new_keys = get_redis_session_keys(new_session_id)

        try:
            bundle = self.get_session_bundle(old_session_id)
            if not bundle["has_started"]:
                logger.info(f"No existing data in {old_session_id} to migrate.")
                return False

            pipeline = []
            if bundle["state"]:
                pipeline.append(["SET", new_keys["state"], json.dumps(bundle["state"], ensure_ascii=False), "EX", 604800])
            if bundle["rounds"]:
                pipeline.append(["DEL", new_keys["rounds"]])
                for r in bundle["rounds"]:
                    pipeline.append(["RPUSH", new_keys["rounds"], json.dumps(r, ensure_ascii=False)])
                pipeline.append(["EXPIRE", new_keys["rounds"], 604800])
            pipeline.append(["SET", new_keys["owner"], new_user_id, "EX", 604800])

            # Clean up old guest session
            pipeline.append(["DEL", old_keys["state"]])
            pipeline.append(["DEL", old_keys["rounds"]])
            pipeline.append(["DEL", old_keys["owner"]])

            self.execute_pipeline(pipeline)
            logger.info(f"✅ Migrated session {old_session_id} -> {new_session_id} for user {new_user_id} in RAM.")
            return True
        except Exception as e:
            logger.error(f"Failed to migrate session {old_session_id} -> {new_session_id}: {e}")
            return False

    # -------------------------------------------------------------
    # ⚡ Active Session Indexing & Ownership (Fast Path & IDOR Security)
    # -------------------------------------------------------------

    def set_active_session(self, user_id: str, character_id: str, session_id: str, ttl_days: int = 30) -> bool:
        """
        Maps (user_id, character_id) -> session_id for instant (0.001s) room entry.
        Default TTL: 30 days.
        """
        key = f"active_session:{user_id}:{character_id}"
        ttl_seconds = ttl_days * 86400
        try:
            res = self.execute_command(["SET", key, session_id, "EX", ttl_seconds])
            return res == "OK"
        except Exception as e:
            logger.error(f"Failed to set active session index ({key} -> {session_id}): {e}")
            return False

    def get_active_session(self, user_id: str, character_id: str) -> str:
        """
        Deterministic O(1) active session resolution.
        Returns deterministic ses_{user_id}_{character_id}.
        """
        key = f"active_session:{user_id}:{character_id}"
        try:
            res = self.execute_command(["GET", key])
            if res and isinstance(res, str):
                return res
        except Exception:
            pass
        return build_session_id(user_id, character_id)

    def clear_active_session(self, user_id: str, character_id: str) -> bool:
        """Removes the active session index pointer (e.g. on reset or archive)."""
        key = f"active_session:{user_id}:{character_id}"
        try:
            self.execute_command(["DEL", key])
            return True
        except Exception as e:
            logger.error(f"Failed to clear active session index for {key}: {e}")
            return False

    def set_session_owner(self, session_id: str, user_id: str, ttl_days: int = 30) -> bool:
        """Saves session ownership in Redis for zero-cost IDOR verification."""
        keys = get_redis_session_keys(session_id)
        ttl_seconds = ttl_days * 86400
        try:
            res = self.execute_command(["SET", keys["owner"], user_id, "EX", ttl_seconds])
            return res == "OK"
        except Exception as e:
            logger.error(f"Failed to set session owner for {session_id}: {e}")
            return False

    def get_session_owner(self, session_id: str) -> Optional[str]:
        """Retrieves session owner from Redis cache."""
        keys = get_redis_session_keys(session_id)
        try:
            res = self.execute_command(["GET", keys["owner"]])
            if res and isinstance(res, str):
                return res
            return None
        except Exception as e:
            logger.error(f"Failed to get session owner for {session_id}: {e}")
            return None

    # -------------------------------------------------------------
    # 🪙 User Wallet Hot Cache (Token Gate < 2ms)
    # -------------------------------------------------------------

    def get_user_coins(self, user_id: str) -> Optional[int]:
        """
        Retrieves cached coin balance for a user from Redis RAM (2-5ms).
        Returns integer balance, or None if cache miss.
        """
        key = f"user:{user_id}:coins"
        try:
            res = self.execute_command(["GET", key])
            if res is not None:
                return int(res)
            return None
        except Exception as e:
            logger.error(f"Failed to get cached coins for {user_id}: {e}")
            return None

    def set_user_coins(self, user_id: str, coins: int, ttl: int = 3600) -> bool:
        """
        Sets user coin balance in Redis Hot Cache with TTL (default: 1 hour).
        """
        key = f"user:{user_id}:coins"
        try:
            res = self.execute_command(["SET", key, coins, "EX", ttl])
            return res == "OK"
        except Exception as e:
            logger.error(f"Failed to set cached coins for {user_id}: {e}")
            return False

    def decr_user_coins(self, user_id: str, amount: int) -> Optional[int]:
        """
        Decrements user coin balance atomically in Redis Hot Cache.
        """
        key = f"user:{user_id}:coins"
        try:
            res = self.execute_command(["DECRBY", key, amount])
            return int(res) if res is not None else None
        except Exception as e:
            logger.error(f"Failed to decr cached coins for {user_id}: {e}")
            return None

    def incr_user_coins(self, user_id: str, amount: int) -> Optional[int]:
        """
        Increments user coin balance atomically in Redis Hot Cache.
        """
        key = f"user:{user_id}:coins"
        try:
            res = self.execute_command(["INCRBY", key, amount])
            return int(res) if res is not None else None
        except Exception as e:
            logger.error(f"Failed to incr cached coins for {user_id}: {e}")
            return None

    def clear_user_coins(self, user_id: str) -> bool:
        """Invalidates user coin cache."""
        key = f"user:{user_id}:coins"
        try:
            self.execute_command(["DEL", key])
            return True
        except Exception as e:
            logger.error(f"Failed to clear coin cache for {user_id}: {e}")
            return False


