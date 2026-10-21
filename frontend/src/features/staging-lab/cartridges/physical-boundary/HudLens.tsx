import type { BaseHudLensProps } from '../types'
import {
  type SpatialSpacing,
  resolveTouchReflexDirective,
} from '../../modules/physicalParryModule'
import type { RelationshipConfig } from '../../modules/relationshipModule'

export interface BoundaryHudLensProps extends BaseHudLensProps {
  spacing?: SpatialSpacing
  boundaryLevel?: number
  isParryEnabled?: boolean
  relationshipConfig?: RelationshipConfig
  isRelationshipActive?: boolean
}

export function BoundaryHudLens({
  telemetry,
  visibleRows = { hitbox: true, distance: true, boundary: true },
  spacing = 'reach',
  boundaryLevel = 25,
  isParryEnabled = true,
  relationshipConfig,
  isRelationshipActive = true,
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

    const resolved = resolveTouchReflexDirective(
      spacing,
      boundaryLevel,
      relationshipConfig,
      isRelationshipActive
    )
    switch (resolved.expectedVerdict) {
      case 'MISSED':
        return { text: 'MISSED (คว้าได้แค่อากาศ)', color: 'text-[#38bdf8]' }
      case 'PARRIED':
        return { text: 'PARRIED (สกัดกั้นก่อนถึงตัว)', color: 'text-emerald-400' }
      case 'GRAZED':
        return { text: 'GRAZED (เฉียดผิวชะงัก)', color: 'text-[#fbbf24]' }
      case 'LATCHED':
        return { text: 'LATCHED (ยินยอมสัมผัส)', color: 'text-[#fb7185]' }
    }
  }

  const hitbox = resolveHitboxStatus()
  const desireStateLabel =
    boundaryLevel <= 35 ? 'Composed' : boundaryLevel <= 70 ? 'Warming' : 'Burning'

  return (
    <div className="space-y-2 font-mono text-[11.5px] sm:text-[12px] leading-relaxed">
      {/* Row 1: Real Telemetry Verdict */}
      {visibleRows.hitbox && (
        <div className="flex items-start justify-between gap-2">
          <span className="text-[#fb923c] font-bold shrink-0 tracking-wide">VERDICT</span>
          <span className={`text-right font-medium text-[11.5px] sm:text-[12px] ${hitbox.color}`}>
            {hitbox.text}
          </span>
        </div>
      )}

      {/* Row 2: Active Persistent Contacts */}
      {visibleRows.hitbox && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-white/50 font-bold shrink-0 text-[11px] tracking-wide">CONTACTS</span>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {telemetry?.verdict?.active_contacts && telemetry.verdict.active_contacts.length > 0 ? (
              telemetry.verdict.active_contacts.map((c) => (
                <span
                  key={c}
                  className="px-2 py-0.5 rounded bg-white/10 text-[#F1F1F1] font-mono text-[10.5px] sm:text-[11px] border border-white/15"
                >
                  {c}
                </span>
              ))
            ) : (
              <span className="text-white/40 text-[10.5px] sm:text-[11px] font-mono">[ZERO CONTACT]</span>
            )}
          </div>
        </div>
      )}

      {/* Row 3: Distance State */}
      {visibleRows.distance && (
        <div className="flex items-center justify-between">
          <span className="text-[#a78bfa] font-bold tracking-wide">DISTANCE</span>
          <span className="text-white/85 uppercase font-medium">
            {spacing === 'distant' ? '2 Steps (Distant)' : spacing === 'reach' ? '1 Arm (Reach)' : 'Intimate'}
          </span>
        </div>
      )}

      {/* Row 4: Desire & Sensory Heat State */}
      {visibleRows.boundary && (
        <div className="flex items-center justify-between">
          <span className="text-[#f59e0b] font-bold tracking-wide">DESIRE</span>
          <span className="text-white/85 font-medium">
            {boundaryLevel}% ({desireStateLabel})
          </span>
        </div>
      )}
    </div>
  )
}
