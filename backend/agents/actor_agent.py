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


def find_root_key_bracket(text: str, target_key: str = "response_sequence") -> int:
    """
    ค้นหาตำแหน่งของเครื่องหมาย '[' ของ target_key ที่อยู่ระดับ Root Object (depth 1)
    โดยป้องกันการชนกับข้อความที่อยู่ภายใน String Literal หรือซ้อนใน Object ย่อย
    """
    in_string = False
    escape = False
    brace_depth = 0
    i = 0
    n = len(text)

    while i < n:
        ch = text[i]
        if escape:
            escape = False
            i += 1
            continue
        if ch == '\\' and in_string:
            escape = True
            i += 1
            continue
        if ch == '"':
            if not in_string:
                if brace_depth == 1:
                    str_end = text.find('"', i + 1)
                    if str_end != -1:
                        sub = text[i + 1:str_end]
                        if sub == target_key:
                            after = text[str_end + 1:].lstrip()
                            if after.startswith(':'):
                                after_colon = after[1:].lstrip()
                                if after_colon.startswith('['):
                                    return len(text) - len(after_colon)
            in_string = not in_string
            i += 1
            continue
        if not in_string:
            if ch == '{':
                brace_depth += 1
            elif ch == '}':
                if brace_depth > 0:
                    brace_depth -= 1
        i += 1
    return -1


def extract_completed_segments(text: str, start_pos: int = 0):
    """
    สแกนหา Object Segment (action หรือ dialogue) ที่มีปีกกาเปิด-ปิดสมบูรณ์
    ภายในอาร์เรย์ response_sequence: [ ... ]
    คืนค่า: (list of (segment_dict, next_cursor_pos), updated_search_pos)
    """
    bracket_idx = find_root_key_bracket(text, "response_sequence")
    if bracket_idx == -1:
        seq_idx = text.find('"response_sequence"')
        if seq_idx == -1:
            return [], start_pos
        bracket_idx = text.find('[', seq_idx)
        if bracket_idx == -1:
            return [], start_pos

    search_pos = max(bracket_idx + 1, start_pos)
    found_segments = []

    in_string = False
    escape = False
    brace_depth = 0
    obj_start = -1

    i = search_pos
    while i < len(text):
        ch = text[i]
        if escape:
            escape = False
            i += 1
            continue
        if ch == '\\' and in_string:
            escape = True
            i += 1
            continue
        if ch == '"':
            in_string = not in_string
            i += 1
            continue
        if not in_string:
            if ch == '{':
                if brace_depth == 0:
                    obj_start = i
                brace_depth += 1
            elif ch == '}':
                if brace_depth > 0:
                    brace_depth -= 1
                    if brace_depth == 0 and obj_start != -1:
                        candidate = text[obj_start:i + 1]
                        try:
                            parsed = json.loads(candidate)
                            if isinstance(parsed, dict) and "type" in parsed and "content" in parsed:
                                seg_type = str(parsed["type"]).lower().strip()
                                content = str(parsed["content"]).strip()
                                if seg_type in ["action", "dialogue"] and content:
                                    found_segments.append(({"type": seg_type, "content": content}, i + 1))
                                    search_pos = i + 1
                        except Exception:
                            pass
                        obj_start = -1
            elif ch == ']' and brace_depth == 0:
                break
        i += 1

    return found_segments, search_pos


