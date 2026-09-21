import { useState, useEffect } from 'react';
import { Pencil, Check, Clapperboard } from 'lucide-react';
import type { VaultDraft } from '../../types';

interface WorldPrologueCardProps {
  draft: VaultDraft;
  onUpdateDraft?: (updated: Partial<VaultDraft>) => void;
  isEditable?: boolean;
}

const DEFAULT_PREMISE =
  'ทริปเก็บกู้สมุนไพรของชมรมพฤกษศาสตร์ ณ เรียวกังออนเซ็นกลางหุบเขาที่ดูสงบเงียบ ควรจะเป็นช่วงเวลาแห่งการพักผ่อน แต่เมื่อเมฆฝนดำทะมึนเริ่มปิดล้อมป่า ละอองเกสรพิษกำเริบ และสติของรุ่นพี่สาวแว่นเริ่มหลุดลอย [PLAYER] กำลังจะถูกเหวี่ยงเข้าไปอยู่ในสถานการณ์ที่ไม่มีทางถอยกลับ...';

export default function WorldPrologueCard({
  draft,
  onUpdateDraft,
  isEditable = true,
}: WorldPrologueCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const [premise, setPremise] = useState(() => {
    return draft.prologue?.premise || draft.description || DEFAULT_PREMISE;
  });

  // Sync draft updates if changed externally
  useEffect(() => {
    if (draft.prologue?.premise) setPremise(draft.prologue.premise);
  }, [draft.prologue?.premise]);

  // Save changes
  const handleSave = () => {
    setIsEditing(false);
    const cleanedPremise = premise.trim() || DEFAULT_PREMISE;
    setPremise(cleanedPremise);

    if (onUpdateDraft) {
      onUpdateDraft({
        prologue: {
          ...(draft.prologue || { question: '', choices: [] }),
          premise: cleanedPremise,
        },
      });
    }
  };

  // Apple Subtle Frosted Glass Recipe
  const frostedCardClass =
    'bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all flex flex-col justify-between relative overflow-hidden';

  return (
    <div
      className={`col-span-2 row-span-2 rounded-[28px] p-5 ${frostedCardClass}`}
      style={{ width: '346px', height: '346px' }}
    >
      {/* 1. Header Row: Standard Widget Title + Meta (Strict Consistency with Character Studio) */}
      <div className="flex items-center justify-between shrink-0 mb-2 px-0.5">
        <div className="flex items-baseline gap-1.5 min-w-0 pr-2">
          <span className="text-[16px] sm:text-[17px] font-semibold text-[#F1F1F1] tracking-tight whitespace-nowrap">
            ฉากเปิดเรื่อง
          </span>
          <span className="text-[11.5px] font-normal text-white/45 whitespace-nowrap">
            (บทนำ)
          </span>
        </div>

        {isEditable && (
          <div className="shrink-0">
            {isEditing ? (
              <button
                type="button"
                onClick={handleSave}
                className="w-8 h-8 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(239,38,76,0.4)] transition-all cursor-pointer active:scale-95"
                title="บันทึกฉากเปิดเรื่อง"
              >
                <Check size={14} strokeWidth={2.4} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] active:scale-95"
                title="แก้ไขฉากเปิดเรื่อง"
              >
                <Pencil size={13} strokeWidth={2} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Body Stage: Display vs Edit Mode */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {!isEditing ? (
          <div className="flex-1 flex flex-col justify-between min-h-0">
            {/* Top Horizon Hairline Gradient */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.16] to-transparent my-2 shrink-0" />

            {/* Cinematic Prologue Premise (Voice Over Narrative Text) */}
            <div className="flex-1 overflow-y-auto pr-1.5 custom-scrollbar min-h-0 flex items-center justify-center">
              <p className="text-[13px] sm:text-[13.5px] text-[#D6D6DC] font-normal leading-[23px] tracking-wide text-center px-2 select-text">
                {premise}
              </p>
            </div>

            {/* Bottom Horizon Hairline Gradient */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.16] to-transparent my-2 shrink-0" />

            {/* Subtle Footer Meta */}
            <div className="shrink-0 flex items-center justify-between text-[10.5px] text-white/35 px-1">
              <span className="flex items-center gap-1">
                <Clapperboard size={11} className="text-white/40" />
                <span>บทนำจำลองสถานการณ์</span>
              </span>
              <span className="font-mono text-[9.5px] tracking-widest text-white/30 uppercase">
                SCENE 01 SETUP
              </span>
            </div>
          </div>
        ) : (
          /* Edit Mode Form */
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar py-2 flex flex-col justify-center">
            <label className="text-[10.5px] font-medium text-white/50 block">
              บทบรรยายเปิดโลกภาพยนตร์ (Prologue Premise)
            </label>
            <textarea
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
              placeholder="พิมพ์บทบรรยายเปิดโลก..."
              rows={8}
              className="w-full flex-1 p-3 rounded-2xl bg-white/[0.06] border border-white/10 text-[12.5px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-none leading-relaxed"
            />
          </div>
        )}
      </div>
    </div>
  );
}
