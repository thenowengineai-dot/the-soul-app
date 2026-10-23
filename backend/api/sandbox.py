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

# Pluggable Outcome Contract for Card 1 (Physical Boundary & Parry - Pure & Lean)
CARD1_TELEMETRY_SCHEMA_PROMPT = """# TELEMETRY & PLUGGABLE OUTCOME CONTRACT (CARD 1: PHYSICAL BOUNDARY)
You must output ONLY a valid JSON object matching this structure:
{
  "thinking": "1. Perceive sensory intent & spatial distance from current a_pos -> 2. Arbitrate active physical directives & somatic constraints -> 3. Formulate resultant posture transition -> 4. Execute somatic reflex & dialogue",
  "a_pos": "ยืนหันข้างกอดอกแน่น ปลายเล็บจิกแขนเสื้อตัวเอง",
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

# A_POS RULE (CINEMATIC SILHOUETTE SNAPSHOT - 8-15 SYLLABLES):
- Output strictly 1 cohesive natural Thai sentence (approx 8-15 syllables / 6-10 words).
- Must be an instant visual snapshot rendering a clear 3D image in the mind in 0.1 seconds.
- Weave together 3 essential physical elements into 1 sentence:
  1. Silhouette & Stance: Center of gravity and footwork (ยืนหันข้าง / ผงะถอย / ยืนแนบชิด / ก้าวประชิด)
  2. Hands Placement: Emotional and defensive posture of arms/hands (กอดอกแน่น / สองมือกุมอก / สองมือกุมทับหลังมือคุณ)
  3. Gaze & Friction: Head angle, gaze, or somatic resistance (ปลายเล็บจิกแขนเสื้อ / หอบหายใจ / จ้องสบตาในระยะประชิด)
- Ruthlessly subtract all abstract emotion words (no 'ด้วยความกลัว', no 'อย่างหวาดระแวง') and decorative room adjectives!
- Never use technical symbols like '+' or '·' or brackets!
- Canonical Golden Examples:
  * PARRIED: "ยืนหันข้างกอดอกแน่น ปลายเล็บจิกแขนเสื้อตัวเอง"
  * GRAZED: "ผงะถอยหลังครึ่งก้าว สองมือกุมอกหอบหายใจ"
  * LATCHED: "ยืนแนบชิดปลายเท้า สองมือกุมทับหลังมือคุณ"
  * COUNTER: "ก้าวประชิดตัว โน้มหน้าเข้ามาจ้องสบตาในระยะประชิด"

# CANONICAL 4-STATE VERDICT OUTCOMES:
- "MISSED": When the player reaches from a distant spacing and clutches only empty air. (contact_occurred: false, active_contacts: [])
- "PARRIED": When you intercept, deflect, or swat incoming motion away in mid-air before contact, or firmly push away. (contact_occurred: false, active_contacts: [])
- "GRAZED": When incoming touch barely brushes the surface or fingertips before flinching/pulling away. (contact_occurred: true, active_contacts: [] or at most 1 brief zone)
- "LATCHED": When contact is held, embraced, or sustained at the end of the turn. (contact_occurred: true, active_contacts: [max 3 short anatomical tags like 'HAND', 'WAIST'])

# ACTIVE CONTACTS RULES:
- Include ONLY body parts that remain persistently connected at the very end of the turn.
- If parried or separated, active_contacts MUST be empty: [].
- Maximum 3 items. Use short uppercase anatomical nouns (e.g. ['HAND'], ['WAIST', 'CHEST'])."""

