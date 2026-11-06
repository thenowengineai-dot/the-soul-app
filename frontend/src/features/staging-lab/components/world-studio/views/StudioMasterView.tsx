import React, { useRef, useEffect } from 'react'
import {
  Plus,
  Sparkles,
  ArrowUp,
  Trash2,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react'
import type { ExpansionNote, WorldWorkspace } from '../../types'
import type { StudioActiveView } from '../types'

interface StudioMasterViewProps {
  activeWorld: WorldWorkspace
  updateActiveWorld: (updater: (prev: WorldWorkspace) => WorldWorkspace, targetWorldId?: string) => void
  onMacroWorldLoreChange: (lore: string) => void
  onSparkChange: (spark: string) => void
  combinedWorldLore: string
  showSparkCard: boolean
  showExpansionsCard: boolean
  isExtractingSpark: boolean
  isSprouting: boolean
  isSparkDraftOpen: boolean
  setIsSparkDraftOpen: (v: boolean) => void
  isSparkPlayerEdited: boolean
  setIsSparkPlayerEdited: (v: boolean) => void
  sproutingBlockId: string | null
  generatingNoteId: string | null
  handleExtractSparkOnly: () => void
  handleGenerateWorldGenesis: (customLore?: string, mode?: 'initial' | 'more', targetWorldId?: string) => Promise<void>
  handleExtractSpark: (forceMode?: 'extract' | 'regenerate' | 'polish', customLore?: string, targetWorldId?: string) => Promise<void>
  handleSproutFromLoreBlock: (block: { id: string; title?: string; content: string }) => Promise<void>
  handleAddExtraLoreBlock: () => void
  handleUpdateExtraLoreBlock: (blockId: string, updates: Partial<{ title: string; content: string }>) => void
  handleDeleteExtraLoreBlock: (blockId: string) => void
  handleAddNewNote: (shouldNavigate?: boolean) => void
  handleUpdateNote: (noteId: string, updates: Partial<ExpansionNote>) => void
  handleGenerateNoteContentFromTitle: (note: ExpansionNote, forceMode?: 'generate' | 'regenerate' | 'polish') => Promise<void>
  setActiveView: (view: StudioActiveView) => void
}

export const StudioMasterView: React.FC<StudioMasterViewProps> = ({
  activeWorld,
  updateActiveWorld,
  onMacroWorldLoreChange,
  onSparkChange,
  combinedWorldLore,
  showSparkCard,
  showExpansionsCard,
  isExtractingSpark,
  isSprouting,
  isSparkDraftOpen,
  setIsSparkDraftOpen,
  isSparkPlayerEdited,
  setIsSparkPlayerEdited,
  sproutingBlockId,
  generatingNoteId,
  handleExtractSparkOnly,
  handleGenerateWorldGenesis,
  handleExtractSpark,
  handleSproutFromLoreBlock,
  handleAddExtraLoreBlock,
  handleUpdateExtraLoreBlock,
  handleDeleteExtraLoreBlock,
  handleAddNewNote,
  handleUpdateNote,
  handleGenerateNoteContentFromTitle,
  setActiveView,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize Master Story Textarea dynamically whenever rawLore changes to show ALL lines
  useEffect(() => {
    if (textareaRef.current) {
      const el = textareaRef.current
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
      const raf = requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
      })
      return () => cancelAnimationFrame(raf)
    }
  }, [activeWorld.rawLore, activeWorld.id])

  return (
    <div className="space-y-0 animate-in fade-in duration-200">
      {/* 1. Master Story Card (Smoked Glass Sanctuary with Subtle Exit Light) */}
      <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 backdrop-blur-xl bg-[#141416]/80 hover:bg-[#141416]/85 border border-white/[0.12] hover:border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_20px_50px_rgba(0,0,0,0.65)] space-y-4 transition-all relative overflow-hidden">
        {/* Subtle Internal Carmine Light Dispersion near Exit Point */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              'radial-gradient(ellipse 90px 65px at 32px 100%, rgba(239, 38, 76, 0.08) 0%, rgba(239, 38, 76, 0.015) 45%, transparent 75%)',
          }}
        />

        {/* Subtle Carmine Exit Edge Glow */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10 rounded-[inherit]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="card1ExitGlow" x1="0%" y1="100%" x2="25%" y2="85%">
              <stop offset="0%" stopColor="#EF264C" stopOpacity="0.45" />
              <stop offset="35%" stopColor="#EF264C" stopOpacity="0.15" />
              <stop offset="70%" stopColor="#EF264C" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect
            x="1"
            y="1"
            width="calc(100% - 2px)"
            height="calc(100% - 2px)"
            rx="24"
            fill="none"
            stroke="url(#card1ExitGlow)"
            strokeWidth="1.2"
          />
        </svg>

        {/* World Title (Directly Editable, Clean Borderless) */}
        <input
          type="text"
          value={activeWorld.title}
          onChange={(e) => {
            const newTitle = e.target.value
            updateActiveWorld((prev) => ({ ...prev, title: newTitle }))
          }}
          placeholder="ชื่อโลก..."
          className="relative z-10 w-full text-[24px] sm:text-[28px] font-semibold text-[#F1F1F1] bg-transparent focus:outline-none placeholder-white/20 border-none p-0 tracking-tight"
        />

        {/* Story Textarea (Auto-stretches to Unlimited Length) */}
        <textarea
          ref={(el) => {
            textareaRef.current = el
            if (el) {
              el.style.height = 'auto'
              el.style.height = `${el.scrollHeight}px`
            }
          }}
          rows={4}
          value={activeWorld.rawLore}
          onInput={(e) => {
            e.currentTarget.style.height = 'auto'
            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
          }}
          onChange={(e) => {
            const val = e.target.value
            updateActiveWorld((prev) => ({ ...prev, rawLore: val }))
            onMacroWorldLoreChange(val)
          }}
          placeholder="เล่าเรื่องราวในหัวของคุณออกมาได้เลย..."
          className="relative z-10 w-full bg-transparent text-[15px] sm:text-[16px] text-[#F1F1F1] placeholder-white/20 focus:outline-none font-sans min-h-[110px] resize-none leading-relaxed border-none p-0 overflow-hidden"
        />

        {/* Bottom Toolbar: Identical to Welcome Screen (Plus & Primary Pills for Spark and Expansion) */}
        <div className="relative z-10 flex items-center justify-between pt-3">
          {/* Left: Plus Button */}
          <button
            type="button"
            className="w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-95"
            title="เพิ่มวัตถุดิบ"
          >
            <Plus size={17} strokeWidth={2.2} />
          </button>

          {/* Right: Actions (ปุ่ม สกัดสปาร์ค & ปุ่ม แตกส่วนขยาย Primary Pill) */}
          <div className="flex items-center gap-2.5">
            {/* ปุ่ม "สกัดสปาร์ค" (Primary Pill ขอบและเส้นสีแดงคาร์ไมน์) */}
            <button
              type="button"
              onClick={handleExtractSparkOnly}
              disabled={isExtractingSpark || !activeWorld.rawLore.trim()}
              className="h-[36px] sm:h-[38px] px-4 sm:px-4.5 rounded-full bg-[#EF264C]/10 hover:bg-[#EF264C]/20 border border-[#EF264C]/50 hover:border-[#EF264C] text-[#EF264C] flex items-center gap-2 text-[13px] sm:text-[13.5px] font-medium transition-all cursor-pointer shrink-0 shadow-[0_0_18px_rgba(239,38,76,0.25),inset_0_1px_0_rgba(255,255,255,0.14)] active:scale-95 group select-none disabled:opacity-40 disabled:cursor-not-allowed"
              title="สกัดชนวนเหตุจุดเริ่มต้นที่ไม่อาจถอยกลับได้ (The Inciting Spark)"
            >
              <Sparkles
                size={15}
                strokeWidth={2.2}
                className={
                  isExtractingSpark
                    ? 'animate-spin text-[#EF264C]'
                    : 'text-[#EF264C] group-hover:scale-110 transition-transform'
                }
              />
              <span>{isExtractingSpark ? 'กำลังสกัดสปาร์ค...' : 'สกัดสปาร์ค'}</span>
            </button>

            {/* ปุ่ม "แตกส่วนขยาย" (Primary Pill สีแดงคาร์ไมน์) */}
            <button
              type="button"
              onClick={() => handleGenerateWorldGenesis()}
              disabled={isSprouting || !activeWorld.rawLore.trim()}
              className="h-[36px] sm:h-[38px] px-4 sm:px-4.5 rounded-full bg-[#EF264C] hover:bg-[#ff2d55] text-white flex items-center gap-2 text-[13px] sm:text-[13.5px] font-medium transition-all cursor-pointer shrink-0 active:scale-95 border border-white/20 shadow-[0_0_26px_rgba(239,38,76,0.58),inset_0_1px_0_rgba(255,255,255,0.30)] disabled:opacity-40 disabled:cursor-not-allowed select-none"
              title="แตกส่วนขยาย"
            >
              <ArrowUp size={15} strokeWidth={2.4} className={isSprouting ? 'animate-spin' : ''} />
              <span>{isSprouting ? 'กำลังแตก...' : 'แตกส่วนขยาย'}</span>
            </button>
          </div>
        </div>

        {/* Origin Pin Node on Master Card Bottom Edge (Concentric Ring) */}
        {(showSparkCard || showExpansionsCard) && (
          <div className="absolute left-[26px] sm:left-[30px] -bottom-[6px] w-3 h-3 rounded-full bg-[#161618] border border-[#EF264C]/80 flex items-center justify-center z-20 shadow-[0_0_8px_rgba(239,38,76,0.35)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#EF264C]" />
          </div>
        )}
      </div>

      {/* Extra World Lore Cards (Stackable Unlimited World Lore Blocks) & Add Card Button */}
      <div className="relative pt-3 space-y-3">
        {/* Continuous Vertical Circuit Trunk passing through Extra Lore Cards into Spark/Expansions */}
        {(showSparkCard || showExpansionsCard) && (
          <div
            className="absolute left-[31.5px] sm:left-[35.5px] top-0 -bottom-5 w-[1.5px] bg-[#EF264C]/75 pointer-events-none z-0"
            style={{
              filter: 'drop-shadow(0 0 3px rgba(239, 38, 76, 0.35))',
            }}
          />
        )}

        {(activeWorld.extraLoreBlocks || []).map((block, idx) => {
          const isBlockSprouting = sproutingBlockId === block.id
          const blockTitle = block.title !== undefined ? block.title : `เนื้อหาโลกเพิ่มเติม #${idx + 2}`
          return (
            <div
              key={block.id}
              className="relative z-10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl bg-[#141416]/80 hover:bg-[#141416]/85 border border-white/[0.12] hover:border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_20px_45px_rgba(0,0,0,0.6)] space-y-4 transition-all animate-in fade-in duration-200 group overflow-hidden"
            >
              {/* World Title & Hover-Revealed Discreet Delete Button on Top Right */}
              <div className="relative z-10 flex items-start justify-between gap-3">
                <input
                  type="text"
                  value={blockTitle}
                  onChange={(e) => handleUpdateExtraLoreBlock(block.id, { title: e.target.value })}
                  placeholder={`เนื้อหาโลกเพิ่มเติม #${idx + 2}`}
                  className="w-full text-[17px] sm:text-[18px] font-medium text-[#F1F1F1] bg-transparent focus:outline-none placeholder-white/20 border-none p-0 tracking-tight"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteExtraLoreBlock(block.id)}
                  className="opacity-0 group-hover:opacity-100 text-white/25 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/[0.04] transition-all cursor-pointer shrink-0"
                  title="ลบการ์ดเนื้อหาโลกใบนี้"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Story Textarea (Auto-stretches to Unlimited Length) */}
              <textarea
                ref={(el) => {
                  if (el) {
                    el.style.height = 'auto'
                    el.style.height = `${el.scrollHeight}px`
                  }
                }}
                rows={4}
                value={block.content}
                onInput={(e) => {
                  e.currentTarget.style.height = 'auto'
                  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
                }}
                onChange={(e) => handleUpdateExtraLoreBlock(block.id, { content: e.target.value })}
                placeholder="เล่าเรื่องราวในหัวของคุณออกมาได้เลย..."
                className="relative z-10 w-full bg-transparent text-[15px] sm:text-[16px] text-[#F1F1F1] placeholder-white/20 focus:outline-none font-sans min-h-[110px] resize-none leading-relaxed border-none p-0 overflow-hidden"
              />

              {/* Bottom Toolbar: Plus button on Left (ready for image attachments) & Contextual Sprout Button on Right */}
              <div className="relative z-10 flex items-center justify-between pt-3">
                <button
                  type="button"
                  className="w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-95"
                  title="เพิ่มวัตถุดิบลงการ์ดนี้"
                >
                  <Plus size={17} strokeWidth={2.2} />
                </button>

                <div
                  className={`transition-all duration-200 ${
                    isBlockSprouting
                      ? 'opacity-100 pointer-events-auto'
                      : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto focus-within:pointer-events-auto'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSproutFromLoreBlock(block)}
                    disabled={isBlockSprouting || isSprouting || !block.content.trim()}
                    className="h-[32px] sm:h-[34px] px-3.5 sm:px-4 rounded-full bg-[#EF264C] hover:bg-[#ff2d55] text-white flex items-center gap-1.5 text-[12px] sm:text-[12.5px] font-medium transition-all cursor-pointer shrink-0 active:scale-95 border border-white/20 shadow-[0_0_20px_rgba(239,38,76,0.48),inset_0_1px_0_rgba(255,255,255,0.25)] disabled:opacity-40 disabled:cursor-not-allowed select-none"
                    title="แตกส่วนขยายเฉพาะการ์ดนี้"
                  >
                    <ArrowUp size={14} strokeWidth={2.4} className={isBlockSprouting ? 'animate-spin' : ''} />
                    <span>{isBlockSprouting ? 'กำลังแตก...' : 'แตกส่วนขยายการ์ดนี้'}</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {/* Add Extra World Lore Card Button */}
        <div className="relative z-10 flex items-center justify-end">
          <button
            type="button"
            onClick={handleAddExtraLoreBlock}
            className="h-[30px] sm:h-[32px] px-3.5 sm:px-4 rounded-full backdrop-blur-md bg-white/[0.03] hover:bg-white/[0.07] border border-dashed border-white/[0.14] hover:border-[#EF264C]/50 text-white/55 hover:text-white text-[12px] font-normal flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 group select-none"
            title="เพิ่มการ์ดเนื้อหาโลกใบใหม่ต่อท้าย"
          >
            <Plus size={13} className="text-white/40 group-hover:text-[#EF264C] transition-colors" strokeWidth={2.2} />
            <span>เพิ่มการ์ดเนื้อหาโลก</span>
          </button>
        </div>
      </div>

      {/* Underneath Card 1: Both action pills when neither Spark nor Expansions exist yet */}
      {!showSparkCard && !showExpansionsCard && (
        <div className="flex items-center justify-center gap-2.5 pt-4 sm:pt-5 relative z-10 animate-in fade-in duration-300">
          <button
            type="button"
            onClick={() => {
              setIsSparkDraftOpen(true)
              if (!activeWorld.sparkText) {
                updateActiveWorld((prev) => ({ ...prev, sparkText: '' }))
              }
            }}
            className="h-[29px] sm:h-[31px] px-3.5 sm:px-4 rounded-full backdrop-blur-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-[#EF264C]/50 text-[11.5px] sm:text-[12px] font-normal flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.25)] transition-all cursor-pointer active:scale-95 group select-none"
            title="ยังไม่มีสปาร์ค · กดเพื่อเพิ่มสปาร์คด้วยตนเอง"
          >
            <Plus size={12} className="text-[#EF264C] group-hover:scale-125 transition-transform" strokeWidth={2.2} />
            <span className="text-[#EF264C]">ยังไม่มีสปาร์ค</span>
            <span className="text-white/60 group-hover:text-white/90">กดเพิ่ม</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddNewNote(true)}
            className="h-[29px] sm:h-[31px] px-3.5 sm:px-4 rounded-full backdrop-blur-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-white/[0.18] text-white/60 hover:text-white/95 text-[11.5px] sm:text-[12px] font-normal flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.25)] transition-all cursor-pointer active:scale-95 group select-none"
            title="เพิ่มบันทึกส่วนขยายด้วยตนเอง"
          >
            <Plus size={12} className="text-white/40 group-hover:text-white/80 transition-colors" strokeWidth={2.2} />
            <span>เพิ่มส่วนขยายเอง</span>
          </button>
        </div>
      )}

      {/* Stepped Circuit Container with Indented Sub-Cards (Step 2 & Step 3 Offset to Inside) */}
      {(showSparkCard || showExpansionsCard) && (
        <div className="relative pl-12 sm:pl-20 space-y-6 pt-5">
          {/* 2. Spark Card (The Inciting Spark - จุดเริ่มต้นที่ไม่อาจถอยกลับได้) */}
          {showSparkCard && (
            <div className="relative animate-in fade-in duration-200">
              {/* Smooth Curved Wire branching from Vertical Line into Card 2 */}
              <div
                className="absolute -left-4 sm:-left-[44px] -top-5 w-4 sm:w-[44px] h-[48px] border-l-[1.5px] border-b-[1.5px] border-[#EF264C]/75 rounded-bl-[16px] sm:rounded-bl-[20px] pointer-events-none"
                style={{
                  boxShadow: 'inset 0 -1px 3px rgba(239, 38, 76, 0.2)',
                  filter: 'drop-shadow(0 0 3px rgba(239, 38, 76, 0.35))',
                }}
              />

              {/* Continuous vertical trunk segment continuing down alongside Card 2 to Card 3 (Only if Expansions exist) */}
              {showExpansionsCard && (
                <div
                  className="absolute -left-4 sm:-left-[44px] top-[28px] -bottom-6 w-[1.5px] bg-[#EF264C]/75 pointer-events-none"
                  style={{
                    filter: 'drop-shadow(0 0 3px rgba(239, 38, 76, 0.35))',
                  }}
                />
              )}

              {/* Entry Pin Node on Card 2 Left Edge (Concentric Ring) */}
              <div className="absolute -left-[6px] top-[22px] w-3 h-3 rounded-full bg-[#161618] border border-[#EF264C]/80 flex items-center justify-center z-20 shadow-[0_0_8px_rgba(239,38,76,0.35)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#EF264C]" />
              </div>

              <div className="rounded-2xl p-5 sm:p-6 backdrop-blur-xl bg-[#141416]/80 hover:bg-[#141416]/85 border border-white/[0.12] hover:border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_16px_40px_rgba(0,0,0,0.55)] space-y-3 transition-all relative overflow-hidden">
                {/* Subtle Internal Carmine Light Dispersion near Entry Point */}
                <div
                  className="absolute inset-0 pointer-events-none z-0"
                  style={{
                    background:
                      'radial-gradient(ellipse 65% 65% at 0% 28px, rgba(239, 38, 76, 0.08) 0%, rgba(239, 38, 76, 0.015) 45%, transparent 75%)',
                  }}
                />

                {/* Subtle Carmine Contact Edge Fade (Fades softly along left and top border) */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none z-10 rounded-[inherit]"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="card2ContactGlow" x1="0%" y1="20%" x2="40%" y2="70%">
                      <stop offset="0%" stopColor="#EF264C" stopOpacity="0.45" />
                      <stop offset="25%" stopColor="#EF264C" stopOpacity="0.18" />
                      <stop offset="60%" stopColor="#EF264C" stopOpacity="0.04" />
                      <stop offset="100%" stopColor="#EF264C" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <rect
                    x="1"
                    y="1"
                    width="calc(100% - 2px)"
                    height="calc(100% - 2px)"
                    rx="16"
                    fill="none"
                    stroke="url(#card2ContactGlow)"
                    strokeWidth="1.2"
                  />
                </svg>

                <div className="relative z-10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-semibold text-[#EF264C] tracking-tight">The Spark</span>
                    <span className="text-[12.5px] font-normal text-white/50">
                      (จุดเริ่มต้นที่ทำให้ทุกอย่างหมุน · In Medias Res)
                    </span>
                  </div>

                  {/* Smart Spark Action Button (สกัดสปาร์ค / เรียบเรียงสปาร์ค / สกัดสปาร์คใหม่) + Clear */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        handleExtractSpark(
                          !activeWorld.sparkText.trim()
                            ? 'extract'
                            : isSparkPlayerEdited
                              ? 'polish'
                              : 'regenerate'
                        )
                      }
                      disabled={isExtractingSpark || (!combinedWorldLore && !activeWorld.sparkText.trim())}
                      className="h-6.5 px-2.5 rounded-full text-[11px] font-medium bg-[#EF264C]/15 hover:bg-[#EF264C]/25 border border-[#EF264C]/45 text-[#EF264C] flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed select-none"
                      title={
                        !activeWorld.sparkText.trim()
                          ? 'ให้ AI สกัดและกึ่งปั้นตัวละครมาชนกับคุณจากเนื้อหาโลกหลัก'
                          : isSparkPlayerEdited
                            ? 'นำชนวนเหตุที่คุณพิมพ์มาจัดระเบียบและเรียบเรียงให้เข้ากับโลกหลัก'
                            : 'สุ่มตัวละครและจุดเริ่มต้นส่วนตัวมุมใหม่จากโลกใบนี้'
                      }
                    >
                      {!activeWorld.sparkText.trim() || isSparkPlayerEdited ? (
                        <Sparkles
                          size={11}
                          className={isExtractingSpark ? 'animate-spin text-[#EF264C]' : ''}
                        />
                      ) : (
                        <RefreshCw
                          size={11}
                          className={isExtractingSpark ? 'animate-spin text-[#EF264C]' : ''}
                        />
                      )}
                      <span>
                        {isExtractingSpark
                          ? isSparkPlayerEdited && activeWorld.sparkText.trim()
                            ? 'กำลังเรียบเรียง...'
                            : activeWorld.sparkText.trim()
                              ? 'กำลังสุ่มมุมใหม่...'
                              : 'กำลังสกัด...'
                          : !activeWorld.sparkText.trim()
                            ? 'สกัดสปาร์ค'
                            : isSparkPlayerEdited
                              ? 'เรียบเรียงสปาร์ค'
                              : 'สกัดสปาร์คใหม่'}
                      </span>
                    </button>

                    {isSparkPlayerEdited && activeWorld.sparkText.trim() && combinedWorldLore && (
                      <button
                        type="button"
                        onClick={() => handleExtractSpark('regenerate')}
                        disabled={isExtractingSpark}
                        className="w-6.5 h-6.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.10] hover:border-[#EF264C]/45 text-white/50 hover:text-[#EF264C] flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                        title="สุ่มตัวละครและสปาร์คมุมใหม่จากโลกหลัก (ล้างข้อความที่พิมพ์)"
                      >
                        <RefreshCw size={11} />
                      </button>
                    )}

                    {(activeWorld.sparkText || isSparkDraftOpen) && (
                      <button
                        type="button"
                        onClick={() => {
                          updateActiveWorld((prev) => ({ ...prev, sparkText: '' }))
                          onSparkChange('')
                          setIsSparkDraftOpen(false)
                          setIsSparkPlayerEdited(false)
                        }}
                        className="opacity-0 group-hover:opacity-100 text-white/25 hover:text-rose-400 p-1 rounded-md hover:bg-white/[0.04] transition-all cursor-pointer shrink-0"
                        title="ลบสปาร์คนี้"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Spark Textarea (Auto-stretches to Unlimited Length) */}
                <textarea
                  ref={(el) => {
                    if (el) {
                      el.style.height = 'auto'
                      el.style.height = `${el.scrollHeight}px`
                    }
                  }}
                  rows={2}
                  value={activeWorld.sparkText}
                  onInput={(e) => {
                    e.currentTarget.style.height = 'auto'
                    e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
                  }}
                  onChange={(e) => {
                    const val = e.target.value
                    updateActiveWorld((prev) => ({ ...prev, sparkText: val }))
                    onSparkChange(val)
                    setIsSparkPlayerEdited(true)
                  }}
                  placeholder="เขียนจุดเริ่มต้นที่ทำให้ทุกอย่างหมุน หรือกด 'สกัดสปาร์ค' เพื่อสร้างฉากชนกัน (In Medias Res)..."
                  className="relative z-10 w-full bg-transparent text-[14px] sm:text-[14.5px] text-[#F1F1F1] focus:outline-none resize-none leading-relaxed font-sans placeholder-white/20 border-none p-0 min-h-[50px] overflow-hidden"
                  autoFocus={isSparkDraftOpen && !activeWorld.sparkText}
                />
              </div>

              {/* Underneath Card 2 (Spark): Follower button to add expansions when they do not exist yet */}
              {!showExpansionsCard && (
                <div className="flex items-center justify-start pt-3 pl-1 relative z-10 animate-in fade-in duration-300">
                  <button
                    type="button"
                    onClick={() => handleAddNewNote(true)}
                    className="h-[29px] sm:h-[31px] px-3.5 sm:px-4 rounded-full backdrop-blur-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-white/[0.18] text-white/60 hover:text-white/95 text-[11.5px] sm:text-[12px] font-normal flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.25)] transition-all cursor-pointer active:scale-95 group select-none"
                    title="เพิ่มบันทึกส่วนขยายด้วยตนเอง"
                  >
                    <Plus
                      size={12}
                      className="text-white/40 group-hover:text-white/80 transition-colors"
                      strokeWidth={2.2}
                    />
                    <span>เพิ่มส่วนขยายเอง</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. Expansions Container Card (Indented Step 3 with Subtle Carmine Contact Fade & Smooth Curve) */}
          {showExpansionsCard && (
            <div className="relative animate-in fade-in duration-200">
              {/* Smooth Curved Wire branching from Vertical Trunk into Card 3 */}
              <div
                className="absolute -left-4 sm:-left-[44px] -top-6 w-4 sm:w-[44px] h-[52px] border-l-[1.5px] border-b-[1.5px] border-[#EF264C]/75 rounded-bl-[16px] sm:rounded-bl-[20px] pointer-events-none"
                style={{
                  boxShadow: 'inset 0 -1px 3px rgba(239, 38, 76, 0.2)',
                  filter: 'drop-shadow(0 0 3px rgba(239, 38, 76, 0.35))',
                }}
              />

              {/* Entry Pin Node on Card 3 Left Edge (Concentric Ring) */}
              <div className="absolute -left-[6px] top-[22px] w-3 h-3 rounded-full bg-[#161618] border border-[#EF264C]/80 flex items-center justify-center z-20 shadow-[0_0_8px_rgba(239,38,76,0.35)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#EF264C]" />
              </div>

              <div className="rounded-2xl p-5 sm:p-6 backdrop-blur-xl bg-[#141416]/80 hover:bg-[#141416]/85 border border-white/[0.12] hover:border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_16px_40px_rgba(0,0,0,0.55)] space-y-4 transition-all relative overflow-hidden">
                {/* Subtle Internal Carmine Light Dispersion near Entry Point */}
                <div
                  className="absolute inset-0 pointer-events-none z-0"
                  style={{
                    background:
                      'radial-gradient(ellipse 65% 65% at 0% 28px, rgba(239, 38, 76, 0.08) 0%, rgba(239, 38, 76, 0.015) 45%, transparent 75%)',
                  }}
                />

                {/* Subtle Carmine Contact Edge Fade (Fades softly along left and top border) */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none z-10 rounded-[inherit]"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="card3ContactGlow" x1="0%" y1="20%" x2="40%" y2="70%">
                      <stop offset="0%" stopColor="#EF264C" stopOpacity="0.45" />
                      <stop offset="25%" stopColor="#EF264C" stopOpacity="0.18" />
                      <stop offset="60%" stopColor="#EF264C" stopOpacity="0.04" />
                      <stop offset="100%" stopColor="#EF264C" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <rect
                    x="1"
                    y="1"
                    width="calc(100% - 2px)"
                    height="calc(100% - 2px)"
                    rx="16"
                    fill="none"
                    stroke="url(#card3ContactGlow)"
                    strokeWidth="1.2"
                  />
                </svg>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-white/90">ส่วนขยาย</span>
                    <span className="px-1.5 py-0.5 rounded text-[10.5px] font-mono bg-white/[0.06] text-white/50">
                      {activeWorld.notes.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGenerateWorldGenesis(undefined, 'more')}
                    disabled={isSprouting || !combinedWorldLore}
                    className="h-[26px] sm:h-[28px] px-2.5 sm:px-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-[#EF264C]/50 text-white/70 hover:text-white text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed select-none group"
                    title="สกัดหัวข้อที่เหลือจากโลกหลักเพิ่มเติม (ทีละ 4-5 หัวข้อ)"
                  >
                    <Sparkles
                      size={11}
                      className={
                        isSprouting
                          ? 'animate-spin text-[#EF264C]'
                          : 'text-white/40 group-hover:text-[#EF264C] transition-colors'
                      }
                    />
                    <span>{isSprouting ? 'กำลังสกัดเพิ่ม...' : 'สกัดเพิ่ม'}</span>
                  </button>
                </div>

                {/* Grid with Inline Editing of Note Titles + เจนเนื้อหา + Link Arrow on right */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {activeWorld.notes.map((note) => {
                    const isGeneratingThisNote = generatingNoteId === note.id
                    const isNoteEmpty = !note.content.trim()
                    const isNoteEdited = Boolean(note.isPlayerEdited && !isNoteEmpty)
                    return (
                      <div
                        key={note.id}
                        className="px-3.5 py-2.5 rounded-xl backdrop-blur-md bg-white/[0.04] hover:bg-white/[0.07] focus-within:bg-white/[0.08] border border-white/[0.09] hover:border-white/[0.18] focus-within:border-[#EF264C]/50 text-[#F1F1F1] text-[13px] flex items-center justify-between transition-all group shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] gap-2"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 group-hover:scale-125 transition-transform ${
                              note.isSavedToCabinet ? 'bg-emerald-400' : 'bg-[#EF264C]'
                            }`}
                            title={note.isSavedToCabinet ? 'เก็บเข้าตู้ลิ้นชักแล้ว' : undefined}
                          />
                          <input
                            type="text"
                            value={note.title}
                            onChange={(e) => {
                              const newTitle = e.target.value
                              handleUpdateNote(note.id, { title: newTitle })
                            }}
                            placeholder="ตั้งชื่อส่วนขยาย..."
                            className="bg-transparent text-white/90 placeholder-white/25 focus:text-white focus:outline-none border-none p-0 w-full text-[13px] font-medium"
                          />
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleGenerateNoteContentFromTitle(note)}
                            disabled={
                              (!note.title.trim() && !isNoteEdited) ||
                              generatingNoteId !== null ||
                              (!combinedWorldLore && !isNoteEdited)
                            }
                            className={`h-6 px-2 rounded-full text-[10.5px] font-medium flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed select-none ${
                              isNoteEmpty || isNoteEdited || isGeneratingThisNote
                                ? 'bg-[#EF264C]/15 hover:bg-[#EF264C]/25 border border-[#EF264C]/45 text-[#EF264C]'
                                : 'opacity-0 group-hover:opacity-100 bg-white/[0.05] hover:bg-[#EF264C]/20 border border-white/[0.10] hover:border-[#EF264C]/45 text-white/60 hover:text-[#EF264C]'
                            }`}
                            title={
                              isNoteEmpty
                                ? 'ให้ AI เจนเนื้อหาส่วนขยายตามหัวข้อนี้จากเนื้อหาโลกหลัก'
                                : isNoteEdited
                                  ? 'นำเนื้อหาที่คุณพิมพ์ในการ์ดนี้ไปจัดระเบียบและแต่งต่อให้เข้ากับโลกหลัก'
                                  : 'เจนเนื้อหาใหม่จากหัวข้อเดิม'
                            }
                          >
                            {isNoteEmpty || isNoteEdited ? (
                              <Sparkles
                                size={10}
                                className={isGeneratingThisNote ? 'animate-spin text-[#EF264C]' : ''}
                              />
                            ) : (
                              <RefreshCw
                                size={10}
                                className={isGeneratingThisNote ? 'animate-spin text-[#EF264C]' : ''}
                              />
                            )}
                            <span>
                              {isGeneratingThisNote
                                ? 'กำลังเจน...'
                                : isNoteEmpty
                                  ? 'เจนเนื้อหา'
                                  : isNoteEdited
                                    ? 'เรียบเรียงเนื้อหา'
                                    : 'เจนเนื้อหาใหม่'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveView({ type: 'note', noteId: note.id })}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all cursor-pointer shrink-0"
                            title={`ไปยังหน้ารายละเอียดส่วนขยาย: ${note.title || 'ไม่มีชื่อ'}`}
                          >
                            <ArrowUpRight
                              size={14}
                              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-white/50 hover:text-white"
                            />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Add Expansion Bottom Action Slot */}
                <button
                  type="button"
                  onClick={() => handleAddNewNote(true)}
                  className="relative z-10 w-full py-2.5 rounded-xl border border-dashed border-white/[0.10] hover:border-[#EF264C]/50 bg-white/[0.02] hover:bg-white/[0.05] text-white/50 hover:text-white flex items-center justify-center gap-2 text-[12.5px] font-medium transition-all cursor-pointer group active:scale-[0.99] backdrop-blur-sm"
                  title="เพิ่มส่วนขยายใหม่"
                >
                  <Plus size={14} className="text-white/40 group-hover:text-[#EF264C] transition-colors" />
                  <span>เพิ่มส่วนขยาย</span>
                </button>
              </div>

              {/* Underneath Card 3 (Expansions): Follower button to add spark when spark does not exist yet */}
              {!showSparkCard && (
                <div className="flex items-center justify-start pt-3 pl-1 relative z-10 animate-in fade-in duration-300">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSparkDraftOpen(true)
                      if (!activeWorld.sparkText) {
                        updateActiveWorld((prev) => ({ ...prev, sparkText: '' }))
                      }
                    }}
                    className="h-[29px] sm:h-[31px] px-3.5 sm:px-4 rounded-full backdrop-blur-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-[#EF264C]/50 text-[11.5px] sm:text-[12px] font-normal flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.25)] transition-all cursor-pointer active:scale-95 group select-none"
                    title="ยังไม่มีสปาร์ค · กดเพื่อเพิ่มสปาร์คด้วยตนเอง"
                  >
                    <Plus
                      size={12}
                      className="text-[#EF264C] group-hover:scale-125 transition-transform"
                      strokeWidth={2.2}
                    />
                    <span className="text-[#EF264C]">ยังไม่มีสปาร์ค</span>
                    <span className="text-white/60 group-hover:text-white/90">กดเพิ่ม</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
