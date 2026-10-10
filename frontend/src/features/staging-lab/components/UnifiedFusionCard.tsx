import { useState } from 'react'
import {
  RotateCcw,
  Zap,
  Sparkles,
  Play,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import type { SpatialSpacing } from '../modules/physicalParryModule'
import { getBoundaryBrief } from '../modules/physicalParryModule'
import {
  STANCE_PRESETS,
  VELOCITY_PRESETS,
  type StancePreset,
  type VelocityPreset
} from '../modules/kineticContinuityModule'

interface UnifiedFusionCardProps {
  isActive: boolean
  onActivate: () => void
  isExpanded: boolean
  onToggleExpand: () => void
  spacing: SpatialSpacing
  onSpacingChange: (spacing: SpatialSpacing) => void
  boundaryLevel: number
  onBoundaryChange: (level: number) => void
  originPosture: string
  onOriginPostureChange: (posture: string) => void
  onSelectVelocityAction: (actionText: string) => void
  isLoading: boolean
  elapsedSeconds: number
  onSimulate: () => void
}

export function UnifiedFusionCard({
  isActive,
  onActivate,
  isExpanded,
  onToggleExpand,
  spacing,
  onSpacingChange,
  boundaryLevel,
  onBoundaryChange,
  originPosture,
  onOriginPostureChange,
  onSelectVelocityAction,
  isLoading,
  elapsedSeconds,
  onSimulate,
}: UnifiedFusionCardProps) {
  const boundaryInfo = getBoundaryBrief(boundaryLevel)
  const [activeSubTab, setActiveSubTab] = useState<'boundary' | 'kinetic'>('boundary')

  const activePreset = STANCE_PRESETS.find(
    (p) => p.snapshot.trim() === originPosture.trim()
  )

  const handleSelectPreset = (preset: StancePreset) => {
    onOriginPostureChange(preset.snapshot)
  }

  return (
    <div
      className={`w-[346px] rounded-[24px] transition-all select-none border backdrop-blur-2xl ${
        isActive
          ? 'bg-white/[0.07] border-[#c084fc]/40 shadow-[0_0_24px_rgba(192,132,252,0.12)]'
          : 'bg-white/[0.04] hover:bg-white/[0.06] border-white/[0.08] hover:border-white/15'
      }`}
    >
      {/* 1. Accordion Header Row */}
      <div className="p-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex-1 flex items-center gap-2.5 text-left cursor-pointer group"
        >
          <div
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all shrink-0 ${
              isActive
                ? 'bg-[#c084fc]/15 border-[#c084fc]/40 text-[#c084fc]'
                : 'bg-white/[0.05] border-white/10 text-white/50 group-hover:text-white/80'
            }`}
          >
            <Sparkles size={14} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/10 text-[#c084fc] font-bold">
                การ์ดที่ 3
              </span>
              <h2 className="text-[14.5px] font-semibold text-[#F1F1F1] tracking-tight leading-none">
                ระบบรวมร่างสรีระและขอบเขต
              </h2>
            </div>
            <p className="text-[10.5px] font-normal text-white/40 mt-1">
              Unified Fusion Engine (1 + 2)
            </p>
          </div>
        </button>

        {/* Right Header Actions: Activation Pill + Chevron */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onActivate()
            }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
              isActive
                ? 'bg-[#c084fc]/20 text-[#e9d5ff] border-[#c084fc]/50 shadow-[0_0_12px_rgba(192,132,252,0.25)]'
                : 'bg-white/[0.04] text-white/40 border-white/10 hover:text-white/70 hover:bg-white/[0.08]'
            }`}
            title={isActive ? 'การ์ดนี้กำลังถูกทดสอบ' : 'คลิกเพื่อเลือกทดสอบการ์ดนี้'}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive ? 'bg-[#c084fc] animate-pulse' : 'bg-white/30'
              }`}
            />
            {isActive ? 'ACTIVE' : 'เลือกทดสอบ'}
          </button>

          <button
            type="button"
            onClick={onToggleExpand}
            className="w-7 h-7 rounded-full bg-white/[0.04] hover:bg-white/[0.10] text-white/40 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title={isExpanded ? 'พับเก็บการ์ด' : 'คลี่ออกดูการ์ด'}
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* 2. Expandable Body Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 space-y-3.5 border-t border-white/[0.06]">
          {/* Sub-Switch Pills for tuning inside Fusion */}
          <div className="flex items-center p-0.5 rounded-xl bg-black/30 border border-white/10 text-[10.5px] font-medium">
            <button
              type="button"
              onClick={() => setActiveSubTab('boundary')}
              className={`flex-1 py-1 rounded-lg transition-all cursor-pointer text-center ${
                activeSubTab === 'boundary'
                  ? 'bg-white/15 text-white shadow-sm font-semibold'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              ปรับค่าขอบเขต (Card 1)
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('kinetic')}
              className={`flex-1 py-1 rounded-lg transition-all cursor-pointer text-center ${
                activeSubTab === 'kinetic'
                  ? 'bg-white/15 text-white shadow-sm font-semibold'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              ปรับค่าสรีระ (Card 2)
            </button>
          </div>

          {activeSubTab === 'boundary' ? (
            <div className="space-y-3">
              {/* Spacing Switcher */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-white/50">ระยะห่าง (Spacing):</span>
                  <span className="font-mono text-white/70 uppercase text-[10px]">{spacing}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 p-0.5 rounded-xl bg-black/25 border border-white/10 text-[10.5px]">
                  {(['distant', 'reach', 'intimate'] as SpatialSpacing[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onSpacingChange(s)}
                      className={`py-1 rounded-lg text-center transition-all cursor-pointer ${
                        spacing === s ? 'bg-white/15 text-white font-medium' : 'text-white/40 hover:text-white/70'
                      }`}
                    >
                      {s === 'distant' ? '2-3 ก้าว' : s === 'reach' ? 'ช่วงแขน' : 'แนบชิด'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Boundary Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-white/50">ระดับหวงตัว (Boundary):</span>
                  <span className="font-mono text-white/90">{boundaryLevel}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={boundaryLevel}
                  onChange={(e) => onBoundaryChange(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#c084fc]"
                />
              </div>

              <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[10px] text-white/60">
                สถานะ: <span className="text-[#c084fc] font-medium">{boundaryInfo.stageName}</span> - {boundaryInfo.badge}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Stance Preset Quick Selector */}
              <div className="space-y-1">
                <span className="text-[10.5px] text-white/50">ท่าตั้งต้น (Origin a_pos):</span>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  {STANCE_PRESETS.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`p-1.5 rounded-lg border text-left truncate transition-all cursor-pointer ${
                        activePreset?.id === p.id
                          ? 'bg-white/10 border-white/25 text-white font-medium'
                          : 'bg-white/[0.02] border-white/[0.05] text-white/50 hover:text-white/80'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Stance Quote */}
              <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[10px] text-white/70 italic line-clamp-1">
                "{originPosture}"
              </div>
            </div>
          )}

          {/* Quick Velocity Test Triggers */}
          <div className="pt-2 border-t border-white/[0.06] space-y-1">
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-mono">
              Quick Test Triggers:
            </span>
            <div className="grid grid-cols-2 gap-1">
              {VELOCITY_PRESETS.slice(0, 2).map((v: VelocityPreset) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onSelectVelocityAction(v.actionText)}
                  className="p-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-left transition-all cursor-pointer group flex items-center justify-between text-[10px]"
                >
                  <span className="truncate text-white/80 group-hover:text-white">{v.label}</span>
                  <Play size={10} className="text-white/20 group-hover:text-white/60 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Action CTA (รันโหมดรวมร่าง) */}
          <button
            type="button"
            onClick={onSimulate}
            disabled={isLoading}
            className={`w-full h-10 rounded-full font-medium text-[12.5px] tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98] ${
              isLoading
                ? 'bg-white/10 text-white/50 border border-white/10 cursor-not-allowed'
                : 'bg-[#F1F1F1] hover:bg-white text-black border border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]'
            }`}
          >
            {isLoading ? (
              <>
                <RotateCcw size={13} className="animate-spin text-white/60" />
                <span>กำลังจำลองระบบรวมร่าง... ({elapsedSeconds.toFixed(1)}s)</span>
              </>
            ) : (
              <>
                <Zap size={13} fill="currentColor" />
                <span>รันจำลองระบบรวมร่าง (Card 3)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
