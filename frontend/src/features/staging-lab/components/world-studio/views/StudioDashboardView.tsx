import React, { useState } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  ArrowUpRight,
  User,
  Flame,
  Shield,
  Layers,
  HeartHandshake,
  Compass,
} from 'lucide-react'
import type { WorldWorkspace, WorldCharacterCard } from '../../../types'
import type { StudioActiveView } from '../types'

interface StudioDashboardViewProps {
  activeWorld: WorldWorkspace
  isForgingCharacter: boolean
  onForgeCharacter: (brief: string) => Promise<void>
  onUpdateCharacter: (characterId: string, updates: Partial<WorldCharacterCard>) => void
  onDeleteCharacter: (characterId: string) => void
  onSelectCharacter: (characterId: string) => void
  onSendCharacterToStage: (character: WorldCharacterCard) => void
  setActiveView: (view: StudioActiveView) => void
  onAddNewStageCell: () => void
}

const BRIEF_PRESETS = [
  {
    label: 'รุ่นพี่สาวทรงเสน่ห์',
    brief: 'รุ่นพี่สาวผมยาวสลวยสีดำขลับ หน้าอกอวบอิ่ม หุ่นนาฬิกาทราย มีเสน่ห์ลึกลับน่าค้นหา เบื้องหน้าเป็นคนมุ่งมั่นกับการสอบชิงทุนและเข้มงวดมาก แต่ลึกๆ แอบเหงาและโหยหาคนที่เข้าใจ',
  },
  {
    label: 'คุณหนูนักสืบปากร้าย',
    brief: 'คุณหนูนักสืบตัวเล็กผมลอนสีน้ำตาล ตากลมโตแต่เชิดหยิ่ง ปากร้ายชอบพูดเหน็บแนมดักคอคนอื่นเพื่อซ่อนความกลัวการถูกหักหลัง แต่ลึกๆ แพ้ทางคนใจเย็นที่ไม่ถือสาคำด่า',
  },
  {
    label: 'เด็กสาวขี้อายแว่นหนา',
    brief: 'สาวแว่นเรียบร้อยเงียบๆ มักก้มหน้าหลบตา สวมกระโปรงยาว สรีระบอบบางแต่มีเสน่ห์ใสซื่อ พูดน้อยยอมคนเสมอเพื่อไม่ให้เป็นภาระ แต่ลึกๆ ดื้อเงียบและอยากมีตัวตนในสายตาใครสักคน',
  },
]