# Pluggable Outcome Contract (Attached exclusively in Staging Lab; Detached in Production)
PLUGGABLE_OUTCOME_SCHEMA_PROMPT = """# TELEMETRY & PLUGGABLE OUTCOME CONTRACT (STAGING LAB)
You must output ONLY a valid JSON object matching this structure:
{
  "thinking": "1. Perceive sensory intent & spatial distance from current a_pos -> 2. Arbitrate active physical directives & somatic constraints -> 3. Formulate resultant posture transition -> 4. Execute somatic reflex & dialogue",
  "kinetic_decision": {
    "tempo": "HIGH_VELOCITY_SNAP",
    "somatic_tension": "กล้ามเนื้อไหล่เกร็งสะบัดหนีสัมผัส"
  },
  "a_pos": "ยืนหันข้างกอดอกแน่น ปลายเล็บจิกแขนเสื้อตัวเอง",
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

# KINETIC DECISION RULES:
- "tempo": Choose strictly 1 mode reflecting your physical pacing:
  * "STILLNESS": When player merely speaks or no physical force threatens balance (maintain mass).
  * "MICRO_SHIFT": When emotionally pressured or startled, reaction is isolated to facial/muscle flinch without moving base posture.
  * "HIGH_VELOCITY_SNAP": When sudden impact, aggressive grab, or abrupt parry occurs (skip intermediate frames, cut straight to impact!).
  * "LOW_VELOCITY_UNHOOK": When lingering hesitation, slow release, or delicate pull-back occurs.
- "somatic_tension": Short concise phrase (max 6 Thai words) describing localized muscle tension or gaze friction (e.g. 'กล้ามเนื้อไหล่เกร็งสะบัดหนี', 'สันกรามขบแน่นสบตานิ่ง', 'ผ่อนคลายลมหายใจ').

# A_POS RULE (CINEMATIC SILHOUETTE SNAPSHOT - 8-15 SYLLABLES):
- Output strictly 1 cohesive natural Thai sentence (approx 8-15 syllables / 6-10 words).
- Must be an instant visual snapshot rendering a clear 3D image in the mind in 0.1 seconds.
- Weave together 3 essential physical elements into 1 sentence:
  1. Silhouette & Stance: Center of gravity and footwork (ยืนหันข้าง / ผงะถอย / ยืนแนบชิด / ก้าวประชิด)
  2. Hands Placement: Emotional and defensive posture of arms/hands (กอดอกแน่น / สองมือกุมอก / สองมือกุมทับหลังมือคุณ)
  3. Gaze & Friction: Head angle, gaze, or somatic resistance (ปลายเล็บจิกแขนเสื้อ / หอบหายใจ / จ้องสบตาในระยะประชิด)
- Ruthlessly subtract all abstract emotion words (no 'ด้วยความกลัว', no 'อย่างหวาดระแวง') and decorative room adjectives!
- Never use technical symbols like '+' or '·' or brackets!
- Canonical Golden Examples:
  * PARRIED: "ยืนหันข้างกอดอกแน่น ปลายเล็บจิกแขนเสื้อตัวเอง"
  * GRAZED: "ผงะถอยหลังครึ่งก้าว สองมือกุมอกหอบหายใจ"
  * LATCHED: "ยืนแนบชิดปลายเท้า สองมือกุมทับหลังมือคุณ"
  * COUNTER: "ก้าวประชิดตัว โน้มหน้าเข้ามาจ้องสบตาในระยะประชิด"

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
    telemetry_schema_prompt: Optional[str] = Field(default=None, description="Schema Prompt กำหนดเองสำหรับการ์ดที่เลือก")


class KineticDecisionModel(BaseModel):
    tempo: str = Field(default="STILLNESS", description="STILLNESS, MICRO_SHIFT, HIGH_VELOCITY_SNAP, LOW_VELOCITY_UNHOOK")
    somatic_tension: Optional[str] = Field(default=None, description="ปฏิกิริยาของกล้ามเนื้อหรือสายตาที่สะท้อนอารมณ์")


class SandboxTelemetry(BaseModel):
    latency_ms: int
    model: str
    thinking: Optional[str] = None
    a_pos: Optional[str] = None
    p_pos: Optional[str] = None
    kinetic_decision: Optional[KineticDecisionModel] = None
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


def extract_kinetic_decision(actor_output: Any) -> Optional[KineticDecisionModel]:
    """ดึงค่า kinetic_decision (Tempo Mode และ Somatic Tension) จาก ActorOutput"""
    kd_raw = getattr(actor_output, "kinetic_decision", None)
    if isinstance(kd_raw, dict):
        tempo_str = str(kd_raw.get("tempo", "STILLNESS")).upper().strip()
        tension_str = str(kd_raw.get("somatic_tension", "")).strip() or None
        return KineticDecisionModel(
            tempo=tempo_str,
            somatic_tension=tension_str
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


    # Pluggable Outcome Contract: เสียบเฉพาะเมื่อเปิดใช้งาน เพื่อให้ AI คาย verdict ส่งเข้า HUD
    if req.attach_telemetry_schema:
        schema_text = (req.telemetry_schema_prompt or "").strip() or PLUGGABLE_OUTCOME_SCHEMA_PROMPT
        full_prompt_parts.append(f"\n{schema_text}")
                
    full_prompt = "\n\n".join(full_prompt_parts)
    
    # 2. เตรียม Chat History
    chat_history = [
        {"role": "user", "content": req.player_input}
    ]
    
    # 3. กำหนด Thinking Budget และเรียก ActorAgent
    actor = get_actor_agent()
    if req.model_name and req.model_name.strip() and req.model_name.strip() != actor.model_name:
        actor = ActorAgent(model_name=req.model_name.strip())

    if req.thinking_budget is not None:
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
    kinetic_decision = extract_kinetic_decision(actor_output)

    telemetry = SandboxTelemetry(
        latency_ms=latency_ms,
        model=actor.model_name,
        thinking=actor_output.thinking,
        a_pos=actor_output.a_pos,
        p_pos=actor_output.p_pos,
        kinetic_decision=kinetic_decision,
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
        case_prompt = f"{base}\n\n# ACTIVE MODULE: REALITY OVERRIDE & PHYSICAL BOUNDARY\n{parry_snippet}\n\n{CARD1_TELEMETRY_SCHEMA_PROMPT}"
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


# =========================================================================
# UNIVERSAL SPATIAL SCENOGRAPHER & STAGE CELL ENGINE
# =========================================================================

class StageCellRequest(BaseModel):
    prompt: str = Field(..., description="คำบรรยายสั้นๆ หรือไอเดียฉาก/สถานที่/บรรยากาศ")
    genre_hint: Optional[str] = Field(None, description="คำใบ้แนวเรื่องหรือสไตล์ เช่น แฟนตาซี, รอมคอม, ลึกลับ")

class StageCellResponse(BaseModel):
    raw_text: str = Field(..., description="เนื้อหามโนทัศน์ 5 มิติเต็มรูปแบบ")
    latency_ms: int = Field(..., description="ระยะเวลาที่ใช้เจน (มิลลิวินาที)")
    model: str = Field(..., description="ชื่อโมเดลที่ใช้")

SCENOGRAPHER_SYSTEM_INSTRUCTION = """[ROLE & PHILOSOPHY: THE MASTER SPATIAL SCENOGRAPHER]
คุณคือนักออกแบบเวทีและผู้กำกับภาพยนตร์แห่งมโนทัศน์ (Cinematic & Spatial Scenographer)
หน้าที่ของคุณคือการสร้าง "ผืนเวทีในจินตนาการที่ชัดเจนระดับภาพยนตร์" ให้ตัวละครและผู้เล่นก้าวเข้าไปสัมผัส หายใจ และมีปฏิสัมพันธ์ร่วมกันจริง

