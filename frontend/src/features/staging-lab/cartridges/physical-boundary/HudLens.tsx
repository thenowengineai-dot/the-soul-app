import type { BaseHudLensProps } from '../types'
import type { SpatialSpacing } from '../physical-boundary/engine'

export interface BoundaryHudLensProps extends BaseHudLensProps {
  spacing?: SpatialSpacing
  boundaryLevel?: number
  isParryEnabled?: boolean
}

export function BoundaryHudLens({
  telemetry,
  visibleRows = { hitbox: true, distance: true, boundary: true },
  spacing = 'reach',
  boundaryLevel = 25,
  isParryEnabled = true,
}: BoundaryHudLensProps) {
  const resolveHitboxStatus = () => {
    if (telemetry?.verdict?.outcome) {
      const outcome = telemetry.verdict.outcome
      switch (outcome) {
        case 'PARRIED':
          return { text: 'PARRIED (สกัดกั้นสำเร็จ)', color: 'text-emerald-400' }
        case 'MISSED':
          return { text: 'MISSED (คว้าได้แค่อากาศ)', color: 'text-[#38bdf8]' }
        case 'GRAZED':
          return { text: 'GRAZED (เฉียดผิวชะงัก)', color: 'text-[#fbbf24]' }
        case 'LATCHED':
          return { text: 'LATCHED (ยินยอมสัมผัส)', color: 'text-[#fb7185]' }
        default:
          return { text: `${outcome} (คำนวณสด)`, color: 'text-white/80' }
      }
    }
    if (!isParryEnabled) return { text: 'COLLIDED (UNGUARDED)', color: 'text-amber-400' }
    if (spacing === 'distant') return { text: 'MISSED (คว้าได้แค่อากาศ)', color: 'text-[#38bdf8]' }
    if (boundaryLevel <= 35) return { text: 'PARRIED (สกัดกั้นก่อนถึงตัว)', color: 'text-emerald-400' }
    if (boundaryLevel <= 75) return { text: 'GRAZED (เฉียดผิวชะงัก)', color: 'text-[#fbbf24]' }
    return { text: 'LATCHED (ยินยอมสัมผัส)', color: 'text-[#fb7185]' }
  }

  const hitbox = resolveHitboxStatus()

  return (
    <div className="space-y-1.5 font-mono text-[11px] leading-relaxed">
      {/* Row 1: Real Telemetry Verdict */}
      {visibleRows.hitbox && (
        <div className="flex items-start justify-between gap-2">
          <span className="text-[#fb923c] font-bold shrink-0">VERDICT</span>
          <span className={`text-right font-medium text-[10.5px] ${hitbox.color}`}>
            {hitbox.text}
          </span>
        </div>
      )}

      {/* Row 2: Active Persistent Contacts */}
      {visibleRows.hitbox && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-white/50 font-bold shrink-0 text-[10px]">CONTACTS</span>
          <div className="flex items-center gap-1 flex-wrap justify-end">
            {telemetry?.verdict?.active_contacts && telemetry.verdict.active_contacts.length > 0 ? (
              telemetry.verdict.active_contacts.map((c) => (
                <span
                  key={c}
                  className="px-1.5 py-0.2 rounded bg-white/10 text-[#F1F1F1] font-mono text-[9.5px] border border-white/15"
                >
                  {c}
                </span>
              ))
            ) : (
              <span className="text-white/35 text-[9.5px] font-mono">[ZERO CONTACT]</span>
            )}
          </div>
        </div>
      )}

      {/* Row 3: Distance State */}
      {visibleRows.distance && (
        <div className="flex items-center justify-between">
          <span className="text-[#a78bfa] font-bold">DISTANCE</span>
          <span className="text-white/80 uppercase">
            {spacing === 'distant' ? '2 Steps (Distant)' : spacing === 'reach' ? '1 Arm (Reach)' : 'Intimate'}
          </span>
        </div>
      )}

      {/* Row 4: Boundary State */}
      {visibleRows.boundary && (
        <div className="flex items-center justify-between">
          <span className="text-[#f472b6] font-bold">BOUNDARY</span>
          <span className="text-white/80">
            {boundaryLevel}% ({isParryEnabled ? 'Active' : 'Bypassed'})
          </span>
        </div>
      )}
    </div>
  )
}
