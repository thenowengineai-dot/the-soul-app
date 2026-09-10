import os
import json
import logging
from typing import Dict, Any, Optional, List

logger = logging.getLogger("GENESIS_FACTORY")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s - \033[93m[FACTORY]\033[0m - %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

THE_ENGINE_MANIFESTO = (
    "[🔥 THE ENGINE MANIFESTO: กลไกภาพลวงตาแห่งเจตจำนงเสรี]\n"
    "จงทำความเข้าใจกลไกการเล่าเรื่องนี้อย่างลึกซึ้งก่อนสร้างโลก:\n"
    "1. THE ILLUSION OF FREE WILL (ภาพลวงตาแห่งอิสระ): เนื้อเรื่องทั้งหมดถูกล็อกเป้าหมายไว้แล้ว! ห้ามสร้างทางเลือก (A/B) ให้ผู้เล่นกด หน้าที่ของคุณคือสร้าง 'ภาพลวงตา' ว่าผู้เล่นมีอิสระในการพิมพ์ตอบสนอง แต่จริงๆ แล้วโลกบีบบังคับให้พวกเขาไปสู่จุดหมายที่เราเตรียมไว้\n"
    "2. MAXTURN (กรงขังหน่วงเวลา): ห้ามให้เนื้อเรื่องเดินเร็วเกินไป! `max_turns` คือจำนวนเทิร์นที่มีไว้ 'กักขัง' ให้ผู้เล่นมีเวลาพูดคุย โต้เถียง หรือดิ้นรนอยู่ในสถานการณ์นั้นๆ เพื่อหลอกผู้เล่นว่าพวกเขามีอิสระ\n"
    "3. PROGRESS (กุญแจลับแห่งความฟิน): คือ 'เงื่อนไขลับ' ใน `hidden_evaluation_criteria` หากเวลา (max_turns) ยังไม่หมด แล้วผู้เล่นพิมพ์ตรงกับเนื้อเรื่อง ให้ระบบ Trigger ไปข้างหน้าทันที\n"
    "4. OVERRIDE RESOLUTION (จุดจบที่หลีกเลี่ยงไม่ได้): หากผู้เล่นมัวแต่คุยเล่นจนเวลา `max_turns` หมด โลกและ [ACTOR] จะต้องเป็นฝ่ายเทคแอคชั่นเพื่อ 'กระชาก' เนื้อเรื่องให้เดินหน้าต่อไปเองทันที!\n"
    "5. THE DUNGEON MASTER'S VO: ถักทอ 4 เสาหลัก (The Stage & Vibe, Player's Situation, Actor's Static Board, The Living World) ให้เป็นเนื้อเดียวกันในย่อหน้าเดียว ห้ามใช้บรรยายผัสสะผิวหนังใน VO\n"
    "6. 100% ANATOMICAL GEOMETRY: เมื่อเขียนบรีฟคิวการแสดง (`actor_state`) ต้องประกอบด้วย 1) Player Anchor 2) 3D Geometry 3) Skin Micro-Details 4) Wardrobe Continuity\n"
    "7. 🚨 CRITICAL JSON TYPE ERROR: ฟิลด์ `actor_state` ต้องเป็น 'STRING' ข้อความเดียวยาวๆ เท่านั้น ห้ามแตกเป็น Object ย่อย\n"
)


class GenesisFactory:
    def __init__(self, project_id: Optional[str] = None, location: Optional[str] = None):
        self.project_id = project_id or os.getenv("VERTEX_PROJECT") or os.getenv("GOOGLE_CLOUD_PROJECT")
        self.location = location or os.getenv("VERTEX_LOCATION", "global")
        self.model_name = os.getenv("FACTORY_MODEL", "gemini-2.5-flash")

        self._client = None

    @property
    def client(self):
        if self._client is None:
            try:
                from google import genai
                project = self.project_id
                if not project:
                    try:
                        import google.auth
                        _, default_project = google.auth.default()
                        project = default_project
                        self.project_id = project
                    except Exception:
                        pass

                if project:
                    self._client = genai.Client(vertexai=True, project=project, location=self.location)
                    logger.info(f"✅ [FACTORY] Initialized Vertex AI client (Project: {project}, Region: {self.location})")
                elif os.getenv("GEMINI_API_KEY"):
                    self._client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
                    logger.info("ℹ️ [FACTORY] Initialized Gemini API client with GEMINI_API_KEY")
                else:
                    self._client = genai.Client(vertexai=True)
                    logger.info("ℹ️ [FACTORY] Initialized Keyless Vertex AI Client via ADC")
            except Exception as e:
                logger.warning(f"⚠️ [FACTORY] Could not initialize Vertex AI client: {e}")
                self._client = None
        return self._client

    def _call_llm(self, prompt: str) -> str:
        """เรียกใช้งาน Vertex AI ผ่าน Google Gen AI SDK เพื่อสร้าง JSON"""
        if not self.client:
            return "{}"

        from google.genai import types
        logger.info(f"📤 [FACTORY GENAI] ส่ง Request ไปที่ {self.model_name}")
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[{"role": "user", "parts": [{"text": prompt}]}],
                config=types.GenerateContentConfig(
                    temperature=1.0,
                    max_output_tokens=65535,
                    response_mime_type="application/json",
                    safety_settings=[
                        types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="OFF"),
                        types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="OFF"),
                        types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="OFF"),
                        types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="OFF")
                    ]
                )
            )
            content = response.text or "{}"
            logger.info(f"📥 [FACTORY GENAI] ได้รับ Response ความยาว: {len(content)} ตัวอักษร")
            return content
        except Exception as e:
            logger.error(f"❌ [FACTORY GENAI ERROR] {str(e)}")
            return "{}"

    def build_character(self, master_brief: str) -> Dict[str, Any]:
        logger.info("🏭 [FACTORY/ANATOMIST] กำลังปั้นตัวละคร...")
        
        json_template = '''{
  "name": "ชื่อตัวละคร (ภาษาไทย/อังกฤษ)",
  "archetype": "Archetype ภาษาอังกฤษ (คำอธิบายภาษาไทย)",
  "hashtag_dna": ["#แท็ก1", "#แท็ก2"],
  "appearance": {
    "anatomy_features": ["จุดเด่นร่างกาย 1", "จุดเด่น 2"],
    "wardrobe": {
      "outfit_1": "คำอธิบายชุด 1",
      "outfit_2": "คำอธิบายชุด 2"
    },
    "signature_postures": ["ท่าทาง 1 (Solo Action เท่านั้น)"]
  },
  "background_story": ["ประวัติส่วนตัว 1", "ประวัติ 2"],
  "max_desire": 1000,
  "psychology": {
    "the_mask": "หน้ากากที่แสดงออก",
    "the_core": "ตัวตนที่แท้จริง",
    "the_conflict": "ความขัดแย้งในใจ"
  },
  "core_stats": {
    "initiative": 5, "honesty": 5, "expressiveness": 5, "formality": 5, "playfulness": 5, "dominance": 5, "physicality": 5,
    "sensibility": 5, "mask_integrity": 5, "perception": 5, "emotional_stability": 5, "patience": 5
  },
  "preferences": {
    "likes": ["สิ่งที่ชอบ"],
    "dislikes": ["สิ่งที่ไม่ชอบ"]
  },
  "micro_expressions": {
    "when_happy_but_hiding": ["..."],
    "when_shy_but_deadpan": ["..."],
    "when_desire_high": ["..."]
  },
  "passive_perks": [
    {"perk_name": "ชื่อ Perk", "trigger": "เงื่อนไข", "effect": "ผลลัพธ์"}
  ],
  "dynamic_evolution": {
    "phase_2": {
      "requirements": {"affection_min": 60, "desire_min": 40},
      "phase_description": "คำอธิบายเมื่อพัฒนาความสัมพันธ์"
    }
  }
}'''

        prompt = (
            "คุณคือ 'The Anatomist' ผู้เชี่ยวชาญการสร้างตัวละคร\n"
            f"จงสร้าง character.json จาก Master Brief นี้:\n\n{master_brief}\n\n"
            f"บังคับใช้โครงสร้าง JSON ตาม Template นี้อย่างเคร่งครัด:\n{json_template}\n\n"
            "กฎเหล็ก: ตอบกลับมาเป็น JSON ที่ถูกต้องเท่านั้น ห้ามมี Markdown ครอบ ห้ามมีคำอธิบายเพิ่มเติม"
        )
        
        for attempt in range(2):
            result_text = self._call_llm(prompt)
            clean_text = result_text.strip()
            if clean_text.startswith("```json"): clean_text = clean_text[7:]
            if clean_text.startswith("```"): clean_text = clean_text[3:]
            if clean_text.endswith("```"): clean_text = clean_text[:-3]
            clean_text = clean_text.strip()
            
            try:
                parsed_json = json.loads(clean_text)
                logger.info("✅ [FACTORY] ปั้น character JSON สำเร็จ")
                return parsed_json
            except Exception as e:
                logger.error(f"❌ [FACTORY ERROR] แปลง JSON ไม่สำเร็จ (Attempt {attempt+1}): {e}")
        return {}

    def extract_theme_color(self, base64_data: str, mime_type: str) -> str:
        """วิเคราะห์รูปภาพเพื่อดึงสีผมและแปลงเป็น Muted Pastel Hex Code"""
        if not self.client:
            return "#EF264C"

        from google.genai import types
        import base64
        logger.info("🎨 [FACTORY] วิเคราะห์สีหลักจากรูปภาพ...")
        
        prompt = (
            "Analyze this character image. Identify the dominant hair or main accent color. "
            "Return ONLY a JSON object with a single key 'hex' containing a beautiful muted pastel hex code like #FFB6C1."
        )
        
        try:
            image_part = types.Part.from_bytes(data=base64.b64decode(base64_data), mime_type=mime_type)
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[types.Content(role="user", parts=[types.Part.from_text(text=prompt), image_part])],
                config=types.GenerateContentConfig(temperature=0.2, max_output_tokens=1024, response_mime_type="application/json")
            )
            content = response.text
            if content:
                parsed = json.loads(content)
                return parsed.get("hex", "#EF264C")
        except Exception as e:
            logger.error(f"❌ [FACTORY ERROR] สกัดสีล้มเหลว: {e}")
        return "#EF264C"

    def inject_beat(
        self,
        prev_beat: Optional[Dict[str, Any]],
        next_beat: Optional[Dict[str, Any]],
        user_prompt: str,
        master_brief: Optional[str] = None,
        character_data: Optional[Dict[str, Any]] = None
    ) -> list:
        logger.info("🏭 [FACTORY/DIRECTOR] กำลังแทรก Beat...")
        
        context_str = ""
        if character_data:
            context_str += f"ข้อมูลตัวละคร:\n{json.dumps(character_data, ensure_ascii=False)}\n\n"
        if master_brief:
            context_str += f"Master Brief:\n{master_brief}\n\n"

        prompt = (
            "คุณคือ 'The Director' ผู้เชี่ยวชาญการกำกับคิวการแสดง\n"
            f"{THE_ENGINE_MANIFESTO}\n"
            f"{context_str}"
            f"ผู้ใช้ต้องการแทรกฉาก: '{user_prompt}'\n\n"
        )
        if prev_beat: prompt += f"Previous Beat:\n{json.dumps(prev_beat, ensure_ascii=False)}\n\n"
        if next_beat: prompt += f"Next Beat:\n{json.dumps(next_beat, ensure_ascii=False)}\n\n"

        prompt += (
            "ส่งคืนผลลัพธ์มาเป็น JSON Object ที่มี key 'beats' บรรจุ Array ของ Beats ที่เชื่อมต่อกัน\n"
            "ใน hidden_evaluation_criteria ต้องมีอย่างน้อย 2 ทางเลือก: action_result: illusion_trigger และ chaos_escalation"
        )

        for attempt in range(2):
            result_text = self._call_llm(prompt)
            clean_text = result_text.strip()
            if clean_text.startswith("```json"): clean_text = clean_text[7:]
            if clean_text.startswith("```"): clean_text = clean_text[3:]
            if clean_text.endswith("```"): clean_text = clean_text[:-3]
            clean_text = clean_text.strip()
            try:
                parsed = json.loads(clean_text)
                return parsed.get("beats", [])
            except Exception as e:
                logger.error(f"❌ [FACTORY ERROR] Inject Beat ล้มเหลว: {e}")
        return []

    def improve_beat(
        self,
        beats: List[Dict[str, Any]],
        user_prompt: str,
        master_brief: Optional[str] = None,
        character_data: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        logger.info(f"🏭 [FACTORY/DIRECTOR] ปรับปรุง {len(beats)} บีท...")
        
        context_str = ""
        if character_data: context_str += f"ข้อมูลตัวละคร:\n{json.dumps(character_data, ensure_ascii=False)}\n\n"
        if master_brief: context_str += f"Master Brief:\n{master_brief}\n\n"

        prompt = (
            "คุณคือ 'The Director' ผู้เชี่ยวชาญการกำกับคิวการแสดง\n"
            f"{THE_ENGINE_MANIFESTO}\n"
            f"{context_str}"
            f"Original Beats:\n{json.dumps(beats, ensure_ascii=False)}\n\n"
            f"คำสั่งปรับปรุง: '{user_prompt}'\n\n"
            "ส่งคืนผลลัพธ์มาเป็น JSON Object ที่มี key 'beats' ที่ปรับปรุงแล้ว"
        )

        for attempt in range(2):
            result_text = self._call_llm(prompt)
            clean_text = result_text.strip()
            if clean_text.startswith("```json"): clean_text = clean_text[7:]
            if clean_text.startswith("```"): clean_text = clean_text[3:]
            if clean_text.endswith("```"): clean_text = clean_text[:-3]
            clean_text = clean_text.strip()
            try:
                parsed = json.loads(clean_text)
                return parsed.get("beats", beats)
            except Exception as e:
                logger.error(f"❌ [FACTORY ERROR] Improve Beat ล้มเหลว: {e}")
        return beats

    def _extract_skeleton_from_brief(self, master_brief: str) -> List[Dict[str, Any]]:
        """สกัดโครงสร้างก้างปลา (Skeleton) จาก Master Brief"""
        import re
        scenes_skeleton = []
        current_scene = None
        beat_counter = 1
        scene_counter = 1
        
        scene_pattern = re.compile(r"^(?:###\s*)?📍\s*(?:\*\*)?ฉากที่\s*\d+:(.*?)(?:\*\*)?$", re.IGNORECASE)
        beat_pattern = re.compile(r"^\d+\.\s+(.*)")
        
        for line in master_brief.split('\n'):
            line = line.strip()
            scene_match = scene_pattern.search(line)
            if scene_match:
                if current_scene:
                    scenes_skeleton.append(current_scene)
                scene_name = scene_match.group(1).strip()
                current_scene = {
                    "scene_id": f"scene_{scene_counter}",
                    "name": scene_name,
                    "beats": []
                }
                scene_counter += 1
                beat_counter = 1
                continue
            
            if current_scene:
                beat_match = beat_pattern.search(line)
                if beat_match:
                    beat_name = beat_match.group(1).strip()
                    current_scene["beats"].append({
                        "beat_id": f"{current_scene['scene_id']}_beat_{beat_counter}",
                        "name": beat_name
                    })
                    beat_counter += 1
                    
        if current_scene:
            scenes_skeleton.append(current_scene)
            
        logger.info(f"🦴 [FACTORY] สกัด Skeleton ได้ {len(scenes_skeleton)} ฉาก")
        return scenes_skeleton

    def build_world(self, master_brief: str, character_data: Dict[str, Any]) -> Dict[str, Any]:
        logger.info("🏭 [FACTORY/WORLD] สร้างโลกจาก Master Brief...")
        skeleton_scenes = self._extract_skeleton_from_brief(master_brief)
        skeleton_json_str = json.dumps(skeleton_scenes, ensure_ascii=False, indent=2)

        prompt = (
            "คุณคือ 'The Architect' และ 'The Cinematic Screenwriter'\n"
            f"{THE_ENGINE_MANIFESTO}\n"
            f"The Director's Plan:\n{master_brief}\n\n"
            f"Character Data:\n{json.dumps(character_data, ensure_ascii=False)}\n\n"
            f"Skeleton:\n{skeleton_json_str}\n\n"
            "จงสร้าง World JSON ที่มีฟิลด์: world_id, name, thai_name, description, player_persona, locations, "
            "time_periods, weather_system, initial_states, starting_state, prologue, opening_scenarios\n"
            "ใน prologue ต้องมี premise, question, และ choices (3 ตัวเลือก)\n"
            "ใน opening_scenarios ต้องมี scenes และ beats ครบตาม Manifesto\n"
            "ตอบกลับเป็น JSON ที่ถูกต้องเท่านั้น ห้ามมี Markdown ครอบ"
        )

        for attempt in range(2):
            result_text = self._call_llm(prompt)
            clean_text = result_text.strip()
            if clean_text.startswith("```json"): clean_text = clean_text[7:]
            if clean_text.startswith("```"): clean_text = clean_text[3:]
            if clean_text.endswith("```"): clean_text = clean_text[:-3]
            clean_text = clean_text.strip()
            
            try:
                parsed_json = json.loads(clean_text)
                logger.info("✅ [FACTORY] สร้าง World JSON สำเร็จ")
                return parsed_json
            except Exception as e:
                logger.error(f"❌ [FACTORY ERROR] แปลง World JSON ไม่สำเร็จ (Attempt {attempt+1}): {e}")
        return {}
