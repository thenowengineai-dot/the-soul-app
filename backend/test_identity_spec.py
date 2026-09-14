"""
Unit Test for Pure Identity & Key Generation Spec (Phase 1 Verification)
"""
import sys
import os

# Ensure import path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from engine.identity import (
    generate_guest_id,
    build_session_id,
    parse_session_id,
    get_redis_session_keys,
    get_redis_character_blueprint_key,
    get_redis_user_coins_key,
)

def test_guest_id():
    gid = generate_guest_id()
    assert gid.startswith("gst_"), f"Invalid prefix: {gid}"
    parts = gid.split("_")
    assert len(parts) == 3, f"Expected gst_{{timestamp}}_{{random}}, got: {gid}"
    assert parts[1].isdigit(), f"Timestamp not numeric: {parts[1]}"
    assert len(parts[2]) == 4, f"Random hex length not 4: {parts[2]}"
    print(f"✅ Guest ID generator passed: {gid}")

def test_deterministic_session_id():
    user = "gst_17854291_a8f9"
    char = "char_1788786310"
    
    # 1. Deterministic session ID
    sid1 = build_session_id(user, char)
    sid2 = build_session_id(user, char)
    assert sid1 == sid2 == "ses_gst_17854291_a8f9_char_1788786310", f"Unexpected sid: {sid1}"
    print(f"✅ Deterministic Session ID passed: {sid1}")

    # 2. Deconstruction / Parsing
    parsed = parse_session_id(sid1)
    assert parsed == (user, char), f"Failed to parse session ID: {parsed}"
    print(f"✅ Parse Session ID passed: {parsed}")

    # 3. Redis keys
    keys = get_redis_session_keys(sid1)
    assert keys["state"] == f"session:{sid1}:state"
    assert keys["rounds"] == f"session:{sid1}:rounds"
    assert keys["owner"] == f"session:{sid1}:owner"
    print(f"✅ Redis Session Keys passed: {keys}")

    # 4. Blueprint key
    bp_key = get_redis_character_blueprint_key(char)
    assert bp_key == f"character:{char}:blueprint"
    print(f"✅ Redis Blueprint Key passed: {bp_key}")

    # 5. Coins key
    coins_key = get_redis_user_coins_key(user)
    assert coins_key == f"user:{user}:coins"
    print(f"✅ Redis Coins Key passed: {coins_key}")

if __name__ == "__main__":
    test_guest_id()
    test_deterministic_session_id()
    print("\n🎉 ALL PHASE 1 IDENTITY TESTS PASSED 100%!")
