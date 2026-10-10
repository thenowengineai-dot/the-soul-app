import { useState } from 'react'
import {
  Activity,
  Sliders,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Minimize2
} from 'lucide-react'
import type { SandboxTelemetry } from '../types'
import type { SpatialSpacing } from '../modules/physicalParryModule'

interface FloatingTelemetryHudProps {
  telemetry: SandboxTelemetry | null
  spacing: SpatialSpacing
  boundaryLevel: number
  isParryEnabled: boolean
  sensoryPulseText?: string
  isTelemetryContractEnabled?: boolean
  onToggleTelemetryContract?: () => void
}

export function FloatingTelemetryHud({
  telemetry,
  spacing,
  boundaryLevel,
  isParryEnabled,
  sensoryPulseText = '',
  isTelemetryContractEnabled = true,
  onToggleTelemetryContract,
}: FloatingTelemetryHudProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showThinking, setShowThinking] = useState(false)

  // Metric row visibility toggles
  const [visibleRows, setVisibleRows] = useState({
    latency: true,
    model: true,
    hitbox: true,
    distance: true,
    boundary: true,
    posture: true,
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

  // Hitbox & Verdict status determination directly from AI Telemetry
  const resolveHitboxStatus = () => {
    if (!isTelemetryContractEnabled) {
      return { text: 'DETACHED (PURE ACTOR)', color: 'text-white/40' }
    }
    if (telemetry?.verdict) {
      const outcome = telemetry.verdict.outcome.toUpperCase()
      const isContact = telemetry.verdict.contact_occurred
      const contactLabel = isContact ? 'CONTACT' : 'ZERO_CONTACT'
      switch (outcome) {
        case 'PARRIED':
          return { text: `PARRIED (${contactLabel})`, color: 'text-emerald-400' }
        case 'MISSED':
        case 'WHIFF':
          return { text: `MISSED (${contactLabel})`, color: 'text-[#38bdf8]' }
        case 'GRAZED':
          return { text: `GRAZED (${contactLabel})`, color: 'text-[#fbbf24]' }
        case 'LATCHED':
        case 'YIELDED':
          return { text: `LATCHED (${contactLabel})`, color: 'text-[#fb7185]' }
        default:
          return { text: `${outcome} (${contactLabel})`, color: 'text-emerald-400' }
      }
    }
    if (!isParryEnabled) return { text: 'COLLIDED (UNGUARDED)', color: 'text-amber-400' }
    if (spacing === 'distant') return { text: 'MISSED (คว้าได้แค่อากาศ)', color: 'text-[#38bdf8]' }
    if (boundaryLevel <= 35) return { text: 'PARRIED (สกัดกั้นก่อนถึงตัว)', color: 'text-emerald-400' }
    if (boundaryLevel <= 75) return { text: 'GRAZED (เฉียดผิวชะงัก)', color: 'text-[#fbbf24]' }
    return { text: 'LATCHED (ยินยอมสัมผัส)', color: 'text-[#fb7185]' }
  }

  const hitbox = resolveHitboxStatus()

  // Minimized Floating Pill Badge
  if (!isOpen) {
    return (
      <div className="absolute top-[52px] right-6 z-30 select-none">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/35 hover:bg-black/50 backdrop-blur-md border border-white/10 hover:border-white/20 text-white/80 hover:text-white text-[11px] font-mono transition-all shadow-xl active:scale-95 cursor-pointer"
          title="เปิดแผงตรวจวัด Telemetry"
        >
          <Activity size={12} className="text-emerald-400" />
          <span>HUD</span>
          {telemetry?.latency_ms ? (
            <span className={latencyColor}>{telemetry.latency_ms}ms</span>
          ) : (
            <span className="text-white/40">STANDBY</span>
          )}
        </button>
      </div>
    )
  }

  // Expanded MSI Afterburner Style OSD (Ultra-Translucent)
  return (
    <div className="absolute top-[52px] right-6 z-30 w-[310px] sm:w-[330px] rounded-2xl bg-black/35 backdrop-blur-xl border border-white/10 shadow-2xl p-3.5 select-none transition-all">
      {/* Top Controls (Clean Floating Controls, No Header Title) */}
      <div className="flex items-center justify-end gap-1 mb-2">
        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className="w-5 h-5 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          title="ตั้งค่าแสดงผลค่าสถานะ"
        >
          <Sliders size={11} />
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="w-5 h-5 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          title="ย่อแผง HUD"
        >
          <Minimize2 size={11} />
        </button>
      </div>

      {/* Settings Popover Tray */}
      {showSettings && (
        <div className="mb-2 p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[10.5px] font-mono space-y-1">
          <div className="text-white/50 text-[9.5px] uppercase tracking-wider mb-1">
            Toggle Visible Metrics:
          </div>
          <div className="grid grid-cols-2 gap-1 text-white/70">
            {(Object.keys(visibleRows) as Array<keyof typeof visibleRows>).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => toggleRow(k)}
                className={`px-1.5 py-0.5 rounded text-left flex items-center justify-between transition-all ${
                  visibleRows[k] ? 'bg-white/10 text-white' : 'text-white/30'
                }`}
              >
                <span className="uppercase">{k}</span>
                {visibleRows[k] ? <Eye size={10} /> : <EyeOff size={10} />}
              </button>
            ))}
          </div>
          {onToggleTelemetryContract && (
            <div className="pt-1.5 mt-1 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-[10px] text-white/50">Telemetry Contract:</span>
              <button
                type="button"
                onClick={onToggleTelemetryContract}
                className={`px-2 py-0.5 rounded text-[9.5px] font-mono transition-all cursor-pointer ${
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

      {/* Monospace Telemetry Grid */}
      <div className="font-mono text-[11px] leading-relaxed space-y-1.5">
        {/* Row 1: Pipeline Latency */}
        {visibleRows.latency && (
          <div className="flex items-center justify-between">
            <span className="text-[#38bdf8] font-bold">LATENCY</span>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${latencyColor}`}>
                {latency > 0 ? `${latency} ms` : 'STANDBY'}
              </span>
              <span className="text-[9.5px] text-white/30">
                {latency > 0 && latency < 500 ? 'OPTIMAL' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Row 2: Target Model */}
        {visibleRows.model && (
          <div className="flex items-center justify-between">
            <span className="text-[#34d399] font-bold">ENGINE</span>
            <span className="text-white/80 truncate max-w-[170px]">
              {telemetry?.model || 'Gemini 3.8 Flash'}
            </span>
          </div>
        )}

        {/* Row 3: Hitbox / Real Telemetry Verdict */}
        {visibleRows.hitbox && (
          <div className="flex items-start justify-between gap-2 pt-1 border-t border-white/[0.06]">
            <span className="text-[#fb923c] font-bold shrink-0">VERDICT</span>
            <span className={`text-right font-medium text-[10.5px] ${hitbox.color}`}>
              {hitbox.text}
            </span>
          </div>
        )}

        {/* Row 3.5: Active Persistent Contacts */}
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

        {/* Row 4: Distance State */}
        {visibleRows.distance && (
          <div className="flex items-center justify-between">
            <span className="text-[#a78bfa] font-bold">DISTANCE</span>
            <span className="text-white/80 uppercase">
              {spacing === 'distant' ? '2 Steps (Distant)' : spacing === 'reach' ? '1 Arm (Reach)' : 'Intimate'}
            </span>
          </div>
        )}

        {/* Row 5: Boundary State */}
        {visibleRows.boundary && (
          <div className="flex items-center justify-between">
            <span className="text-[#f472b6] font-bold">BOUNDARY</span>
            <span className="text-white/80">
              {boundaryLevel}% ({isParryEnabled ? 'Active' : 'Bypassed'})
            </span>
          </div>
        )}

        {/* Row 6: Actor Posture (Grounded Cinematic Snapshot) */}
        {visibleRows.posture && telemetry?.a_pos && (
          <div className="pt-1.5 border-t border-white/[0.06]">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-[#38bdf8] font-bold">POSTURE</span>
              <span className="text-[9px] text-white/40 uppercase tracking-wider font-mono">
                GROUNDED SNAPSHOT
              </span>
            </div>
            <div className="text-[11px] text-[#F1F1F1] font-sans leading-relaxed bg-white/[0.04] p-2 rounded-lg border border-white/[0.08]">
              "{telemetry.a_pos}"
            </div>
          </div>
        )}

        {/* Row 6: Sensory Context Snippet */}
        {visibleRows.sensory && sensoryPulseText && (
          <div className="pt-1 border-t border-white/[0.06]">
            <div className="text-[9.5px] text-white/40 uppercase mb-0.5">
              Sensory Pulse (To Actor):
            </div>
            <div className="text-[10px] text-white/70 italic leading-snug line-clamp-2 bg-white/[0.03] p-1.5 rounded border border-white/[0.05]">
              "{sensoryPulseText}"
            </div>
          </div>
        )}

        {/* Telemetry CoT Thinking (Expandable) */}
        {telemetry?.thinking && (
          <div className="pt-1 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => setShowThinking(!showThinking)}
              className="w-full flex items-center justify-between text-[10px] text-white/50 hover:text-white/80 py-0.5 transition-all cursor-pointer"
            >
              <span>CoT Reasoning Excerpt</span>
              {showThinking ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
            {showThinking && (
              <div className="mt-1 p-2 rounded bg-black/50 border border-white/10 text-[9.5px] text-blue-300/80 leading-relaxed max-h-36 overflow-y-auto no-scrollbar whitespace-pre-wrap">
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
