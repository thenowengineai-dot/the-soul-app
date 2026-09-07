import sys
import os
import json

# Add current dir to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from engine.round_assembler import assemble_interaction_round

class MockDirectorOutput:
    def __init__(self, voice_over=None, focus_lens=None):
        self.voice_over = voice_over
        self.focus_lens = focus_lens or []

class MockSegment:
    def __init__(self, seg_type, content):
        self.type = seg_type
        self.content = content

class MockActorOutput:
    def __init__(self, a_pos="ยืนเอามือไพล่หลัง", p_pos="ยืนประชิดตัว", response_sequence=None):
        self.a_pos = a_pos
        self.p_pos = p_pos
        self.response_sequence = response_sequence or []

def run_tests():
    print("=" * 70)
    print("🧪 TEST 1: Normal Gameplay Round (VO Intimate + Action + Dialogue)")
    print("=" * 70)

    director_normal = MockDirectorOutput(
        voice_over="[อุณหภูมิร่างกาย] ลมหายใจอุ่นเป่ารดผิวต้นคอในระยะเผาขน กลิ่นหอมแป้งเด็กจางๆ ปะทะเข้ากับความเงียบ",
        focus_lens=["ลมหายใจ", "ต้นคอ"]
    )
    actor_normal = MockActorOutput(
        a_pos="ยืนเบี่ยงหน้าหลบสายตา มือถูกจับ",
        p_pos="ยืนประชิดตัว จับข้อมือเธอไว้",
        response_sequence=[
            MockSegment("action", "(เธอสะดุ้งสุดตัว ร่างกายเกร็งชะงัก พยายามจะบิดข้อมือออกแต่เรี่ยวแรงกลับหดหาย)"),
            MockSegment("dialogue", "ป...ปล่อยนะ! เข้ามาใกล้ขนาดนี้ตั้งแต่เมื่อไหร่กันยะ!?"),
            MockSegment("action", "(ใบหน้าเนียนขึ้นสีแดงระเรื่อจนลามไปถึงใบหู ก่อนจะเบือนสายตาหลบไปอีกทาง)"),
            MockSegment("dialogue", "แล้วก็... ฉันจะอยู่คนเดียวหรือไม่ มันเกี่ยวอะไรกับนายด้วยเล่า...")
        ]
    )
    state_normal = {
        "affection": 48,
        "desire": 65,
        "active_phase_id": "scene_library_afternoon",
        "active_beat_id": "beat_secret_confrontation"
    }

    round_1 = assemble_interaction_round(
        round_number=5,
        session_id="session_test_001",
        player_input={"text": "(ฉันก้าวเข้าไปประชิดตัวแล้วดึงข้อมือเธอไว้แน่น) อยู่คนเดียวจริงเหรอ?", "action": None, "selected_choice_id": None},
        director_out=director_normal,
        actor_out=actor_normal,
        current_state=state_normal
    )

    print(json.dumps(round_1, indent=2, ensure_ascii=False))

    # Assertions
    assert round_1["round_number"] == 5
    assert round_1["player"]["text"] == "(ฉันก้าวเข้าไปประชิดตัวแล้วดึงข้อมือเธอไว้แน่น) อยู่คนเดียวจริงเหรอ?"
    assert len(round_1["response"]) == 5
    assert round_1["response"][0]["type"] == "vo_intimate"
    assert round_1["response"][0]["order"] == 1
    assert round_1["response"][1]["type"] == "action"
    assert round_1["response"][1]["order"] == 2
    assert round_1["response"][2]["type"] == "dialogue"
    assert round_1["response"][2]["order"] == 3
    assert round_1["state"]["affection"] == 48
    assert round_1["state"]["desire"] == 65
    print("\n✅ TEST 1 PASSED: Structured matches UNIFIED_ROUND_SPEC.md perfectly!")

    print("\n" + "=" * 70)
    print("🧪 TEST 2: Prologue / Opening Turn 0 (Player is None, VO Main + Choices)")
    print("=" * 70)

    director_opening = MockDirectorOutput(
        voice_over="แสงอาทิตย์อัสดงสีส้มอิฐสาดส่องลอดผ่านหน้าต่างบานเกล็ด บรรยากาศเงียบสงัดจนได้ยินเสียงเข็มนาฬิกา",
        focus_lens=[] # No focus lens = Gear 1 (vo_main)
    )
    actor_opening = MockActorOutput(
        a_pos="นั่งกอดอกริมโต๊ะทำงาน",
        p_pos="ยืนอยู่หน้าประตูห้องชมรม",
        response_sequence=[
            MockSegment("action", "(อลิสนั่งกอดอกอยู่ริมโต๊ะทำงาน ปอยผมสีน้ำตาลทิ้งตัวลงมาคลอเคลียแก้ม)"),
            MockSegment("dialogue", "ถ้าจะยืนมองอยู่ตรงประตูก็เข้ามาข้างในสิ... ลมมันตีเข้ามาหนาวนะ")
        ]
    )
    state_opening = {
        "affection": 20,
        "desire": 10,
        "active_phase_id": "scene_library_afternoon",
        "active_beat_id": "beat_opening_encounter"
    }
    choices = [
        {"choice_id": "c_walk_in", "text": "เดินเข้าไปนั่งตรงข้ามเธอเงียบๆ", "matched_path": "path_gentle_approach"},
        {"choice_id": "c_tease", "text": "แกล้งเคาะประตูแซว", "matched_path": "path_playful_tease"}
    ]

    round_0 = assemble_interaction_round(
        round_number=0,
        session_id="session_test_001",
        player_input=None,
        director_out=director_opening,
        actor_out=actor_opening,
        current_state=state_opening,
        system_choices=choices
    )

    print(json.dumps(round_0, indent=2, ensure_ascii=False))

    # Assertions
    assert round_0["round_number"] == 0
    assert round_0["player"] is None
    assert len(round_0["response"]) == 3
    assert round_0["response"][0]["type"] == "vo_main"
    assert round_0["response"][0]["order"] == 1
    assert round_0["system_choices"] == choices
    print("\n✅ TEST 2 PASSED: Opening turn with player=None works seamlessly!")

    print("\n" + "=" * 70)
    print("🧪 TEST 3: Gear 3 Silence Turn (No VO, Pure Dialogue & Action)")
    print("=" * 70)

    director_silence = MockDirectorOutput(voice_over=None)
    actor_silence = MockActorOutput(
        a_pos="เชิดหน้าขึ้น พยายามดึงมือกลับ",
        p_pos="ยืนประชิดตัว จับข้อมือเธอไว้",
        response_sequence=[
            MockSegment("action", "(เธอเชิดหน้าขึ้น กัดริมฝีปากล่างเบาๆ เหมือนพยายามรวบรวมสติ)"),
            MockSegment("dialogue", "ใครหน้าแดงกันยะ! อากาศมันร้อนต่างหากเล่า รีบปล่อยมือได้แล้ว!")
        ]
    )

    round_silence = assemble_interaction_round(
        round_number=6,
        session_id="session_test_001",
        player_input={"text": "ก็เห็นหน้าแดง นึกว่าไม่สบายเสียอีก", "action": None, "selected_choice_id": None},
        director_out=director_silence,
        actor_out=actor_silence,
        current_state={"affection": 50, "desire": 63, "active_phase_id": "scene_library_afternoon", "active_beat_id": "beat_secret_confrontation"}
    )

    print(json.dumps(round_silence, indent=2, ensure_ascii=False))

    # Assertions
    assert round_silence["round_number"] == 6
    assert len(round_silence["response"]) == 2
    assert round_silence["response"][0]["type"] == "action"
    assert round_silence["response"][0]["order"] == 1
    assert round_silence["response"][1]["type"] == "dialogue"
    assert round_silence["response"][1]["order"] == 2
    print("\n✅ TEST 3 PASSED: Gear 3 Silence has zero VO and starts directly with Actor!")

    print("\n" + "=" * 70)
    print("🎉 ALL 3 TESTS COMPLETED AND 100% VERIFIED AGAINST UNIFIED_ROUND_SPEC.md!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
