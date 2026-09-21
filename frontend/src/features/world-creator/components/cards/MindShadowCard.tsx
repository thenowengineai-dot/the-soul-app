import { useState, useEffect } from 'react';
import {
  Pencil,
  Check,
  Plus,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Flame,
  Zap,
} from 'lucide-react';
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

  // 1. Social Mask (สิ่งที่โลกภายนอกมองเห็น)
  const [maskHeadline, setMaskHeadline] = useState(
    'รุ่นพี่สาวแว่นผู้มีการศึกษาเหนียมอาย'
  );
  const [socialMask, setSocialMask] = useState(
    draft.psychology?.the_mask ||
      'รุ่นพี่สาวแว่นผู้มีการศึกษา พูดจาสุภาพเรียบร้อยเหนียมอาย สวมเสื้อผ้าหนาเตอะเพื่อปิดบังเรือนร่างและหลีกเลี่ยงสังคม'
  );

  // 2. Shadow Self & Core Wound (ตัวตนใต้เงามืด & บาดแผลในใจ)
  const [shadowHeadline, setShadowHeadline] = useState(
    'นักล่ากามารมณ์จอมวางแผนใต้เสื้อโคร่ง'
  );
  const [shadowSelf, setShadowSelf] = useState(
    draft.psychology?.the_core ||
      'นักล่ากามารมณ์จอมวางแผนผู้มีความต้องการสูงลิ่ว ใช้ทฤษฎีวิชาการมาบิดเบือนเป็นข้ออ้างเพื่อจับเหยื่อตรึงไว้กับที่อย่างไร้ยางอาย'
  );
  const [coreConflict, setCoreConflict] = useState(
    draft.psychology?.the_conflict ||
      'การต่อสู้ระหว่างสามัญสำนึกของรุ่นพี่ผู้มีการศึกษา กับสัญชาตญาณความต้องการทางเพศที่พร้อมจะปะทุระเบิดทุกครั้งเมื่อร่างกายต้องอุณหภูมิที่ร้อนขึ้น'
  );

  // 3. Core Desire (แรงขับปรารถนาสูงสุดจากผู้เล่นจริงลึกๆ)
  const [coreDesire, setCoreDesire] = useState(
    draft.psychology?.core_desire ||
      'ต้องการให้ผู้เล่นมองทะลุแว่นหนาเตอะเข้ามาเห็นเรือนร่างและความกระหายที่แท้จริง พร้อมยินยอมให้เธอใช้ทฤษฎีพฤกษศาสตร์พันธนาการไว้ในห้องทดลองส่วนตัว'
  );

  // 4. Emotional Triggers (จุดเปราะบาง & สิ่งที่ห้ามแตะ)
  const [triggers, setTriggers] = useState<string[]>(() => {
    const raw = draft.psychology?.emotional_triggers || [];
    return raw.length > 0
      ? raw
      : [
          'การถูกถอดแว่นตาออกกะทันหัน — เมื่อใบหน้าไร้การปกป้อง จะควบคุมแววตาหิวกระหายไว้ไม่ได้จนเกิดอาการสั่นเกร็ง',
          'การสัมผัสที่ซอกคอหรือไหปลาร้า — จุดปล่อยฟีโรโมนและความร้อน หากสัมผัสจะตัดขาดความมีเหตุผลในทันที',
          'การถูกเรียกชื่อจริงด้วยน้ำเสียงกระซิบข้างหู — ทลายหน้ากากรอยยิ้มสุภาพจนแทบคลั่ง ยอมจำนนต่อสัญชาตญาณดิบ',
        ];
  });
  const [activeTriggerIndex, setActiveTriggerIndex] = useState(0);

  // Sync draft props if updated externally
  useEffect(() => {
    if (draft.psychology?.the_mask) {
      setSocialMask((prev) =>
        prev !== draft.psychology?.the_mask ? draft.psychology!.the_mask! : prev
      );
    }
    if (draft.psychology?.the_core) {
      setShadowSelf((prev) =>
        prev !== draft.psychology?.the_core ? draft.psychology!.the_core! : prev
      );
    }
  }, [draft.psychology?.the_mask, draft.psychology?.the_core]);

  // Save changes handler
  const handleSave = () => {
    setIsEditing(false);
    if (onUpdateDraft) {
      onUpdateDraft({
        psychology: {
          ...draft.psychology,
          the_mask: socialMask,
          the_core: shadowSelf,
          the_conflict: coreConflict,
          core_desire: coreDesire,
          emotional_triggers: triggers,
        },
      });
    }
  };

  const handleAddTrigger = () => {
    const nextIdx = triggers.length + 1;
    const newTrigger = `ระบุจุดเปราะบางหรือพฤติกรรมที่ห้ามแตะลำดับที่ ${nextIdx}...`;
    setTriggers((prev) => [...prev, newTrigger]);
    setActiveTriggerIndex(triggers.length);
  };

  const handleRemoveTrigger = (idx: number) => {
    if (triggers.length <= 1) return;
    const filtered = triggers.filter((_, i) => i !== idx);
    setTriggers(filtered);
    setActiveTriggerIndex((prev) =>
      Math.max(0, Math.min(filtered.length - 1, prev >= idx ? prev - 1 : prev))
    );
  };

  // Apple Subtle White Frosted Glass Recipe (Consistent with Section 1)
  const frostedCardClass =
    'bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all flex flex-col justify-between relative overflow-hidden';

  return (
    <div className="w-full flex justify-center py-2">
      {/* ========================================================================= */}
      {/* ✦ MATHEMATICAL GAME GRID: 165px BASE UNIT, 16px GAP                        */}
      {/* Card 1: 2x2 (346x346) | Card 2: 2x1 (346x165) | Card 3: 2x1 (346x165)      */}
      {/* Card 2 + Card 3 = 165 + 16 + 165 = 346px (PERFECT SYMMETRICAL LEGO SNAP)  */}
      {/* ========================================================================= */}
      <div
        className="grid gap-4 justify-center"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, 165px)',
          gridAutoRows: '165px',
          width: '100%',
          maxWidth: '1440px',
        }}
      >
        {/* ======================================================================= */}
        {/* 🎭 CARD 1: THE DUAL PERSONA MIRROR (2x2 -> 346px × 346px - MASK VS SHADOW)*/}
        {/* ======================================================================= */}
        <div
          className={`col-span-2 row-span-2 rounded-[28px] p-4 ${frostedCardClass}`}
          style={{ width: '346px', height: '346px' }}
        >
          {/* Top Bar: Title + Tactile Edit Pill */}
          <div className="flex items-center justify-between shrink-0 h-7 mb-1">
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#EF264C]" />
              <span className="text-[15px] sm:text-[16px] font-semibold text-[#F1F1F1] tracking-tight">
                กระจกทวิภาวะ
              </span>
              <span className="text-[10.5px] font-normal text-white/40">
                (หน้ากาก & เงามืด)
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
                    title="แก้ไข"
                  >
                    <Pencil size={12} strokeWidth={2} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Upper Zone: Social Mask (หน้ากากทางสังคม) */}
          <div className="space-y-1 py-1">
            <div className="flex items-center gap-1.5">
              <Sun size={12} className="text-amber-300" />
              <span className="text-[11px] font-semibold text-amber-300/90 uppercase tracking-wider">
                หน้ากากทางสังคม (Social Mask)
              </span>
            </div>

            {isEditing ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={maskHeadline}
                  onChange={(e) => setMaskHeadline(e.target.value)}
                  className="w-full bg-black/30 border border-white/15 focus:border-[#EF264C] rounded px-2 py-0.5 text-[11.5px] font-semibold text-white outline-none"
                  placeholder="หัวข้อหน้ากาก..."
                />
                <textarea
                  rows={2}
                  value={socialMask}
                  onChange={(e) => setSocialMask(e.target.value)}
                  className="w-full bg-black/25 border border-white/15 focus:border-[#EF264C] rounded px-2 py-1 text-[11px] text-[#EDEDED] outline-none leading-relaxed resize-none"
                  placeholder="สิ่งที่โลกภายนอกมองเห็น..."
                />
              </div>
            ) : (
              <div>
                <div className="text-[13.5px] font-semibold text-white tracking-tight leading-snug truncate">
                  {maskHeadline}
                </div>
                <p className="text-[11.5px] sm:text-[12px] text-[#A1A1A8] leading-relaxed line-clamp-2 mt-0.5 font-normal">
                  {socialMask}
                </p>
              </div>
            )}
          </div>

          {/* Psychological Horizon (จุดตัดแห่งความขัดแย้ง 1px Hairline + Star) */}
          <div className="relative flex items-center justify-center my-1 shrink-0">
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <span className="absolute bg-[#18181A] px-2 text-[9.5px] font-medium text-white/40 tracking-wider flex items-center gap-1 border border-white/[0.08] rounded-full">
              <span className="text-[#EF264C] text-[8px]">✦</span>
              <span>จุดขัดแย้งในใจ</span>
            </span>
          </div>

          {/* Lower Zone: Shadow Self & Core Wound Inset Tray (ตัวตนใต้เงามืด) */}
          <div className="flex-1 p-3 rounded-[18px] bg-black/40 backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.35)] flex flex-col justify-between overflow-hidden">
            <div className="flex items-center gap-1.5 shrink-0">
              <Moon size={12} className="text-[#EF264C]" />
              <span className="text-[11px] font-semibold text-[#EF264C]/90 uppercase tracking-wider">
                ตัวตนใต้เงามืด (Shadow Self)
              </span>
            </div>

            {isEditing ? (
              <div className="flex-1 flex flex-col justify-between gap-1 overflow-y-auto no-scrollbar">
                <input
                  type="text"
                  value={shadowHeadline}
                  onChange={(e) => setShadowHeadline(e.target.value)}
                  className="w-full bg-black/30 border border-white/15 focus:border-[#EF264C] rounded px-2 py-0.5 text-[11.5px] font-semibold text-white outline-none shrink-0"
                  placeholder="หัวข้อเงามืด..."
                />
                <textarea
                  rows={2}
                  value={shadowSelf}
                  onChange={(e) => setShadowSelf(e.target.value)}
                  className="w-full bg-black/25 border border-white/15 focus:border-[#EF264C] rounded px-2 py-1 text-[11px] text-[#EDEDED] outline-none leading-relaxed resize-none flex-1"
                  placeholder="สิ่งที่ซ่อนไว้และบาดแผลในใจ..."
                />
                <input
                  type="text"
                  value={coreConflict}
                  onChange={(e) => setCoreConflict(e.target.value)}
                  className="w-full bg-black/25 border border-white/10 focus:border-[#EF264C] rounded px-2 py-0.5 text-[10px] text-white/70 outline-none shrink-0"
                  placeholder="ความขัดแย้งภายในใจ..."
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-white tracking-tight leading-snug truncate">
                    {shadowHeadline}
                  </div>
                  <p className="text-[11.5px] text-[#D6D6DC] leading-relaxed line-clamp-2 mt-0.5 font-normal">
                    {shadowSelf}
                  </p>
                </div>
                <div className="text-[10px] text-white/40 italic truncate border-t border-white/[0.05] pt-1">
                  {coreConflict}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 🔥 CARD 2: CORE DESIRE (2x1 -> 346px × 165px - THE BURNING DESIRE)       */}
        {/* ======================================================================= */}
        <div
          className={`col-span-2 row-span-1 rounded-[28px] p-3.5 ${frostedCardClass}`}
          style={{ width: '346px', height: '165px' }}
        >
          {/* Header Row */}
          <div className="flex items-center justify-between gap-1 shrink-0">
            <div className="flex items-center gap-1.5">
              <Flame size={13} className="text-[#EF264C]" />
              <span className="text-[15px] sm:text-[16px] font-semibold text-[#F1F1F1] tracking-tight">
                แรงขับปรารถนาสูงสุด
              </span>
            </div>

            <span className="text-[10px] font-medium text-[#EF264C] bg-[#EF264C]/10 border border-[#EF264C]/25 px-2 py-0.5 rounded-full">
              ✦ ต้องการจากผู้เล่น
            </span>
          </div>

          {/* Center Full-Prose Tray */}
          <div className="flex-1 p-2.5 sm:p-3 rounded-[18px] bg-black/40 backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.35)] flex flex-col justify-center overflow-hidden my-1">
            {isEditing ? (
              <textarea
                rows={3}
                value={coreDesire}
                onChange={(e) => setCoreDesire(e.target.value)}
                placeholder="ระบุสิ่งที่ตัวละครโหยหาและต้องการจากผู้เล่นจริงลึกๆ..."
                className="w-full h-full bg-transparent border-none text-[12px] text-white outline-none leading-relaxed resize-none no-scrollbar p-0"
              />
            ) : (
              <div className="flex items-start gap-1.5 select-text overflow-hidden">
                <span className="text-[#EF264C] text-[11px] font-serif select-none shrink-0 mt-0.5">
                  “
                </span>
                <p className="text-[12px] sm:text-[12.5px] text-[#EDEDED] leading-relaxed font-normal line-clamp-3 overflow-y-auto no-scrollbar pr-0.5">
                  {coreDesire}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Footnote */}
          <div className="flex items-center justify-between text-[10px] text-white/40 shrink-0 px-0.5">
            <span>แรงจูงใจเบื้องลึกในการเปิดใจ</span>
            <span className="text-white/60 font-medium">Core Drive</span>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* ⚡ CARD 3: EMOTIONAL TRIGGERS (2x1 -> 346px × 165px - SENSITIVE SWITCHES) */}
        {/* ======================================================================= */}
        <div
          className={`col-span-2 row-span-1 rounded-[28px] p-3.5 ${frostedCardClass}`}
          style={{ width: '346px', height: '165px' }}
        >
          {/* Header Row: Title + Slide Navigation (< 01 / 03 >) */}
          <div className="flex items-center justify-between gap-1 shrink-0">
            <div className="flex items-baseline gap-1.5">
              <Zap size={13} className="text-amber-400" />
              <span className="text-[15px] sm:text-[16px] font-semibold text-[#F1F1F1] tracking-tight">
                จุดเปราะบาง & สิ่งที่ห้ามแตะ
              </span>
              <span className="text-[11px] font-normal text-white/45">
                ({triggers.length} จุด)
              </span>
            </div>

            {/* Slide Navigation Controls */}
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-xl border border-white/[0.08] px-1.5 py-0.5 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <button
                type="button"
                onClick={() =>
                  setActiveTriggerIndex((prev) =>
                    prev > 0 ? prev - 1 : triggers.length - 1
                  )
                }
                className="w-5 h-5 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                title="จุดก่อนหน้า"
              >
                <ChevronLeft size={12} strokeWidth={2.4} />
              </button>

              <span className="text-[10.5px] font-mono font-medium text-white/80 tracking-wider px-1 select-none">
                {String(activeTriggerIndex + 1).padStart(2, '0')}
                <span className="text-white/30 mx-0.5">/</span>
                {String(triggers.length).padStart(2, '0')}
              </span>

              <button
                type="button"
                onClick={() =>
                  setActiveTriggerIndex((prev) =>
                    prev < triggers.length - 1 ? prev + 1 : 0
                  )
                }
                className="w-5 h-5 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                title="จุดถัดไป"
              >
                <ChevronRight size={12} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          {/* Center Stage: Full Trigger Description */}
          <div className="flex-1 p-2.5 sm:p-3 rounded-[18px] bg-black/40 backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.35)] flex flex-col justify-center overflow-hidden my-1">
            {isEditing ? (
              <textarea
                rows={3}
                value={triggers[activeTriggerIndex] || ''}
                onChange={(e) => {
                  const updated = [...triggers];
                  updated[activeTriggerIndex] = e.target.value;
                  setTriggers(updated);
                }}
                placeholder="ระบุคำอธิบายจุดเปราะบางหรือพฤติกรรมที่ห้ามแตะ..."
                className="w-full h-full bg-transparent border-none text-[12px] text-white outline-none leading-relaxed resize-none no-scrollbar p-0"
              />
            ) : (
              <div
                key={activeTriggerIndex}
                className="flex items-start gap-1.5 animate-fade-in-scale select-text overflow-hidden"
              >
                <span className="text-amber-400 text-[11px] font-serif select-none shrink-0 mt-0.5">
                  ⚡
                </span>
                <p className="text-[12px] sm:text-[12.5px] text-[#EDEDED] leading-relaxed font-normal line-clamp-3 overflow-y-auto no-scrollbar pr-0.5">
                  {triggers[activeTriggerIndex]}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Row: Quick-Jump Monospace Pills & Action */}
          <div className="flex items-center justify-between gap-1.5 shrink-0 select-none">
            {/* Quick-Jump Monospace Number Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {triggers.map((_, idx) => {
                const isActive = idx === activeTriggerIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveTriggerIndex(idx)}
                    className={`h-5 px-2 rounded-full text-[10px] font-mono flex items-center justify-center transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white/20 text-white border border-white/30 font-semibold shadow-sm'
                        : 'bg-white/[0.04] hover:bg-white/[0.10] border border-white/[0.06] text-white/50 hover:text-white font-normal'
                    }`}
                  >
                    0{idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Actions: Delete (when editing) or Quick Add Pill */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isEditing && triggers.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveTrigger(activeTriggerIndex)}
                  className="text-[10px] text-red-400/80 hover:text-red-300 flex items-center gap-0.5 cursor-pointer transition-colors mr-1"
                  title="ลบจุดนี้"
                >
                  <Trash2 size={10} /> ลบจุดนี้
                </button>
              )}

              <button
                type="button"
                onClick={handleAddTrigger}
                className="px-2 py-0.5 rounded-full border border-dashed border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.08] text-white/60 hover:text-white flex items-center gap-1 text-[10px] font-medium transition-all cursor-pointer active:scale-95"
                title="เพิ่มจุดเปราะบางใหม่"
              >
                <Plus size={9} strokeWidth={2.4} />
                <span>เพิ่มจุด</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
