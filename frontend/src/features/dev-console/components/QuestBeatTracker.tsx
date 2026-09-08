import { MapPin, Compass, FastForward, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import type { QuestBeatState } from '../types'

interface QuestBeatTrackerProps {
  questState?: QuestBeatState
}

export function QuestBeatTracker({ questState }: QuestBeatTrackerProps) {
  const isQuestActive = Boolean(questState?.eventId)
  const qState: QuestBeatState = questState || {
    beatTurnCount: 0,
    sandboxTurnCount: 0,
    pacingStatus: 'idle',
  }

  return (
    <div className="p-4 bg-[#121214]/80 backdrop-blur-md rounded-2xl border border-[#2F3336] space-y-3">
      {/* 1. Header: Quest Title & Status Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Compass size={16} className="text-[#EF264C] shrink-0" />
          <span className="text-[13px] font-bold text-[#F2F2F5] truncate">
            {qState.eventName || qState.eventId || 'โหมดการสนทนาอิสระ (Sandbox)'}
          </span>
        </div>

        {/* Pacing Badge */}
        <div className="shrink-0">
          {qState.pacingStatus === 'advancing' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10.5px] font-bold border border-emerald-500/20">
              <FastForward size={11} /> ก้าวหน้า (Advancing)
            </span>
          ) : qState.pacingStatus === 'holding' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10.5px] font-bold border border-amber-500/20">
              <Clock size={11} /> รอเงื่อนไข (Holding)
            </span>
          ) : qState.pacingStatus === 'completed' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EF264C]/10 text-[#EF264C] text-[10.5px] font-bold border border-[#EF264C]/20">
              <CheckCircle2 size={11} /> สำเร็จ (Completed)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 text-[#ACACB2] text-[10.5px] font-medium border border-white/10">
              Sandbox
            </span>
          )}
        </div>
      </div>

      {/* 2. Scene & Beat Stepper Details */}
      {isQuestActive ? (
        <div className="space-y-2 bg-[#1D1D1F]/60 rounded-xl p-3 border border-white/5 text-[12px] font-mono">
          {/* Scene Row */}
          <div className="flex items-center justify-between">
            <span className="text-[#ACACB2] flex items-center gap-1.5">
              <MapPin size={12} className="text-[#EF264C]" />
              <span>SCENE (ฉาก):</span>
            </span>
            <span className="font-bold text-[#F2F2F5]">
              {qState.phaseId || 'scene_default'}
            </span>
          </div>

          {/* Beat Row */}
          <div className="flex items-center justify-between">
            <span className="text-[#ACACB2] flex items-center gap-1.5">
              <FastForward size={12} className="text-amber-400" />
              <span>ACTIVE BEAT:</span>
            </span>
            <span className="font-bold text-amber-300">
              {qState.beatId || 'beat_opening'}
            </span>
          </div>

          {/* Turn Counters */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
            <span className="text-[#ACACB2]">
              รอบในบีทนี้: <strong className="text-[#F2F2F5]">{qState.beatTurnCount} รอบ</strong>
            </span>
            <span className="text-[#ACACB2]">
              รอบสะสม: <strong className="text-[#F2F2F5]">{qState.sandboxTurnCount} รอบ</strong>
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11.5px] text-[#ACACB2] flex items-center gap-2">
          <AlertCircle size={14} className="text-[#ACACB2]/60 shrink-0" />
          <span>ยังไม่มีเควสต์หลักทำงาน กำลังเล่นในโหมด Sandbox ทั่วไป</span>
        </div>
      )}

      {/* 3. Next Condition Hint (คำแนะนำเงื่อนไขถัดไป) */}
      {qState.conditionHint && (
        <div className="text-[11px] text-[#ACACB2] bg-white/[0.03] px-3 py-2 rounded-xl border border-white/5 flex items-center gap-2">
          <span className="font-bold text-amber-400 shrink-0">เงื่อนไขก้าวหน้า:</span>
          <span className="truncate">{qState.conditionHint}</span>
        </div>
      )}
    </div>
  )
}

export default QuestBeatTracker
