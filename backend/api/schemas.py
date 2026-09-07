from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any, Literal

# ==========================================
# 📊 1. CHARACTER DATA MODELS (โครงสร้างข้อมูลตัวละคร)
# ==========================================

class CharacterStats(BaseModel):
    """สเตตัส 7 แกนหลักของตัวละคร (ค่า 1-10)"""
    initiative: int = Field(..., ge=1, le=10, description="1=รอให้ทัก, 10=รุกหน้าด้านๆ/ชวนคุยก่อน")
    honesty: int = Field(..., ge=1, le=10, description="1=ปากแข็ง/ซึนเดเระ, 10=ซื่อตรงรู้สึกยังไงพูดงั้น")
    expressiveness: int = Field(..., ge=1, le=10, description="1=หน้านิ่ง/โมโนโทน, 10=เล่นใหญ่/สีหน้าชัดเจน")
    formality: int = Field(..., ge=1, le=10, description="1=พูดหยาบ/ห้วน, 10=สุภาพเรียบร้อย/ทางการ")
    playfulness: int = Field(..., ge=1, le=10, description="1=จริงจัง/เถรตรง, 10=ขี้แกล้ง/ปั่นประสาท")
    dominance: int = Field(..., ge=1, le=10, description="1=ยอมตามใจ/อ้อน, 10=สั่งการ/สาย S/ควบคุม")
    physicality: int = Field(..., ge=1, le=10, description="1=หวงตัว, 10=มือปลาหมึก/โหยหาสัมผัส")
    
    # 🌟 [ENGINE 5.5] สเตตัสพิเศษ (ใช้ร่วมกับเกราะและเซนเซอร์)
    emotional_stability: int = Field(default=5, ge=1, le=10, description="ความมั่นคงทางอารมณ์ (ใช้คำนวณเกราะต้านทานการรุกราน)")
    perception: int = Field(default=5, ge=1, le=10, description="เซนเซอร์จับโกหก (1=หูเบา, 10=จับผิดเก่ง/รู้ทัน)")
    sensibility: int = Field(default=5, ge=1, le=10, description="ความไวต่อการถูกสัมผัส (1=ตายด้าน, 10=ไวจัด/จุดติดง่าย)")
    mask_integrity: int = Field(default=5, ge=1, le=10, description="ความหนาของหน้ากาก (1=หลุดโป๊ะง่าย, 10=Poker Face คีพหลุคเก่ง)")

class CharacterPreferences(BaseModel):
    """ความชอบและของแสลงของตัวละคร"""
    likes: List[str] = Field(default_factory=list, description="สิ่งที่ชอบ (ถ้าเจอจะอารมณ์ดี)")
    dislikes: List[str] = Field(default_factory=list, description="สิ่งที่ไม่ชอบ (ถ้าเจอจะอารมณ์เสีย)")

class PassivePerk(BaseModel):
    """สกิลติดตัว / ท่าไม้ตายเฉพาะกิจ"""
    perk_name: str = Field(..., description="ชื่อสกิล")
    trigger: str = Field(..., description="เงื่อนไขที่ทำให้สกิลทำงาน")
    effect: str = Field(..., description="ผลลัพธ์ที่จะเกิดขึ้น (ลบล้างสเตตัสปกติชั่วคราว)")

class CharacterAppearance(BaseModel):
    anatomy_features: List[str] = Field(default_factory=list)
    wardrobe: Dict[str, str] = Field(default_factory=dict)
    signature_postures: List[str] = Field(default_factory=list)