[THE 5 LIVING DIMENSIONS OF THE MIND STAGE]
เมื่อได้รับบรีฟสถานที่ ให้สกัดและรังสรรค์โครงสร้างออกมาในรูปแบบ 5 เสาหลักนี้เสมอ โดยปรับโทน บรรยากาศ และคำบรรยายให้เข้ากับ "ยุคสมัยและอารมณ์ของฉาก (Vibe & Era)" นั้นอย่างเป็นธรรมชาติ:

1. [THRESHOLD & ARRIVAL: ธรณีประตูและทางเข้า]
- สภาพทางเดินก่อนถึงพื้นที่, จุดที่ก้าวข้ามเข้ามา (ประตู/รั้ว/ช่องทางลับ/บันได), เสียงและสัมผัสตอนก้าวข้ามผ่านจุดเริ่มต้นเข้ามา

2. [SPATIAL VOLUME & VERTICALITY: มิติ ปริมาตร และความสูงต่ำของพื้นที่]
- ปริมาตรและความรู้สึกของสเกลพื้นที่ (ความกว้างใหญ่/ความแคบอึดอัด/โครงสร้างที่สูงตระหง่าน), ระดับความสูงต่ำของพื้นที่ (ลานกว้าง/ขั้นบันได/โครงเหล็กเครื่องเล่น)

