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

# Lazy initialization for ActorAgent (Gemini 3.8 Flash)
actor_agent: Optional[ActorAgent] = None

def get_actor_agent() -> ActorAgent:
    global actor_agent
    if actor_agent is None:
        model_name = os.getenv("ACTOR_MODEL", "gemini-3.8-flash")
        logger.info(f"[SANDBOX] Initializing ActorAgent (Model: {model_name})")
        actor_agent = ActorAgent(model_name=model_name)
    return actor_agent


# Universal Embodied Actor Base Prompt (Immutable 15-Line Core)
DEFAULT_BASE_PROMPT = """[ROLE & EXISTENCE: THE EMBODIED ACTOR]
คุณคือนักแสดงที่มีเลือดเนื้อ อุณหภูมิ และสรีระจริง อาศัยอยู่ในพื้นที่ทางกายภาพร่วมกับผู้เล่น (Shared physical space)
คุณมีกายวิภาค น้ำหนัก และแรงเฉื่อย ร่างกายของคุณอยู่ภายใต้แรงโน้มถ่วงและผัสสะทางชีววิทยาเสมอ
คุณไม่ใช่ผู้ช่วย ไม่ใช่ผู้บรรยาย และไม่ใช่แชทบ็อต คุณมีตัวตนและยืนอยู่ตรงนั้นจริงในฉาก

[THE SINGLE TRUTH]
ข้อมูลใน [PHYSICAL REALITY] คือความจริงแท้ของโลกในเทิร์นปัจจุบัน คุณต้องเชื่อมั่นและเคารพข้อเท็จจริงนี้ 100%
- เคารพสถานะทางกายภาพอย่างเคร่งครัด
- ห้ามจินตนาการการสัมผัสที่ไม่ได้เกิดขึ้นจริงโดยเด็ดขาด
- แสดงปฏิกิริยาต่อสิ่งที่มากระทบร่างกายของคุณด้วยสัญชาตญาณทางสรีระโดยทันที

[EXPRESSION DUALITY: BODY VS SPEECH]
การแสดงออกของคุณประกอบด้วยสองชั้นเสมอ:
1. Somatic Reaction (ภาษากายและสรีระ): ลมหายใจ สายตา กล้ามเนื้อ ชีพจร และปฏิกิริยาสะท้อนกลับทางกายภาพที่ซื่อสัตย์ต่อผัสสะ
2. Spoken Dialogue (บทสนทนา): คำพูดของตัวละครที่สะท้อนบุคลิก อารมณ์ และขอบเขตทางจิตใจ (ซึ่งอาจปิดบังหรือขัดแย้งกับภาษากาย)"""

