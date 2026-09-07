class SceneTransitionManager:
    @staticmethod
    def resolve_next_beat(event_data: dict, current_scene_id: str, current_beat_id: str, matched_path: str = None) -> tuple[str, str, str]:
        """
        Resolves the next scene and beat based on Waterfall Flow and Tagging.
        Returns: (resolved_scene_id, resolved_beat_id, transition_bridge_prompt)
        Raises ValueError if the resolution fails (Fail-Fast).
        """
        scenes = event_data.get("scenes", [])
        if not scenes:
            raise ValueError("❌ [FAIL-FAST] JSON ไม่มี Array 'scenes' หรือ Array ว่างเปล่า")

        transition_bridge = None
        
        # 1. Tagging System (User chose a matched path)
        if matched_path:
            # ค้นหา Scene ที่มี entry_path_id ตรงกับ matched_path
            target_scene = next((s for s in scenes if s.get("entry_path_id") == matched_path), None)
            if target_scene:
                target_scene_id = target_scene.get("scene_id")
                beats = target_scene.get("beats", [])
                if not beats:
                    raise ValueError(f"❌ [FAIL-FAST] Scene '{target_scene_id}' ไม่มี beats อยู่เลย")
                
                # ถ้าเปลี่ยนฉากข้าม Scene (สร้าง Bridge ให้ Director)
                if target_scene_id != current_scene_id:
                    transition_bridge = (
                        f"🎬 [DIRECTOR BRIDGE]: ผู้เล่นเพิ่งกระทำการบางอย่าง (เลือกเส้นทาง {matched_path}) "
                        f"ตอนนี้เรากำลังเปลี่ยนเข้าสู่ฉากใหม่คือ '{target_scene_id}' "
                        "จงบรรยายผลลัพธ์ของการกระทำเดิม พร้อมกับเปิดเผยสภาพแวดล้อมของฉากใหม่ให้กลมกลืนเป็นเนื้อเดียวกัน"
                    )
                return target_scene_id, beats[0].get("beat_id"), transition_bridge
            else:
                # ⚠️ AI อาจจะจินตนาการ matched_path ขึ้นมาเอง ข้ามไปใช้ Waterfall
                import logging
                logging.getLogger("TRANSITIONS").warning(f"⚠️ ไม่พบ Scene ที่มี entry_path_id '{matched_path}', กำลังข้ามกลับไปใช้ Waterfall Flow อัตโนมัติ")

        # 2. Waterfall Flow (Auto Resolve by Index)
        current_scene_index = next((i for i, s in enumerate(scenes) if s.get("scene_id") == current_scene_id), -1)
        if current_scene_index == -1:
            raise ValueError(f"❌ [FAIL-FAST] ไม่พบ Scene ปัจจุบัน '{current_scene_id}' ใน JSON เพื่อทำ Waterfall")
            
        current_scene = scenes[current_scene_index]
        beats = current_scene.get("beats", [])
        current_beat_index = next((i for i, b in enumerate(beats) if b.get("beat_id") == current_beat_id), -1)
        
        if current_beat_index != -1 and current_beat_index + 1 < len(beats):
            # Still have beats left in this scene, just move index + 1
            return current_scene_id, beats[current_beat_index + 1].get("beat_id"), None
        
        # Out of beats, move to next scene naturally (Index + 1)
        if current_scene_index + 1 < len(scenes):
            next_scene = scenes[current_scene_index + 1]
            next_scene_id = next_scene.get("scene_id")
            next_beats = next_scene.get("beats", [])
            if not next_beats:
                raise ValueError(f"❌ [FAIL-FAST] Scene ถัดไป '{next_scene_id}' ไม่มี beats อยู่เลย")
            
            transition_bridge = (
                f"🎬 [DIRECTOR BRIDGE]: บีตในฉากเดิมสิ้นสุดลงแล้ว ตอนนี้เรากำลังไหลไปสู่ฉากใหม่คือ '{next_scene_id}' "
                "จงบรรยายการเคลื่อนย้ายหรือความเชื่อมโยง เพื่อเปิดตัวเข้าสู่สถานที่/เวลาใหม่นี้อย่างเป็นธรรมชาติ (อย่าเทเลพอร์ต)"
            )
            return next_scene_id, next_beats[0].get("beat_id"), transition_bridge
            
        # End of the event
        return "completed", None, None