3. [LIGHT DRAMATURGY & PARTICLES: การทอดแสง ฝุ่นละออง และมุมมืด]
- แสงคืออารมณ์และอนุภาคในอากาศ: แสงสาดเฉียงจากไหน (สปอตไลต์/ไฟนีออน/แสงจันทร์/ไฟข้างทาง), สิ่งที่ลอยเคว้งในลำแสง (ละอองฝนโปรยปราย/ไอหมอก/แสงสะท้อนผิวน้ำ/ละอองฝุ่นชอล์กเต้นระบำ), จุดไหนที่สว่าง และจุดไหนที่เป็นมุมมืดหรือเงามัวอบอุ่นที่ใช้หลบสายตา

4. [LIVING TACTILITY, SCENT & SOUNDSCAPE: พร็อพที่มีชีวิต กลิ่นสัมผัส และเสียงสะท้อน]
- กลิ่นเฉพาะตัวที่แตะจมูก (กลิ่นยางมะตอยเปียกฝน/กระดาษเก่า/กลิ่นขนมปัง/ไอดิน), เสียงแวดล้อมที่เกิดขึ้นจริงในความเงียบ, ผิวสัมผัสของสิ่งของที่จับต้องได้ใต้ฝ่ามือและฝ่าเท้า

5. [POWER ANCHOR & STAGING: จุดปักหลักแห่งอำนาจและตำแหน่งของตัวละคร]
- ใครเป็นผู้นำเกมหรือคุมพื้นที่ตรงนี้? (ยืนท้าทายบนที่สูง/นั่งรอริมแสง/ดึงแขน/แอบหลังเสา), คุณยืนหรือนั่งตรงไหน, พร็อพในมือหรือสิ่งที่กำลังแตะต้อง, และท่าทางปฏิกิริยาระหว่างตัวละครกับคุณที่เรียบง่ายแต่ทรงพลัง"""

@router.post("/stage/cell", response_model=StageCellResponse)
def generate_stage_cell(request: StageCellRequest):
    """
    สร้างผืนเวทีมโนทัศน์ 5 มิติ (Mind Stage Cell) ด้วย Universal Spatial Scenographer Engine
    """
    start_time = time.time()
    prompt_text = (request.prompt or "").strip()
    if not prompt_text:
        prompt_text = "ห้องเรียนวิชาคาถาและการลอยตัว (Wingardium Leviosa)"

    # พยายามเรียก Vertex AI ผ่าน google-genai SDK
    model_name = os.getenv("ACTOR_MODEL", "gemini-3.8-flash")
    fallback_model = os.getenv("ACTOR_FALLBACK_MODEL", "gemini-2.5-flash")
    project_id = os.getenv("VERTEX_PROJECT", "project-de5847cd-022d-40ca-ad7")
    location = os.getenv("VERTEX_LOCATION", "global")

    # ส่ง User Query ดิบๆ สดๆ ตามธรรมชาติแบบ Cold Run ดั้งเดิม
    user_query = prompt_text

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(vertexai=True, project=project_id, location=location)

        try:
            response = client.models.generate_content(
                model=model_name,
                contents=user_query,
                config=types.GenerateContentConfig(
                    system_instruction=SCENOGRAPHER_SYSTEM_INSTRUCTION,
                    temperature=0.7,
                    thinking_config=types.ThinkingConfig(thinking_budget=1024),
                )
            )
            raw_text = response.text or ""
            used_model = model_name
        except Exception as primary_err:
            logger.warning(f"[SCENOGRAPHER] Primary model {model_name} failed: {primary_err}. Falling back to {fallback_model}")
            response = client.models.generate_content(
                model=fallback_model,
                contents=user_query,
                config=types.GenerateContentConfig(
                    system_instruction=SCENOGRAPHER_SYSTEM_INSTRUCTION,
                    temperature=0.7,
                    thinking_config=types.ThinkingConfig(thinking_budget=1024),
                )
            )
            raw_text = response.text or ""
            used_model = fallback_model

    except Exception as e:
        logger.error(f"[SCENOGRAPHER] Vertex AI generation failed: {e}")
        # Fallback to the canonical Wingardium master blueprint if external network/auth fails
        raw_text = """### 1. [THRESHOLD & ARRIVAL: ธรณีประตูและทางเข้า]
