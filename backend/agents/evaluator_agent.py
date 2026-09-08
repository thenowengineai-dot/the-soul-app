import json
import logging
import time
from google import genai
from google.genai import types
from api.schemas import EvaluatorOutput

# ==========================================
# ⚖️ THE EVALUATOR AGENT (Engine 5.0: The Multi-Door Beat System)
# ==========================================
# หน้าที่: ประเมินคะแนนความสบายใจ (Affection) และความโหยหา (Desire)
# และ 🌟 [NEW] เป็นนายสถานีสับราง! ประเมินทางแยกเพื่อสั่ง Progress, Loop, หรือ Cancel
# ==========================================

logger = logging.getLogger("EVALUATOR_AGENT")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - \033[95m[EVALUATOR]\033[0m - %(message)s")

class EvaluatorAgent:
    def __init__(
        self, 
        credentials=None, 
        model_name: str = "gemini-3.5-flash-lite", # 🌟 วิ่งเข้า Vertex AI ด้วยตัวเล็กสุด (Basic Tier)
        project_id: str = None
    ):
        """
        กำหนดค่าเริ่มต้นของ Agent กรรมการ
        """
        import os
        self.credentials = credentials
        self.model_name = model_name
        self.project_id = project_id or os.getenv("VERTEX_PROJECT") or os.getenv("GOOGLE_CLOUD_PROJECT")
        self.location = os.getenv("VERTEX_LOCATION", "global")
        self.client = genai.Client(vertexai=True, project=self.project_id, location=self.location)

    async def evaluate_interaction(
        self, 
        evaluator_prompt: str
    ) -> EvaluatorOutput:
        """
        วิเคราะห์บทสนทนาล่าสุดเพื่อปรับคะแนน Comfort Gauge, สกัดความจำ และสับรางคิวการแสดง (Beat Action)
        """
        
        start_time = time.time()
        logger.info(f"🕒 🕵️‍♂️ [EVALUATOR] Started... (Model: {self.model_name})")

        try:
            # ใช้ Vertex AI โดยบังคับให้ออกเป็น JSON เท่านั้น
            import os
            config_kwargs = {
                "response_mime_type": "application/json",
                "safety_settings": [
                    types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold=os.getenv("SAFETY_SEXUAL_THRESHOLD", "BLOCK_NONE")),
                    types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="BLOCK_ONLY_HIGH"),
                    types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="BLOCK_ONLY_HIGH"),
                    types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="BLOCK_ONLY_HIGH"),
                ],
            }
            if "gemini" in self.model_name.lower():
                config_kwargs["thinking_config"] = types.ThinkingConfig(thinking_level="medium")
            
            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=[{"role": "user", "parts": [{"text": evaluator_prompt}]}],
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
                cleaned_text = re.sub(r'[\x00-\x1F\x7F-\x9F]', ' ', result_text.strip())
                parsed_data = json.loads(cleaned_text, strict=False)
            
            # ดักจับ Error: ถ้า AI ส่งมาเป็น List [{...}] ให้แกะเอาตัวแรกมาใช้
            if isinstance(parsed_data, list):
                if len(parsed_data) > 0:
                    parsed_data = parsed_data[0]
                else:
                    parsed_data = {}
                    
            evaluator_output = EvaluatorOutput(**parsed_data)
            
            # 🌟 [ENGINE 5.0 LOGGING]: โชว์ผลการสับรางใน Terminal
            action = evaluator_output.beat_action.lower()
            if action == "illusion_trigger":
                logger.info(f"🚨 \033[93m[BEAT PROGRESS]\033[0m สับรางสำเร็จ -> Path: '{evaluator_output.matched_path}'")
            elif action == "cancel":
                logger.warning(f"🚫 \033[91m[BEAT CANCELLED]\033[0m ผู้เล่นทำลายฉากทิ้ง! ยกเลิก Event")
            elif action == "interrupt":
                logger.warning(f"⚡ \033[93m[BEAT INTERRUPTED]\033[0m ผู้เล่นแทรกแซงรุนแรง! เข้าสู่โหมดด้นสด")
            elif action == "chaos_escalation":
                logger.info(f"🔄 \033[96m[BEAT LOOP]\033[0m ผู้เล่นยังไม่ผ่านเงื่อนไข ย่ำอยู่กับบีตเดิม (Chaos Escalation)")
            
            # การแสดงผลสีใน Terminal สำหรับการ Monitor
            aff_color = "\033[92m+" if evaluator_output.affection_delta > 0 else "\033[91m" if evaluator_output.affection_delta < 0 else "\033[90m"
            des_color = "\033[95m+" if evaluator_output.desire_delta > 0 else "\033[91m" if evaluator_output.desire_delta < 0 else "\033[90m"
            
            elapsed = time.time() - start_time
            in_tokens = getattr(response.usage_metadata, 'prompt_token_count', 0) if getattr(response, 'usage_metadata', None) else 0
            out_tokens = getattr(response.usage_metadata, 'candidates_token_count', 0) if getattr(response, 'usage_metadata', None) else 0
            
            logger.info(f"🕒 🕵️‍♂️ [EVALUATOR] Finished ⏱️({elapsed:.2f}s) | 💰 {in_tokens} In / {out_tokens} Out")
            logger.info(f"                    ↳ Data Passed: [Aff {aff_color}{evaluator_output.affection_delta}\033[0m, Des {des_color}{evaluator_output.desire_delta}\033[0m] [Posture: {evaluator_output.player_posture}] [Action: {action}]")
            
            return evaluator_output

        except Exception as e:
            logger.error(f"Evaluator Agent Error: {e}")
            # 🌟 [ENGINE 5.0 FIX]: คืนค่า Fallback ให้ตรงกับ Schema ตัวใหม่เป๊ะๆ!
            return EvaluatorOutput(
                affection_delta=0, 
                desire_delta=0, 
                reasoning=f"System error: {str(e)}", 
                memory_extracted=None,
                beat_action="chaos_escalation",      # บังคับย่ำอยู่กับที่เมื่อเกิด Error
                matched_path=None,
                player_stance="neutral",
                is_cinematic_moment=False
            )
