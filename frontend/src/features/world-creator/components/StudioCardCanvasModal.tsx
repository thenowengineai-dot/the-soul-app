import { useState, useEffect } from 'react';
import {
  X,
  User,
  Globe,
  Workflow,
} from 'lucide-react';
import type { VaultDraft } from '../types';
import IdentityVisualCard from './cards/IdentityVisualCard';
import MindShadowCard from './cards/MindShadowCard';
import DynamicsCharismaCard from './cards/DynamicsCharismaCard';
import LoreBackgroundCard from './cards/LoreBackgroundCard';
import WorldAtmosphereCard from './cards/WorldAtmosphereCard';
import WorldPrologueCard from './cards/WorldPrologueCard';
import WorldDeepDiveStageCard from './cards/WorldDeepDiveStageCard';
import WorldBeatCard from './cards/WorldBeatCard';
import RailroadCanvas from './railroad/RailroadCanvas';

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
  const [activeStudioTab, setActiveStudioTab] = useState<'character' | 'world' | 'railroad'>('character');
  const [activeLocationKey, setActiveLocationKey] = useState<string>(() => {
    if (draft.real_locations && Object.keys(draft.real_locations).length > 0) {
      return Object.keys(draft.real_locations)[0];
    }
    return 'ห้องสกัดสมุนไพร ณ เรือนพักปีกใน';
  });

  // Keep activeLocationKey valid if draft updates
  useEffect(() => {
    if (draft.real_locations && Object.keys(draft.real_locations).length > 0) {
      const keys = Object.keys(draft.real_locations);
      if (!keys.includes(activeLocationKey)) {
        setActiveLocationKey(keys[0]);
      }
    }
  }, [draft.real_locations, activeLocationKey]);

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
      <header className="relative h-[60px] sm:h-[64px] shrink-0 border-b border-white/[0.08] px-6 sm:px-8 flex items-center justify-between bg-app-bg/85 backdrop-blur-2xl z-20">
        {/* Left Spacer for absolute center balance */}
        <div className="w-10 sm:w-24 shrink-0" />

        {/* Center: Apple Tactile Segmented Studio Switcher (Dead Center) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center p-1 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <button
            type="button"
            onClick={() => setActiveStudioTab('character')}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer flex items-center gap-1.5 select-none ${
              activeStudioTab === 'character'
                ? 'bg-white/10 text-[#F1F1F1] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] border border-white/10'
                : 'text-white/45 hover:text-white/80 border border-transparent'
            }`}
          >
            <User size={13} strokeWidth={2.2} />
            <span>ตัวละคร</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStudioTab('world')}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer flex items-center gap-1.5 select-none ${
              activeStudioTab === 'world'
                ? 'bg-white/10 text-[#F1F1F1] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] border border-white/10'
                : 'text-white/45 hover:text-white/80 border border-transparent'
            }`}
          >
            <Globe size={13} strokeWidth={2.2} />
            <span>โลก</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStudioTab('railroad')}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer flex items-center gap-1.5 select-none ${
              activeStudioTab === 'railroad'
                ? 'bg-white/10 text-[#F1F1F1] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] border border-white/10'
                : 'text-white/45 hover:text-white/80 border border-transparent'
            }`}
          >
            <Workflow size={13} strokeWidth={2.2} />
            <span>เส้นเรื่อง</span>
          </button>
        </div>

        {/* Right: Close Action */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.10] hover:border-white/20 text-white/85 hover:text-white text-[12.5px] font-medium flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]"
          >
            <X size={14} strokeWidth={2.4} />
            <span className="hidden sm:inline">กลับสู่ห้องแชท</span>
            <span className="text-white/30 text-[10px] uppercase font-mono px-1 rounded bg-white/5 hidden sm:inline">
              ESC
            </span>
          </button>
        </div>
      </header>

      {/* 2. MAIN SCROLLABLE CANVAS STAGE */}
      {activeStudioTab === 'railroad' ? (
        <div className="flex-1 w-full h-full flex flex-col relative overflow-hidden">
          <RailroadCanvas
            draft={draft}
            onUpdateDraft={onUpdateDraft}
            isEditable={true}
          />
        </div>
      ) : (
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
              {activeStudioTab === 'character' ? (
                /* Character Studio Bento Suite (8 Cards in 4 Components) */
                <>
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
                  <LoreBackgroundCard
                    draft={draft}
                    onUpdateDraft={onUpdateDraft}
                    isEditable={true}
                  />
                </>
              ) : (
                /* World & Scenario Bento Suite (Cards W1, W2, W3, W4) */
                <>
                  {/* Card W1: World Title & Macro-Atmosphere Sanctuary (2x2) */}
                  <WorldAtmosphereCard
                    draft={draft}
                    onUpdateDraft={onUpdateDraft}
                    isEditable={true}
                  />
                  {/* Card W2: Prologue Narrative (2x2) */}
                  <WorldPrologueCard
                    draft={draft}
                    onUpdateDraft={onUpdateDraft}
                    isEditable={true}
                  />
                  {/* Card W3: Deep-Dive Stage Card (2x2, with Master Scene Selector & 5 Dimensions) */}
                  <WorldDeepDiveStageCard
                    draft={draft}
                    activeLocationKey={activeLocationKey}
                    onSelectLocation={setActiveLocationKey}
                    onUpdateDraft={onUpdateDraft}
                    isEditable={true}
                  />
                  {/* Card W4: The Cinematic Beat Widget (2x2, with Beat Selector & Approach 1 Wording) */}
                  <WorldBeatCard
                    draft={draft}
                    onUpdateDraft={onUpdateDraft}
                    isEditable={true}
                  />
                </>
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