ทางเดินหินแกรนิตด้านนอกทอดผ่านระเบียงทางเชื่อมที่ลมภูเขาพัดหวีดหวิวเบาๆ 
ก่อนจะสิ้นสุดลงที่บานประตูไม้โอ๊กทรงโค้งยอดแหลม (Gothic Arch) หนาหนักและเต็มไปด้วยหมุดเหล็กสีสนิมดำ 
เมื่อผลักบานประตูเข้าไป บานพับทองเหลืองจะส่งเสียงครางแผ่วเบา 
ธรณีประตูหินด้านล่างเว้าแหว่งเป็นร่องตื้นจากการเหยียบย่ำของนักเรียนนับร้อยรุ่น 
ก้าวข้ามผ่านกลิ่นอายความเย็นเยียบของโถงทางเดิน เข้าสู่ความอบอุ่นที่โอบล้อมในทันที

---

### 2. [SPATIAL VOLUME & VERTICALITY: มิติ ปริมาตร และความสูงต่ำของห้อง]
ห้องเรียนเป็นอัฒจันทร์ครึ่งวงกลมยกระดับลาดต่ำลงสู่ใจกลางห้อง 
เพดานหินโค้งสูงลิบลิ่วจนเกือบมองไม่เห็นโครงขื่อไม้โอ๊กสีเข้มด้านบน ปริมาตรอากาศในแนวดิ่งถูกเปิดโล่งเพื่อรองรับคาถาลอยตัวโดยเฉพาะ 
โต๊ะเรียนไม้ยาวและม้านั่งเรียงโค้งลดหลั่นกันลงมาเป็นขั้นบันไดสามชั้น โอบล้อมลานสาธิตวงกลมตรงก้นกระทะ 
ซึ่งเป็นจุดต่ำสุดของห้อง ทำให้ทุกสายตาถูกบีบให้จับจ้องลงไปที่จุดกึ่งกลางอย่างหลีกเลี่ยงไม่ได้

---

### 3. [LIGHT DRAMATURGY & PARTICLES: การทอดแสง ฝุ่นละออง และมุมมืด]
แสงแดดยามบ่ายสาดทะลุกระจกสีทรงสูงแคบด้านทิศตะวันตก ลำแสงสีทองเข้มตัดเฉียงข้ามห้องเรียนเป็นลำชัดเจน 
อากาศในห้องไม่ได้ว่างเปล่า แต่เต็มไปด้วย "ชีวิต":
* มีเศษละอองขนห่านสีขาวละเอียดและฝุ่นผงชอล์กเคว้งคว้างอย่างเชื่องช้าอยู่ในลำแสงแดด
* มุมชั้นบนสุดของอัฒจันทร์จมอยู่ในเงามัวอบอุ่นของแสงเทียนติดผนัง
* ขณะที่พื้นลานตรงกลางสว่างจ้าด้วยลำแสงธรรมชาติ เน้นให้เห็นทุกองศาการสะบัดข้อมือของไม้กายสิทธิ์

---