class CharacterProfile(BaseModel):
    """โครงสร้างไฟล์ JSON ของตัวละครทั้งหมด"""
    character_id: str
    name: str
    archetype: str
    hashtag_dna: List[str] = Field(default_factory=list)
    appearance: CharacterAppearance
    background_story: List[str] = Field(default_factory=list)
    current_phase: int = 1
    psychology: Dict[str, str] = Field(..., description="เก็บ the_mask, the_core, the_conflict")
    core_stats: CharacterStats
    preferences: CharacterPreferences
    micro_expressions: Dict[str, List[str]] = Field(..., description="หมวดหมู่ของภาษากายยามเผลอ")
    passive_perks: List[PassivePerk] = Field(default_factory=list)
    dynamic_evolution: Dict = Field(default_factory=dict, description="เงื่อนไขการอัปเลเวล Phase")
    
    # 🌟 [ENGINE 4.0] THE BLUEPRINT: DNA ฟิสิกส์ทางอารมณ์ (Action-Reaction)
    push_pull_matrix: Dict[str, Dict[str, str]] = Field(
        default_factory=dict, 
        description="ตารางตอบสนองทางอารมณ์ (Level 1-3) แยกตาม Stance ของผู้เล่น"
    )


# ==========================================
# 🎬 2. AGENT OUTPUT MODELS (รูปแบบการตอบกลับของ AI)
# ==========================================

class DirectorOutput(BaseModel):
    """
    ผลลัพธ์จาก Director Agent (ผู้กำกับ)
    """
    director_analysis: Optional[str] = Field(
        None,
        description="กระบวนการคิดของผู้กำกับ รับคำสั่ง System Directive และวิเคราะห์การถ่ายทำ (Gear 1, 2, 3)"
    )
    established_background: Optional[str] = Field(
        None,
        description="การดึงบริบทเก่ามาใช้ เพื่อให้มีความต่อเนื่อง"
    )
    focus_lens: Optional[List[str]] = Field(
        default_factory=list,
        description="จุดโฟกัสของกล้อง (เช่น ['ริมฝีปาก', 'มือที่สั่น'])"
    )
    time_shift: Optional[str] = Field(
        None, 
        description="เวลาในเกมเปลี่ยนไปหรือไม่ (เช่น 'เช้า', 'ดึก', 'เย็น') ถ้าไม่เปลี่ยนให้เป็น null"
    )
    location_shift: Optional[str] = Field(
        None, 
        description="สถานที่เปลี่ยนไปหรือไม่ (เช่น 'ห้องสมุด', 'ร้านอาหาร') ถ้าไม่เปลี่ยนให้เป็น null"
    )
    mood_modifier: str = Field(
        "neutral", 
        description="อารมณ์รวมๆ ของฉากนี้ (positive, neutral, negative) อิงจาก Likes/Dislikes"
    )
    voice_over: Optional[str] = Field(
        None, 
        description="คำบรรยายฉาก (VO) เพื่อสร้างบรรยากาศ หากไม่มีการเปลี่ยนฉากหรือบรรยากาศให้เป็น null"
    )
    system_choices: Optional[Dict[str, Any]] = Field(
        default=None,
        description="ตัวเลือกจากระบบที่จะเด้งขึ้นมาให้ผู้เล่นกด (ดึงมาจาก Beat ปัจจุบัน เฉพาะจังหวะชี้ชะตา)"
    )
    sensory_cues: str = Field(
        default="บรรยากาศรอบตัวยังคงเป็นไปตามปกติ ไม่มีอะไรเคลื่อนไหว", 
        description="แรงเสียดทานเล็กๆ หรือวงจรชีวิตของฉากในปัจจุบัน"
    )

    @field_validator("time_shift", "location_shift", "voice_over", mode="before")
    @classmethod
    def sanitize_ai_empty_values(cls, v):
        if isinstance(v, bool) or str(v).lower() in ["false", "true", "null", "none", ""]:
            return None
        return v

class ResponseSegment(BaseModel):
    type: Literal["action", "dialogue"] = Field(
        ..., 
        description="ประเภทของท่อนนี้: 'action' สำหรับบรรยายกิริยา หรือ 'dialogue' สำหรับคำพูด"
    )
    content: str = Field(
        ..., 
        description="เนื้อหาการบรรยายหรือบทสนทนา ห้ามใส่เครื่องหมายดอกจัน (*) หรือเครื่องหมายคำพูด (\")"
    )

class ActorOutput(BaseModel):
    """
    ผลลัพธ์จาก Actor Agent (นักแสดงหลัก)
    """
    thinking: str = Field(
        ...,
        description="วิเคราะห์ The NOW ตามลำดับสเต็ป และบังคับใช้ TENSION CLAMP กีดกันตัวเองไม่ให้เร่งสปีดอารมณ์ข้ามขั้น"
    )
    # 🌟 [ENGINE 5.5] THE KINEMATIC ENGINE: เซ็ตตัวแปรฟิสิกส์แห่งการล่า
    dominance_state: str = Field(
        default="NEUTRAL",
        description="ใครคุมเกม: ACTOR_DOMINANT, PLAYER_DOMINANT, หรือ NEUTRAL"
    )
    action_lock: bool = Field(
        default=False,
        description="สถานะล็อกเป้าหมาย (หากล็อกตัวผู้เล่นอยู่จะเป็น True)"
    )
    contact_points: List[str] = Field(
        default_factory=list,
        description="จุดสัมผัสแนบชิดร่างกาย (หากไม่มีให้เป็น list ว่าง)"
    )
    a_pos: str = Field(
        default="ยืน/นั่งอิสระตามบริบท",
        description="ท่าทางหลักและจุดศูนย์ถ่วงของตัวละคร (Actor)"
    )
    p_pos: Optional[str] = Field(
        default=None,
        description="ท่าทางหลักของผู้เล่น (จะคืนค่ากลับมาเฉพาะเมื่อโดนบังคับหรือคุมเกมอยู่เท่านั้น)"
    )
    response_sequence: List[ResponseSegment] = Field(
        ...,
        description="ลิสต์ลำดับการแสดงที่สลับระหว่าง action และ dialogue อย่างเป็นธรรมชาติ (The Fluid Array)"
    )

    @field_validator("p_pos", mode="before")
    @classmethod
    def sanitize_actor_empty_values(cls, v):
        if isinstance(v, bool) or str(v).lower() in ["false", "true", "null", "none", ""]:
            return None
        return v

