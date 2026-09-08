from __future__ import annotations
import os
import logging
from typing import Optional, List, Dict, Tuple, Any

logger = logging.getLogger("TRANSITIONS")

DEFAULT_WORLD_ID = "lacquered_glasses_black_lace_secret_01"

ID_TO_WORLD_MAP: Dict[str, str] = {
    "1": "lacquered_glasses_black_lace_secret_01",
    "2": "secret_signal_after_school_01",
    "3": "midnight_deadline_01",
    "4": "starry_land_01",
    "5": "stadium_under_bleachers_01",
    "6": "aces_secret_lesson_01",
    "cher": "stadium_under_bleachers_01",
    "may": "aces_secret_lesson_01",
    "shin": "lacquered_glasses_black_lace_secret_01",
    "ayoung": "lacquered_glasses_black_lace_secret_01",
    "lacquered_glasses": "lacquered_glasses_black_lace_secret_01",
}

def resolve_world_file_path(target_world_id: Optional[str]) -> Tuple[str, str]:
    """
    คืนค่า (resolved_world_id, resolved_file_path)
    รองรับทั้ง numeric ID, shortcut key, และ path resolution ทั้งแบบ Local และ Cloud
    """
    clean_id = str(target_world_id).strip() if target_world_id else ""
    if clean_id in ID_TO_WORLD_MAP:
        clean_id = ID_TO_WORLD_MAP[clean_id]
    
    if not clean_id or clean_id == "None":
        clean_id = DEFAULT_WORLD_ID

    candidate_paths = [
        f"data/worlds/{clean_id}.json",
        os.path.join(os.path.dirname(__file__), "..", "data", "worlds", f"{clean_id}.json"),
        os.path.join(os.path.dirname(__file__), "data", "worlds", f"{clean_id}.json"),
    ]
    for p in candidate_paths:
        if os.path.exists(p):
            return clean_id, os.path.abspath(p)

    fallback_paths = [
        f"data/worlds/{DEFAULT_WORLD_ID}.json",
        os.path.join(os.path.dirname(__file__), "..", "data", "worlds", f"{DEFAULT_WORLD_ID}.json"),
    ]
    for p in fallback_paths:
        if os.path.exists(p):
            return DEFAULT_WORLD_ID, os.path.abspath(p)

    return clean_id, candidate_paths[0]


