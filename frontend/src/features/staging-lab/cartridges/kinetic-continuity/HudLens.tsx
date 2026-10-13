import type { BaseHudLensProps } from '../types'

export interface KineticHudLensProps extends BaseHudLensProps {
  currentPosture?: string
}

export function KineticHudLens({
  telemetry,
  visibleRows = { kinetic: true },
}: KineticHudLensProps) {
  if (!visibleRows.kinetic || !telemetry?.kinetic_decision) return null

  return (
    <div className="space-y-1.5 font-mono text-[11px] leading-relaxed pt-1.5 border-t border-white/[0.06]">
      <div className="flex items-center justify-between text-[10px] mb-1">
        <span className="text-[#34d399] font-bold">TEMPO</span>
        <span
          className={`px-1.5 py-0.2 rounded font-mono text-[9px] uppercase font-semibold ${
            telemetry.kinetic_decision.tempo === 'HIGH_VELOCITY_SNAP'
              ? 'bg-[#fb923c]/20 text-[#fb923c] border border-[#fb923c]/30'
              : telemetry.kinetic_decision.tempo === 'LOW_VELOCITY_UNHOOK'
              ? 'bg-[#c084fc]/20 text-[#c084fc] border border-[#c084fc]/30'
              : telemetry.kinetic_decision.tempo === 'MICRO_SHIFT'
              ? 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30'
              : 'bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/30'
          }`}
        >
          {telemetry.kinetic_decision.tempo.replace(/_/g, ' ')}
        </span>
      </div>
      {telemetry.kinetic_decision.somatic_tension && (
        <div className="text-[10.5px] text-white/70 italic bg-white/[0.03] p-1.5 rounded border border-white/[0.05] leading-snug">
          "{telemetry.kinetic_decision.somatic_tension}"
        </div>
      )}
    </div>
  )
}
