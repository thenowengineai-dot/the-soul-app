import os
import sys
import time
import re
import logging
from typing import Dict, Any, List, Optional

# ตรวจสอบว่ากำลังรันอยู่บน Google Cloud Run หรือสภาพแวดล้อมที่ไม่มี TTY หรือไม่
IS_CLOUD_RUN = bool(os.getenv("K_SERVICE") or os.getenv("K_REVISION") or not sys.stdout.isatty())

# Regex สำหรับตัด ANSI Escape Codes (เช่น \033[93m, \033[0m)
ANSI_REGEX = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')

def clean_text(text: str) -> str:
    """ตัด ANSI escape codes ทิ้งเมื่ออยู่บน Cloud Run เพื่อให้ตัวหนังสือคมชัด"""
    if not text:
        return ""
    if IS_CLOUD_RUN:
        return ANSI_REGEX.sub('', str(text))
    return str(text)

# Base Terminal Colors for Local Dev
C_RESET = "" if IS_CLOUD_RUN else "\033[0m"
C_BOLD = "" if IS_CLOUD_RUN else "\033[1m"
C_DIM = "" if IS_CLOUD_RUN else "\033[2m"
C_RED = "" if IS_CLOUD_RUN else "\033[91m"
C_GREEN = "" if IS_CLOUD_RUN else "\033[92m"
C_YELLOW = "" if IS_CLOUD_RUN else "\033[93m"
C_BLUE = "" if IS_CLOUD_RUN else "\033[94m"
C_PURPLE = "" if IS_CLOUD_RUN else "\033[95m"
C_CYAN = "" if IS_CLOUD_RUN else "\033[96m"
C_WHITE = "" if IS_CLOUD_RUN else "\033[97m"
C_BG_RED = "" if IS_CLOUD_RUN else "\033[41m"

