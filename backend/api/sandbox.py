import os
import json
import time
import logging
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from agents.actor_agent import ActorAgent
from engine.context_builder import ContextBuilder

logger = logging.getLogger("API_SANDBOX")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - \033[93m[SANDBOX]\033[0m - %(message)s")

router = APIRouter(prefix="/sandbox", tags=["Staging Sandbox"])

# 🌟 Lazy initialization สำหรับ ContextBuilder และ ActorAgent
context_builder = ContextBuilder()
actor_agent: Optional[ActorAgent] = None

def get_actor_agent() -> ActorAgent:
    global actor_agent
    if actor_agent is None:
        # กำหนดโมเดลหลักเป็น gemini-3.8-flash
        model_name = os.getenv("ACTOR_MODEL", "gemini-3.8-flash")
        logger.info(f"🚀 Initializing ActorAgent for Sandbox (Model: {model_name})")
        actor_agent = ActorAgent(model_name=model_name)
    return actor_agent


class SandboxSimulateRequest(BaseModel):
    character_id: str = Field(default="victoria", description="ID ของตัวละคร เช่น victoria, cher, may, baisom")
    player_input: str = Field(default="(ฉันก้าวเข้าไปคว้าข้อมือเธอไว้แน่น) อยู่คนเดียวจริงเหรอ?", description="ข้อความ/การกระทำของผู้เล่น")
    
    # 🌟 ตัวแปรสภาวะทางกายภาพและจิตวิทยา (Wizard of Oz Controls)
    distance: str = Field(default="intimate", description="ระยะห่าง: distant, reach, intimate")
    inhibition_shield: str = Field(default="active", description="เกราะสติ: active, cracked, shattered")
    desire_level: int = Field(default=20, ge=0, le=100, description="ระดับความปรารถนา (0-100%)")
    climate: str = Field(default="ห้องอบอุ่น เงียบสงบ", description="สภาพอากาศ/ผัสสะแวดล้อม")
    held_prop: str = Field(default="มือเปล่า", description="สิ่งของที่ตัวละครหรือผู้เล่นถืออยู่")
    player_posture: str = Field(default="ก้าวประชิดตัว เอื้อมมือมาหา", description="ท่าทางของผู้เล่น")
    actor_posture: str = Field(default="ยืนพิงกำแพงไม้", description="ท่าทางของตัวละครก่อนเริ่ม")
    thinking_budget: Optional[int] = Field(default=1024, description="Token budget สำหรับ Thinking Mode (Medium)")


class SandboxTelemetry(BaseModel):
    latency_ms: int
    model: str
    thinking: Optional[str] = None
    a_pos: Optional[str] = None
    p_pos: Optional[str] = None
    dominance_state: Optional[str] = None
    action_lock: Optional[bool] = None
    contact_points: Optional[List[str]] = None


class SandboxSimulateResponse(BaseModel):
    status: str
    character_id: str
    character_name: str
    player_input: str
    response_sequence: List[Dict[str, Any]]
    telemetry: SandboxTelemetry


def load_character(character_id: str) -> Dict[str, Any]:
    """โหลดข้อมูลตัวละครจากโฟลเดอร์ data/characters/"""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    file_path = os.path.join(base_dir, "data", "characters", f"{character_id}.json")
    
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading character {character_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Character file error: {e}")
            
    # Fallback to unknown or default
    fallback_path = os.path.join(base_dir, "data", "characters", "victoria.json")
    if os.path.exists(fallback_path):
        with open(fallback_path, "r", encoding="utf-8") as f:
            return json.load(f)
            
    raise HTTPException(status_code=404, detail=f"Character '{character_id}' not found.")


@router.post("/simulate", response_model=SandboxSimulateResponse)
async def simulate_turn(req: SandboxSimulateRequest):
    """
    ⚡ Sandbox Simulation Endpoint:
    รับ State จำลองโดยตรงจาก Staging Lab และส่งให้ Actor (Gemini 3.8 Flash) ประมวลผลแบบ Stateless
    """
    start_time = time.time()
    
    # 1. โหลดข้อมูลตัวละคร
    character_data = load_character(req.character_id)
    character_name = character_data.get("name", req.character_id)
    
    # 2. ปรุง Director Context จำลอง
    director_context = {
        "current_location": "ห้องสภานักเรียน",
        "current_time": "ช่วงเย็นหลังเลิกเรียน",
        "time_atmosphere": "แสงสีส้มสาดส่องลอดกระจก",
        "current_weather": req.climate,
        "current_mood": "ตึงเครียดและใกล้ชิด",
        "location_vibe": "เงียบสงบ ไร้เสียงผู้คน",
        "allowed_next_weather": req.climate,
        "spatial_layout": f"พื้นที่ปิดมิดชิด ระยะห่างทางกายภาพ: {req.distance}",
        "key_furniture": "โต๊ะไม้โอ๊คและเก้าอี้หนัง",
        "choke_points": "มุมห้องใกล้ประตู",
        "available_props": req.held_prop,
    }
    
    # 3. สร้าง Prompt ผ่าน ContextBuilder ตัวหลักของแอป
    actor_prompt = context_builder.build_actor_prompt(
        character_data=character_data,
        director_context=director_context,
        retrieved_memory="",
        world_data={},
        current_location=director_context["current_location"],
        chaos_level="low",
        current_player_posture=req.player_posture,
        current_actor_posture=req.actor_posture,
        current_dominance_state="NEUTRAL",
        current_action_lock=False,
        anatomy=character_data.get("anatomy", "รูปร่างสมส่วน ผิวขาวนวล"),
        current_outfit=character_data.get("current_outfit", "เครื่องแบบนักเรียนเรียบร้อย"),
        signature_postures=character_data.get("signature_postures", "กอดอก, ปัดปอยผม"),
        desire_level=req.desire_level,
        inhibition_shield=req.inhibition_shield,
        sensibility=character_data.get("core_stats", {}).get("sensibility", 5),
        mask_integrity=character_data.get("core_stats", {}).get("mask_integrity", 7),
    )
    
    # 4. เตรียม Chat History สำหรับปัจจุบันขณะ
    chat_history = [
        {"role": "user", "parts": [req.player_input]}
    ]
    
    # 5. เรียกใช้ ActorAgent (Gemini 3.8 Flash)
    actor = get_actor_agent()
    
    # ปรับ thinking budget ชั่วคราวหากระบุมา
    if req.thinking_budget:
        os.environ["ACTOR_THINKING_BUDGET"] = str(req.thinking_budget)
        
    try:
        actor_output = await actor.execute(
            actor_prompt=actor_prompt,
            chat_history=chat_history
        )
    except Exception as e:
        logger.error(f"Sandbox execution failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Actor execution failed: {e}")
        
    latency_ms = int((time.time() - start_time) * 1000)
    
    # 6. แปลงผลลัพธ์เป็น Response Sequence
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
        p_pos=actor_output.p_pos,
        dominance_state=actor_output.dominance_state,
        action_lock=actor_output.action_lock,
        contact_points=actor_output.contact_points
    )
    
    return SandboxSimulateResponse(
        status="success",
        character_id=req.character_id,
        character_name=character_name,
        player_input=req.player_input,
        response_sequence=raw_sequence,
        telemetry=telemetry
    )
