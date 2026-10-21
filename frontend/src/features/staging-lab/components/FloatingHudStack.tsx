import { useState } from 'react'
import {
  Sliders,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Minimize2,
  X,
  Compass,
  MapPin,
  Maximize2,
  Lock,
} from 'lucide-react'
import type { SandboxTelemetry } from '../types'
import type { SpatialSpacing } from '../modules/physicalParryModule'
import type { RelationshipConfig } from '../modules/relationshipModule'
import { BoundaryHudLens, KineticHudLens } from '../cartridges'
import type { StageCellCluster, SpatialProp, GlowAccentColor } from '../spatialStageTypes'
import { CAMPUS_QUADRANT_PRESET } from '../spatialMockPresets'

interface FloatingHudStackProps {
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
  spatialCluster?: StageCellCluster
  onSelectSpatialProp?: (prop: SpatialProp) => void
}

export function FloatingHudStack({
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
  spatialCluster = CAMPUS_QUADRANT_PRESET,
  onSelectSpatialProp,
}: FloatingHudStackProps) {
  // Active HUD Toggles (Multi-Select Stack)
  const [activeHuds, setActiveHuds] = useState<Record<string, boolean>>({
    somatic: true,
    spatial: false,
  })

  const toggleHud = (id: string) => {
    setActiveHuds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const clearAllHuds = () => {
    setActiveHuds({
      somatic: false,
      spatial: false,
    })
  }

  const activeCount = Object.values(activeHuds).filter(Boolean).length

  // Somatic Telemetry Internal States
  const [showSettings, setShowSettings] = useState(false)
  const [showThinking, setShowThinking] = useState(false)
  const isTransitioned = Boolean(telemetry?.a_pos && telemetry.a_pos.trim())
  const displayPosture = isTransitioned ? (telemetry?.a_pos?.trim() ?? '') : currentPosture.trim()

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
    setVisibleRows((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const latency = telemetry?.latency_ms ?? 0
  const latencyColor =
    latency === 0
      ? 'text-white/40'
      : latency < 1000
      ? 'text-emerald-400'
      : latency < 3000
      ? 'text-amber-400'
      : 'text-rose-400'

  // Spatial Blueprint Internal States
  const currentCell = Object.values(spatialCluster.cells)[0]
  const [hoveredProp, setHoveredProp] = useState<SpatialProp | null>(null)
  const [selectedFloor, setSelectedFloor] = useState<string>(currentCell?.floorLevel || '1F')
  const [isZoomedMaster, setIsZoomedMaster] = useState<boolean>(false)

  const resolveGlowStyle = (color?: GlowAccentColor) => {
    switch (color) {
      case 'crimson':
        return 'ring-[#EF264C] shadow-[0_0_12px_rgba(239,38,76,0.6)] bg-[#EF264C]/25 text-[#EF264C]'
      case 'amber':
        return 'ring-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)] bg-amber-400/25 text-amber-300'
      case 'cyan':
        return 'ring-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)] bg-cyan-400/25 text-cyan-300'
      default:
        return 'ring-white shadow-[0_0_12px_rgba(255,255,255,0.7)] bg-white/25 text-white'
    }
  }

  return (
    <div className="absolute top-[46px] right-6 z-30 select-none flex flex-col items-end gap-2.5 font-sans pointer-events-none">
      {/* ======================================================================= */}
      {/* 1. THE FLOATING CONTROL SHELF (Apple Capsule Multi-Pill Bar)            */}
      {/* ======================================================================= */}
      <div className="h-8 px-2 rounded-full bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl flex items-center gap-1.5 pointer-events-auto">
        {/* Pill 1: SOMATIC TELEMETRY */}
        <button
          type="button"
          onClick={() => toggleHud('somatic')}
          className={`h-6 px-2.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer text-[11px] font-mono font-medium ${
            activeHuds.somatic
              ? 'bg-white/20 text-white shadow-sm border border-white/20'
              : 'text-white/40 hover:text-white/80 hover:bg-white/[0.06]'
          }`}
          title="สลับเปิด/ปิด หน้าปัดสรีระและผัสสะ (Somatic Telemetry)"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              telemetry?.latency_ms
                ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                : 'bg-white/40'
            }`}
          />
          <span>สรีระ (HUD)</span>
          {telemetry?.latency_ms ? (
            <span className={`text-[10px] ${latencyColor}`}>
              {telemetry.latency_ms}ms
            </span>
          ) : null}
        </button>

        {/* Pill 2: SPATIAL BLUEPRINT */}
        <button
          type="button"
          onClick={() => toggleHud('spatial')}
          className={`h-6 px-2.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer text-[11px] font-mono font-medium ${
            activeHuds.spatial
              ? 'bg-amber-500/25 text-amber-200 shadow-sm border border-amber-500/35 font-semibold'
              : 'text-white/40 hover:text-white/80 hover:bg-white/[0.06]'
          }`}
          title="สลับเปิด/ปิด หน้าปัดแผนที่พิมพ์เขียวผืนเวที (Spatial Blueprint)"
        >
          <MapPin size={11} className={activeHuds.spatial ? 'text-amber-400' : 'text-white/40'} />
          <span>ผืนเวที (STAGE)</span>
        </button>

        {/* Clear All / Fold All Button */}
        {activeCount > 0 && (
          <>
            <div className="w-[1px] h-3.5 bg-white/15" />
            <button
              type="button"
              onClick={clearAllHuds}
              className="w-5 h-5 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="พับเก็บหน้าปัดทั้งหมด (Fold All)"
            >
              <X size={11} />
            </button>
          </>
        )}
      </div>

      {/* ======================================================================= */}
      {/* 2. THE VERTICAL STACK CONTAINER (Active HUDs Cascade Downwards)         */}
      {/* ======================================================================= */}
      <div className="w-[320px] sm:w-[360px] flex flex-col gap-2.5 max-h-[calc(100vh-130px)] overflow-y-auto no-scrollbar pointer-events-auto transition-all">
        {/* ----------------------------------------------------------------- */}
        {/* HUD CARD 1: SOMATIC TELEMETRY                                     */}
        {/* ----------------------------------------------------------------- */}
        {activeHuds.somatic && (
          <div className="w-full rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl p-4 select-none transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Header: Title + Controls */}
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
                  onClick={() => toggleHud('somatic')}
                  className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  title="ย่อแผงสรีระ"
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
                      title="สลับระหว่างเสียบ / ถอดหัววัด Telemetry Contract"
                    >
                      {isTelemetryContractEnabled ? 'PLUGGED' : 'DETACHED'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Monospace Telemetry Grid */}
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

              {/* Actor Posture */}
              {visibleRows.posture && displayPosture && (
                <div className="pt-2 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="font-bold tracking-wide text-white/60">POSTURE</span>
                    <span className="text-[11px] sm:text-[11.5px] text-white/80 font-mono">
                      {isTransitioned ? 'RESULTANT' : 'ORIGIN'}
                    </span>
                  </div>
                  <div className="text-[12px] sm:text-[12.5px] text-white/90 italic bg-white/[0.04] p-2.5 rounded-xl border border-white/[0.08] leading-relaxed font-sans">
                    "{displayPosture}"
                  </div>
                </div>
              )}

              {/* Sensory Pulse */}
              {visibleRows.sensory && sensoryPulseText && (
                <div className="pt-1.5 border-t border-white/[0.08] flex items-center justify-between text-[11px] sm:text-[11.5px]">
                  <span className="text-[#fb7185] font-bold">SENSORY PULSE</span>
                  <span className="text-white/80 truncate max-w-[200px]" title={sensoryPulseText}>
                    {sensoryPulseText}
                  </span>
                </div>
              )}

              {/* CoT Thinking Excerpt */}
              {telemetry?.thinking && (
                <div className="pt-2 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setShowThinking(!showThinking)}
                    className="w-full flex items-center justify-between text-[10.5px] text-white/40 hover:text-white/70 transition-colors cursor-pointer py-0.5"
                  >
                    <span>REASONING / COT EXCERPT</span>
                    {showThinking ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>
                  {showThinking && (
                    <div className="mt-1.5 p-2 rounded-xl bg-black/50 border border-white/[0.08] max-h-36 overflow-y-auto no-scrollbar font-mono text-[10.5px] sm:text-[11px] text-white/70 whitespace-pre-wrap leading-relaxed">
                      {telemetry.thinking}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* HUD CARD 2: SPATIAL BLUEPRINT (Interactive Living CAD)            */}
        {/* ----------------------------------------------------------------- */}
        {activeHuds.spatial && currentCell && (
          <div className="w-full rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl p-4 select-none transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Header: Title + Controls */}
            <div className="flex items-center justify-between gap-1 mb-2.5">
              <div className="flex items-center gap-1.5">
                <Compass size={12} className="text-amber-400" />
                <span className="text-[11px] font-mono font-semibold uppercase text-amber-200 tracking-wider">
                  SPATIAL STAGE
                </span>
                <span className="text-[10px] font-mono text-white/40 px-1.5 py-0.2 rounded bg-white/10">
                  {currentCell.floorLevel || '1F'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <div className="flex items-center rounded-lg bg-white/[0.06] p-0.5 border border-white/10 text-[10px] font-mono">
                  {(['1F', '2F'] as const).map((floor) => (
                    <button
                      key={floor}
                      type="button"
                      onClick={() => setSelectedFloor(floor)}
                      className={`px-1.5 py-0.5 rounded transition-all cursor-pointer font-medium ${
                        selectedFloor === floor
                          ? 'bg-white/20 text-white font-semibold'
                          : 'text-white/40 hover:text-white/70'
                      }`}
                    >
                      {floor}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsZoomedMaster(!isZoomedMaster)}
                  className={`p-1 rounded-lg border transition-all cursor-pointer ${
                    isZoomedMaster
                      ? 'bg-[#EF264C]/20 border-[#EF264C]/40 text-white'
                      : 'bg-white/[0.06] border-white/10 text-white/60 hover:text-white'
                  }`}
                  title="สลับโหมดซูมดูผังรวม (Master View)"
                >
                  <Maximize2 size={11} />
                </button>

                <button
                  type="button"
                  onClick={() => toggleHud('spatial')}
                  className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  title="ย่อแผงผืนเวที"
                >
                  <Minimize2 size={12} />
                </button>
              </div>
            </div>

            {/* Interactive Blueprint Surface */}
            <div
              className={`relative w-full aspect-[16/9] rounded-xl bg-[#090909] border border-white/10 overflow-hidden transition-all duration-300 ${
                isZoomedMaster ? 'scale-100' : 'scale-[1.02]'
              }`}
            >
              <img
                src={currentCell.blueprintImageUrl}
                alt={currentCell.name}
                className="w-full h-full object-cover object-center pointer-events-none filter brightness-95 contrast-105"
              />

              {/* Restricted Red Zones */}
              {currentCell.zones.map((zone) => {
                if (!zone.isRestricted || !zone.bounds) return null
                return (
                  <div
                    key={zone.id}
                    style={{
                      left: `${zone.bounds.x}%`,
                      top: `${zone.bounds.y}%`,
                      width: `${zone.bounds.width}%`,
                      height: `${zone.bounds.height}%`,
                    }}
                    className="absolute pointer-events-none rounded-lg bg-red-500/[0.12] border border-red-500/40 backdrop-blur-[1px] flex items-center justify-center p-1"
                  >
                    <div className="flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-red-950/80 border border-red-500/50 text-[#ff758f] font-mono text-[8.5px] font-semibold">
                      <Lock size={8} className="text-red-400" />
                      <span>RESTRICTED</span>
                    </div>
                  </div>
                )
              })}

              {/* Interactive Hotspots */}
              {currentCell.props.map((prop) => {
                const isHovered = hoveredProp?.id === prop.id
                const glow = resolveGlowStyle(prop.glowColor)

                return (
                  <div
                    key={prop.id}
                    style={{
                      left: `${prop.coordinates.x}%`,
                      top: `${prop.coordinates.y}%`,
                    }}
                    onMouseEnter={() => setHoveredProp(prop)}
                    onMouseLeave={() => setHoveredProp(null)}
                    onClick={() => onSelectSpatialProp?.(prop)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                      <div
                        className={`w-3 h-3 rounded-full transition-all duration-200 border flex items-center justify-center ${
                          isHovered
                            ? `scale-150 ring-2 ${glow}`
                            : 'bg-white/10 border-white/30 group-hover:scale-125'
                        }`}
                      >
                        <div
                          className={`w-1 h-1 rounded-full ${
                            isHovered ? 'bg-white shadow-[0_0_6px_white]' : 'bg-white/60'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Coordinate Pins: True Human Shoulder Scale */}
              {/* 1. PLAYER PIN */}
              <div
                style={{
                  left: `${spatialCluster.actorPins.player.x}%`,
                  top: `${spatialCluster.actorPins.player.y}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex flex-col items-center"
              >
                <div className="w-3 h-3 rounded-full bg-white border border-black/40 shadow-[0_0_8px_white] flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-black" />
                </div>
                <span className="mt-0.5 px-1 py-0.2 rounded bg-black/80 text-[8px] font-mono text-white/95 uppercase font-bold">
                  YOU
                </span>
              </div>

              {/* 2. MAHIRO PIN */}
              <div
                style={{
                  left: `${spatialCluster.actorPins.character.x}%`,
                  top: `${spatialCluster.actorPins.character.y}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex flex-col items-center"
              >
                <div className="w-3 h-3 rounded-full bg-[#EF264C] border border-black/40 shadow-[0_0_10px_rgba(239,38,76,0.9)] flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-white" />
                </div>
                <span className="mt-0.5 px-1 py-0.2 rounded bg-black/80 text-[8px] font-mono text-[#ff758f] uppercase font-bold">
                  MAHIRO
                </span>
              </div>

              {/* Floating Docked Tooltip on Hover */}
              {hoveredProp && (
                <div
                  style={{
                    left: `${Math.min(Math.max(hoveredProp.coordinates.x, 25), 75)}%`,
                    top: `${hoveredProp.coordinates.y > 60 ? hoveredProp.coordinates.y - 18 : hoveredProp.coordinates.y + 10}%`,
                  }}
                  className="absolute -translate-x-1/2 pointer-events-none z-40 w-56 p-2 rounded-xl bg-[#141416]/95 backdrop-blur-2xl border border-white/20 shadow-2xl space-y-1"
                >
                  <div className="flex items-center justify-between text-white/95 text-[11px] font-semibold">
                    <span className="truncate">{hoveredProp.name}</span>
                    {hoveredProp.dimensionText && (
                      <span className="px-1.5 py-0.2 rounded bg-white/10 text-[9px] font-mono text-white/80">
                        {hoveredProp.dimensionText}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/70 leading-snug font-sans">
                    {hoveredProp.description}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Scene Subtitle */}
            <div className="mt-2 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10.5px] font-mono text-white/60">
              <span className="truncate">{spatialCluster.name}</span>
              <span className="text-amber-400 font-semibold shrink-0">● INTERACTIVE</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
