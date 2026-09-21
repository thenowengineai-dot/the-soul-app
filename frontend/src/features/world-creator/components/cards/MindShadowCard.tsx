import { useState, useEffect } from 'react';
import { Shield, Zap, Heart, Pencil, Check } from 'lucide-react';
import type { VaultDraft } from '../../types';

interface MindShadowCardProps {
  draft: VaultDraft;
  onUpdateDraft?: (updated: Partial<VaultDraft>) => void;
  isEditable?: boolean;
}

export default function MindShadowCard({
  draft,
  onUpdateDraft,
  isEditable = true,
}: MindShadowCardProps) {
  const [isEditing, setIsEditing] = useState(false);

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

  return (
    <div className="w-full flex justify-center py-2">
      {/* ========================================================================= */}
      {/* ✦ THE MASTER PSYCHOLOGY CARD: THE 3-TIER GLASS CHAMBER                    */}
      {/* 4x2 Module in 165px Bento Grid: 708px wide x 346px high (Lego snapped)   */}
      {/* ========================================================================= */}
      <div
        className="w-full max-w-[708px] rounded-[28px] p-4 sm:p-5 bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all flex flex-col justify-between relative overflow-hidden"
        style={{ minHeight: '346px' }}
      >
        {/* Top Header Row: Title & In-Place Edit Control */}
        <div className="flex items-center justify-between shrink-0 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[#EF264C] text-[13px]">✦</span>
            <span className="text-[16px] sm:text-[17px] font-semibold text-[#F1F1F1] tracking-tight">
              จิตวิทยาและสองขั้วอารมณ์
            </span>
            <span className="text-[11px] text-white/40 font-normal hidden sm:inline">
              (Duality Architecture)
            </span>
          </div>

          {isEditable && (
            <div>
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleSave}
                  className="h-7 px-3 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white text-[12px] font-medium flex items-center gap-1.5 shadow-[0_2px_8px_rgba(239,38,76,0.4)] transition-all cursor-pointer active:scale-95"
                  title="บันทึกข้อมูล"
                >
                  <Check size={13} strokeWidth={2.4} />
                  <span>บันทึก</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] active:scale-95"
                  title="แก้ไขข้อมูลจิตวิทยา"
                >
                  <Pencil size={12} strokeWidth={2} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3-Tier Glass Chamber Stack */}
        <div className="flex-1 flex flex-col justify-between gap-2.5">
          {/* ===================================================================== */}
          {/* TIER 1: 🛡️ THE MASK (หน้ากากทางสังคม)                                 */}
          {/* ===================================================================== */}
          <div className="p-3 sm:p-3.5 rounded-[20px] bg-black/35 hover:bg-black/45 backdrop-blur-xl border border-white/[0.07] transition-all flex items-start gap-3 sm:gap-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]">
            {/* Tactile Icon Orb: Shield */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full shrink-0 flex items-center justify-center bg-cyan-500/10 text-cyan-400 border border-cyan-400/25 shadow-[0_0_14px_rgba(34,211,238,0.15)] mt-0.5">
              <Shield size={19} strokeWidth={2.2} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] sm:text-[12.5px] font-semibold text-cyan-300/90 tracking-wide uppercase">
                  หน้ากากทางสังคม
                </span>
                <span className="text-[10px] text-white/35 font-mono">
                  THE MASK
                </span>
              </div>

              {isEditing ? (
                <textarea
                  rows={2}
                  value={socialMask}
                  onChange={(e) => setSocialMask(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-[12px] sm:text-[12.5px] text-[#EDEDED] outline-none leading-relaxed resize-none"
                  placeholder="ระบุบุคลิกภายนอกที่แสดงต่อหน้าโลกและสังคม..."
                />
              ) : (
                <p className="text-[12.5px] sm:text-[13px] text-[#EDEDED] leading-relaxed font-normal">
                  {socialMask}
                </p>
              )}
            </div>
          </div>

          {/* ===================================================================== */}
          {/* TIER 2: ⚡ THE CONFLICT (จุดขัดแย้งในใจ)                               */}
          {/* ===================================================================== */}
          <div className="p-3 sm:p-3.5 rounded-[20px] bg-black/35 hover:bg-black/45 backdrop-blur-xl border border-white/[0.07] transition-all flex items-start gap-3 sm:gap-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]">
            {/* Tactile Icon Orb: Lightning */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full shrink-0 flex items-center justify-center bg-amber-500/10 text-amber-400 border border-amber-400/25 shadow-[0_0_14px_rgba(251,191,36,0.15)] mt-0.5">
              <Zap size={19} strokeWidth={2.2} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] sm:text-[12.5px] font-semibold text-amber-300/90 tracking-wide uppercase">
                  จุดขัดแย้งในใจ
                </span>
                <span className="text-[10px] text-white/35 font-mono">
                  THE CONFLICT
                </span>
              </div>

              {isEditing ? (
                <textarea
                  rows={2}
                  value={coreConflict}
                  onChange={(e) => setCoreConflict(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-[12px] sm:text-[12.5px] text-[#EDEDED] outline-none leading-relaxed resize-none"
                  placeholder="ระบุการต่อสู้ระหว่างสองขั้ว หรือชนวนที่ทำให้หน้ากากแตกสลาย..."
                />
              ) : (
                <p className="text-[12.5px] sm:text-[13px] text-[#EDEDED] leading-relaxed font-normal">
                  {coreConflict}
                </p>
              )}
            </div>
          </div>

          {/* ===================================================================== */}
          {/* TIER 3: ❤️ THE CORE (ธาตุแท้ใต้หน้ากาก)                                 */}
          {/* ===================================================================== */}
          <div className="p-3 sm:p-3.5 rounded-[20px] bg-black/35 hover:bg-black/45 backdrop-blur-xl border border-white/[0.07] transition-all flex items-start gap-3 sm:gap-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]">
            {/* Tactile Icon Orb: Heart */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full shrink-0 flex items-center justify-center bg-[#EF264C]/10 text-[#EF264C] border border-[#EF264C]/25 shadow-[0_0_14px_rgba(239,38,76,0.20)] mt-0.5">
              <Heart size={19} strokeWidth={2.2} fill="currentColor" fillOpacity={0.15} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] sm:text-[12.5px] font-semibold text-rose-400 tracking-wide uppercase">
                  ธาตุแท้ใต้หน้ากาก
                </span>
                <span className="text-[10px] text-white/35 font-mono">
                  THE CORE
                </span>
              </div>

              {isEditing ? (
                <textarea
                  rows={2}
                  value={theCore}
                  onChange={(e) => setTheCore(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 focus:border-[#EF264C] rounded-lg px-2.5 py-1.5 text-[12px] sm:text-[12.5px] text-[#EDEDED] outline-none leading-relaxed resize-none"
                  placeholder="ระบุตัวตนเนื้อแท้ กิเลส และสัญชาตญาณดิบที่ซ่อนอยู่..."
                />
              ) : (
                <p className="text-[12.5px] sm:text-[13px] text-[#EDEDED] leading-relaxed font-normal">
                  {theCore}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