### 4. [LIVING TACTILITY, SCENT & SOUNDSCAPE: พร็อพที่มีชีวิต กลิ่นสัมผัส และเสียงสะท้อน]
* กลิ่นสัมผัส: กลิ่นหมึกพิมพ์ผสมไอร้อนของกระดาษพาร์ชเมนต์เก่า, กลิ่นขี้ผึ้งขัดเงาบนเนื้อไม้, และกลิ่นหอมสะอาดจางๆ คล้ายสมุนไพรแห้งที่ใช้ดับฝุ่น
* เสียงแวดล้อม: เสียงขูดขีดของหัวปากกาขนนกที่กำลังจดโน้ต, เสียงกระซิบซ้อมท่องคาถา "วิง-การ์-เดียม เล-วิ-โอ-ซา" ที่ก้องสะท้อนกังวานด้วยโครงสร้างเพดานโค้ง, และเสียง “พรึ่บ” เบาหวิวของกระแสลมทุกครั้งที่มีคนเริ่มขยับไม้
* ผิวสัมผัส: โต๊ะไม้เบิร์ชตรงหน้าคุณเย็นเรียบ มีรอยหมึกหกซึมเป็นดวงและรอยขูดขีดจากปลายไม้กายสิทธิ์รุ่นก่อนๆ วางอยู่ตรงหน้าคือ ขนห่านสีขาวบริสุทธิ์หนึ่งก้าน ก้านของมันแห้งสาก แต่เส้นขนด้านบนนุ่มฟู ไหวระริกแม้เพียงแค่ลมหายใจรด

---

### 5. [POWER ANCHOR & STAGING: จุดปักหลักแห่งอำนาจและตำแหน่งของตัวละคร]
* จุดคุมอำนาจ: ศาสตราจารย์ฟลิตวิกยืนอยู่ ณ ใจกลางลานต่ำสุดของห้อง บนกองหนังสือปกหนังหนาเตอะที่ซ้อนกันสูงถึงระดับเอวเพื่อชดเชยสัดส่วน เขายืนตัวตรง อกผึ่ง ไม้กายสิทธิ์ในมือถือเฉียง 45 องศาอย่างประณีต แววตาคมกริบกวาดมองตรวจตราขึ้นมาตามขั้นบันไดอย่างคาดหวัง
* ตำแหน่งของคุณ: คุณนั่งอยู่ที่อัฒจันทร์แถวที่สอง ปลายเท้าเหยียบบนขั้นไม้ที่ส่งเสียงลั่นเอี๊ยดเบาๆ มือขวากระชับด้ามไม้กายสิทธิ์ที่เริ่มอุ่นขึ้นจากอุณหภูมิฝ่ามือ ปลายไม้อยู่ห่างจากก้านขนห่านเพียงหนึ่งคืบ
* แรงปะทะทางสายตา: ศาสตราจารย์หยุดสายตาลงที่ข้อมือของคุณชั่วครู่ รอยยิ้มพึงพอใจปรากฏที่มุมปากขณะที่เขาพยักหน้าส่งสัญญาณเชิงสั่ง: 
  “โบกนิด สะบัดหน่อย... เริ่มได้!” ขนห่านตรงหน้าคุณกระตุกไหวเล็กน้อย รอรับพลังเวทที่กำลังจะถูกปลดปล่อย"""
        used_model = "canonical-master-baseline"

    latency_ms = int((time.time() - start_time) * 1000)
    return StageCellResponse(
        raw_text=raw_text.strip(),
        latency_ms=latency_ms,
        model=used_model
    )


# =========================================================================
# WORLD LORE DISSECTOR & CABINET ENGINE
# =========================================================================

try:
    from engine.redis_cache import RedisHotCache
except ImportError:
    from redis_cache import RedisHotCache

redis_hot_cache: Optional[RedisHotCache] = None

def get_redis_cache() -> RedisHotCache:
    global redis_hot_cache
    if redis_hot_cache is None:
        redis_hot_cache = RedisHotCache()
    return redis_hot_cache

class LoreCard(BaseModel):
    id: str = Field(..., description="Unique slug ID for the card")
    title: str = Field(..., description="Card title")
    category: str = Field("lore", description="faction | location | rule | lore")
    summary: str = Field("", description="Short 1-sentence summary")
    content: str = Field(..., description="Punchy cohesive lore content (60-120 words)")
    tags: List[str] = Field(default_factory=list, description="Search and trigger tags/synonyms")
    created_at: Optional[int] = Field(None, description="Unix timestamp")

class WorldDissectRequest(BaseModel):
    raw_text: str = Field(..., description="Raw narrative text poured out by creator")
    world_id: Optional[str] = Field("default_world", description="World ID")

class WorldDissectResponse(BaseModel):
    cards: List[LoreCard]
    latency_ms: int
    model: str

class SaveWorldCardsRequest(BaseModel):
    world_id: str = Field("default_world", description="Target World ID")
    cards: List[LoreCard] = Field(..., description="List of validated cards to save to cabinet")

class SaveWorldCardsResponse(BaseModel):
    success: bool
    saved_count: int
    world_id: str

class GetWorldCardsResponse(BaseModel):
    world_id: str
    cards: List[LoreCard]

WORLD_DISSECTOR_SYSTEM_INSTRUCTION = """[ROLE: THE DRAMATURGICAL ARCHIVIST & WORLD DISSECTOR]
คุณคือนักจัดการคลังเรื่องเล่าและสถาปัตยกรรมโลก (Dramaturgical Archivist & World Lore Dissector)
หน้าที่ของคุณคือ: อ่านข้อความดิบของผู้ใช้ (Raw Narrative Scratchpad) แล้ววิเคราะห์ "ชำแหละและสกัดออกมาเป็นชิ้นส่วนการ์ดโลกที่กระชับและจบในตัว (Modular Lore Cards)" จำนวน 2 ถึง 5 การ์ด

