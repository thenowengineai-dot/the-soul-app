import { useState, useEffect } from 'react';
import { Pencil, Check, Clapperboard } from 'lucide-react';
import type { VaultDraft } from '../../types';

interface WorldPrologueCardProps {
  draft: VaultDraft;
  onUpdateDraft?: (updated: Partial<VaultDraft>) => void;
  isEditable?: boolean;
}

const DEFAULT_THAI_NAME = 'พฤกษศาสตร์ถอดหน้ากาก: พิษร้อนและน้ำมังกร';
const DEFAULT_EN_NAME = 'The Botanical Poison & Dragon Water Ritual';
const DEFAULT_PREMISE =
  'บรรยากาศยามบ่าย ณ เรียวกังออนเซ็นกลางทิวเขาอันสงบเงียบ ควรจะเป็นช่วงเวลาแห่งการพักผ่อน แต่ชมรมพฤกษศาสตร์กลับได้รับภารกิจด่วนในการเก็บกู้สมุนไพรหายาก สายลมเย็นเยือกด้านนอกเริ่มพัดกวาดเอาความชื้นและเมฆดำทะมึนเข้าครอบคลุม ผืนป่าแปรเปลี่ยนเป็นดินแดนลึลับ และในท่ามกลางความตึงเครียดของกิจกรรมชมรม [PLAYER] กำลังจะถูกเหวี่ยงเข้าไปอยู่ในสถานการณ์ที่ไม่มีทางถอยกลับ';

export default function WorldPrologueCard({
  draft,
  onUpdateDraft,
  isEditable = true,
}: WorldPrologueCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const [thaiName, setThaiName] = useState(() => {
    return draft.thai_name || DEFAULT_THAI_NAME;
  });

  const [enName, setEnName] = useState(() => {
    return draft.worldTitle || DEFAULT_EN_NAME;
  });

  const [premise, setPremise] = useState(() => {
    return draft.prologue?.premise || draft.description || DEFAULT_PREMISE;
  });

  // Sync draft updates if changed externally
  useEffect(() => {
    if (draft.thai_name) setThaiName(draft.thai_name);
    if (draft.worldTitle) setEnName(draft.worldTitle);
    if (draft.prologue?.premise) setPremise(draft.prologue.premise);
  }, [draft.thai_name, draft.worldTitle, draft.prologue?.premise]);

  // Save changes
  const handleSave = () => {
    setIsEditing(false);
    const cleanedThai = thaiName.trim() || DEFAULT_THAI_NAME;
    const cleanedEn = enName.trim() || DEFAULT_EN_NAME;
    const cleanedPremise = premise.trim() || DEFAULT_PREMISE;

    setThaiName(cleanedThai);
    setEnName(cleanedEn);
    setPremise(cleanedPremise);

    if (onUpdateDraft) {
      onUpdateDraft({
        thai_name: cleanedThai,
        worldTitle: cleanedEn,
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
      className={`col-span-2 row-span-2 rounded-[28px] p-4 sm:p-5 ${frostedCardClass}`}
      style={{ width: '346px', height: '346px' }}
    >
      {/* 1. Header Row: Category Badge + In-Place Edit Control */}
      <div className="flex items-center justify-between shrink-0 mb-1.5 px-0.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C]" />
          <span className="text-[11px] font-semibold tracking-wider text-white/50 uppercase">
            ปฐมบทภาพยนตร์
          </span>
        </div>

        {isEditable && (
          <div className="shrink-0">
            {isEditing ? (
              <button
                type="button"
                onClick={handleSave}
                className="w-7 h-7 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(239,38,76,0.4)] transition-all cursor-pointer active:scale-95"
                title="บันทึกปฐมบท"
              >
                <Check size={13} strokeWidth={2.4} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] active:scale-95"
                title="แก้ไขปฐมบท"
              >
                <Pencil size={12} strokeWidth={2} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Body Stage: Display vs Edit Mode */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {!isEditing ? (
          <div className="flex-1 flex flex-col justify-between min-h-0">
            {/* Masthead: Dual-Language Title */}
            <div className="shrink-0 text-center px-1 pt-1">
              <h3 className="text-[17px] sm:text-[18px] font-bold text-[#F1F1F1] tracking-tight leading-snug line-clamp-2">
                {thaiName}
              </h3>
              <p className="text-[11px] sm:text-[11.5px] text-[#A1A1A8] font-normal leading-normal truncate mt-1">
                {enName}
              </p>
            </div>

            {/* Top Horizon Hairline Gradient */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.16] to-transparent my-2 shrink-0" />

            {/* Cinematic Prologue Premise (Voice Over Text) */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0 flex items-center justify-center">
              <p className="text-[12.5px] sm:text-[13px] text-[#D6D6DC] font-normal leading-[21px] tracking-wide text-center px-2 select-text">
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
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar py-1">
            <div>
              <label className="text-[10.5px] font-medium text-white/50 block mb-1">
                ชื่อโลก / ชื่อเรื่องภาษาไทย
              </label>
              <input
                type="text"
                value={thaiName}
                onChange={(e) => setThaiName(e.target.value)}
                placeholder="ชื่อโลกภาษาไทย..."
                className="w-full p-2 rounded-xl bg-white/[0.06] border border-white/10 text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="text-[10.5px] font-medium text-white/50 block mb-1">
                ชื่อเรื่องภาษาอังกฤษ (English Title)
              </label>
              <input
                type="text"
                value={enName}
                onChange={(e) => setEnName(e.target.value)}
                placeholder="English World Title..."
                className="w-full p-2 rounded-xl bg-white/[0.06] border border-white/10 text-[12px] text-white/90 placeholder-white/30 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="text-[10.5px] font-medium text-white/50 block mb-1">
                บทบรรยายเปิดโลกภาพยนตร์ (Prologue Premise)
              </label>
              <textarea
                value={premise}
                onChange={(e) => setPremise(e.target.value)}
                placeholder="พิมพ์บทบรรยายเปิดโลก..."
                rows={4}
                className="w-full p-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-[12px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-none leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
