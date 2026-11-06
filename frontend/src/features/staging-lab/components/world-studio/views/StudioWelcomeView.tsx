import React from 'react'
import {
  Sparkles,
  ArrowUp,
  Search,
  Plus,
} from 'lucide-react'

interface StudioWelcomeViewProps {
  welcomeDraftLore: string
  setWelcomeDraftLore: (v: string) => void
  welcomeTextareaRef: React.RefObject<HTMLTextAreaElement | null>
  welcomeCardContainerRef: React.RefObject<HTMLDivElement | null>
  isInitialBounce: boolean
  isExtractingSpark: boolean
  isSprouting: boolean
  isWelcomeDropdownOpen: boolean
  setIsWelcomeDropdownOpen: (v: boolean) => void
  showSparkCard: boolean
  showExpansionsCard: boolean
  presets: Array<{ id: string; fullText: string }>
  onSelectPreset: (text: string) => void
  onCreateWorldAndExtractSpark: () => void
  onCreateWorldAndSprout: () => void
  onManualAddSpark: () => void
  onManualAddNote: () => void
}

export const StudioWelcomeView: React.FC<StudioWelcomeViewProps> = ({
  welcomeDraftLore,
  setWelcomeDraftLore,
  welcomeTextareaRef,
  welcomeCardContainerRef,
  isInitialBounce,
  isExtractingSpark,
  isSprouting,
  isWelcomeDropdownOpen,
  setIsWelcomeDropdownOpen,
  showSparkCard,
  showExpansionsCard,
  presets,
  onSelectPreset,
  onCreateWorldAndExtractSpark,
  onCreateWorldAndSprout,
  onManualAddSpark,
  onManualAddNote,
}) => {
  return (
    <div className="w-full max-w-[640px] mx-auto text-center animate-in fade-in zoom-in-95 duration-300 relative">
      {/* Center Headline */}
      <h1 className="text-[26px] sm:text-[30px] md:text-[33px] font-normal text-[#F2F2F5] tracking-[0.02em] mb-9 sm:mb-10 leading-tight [text-shadow:_0_2px_24px_rgba(0,0,0,0.95)]">
        ทั้งหมดนี้เป็นเรื่องราวเกี่ยวกับอะไร...
      </h1>

      {/* Frosted Container with Character Orbs (Konosuba Gang Palette) */}
      <div className="relative mx-auto max-w-[580px] w-full pt-1">
        {/* ORB 1: HERO CARMINE RED */}
        <div
          className="absolute top-[8%] -left-8 sm:-left-10 w-[84px] h-[84px] sm:w-[96px] sm:h-[96px] rounded-full pointer-events-none z-0"
          style={{
            background: 'linear-gradient(135deg, #FF3B69 0%, #EF264C 45%, #D40049 80%, #8A002A 100%)',
            boxShadow: '0 0 55px rgba(239, 38, 76, 0.75)',
            animation: isInitialBounce
              ? 'orbSwoopMint 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
              : 'orbBreathe 4s ease-in-out infinite',
          }}
        />

        {/* ORB 2: SOLAR GOLD ACCENT */}
        <div
          className="absolute top-[34%] -right-4 sm:-right-5 w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] rounded-full pointer-events-none z-0"
          style={{
            background: 'linear-gradient(135deg, #FFF176 0%, #FEB340 45%, #FB8C00 80%, #D84315 100%)',
            boxShadow: '0 0 38px rgba(254, 179, 64, 0.72)',
            animation: isInitialBounce
              ? 'orbSwoopAzure 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) 0.18s backwards'
              : 'orbBreathe 4.5s ease-in-out infinite 0.8s',
          }}
        />

        {/* ORB 3: ULTRAVIOLET PURPLE */}
        <div
          className="absolute -bottom-7 -right-6 sm:-right-8 w-[74px] h-[74px] sm:w-[84px] sm:h-[84px] rounded-full pointer-events-none z-0"
          style={{
            background: 'linear-gradient(135deg, #E056FD 0%, #A855F7 35%, #7C3AED 70%, #581C87 100%)',
            boxShadow: '0 0 52px rgba(168, 85, 247, 0.72)',
            animation: isInitialBounce
              ? 'orbSwoopLavender 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) 0.25s backwards'
              : 'orbBreathe 5s ease-in-out infinite 1.5s',
          }}
        />

        {/* Frosted Glass Rounded-Rectangle */}
        <div
          ref={welcomeCardContainerRef}
          className="relative z-10 backdrop-blur-xl bg-white/[0.06] border border-white/[0.18] hover:border-white/[0.28] focus-within:border-white/[0.38] rounded-3xl sm:rounded-[32px] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(255,255,255,0.06),0_20px_50px_rgba(0,0,0,0.85)] min-h-[210px] sm:min-h-[235px] p-6 sm:p-7 flex flex-col justify-between transition-all"
          style={{
            animation: isInitialBounce
              ? 'cardSquashRebound 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.30s backwards'
              : undefined,
          }}
        >
          {/* Top Text Input Area */}
          <textarea
            ref={welcomeTextareaRef}
            value={welcomeDraftLore}
            onFocus={() => {
              if (!welcomeDraftLore.trim()) {
                setIsWelcomeDropdownOpen(true)
              }
            }}
            onClick={() => {
              if (!welcomeDraftLore.trim()) {
                setIsWelcomeDropdownOpen(true)
              }
            }}
            onChange={(e) => {
              const val = e.target.value
              setWelcomeDraftLore(val)
              if (val.trim()) {
                setIsWelcomeDropdownOpen(false)
              } else {
                setIsWelcomeDropdownOpen(true)
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.metaKey || e.ctrlKey) {
                  e.preventDefault()
                  const target = e.currentTarget
                  const start = target.selectionStart
                  const end = target.selectionEnd
                  const val = welcomeDraftLore
                  const newVal = val.substring(0, start) + '\n' + val.substring(end)
                  setWelcomeDraftLore(newVal)
                  setTimeout(() => {
                    target.selectionStart = target.selectionEnd = start + 1
                  }, 0)
                  return
                }
                if (e.shiftKey) {
                  return
                }
                e.preventDefault()
                if (welcomeDraftLore.trim()) {
                  onCreateWorldAndSprout()
                }
              }
            }}
            placeholder="เล่าเรื่องราวในหัวของคุณออกมาได้เลย... (กด Cmd+Enter เพื่อขึ้นบรรทัดใหม่)"
            className="w-full bg-transparent text-[15px] sm:text-[16px] text-white placeholder-white/40 focus:outline-none font-sans resize-none leading-relaxed min-h-[120px] sm:min-h-[140px] max-h-[240px] border-none p-0"
          />

          {/* Bottom Toolbar: Plus on Left, Primary Pills for Spark & Expansion on Right */}
          <div className="flex items-center justify-between pt-3">
            {/* Left: Plus Button */}
            <button
              type="button"
              className="w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-95"
              title="เพิ่มวัตถุดิบ"
            >
              <Plus size={17} strokeWidth={2.2} />
            </button>

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5">
              {/* ปุ่ม "สกัดสปาร์ค" */}
              <button
                type="button"
                onClick={onCreateWorldAndExtractSpark}
                disabled={isExtractingSpark || !welcomeDraftLore.trim()}
                className="h-[36px] sm:h-[38px] px-4 sm:px-4.5 rounded-full bg-[#EF264C]/10 hover:bg-[#EF264C]/20 border border-[#EF264C]/50 hover:border-[#EF264C] text-[#EF264C] flex items-center gap-2 text-[13px] sm:text-[13.5px] font-medium transition-all cursor-pointer shrink-0 shadow-[0_0_18px_rgba(239,38,76,0.25),inset_0_1px_0_rgba(255,255,255,0.14)] active:scale-95 group select-none disabled:opacity-40 disabled:cursor-not-allowed"
                title="สกัดชนวนเหตุจุดเริ่มต้นที่ไม่อาจถอยกลับได้ (The Inciting Spark)"
              >
                <Sparkles size={15} strokeWidth={2.2} className={isExtractingSpark ? 'animate-spin text-[#EF264C]' : 'text-[#EF264C] group-hover:scale-110 transition-transform'} />
                <span>{isExtractingSpark ? 'กำลังสกัดสปาร์ค...' : 'สกัดสปาร์ค'}</span>
              </button>

              {/* ปุ่ม "แตกส่วนขยาย" */}
              <button
                type="button"
                onClick={onCreateWorldAndSprout}
                disabled={isSprouting}
                className="h-[36px] sm:h-[38px] px-4 sm:px-4.5 rounded-full bg-[#EF264C] hover:bg-[#ff2d55] text-white flex items-center gap-2 text-[13px] sm:text-[13.5px] font-medium transition-all cursor-pointer shrink-0 active:scale-95 border border-white/20 shadow-[0_0_26px_rgba(239,38,76,0.58),inset_0_1px_0_rgba(255,255,255,0.30)] disabled:opacity-40 select-none"
                style={{
                  animation: isInitialBounce
                    ? 'konosubaExclamationIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.54s backwards'
                    : undefined,
                }}
                title="แตกส่วนขยาย"
              >
                <ArrowUp size={15} strokeWidth={2.4} className={isSprouting ? 'animate-spin' : ''} />
                <span>{isSprouting ? 'กำลังแตก...' : 'แตกส่วนขยาย'}</span>
              </button>
            </div>
          </div>

          {/* In-flow Suggestions */}
          {isWelcomeDropdownOpen && !welcomeDraftLore.trim() && (
            <div className="pt-3.5 mt-3 border-t border-white/[0.08] space-y-0.5 animate-in fade-in duration-200">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    onSelectPreset(preset.fullText)
                  }}
                  className="w-full text-left py-2 px-3 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer flex items-start gap-2.5 group active:scale-[0.99]"
                >
                  <Search size={14} className="text-white/40 shrink-0 mt-0.5 group-hover:text-white/70 transition-colors" />
                  <p className="text-[12.5px] sm:text-[13px] text-[#F1F1F1] group-hover:text-white line-clamp-2 leading-relaxed font-sans">
                    {preset.fullText}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* แถบปุ่มแคปซูลกระจกคู่ด้านล่าง */}
        {(!showSparkCard || !showExpansionsCard) && (
          <div className="flex items-center justify-center gap-2.5 pt-4 sm:pt-5 relative z-10 animate-in fade-in duration-300">
            {!showSparkCard && (
              <button
                type="button"
                onClick={onManualAddSpark}
                className="h-[29px] sm:h-[31px] px-3.5 sm:px-4 rounded-full backdrop-blur-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-white/[0.18] text-white/60 hover:text-white/95 text-[11.5px] sm:text-[12px] font-normal flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.25)] transition-all cursor-pointer active:scale-95 group select-none"
                title="เพิ่มหรือเขียน The Inciting Spark ด้วยตนเอง"
              >
                <Plus size={12} className="text-white/40 group-hover:text-white/80 transition-colors" strokeWidth={2.2} />
                <span>เพิ่มสปาร์คเอง</span>
              </button>
            )}

            {!showExpansionsCard && (
              <button
                type="button"
                onClick={onManualAddNote}
                className="h-[29px] sm:h-[31px] px-3.5 sm:px-4 rounded-full backdrop-blur-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-white/[0.18] text-white/60 hover:text-white/95 text-[11.5px] sm:text-[12px] font-normal flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.25)] transition-all cursor-pointer active:scale-95 group select-none"
                title="เพิ่มบันทึกส่วนขยายด้วยตนเอง"
              >
                <Plus size={12} className="text-white/40 group-hover:text-white/80 transition-colors" strokeWidth={2.2} />
                <span>เพิ่มส่วนขยายเอง</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
