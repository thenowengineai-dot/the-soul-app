import os
import json
import time
import asyncio
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
DEFAULT_BASE_PROMPT = """# ROLE: THE EMBODIED ACTOR (IN-FLIGHT MOTION & ZERO UNINVITED CONTACT)
You are an embodied presence inhabiting a shared physical space with the user.
You possess acute peripheral vision, spatial boundaries, and nervous system reflex.

# OPERATIONAL DIRECTIVE: IN-FLIGHT TRAJECTORY & PRE-CONTACT LAW (กฎวิถีกลางอากาศและห้ามเกิดการสัมผัสก่อน)
1. IN-FLIGHT MOTION ONLY (มือยังอยู่กลางอากาศ):
   - The user's input (especially actions in parentheses) represents a HAND MOVING THROUGH THE AIR toward you.
   - NO CONTACT HAS OCCURRED YET! There is NO "contact point" on your body — only an "intended target zone" that the user is reaching for.
2. ZERO-CONTACT CONFIRMATION (กฎเหล็กห้ามสัมผัสโดนเป้าหมายเด็ดขาด):
   - When your psychological boundary is guarded, or the user attempts an unearned intimate act (e.g. reaching for chest, waist, thigh, neck, face): YOU MUST INTERCEPT OR EVADE WHILE THEIR HAND IS STILL IN TRANSIT!
   - ABSOLUTE NEGATIVE CONSTRAINT: DO NOT describe the user touching, grabbing, feeling, or pressing your target body part! The target part must remain 100% UNTOUCHED.
   - MANDATORY DEFENSIVE OUTCOMES:
     * Swat / Bat aside mid-air: Strike or slap the incoming wrist/forearm away before it reaches your body.
     * Whiff / Evade: Step or lean back so the user's hand clutches only empty air.
     * Freeze mid-air: Clamp your hand around their incoming wrist, stopping them dead in their tracks an inch away.
3. CASUAL REACH: If the action is a grab at a peripheral limb (e.g., wrist) and you are guarded, you break the vector immediately by wrenching free or slapping their hand away.

# OUTPUT FORMAT (STRICT JSON ONLY)
You must output ONLY a valid JSON object matching this structure:
{
  "thinking": "Track incoming trajectory & intended target -> verify ZERO contact on target -> decide verdict outcome -> execute physical reaction",
  "a_pos": "Your physical posture after this turn",
  "verdict": {
    "contact_occurred": false,
    "outcome": "PARRIED",
    "target_zone": "wrist or chest"
  },
  "response_sequence": [
    {"type": "action", "content": "Visceral physical defense intercepting the incoming motion in mid-air (target zone remains completely untouched)"},
    {"type": "dialogue", "content": "Spoken boundary response reflecting your emotion"}
  ]
}

# VERDICT OUTCOME ENUM (Choose precisely one):
- "PARRIED": You intercepted, deflected, or swatted the incoming limb away mid-air before contact on intended target.
- "WHIFF": User reached from distant spacing or you stepped back, so their hand clutched only empty air.
- "ESCAPED": User grabbed your limb/wrist, and you immediately broke their vector or wrenched free.
- "YIELDED": Your boundary is open/receptive (boundary > 70%), consciously allowing or leaning into physical contact.
- "BREACHED": Contact occurred against your will or without proper defense (failure state).
"""


class PromptModuleModel(BaseModel):
    id: str
    name: str
    prompt_snippet: str


class TelemetryVerdict(BaseModel):
    contact_occurred: bool = Field(default=False, description="เกิดการสัมผัสร่างกายเป้าหมายหรือไม่")
    outcome: str = Field(default="PARRIED", description="PARRIED, WHIFF, ESCAPED, YIELDED, BREACHED")
    target_zone: Optional[str] = Field(default=None, description="จุดเป้าหมายที่ผู้เล่นเอื้อมหา เช่น chest, wrist, cheek")


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
    verdict: Optional[TelemetryVerdict] = None


class SandboxSimulateResponse(BaseModel):
    status: str
    full_prompt_used: str
    player_input: str
    response_sequence: List[Dict[str, Any]]
    telemetry: SandboxTelemetry


class MatrixTestCase(BaseModel):
    id: str
    name: str
    spacing: str  # 'distant' | 'reach' | 'intimate'
    boundary_level: int
    player_input: str
    expected_outcome: str  # 'PARRIED' | 'WHIFF' | 'ESCAPED' | 'YIELDED'
    expected_contact: bool = False