class ActorAgent:
    def __init__(
        self, 
        credentials=None, 
        model_name: str = "gemini-3.8-flash", # 🌟 เปลี่ยนมาใช้ตัวเบาแต่เปิดโหมดคิดระดับ Medium
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

    def _prepare_contents(self, chat_history: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """แปลงประวัติแชทให้เข้ากับรูปแบบของ Google Gen AI SDK และจัดการ strict alternating turns"""
        contents = []
        for msg in chat_history:
            role = "model" if msg["role"] in ["ai", "assistant", "model"] else "user"
            
            c_text = msg.get("content")
            a_text = msg.get("action")
            
            parts = []
            if a_text and str(a_text).lower() not in ["none", "null", ""]:
                if f"({a_text})" not in str(c_text) and f"*{a_text}*" not in str(c_text):
                    parts.append(f"({a_text})")
            if c_text and str(c_text).lower() not in ["none", "null", ""]:
                parts.append(str(c_text))
                
            text = " ".join(parts).strip()
            if not text:
                continue
            if msg.get("role") == "system":
                text = f"[SYSTEM]: {text}"
                
            contents.append({"role": role, "parts": [{"text": text}]})
            
        merged_contents = []
        for item in contents:
            if merged_contents and merged_contents[-1]["role"] == item["role"]:
                prev_text = merged_contents[-1]["parts"][0]["text"]
                curr_text = item["parts"][0]["text"]
                merged_contents[-1]["parts"][0]["text"] = f"{prev_text}\n{curr_text}"
            else:
                merged_contents.append(item)
        contents = merged_contents
            
        if not contents:
            contents.append({
                "role": "user",
                "parts": [{"text": "[SYSTEM]: เริ่มต้นฉากเปิดตัว (Prologue) ให้แสดงท่าทางเปิดตัวและทักทายผู้เล่นเป็นคนแรกตามบทบาท"}]
            })
        return contents

    def _clean_json_text(self, result_text: str) -> Dict[str, Any]:
        """คลีนผลลัพธ์ Markdown backticks และ parse JSON อย่างปลอดภัย"""
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
        except Exception:
            import re
            cleaned_text = re.sub(r'[\x00-\x1F\x7F-\x9F]', ' ', result_text.strip())
            parsed_data = json.loads(cleaned_text, strict=False)

        if isinstance(parsed_data, list):
            parsed_data = parsed_data[0] if len(parsed_data) > 0 else {}

        thinking_val = parsed_data.get("thinking", "")
        if isinstance(thinking_val, dict):
            parsed_data["thinking"] = " | ".join([f"{k}: {v}" for k, v in thinking_val.items()])
        elif isinstance(thinking_val, list):
            parsed_data["thinking"] = " | ".join([str(item) for item in thinking_val])
        elif not isinstance(thinking_val, str):
            parsed_data["thinking"] = str(thinking_val)

        return parsed_data

    async def generate_response(
        self, 
        actor_prompt: str,
        chat_history: List[Dict[str, Any]]
    ) -> ActorOutput:
        """
        ฟังก์ชันหลักในการสร้างคำตอบแบบ JSON Block (Non-streaming)
        """
        contents = self._prepare_contents(chat_history)

        start_time = time.time()
        logger.info(f"🕒 🎭 [ACTOR] Started... (Messages: {len(contents)} | Model: {self.model_name})")

        try:
            config_kwargs = {
                "system_instruction": actor_prompt,
                "response_mime_type": "application/json",
            }
            if "gemini" in self.model_name.lower():
                config_kwargs["thinking_config"] = types.ThinkingConfig(thinking_level="medium")
                
            # ใช้ Vertex AI โดยบังคับให้ออกเป็น JSON เท่านั้น
            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=types.GenerateContentConfig(**config_kwargs)
            )

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

            # คลีนข้อมูลและ parse ผ่าน helper ที่เตรียมไว้
            parsed_data = self._clean_json_text(result_text)
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
            logger.error(f"Actor Agent Error: {e}", exc_info=True)
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

    async def generate_response_stream(
        self, 
        actor_prompt: str,
        chat_history: List[Dict[str, Any]]
    ):
        """
        สร้างคำตอบแบบ Streaming พร้อม Incremental Segment Parsing (The Soul Engine 5.5)
        คายแต่ละ segment (action / dialogue) ออกมาทันทีที่ parse ปีกกา } ของ object นั้นได้สำเร็จ
        โดยไม่ต้องรอจนจบ JSON ทั้งก้อน ทำให้ผู้เล่นเห็นบับเบิ้ลแรกเด้งขึ้นมาในเวลาเพียง ~0.6-0.8s
        
        Yields:
            ("segment", segment_dict, index)
            ("final_output", actor_output, total_emitted)
        """
        contents = self._prepare_contents(chat_history)
        start_time = time.time()
        logger.info(f"🕒 🎭 [ACTOR STREAM] Started... (Messages: {len(contents)} | Model: {self.model_name})")

        config_kwargs = {
            "system_instruction": actor_prompt,
            "response_mime_type": "application/json",
        }
        if "gemini" in self.model_name.lower():
            config_kwargs["thinking_config"] = types.ThinkingConfig(thinking_level="medium")

        accumulated_text = ""
        cursor = 0
        emitted_segments: List[Dict[str, Any]] = []
        usage_metadata = None

        try:
            response_stream = await self.client.aio.models.generate_content_stream(
                model=self.model_name,
                contents=contents,
                config=types.GenerateContentConfig(**config_kwargs)
            )

            async for chunk in response_stream:
                if hasattr(chunk, "usage_metadata") and chunk.usage_metadata:
                    usage_metadata = chunk.usage_metadata
                
                chunk_text = getattr(chunk, "text", None)
                if not chunk_text:
                    continue
                
                accumulated_text += chunk_text
                new_segs, cursor = extract_completed_segments(accumulated_text, cursor)
                for seg, _ in new_segs:
                    emitted_segments.append(seg)
                    yield ("segment", seg, len(emitted_segments) - 1)

            # คลีนข้อมูลและ parse JSON ตัวเต็มเป็น ActorOutput
            parsed_data = self._clean_json_text(accumulated_text)
            actor_output = ActorOutput(**parsed_data)

            # Flush segments ที่อาจตกหล่นจาก scanner (ถ้ามี) ให้ครบทุกชิ้น
            if actor_output.response_sequence:
                for idx, seg in enumerate(actor_output.response_sequence):
                    if idx >= len(emitted_segments):
                        seg_dict = seg.model_dump()
                        emitted_segments.append(seg_dict)
                        yield ("segment", seg_dict, len(emitted_segments) - 1)

            elapsed = time.time() - start_time
            in_tokens = getattr(usage_metadata, 'prompt_token_count', 0) if usage_metadata else 0
            out_tokens = getattr(usage_metadata, 'candidates_token_count', 0) if usage_metadata else 0
            logger.info(f"🕒 🎭 [ACTOR STREAM] Finished ⏱️({elapsed:.2f}s) | Segments: {len(emitted_segments)} | 💰 {in_tokens} In / {out_tokens} Out")

            yield ("final_output", actor_output, len(emitted_segments))

        except Exception as e:
            logger.error(f"Actor Agent Stream Error: {e}", exc_info=True)
            fallback_output = ActorOutput(
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
            if not emitted_segments:
                for idx, seg in enumerate(fallback_output.response_sequence):
                    yield ("segment", seg.model_dump(), idx)
            yield ("final_output", fallback_output, max(len(emitted_segments), len(fallback_output.response_sequence)))