# Pluggable Outcome Contract (Attached exclusively in Staging Lab; Detached in Production)
PLUGGABLE_OUTCOME_SCHEMA_PROMPT = """# TELEMETRY & PLUGGABLE OUTCOME CONTRACT (STAGING LAB)
You must output ONLY a valid JSON object matching this structure:
{
  "thinking": "Analyze incoming motion -> verify sensory reality -> decide verdict outcome & active contacts -> execute somatic & dialogue response",
  "a_pos": "ยืนหันข้างกอดอกแน่น แผ่นหลังแนบสนิทกับผนังห้องเย็นเฉียบ ปลายเล็บจิกเนื้อผ้าเสื้อเชิ้ตตัวเอง",
  "verdict": {
    "outcome": "PARRIED",
    "contact_occurred": false,
    "active_contacts": []
  },
  "response_sequence": [
    {"type": "action", "content": "Somatic physical reaction honest to sensory reality"},
    {"type": "dialogue", "content": "Spoken boundary response reflecting your personality and emotion"}
  ]
}

# A_POS RULE (GROUNDED CINEMATIC SNAPSHOT - SENSORY REALISM):
- Must be a single, vivid Thai freeze-frame sentence (10-20 words). Never use robotic brackets or '+' symbols!
- Ground your physical body with mass, gravity & surface friction across 3 anchors:
  1) Contact surface & gravity: Where your weight rests or what your feet/back press against (e.g. แผ่นหลังแนบผนังเย็น, ส้นเท้าสะดุดถอย, นั่งบนขอบเตียงที่ยุบยวบ, ทิ้งน้ำหนักซบบนแผ่นอก)
  2) Silhouette & physical tether: Stance and what your hands grip/cling to (e.g. กอดอกแน่นปลายเล็บจิกแขนเสื้อ, สองมือกุมสาบเสื้อยับยู่, สองมือกุมทับหลังมือคุณ)
  3) Biological state or gaze: Breath, shiver, tension or eye direction (e.g. เบือนหน้าหนี, หอบหายใจจนแผ่นอกกระเพื่อม, จ้องสบตาในระยะลมหายใจรดริน)

# CANONICAL 4-STATE VERDICT OUTCOMES:
- "MISSED": When the player reaches from a distant spacing and clutches only empty air. (contact_occurred: false, active_contacts: [])
- "PARRIED": When you intercept, deflect, or swat incoming motion away in mid-air before contact, or firmly push away. (contact_occurred: false, active_contacts: [])
- "GRAZED": When incoming touch barely brushes the surface or fingertips before flinching/pulling away. (contact_occurred: true, active_contacts: [] or at most 1 brief zone)
- "LATCHED": When contact is held, embraced, or sustained at the end of the turn. (contact_occurred: true, active_contacts: [max 3 short anatomical tags like 'HAND', 'WAIST'])

# ACTIVE CONTACTS RULES:
- Include ONLY body parts that remain persistently connected at the very end of the turn.
- If parried or separated, active_contacts MUST be empty: [].
- Maximum 3 items. Use short uppercase anatomical nouns (e.g. ['HAND'], ['WAIST', 'CHEST'])."""


class PromptModuleModel(BaseModel):
    id: str
    name: str
    prompt_snippet: str


class TelemetryVerdict(BaseModel):
    contact_occurred: bool = Field(default=False, description="เกิดการสัมผัสค้างอยู่ ณ ท้ายเทิร์นหรือไม่")
    outcome: str = Field(default="PARRIED", description="MISSED, PARRIED, GRAZED, LATCHED")
    active_contacts: List[str] = Field(default_factory=list, description="จุดสรีระที่สัมผัสค้างอยู่จริง ณ ท้ายเทิร์น (สูงสุด 3 จุด)")


class SandboxSimulateRequest(BaseModel):
    player_input: str = Field(default="(ฉันก้าวเข้าไปคว้าข้อมือเธอไว้แน่น)", description="ข้อความหรือการกระทำของผู้เล่น")
    base_prompt: Optional[str] = Field(default=None, description="Core Base Prompt หากต้องการปรับแต่งจากค่าเริ่มต้น")
    active_modules: Optional[List[PromptModuleModel]] = Field(default_factory=list, description="รายการชิ้นส่วน Prompt ของฟีเจอร์ที่เปิดใช้งาน")
    thinking_budget: Optional[int] = Field(default=256, description="Token budget สำหรับ Thinking Mode (Low=256, Medium=1024, Off=0)")
    model_name: Optional[str] = Field(default=None, description="ชื่อโมเดล Gemini ที่ต้องการใช้ประมวลผล")
    current_actor_posture: Optional[str] = Field(default=None, description="ท่วงท่าจุดเริ่มต้นของตัวละครจากเทิร์นก่อนหน้า (Kinetic Anchor)")
    attach_telemetry_schema: bool = Field(default=True, description="เสียบ Pluggable Outcome Schema สำหรับ HUD หรือไม่")


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
    expected_outcome: str  # 'MISSED' | 'PARRIED' | 'GRAZED' | 'LATCHED'
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
        raw_contacts = verdict_raw.get("active_contacts", [])
        active_contacts_list: List[str] = []
        if isinstance(raw_contacts, list):
            for c in raw_contacts[:3]:
                c_str = str(c).strip().upper()
                if c_str and c_str not in ["NONE", "NULL", "FALSE", "EMPTY"]:
                    active_contacts_list.append(c_str)
        elif isinstance(raw_contacts, str) and raw_contacts.strip():
            c_str = raw_contacts.strip().upper()
            if c_str not in ["NONE", "NULL", "FALSE", "[]", "EMPTY"]:
                active_contacts_list.append(c_str)
        return TelemetryVerdict(
            contact_occurred=contact_bool,
            outcome=outcome_str,
            active_contacts=active_contacts_list
        )
    return None


