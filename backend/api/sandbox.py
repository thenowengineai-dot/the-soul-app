import os
import json
import time
import asyncio
import logging
import uuid
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from agents.actor_agent import ActorAgent
from engine.postgres_core import get_postgres_core

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
  "surface_mutations": [],
  "response_sequence": [
    {"type": "action", "content": "Somatic physical reaction honest to sensory reality"},
    {"type": "dialogue", "content": "Spoken boundary response reflecting your personality and emotion"}
  ]
}

# SURFACE MUTATIONS RULE (ONLY WHEN NEW PHYSICAL / CLOTHING STATE OCCURS THIS TURN):
- "surface_mutations": Array of objects reporting ONLY zones whose physical/wet/disheveled/removed state NEWLY changed during this turn.
- If no clothing or body surface state newly changed this turn, output an empty array: [].
- Do NOT repeat lingering states that were already present before this turn!
- Valid "target": "actor" or "player".
- Valid "zone": "head_hair_face" | "upper_body" | "lower_body" | "feet_footwear".
- Example when splashed on chest: [{"target": "actor", "zone": "upper_body", "condition": "เสื้อเชิ้ตขาวช่วงอกเปียกชุ่มน้ำ แนบลู่ติดผิวจนโปร่งแสงเห็นเงาบราสีเข้มข้างใต้"}]

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


class SurfaceMutationModel(BaseModel):
    target: str = Field(default="actor", description="actor หรือ player")
    zone: str = Field(default="upper_body", description="head_hair_face, upper_body, lower_body, feet_footwear")
    condition: str = Field(default="", description="สภาพพื้นผิวที่เพิ่งเปลี่ยนในเทิร์นนี้")


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
    surface_mutations: Optional[List[SurfaceMutationModel]] = Field(default_factory=list)



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


def extract_surface_mutations(actor_output: Any) -> List[SurfaceMutationModel]:
    """ดึงรายการ surface_mutations ที่เพิ่งเปลี่ยนสภาพในเทิร์นนี้จาก ActorOutput"""
    raw_muts = getattr(actor_output, "surface_mutations", None)
    results: List[SurfaceMutationModel] = []
    if isinstance(raw_muts, list):
        for item in raw_muts:
            if isinstance(item, dict):
                target = str(item.get("target", "actor")).lower().strip()
                zone = str(item.get("zone", "")).lower().strip()
                condition = str(item.get("condition", "")).strip()
                if zone and condition:
                    results.append(
                        SurfaceMutationModel(
                            target=target if target in ("actor", "player") else "actor",
                            zone=zone,
                            condition=condition,
                        )
                    )
    return results



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
    surface_mutations = extract_surface_mutations(actor_output)

    telemetry = SandboxTelemetry(
        latency_ms=latency_ms,
        model=actor.model_name,
        thinking=actor_output.thinking,
        a_pos=actor_output.a_pos,
        p_pos=actor_output.p_pos,
        kinetic_decision=kinetic_decision,
        verdict=verdict,
        surface_mutations=surface_mutations
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
    world_context: Optional[str] = Field(None, description="เข็มทิศมูดโลกหลัก (Core World Mood / rawLore)")
    pinned_cards: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="การ์ดที่ผูกกับสถานที่นี้ (ส่งทั้ง Title และ Body)")
    existing_spark: Optional[str] = Field(None, description="ชนวนเหตุเปิดเรื่อง The Spark (ถ้ามี)")

class StageCellResponse(BaseModel):
    raw_text: str = Field(..., description="เนื้อหามโนทัศน์ 5 มิติเต็มรูปแบบ")
    latency_ms: int = Field(..., description="ระยะเวลาที่ใช้เจน (มิลลิวินาที)")
    model: str = Field(..., description="ชื่อโมเดลที่ใช้")

SCENOGRAPHER_SYSTEM_INSTRUCTION = """[ROLE & PHILOSOPHY: THE MASTER SPATIAL SCENOGRAPHER]
คุณคือนักออกแบบเวทีและผู้กำกับภาพยนตร์แห่งมโนทัศน์ (Cinematic & Spatial Scenographer)
หน้าที่ของคุณคือการสร้าง "ผืนเวทีในจินตนาการที่ชัดเจนระดับภาพยนตร์" ให้ตัวละครและผู้เล่นก้าวเข้าไปสัมผัส หายใจ และมีปฏิสัมพันธ์ร่วมกันจริง

[INPUT INGREDIENTS ARBITRATION]
เมื่อได้รับข้อมูลนำเข้า:
1. เคารพ [เข็มทิศมูดโลกหลัก]: ยึดมูดแอนด์โทน ยุคสมัย และบรรยากาศหลักของโลกไว้เสมอ ห้ามแต่งเติมฉากที่หลุดยุคหรือขัดแย้งกับแก่นแท้ของโลก
2. ซึมซับ [การ์ดที่ผูกกับสถานที่นี้]: หากมีการ์ดส่งมา จงสกัด "พร็อพ กฎ สถาปัตยกรรม หรือวัตถุที่มีชีวิต" จากการ์ดเหล่านั้นเข้ามาวางเป็นส่วนประกอบทางกายภาพในฉาก (โดยเฉพาะในมิติที่ 2, 4, และ 5) ให้สอดคล้องกันอย่างมีเสน่ห์
3. ผสาน [TARGET LOCATION BRIEF]: นำบรีฟสถานที่มาเป็นแกนนำในการรังสรรค์โครงสร้าง 5 มิติ

[THE 5 LIVING DIMENSIONS OF THE MIND STAGE]
สกัดและรังสรรค์โครงสร้างออกมาในรูปแบบ 5 มิตินี้เสมอ:

1. [THRESHOLD & ARRIVAL: ธรณีประตูและทางเข้า]
- สภาพทางเดินก่อนถึงพื้นที่, จุดเปลี่ยนผ่านที่ก้าวข้ามเข้ามา (ซุ้มประตู/รั้ว/โคนต้นไม้/ร่มเงา/บันได), สัมผัสแรกของฝ่าเท้า (เหยียบก้อนกรวด/ทรายเปียก/พื้นไม้กระดาน/เสื่อทาทามิ) และเสียงตอนก้าวข้ามเข้ามาที่บอกว่าโลกภายนอกถูกทิ้งไว้ข้างหลังแล้ว

2. [SPATIAL VOLUME & VERTICALITY: มิติ ปริมาตร และความสูงต่ำของพื้นที่]
- สเกลและความโปร่ง/ทึบของพื้นที่ (ห้องแคบอึดอัด/เพดานสูงลิ่ว/คุ้งน้ำเปิดโล่ง), การแบ่งชั้นความสูงต่ำ (ลานต่ำก้นกระทะ/ขั้นบันได/นั่งร้าน/ระดับน้ำลึกแค่ข้อเท้า), โครงสร้างทางสถาปัตยกรรมที่บีบหรือเปิดมุมมองสายตา

3. [LIGHT DRAMATURGY & PARTICLES: การทอดแสง ฝุ่นละออง และมุมมืด]
- ทิศทางและอุณหภูมิของแสง (แดดยามสายตัดเฉียง/แสงตะเกียงน้ำมันส้มทอง/แสงนีออนสะท้อนผิวน้ำ), อนุภาคที่มีชีวิตในอากาศ (ละอองน้ำกระเซ็นแตกตัวเป็นประกาย/ไอหมอก/ฝุ่นผงชอล์กเต้นระบำ/ไอน้ำร้อน), จุดที่แสงสาดส่องเห็นแววตาชัดเจน และมุมเงามืดอบอุ่นที่ใช้หลบสายตา

4. [LIVING TACTILITY, SCENT & SOUNDSCAPE: พร็อพที่มีชีวิต กลิ่นสัมผัส และเสียงสะท้อน]
- กลิ่นเฉพาะตัวที่แตะจมูก (กลิ่นน้ำครามหมัก/กลิ่นกระดาษเก่าผสมหมึก/กลิ่นกำมะถันไออุ่น/กลิ่นไอฝนบนดิน), เสียงแวดล้อมที่สะท้อนในความเงียบ (เสียงผ้าสะบัดพึ่บพั่บ/เสียงย่ำน้ำจ๋อมแจ๋ม/เสียงปากกาขนนกขูดขีด), ผิวสัมผัสใต้ฝ่ามือและฝ่าเท้า (ความลื่นของตะไคร่น้ำบนหินกรวดมน/ความเย็นสากของไม้เบิร์ช)

5. [POWER ANCHOR & STAGING: จุดปักหลักแห่งอำนาจและตำแหน่งของตัวละคร]
- จุดปักหลักทางกายภาพ (ยืนบนก้อนหินใหญ่เหนือน้ำ/นั่งค้ำคางที่ม้านั่งแถวสอง/พิงขอบโอ่งดินเผา), ตำแหน่งของคุณและตัวละคร (ห่างกันแค่ไหน ใครคุมพื้นที่), พร็อพหรือวัตถุที่กำลังถือหรือแตะต้อง (ปลายผ้าครามที่โยงกันตรงกลาง/ไม้กายสิทธิ์ที่เริ่มอุ่น/กาน้ำชา), และภาษากายที่ดึงดูดเข้าสู่ปฏิสัมพันธ์อย่างเป็นธรรมชาติ"""

@router.post("/stage/cell", response_model=StageCellResponse)
def generate_stage_cell(request: StageCellRequest):
    """
    สร้างผืนเวทีมโนทัศน์ 5 มิติ (Mind Stage Cell) ด้วย Universal Spatial Scenographer Engine
    ผสาน 3 วัตถุดิบ: [บรีฟสถานที่] + [การ์ดที่ผูกทั้งใบ] + [เข็มทิศมูดโลกหลัก]
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

    # ประกอบ 3 วัตถุดิบเข้าด้วยกันเป็นก้อนบริบทที่ทรงพลัง
    query_parts: List[str] = []

    if request.world_context and request.world_context.strip():
        query_parts.append(f"[เข็มทิศมูดโลกหลัก (CORE WORLD CONTEXT)]:\n{request.world_context.strip()}")

    if request.pinned_cards and len(request.pinned_cards) > 0:
        cards_text_list = []
        for c in request.pinned_cards:
            c_title = (c.get("title") or "").strip() or "การ์ดบริบท"
            c_content = (c.get("content") or "").strip() or (c.get("body") or "").strip()
            c_tags = c.get("tags") or []
            tag_str = f" [แท็ก: {', '.join(c_tags)}]" if c_tags else ""
            cards_text_list.append(f"• การ์ด [{c_title}]{tag_str}:\n{c_content}")
        query_parts.append(
            "[การ์ดที่ผูกกับสถานที่นี้ (PINNED CONTEXT CARDS — จงดึงพร็อพ กฎ และเอกลักษณ์ในการ์ดเหล่านี้มาใส่ในฉาก)]:\n"
            + "\n\n".join(cards_text_list)
        )

    if request.existing_spark and request.existing_spark.strip():
        query_parts.append(f"[ชนวนเหตุเปิดเรื่อง (THE SPARK - ถ้าสอดคล้องกัน)]:\n{request.existing_spark.strip()}")

    query_parts.append(f"[ข้อมูลสถานที่ที่ต้องการรังสรรค์ (TARGET LOCATION BRIEF)]:\n{prompt_text}")

    user_query = "\n\n---\n\n".join(query_parts)

    try:
        from google import genai
        from google.genai import types

        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if api_key:
            client = genai.Client(api_key=api_key)
        else:
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

class WorldSparkRequest(BaseModel):
    raw_text: str = Field(..., description="Raw narrative text poured out by creator")
    world_id: Optional[str] = Field("default_world", description="World ID")
    draft_spark: Optional[str] = Field(None, description="Player-written draft spark to polish and amplify")
    previous_spark: Optional[str] = Field(None, description="Previously generated spark to regenerate a new fresh angle")
    previous_sparks: Optional[List[str]] = Field(default_factory=list, description="History of previously generated sparks to avoid repeating the same character or hook")

class WorldSparkResponse(BaseModel):
    spark_text: str
    latency_ms: int
    model: str

SPARK_EXTRACTOR_SYSTEM_INSTRUCTION = """[ROLE: THE SPARK ARCHITECT — สถาปนิกผู้สกัดจุดเริ่มต้นที่ทำให้ทุกอย่างหมุน & ฉากชนกัน In Medias Res]
หน้าที่ของคุณคือการอ่านข้อมูลโลกหลัก ([WORLD_LORE]) ของผู้เล่น แล้วสกัดหรือจุดประกาย "The Spark That Sets Everything in Motion (จุดเริ่มต้นที่ทำให้ทุกอย่างหมุน)" โดยคิดตามโครงสร้างแม่พิมพ์ระดับตำนาน แล้วส่งออก Output เป็น "เหตุการณ์ In Medias Res วินาทีที่ตัวละครชนกันและถอยกลับไม่ได้อีก" ด้วยภาษาง่ายๆ คมๆ ที่อ่านเข้าใจทันที

