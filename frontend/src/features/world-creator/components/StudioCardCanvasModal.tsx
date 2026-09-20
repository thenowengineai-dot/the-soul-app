import { useEffect } from 'react';
import {
  X,
  Sparkles,
  Layers,
  Globe,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import type { VaultDraft } from '../types';
import IdentityVisualCard from './cards/IdentityVisualCard';

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
  onTalkAboutCard,
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
    <div className="fixed inset-0 z-50 bg-[#090909] text-[#F1F1F1] flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* ✦ AMBIENT BACKDROP LIGHT */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#EF264C]/[0.07] via-white/[0.02] to-transparent pointer-events-none blur-3xl -z-10" />

      {/* 1. TOP CONTROL BAR (APPLE EDITORIAL LUXURY) */}
      <header className="h-[64px] shrink-0 border-b border-white/[0.08] px-6 sm:px-8 flex items-center justify-between bg-[#090909]/80 backdrop-blur-2xl z-20">
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
              {draft.title || 'ตัวละครใหม่'}
            </span>
          </div>
        </div>

        {/* Center: Completion Pill */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <span className="w-2 h-2 rounded-full bg-[#EF264C] animate-pulse" />
          <span className="text-[12px] font-medium text-[#F1F1F1]">
            พิมพ์เขียวตัวละคร: 1 / 4 การ์ดสร้างแล้ว
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
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 flex justify-center">
        <div className="w-full max-w-[1520px] space-y-8 pb-24">
          {/* STAGE HEADER SUMMARY */}
          <div className="text-center max-w-2xl mx-auto pt-2 pb-2">
            <span className="text-[11px] font-medium uppercase tracking-widest text-[#EF264C] bg-[#EF264C]/10 px-3 py-1 rounded-full border border-[#EF264C]/20 inline-block mb-3">
              ✦ Conversational Blueprint Canvas • Apple macOS Bento Architecture
            </span>
            <h1 className="text-[26px] sm:text-[32px] font-bold text-[#F1F1F1] tracking-tight">
              สถาปัตยกรรมตัวละคร (Character Architecture)
            </h1>
            <p className="text-[14px] text-[#AAAAAA] mt-2 font-normal leading-relaxed">
              การ์ดคริสตัลรมควันสร้างขึ้นจากบทสนทนากับ The Muse ตรวจสอบและแก้ไขรายละเอียดได้โดยตรง
            </p>
          </div>

          {/* ✦ CARD 1: IDENTITY & VISUAL (LIVE ACTIVE BENTO CANVAS) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-[12px] font-medium text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C]" />
                <span>การ์ดที่ 1 • Identity & Visual (เปิดใช้งานแล้ว)</span>
              </div>
              <span className="text-[11px] text-white/30 font-light">พร้อมใช้งานในระบบ Kinematics HUD</span>
            </div>

            <IdentityVisualCard
              draft={draft}
              onUpdateDraft={onUpdateDraft}
              isEditable={true}
            />
          </section>

          {/* ✦ UPCOMING CARDS WITH EDITORIAL EMPTY STATE */}
          <div className="pt-6 space-y-4">
            <div className="flex items-center gap-3 px-1 text-[12.5px] font-medium text-white/40 uppercase tracking-wider">
              <span>การ์ดที่กำลังรอการร่วมสร้างกับ The Muse</span>
              <div className="flex-1 h-[1px] bg-white/[0.06]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CARD 2 EMPTY STATE: Mind & Shadow */}
              <div className="rounded-[22px] bg-white/[0.02] hover:bg-white/[0.035] border border-dashed border-white/10 p-6 text-center transition-all flex flex-col justify-between items-center min-h-[240px]">
                <div className="space-y-3 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/40">
                    <Sparkles size={18} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="text-[15.5px] font-semibold text-[#F1F1F1]">
                      การ์ดที่ 2 • Mind & Shadow
                    </h3>
                    <p className="text-[12px] text-[#AAAAAA] mt-1.5 leading-relaxed font-light line-clamp-3">
                      จิตวิทยา, หน้ากาก & ตัวตนเบื้องลึก บาดแผลในใจ แรงขับปรารถนาสูงสุด และจุดเปราะบางทางอารมณ์
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onTalkAboutCard) {
                      onTalkAboutCard('มาคุยเรื่องจิตวิทยา หน้ากากทางสังคม และบาดแผลในใจของตัวละครกันต่อครับ');
                    }
                  }}
                  className="mt-4 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/85 hover:text-white text-[12px] font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <MessageSquare size={12} />
                  <span>คุยกับ The Muse</span>
                  <ArrowRight size={11} />
                </button>
              </div>

              {/* CARD 3 EMPTY STATE: Dynamics & Charisma */}
              <div className="rounded-[22px] bg-white/[0.02] hover:bg-white/[0.035] border border-dashed border-white/10 p-6 text-center transition-all flex flex-col justify-between items-center min-h-[240px]">
                <div className="space-y-3 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/40">
                    <Layers size={18} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="text-[15.5px] font-semibold text-[#F1F1F1]">
                      การ์ดที่ 3 • Dynamics & Charisma
                    </h3>
                    <p className="text-[12px] text-[#AAAAAA] mt-1.5 leading-relaxed font-light line-clamp-3">
                      สเตตัส 7 แกน & สกิลเฉพาะตัว หลอดสเตตัสพลวัตปฏิสัมพันธ์ (Initiative, Dominance, Playfulness)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onTalkAboutCard) {
                      onTalkAboutCard('มาคุยเรื่องสเตตัส 7 มิติและเสน่ห์เฉพาะตัวของตัวละครกันต่อครับ');
                    }
                  }}
                  className="mt-4 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/85 hover:text-white text-[12px] font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <MessageSquare size={12} />
                  <span>คุยกับ The Muse</span>
                  <ArrowRight size={11} />
                </button>
              </div>

              {/* CARD 4 EMPTY STATE: Lore & Secret Vault */}
              <div className="rounded-[22px] bg-white/[0.02] hover:bg-white/[0.035] border border-dashed border-white/10 p-6 text-center transition-all flex flex-col justify-between items-center min-h-[240px]">
                <div className="space-y-3 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/40">
                    <Globe size={18} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="text-[15.5px] font-semibold text-[#F1F1F1]">
                      การ์ดที่ 4 • Lore & Secret Vault
                    </h3>
                    <p className="text-[12px] text-[#AAAAAA] mt-1.5 leading-relaxed font-light line-clamp-3">
                      ปูมหลัง & คลังความลับ 3 ระดับ เรื่องราวอดีต ความสัมพันธ์ฝังใจ ปลดล็อกตามค่าความผูกพัน
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onTalkAboutCard) {
                      onTalkAboutCard('มาคุยเรื่องปูมหลังอดีตและคลังความลับที่ซ่อนอยู่ของตัวละครกันต่อครับ');
                    }
                  }}
                  className="mt-4 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/85 hover:text-white text-[12px] font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <MessageSquare size={12} />
                  <span>คุยกับ The Muse</span>
                  <ArrowRight size={11} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