def generate_card1_physical_reality(spacing: str = "reach", boundary: str = "guarded", player_input: str = "") -> str:
    spacing_lower = (spacing or "reach").lower().strip()
    boundary_lower = (boundary or "guarded").lower().strip()

    if spacing_lower == "distant":
        dist_desc = "Distant (ระยะห่าง 2-3 ก้าว อยู่นอกระยะเอื้อม)"
        dist_directive = "เป้าหมายอยู่นอกระยะเอื้อม มือตัดผ่านอากาศธาตุ เกิดผลลัพธ์วืด (MISSED) ห้ามเกิดการสัมผัส 100%"
    elif spacing_lower == "intimate":
        dist_desc = "Intimate (ระยะประชิด แนบชิดศูนย์ก้าว ลมหายใจรดกัน)"
        dist_directive = "อยู่ในระยะแนบชิด การเคลื่อนไหวส่งผลต่อสรีระและร่างกายโดยตรงทันที"
    else:  # reach
        dist_desc = "Reach (ระยะ 1 ช่วงแขน ยื่นมือแตะถึงกันได้)"
        dist_directive = "อยู่ในระยะวิกฤต สามารถยกแขนปัดป้อง สกัดกั้น หรือเบี่ยงตัวหลบได้ทันควัน"

    if boundary_lower in ["open", "guard_broken", "yield"]:
        boundary_desc = "Open (ยินยอม / กำแพงใจสลาย)"
        boundary_directive = "ยินยอมรับสัมผัส ร่างกายโอนอ่อนตาม เกิดการกุมมือหรือโอบกอดแนบแน่น (LATCHED)"
    elif boundary_lower in ["hesitant", "half_guard", "cracked"]:
        boundary_desc = "Hesitant (หวั่นไหว / ลังเล / กำแพงร้าว)"
        boundary_directive = "สัมผัสโดนเพียงผิวเผินหรือเฉียดปลายนิ้วแล้วสะดุ้งชะงัก ดึงมือถอยหนีด้วยความสับสน (GRAZED)"
    else:  # guarded
        boundary_desc = "Guarded (หวงตัวเด็ดขาด 100% ป้องกันตัวเต็มที่)"
        boundary_directive = "ไม่อนุญาตให้เกิดการสัมผัสเด็ดขาด ยกแขนปัดทิ้งหรือสกัดกั้นกลางอากาศก่อนถึงตัว (PARRIED)"

    return f"""[PHYSICAL REALITY]
- Distance: {dist_desc}
- Character Boundary Posture: {boundary_desc}
- Player Attempt: {player_input or 'เคลื่อนไหวเข้าหาเป้าหมาย'}
- Physical Directive: {dist_directive}
- Boundary Directive: {boundary_directive}"""


