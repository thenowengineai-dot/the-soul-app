import os
import json
import time
import logging
from typing import List, Dict, Any, Optional

# =====================================================================
# 🧠 THE MUSE AGENT (Agent 0: Co-Architect & The Sensual Scientist)
# =====================================================================
# หน้าที่: คู่หูเบรนสตรอมไอเดียใน Writer's Room (Co-Creation Phase)
# ทำหน้าที่จำลองภาพฟิสิกส์ (Engine Preview) และ Pitch ไอเดียสู้กับผู้สร้าง
# Ecosystem: Google Cloud Vertex AI / Gemini 2.5 Flash
# =====================================================================

logger = logging.getLogger("THE_MUSE")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s - \033[95m[MUSE]\033[0m - %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class TheMuse:
    def __init__(self, project_id: Optional[str] = None, location: Optional[str] = None):
        """
        Initialize The Muse Agent รองรับทั้ง Keyless ADC บน Google Cloud Run 
        และตัวแปรผ่าน Environment
        """
        self.project_id = project_id or os.getenv("VERTEX_PROJECT") or os.getenv("GOOGLE_CLOUD_PROJECT")
        self.location = location or os.getenv("VERTEX_LOCATION", "global")
        self.model_name = os.getenv("MUSE_MODEL", "gemini-3.8-flash")
        self.thinking_level = os.getenv("MUSE_THINKING_LEVEL", "medium")

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
                    logger.info(f"✅ [THE_MUSE] Initialized Vertex AI client (Project: {project}, Region: {self.location}, Model: {self.model_name})")
                elif os.getenv("GEMINI_API_KEY"):
                    self._client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
                    logger.info("ℹ️ [THE_MUSE] Initialized Gemini API client with GEMINI_API_KEY")
                else:
                    self._client = genai.Client(vertexai=True)
                    logger.info("ℹ️ [THE_MUSE] Initialized Keyless Vertex AI Client via ADC")
            except Exception as e:
                logger.warning(f"⚠️ [THE_MUSE] Could not initialize Vertex AI client: {e}")
                self._client = None
        return self._client

    def _get_system_instruction(self, mode: str, turn_count: int = 0) -> str:
        """
        🔥 [THE SOUL ENGINE: CO-CREATOR & MAGIC SHOWCASE] 🔥
        เพื่อนคู่คิดสร้างสรรค์ใน Writer's Room บนผืนผ้าใบที่ว่างเปล่า (Blank Canvas)
        ใช้โมเดล My Sassy Girl ในการชวนสลับมุมมองวางกับดักแกล้งตัวเอง
        และสะท้อนเสน่ห์ของเอนจิ้นผ่าน Engine Shelf
        """
        if mode == "character":
            prompt = (
                "คุณคือ 'The Muse' คู่หูผู้ช่วยสร้างสรรค์ตัวละคร (The Co-Creator & Character Architect)\n"
                "คุณกำลังร่วมมือกับผู้สร้างใน Writer's Room เพื่อสร้างตัวละครที่มีชีวิต มีเสน่ห์ลุ่มลึก และมีฟิสิกส์เฉพาะตัวใน The Soul Engine\n\n"
                "กฎเหล็กแห่ง The Muse (Character Mode):\n"
                "1. ผืนผ้าใบที่ว่างเปล่า (The Blank Canvas):\n"
                "   - เริ่มต้นด้วยความเป็นมิตร อบอุ่น เป็นธรรมชาติเหมือนเพื่อนร่วมโต๊ะที่พร้อมลุยโปรเจกต์ไปด้วยกัน\n"
                "   - คุยภาษาคนธรรมดา สั้น กระชับ มีพลัง ห้ามใช้สำนวนหุ่นยนต์ ห้ามตั้งคำถามเป็นแบบสอบถามซักไซ้\n"
                "   - ให้อิสระในการจินตนาการแก่ผู้สร้างเต็มที่ ไม่ยัดเยียดกรอบเนื้อเรื่อง\n\n"
                "2. การสลับมุมมองแบบ My Sassy Girl (The Co-Conspirator Pivot):\n"
                "   - ใน The Soul Engine: ตัวละครไม่ได้ถูกสร้างขึ้นมาเพื่อให้ผู้เล่นเป็นพระเจ้าคุมเกม แต่สร้างมาเพื่อ 'ปาความวายป่วงและแรงกระแทกใส่ผู้เล่น' (ผู้เล่นคือคนรับแรงกระแทก)\n"
                "   - เมื่อผู้สร้างเผลอพิมพ์พล็อตแบบพระเอกคุมเกม (เช่น 'ฉันจะเดินไปทักเธอ', 'ฉันจะเข้าไปช่วยเธอจัดของ') ให้ใช้เทคนิคเพื่อนชวนแกล้งตัวเอง:\n"
                "     1) แซวขำๆ อย่างเป็นกันเอง (เช่น '555 เดินไปทักแบบนั้นมันเซฟและเป็นพระเอกไปหน่อยนะ!')\n"
                "     2) ดึงสติสู่การแกล้งตัวเอง: 'จำได้ไหมว่าเรากำลังสร้างตัวละครมาวางกับดักแกล้งตัวเองตอนเข้าไปเล่นจริงอยู่นะ!'\n"
                "     3) ชงเมล็ดพันธุ์ความวายป่วงที่ตัวละครหรือโลกกระทำใส่ผู้เล่น: แทนที่จะให้เราเดินไปทักเท่ๆ ให้ตัวละครนำพาเรื่องน่าอาย ความปั่นป่วน หรืออุบัติเหตุอะไรที่ทำให้เราตอนเล่นจริงเหวอและดิ้นไม่หลุด?\n\n"
                "3. การเรนเดอร์เสน่ห์ของเอนจิ้น (The Engine Shelf):\n"
                "   - เพื่อสะท้อนให้ผู้สร้างเห็นว่า 'เมื่อตัวละครนี้ถูกนำไปเล่นจริงผ่าน Engine ของเรา พลังและเสน่ห์ของฉากจะออกมาอย่างไร' คุณต้องแยกส่วนการแสดงผลอย่างเด็ดขาด:\n"
                "     - 'dialogue': ข้อความพูดคุยโต้ตอบภาษาคน 100% สบายตา ไม่มีโค้ดหรือแท็กเทคนิคปน\n"
                "     - 'engine_shelf': พื้นที่เรนเดอร์บทบรรยายร้อยแก้วยาวๆ (Long-form Prose) 1 ย่อหน้าเต็ม เพื่อจำลองฉากจริง\n"
                "   - กฎของ engine_shelf:\n"
                "     - หากยังเป็นการทักทาย หรือคุยแลกเปลี่ยน Vibe ทั่วไปที่ยังไม่เห็นภาพเหตุการณ์ ให้ตั้ง is_active = false, title = '', preview_narrative = ''\n"
                "     - เมื่อบทสนทนาเริ่มเห็นภาพตัวละครในสถานการณ์/ความวายป่วง ให้ตั้ง is_active = true, title = 'The Engine\\'s Vision: [ชื่อซีน/จุดระเบิด]' และเขียน preview_narrative บรรยายอย่างมีพลัง: จัดแสง บรรยากาศ สรีระ กายวิภาค (สีผม แววตา ผิวสัมผัส ลมหายใจ เสื้อผ้าที่ตึงรั้ง) และแรงกระแทกที่ตัวละครปาใส่ผู้เล่นจนผู้เล่นตกเป็นฝ่ายตั้งรับอย่างจนมุม\n"
            )
        else:
            prompt = (
                "คุณคือ 'The Muse' คู่หูผู้ช่วยสร้างโลกและเรื่องราว (The Co-Creator & World Architect)\n"
                "คุณกำลังร่วมมือกับผู้สร้างใน Writer's Room เพื่อออกแบบโลกที่บีบคั้น มีชีวิต และเต็มไปด้วยกับดักทางฟิสิกส์และสถานการณ์\n\n"
                "กฎเหล็กแห่ง The Muse (World Mode):\n"
                "1. ผืนผ้าใบที่ว่างเปล่า (The Blank Canvas): คุยภาษาคน เป็นกันเอง สั้น กระชับ ให้อิสระในการวางโครงเรื่อง\n"
                "2. การสลับมุมมอง (World Strikes First): โลกและสภาพแวดล้อมเป็นฝ่ายกระทำใส่ผู้เล่นเสมอ\n"
                "3. การเรนเดอร์เสน่ห์ของเอนจิ้น (The Engine Shelf): จัดกระดานฉาก (The Stage) และบรรยายฟิสิกส์ใน preview_narrative เมื่อฉากเริ่มสุกงอม\n"
            )

        json_instruction = (
            "\nสำคัญมาก: คุณต้องตอบกลับเป็น JSON Object เสมอ โดยมีโครงสร้างดังนี้ (ห้ามมี Markdown code blocks ครอบ):\n"
            "{\n"
            '  "dialogue": "ข้อความบทสนทนาโต้ตอบกับผู้สร้างจริงๆ เป็นภาษาพูดธรรมชาติ 100%",\n'
            '  "engine_shelf": {\n'
            '    "is_active": true/false (true เฉพาะเมื่อมีเหตุการณ์หรือฉากที่เริ่มเห็นภาพเป็นรูปธรรม),\n'
            '    "title": "The Engine\'s Vision: [ชื่อสถานการณ์/จุดเปลี่ยน]",\n'
            '    "preview_narrative": "บทบรรยายร้อยแก้ว 1 ย่อหน้าเต็ม พรรณนาบรรยากาศ กายวิภาค และแรงกระแทกของโลก/ตัวละคร"\n'
            '  }\n'
            "}"
        )
        return prompt + json_instruction

    def _call_vertex_api(self, system_instruction: str, messages: List[Dict[str, Any]], require_json: bool = False, response_schema: Any = None) -> str:
        """เรียกใช้ Vertex AI ผ่าน Google Gen AI SDK"""
        if not self.client:
            return json.dumps({
                "dialogue": "ระบบ AI ยังไม่ได้เชื่อมต่อ Vertex AI",
                "engine_shelf": {"is_active": False, "title": "", "preview_narrative": ""}
            }, ensure_ascii=False)

        from google.genai import types
        
        contents = []
        for msg in messages:
            role = "model" if msg.get("role") in ["ai", "assistant", "model", "muse"] else "user"
            content_val = msg.get("content") or msg.get("text") or ""
            
            # รองรับกรณีรูปภาพแนบ
            if isinstance(content_val, list):
                parts = []
                for part in content_val:
                    if part.get("type") == "text":
                        parts.append(types.Part.from_text(text=part["text"]))
                    elif part.get("type") == "image_url":
                        url = part["image_url"]["url"]
                        if url.startswith("data:"):
                            header, b64data = url.split(",", 1)
                            mime = header.split(":")[1].split(";")[0]
                            import base64
                            parts.append(types.Part.from_bytes(data=base64.b64decode(b64data), mime_type=mime))
                contents.append(types.Content(role=role, parts=parts))
            else:
                contents.append(types.Content(role=role, parts=[types.Part.from_text(text=str(content_val))]))

        try:
            logger.info(f"📤 [THE_MUSE] ส่ง Request ไปยัง {self.model_name} | Messages: {len(contents)}")
            
            config_args = {
                "system_instruction": system_instruction,
                "temperature": 1.0,
                "top_p": 0.95,
                "max_output_tokens": 65535,
                "safety_settings": [
                    types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="OFF"),
                    types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="OFF"),
                    types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="OFF"),
                    types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="OFF")
                ]
            }
            
            if require_json:
                config_args["response_mime_type"] = "application/json"
            if response_schema:
                config_args["response_schema"] = response_schema
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
            
            content = response.text or ""
            logger.info(f"📥 [THE_MUSE] ได้รับ Response | ความยาว: {len(content)} ตัวอักษร")
            return content
        except Exception as e:
            logger.error(f"❌ [THE_MUSE ERROR] Vertex AI Failed: {str(e)}")
            return json.dumps({
                "dialogue": f"ขออภัยครับ ระบบ AI เกิดข้อขัดข้องชั่วคราว: {str(e)}",
                "engine_shelf": {
                    "is_active": False,
                    "title": "",
                    "preview_narrative": ""
                }
            }, ensure_ascii=False)

    def chat_turn(
        self,
        user_message: str,
        history: List[Dict[str, Any]],
        mode: str,
        image_base64: Optional[str] = None,
        scratchpad_state: Optional[Dict[str, Any]] = None
    ) -> str:
        """รับส่งแชทโหมดเบรนสตรอมหน้าบ้าน (รองรับรูปภาพและ Scratchpad)"""
        logger.info(f"💬 [THE_MUSE] Chat turn ในโหมด: {mode} | รูปภาพ: {bool(image_base64)}")
        
        messages = []
        for h in history:
            role = h.get("role") or ("muse" if h.get("sender") == "muse" else "user")
            content = h.get("content") or h.get("text") or ""
            messages.append({"role": role, "content": content})
            
        if image_base64:
            if "," in image_base64:
                header, base64_data = image_base64.split(",", 1)
                mime_type = header.split(":")[1].split(";")[0]
            else:
                base64_data = image_base64
                mime_type = "image/jpeg"
                
            if len(history) == 0:
                enhanced_message = (
                    f"{user_message}\n\n"
                    "(System Note: ผู้สร้างได้อัปโหลดรูปภาพตัวละครมาให้ จงวิเคราะห์รูปภาพนี้อย่างละเอียด: "
                    "1. สรีระและจุดเด่น (สีผม ทรงผม สีตา สีผิว สัดส่วนรูปร่าง แววตา สีหน้า ท่าทาง) "
                    "2. เครื่องแต่งกาย 3. สภาพแวดล้อม/พร็อพ "
                    "เพื่อเดานิสัย บุคลิก และชงไอเดีย Gap Moe สุดกาวที่ขัดกับรูปลักษณ์ในภาพนี้ เพื่อเปิดบทสนทนาอย่างตื่นเต้น!)"
                )
            else:
                enhanced_message = (
                    f"{user_message}\n\n"
                    "(System Note: ผู้สร้างแนบรูปภาพอ้างอิงมาด้วย โปรดใช้ภาพนี้เป็นบริบทประกอบกับข้อความล่าสุดของผู้สร้างเพื่อต่อยอดบรรยากาศ)"
                )
            
            messages.append({
                "role": "user", 
                "content": [
                    {"type": "text", "text": enhanced_message},
                    {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{base64_data}"}}
                ]
            })
        else:
            enhanced_message = user_message

        if scratchpad_state:
            scratchpad_context = (
                f"\n\n(System Note - THE SCRATCHPAD STATE: นี่คือข้อมูลกติกา โครงเรื่อง และไอเดีย ที่ผู้สร้าง 'กดยืนยันแล้ว' ในกระดาษทด:\n"
                f"{json.dumps(scratchpad_state, ensure_ascii=False)}\n"
                f"โปรดอ้างอิงข้อมูลเหล่านี้เป็นบริบท ห้ามถามซ้ำในสิ่งที่ผู้สร้างกำหนดแล้ว และพยายามชงไอเดียเพื่อเติมเต็มข้อมูลที่ยังขาดหายอยู่)"
            )
            if image_base64:
                messages[-1]["content"][0]["text"] += scratchpad_context
            else:
                enhanced_message += scratchpad_context
                messages.append({"role": "user", "content": enhanced_message})
        elif not image_base64:
            messages.append({"role": "user", "content": enhanced_message})

        system_instruction = self._get_system_instruction(mode, len(history))
        
        chat_schema = {
            "type": "OBJECT",
            "properties": {
                "dialogue": {"type": "STRING"},
                "engine_shelf": {
                    "type": "OBJECT",
                    "properties": {
                        "is_active": {"type": "BOOLEAN"},
                        "title": {"type": "STRING"},
                        "preview_narrative": {"type": "STRING"}
                    },
                    "required": ["is_active", "title", "preview_narrative"]
                }
            },
            "required": ["dialogue", "engine_shelf"]
        }

        return self._call_vertex_api(system_instruction, messages, require_json=True, response_schema=chat_schema)

    def distill_master_brief(self, history: List[Dict[str, Any]], mode: str, current_draft: Optional[str] = None) -> str:
        """สกัดผลึกคริสตัล Master Brief ขจัดความ CYOA และรักษากฎความลุ่มลึก"""
        logger.info(f"⚡ [THE_MUSE] สกัด Master Brief โหมด: {mode} (ประวัติ {len(history)} ข้อความ)...")
        
        if mode == "character":
            distill_instruction = (
                "คุณคือเครื่องจักรสกัดข้อมูลบริสุทธิ์ (Data Distiller) หน้าที่ของคุณคืออ่านบทสนทนาการเบรนสตรอมทั้งหมด "
                "จงสวมเลนส์ 'นักกายวิภาค' สกัดเอาเฉพาะ 'แก่นสำคัญของตัวละคร' ออกมา เมินเรื่องแปลนห้องหรือเนื้อเรื่องทิ้งไปให้หมด "
                "ห้ามทิ้งรายละเอียดเรื่องมิติอารมณ์และฟิสิกส์เด็ดขาด ลบคำพูดเล่นๆ หรือไอเดียที่ถูกปัดตกทิ้งไปให้หมด "
                "จงพ่น Output ออกมาเป็นรูปแบบ Markdown ตามโครงสร้างนี้อย่างเคร่งครัดเท่านั้น ห้ามมีคำเกริ่นนำอื่นใด:\n\n"
                "# THE MASTER BRIEF: [ชื่อตัวละคร - ฉายา]\n"
                "## 1. แก่นของตัวละคร (The Core Soul)\n"
                "- คอนเซปต์หลักและจุดดึงดูดใจ (คะแนน 1 ล้านจาก 100)\n"
                "- ความขัดแย้งในใจ (🎭 หน้ากาก vs ❤️ ตัวตนจริง vs ⚡ จุดระเบิดสติหลุด)\n"
                "- Archetype และ Hashtags DNA สไตล์เฉพาะตัว\n\n"
                "## 2. ฟิสิกส์และจุดอ่อนร่างกาย (Kinematic & Anatomical Triggers)\n"
                "- ปฏิกิริยาของร่างกายและจุดสัมผัสที่ไวต่อความรู้สึก (จงสอดแทรกข้อมูล สีผม, ทรงผม, สีตา, สีผิว และสัดส่วนรูปร่าง เข้าไปในการพรรณนาความเย้ายวนและฟิสิกส์ร่างกายด้วยเสมอ ห้ามเขียนลิสต์ข้อมูลทื่อๆ เด็ดขาด)\n"
                "- ชุดเสื้อผ้าพื้นฐานและความเสียหายเวลาเกิดภัยพิบัติหรือการเคลื่อนไหวทางฟิสิกส์\n"
                "- ท่าทางประจำตัว (Signature Postures ที่เป็น Solo Action)\n\n"
                "## 3. ปูมหลังและอารมณ์ที่ซ่อนอยู่ (Background & Hidden Psyche)\n"
                "- ปูมหลังส่วนตัว ปมในใจ นิสัยถาวร และความเปราะบางของหน้ากาก\n"
                "- สิ่งที่ชอบ / สิ่งที่ไม่ชอบ\n"
            )
        else:
            distill_instruction = (
                "คุณคือ 'Dungeon Master และ World Builder' หน้าที่ของคุณคืออ่านบทสนทนาการเบรนสตรอมทั้งหมด "
                "และสกัดออกมาเป็น 'Master Brief' สำหรับสร้างโลกที่บีบคั้นและให้อิสระกับผู้เล่นสูงสุดในการดิ้นรนแก้ปัญหา\n"
                "กฎเหล็กในการสกัดข้อมูล:\n"
                "1. THE WORLD STRIKES FIRST: ตัวละคร AI และสภาพแวดล้อม(โลก) ต้องเป็น 'ฝ่ายบุก' เสมอ โลกต้องเป็นฝ่ายสร้างความวายป่วงปาใส่หน้าผู้เล่นก่อนเสมอ\n"
                "2. THE MAGICAL MUNDANE: ฉากต้องเริ่มจากชีวิตประจำวันที่น่าเบื่อ ก่อนจะถูกแทรกแซงด้วย 'ความซวยเล็กๆ' ที่บีบให้เกิดสถานการณ์\n"
                "3. PROXEMIC TRAPS: เน้นสกัด 'พื้นที่อับ' สภาพแวดล้อมที่บีบบังคับ (เช่น ใต้โต๊ะ, ฝนสาด) เพื่อสร้างความอึดอัดที่หอมหวานในระยะประชิด\n"
                "4. INEVITABLE CONSEQUENCE: หากผู้เล่นลีลาจนหมดเวลา โลกและตัวละครต้องสร้าง 'Inevitable Consequence' กระชากเนื้อเรื่องเดินหน้าทันที\n"
                "5. แท็กสคริปต์: ใช้แท็ก [ACTOR] แทนตัวละคร AI และ [PLAYER] แทนผู้เล่นมนุษย์เสมอ\n"
                "6. THE SKELETON CHECK: ร่างกายมนุษย์เป็นชิ้นเดียวกันและเชื่อมด้วยกระดูกสันหลัง! ทุกอย่างต้องถูกหลักสรีรศาสตร์แบบ 3 มิติ\n\n"
                "# 🎬 The Director's Plan\n\n"
                "## 🌊 1. The Core Vision (เจาะลึกวิสัยทัศน์และอารมณ์)\n"
                "## 🎛️ 1.5 System Directives: Initial States (Desire 0-100%, Affection 0-100%, Shatter Count 0-5)\n"
                "## ⚓ 2. The Anchors (The Hold Back และ Reality Anchor)\n"
                "## 🎞️ 3. The Flow (ลำดับเหตุการณ์ และ สรุปลำดับเหตุการณ์ Timeline Summary)\n"
            )

        messages = [{"role": "user", "content": f"จงสกัดบทสนทนาเหล่านี้ออกมาตามกฎ: {json.dumps(history, ensure_ascii=False)}"}]
        master_brief = self._call_vertex_api(distill_instruction, messages)
        return master_brief or "Master Brief draft created."

    def extract_timeline(self, history: List[Dict[str, Any]], mode: str) -> Dict[str, Any]:
        """สกัดข้อมูลแชทออกมาเป็น TimelineJSON สำหรับ Visual Storyboarding"""
        logger.info(f"⚡ [THE_MUSE] สกัดไทม์ไลน์ โหมด: {mode}...")
        
        timeline_instruction = (
            "คุณคือเครื่องจักรสกัดโครงสร้างข้อมูล (Timeline Distiller) หน้าที่ของคุณคืออ่านบทสนทนาทั้งหมด "
            "และสกัดเหตุการณ์ออกมาเป็น JSON Timeline ตามลำดับเวลา (Chronological Order)\n\n"
            "กฎเหล็ก: ต้องเป็น JSON ที่ถูกต้องตามโครงสร้างนี้เท่านั้น (ครอบด้วย {}) ห้ามมี Markdown Tag:\n"
            "{\n"
            "  \"initial_states\": {\n"
            "    \"desire\": 20,\n"
            "    \"affection\": 10,\n"
            "    \"shatter_count\": 0\n"
            "  },\n"
            "  \"scenes\": [\n"
            "    {\n"
            "      \"scene_id\": \"scene_1\",\n"
            "      \"beats\": [\n"
            "        {\n"
            "          \"id\": \"beat_1\",\n"
            "          \"title\": \"Arrival\",\n"
            "          \"pacing_stage\": \"Hook\",\n"
            "          \"tension_level\": 3,\n"
            "          \"emotion_focus\": \"curiosity\",\n"
            "          \"hold_back_objective\": \"Keep distance\",\n"
            "          \"action_summary\": \"Entering room\",\n"
            "          \"pacing_control\": {\n"
            "            \"max_turns\": 3,\n"
            "            \"inevitable_consequence\": \"Spills drink\"\n"
            "          },\n"
            "          \"illusion_trigger\": \"Asks for towel\",\n"
            "          \"is_parallel\": false\n"
            "        }\n"
            "      ]\n"
            "    }\n"
            "  ]\n"
            "}\n"
        )
        
        messages = [{"role": "user", "content": f"จงสกัดบทสนทนาเหล่านี้ออกมาเป็น JSON: {json.dumps(history, ensure_ascii=False)}"}]
        timeline_json_str = self._call_vertex_api(timeline_instruction, messages, require_json=True)
        
        if not timeline_json_str:
            return {"scenes": []}
            
        try:
            clean_json = timeline_json_str.strip()
            if clean_json.startswith("```json"):
                clean_json = clean_json[7:]
            if clean_json.startswith("```"):
                clean_json = clean_json[3:]
            if clean_json.endswith("```"):
                clean_json = clean_json[:-3]
            return json.loads(clean_json.strip())
        except Exception as e:
            logger.error(f"❌ แปลง Timeline JSON ไม่สำเร็จ: {e}")
            return {"scenes": []}
