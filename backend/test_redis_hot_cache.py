import sys
import os
import uuid

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from engine.redis_cache import RedisHotCache

def run_verification():
    print("==================================================")
    print("🚀 TESTING UPSTASH REDIS HOT CACHE MODULE")
    print("==================================================")

    cache = RedisHotCache()

    # 1. Test Ping
    print("\n[STEP 1] Testing Ping...")
    is_alive = cache.ping()
    print(f"Ping result: {is_alive}")
    assert is_alive, "❌ Redis ping failed! Check credentials or connection."
    print("✅ Redis is ONLINE and authenticated!")

    # 2. Test Sliding Window of Rounds
    session_id = f"test_session_{uuid.uuid4().hex[:8]}"
    print(f"\n[STEP 2] Testing 25 Rounds Sliding Window on session: {session_id}")

    # Clean up before start
    cache.clear_session(session_id)

    # Push 25 rounds (simulating 25 turns)
    for i in range(1, 26):
        sample_round = {
            "round_number": i,
            "session_id": session_id,
            "timestamp": "2026-09-08T00:00:00Z",
            "player": {
                "text": f"Player turn message #{i}",
                "input_type": "text"
            },
            "response": [
                {
                    "order": 1,
                    "type": "dialogue",
                    "speaker": "bot",
                    "text": f"Response for round #{i}"
                }
            ],
            "state": {
                "affection": 50 + i,
                "desire": 20 + i,
                "scene_id": "scene_test",
                "beat_id": f"beat_{i}"
            }
        }
        cache.push_round(session_id, sample_round, max_window=20)

    # Retrieve recent rounds
    recent_rounds = cache.get_recent_rounds(session_id, limit=20)
    print(f"Fetched {len(recent_rounds)} rounds from Redis.")
    assert len(recent_rounds) == 20, f"Expected 20 rounds, but got {len(recent_rounds)}"

    first_fetched_round = recent_rounds[0]["round_number"]
    last_fetched_round = recent_rounds[-1]["round_number"]
    print(f"First cached round number: {first_fetched_round} (Expected: 6)")
    print(f"Last cached round number: {last_fetched_round} (Expected: 25)")
    assert first_fetched_round == 6, f"Expected first round to be 6, got {first_fetched_round}"
    assert last_fetched_round == 25, f"Expected last round to be 25, got {last_fetched_round}"
    print("✅ Sliding Window (LTRIM -20 -1) works perfectly! Only the 20 most recent rounds are retained.")

    # 3. Test Live State Snapshot
    print("\n[STEP 3] Testing Live State Snapshot...")
    live_state = {
        "affection": 75,
        "desire": 45,
        "a_pos": "center_stage",
        "p_pos": "front_left",
        "scene_id": "scene_bedroom",
        "beat_id": "beat_climax_01"
    }
    ok = cache.save_live_state(session_id, live_state)
    assert ok, "Failed to save live state"

    fetched_state = cache.get_live_state(session_id)
    print("Fetched state:", fetched_state)
    assert fetched_state == live_state, f"State mismatch: {fetched_state} != {live_state}"
    print("✅ Live State Save/Fetch works perfectly!")

    # 4. Cleanup
    print("\n[STEP 4] Cleaning up test session...")
    cache.clear_session(session_id)
    cleared_rounds = cache.get_recent_rounds(session_id)
    cleared_state = cache.get_live_state(session_id)
    assert len(cleared_rounds) == 0, "Rounds were not cleared"
    assert cleared_state is None, "State was not cleared"
    print("✅ Test session cleaned up successfully!")

    print("\n==================================================")
    print("🎉 ALL TESTS PASSED! UPSTASH REDIS IS READY FOR PRODUCTION!")
    print("==================================================")

if __name__ == "__main__":
    run_verification()
