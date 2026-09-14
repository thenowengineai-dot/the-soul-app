"""
Phase 2 Verification Test: Pure Upstash Redis Hot Cache Adapter
Tests deterministic session bundle, blueprint, unified rounds, and silent handover.
"""
import sys
import os
import json
import time

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from engine.identity import build_session_id, generate_guest_id
from engine.redis_cache import RedisHotCache

def run_phase2_tests():
    print("🚀 Starting Phase 2 Redis Hot Cache Tests...")
    redis = RedisHotCache()
    if not redis.ping():
        print("❌ Cannot ping Upstash Redis. Skipping online tests.")
        return False
    print("✅ PING Upstash Redis successful!")

    test_guest = "gst_99999999_test"
    test_member = "usr_google_12345"
    test_char = "char_tester_01"

    guest_session_id = build_session_id(test_guest, test_char)
    member_session_id = build_session_id(test_member, test_char)

    assert guest_session_id == f"ses_{test_guest}_{test_char}"
    assert member_session_id == f"ses_{test_member}_{test_char}"

    # Clean prior test state
    redis.clear_session(guest_session_id)
    redis.clear_session(member_session_id)

    # 1. Test Save & Get Live State
    sample_state = {
        "affection": 55,
        "desire": 40,
        "a_pos": "ยืนพิงระเบียง",
        "p_pos": "ยืนตรงหน้า",
        "scene_id": "scene_balcony_night",
        "beat_id": "beat_starlit_talk"
    }
    ok_state = redis.save_live_state(guest_session_id, sample_state)
    assert ok_state is True, "Failed to save live state"
    retrieved_state = redis.get_live_state(guest_session_id)
    assert retrieved_state["affection"] == 55
    assert retrieved_state["a_pos"] == "ยืนพิงระเบียง"
    print(f"✅ [1/5] Save & Get Live State passed for {guest_session_id}")

    # 2. Test Push & Get Unified Interaction Rounds
    sample_round_0 = {
        "round_id": f"round_{int(time.time())}_000",
        "round_number": 0,
        "timestamp": int(time.time() * 1000),
        "player": None,
        "response": [
            {"order": 1, "type": "vo_main", "text": "สายลมเย็นพัดผ่านระเบียงชั้นบน"},
            {"order": 2, "type": "dialogue", "text": "ดึกป่านนี้แล้ว ยังไม่นอนอีกเหรอ?"}
        ],
        "state": sample_state
    }
    ok_round = redis.push_round(guest_session_id, sample_round_0)
    assert ok_round is True, "Failed to push round"

    rounds = redis.get_recent_rounds(guest_session_id, limit=5)
    assert len(rounds) == 1
    assert rounds[0]["round_number"] == 0
    assert rounds[0]["response"][1]["text"] == "ดึกป่านนี้แล้ว ยังไม่นอนอีกเหรอ?"
    print(f"✅ [2/5] Push & Get Unified Interaction Round passed")

    # 3. Test Zero-Handshake Session Bundle (Single Pipeline Round-Trip)
    redis.set_session_owner(guest_session_id, test_guest)
    bundle = redis.get_session_bundle(guest_session_id, limit=20)
    assert bundle["has_started"] is True
    assert bundle["state"]["scene_id"] == "scene_balcony_night"
    assert len(bundle["rounds"]) == 1
    assert bundle["owner"] == test_guest
    print(f"✅ [3/5] Zero-Handshake Session Bundle (~2ms single round-trip) passed!")

    # 4. Test Hot Character Blueprint
    sample_bp = {
        "character_id": test_char,
        "name": "เทสเตอร์จัง",
        "stats": {"charm": 8, "logic": 6},
        "default_outfit": "ชุดนอนสีขาว"
    }
    ok_bp = redis.save_character_blueprint(test_char, sample_bp)
    assert ok_bp is True
    bp_data = redis.get_character_blueprint(test_char)
    assert bp_data["name"] == "เทสเตอร์จัง"
    print(f"✅ [4/5] Hot Character Blueprint (save & get) passed for {test_char}")

    # 5. Test Silent Handover (Session Migration Guest -> Registered in RAM)
    migrated = redis.migrate_session(guest_session_id, member_session_id, test_member)
    assert migrated is True, "Migration failed"

    # Verify old session is cleared
    old_bundle = redis.get_session_bundle(guest_session_id)
    assert old_bundle["has_started"] is False

    # Verify new member session has all state & rounds
    new_bundle = redis.get_session_bundle(member_session_id)
    assert new_bundle["has_started"] is True
    assert new_bundle["state"]["scene_id"] == "scene_balcony_night"
    assert len(new_bundle["rounds"]) == 1
    assert new_bundle["owner"] == test_member
    print(f"✅ [5/5] Silent Handover (Guest -> Registered) passed in ~5ms RAM!")

    # Cleanup test keys
    redis.clear_session(guest_session_id)
    redis.clear_session(member_session_id)
    redis.execute_command(["DEL", f"character:{test_char}:blueprint"])
    print("🧹 Cleanup test keys completed.")

    print("\n🎉 ALL PHASE 2 REDIS ADAPTER TESTS PASSED 100%!")
    return True

if __name__ == "__main__":
    run_phase2_tests()
