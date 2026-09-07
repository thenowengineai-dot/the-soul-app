import logging
from typing import Dict, Any, Tuple

# ==========================================
# 📈 THE STATE MANAGER (ผู้จัดการสถานะและการเติบโต)
# ==========================================
# หน้าที่: คอยบวกลบคะแนน Affection / Desire จาก Evaluator
# และตรวจสอบเงื่อนไขการอัปเลเวล (Phase Evolution) เพื่อเปลี่ยนสเตตัสตัวละคร
# ==========================================

logger = logging.getLogger("STATE_MANAGER")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - \033[93m[STATE]\033[0m - %(message)s")

class StateManager:
    def __init__(self):
        """
        กำหนดค่าเริ่มต้นให้ State Manager
        ในอนาคตคุณสามารถเพิ่มการเชื่อมต่อกับ Database (SQL/NoSQL) ตรงนี้ได้ 
        เพื่อดึงและเซฟคะแนนผู้เล่นอย่างถาวร
        """
        logger.info("State Manager Initialized.")

    def apply_score_deltas(
        self, 
        current_affection: int, 
        current_desire: int, 
        affection_delta: int, 
        desire_delta: int
    ) -> Tuple[int, int]:
        """
        นำคะแนนที่ได้จาก Evaluator (+/-) มาบวกเข้ากับคะแนนปัจจุบัน
        และป้องกันไม่ให้คะแนนติดลบต่ำกว่า 0 หรือเกินขีดจำกัดสูงสุด (เช่น 100)
        """
        new_affection = max(0, min(100, current_affection + affection_delta))
        new_desire = max(0, min(100, current_desire + desire_delta))
        
        # Log แจ้งเตือนถ้าคะแนนมีการขยับ
        if affection_delta != 0 or desire_delta != 0:
            logger.info(f"Scores Updated: Affection {current_affection}->{new_affection} | Desire {current_desire}->{new_desire}")
            
        return new_affection, new_desire

    def check_and_apply_evolution(
        self, 
        character_data: Dict[str, Any], 
        current_affection: int, 
        current_desire: int
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        ตรวจสอบว่าคะแนนถึงเกณฑ์ที่จะอัปเลเวล (Phase) หรือยัง
        ถ้าถึงแล้ว จะทำการอัปเดต core_stats ของตัวละครให้เติบโตขึ้นตามที่ตั้งค่าไว้ใน JSON
        
        :return: (is_evolved: bool, updated_character_data: dict)
        """
        current_phase = character_data.get("current_phase", 1)
        evolution_data = character_data.get("dynamic_evolution", {})
        
        # ตรวจสอบว่ามีข้อมูลของ Phase ถัดไปเตรียมไว้หรือไม่
        next_phase_key = f"phase_{current_phase + 1}"
        
        if next_phase_key not in evolution_data:
            # ไม่มี Phase ถัดไปให้เลื่อนขั้นแล้ว (Max Level)
            return False, character_data

        next_phase_info = evolution_data[next_phase_key]
        reqs = next_phase_info.get("requirements", {})
        
        req_affection = reqs.get("affection_min", 999)
        req_desire = reqs.get("desire_min", 999)

        # 🎯 เช็กเงื่อนไข: ผ่านเกณฑ์ทั้งสองหลอดหรือไม่?
        if current_affection >= req_affection and current_desire >= req_desire:
            logger.info(f"\n✨ \033[92m[EVOLUTION TRIGGERED]\033[0m {character_data['name']} เลื่อนขั้นเป็น Phase {current_phase + 1}! ✨")
            logger.info(f"คำอธิบาย: {next_phase_info.get('phase_description', 'ไม่มีคำอธิบาย')}")

            # 1. อัปเดตเลข Phase ปัจจุบัน
            character_data["current_phase"] = current_phase + 1
            
            # 2. เขียนทับ 7 สเตตัสหลัก (core_stats) เพื่อให้ตัวละครนิสัยเปลี่ยนไป!
            stat_changes = next_phase_info.get("stat_changes", {})
            if stat_changes:
                for stat, new_value in stat_changes.items():
                    old_value = character_data["core_stats"].get(stat, 0)
                    character_data["core_stats"][stat] = new_value
                    logger.info(f"  -> สเตตัส {stat.upper()} เปลี่ยนจาก {old_value} เป็น {new_value}")

            return True, character_data
        
        # ยังไม่ผ่านเกณฑ์
        return False, character_data

# ==========================================
# 🧪 ตัวอย่างการทดสอบระบบ State Manager
# ==========================================
if __name__ == "__main__":
    # Mock Data ตัวละครที่กำลังจะเลื่อนขั้น
    mock_character = {
        "name": "เม (May)",
        "current_phase": 1,
        "core_stats": {
            "initiative": 7, "honesty": 2, "expressiveness": 1, 
            "formality": 4, "playfulness": 2, "dominance": 6, "physicality": 8
        },
        "dynamic_evolution": {
            "phase_2": {
                "requirements": {"affection_min": 50, "desire_min": 30},
                "stat_changes": {"honesty": 6, "expressiveness": 3, "physicality": 10},
                "phase_description": "ความสัมพันธ์ลึกซึ้งขึ้น กำแพงความซึนลดลง กล้าสกินชิพหนักขึ้น"
            }
        }
    }

    state_manager = StateManager()
    
    print("--- จำลองการได้คะแนนจาก Evaluator ---")
    current_aff, current_des = 48, 28
    
    # รอบที่ 1: คะแนนขึ้น แต่ยังไม่ถึงเกณฑ์ (ขาดอีกนิดเดียว)
    current_aff, current_des = state_manager.apply_score_deltas(current_aff, current_des, affection_delta=1, desire_delta=1)
    is_evolved, mock_character = state_manager.check_and_apply_evolution(mock_character, current_aff, current_des)
    print(f"ผลรอบ 1: อัปเลเวลไหม? {is_evolved}\n")

    # รอบที่ 2: คะแนนถึงเกณฑ์เป๊ะ!
    current_aff, current_des = state_manager.apply_score_deltas(current_aff, current_des, affection_delta=2, desire_delta=5)
    is_evolved, mock_character = state_manager.check_and_apply_evolution(mock_character, current_aff, current_des)
    print(f"ผลรอบ 2: อัปเลเวลไหม? {is_evolved}")
    print(f"สเตตัสใหม่ของเม: {mock_character['core_stats']}")