import { useState } from 'react'
import {
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
  isLoading?: boolean
  elapsedSeconds?: number
  onSimulate?: () => void
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
      className={`w-[346px] rounded-[28px] transition-all select-none border backdrop-blur-2xl relative overflow-hidden ${
        isActive
          ? 'bg-white/[0.08] border-[#c084fc]/40 shadow-[inset_0_1px_0_rgba(192,132,252,0.30),0_0_24px_rgba(192,132,252,0.12)]'
          : 'bg-white/[0.06] hover:bg-white/[0.09] border-white/[0.10] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
      }`}
    >
      {/* 1. Accordion Header Row (Ruthless Subtraction to Essence - Apple Style) */}
      <div className="px-4 py-3.5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex-1 flex items-center gap-2 text-left cursor-pointer group min-w-0"
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 transition-all ${
              isActive
                ? 'bg-[#c084fc] shadow-[0_0_8px_rgba(192,132,252,0.8)]'
                : 'bg-[#c084fc]/40 group-hover:bg-[#c084fc]/70'
            }`}
          />
          <div className="flex items-baseline gap-1.5 truncate">
            <span className="text-[15px] sm:text-[15.5px] font-semibold text-[#F1F1F1] tracking-tight">
              ระบบผสานสรีระ
            </span>
            <span className="text-[11px] font-normal text-white/40 truncate">
              (ขอบเขต + ต่อเนื่อง)
            </span>
          </div>
        </button>

        {/* Right Header Actions: Tactile Status Pill + Chevron */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onActivate()
            }}
            className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-medium transition-all cursor-pointer flex items-center gap-1 select-none ${
              isActive
                ? 'bg-[#c084fc]/15 text-[#c084fc] border border-[#c084fc]/35 shadow-[inset_0_1px_0_rgba(192,132,252,0.20)]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/45 hover:text-white/80 border border-white/10 hover:border-white/20'
            }`}
            title={isActive ? 'การ์ดนี้กำลังถูกทดสอบ' : 'คลิกเพื่อเลือกทดสอบการ์ดนี้'}
          >
            <span>{isActive ? 'กำลังใช้' : 'เลือกใช้'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleExpand}
            className="w-6 h-6 rounded-full bg-white/[0.04] hover:bg-white/[0.10] text-white/35 hover:text-white/80 flex items-center justify-center transition-all cursor-pointer"
            title={isExpanded ? 'พับเก็บการ์ด' : 'คลี่ออกดูการ์ด'}
          >
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
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
        </div>
      )}
    </div>
  )
}