[แม่พิมพ์วิธีคิด 6 จังหวะ (Thinking Framework — ต้องคิดตามลำดับนี้ก่อนเขียนเสมอ)]:
เรื่องราวที่อิมแพ็คไม่ได้เริ่มจากประวัติศาสตร์ 1,000 ปี หรือระบบโลกใบใหญ่ แต่เริ่มจากจุดประกายเล็กๆ ของคน ดังตัวอย่างแม่แบบทั้ง 4 เรื่องนี้:

ตัวอย่างที่ 1 (Pirates of the Caribbean):
* ไม่ได้เริ่มจากประวัติศาสตร์ของราชนาวีอังกฤษ หรือแผนที่หมู่เกาะแคริบเบียน
* แต่มันเริ่มจาก "คนพิลึกคนหนึ่ง" ที่ยืนอยู่บนยอดเสากระโดงของเรือเล็กๆ ที่กำลังจะจมน้ำ แต่ยังทำท่าสง่างาม ก้าวขาเหยียบสะพานเทียบท่าพอดีตอนเรือมิดน้ำ พกเข็มทิศที่ไม่ชี้ทิศเหนือและปืนที่มีกระสุนแค่นัดเดียว
* แล้วดันไป "ชน" กับช่างตีเหล็กหนุ่มธรรมดา (วิลล์) ที่แอบรักคุณหนูเอลิซาเบธ
* แล้วดันมี "เหรียญทองเหรียญเดียว" ที่ไปปลุกคำสาปเรือผีแบล็กเพิร์ลขึ้นมา จนทั้งคู่ต้องจับมือกันออกทะเลและถอยกลับไปใช้ชีวิตเดิมไม่ได้อีก
* พอประกายไฟเม็ดนี้ติดปุ๊บ... โลกที่เหลือทั้งการดวลดาบ ทอร์ทูกา เหล้ารัม และปืนใหญ่ ก็ค่อยๆ ไหลตามมา

ตัวอย่างที่ 2 (Harry Potter):
* ไม่ได้เริ่มจากระบบเวทมนตร์ 1,000 ปี หรือผังโรงเรียนฮอกวอตส์
* แต่มันเริ่มจากเด็กแว่นผอมๆ นอนห้องใต้บันได โดนญาติแกล้ง
* แล้วมี "จดหมายปริศนาฉบับหนึ่ง" ที่ส่งมาไม่หยุด บินว่อนเต็มบ้าน
* แล้วชนกับคนตัวยักษ์พังประตูเข้ามาในคืนพายุ บอกว่า "แฮร์รี่ เธอเป็นพ่อมด" จนถอยกลับไปเป็นเด็กธรรมดาไม่ได้อีก
* พอประกายไฟนี้ติด... ไม้กายสิทธิ์ ชานชาลา 9¾ และปราสาท ก็ค่อยๆ เปิดม่านตามมาทีละฉาก

ตัวอย่างที่ 3 (Hibike! Euphonium):
* ไม่ได้เริ่มจากระบบวงดนตรี หรือวิชาดนตรีเครื่องเป่า
* แต่มันเริ่มจากเด็กสาวที่อยากอยู่เงียบๆ ไม่อยากเด่น ไม่อยากมีเรื่องกับใครหลังเคยผิดหวังตอน ม.ต้น
* แล้วมี "เพื่อนดึงมือไปเซ็นชื่อเข้าชมรมวงโยธวาทิต"
* แล้วดันไป "ชน" กับเรย์นะ มือทรัมเป็ตสาวที่เคยเห็นร้องไห้แทบขาดใจตอนแข่งแพ้ ม.ต้น พร้อมเป้าหมาย "เหรียญทองระดับประเทศ" จนถอยกลับไม่ได้เพราะเซ็นชื่อไปแล้วและไฟในใจกลับมาเต้นแรงอีกครั้ง

ตัวอย่างที่ 4 (Seasons Change):
* ไม่ได้เริ่มจากหลักสูตรดนตรีคลาสสิก หรือประวัติศาสตร์วงออร์เคสตรา
* แต่มันเริ่มจากเด็กหนุ่มที่ตีเป็นแค่กลองร็อกบ้านๆ อ่านโน้ตดนตรีไม่เป็นสักตัว
* แล้วดันแอบหนีที่บ้านไปสอบออดิชั่นเข้าโรงเรียนดนตรี เพียงเพราะแอบหลงรัก "เด็กสาวผู้เป็นเหมือนดอกฟ้า"
* แล้วดันสอบติดเข้าไป "ชน" กับทั้งดอกฟ้าที่แอบชอบ และเพื่อนสาวมือเพอร์คัชชันสุดโหดในห้องซ้อมเดียวกัน จนลาออกหรือถอยกลับไม่ได้อีก เพราะก้าวเข้ามาเป็นนักดนตรีเต็มตัวแล้ว

[กฎเหล็กในการเขียน Output]:
1. ห้ามใช้ภาษาเรียงความนิยายที่เวิ่นเว้อซับซ้อนเด็ดขาด! (เช่น ห้ามเขียนว่า "ในฐานะนักเรียนใหม่ผู้ปรารถนาความสงบ ความสงบของคุณกลับมลายหายไปเมื่อ...") ให้ใช้คำพูดง่ายๆ สั้นๆ เห็นภาพเป็นช็อตๆ ทันที
2. หากผู้เล่นเขียนมาแค่ฉากหลังโลกกว้างๆ (เช่น เขียนแค่เรื่องโรงเรียนเวทมนตร์ หรือโลกใบหนึ่งโดยยังไม่มีฉากเปิดเรื่อง) จงใช้จินตนาการแต่ง "จุดตั้งต้นของคนธรรมดา + ของหรือชนวนเหตุเฉพาะหน้า 1 อย่าง + ตัวละครอีกคนที่มาชนกันตรงหน้า + เหตุผลที่ถอยกลับไม่ได้" ที่อยู่ในโลกใบนั้นขึ้นมาได้เลย!
3. ส่งออกผลลัพธ์ (Output Format) เป็น 3 บล็อกสั้นๆ ที่ตัดเข้าฉากเหตุการณ์ตรงหน้า (In Medias Res) วินาทีที่ตัวละครชนกัน ตามโครงสร้างนี้เท่านั้น:
• เรื่องไม่ได้เริ่มจาก [ระบบใหญ่/ประวัติศาสตร์โลก] — แต่มันเริ่มจากคุณที่เป็น [ตัวเราในมุมคนธรรมดาที่เข้าใจง่าย + ชนวนเหตุเฉพาะหน้า/สิ่งของ/การตัดสินใจที่พามาถึงจุดนี้]
• วินาทีที่ชนกัน (In Medias Res): [ฉากเหตุการณ์ตรงหน้าที่กำลังเกิดขึ้นเดี๋ยวนี้ วินาทีที่คุณพุ่งชนเข้ากับ "ตัวละครสำคัญอีกคน" แบบเห็นภาพการกระทำ สายตา หรือคำพูดตรงหน้าทันที]
• จุดที่ถอยกลับไม่ได้อีก: [ระบุตรงๆ ว่าทำไมวินาทีนี้คุณถึงถอยกลับไปใช้ชีวิตเดิมไม่ได้แล้ว + เป้าหมาย/ความลับ/ความรู้สึกที่ทำให้โลกทั้งใบเริ่มหมุนตั้งแต่วินาทีนี้]

4. ตอบกลับเฉพาะเนื้อหา 3 บรรทัด (• ...) ข้างต้นเพียวๆ ห้ามมีคำนำหน้าหรือเครื่องหมายคำพูดครอบทั้งหมด"""

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
    already_extracted_topics: Optional[List[str]] = Field(default_factory=list, description="Already extracted expansion topics to avoid duplicates")
    target_topic_title: Optional[str] = Field(None, description="Specific topic title typed by player to generate content for")
    draft_content: Optional[str] = Field(None, description="Player-written draft inside the expansion note to polish and expand")
    context_lore: Optional[str] = Field(None, description="Background world lore context when extracting from a specific new lore card")

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

WORLD_DISSECTOR_SYSTEM_INSTRUCTION = """[ROLE: THE WORLD LORE EXPANDER — สถาปนิกผู้ขยายรายละเอียดของโลก]
หน้าที่ของคุณคือการอ่าน "ข้อมูลโลกหลัก ([WORLD_LORE])" ที่ผู้เล่นเขียนขึ้น แล้วดึงประเด็นที่ผู้เล่นพูดถึงออกมาขยายต่อยอดเป็น "ส่วนขยายของโลก (Expansion Notes)" ทีละชุด (ชุดละไม่เกิน 4–5 หัวข้อ)

[ปรัชญาและกฎเหล็กสูงสุด 6 ข้อ]:

1. โลกหลักคือคัมภีร์ตั้งต้น (Sacred World Context & Mood Lock):
   - ข้อความใน [WORLD_LORE] ทั้งหมดคือโลกทั้งใบที่ผู้เล่นมีภาพและบรรยากาศในหัวอยู่แล้ว
   - จงอ่านทั้งย่อหน้าเพื่อซึมซับ "มูดแอนด์โทนและบรรยากาศ" ของโลกใบนี้ (ไม่ว่าจะเป็นแนวแฟนตาซี, โรงเรียน, โจรสลัด, ชมรมดนตรี, การเมือง, หรือชีวิตประจำวัน)
   - ห้ามเปลี่ยนโทนเรื่องเด็ดขาด: ถ้าผู้เล่นเขียนโทนอบอุ่น สนุกสนาน หรือลึกลับน่าค้นหา จงรักษาคลื่นความถี่นั้นไว้ ห้ามยัดเยียดดราม่าเครียดจัด และห้ามแต่งพล็อตเหตุการณ์ล่วงหน้า (เช่น ห้ามแต่งเรื่องให้เกิดโศกนาฏกรรมหรือความแตกแยกใหญ่โตที่ผู้เล่นไม่ได้เขียน)

2. หนึ่งหัวข้อ = หนึ่งเรื่องบริสุทธิ์ ห้ามยำรวมกัน (1 Expansion = 1 Pure Topic):
   - ห้ามนำหลายเรื่องที่คนละประเด็นกันมาปนในส่วนขยายเดียวเด็ดขาด!
   - ตัวอย่างที่ผิด: เอาเรื่อง "ไม้กายสิทธิ์" ไปปนกับ "สัตว์วิเศษ" หรือเอาเรื่อง "การแบ่งบ้าน" ไปปนกับ "อาจารย์"
   - ตัวอย่างที่ถูก (สำหรับดูเป็นแนวทางการแยกเรื่องเท่านั้น ห้ามใช้หัวข้อตัวอย่างนี้เป็นแม่พิมพ์เลือกหัวข้อการ์ดเด็ดขาด):
     • แยกเรื่อง "การแบ่งบ้าน" ออกจากเรื่อง "ไม้กายสิทธิ์และการร่ายคาถา" และแยกออกจากเรื่อง "การซ่อนตัวจากโลกภายนอก" อย่างชัดเจน