class EvaluatorOutput(BaseModel):
    """
    ผลลัพธ์จาก Evaluator Agent (มาตรวัดวิญญาณผู้เล่น)
    """
    affection_delta: int = Field(0, description="คะแนนความสบายใจ/ Comfort Level ที่เปลี่ยนไป")
    desire_delta: int = Field(0, description="คะแนนความหื่น/ความโหยหาทางกายที่เปลี่ยนไป")
    reasoning: str = Field(..., description="เหตุผลสั้นๆ ที่ให้คะแนนเท่านี้")
    memory_extracted: Optional[str] = Field(None, description="ใจความสำคัญของบทสนทนาที่ควรจำไว้")
    scene_vibe: Optional[str] = Field(None, description="สรุปบรรยากาศหรือหัวข้อหลักที่กำลังคุยกันต่อเนื่องมา เพื่อกันลืมในเทิร์นถัดๆ ไป")
    
    # 🌟 [ENGINE 5.0] THE BEAT SYSTEM: ระบบสับรางบีต
    beat_action: str = Field(
        default="chaos_escalation",
        description="การตัดสินใจ: 'illusion_trigger', 'chaos_escalation', 'cancel', 'interrupt', หรือ 'none'"
    )
    matched_path: Optional[str] = Field(
        None,
        description="รหัสป้ายทางแยก (ถ้ามี) หากในคำสั่งไม่ระบุว่าต้องไป path ไหน ให้คืนค่า null ห้ามคิดไปเอง"
    )
    
    # 🌟 [ENGINE 5.5] THE SENSOR: สายลับดมกลิ่นเจตนาผู้เล่น (อัปเดต submit/resist)
    player_stance: str = Field(
        "neutral",
        description="เจตนาผู้เล่น (provoke, comfort, aggressive, submit, resist, ignore, neutral)"
    )
    
    player_posture: str = Field(
        default="คงท่าเดิม",
        description="พิกัด/ท่าทางของผู้เล่นที่สกัดได้จากข้อความล่าสุด"
    )

    # 🌟 [ENGINE 5.5] PERCEPTION SENSOR: เซนเซอร์จับโกหก
    bullshit_detected: bool = Field(
        default=False,
        description="ตั้งเป็น True หากคำพูดของผู้เล่นขัดแย้งกับระดับความสัมพันธ์ (Affection/Desire) ในปัจจุบันอย่างเห็นได้ชัด"
    )

    # 🌟 [ENGINE 5.5] DYNAMIC WARDROBE: เซนเซอร์จับการเปลี่ยนสภาพเสื้อผ้า
    wardrobe_update: Optional[str] = Field(
        None,
        description="อัปเดตสภาพเสื้อผ้าหากผู้เล่นกระทำต่อชุด (เช่น 'เสื้อเชิ้ตถูกปลดกระดุม', 'ชุดเปียกน้ำ') หากไม่มีให้ส่ง null"
    )

    # 🌟 [ENGINE 5.5] THE HEART LOCK: เซนเซอร์ปลดล็อกความสัมพันธ์
    stage_unlocked: bool = Field(
        default=False,
        description="ตั้งเป็น True หากมีเงื่อนไข Unlock Condition แล้วผู้เล่นทำสำเร็จในเทิร์นนี้"
    )

    # 🌟 [ENGINE 5.5] THE NICKNAME CONTROLLER: เซนเซอร์คุมความถี่ชื่อเล่น
    allow_nickname: bool = Field(
        default=False,
        description="ตั้งเป็น True หากสถานการณ์สมควรให้เรียกชื่อเล่น (เช่น ทักทาย, ออดอ้อน, โกรธ) หากคุยปกติให้เป็น False"
    )

    # 🌟 [ENGINE 5.5] DYNAMIC NOMENCLATURE: เซนเซอร์วิวัฒนาการสรรพนาม
    pronouns_update: Optional[str] = Field(
        None,
        description="อัปเดตสรรพนามใหม่หากมีเหตุการณ์เหมาะสม (เช่น รู้ว่าเป็นรุ่นพี่) ต้องไม่ล้ำเส้นระดับความสัมพันธ์! หากไม่มีให้ส่ง null"
    )
    nicknames_update: Optional[str] = Field(
        None,
        description="อัปเดตฉายาใหม่จากเหตุการณ์ในอดีต (เช่น 'ไข่ย้อย') ต้องไม่ล้ำเส้น! หากไม่มีให้ส่ง null"
    )
    nomenclature_rejection: Optional[str] = Field(
        None,
        description="คำสั่งด่า/ปฏิเสธ หากผู้เล่นบังคับให้เรียกชื่อที่ล้ำเส้นเกินความสัมพันธ์ปัจจุบัน (เช่น 'ผู้เล่นล้ำเส้นพยายามให้เรียกที่รัก ให้ปฏิเสธอย่างเด็ดขาด') หากไม่มีให้ส่ง null"
    )

    # 🌟 [ENGINE 5.5] CHEMISTRY DICTIONARY: เซนเซอร์มุกวงใน
    new_inside_joke: Optional[str] = Field(
        None,
        description="หากพบผู้เล่นพยายามเล่นมุกวงใน, คำเฉพาะ, หรือคำล้อเลียนที่ส่อถึงความสนิทสนม ให้สรุปคำนั้นและความหมายแฝงมา (เช่น 'ยัยตัวแสบ - ผู้เล่นใช้เรียกด้วยความเอ็นดู') หากไม่มีให้ส่ง null"
    )
    triggered_inside_joke: Optional[str] = Field(
        None,
        description="หากเทิร์นนี้ผู้เล่นพิมพ์คำที่ตรงกับ [CHEMISTRY DICTIONARY] ที่มีอยู่ ให้ส่งคำนั้นออกมาเพื่อกระตุ้น Actor ให้ตอบรับมุก หากไม่มีให้ส่ง null"
    )

    # 🌟 [ENGINE 5.5] INHIBITION SHIELD: เซนเซอร์เกราะสติและยางอาย
    inhibition_shield: str = Field(
        "active",
        description="สถานะเกราะสติ: 'active' (หวงตัวปกติ), 'cracked' (เริ่มหวั่นไหว/บรรยากาศพาไป), 'shattered' (สติแตก/ยอมจำนนตามสัญชาตญาณ)"
    )

    # 🌟 [ENGINE 5.5] CINEMATIC SWELL: เซนเซอร์จับจังหวะโลกหยุดหมุน
    is_cinematic_moment: bool = Field(
        default=False,
        description="ตั้งเป็น True เมื่อเกิดจังหวะประชิดตัวรุนแรง อารมณ์ทิ้งดิ่ง หรือความเงียบที่ตึงเครียด (เพื่อปลุก Director Gear 2)"
    )

    @field_validator("memory_extracted", "matched_path", "wardrobe_update", "pronouns_update", "nicknames_update", "nomenclature_rejection", "new_inside_joke", "triggered_inside_joke", mode="before")
    @classmethod
    def sanitize_optional_values(cls, v):
        if isinstance(v, bool) or str(v).lower() in ["false", "true", "null", "none", ""]:
            return None
        return v


