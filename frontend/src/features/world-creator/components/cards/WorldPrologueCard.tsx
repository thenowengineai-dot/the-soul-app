import { useState, useEffect } from 'react';
import { Pencil, Check } from 'lucide-react';
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
      className={`col-span-1 row-span-2 rounded-[28px] p-4 ${frostedCardClass}`}
      style={{ width: '165px', height: '346px' }}
    >
      {/* 1. Header Row: Clean "บทนำ" Title + Circular Edit Button (Strict Apple Consistency) */}
      <div className="flex items-center justify-between shrink-0 mb-3 px-0.5">
        <span className="text-[16px] sm:text-[17px] font-semibold text-[#F1F1F1] tracking-tight">
          บทนำ
        </span>

        {isEditable && (
          <div className="shrink-0">
            {isEditing ? (
              <button
                type="button"
                onClick={handleSave}
                className="w-7 h-7 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(239,38,76,0.4)] transition-all cursor-pointer active:scale-95"
                title="บันทึกบทนำ"
              >
                <Check size={13} strokeWidth={2.4} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] active:scale-95"
                title="แก้ไขบทนำ"
              >
                <Pencil size={12} strokeWidth={2} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Body Stage: Display vs Edit Mode (Pure Apple Subtractive Design - No Hairlines, No Footer Meta) */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {!isEditing ? (
          <div className="flex-1 flex flex-col min-h-0 relative">
            {/* Ambient Literary Watermark Quote Mark (Jony Ive Distance Silhouette: มองไกลๆ รู้ทันทีว่าเป็นบทความ/เรื่องเล่า) */}
            <span
              className="text-[34px] font-serif text-white/[0.10] select-none pointer-events-none leading-none -mb-2 block shrink-0"
              aria-hidden="true"
            >
              “
            </span>

            {/* Cinematic Prologue Premise (Smooth Scrollable Editorial Column) */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0 pt-0.5 pb-2">
              <p className="text-[12px] sm:text-[12.5px] text-[#EDEDED] font-normal leading-[21px] tracking-tight select-text text-left">
                {premise}
              </p>
            </div>
          </div>
        ) : (
          /* Edit Mode Form */
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar py-1 flex flex-col min-h-0">
            <textarea
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
              placeholder="พิมพ์บทบรรยายเปิดโลก..."
              className="w-full flex-1 p-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-[12px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-none leading-relaxed min-h-[220px]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
