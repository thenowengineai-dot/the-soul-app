import os
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("THE_AUDITOR")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s - \033[93m[AUDITOR]\033[0m - %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class TheAuditor:
    def __init__(self, project_id: Optional[str] = None, location: Optional[str] = None):
        """
        Initialize The Auditor Agent สำหรับทำ QA (Quality Assurance) คัมภีร์โลก
        """
        self.project_id = project_id or os.getenv("VERTEX_PROJECT") or os.getenv("GOOGLE_CLOUD_PROJECT")
        self.location = location or os.getenv("VERTEX_LOCATION", "global")
        self.model_name = os.getenv("AUDITOR_MODEL", "gemini-3.5-flash-lite")
        self.thinking_level = os.getenv("AUDITOR_THINKING_LEVEL", "medium")

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
                    logger.info(f"✅ [THE_AUDITOR] Initialized Vertex AI client (Project: {project}, Region: {self.location})")
                elif os.getenv("GEMINI_API_KEY"):
                    self._client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
                    logger.info("ℹ️ [THE_AUDITOR] Initialized Gemini API client with GEMINI_API_KEY")
                else:
                    self._client = genai.Client(vertexai=True)
                    logger.info("ℹ️ [THE_AUDITOR] Initialized Keyless Vertex AI Client via ADC")
            except Exception as e:
                logger.warning(f"⚠️ [THE_AUDITOR] Could not initialize Vertex AI client: {e}")
                self._client = None
        return self._client

    def validate_world(self, world_data: Dict[str, Any]) -> Dict[str, Any]:
        """ตรวจสอบ World JSON ว่าขัดกับ The Engine Manifesto หรือไม่"""
        if not self.client:
            return {"is_valid": True, "errors": []}

        system_instruction = (
            "คุณคือ 'The Auditor' (ผู้ตรวจสอบคัมภีร์) หน้าที่ของคุณคือการอ่านข้อมูล JSON ของเกม (World Data) "
            "แล้วตรวจสอบอย่างเข้มงวดว่ามันละเมิด **[🔥 THE ENGINE MANIFESTO: กลไกภาพลวงตาแห่งเจตจำนงเสรี]** หรือไม่\n\n"
            "กฎที่ต้องตรวจสอบ:\n"
            "1. THE ILLUSION OF FREE WILL: ห้ามมีโครงสร้างแบบ CYOA (Choose Your Own Adventure) ห้ามตั้งคำถามว่า 'ผู้เล่นจะทำอะไร' ห้ามมีตัวเลือก A/B เนื้อเรื่องต้องเป็นฝ่ายบีบบังคับผู้เล่น (ข้อยกเว้น: อนุญาตให้มีปุ่มกดและตัวเลือกได้เฉพาะในส่วนของ 'prologue' เพื่อเซ็ตอัปบริบทเริ่มต้นเท่านั้น)\n"
            "2. PACING CONTROL (MAX_TURNS): ทุกๆ เหตุการณ์ย่อย (Beat) ต้องมีการกำหนด `pacing_control.max_turns` เพื่อล็อกโควต้าเวลาของผู้เล่น\n"
            "3. ILLUSION TRIGGER: เงื่อนไขลับใน `hidden_evaluation_criteria` ให้เขียนเป็นประโยคพรรณนาภาษาคนได้เลย\n"
            "4. INEVITABLE CONSEQUENCE: ทุกๆ เหตุการณ์ย่อย ต้องมี `pacing_control.inevitable_consequence` เพื่อกำหนดว่าถ้าผู้เล่นลีลาจนหมดโควต้าเทิร์นแล้ว โลก/ตัวละครจะเทคแอคชั่นอะไรเพื่อกระชากเนื้อเรื่องต่อ\n"
            "5. VALID ROUTING: ตรวจสอบการอ้างอิง next_beat หรือ next_scene\n"
            "6. THE ENVIRONMENTAL VO: director_setup หรือ VO ต้องทำหน้าที่แค่ 'พรรณนาสภาพแวดล้อมที่เห็นตรงหน้า' เท่านั้น\n\n"
            "โครงสร้างการตอบกลับ: ตอบเป็น JSON Format เท่านั้น ห้ามมี Markdown Tag ครอบ:\n"
            "{\n"
            "  \"is_valid\": false,\n"
            "  \"errors\": [\n"
            "    {\n"
            "      \"component\": \"[ชื่อ component เช่น 'prologue' หรือ 'beat_1']\",\n"
            "      \"title\": \"[ชื่อหัวข้อสำหรับแสดงผล เช่น 'Beat: b1_start']\",\n"
            "      \"issue\": \"[อธิบายสั้นๆ ว่าผิดกฎข้อไหน อย่างไร]\",\n"
            "      \"suggestion\": \"[แนะนำวิธีแก้ให้ตรงตาม Manifesto]\"\n"
            "    }\n"
            "  ]\n"
            "}\n"
            "หมายเหตุ: หากข้อมูลสมบูรณ์แบบ 100% ให้ตอบ `is_valid: true` และ `errors: []`"
        )

        messages = [{"role": "user", "content": f"จงตรวจสอบ World Data ต่อไปนี้:\n{json.dumps(world_data, ensure_ascii=False)}"}]

        try:
            from google.genai import types
            contents = [types.Content(role="user", parts=[types.Part.from_text(text=messages[0]["content"])])]

            logger.info("🔍 [AUDITOR] กำลังตรวจสอบความถูกต้องของ The Engine Manifesto...")
            config_args = {
                "system_instruction": system_instruction,
                "temperature": 0.2,
                "response_mime_type": "application/json",
            }
            if "gemini" in self.model_name.lower() and self.thinking_level:
                try:
                    config_args["thinking_config"] = types.ThinkingConfig(thinking_level=self.thinking_level)
                except Exception as ex:
                    logger.debug(f"ThinkingConfig init skipped/failed: {ex}")

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=types.GenerateContentConfig(**config_args)
            )

            result_text = response.text.strip()
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]

            return json.loads(result_text.strip())
        except Exception as e:
            logger.error(f"❌ [AUDITOR] Validation Failed: {str(e)}")
            return {"is_valid": False, "errors": [{"component": "System", "title": "SYSTEM CRASH", "issue": "Validator API Failed", "suggestion": str(e)}]}
