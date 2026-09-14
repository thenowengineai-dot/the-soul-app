"""
Identity & ID System for The Soul App (The Pure Master Blueprint)
----------------------------------------------------------------
Provides strict deterministic ID generators, validation, and Upstash Redis Key schemas.

Entity Prefix Standards:
- Guest User:      gst_{timestamp}_{random}
- Registered User: usr_{google_sub_id}
- Character:       char_{id}
- Paired World:    world_{id}
- Session (Room):  ses_{user_id}_{char_id}
- Vault Draft:     draft_{timestamp}
"""

import time
import secrets
import re
from typing import Tuple, Dict, Any, Optional


def generate_guest_id() -> str:
    """
    Generates a guest user ID in standard format: gst_{timestamp}_{random}
    Example: gst_17854291_a8f9
    """
    ts = int(time.time())
    rand_hex = secrets.token_hex(2)  # 4 hex chars e.g. 'a8f9'
    return f"gst_{ts}_{rand_hex}"


def build_session_id(user_id: str, character_id: str) -> str:
    """
    Deterministic O(1) Session ID Generator.
    Formula: ses_{user_id}_{char_id}
    Example: ses_gst_17854291_a8f9_char_1788786310

    Guarantees that (user, character) always maps to the exact same room key
    without requiring a database handshake or secondary lookup.
    """
    clean_user = str(user_id or "").strip()
    clean_char = str(character_id or "").strip()
    if not clean_user:
        clean_user = generate_guest_id()
    if not clean_char.startswith("char_"):
        clean_char = f"char_{clean_char}"
    return f"ses_{clean_user}_{clean_char}"


def parse_session_id(session_id: str) -> Optional[Tuple[str, str]]:
    """
    Deconstructs a session_id into (user_id, character_id).
    Returns (user_id, character_id) or None if format is invalid.
    """
    if not session_id or not session_id.startswith("ses_"):
        return None

    match = re.match(r"^ses_((?:gst|usr)_.+?)_(char_.+)$", session_id)
    if match:
        return match.group(1), match.group(2)

    parts = session_id[4:].split("_char_")
    if len(parts) == 2:
        return parts[0], f"char_{parts[1]}"

    return None


def get_redis_session_keys(session_id: str) -> Dict[str, str]:
    """
    Returns standard Upstash Redis namespace keys for a session.
    """
    return {
        "state": f"session:{session_id}:state",
        "rounds": f"session:{session_id}:rounds",
        "owner": f"session:{session_id}:owner",
    }


def get_redis_character_blueprint_key(character_id: str) -> str:
    """Returns the static blueprint key for a character."""
    clean_char = str(character_id).strip()
    if not clean_char.startswith("char_"):
        clean_char = f"char_{clean_char}"
    return f"character:{clean_char}:blueprint"


def get_redis_user_coins_key(user_id: str) -> str:
    """Returns the user coin wallet cache key."""
    return f"user:{str(user_id).strip()}:coins"
