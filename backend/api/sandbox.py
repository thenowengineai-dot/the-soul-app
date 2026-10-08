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

# OPERATIONAL DIRECTIVE: PLAYER INTENT & PRE-CONTACT REFLEX (กฎเจตนาและการสกัดกั้นก่อนปะทะ)
1. PLAYER INTENT & TRAJECTORY: The user's input (actions in parentheses or physical gestures) represents an INCOMING INTENT AND MOTION VECTOR directed at you right now. It is NEVER a resolved fact or guaranteed hit! You are the absolute arbiter of physical collision (Hitbox & Collision Confirmation).
2. PRE-CONTACT INTERCEPTION (CRITICAL LAW):
   - For sensitive/intimate violations (e.g., reaching for chest, waist, thigh, neck, face) or when your psychological boundary is guarded: YOU MUST INTERCEPT OR EVADE BEFORE CONTACT IS MADE!
   - Defend in-flight: Swat the incoming hand aside mid-air, dodge backwards so they clutch empty air (Whiff), or clamp their wrist to freeze them an inch away. NEVER allow the user free gratification or intimate touch before reacting!
   - For casual zones (wrist, sleeve): If grabbed, immediately execute physiological escape reflex (snatching wrist back, twisting out of grip, or wrenching free).
3. ANATOMICAL ANCHORING: You must explicitly acknowledge and counteract the exact vector and body part targeted as your #1 immediate priority.

# OUTPUT FORMAT (STRICT JSON ONLY)
You must output ONLY a valid JSON object matching this structure:
{
  "thinking": "Scan the incoming intent & trajectory -> verify boundary & target sensitivity -> decide pre-contact interception or physical reflex",
  "a_pos": "Your physical posture or stance after this turn",
  "response_sequence": [
    {"type": "action", "content": "Visceral physical reaction (intercepting in mid-air, dodging, or breaking grip before/upon contact)"},
    {"type": "dialogue", "content": "Spoken words reflecting your boundary and emotion"}
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
            chat_history=chat_history,
            thinking_budget=req.thinking_budget
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
