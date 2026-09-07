import os
import json
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional

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

    def push_round(self, session_id: str, round_data: Dict[str, Any], max_window: int = 20) -> bool:
        """
        Pushes a completed Unified Interaction Round to Redis.
        Automatically trims the list to retain only the most recent `max_window` rounds.
        Executes via atomic pipeline in a single round-trip.
        """
        key = f"session:{session_id}:rounds"
        round_json = json.dumps(round_data, ensure_ascii=False)

        pipeline = [
            ["RPUSH", key, round_json],
            ["LTRIM", key, -max_window, -1],
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

    def save_live_state(self, session_id: str, state_data: Dict[str, Any]) -> bool:
        """Saves the latest character and player state snapshot for fast resumption."""
        key = f"session:{session_id}:state"
        state_json = json.dumps(state_data, ensure_ascii=False)
        try:
            res = self.execute_command(["SET", key, state_json])
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

    def clear_session(self, session_id: str) -> bool:
        """Cleans up cache keys for a specific session."""
        rounds_key = f"session:{session_id}:rounds"
        state_key = f"session:{session_id}:state"
        try:
            self.execute_pipeline([["DEL", rounds_key], ["DEL", state_key]])
            return True
        except Exception as e:
            logger.error(f"Failed to clear session {session_id}: {e}")
            return False
