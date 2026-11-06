import { useState } from 'react'
import {
  Sliders,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Minimize2
} from 'lucide-react'
import type { SandboxTelemetry } from '../types'
import type { SpatialSpacing } from '../modules/physicalParryModule'
import type { RelationshipConfig } from '../modules/relationshipModule'
import { BoundaryHudLens, KineticHudLens } from '../cartridges'

interface FloatingTelemetryHudProps {
  telemetry: SandboxTelemetry | null
  spacing: SpatialSpacing
  boundaryLevel: number
  isBoundaryActive?: boolean
  isKineticActive?: boolean
  currentPosture?: string
  sensoryPulseText?: string
  isTelemetryContractEnabled?: boolean
  onToggleTelemetryContract?: () => void
  relationshipConfig?: RelationshipConfig
  isRelationshipActive?: boolean
  isOpen?: boolean
  onToggleOpen?: () => void
  styleOffsetRight?: string
}

export function FloatingTelemetryHud({
  telemetry,
  spacing,
  boundaryLevel,
  isBoundaryActive = true,
  isKineticActive = true,
  currentPosture = '',
  sensoryPulseText = '',
  isTelemetryContractEnabled = true,
  onToggleTelemetryContract,
  relationshipConfig,
  isRelationshipActive = true,
  isOpen: controlledIsOpen,
  onToggleOpen,
  styleOffsetRight = 'right-6',
}: FloatingTelemetryHudProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showThinking, setShowThinking] = useState(false)

  const isHudOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
  const handleToggleOpen = () => {
    if (onToggleOpen) {
      onToggleOpen()
    } else {
      setInternalIsOpen(prev => !prev)
    }
  }

  // Current Posture Resolution: Fallback to currentPosture on Standby, or AI resultant a_pos on Turn Complete
  const isTransitioned = Boolean(telemetry?.a_pos && telemetry.a_pos.trim())
  const displayPosture = isTransitioned ? (telemetry?.a_pos?.trim() ?? '') : currentPosture.trim()

  // Metric row visibility toggles
  const [visibleRows, setVisibleRows] = useState({
    latency: true,
    model: true,
    hitbox: true,
    distance: true,
    boundary: true,
    posture: true,
    kinetic: true,
    sensory: true,
  })

  const toggleRow = (key: keyof typeof visibleRows) => {
    setVisibleRows(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Latency color code
  const latency = telemetry?.latency_ms ?? 0
  const latencyColor =
    latency === 0
      ? 'text-white/40'
      : latency < 1000
      ? 'text-emerald-400'
      : latency < 3000
      ? 'text-amber-400'
      : 'text-rose-400'

  // Minimized Floating Pill Badge (Dynamic Somatic Pill)
  if (!isHudOpen) {
    const hasData = Boolean(telemetry?.latency_ms)

    return (
      <div className={`absolute top-[46px] ${styleOffsetRight} z-30 select-none`}>
        <button
          type="button"
          onClick={handleToggleOpen}
          className={`h-7 px-3 rounded-full backdrop-blur-xl border transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm ${
            hasData
              ? 'bg-black/50 hover:bg-black/70 border-white/15 text-white/90 hover:text-white'
              : 'bg-black/30 hover:bg-black/50 border-white/10 text-white/40 hover:text-white/70'
          }`}
          title="คลิกเพื่อเปิดแผงตรวจวัด Telemetry"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              hasData
                ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                : 'bg-white/30 animate-pulse'
            }`}
          />
          <span className="text-[11px] sm:text-[11.5px] font-mono font-medium tracking-tight">SOMATIC HUD</span>
          {hasData && (
            <>
              <span className="opacity-30 text-[10px]">•</span>
              <span className={`text-[11px] font-mono font-medium ${latencyColor}`}>
                {telemetry?.latency_ms}ms
              </span>
            </>
          )}
        </button>
      </div>
    )
  }

  // Expanded MSI Afterburner Style OSD (Ultra-Translucent)
  return (
    <div className={`absolute top-[46px] ${styleOffsetRight} z-30 w-[320px] sm:w-[350px] rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl p-4 select-none transition-all`}>
      {/* Top Header: Somatic Telemetry Pulse Indicator + Controls */}
      <div className="flex items-center justify-between gap-1 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isBoundaryActive && isKineticActive
                ? 'bg-[#c084fc] shadow-[0_0_6px_rgba(192,132,252,0.8)]'
                : isBoundaryActive
                ? 'bg-[#38bdf8] shadow-[0_0_6px_rgba(56,189,248,0.8)]'
                : isKineticActive
                ? 'bg-[#34d399] shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                : 'bg-white/30'
            }`}
          />
          <span className="text-[11px] font-mono font-semibold uppercase text-white/60 tracking-wider">
            SOMATIC HUD
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="ตั้งค่าแสดงผลค่าสถานะ"
          >
            <Sliders size={12} />
          </button>
          <button
            type="button"
            onClick={handleToggleOpen}
            className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="ย่อแผง HUD"
          >
            <Minimize2 size={12} />
          </button>
        </div>
      </div>

      {/* Settings Popover Tray */}
      {showSettings && (
        <div className="mb-2.5 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono space-y-1.5">
          <div className="text-white/60 text-[10.5px] uppercase font-semibold tracking-wider mb-1">
            Toggle Visible Metrics:
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-white/80">
            {(Object.keys(visibleRows) as Array<keyof typeof visibleRows>).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => toggleRow(k)}
                className={`px-2 py-1 rounded text-left flex items-center justify-between transition-all ${
                  visibleRows[k] ? 'bg-white/10 text-white font-medium' : 'text-white/40'
                }`}
              >
                <span className="uppercase">{k}</span>
                {visibleRows[k] ? <Eye size={11} /> : <EyeOff size={11} />}
              </button>
            ))}
          </div>
          {onToggleTelemetryContract && (
            <div className="pt-2 mt-1 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-[11px] text-white/60 font-medium">Telemetry Contract:</span>
              <button
                type="button"
                onClick={onToggleTelemetryContract}
                className={`px-2.5 py-0.5 rounded text-[10.5px] font-mono transition-all cursor-pointer ${
                  isTelemetryContractEnabled
                    ? 'bg-[#fb923c]/20 text-[#fb923c] border border-[#fb923c]/40 font-semibold'
                    : 'bg-white/10 text-white/40'
                }`}
                title="คลิกเพื่อสลับระหว่างเสียบ / ถอดหัววัด Telemetry Contract"
              >
                {isTelemetryContractEnabled ? 'PLUGGED' : 'DETACHED'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Monospace Telemetry Grid - Dynamic Modular HUD Lenses */}
      <div className="font-mono text-[11px] leading-relaxed space-y-1.5">
        {isBoundaryActive && (
          <BoundaryHudLens
            telemetry={telemetry}
            visibleRows={visibleRows}
            spacing={spacing}
            boundaryLevel={boundaryLevel}
            isParryEnabled={isBoundaryActive}
            relationshipConfig={relationshipConfig}
            isRelationshipActive={isRelationshipActive}
          />
        )}
        {isKineticActive && (
          <KineticHudLens
            telemetry={telemetry}
            visibleRows={visibleRows}
            currentPosture={displayPosture}
          />
        )}

        {/* Row 6: Actor Posture (Cinematic Silhouette Snapshot) */}
        {visibleRows.posture && displayPosture && (
          <div className="pt-2 border-t border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span
                className={`font-bold tracking-wide transition-colors ${
                  isTransitioned
                    ? isBoundaryActive && isKineticActive
                      ? 'text-[#c084fc]'
                      : isBoundaryActive
                      ? 'text-[#38bdf8]'
                      : 'text-[#34d399]'
                    : 'text-white/60'
                }`}
              >
                POSTURE
              </span>
              <span
                className={`text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded transition-colors ${
                  isTransitioned
                    ? 'text-white/70 bg-white/[0.08] border border-white/10 font-medium'
                    : 'text-white/40'
                }`}
              >
                {isTransitioned ? 'TRANSITIONED A_POS' : 'STANDBY (ORIGIN)'}
              </span>
            </div>
            <div className="text-[12px] sm:text-[12.5px] text-[#F1F1F1] font-sans leading-relaxed bg-white/[0.04] p-2.5 rounded-xl border border-white/[0.08]">
              "{displayPosture}"
            </div>
          </div>
        )}

        {/* Row 6.5: Sensory Context Snippet */}
        {visibleRows.sensory && sensoryPulseText && (
          <div className="pt-1.5 border-t border-white/[0.08]">
            <div className="text-[10.5px] text-white/50 uppercase font-mono tracking-wider mb-1">
              Sensory Pulse (To Actor):
            </div>
            <div className="text-[11.5px] text-white/80 italic leading-snug line-clamp-2 bg-white/[0.03] p-2 rounded-xl border border-white/[0.05]">
              "{sensoryPulseText}"
            </div>
          </div>
        )}

        {/* Row 6.6: Surface Mutations (Living Attire Telemetry) */}
        {telemetry?.surface_mutations && telemetry.surface_mutations.length > 0 && (
          <div className="pt-2 border-t border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="font-bold tracking-wide text-amber-300 font-mono">
                SURFACE MUTATIONS
              </span>
              <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ⚡ {telemetry.surface_mutations.length} NEW
              </span>
            </div>
            <div className="space-y-1">
              {telemetry.surface_mutations.map((m, idx) => (
                <div
                  key={idx}
                  className="text-[11px] font-sans leading-snug bg-amber-500/[0.08] p-2 rounded-xl border border-amber-500/20 text-amber-100 flex items-start gap-1.5"
                >
                  <span className="text-[10px] font-mono text-amber-400 shrink-0 uppercase mt-0.5">
                    [{m.target}:{m.zone}]:
                  </span>
                  <span>{m.condition}</span>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Telemetry CoT Thinking (Expandable) */}
        {telemetry?.thinking && (
          <div className="pt-1.5 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setShowThinking(!showThinking)}
              className="w-full flex items-center justify-between text-[11px] text-white/60 hover:text-white py-1 transition-all cursor-pointer font-sans"
            >
              <span>CoT Reasoning Excerpt</span>
              {showThinking ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {showThinking && (
              <div className="mt-1 p-2.5 rounded-xl bg-black/60 border border-white/10 text-[10.5px] sm:text-[11px] text-blue-200/90 leading-relaxed max-h-40 overflow-y-auto no-scrollbar whitespace-pre-wrap font-mono">
                {telemetry.thinking}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FloatingTelemetryHud