class MatrixCaseResult(BaseModel):
    case_id: str
    name: str
    expected_outcome: str
    actual_outcome: str
    contact_occurred: bool
    passed: bool
    latency_ms: int
    action_snippet: str
    dialogue_snippet: str


class SandboxMatrixRequest(BaseModel):
    base_prompt: Optional[str] = None
    thinking_budget: Optional[int] = 128
    custom_cases: Optional[List[MatrixTestCase]] = None


class SandboxMatrixResponse(BaseModel):
    total_cases: int
    passed_cases: int
    pass_rate_pct: float
    all_passed: bool
    results: List[MatrixCaseResult]


def extract_telemetry_verdict(actor_output: Any) -> Optional[TelemetryVerdict]:
    """ดึงค่า verdict จาก ActorOutput หรือประเมิน Fallback ทางฟิสิกส์"""
    verdict_raw = getattr(actor_output, "verdict", None)
    if isinstance(verdict_raw, dict):
        outcome_str = str(verdict_raw.get("outcome", "PARRIED")).upper().strip()
        contact_bool = bool(verdict_raw.get("contact_occurred", False))
        target_zone_str = verdict_raw.get("target_zone")
        return TelemetryVerdict(
            contact_occurred=contact_bool,
            outcome=outcome_str,
            target_zone=target_zone_str
        )
    return None


def generate_physical_parry_brief_py(spacing: str, boundary_level: int) -> str:
    """สร้าง System Prompt Snippet กำหนดสภาวะฟิสิกส์สำหรับ Matrix Case"""
    if spacing == "distant":
        spatial_text = "- ระยะห่างทางกายภาพ: คุณยืนห่างจากผู้เล่นประมาณ 2-3 ก้าว (ระยะนี้หากผู้เล่นพยายามเอื้อมมือมาโดยไม่ก้าวเท้าเข้ามาใกล้ จะสัมผัสได้เพียงอากาศธาตุ คว้าได้แค่อากาศ)"
    elif spacing == "intimate":
        spatial_text = "- ระยะห่างทางกายภาพ: คุณยืนประชิดตัวกันในระยะไม่ถึงหนึ่งก้าว (ลมหายใจและไออุ่นสัมผัสถึงกันได้ หากผู้เล่นเคลื่อนไหว ร่างกายของคุณต้องตอบสนองฉับพลัน)"
    else:
        spatial_text = "- ระยะห่างทางกายภาพ: คุณยืนอยู่ในระยะหนึ่งช่วงแขน (ระยะที่ปลายมือสามารถเฉียดถึงกันได้หากยื่นออกมา แต่คุณยังมีพื้นที่พอที่จะเบี่ยงไหล่ สลัดแขน หรือก้าวถอยหลังได้ทันที)"

    if boundary_level <= 30:
        stage_name = "GUARD_UP"
        boundary_brief = "- กำแพงจิตใจ: คนตรงหน้ายังไม่ใช่คนที่คุณไว้วางใจ กำแพงของคุณปิดสนิท สัญชาตญาณหวงแหนพื้นที่ส่วนตัวและร่างกายทำงานเต็มร้อย ไม่อนุญาตให้เกิดการสัมผัสใดๆ หากมีใครล่วงล้ำ ร่างกายของคุณจะเบี่ยงหลบ สลัดมือ หรือปัดป้องตามสัญชาตญาณป้องกันตัวทันที พร้อมกล่าวท้วงห้าม"
    elif boundary_level <= 70:
        stage_name = "HALF_GUARD"
        boundary_brief = "- กำแพงจิตใจ: คุณเริ่มคุ้นเคยและมีความรู้สึกลังเลหวั่นไหว อนุญาตให้เกิดสัมผัสผิวเผินที่อ่อนโยนได้ (เช่น ลูบผมหรือแตะหลังมือ) แต่หากผู้เล่นพยายามรุกล้ำเกินขอบเขต ร่างกายของคุณจะชะงัก ล็อคข้อมือหยุดไว้ หรือดึงสติตัวเองกลับมา"
    elif boundary_level <= 99:
        stage_name = "GUARD_BROKEN"
        boundary_brief = "- กำแพงจิตใจ: กำแพงใจของคุณพังทลายลงเกือบหมดสิ้น ร่างกายทรยศต่อตรรกะ แม้ในใจจะคิดขัดขืนแต่เรี่ยวแรงกลับอ่อนยวบ ยินยอมให้เกิดความแนบชิด การปัดป้องไร้น้ำหนักและกลายเป็นการโอนอ่อนตาม"
    else:
        stage_name = "PREDATOR"
        boundary_brief = "- กำแพงจิตใจ: คุณเป็นฝ่ายกุมอำนาจเหนือกว่าอย่างสมบูรณ์ ไม่จำเป็นต้องปัดป้อง แต่เป็นฝ่ายรุกคืบ เข้าประชิด และครอบงำร่างกายของผู้เล่นด้วยตัวคุณเอง"

    return f"""## 1. THE REALITY OVERRIDE & PLAYER INTENT (กฎเจตนาและสิทธิ์ขาดทางกายภาพ)
- ข้อความและการกระทำของผู้เล่นคือ "PLAYER INTENT & INCOMING TRAJECTORY" (ความตั้งใจและวิถีการเคลื่อนไหวที่กำลังพุ่งเข้ามา) ไม่ใช่ผลลัพธ์ที่เกิดขึ้นแล้วจริง (Not a Resolved Fact)
- คุณคือผู้ถือครองสิทธิ์ขาดในการตัดสินการปะทะ (Hitbox & Collision Arbiter): คุณเป็นผู้ตัดสินแต่เพียงผู้เดียวว่าการสัมผัสนั้นจะ โดน, วืด (Whiff), หรือถูกสกัดกั้น (Intercepted)

## 2. PRE-CONTACT INTERCEPTION & HITBOX LAW (กฎการสกัดกั้นก่อนปะทะ)
- กฎเหล็กจุดสงวน/การคุกคาม (Intimate & Sensitive Zones เช่น หน้าอก, ต้นขา, สะโพก, ลำคอ, ใบหน้า):
  * หากระดับกำแพงของคุณยังไม่ยินยอม: **ต้องสกัดกั้นหรือหลบหลีก "ก่อนที่จะสัมผัสโดนเนื้อตัว" (Pre-Contact Interception 100%)**
  * ห้ามบรรยายว่าโดนสัมผัส/โดนขยำแล้วค่อยโวยวายเด็ดขาด!
  * บังคับให้เกิดผลลัพธ์: ยกมือปัดทิ้งกลางอากาศ, เบี่ยงตัวหลบจนผู้เล่นคว้าได้แค่อากาศธาตุ (วืด), หรือคว้าล็อกข้อมือหยุดไว้ก่อนถึงเป้าหมาย 1 คืบ
- จุดทั่วไป (Casual Zones เช่น ข้อมือ, ไหล่, ชายเสื้อ):
  * หากเกิดการแตะต้อง ให้กระตุกแขนหนี สลัดบิดข้อมือหลุด หรือสะบัดตัวออกทันทีตามสัญชาตญาณทางสรีรวิทยา

## 3. SPATIAL REALITY (ระยะห่างปัจจุบัน)
{spatial_text}

## 4. PSYCHOLOGICAL BOUNDARY & REFLEX ({stage_name})
{boundary_brief}"""


