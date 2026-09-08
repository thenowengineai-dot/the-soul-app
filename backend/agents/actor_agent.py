import json
import logging
import time
from typing import Dict, Any, List
from google import genai
from google.genai import types

# นำเข้า ActorOutput 
from api.schemas import ActorOutput

# ==========================================
# 🎭 THE ACTOR AGENT (CLEAN ARCHITECTURE)
# ==========================================
# หน้าที่: รับ Prompt สำเร็จรูปและประวัติแชทจาก Pipeline
# สวมบทบาทเป็นตัวละคร และคืนค่าออกมาเป็น JSON (Thinking, Action, Dialogue) 
# ==========================================

logger = logging.getLogger("ACTOR_AGENT")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - \033[96m[ACTOR]\033[0m - %(message)s")

class ActorAgent:
    def __init__(
        self, 
        credentials=None, 
        model_name: str = "gemini-3.5-flash-lite", # 🌟 ใช้ Basic Tier โควต้าพร้อมและเสถียร
        project_id: str = None
    ):
        """
        กำหนดค่าเริ่มต้นของ Agent นักแสดง
        """
        import os
        self.credentials = credentials
        self.model_name = model_name
        self.project_id = project_id or os.getenv("VERTEX_PROJECT") or os.getenv("GOOGLE_CLOUD_PROJECT")
        self.location = os.getenv("VERTEX_LOCATION", "global")
        self.client = genai.Client(vertexai=True, project=self.project_id, location=self.location)
        
        # 🌟 [CLEAN ARCHITECTURE]: ถอด ContextBuilder ออกไป ให้ Pipeline ประกอบ Prompt ส่งมาให้เลย

    async def generate_response(
        self, 
        actor_prompt: str,                  # 🌟 [FIXED] รับ Prompt ดิบที่ห่อเสร็จแล้ว
        chat_history: List[Dict[str, Any]]  # 🌟 รับประวัติแชทมาต่อกับ Prompt
    ) -> ActorOutput:
        """
        ฟังก์ชันหลักในการสร้างคำตอบแบบ JSON Block
        รอจน AI คิดและร่างคำตอบเสร็จแล้วค่อยส่งกลับมาทีเดียวเป็น Object
        """
        
        # แปลงประวัติแชทให้เข้ากับรูปแบบของ Google Gen AI SDK
        contents = []
        for msg in chat_history:
            role = "model" if msg["role"] in ["ai", "assistant", "model"] else "user"
            
            # ดึง content และ action ออกมา (อาจเป็น None ได้เพราะแยกกันเก็บ)
            c_text = msg.get("content")
            a_text = msg.get("action")
            
            parts = []
            if a_text and str(a_text).lower() not in ["none", "null", ""]:
                parts.append(f"({a_text})")
            if c_text and str(c_text).lower() not in ["none", "null", ""]:
                parts.append(str(c_text))
                
            text = " ".join(parts).strip()
            
            if not text:
                continue # 🌟 [FIX] ป้องกัน Vertex AI บั๊ก "must have one initialized field" จากข้อความว่าง
                
            if msg.get("role") == "system":
                text = f"[SYSTEM]: {text}"
                
            contents.append({"role": role, "parts": [{"text": text}]})
            
        # 🌟 [CRITICAL FIX] ป้องกัน Vertex AI บั๊ก "contents are required" กรณีเริ่มฉากใหม่ Turn 0 (Prologue)
        if not contents:
            contents.append({
                "role": "user",
                "parts": [{"text": "[SYSTEM]: เริ่มต้นฉากเปิดตัว (Prologue) ให้แสดงท่าทางเปิดตัวและทักทายผู้เล่นเป็นคนแรกตามบทบาท"}]
            })

        start_time = time.time()
        logger.info(f"🕒 🎭 [ACTOR] Started... (Messages: {len(contents)} | Model: {self.model_name})")

        models_to_try = [self.model_name]
        if self.model_name != "gemini-3.5-flash-lite":
            models_to_try.append("gemini-3.5-flash-lite")

        try:
            response = None
            last_err = None
            used_model = self.model_name
            for m in models_to_try:
                try:
                    config_kwargs = {
                        "system_instruction": actor_prompt,
                        "response_mime_type": "application/json",
                    }
                    if "gemini" in m.lower():
                        config_kwargs["thinking_config"] = types.ThinkingConfig(thinking_level="medium")
                        
                    response = await self.client.aio.models.generate_content(
                        model=m,
                        contents=contents,
                        config=types.GenerateContentConfig(**config_kwargs)
                    )
                    used_model = m
                    if response:
                        break
                except Exception as call_err:
                    last_err = call_err
                    err_str = str(call_err)
                    if ("429" in err_str or "RESOURCE_EXHAUSTED" in err_str) and m != models_to_try[-1]:
                        logger.warning(f"⚠️ [ACTOR] Model {m} hit 429 RESOURCE_EXHAUSTED. Retrying with fallback: {models_to_try[-1]}")
                        continue
                    raise call_err

            if not response and last_err:
                raise last_err

            result_text = response.text or "{}"
            
            # 🌟 [REAL TELEMETRY] คำนวณ Token และค่าใช้จ่ายจริง
            if response.usage_metadata:
                in_tokens = getattr(response.usage_metadata, 'prompt_token_count', 0) or 0
                out_tokens = getattr(response.usage_metadata, 'candidates_token_count', 0) or 0
                
                # 🌟 [DYNAMIC PRICING] ปรับเรทราคาตามโมเดลอัตโนมัติ
                pricing = {
                    "pro": {"in": 1.25, "out": 5.00},
                    "flash": {"in": 1.50, "out": 9.00}
                }
                rate = pricing["pro"] if "pro" in self.model_name.lower() else pricing["flash"]
                
                # Tokens will be logged at the end
                pass

            # คลีนข้อมูลกรณี AI ส่งครอบ Markdown มา
            # 🌟 (แก้ไขปัญหาสัญลักษณ์ Backticks 3 ตัวทำให้ UI บั๊ก)
            result_text = result_text.strip()
            backticks = "`" * 3
            if result_text.startswith(f"{backticks}json"):
                result_text = result_text[7:]
            if result_text.startswith(backticks):
                result_text = result_text[3:]
            if result_text.endswith(backticks):
                result_text = result_text[:-3]

            try:
                parsed_data = json.loads(result_text.strip(), strict=False)
            except Exception as e:
                import re
                # 🌟 [FALLBACK CLEANER] แก้ปัญหา AI ส่งตัวอักษรแปลกๆ หรือขึ้นบรรทัดใหม่ใน JSON
                cleaned_text = re.sub(r'[\x00-\x1F\x7F-\x9F]', ' ', result_text.strip())
                parsed_data = json.loads(cleaned_text, strict=False)
            
            # ดักจับ Error: ถ้า AI ส่งมาเป็น List ให้เอาตัวแรกมาใช้
            if isinstance(parsed_data, list):
                if len(parsed_data) > 0:
                    parsed_data = parsed_data[0]
                else:
                    parsed_data = {} 
                    
            # 🚨 [FIXED] ดักจับ Error: ถ้า AI แยก Thinking มาเป็น Dictionary ให้ยุบรวมเป็น String เดี่ยว
            thinking_val = parsed_data.get("thinking", "")
            if isinstance(thinking_val, dict):
                # เอา Key และ Value มาต่อกันให้อ่านง่าย
                parsed_data["thinking"] = " | ".join([f"{k}: {v}" for k, v in thinking_val.items()])
            elif isinstance(thinking_val, list):
                parsed_data["thinking"] = " | ".join([str(item) for item in thinking_val])
            elif not isinstance(thinking_val, str):
                parsed_data["thinking"] = str(thinking_val)
            
            # คืนค่ากลับไปเป็น Pydantic Model ป้องกันความผิดพลาด
            actor_output = ActorOutput(**parsed_data)
            
            # Log action text briefly (limit to 100 chars to avoid clutter)
            action_snippet = ""
            if actor_output.response_sequence and len(actor_output.response_sequence) > 0:
                for segment in actor_output.response_sequence:
                    if segment.type == "action":
                        action_content = segment.content
                        action_snippet = (action_content[:100] + '...') if len(action_content) > 100 else action_content
                        break
            
            elapsed = time.time() - start_time
            in_tokens = getattr(response.usage_metadata, 'prompt_token_count', 0) if getattr(response, 'usage_metadata', None) else 0
            out_tokens = getattr(response.usage_metadata, 'candidates_token_count', 0) if getattr(response, 'usage_metadata', None) else 0
            
            logger.info(f"🕒 🎭 [ACTOR] Finished ⏱️({elapsed:.2f}s) | 💰 {in_tokens} In / {out_tokens} Out")
            logger.info(f"                    ↳ Data Passed: [Action Snippet: {action_snippet}]")
            
            return actor_output

        except Exception as e:
            logger.error(f"Actor Agent Error: {e}")
            # กรณีพัง ส่ง Fallback ออกไปอย่างปลอดภัย
            return ActorOutput(
                thinking=f"System Error: {str(e)}",
                a_pos="นั่งทรุดตัวลงด้วยความมึนงง",
                response_sequence=[
                    {
                        "type": "action",
                        "content": "ก้มหน้าเงียบๆ สัญญาณขาดหาย"
                    },
                    {
                        "type": "dialogue",
                        "content": "..."
                    }
                ]
            )
