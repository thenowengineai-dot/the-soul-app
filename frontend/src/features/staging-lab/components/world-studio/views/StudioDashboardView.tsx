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
  Save,
  Loader2,
  Scan,
} from 'lucide-react'
import type { WorldWorkspace, WorldCharacterCard, LoreCard, CharacterSkinBlueprint } from '../../../types'
import type { StudioActiveView } from '../types'

interface StudioDashboardViewProps {
  activeWorld: WorldWorkspace
  isForgingCharacter: boolean
  isForgingCharacterSkin?: boolean
  allAvailableCardsForCharacter: LoreCard[]
  activeTagPopoverCardId: string | null
  isAutoLinkingCharacterCards?: boolean
  isDissectingCharacter?: boolean
  renderCardTags: (card: LoreCard, noteId?: string, extraBadge?: React.ReactNode) => React.ReactNode
  onForgeCharacter: (brief: string) => Promise<void>
  onReForgeCharacter?: (character: WorldCharacterCard) => Promise<void>
  onForgeCharacterSkin?: (character: WorldCharacterCard, skinBrief?: string) => Promise<void>
  onUpdateCharacterSkin?: (characterId: string, updates: Partial<CharacterSkinBlueprint>) => void
  onUpdateCharacter: (characterId: string, updates: Partial<WorldCharacterCard>) => void
  onDeleteCharacter: (characterId: string) => void
  onSelectCharacter: (characterId: string) => void
  onSendCharacterToStage: (character: WorldCharacterCard) => void
  setActiveView: (view: StudioActiveView) => void
  onAddNewStageCell: () => void
  onToggleCharacterCard?: (characterId: string, cardId: string) => void
  onClearAllCharacterCards?: (characterId: string) => void
  onAutoLinkCharacterCards?: (character: WorldCharacterCard) => void
  onDissectCharacter?: (character: WorldCharacterCard) => void
  onAddCharacterChildCard?: (characterId: string) => void
  onUpdateCharacterChildCard?: (characterId: string, cardId: string, updates: Partial<LoreCard>) => void
  onDeleteCharacterChildCard?: (characterId: string, cardId: string) => void
  onToggleCharacterChildCardSaveState?: (characterId: string, card: LoreCard) => void
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
  isForgingCharacterSkin = false,
  allAvailableCardsForCharacter,
  activeTagPopoverCardId,
  isAutoLinkingCharacterCards,
  isDissectingCharacter,
  renderCardTags,
  onForgeCharacter,
  onReForgeCharacter,
  onForgeCharacterSkin,
  onUpdateCharacterSkin,
  onUpdateCharacter,
  onDeleteCharacter,
  onSelectCharacter,
  onSendCharacterToStage,
  setActiveView,
  onAddNewStageCell,
  onToggleCharacterCard,
  onClearAllCharacterCards,
  onAutoLinkCharacterCards,
  onDissectCharacter,
  onAddCharacterChildCard,
  onUpdateCharacterChildCard,
  onDeleteCharacterChildCard,
  onToggleCharacterChildCardSaveState,
}) => {
  const [briefInput, setBriefInput] = useState('')
  const [isBriefExpanded, setIsBriefExpanded] = useState(false)
  const [characterSkinBriefs, setCharacterSkinBriefs] = useState<Record<string, string>>({})

  const characters = activeWorld.characters || []
  const activeCharacter =
    characters.find((c) => c.id === activeWorld.activeCharacterId) ||
    characters[0] ||
    null

  const currentSkinBrief =
    (activeCharacter ? characterSkinBriefs[activeCharacter.id] : undefined) ??
    activeCharacter?.skinBlueprint?.skinBrief ??
    ''

  const handleForgeSkin = async () => {
    if (!activeCharacter || isForgingCharacterSkin) return
    await onForgeCharacterSkin?.(activeCharacter, currentSkinBrief)
  }

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
              SOCKET 0: CHARACTER ORIGIN BRIEF (บรีฟและไอเดียตั้งต้นของตัวละคร)
              ========================================================================= */}
          <div className="relative z-10 rounded-2xl p-4 sm:p-5 bg-black/30 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-[#EF264C]" />
                <span className="text-[13px] font-semibold text-white/90">
                  บรีฟและไอเดียตั้งต้นของตัวละคร (Player Input Brief)
                </span>
              </div>
              <span className="text-[11px] text-white/40">
                เก็บรักษาไว้ตลอด ไม่ถูกเขียนทับ · ใช้ปรับแต่งหรือหล่อหลอมใหม่
              </span>
            </div>

            <textarea
              rows={2}
              value={activeCharacter.playerBrief || ''}
              onInput={(e) => {
                e.currentTarget.style.height = 'auto'
                e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
              }}
              onChange={(e) =>
                onUpdateCharacter(activeCharacter.id, { playerBrief: e.target.value })
              }
              placeholder="ไอเดีย สไตล์ นิสัย หรือจุดเด่นของตัวละครนี้..."
              className="w-full bg-white/[0.02] focus:bg-white/[0.04] p-3 rounded-xl border border-white/[0.08] focus:border-[#EF264C]/40 text-[13.5px] text-[#F1F1F1] placeholder-white/25 focus:outline-none resize-none leading-relaxed font-sans transition-all min-h-[60px]"
            />

            {/* Re-Forge Character Button */}
            {onReForgeCharacter && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => onReForgeCharacter(activeCharacter)}
                  disabled={isForgingCharacter || !(activeCharacter.playerBrief || '').trim()}
                  className="px-3.5 py-1.5 rounded-full text-[12px] font-medium bg-white/[0.04] hover:bg-[#EF264C]/20 text-white/70 hover:text-white border border-white/10 hover:border-[#EF264C]/50 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed select-none"
                  title="นำบรีฟนี้ไปหล่อหลอม 5 เสาหลักและแกนลาวาของตัวละครนี้ขึ้นใหม่"
                >
                  <Sparkles size={12} className={isForgingCharacter ? 'animate-spin text-[#EF264C]' : 'text-white/40'} />
                  <span>{isForgingCharacter ? 'กำลังหล่อหลอมใหม่...' : '✨ หล่อหลอมตัวละครนี้ใหม่จากบรีฟ'}</span>
                </button>
              </div>
            )}
          </div>

          {/* =========================================================================
              CHARACTER-BOUND CARDS PANEL (การ์ดที่ผูกติดตัวละครนี้)
              ========================================================================= */}
          <div className="relative z-10 rounded-2xl p-4 sm:p-5 bg-black/30 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={15} className="text-[#EF264C]" />
                <span className="text-[13px] font-semibold text-white/90">
                  การ์ดที่ผูกติดตัวละครนี้ (Character-Bound Cards)
                </span>
                <span className="px-2 py-0.5 rounded text-[10.5px] font-mono bg-white/[0.06] text-white/60">
                  {(activeCharacter.pinnedCardIds || []).length}
                </span>
                {(activeCharacter.pinnedCardIds || []).length > 0 && onClearAllCharacterCards && (
                  <button
                    type="button"
                    onClick={() => onClearAllCharacterCards(activeCharacter.id)}
                    className="text-[11px] font-mono text-white/40 hover:text-red-400/80 transition-colors ml-1 cursor-pointer"
                    title="ยกเลิกการผูกการ์ดทั้งหมดกับตัวละครนี้"
                  >
                    (ล้างทั้งหมด)
                  </button>
                )}
              </div>

              {onAutoLinkCharacterCards && (
                <button
                  type="button"
                  onClick={() => onAutoLinkCharacterCards(activeCharacter)}
                  disabled={isAutoLinkingCharacterCards || allAvailableCardsForCharacter.length === 0}
                  className="px-3 py-1 rounded-full text-[11px] font-mono bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 hover:text-sky-200 border border-sky-500/25 hover:border-sky-500/40 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed select-none"
                  title="วิเคราะห์สายและปมของตัวละครเพื่อเลือกผูกการ์ดที่เกี่ยวข้องจากคลังอัตโนมัติ"
                >
                  <Sparkles size={11} className={isAutoLinkingCharacterCards ? 'animate-spin' : ''} />
                  <span>{isAutoLinkingCharacterCards ? 'กำลังเลือกการ์ด...' : 'ผูกการ์ดอัตโนมัติ'}</span>
                </button>
              )}
            </div>

            {allAvailableCardsForCharacter.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-white/[0.06] text-center text-white/30 text-[11.5px]">
                ยังไม่มีการ์ดในตู้ลิ้นชักหรือส่วนขยาย (สร้างการ์ดย่อยด้านล่างเพื่อผูกเข้ากับตัวละครได้)
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[190px] overflow-y-auto pr-1">
                {allAvailableCardsForCharacter.map(card => {
                  const isLinked = (activeCharacter.pinnedCardIds || []).includes(card.id)
                  return (
                    <div
                      key={card.id}
                      onClick={() => onToggleCharacterCard && onToggleCharacterCard(activeCharacter.id, card.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 group select-none relative overflow-hidden ${
                        isLinked
                          ? 'bg-emerald-500/[0.06] border-emerald-500/35 shadow-[0_0_14px_rgba(16,185,129,0.08)]'
                          : 'bg-[#161618] border-white/[0.07] hover:border-white/[0.16] hover:bg-white/[0.03]'
                      }`}
                    >
                      <div
                        className={`absolute top-0 left-4 w-7 h-[2px] rounded-b transition-colors ${
                          isLinked
                            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                            : 'bg-white/20 group-hover:bg-[#EF264C]'
                        }`}
                      />

                      <div className="flex flex-col gap-0.5 truncate flex-1 min-w-0 text-left">
                        <span className={`text-[12.5px] truncate font-normal ${
                          isLinked ? 'text-[#F1F1F1] font-medium' : 'text-white/60 group-hover:text-white'
                        }`}>
                          {card.title}
                        </span>
                        {card.tags && card.tags.length > 0 && (
                          <span className="text-[9.5px] text-white/35 font-mono truncate">
                            #{card.tags.slice(0, 3).join(' #')}
                          </span>
                        )}
                      </div>

                      <div className="shrink-0">
                        {isLinked ? (
                          <span className="px-1.5 py-0.5 rounded-full text-[9.5px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 size={10} />
                            <span>ผูกแล้ว</span>
                          </span>
                        ) : (
                          <span className="w-4 h-4 rounded-full flex items-center justify-center text-white/30 group-hover:text-white text-[11px] font-mono hover:bg-white/[0.08] transition-colors">
                            +
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
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
              SOCKET 1.5 / PILLAR 1: 3D SKIN & SOMATIC BLUEPRINT (พิมพ์เขียวเรือนร่าง 3 มิติ & ชั้นแนบเนื้อ)
              ========================================================================= */}
          <div className="relative z-10 rounded-2xl p-4 sm:p-5 bg-black/35 border border-white/[0.09] space-y-4">
            {/* Header with Title, Badge, and Action Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Scan size={15} className="text-[#EF264C]" />
                <span className="text-[13.5px] font-semibold text-white/95">
                  พิมพ์เขียวเรือนร่าง 3 มิติ & ชั้นแนบเนื้อ (3D Skin & Somatic Blueprint)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#EF264C]/15 border border-[#EF264C]/30 text-[10.5px] font-medium text-[#EF264C] tracking-wide">
                  Layer 0 · Permanent Body
                </span>
              </div>

              <button
                type="button"
                onClick={handleForgeSkin}
                disabled={isForgingCharacterSkin}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-medium transition-all bg-[#EF264C] hover:bg-[#d81e42] text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {isForgingCharacterSkin ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>กำลังหล่อหลอมเรือนร่าง 3 มิติ...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    <span>
                      {activeCharacter.skinBlueprint?.bareAnatomyAndVolume
                        ? '✨ หล่อหลอมเรือนร่าง 3 มิติใหม่'
                        : '✨ เจนเรือนร่าง 3 มิติ & ชั้นแนบเนื้อ'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Optional skin focus brief input */}
            <div className="space-y-1">
              <input
                type="text"
                value={currentSkinBrief}
                onChange={(e) => {
                  const val = e.target.value
                  setCharacterSkinBriefs((prev) => ({ ...prev, [activeCharacter.id]: val }))
                }}
                placeholder="ระบุจุดเน้นเรือนร่าง/ผิว/ชั้นในเพิ่มเติม (ถ้าเว้นว่าง ระบบจะวิเคราะห์จากบรีฟและนิสัยให้อัตโนมัติ)..."
                className="w-full px-3.5 py-2 rounded-xl bg-black/45 border border-white/10 text-[12.5px] text-[#F1F1F1] placeholder-white/25 focus:outline-none focus:border-[#EF264C]/60 transition-colors font-sans"
              />
              <p className="text-[11px] text-white/40 px-1">
                สรีระเนื้อแท้ (Layer 0) รากฐานฟิสิกส์การสวมใส่เสื้อผ้าและชุดชั้นในทุกชนิด ไม่หลุดทรงตามกาลเวลา
              </p>
            </div>

            {/* Bento Grid 2x2 of the 4 dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Dimension 1: Bare Anatomy & Volume */}
              <div className="rounded-xl p-3.5 bg-black/25 border border-white/[0.07] hover:border-white/[0.14] transition-colors space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-medium text-[#EF264C]">
                    1. โครงสร้างหุ่น 3 มิติ & จุดรับแรงดึงผ้า
                  </span>
                  <span className="text-[10px] text-white/35">bareAnatomyAndVolume</span>
                </div>
                <p className="text-[10.5px] text-white/40 leading-snug">
                  ช่วงวัย, มวลโครงร่าง, อก, เอวคอด, สะโพกผาย & ก้นกลมเด้ง
                </p>
                <textarea
                  rows={3}
                  value={activeCharacter.skinBlueprint?.bareAnatomyAndVolume || ''}
                  onChange={(e) =>
                    onUpdateCharacterSkin?.(activeCharacter.id, {
                      bareAnatomyAndVolume: e.target.value,
                    })
                  }
                  placeholder="ยังไม่ได้หล่อหลอมโครงสร้างหุ่น 3 มิติ (กดปุ่มด้านบนเพื่อเจน หรือพิมพ์กำหนดได้ทันที)..."
                  className="w-full bg-transparent text-[12.5px] text-[#F1F1F1]/90 placeholder-white/20 focus:outline-none resize-none leading-relaxed font-sans border-none p-0"
                />
              </div>

              {/* Dimension 2: Skin Surface & Intimate Marks */}
              <div className="rounded-xl p-3.5 bg-black/25 border border-white/[0.07] hover:border-white/[0.14] transition-colors space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-medium text-[#EF264C]">
                    2. พื้นผิวหนัง, เส้นผม & ความลับใต้ร่มผ้า
                  </span>
                  <span className="text-[10px] text-white/35">skinSurfaceAndIntimateMarks</span>
                </div>
                <p className="text-[10.5px] text-white/40 leading-snug">
                  สีผิว, สัมผัส, จุดดึงสายตา, ยอดอก & ผิวพรรณใต้ชั้นใน
                </p>
                <textarea
                  rows={3}
                  value={activeCharacter.skinBlueprint?.skinSurfaceAndIntimateMarks || ''}
                  onChange={(e) =>
                    onUpdateCharacterSkin?.(activeCharacter.id, {
                      skinSurfaceAndIntimateMarks: e.target.value,
                    })
                  }
                  placeholder="ยังไม่ได้กำหนดพื้นผิวหนังและความลับใต้ร่มผ้า..."
                  className="w-full bg-transparent text-[12.5px] text-[#F1F1F1]/90 placeholder-white/20 focus:outline-none resize-none leading-relaxed font-sans border-none p-0"
                />
              </div>

              {/* Dimension 3: Somatic Motion Physics */}
              <div className="rounded-xl p-3.5 bg-black/25 border border-white/[0.07] hover:border-white/[0.14] transition-colors space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-medium text-[#EF264C]">
                    3. ฟิสิกส์การเคลื่อนไหวของสรีระ
                  </span>
                  <span className="text-[10px] text-white/35">somaticMotionPhysics</span>
                </div>
                <p className="text-[10.5px] text-white/40 leading-snug">
                  การกระเพื่อมไหว, แรงเหวี่ยง, ลมหายใจ & การเคลื่อนไหว
                </p>
                <textarea
                  rows={3}
                  value={activeCharacter.skinBlueprint?.somaticMotionPhysics || ''}
                  onChange={(e) =>
                    onUpdateCharacterSkin?.(activeCharacter.id, {
                      somaticMotionPhysics: e.target.value,
                    })
                  }
                  placeholder="ยังไม่ได้กำหนดฟิสิกส์การเคลื่อนไหวของสรีระ..."
                  className="w-full bg-transparent text-[12.5px] text-[#F1F1F1]/90 placeholder-white/20 focus:outline-none resize-none leading-relaxed font-sans border-none p-0"
                />
              </div>

              {/* Dimension 4: Intimate DNA & Wearing Habit */}
              <div className="rounded-xl p-3.5 bg-black/25 border border-white/[0.07] hover:border-white/[0.14] transition-colors space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-medium text-[#EF264C]">
                    4. รสนิยมชั้นในประจำตัว & นิสัยการสวมใส่
                  </span>
                  <span className="text-[10px] text-white/35">intimateDnaAndWearingHabit</span>
                </div>
                <p className="text-[10.5px] text-white/40 leading-snug">
                  แบบชุดชั้นในประจำตัว (Intimate DNA) & นิสัยการจัดระเบียบเสื้อผ้า
                </p>
                <textarea
                  rows={3}
                  value={activeCharacter.skinBlueprint?.intimateDnaAndWearingHabit || ''}
                  onChange={(e) =>
                    onUpdateCharacterSkin?.(activeCharacter.id, {
                      intimateDnaAndWearingHabit: e.target.value,
                    })
                  }
                  placeholder="ยังไม่ได้กำหนดรสนิยมชุดชั้นในและนิสัยการสวมใส่..."
                  className="w-full bg-transparent text-[12.5px] text-[#F1F1F1]/90 placeholder-white/20 focus:outline-none resize-none leading-relaxed font-sans border-none p-0"
                />
              </div>
            </div>
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

          {/* =========================================================================
              CHARACTER SUB-CARDS SECTION (การ์ดย่อยประจำตัวละคร)
              ========================================================================= */}
          <div className="relative z-10 space-y-3.5 pt-4 border-t border-white/[0.08]">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-white/80">
                  การ์ดย่อยประจำตัวละคร (ความลับ ปม ของประจำกาย หรือความทรงจำ)
                </span>
                {(activeCharacter.childCards || []).length > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10.5px] font-mono bg-white/[0.06] text-white/50">
                    {(activeCharacter.childCards || []).length}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {onDissectCharacter && (
                  <button
                    type="button"
                    onClick={() => onDissectCharacter(activeCharacter)}
                    disabled={isDissectingCharacter}
                    className="px-3 py-1 rounded-full text-[11.5px] bg-white/[0.04] hover:bg-rose-500/20 text-white/60 hover:text-rose-200 border border-white/[0.09] hover:border-rose-500/40 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed select-none"
                    title="ให้ AI ช่วยสกัดปม อาวุธ ความลับ หรือความทรงจำของตัวละครนี้ออกมาเป็นการ์ดย่อย"
                  >
                    <Sparkles size={11} className={isDissectingCharacter ? 'animate-spin text-rose-300' : 'text-white/40'} />
                    <span>{isDissectingCharacter ? 'กำลังสกัด...' : 'สกัดการ์ดย่อย'}</span>
                  </button>
                )}

                {onAddCharacterChildCard && (
                  <button
                    type="button"
                    onClick={() => onAddCharacterChildCard(activeCharacter.id)}
                    className="px-3 py-1 rounded-full text-[11.5px] bg-white/[0.04] hover:bg-white/[0.10] text-white/60 hover:text-white border border-white/[0.09] transition-all cursor-pointer flex items-center gap-1 active:scale-95 select-none"
                    title="เพิ่มการ์ดย่อยใหม่ของตัวละครนี้ด้วยตัวเอง"
                  >
                    <Plus size={12} />
                    <span>เพิ่มการ์ดย่อย</span>
                  </button>
                )}
              </div>
            </div>

            {(activeCharacter.childCards || []).length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-white/[0.06] text-center text-white/30 text-[12px]">
                ยังไม่มีการ์ดย่อยประจำตัวละคร (กด "สกัดการ์ดย่อย" ให้ AI ช่วยคิด หรือกด "เพิ่มการ์ดย่อย" เพื่อพิมพ์เองได้เลยครับ)
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {(activeCharacter.childCards || []).map((card) => {
                  const isPopoverOpen = activeTagPopoverCardId === card.id
                  return (
                    <div
                      key={card.id}
                      className={`rounded-2xl p-5 sm:p-5.5 border border-white/[0.09] hover:border-white/[0.18] transition-all flex flex-col justify-between group backdrop-blur-md bg-[#141416]/75 hover:bg-[#141416]/85 relative h-[255px] sm:h-[265px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_35px_rgba(0,0,0,0.45)] ${
                        isPopoverOpen ? 'overflow-visible z-30' : 'overflow-hidden z-10'
                      }`}
                    >
                      {/* Top Subtle Accent Bar */}
                      <div className="absolute top-0 left-6 w-10 sm:w-12 h-[2px] bg-white/20 group-hover:bg-[#EF264C] rounded-b transition-colors" />

                      <div className={`space-y-3 flex-1 flex flex-col h-full ${
                        isPopoverOpen ? 'overflow-visible' : 'overflow-hidden'
                      }`}>
                        {/* Top Bar: Free-form Tags on Left, Status Pill & Delete on Right */}
                        <div className="flex items-center justify-between gap-2 shrink-0">
                          {renderCardTags(card, activeCharacter.id)}

                          <div className="flex items-center gap-1.5 shrink-0">
                            {card.isSavedToCabinet ? (
                              <button
                                type="button"
                                onClick={() => onToggleCharacterChildCardSaveState && onToggleCharacterChildCardSaveState(activeCharacter.id, card)}
                                className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-500/50 flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                                title="คลิกเพื่อนำออกจากตู้ลิ้นชักกลับเป็นร่าง"
                              >
                                <CheckCircle2 size={11} className="text-emerald-400" />
                                <span>ในตู้ลิ้นชัก</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onToggleCharacterChildCardSaveState && onToggleCharacterChildCardSaveState(activeCharacter.id, card)}
                                className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono bg-white/[0.06] hover:bg-rose-500/20 text-white/50 hover:text-rose-200 border border-white/[0.10] hover:border-rose-500/40 flex items-center gap-1 transition-all cursor-pointer active:scale-95 group/btn"
                                title="บันทึกเข้าตู้ลิ้นชัก"
                              >
                                <Save size={11} className="text-white/40 group-hover/btn:text-rose-300 transition-colors" />
                                <span className="group-hover/btn:hidden">รอเข้าตู้</span>
                                <span className="hidden group-hover/btn:inline">เข้าตู้ลิ้นชัก</span>
                              </button>
                            )}

                            {onDeleteCharacterChildCard && (
                              <button
                                type="button"
                                onClick={() => onDeleteCharacterChildCard(activeCharacter.id, card.id)}
                                className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-400 p-1 rounded-md hover:bg-white/[0.04] transition-all cursor-pointer"
                                title="ลบการ์ดนี้"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => onUpdateCharacterChildCard && onUpdateCharacterChildCard(activeCharacter.id, card.id, { title: e.target.value })}
                          placeholder="ชื่อการ์ด..."
                          className="w-full text-[15px] font-medium text-[#F1F1F1] bg-transparent outline-none border-none p-0 placeholder-white/20 shrink-0"
                        />

                        {/* Content */}
                        <textarea
                          value={card.content}
                          onChange={(e) => onUpdateCharacterChildCard && onUpdateCharacterChildCard(activeCharacter.id, card.id, { content: e.target.value })}
                          placeholder="เนื้อหาของการ์ดย่อย..."
                          className="w-full text-[13px] text-white/75 bg-transparent outline-none resize-none leading-relaxed font-sans border-none p-0 placeholder-white/20 flex-1 overflow-y-auto"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