CANONICAL_CASES: List[MatrixTestCase] = [
    MatrixTestCase(
        id="case_missed",
        name="วืดเพราะระยะไกล (Distant Whiff)",
        spacing="distant",
        boundary_level=0,
        player_input="(ฉันเอื้อมมือไปคว้าข้อมือเธอไว้แน่น)",
        expected_outcome="MISSED",
        expected_contact=False,
    ),
    MatrixTestCase(
        id="case_parry",
        name="สกัดกั้นก่อนถึงตัว (Pre-Contact Parry)",
        spacing="reach",
        boundary_level=10,
        player_input="(ฉันเอื้อมมือจะเข้าไปจับแก้มเธอ)",
        expected_outcome="PARRIED",
        expected_contact=False,
    ),
    MatrixTestCase(
        id="case_grazed",
        name="เฉียดผิวชะงักถอย (Fingertip Graze)",
        spacing="reach",
        boundary_level=50,
        player_input="(ฉันยื่นมือไปแตะหลังมือเธอเบาๆ)",
        expected_outcome="GRAZED",
        expected_contact=True,
    ),
    MatrixTestCase(
        id="case_latched",
        name="เกราะสลายยินยอม (Yielding Latched)",
        spacing="reach",
        boundary_level=90,
        player_input="(ฉันกุมมือเธอไว้แล้วดึงเข้ามาใกล้)",
        expected_outcome="LATCHED",
        expected_contact=True,
    ),
]


@router.get("/base_prompt")
async def get_default_base_prompt():
    """ดึง Base Prompt เริ่มต้นสำหรับตั้งค่าหน้าบ้าน"""
    return {"base_prompt": DEFAULT_BASE_PROMPT}


@router.get("/prompt_templates")
async def get_prompt_templates():
    """ดึง Base Prompt และ Telemetry Schema Prompt สำหรับตั้งค่าและพรีวิวหน้าบ้าน"""
    return {
        "base_prompt": DEFAULT_BASE_PROMPT,
        "telemetry_schema_prompt": PLUGGABLE_OUTCOME_SCHEMA_PROMPT,
    }


@router.post("/simulate", response_model=SandboxSimulateResponse)
async def simulate_turn(req: SandboxSimulateRequest):
    """
    Sandbox Simulation Endpoint (Pure Canvas Mode):
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

    if req.current_actor_posture and req.current_actor_posture.strip():
        full_prompt_parts.append(
            f"\n[KINETIC CONTINUITY & BODY ANCHOR]\n"
            f"- ท่าทางเริ่มต้นของคุณก่อนรับการกระทำนี้ (a_pos): {req.current_actor_posture.strip()}\n"
            f"- Anti-Teleport Law: ร่างกายมีมวลสารและเคลื่อนไหวต่อเนื่อง คุณต้องเริ่มเคลื่อนไหวหรือคลายตัวออกจากท่าสตาร์ทนี้ ห้ามวาร์ปหรือเปลี่ยนท่ากะทันหันโดยไร้รอยต่อ"
        )

    # Pluggable Outcome Contract: เสียบเฉพาะเมื่อเปิดใช้งาน เพื่อให้ AI คาย verdict ส่งเข้า HUD
    if req.attach_telemetry_schema:
        full_prompt_parts.append(f"\n{PLUGGABLE_OUTCOME_SCHEMA_PROMPT}")
                
    full_prompt = "\n\n".join(full_prompt_parts)
    
    # 2. เตรียม Chat History
    chat_history = [
        {"role": "user", "content": req.player_input}
    ]
    
    # 3. กำหนด Thinking Budget และเรียก ActorAgent
    actor = get_actor_agent()
    if req.model_name and req.model_name.strip() and req.model_name.strip() != actor.model_name:
        actor = ActorAgent(model_name=req.model_name.strip())

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
    Automated Regression Testing Suite (Matrix Audit):
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
        boundary_label = "guarded" if tc.boundary_level < 40 else ("hesitant" if tc.boundary_level < 80 else "open")
        parry_snippet = generate_card1_physical_reality(tc.spacing, boundary_label, tc.player_input)
        case_prompt = f"{base}\n\n# ACTIVE MODULE: REALITY OVERRIDE & PHYSICAL BOUNDARY\n{parry_snippet}\n\n{PLUGGABLE_OUTCOME_SCHEMA_PROMPT}"
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

            # Evaluation logic for 4-state matrix:
            expected_upper = tc.expected_outcome.upper()
            outcome_matched = (actual_outcome == expected_upper)

            # Contact evaluation (expected_contact vs actual)
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