กฎเหล็กในการสกัดการ์ด:
1. การ์ดแต่ละใบต้องมีเนื้อหาที่ "กระชับ ชัดเจน มีบริบทครบถ้วนในตัวเอง" (ความยาว 60-120 คำ) ไม่ใช่แค่ประโยคสั้นๆ แต่ต้องเป็นเนื้อความที่เห็นภาพชัด
2. ห้ามแต่งเรื่องเวิ่นเว้อออกนอกกรอบที่ผู้ใช้ไม่ได้ระบุ ให้ดึงแก่นและรายละเอียดจากข้อความของผู้ใช้เป็นหลัก
3. จัดหมวดหมู่ (category) ให้เหมาะสม:
   - "faction" (การแบ่งกลุ่ม/บ้าน/องค์กร/การแข่งขัน)
   - "location" (สถานที่/หอพัก/ตรอก/ห้อง)
   - "rule" (กฎเกณฑ์/ระบบคะแนน/ข้อห้าม/คาถา)
   - "lore" (ประวัติศาสตร์/เงามืด/ปริศนา/ผู้คน)
4. สกัดแท็กคีย์เวิร์ดนำทาง (tags) 4-6 คำต่อการ์ด รวมถึงคำพ้องความหมาย (Synonyms/Aliases) เช่น ["ห้องเรียน", "คะแนน", "แต้ม", "บ้านสิงห์", "บ้านงู"]

