import { useEffect } from 'react';
import {
  X,
  Sparkles,
} from 'lucide-react';
import type { VaultDraft } from '../types';
import IdentityVisualCard from './cards/IdentityVisualCard';
import MindShadowCard from './cards/MindShadowCard';
import DynamicsCharismaCard from './cards/DynamicsCharismaCard';

interface StudioCardCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: VaultDraft;
  onUpdateDraft?: (updated: Partial<VaultDraft>) => void;
  onTalkAboutCard?: (topic: string) => void;
}

export default function StudioCardCanvasModal({
  isOpen,
  onClose,
  draft,
  onUpdateDraft,
  onTalkAboutCard: _onTalkAboutCard,
}: StudioCardCanvasModalProps) {
  // ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-app-bg text-[#F1F1F1] flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* ✦ AMBIENT BACKDROP LIGHT */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#EF264C]/[0.06] via-white/[0.02] to-transparent pointer-events-none blur-3xl -z-10" />

      {/* 1. TOP CONTROL BAR (APPLE EDITORIAL LUXURY) */}
      <header className="h-[64px] shrink-0 border-b border-white/[0.08] px-6 sm:px-8 flex items-center justify-between bg-app-bg/85 backdrop-blur-2xl z-20">
        {/* Left: Brand + Breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#EF264C] flex items-center justify-center shadow-[0_2px_10px_rgba(239,38,76,0.35)]">
            <Sparkles size={15} className="text-white" strokeWidth={2.4} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-[#F1F1F1] tracking-tight">
              The Soul Studio
            </span>
            <span className="text-white/20 text-[12px]">/</span>
            <span className="text-[13px] text-[#AAAAAA]">
              โหมดการ์ดเต็มจอ (Full Canvas)
            </span>
            <span className="text-white/20 text-[12px]">/</span>
            <span className="text-[13px] text-[#F1F1F1] font-medium">
              {draft.title || 'ตัวละคร'}
            </span>
          </div>
        </div>

        {/* Center: Completion Pill */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <span className="w-2 h-2 rounded-full bg-[#EF264C] animate-pulse" />
          <span className="text-[12px] font-medium text-[#F1F1F1]">
            พิมพ์เขียวตัวละคร: 2 / 4 หมวดหลักสร้างแล้ว
          </span>
        </div>

        {/* Right: Close Action */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.10] hover:border-white/20 text-white/85 hover:text-white text-[12.5px] font-medium flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]"
          >
            <X size={14} strokeWidth={2.4} />
            <span>กลับสู่ห้องแชท</span>
            <span className="text-white/30 text-[10px] uppercase font-mono px-1 rounded bg-white/5">
              ESC
            </span>
          </button>
        </div>
      </header>

      {/* 2. MAIN SCROLLABLE CANVAS STAGE */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 flex justify-center items-start">
        <div className="w-full max-w-[1440px] pb-24 flex justify-center">
          {/* =============================================================== */}
          {/* ✦ UNIFIED MASTER BENTO GRID (165px BASE UNIT, 16px GAP)          */}
          {/* All cards merged seamlessly into one continuous Bento Canvas     */}
          {/* =============================================================== */}
          <div
            className="grid gap-4 justify-center"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, 165px)',
              gridAutoRows: '165px',
              width: '100%',
              maxWidth: '1440px',
            }}
          >
            <IdentityVisualCard
              draft={draft}
              onUpdateDraft={onUpdateDraft}
              isEditable={true}
            />
            <MindShadowCard
              draft={draft}
              onUpdateDraft={onUpdateDraft}
              isEditable={true}
            />
            <DynamicsCharismaCard
              draft={draft}
              onUpdateDraft={onUpdateDraft}
              isEditable={true}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
