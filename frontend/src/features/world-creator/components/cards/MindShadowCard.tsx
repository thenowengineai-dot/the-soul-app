import { useState, useEffect } from 'react';
import { Shield, Zap, Heart, Pencil, Check, ChevronRight } from 'lucide-react';
import type { VaultDraft } from '../../types';

interface MindShadowCardProps {
  draft: VaultDraft;
  onUpdateDraft?: (updated: Partial<VaultDraft>) => void;
  isEditable?: boolean;
}

type AccordionKey = 'mask' | 'conflict' | 'core';

export default function MindShadowCard({
  draft,
  onUpdateDraft,
  isEditable = true,
}: MindShadowCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeKey, setActiveKey] = useState<AccordionKey>('mask');

  // 1. Social Mask (หน้ากากทางสังคม)
  const [socialMask, setSocialMask] = useState(
    draft.psychology?.the_mask ||
      'รุ่นพี่สาวแว่นผู้มีการศึกษา พูดจาสุภาพเรียบร้อยเหนียมอาย สวมเสื้อผ้าหนาเตอะเพื่อปิดบังเรือนร่างและหลีกเลี่ยงสังคม'
  );

  // 2. The Conflict (จุดขัดแย้งในใจ)
  const [coreConflict, setCoreConflict] = useState(
    draft.psychology?.the_conflict ||
      'การต่อสู้ระหว่างสามัญสำนึกของรุ่นพี่ผู้มีการศึกษา กับสัญชาตญาณความต้องการทางเพศที่พร้อมจะปะทุระเบิดทุกครั้งเมื่อร่างกายต้องอุณหภูมิที่ร้อนขึ้น'
  );

  // 3. The Core (ธาตุแท้ใต้หน้ากาก)
  const [theCore, setTheCore] = useState(
    draft.psychology?.the_core ||
      'นักล่ากามารมณ์จอมวางแผนผู้มีความต้องการสูงลิ่ว ใช้ทฤษฎีวิชาการมาบิดเบือนเป็นข้ออ้างเพื่อจับเหยื่อตรึงไว้กับที่อย่างไร้ยางอาย'
  );

  // Sync draft props if updated externally
  useEffect(() => {
    if (draft.psychology?.the_mask) {
      setSocialMask(draft.psychology.the_mask);
    }
    if (draft.psychology?.the_conflict) {
      setCoreConflict(draft.psychology.the_conflict);
    }
    if (draft.psychology?.the_core) {
      setTheCore(draft.psychology.the_core);
    }
  }, [
    draft.psychology?.the_mask,
    draft.psychology?.the_conflict,
    draft.psychology?.the_core,
  ]);

  // Save changes handler
  const handleSave = () => {
    setIsEditing(false);
    if (onUpdateDraft) {
      onUpdateDraft({
        psychology: {
          ...draft.psychology,
          the_mask: socialMask,
          the_conflict: coreConflict,
          the_core: theCore,
        },
      });
    }
  };

  // Apple Frosted Glass Recipe matching Section 1
  const frostedCardClass =
    'bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all flex flex-col justify-between relative overflow-hidden';

  return (
    <>
        <div
          className={`col-span-2 row-span-2 rounded-[28px] p-4 ${frostedCardClass}`}
          style={{ width: '346px', height: '346px' }}
        >
          {/* Header Row: Pure Title (NO icon in front) + In-Place Edit Pill */}
          <div className="flex items-center justify-between shrink-0 mb-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[16.5px] sm:text-[17.5px] font-semibold text-[#F1F1F1] tracking-tight">
                ตัวตนเบื้องลึก
              </span>
              <span className="text-[11.5px] font-normal text-white/40">
                (3 มิติ)
              </span>
            </div>

            {isEditable && (
              <div>
                {isEditing ? (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="w-7 h-7 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(239,38,76,0.4)] transition-all cursor-pointer active:scale-95"
                    title="บันทึก"
                  >
                    <Check size={13} strokeWidth={2.4} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] active:scale-95"
                    title="แก้ไขตัวตนเบื้องลึก"
                  >
                    <Pencil size={12} strokeWidth={2} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Body Content */}
          {isEditing ? (
            /* ================================================================= */
            /* ✦ EDITING MODE: COMPACT IN-PLACE TEXTAREAS                        */
            /* ================================================================= */
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar py-1">
              <div>
                <label className="text-[11px] font-medium text-cyan-300/90 tracking-wide uppercase mb-0.5 block">
                  หน้ากากทางสังคม (The Mask)
                </label>
                <textarea
                  rows={2}
                  value={socialMask}
                  onChange={(e) => setSocialMask(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 focus:border-cyan-400 rounded-lg p-2 text-[12px] text-[#EDEDED] outline-none leading-relaxed resize-none"
                  placeholder="บุคลิกภายนอกที่แสดงต่อโลก..."
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-amber-300/90 tracking-wide uppercase mb-0.5 block">
                  จุดขัดแย้งในใจ (The Conflict)
                </label>
                <textarea
                  rows={2}
                  value={coreConflict}
                  onChange={(e) => setCoreConflict(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 focus:border-amber-400 rounded-lg p-2 text-[12px] text-[#EDEDED] outline-none leading-relaxed resize-none"
                  placeholder="การต่อสู้ระหว่างสองขั้ว หรือชนวนแตกหัก..."
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-rose-300/90 tracking-wide uppercase mb-0.5 block">
                  ธาตุแท้ใต้หน้ากาก (The Core)
                </label>
                <textarea
                  rows={2}
                  value={theCore}
                  onChange={(e) => setTheCore(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 focus:border-[#EF264C] rounded-lg p-2 text-[12px] text-[#EDEDED] outline-none leading-relaxed resize-none"
                  placeholder="ตัวตนเนื้อแท้และสัญชาตญาณดิบ..."
                />
              </div>
            </div>
          ) : (
            /* ================================================================= */
            /* ✦ READING MODE: INTERACTIVE ACCORDION CHAMBER                     */
            /* Tap any row to smoothly expand 100% full text without truncation  */
            /* ================================================================= */
            <div className="flex-1 p-2 rounded-[20px] bg-black/35 backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.35)] flex flex-col justify-between overflow-hidden gap-1.5">
              {/* =============================================================== */}
              {/* 1. 🛡️ THE MASK (หน้ากากทางสังคม)                                 */}
              {/* =============================================================== */}
              {activeKey === 'mask' ? (
                /* EXPANDED VIEW */
                <div className="flex-1 p-2.5 rounded-[16px] bg-white/[0.04] border border-cyan-400/20 shadow-[inset_0_1px_0_rgba(34,211,238,0.12)] flex flex-col justify-between overflow-hidden transition-all">
                  <div className="flex items-center justify-between shrink-0 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center bg-cyan-500/15 text-cyan-400 border border-cyan-400/30 shadow-[0_0_10px_rgba(34,211,238,0.20)]">
                        <Shield size={14} strokeWidth={2.4} />
                      </div>
                      <span className="text-[13.5px] sm:text-[14px] font-semibold text-cyan-300 tracking-wide">
                        หน้ากากทางสังคม
                      </span>
                    </div>
                    <span className="text-[9.5px] text-cyan-400/60 font-mono tracking-wider">
                      THE MASK
                    </span>
                  </div>

                  <p className="text-[13px] sm:text-[13.5px] text-[#F1F1F4] leading-[21px] font-normal overflow-y-auto no-scrollbar pr-0.5">
                    {socialMask}
                  </p>
                </div>
              ) : (
                /* COLLAPSED ROW */
                <button
                  type="button"
                  onClick={() => setActiveKey('mask')}
                  className="w-full px-2.5 py-1.5 rounded-[13px] hover:bg-white/[0.04] flex items-center justify-between transition-all cursor-pointer text-left select-none group"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center bg-cyan-500/10 text-cyan-400 border border-cyan-400/20">
                      <Shield size={12} strokeWidth={2} />
                    </div>
                    <span className="text-[12.5px] sm:text-[13px] font-medium text-white/80 group-hover:text-cyan-300 transition-colors shrink-0">
                      หน้ากากทางสังคม
                    </span>
                    <span className="text-[11px] text-white/35 truncate ml-1 font-normal">
                      {socialMask}
                    </span>
                  </div>
                  <ChevronRight size={13} className="text-white/30 group-hover:text-cyan-300 shrink-0 ml-1 transition-colors" />
                </button>
              )}

              {/* =============================================================== */}
              {/* 2. ⚡ THE CONFLICT (จุดขัดแย้งในใจ)                             */}
              {/* =============================================================== */}
              {activeKey === 'conflict' ? (
                /* EXPANDED VIEW */
                <div className="flex-1 p-2.5 rounded-[16px] bg-white/[0.04] border border-amber-400/20 shadow-[inset_0_1px_0_rgba(251,191,36,0.12)] flex flex-col justify-between overflow-hidden transition-all">
                  <div className="flex items-center justify-between shrink-0 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center bg-amber-500/15 text-amber-400 border border-amber-400/30 shadow-[0_0_10px_rgba(251,191,36,0.20)]">
                        <Zap size={14} strokeWidth={2.4} />
                      </div>
                      <span className="text-[13.5px] sm:text-[14px] font-semibold text-amber-300 tracking-wide">
                        จุดขัดแย้งในใจ
                      </span>
                    </div>
                    <span className="text-[9.5px] text-amber-400/60 font-mono tracking-wider">
                      THE CONFLICT
                    </span>
                  </div>

                  <p className="text-[13px] sm:text-[13.5px] text-[#F1F1F4] leading-[21px] font-normal overflow-y-auto no-scrollbar pr-0.5">
                    {coreConflict}
                  </p>
                </div>
              ) : (
                /* COLLAPSED ROW */
                <button
                  type="button"
                  onClick={() => setActiveKey('conflict')}
                  className="w-full px-2.5 py-1.5 rounded-[13px] hover:bg-white/[0.04] flex items-center justify-between transition-all cursor-pointer text-left select-none group"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center bg-amber-500/10 text-amber-400 border border-amber-400/20">
                      <Zap size={12} strokeWidth={2} />
                    </div>
                    <span className="text-[12.5px] sm:text-[13px] font-medium text-white/80 group-hover:text-amber-300 transition-colors shrink-0">
                      จุดขัดแย้งในใจ
                    </span>
                    <span className="text-[11px] text-white/35 truncate ml-1 font-normal">
                      {coreConflict}
                    </span>
                  </div>
                  <ChevronRight size={13} className="text-white/30 group-hover:text-amber-300 shrink-0 ml-1 transition-colors" />
                </button>
              )}

              {/* =============================================================== */}
              {/* 3. ❤️ THE CORE (ธาตุแท้ใต้หน้ากาก)                               */}
              {/* =============================================================== */}
              {activeKey === 'core' ? (
                /* EXPANDED VIEW */
                <div className="flex-1 p-2.5 rounded-[16px] bg-white/[0.04] border border-rose-400/20 shadow-[inset_0_1px_0_rgba(244,63,94,0.12)] flex flex-col justify-between overflow-hidden transition-all">
                  <div className="flex items-center justify-between shrink-0 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center bg-rose-500/15 text-rose-400 border border-rose-400/30 shadow-[0_0_10px_rgba(244,63,94,0.22)]">
                        <Heart size={14} strokeWidth={2.4} fill="currentColor" fillOpacity={0.25} />
                      </div>
                      <span className="text-[13.5px] sm:text-[14px] font-semibold text-rose-300 tracking-wide">
                        ธาตุแท้ใต้หน้ากาก
                      </span>
                    </div>
                    <span className="text-[9.5px] text-rose-400/60 font-mono tracking-wider">
                      THE CORE
                    </span>
                  </div>

                  <p className="text-[13px] sm:text-[13.5px] text-[#F1F1F4] leading-[21px] font-normal overflow-y-auto no-scrollbar pr-0.5">
                    {theCore}
                  </p>
                </div>
              ) : (
                /* COLLAPSED ROW */
                <button
                  type="button"
                  onClick={() => setActiveKey('core')}
                  className="w-full px-2.5 py-1.5 rounded-[13px] hover:bg-white/[0.04] flex items-center justify-between transition-all cursor-pointer text-left select-none group"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center bg-rose-500/10 text-rose-400 border border-rose-400/20">
                      <Heart size={12} strokeWidth={2} fill="currentColor" fillOpacity={0.2} />
                    </div>
                    <span className="text-[12.5px] sm:text-[13px] font-medium text-white/80 group-hover:text-rose-300 transition-colors shrink-0">
                      ธาตุแท้ใต้หน้ากาก
                    </span>
                    <span className="text-[11px] text-white/35 truncate ml-1 font-normal">
                      {theCore}
                    </span>
                  </div>
                  <ChevronRight size={13} className="text-white/30 group-hover:text-rose-300 shrink-0 ml-1 transition-colors" />
                </button>
              )}
            </div>
          )}
        </div>
    </>
  );
}
