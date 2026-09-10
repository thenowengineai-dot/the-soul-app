import { useEffect } from 'react';
import { Zap, Play, ArrowRight, X, Sparkles } from 'lucide-react';
import type { VaultDraft } from '../types';

interface CelebrationPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayNow: () => void;
  draft: VaultDraft;
}

export default function CelebrationPublishModal({
  isOpen,
  onClose,
  onPlayNow,
  draft,
}: CelebrationPublishModalProps) {
  // ปิดด้วยปุ่ม Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const characterName = draft.title || 'ตัวละครใหม่';
  const worldName = draft.worldTitle || 'โลกใบใหม่';
  const avatar = draft.image || draft.images?.[0] || 'https://images.unsplash.com/photo-1578632767115-351597cf2477';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      {/* Pop-up Box Shell */}
      <div className="relative w-full max-w-[460px] rounded-3xl bg-[#121214]/95 backdrop-blur-2xl border border-white/10 shadow-[0_24px_50px_rgba(0,0,0,0.8)] p-6 sm:p-7 flex flex-col items-center text-center overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full pointer-events-none blur-3xl opacity-20"
          style={{ backgroundColor: draft.themeColor || '#EF264C' }}
        />

        {/* Close Button (X) */}
        <button
          type="button"
          onClick={onClose}
          title="ปิดหน้าต่าง"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#ACACB2] hover:text-[#F2F2F5] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={15} strokeWidth={2.2} />
        </button>

        {/* Character Portrait with Status Ring */}
        <div className="relative mt-2 mb-3">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#EF264C]/70 shadow-[0_8px_24px_rgba(239,38,76,0.25)] relative">
            <img
              src={avatar}
              alt={characterName}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Live Indicator Icon */}
          <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#EF264C] text-white flex items-center justify-center shadow-md border-2 border-[#121214]">
            <Zap size={14} className="fill-current" />
          </div>
        </div>

        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[12px] font-bold tracking-wide">
          <Sparkles size={13} />
          <span>เผยแพร่สู่ Hot Cache แล้ว (0.002s)</span>
        </div>

        {/* Title & Lore Overview */}
        <h2 className="text-[22px] sm:text-[25px] font-black text-[#F2F2F5] tracking-tight mt-3">
          {characterName}
        </h2>
        <p className="text-[14px] sm:text-[15px] font-medium text-[#ACACB2] mt-0.5">
          ในโลก: <span className="text-[#F2F2F5]">{worldName}</span>
        </p>

        {/* Narrative / Context Snippet */}
        <div className="w-full mt-4 p-3.5 rounded-2xl bg-[#1D1D1F]/90 border border-white/5 text-left">
          <div className="text-[11px] font-bold text-[#ACACB2] uppercase tracking-wider mb-1">
            พร้อมเล่นในห้องแชทแล้ว
          </div>
          <p className="text-[13px] text-[#ACACB2] leading-relaxed line-clamp-2">
            {draft.description ||
              'โครงสร้างโลก บทนำ ฉากเหตุการณ์ และอัตลักษณ์ตัวละครถูกอัดฉีดเข้าสู่ Upstash Redis เรียบร้อยแล้ว พร้อมเริ่มบทสนทนาทันที'}
          </p>
        </div>

        {/* Actions Dock */}
        <div className="w-full mt-6 flex flex-col gap-2.5">
          {/* Primary CTA: Play Now */}
          <button
            type="button"
            onClick={onPlayNow}
            className="w-full py-3 px-6 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white font-bold text-[15.5px] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-sm select-none"
          >
            <Play size={16} className="fill-current" />
            <span>เข้าสู่ห้องเล่นทันที (Play Now)</span>
            <ArrowRight size={16} strokeWidth={2.2} />
          </button>

          {/* Secondary: Stay in Studio */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-6 rounded-full border border-[#2F3336] bg-transparent hover:bg-white/[0.08] hover:border-white/35 text-[#F2F2F5] font-medium text-[14px] transition-all cursor-pointer active:scale-95 select-none"
          >
            สร้างสรรค์ในสตูดิโอต่อ
          </button>
        </div>
      </div>
    </div>
  );
}
