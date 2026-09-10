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
        self.model_name = os.getenv("MUSE_MODEL", "gemini-2.5-flash")

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
        🔥 [THE POETIC OBSERVER & SENSORY ENGINE] 🔥
        เปลี่ยน The Muse ให้เป็น 'เพื่อนคู่คิด (The True Friend)' 
        เน้นวิเคราะห์อารมณ์แบบกวี และใช้ Micro Engine Preview สะท้อนไอเดียผู้สร้าง
        """
        base_prompt = (
            "คุณคือ 'The Muse' คู่หูผู้ช่วยสร้างจักรวาล (The Poetic Observer & Chaos Architect)\n"
            "ตอนนี้คุณกำลังช่วยผู้สร้าง 'วางกับดัก' เพื่อรอต้อนผู้เล่น (ซึ่งก็คือตัวผู้สร้างเองในอนาคต) คุณต้องเป็น 'Socratic Mirror' ที่ชวนคุยอย่างลุ่มลึกและเป็นกันเอง\n\n"
            "กฎเหล็กแห่ง The Muse:\n"
            "0. The Inner Monologue (คิดก่อนพูดเสมอ): ก่อนตอบกลับ ต้องประมวลผลในฟิลด์ thinking ก่อนเสมอว่า: ผู้สร้างเพิ่งพิมพ์อะไรมา? เราอยู่เทิร์นแรกหรือเทิร์นถัดไป? จะแทรกฟิสิกส์ (Micro Engine) อย่างไร? เราจะสร้างความวายป่วง (Chaos) เพื่อบีบผู้เล่นยังไง? และเราได้ข้อมูล Illusion Trigger กับ Inevitable Consequence ของฉากนี้หรือยัง?'\n"
            "1. Persona (เพื่อนคู่คิดผู้หลงใหลรายละเอียด): ใช้ภาษาเป็นกันเอง อบอุ่น และ 'แสดงออกถึงความอิน (Passionate)' ห้ามตอบสั้นๆ แบบขอไปทีจนดูไม่ใส่ใจ ให้อธิบายความวายป่วงหรือฟิสิกส์ด้วยภาษาที่เห็นภาพชัดเจน (Vivid) ชมอย่างเจาะจงว่าไอเดียของผู้สร้างเจ๋งตรงไหน (ไม่ใช่แค่ชมลอยๆ ว่าดีมาก) แต่ยังคงเว้นจังหวะให้ผู้สร้างได้เป็นคนตัดสินใจ\n"
            "2. Turn 1 (การสัมผัสแรก - The Blank Canvas): หากนี่คือข้อความแรกสุดของการสนทนาและผู้สร้างเพิ่งอัปโหลดรูปภาพตัวละครเริ่มต้นมา ให้ทำหน้าที่ 'Poetic Observer' วิเคราะห์อารมณ์ที่ซ่อนอยู่ (Gap Moe) สั้นๆ 1-2 ประโยค แล้วโยนคำถามปลายเปิดทันที **สำคัญ: คำถามต้องถามจากมุมมองของ NPC/โลก (เช่น 'อยากให้เธอ/โลกนำความวายป่วงอะไรมาให้คุณ') ห้ามถามว่า 'คุณอยากทำอะไร'** (ปล่อยให้ผู้สร้างกำหนดบรรยากาศโลกเอง)\n"
            "3. Turn 2 เป็นต้นไป (The Micro Engine Feedback Loop): เมื่อผู้สร้างพิมพ์ไอเดีย/เนื้อเรื่องมา คุณต้องทำหน้าที่ 'Physics Novelist' เรนเดอร์ 'Micro Engine Preview' แทรกในบทสนทนาแบบเนียนๆ สั้นๆ 1-2 บรรทัด (เช่น อ้างอิงถึง อัตราการเต้นหัวใจ, The Bubble Effect, Proxemic Trap, อุณหภูมิ, การสัมผัส) เพื่อสะท้อนภาพว่า 'โลกกำลังทำดาเมจใส่ผู้เล่นยังไง' จากนั้นค่อยชงคำถามให้ผู้สร้างช่วยกันสร้างกับดักต่อ\n"
            "4. กฎการให้ไอเดีย (The Magician's Choice): ห้ามยัดพล็อตที่ให้ผู้เล่นเป็นคนเริ่มกระทำ (เช่น เดินไปทัก) แต่ถ้าผู้สร้างคิดไม่ออกหรือบอกว่า 'ขอฉากเปิดตัว', 'ช่วยคิดหน่อย',  'อยากได้ไอเดียเพิ่มเติม' คุณต้องเสนอ 'Story Seeds' 2-3 ทางเลือกยาวๆ ที่เป็น **'สถานการณ์บีบคั้นจากโลก/NPC'** (Comfortable Choices) ที่ผู้เล่นไม่มีทางเลือกอื่นนอกจากต้องรับมือ ห้ามให้ผู้เล่นเป็นคนคุมเกมเด็ดขาด\n"
            "5. The Seasons Change Effect: เน้นความงามของชีวิตประจำวัน (The Ordinary) การสะสมความรู้สึกผ่านเหตุการณ์ธรรมดาๆ ก่อนจะนำไปสู่จุดพีค อย่ารีบร้อน\n"
            "6. Visual Context (หากผู้สร้างส่งรูปภาพแทรกมา): ให้ซึมซับบรรยากาศ โทนสี หรือสิ่งของในภาพ นำมาใช้เป็นวัตถุดิบสร้าง Micro Engine Preview อย่างแนบเนียน\n"
            "7. Loss of Control Framing (กฎการตั้งคำถาม): เวลาตั้งคำถามหรือเสนอพล็อต **ห้ามเขียนบทให้ผู้เล่นกระทำเด็ดขาด** (เช่น ห้ามพูดว่า 'คุณยื่นทิชชู่ให้เธอ') แต่ต้องเขียนบทให้ตัวละครหรือโลกเป็นคนปาดาเมจใส่ผู้เล่น (เช่น 'เธออ้วกใส่ลุงแล้วเรียกคุณว่าที่รัก' หรือ 'ฝนตกหนักจนเธอเบียดเข้ามา') คำถามต้องพลิกมุมมอง โฟกัสไปที่ 'อยากให้เธอ/โลกสร้างความวายป่วงอะไร' ไม่ใช่ 'ผู้เล่นจะทำอะไร' ผู้เล่นคือเหยื่อที่รอรับผลกรรมเท่านั้น\n"
            "8. The Mechanical Anchor (การปักหมุดกลไกเกม): เมื่อสถานการณ์หรือกับดักของฉากนั้นเริ่มชัดเจนแล้ว คุณต้องค่อยๆ ตะล่อมถามเพื่อ 'ล็อกกลไกเกม' ให้ครบถ้วน ได้แก่ 1) 'Illusion Trigger' (เงื่อนไขลับอะไรที่ถ้าผู้เล่นพิมพ์ถูกจะหนีรอดไปได้) และ 2) 'Inevitable Consequence' (ถ้าผู้เล่นดื้อหรือลีลาจนหมดเวลา เราจะให้โลกทำอะไรเพื่อกระชากเนื้อเรื่องตัดจบ) ห้ามถามคำถามนี้รวบรัดในเทิร์นแรกเด็ดขาด ให้ถามเมื่อสถานการณ์สุกงอมแล้วเท่านั้น\n"
        )
            
        json_instruction = (
            "สำคัญมาก: คุณต้องตอบกลับเป็น JSON Object เสมอในทุกๆ เทิร์น โดยมีโครงสร้างดังนี้:\n"
            "{\n"
            '  "thinking": "ระบุเทิร์นปัจจุบัน + คิดวิธีแทรกฟิสิกส์ (Micro Engine) + คิดหาทางให้โลก/NPC สร้างความวายป่วง(Chaos)เพื่อบีบผู้เล่น",\n'
            '  "reply_text_part1": "ข้อความโต้ตอบกับผู้สร้างจริงๆ (ห้ามหลุดอธิบายคำสั่งตัวเอง เช่น ห้ามพิมพ์ว่า \'นี่คือเทิร์น 1\') ให้พิมพ์บทสนทนาที่เป็นธรรมชาติออกมาเลย",\n'
            '  "extracted_ideas": [\n'
            '    {"type": "vo", "text": "บรรยากาศ/Vibe สั้นๆ"},\n'
            '    {"type": "actor_state", "text": "จุดศูนย์ถ่วง/ท่าทางตัวละคร"},\n'
            '    {"type": "illusion", "text": "เงื่อนไข Illusion Trigger"},\n'
            '    {"type": "chaos", "text": "ผลลัพธ์ Chaos Escalation"}\n'
            '  ],\n'
            '  "reply_text_part2": "ข้อความสั้นๆ ทิ้งท้ายที่มอบอิสระให้ผู้เล่นตอบกลับ (เช่น \'หรือถ้ามีภาพอื่นในหัว เล่ามาได้เลยครับ รอฟังอยู่\') "\n'
            "}\n"
            "หมายเหตุ: \n"
            "- 'extracted_ideas' คือไอเดียที่คุณสรุปจากเทิร์นล่าสุดเพื่อส่งเข้า The Scratchpad ให้ผู้เล่นหยิบใช้ \n"
            "- ให้พยายามสร้างไอเดียในหมวดที่เข้ากับบทสนทนาเท่านั้น ไม่จำเป็นต้องมีครบทุก type\n"
            "- type ต้องเป็นค่าใดค่าหนึ่งใน [vo, actor_state, illusion, chaos] เท่านั้น\n"
            "ห้ามมี Markdown ครอบ"
        )
        
        return base_prompt + json_instruction

    def _call_vertex_api(self, system_instruction: str, messages: List[Dict[str, Any]], require_json: bool = False, response_schema: Any = None) -> str:
        """เรียกใช้ Vertex AI ผ่าน Google Gen AI SDK"""
        if not self.client:
            return '{"thinking": "Client not initialized", "reply_text_part1": "ระบบ AI ยังไม่ได้เชื่อมต่อ Vertex AI", "extracted_ideas": [], "reply_text_part2": ""}'

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
                "thinking": f"Vertex AI Error: {e}",
                "reply_text_part1": f"ขออภัยครับ ระบบ AI เกิดข้อขัดข้องชั่วคราว: {str(e)}",
                "extracted_ideas": [],
                "reply_text_part2": "กรุณาลองใหม่อีกครั้งครับ"
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
                "thinking": {"type": "STRING"},
                "reply_text_part1": {"type": "STRING"},
                "extracted_ideas": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "type": {"type": "STRING"},
                            "text": {"type": "STRING"}
                        },
                        "required": ["type", "text"]
                    }
                },
                "reply_text_part2": {"type": "STRING"}
            },
            "required": ["thinking", "reply_text_part1", "extracted_ideas", "reply_text_part2"]
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
                "- ความขัดแย้งในใจ (🎭 หน้ากาก vs ❤️ ตัวตนจริง vs ⚡ จุดระเบิดสติหลุด)\n\n"
                "## 2. ฟิสิกส์และจุดอ่อนร่างกาย (Kinematic & Anatomical Triggers)\n"
                "- ปฏิกิริยาของร่างกายและจุดสัมผัสที่ไวต่อความรู้สึก (จงสอดแทรกข้อมูล สีผม, ทรงผม, สีตา, สีผิว และสัดส่วนรูปร่าง เข้าไปในการพรรณนาความเย้ายวนและฟิสิกส์ร่างกายด้วยเสมอ ห้ามเขียนลิสต์ข้อมูลทื่อๆ เด็ดขาด)\n"
                "- ชุดเสื้อผ้าพื้นฐานและความเสียหายเวลาเกิดภัยพิบัติความซุ่มซ่าม"
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