class SceneTransitionManager:
    @staticmethod
    def normalize_scenes(event_data: dict) -> list[dict]:
        """
        Normalizes 'phases' or 'scenes' (dict or list) from event_data into a uniform list:
        [
            {
                "scene_id": str,
                "scene_title": str,
                "phase_objective": str,
                "director_setup": str,
                "beats": list[dict],
                ...
            }
        ]
        """
        if not event_data or not isinstance(event_data, dict):
            return []
        raw = event_data.get("phases")
        if raw is None:
            raw = event_data.get("scenes")
        if raw is None:
            return []
        
        normalized = []
        if isinstance(raw, dict):
            for key, val in raw.items():
                if isinstance(val, dict):
                    s = dict(val)
                    s["scene_id"] = s.get("scene_id") or s.get("phase_id") or key
                    s["scene_title"] = s.get("scene_title") or key
                    normalized.append(s)
                elif isinstance(val, list):
                    normalized.append({
                        "scene_id": key,
                        "scene_title": key,
                        "beats": val
                    })
        elif isinstance(raw, list):
            for idx, item in enumerate(raw):
                if isinstance(item, dict):
                    s = dict(item)
                    s["scene_id"] = s.get("scene_id") or s.get("phase_id") or s.get("name") or f"scene_{idx+1}"
                    s["scene_title"] = s.get("scene_title") or s.get("name") or s["scene_id"]
                    normalized.append(s)
        return normalized

    @staticmethod
    def get_first_phase_and_beat(event_data: dict) -> tuple[str | None, str | None]:
        scenes = SceneTransitionManager.normalize_scenes(event_data)
        if not scenes:
            return None, None
        first_scene = scenes[0]
        first_scene_id = first_scene.get("scene_id")
        beats = first_scene.get("beats", [])
        first_beat_id = beats[0].get("beat_id") if beats and isinstance(beats[0], dict) else None
        return first_scene_id, first_beat_id

    @staticmethod
    def get_scene_data(event_data: dict, scene_id: str) -> dict:
        scenes = SceneTransitionManager.normalize_scenes(event_data)
        for s in scenes:
            if s.get("scene_id") == scene_id:
                return s
        return {}

    @staticmethod
    def get_beat_data(event_data: dict, scene_id: str, beat_id: str) -> dict:
        scene = SceneTransitionManager.get_scene_data(event_data, scene_id)
        beats = scene.get("beats", [])
        for b in beats:
            if isinstance(b, dict) and b.get("beat_id") == beat_id:
                return b
        if beats and isinstance(beats[0], dict):
            return beats[0]
        return {}

    @staticmethod
    def resolve_next_beat(
        event_data: dict, 
        current_scene_id: str, 
        current_beat_id: str, 
        matched_path: str = None, 
        target_beat_id: str = None
    ) -> tuple[str, str | None, str | None]:
        """
        Resolves the next scene and beat based on Direct Target, Tagging/Matched Path, or Waterfall Flow.
        Returns: (resolved_scene_id, resolved_beat_id, transition_bridge_prompt)
        """
        scenes = SceneTransitionManager.normalize_scenes(event_data)
        if not scenes:
            return "completed", None, None

        # 1. Direct Target Beat Resolution (from auto_progress or player_choices)
        if target_beat_id:
            # Check current scene first
            curr_scene = SceneTransitionManager.get_scene_data(event_data, current_scene_id)
            if any(b.get("beat_id") == target_beat_id for b in curr_scene.get("beats", []) if isinstance(b, dict)):
                return current_scene_id, target_beat_id, None
            # Check other scenes
            for s in scenes:
                if any(b.get("beat_id") == target_beat_id for b in s.get("beats", []) if isinstance(b, dict)):
                    target_scene_id = s.get("scene_id")
                    bridge = (
                        f"🎬 [DIRECTOR BRIDGE]: บีตก่อนหน้าได้เสร็จสิ้นลงแล้ว ตอนนี้เรากำลังก้าวเข้าสู่ฉากใหม่คือ '{target_scene_id}' "
                        "จงบรรยายการเคลื่อนย้ายหรือเปิดตัวเข้าสู่สถานที่/เหตุการณ์ใหม่นี้อย่างเป็นธรรมชาติ"
                    )
                    return target_scene_id, target_beat_id, bridge

        # 2. Tagging / Matched path
        if matched_path:
            target_scene = next((s for s in scenes if s.get("entry_path_id") == matched_path or s.get("scene_id") == matched_path), None)
            if target_scene:
                target_scene_id = target_scene.get("scene_id")
                beats = target_scene.get("beats", [])
                bridge = None
                if target_scene_id != current_scene_id:
                    bridge = (
                        f"🎬 [DIRECTOR BRIDGE]: ผู้เล่นเพิ่งกระทำการบางอย่าง (เลือกเส้นทาง {matched_path}) "
                        f"ตอนนี้เรากำลังเปลี่ยนเข้าสู่ฉากใหม่คือ '{target_scene_id}' "
                        "จงบรรยายผลลัพธ์ของการกระทำเดิม พร้อมกับเปิดเผยสภาพแวดล้อมของฉากใหม่ให้กลมกลืนเป็นเนื้อเดียวกัน"
                    )
                return target_scene_id, (beats[0].get("beat_id") if beats else None), bridge
            else:
                logger.warning(f"⚠️ ไม่พบ Scene ที่มี entry_path_id หรือ scene_id '{matched_path}', กำลังใช้ Waterfall Flow แทน")

        # 3. Waterfall Flow
        current_scene_index = next((i for i, s in enumerate(scenes) if s.get("scene_id") == current_scene_id), -1)
        if current_scene_index == -1:
            current_scene_index = 0

        current_scene = scenes[current_scene_index]
        beats = current_scene.get("beats", [])
        current_beat_index = next((i for i, b in enumerate(beats) if b.get("beat_id") == current_beat_id), -1)

        if current_beat_index != -1 and current_beat_index + 1 < len(beats):
            return current_scene.get("scene_id", current_scene_id), beats[current_beat_index + 1].get("beat_id"), None

        # Out of beats in this scene, move to next scene
        if current_scene_index + 1 < len(scenes):
            next_scene = scenes[current_scene_index + 1]
            next_scene_id = next_scene.get("scene_id")
            next_beats = next_scene.get("beats", [])
            next_beat_id = next_beats[0].get("beat_id") if next_beats else None
            bridge = (
                f"🎬 [DIRECTOR BRIDGE]: บีตในฉากเดิมสิ้นสุดลงแล้ว ตอนนี้เรากำลังไหลไปสู่ฉากใหม่คือ '{next_scene_id}' "
                "จงบรรยายการเคลื่อนย้ายหรือความเชื่อมโยง เพื่อเปิดตัวเข้าสู่สถานที่/เวลาใหม่นี้อย่างเป็นธรรมชาติ (อย่าเทเลพอร์ต)"
            )
            return next_scene_id, next_beat_id, bridge

        return "completed", None, None