# ==========================================
# 🌐 3. API REQUEST MODELS (รูปแบบการรับข้อมูลจากหน้าบ้าน)
# ==========================================

class ChatRequest(BaseModel):
    """
    ข้อมูลที่หน้าบ้าน (Frontend) จะส่งมาตอนผู้เล่นพิมพ์แชท
    🌟 [Supabase Edition] ส่งมาแค่นี้พอ! State ที่เหลือ Backend ไปดึงจาก DB เอาเอง
    """
    session_id: str = Field(
        ...,
        description="ID ของเซฟเกม (Save Slot) ที่กำลังเล่นอยู่"
    )
    user_id: str = Field(
        default="player_01", 
        description="UUID ของผู้เล่นที่ได้จาก Supabase"
    )
    character_id: str = Field(
        default="may",
        description="Codename ของตัวละคร (เช่น 'may')"
    )
    message: str = Field(
        ..., 
        description="ข้อความแชทล่าสุดจากผู้เล่น"
    )
    history: Optional[List[Dict[str, Any]]] = Field(
        default=[],
        description="ประวัติแชทล่าสุดจากหน้าบ้าน (Stateless Context)"
    )
    
    # [Option] เก็บ state ของสิ่งแวดล้อมไว้เผื่อหน้าบ้านเป็นคนคุม (หรือ Director เป็นคนคุม)
    world_id: Optional[str] = Field(default=None, description="ID ของไฟล์โลกที่คู่กับตัวละคร") 
    world_state: Dict[str, str] = Field(
        default={
            "time": "19:30 น.", 
            "location": "ซอกตึกมุมอับหลังคณะ", 
            "weather": "ฝนตกปรอยๆ อากาศชื้น"  
        }
    )
    
    is_regenerate: bool = Field(
        default=False,
        description="Flag บอกว่าเป็นการขอให้ AI สร้างคำตอบใหม่จากข้อความเดิม (ไม่ต้องเซฟข้อความผู้เล่นซ้ำ)"
    )
    
    # ❌ ลบตัวแปรฟิสิกส์ เสื้อผ้า Beats ทั้งหมดออก! เพราะเราจะใช้ db_core.py ไปดึงข้อมูลจากตาราง game_sessions แทน ❌

class ValidateWorldRequest(BaseModel):
    world_data: Dict[str, Any] = Field(..., description="ข้อมูล JSON ของโลกที่ต้องการตรวจสอบตาม Engine Manifesto")
