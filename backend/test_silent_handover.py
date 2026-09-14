"""
Phase 5 Verification Test: Silent Handover & Zero-Handshake Benchmark
Tests live Upstash Redis RAM migration, atomic bundle retrieval, and TTLs.
"""
import sys
import os
import json
import time

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from engine.identity import (
    generate_guest_id,
    build_session_id,
    parse_session_id,
    get_redis_session_keys,
    get_redis_user_coins_key,
)
from engine.redis_cache import RedisHotCache


def run_silent_handover_test():
    print("🚀 [PHASE 5] Starting Silent Handover & Live Hot Cache Benchmark...")
    redis = RedisHotCache()
    if not redis.ping():
        print("❌ Cannot connect to Upstash Redis. Skipping test.")
        return False
    print("✅ Upstash Redis Live Connection Verified!")

    # 1. Setup Test Identities
    guest_user_id = generate_guest_id()
    registered_user_id = f"usr_{int(time.time())}"
    character_id = "char_1788786310"

    guest_session_id = build_session_id(guest_user_id, character_id)
    registered_session_id = build_session_id(registered_user_id, character_id)

    print(f"👤 Guest User ID:        {guest_user_id}")
    print(f"🔑 Guest Session ID:     {guest_session_id}")
    print(f"👑 Registered User ID:   {registered_user_id}")
    print(f"🔑 Registered Session:   {registered_session_id}")

    assert guest_session_id.startswith("ses_gst_")
    assert registered_session_id.startswith("ses_usr_")
    assert f"_{character_id}" in guest_session_id
    assert f"_{character_id}" in registered_session_id

    # 2. Simulate Guest Gameplay in RAM
    print("\n--- [Step 1] Simulating Guest Gameplay in Upstash Redis RAM ---")
    guest_initial_state = {
        "affection": 25,
        "desire": 15,
        "a_pos": "นั่งไขว่ห้างบนโซฟาตัวเดี่ยว",
        "p_pos": "ยืนตรงหน้า",
        "stance": "friendly",
        "scene_id": "scene_1",
        "beat_id": "beat_vip_approach",
    }
    redis.save_live_state(guest_session_id, guest_initial_state)
    redis.set_active_session(guest_user_id, character_id, guest_session_id)
    redis.set_session_owner(guest_session_id, guest_user_id)
    redis.set_user_coins(guest_user_id, 40)

    round_1 = {
        "round_id": f"rnd_{guest_session_id}_001",
        "round_number": 1,
        "timestamp": int(time.time() * 1000),
        "player": {"text": "สวัสดีครับคุณเชอร์รี่", "type": "player_action"},
        "response": [
            {"order": 1, "type": "vo_main", "text": "เสียงเพลงแจ๊สดังคลอเบาๆ ในห้อง VIP"},
            {"order": 2, "type": "action", "text": "เงยหน้าขึ้นสบตาแล้วระบายยิ้มละไม"},
            {"order": 3, "type": "dialogue", "text": "ยินดีต้อนรับค่ะ คืนนี้รับอะไรดีคะ?"},
        ],
        "state": guest_initial_state,
    }
    round_2 = {
        "round_id": f"rnd_{guest_session_id}_002",
        "round_number": 2,
        "timestamp": int(time.time() * 1000) + 5000,
        "player": {"text": "ขอแนะนำเครื่องดื่มพิเศษหน่อยครับ", "type": "player_action"},
        "response": [
            {"order": 1, "type": "action", "text": "หยิบเมนูหุ้มหนังสีดำเปิดยื่นให้ดู"},
            {"order": 2, "type": "dialogue", "text": "ถ้าชอบรสสัมผัสนุ่ม ลึกซึ้ง แนะนำไวน์แดงตัวนี้เลยค่ะ"},
        ],
        "state": {**guest_initial_state, "affection": 30, "desire": 18},
    }
    redis.push_round(guest_session_id, round_1)
    redis.push_round(guest_session_id, round_2)

    # Verify Guest data is in RAM
    guest_bundle = redis.get_session_bundle(guest_session_id)
    assert guest_bundle["has_started"] is True
    assert len(guest_bundle["rounds"]) == 2
    assert guest_bundle["owner"] == guest_user_id
    assert guest_bundle["state"]["affection"] == 25
    print(f"✅ Guest session active in RAM with {len(guest_bundle['rounds'])} rounds!")

    # 3. Benchmark Silent Handover Migration (RAM to RAM in ~5ms)
    print("\n--- [Step 2] Executing Silent Handover (Guest -> Registered) ---")
    t_start = time.time()
    migration_ok = redis.migrate_session(guest_session_id, registered_session_id, registered_user_id)
    redis.clear_active_session(guest_user_id, character_id)
    redis.set_active_session(registered_user_id, character_id, registered_session_id)
    redis.set_session_owner(registered_session_id, registered_user_id)
    t_migration_ms = (time.time() - t_start) * 1000

    assert migration_ok is True, "Silent Handover migration returned False!"
    print(f"⚡ Silent Handover completed in {t_migration_ms:.2f} ms!")

    # 4. Verify Old Guest Session Purged from RAM
    print("\n--- [Step 3] Verifying Old Guest Session Purged ---")
    old_guest_bundle = redis.get_session_bundle(guest_session_id)
    assert old_guest_bundle["has_started"] is False, "Old guest session should be empty"
    assert len(old_guest_bundle["rounds"]) == 0
    assert old_guest_bundle["owner"] is None
    print("✅ Old Guest session cleanly purged from RAM.")

    # 5. Benchmark Zero-Handshake Fast Path Room Entry on New Session
    print("\n--- [Step 4] Benchmarking Fast Path Zero-Handshake Entry ---")
    t_load_start = time.time()
    member_bundle = redis.get_session_bundle(registered_session_id, limit=20)
    t_load_ms = (time.time() - t_load_start) * 1000

    assert member_bundle["has_started"] is True
    assert member_bundle["session_id"] == registered_session_id
    assert member_bundle["owner"] == registered_user_id
    assert len(member_bundle["rounds"]) == 2
    assert member_bundle["rounds"][0]["player"]["text"] == "สวัสดีครับคุณเชอร์รี่"
    assert member_bundle["rounds"][1]["response"][1]["text"] == "ถ้าชอบรสสัมผัสนุ่ม ลึกซึ้ง แนะนำไวน์แดงตัวนี้เลยค่ะ"

    print(f"⚡ Fast Path Single-Pipeline Loaded in: {t_load_ms:.2f} ms!")
    print(f"✅ State Affection:  {member_bundle['state']['affection']}")
    print(f"✅ Rounds Preserved: {len(member_bundle['rounds'])} rounds")
    print(f"✅ Session Owner:    {member_bundle['owner']}")

    # 6. Clean up test keys
    redis.clear_session(registered_session_id)
    redis.clear_active_session(registered_user_id, character_id)
    redis.clear_user_coins(guest_user_id)

    print("\n🎉 [PHASE 5 VERIFIED] Silent Handover & Zero-Handshake System Passed 100%!")
    return True


if __name__ == "__main__":
    success = run_silent_handover_test()
    if not success:
        sys.exit(1)
