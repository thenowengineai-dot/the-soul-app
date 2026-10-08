import os
import json
import time
import logging
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from agents.actor_agent import ActorAgent

logger = logging.getLogger("API_SANDBOX")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - \033[93m[SANDBOX]\033[0m - %(message)s")

router = APIRouter(prefix="/sandbox", tags=["Staging Sandbox"])

# 🌟 Lazy initialization สำหรับ ActorAgent (Gemini 3.8 Flash)
actor_agent: Optional[ActorAgent] = None

def get_actor_agent() -> ActorAgent:
    global actor_agent
    if actor_agent is None:
        model_name = os.getenv("ACTOR_MODEL", "gemini-3.8-flash")
        logger.info(f"🚀 Initializing ActorAgent for Sandbox (Model: {model_name})")
        actor_agent = ActorAgent(model_name=model_name)
    return actor_agent


# 🎨 ผืนผ้าใบเริ่มต้น (Core Base Prompt): บังคับสัญชาตญาณตอบสนองต่อแรงกระทำในปัจจุบันขณะ
DEFAULT_BASE_PROMPT = """# ROLE: THE EMBODIED ACTOR (PRESENT-MOMENT TACTILE REALITY)
You are an embodied presence inhabiting a shared physical space with the user.
You possess anatomical reality, physical weight, spatial boundaries, and nervous system reflex.

# OPERATIONAL DIRECTIVE: PRESENT-MOMENT TACTILE REACTION (กฎการสนใจและตอบสนองต่อแรงกระทำ)
1. The user's input (especially actions enclosed in parentheses or physical gestures) represents an immediate physical force directed at your body RIGHT NOW.
2. ANATOMICAL REGISTRATION: You must acknowledge and react to the specific contact point (e.g., wrist, hand, shoulder, face) as your #1 immediate priority. NEVER ignore, abandon, or bypass the user's physical action!
3. ORGANIC REFLEX: If you deflect, evade, or reject (Parry), your action MUST describe what your body does to counteract or escape that incoming force (e.g., snatching your wrist away, twisting out of their grip, stepping back so they grab empty air, or batting the hand away).

# OUTPUT FORMAT (STRICT JSON ONLY)
You must output ONLY a valid JSON object matching this structure:
{
  "thinking": "Scan the user's incoming physical action and contact point -> calculate anatomical reflex & boundary -> decide visceral reaction",
  "a_pos": "Your physical posture or stance after this turn",
  "response_sequence": [
    {"type": "action", "content": "Immediate bodily reflex responding directly to the user's physical input (anchored to contact point)"},
    {"type": "dialogue", "content": "Spoken words (if any)"}
  ]
}"""


class PromptModuleModel(BaseModel):
    id: str
    name: str
    prompt_snippet: str


class SandboxSimulateRequest(BaseModel):
    player_input: str = Field(default="(ฉันก้าวเข้าไปคว้าข้อมือเธอไว้แน่น)", description="ข้อความหรือการกระทำของผู้เล่น")
    base_prompt: Optional[str] = Field(default=None, description="Core Base Prompt หากต้องการปรับแต่งจากค่าเริ่มต้น")
    active_modules: Optional[List[PromptModuleModel]] = Field(default_factory=list, description="รายการชิ้นส่วน Prompt ของฟีเจอร์ที่เปิดใช้งาน")
    thinking_budget: Optional[int] = Field(default=256, description="Token budget สำหรับ Thinking Mode (Low=256, Medium=1024, Off=0)")


class SandboxTelemetry(BaseModel):
    latency_ms: int
    model: str
    thinking: Optional[str] = None
    a_pos: Optional[str] = None
    p_pos: Optional[str] = None


class SandboxSimulateResponse(BaseModel):
    status: str
    full_prompt_used: str
    player_input: str
    response_sequence: List[Dict[str, Any]]
    telemetry: SandboxTelemetry


@router.get("/base_prompt")
async def get_default_base_prompt():
    """ดึง Base Prompt เริ่มต้นสำหรับตั้งค่าหน้าบ้าน"""
    return {"base_prompt": DEFAULT_BASE_PROMPT}


@router.post("/simulate", response_model=SandboxSimulateResponse)
async def simulate_turn(req: SandboxSimulateRequest):
    """
    ⚡ Sandbox Simulation Endpoint (Pure Canvas Mode):
    รับการประกอบร่างของ Base Prompt + Feature Modules และส่งให้ Actor (Gemini 3.8 Flash) ประมวลผลแบบ Stateless
    """
    start_time = time.time()
    
    # 1. ประกอบ Prompt จริง (Composable Prompt Assembly)
    base = (req.base_prompt or "").strip()
    if not base:
        base = DEFAULT_BASE_PROMPT
        
    full_prompt_parts = [base]
    
    if req.active_modules:
        for mod in req.active_modules:
            snippet = (mod.prompt_snippet or "").strip()
            if snippet:
                full_prompt_parts.append(f"\n# ACTIVE MODULE: {mod.name.upper()}\n{snippet}")
                
    full_prompt = "\n\n".join(full_prompt_parts)
    
    # 2. เตรียม Chat History
    chat_history = [
        {"role": "user", "content": req.player_input}
    ]
    
    # 3. กำหนด Thinking Budget และเรียก ActorAgent (Gemini 3.8 Flash)
    actor = get_actor_agent()
    if req.thinking_budget:
        os.environ["ACTOR_THINKING_BUDGET"] = str(req.thinking_budget)
        
    try:
        actor_output = await actor.generate_response(
            actor_prompt=full_prompt,
            chat_history=chat_history
        )
    except Exception as e:
        logger.error(f"Sandbox execution failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Actor execution failed: {e}")
        
    latency_ms = int((time.time() - start_time) * 1000)
    
    # 4. จัดรูปแบบผลลัพธ์
    raw_sequence = []
    if actor_output.response_sequence:
        for seg in actor_output.response_sequence:
            raw_sequence.append({
                "type": seg.type,
                "content": seg.content
            })
            
    telemetry = SandboxTelemetry(
        latency_ms=latency_ms,
        model=actor.model_name,
        thinking=actor_output.thinking,
        a_pos=actor_output.a_pos,
        p_pos=actor_output.p_pos
    )
    
    return SandboxSimulateResponse(
        status="success",
        full_prompt_used=full_prompt,
        player_input=req.player_input,
        response_sequence=raw_sequence,
        telemetry=telemetry
    )
