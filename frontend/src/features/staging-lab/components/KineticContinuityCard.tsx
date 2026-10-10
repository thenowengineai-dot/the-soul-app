import { useState } from 'react'
import {
  RotateCcw,
  Zap,
  Activity,
  Compass,
  Play,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import {
  STANCE_PRESETS,
  VELOCITY_PRESETS,
  type StancePreset,
  type VelocityPreset
} from '../modules/kineticContinuityModule'

interface KineticContinuityCardProps {
  isActive: boolean
  onActivate: () => void
  isExpanded: boolean
  onToggleExpand: () => void
  originPosture: string
  onOriginPostureChange: (posture: string) => void
  onSelectVelocityAction: (actionText: string) => void
  isLoading: boolean
  elapsedSeconds: number
  onSimulate: () => void
}

export function KineticContinuityCard({
  isActive,
  onActivate,
  isExpanded,
  onToggleExpand,
  originPosture,
  onOriginPostureChange,
  onSelectVelocityAction,
  isLoading,
  elapsedSeconds,
  onSimulate,
}: KineticContinuityCardProps) {
  const [isCustomMode, setIsCustomMode] = useState(false)

  // Find active preset if matches
  const activePreset = STANCE_PRESETS.find(
    (p) => p.snapshot.trim() === originPosture.trim()
  )

  const handleSelectPreset = (preset: StancePreset) => {
    setIsCustomMode(false)
    onOriginPostureChange(preset.snapshot)
  }

  return (
    <div
      className={`w-[346px] rounded-[24px] transition-all select-none border backdrop-blur-2xl ${
        isActive
          ? 'bg-white/[0.07] border-[#34d399]/40 shadow-[0_0_24px_rgba(52,211,153,0.10)]'
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
                ? 'bg-[#34d399]/15 border-[#34d399]/40 text-[#34d399]'
                : 'bg-white/[0.05] border-white/10 text-white/50 group-hover:text-white/80'
            }`}
          >
            <Activity size={14} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/10 text-[#34d399] font-bold">
                การ์ดที่ 2
              </span>
              <h2 className="text-[14.5px] font-semibold text-[#F1F1F1] tracking-tight leading-none">
                สรีระและแรงเฉื่อย
              </h2>
            </div>
            <p className="text-[10.5px] font-normal text-white/40 mt-1">
              Kinetic Continuity & Pacing
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
                ? 'bg-[#34d399]/20 text-[#a7f3d0] border-[#34d399]/50 shadow-[0_0_12px_rgba(52,211,153,0.25)]'
                : 'bg-white/[0.04] text-white/40 border-white/10 hover:text-white/70 hover:bg-white/[0.08]'
            }`}
            title={isActive ? 'การ์ดนี้กำลังถูกทดสอบ' : 'คลิกเพื่อเลือกทดสอบการ์ดนี้'}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive ? 'bg-[#34d399] animate-pulse' : 'bg-white/30'
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
          {/* Stance Selector (The Kinetic Seed) */}
          <div className="rounded-2xl p-3 bg-white/[0.03] border border-white/[0.07] space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/80">
                <Compass size={13} className="text-[#38bdf8]" />
                <span>พิกัดสรีระตั้งต้น (a_pos)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomMode(!isCustomMode)}
                className="text-[9.5px] text-white/40 hover:text-white/80 transition-colors cursor-pointer font-mono"
              >
                {isCustomMode ? 'ใช้ Preset' : 'กำหนดเอง'}
              </button>
            </div>

            {/* Preset Buttons Grid */}
            {!isCustomMode ? (
              <div className="grid grid-cols-2 gap-1.5">
                {STANCE_PRESETS.map((p) => {
                  const isSelected = activePreset?.id === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white/[0.12] border-white/30 text-white shadow-sm'
                          : 'bg-white/[0.02] border-white/[0.06] text-white/60 hover:text-white/90 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="text-[10.5px] font-medium truncate leading-tight">
                        {p.label}
                      </div>
                      <div className="text-[9px] text-white/40 line-clamp-1 mt-0.5">
                        {p.description}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div>
                <textarea
                  value={originPosture}
                  onChange={(e) => onOriginPostureChange(e.target.value)}
                  placeholder="พิมพ์ช็อตภาพนิ่งสรีระ เช่น 'ยืนหันข้างกอดอกแน่น ปลายเล็บจิกแขนเสื้อตัวเอง'"
                  rows={2}
                  className="w-full text-[11px] p-2 rounded-xl bg-black/30 border border-white/10 text-[#F1F1F1] placeholder-white/20 focus:outline-none focus:border-white/30 resize-none leading-relaxed"
                />
              </div>
            )}

            {/* Active Stance Snapshot Display */}
            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[10.5px] text-white/70 italic leading-snug">
              "{originPosture || 'ยังไม่ได้ระบุท่าตั้งต้น'}"
            </div>
          </div>

          {/* Velocity Triggers (Cinema Pacing Presets) */}
          <div className="rounded-2xl p-3 bg-white/[0.03] border border-white/[0.07] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-white/80">
              <span>ทดสอบแรงปะทะ (Kinetic Pacing Triggers)</span>
            </div>

            <div className="space-y-1.5">
              {VELOCITY_PRESETS.map((v: VelocityPreset) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onSelectVelocityAction(v.actionText)}
                  className="w-full p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/15 text-left transition-all cursor-pointer group flex items-start justify-between gap-2"
                >
                  <div>
                    <div className="text-[10.5px] font-medium text-white/90 group-hover:text-white flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          v.tempo === 'HIGH_VELOCITY_SNAP'
                            ? 'bg-[#fb923c]'
                            : v.tempo === 'LOW_VELOCITY_UNHOOK'
                            ? 'bg-[#c084fc]'
                            : 'bg-[#34d399]'
                        }`}
                      />
                      {v.label}
                    </div>
                    <div className="text-[9.5px] text-white/40 mt-0.5 line-clamp-1">
                      {v.actionText}
                    </div>
                  </div>
                  <Play
                    size={11}
                    className="text-white/20 group-hover:text-white/60 shrink-0 mt-1 transition-colors"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Action CTA (รันเฉพาะการ์ด 2) */}
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
                <span>กำลังจำลองสรีระ... ({elapsedSeconds.toFixed(1)}s)</span>
              </>
            ) : (
              <>
                <Zap size={13} fill="currentColor" />
                <span>รันจำลองการ์ดที่ 2</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
