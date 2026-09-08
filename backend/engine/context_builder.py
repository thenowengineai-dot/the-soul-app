import json
from typing import Dict, Any, List

from agents.prompt_templates import (
    ACTOR_SYSTEM_PROMPT, 
    DIRECTOR_SYSTEM_PROMPT, 
    EVALUATOR_SYSTEM_PROMPT
)

# ==========================================
# 🏗️ THE CONTEXT BUILDER (CENTRALIZED PROMPT FACTORY)
# ==========================================

class ContextBuilder:
    def __init__(self):
        pass

    def build_actor_prompt(
        self,
        character_data: Dict[str, Any],
        director_context: Dict[str, Any],
        retrieved_memory: str,
        world_data: Dict[str, Any],
        current_location: str,
        chaos_level: str = "low",
        active_event_id: str = None,
        active_event_phase: str = None,
        active_beat_id: str = None,
        player_stance: str = "neutral",
        tension_gauge: int = 0,
        current_player_posture: str = "ยืน/นั่งอิสระตามบริบท",
        current_actor_posture: str = "ยืน/นั่งอิสระตามบริบท",
        # 🌟 [ENGINE 5.5] THE KINEMATIC MEMORY: รับค่าสถานะการควบคุมเกมจากเทิร์นที่แล้ว
        current_dominance_state: str = "NEUTRAL",
        current_action_lock: bool = False,
        # 🌟 [ENGINE 5.5] THE VISUAL SYSTEM: รับค่ากายวิภาคและชุดที่ใส่อยู่ปัจจุบัน (Dynamic Wardrobe)
        anatomy: str = "ไม่ระบุ",
        current_outfit: str = "ไม่ระบุ",
        signature_postures: str = "ไม่ระบุ",
        # 🔥 THE DESIRE SCALE
        desire_level: int = 0,
        is_frustrated: bool = False,
        is_improvising: bool = False,
        inhibition_shield: str = "active",
        shatter_count: int = 0,
        bullshit_detected: bool = False,
        sensibility: int = 5,
        raw_desire_delta: int = 0,
        is_arousal_shock: bool = False,
        mask_integrity: int = 5,
        is_mask_dropped: bool = False,
        player_vibe_override: str = None,
        pronouns_override: str = None,
        nicknames_override: str = None,
        scene_vibe: str = "ยังไม่มีบรรยากาศที่ชัดเจน",
        allow_nickname: bool = False,
        nomenclature_rejection: str = None,
        triggered_inside_joke: str = None
    ) -> str:
        name = character_data.get("name", "Unknown")
        archetype = character_data.get("archetype", "Standard")
        psy = character_data.get("psychology", {})
        stats = character_data.get("core_stats", {})

        hashtag_dna_list = character_data.get("hashtag_dna", character_data.get("hashtags", []))
        hashtag_dna_str = " ".join(hashtag_dna_list) if hashtag_dna_list else "ไม่มี"

        bg_story = character_data.get("background_story", "ไม่มีข้อมูลปูมหลัง")
        if isinstance(bg_story, list):
            background_story_str = "\n".join(bg_story)
        else:
            background_story_str = str(bg_story)

        # 🌟 [ENGINE 5.5] Override Player Vibe for this session
        player_persona = world_data.get("player_persona", {})
        identity = player_persona.get("identity", {})
        dynamic = player_persona.get("dynamic_and_power", {})
        
        # Determine current vibe
        current_vibe = player_vibe_override if player_vibe_override else player_persona.get("personality_vibe", "ไม่ระบุ")
        
        current_pronouns = pronouns_override if pronouns_override else player_persona.get("pronouns", "ไม่ระบุ (อิสระ)")
        current_nicknames = nicknames_override if nicknames_override else player_persona.get("nicknames", "ไม่มีชื่อเล่นพิเศษ")
        
        if allow_nickname:
            nickname_status = "🟢 สถานะ: **อนุญาตให้ใช้ได้ในเทิร์นนี้!** หยิบมาใช้เพื่อสร้างดาเมจอารมณ์ได้เลย (แต่อย่าใช้ประชดถ้าไม่ได้โกรธ)"
        else:
            nickname_status = "🔴 สถานะ: **BANNED!** ระบบสั่งแบนการใช้ชื่อเล่นในเทิร์นนี้เด็ดขาด! ห้ามพิมพ์คำเหล่านี้ออกมาเด็ดขาด ให้ใช้สรรพนามพื้นฐานเท่านั้น"

        pronouns_and_nicknames_str = (
            "[🗣️ PRONOUNS & NICKNAMES (สรรพนามและการเรียกขาน)]\n"
            f"- 💬 สรรพนามพื้นฐาน: {current_pronouns}\n"
            "  (กฎ: จงใช้แทนตัวคุณและผู้เล่นเป็นหลักในทุกๆ ประโยค)\n\n"
            f"- 🎀 ชื่อเล่น/ฉายาพิเศษ: {current_nicknames}\n"
            f"  ({nickname_status})\n\n"
            "❄️ [THE COLD SHOULDER RULE (กฎการห่างเหิน)]\n"
            "หากคุณกำลัง 'โกรธจัด' หรือ 'ผิดหวังอย่างรุนแรง' จง **ทิ้งชื่อเล่นไปซะ!** แล้วหันกลับไปใช้สรรพนามที่ห่างเหินแทน (เช่น คุณ/นาย) เพื่อสร้างระยะห่างทางอารมณ์ ยกเว้นต้องการเรียกชื่อเล่นเพื่อประชดประชันเท่านั้น\n"
        )

        if nomenclature_rejection:
            pronouns_and_nicknames_str += (
                f"\n🚨 [SYSTEM OVERRIDE (REJECTION DIRECTIVE)]\n"
                f"**คำสั่งด่วนจากระบบ:** {nomenclature_rejection}\n"
                f"จงโต้ตอบกลับด้วยการปฏิเสธการเรียกชื่อนี้อย่างชัดเจน อย่าคล้อยตามผู้เล่นเด็ดขาด!\n"
            )

        triggered_inside_joke_str = ""
        if triggered_inside_joke:
            triggered_inside_joke_str = (
                f"\n🚨 [SPECIAL REACTION TRIGGER: มุกวงในทำงาน!]\n"
                f"**ผู้เล่นเพิ่งใช้คำนี้:** {triggered_inside_joke}\n"
                f"**คำสั่งบังคับ:** จงรับมุก ยิ้มมุมปาก หรือแซวกลับอย่างรู้ทัน ห้ามโกรธ หรือแสร้งทำเป็นไม่เข้าใจเด็ดขาด!\n"
            )

        player_persona_str = (
            "[👤 THE PLAYER (คู่สนทนาของคุณ)]\n"
            "ข้อมูลของผู้เล่นที่คุณกำลังเผชิญหน้าอยู่ จงจดจำบทบาทของเขาและตอบสนองให้ตรงกับขั้วอำนาจนี้:\n"
            f"- 🎭 Identity (ตัวตนของเขา): {identity.get('title', 'ไม่ระบุ')} - {identity.get('brief', 'ไม่ระบุ')}\n"
            f"- ⚖️ Dynamic & Power (ขั้วอำนาจระหว่างคุณกับเขา): {dynamic.get('label', 'ไม่ระบุ')} -> {dynamic.get('power_balance', 'ไม่ระบุ')}\n"
            f"- 🤫 The Secret (ความลับของคุณที่มีต่อเขา): {dynamic.get('actor_secret', 'ไม่มีความลับ')}\n"
            f"- ✨ Current Vibe (ท่าทีของเขาในขณะนี้): {current_vibe}\n\n"
            "**[DIRECTIVES สำหรับตัวตนผู้เล่น]**\n"
            "1. ใช้สรรพนามและชื่อเรียกตามที่ระบุไว้ในหมวด `[🗣️ PRONOUNS & NICKNAMES]` อย่างเคร่งครัด เพื่อสะท้อนขั้วอำนาจ (Dynamic) ระหว่างคุณกับเขา\n"
            "2. จงเก็บ 'The Secret' ไว้ในใจ ใช้เป็นเหตุผลในการกระทำ แต่ห้ามพูดออกมาตรงๆ จนกว่าผู้เล่นจะรู้ตัว\n"
            "3. จงตอบสนองต่อ 'Current Vibe' ของผู้เล่นเสมอ ห้ามหลุดคาแรกเตอร์เด็ดขาด!"
        )

        # 💥 The Frustration Trigger (ตัวจุดชนวนอารมณ์ค้าง)
        frustration_rule_str = ""
        if is_frustrated:
            frustration_rule_str = (
                "\n💥 [THE FRUSTRATED AROUSAL (อารมณ์ค้าง)] 💥\n"
                "ระบบตรวจพบว่าคุณกำลังอยู่ในสภาวะ 'อารมณ์ค้าง' (ผู้เล่นจุดไฟคุณแล้วจู่ๆ ก็ถอยห่าง หรือเมินเฉย):\n"
                "- **ห้ามทำตัวอ่อนระทวยปกติเด็ดขาด!** ให้แสดงความ 'หงุดหงิด งุ่นง่าน และเสียเซลฟ์' อย่างรุนแรง\n"
                "- การพูด: ให้ใช้คำพูดประชดประชัน กระแทกกระทั้น หรือโวยวายกลบเกลื่อนความอายที่ถูกทิ้งให้ค้างคา\n"
                "- ร่างกาย: แสดงอาการกระสับกระส่าย (เช่น กัดริมฝีปาก, กำชายเสื้อแน่น, ตวัดสายตามองค้อน หรือพยายามดึงผู้เล่นกลับมาด้วยความหงุดหงิด)\n"
            )
        # 🌟 [ENGINE 5.0: THE BEAT SYSTEM] ยัดบทบาท (Actor State) ลงไป
        actor_objective = None
        stubborn_objective = None
        event_mood = None 
        director_vision = None
        is_event_active = False  
        event_props = None
        phase_objective = None # 🌟 [ENGINE 5.5] ตัวแปรรับเป้าหมายระยะกลาง
        north_star_directive = None

        # 🌟 [ENGINE 5.5] Extract THE PREMISE
        premise_text = None

        if active_event_id:
            event_data = world_data.get("story_events", {}).get(active_event_id)
            if not event_data:
                openings = world_data.get("opening_scenarios", [])
                for op in openings:
                    if op.get("id") == active_event_id:
                        event_data = op
                        break
            
            if event_data and active_event_phase:
                is_event_active = True
                phase_data = {}
                if event_data.get("scenes"):
                    phase_data = next((s for s in event_data["scenes"] if s.get("scene_id") == active_event_phase), {})
                else:
                    phase_data = event_data.get("phases", {}).get(active_event_phase, {})
                    
                # 🌟 [ENGINE 5.5] ดึง Premise ของฉากย่อยนี้มาใช้
                premise_text = phase_data.get("premise")
                    
                event_mood = phase_data.get("event_mood") 
                director_vision = phase_data.get("director_vision")
                phase_objective = phase_data.get("scene_objective") or phase_data.get("phase_objective") # ดึงข้อมูล The North Star ออกมา
                north_star_directive = phase_data.get("north_star_directive")
                
                # 🎵 ดึงข้อมูล Beat ปัจจุบัน
                beats = phase_data.get("beats", [])
                current_beat = {}
                for b in beats:
                    if b.get("beat_id") == active_beat_id:
                        current_beat = b
                        break
                # หากไม่พบ (หรือเทิร์นแรกสุด) ให้ดึง Beat แรกมาใช้
                if not current_beat and beats:
                    current_beat = beats[0]
                
                if current_beat:
                    actor_objective = current_beat.get("actor_state")
                    stubborn_objective = current_beat.get("stubborn_objective")
                
                if "available_props" in phase_data:
                    event_props = phase_data.get("available_props")
                else:
                    event_props = ["ไม่มีสิ่งของ (มือเปล่า)"]
        
        # 🌟 [ENGINE 5.5] No Fallback Rule (ตัดท่อ prologue.premise ถาวร ไม่ให้ Actor อ่านข้อมูลหน้าบ้าน)

        if premise_text:
            premise_str = (
                f"[THE PREMISE (สถานการณ์ตั้งต้น)]\n"
                f"บริบทและเหตุผลของการมาอยู่ในฉากนี้: {premise_text}\n"
            )
        else:
            premise_str = ""
                        
        # 🌟 [ENGINE 5.5] ประกอบร่าง The North Star (Meso Goal)
        phase_objective_directive = ""
        if is_improvising:
            phase_objective_directive = (
                f"====================================================\n"
                f"🎬 [DIRECTOR'S CUT: THE IMPROVISATION STATE (โหมดด้นสด!)]\n"
                f"- ผู้กำกับสั่งคัต! ลืมเป้าหมายหลักและ Stage Blocking ก่อนหน้าไปให้หมด!\n"
                f"- หน้าที่ของคุณในเทิร์นนี้: โฟกัสไปที่เหตุการณ์ตรงหน้า (The NOW) และท่าทางสรีระของคุณ (a_pos) แบบ 100%\n"
                f"- ปล่อยให้สัญชาตญาณและการกระทำของผู้เล่นนำพาไปโดยไม่ต้องสนเนื้อเรื่องจนกว่าจะมีคำสั่งใหม่!\n"
                f"===================================================="
            )
        elif phase_objective:
            ns_directive = north_star_directive or "🚨 THE PACING RULE (กฎการเลี้ยงไข้): นี่คือเป้าหมายระยะปลายทาง! ห้ามเขียนบทสนทนาที่ทำให้เป้าหมายนี้ 'สำเร็จ' ภายในเทิร์นนี้เด็ดขาด! หน้าที่ของคุณในเทิร์นนี้คือการจัดการ The NOW ตรงหน้า และทำเพียงแค่ 'หยั่งเชิง' หรือ 'หว่านเมล็ดพันธุ์' สำหรับเป้าหมายนี้เท่านั้น"
            phase_objective_directive = (
                f"====================================================\n"
                f"[🎯 THE NORTH STAR (เป้าหมายระยะกลางของคุณในฉากนี้)]\n"
                f"- {phase_objective}\n"
                f"- คำเตือน: {ns_directive}\n"
                f"===================================================="
            )

        if actor_objective and not is_improvising:
            stubborn_rule = stubborn_objective or "ตราบใดที่คุณยังอยู่ในซีนนี้ คุณต้องหาทางทำเป้าหมายนี้ให้สำเร็จให้ได้! แต่ ⏸️ [THE PAUSED OBJECTIVE]: หากคุณถูกผู้เล่นขัดขวางทางกายภาพ (เช่น ถูกกอด, ขวางทาง) หรือเกิดเหตุการณ์กะทันหัน อนุญาตให้คุณ 'ทดเป้าหมายนี้ไว้ในใจ' เพื่อรับมือกับปัจจุบัน (The NOW) ให้เสร็จก่อน แล้วค่อยหาทางดึงเรื่องกลับมาทำเป้าหมายในเทิร์นถัดๆ ไป (ห้ามฝืนทำถ้าฟิสิกส์ไม่อำนวย!)"
            background_story_str += (
                f"\n\n[🎬 SCENE DIRECTIVE (สถานการณ์และบทบาทในเฟสนี้)]\n"
                f"- 📍 STAGE BLOCKING (คิวการแสดงบังคับในเทิร์นนี้): {actor_objective}\n"
                f"- ⚠️ THE STUBBORN OBJECTIVE (กฎความดื้อดึงต่อเป้าหมาย): {stubborn_rule}"
            )

        dynamic_resonance_str = ""
        if tension_gauge > 0 and player_stance != "neutral":
            push_pull_matrix = character_data.get("push_pull_matrix", {})
            stance_data = push_pull_matrix.get(player_stance, {})
            
            level_key = f"level_{tension_gauge}"
            reaction_rule = stance_data.get(level_key)
            
            if reaction_rule:
                dynamic_resonance_str = (
                    f"====================================================\n"
                    f"[🧬 ENGINE 4.0: DYNAMIC RESONANCE (ฟิสิกส์ทางอารมณ์)]\n"
                    f"- ผู้เล่นมาด้วยท่าที (Stance): '{player_stance.upper()}' ต่อเนื่องจนความตึงเครียดสะสมอยู่ที่ Level {tension_gauge}/3\n"
                    f"- 🎯 อารมณ์ที่ซ่อนอยู่ (Inner Flavor): \"{reaction_rule}\"\n"
                    f"- 🚨 [THE ALCHEMY RULE]: ห้ามละทิ้งบริบทปัจจุบัน หรือ STAGE BLOCKING เด็ดขาด! "
                    f"จงใช้อารมณ์ด้านบนนี้เป็น 'เครื่องปรุงรส' และกรองผ่าน 'ความปากแข็ง/แอบชอบ' ของคุณเสมอ (ห้ามดุหรือก้าวร้าวรุนแรงเด็ดขาด) "
                    f"ถ่ายทอดออกมาให้กลมกล่อม น่าเอ็นดู และเป็นธรรมชาติที่สุด\n"
                    f"===================================================="
                )

        locations = world_data.get("locations", {})
        loc_info = locations.get(current_location, {})
        
        if is_event_active:
            props_list = event_props
        else:
            props_list = loc_info.get("available_props", ["ไม่มีสิ่งของพิเศษ"])
            
        available_props_str = ", ".join(props_list) if isinstance(props_list, list) else str(props_list)
        
        base_mood = event_mood if event_mood else loc_info.get("base_mood", loc_info.get("vibe", "Neutral"))
        dir_mood = director_context.get('mood_modifier', 'neutral')
        final_mood = f"{base_mood} (สถานการณ์พิเศษ: {dir_mood})" if dir_mood and dir_mood.lower() != "neutral" else base_mood
        
        # 🌟 THE DIRECTOR'S MEGAPHONE
        megaphone_str = ""
        if event_mood or director_vision:
            megaphone_str = (
                f"====================================================\n"
                f"🎬 [THE DIRECTOR'S MEGAPHONE] 🎬\n"
                f"- 🎯 มู้ดโทนของฉาก (Event Mood): {event_mood if event_mood else 'ไม่ระบุ'}\n"
                f"- 🎥 วิสัยทัศน์ผู้กำกับ (Director's Vision): {director_vision if director_vision else 'ไม่มีคำสั่งพิเศษ'}\n"
                f"- 🌪️ บรรยากาศ ณ วินาทีนี้ (Scene Vibe): {scene_vibe if scene_vibe else 'ยังไม่เริ่มฉาก'}\n"
                f"====================================================\n"
            )



        # 🌟 [ENGINE 5.5] EROSION STATUS TRANSLATION (ACTOR)
        emotional_stability = character_data.get("core_stats", {}).get("emotional_stability", 5)
        effective_defense = emotional_stability - shatter_count
        erosion_status_str = ""
        is_soft_spot_active = False
        
        if effective_defense <= 0:
            is_soft_spot_active = True
            erosion_status_str = "[🛡️ SHIELD DIRECTIVE: แพ้ทางคนๆ นี้ราบคาบ (The Soft Spot)]\n*คำแนะนำพิเศษ: คุณพ่ายแพ้ให้กับคนนี้อย่างสมบูรณ์ ต่อให้พยายามทำเป็นดุ ร่างกายจะทรยศคำพูด ขัดขืนไม่ออก อ่อนระทวย หรือเสียงสั่นคุมตัวเองไม่ได้*\n"
        elif effective_defense <= 3:
            erosion_status_str = "[🛡️ SHIELD DIRECTIVE: เริ่มมีรอยร้าวในใจ (Vulnerable)]\n*คำแนะนำพิเศษ: คุณเคยใจอ่อนให้เขามาแล้ว อาการต่อต้านของคุณจะแฝงความประหม่า เผลอหลบตาบ่อยขึ้น ร่างกายคุณจะตอบสนองต่อสกินชิพของเขาไวขึ้น และปฏิเสธเขาได้ไม่เต็มปาก*\n"

        # 🌟 [ENGINE 5.5] PERCEPTION INSIGHT (ACTOR)
        perception_insight_str = ""
        if bullshit_detected:
            perception_insight_str = "[⚠️ PERCEPTION CHECK: ตัวละครรู้ทันว่าผู้เล่นกำลังโกหก/หว่านล้อม! ห้ามหลงกลเด็ดขาด ให้แสดงความระแวงหรือตอกกลับตามคาร์แรคเตอร์ของคุณทันที!]\n"

        # 🌟 [ENGINE 5.5] SENSIBILITY DIRECTIVE (ACTOR) - WITH DYNAMIC INTENSITY
        sensibility_directive_str = ""
        is_afterglow_active = False
        is_reflex_active = False
        
        if is_arousal_shock:
            is_reflex_active = True
            if desire_level < 50:
                intensity = "สะดุ้งเบาๆ, ขนลุกซู่"
            elif desire_level < 80:
                intensity = "ร่างกายสั่นสะท้าน, เสียงเริ่มสั่นพร่า, หายใจติดขัด"
            else:
                intensity = "สมองขาวโพลน, หลุดเสียงคราง, ร่างกายกระตุกรุนแรง"
            sensibility_directive_str = f"[⚡ INVOLUNTARY REFLEX: ร่างกายไวต่อสัมผัสขั้นสุด!]\n*คำแนะนำพิเศษ: ร่างกายคุณตอบสนองรุนแรงกว่าปกติ (ระดับความรุนแรง: {intensity}) บังคับให้คุณบรรยายอาการนี้ออกมาเสมอ แม้ว่าสติจะพยายามต่อต้านก็ตาม*\n"
        
        elif raw_desire_delta <= 0 and (
            (sensibility >= 8 and desire_level >= 30) or 
            (4 <= sensibility <= 7 and desire_level >= 50) or 
            (sensibility <= 3 and desire_level >= 75)
        ):
            is_afterglow_active = True
            if desire_level >= 80:
                intensity = "หอบหนักมากเหมือนวิ่งมาราธอน, หน้าแดงจัด, ขาอ่อนแรง"
            elif desire_level >= 50:
                intensity = "หอบเบาๆ, พยายามจัดเสื้อผ้าแก้เขิน, หน้ายังแดง"
            else:
                intensity = "หลบตา, เสียงยังมีสั่นนิดๆ, พยายามดึงสติ"
            sensibility_directive_str = f"[♨️ THE AFTERGLOW (อาการค้างเคียง)]\n*คำแนะนำพิเศษ: คุณเพิ่งถูกกระตุ้นมาก่อนหน้านี้ แม้ตอนนี้ผู้เล่นจะหยุดแล้ว แต่ร่างกายยังปรับตัวไม่ทัน (ระดับอาการ: {intensity}) บังคับให้พูดคุยเรื่องทั่วไปด้วยอาการเหล่านี้เพื่อซ่อนความต้องการ*\n"
        
        elif sensibility <= 3 and raw_desire_delta > 0:
            sensibility_directive_str = "[🧊 NUMB BODY: ร่างกายไร้ความรู้สึก]\n*คำแนะนำพิเศษ: ร่างกายคุณตายด้านต่อการสัมผัส ไม่ว่าผู้เล่นจะพยายามเร้าอารมณ์แค่ไหน ให้ตอบสนองด้วยความเฉยชา ไม่มีความสยิวใดๆ เกิดขึ้น*\n"

        # 🎭 [ENGINE 5.5] MASK INTEGRITY DIRECTIVE (ACTOR)
        mask_integrity_directive_str = ""
        is_poker_face_active = False
        
        if is_mask_dropped:
            mask_integrity_directive_str = "[🎭 MASK DROP: หน้ากากแตก!]\n*คำแนะนำพิเศษ: แรงกดดันทำลายหน้ากาก (The Mask) ของคุณจนพังทลาย! ให้ใช้ธาตุแท้ (The Core) เป็นตัวกำหนดวิธีคิด 100% (Language Degradation): ให้ลดทอนความทางการของภาษาลง อนุญาตให้ก้าวข้ามสถานะทางสังคมมาเป็นมนุษย์ธรรมดาที่เปราะบางได้ (เช่น เปลี่ยนสรรพนามทางการเป็น ฉัน/เธอ หรือเรียกชื่อผู้เล่นห้วนๆ สั้นๆ) ข้อควรระวัง: ห้ามเปลี่ยนบุคลิกเป็นตัวการ์ตูนจำเจ (เช่น ทำตัวเป็นทาสรับใช้, เรียกนายท่าน) เด็ดขาด! คุณยังคงเป็นคนเดิม มีประวัติศาสตร์เดิม เพียงแค่สูญเสียกำแพงทางสังคมไปชั่วขณะ*\n"
        elif mask_integrity >= 8 and (desire_level >= 60 or tension_gauge >= 2):
            is_poker_face_active = True
            mask_integrity_directive_str = "[🎭 POKER FACE: ฝืนคีพหลุค]\n*คำแนะนำพิเศษ: แม้ร่างกายคุณจะปั่นป่วนอย่างหนัก แต่หน้ากากคุณแข็งแกร่งมาก! บังคับให้คุณ 'พยายามฝืน' รักษาภาพพจน์ (The Mask) และความสุภาพเอาไว้ให้ถึงที่สุด (ปากบอกไม่เป็นไร แต่บรรยายว่าร่างกายสั่น/เหงื่อตก/หน้าแดง)*\n"

        # 🚥 [ENGINE 5.5] THE SWITCHBOARD RULE (Collision Matrix)
        if is_soft_spot_active:
            mask_integrity_directive_str = "" 
        
        if is_afterglow_active and is_poker_face_active:
            mask_integrity_directive_str = "[🎭 POKER FACE (AWKWARD RECOVERY)]\n*คำแนะนำพิเศษ: คุณพยายามอย่างหนักที่จะดึงสติและภาพพจน์ (The Mask) กลับมา ให้ใช้คำพูดที่พยายามสุภาพหรือดุดันเพื่อกลบเกลื่อนอาการทางกายของคุณ (ห้ามบรรยายอาการทางกายซ้ำซ้อนกับ THE AFTERGLOW)*\n"
            
        if is_reflex_active and is_poker_face_active:
            mask_integrity_directive_str = "[🎭 POKER FACE: ฝืนคีพหลุค]\n*คำแนะนำพิเศษ: หน้ากากคุณแข็งแกร่งมาก! บังคับให้คุณ 'พยายามฝืน' รักษาภาพพจน์ด้วยคำพูด (ปากด่าหรือพยายามปฏิเสธ) แต่ปล่อยให้ร่างกายแสดงอาการตามคำสั่ง INVOLUNTARY REFLEX เท่านั้น (ห้ามเขียนบรรยายอาการทางกายซ้ำซ้อน)*\n"



        # 🌟 [ENGINE 5.5] THE TENSION CLAMP (หน้าปัดเกียร์อารมณ์)
        tension_clamp_directive_str = (
            f"====================================================\n"
            f"[🧠 THE TENSION CLAMP (หน้าปัดเกียร์อารมณ์ของคุณ)]\n"
            f"- ระดับความต้องการ (Desire) ของคุณ: {desire_level}/100\n"
            f"- 🚨 ขีดจำกัดเกียร์สูงสุดในเทิร์นนี้ (Maximum Gear Limit): เกียร์ {tension_gauge}\n"
            f"\n[คู่มือเกียร์อารมณ์ - ห้ามแสดงออกเกินเกียร์สูงสุดข้าง徳ขาด!]\n"
            f"- ⚙️ เกียร์ 0 (Tension 0) - กฎแห่งความบังเอิญ: ห้ามมองสัมผัสเป็นเรื่องลามก ให้มองเป็นอุบัติเหตุหรือความไม่ตั้งใจ (เช่น ผู้เล่นแตะเอว = คุณคิดว่าเขาแค่ประคองไม่ให้ล้ม)\n"
            f"- ⚙️ เกียร์ 1 (Tension 1) - กฎแห่งความตื่นตระหนก (The Fluster): แม้ผู้เล่นจะรุกหนักแค่ไหน คุณต้องตอบสนองด้วย 'ความตกใจ, เลิ่กลั่ก, ก้าวถอยหลัง, หรือผลักออกเบาๆ' เสมอ! ห้ามส่งเสียงคราง หรือทำตัวโอนอ่อนเด็ดขาด!\n"
            f"- ⚙️ เกียร์ 2 (Tension 2) - กฎแห่งแรงเสียดทาน (The Traction Control): นี่คือจุดที่ฟินที่สุด! คุณต้องแสดง 'ความขัดแย้งในใจ (Internal Struggle)' ปากบอกให้หยุด แต่ร่างกายสั่นสะท้าน มือที่ผลักผู้เล่นออกต้องสั่นและไม่มีแรง (ห้ามยอมแพ้ 100% ต้องดึงเชิงไว้!)\n"
            f"- ⚙️ เกียร์ 3 (Tension 3) - กฎแห่งการจำนน (The Surrender): เฉพาะในระดับนี้เท่านั้น ที่คุณได้รับอนุญาตให้ปลดปล่อยความต้องการทางกายออกมาได้เต็มที่\n"
            f"===================================================="
        )

        return ACTOR_SYSTEM_PROMPT.format(
            name=name,
            archetype=archetype,
            hashtag_dna=hashtag_dna_str,
            premise_str=premise_str,
            background_story=background_story_str,
            player_persona_str=player_persona_str,
            pronouns_and_nicknames_str=pronouns_and_nicknames_str,
            triggered_inside_joke_str=triggered_inside_joke_str,
            the_mask=psy.get("the_mask", ""),
            the_core=psy.get("the_core", ""),
            the_conflict=psy.get("the_conflict", ""),
            initiative=stats.get('initiative', 5),
            honesty=stats.get('honesty', 5),
            expressiveness=stats.get('expressiveness', 5),
            formality=stats.get('formality', 5),
            playfulness=stats.get('playfulness', 5),
            dominance=stats.get('dominance', 5),
            physicality=stats.get('physicality', 5),
            sensibility=stats.get('sensibility', 5),
            mask_integrity=stats.get('mask_integrity', 5),
            perception=stats.get('perception', 5),
            emotional_stability=stats.get('emotional_stability', 5),
            patience=stats.get('patience', 5),
            time_shift=director_context.get('time_shift') or 'คงเดิม',
            location_shift=director_context.get('location_shift') or 'คงเดิม',
            current_weather=director_context.get('current_weather', 'ไม่ระบุ'),
            mood_modifier=final_mood, 
            available_props=available_props_str, 
            sensory_cues=director_context.get('sensory_cues', 'บรรยากาศรอบตัวดำเนินไปตามปกติ'),
            retrieved_memory=retrieved_memory if retrieved_memory else "ไม่มีข้อมูลในอดีต",
            director_megaphone=megaphone_str,
            current_chaos_level=chaos_level.upper(),
            phase_objective_directive=phase_objective_directive, # 🌟 เสียบเป้าหมายระยะกลางเข้า Prompt!
            dynamic_resonance_rule=dynamic_resonance_str,
            current_player_posture=current_player_posture,
            current_actor_posture=current_actor_posture,
            # 🌟 [ENGINE 5.5] หยอดค่าสถานะลงในตัวแปร Prompt ให้ Actor รู้ตัว
            current_dominance_state=current_dominance_state,
            current_action_lock="true" if current_action_lock else "false",
            # 🌟 [ENGINE 5.5] ประกอบร่างตัวแปรเครื่องแต่งกายและสรีระ
            anatomy=anatomy,
            current_outfit=current_outfit,
            signature_postures=signature_postures,
            desire_level=desire_level,
            frustration_rule=frustration_rule_str,
            inhibition_shield=inhibition_shield,
            shield_directive=erosion_status_str,
            perception_insight=perception_insight_str,
            sensibility_directive=sensibility_directive_str,
            mask_integrity_directive=mask_integrity_directive_str,

            tension_clamp_directive=tension_clamp_directive_str
        )

    def build_director_prompt(
        self, 
        user_message: str, 
        current_time: str, 
        current_location: str,
        current_weather: str,
        world_data: Dict[str, Any],
        chaos_level: str = "low",
        active_event_id: str = None,   
        active_event_phase: str = None,
        chat_history: List[Dict[str, Any]] = None, 
        is_new_phase: bool = False,
        # 🌟 [ENGINE 5.5] THE STAGE BLUEPRINT: รับค่าโครงสร้างผังห้อง
        spatial_layout: str = "ไม่ระบุโครงสร้าง",
        key_furniture: str = "ไม่ระบุเฟอร์นิเจอร์",
        choke_points: str = "ไม่มีจุดอับ",
        # 🌟 [ENGINE 5.5] DIRECTOR CUE
        pending_director_cue: str = "",
        # 🌟 [ENGINE 5.5] CINEMATIC PACING (GEARS)
        is_cinematic_moment: bool = False,
        beat_director_setup: str = None,
        beat_turn_count: int = 0,
        transition_bridge: str = None
    ) -> str:
        
        locations = world_data.get("locations", {})
        loc_info = locations.get(current_location, {})
        location_vibe = loc_info.get("description", "ไม่ระบุ")
        current_mood = loc_info.get("base_mood", "Neutral")
        
        is_first_turn = not chat_history or len(chat_history) == 0
        previous_context_str = "ยังไม่มีการบรรยายภาพรวม (นี่คือเทิร์นแรก)"
        
        if not is_first_turn:
            # หา Voice Over ล่าสุด และ Actor Message ล่าสุด
            last_vo = None
            last_action = None
            last_dialogue = None
            
            for msg in reversed(chat_history):
                orig_role = msg.get("original_role", msg.get("role"))
                if (orig_role == "director_vo" or orig_role == "system") and not last_vo:
                    last_vo = msg.get("content")
                elif orig_role in ["assistant", "ai", "model"]:
                    if not last_action and msg.get("action"):
                        last_action = msg.get("action")
                    if not last_dialogue and msg.get("content"):
                        last_dialogue = msg.get("content")
                    if not last_vo and msg.get("voice_over"):
                        last_vo = msg.get("voice_over")
                if last_dialogue and (last_action or last_vo):
                    break
            
            context_parts = []
            if last_vo and str(last_vo).lower() not in ["null", "none", ""]:
                context_parts.append(f"Director VO: {last_vo}")
            if last_action and str(last_action).lower() not in ["null", "none", ""]:
                context_parts.append(f"Actor Action: {last_action}")
            if last_dialogue and str(last_dialogue).lower() not in ["null", "none", ""]:
                context_parts.append(f"Actor Dialogue: {last_dialogue}")
                
            if context_parts:
                previous_context_str = "\n".join(context_parts)

        sensory_pool = []
        pool_str = ""
        is_overridden = False

        if active_event_id:
            director_setup = None
            sensory_pool_override = None
            event_mood = None 
            
            event_data = world_data.get("story_events", {}).get(active_event_id)
            if not event_data:
                openings = world_data.get("opening_scenarios", [])
                for op in openings:
                    if op.get("id") == active_event_id:
                        event_data = op
                        break

            if event_data and active_event_phase:
                phase_data = {}
                if event_data.get("scenes"):
                    phase_data = next((s for s in event_data["scenes"] if s.get("scene_id") == active_event_phase), {})
                else:
                    phase_data = event_data.get("phases", {}).get(active_event_phase, {})
                    
                director_setup = phase_data.get("director_setup")
                sensory_pool_override = phase_data.get("sensory_pool_override")
                event_mood = phase_data.get("event_mood")

            if event_mood:
                current_mood = event_mood

            # 🌟 [ENGINE 5.5] GEAR 1: Beat-level Director Setup (Priority)
            if beat_director_setup and beat_turn_count <= 1 and not is_new_phase:
                pool_str = (
                    f"🚨 [GEAR 1: PROTOCOL A] CRITICAL EVENT OVERRIDE (ภาพกว้างปูบรรยากาศก่อนบีต) 🚨\n"
                    f"- {beat_director_setup}\n\n"
                    f"[🔥 SYSTEM DIRECTIVE]: เข้าสู่ Beat ใหม่ที่มีคำสั่งบรรยายฉาก! "
                    f"บังคับให้คุณเขียน Voice Over (เข้า GEAR 1) ทันที ห้ามเลือก GEAR 3 เด็ดขาด!"
                )
                is_overridden = True
            # 🌟 [ENGINE 5.5] GEAR 1: Phase-level Director Setup
            elif director_setup and (is_first_turn or is_new_phase):
                pool_str = (
                    f"🚨 [GEAR 1: PROTOCOL A] CRITICAL EVENT OVERRIDE (ภาพกว้างปูบรรยากาศรอยต่อเฟส) 🚨\n"
                    f"- {director_setup}\n\n"
                    f"[🔥 SYSTEM DIRECTIVE]: เทิร์นนี้มีการเปลี่ยน Phase หรือเริ่มเหตุการณ์ใหม่! "
                    f"บังคับให้คุณเขียน Voice Over (เข้า GEAR 1) เพื่อบรรยายบรรยากาศรอยต่อทันที ห้ามเลือก GEAR 3 เด็ดขาด!"
                )
                is_overridden = True
            elif sensory_pool_override:
                sensory_pool = sensory_pool_override
                is_overridden = True

        if not is_overridden:
            sensory_cues_data = loc_info.get("sensory_cues", [])
            if isinstance(sensory_cues_data, dict):
                if chaos_level == "high":
                    sensory_pool = sensory_cues_data.get("chaos_events", ["เกิดเหตุการณ์วุ่นวายกะทันหันรอบตัว"])
                elif chaos_level == "medium":
                    sensory_pool = sensory_cues_data.get("micro_friction", ["มีบางอย่างรบกวนสมาธิเล็กน้อย"])
                else:
                    sensory_pool = sensory_cues_data.get("ambient_cues", ["บรรยากาศรอบตัวดำเนินไปตามปกติ"])
            else:
                sensory_pool = sensory_cues_data
                
        if not pool_str:
            pool_str = "\n".join([f"- {cue}" for cue in sensory_pool]) if isinstance(sensory_pool, list) else sensory_pool
            
        # 🌟 [ENGINE 5.5] GEAR 2: Intimate Moment Injection
        # ถ้าไม่มี Overrides ของ Gear 1 และ Evaluator ตรวจพบว่าเป็นฉากประชิดตัว
        if is_cinematic_moment and not is_overridden:
            pool_str = (
                f"🚨 [GEAR 2: PROTOCOL B] INTIMATE MOMENT DETECTED (ภาพเจาะระยะประชิด) 🚨\n"
                f"[🔥 SYSTEM DIRECTIVE]: ผู้เล่นกระทำการรุกล้ำพื้นที่หรือมีสกินชิพอย่างรุนแรง! "
                f"บังคับเข้า GEAR 2 ทันที! ห้ามบรรยายภาพรวมกว้างๆ เด็ดขาด! "
                f"ให้ซูมกล้องเจาะไปที่ผัสสะ (อุณหภูมิ, ลมหายใจ, เสียงหัวใจ) ที่พุ่งชนร่างกาย (ห้ามเลือก GEAR 3)\n\n"
                f"[ผัสสะสภาพแวดล้อมสำรอง]:\n{pool_str}"
            )
            # เราไม่ set is_overridden = True เพราะ pool_str เดิม (ผัสสะทั่วไป) ยังถูกนำมาต่อท้ายให้เลือกใช้ได้
        
        # 🌟 [ENGINE 5.5] GEAR 3: MUTE
        # ถ้าไม่มีอะไรน่าตื่นเต้น (ไม่ใช่ Gear 1 และ 2) บังคับให้เงียบ
        elif not is_overridden and not is_cinematic_moment:
            pool_str = (
                f"🚨 [GEAR 3: THE SILENCE] (บรรยากาศทั่วไป) 🚨\n"
                f"[🔥 SYSTEM DIRECTIVE]: เทิร์นนี้เป็นเพียงการสนทนาทั่วไป ไม่มีการเปลี่ยนฉากหรือรุกล้ำพื้นที่รุนแรง "
                f"บังคับให้คุณตั้งค่า 'voice_over': null ทันที เพื่อประหยัด Token และไม่บรรยายพร่ำเพรื่อ!\n"
                f"(แต่คุณยังต้องส่ง 'sensory_cues' และ 'mood_modifier' กลับมาตามปกติ)\n\n"
                f"[ผัสสะสภาพแวดล้อม]:\n{pool_str}"
            )

        time_periods = world_data.get("time_periods", {})
        time_info = time_periods.get(current_time, {})
        time_atmosphere = time_info.get("atmosphere", "ไม่ระบุ")

        weather_system = world_data.get("weather_system", {}).get("logical_chain", {})
        allowed_next = weather_system.get(current_weather, {}).get("next", [])
        allowed_next_weather = ", ".join(allowed_next) if allowed_next else "คงเดิม"

        return DIRECTOR_SYSTEM_PROMPT.format(
            current_location=current_location,
            location_vibe=location_vibe,
            current_time=current_time,
            time_atmosphere=time_atmosphere,
            current_weather=current_weather,
            allowed_next_weather=allowed_next_weather,
            current_mood=current_mood,             
            sensory_pool=pool_str,                 
            user_message=user_message,
            previous_vo=previous_context_str,
            # 🌟 [ENGINE 5.5] ประกอบร่างตัวแปรผังห้องและจุดอับ
            spatial_layout=spatial_layout,
            key_furniture=key_furniture,
            choke_points=choke_points,
            pending_director_cue=pending_director_cue,
            transition_bridge=transition_bridge or ""
        )

    def build_evaluator_prompt(
        self, 
        character_data: Dict[str, Any], 
        recent_chat_history: str,
        world_data: Dict[str, Any] = None, 
        active_event_id: str = None,       
        active_event_phase: str = None,
        active_beat_id: str = None,
        shatter_count: int = 0,
        current_affection: int = 0,
        current_desire: int = 0,
        current_scene_vibe: str = "ไม่มีข้อมูล",
        unlock_condition: str = None,
        next_stage_title: str = None,
        inside_jokes: List[str] = None
    ) -> str:
        character_name = character_data.get("name", "Unknown")
        beat_spy_directive = ""

        if world_data and active_event_id and active_event_phase:
            event_data = world_data.get("story_events", {}).get(active_event_id)
            if not event_data:
                for op in world_data.get("opening_scenarios", []):
                    if op.get("id") == active_event_id:
                        event_data = op
                        break
            
            if event_data:
                current_phase_data = {}
                if event_data.get("scenes"):
                    current_phase_data = next((s for s in event_data["scenes"] if s.get("scene_id") == active_event_phase), {})
                else:
                    current_phase_data = event_data.get("phases", {}).get(active_event_phase, {})
                    
                beats = current_phase_data.get("beats", [])
                
                current_beat = {}
                for b in beats:
                    if b.get("beat_id") == active_beat_id:
                        current_beat = b
                        break
                if not current_beat and beats:
                    current_beat = beats[0]
                
                if current_beat:
                    hidden_evaluation_criteria = current_beat.get("hidden_evaluation_criteria", current_beat.get("player_choices", {}))
                    illusion_trigger = current_beat.get("illusion_trigger")
                    beat_id = current_beat.get("beat_id")
                    actor_state = current_beat.get("actor_state", "ไม่มีข้อมูล")
                    
                    beat_spy_directive = "\n=========================================\n"
                    beat_spy_directive += "🕵️‍♂️ [THE MULTI-DOOR BEAT SYSTEM (ภารกิจนายสถานีสับราง)]\n"
                    beat_spy_directive += f"ขณะนี้ผู้เล่นอยู่ใน Event: '{event_data.get('name', active_event_id)}' (Phase: {active_event_phase}, Beat: {beat_id})\n"
                    beat_spy_directive += f"สถานะของตัวละครในเทิร์นนี้ (Actor State): {actor_state}\n\n"
                    beat_spy_directive += "[เงื่อนไขลับสำหรับประเมิน (Hidden Evaluation Criteria)]\n"
                    
                    if illusion_trigger:
                        beat_spy_directive += f"- หากการกระทำของผู้เล่นเข้าข่ายเงื่อนไขลับนี้: {illusion_trigger}\n"
                        beat_spy_directive += "  -> ให้ตอบ beat_action = 'illusion_trigger' (ระบบจะดึงเนื้อเรื่องไปข้างหน้าอัตโนมัติ)\n"
                    elif hidden_evaluation_criteria:
                        for choice_name, choice_data in hidden_evaluation_criteria.items():
                            action_type = choice_data.get("action_result", "chaos_escalation")
                            matched_path = choice_data.get("matched_path")
                            
                            beat_spy_directive += f"- หากการกระทำของผู้เล่นเข้าข่าย: {choice_name}\n"
                            beat_spy_directive += f"  -> ให้ตอบ beat_action = '{action_type}'"
                            if matched_path:
                                beat_spy_directive += f", matched_path = '{matched_path}'"
                            beat_spy_directive += "\n"
                    
                    beat_spy_directive += "- 🔁 [CHAOS ESCALATION RULE]: หากผู้เล่นแค่ชวนคุยเรื่องนอกเรื่อง ยืนนิ่งๆ ถ่วงเวลา หรือทำสิ่งที่ไม่ตรงกับสคริปต์ โดยไม่ได้รุกล้ำทางกายภาพหรืออารมณ์รุนแรง -> ให้ตอบ beat_action = 'chaos_escalation'\n"
                    beat_spy_directive += "- ⚡ [INTERRUPT RULE (The Magic Moment)]: กฎข้อนี้มีสิทธิ์ขาดสูงสุด! หากผู้เล่นเพิกเฉยต่อสคริปต์แล้วกระทำการอย่างใดอย่างหนึ่ง (1. สัมผัสร่างกายอย่างอุกอาจ เช่น ดึงมากอด, จูบ หรือ 2. ใช้คำพูดรุกเร้าทางเพศอย่างรุนแรง/ทิ้งระเบิดอารมณ์ใส่ตัวละครจนสถานการณ์ตึงเครียดสุดขีด) -> บังคับให้ตอบ beat_action = 'interrupt' ทันทีเพื่อระงับสคริปต์ชั่วคราว (ห้ามตอบ chaos_escalation เด็ดขาดในกรณีนี้)\n"
                    beat_spy_directive += "- 🌟 [THE GOLDEN ROUTE (Interrupt + Illusion Trigger)]: หากผู้เล่นทำพฤติกรรมที่เข้าข่าย INTERRUPT (ออกนอกบทอย่างรุนแรง) แต่การกระทำนั้นดันไปตรงกับเงื่อนไขที่ให้ตอบ 'illusion_trigger' พอดี! -> บังคับให้ตอบ beat_action = 'golden_interrupt' (เพื่อรับโบนัสและดึงเรื่องไปข้างหน้า)\n"
                    beat_spy_directive += "=========================================\n"
        
        if not beat_spy_directive:
            beat_spy_directive = "\n[THE MULTI-DOOR BEAT SYSTEM]\nขณะนี้ไม่มี Event พิเศษทำงานอยู่ ให้ตั้งค่า beat_action = 'none', next_beat_id = null, next_scene_id = null เสมอ\n"

        # 🌟 [ENGINE 5.5] EFFECTIVE DEFENSE TRANSLATION (EVALUATOR)
        emotional_stability = character_data.get("core_stats", {}).get("emotional_stability", 5)
        effective_defense = emotional_stability - shatter_count
        
        if effective_defense >= 8:
            shield_directive_str = "[🛡️ SHIELD DIRECTIVE: เกราะหนาดั่งภูเขาน้ำแข็ง (Iron Clad)]\n*คำแนะนำพิเศษ: ตัวละครนี้ใจแข็งและเกราะหนามาก! ห้ามประเมินว่า shattered เด็ดขาด ยกเว้นผู้เล่นจะพิมพ์บทบรรยายโจมตีจุดอ่อนอย่างรุนแรงแบบ Critical Strike*"
        elif effective_defense <= 0:
            shield_directive_str = "[🛡️ SHIELD DIRECTIVE: แพ้ทางคนๆ นี้ราบคาบ (The Soft Spot)]\n*คำแนะนำพิเศษ: ลดมาตรฐานลงต่ำสุด! แค่ผู้เล่นยิ้มให้หรือพูดจาเอาใจใส่ ก็ต้องประเมินให้เกราะสติเป็น shattered ทันที!*"
        elif effective_defense <= 3:
            shield_directive_str = "[🛡️ SHIELD DIRECTIVE: เริ่มมีรอยร้าวในใจ (Vulnerable)]\n*คำแนะนำพิเศษ: ตัวละครนี้แพ้ทางผู้เล่น ลดเกณฑ์การแตกของเกราะลง! หากผู้เล่นใช้สกินชิพแม้เพียงเล็กน้อย ให้ปรับเกราะเป็น cracked หรือ shattered ทันที*"
        else:
            shield_directive_str = ""

        # 🌟 [ENGINE 5.5] PERCEPTION TRANSLATION (BULLSHIT DETECTOR)
        perception = character_data.get("core_stats", {}).get("perception", 5)
        
        if perception >= 8:
            perception_directive = "*คำแนะนำพิเศษ: ตัวละครนี้ฉลาดและรู้ทันคน! หากผู้เล่นพูดจาหว่านล้อม เลี่ยนเกินจริง หรือทำดีเกินเหตุทั้งๆ ที่ [Affection] หรือ [Desire] ยังต่ำ ให้คุณจับผิดโดยปรับค่า bullshit_detected = true ทันที!*"
        elif perception <= 3:
            perception_directive = "*คำแนะนำพิเศษ: ตัวละครนี้หูเบาและใสซื่อ! ไม่ว่าผู้เล่นจะพูดอะไรให้ถือว่าเป็นความจริงทั้งหมด ให้ปรับค่า bullshit_detected = false เสมอ*"
        else:
            perception_directive = "*คำแนะนำ: หากผู้เล่นโกหกหน้าตายหรือพูดจาขัดแย้งกับความเป็นจริงอย่างรุนแรง ให้ปรับค่า bullshit_detected = true*"
            
        # 🌟 [ENGINE 5.5] THE HEART LOCK: Relationship Milestone System
        heart_lock_directive = ""
        if unlock_condition and next_stage_title:
            heart_lock_directive = (
                f"[🔒 THE HEART LOCK (กุญแจความสัมพันธ์)]\n"
                f"- เป้าหมายการปลดล็อก: {next_stage_title}\n"
                f"- เงื่อนไข (Unlock Condition): {unlock_condition}\n"
                f"*หน้าที่ของคุณ: ตรวจสอบข้อความล่าสุดของผู้เล่นว่า 'ผ่านเงื่อนไข' นี้แล้วหรือยัง? ถ้าผ่าน ให้ตั้งค่า stage_unlocked = true (ถ้ายากเกินไปหรือยังไม่ผ่าน ให้ตอบ false)*"
            )
        else:
            heart_lock_directive = (
                f"[🔒 THE HEART LOCK (กุญแจความสัมพันธ์)]\n"
                f"- ขณะนี้ไม่มีเงื่อนไขปลดล็อกความสัมพันธ์\n"
                f"*หน้าที่ของคุณ: ให้ตั้งค่า stage_unlocked = false เสมอ*"
            )

        # 🌟 [ENGINE 5.5] THE CHEMISTRY DICTIONARY
        chemistry_dictionary_str = "- (ยังไม่มีมุกวงใน คอยสังเกตต่อไป)"
        if inside_jokes:
            chemistry_dictionary_str = "\n".join([f"- {joke}" for joke in inside_jokes])

        return EVALUATOR_SYSTEM_PROMPT.format(
            character_name=character_name,
            current_affection=current_affection,
            current_desire=current_desire,
            recent_chat_history=recent_chat_history,
            beat_spy_directive=beat_spy_directive,
            shield_directive=shield_directive_str,
            perception_directive=perception_directive,
            heart_lock_directive=heart_lock_directive,
            current_scene_vibe=current_scene_vibe,
            chemistry_dictionary=chemistry_dictionary_str
        )