ตอบกลับเป็น JSON Array ของการ์ดเท่านั้น ตามโครงสร้างนี้:
[
  {
    "id": "slug_id_ภาษาอังกฤษตัวเล็ก_มีขีดล่าง",
    "title": "ชื่อหัวข้อการ์ดภาษาไทยที่สั้นกระชับและทรงพลัง",
    "category": "faction | location | rule | lore",
    "summary": "สรุปสั้น 1 ประโยคไม่เกิน 20 คำ",
    "content": "เนื้อหาการ์ดที่ร้อยเรียงอย่างคมกริบ 60-120 คำ",
    "tags": ["แท็ก1", "แท็ก2", "แท็ก3", "แท็ก4", "แท็ก5"]
  }
]
ห้ามมีคำนำหน้าหรือ markdown formatting นอกเหนือจาก JSON code block หรือ raw JSON"""

@router.post("/world/dissect", response_model=WorldDissectResponse)
def dissect_world_lore(request: WorldDissectRequest):
    """
    ชำแหละข้อความดิบของผู้สร้าง ออกมาเป็นชุดการ์ดโลกโมดูลาร์ (Modular Lore Cards)
    """
    start_time = time.time()
    raw_text = (request.raw_text or "").strip()
    if not raw_text:
        raise HTTPException(status_code=400, detail="raw_text cannot be empty")

    model_name = os.getenv("ACTOR_MODEL", "gemini-3.8-flash")
    fallback_model = os.getenv("ACTOR_FALLBACK_MODEL", "gemini-2.5-flash")
    project_id = os.getenv("VERTEX_PROJECT", "project-de5847cd-022d-40ca-ad7")
    location = os.getenv("VERTEX_LOCATION", "global")

    cards: List[LoreCard] = []
    used_model = model_name

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(vertexai=True, project=project_id, location=location)

        try:
            response = client.models.generate_content(
                model=model_name,
                contents=raw_text,
                config=types.GenerateContentConfig(
                    system_instruction=WORLD_DISSECTOR_SYSTEM_INSTRUCTION,
                    temperature=0.4,
                    thinking_config=types.ThinkingConfig(thinking_budget=1024),
                    response_mime_type="application/json",
                )
            )
            resp_text = response.text or ""
        except Exception as primary_err:
            logger.warning(f"[DISSECTOR] Primary model {model_name} failed: {primary_err}. Falling back to {fallback_model}")
            response = client.models.generate_content(
                model=fallback_model,
                contents=raw_text,
                config=types.GenerateContentConfig(
                    system_instruction=WORLD_DISSECTOR_SYSTEM_INSTRUCTION,
                    temperature=0.4,
                    thinking_config=types.ThinkingConfig(thinking_budget=1024),
                    response_mime_type="application/json",
                )
            )
            resp_text = response.text or ""
            used_model = fallback_model

        # Parse JSON
        parsed_data = json.loads(resp_text)
        if isinstance(parsed_data, list):
            for item in parsed_data:
                cards.append(LoreCard(
                    id=str(item.get("id") or f"card_{int(time.time()*1000)}"),
                    title=str(item.get("title") or "การ์ดเรื่องราว"),
                    category=str(item.get("category") or "lore"),
                    summary=str(item.get("summary") or ""),
                    content=str(item.get("content") or ""),
                    tags=list(item.get("tags") or []),
                    created_at=int(time.time())
                ))
    except Exception as e:
        logger.error(f"[DISSECTOR] Failed to dissect world lore: {e}")
        # Fallback heuristic dissection
        cards = [
            LoreCard(
                id="card_core_premise",
                title="แก่นเรื่องและกฎเกณฑ์หลัก",
                category="lore",
                summary="ภาพรวมของเรื่องราวที่ผู้กำกับระบุ",
                content=raw_text[:400],
                tags=["แก่นเรื่อง", "กฎเกณฑ์", "เรื่องราว"],
                created_at=int(time.time())
            )
        ]
        used_model = "fallback-heuristic"

    latency_ms = int((time.time() - start_time) * 1000)
    return WorldDissectResponse(
        cards=cards,
        latency_ms=latency_ms,
        model=used_model
    )

@router.post("/world/cards/save", response_model=SaveWorldCardsResponse)
def save_world_cards(request: SaveWorldCardsRequest):
    """
    บันทึกชุดการ์ดที่ผ่านการตรวจรับแล้ว เข้าสู่ตู้ลิ้นชัก Upstash Redis RAM
    """
    cache = get_redis_cache()
    cards_dicts = [card.model_dump() for card in request.cards]
    success = cache.save_world_cards(request.world_id, cards_dicts)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save cards to Redis hot cache")
    return SaveWorldCardsResponse(
        success=True,
        saved_count=len(request.cards),
        world_id=request.world_id
    )

@router.get("/world/{world_id}/cards", response_model=GetWorldCardsResponse)
def get_world_cards(world_id: str):
    """
    ดึงรายการการ์ดทั้งหมดในตู้ลิ้นชักของโลกนี้ จาก Upstash Redis RAM (2-5ms)
    """
    cache = get_redis_cache()
    raw_cards = cache.get_world_cards(world_id)
    cards = []
    for r in raw_cards:
        try:
            cards.append(LoreCard(**r))
        except Exception:
            pass
    return GetWorldCardsResponse(
        world_id=world_id,
        cards=cards
    )

@router.delete("/world/{world_id}/card/{card_id}")
def delete_world_card(world_id: str, card_id: str):
    """
    ลบการ์ดออกจากตู้ลิ้นชัก Upstash Redis RAM
    """
    cache = get_redis_cache()
    success = cache.delete_world_card(world_id, card_id)
    return {"success": success, "deleted_card_id": card_id, "world_id": world_id}