export const StudioDashboardView: React.FC<StudioDashboardViewProps> = ({
  activeWorld,
  isForgingCharacter,
  onForgeCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
  onSelectCharacter,
  onSendCharacterToStage,
  setActiveView,
  onAddNewStageCell,
}) => {
  const [briefInput, setBriefInput] = useState('')
  const [isBriefExpanded, setIsBriefExpanded] = useState(false)

  const characters = activeWorld.characters || []
  const activeCharacter =
    characters.find((c) => c.id === activeWorld.activeCharacterId) ||
    characters[0] ||
    null

  const hasLore = Boolean(activeWorld.rawLore && activeWorld.rawLore.trim().length > 0)
  const hasSpark = Boolean(activeWorld.sparkText && activeWorld.sparkText.trim().length > 0)
  const hasCharacter = characters.length > 0
  const hasStages = activeWorld.stageCells.length > 0

  const handleForge = async () => {
    if (!briefInput.trim() || isForgingCharacter) return
    await onForgeCharacter(briefInput.trim())
    setBriefInput('')
    setIsBriefExpanded(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* =========================================================================
          1. WORLD READINESS CHECKLIST & GUIDANCE HUD
          ========================================================================= */}
      <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 backdrop-blur-xl bg-[#141416]/80 hover:bg-[#141416]/85 border border-white/[0.12] hover:border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_20px_50px_rgba(0,0,0,0.65)] space-y-4 transition-all relative overflow-hidden">
        {/* Subtle glow */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              'radial-gradient(ellipse 90px 65px at 32px 0%, rgba(239, 38, 76, 0.08) 0%, transparent 75%)',
          }}
        />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#EF264C]">
              <Compass size={17} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#F1F1F1] tracking-tight">
                ภาพรวมความพร้อมของโลก: {activeWorld.title || 'โลกใบใหม่'}
              </h2>
              <p className="text-[12px] sm:text-[13px] text-white/50">
                สถานะความสมบูรณ์ของโลกในการนำขึ้นเวทีแสดงสด (Stage & Character Readiness)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveView({ type: 'master' })}
            className="h-8 px-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-[12px] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title="ไปยังหน้าเขียนเนื้อหาโลก"
          >
            <span>แก้ไขเนื้อหาโลก</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        {/* 4 Pillars Readiness Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Item 1: World Lore */}
          <div
            onClick={() => setActiveView({ type: 'master' })}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none group flex items-start justify-between gap-2.5 ${
              hasLore
                ? 'bg-emerald-500/[0.04] border-emerald-500/25 hover:border-emerald-500/40 hover:bg-emerald-500/[0.08]'
                : 'bg-white/[0.02] border-white/[0.08] hover:border-[#EF264C]/50 hover:bg-white/[0.04]'
            }`}
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {hasLore ? (
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle size={14} className="text-[#EF264C] shrink-0" />
                )}
                <span className="text-[13px] font-medium text-white/90 truncate">
                  1. เนื้อหาโลกหลัก
                </span>
              </div>
              <p className="text-[11px] text-white/45 truncate">
                {hasLore ? 'มีเนื้อหาพร้อมแล้ว' : 'ยังไม่ได้เริ่มเขียน'}
              </p>
            </div>
            <ArrowUpRight
              size={14}
              className="text-white/30 group-hover:text-white/80 transition-colors shrink-0 mt-0.5"
            />
          </div>

          {/* Item 2: The Spark */}
          <div
            onClick={() => setActiveView({ type: 'master' })}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none group flex items-start justify-between gap-2.5 ${
              hasSpark
                ? 'bg-emerald-500/[0.04] border-emerald-500/25 hover:border-emerald-500/40 hover:bg-emerald-500/[0.08]'
                : 'bg-white/[0.02] border-white/[0.08] hover:border-[#EF264C]/50 hover:bg-white/[0.04]'
            }`}
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {hasSpark ? (
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle size={14} className="text-amber-400/80 shrink-0" />
                )}
                <span className="text-[13px] font-medium text-white/90 truncate">
                  2. ชนวนเหตุ (Spark)
                </span>
              </div>
              <p className="text-[11px] text-white/45 truncate">
                {hasSpark ? 'มีจุดชนวนเปิดเรื่องแล้ว' : 'แนะนำให้สกัดสปาร์ค'}
              </p>
            </div>
            <ArrowUpRight
              size={14}
              className="text-white/30 group-hover:text-white/80 transition-colors shrink-0 mt-0.5"
            />
          </div>

          {/* Item 3: Character */}
          <div
            className={`p-3.5 rounded-xl border transition-all select-none flex items-start justify-between gap-2.5 ${
              hasCharacter
                ? 'bg-emerald-500/[0.04] border-emerald-500/25'
                : 'bg-[#EF264C]/[0.05] border-[#EF264C]/35'
            }`}
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {hasCharacter ? (
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                ) : (
                  <User size={14} className="text-[#EF264C] shrink-0" />
                )}
                <span className="text-[13px] font-medium text-white/90 truncate">
                  3. ตัวละครเอก
                </span>
              </div>
              <p className="text-[11px] text-white/45 truncate">
                {hasCharacter ? `สร้างแล้ว ${characters.length} ตัวละคร` : 'กำลังสร้างในหน้านี้'}
              </p>
            </div>
            {hasCharacter && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-400/10 text-emerald-300 shrink-0">
                พร้อม
              </span>
            )}
          </div>

          {/* Item 4: Stages & Attire */}
          <div
            onClick={onAddNewStageCell}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none group flex items-start justify-between gap-2.5 ${
              hasStages
                ? 'bg-emerald-500/[0.04] border-emerald-500/25 hover:border-emerald-500/40 hover:bg-emerald-500/[0.08]'
                : 'bg-white/[0.02] border-white/[0.08] hover:border-[#EF264C]/50 hover:bg-white/[0.04]'
            }`}
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {hasStages ? (
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                ) : (
                  <Layers size={14} className="text-white/40 shrink-0" />
                )}
                <span className="text-[13px] font-medium text-white/90 truncate">
                  4. สถานที่ & ชุด
                </span>
              </div>
              <p className="text-[11px] text-white/45 truncate">
                {hasStages ? `${activeWorld.stageCells.length} สถานที่` : 'กดเพื่อเพิ่มสถานที่'}
              </p>
            </div>
            <Plus
              size={14}
              className="text-white/30 group-hover:text-white/80 transition-colors shrink-0 mt-0.5"
            />
          </div>
        </div>

        {/* Prerequisite Friendly Guidance Alert if No Lore */}
        {!hasLore && (
          <div className="relative z-10 p-3.5 rounded-xl bg-amber-500/[0.07] border border-amber-500/25 flex items-center justify-between gap-3 text-[12.5px] text-amber-200/90">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-amber-400 shrink-0" />
              <span>
                <strong>คำแนะนำเริ่มต้น:</strong> เพื่อให้ AI ปั้นตัวละครที่กลมกลืนกับโลกของคุณ แนะนำให้เริ่มจากพิมพ์ <strong>เนื้อหาโลกหลัก</strong> สั้นๆ ก่อนครับ
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveView({ type: 'master' })}
              className="h-7 px-3 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/35 text-[11.5px] font-medium transition-all cursor-pointer shrink-0 active:scale-95 flex items-center gap-1"
            >
              <span>ไปเขียนเนื้อหาโลก</span>
              <ArrowRight size={12} />
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          2. CHARACTER GENERATOR CARD (QUICK BRIEF INPUT & FORGE ACTION)
          ========================================================================= */}
      <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 backdrop-blur-xl bg-[#141416]/80 hover:bg-[#141416]/85 border border-white/[0.12] hover:border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_20px_50px_rgba(0,0,0,0.65)] space-y-4 transition-all relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[16px] sm:text-[18px] font-semibold text-[#F1F1F1] tracking-tight">
              สร้างตัวละครเอกประจำโลก (Character Forge)
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-[#EF264C]/15 text-[#EF264C] border border-[#EF264C]/30">
              Unibody Persona
            </span>
          </div>
          {characters.length > 0 && (
            <button
              type="button"
              onClick={() => setIsBriefExpanded(!isBriefExpanded)}
              className="text-[12px] text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              {isBriefExpanded ? 'พับเก็บช่องสร้าง' : '+ สร้างตัวละครเพิ่ม'}
            </button>
          )}
        </div>

        {/* Brief Textarea & Suggestions (Open if no characters or expanded) */}
        {(characters.length === 0 || isBriefExpanded) && (
          <div className="space-y-3 pt-1 animate-in fade-in duration-200">
            {/* Quick Presets / Inspiration Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11.5px] text-white/40 mr-1">ไอเดียตัวอย่าง:</span>
              {BRIEF_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setBriefInput(preset.brief)}
                  className="px-2.5 py-1 rounded-full text-[11px] bg-white/[0.04] hover:bg-white/[0.08] text-white/65 hover:text-white border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer active:scale-95"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className="rounded-2xl p-4 bg-black/30 border border-white/[0.08] focus-within:border-[#EF264C]/50 transition-all space-y-3">
              <textarea
                rows={3}
                value={briefInput}
                onChange={(e) => setBriefInput(e.target.value)}
                placeholder="บอกไอเดียตัวละครที่คุณต้องการได้อิสระ: ผมยาว/สั้น สัดส่วนหุ่น หน้าอก เสน่ห์ดึงดูด นิสัย ความมุ่งมั่น ปมในใจ หรือบทบาทในโลกนี้..."
                className="w-full bg-transparent text-[14.5px] text-[#F1F1F1] placeholder-white/25 focus:outline-none resize-none leading-relaxed font-sans"
              />

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                <span className="text-[11.5px] text-white/40">
                  ระบบจะหล่อหลอมสายตัวละครเฉพาะตัวขึ้นใหม่สดๆ (ไม่ซ้ำใคร) พร้อมเจนสรีระ 5 เสาหลัก และ 2 เวกเตอร์แกนลาวา
                </span>

                <button
                  type="button"
                  onClick={handleForge}
                  disabled={!briefInput.trim() || isForgingCharacter}
                  className="h-[36px] sm:h-[38px] px-4 sm:px-5 rounded-full bg-[#EF264C] hover:bg-[#ff2d55] text-white flex items-center gap-2 text-[13px] font-medium transition-all cursor-pointer shrink-0 active:scale-95 border border-white/20 shadow-[0_0_24px_rgba(239,38,76,0.55),inset_0_1px_0_rgba(255,255,255,0.30)] disabled:opacity-40 disabled:cursor-not-allowed select-none"
                >
                  <Sparkles
                    size={15}
                    strokeWidth={2.2}
                    className={isForgingCharacter ? 'animate-spin' : ''}
                  />
                  <span>{isForgingCharacter ? 'กำลังหล่อหลอมตัวละคร...' : '✨ เจนการ์ดตัวละคร'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          3. ACTIVE CHARACTER INSPECTOR (THE 3-SOCKET LIVING CARD)
          ========================================================================= */}
      {activeCharacter && (
        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 backdrop-blur-xl bg-[#141416]/80 hover:bg-[#141416]/85 border border-white/[0.12] hover:border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_20px_50px_rgba(0,0,0,0.65)] space-y-6 transition-all relative overflow-hidden animate-in fade-in duration-200">
          {/* Subtle Carmine Glow near top border */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background:
                'radial-gradient(ellipse 120px 80px at 50% 0%, rgba(239, 38, 76, 0.12) 0%, transparent 75%)',
            }}
          />

          {/* Top Bar: Selector / Switcher if multiple characters + Delete */}
          {characters.length > 1 && (
            <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-white/[0.06]">
              {characters.map((c) => {
                const isCurrent = c.id === activeCharacter.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectCharacter(c.id)}
                    className={`h-7 px-3 rounded-full text-[12px] font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-white/[0.12] text-[#F1F1F1] border border-white/20'
                        : 'text-white/45 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isCurrent ? 'bg-[#EF264C]' : 'bg-white/30'
                      }`}
                    />
                    <span>{c.name || 'ตัวละคร'}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Character Identity Header: Name, Role, and Matched Archetype Badge */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  value={activeCharacter.name}
                  onChange={(e) =>
                    onUpdateCharacter(activeCharacter.id, { name: e.target.value })
                  }
                  placeholder="ชื่อตัวละคร..."
                  className="text-[22px] sm:text-[26px] font-bold text-[#F1F1F1] bg-transparent focus:outline-none placeholder-white/20 border-none p-0 tracking-tight"
                />
                {/* Unique Archetype Badge */}
                <div className="px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#EF264C]/15 border border-[#EF264C]/40 text-[#EF264C] flex items-center gap-1.5 shadow-[0_0_12px_rgba(239,38,76,0.2)]">
                  <span className="shrink-0">✨ สายเฉพาะตัว:</span>
                  <input
                    type="text"
                    value={activeCharacter.matchedArchetypeLabel || ''}
                    onChange={(e) =>
                      onUpdateCharacter(activeCharacter.id, {
                        matchedArchetypeLabel: e.target.value,
                      })
                    }
                    placeholder="ระบุสายเฉพาะตัว..."
                    className="font-bold bg-transparent text-[#EF264C] focus:outline-none placeholder-[#EF264C]/40 border-none p-0 w-auto min-w-[70px] max-w-[200px]"
                  />
                </div>
              </div>
              <input
                type="text"
                value={activeCharacter.roleTagline}
                onChange={(e) =>
                  onUpdateCharacter(activeCharacter.id, { roleTagline: e.target.value })
                }
                placeholder="บทบาทและฉายาในโลกนี้..."
                className="w-full text-[13.5px] text-white/50 bg-transparent focus:outline-none placeholder-white/20 border-none p-0"
              />
            </div>

            {/* Actions: Send to Stage CTA & Delete */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onSendCharacterToStage(activeCharacter)}
                className="h-[38px] px-4.5 rounded-full bg-[#EF264C] hover:bg-[#ff2d55] text-white flex items-center gap-2 text-[13px] font-medium transition-all cursor-pointer active:scale-95 border border-white/20 shadow-[0_0_24px_rgba(239,38,76,0.6),inset_0_1px_0_rgba(255,255,255,0.30)] select-none"
                title="นำตัวละครนี้ไปเป็นนักแสดงในเวทีหลัก (Staging Lab)"
              >
                <ArrowUpRight size={16} strokeWidth={2.4} />
                <span>ส่งตัวละครนี้ขึ้นเวทีแสดงสด</span>
              </button>

              <button
                type="button"
                onClick={() => onDeleteCharacter(activeCharacter.id)}
                className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-rose-400 border border-white/10 hover:border-rose-400/40 flex items-center justify-center transition-all cursor-pointer"
                title="ลบตัวละครนี้"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* =========================================================================
              SOCKET 1: PHYSICAL & CHARM SILHOUETTE (สรีระ ทรงผม หน้าอก และเสน่ห์ดึงดูด)
              ========================================================================= */}
          <div className="relative z-10 rounded-2xl p-4 sm:p-5 bg-black/30 border border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake size={15} className="text-[#EF264C]" />
                <span className="text-[13px] font-semibold text-white/90">
                  สรีระและเสน่ห์ดึงดูด (Physical & Charm Silhouette)
                </span>
              </div>
              <span className="text-[11px] text-white/40">
                ฉีดเข้าฉากเมื่อเกิดไฟปรารถนาและสัมผัส
              </span>
            </div>
            <textarea
              rows={2}
              value={activeCharacter.appearanceAndCharm}
              onChange={(e) =>
                onUpdateCharacter(activeCharacter.id, { appearanceAndCharm: e.target.value })
              }
              placeholder="ระบุสรีระ ทรงผม สัดส่วนหุ่น หน้าอก และเสน่ห์ดึงดูด..."
              className="w-full bg-transparent text-[13.5px] text-[#F1F1F1] placeholder-white/20 focus:outline-none resize-none leading-relaxed font-sans border-none p-0"
            />
          </div>

          {/* =========================================================================
              SOCKET 2: 5 UNIBODY PERSONA PILLARS & KEYSTONE TETHER
              ========================================================================= */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <Shield size={15} className="text-[#EF264C]" />
              <span className="text-[14px] font-semibold text-white/90">
                5 เสาหลักสายตัวละคร & ของประจำตัว (Persona Pillars)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pillar 1: Core Wound */}
              <div className="rounded-xl p-3.5 bg-black/25 border border-white/[0.07] space-y-1">
                <span className="text-[11.5px] font-medium text-[#EF264C]">
                  1. ปมฝังใจในอดีต (Core Wound)
                </span>
                <textarea
                  rows={2}
                  value={activeCharacter.coreWound}
                  onChange={(e) =>
                    onUpdateCharacter(activeCharacter.id, { coreWound: e.target.value })
                  }
                  className="w-full bg-transparent text-[13px] text-white/85 focus:outline-none resize-none leading-relaxed border-none p-0 font-sans"
                />
              </div>

              {/* Pillar 2: The Hidden Core */}
              <div className="rounded-xl p-3.5 bg-black/25 border border-white/[0.07] space-y-1">
                <span className="text-[11.5px] font-medium text-[#EF264C]">
                  2. เนื้อแท้และความกระหายลึก (The Hidden Core)
                </span>
                <textarea
                  rows={2}
                  value={activeCharacter.hiddenCore}
                  onChange={(e) =>
                    onUpdateCharacter(activeCharacter.id, { hiddenCore: e.target.value })
                  }
                  className="w-full bg-transparent text-[13px] text-white/85 focus:outline-none resize-none leading-relaxed border-none p-0 font-sans"
                />
              </div>

              {/* Pillar 3: The Mask & Friction */}
              <div className="rounded-xl p-3.5 bg-black/25 border border-white/[0.07] space-y-1">
                <span className="text-[11.5px] font-medium text-[#EF264C]">
                  3. หน้ากากและกลยุทธ์กำแพง (The Mask & Friction)
                </span>
                <textarea
                  rows={2}
                  value={activeCharacter.theMask}
                  onChange={(e) =>
                    onUpdateCharacter(activeCharacter.id, { theMask: e.target.value })
                  }
                  className="w-full bg-transparent text-[13px] text-white/85 focus:outline-none resize-none leading-relaxed border-none p-0 font-sans"
                />
              </div>

              {/* Pillar 5: Keystone Tether */}
              <div className="rounded-xl p-3.5 bg-black/25 border border-white/[0.07] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-medium text-[#EF264C]">
                    5. ของประจำตัว 1 ชิ้น (Keystone Tether)
                  </span>
                  <span className="text-[10px] text-white/40">2-7 พยางค์</span>
                </div>
                <input
                  type="text"
                  value={activeCharacter.keystoneTether}
                  onChange={(e) =>
                    onUpdateCharacter(activeCharacter.id, { keystoneTether: e.target.value })
                  }
                  className="w-full bg-transparent text-[13px] font-medium text-white/85 focus:outline-none border-none p-0"
                />
              </div>
            </div>

            {/* Pillar 4: Body Tells & Gaze (Full Width 2-line format) */}
            <div className="rounded-xl p-3.5 bg-black/25 border border-white/[0.07] space-y-1">
              <span className="text-[11.5px] font-medium text-[#EF264C]">
                4. สมอยึดสรีระและสายตา (Body Tells & Gaze)
              </span>
              <textarea
                rows={2}
                value={activeCharacter.bodyTells}
                onChange={(e) =>
                  onUpdateCharacter(activeCharacter.id, { bodyTells: e.target.value })
                }
                className="w-full bg-transparent text-[13px] text-white/85 focus:outline-none resize-none leading-relaxed border-none p-0 font-sans font-mono text-[12.5px]"
              />
            </div>
          </div>

          {/* =========================================================================
              SOCKET 3: THE MAGMA CORE (2 PURE VECTORS)
              ========================================================================= */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <Flame size={15} className="text-[#EF264C]" />
              <span className="text-[14px] font-semibold text-white/90">
                แกนลาวาชนวนเกราะแตก (The Magma Core)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Vector 1: Fault Line */}
              <div className="rounded-xl p-3.5 bg-black/25 border border-white/[0.07] space-y-1">
                <span className="text-[11.5px] font-medium text-[#EF264C]">
                  จุดชนวนสะกิดตาย (The Fault Line)
                </span>
                <textarea
                  rows={2}
                  value={activeCharacter.faultLine}
                  onChange={(e) =>
                    onUpdateCharacter(activeCharacter.id, { faultLine: e.target.value })
                  }
                  className="w-full bg-transparent text-[13px] text-white/85 focus:outline-none resize-none leading-relaxed border-none p-0 font-sans"
                />
              </div>

              {/* Vector 2: Polar Inversion */}
              <div className="rounded-xl p-3.5 bg-black/25 border border-white/[0.07] space-y-1">
                <span className="text-[11.5px] font-medium text-[#EF264C]">
                  เวกเตอร์สลับขั้ว 180° (Polar Inversion)
                </span>
                <textarea
                  rows={2}
                  value={activeCharacter.polarInversion}
                  onChange={(e) =>
                    onUpdateCharacter(activeCharacter.id, { polarInversion: e.target.value })
                  }
                  className="w-full bg-transparent text-[13px] text-white/85 focus:outline-none resize-none leading-relaxed border-none p-0 font-sans"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