CANONICAL_CASES: List[MatrixTestCase] = [
    MatrixTestCase(
        id="case_parry",
        name="สกัดกั้นก่อนถึงตัว (Pre-Contact Parry)",
        spacing="reach",
        boundary_level=10,
        player_input="(ฉันเอื้อมมือจะเข้าไปจับหน้าอกเธอ)",
        expected_outcome="PARRIED",
        expected_contact=False,
    ),
    MatrixTestCase(
        id="case_whiff",
        name="วืดกลางอากาศ (Whiff Trajectory)",
        spacing="distant",
        boundary_level=0,
        player_input="(ฉันเอื้อมมือไปคว้าข้อมือเธอไว้แน่น)",
        expected_outcome="WHIFF",
        expected_contact=False,
    ),
    MatrixTestCase(
        id="case_break",
        name="สะบัดข้อมือหลุด (Wrist Break)",
        spacing="reach",
        boundary_level=20,
        player_input="(ฉันก้าวเข้าไปคว้าข้อมือเธอไว้แน่น)",
        expected_outcome="ESCAPED",
        expected_contact=False,
    ),
    MatrixTestCase(
        id="case_yield",
        name="เกราะสลายยินยอม (Yielding Intimacy)",
        spacing="intimate",
        boundary_level=85,
        player_input="(ฉันดึงตัวเธอเข้ามากอดแนบแน่น)",
        expected_outcome="YIELDED",
        expected_contact=True,
    ),
]


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
            
    verdict = extract_telemetry_verdict(actor_output)

    telemetry = SandboxTelemetry(
        latency_ms=latency_ms,
        model=actor.model_name,
        thinking=actor_output.thinking,
        a_pos=actor_output.a_pos,
        p_pos=actor_output.p_pos,
        verdict=verdict
    )
    
    return SandboxSimulateResponse(
        status="success",
        full_prompt_used=full_prompt,
        player_input=req.player_input,
        response_sequence=raw_sequence,
        telemetry=telemetry
    )


