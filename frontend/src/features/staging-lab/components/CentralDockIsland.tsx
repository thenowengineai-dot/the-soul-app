import { X } from 'lucide-react'
import type { SpatialSpacing } from '../modules/physicalParryModule'

interface CentralDockIslandProps {
  className?: string
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
  boundarySpacing?: SpatialSpacing

  isKineticActive: boolean
  onToggleKinetic: () => void
  currentPosture?: string

  isKineticLinkedToBoundary?: boolean
  onToggleKineticLink?: () => void

  isShieldActive?: boolean
  onToggleShield?: () => void
  shieldState?: string

  onBypassAll?: () => void
}

export function CentralDockIsland({
  className = '',
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
  boundarySpacing,
  isKineticActive,
  onToggleKinetic,
  currentPosture,
  isShieldActive,
  onToggleShield,
  shieldState,
  onBypassAll,
}: CentralDockIslandProps) {
  const activeCount =
    (isArchetypeActive ? 1 : 0) +
    (isRelationshipActive ? 1 : 0) +
    (isCharacterStateActive ? 1 : 0) +
    (isBoundaryActive ? 1 : 0) +
    (isKineticActive ? 1 : 0) +
    (isShieldActive ? 1 : 0)

  const formatArchetype = (name?: string) => {
    if (!name) return 'เยือกเย็น'
    if (name.includes('เยือกเย็น')) return 'เยือกเย็น'
    if (name.includes('อบอุ่น')) return 'อบอุ่น'
    if (name.includes('ขี้เล่น')) return 'ขี้เล่น'
    if (name.includes('เจ้าอารมณ์')) return 'เจ้าอารมณ์'
    if (name.includes('ลึกลับ')) return 'ลึกลับ'
    if (name.includes('มั่นคง')) return 'มั่นคง'
    if (name.includes('เปราะบาง')) return 'เปราะบาง'
    return name.slice(0, 10)
  }

  const formatMagmaPhase = (phase?: string) => {
    if (!phase || phase === 'sealed') return 'ผนึกแน่น'
    if (phase === 'cooled_magma') return 'Soft Spot'
    if (phase === 'erupted' || phase === 'magma_erupting') return 'ปะทุ'
    if (phase === 'superheated') return 'ร้อนจัด'
    return 'ผนึกแน่น'
  }

  const getMagmaTitle = (phase?: string) => {
    if (phase === 'cooled_magma') return 'แกนลาวา: สภาวะ Soft Spot (คลิกเพื่อปิด)'
    if (phase === 'erupted' || phase === 'magma_erupting') return 'แกนลาวา: ปะทุทะลัก 180° (คลิกเพื่อปิด)'
    return 'แกนลาวา: เปลือกหินผนึกแน่นหนา (คลิกเพื่อปิด)'
  }

  const formatRelationship = (label?: string, count = 0) => {
    let text = 'แปลกหน้า'
    if (label?.includes('คุ้นเคย')) text = 'คุ้นเคย'
    else if (label?.includes('ผูกพัน') || label?.includes('ลึกซึ้ง')) text = 'ผูกพัน'
    else if (label?.includes('แปลกหน้า')) text = 'แปลกหน้า'
    else if (label) text = label.slice(0, 8)

    if (count > 0) {
      text += ` +${count}`
    }
    return text
  }

  const formatDesire = (level: number) => {
    const sub = level <= 20 ? 'สติครบ' : level <= 60 ? 'ใจสั่น' : 'เร่าร้อน'
    return `${level}% ${sub}`
  }

  const formatBoundary = (spacing?: SpatialSpacing) => {
    if (spacing === 'distant') return '2-3 ก้าว'
    if (spacing === 'reach') return 'เอื้อมถึง'
    if (spacing === 'intimate') return 'ประชิดตัว'
    return '2-3 ก้าว'
  }

  const formatPosture = (posture?: string) => {
    if (!posture) return 'ยืนผ่อนคลาย'
    if (posture.includes('กึ่งยืน') || posture.includes('ยืน')) return 'ยืนผ่อนคลาย'
    if (posture.includes('พิง')) return 'พิงกำแพง'
    if (posture.includes('กอดอก')) return 'กอดอกนิ่ง'
    if (posture.includes('เอี้ยว')) return 'เอี้ยวตัว'
    if (posture.includes('นั่ง')) return 'นั่งนิ่ง'
    return posture.slice(0, 10)
  }

  return (
    <div className={`z-30 flex flex-col items-center pointer-events-auto select-none max-w-[92%] sm:max-w-[480px] ${className || 'absolute top-2.5 left-1/2 -translate-x-1/2'}`}>
      {/* Main Frosted Dock Capsule (Allows wrapping up to 2 lines on compact screens) */}
      <div
        className={`bg-[#0a0a0c]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-wrap items-center justify-center gap-1.5 transition-all ${
          activeCount === 0
            ? 'h-8 px-4 rounded-full'
            : 'px-3 py-2 rounded-[20px]'
        }`}
      >
        {activeCount === 0 ? (
          /* Empty Black Pill (Pure minimal resting island) */
          <div className="w-8 h-1.5 rounded-full bg-white/15" />
        ) : (
          /* Selected Modules Manifest Dynamically */
          <>
            {/* 1. Persona Archetype Pill */}
            {isArchetypeActive && onToggleArchetype && (
              <button
                type="button"
                onClick={onToggleArchetype}
                className="h-7 px-3 rounded-full text-[11px] sm:text-[11.5px] font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 bg-[#818cf8]/15 text-[#818cf8] border border-[#818cf8]/35 shadow-[0_0_10px_rgba(129,140,248,0.25)]"
                title={`สายตัวละคร: ${archetypeName || 'Persona'} (คลิกเพื่อปิด)`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8] shadow-[0_0_6px_rgba(129,140,248,0.8)]" />
                <span className="font-semibold text-white/95">ตัวละคร</span>
                <span className="opacity-30 text-[10px]">•</span>
                <span className="text-white/80">{formatArchetype(archetypeName)}</span>
              </button>
            )}

            {/* 2. The Magma Core Pill */}
            {isShieldActive && onToggleShield && (
              <button
                type="button"
                onClick={onToggleShield}
                className="h-7 px-3 rounded-full text-[11px] sm:text-[11.5px] font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 bg-[#EF264C]/15 text-[#EF264C] border border-[#EF264C]/35 shadow-[0_0_10px_rgba(239,38,76,0.25)]"
                title={getMagmaTitle(shieldState)}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C] shadow-[0_0_6px_rgba(239,38,76,0.8)]" />
                <span className="font-semibold text-white/95">ลาวา</span>
                <span className="opacity-30 text-[10px]">•</span>
                <span className="text-white/80">{formatMagmaPhase(shieldState)}</span>
              </button>
            )}

            {/* 3. Relationship & Special Imprints Pill */}
            {isRelationshipActive && onToggleRelationship && (
              <button
                type="button"
                onClick={onToggleRelationship}
                className="h-7 px-3 rounded-full text-[11px] sm:text-[11.5px] font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 bg-[#f472b6]/15 text-[#f472b6] border border-[#f472b6]/35 shadow-[0_0_10px_rgba(244,114,182,0.25)]"
                title={`ความสัมพันธ์: ${relationshipLabel || 'Relationship'} (คลิกเพื่อปิด)`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#f472b6] shadow-[0_0_6px_rgba(244,114,182,0.8)]" />
                <span className="font-semibold text-white/95">สัมพันธ์</span>
                <span className="opacity-30 text-[10px]">•</span>
                <span className="text-white/80">{formatRelationship(relationshipLabel, relationshipImprintCount)}</span>
              </button>
            )}

            {/* 4. Desire & Sensory Heat Pill */}
            {isCharacterStateActive && (
              <button
                type="button"
                onClick={onToggleCharacterState}
                className="h-7 px-3 rounded-full text-[11px] sm:text-[11.5px] font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/35 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                title="ไฟปรารถนาและความไวสัมผัสเปิดใช้งานอยู่ (คลิกเพื่อปิด)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                <span className="font-semibold text-white/95">ปรารถนา</span>
                <span className="opacity-30 text-[10px]">•</span>
                <span className="text-white/80">{formatDesire(characterStateLevel)}</span>
              </button>
            )}

            {/* 5. Physical Boundary Pill */}
            {isBoundaryActive && (
              <button
                type="button"
                onClick={onToggleBoundary}
                className="h-7 px-3 rounded-full text-[11px] sm:text-[11.5px] font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/35 shadow-[0_0_10px_rgba(56,189,248,0.25)]"
                title="ขอบเขตและระยะห่างเปิดใช้งานอยู่ (คลิกเพื่อปิด)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
                <span className="font-semibold text-white/95">ขอบเขต</span>
                <span className="opacity-30 text-[10px]">•</span>
                <span className="text-white/80">{formatBoundary(boundarySpacing)}</span>
              </button>
            )}

            {/* 6. Kinetic Continuity Pill */}
            {isKineticActive && (
              <button
                type="button"
                onClick={onToggleKinetic}
                className="h-7 px-3 rounded-full text-[11px] sm:text-[11.5px] font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/35 shadow-[0_0_10px_rgba(52,211,153,0.25)]"
                title="แรงเฉื่อยสรีระและท่าทางเปิดใช้งานอยู่ (คลิกเพื่อปิด)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span className="font-semibold text-white/95">สรีระ</span>
                <span className="opacity-30 text-[10px]">•</span>
                <span className="text-white/80">{formatPosture(currentPosture)}</span>
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
                className="w-5.5 h-5.5 rounded-full bg-white/[0.06] hover:bg-white/[0.16] text-white/50 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 ml-0.5 shrink-0"
                title="ปิดการใช้งานทั้งหมด (Bypass All)"
              >
                <X size={11} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
