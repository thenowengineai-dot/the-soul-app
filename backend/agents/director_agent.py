import json
import logging
import time
from google import genai
from google.genai import types
from anthropic import AsyncAnthropicVertex
from api.schemas import DirectorOutput

# ==========================================
# 🎬 THE DIRECTOR AGENT (CLEAN ARCHITECTURE)
# ==========================================
# หน้าที่: รับ Prompt สำเร็จรูปจาก Pipeline
# เพื่อไปเรียกใช้งาน AI Studio และคืนค่าเป็น JSON
# ==========================================

logger = logging.getLogger("DIRECTOR_AGENT")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - \033[93m[DIRECTOR]\033[0m - %(message)s")

class DirectorAgent:
    def __init__(
        self, 
        credentials=None, 
        model_name: str = "gemini-3.5-flash-lite", # 🌟 เปลี่ยนมาใช้ Basic Tier (ตัวเล็ก + คิดระดับกลาง)
        project_id: str = None
    ):
        """
        กำหนดค่าเริ่มต้นของ Agent ผู้กำกับ
        """
        import os
        self.credentials = credentials
        self.model_name = model_name
        self.project_id = project_id or os.getenv("VERTEX_PROJECT") or os.getenv("GOOGLE_CLOUD_PROJECT")
        
        # 🌟 หากไม่มี project_id ใน Env ให้พยายามดึงจาก Default Credentials ของ GCP
        if not self.project_id:
            import google.auth
            _, default_project = google.auth.default()
            self.project_id = default_project
            
        self.location = os.getenv("VERTEX_LOCATION", "global")
        self.client = genai.Client(vertexai=True, project=self.project_id, location=self.location)
        # 🌟 Initialize Claude Client (รองรับ Claude บน Vertex AI)
        self.client_claude = AsyncAnthropicVertex(project_id=self.project_id, region="us-east5")
        # 🌟 [CLEAN ARCHITECTURE]: ถอด ContextBuilder ออกไป ให้ Pipeline ประกอบ Prompt ส่งมาให้เลย

    async def analyze_scene(
        self, 
        director_prompt: str # 🌟 [FIXED] รับ Prompt ดิบที่ห่อเสร็จแล้วมาประมวลผลทันที
    ) -> DirectorOutput:
        
        start_time = time.time()
        logger.info(f"🕒 🎬 [DIRECTOR] Started... (Model: {self.model_name})")

        # --------------------------------------------------
        # 🧠 เรียกใช้งาน LLM (Vertex AI)
        # --------------------------------------------------
        try:
            in_tokens = 0
            out_tokens = 0
            
            if "claude" in self.model_name.lower():
                # 🌟 [CLAUDE ENGINE]
                response = await self.client_claude.messages.create(
                    model=self.model_name,
                    max_tokens=1024,
                    temperature=1.0,
                    messages=[
                        {"role": "user", "content": director_prompt},
                        {"role": "assistant", "content": "{"} # 🌟 บังคับ JSON ทันที
                    ]
                )
                result_text = "{" + response.content[0].text
                in_tokens = response.usage.input_tokens
                out_tokens = response.usage.output_tokens
                
            else:
                # 🌟 [GEMINI ENGINE]
                config_kwargs = {}
                if "gemini" in self.model_name.lower():
                    config_kwargs["response_mime_type"] = "application/json"
                    config_kwargs["thinking_config"] = types.ThinkingConfig(thinking_level="medium")
                    
                response = await self.client.aio.models.generate_content(
                    model=self.model_name,
                    contents=[{"role": "user", "parts": [{"text": director_prompt}]}],
                    config=types.GenerateContentConfig(**config_kwargs)
                )
    
                result_text = response.text or "{}"
                
                if response.usage_metadata:
                    in_tokens = getattr(response.usage_metadata, 'prompt_token_count', 0) or 0
                    out_tokens = getattr(response.usage_metadata, 'candidates_token_count', 0) or 0

            # คลีนข้อมูลกรณีหุ้ม Markdown
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
                cleaned_text = re.sub(r'[\x00-\x1F\x7F-\x9F]', ' ', result_text.strip())
                parsed_data = json.loads(cleaned_text, strict=False)
            
            # 🚨 [FIXED] ดักจับ Error: ถ้า AI ส่งมาเป็น List [{...}] ให้แกะเอาตัวแรกมาใช้
            if isinstance(parsed_data, list):
                if len(parsed_data) > 0:
                    parsed_data = parsed_data[0]
                else:
                    parsed_data = {}

            director_output = DirectorOutput(**parsed_data)
            
            # 🌟 LOGGING
            mood_color = "\033[92m" if director_output.mood_modifier == "positive" else "\033[91m" if director_output.mood_modifier == "negative" else "\033[90m"
            logger.info(f"Shift -> Time: {director_output.time_shift} | Loc: {director_output.location_shift}")
            logger.info(f"Mood -> {mood_color}[{director_output.mood_modifier.upper()}]\033[0m")
            logger.info(f"Sensory Cues (ลมหายใจโลก) -> '\033[96m{director_output.sensory_cues}\033[0m'")
            
            if director_output.voice_over:
                logger.info(f"Voice Over -> '{director_output.voice_over}'")

            elapsed = time.time() - start_time
            logger.info(f"🕒 🎬 [DIRECTOR] Finished ⏱️({elapsed:.2f}s) | 💰 {in_tokens} In / {out_tokens} Out")
            
            return director_output

        except Exception as e:
            logger.error(f"Director Agent Error: {e}")
            # 🌟 [SAFETY] อัปเดต Fallback ให้มีตัวแปรครบตาม schema.py ตัวใหม่
            return DirectorOutput(
                time_shift=None, 
                location_shift=None, 
                mood_modifier="neutral",
                director_analysis="System Error Fallback",
                established_background="None",
                focus_lens=[],
                voice_over=None,
                sensory_cues="บรรยากาศรอบตัวยังคงเป็นไปตามปกติ ไม่มีอะไรเคลื่อนไหว" 
            )
