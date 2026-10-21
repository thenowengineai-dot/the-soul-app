import { useState } from 'react'
import {
  Compass,
  Layers,
  Maximize2,
  Lock,
  DoorOpen,
  Coffee,
  BookOpen,
  Bike,
  Sparkles,
  ShieldAlert,
  Info,
} from 'lucide-react'
import type {
  StageCellCluster,
  SpatialProp,
  GlowAccentColor,
} from '../spatialStageTypes'

interface InteractiveBlueprintViewerProps {
  cluster: StageCellCluster
  activeCellId?: string
  onSelectProp?: (prop: SpatialProp) => void
  onMovePlayer?: (coords: { x: number; y: number }) => void
}

export function InteractiveBlueprintViewer({
  cluster,
  activeCellId,
  onSelectProp,
}: InteractiveBlueprintViewerProps) {
  const currentCellId = activeCellId || cluster.activeCellId
  const cell = cluster.cells[currentCellId] || Object.values(cluster.cells)[0]

  const [hoveredProp, setHoveredProp] = useState<SpatialProp | null>(null)
  const [selectedFloor, setSelectedFloor] = useState<string>(cell.floorLevel || '1F')
  const [isZoomedMaster, setIsZoomedMaster] = useState<boolean>(false)

  if (!cell) {
    return (
      <div className="p-8 text-center text-white/40 font-mono text-xs">
        [NO STAGE BLUEPRINT LOADED]
      </div>
    )
  }

  const resolvePropIcon = (prop: SpatialProp) => {
    switch (prop.category) {
      case 'portal':
        return <DoorOpen size={13} className="text-white/80" />
      case 'stair':
        return <Layers size={13} className="text-white/80" />
      case 'tactile_item':
        if (prop.name.includes('กาแฟ') || prop.name.includes('Cafe')) {
          return <Coffee size={13} className="text-amber-400" />
        }
        return <BookOpen size={13} className="text-amber-300" />
      case 'anchor':
        if (prop.name.includes('จักรยาน') || prop.name.includes('Bicycle')) {
          return <Bike size={13} className="text-cyan-400" />
        }
        return <Sparkles size={13} className="text-[#38bdf8]" />
      default:
        return <Info size={13} className="text-white/80" />
    }
  }

  const resolveGlowStyle = (color?: GlowAccentColor) => {
    switch (color) {
      case 'crimson':
        return {
          ring: 'ring-[#EF264C] shadow-[0_0_12px_rgba(239,38,76,0.6)] bg-[#EF264C]/25 text-[#EF264C]',
          border: 'border-[#EF264C]/60',
          badge: 'bg-[#EF264C]/20 text-[#ff758f] border-[#EF264C]/30',
        }
      case 'amber':
        return {
          ring: 'ring-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)] bg-amber-400/25 text-amber-300',
          border: 'border-amber-400/60',
          badge: 'bg-amber-400/20 text-amber-200 border-amber-400/30',
        }
      case 'cyan':
        return {
          ring: 'ring-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)] bg-cyan-400/25 text-cyan-300',
          border: 'border-cyan-400/60',
          badge: 'bg-cyan-400/20 text-cyan-200 border-cyan-400/30',
        }
      default:
        return {
          ring: 'ring-white shadow-[0_0_12px_rgba(255,255,255,0.7)] bg-white/25 text-white',
          border: 'border-white/60',
          badge: 'bg-white/20 text-white border-white/30',
        }
    }
  }

  return (
    <div className="relative w-full rounded-2xl bg-[#090909] border border-white/10 overflow-hidden shadow-2xl select-none font-sans">
      {/* Top Tactical Status Bar */}
      <div className="px-3.5 py-2.5 bg-black/50 backdrop-blur-xl border-b border-white/10 flex items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/90 shrink-0">
            <Compass size={11} className="text-amber-400 animate-spin-slow" />
            <span className="font-semibold">{cell.floorLevel || '1F'}</span>
          </div>
          <span className="text-white/80 truncate font-medium">{cell.name}</span>
        </div>

        {/* View Controls & Floor Switches */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center rounded-lg bg-white/[0.06] p-0.5 border border-white/10 text-[10.5px]">
            {(['1F', '2F'] as const).map((floor) => (
              <button
                key={floor}
                type="button"
                onClick={() => setSelectedFloor(floor)}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer font-medium ${
                  selectedFloor === floor
                    ? 'bg-white/20 text-white shadow-sm font-semibold'
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
            className={`px-2 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
              isZoomedMaster
                ? 'bg-[#EF264C]/20 border-[#EF264C]/40 text-white'
                : 'bg-white/[0.06] border-white/10 text-white/60 hover:text-white'
            }`}
            title="สลับโหมดซูมดูผังรวม (Master View)"
          >
            <Maximize2 size={11} />
            <span className="text-[10px] hidden sm:inline">
              {isZoomedMaster ? 'FOCUS' : 'MASTER'}
            </span>
          </button>
        </div>
      </div>

      {/* Blueprint Canvas Surface */}
      <div
        className={`relative w-full aspect-[16/9] bg-[#0B0B0B] overflow-hidden transition-all duration-500 ${
          isZoomedMaster ? 'scale-100' : 'scale-[1.02]'
        }`}
      >
        {/* Base CAD Blueprint Image */}
        <img
          src={cell.blueprintImageUrl}
          alt={cell.name}
          className="w-full h-full object-cover object-center pointer-events-none filter brightness-95 contrast-105"
        />

        {/* Restricted Red Zones Overlay */}
        {cell.zones.map((zone) => {
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
              className="absolute pointer-events-none rounded-xl bg-red-500/[0.12] border border-red-500/40 backdrop-blur-[1px] transition-all flex flex-col items-center justify-center p-2"
            >
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-[#ff758f] font-mono text-[9.5px] font-semibold tracking-wider shadow-sm">
                <Lock size={10} className="text-red-400 shrink-0" />
                <span className="uppercase">RESTRICTED ZONE</span>
              </div>
            </div>
          )
        })}

        {/* Interactive Vector Hotspots Layer */}
        {cell.props.map((prop) => {
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
              onClick={() => onSelectProp?.(prop)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
            >
              {/* Invisible touch/hover target buffer */}
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center">
                {/* Visual Target Aura */}
                <div
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 border flex items-center justify-center ${
                    isHovered
                      ? `scale-150 ring-2 ${glow.ring} ${glow.border}`
                      : 'bg-white/10 border-white/30 group-hover:scale-125 group-hover:border-white/60'
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      isHovered ? 'bg-white shadow-[0_0_8px_white]' : 'bg-white/60'
                    }`}
                  />
                </div>
              </div>

              {/* Stair Up Floating Glyphs */}
              {prop.category === 'stair' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none px-1.5 py-0.2 rounded bg-black/80 border border-white/20 text-white/80 font-mono text-[8.5px] font-bold shadow-sm whitespace-nowrap">
                  ▲ {prop.targetFloor || '2F'}
                </div>
              )}
            </div>
          )
        })}

        {/* Dynamic Coordinate Pins: True Human Shoulder Scale (~45cm) */}
        {/* 1. PLAYER PIN (White Glowing Dot) */}
        <div
          style={{
            left: `${cluster.actorPins.player.x}%`,
            top: `${cluster.actorPins.player.y}%`,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex flex-col items-center transition-all duration-700 ease-out"
        >
          {/* Subtle Radar Pulse Ripple */}
          <div className="absolute w-8 h-8 rounded-full bg-white/15 animate-ping opacity-40" />

          {/* Core Player Shoulder Dot (scaled ~45cm) */}
          <div className="relative w-3.5 h-3.5 rounded-full bg-white border border-black/40 shadow-[0_0_10px_rgba(255,255,255,0.9)] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#111]" />
          </div>

          <span className="mt-1 px-1.5 py-0.2 rounded bg-black/80 backdrop-blur-md border border-white/20 text-[9px] font-mono font-semibold text-white/95 uppercase tracking-wider shadow-md whitespace-nowrap">
            YOU
          </span>
        </div>

        {/* 2. CHARACTER PIN: MAHIRO (Carmine Red Glowing Dot) */}
        <div
          style={{
            left: `${cluster.actorPins.character.x}%`,
            top: `${cluster.actorPins.character.y}%`,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex flex-col items-center transition-all duration-700 ease-out"
        >
          {/* Subtle Carmine Pulse Ripple */}
          <div className="absolute w-8 h-8 rounded-full bg-[#EF264C]/25 animate-ping opacity-50" />

          {/* Core Character Shoulder Dot (scaled ~45cm) */}
          <div className="relative w-3.5 h-3.5 rounded-full bg-[#EF264C] border border-black/40 shadow-[0_0_12px_rgba(239,38,76,0.95)] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>

          <span className="mt-1 px-1.5 py-0.2 rounded bg-black/80 backdrop-blur-md border border-[#EF264C]/40 text-[9px] font-mono font-semibold text-[#ff758f] uppercase tracking-wider shadow-md whitespace-nowrap">
            MAHIRO
          </span>
        </div>

        {/* Floating Apple-Grade Docked Tooltip on Hover */}
        {hoveredProp && (
          <div
            style={{
              left: `${Math.min(Math.max(hoveredProp.coordinates.x, 22), 78)}%`,
              top: `${hoveredProp.coordinates.y > 60 ? hoveredProp.coordinates.y - 14 : hoveredProp.coordinates.y + 7}%`,
            }}
            className="absolute -translate-x-1/2 pointer-events-none z-40 w-64 sm:w-72 p-3 rounded-2xl bg-[#141416]/95 backdrop-blur-2xl border border-white/20 shadow-2xl space-y-1.5 transition-all duration-200 animate-in fade-in zoom-in-95"
          >
            {/* Header: Title + Category Icon + Dimension */}
            <div className="flex items-start justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  {resolvePropIcon(hoveredProp)}
                </div>
                <span className="font-semibold text-white/95 text-[12px] truncate">
                  {hoveredProp.name}
                </span>
              </div>

              {hoveredProp.dimensionText && (
                <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/80 font-mono text-[9.5px] shrink-0 font-medium">
                  {hoveredProp.dimensionText}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-[11px] text-white/70 leading-relaxed font-sans">
              {hoveredProp.description}
            </p>

            {/* Restricted Alert if applicable */}
            {hoveredProp.glowColor === 'crimson' && (
              <div className="pt-1.5 border-t border-white/10 flex items-center gap-1 text-[10px] font-mono text-[#ff758f]">
                <ShieldAlert size={11} className="shrink-0 text-red-400" />
                <span>เขตห้ามผ่านสำหรับผู้เล่นโดยไม่ได้รับอนุญาต</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Micro-Legend & Physical State */}
      <div className="px-3.5 py-2 bg-black/60 backdrop-blur-xl border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-mono text-white/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_white]" />
            <span className="text-white/80">Player Position</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EF264C] shadow-[0_0_6px_rgba(239,38,76,0.8)]" />
            <span className="text-[#ff758f]">Mahiro Position</span>
          </div>
        </div>

        <div className="text-[10px] text-white/40 flex items-center gap-1">
          <span>แตะหรือ Hover วัตถุเพื่อสแกนพิกัด</span>
        </div>
      </div>
    </div>
  )
}
