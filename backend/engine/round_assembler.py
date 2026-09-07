import time
import re
from typing import Dict, Any, List, Optional

def assemble_interaction_round(
    round_number: int,
    session_id: str,
    player_input: Optional[Dict[str, Any]],
    director_out: Any,
    actor_out: Any,
    current_state: Dict[str, Any],
    system_choices: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    แพ็กผลลัพธ์ทั้งหมดของ 1 เทิร์นเป็นก้อน UnifiedInteractionRound ก้อนเดียว
    ตามพิมพ์เขียว UNIFIED_ROUND_SPEC.md เพื่อแก้ปัญหา Out-of-Order Segments ถาวร
    """
    timestamp = int(time.time() * 1000)
    round_id = f"round_{timestamp}_{round_number:03d}"
    response_segments = []
    current_order = 1

    # 1. Voice Over จาก Director (ถ้ามี Gear 1 หรือ Gear 2)
    vo_text = getattr(director_out, "voice_over", None)
    if vo_text and str(vo_text).strip() and str(vo_text).strip().lower() not in ["none", "null", "false"]:
        focus_lens = getattr(director_out, "focus_lens", None)
        is_intimate = bool(focus_lens and len(focus_lens) > 0)
        vo_type = "vo_intimate" if is_intimate else "vo_main"

        cleaned_vo = " ".join(re.sub(r'\[.*?\]|\(.*?\)', '', str(vo_text)).split())
        if cleaned_vo:
            response_segments.append({
                "order": current_order,
                "type": vo_type,
                "text": cleaned_vo
            })
            current_order += 1

    # 2. Fluid Array จาก Actor (Action / Dialogue)
    if actor_out and getattr(actor_out, "response_sequence", None):
        for seg in actor_out.response_sequence:
            seg_type = getattr(seg, "type", "dialogue")
            content = getattr(seg, "content", "")
            if content and str(content).strip():
                response_segments.append({
                    "order": current_order,
                    "type": seg_type,
                    "text": str(content).strip()
                })
                current_order += 1

    # 3. ประกอบเป็น 1 Unified Round สมบูรณ์
    unified_round = {
        "round_id": round_id,
        "round_number": round_number,
        "timestamp": timestamp,
        "player": player_input,
        "response": response_segments,
        "system_choices": system_choices if system_choices else None,
        "state": {
            "affection": current_state.get("affection", 0),
            "desire": current_state.get("desire", 0),
            "a_pos": getattr(actor_out, "a_pos", None) or current_state.get("actor_posture") or "ยืนปกติ",
            "p_pos": getattr(actor_out, "p_pos", None) or current_state.get("player_posture") or "ยืนปกติ",
            "scene_id": current_state.get("active_phase_id") or current_state.get("scene_id"),
            "beat_id": current_state.get("active_beat_id") or current_state.get("beat_id")
        }
    }
    return unified_round