class TurnTracer:
    """
    กล่องดำติดตามสถานะและสมรรถนะของแต่ละเทิร์น (Turn Diagnostic Black Box)
    คอยตรวจสอบ 5 ประตูด่านตรวจ และส่งเสียงเตือนทันทีที่พบความผิดปกติ
    """
    def __init__(
        self,
        turn_number: int,
        user_id: str,
        character_id: str,
        world_id: str,
        session_id: str,
        user_message: str
    ):
        self.turn_number = turn_number
        self.user_id = user_id or "anonymous"
        self.character_id = character_id or "unknown"
        self.world_id = world_id or "unknown"
        self.session_id = session_id or "unknown"
        self.user_message = user_message or ""
        
        self.start_time = time.perf_counter()
        self.stage_timings: Dict[str, float] = {}
        self.alarms: List[Dict[str, Any]] = []
        self.warnings: List[str] = []

        # เริ่มต้นพิมพ์ Header ของเทิร์น
        self._print_header()

    def _print_header(self):
        line = "=" * 80
        msg_preview = self.user_message.replace("\n", " ")
        if len(msg_preview) > 80:
            msg_preview = msg_preview[:77] + "..."
            
        print(f"\n{C_CYAN}{line}{C_RESET}", flush=True)
        print(
            f"{C_BOLD}🎬 [TURN #{self.turn_number} START]{C_RESET} "
            f"Session: {C_DIM}{self.session_id}{C_RESET} | "
            f"User: {C_WHITE}{self.user_id}{C_RESET} | "
            f"Char: {C_YELLOW}{self.character_id}{C_RESET}",
            flush=True
        )
        print(f"💬 Input: \"{C_WHITE}{msg_preview}{C_RESET}\"", flush=True)
        print(f"{C_CYAN}{line}{C_RESET}", flush=True)

    def record_stage(self, stage_name: str, elapsed_seconds: float):
        """บันทึกเวลาที่ใช้ในแต่ละ Stage"""
        self.stage_timings[stage_name] = elapsed_seconds

    # -------------------------------------------------------------
    # 🚨 SYSTEM ALARM & WARNING
    # -------------------------------------------------------------
    def alarm(self, gate_name: str, culprit: str, reason: str, recovery_action: str = None, raw_detail: str = None):
        """
        ส่งสัญญาณเตือนภัยฉุกเฉินระดับสีแดง (Red Alarm Box) เมื่อเกิด Fallback หรือความล้มเหลว
        ห้ามปิดบังปัญหาเด็ดขาด!
        """
        alarm_data = {
            "gate": gate_name,
            "culprit": culprit,
            "reason": reason,
            "recovery": recovery_action,
            "detail": raw_detail
        }
        self.alarms.append(alarm_data)

        border = "!" * 80
        print(f"\n{C_BG_RED}{C_WHITE}{C_BOLD} {border} {C_RESET}", flush=True)
        print(f"{C_RED}{C_BOLD}🚨 [ALARM: {gate_name.upper()}] CULPRIT: {culprit}{C_RESET}", flush=True)
        print(f"{C_RED}   ├─ Reason: {reason}{C_RESET}", flush=True)
        if recovery_action:
            print(f"{C_YELLOW}   ├─ Recovery Action: {recovery_action}{C_RESET}", flush=True)
        if raw_detail:
            # ตัดให้เหลือ 200 ตัวอักษรเพื่อไม่ให้ล้น
            snippet = raw_detail[:200].replace("\n", " ")
            print(f"{C_DIM}   └─ Raw Detail: {snippet}{C_RESET}", flush=True)
        print(f"{C_BG_RED}{C_WHITE}{C_BOLD} {border} {C_RESET}\n", flush=True)

    def warning(self, gate_name: str, message: str):
        """ส่งสัญญาณเตือนระดับสีเหลือง (Warning) เมื่อข้อมูลขาดหรือใช้ค่าเริ่มต้น"""
        self.warnings.append(f"[{gate_name}] {message}")
        print(f"{C_YELLOW}⚠️ [{gate_name}] {message}{C_RESET}", flush=True)

    # -------------------------------------------------------------
    # 🚪 GATE REPORTERS (5 ประตูด่านตรวจ)
    # -------------------------------------------------------------
    def gate_contract(self, source: str, latency_ms: float, char_name: str = None, outfit: str = None, missing_fields: List[str] = None):
        """รายงานผล Gate 1: Contract & State Restore"""
        if missing_fields:
            self.warning("GATE 1: CONTRACT", f"Missing fields in world/character data: {', '.join(missing_fields)}")
            
        badge = f"{C_GREEN}HIT{C_RESET}" if "HIT" in source.upper() else f"{C_YELLOW}{source}{C_RESET}"
        details = []
        if char_name: details.append(f"Char: {char_name}")
        if outfit: details.append(f"Outfit: {outfit}")
        detail_str = f" | {', '.join(details)}" if details else ""
        print(f"{C_GREEN}✅ [GATE 1: CONTRACT]{C_RESET} World: {self.world_id} ({badge} {latency_ms:.1f}ms){detail_str}", flush=True)

    def gate_rag(self, status: str, match_count: int = 0, top_score: float = 0.0, latency_ms: float = 0.0, query_text: str = None):
        """รายงานผล Gate 2: Qdrant Memory RAG"""
        if status.upper() == "SUCCESS":
            if match_count > 0:
                print(f"{C_GREEN}✅ [GATE 2: QDRANT]{C_RESET} RAG Resolved in {latency_ms:.0f}ms -> Matched {match_count} memories (Top Score: {top_score:.2f})", flush=True)
            else:
                print(f"{C_DIM}ℹ️ [GATE 2: QDRANT] RAG Resolved in {latency_ms:.0f}ms -> No relevant memories found{C_RESET}", flush=True)
        elif status.upper() == "BYPASS":
            print(f"{C_DIM}ℹ️ [GATE 2: QDRANT] Bypassed for system/opening turn{C_RESET}", flush=True)
        else:
            self.alarm(
                gate_name="GATE 2: QDRANT",
                culprit="Qdrant Cloud / Vertex Embedding",
                reason=f"Status: {status} (Latency: {latency_ms:.0f}ms)",
                recovery_action="Proceeding turn without memory RAG context."
            )

    def gate_director(self, success: bool, elapsed_s: float, vo_text: Optional[str] = None, model: str = None):
        """รายงานผล Gate 3: Director & Scene Atmosphere"""
        self.record_stage("director", elapsed_s)
        if success:
            vo_len = len(vo_text) if vo_text else 0
            vo_preview = (vo_text[:50] + "...") if vo_text and len(vo_text) > 50 else (vo_text or "No VO")
            print(f"{C_GREEN}✅ [GATE 3: DIRECTOR]{C_RESET} Generated in {elapsed_s:.2f}s ({vo_len} chars) -> \"{C_WHITE}{vo_preview}{C_RESET}\"", flush=True)
        else:
            self.alarm(
                gate_name="GATE 3: DIRECTOR",
                culprit=f"DirectorAgent ({model or 'Gemini'})",
                reason="Director inference failed or returned empty output.",
                recovery_action="Generated fallback/neutral scene atmosphere."
            )

    def gate_evaluator(
        self,
        success: bool,
        elapsed_s: float,
        affection_val: int = 0,
        affection_delta: int = 0,
        desire_val: int = 0,
        desire_delta: int = 0,
        shield: str = "ACTIVE",
        extracted_memory: Optional[str] = None,
        model: str = None
    ):
        """รายงานผล Gate 4: Evaluator & Schema Gate"""
        self.record_stage("evaluator", elapsed_s)
        if success:
            aff_delta_str = f"+{affection_delta}" if affection_delta >= 0 else str(affection_delta)
            des_delta_str = f"+{desire_delta}" if desire_delta >= 0 else str(desire_delta)
            print(
                f"{C_GREEN}✅ [GATE 4: EVALUATOR]{C_RESET} Evaluated in {elapsed_s:.2f}s | "
                f"Affection: {affection_val} ({aff_delta_str}) | "
                f"Desire: {desire_val} ({des_delta_str}) | "
                f"Shield: {shield.upper()}",
                flush=True
            )
            if extracted_memory:
                mem_preview = (extracted_memory[:60] + "...") if len(extracted_memory) > 60 else extracted_memory
                print(f"   {C_PURPLE}🧠 [EXTRACTED MEMORY]{C_RESET} \"{mem_preview}\" -> Synced to Neon & Qdrant", flush=True)
        else:
            self.alarm(
                gate_name="GATE 4: EVALUATOR",
                culprit=f"EvaluatorAgent ({model or 'Gemini'})",
                reason="Evaluator returned malformed JSON or failed schema validation.",
                recovery_action="Preserved existing session state without modification."
            )

    def gate_actor(
        self,
        success: bool,
        elapsed_s: float,
        ttft_s: float = 0.0,
        segment_count: int = 0,
        dialogue_preview: str = None,
        fallback_used: bool = False,
        fallback_reason: str = None
    ):
        """รายงานผล Gate 5: Actor & Final Delivery Gate"""
        self.record_stage("actor", elapsed_s)
        if fallback_used:
            self.alarm(
                gate_name="GATE 5: ACTOR DUAL-MODEL FALLBACK",
                culprit="Primary Model (Quota/Safety)",
                reason=fallback_reason or "Fallback triggered during streaming",
                recovery_action="Switched to secondary model to protect user experience."
            )
        
        if success:
            dia_str = f" -> \"{dialogue_preview[:55]}...\"" if dialogue_preview else ""
            print(
                f"{C_GREEN}✅ [GATE 5: ACTOR]{C_RESET} Streamed in {elapsed_s:.2f}s "
                f"(TTFT: {ttft_s:.2f}s) | Segments: {segment_count}{dia_str}",
                flush=True
            )
        else:
            self.alarm(
                gate_name="GATE 5: ACTOR",
                culprit="ActorAgent",
                reason="Actor stream failed completely with zero output.",
                recovery_action="Emitted in-character polite recovery message."
            )

    def gate_persist(self, success: bool, latency_ms: float, round_number: int, coins_deducted: int = 0, remaining_coins: int = 0):
        """รายงานผล Gate 6: Persistence & Ledger"""
        if success:
            wallet_str = f" | Wallet: -{coins_deducted} coins (Bal: {remaining_coins})" if coins_deducted > 0 else ""
            print(f"{C_GREEN}✅ [GATE 6: PERSIST]{C_RESET} Unified Round #{round_number} saved to Neon DB in {latency_ms:.0f}ms{wallet_str}", flush=True)
        else:
            self.alarm(
                gate_name="GATE 6: PERSIST",
                culprit="Neon PostgreSQL / Asyncpg",
                reason="Failed to persist Unified Round JSONB or deduct coins.",
                recovery_action="State cached in Redis RAM as fallback."
            )

    def finish_summary(self):
        """สรุปเวลารวมและสัญญาณเตือนทั้งหมดเมื่อจบเทิร์น"""
        total_time = time.perf_counter() - self.start_time
        line = "-" * 80
        print(f"{C_CYAN}{line}{C_RESET}", flush=True)
        
        dir_s = self.stage_timings.get("director", 0.0)
        eval_s = self.stage_timings.get("evaluator", 0.0)
        act_s = self.stage_timings.get("actor", 0.0)
        
        if not self.alarms and not self.warnings:
            print(
                f"{C_GREEN}{C_BOLD}⏱️ [TIMING BREAKDOWN]{C_RESET} "
                f"Director: {dir_s:.2f}s | Eval: {eval_s:.2f}s | Actor: {act_s:.2f}s | "
                f"{C_BOLD}{C_GREEN}TOTAL: {total_time:.2f}s ⚡{C_RESET}",
                flush=True
            )
        else:
            alarm_count = len(self.alarms)
            warn_count = len(self.warnings)
            alarm_tags = [a["gate"] for a in self.alarms]
            print(
                f"{C_YELLOW}{C_BOLD}⚠️ [TURN SUMMARY - COMPLETED WITH {alarm_count} ALARMS, {warn_count} WARNINGS]{C_RESET}\n"
                f"   Timing: Director: {dir_s:.2f}s | Eval: {eval_s:.2f}s | Actor: {act_s:.2f}s | TOTAL: {total_time:.2f}s\n"
                f"   Active Alarms: {C_RED}{', '.join(alarm_tags) if alarm_tags else 'None'}{C_RESET}",
                flush=True
            )
        print(f"{C_CYAN}{'=' * 80}{C_RESET}\n", flush=True)


# Module-level helper for standardized logging
def get_telemetry_logger(name: str) -> logging.Logger:
    """สร้าง Logger ที่มี Format สะอาดตา ไร้ ANSI Escape บน Cloud Run"""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        fmt_str = "%(asctime)s - [%(name)s] - %(message)s"
        handler.setFormatter(logging.Formatter(fmt_str))
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger
