import React, { useState } from 'react'
import {
  MapPin,
  Trash2,
  Sparkles,
  CheckCircle2,
  Edit3,
  Copy,
  Check,
  Shirt,
  Layers,
  ChevronDown,
  Dna,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react'
import type {
  LoreCard,
  StageCellItem,
  WorldCharacterCard,
  StageCellAttireConfig,
  StageCellAttireLayer,
  AttireZoneId,
} from '../../../types'
import { ATTIRE_ZONE_ORDER, ATTIRE_ZONE_META } from '../../../modules/livingAttireModule'

interface StudioStageCellViewProps {
  cell: StageCellItem
  activeCharacter?: WorldCharacterCard | null
  allCharacters?: WorldCharacterCard[]
  isForgingSceneAttire?: boolean
  onForgeSceneAttire?: (
    cell: StageCellItem,
    character: WorldCharacterCard,
    customAttireBrief?: string
  ) => Promise<void>
  onUpdateSceneAttire?: (
    cellId: string,
    updater: (prevConfig: StageCellAttireConfig) => StageCellAttireConfig
  ) => void
  onEnterStageWithAttire?: (cell: StageCellItem, attireConfig?: StageCellAttireConfig) => void
  allAvailableCardsForCell: LoreCard[]
  isGeneratingCell5D: boolean
  isAutoLinking: boolean
  editingCellOutputId: string | null
  copiedCellId: string | null
  onUpdateTitle: (title: string) => void
  onUpdateInputBrief: (brief: string) => void
  onUpdateDescription: (description: string) => void
  onDeleteCell: () => void
  onToggleCellCard: (cardId: string) => void
  onClearAllCellCards: () => void
  onAutoStageCards: () => void
  onGenerateCell5D: () => void
  onToggleEditMode: () => void
  onCopyDescription: () => void
  onEnterStage: () => void
}

export const StudioStageCellView: React.FC<StudioStageCellViewProps> = ({
  cell,
  activeCharacter,
  allCharacters = [],
  isForgingSceneAttire = false,
  onForgeSceneAttire,
  onUpdateSceneAttire,
  onEnterStageWithAttire,
  allAvailableCardsForCell,
  isGeneratingCell5D,
  isAutoLinking,
  editingCellOutputId,
  copiedCellId,
  onUpdateTitle,
  onUpdateInputBrief,
  onUpdateDescription,
  onDeleteCell,
  onToggleCellCard,
  onClearAllCellCards,
  onAutoStageCards,
  onGenerateCell5D,
  onToggleEditMode,
  onCopyDescription,
  onEnterStage,
}) => {
  // Attire brief state
  const [attireBriefInput, setAttireBriefInput] = useState('')
  const [selectedCharId, setSelectedCharId] = useState<string>(
    activeCharacter?.id || (allCharacters[0]?.id ?? '')
  )
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null)
  const [editingLayerText, setEditingLayerText] = useState('')

  // Derive chosen character
  const chosenCharacter =
    allCharacters.find(c => c.id === selectedCharId) ||
    activeCharacter ||
    allCharacters[0] ||
    null

  // Attire configuration from cell
  const attireConfig: StageCellAttireConfig | null =
    cell.attireCustomState && cell.attireCustomState.actorProfile
      ? (cell.attireCustomState as StageCellAttireConfig)
      : null

  const hasForgedAttire = Boolean(attireConfig && attireConfig.actorProfile)
  const hasSkinBlueprint = Boolean(
    chosenCharacter?.skinBlueprint &&
      (chosenCharacter.skinBlueprint.bareAnatomyAndVolume ||
        chosenCharacter.skinBlueprint.skinSurfaceAndIntimateMarks)
  )

  const handleTriggerForgeAttire = async () => {
    if (!chosenCharacter || !onForgeSceneAttire || isForgingSceneAttire) return
    await onForgeSceneAttire(cell, chosenCharacter, attireBriefInput.trim() || undefined)
  }

  const handleSaveLayerEdit = (zoneKey: AttireZoneId, layerId: string) => {
    if (!onUpdateSceneAttire) return
    onUpdateSceneAttire(cell.id, prev => ({
      ...prev,
      actorProfile: {
        ...prev.actorProfile,
        [zoneKey]: {
          ...prev.actorProfile[zoneKey],
          layers: (prev.actorProfile[zoneKey]?.layers || []).map(l =>
            l.id === layerId ? { ...l, description: editingLayerText } : l
          ),
        },
      },
    }))
    setEditingLayerId(null)
  }

  const handleUpdateZoneCondition = (zoneKey: AttireZoneId, condition: string) => {
    if (!onUpdateSceneAttire) return
    onUpdateSceneAttire(cell.id, prev => ({
      ...prev,
      actorProfile: {
        ...prev.actorProfile,
        [zoneKey]: {
          ...prev.actorProfile[zoneKey],
          condition,
          lifecycle: condition.trim() ? 'LINGERING' : 'DORMANT',
        },
      },
    }))
  }

  const handleToggleInnerHidden = (zoneKey: AttireZoneId, layerId: string) => {
    if (!onUpdateSceneAttire) return
    onUpdateSceneAttire(cell.id, prev => ({
      ...prev,
      actorProfile: {
        ...prev.actorProfile,
        [zoneKey]: {
          ...prev.actorProfile[zoneKey],
          layers: (prev.actorProfile[zoneKey]?.layers || []).map(l =>
            l.id === layerId ? { ...l, isInnerHidden: !l.isInnerHidden } : l
          ),
        },
      },
    }))
  }

  const handleFastEnterStage = () => {
    if (onEnterStageWithAttire && attireConfig) {
      onEnterStageWithAttire(cell, attireConfig)
    } else {
      onEnterStage()
    }
  }

  return (
    <div className="space-y-6 sm:space-y-7 animate-in fade-in duration-200">
      {/* ════════════════════════════════════════════════════════════════════
          CARD 1: INPUT BRIEF CARD (การ์ดบรีฟสถานที่ & ผูกการ์ด)
         ════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl p-6 sm:p-7 backdrop-blur-xl bg-[#141416]/90 hover:bg-[#141416]/95 border border-white/[0.12] hover:border-white/[0.18] space-y-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_20px_45px_rgba(0,0,0,0.6)] relative group transition-all">
        {/* Card 1 Top Bar: Badge on Left, Delete Cell on Right */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-white/[0.06] text-white/70 border border-white/[0.08] flex items-center gap-1.5">
              <MapPin size={11} className="text-white/60" />
              <span>การ์ดที่ 1 · บรีฟสถานที่ (Input Brief)</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onDeleteCell}
            className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-rose-400 p-1 rounded-md hover:bg-white/[0.04] transition-all cursor-pointer flex items-center gap-1 text-[11px] font-mono"
            title="ลบสถานที่นี้"
          >
            <Trash2 size={12} />
            <span>ลบสถานที่</span>
          </button>
        </div>

        {/* Location Title Input */}
        <div>
          <input
            type="text"
            value={cell.title}
            onChange={(e) => onUpdateTitle(e.target.value)}
            placeholder="ระบุชื่อสถานที่ (เช่น โรงย้อมผ้าครามริมลำธาร, โถงเพดานเวทมนตร์)..."
            className="w-full text-[22px] sm:text-[26px] font-semibold text-[#F1F1F1] bg-transparent outline-none border-none p-0 placeholder-white/20 leading-tight"
          />
        </div>

        {/* Player Input Brief Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-mono text-white/50 block">
              ไอเดียและรายละเอียดสถานที่ (Player Input Brief):
            </label>
            <span className="text-[10.5px] font-mono text-white/30">
              เก็บรักษาไว้เสมอ ไม่ถูกทับ
            </span>
          </div>
          <textarea
            rows={3}
            value={cell.inputBrief ?? (cell.description?.includes('THRESHOLD & ARRIVAL') ? '' : cell.description) ?? ''}
            onInput={(e) => {
              e.currentTarget.style.height = 'auto'
              e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
            }}
            onChange={(e) => onUpdateInputBrief(e.target.value)}
            placeholder="พิมพ์บรรยายสั้นๆ เกี่ยวกับสถานที่ กลิ่นอาย บรรยากาศ หรือเรื่องราวที่ต้องการให้เกิดขึ้นในฉากนี้..."
            className="w-full text-[14px] sm:text-[14.5px] text-[#F1F1F1] bg-white/[0.02] focus:bg-white/[0.04] p-3.5 rounded-xl border border-white/[0.08] focus:border-white/20 outline-none resize-none leading-relaxed font-sans placeholder-white/25 transition-all min-h-[85px] overflow-hidden"
          />
        </div>

        {/* Linked Cards Section inside Card 1 */}
        <div className="space-y-3 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[12.5px] font-medium text-white/80">
                การ์ดที่ผูกกับสถานที่นี้
              </span>
              <span className="px-2 py-0.5 rounded text-[10.5px] font-mono bg-white/[0.06] text-white/60">
                {cell.pinnedCardIds.length}
              </span>

              {cell.pinnedCardIds.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAllCellCards}
                  className="text-[11px] font-mono text-white/40 hover:text-red-400/80 transition-colors ml-1 cursor-pointer"
                  title="ยกเลิกการผูกการ์ดทั้งหมดในสถานที่นี้"
                >
                  (ล้างทั้งหมด)
                </button>
              )}
            </div>

            {/* Explicit Manual Auto-Stage Button */}
            <button
              type="button"
              onClick={onAutoStageCards}
              disabled={isAutoLinking || allAvailableCardsForCell.length === 0}
              className="px-3 py-1 rounded-full text-[11px] font-mono bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 hover:text-sky-200 border border-sky-500/25 hover:border-sky-500/40 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              title="วิเคราะห์บรรยากาศสถานที่และเลือกผูกการ์ดที่เกี่ยวข้องจากคลังอัตโนมัติ"
            >
              <Sparkles size={11} className={isAutoLinking ? 'animate-spin' : ''} />
              <span>{isAutoLinking ? 'กำลังเลือกการ์ด...' : 'ผูกการ์ดอัตโนมัติ'}</span>
            </button>
          </div>

          {allAvailableCardsForCell.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-white/[0.06] text-center text-white/30 text-[11.5px]">
              ยังไม่มีการ์ดส่วนขยายในโลกหรือตู้ลิ้นชัก (ระบบจะสร้างฉากจากบรีฟและบริบทโลก)
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[190px] overflow-y-auto pr-1">
              {allAvailableCardsForCell.map(card => {
                const isLinked = cell.pinnedCardIds.includes(card.id)
                return (
                  <div
                    key={card.id}
                    onClick={() => onToggleCellCard(card.id)}
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

        {/* Card 1 Hero Action: Single-click AI 5D Generator */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="button"
            onClick={onGenerateCell5D}
            disabled={isGeneratingCell5D || (!cell.title.trim() && !(cell.inputBrief || cell.description || '').trim())}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full text-[13px] font-medium bg-gradient-to-r from-sky-500/25 via-indigo-500/25 to-sky-500/25 hover:from-sky-500/35 hover:via-indigo-500/35 hover:to-sky-500/35 text-sky-200 border border-sky-400/40 hover:border-sky-400/60 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(56,189,248,0.2)] select-none"
            title="รังสรรค์ผืนเวที 5 มิติ (หากยังไม่ผูกการ์ด ระบบจะวิเคราะห์และผูกให้อัตโนมัติทันที)"
          >
            <Sparkles size={14} className={isGeneratingCell5D ? 'animate-spin text-sky-300' : 'text-sky-300'} />
            <span>
              {isGeneratingCell5D
                ? 'กำลังผูกการ์ดและรังสรรค์มโนทัศน์ 5 มิติ...'
                : cell.description?.includes('THRESHOLD & ARRIVAL')
                ? '✨ รังสรรค์มโนทัศน์ 5 มิติใหม่'
                : '✨ รังสรรค์สถานที่ 5 มิติ'}
            </span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          CARD 2: 5D STAGE OUTPUT & PILLAR 3 SCENE ATTIRE FORGE
         ════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl p-6 sm:p-7 backdrop-blur-xl bg-[#141416]/90 hover:bg-[#141416]/95 border border-white/[0.12] hover:border-white/[0.18] space-y-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_20px_45px_rgba(0,0,0,0.6)] relative group transition-all">
        {/* Card 2 Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
              <Sparkles size={11} className="text-sky-300" />
              <span>การ์ดที่ 2 · ผืนเวทีมโนทัศน์ 5 มิติ (5D Living Stage)</span>
            </span>

            {cell.description?.includes('THRESHOLD & ARRIVAL') && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                5D ครบ 5 ระนาบ
              </span>
            )}
          </div>

          {/* Card 2 Controls: Edit / Preview toggle & Copy */}
          {cell.description?.trim() && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleEditMode}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                  editingCellOutputId === cell.id
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-400/30'
                    : 'bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                }`}
                title={editingCellOutputId === cell.id ? 'ดูตัวอย่างมโนทัศน์' : 'แก้ไขข้อความมโนทัศน์โดยตรง'}
              >
                <Edit3 size={11} />
                <span>{editingCellOutputId === cell.id ? 'ดูตัวอย่าง' : 'แก้ไข'}</span>
              </button>

              <button
                type="button"
                onClick={onCopyDescription}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08] border border-white/[0.06] transition-all flex items-center gap-1.5 cursor-pointer"
                title="คัดลอกข้อความมโนทัศน์ 5 มิติ"
              >
                {copiedCellId === cell.id ? (
                  <>
                    <Check size={11} className="text-emerald-400" />
                    <span className="text-emerald-400">คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    <span>คัดลอก</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Card 2 Content Area: 5D Stage Description */}
        {!cell.description?.trim() ? (
          <div className="py-10 px-6 rounded-xl border border-dashed border-white/[0.08] text-center space-y-3 bg-white/[0.01]">
            <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300 flex items-center justify-center mx-auto">
              <Sparkles size={18} />
            </div>
            <div className="space-y-1">
              <div className="text-[14px] font-medium text-white/80">
                ยังไม่ได้รังสรรค์ผืนเวทีมโนทัศน์ 5 มิติ
              </div>
              <p className="text-[12px] text-white/40 max-w-md mx-auto leading-relaxed">
                พิมพ์ไอเดียสถานที่ใน "การ์ดที่ 1" ด้านบน แล้วกดปุ่ม <span className="text-sky-300 font-mono">[✨ รังสรรค์สถานที่ 5 มิติ]</span> ระบบจะวิเคราะห์ผูกการ์ดที่เกี่ยวข้องและประกอบมโนทัศน์ 5 มิติให้ทันที
              </p>
            </div>
          </div>
        ) : editingCellOutputId === cell.id ? (
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-white/40">
              แก้ไขเนื้อหามโนทัศน์ 5 มิติ (Markdown):
            </div>
            <textarea
              rows={12}
              value={cell.description}
              onInput={(e) => {
                e.currentTarget.style.height = 'auto'
                e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
              }}
              onChange={(e) => onUpdateDescription(e.target.value)}
              placeholder="เนื้อหามโนทัศน์ 5 มิติ..."
              className="w-full text-[14px] sm:text-[14.5px] text-[#F1F1F1] bg-white/[0.02] p-4 rounded-xl border border-white/[0.1] focus:border-white/25 outline-none resize-none leading-relaxed font-sans placeholder-white/20 min-h-[240px] overflow-hidden"
            />
          </div>
        ) : (
          <div className="space-y-3 text-left">
            <div className="text-[14px] sm:text-[14.5px] text-[#F1F1F1]/90 leading-relaxed font-sans whitespace-pre-line bg-white/[0.015] p-5 sm:p-6 rounded-xl border border-white/[0.06] select-text">
              {cell.description}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            PILLAR 3: INTERACTIVE 4-ZONE SCENE ATTIRE FORGE PANEL
           ════════════════════════════════════════════════════════════════════ */}
        <div className="pt-6 border-t border-white/[0.08] space-y-5">
          {/* Section Header with Character Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-400/20 text-sky-300 flex items-center justify-center shrink-0">
                <Shirt size={16} />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-white/90">
                    ชุดประจำสถานที่ (4-Zone Multi-Layer Scene Attire)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/15 text-sky-300 border border-sky-500/30">
                    Pillar 3
                  </span>
                </div>
                <div className="text-[11px] text-white/45">
                  หล่อหลอมชุด 4 โซนหลายเลเยอร์จาก 3D Skin เข้ากับบริบทสถานที่ 5D
                </div>
              </div>
            </div>

            {/* Character Selector & 3D Skin Indicator Badge */}
            <div className="flex items-center gap-2">
              {allCharacters.length > 1 ? (
                <div className="relative">
                  <select
                    value={chosenCharacter?.id || ''}
                    onChange={(e) => setSelectedCharId(e.target.value)}
                    className="appearance-none bg-white/[0.05] hover:bg-white/[0.08] text-white/80 text-[11.5px] font-mono py-1.5 pl-3 pr-7 rounded-lg border border-white/10 outline-none cursor-pointer transition-all"
                  >
                    {allCharacters.map(char => (
                      <option key={char.id} value={char.id} className="bg-[#141416] text-white">
                        {char.name} ({char.roleTagline || 'ตัวละคร'})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                </div>
              ) : chosenCharacter ? (
                <span className="px-2.5 py-1 rounded-lg text-[11.5px] font-mono bg-white/[0.04] text-white/70 border border-white/[0.08]">
                  {chosenCharacter.name}
                </span>
              ) : null}

              {/* 3D Skin Status Badge */}
              {hasSkinBlueprint ? (
                <span className="px-2 py-1 rounded-lg text-[10.5px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5" title="ตัวละครนี้มี 3D Skin Blueprint พร้อมสำหรับการตัดเย็บ">
                  <Dna size={12} />
                  <span>3D Skin เชื่อมต่อ</span>
                </span>
              ) : (
                <span className="px-2 py-1 rounded-lg text-[10.5px] font-mono bg-amber-500/10 text-amber-300/80 border border-amber-500/25 flex items-center gap-1.5" title="ยังไม่มี 3D Skin เต็มรูปแบบ (AI จะคาดคะเนจากข้อมูลรูปลักษณ์)">
                  <Dna size={12} />
                  <span>สรีระพื้นฐาน</span>
                </span>
              )}
            </div>
          </div>

          {/* Attire Brief Input & Forge Button */}
          <div className="space-y-2.5 bg-white/[0.015] p-4 rounded-xl border border-white/[0.06]">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={attireBriefInput}
                onChange={(e) => setAttireBriefInput(e.target.value)}
                placeholder="ระบุสไตล์ชุดหรือสภาพชุดในฉากนี้เพิ่มเติม (เช่น 'ชุดว่ายน้ำวันพีซเว้าหลังลึก', 'เสื้อยืดชมพูถลกเอวเปียกน้ำ', หรือเว้นว่างให้ AI จัดให้)..."
                className="flex-1 text-[12.5px] text-[#F1F1F1] bg-white/[0.03] focus:bg-white/[0.06] px-3.5 py-2 rounded-xl border border-white/[0.08] focus:border-sky-400/40 outline-none placeholder-white/25 transition-all font-sans"
              />

              <button
                type="button"
                onClick={handleTriggerForgeAttire}
                disabled={isForgingSceneAttire || !chosenCharacter}
                className="px-4 py-2 rounded-xl text-[12px] font-medium bg-gradient-to-r from-sky-500/25 via-indigo-500/25 to-sky-500/25 hover:from-sky-500/35 hover:via-indigo-500/35 hover:to-sky-500/35 text-sky-200 border border-sky-400/40 hover:border-sky-400/60 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
              >
                {isForgingSceneAttire ? (
                  <>
                    <RefreshCw size={13} className="animate-spin text-sky-300" />
                    <span>กำลังตัดเย็บชุด 3D...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} className="text-sky-300" />
                    <span>{hasForgedAttire ? '✨ หล่อหลอมชุดใหม่' : '✨ เจนชุดประจำฉากจาก 3D Skin'}</span>
                  </>
                )}
              </button>
            </div>

            {attireConfig?.attireSummary && (
              <div className="flex items-center gap-2 text-[11.5px] font-mono text-white/70 pt-1">
                <span className="text-sky-300">สรุปชุดฉากนี้:</span>
                <span className="text-[#F1F1F1] font-sans font-medium">{attireConfig.attireSummary}</span>
              </div>
            )}
          </div>

          {/* 4-Zone Multi-Layer Grid Display & In-Place Editor */}
          {hasForgedAttire && attireConfig && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 animate-in fade-in duration-300">
              {ATTIRE_ZONE_ORDER.map((zoneKey) => {
                const zone = attireConfig.actorProfile[zoneKey]
                const meta = ATTIRE_ZONE_META[zoneKey]
                const layers = zone?.layers || []

                return (
                  <div
                    key={zoneKey}
                    className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.015] hover:bg-white/[0.025] space-y-3 transition-all text-left"
                  >
                    {/* Zone Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-400" />
                        <span className="text-[12px] font-semibold text-white/90">
                          {meta.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-white/35">
                        {layers.length} เลเยอร์
                      </span>
                    </div>

                    {/* Zone Live Condition Input */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] font-mono text-white/40 shrink-0">สภาพสด:</span>
                      <input
                        type="text"
                        value={zone?.condition || ''}
                        onChange={(e) => handleUpdateZoneCondition(zoneKey, e.target.value)}
                        placeholder="สภาพสดของโซนนี้ (เช่น เปียกชุ่มน้ำ, โคลนเกาะ, หรือเว้นว่าง)..."
                        className="w-full text-[11.5px] text-white/80 bg-white/[0.02] focus:bg-white/[0.05] px-2.5 py-1 rounded-lg border border-white/[0.06] focus:border-sky-400/30 outline-none placeholder-white/20 font-sans"
                      />
                    </div>

                    {/* Layers List */}
                    <div className="space-y-2 pt-1 border-t border-white/[0.05]">
                      {layers.map((layer: StageCellAttireLayer) => {
                        const isEditingThisLayer = editingLayerId === layer.id
                        const orderBadgeColor =
                          layer.layerOrder === 'intimate'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : layer.layerOrder === 'inner'
                            ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                            : layer.layerOrder === 'accessory'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-white/[0.06] text-white/70 border-white/10'

                        return (
                          <div
                            key={layer.id}
                            className="p-2.5 rounded-lg bg-black/20 border border-white/[0.04] space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono border ${orderBadgeColor}`}>
                                  {layer.layerOrder || 'outer'}
                                </span>
                                <span className="text-[11px] font-medium text-white/80 font-mono">
                                  {layer.slotLabel}
                                </span>
                                {layer.layerCondition && (
                                  <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono bg-sky-500/10 text-sky-300 border border-sky-400/20">
                                    {layer.layerCondition}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {/* Toggle Hidden Badge (for intimate layers) */}
                                {layer.layerOrder === 'intimate' && (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleInnerHidden(zoneKey, layer.id)}
                                    className={`p-1 rounded text-[10px] font-mono transition-all cursor-pointer ${
                                      layer.isInnerHidden
                                        ? 'text-white/40 hover:text-white/70'
                                        : 'text-amber-300 bg-amber-500/10'
                                    }`}
                                    title={layer.isInnerHidden ? 'ชั้นในถูกเสื้อบัง (คลิกเพื่อเปิดเผย)' : 'ชั้นในเปิดเผย/สวมเดี่ยว'}
                                  >
                                    {layer.isInnerHidden ? <EyeOff size={11} /> : <Eye size={11} />}
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isEditingThisLayer) {
                                      handleSaveLayerEdit(zoneKey, layer.id)
                                    } else {
                                      setEditingLayerId(layer.id)
                                      setEditingLayerText(layer.description)
                                    }
                                  }}
                                  className="text-[10px] font-mono text-white/40 hover:text-sky-300 p-1 rounded hover:bg-white/[0.04] transition-all cursor-pointer"
                                  title={isEditingThisLayer ? 'บันทึก' : 'แก้ไขคำบรรยายเลเยอร์'}
                                >
                                  {isEditingThisLayer ? <Check size={11} className="text-emerald-400" /> : <Edit3 size={11} />}
                                </button>
                              </div>
                            </div>

                            {/* Description Preview or In-Place Edit */}
                            {isEditingThisLayer ? (
                              <div className="space-y-1.5 pt-1">
                                <textarea
                                  rows={2}
                                  value={editingLayerText}
                                  onChange={(e) => setEditingLayerText(e.target.value)}
                                  className="w-full text-[12px] text-white bg-white/[0.04] p-2 rounded border border-sky-400/40 outline-none leading-relaxed font-sans"
                                />
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setEditingLayerId(null)}
                                    className="px-2 py-0.5 rounded text-[10px] font-mono text-white/40 hover:text-white"
                                  >
                                    ยกเลิก
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveLayerEdit(zoneKey, layer.id)}
                                    className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-400/30"
                                  >
                                    บันทึก
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[12px] text-white/75 leading-relaxed font-sans">
                                {layer.description}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Action Bar: Fast Enter Live Stage */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06]">
            <div className="text-[11px] text-white/40 font-mono flex items-center gap-2">
              <Layers size={13} className="text-sky-400" />
              <span>
                {hasForgedAttire
                  ? `พร้อมก้าวขึ้นเวทีพร้อมชุด 4 โซนของ ${attireConfig?.characterName || chosenCharacter?.name}`
                  : 'ก้าวขึ้นเวทีด้วยชุดเริ่มต้นประจำฉาก'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleFastEnterStage}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white text-[12.5px] font-medium transition-all cursor-pointer flex items-center gap-2 active:scale-95 shadow-[0_0_20px_rgba(56,189,248,0.35)]"
              title="ก้าวขึ้นสู่เวทีแสดงสดพร้อมพิกัดสถานที่และชุดประจำฉากนี้ทันที"
            >
              <Sparkles size={13} />
              <span>ก้าวขึ้นสู่เวทีด้วยสถานที่นี้ ↵</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
