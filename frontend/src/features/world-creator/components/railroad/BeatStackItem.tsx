import { useState } from 'react';
import {
  Pencil,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Target,
} from 'lucide-react';
import type { WorldBeat, PlayerTriggerAction } from '../../types';

interface BeatStackItemProps {
  beat: WorldBeat;
  index: number;
  totalBeats: number;
  onUpdateBeat: (updated: WorldBeat) => void;
  onDeleteBeat: () => void;
  onInsertBeatAfter: () => void;
  isEditable?: boolean;
}

export default function BeatStackItem({
  beat,
  index,
  totalBeats: _totalBeats,
  onUpdateBeat,
  onDeleteBeat,
  onInsertBeatAfter,
  isEditable = true,
}: BeatStackItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form states
  const [actorStateText, setActorStateText] = useState(beat.actor_state || '');
  const [triggerKey, setTriggerKey] = useState(() => {
    const keys = Object.keys(beat.hidden_evaluation_criteria || {});
    return keys[0] || 'เข้าใกล้';
  });
  const [triggerFeedback, setTriggerFeedback] = useState(() => {
    const keys = Object.keys(beat.hidden_evaluation_criteria || {});
    return keys[0] ? beat.hidden_evaluation_criteria[keys[0]]?.feedback || '' : '';
  });
  const [maxTurns, setMaxTurns] = useState(beat.pacing_control?.max_turns || 3);
  const [consequence, setConsequence] = useState(
    beat.pacing_control?.inevitable_consequence || ''
  );

  const handleSave = () => {
    setIsEditing(false);
    const triggerObj: Record<string, { action_result: PlayerTriggerAction; feedback?: string }> = {};
    if (triggerKey.trim()) {
      triggerObj[triggerKey.trim()] = {
        action_result: 'progress',
        feedback: triggerFeedback.trim() || undefined,
      };
    }

    onUpdateBeat({
      ...beat,
      actor_state: actorStateText.trim(),
      hidden_evaluation_criteria: triggerObj,
      pacing_control: {
        max_turns: maxTurns,
        action_result: (beat.pacing_control?.action_result || 'progress') as PlayerTriggerAction,
        inevitable_consequence: consequence.trim(),
      },
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {/* ✦ THE BEAT CONTAINER */}
      <div
        className={`rounded-[18px] transition-all border ${
          isExpanded
            ? 'bg-white/[0.06] border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12)]'
            : 'bg-white/[0.03] hover:bg-white/[0.05] border-white/8 hover:border-white/14 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
        }`}
      >
        {/* Header Bar */}
        <div className="px-3.5 py-2.5 flex items-center justify-between gap-2 select-none">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-left min-w-0 flex-1 cursor-pointer group"
          >
            <div className="w-5 h-5 rounded-full bg-[#EF264C]/15 border border-[#EF264C]/30 text-[#EF264C] flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
              {String(index + 1).padStart(2, '0')}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[12.5px] font-semibold text-[#F1F1F1] group-hover:text-white tracking-tight block truncate">
                {beat.beat_id || `Beat ${index + 1}`}
              </span>
            </div>
            {isExpanded ? (
              <ChevronUp size={13} className="text-white/40 shrink-0" />
            ) : (
              <ChevronDown size={13} className="text-white/40 shrink-0" />
            )}
          </button>

          {/* Action Buttons */}
          {isEditable && (
            <div className="flex items-center gap-1 shrink-0">
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleSave}
                  className="w-6 h-6 rounded-full bg-[#EF264C] text-white flex items-center justify-center cursor-pointer shadow-[0_2px_8px_rgba(239,38,76,0.4)] active:scale-95 transition-all"
                  title="บันทึกบีต"
                >
                  <Check size={11} strokeWidth={2.4} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(true);
                    setIsEditing(true);
                  }}
                  className="w-6 h-6 rounded-full bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 text-white/60 hover:text-white flex items-center justify-center cursor-pointer transition-all"
                  title="แก้ไขบีต"
                >
                  <Pencil size={10} strokeWidth={2} />
                </button>
              )}
              <button
                type="button"
                onClick={onDeleteBeat}
                className="w-6 h-6 rounded-full bg-white/[0.04] hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white/40 hover:text-red-300 flex items-center justify-center cursor-pointer transition-all"
                title="ลบบีตนี้"
              >
                <Trash2 size={10} strokeWidth={2} />
              </button>
            </div>
          )}
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="px-3.5 pb-3.5 pt-1 space-y-2 border-t border-white/[0.06] text-[12px] animate-in fade-in duration-150">
            {!isEditing ? (
              <>
                {/* 1. ตัวละครกำลังทำอะไร */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#F1F1F1] tracking-tight">
                    <Sparkles size={11} className="text-[#EF264C]" />
                    <span>1. ตัวละครกำลังทำอะไร</span>
                  </div>
                  <p className="text-[11.5px] text-[#EDEDED] leading-relaxed bg-black/25 p-2 rounded-[10px] border border-white/[0.04]">
                    {beat.actor_state || 'ยังไม่ได้ระบุท่าทางตัวละคร...'}
                  </p>
                </div>

                {/* 2. ถ้าผู้เล่นทำแบบนี้ (เรื่องจะไปต่อทันที) */}
                <div className="space-y-1 bg-white/[0.02] p-2 rounded-[10px] border border-white/[0.04]">
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1 font-semibold text-emerald-400">
                      <Target size={11} />
                      <span>2. ถ้าผู้เล่นทำแบบนี้ (เรื่องจะไปต่อทันที)</span>
                    </div>
                    <span className="text-[9px] font-mono text-[#EF264C] bg-[#EF264C]/15 border border-[#EF264C]/30 px-1.5 py-0.5 rounded-full">
                      → ไปต่อ
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-white font-medium">
                      {Object.keys(beat.hidden_evaluation_criteria || {})[0] || 'การกระทำ'}
                    </span>
                    {Object.values(beat.hidden_evaluation_criteria || {})[0]?.feedback && (
                      <span className="text-white/60 italic truncate">
                        ➔ {Object.values(beat.hidden_evaluation_criteria || {})[0]?.feedback}
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. ถ้าผู้เล่นไม่ทำอะไร */}
                <div className="space-y-1 bg-amber-500/[0.03] p-2 rounded-[10px] border border-amber-500/20">
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-300">
                    <Clock size={11} />
                    <span>
                      3. ถ้าผู้เล่นไม่ทำอะไร (คุยครบ {beat.pacing_control?.max_turns || 3} รอบ เรื่องจะเดินต่อเองว่า)
                    </span>
                  </div>
                  <p className="text-[11px] text-[#EDEDED] leading-relaxed">
                    {beat.pacing_control?.inevitable_consequence || 'เรื่องราวดำเนินสู่ขั้นถัดไป'}
                  </p>
                </div>
              </>
            ) : (
              /* Edit Mode */
              <div className="space-y-2 pt-1">
                {/* 1. ตัวละครกำลังทำอะไร */}
                <div>
                  <label className="text-[10px] font-semibold text-[#F1F1F1] flex items-center gap-1 mb-1">
                    <Sparkles size={10} className="text-[#EF264C]" />
                    1. ตัวละครกำลังทำอะไร
                  </label>
                  <textarea
                    rows={2}
                    value={actorStateText}
                    onChange={(e) => setActorStateText(e.target.value)}
                    placeholder="นั่งก้มหน้านิ่ง ใช้นิ้วดันแว่น เสื้อบางเปียกชื้น..."
                    className="w-full bg-black/40 border border-white/15 focus:border-[#EF264C]/60 rounded-[10px] p-2 text-[11.5px] text-[#EDEDED] outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* 2. ถ้าผู้เล่นทำแบบนี้ */}
                <div>
                  <label className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 mb-1">
                    <Target size={10} />
                    2. ถ้าผู้เล่นทำแบบนี้ (เรื่องจะไปต่อทันที)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={triggerKey}
                      onChange={(e) => setTriggerKey(e.target.value)}
                      placeholder="การกระทำของผู้เล่น (เช่น เข้าใกล้)"
                      className="w-[120px] bg-black/40 border border-white/15 focus:border-emerald-400/60 rounded-[8px] px-2 py-1 text-[11px] text-[#EDEDED] outline-none"
                    />
                    <input
                      type="text"
                      value={triggerFeedback}
                      onChange={(e) => setTriggerFeedback(e.target.value)}
                      placeholder="ผลลัพธ์ย่อย (เช่น เธอสะดุ้งแต่ไม่หนี)"
                      className="flex-1 bg-black/40 border border-white/15 focus:border-emerald-400/60 rounded-[8px] px-2 py-1 text-[11px] text-[#EDEDED] outline-none"
                    />
                  </div>
                </div>

                {/* 3. ถ้าผู้เล่นไม่ทำอะไร & โควตารอบ */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="text-[10px] font-semibold text-white/50 block mb-1">
                      โควตาคุยเล่น (รอบ)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={maxTurns}
                      onChange={(e) => setMaxTurns(Number(e.target.value))}
                      className="w-full h-[30px] bg-black/40 border border-white/15 focus:border-amber-400/60 rounded-[8px] px-2 text-[11.5px] text-[#EDEDED] outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold text-amber-300 block mb-1">
                      3. ถ้าผู้เล่นไม่ทำอะไร (ครบเวลา)
                    </label>
                    <input
                      type="text"
                      value={consequence}
                      onChange={(e) => setConsequence(e.target.value)}
                      placeholder="เรื่องราวดำเนินต่อเองว่า..."
                      className="w-full h-[30px] bg-black/40 border border-amber-500/30 focus:border-amber-400/60 rounded-[8px] px-2 text-[11.5px] text-[#EDEDED] outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✦ INSTANT INSERT BEAT IN-BETWEEN (The Magic Button) */}
      {isEditable && (
        <div className="flex items-center justify-center my-0.5 group">
          <div className="h-[1px] flex-1 bg-white/[0.04] group-hover:bg-white/[0.12] transition-colors" />
          <button
            type="button"
            onClick={onInsertBeatAfter}
            className="px-2.5 py-0.5 rounded-full bg-white/[0.03] hover:bg-white/[0.10] border border-white/[0.06] hover:border-white/20 text-white/35 hover:text-white text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] active:scale-95 select-none"
            title="แทรกบีตใหม่คั่นกลางตรงนี้"
          >
            <Plus size={10} strokeWidth={2.4} />
            <span>แทรกบีต</span>
          </button>
          <div className="h-[1px] flex-1 bg-white/[0.04] group-hover:bg-white/[0.12] transition-colors" />
        </div>
      )}
    </div>
  );
}