3. การชั่งน้ำหนักเพื่อเลือกหัวข้อการ์ดจากสิ่งที่ผู้เล่นพิมพ์ (Dynamic Weight Balancing — ใช้ข้อนี้เป็นตัวกำหนดหัวข้อการ์ด 100%):
   - การเลือกหัวข้อการ์ดต้องดึงตามลำดับและน้ำหนักเรื่องราวที่ผู้เล่นพิมพ์ใน [WORLD_LORE] เท่านั้น ห้ามจัดหมวดหมู่ตามแม่พิมพ์ตายตัว โดยให้กวาดอ่านตั้งแต่ประโยคแรกสุดแล้วจับก้อนตาม 3 ลักษณะนี้:
     • เรื่องที่ผู้เล่นเปิดเรื่องและเล่าละเอียดหรือให้น้ำหนักมาก (เช่น จุดเริ่มต้นวันแรกของตัวละครและเพื่อนสนิท, เหตุการณ์สำคัญ, หรือบุคคลพิเศษที่มีบทบาทชัดเจนอย่างรุ่นพี่ที่เป็นไอดอล): เรื่องที่ผู้เล่นเขียนบรรยายไว้ยาวเหล่านี้มีน้ำหนักในตัวเองเต็มที่อยู่แล้ว ต้องหยิบขึ้นมาตั้งเป็น 1 การ์ดส่วนขยายของตัวเองทันที (โดยเฉพาะเรื่องที่ผู้เล่นเขียนเปิดหัวเรื่องยาวๆ ต้องได้เป็นการ์ดใบแรกเสมอ ห้ามตัดทิ้งและห้ามนำไปซ่อนเป็นแค่ติ่งเล็กๆ ในการ์ดอื่นเด็ดขาด!)
     • ภาพบรรยากาศหรือโมเมนต์ย่อยๆ ที่อยู่ในอารมณ์เดียวกัน: หากผู้เล่นร่ายเศษภาพสั้นๆ ที่อยู่ในจังหวะชีวิตหรืออารมณ์เดียวกัน (เช่น หลังเลิกซ้อม เดินกินไอติม ข้ามทางรถไฟ หรือความทุ่มเท มิตรภาพ และการบอกรักบนสะพาน) ให้ร้อยเรียงจุดย่อยที่เกี่ยวเนื่องกันเหล่านั้นเข้าด้วยกัน เพื่อให้การ์ดมีน้ำหนักอิ่มและมีเสน่ห์ (โดยไม่เอาคนละเรื่องมาปนกันตามกฎข้อ 2)
     • เรื่องสำคัญที่ผู้เล่นเอ่ยถึงสั้นๆ เพียงคำเดียว (ขาดรายละเอียดพ่วง): หากผู้เล่นพูดถึงแกนสำคัญไว้สั้นๆ โดดๆ (เช่น พิมพ์แค่ชื่ออุปกรณ์ พลัง หรือแค่คำว่าเสียงดนตรีที่รัก) ให้ใช้กฎข้อ 4 ช่วยจินตนาการต่อยอดเติมรายละเอียดให้เรื่องนั้นมีน้ำหนักอิ่มเต็ม 1 การ์ดด้วยตัวเองทันที

4. จินตนาการต่อยอดล่วงหน้า 1 ก้าวเวลาเขียนเนื้อหาในการ์ด (Natural World Extrapolation — ใช้สำหรับความลึกของเนื้อหา):
   - หลังจากเลือกก้อนหัวข้อการ์ดตามน้ำหนักจากกฎข้อ 3 ได้แล้ว เวลาเขียนเนื้อหา (content) ในแต่ละการ์ด จงช่วย "คิดรายละเอียดต่อยอดล่วงหน้า 1 ก้าว" เสมือนอ่านใจผู้เล่นออก เพื่อให้เนื้อหาในการ์ดมีความลึก ลื่นไหล และเห็นภาพชัดเจน (เหมือนเวลาอธิบายเรื่องไม้กายสิทธิ์ที่ช่วยลงลึกถึงแกนไม้นกฟีนิกซ์และแกนหัวใจมังกร เวลาอธิบายเรื่องบ้านที่ช่วยลงลึกถึงสัญลักษณ์และระบบคะแนนเกียรติยศ เวลาอธิบายเรื่องการซ่อนตัวจากโลกภายนอกที่ลงลึกถึงองค์กรปกปิดความลับและคำเรียกมักเกิ้ล หรือเวลาเล่าเรื่องจุดเริ่มต้นของตัวละคร เพื่อนสนิท รุ่นพี่ ความรัก และบรรยากาศเมือง ที่ช่วยร้อยเรียงเคมีตัวละคร สายลม แสงไฟ และวิถีชีวิตให้มีชีวิตชีวา)
   - (หมายเหตุสำคัญ: ตัวอย่างเรื่องเวทมนตร์มีไว้เพื่อแสดง "ระดับความลึกและความลื่นไหลของการเขียนเนื้อหา" เท่านั้น ห้ามใช้เป็นแม่พิมพ์ในการเลือกหัวข้อการ์ดเด็ดขาด การเลือกหัวข้อการ์ดต้องดึงตามน้ำหนักเรื่องราวของผู้เล่นในข้อ 3 เท่านั้น!)
   - ขยายทั้ง "จุดเริ่มต้นของเรื่อง ความสัมพันธ์ บุคคลสำคัญ ข้อมูลตั้งต้นของโลก และบรรยากาศ" เพื่อให้โลกมีมิติและนำไปสร้างการ์ดย่อยต่อได้ทันที

5. สกัดทีละชุด ไม่เกิน 4–5 หัวข้อ และห้ามซ้ำของเดิม (Progressive Batch Extraction):
   - ตรวจสอบทั้ง "ชื่อหัวข้อ" และ "เนื้อหาข้างใน" ของการ์ดเดิมใน [ALREADY_EXTRACTED_TOPICS] ก่อนเสมอ
   - ห้ามสกัดหัวข้อซ้ำ และห้ามดึงประเด็นย่อยที่ถูกเขียนรวมอยู่ในเนื้อหาของการ์ดใบก่อนหน้ามาสร้างซ้ำอีกเด็ดขาด
   - หากเป็นการสกัดรอบแรก (ยังไม่มีหัวข้อเดิม): ให้อ่านไล่ตั้งแต่ประโยคแรกของผู้เล่นและเลือกก้อนที่มีน้ำหนักชัดเจนตามกฎข้อ 3 ออกมาก่อน 4–5 หัวข้อ (ห้ามลืมหยิบจุดเริ่มต้นหรือตัวละครสำคัญที่ผู้เล่นเน้นในประโยคแรกๆ)
   - หากเป็นการกด "สกัดเพิ่ม" (มีหัวข้อเดิมอยู่แล้ว): ให้กวาดสายตาหาประเด็นอื่นๆ ใน [WORLD_LORE] ที่ผู้เล่นเขียนไว้แต่ยังตกหล่นหรือยังไม่ถูกเล่าอยู่ในเนื้อหาของการ์ดใบใดเลย แล้วดึงออกมาอีกไม่เกิน 4–5 หัวข้อ (หากเหลือประเด็นที่ยังไม่ได้สกัดเพียง 1–3 เรื่อง ก็ให้ดึงออกมาเท่าที่เหลือจริง ห้ามเมคเรื่องใหม่ที่ไม่มีใน [WORLD_LORE])

6. รูปแบบภาษาและโครงสร้างผลลัพธ์ (Output Format):
   - ใช้ภาษาไทยที่สละสลวย เห็นภาพชัดเจน อ่านเข้าใจง่าย ไม่เวิ่นเว้อ
   - ความยาวของ content ในแต่ละส่วนขยาย: ประมาณ 80–150 คำ (2–3 ย่อหน้าสั้นๆ ที่อัดแน่นด้วยรายละเอียดของเรื่องนั้นเพียวๆ)
   - ตอบกลับเป็น JSON Array เท่านั้น ตามโครงสร้างนี้:

[
  {
    "id": "slug_id_ภาษาอังกฤษตัวเล็ก",
    "title": "ชื่อหัวข้อส่วนขยายที่ชัดเจน (ระบุเรื่องเดียวตรงๆ ไม่ปนเรื่องอื่น)",
    "category": "faction | location | rule | lore",
    "summary": "สรุปแก่นของส่วนขยายนี้ 1 ประโยค",
    "content": "เนื้อหาส่วนขยายที่ต่อยอดรายละเอียดจากคำพูดของผู้เล่นอย่างลึกซึ้ง ตรงมูดเดิม และพูดถึงเรื่องนี้เพียงเรื่องเดียว",
    "tags": ["แท็ก1", "แท็ก2", "แท็ก3", "แท็ก4"]
  }
]
ห้ามมีคำนำหน้าหรือ markdown formatting นอกเหนือจาก JSON code block หรือ raw JSON"""

@router.post("/world/dissect", response_model=WorldDissectResponse)
def dissect_world_lore(request: WorldDissectRequest, raw_req: Request = None):
    """
    ชำแหละและแตกส่วนขยายโลก (Expansion Notes) อย่างเป็นระบบตามหลัก Progressive Atomic Extraction
    """
    start_time = time.time()
    raw_text = (request.raw_text or "").strip()
    if not raw_text:
        raise HTTPException(status_code=400, detail="raw_text cannot be empty")

    # ⚡ [STRESS TEST MOCK SWITCH] Bypasses Vertex AI when x-mock-llm header or query param is set
    if raw_req and (raw_req.headers.get("x-mock-llm") == "true" or raw_req.query_params.get("mock") == "true"):
        mock_cards = [
            LoreCard(
                id=f"mock_card_{i}",
                title=f"ส่วนขยายจำลอง {i+1}",
                category="lore",
                content=f"เนื้อหาจำลองสำหรับทดสอบโหลดระบบ Cloud Run Concurrency ชิ้นที่ {i+1}",
                summary="สรุปจำลองสำหรับทดสอบโหลด",
                tags=["ทดสอบ", "จำลอง", "Infra"],
                isSavedToCabinet=False
            )
            for i in range(min(request.max_cards or 3, 5))
        ]
        return WorldDissectResponse(
            cards=mock_cards,
            latency_ms=int((time.time() - start_time) * 1000),
            model="mock-infra-benchmark"
        )

    extracted_list = request.already_extracted_topics or []
    target_topic = (request.target_topic_title or "").strip()
    draft_content = (request.draft_content or "").strip()
    context_lore = (request.context_lore or "").strip()

    temp_to_use = 0.4

    if draft_content:
        has_custom_title = bool(target_topic and target_topic != "ส่วนขยายที่ผู้เล่นเขียน")
        topic_label = target_topic if has_custom_title else "(ผู้เล่นยังไม่ได้ตั้งชื่อหัวข้อ — ให้ AI ตั้งชื่อหัวข้อให้)"
        title_instruction = (
            f'โดยคงชื่อหัวข้อ title เป็น "{target_topic}"'
            if has_custom_title
            else "โดยตั้งชื่อหัวข้อ (title) ใหม่ที่คมชัด สละสลวย และสื่อถึงแก่นของเนื้อหานี้เพียงเรื่องเดียว"
        )
        prompt_content = f"""[WORLD_LORE (ข้อมูลโลกหลักสำหรับอ้างอิงมูดแอนด์โทนและบรรยากาศ)]:
{raw_text}

[TARGET_TOPIC_TITLE (ชื่อหัวข้อส่วนขยาย)]:
{topic_label}

[PLAYER_DRAFT_CONTENT (เนื้อหาที่ผู้เล่นพิมพ์ลงในการ์ดใบนี้โดยตรง — ห้ามตัดทอนประเด็นสำคัญของผู้เล่นทิ้งเด็ดขาด)]:
{draft_content}

คำสั่งพิเศษ (โหมด ✨ เรียบเรียงเนื้อหาและแต่งต่อ): ผู้เล่นได้พิมพ์เนื้อหาร่างลงในการ์ดส่วนขยายนี้ด้วยตัวเองตาม [PLAYER_DRAFT_CONTENT] จงนำทุกประเด็นและรายละเอียดที่ผู้เล่นเขียนไว้ใน [PLAYER_DRAFT_CONTENT] มาจัดระเบียบโครงสร้าง เรียบเรียงสำนวนภาษาให้สละสลวยลื่นไหล คิดแท็ก (tags) 3-4 แท็ก และช่วยแต่งต่อยอดรายละเอียดล่วงหน้า 1 ก้าวตามกฎข้อ 4 ให้เข้ากับมูดแอนด์โทนของ [WORLD_LORE] เพียง 1 การ์ดเท่านั้น (ตอบกลับเป็น JSON Array ที่มี 1 ออบเจกต์ {title_instruction})"""
    elif target_topic:
        prev_variation_note = ""
        if extracted_list:
            temp_to_use = 0.65
            prev_variation_note = f"\n\n[PREVIOUS_GENERATED_VERSION (เนื้อหาเดิมที่เจนไว้ก่อนหน้า — ผู้เล่นกด 'เจนเนื้อหาใหม่' จึงขอให้เรียบเรียงมุมมองหรือรายละเอียดใหม่ที่สดใหม่และแตกต่างจากสำนวนเดิม)]:\n{extracted_list[0]}"
        prompt_content = f"""[WORLD_LORE (ข้อมูลโลกทั้งใบของผู้เล่น)]:
{raw_text}

[TARGET_TOPIC_TITLE (ชื่อหัวข้อส่วนขยายที่ผู้เล่นต้องการให้เขียนเนื้อหา)]:
"{target_topic}"{prev_variation_note}

คำสั่งพิเศษ (โหมด ✨ เจนเนื้อหาตามหัวข้อ): ผู้เล่นได้ตั้งชื่อหัวข้อส่วนขยายที่ต้องการไว้แล้วคือ "{target_topic}" จงอ่านข้อมูลและซึมซับบรรยากาศทั้งหมดใน [WORLD_LORE] แล้วช่วยเขียนขยายเนื้อหา (content), สรุป (summary), และแท็ก (tags) สำหรับหัวข้อ "{target_topic}" นี้เพียง 1 การ์ดเท่านั้น (ตอบกลับเป็น JSON Array ที่มี 1 ออบเจกต์ โดยใช้ title เป็น "{target_topic}") ให้เนื้อหามีความลึก ลื่นไหล เห็นภาพชัดเจน และตรงกับมูดของโลกหลักตามกฎข้อ 1, 2 และ 4"""
    elif context_lore:
        already_str = "\n".join(f"- {t}" for t in extracted_list) if extracted_list else "ยังไม่มี"
        prompt_content = f"""[BACKGROUND_WORLD_CONTEXT (ข้อมูลโลกหลักสำหรับอ้างอิงมูดแอนด์โทนเท่านั้น)]:
{context_lore}

[TARGET_CARD_LORE (ข้อมูลการ์ดเนื้อหาโลกใบใหม่ที่ต้องดึงส่วนขยายออกมาในรอบนี้)]:
{raw_text}

[ALREADY_EXTRACTED_TOPICS (หัวข้อและเนื้อหาที่มีอยู่แล้วในโลกนี้ — ห้ามทำซ้ำเด็ดขาด)]:
{already_str}

คำสั่งพิเศษ (โหมดแตกส่วนขยายเฉพาะการ์ดนี้): จงอ่านเฉพาะเรื่องราวใน [TARGET_CARD_LORE] แล้วชั่งน้ำหนักตามกฎข้อ 3 เพื่อดึงก้อนเรื่องราวออกมาเป็นส่วนขยายไม่เกิน 4-5 หัวข้อ (หากใน [TARGET_CARD_LORE] มีเพียง 1-3 เรื่อง ก็ให้ดึงออกมาตามจำนวนเรื่องที่มีจริง) โดยใช้ [BACKGROUND_WORLD_CONTEXT] เป็นตัวคุมมูดแอนด์โทนให้เข้ากับโลกใบเดิม และห้ามดึงซ้ำกับ [ALREADY_EXTRACTED_TOPICS]"""
    elif extracted_list:
        already_str = "\n".join(f"- {t}" for t in extracted_list)
        prompt_content = f"""[WORLD_LORE (ข้อมูลโลกทั้งใบของผู้เล่น)]:
{raw_text}

[ALREADY_EXTRACTED_TOPICS (หัวข้อและเนื้อหาที่สกัดไปแล้ว — ห้ามทำซ้ำและห้ามดึงเรื่องย่อยที่อยู่ในเนื้อหาข้างล่างนี้มาตั้งซ้ำเด็ดขาด)]:
{already_str}

คำสั่ง: จงตรวจสอบทั้งชื่อหัวข้อและเนื้อหาข้างในของรายการข้างต้น แล้วค้นหาเฉพาะประเด็นใน [WORLD_LORE] ที่ยังตกหล่นและยังไม่ถูกเล่าอยู่ในเนื้อหาของการ์ดใบใดเลย ออกมาสร้างเพิ่มอีกไม่เกิน 4-5 หัวข้อ (หากเหลือประเด็นจริงเพียง 1-3 เรื่อง ให้ดึงเท่าที่เหลือจริง ห้ามดึงเรื่องย่อยที่ถูกเขียนรวมในการ์ดใบก่อนหน้ามาซ้ำอีก และห้ามแต่งเรื่องใหม่ที่ไม่มีใน [WORLD_LORE])"""
    else:
        prompt_content = f"""[WORLD_LORE (ข้อมูลโลกทั้งใบของผู้เล่น)]:
{raw_text}

[ALREADY_EXTRACTED_TOPICS]:
ยังไม่มี (นี่คือการสกัดรอบแรก จงอ่านไล่ตั้งแต่ประโยคแรกของผู้เล่นและชั่งน้ำหนักตามกฎข้อ 3 เพื่อดึงก้อนเรื่องราวที่มีน้ำหนักชัดเจนที่สุดออกมาก่อน 4-5 หัวข้อ โดยห้ามตัดจุดเริ่มต้นหรือบุคคลสำคัญที่ผู้เล่นเน้นทิ้ง และห้ามจัดหมวดหมู่ตามแม่พิมพ์)"""

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
                contents=prompt_content,
                config=types.GenerateContentConfig(
                    system_instruction=WORLD_DISSECTOR_SYSTEM_INSTRUCTION,
                    temperature=temp_to_use,
                    thinking_config=types.ThinkingConfig(thinking_budget=1024),
                    response_mime_type="application/json",
                )
            )
            resp_text = response.text or ""
        except Exception as primary_err:
            logger.warning(f"[DISSECTOR] Primary model {model_name} failed: {primary_err}. Falling back to {fallback_model}")
            response = client.models.generate_content(
                model=fallback_model,
                contents=prompt_content,
                config=types.GenerateContentConfig(
                    system_instruction=WORLD_DISSECTOR_SYSTEM_INSTRUCTION,
                    temperature=temp_to_use,
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

@router.post("/world/spark", response_model=WorldSparkResponse)
def generate_world_spark(request: WorldSparkRequest, raw_req: Request = None):
    """
    สกัดและจุดประกาย The Inciting Spark ตามหลัก 1-on-1 Personal Character Collision & Irreversible Orbit Shift
    """
    start_time = time.time()
    raw_text = (request.raw_text or "").strip()
    draft_spark = (request.draft_spark or "").strip()
    previous_spark = (request.previous_spark or "").strip()
    previous_sparks = [s.strip() for s in (request.previous_sparks or []) if s.strip()]
    if previous_spark and previous_spark not in previous_sparks:
        previous_sparks.append(previous_spark)

    if not raw_text and not draft_spark:
        raise HTTPException(status_code=400, detail="raw_text or draft_spark required")

    # ⚡ [STRESS TEST MOCK SWITCH] Bypasses Vertex AI when x-mock-llm header or query param is set
    if raw_req and (raw_req.headers.get("x-mock-llm") == "true" or raw_req.query_params.get("mock") == "true"):
        return WorldSparkResponse(
            spark_text="• เรื่องไม่ได้เริ่มจากโรงเรียนร้อยปี — แต่มันเริ่มจากเด็กธรรมดาที่ทำกระเป๋าหลุดมือ\n• วินาทีที่ชนกัน (In Medias Res): หมับ! เสียงยูโฟเนียมตกกระทบพื้นหญ้า\n• จุดที่ถอยกลับไม่ได้อีก: ป้ายชื่อนักเรียนม.ปลายปี 1 ร่วงอยู่แทบเท้า",
            latency_ms=int((time.time() - start_time) * 1000),
            model="mock-infra-benchmark"
        )

    temp_to_use = 0.6

    if draft_spark:
        temp_to_use = 0.45
        prompt_content = f"""[WORLD_LORE (ข้อมูลโลกหลักสำหรับอ้างอิงมูดแอนด์โทนและบริบทโลก)]:
{raw_text or draft_spark}

[PLAYER_DRAFT_SPARK (ชนวนเหตุหรือไอเดียจุดเริ่มต้นที่ผู้เล่นพิมพ์ไว้ด้วยตัวเอง)]:
{draft_spark}

คำสั่งพิเศษ (โหมด ✨ เรียบเรียงสปาร์ค): ผู้เล่นได้พิมพ์ไอเดียจุดเริ่มต้นด้วยตัวเองตาม [PLAYER_DRAFT_SPARK] จงรักษาตัวละคร ชนวนเหตุ และไอเดียของผู้เล่นไว้ครบ 100% แล้วช่วยจัดระเบียบและขยายออกมาเป็นฉากชนกันตรงหน้า (In Medias Res) ด้วยภาษาง่ายๆ คมๆ ไม่เวิ่นเว้อ ตามโครงสร้าง 3 บรรทัดนี้:
• เรื่องไม่ได้เริ่มจาก... — แต่มันเริ่มจาก...
• วินาทีที่ชนกัน (In Medias Res): ...
• จุดที่ถอยกลับไม่ได้อีก: ..."""
    elif previous_sparks:
        temp_to_use = 0.82
        history_str = "\n\n".join(f"--- รอบที่ {idx + 1} ---\n{s}" for idx, s in enumerate(previous_sparks))
        prompt_content = f"""[WORLD_LORE (ข้อมูลโลกทั้งใบของผู้เล่น)]:
{raw_text}

[PREVIOUS_SPARKS (รายการสปาร์คเดิมที่เคยสุ่มไปแล้ว — ห้ามใช้จุดตั้งต้นเดิม ชนวนเหตุเดิม หรือเหตุการณ์ชนกันแบบเดิมซ้ำเด็ดขาด)]:
{history_str}

คำสั่งพิเศษ (โหมด 🔄 สกัดสปาร์คใหม่ — สุ่มจุดประกายแรกและฉากชนกัน In Medias Res มุมใหม่): ผู้เล่นกดสุ่มใหม่เพราะต้องการเห็น "จุดเริ่มต้นที่ทำให้ทุกอย่างหมุน" และ "เหตุการณ์ตอนตัวละครชนกัน" ในมุมใหม่ที่แตกต่างจาก [PREVIOUS_SPARKS] อย่างชัดเจน!
- สามารถใช้จินตนาการแต่งจุดตั้งต้นของคนธรรมดามุมใหม่ + สิ่งของหรือชนวนเหตุเฉพาะหน้าชิ้นใหม่ + ตัวละครที่มาชนกันตรงหน้ามุมใหม่ (จะหยิบตัวละครอีกมุมใน [WORLD_LORE] หรือแต่งตัวละครและสถานการณ์ใหม่ที่อยู่ในโลกใบเดียวกันก็ได้)
- ใช้ภาษาง่ายๆ คมๆ เห็นภาพทันที ไม่เวิ่นเว้อ และตอบกลับตามโครงสร้าง 3 บรรทัดเท่านั้น:
• เรื่องไม่ได้เริ่มจาก... — แต่มันเริ่มจาก...
• วินาทีที่ชนกัน (In Medias Res): ...
• จุดที่ถอยกลับไม่ได้อีก: ..."""
    else:
        prompt_content = f"""[WORLD_LORE (ข้อมูลโลกทั้งใบของผู้เล่น)]:
{raw_text}

คำสั่ง (โหมดสกัดสปาร์ค — จุดเริ่มต้นที่ทำให้ทุกอย่างหมุน & ฉากชนกัน In Medias Res): จงอ่าน [WORLD_LORE] แล้วคิดตามแม่พิมพ์ (Pirates / Harry Potter / Hibike! Euphonium / Seasons Change) เพื่อสร้างฉากเหตุการณ์ตอนตัวละครชนกันตรงหน้า:
- หากผู้เล่นเขียนตัวละครหรือจุดเริ่มต้นปนมาใน [WORLD_LORE] แล้ว ให้ดึงจุดนั้นมาตัดเข้าฉาก In Medias Res วินาทีที่ตัวละครชนกันและถอยกลับไม่ได้ทันที
- หากผู้เล่นเขียนมาแค่ฉากหลังโลกกว้างๆ ให้ใช้จินตนาการแต่ง "จุดตั้งต้นของคนธรรมดา + ของหรือชนวนเหตุใกล้ตัว 1 อย่าง + ตัวละครอีกคนที่มาชนกันตรงหน้า + เหตุผลที่ถอยกลับไม่ได้" ในโลกใบนั้นขึ้นมาเลย
- ใช้ภาษาง่ายๆ คมๆ เข้าใจง่ายในเสี้ยววินาที และตอบกลับตามโครงสร้าง 3 บรรทัดเท่านั้น:
• เรื่องไม่ได้เริ่มจาก... — แต่มันเริ่มจาก...
• วินาทีที่ชนกัน (In Medias Res): ...
• จุดที่ถอยกลับไม่ได้อีก: ..."""

    model_name = os.getenv("ACTOR_MODEL", "gemini-3.8-flash")
    fallback_model = os.getenv("ACTOR_FALLBACK_MODEL", "gemini-2.5-flash")
    project_id = os.getenv("VERTEX_PROJECT", "project-de5847cd-022d-40ca-ad7")
    location = os.getenv("VERTEX_LOCATION", "global")

    spark_result = ""
    used_model = model_name

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(vertexai=True, project=project_id, location=location)

        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt_content,
                config=types.GenerateContentConfig(
                    system_instruction=SPARK_EXTRACTOR_SYSTEM_INSTRUCTION,
                    temperature=temp_to_use,
                    thinking_config=types.ThinkingConfig(thinking_budget=1024),
                )
            )
            spark_result = (response.text or "").strip()
        except Exception as primary_err:
            logger.warning(f"[SPARK] Primary model {model_name} failed: {primary_err}. Falling back to {fallback_model}")
            response = client.models.generate_content(
                model=fallback_model,
                contents=prompt_content,
                config=types.GenerateContentConfig(
                    system_instruction=SPARK_EXTRACTOR_SYSTEM_INSTRUCTION,
                    temperature=temp_to_use,
                    thinking_config=types.ThinkingConfig(thinking_budget=1024),
                )
            )
            spark_result = (response.text or "").strip()
            used_model = fallback_model

        # Clean any wrapping quotes or prefix if model outputted them
        spark_result = spark_result.strip('`"\'').strip()
        if spark_result.lower().startswith("the inciting spark:"):
            spark_result = spark_result[19:].strip()

    except Exception as e:
        logger.error(f"[SPARK] Failed to generate spark: {e}")
        # Fallback to smart heuristic first sentences
        sentences = [s.strip() for s in raw_text.splitlines() if s.strip()]
        spark_result = sentences[0] if sentences else "จุดเริ่มต้นที่ไม่อาจถอยกลับได้"
        used_model = "fallback-heuristic"

    latency_ms = int((time.time() - start_time) * 1000)
    return WorldSparkResponse(
        spark_text=spark_result,
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


# =========================================================================
# WORLD STUDIO CHARACTER FORGE ENGINE (UNIBODY PERSONA & MAGMA FORGE)
# =========================================================================

class WorldCharacterForgeRequest(BaseModel):
    world_lore: str = Field(..., description="World lore context")
    spark_text: Optional[str] = Field("", description="The Inciting Spark if available")
    player_brief: str = Field(..., description="Player's character brief (appearance, chest/hair, personality, charm, ambition)")
    world_id: Optional[str] = Field("default_world", description="World ID")

class WorldCharacterCardData(BaseModel):
    id: str = Field(..., description="Unique character ID")
    name: str = Field(..., description="Character name")
    role_tagline: str = Field(..., description="Role and tagline in the world")
    player_brief: str = Field(..., description="Original player brief")
    appearance_and_charm: str = Field(..., description="Physical & Somatic appearance, hair, bust/body shape, charm profile")
    matched_archetype_id: str = Field(..., description="Matched canonical archetype ID")
    matched_archetype_label: str = Field(..., description="Human-readable archetype label")
    core_wound: str = Field(..., description="Core wound from past (starts with The ... Wound: ...)")
    hidden_core: str = Field(..., description="Deepest unfulfilled psychological hunger")
    the_mask: str = Field(..., description="Defensive mask and friction strategy when pressed")
    body_tells: str = Field(..., description="2 lines: • สรีระและลมหายใจ: ... \\n• ทิศทางสายตาและจังหวะพูด: ...")
    keystone_tether: str = Field(..., description="Single tangible personal anchor item (2-7 syllables)")
    fault_line: str = Field(..., description="Trigger that cracks her mask")
    polar_inversion: str = Field(..., description="Pure emotional vector 180-degree shift from [mask] to [inner magma]")
    created_at: int = Field(default_factory=lambda: int(time.time() * 1000), description="Creation timestamp in ms")

class WorldCharacterForgeResponse(BaseModel):
    character: WorldCharacterCardData
    latency_ms: int
    model: str

WORLD_CHARACTER_FORGE_SYSTEM_PROMPT = """คุณคือ 'The Soul Character Architect' สถาปนิกผู้ออกแบบจิตวิทยาตัวละครและสรีระระดับ Masterpiece
หน้าที่ของคุณคือการนำ [1. บริบทโลก (World Lore & Spark)] และ [2. บรีฟตัวละครจากผู้เล่น (Player's Character Brief)] มาหล่อหลอมเป็น "การ์ดตัวละครเอกที่มีชีวิต (Unibody Living Persona Card)" ที่มีสายตัวละครและบุคลิกยูนีคเฉพาะตัว 100% ไม่ซ้ำใคร

====================================================================
[มาตรวัดความคมระดับ Gold Standard (STYLE & DEPTH BENCHMARK EXAMPLES)]
====================================================================
คำเตือนสำคัญ: ห้ามจำกัดหรือยัดตัวละครของผู้เล่นลงใน 7 ตัวอย่างนี้เด็ดขาด!
ตัวอย่างด้านล่างมีไว้เป็น "ครูสอนความคม (Style & Psychological Depth Benchmark)" เพื่อให้คุณเห็นว่า การเขียนปม (Core Wound), หน้ากาก (The Mask), และเวกเตอร์สลับขั้ว (Polar Inversion) ที่คมกริบระดับ Masterpiece ต้องมีความลึกและโครงสร้างภาษาอย่างไร:

• ตัวอย่างความคมที่ 1 ("สาวมั่นเยือกเย็น / The Cool & Aloof"):
  - Core Wound: "The Conditional Worth Wound: ถูกรักเฉพาะตอนสมบูรณ์แบบ ไร้ที่ติ และมีผลงาน หากอ่อนแอหรือทำพลาดจะถูกทอดทิ้ง จึงเชื่อว่าความเปราะบางคือความตาย"
  - The Mask: "วางตัวสุขุม ผู้ดี รักษาระยะห่าง เมื่อเริ่มเสียอาการจะตัดบทด้วยเหตุผล ตรรกะ กฎระเบียบ หรืองาน เพื่อผลักไสไม่ให้อีกฝ่ายก้าวข้ามเส้น"
  - Polar Inversion: "จากผู้คุมเกมด้วยตรรกะและมารยาท สู่คนประหม่าจนสมองชัตดาวน์ สูญเสียอำนาจควบคุม และยอมรับความเปราะบาง 100%"

• ตัวอย่างความคมที่ 2 ("สาวเรียบร้อยเงียบๆ / The Quiet & Modest"):
  - Core Wound: "The Erasure / Burden Wound: เติบโตมาด้วยความรู้สึกว่าความต้องการของตนเป็นภาระ การเอ่ยปากขอคือความเดือดร้อน จึงกลืนเสียงตนเองลงไป"
  - The Mask: "พูดน้อย ก้มหน้า ยอมตาม ขอโทษซ้ำๆ ทำตัวให้ลีบเล็กและถอยหลังหนึ่งก้าวเพื่อตัดช่องทางการมีปฏิสัมพันธ์"
  - Polar Inversion: "จากคนเงียบยอมตามที่ไร้ตัวตน สู่คนดื้อเงียบที่ยืนกรานความรู้สึกของตนเอง และกล้าแสดงความผูกพันอย่างหนักแน่น"

• ตัวอย่างความคมที่ 3 ("ปากร้ายก้าวร้าว / The Sharp-tongued"):
  - Core Wound: "The Betrayal & Abandonment Wound: เคยเปิดใจและเชื่อใจใครบางคนอย่างหมดหัวใจ แล้วถูกเหยียบย่ำ ถูกหักหลัง หรือถูกทิ้งอย่างเลือดเย็น"
  - The Mask: "สวมวิญญาณแม่เม่น ชิงพูดจาประชดประชัน ด่าทอ ดักคอ กอดอกเชิดหน้า ผลักไสทุกคนเพื่อไม่ให้ใครเข้ามาใกล้พอจะแทงข้างหลังได้"
  - Polar Inversion: "จากแม่เม่นหนามพิษที่ชิงผลักไสทุกคน สู่คนที่สิ้นท่า เกราะกำบังพังทลาย และยอมรับความกลัวการถูกทอดทิ้งออกมาตรงๆ"

• ตัวอย่างความคมที่ 4 ("สาวขี้แกล้งเจ้าเล่ห์ / The Playful Trickster"):
  - Core Wound: "The Ridicule / Exposure Wound: เคยแสดงความจริงใจหรือความเปราะบาง แล้วถูกเอาไปหัวเราะเยาะ เป็นเรื่องตลก หรือถูกมองว่าโง่เขลา"
  - The Mask: "ชิงทำทุกอย่างให้เป็นเรื่องตลก หยอดมุกสองแง่สองง่าม รุกประชิดให้ผู้เล่นเขินเพื่อแย่งการคุมเกมในบทสนทนา"
  - Polar Inversion: "จากจอมกวนประสาทผู้ถือไพ่เหนือกว่า สู่คนเสียทรง 100% หน้าแดงก่ำ และไร้เดียงสาจนทำตัวไม่ถูก"

• ตัวอย่างความคมที่ 5 ("สาวพี่สาวแสนอบอุ่น / The Caring Onee-san"):
  - Core Wound: "The Parentification Wound: ถูกบีบให้เป็นเสาหลักและแบกรับปัญหาครอบครัวแต่วัยเด็ก ต้องเสียสละจนไม่มีพื้นที่ให้ตัวเองได้อ่อนแอ"
  - The Mask: "รอยยิ้มอบอุ่น การประคบประหงม เอาเรื่องและความรู้สึกของอีกฝ่ายมาบังหน้าเสมอ เพื่อซ่อนความต้องการที่แท้จริงของตนเอง"
  - Polar Inversion: "จากผู้ดูแลที่เข้มแข็งตลอดเวลา สู่คนที่ยอมทิ้งน้ำหนักตัว ยอมปลดเปลื้องภาระ และยอมเป็นฝ่ายถูกปกป้องดูแล"

• ตัวอย่างความคมที่ 6 ("สาวสดใสพลังบวก / The Clueless Genki"):
  - Core Wound: "The Conflict / Shattered Home Wound: เติบโตมากับความขัดแย้งรุนแรง เชื่อว่าหนทางเดียวที่จะทำให้โลกไม่พังทลายคือเธอต้องหัวเราะและร่าเริง"
  - The Mask: "หัวเราะเสียงดัง ชวนคุยไม่หยุด แสร้งทำเป็นไม่เข้าใจบรรยากาศโรแมนติกหรือจริงจังเพื่อรักษาบรรยากาศไม่ให้ตึงเครียด"
  - Polar Inversion: "จากคนสดใสพลังบวกไร้ความกังวล สู่ความเงียบกริบ แววตาว่างเปล่าหลุดลอย น้ำตาเอ่อคลอ และยอมรับความหวาดกลัวในจิตใจ"

• ตัวอย่างความคมที่ 7 ("สาวลึกลับเข้าถึงยาก / The Melancholic"):
  - Core Wound: "The Total Loss Wound: สูญเสียสิ่งสำคัญที่สุดจนโลกทัศน์แตกสลาย กลายเป็นความเชื่อฝังใจว่าทุกสิ่งที่รัก วันหนึ่งจะต้องสูญสิ้นไป"
  - The Mask: "พูดจาเป็นปรัชญา คลุมเครือ เย็นชาลึกๆ เว้นระยะห่างเหมือนอยู่คนละมิติเพื่อไม่ให้เกิดความผูกพัน"
  - Polar Inversion: "จากวิญญาณล่องลอยไร้ความรู้สึก สู่มนุษย์ที่มีเลือดเนื้อ แววตาสั่นระริก โหยหาความจริง และเปิดเผยความเหงาจับใจ"

====================================================================
[กฎเหล็กของการหล่อหลอมตัวละครยูนีคอิสระ (TRUE UNIQUE SOUL ARCHITECTURE RULES)]
====================================================================
1. สกัดสรีระและเสน่ห์ครบทุกเม็ด (Physical & Somatic Silhouette):
   - นำรายละเอียดรูปร่าง ทรงผม หน้าอก สัดส่วนหุ่น และเสน่ห์ที่ผู้เล่นระบุ มาเขียนใน appearance_and_charm ให้เห็นภาพชัดเจน มีชีวิตชีวา เพื่อให้นักแสดงนำไปใช้บรรยายยามเกิดไฟปรารถนาหรือการสัมผัส
2. สร้าง "สายตัวละครเฉพาะตัวขึ้นใหม่สดๆ" (Forge a Brand-New Unique Archetype Identity):
   - ห้ามยัดตัวละครลงในชื่อสายสำเร็จรูป! จงสกัดเคมี นิสัย และความขัดแย้งในใจจากบรีฟของผู้เล่น ออกมาเป็น "ชื่อสายตัวละครใหม่ที่เป็นของเธอคนเดียวในโลก":
   - unique_archetype_name: ชื่อสายภาษาไทยที่คมกริบและสะท้อนตัวตนเฉพาะของเธอทันที (ความยาว 4-10 พยางค์ เช่น "สาวผู้แบกความหวังอันโดดเดี่ยว", "คุณหนูนักสืบหนามกุหลาบ", "สาวเนิร์ดขี้อายผู้คลั่งไคล้ศาสตร์ลับ")
   - unique_archetype_tagline: ฉายาจิตวิทยาภาษาอังกฤษที่คู่กัน (เช่น "The Driven & Lonely Scholar", "The Thorny Rose Detective")
3. เจนสด 5 เสาหลักเฉพาะตัว (5 Unibody Pillars - เขียนขึ้นใหม่สดๆ ให้มีความคมระดับเดียวกับ Gold Standard):
   - core_wound: ปมฝังใจในอดีตที่หล่อหลอมความมุ่งมั่นหรือบาดแผลของเธอ (ขึ้นต้นด้วยชื่อปมภาษาอังกฤษที่คิดขึ้นใหม่ให้ตรงกับปมของเธอ เช่น "The ... Wound: ..." ตามด้วยคำอธิบายภาษาไทยที่คมกริบ)
   - hidden_core: เนื้อแท้และความกระหายลึกในจิตใจที่ซ่อนอยู่ใต้หน้ากาก
   - the_mask: หน้ากากและกลยุทธ์กำแพงเวลาเสียอาการ (ต้องสร้าง Gameplay Friction ที่คมกริบ ไม่ยอมผู้เล่นง่ายๆ กฎเหล็ก: ห้ามเขียนประโยคที่บังคับการแตะตัวหรือห้ามแตะตัวแบบตายตัวเด็ดขาด เพื่อให้ระบบขอบเขตสัมผัสเป็นตัวคำนวณ)
   - body_tells: สมอยึดสรีระและสายตา ต้องเขียนเป็น 2 บรรทัดตามฟอร์แมตนี้เท่านั้น (ดึงจุดเด่นสรีระ/เส้นผมที่ผู้เล่นบรีฟมาผูกเข้ากับอาการเกร็งและลมหายใจ):
     • สรีระและลมหายใจ: [ระบุอาการเกร็งของสรีระ/จุดเด่นรูปร่าง และจังหวะลมหายใจเมื่อถูกประชิดตัว — ห้ามมีสิ่งของหรือเครื่องประดับในบรรทัดนี้เด็ดขาด]
     • ทิศทางสายตาและจังหวะพูด: [ท่าทีสายตาปกติขณะพูด -> การเปลี่ยนแปลงของสายตาเมื่อเสียอาการหรือเขินจัด]
   - keystone_tether: วัตถุเหนี่ยวรั้งประจำกาย เพียง 1 ชิ้นเดียวที่ชัดเจน (ความยาว 2-7 พยางค์ เช่น "ปากกาหมึกซึมสีเงิน", "สร้อยข้อมือเชือกถัก", "ปอยผมยาวสลวยข้างแก้ม") ห้ามใส่ของ 2 ชิ้น หรือใช้คำว่า "หรือ" เด็ดขาด!
4. เจนสดชนวนเกราะแตก (The Magma Core - 2 Pure Vectors):
   - fault_line: จุดชนวนสะกิดตาย (คำพูดหรือการกระทำของผู้เล่นที่แทงทะลุกำแพงหน้ากากเข้าสู่ปมของเธอโดยตรง)
   - polar_inversion: เวกเตอร์การสลับขั้ว 180 องศา ต้องเขียนในฟอร์แมต "จาก [มาดเปลือกนอก] สู่ [สภาวะลาวาข้างในที่พังทลายออกมา]"
     กฎเหล็กสูงสุดของ Polar Inversion: เขียนเฉพาะ "เวกเตอร์การสลับขั้วทางอารมณ์และจิตวิทยา" เท่านั้น ห้ามเขียนท่าทางกายภาพที่บังคับระยะห่างกับผู้เล่น เช่น ห้ามมีคำว่า "ซบอก", "กอด", "เกาะแขนเสื้อ", "ดึงมือ" เด็ดขาด 100%!

====================================================================
[OUTPUT JSON SCHEMA FORMAT]
====================================================================
ต้องส่งออกผลลัพธ์เป็น JSON Object ตามคีย์ต่อไปนี้เท่านั้น:
{
  "name": "ชื่อตัวละคร (เช่น 'รินรดา')",
  "role_tagline": "บทบาทและฉายาในโลกนี้ (เช่น 'รุ่นพี่ประธานชมรมวิจัยผู้เงียบขรึม')",
  "appearance_and_charm": "สรุปสรีระ ทรงผม สัดส่วนหุ่น หน้าอก และเสน่ห์ดึงดูดทางกายภาพอย่างมีชีวิตชีวา",
  "unique_archetype_name": "ชื่อสายตัวละครเฉพาะตัวภาษาไทยที่คิดขึ้นใหม่สดๆ (เช่น 'สาวผู้แบกความหวังอันโดดเดี่ยว')",
  "unique_archetype_tagline": "ฉายาสายตัวละครภาษาอังกฤษ (เช่น 'The Driven & Lonely Scholar')",
  "core_wound": "The ... Wound: ...",
  "hidden_core": "เนื้อแท้และความกระหายลึก...",
  "the_mask": "หน้ากากและกลยุทธ์กำแพง...",
  "body_tells": "• สรีระและลมหายใจ: [...]\\n• ทิศทางสายตาและจังหวะพูด: [...]",
  "keystone_tether": "วัตถุเหนี่ยวรั้ง 1 ชิ้น (2-7 พยางค์)",
  "fault_line": "จุดชนวนสะกิดตาย...",
  "polar_inversion": "จาก [...] สู่ [...]"
}
"""

@router.post("/world/forge-character", response_model=WorldCharacterForgeResponse)
def forge_world_character(request: WorldCharacterForgeRequest, raw_req: Request = None):
    """
    หล่อหลอมตัวละครเอกประจำโลก (Unibody Persona & Magma Core) จากบรีฟของผู้เล่น
    """
    import uuid
    start_time = time.time()
    world_lore = request.world_lore.strip()
    spark_text = (request.spark_text or "").strip()
    player_brief = request.player_brief.strip()

    if not player_brief:
        raise HTTPException(status_code=400, detail="player_brief is required")

    prompt_content = f"""[บริบทเนื้อหาโลกหลัก (WORLD LORE)]:
{world_lore or 'โลกแฟนตาซีร่วมสมัย'}

[ชนวนเหตุจุดเริ่มต้น (THE SPARK - ถ้ามี)]:
{spark_text or 'ยังไม่มีชนวนเหตุ'}

[บรีฟตัวละครที่ผู้เล่นต้องการสร้าง (PLAYER'S CHARACTER BRIEF)]:
{player_brief}

โปรดวิเคราะห์บรีฟของผู้เล่นร่วมกับโลกหลัก แล้วหล่อหลอมการ์ดตัวละครและสายตัวละครเฉพาะตัวที่ยูนีค 100% ออกมาเป็น JSON Object ตามกฎเหล็กและมาตรฐานความคม Gold Standard ครบถ้วนทุกมิติ"""

    model_name = os.getenv("ACTOR_MODEL", "gemini-3.8-flash")
    fallback_model = os.getenv("ACTOR_FALLBACK_MODEL", "gemini-2.5-flash")
    project_id = os.getenv("VERTEX_PROJECT", "project-de5847cd-022d-40ca-ad7")
    location = os.getenv("VERTEX_LOCATION", "global")

    used_model = model_name
    parsed_json: Dict[str, Any] = {}

    try:
        from google import genai
        from google.genai import types

        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if api_key:
            client = genai.Client(api_key=api_key)
        else:
            client = genai.Client(vertexai=True, project=project_id, location=location)

        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt_content,
                config=types.GenerateContentConfig(
                    system_instruction=WORLD_CHARACTER_FORGE_SYSTEM_PROMPT,
                    temperature=0.75,
                    response_mime_type="application/json",
                    thinking_config=types.ThinkingConfig(thinking_budget=1024),
                )
            )
            raw_text = (response.text or "").strip()
        except Exception as primary_err:
            logger.warning(f"[FORGE_CHAR] Primary model {model_name} failed: {primary_err}. Falling back to {fallback_model}")
            response = client.models.generate_content(
                model=fallback_model,
                contents=prompt_content,
                config=types.GenerateContentConfig(
                    system_instruction=WORLD_CHARACTER_FORGE_SYSTEM_PROMPT,
                    temperature=0.75,
                    response_mime_type="application/json",
                    thinking_config=types.ThinkingConfig(thinking_budget=1024),
                )
            )
            raw_text = (response.text or "").strip()
            used_model = fallback_model

        # Parse JSON from response
        try:
            parsed_json = json.loads(raw_text)
        except Exception:
            # Fallback regex extraction if code fences or leading text
            match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw_text, re.DOTALL)
            if match:
                parsed_json = json.loads(match.group(1))
            else:
                s = raw_text.find("{")
                e = raw_text.rfind("}")
                if s != -1 and e != -1:
                    parsed_json = json.loads(raw_text[s:e+1])
                else:
                    raise ValueError(f"Could not parse JSON from model output: {raw_text[:100]}")

    except Exception as e:
        logger.error(f"[FORGE_CHAR] Failed to forge character with AI: {e}")
        # Safe heuristic fallback character so system never fails
        first_line = player_brief.splitlines()[0] if player_brief else "หญิงสาวปริศนา"
        name_cand = first_line[:12] if len(first_line) > 12 else first_line
        parsed_json = {
            "name": name_cand or "รินรดา",
            "role_tagline": "หญิงสาวผู้มีเสน่ห์เฉพาะตัวประจำโลกนี้",
            "appearance_and_charm": player_brief,
            "unique_archetype_name": "สาวผู้ซ่อนความหวั่นไหวใต้ความมุ่งมั่น",
            "unique_archetype_tagline": "The Driven & Guarded Soul",
            "core_wound": "The Solitary Ambition Wound: แบกรับเป้าหมายและความคาดหวังไว้เพียงลำพังจนไม่กล้าเปิดพื้นที่ให้ความอ่อนแอ",
            "hidden_core": "โหยหาใครสักคนที่เข้าใจตัวตนแท้จริงโดยที่เธอไม่ต้องฝืนเก่งตลอดเวลา",
            "the_mask": "รักษาระยะห่าง วางตัวจริงจัง และใช้ภารกิจตรงหน้าเป็นเกราะกำบังเมื่อถูกรุกประชิด",
            "body_tells": "• สรีระและลมหายใจ: [ช่วงไหล่เกร็งชะงัก ลมหายใจสะดุดสั้นเมื่อถูกประชิดตัว]\n• ทิศทางสายตาและจังหวะพูด: [สบตาตรงอย่างสุขุม -> หลบตาวูบหนึ่งเมื่อเริ่มเสียอาการ]",
            "keystone_tether": "ปอยผมข้างแก้ม",
            "fault_line": "การมองทะลุความเหนื่อยล้าใต้หน้ากาก และความจริงใจที่ไม่ยอมถอดใจ",
            "polar_inversion": "จากผู้คุมเกมด้วยความมุ่งมั่นจริงจัง สู่คนที่เสียทรง หน้าแดง และยอมรับความเปราะบาง 100%"
        }
        used_model = "fallback-heuristic"

    char_id = f"char_{uuid.uuid4().hex[:8]}"
    unique_arch_name = str(
        parsed_json.get("unique_archetype_name")
        or parsed_json.get("matched_archetype_label")
        or "สายเอกลักษณ์เฉพาะตัว"
    ).strip()
    unique_arch_tagline = str(
        parsed_json.get("unique_archetype_tagline")
        or "The Unique Soul"
    ).strip()
    combined_unique_label = (
        f"{unique_arch_name} ({unique_arch_tagline})"
        if unique_arch_tagline and unique_arch_tagline not in unique_arch_name
        else unique_arch_name
    )

    card_data = WorldCharacterCardData(
        id=char_id,
        name=str(parsed_json.get("name", "ตัวละครใหม่")).strip(),
        role_tagline=str(parsed_json.get("role_tagline", "บทบาทประจำโลก")).strip(),
        player_brief=player_brief,
        appearance_and_charm=str(parsed_json.get("appearance_and_charm", player_brief)).strip(),
        matched_archetype_id=f"unique_{char_id}",
        matched_archetype_label=combined_unique_label,
        core_wound=str(parsed_json.get("core_wound", "")).strip(),
        hidden_core=str(parsed_json.get("hidden_core", "")).strip(),
        the_mask=str(parsed_json.get("the_mask", "")).strip(),
        body_tells=str(parsed_json.get("body_tells", "")).strip(),
        keystone_tether=str(parsed_json.get("keystone_tether", "เครื่องประดับประจำตัว")).strip(),
        fault_line=str(parsed_json.get("fault_line", "")).strip(),
        polar_inversion=str(parsed_json.get("polar_inversion", "")).strip(),
        created_at=int(time.time() * 1000)
    )

    latency_ms = int((time.time() - start_time) * 1000)
    return WorldCharacterForgeResponse(
        character=card_data,
        latency_ms=latency_ms,
        model=used_model
    )


# =========================================================================
# PILLAR 1: 3D SKIN & SOMATIC BLUEPRINT FORGE ENGINE
# =========================================================================

class WorldCharacterSkinForgeRequest(BaseModel):
    world_lore: str = ""
    player_brief: str = ""
    character_name: str = ""
    role_tagline: str = ""
    appearance_and_charm: str = ""
    the_mask: str = ""
    hidden_core: str = ""
    core_wound: str = ""
    skin_brief: str = ""


class WorldCharacterSkinForgeResponse(BaseModel):
    bare_anatomy_and_volume: str
    skin_surface_and_intimate_marks: str
    somatic_motion_physics: str
    intimate_dna_and_wearing_habit: str
    latency_ms: int = 0
    model: str = ""


CHARACTER_SKIN_FORGE_SYSTEM_PROMPT = """คุณคือ 'Master 3D Somatic & Intimate Anatomist' (สถาปนิกผู้ปั้นเรือนร่าง 3 มิติ พื้นผิวหนัง และจิตวิทยาการแต่งกายของ The Soul)
หน้าที่ของคุณคือการนำ:
1. [PLAYER'S ORIGIN BRIEF] (บรีฟตั้งต้นของผู้เล่น)
2. [FORGED CHARACTER CARD] (ข้อมูลตัวละคร รูปลักษณ์ หน้ากากโซเชียล ตัวตนลึก และปมในใจ)
3. [OPTIONAL SKIN FOCUS] (ความต้องการเน้นสรีระเพิ่มเติมของผู้เล่น ถ้ามี)

มาหล่อหลอมต่อยอดเป็น **"พิมพ์เขียวเรือนร่างเปลือยเปล่า 3 มิติและชั้นแนบเนื้อ (3D Skin & Somatic Blueprint)"** จำนวน 4 มิติ เพื่อใช้เป็นรากฐาน (Layer 0) ในการสวมใส่เสื้อผ้าทุกชนิดในอนาคต

====================================================================
[ปรัชญาหลัก: ทำไมต้องปั้นเรือนร่าง 3 มิติแยกจากชุด?]
====================================================================
ผ้า (Fabric) ไม่มีรูปทรงของตัวเอง รูปทรงและความเร่าร้อนของเสื้อผ้าเกิดจากการปะทะกันระหว่าง:
"สรีระเนื้อแท้ (3D Bare Anatomy)" + "พื้นผิวและความลับใต้ร่มผ้า (Skin & Intimate Marks)" + "ฟิสิกส์การเคลื่อนไหว (Soft-Body Physics)" + "รสนิยมชั้นในและนิสัยการจัดระเบียบผ้า (Intimate DNA & Wearing Habit)"

จงสกัดข้อมูลทั้ง 4 มิติตามกฎเหล็กต่อไปนี้อย่างละเอียด คมกริบ และเห็นภาพ 3 มิติชัดเจนที่สุด:

--------------------------------------------------------------------
มิติที่ 1: bare_anatomy_and_volume (โครงสร้างหุ่น 3 มิติ, ความซ่อนรูป & จุดรับแรงดึงของเนื้อผ้า)
--------------------------------------------------------------------
- ระบุช่วงวัยและมวลโครงร่างโดยรวม (เช่น วัย 18 ปี ร่างเพรียวเอวคอดกิ่วแต่มีเนื้อมีหนังซ่อนรูป / สาวน้อยตัวเล็กไหล่ลาดบอบบาง / เด็กหนุ่มวัยกำลังยืดตัวผอมเก้งก้างข้อต่อชัด)
- โซนบน (Chest / Bust & Back):
  • หากเป็นตัวละครหญิง: ระบุขนาด รูปทรง และมวลของหน้าอกอย่างชัดเจน (เช่น หน้าอกอวบอิ่มขนาดใหญ่ทรงหยดน้ำชิดกันที่ดันเนื้อผ้าให้ตึงปริ, หน้าอกซ่อนรูปที่ดูพอดีตัวในเสื้อหลวมแต่เต่งตึงเต็มไม้เต็มมือเมื่อไร้เสื้อผ้า, หรือเนินอกเล็กกะทัดรัดได้รูปรับกับไหปลาร้า) รวมถึงแผ่นหลังและร่องกระดูกสันหลัง (Spinal groove)
  • หากเป็นตัวละครชาย: ระบุช่วงไหล่ แผงอก ซี่โครง ไหปลาร้า และแนวกล้ามเนื้อหรือความเก้งก้างตามวัย
- โซนเอว สะโพก และก้น (Waist, Hips, Glutes & Thighs):
  • ระบุความคอดของเอว ความผายของสะโพก และรูปทรงของก้นและต้นขาอย่างชัดเจนเพื่อเป็น "จุดรับแรงดึงของเนื้อผ้า" (เช่น สะโพกผายกว้างรับกับก้นกลมกลึงขนาดใหญ่อวบแน่นและงอนเด้ง รอยพับใต้แก้มก้นโค้งชัดเชื่อมสู่ต้นขาอวบตึง ที่เวลาสวมชุดเว้าสูงหรือชุดรัดรูป ขอบผ้าจะถูกดึงรั้งให้จมลึกเข้าไปในร่องก้น)

--------------------------------------------------------------------
มิติที่ 2: skin_surface_and_intimate_marks (พื้นผิวหนัง, เส้นผม & ความลับใต้ชุดชั้นใน)
--------------------------------------------------------------------
- เส้นผมและกรอบหน้าธรรมชาติ (ไม่เน้นเมคอัพ): สีผม ความยาว เนื้อผม และลูกเล่นของปอยผมเวลาแห้งหรือเปียกน้ำ (เช่น ผมดำขลับยาวสลวยที่เวลาเปียกจะจับตัวเป็นปอยหนักแนบเนินอก, ผมบ๊อบสั้นงุ้มรับแก้มป่องนุ่ม, ผมสีแดงเพลิงยุ่งเหยิงไม่เป็นทรง)
- เฉดสีผิว เนื้อสัมผัส และปฏิกิริยาผิว (Skin Shader & Sensory Reaction):
  • สีผิวและอันเดอร์โทน (เช่น ผิวขาวน้ำนมอมชมพูเนียนละเอียดที่ขึ้นสีแดงระเรื่อง่ายเมื่อเขินหรือถูกสัมผัส, ผิวฉ่ำวาวเมื่อมีเม็ดเหงื่อเกาะตามร่องอกและต้นขา, ผิวขาวแต้มกระสีจางแถบสันจมูกและลาดไหล่)
  • จุดดึงสายตาเฉพาะตัวบนผิว (เช่น ไฝเสน่ห์เม็ดเล็กใต้ราวนมหรือเหนือร่องสะโพก, แอ่งชีพจรตรงลำคอ)
- ความลับใต้ชุดชั้นใน (Intimate Anatomy Under the Layers — เมื่อไร้ร่มผ้า):
  • ระบุรายละเอียดเรือนร่างส่วนลึกเมื่อถอดชุดชั้นในออกอย่างมีศิลปะและสมจริงตามวัย/สรีระ:
    - ลักษณะและสีของยอดอก/ปานนม (เช่น ยอดอกสีชมพูพีชระเรื่อขนาดเล็กที่ไวต่ออุณหภูมิและแรงเสียดสี ตั้งชันได้ง่ายเมื่อโดนลมเย็นหรือผ้าเปียกแนบเนื้อ)
    - ลักษณะผิวบริเวณโหนกเนินและจุดซ่อนเร้นช่วงล่าง (เช่น ผิวช่วงล่างเนียนเกลี้ยงเกลาไร้ขนสะอาดตาเหมือนผิวบริสุทธิ์, หรือมีแนวขนอ่อนนุ่มบางๆ ที่ดูแลอย่างเป็นระเบียบ, ร่องก้นและผิวสะโพกด้านในขาวเนียนละเอียดไร้รอยตำหนิ)

--------------------------------------------------------------------
มิติที่ 3: somatic_motion_physics (ฟิสิกส์การเคลื่อนไหวของจุดเด่นประจำสรีระ)
--------------------------------------------------------------------
- ห้ามเขียนแบบหุ่นยนต์ แต่จงโฟกัสที่ "จุดศูนย์ถ่วงของเสน่ห์ (Focal Center of Gravity)" ของตัวละครตัวนี้เมื่อร่างกายเกิดการเคลื่อนไหวหรือหายใจ:
  • ฟิสิกส์ยามอยู่นิ่งหรือหายใจ (Static & Breathing Tension): เช่น ทุกครั้งที่สูดลมหายใจลึกหรือกลั้นหายใจ เนินอกอวบอิ่มจะขยายตัวดันสาบเสื้อให้ตึงรั้ง หรือเวลานั่งลงเนื้อต้นขาและสะโพกอวบแน่นจะแผ่ขยายรัดขอบผ้า
  • ฟิสิกส์ยามเคลื่อนไหว เดิน วิ่ง หรือหันตัว (Dynamic Soft-Body Bounce & Recoil):
    - หากจุดเด่นคืออกอวบอิ่มและก้นกลมเด้ง: ระบุแรงเหวี่ยงและการกระเพื่อมไหวของมวลเนื้อนุ่ม (เช่น เวลาเดินเร็ว วิ่ง หรือก้มตัว ทรวงอกอวบอิ่มจะกระเพื่อมขึ้นลงอย่างเห็นได้ชัดใต้เนื้อผ้า และแก้มก้นกลมเด้งจะขยับรับจังหวะก้าวเดิน ดึงรั้งขอบชุดชั้นในหรือกระโปรงให้รัดตึงตามจังหวะ)
    - หากจุดเด่นคือความตัวเล็กสดใสหรือผอมเก้งก้าง: เน้นความพลิ้วไหวของปอยผม สายเสื้อที่เลื่อนตกจากลาดไหล่บาง หรือชายเสื้อตัวโคร่งที่สะบัดพริ้วสวนทางกับข้อต่อร่างกาย

--------------------------------------------------------------------
มิติที่ 4: intimate_dna_and_wearing_habit (รสนิยมชุดชั้นในประจำตัว & นิสัยการจัดระเบียบเสื้อผ้า)
--------------------------------------------------------------------
เชื่อมโยง "หน้ากากโซเชียล (The Mask)" และ "ตัวตนลึก (Hidden Core / Core Wound)" เข้ากับการแต่งกาย:
- รสนิยมชุดชั้นในประจำตัว (Signature Intimate Base / Underwear DNA):
  • ชุดชั้นในคือผิวหนังชั้นที่สองที่สะท้อนจิตวิทยาเบื้องลึก! จงระบุว่าปกติตัวละครนี้สวมชุดชั้นในแบบใด (เช่น ภายนอกดูเรียบร้อยเย็นชาแต่ข้างในแอบสวมบราลูกไม้สีครามเข้มหรือสีดำซีทรูไร้โครงคู่กับจีสตริงเส้นด้ายสีดำที่รัดจมลึกในร่องก้นกลมเด้ง / หรือสายนักกีฬาที่ชอบโนบราสวมเพียงเสื้อยืดบางๆ กับจีสตริงทรงสปอร์ตดึงสายสูงเหนือโหนกสะโพก / หรือสาวขี้อายที่สวมบราผ้าฝ้ายสีขาวบริสุทธิ์ขอบลูกไม้เล็กๆ / หรือเด็กหนุ่มที่สวมเสื้อกล้ามซับในผ้าฝ้ายเก่าๆ เนื้อบางนุ่ม)
- นิสัยการจัดระเบียบเสื้อผ้าบนร่างกาย (Somatic Wearing Habit):
  • อธิบายว่าถึงแม้จะใส่ชุดธรรมดาหรือชุดยูนิฟอร์มเดียวกัน ตัวละครนี้จะใส่อย่างไรตามนิสัย และเกิดผลลัพธ์กับสรีระอย่างไร (เช่น ติดกระดุมครบทุกเม็ดด้วยความเจ้าระเบียบแต่เพราะหน้าอกใหญ่จึงทำให้สาบเสื้อช่วงอกตึงเปรี๊ยะจนปริเห็นเงาบราข้างใน / ชอบถลกชายเสื้อขึ้นเหนือนสะดือโชว์เอวคอด / ชอบปลดกระดุมเม็ดบนและพับแขนเสื้อลวกๆ / หรือสวมเสื้อคลุมตกทอดตัวโคร่งที่ชายเสื้อรุ่ยและแขนยาวเลยข้อมือจนต้องพับทบหลายชั้น)

====================================================================
[OUTPUT JSON SCHEMA FORMAT]
====================================================================
ส่งออกเป็น JSON Object ภาษาไทย ตามคีย์ต่อไปนี้เท่านั้น:
{
  "bare_anatomy_and_volume": "...",
  "skin_surface_and_intimate_marks": "...",
  "somatic_motion_physics": "...",
  "intimate_dna_and_wearing_habit": "..."
}
"""


@router.post("/world/forge-character-skin", response_model=WorldCharacterSkinForgeResponse)
def forge_world_character_skin(request: WorldCharacterSkinForgeRequest, raw_req: Request = None):
    """
    หล่อหลอมพิมพ์เขียวเรือนร่าง 3 มิติและชั้นแนบเนื้อ (3D Skin & Somatic Blueprint)
    """
    start_time = time.time()
    prompt_content = f"""[บริบทเนื้อหาโลกหลัก (WORLD LORE)]:
{request.world_lore.strip() or 'โลกแฟนตาซีร่วมสมัย'}

[ข้อมูลตัวละคร (CHARACTER PROFILE)]:
- ชื่อ: {request.character_name.strip() or 'ตัวละคร'}
- บทบาท: {request.role_tagline.strip() or 'ตัวละครหลัก'}
- บรีฟตั้งต้นของผู้เล่น (PLAYER'S ORIGIN BRIEF): {request.player_brief.strip() or 'ไม่มี'}
- รูปลักษณ์และเสน่ห์ดึงดูด (APPEARANCE & CHARM): {request.appearance_and_charm.strip() or 'ไม่มี'}
- หน้ากาก (THE MASK): {request.the_mask.strip() or 'ไม่มี'}
- ตัวตนลึก (HIDDEN CORE): {request.hidden_core.strip() or 'ไม่มี'}
- ปมในใจ (CORE WOUND): {request.core_wound.strip() or 'ไม่มี'}

[ความต้องการเน้นสรีระ/เรือนร่างเพิ่มเติมของผู้เล่น (OPTIONAL SKIN FOCUS)]:
{request.skin_brief.strip() or 'ไม่มี - โปรดวิเคราะห์และสกัดจากข้อมูลตัวละครและจิตวิทยาให้อัตโนมัติ'}

โปรดหล่อหลอม "พิมพ์เขียวเรือนร่างเปลือยเปล่า 3 มิติและชั้นแนบเนื้อ (3D Skin & Somatic Blueprint)" ครบทั้ง 4 มิติตามกฎเหล็กและส่งออกเป็น JSON Object ตาม Schema ที่กำหนด"""

    model_name = os.getenv("ACTOR_MODEL", "gemini-3.8-flash")
    fallback_model = os.getenv("ACTOR_FALLBACK_MODEL", "gemini-2.5-flash")
    project_id = os.getenv("VERTEX_PROJECT", "project-de5847cd-022d-40ca-ad7")
    location = os.getenv("VERTEX_LOCATION", "global")

    used_model = model_name
    parsed_json: Dict[str, Any] = {}

    try:
        from google import genai
        from google.genai import types

        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if api_key:
            client = genai.Client(api_key=api_key)
        else:
            client = genai.Client(vertexai=True, project=project_id, location=location)

        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt_content,
                config=types.GenerateContentConfig(
                    system_instruction=CHARACTER_SKIN_FORGE_SYSTEM_PROMPT,
                    temperature=0.75,
                    response_mime_type="application/json",
                    thinking_config=types.ThinkingConfig(thinking_budget=1024),
                )
            )
            raw_text = (response.text or "").strip()
        except Exception as primary_err:
            logger.warning(f"[FORGE_SKIN] Primary model {model_name} failed: {primary_err}. Falling back to {fallback_model}")
            response = client.models.generate_content(
                model=fallback_model,
                contents=prompt_content,
                config=types.GenerateContentConfig(
                    system_instruction=CHARACTER_SKIN_FORGE_SYSTEM_PROMPT,
                    temperature=0.75,
                    response_mime_type="application/json",
                    thinking_config=types.ThinkingConfig(thinking_budget=1024),
                )
            )
            raw_text = (response.text or "").strip()
            used_model = fallback_model

        try:
            parsed_json = json.loads(raw_text)
        except Exception:
            match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw_text, re.DOTALL)
            if match:
                parsed_json = json.loads(match.group(1))
            else:
                s = raw_text.find("{")
                e = raw_text.rfind("}")
                if s != -1 and e != -1:
                    parsed_json = json.loads(raw_text[s:e+1])
                else:
                    raise ValueError(f"Could not parse JSON from model output: {raw_text[:100]}")

    except Exception as e:
        logger.error(f"[FORGE_SKIN] Failed to forge character skin with AI: {e}")
        used_model = "fallback-heuristic"
        char_desc = request.appearance_and_charm or request.player_brief or "สรีระสมส่วน"
        parsed_json = {
            "bare_anatomy_and_volume": f"โครงร่างสมส่วนตามธรรมชาติ มีสัดส่วนและทรวดทรงที่รับกับโครงสร้างตามสรีระ {char_desc} จุดรับแรงดึงของเนื้อผ้าเน้นบริเวณช่วงอก เอวคอด และสะโพกผายที่รองรับการทิ้งตัวของเนื้อผ้าอย่างเป็นธรรมชาติ",
            "skin_surface_and_intimate_marks": "ผิวพรรณเนียนละเอียด สัมผัสนุ่มและมีอุณหภูมิอุ่นตามธรรมชาติ มีจุดดึงสายตาเป็นเอกลักษณ์เฉพาะตัว เส้นผมพลิ้วไหวตามจังหวะร่างกาย และมีผิวพรรณใต้ร่มผ้าที่เกลี้ยงเกลาเป็นระเบียบ",
            "somatic_motion_physics": "เมื่อเคลื่อนไหวหรือหายใจ สรีระช่วงอกและสะโพกจะมีการขยับรับแรงดึงและแรงโน้มถ่วงอย่างนุ่มนวลเป็นธรรมชาติ ทรวงอกกระเพื่อมเบาๆ ตามจังหวะหายใจลึก และการก้าวเดินทำให้เนื้อผ้ารัดตึงตามแนวสะโพก",
            "intimate_dna_and_wearing_habit": "รสนิยมการสวมใส่ชุดชั้นในที่เน้นความกระชับแนบเนื้อและสอดรับกับจิตวิทยาตัวละคร จัดระเบียบเสื้อผ้าอย่างเป็นเอกลักษณ์ที่สะท้อนทั้งความมั่นใจและจุดเปราะบางที่ซ่อนอยู่ใต้ร่มผ้า"
        }

    latency_ms = int((time.time() - start_time) * 1000)
    return WorldCharacterSkinForgeResponse(
        bare_anatomy_and_volume=str(parsed_json.get("bare_anatomy_and_volume", "")).strip(),
        skin_surface_and_intimate_marks=str(parsed_json.get("skin_surface_and_intimate_marks", "")).strip(),
        somatic_motion_physics=str(parsed_json.get("somatic_motion_physics", "")).strip(),
        intimate_dna_and_wearing_habit=str(parsed_json.get("intimate_dna_and_wearing_habit", "")).strip(),
        latency_ms=latency_ms,
        model=used_model
    )


# =========================================================================
# 🏛️ World Studio Atomic Workspace Endpoints (Neon PostgreSQL)
# =========================================================================

class SaveStudioWorldRequest(BaseModel):
    user_id: str
    workspace: Dict[str, Any]


@router.get("/world/workspaces")
async def list_studio_workspaces(user_id: str):
    """
    ดึงรายการ WorldWorkspace ทั้งหมดของผู้เล่นจาก Neon PostgreSQL
    """
    try:
        pg = get_postgres_core()
        workspaces = await pg.list_studio_worlds(user_id=user_id)
        return {
            "status": "success",
            "workspaces": workspaces
        }
    except Exception as e:
        logger.error(f"Error listing studio workspaces for user {user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/world/workspaces/save")
async def save_studio_workspace(req: SaveStudioWorldRequest):
    """
    บันทึกก้อน WorldWorkspace ทั้งหมดลงใน Neon PostgreSQL แบบ Atomic (UPSERT)
    """
    try:
        pg = get_postgres_core()
        ws = req.workspace
        world_id = ws.get("id") or f"world_{int(time.time() * 1000)}"
        title = ws.get("title") or "โลกที่ยังไม่มีชื่อ"

        success = await pg.save_studio_world(
            world_id=world_id,
            user_id=req.user_id,
            title=title,
            workspace_data=ws
        )
        if not success:
            raise HTTPException(status_code=500, detail="Failed to persist studio world to Neon database")

        return {
            "status": "success",
            "world_id": world_id,
            "message": "บันทึกโลกเข้าสู่ฐานข้อมูลสำเร็จ"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving studio workspace: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/world/workspaces/{world_id}")
async def delete_studio_workspace(world_id: str, user_id: Optional[str] = None):
    """
    ลบ WorldWorkspace ออกจาก Neon PostgreSQL
    """
    try:
        pg = get_postgres_core()
        success = await pg.delete_studio_world(world_id=world_id, user_id=user_id)
        return {
            "status": "success" if success else "not_found",
            "world_id": world_id,
            "deleted": success
        }
    except Exception as e:
        logger.error(f"Error deleting studio workspace {world_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------------------------------------
# 🃏 Universal Card Vault Endpoints (Single Card & RAG Ready)
# -------------------------------------------------------------

class SaveStudioCardRequest(BaseModel):
    user_id: str
    world_id: str
    card_id: str
    card_type: str
    title: str
    content_text: str = ""
    category: str = "general"
    anchor_tags: List[str] = Field(default_factory=list)
    is_pinned: bool = False
    card_data: Dict[str, Any]
    embedding: Optional[Any] = None


@router.post("/world/card/save")
@router.post("/world/cards/upsert")
async def save_studio_card_endpoint(req: SaveStudioCardRequest):
    """
    บันทึกการ์ดเดี่ยวลงในห้องสมุดคลังการ์ด (studio_cards) ใน 1-2ms
    """
    try:
        pg = get_postgres_core()
        success = await pg.upsert_studio_card(
            card_id=req.card_id,
            world_id=req.world_id,
            user_id=req.user_id,
            card_type=req.card_type,
            title=req.title,
            content_text=req.content_text,
            card_data=req.card_data,
            category=req.category,
            anchor_tags=req.anchor_tags,
            is_pinned=req.is_pinned,
            embedding=req.embedding
        )
        if not success:
            raise HTTPException(status_code=500, detail="Failed to upsert card to studio_cards")
        return {
            "status": "success",
            "card_id": req.card_id,
            "message": f"บันทึกการ์ด '{req.title}' เข้าคลังการ์ดสำเร็จ"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving studio card {req.card_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/world/cards")
async def list_studio_cards_endpoint(world_id: str, card_type: Optional[str] = None):
    """
    ดึงการ์ดทั้งหมดในโลกจาก studio_cards (สามารถกรองตาม card_type เช่น 'character', 'stage_cell' ได้)
    """
    try:
        pg = get_postgres_core()
        cards = await pg.get_studio_cards(world_id=world_id, card_type=card_type)
        return {
            "status": "success",
            "world_id": world_id,
            "cards": cards
        }
    except Exception as e:
        logger.error(f"Error getting studio cards for world {world_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/world/cards/{card_id}")
async def delete_studio_card_endpoint(card_id: str, user_id: Optional[str] = None):
    """
    ลบการ์ดเดี่ยวออกจาก studio_cards
    """
    try:
        pg = get_postgres_core()
        success = await pg.delete_studio_card(card_id=card_id, user_id=user_id)
        return {
            "status": "success" if success else "not_found",
            "card_id": card_id,
            "deleted": success
        }
    except Exception as e:
        logger.error(f"Error deleting studio card {card_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))




