import { useState } from 'react'
import { Lock, Sparkles, X } from 'lucide-react'

interface CentralDockIslandProps {
  isArchetypeActive?: boolean
  onToggleArchetype?: () => void
  archetypeName?: string

  isRelationshipActive?: boolean
  onToggleRelationship?: () => void
  relationshipLabel?: string
  relationshipImprintCount?: number

  isCharacterStateActive: boolean
  onToggleCharacterState: () => void
  characterStateLevel: number

  isBoundaryActive: boolean
  onToggleBoundary: () => void

  isKineticActive: boolean
  onToggleKinetic: () => void

  isKineticLinkedToBoundary: boolean
  onToggleKineticLink: () => void

  isShieldActive?: boolean
  onToggleShield?: () => void
  shieldState?: string

  onBypassAll?: () => void
}

export function CentralDockIsland({
  isArchetypeActive,
  onToggleArchetype,
  archetypeName,
  isRelationshipActive,
  onToggleRelationship,
  relationshipLabel,
  relationshipImprintCount = 0,
  isCharacterStateActive,
  onToggleCharacterState,
  characterStateLevel,
  isBoundaryActive,
  onToggleBoundary,
  isKineticActive,
  onToggleKinetic,
  isKineticLinkedToBoundary,
  onToggleKineticLink,
  isShieldActive,
  onToggleShield,
  shieldState,
  onBypassAll,
}: CentralDockIslandProps) {
  const stateKey = `${isArchetypeActive ? 1 : 0}-${isRelationshipActive ? 1 : 0}-${isCharacterStateActive ? 1 : 0}-${isBoundaryActive ? 1 : 0}-${isKineticActive ? 1 : 0}-${isKineticLinkedToBoundary ? 1 : 0}-${isShieldActive ? 1 : 0}`
  const [dismissedKey, setDismissedKey] = useState<string | null>(null)
  const isTipDismissed = dismissedKey === stateKey

  const activeCount =
    (isArchetypeActive ? 1 : 0) +
    (isRelationshipActive ? 1 : 0) +
    (isCharacterStateActive ? 1 : 0) +
    (isBoundaryActive ? 1 : 0) +
    (isKineticActive ? 1 : 0) +
    (isShieldActive ? 1 : 0)

  // Render Left-Aligned Tip Content (2-3 lines with fixed width and close button)
  const renderTipContent = () => {
    // Priority 1: Both 01 and 02 active
    if (isBoundaryActive && isKineticActive) {
      if (!isKineticLinkedToBoundary) {
        return (
          <>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#34d399] mb-1 pr-6">
              <Sparkles size={12} className="shrink-0" />
              <span>คำแนะนำ: เชื่อมโยงการ์ดที่ 2</span>
            </div>
            <p className="text-[10.5px] text-white/60 leading-relaxed font-sans mb-2.5">
              ต้องการเชื่อมโยงกับการ์ดสภาวะตัวตนไหม? แตะปุ่มด้านล่างเพื่อผสานระดับการหวงตัว ({characterStateLevel}%) เข้ากับสรีระ
            </p>
            <button
              type="button"
              onClick={onToggleKineticLink}
              className="w-full py-1.5 px-2.5 rounded-xl bg-[#f59e0b]/15 hover:bg-[#f59e0b]/25 border border-[#f59e0b]/35 text-[#f59e0b] text-[10.5px] font-medium font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
              <span>เชื่อมโยงสภาวะตัวตน (Somatic Friction)</span>
            </button>
          </>
        )
      }

      return (
        <>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#f59e0b] mb-1 pr-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shadow-[0_0_6px_rgba(245,158,11,0.8)] shrink-0" />
            <span>มิติที่เชื่อมโยง: DUAL ROUTE</span>
          </div>
          <p className="text-[10.5px] text-white/75 leading-relaxed font-sans mb-2">
            ระดับการหวงตัว ({characterStateLevel}%) กำลังกำกับทั้งการปัดป้อง (01) และความชะงักเกร็งในสรีระ (02) อย่างสมบูรณ์
          </p>
          <button
            type="button"
            onClick={onToggleKineticLink}
            className="text-[9.5px] text-white/40 hover:text-white/70 font-mono transition-colors underline cursor-pointer"
          >
            แตะเพื่อถอดการเชื่อมโยงท่วงท่า (กลับสู่ฟิสิกส์ล้วน)
          </button>
        </>
      )
    }

    // Priority 2: Only 02 is active
    if (isKineticActive) {
      if (!isKineticLinkedToBoundary) {
        return (
          <>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#34d399] mb-1 pr-6">
              <Sparkles size={12} className="shrink-0" />
              <span>คำแนะนำ: ท่วงท่าต่อเนื่อง (02)</span>
            </div>
            <p className="text-[10.5px] text-white/60 leading-relaxed font-sans mb-2.5">
              ปัจจุบันใช้แรงเฉื่อยฟิสิกส์ล้วน แตะปุ่มด้านล่างเพื่อเชื่อมโยงกับการ์ดสภาวะตัวตน
            </p>
            <button
              type="button"
              onClick={onToggleKineticLink}
              className="w-full py-1.5 px-2.5 rounded-xl bg-[#f59e0b]/15 hover:bg-[#f59e0b]/25 border border-[#f59e0b]/35 text-[#f59e0b] text-[10.5px] font-medium font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
              <span>เชื่อมโยงสภาวะตัวตน (Somatic Friction)</span>
            </button>
          </>
        )
      }

      return (
        <>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#f59e0b] mb-1 pr-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shadow-[0_0_6px_rgba(245,158,11,0.8)] shrink-0" />
            <span>มิติที่ปลดล็อก: SOMATIC FRICTION</span>
          </div>
          <p className="text-[10.5px] text-white/75 leading-relaxed font-sans mb-2">
            สรีระจะเกิดอาการชะงักเกร็ง (Hesitation Lag) เมื่อความหวงตัว ({characterStateLevel}%) ขัดแย้งกับแรงเฉื่อยฟิสิกส์ภายนอก
          </p>
          <button
            type="button"
            onClick={onToggleKineticLink}
            className="text-[9.5px] text-white/40 hover:text-white/70 font-mono transition-colors underline cursor-pointer"
          >
            แตะเพื่อถอดการเชื่อมโยง (กลับสู่ฟิสิกส์ล้วน)
          </button>
        </>
      )
    }

    // Priority 3: Only 01 is active
    if (isBoundaryActive) {
      return (
        <>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#f59e0b] mb-1 pr-6">
            <Lock size={11} className="text-[#f59e0b] shrink-0" />
            <span>AUTO-LINKED: BOUNDARY STATE</span>
          </div>
          <p className="text-[10.5px] text-white/70 leading-relaxed font-sans">
            การ์ดที่ 1 ทำการล็อกและเชื่อมโยงระดับการหวงตัว ({characterStateLevel}%) เข้าสู่ระบบอัตโนมัติ เพื่อใช้คำนวณระยะการหลบหลีกและขอบเขตทางกายภาพ
          </p>
        </>
      )
    }

    return null
  }

  const tipContent = renderTipContent()

  return (
    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-start gap-1.5 pointer-events-auto select-none">
      {/* 1. Main Frosted Dock Capsule (Dynamic: Empty black pill when quiet, items emerge when selected) */}
      <div className="h-8 px-2 rounded-full bg-[#0a0a0c]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] flex items-center gap-1.5 transition-all">
        {activeCount === 0 ? (
          /* Empty Black Pill (Pure minimal resting island) */
          <div className="w-8 h-1.5 rounded-full bg-white/15 mx-1" />
        ) : (
          /* Selected Modules Manifest Dynamically (No vertical divider lines) */
          <>
            {/* Module 00: Persona Archetype Pill (Appears when active) */}
            {isArchetypeActive && onToggleArchetype && (
              <button
                type="button"
                onClick={onToggleArchetype}
                className="h-6 px-2.5 rounded-full text-[10px] font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 bg-[#818cf8]/15 text-[#818cf8] border border-[#818cf8]/35 shadow-[0_0_10px_rgba(129,140,248,0.25)]"
                title={`สายตัวละคร: ${archetypeName || 'Persona'} (คลิกเพื่อปิด)`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8] shadow-[0_0_6px_rgba(129,140,248,0.8)]" />
                <span className="truncate max-w-[85px]">{archetypeName || 'PERSONA'}</span>
              </button>
            )}

            {/* Module 0.5: Relationship & Special Imprints Pill (Appears when active) */}
            {isRelationshipActive && onToggleRelationship && (
              <button
                type="button"
                onClick={onToggleRelationship}
                className="h-6 px-2.5 rounded-full text-[10px] font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 bg-[#f472b6]/15 text-[#f472b6] border border-[#f472b6]/35 shadow-[0_0_10px_rgba(244,114,182,0.25)]"
                title={`ความสัมพันธ์: ${relationshipLabel || 'Relationship'} (คลิกเพื่อปิด)`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#f472b6] shadow-[0_0_6px_rgba(244,114,182,0.8)]" />
                <span>{relationshipLabel || 'RELATION'}</span>
                {relationshipImprintCount > 0 && (
                  <span className="text-[9px] opacity-85 font-mono">
                    +{relationshipImprintCount}
                  </span>
                )}
              </button>
            )}

            {/* Module 0: Desire & Sensory Heat Pill (Appears when active) */}
            {isCharacterStateActive && (
              <button
                type="button"
                onClick={onToggleCharacterState}
                className="h-6 px-2.5 rounded-full text-[10px] font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/35 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                title="ไฟปรารถนาและความไวสัมผัสเปิดใช้งานอยู่ (คลิกเพื่อปิด)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                <span>DESIRE</span>
                <span className="text-[9px] opacity-75 font-mono">
                  {characterStateLevel}%
                </span>
              </button>
            )}

            {/* Module 1: Physical Parry Pill (Appears when active) */}
            {isBoundaryActive && (
              <button
                type="button"
                onClick={onToggleBoundary}
                className="h-6 px-2.5 rounded-full text-[10px] font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/35 shadow-[0_0_10px_rgba(56,189,248,0.25)]"
                title="การปัดป้องเปิดใช้งานอยู่ (คลิกเพื่อปิด)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
                <span>01 PARRY</span>
              </button>
            )}

            {/* Module 2: Kinetic Continuity Pill (Appears when active) */}
            {isKineticActive && (
              <button
                type="button"
                onClick={onToggleKinetic}
                className="h-6 px-2.5 rounded-full text-[10px] font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/35 shadow-[0_0_10px_rgba(52,211,153,0.25)]"
                title="ท่วงท่าต่อเนื่องเปิดใช้งานอยู่ (คลิกเพื่อปิด)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span>02 KINETIC</span>
              </button>
            )}

            {/* Module 3: The Magma Core Pill (Appears when active) */}
            {isShieldActive && onToggleShield && (
              <button
                type="button"
                onClick={onToggleShield}
                className="h-6 px-2.5 rounded-full text-[10px] font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 bg-[#EF264C]/15 text-[#EF264C] border border-[#EF264C]/35 shadow-[0_0_10px_rgba(239,38,76,0.25)]"
                title="แกนลาวาและการปะทุเปิดใช้งานอยู่ (คลิกเพื่อปิด)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C] shadow-[0_0_6px_rgba(239,38,76,0.8)]" />
                <span>03 MAGMA</span>
                {shieldState && (
                  <span className="text-[9px] opacity-80 uppercase font-mono">
                    {shieldState === 'cooled_magma' ? 'SOFT SPOT' : shieldState.replace('_', '-')}
                  </span>
                )}
              </button>
            )}

            {/* Micro Clear / Bypass All Disc (iOS style) */}
            {onBypassAll && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onBypassAll()
                }}
                className="w-5 h-5 rounded-full bg-white/[0.06] hover:bg-white/[0.16] text-white/40 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 ml-0.5 shrink-0"
                title="ปิดการใช้งานทั้งหมด (Bypass All)"
              >
                <X size={10} />
              </button>
            )}
          </>
        )}
      </div>

      {/* 2. Hanging Tip Popover: Left-aligned, fixed width (w-[300px]), 2-3 lines, with close (X) button */}
      {!isTipDismissed && tipContent && (
        <div className="w-[300px] p-3 rounded-2xl bg-[#141416]/95 backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.7)] text-left relative animate-in fade-in slide-in-from-top-1">
          {/* Close button X */}
          <button
            type="button"
            onClick={() => setDismissedKey(stateKey)}
            className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white/[0.04] hover:bg-white/[0.12] text-white/40 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="ปิดข้อความแนะนำ"
          >
            <X size={11} />
          </button>

          {tipContent}
        </div>
      )}
    </div>
  )
}
