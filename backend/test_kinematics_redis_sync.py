import sys
import os
import uuid

# Add current dir to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from engine.redis_cache import RedisHotCache
from engine.round_assembler import assemble_interaction_round

class MockActorOutput:
    def __init__(self, a_pos, p_pos, response_sequence):
        self.a_pos = a_pos
        self.p_pos = p_pos
        self.response_sequence = response_sequence

class MockSegment:
    def __init__(self, type_name, content):
        self.type = type_name
        self.content = content

def test_kinematics_sync():
    print("==================================================")
    print("🥋 TESTING REAL-TIME A_POS / P_POS SYNC ON REDIS")
    print("==================================================")

    cache = RedisHotCache()
    session_id = f"session_kinematics_{uuid.uuid4().hex[:6]}"
    cache.clear_session(session_id)

    # ----------------------------------------------------
    # TURN 1: Initial Encounter
    # ----------------------------------------------------
    print("\n[TURN 1] Bot starts leaning against locker, Player stands 2 steps away...")
    init_state = {
        "a_pos": "ยืนกอดอกพิงตู้ล็อกเกอร์",
        "p_pos": "ยืนอยู่ห่าง 2 ก้าว",
        "affection": 20,
        "desire": 10,
        "scene_id": "locker_room",
        "beat_id": "beat_01"
    }
    # Save initial state to Redis Hot Cache
    cache.save_live_state(session_id, init_state)
    
    # Assemble Turn 1 round
    actor_t1 = MockActorOutput(
        a_pos="ยืนกอดอกพิงตู้ล็อกเกอร์",
        p_pos=None,
        response_sequence=[MockSegment("dialogue", "มองอะไร... มีธุระอะไรกับฉันเหรอ?")]
    )
    round1 = assemble_interaction_round(
        round_number=1,
        session_id=session_id,
        player_input={"text": "สวัสดีครับอลิส", "action": None, "selected_choice_id": None},
        director_out=None,
        actor_out=actor_t1,
        current_state=init_state
    )
    cache.push_round(session_id, round1)

    # Verify Turn 1 in Redis
    cached_s1 = cache.get_live_state(session_id)
    print(f"Turn 1 Live State in Redis: A_POS='{cached_s1['a_pos']}', P_POS='{cached_s1['p_pos']}'")
    assert cached_s1["a_pos"] == "ยืนกอดอกพิงตู้ล็อกเกอร์"
    assert cached_s1["p_pos"] == "ยืนอยู่ห่าง 2 ก้าว"

    # ----------------------------------------------------
    # TURN 2: Physical Interaction (Player moves in, Bot reacts)
    # ----------------------------------------------------
    print("\n[TURN 2] Player grabs wrist -> Evaluator updates P_POS -> Actor reacts with new A_POS...")
    
    # Engine loads state from Redis
    current_live = cache.get_live_state(session_id)
    player_posture = current_live["p_pos"]
    actor_posture = current_live["a_pos"]

    # Player acts: "เดินประชิดตัวและจับข้อมือเธอไว้"
    # Evaluator updates player_posture:
    player_posture = "ยืนประชิดตัว จับข้อมือเธอไว้แน่น"

    # Actor reacts:
    actor_t2 = MockActorOutput(
        a_pos="สะดุ้งตัวโยน ใบหน้าแดงซ่าน พยายามบิดข้อมือออก",
        p_pos=None, # actor doesn't force player position
        response_sequence=[
            MockSegment("action", "(เธอพยายามบิดข้อมือออกแต่เรี่ยวแรงกลับหดหาย)"),
            MockSegment("dialogue", "ป...ปล่อยนะ! เข้ามาใกล้ขนาดนี้ทำไม!?")
        ]
    )
    if actor_t2.a_pos:
        actor_posture = actor_t2.a_pos

    turn2_state = {
        "actor_posture": actor_posture,
        "player_posture": player_posture,
        "affection": 25,
        "desire": 30,
        "scene_id": "locker_room",
        "beat_id": "beat_02"
    }

    round2 = assemble_interaction_round(
        round_number=2,
        session_id=session_id,
        player_input={"text": "(ก้าวเข้าไปประชิดตัวแล้วจับข้อมือเธอไว้) ไม่ให้ไปหรอก", "action": None, "selected_choice_id": None},
        director_out=None,
        actor_out=actor_t2,
        current_state=turn2_state
    )

    # Sync Turn 2 to Redis Hot Cache
    new_live_state = {
        "a_pos": actor_posture,
        "p_pos": player_posture,
        "affection": 25,
        "desire": 30,
        "scene_id": "locker_room",
        "beat_id": "beat_02"
    }
    cache.save_live_state(session_id, new_live_state)
    cache.push_round(session_id, round2)

    # ----------------------------------------------------
    # VERIFY REDIS PERSISTENCE
    # ----------------------------------------------------
    print("\n[VERIFICATION] Inspecting Redis Hot Cache after Turn 2...")
    final_live = cache.get_live_state(session_id)
    print(f"✅ Final Redis Live State: A_POS='{final_live['a_pos']}' | P_POS='{final_live['p_pos']}'")
    assert final_live["a_pos"] == "สะดุ้งตัวโยน ใบหน้าแดงซ่าน พยายามบิดข้อมือออก"
    assert final_live["p_pos"] == "ยืนประชิดตัว จับข้อมือเธอไว้แน่น"

    cached_rounds = cache.get_recent_rounds(session_id)
    print(f"✅ Cached Rounds count: {len(cached_rounds)}")
    assert len(cached_rounds) == 2
    assert cached_rounds[0]["state"]["a_pos"] == "ยืนกอดอกพิงตู้ล็อกเกอร์"
    assert cached_rounds[1]["state"]["a_pos"] == "สะดุ้งตัวโยน ใบหน้าแดงซ่าน พยายามบิดข้อมือออก"
    assert cached_rounds[1]["state"]["p_pos"] == "ยืนประชิดตัว จับข้อมือเธอไว้แน่น"

    # Cleanup
    cache.clear_session(session_id)
    print("✅ Cleaned up test session.")

    print("\n==================================================")
    print("🎉 A_POS AND P_POS KINEMATICS ARE FULLY OPERATIONAL ON REDIS!")
    print("==================================================")

if __name__ == "__main__":
    test_kinematics_sync()