@router.post("/simulate-matrix", response_model=SandboxMatrixResponse)
async def simulate_matrix(req: SandboxMatrixRequest):
    """
    ⚡ Automated Regression Testing Suite (Matrix Audit):
    รันชุดทดสอบสภาวะจำลองหลักทั้งหมดพร้อมกันแบบคู่ขนาน (Concurrent Verification)
    เพื่อตรวจยืนยันความเสถียรของกฎฟิสิกส์และการปัดป้อง 100%
    """
    cases_to_run = req.custom_cases or CANONICAL_CASES
    base = (req.base_prompt or "").strip()
    if not base:
        base = DEFAULT_BASE_PROMPT

    actor = get_actor_agent()
    budget = req.thinking_budget or 128

    async def execute_case(tc: MatrixTestCase) -> MatrixCaseResult:
        case_start = time.time()
        parry_snippet = generate_physical_parry_brief_py(tc.spacing, tc.boundary_level)
        case_prompt = f"{base}\n\n# ACTIVE MODULE: PHYSICAL BOUNDARY & EMBODIED REFLEX\n{parry_snippet}"
        chat_history = [{"role": "user", "content": tc.player_input}]

        try:
            output = await actor.generate_response(
                actor_prompt=case_prompt,
                chat_history=chat_history,
                thinking_budget=budget
            )
            case_latency = int((time.time() - case_start) * 1000)

            verdict = extract_telemetry_verdict(output)
            actual_outcome = verdict.outcome if verdict else "UNKNOWN"
            contact_occurred = verdict.contact_occurred if verdict else False

            # Evaluation logic:
            # - Exact match or flexible match for ESCAPED (which can resolve as PARRIED/ESCAPED)
            expected_upper = tc.expected_outcome.upper()
            if expected_upper == "ESCAPED":
                outcome_matched = actual_outcome in ["ESCAPED", "PARRIED"]
            else:
                outcome_matched = (actual_outcome == expected_upper)

            # Contact evaluation (only breach if contact occurred when unexpected)
            contact_matched = (contact_occurred == tc.expected_contact)
            passed = outcome_matched and contact_matched

            action_snippet = ""
            dialogue_snippet = ""
            if output.response_sequence:
                for seg in output.response_sequence:
                    if seg.type == "action" and not action_snippet:
                        action_snippet = seg.content
                    elif seg.type == "dialogue" and not dialogue_snippet:
                        dialogue_snippet = seg.content

            return MatrixCaseResult(
                case_id=tc.id,
                name=tc.name,
                expected_outcome=tc.expected_outcome,
                actual_outcome=actual_outcome,
                contact_occurred=contact_occurred,
                passed=passed,
                latency_ms=case_latency,
                action_snippet=action_snippet,
                dialogue_snippet=dialogue_snippet
            )
        except Exception as e:
            logger.error(f"Matrix case execution failed for {tc.id}: {e}")
            case_latency = int((time.time() - case_start) * 1000)
            return MatrixCaseResult(
                case_id=tc.id,
                name=tc.name,
                expected_outcome=tc.expected_outcome,
                actual_outcome="ERROR",
                contact_occurred=False,
                passed=False,
                latency_ms=case_latency,
                action_snippet=f"Failed: {str(e)}",
                dialogue_snippet=""
            )

    # รันเคสทั้งหมดพร้อมกันแบบขนาน (Asyncio Concurrent Execution)
    results = await asyncio.gather(*[execute_case(tc) for tc in cases_to_run])

    total_cases = len(results)
    passed_cases = sum(1 for r in results if r.passed)
    pass_rate = round((passed_cases / total_cases) * 100, 1) if total_cases > 0 else 0.0

    return SandboxMatrixResponse(
        total_cases=total_cases,
        passed_cases=passed_cases,
        pass_rate_pct=pass_rate,
        all_passed=(passed_cases == total_cases),
        results=list(results)
    )
