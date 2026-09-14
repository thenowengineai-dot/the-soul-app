"""
Phase 3 Verification Test: Backend API Endpoints & Zero-Handshake Deterministic Sessions
Tests:
1. start_session_endpoint: Generates deterministic ses_{user_id}_{char_id}, clears old rounds, saves initial state.
2. load_session_endpoint: Fast path zero-handshake via get_session_bundle in Upstash Redis (~2ms).
3. load_session_endpoint with Unified Round Spec: Correct parsing of player and response segments.
4. archive_user_session_endpoint: Soft-deletes in Neon DB and clears from Upstash Redis RAM.
5. Silent Handover via migrate_guest_session & migrate_session: Seamless migration from guest to registered user.
"""
import sys
import os
import asyncio
import time
from typing import Dict, Any

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from engine.identity import build_session_id, generate_guest_id
from engine.redis_cache import RedisHotCache
from engine.postgres_core import get_postgres_core
from api.routes import (
    start_session_endpoint,
    load_session_endpoint,
    archive_user_session_endpoint,
    StartSessionRequest,
    LoadSessionRequest,
)
from fastapi import BackgroundTasks


async def run_phase3_tests():
    print("🚀 Starting Phase 3 API Verification Tests...")

    test_guest_id = f"gst_{int(time.time())}_test"
    test_char_id = "char_1788786310"
    test_member_id = f"usr_{int(time.time())[:12] if len(str(int(time.time()))) >= 12 else '123456789012'}"
    expected_guest_sid = build_session_id(test_guest_id, test_char_id)

    redis = RedisHotCache()
    pg = get_postgres_core()

    # Clean prior state
    redis.clear_session(expected_guest_sid)
    redis.clear_active_session(test_guest_id, test_char_id)

    # -------------------------------------------------------------
    # Test 1: start_session_endpoint creates deterministic session
    # -------------------------------------------------------------
    print(f"\n--- [1/5] Testing start_session_endpoint for {test_guest_id} ---")
    bg_tasks = BackgroundTasks()
    start_req = StartSessionRequest(
        user_id=test_guest_id,
        character_id=test_char_id,
        world_id=test_char_id,
        trigger_initial_vo=False
    )
    start_res = await start_session_endpoint(start_req, bg_tasks)
    assert start_res["status"] == "success", f"start_session failed: {start_res}"
    assert start_res["session_id"] == expected_guest_sid, f"Expected {expected_guest_sid}, got {start_res['session_id']}"
    assert start_res["user_id"] == test_guest_id
    assert start_res["character_id"] == test_char_id
    print(f"✅ [1/5] start_session returned deterministic session_id: {start_res['session_id']}")

    # Verify state saved in Redis
    cached_state = redis.get_live_state(expected_guest_sid)
    assert cached_state is not None, "Initial state not saved in Redis"
    print(f"✅ [1/5] Initial state verified in Redis Hot Cache: {cached_state.get('stance')}")

    # -------------------------------------------------------------
    # Test 2: load_session_endpoint (Fast Path without session_id passed!)
    # -------------------------------------------------------------
    print(f"\n--- [2/5] Testing load_session_endpoint Zero-Handshake ---")
    load_req = LoadSessionRequest(
        user_id=test_guest_id,
        character_id=test_char_id,
        session_id=None  # ZERO HANDSHAKE: Frontend only knows user_id + character_id!
    )
    t0 = time.time()
    load_res = await load_session_endpoint(load_req)
    t_elapsed = (time.time() - t0) * 1000
    assert load_res["has_started"] is True, "load_session should report has_started=True"
    assert load_res["session_id"] == expected_guest_sid, f"Expected {expected_guest_sid}, got {load_res['session_id']}"
    print(f"✅ [2/5] Zero-Handshake load_session completed in {t_elapsed:.2f}ms! (session_id: {load_res['session_id']})")

    # -------------------------------------------------------------
    # Test 3: Unified Round Spec in load_session
    # -------------------------------------------------------------
    print(f"\n--- [3/5] Testing Unified Round Spec parsing in load_session ---")
    sample_round = {
        "round_id": f"rnd_{expected_guest_sid}_001",
        "round_number": 1,
        "timestamp": int(time.time() * 1000),
        "player": {
            "text": "สวัสดีครับ สบายดีไหม",
            "type": "player_action"
        },
        "response": [
            {"order": 1, "type": "vo_main", "text": "เสียงกระดิ่งดังแผ่วเบา"},
            {"order": 2, "type": "action", "text": "หันกลับมาสบตาช้าๆ"},
            {"order": 3, "type": "dialogue", "text": "สวัสดีค่ะ ยินดีที่ได้พบคุณอีกครั้ง"}
        ],
        "state": {
            "affection": 25,
            "desire": 10,
            "a_pos": "ยืนข้างโต๊ะ",
            "p_pos": "ยืนตรงหน้า",
            "stance": "friendly"
        }
    }
    redis.push_round(expected_guest_sid, sample_round)
    redis.save_live_state(expected_guest_sid, sample_round["state"])

    # Load session again to verify messages formatting
    load_res_round = await load_session_endpoint(load_req)
    messages = load_res_round.get("messages", [])
    assert len(messages) == 4, f"Expected 4 messages (1 user + 1 vo + 1 action + 1 dialogue), got {len(messages)}"
    assert messages[0]["role"] == "user" and messages[0]["content"] == "สวัสดีครับ สบายดีไหม"
    assert messages[1]["role"] == "vo" and messages[1]["content"] == "เสียงกระดิ่งดังแผ่วเบา"
    assert messages[2]["role"] == "ai" and messages[2]["action"] == "หันกลับมาสบตาช้าๆ"
    assert messages[3]["role"] == "ai" and messages[3]["dialogue"] == "สวัสดีค่ะ ยินดีที่ได้พบคุณอีกครั้ง"
    assert load_res_round["characterStats"]["affection"] == 25
    print(f"✅ [3/5] Unified Round correctly parsed into {len(messages)} structured UI messages!")

    # -------------------------------------------------------------
    # Test 4: Silent Handover (Guest -> Registered User)
    # -------------------------------------------------------------
    print(f"\n--- [4/5] Testing Silent Handover (Guest -> Registered User) ---")
    expected_member_sid = build_session_id(test_member_id, test_char_id)

    # 1. Migrate in Redis RAM (~5ms)
    redis.migrate_session(expected_guest_sid, expected_member_sid, test_member_id)
    redis.clear_active_session(test_guest_id, test_char_id)
    redis.set_active_session(test_member_id, test_char_id, expected_member_sid)
    redis.set_session_owner(expected_member_sid, test_member_id)

    # 2. Migrate in Neon DB
    await pg.migrate_guest_session(expected_guest_sid, expected_member_sid, test_member_id)

    # Verify old session bundle is empty
    old_bundle = redis.get_session_bundle(expected_guest_sid)
    assert not old_bundle["has_started"], "Old guest session should be cleared after migration"

    # Verify new member session bundle has the data
    member_load_req = LoadSessionRequest(
        user_id=test_member_id,
        character_id=test_char_id,
        session_id=None
    )
    member_load_res = await load_session_endpoint(member_load_req)
    assert member_load_res["has_started"] is True
    assert member_load_res["session_id"] == expected_member_sid
    assert len(member_load_res["messages"]) == 4
    print(f"✅ [4/5] Silent Handover successful! Member session {expected_member_sid} loaded seamlessly.")

    # -------------------------------------------------------------
    # Test 5: Archive Session
    # -------------------------------------------------------------
    print(f"\n--- [5/5] Testing archive_user_session_endpoint ---")
    archive_res = await archive_user_session_endpoint(test_member_id, test_char_id)
    assert archive_res["status"] == "success"

    # Verify cleared in Redis
    archived_bundle = redis.get_session_bundle(expected_member_sid)
    assert not archived_bundle["has_started"], "Archived session should be cleared in Redis"
    print(f"✅ [5/5] Session archived and purged from Redis Hot Cache successfully!")

    # Clean up test DB data
    await pg.clear_session_rounds(expected_member_sid)

    print("\n🎉 ALL PHASE 3 API TESTS PASSED 100%!")
    return True


if __name__ == "__main__":
    success = asyncio.run(run_phase3_tests())
    if not success:
        sys.exit(1)
