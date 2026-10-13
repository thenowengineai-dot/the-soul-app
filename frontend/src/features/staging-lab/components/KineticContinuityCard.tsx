import { useState } from 'react'
import {
  RotateCcw,
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
  initialPosture: string
  currentPosture: string
  onOriginPostureChange: (posture: string) => void
  onResetPosture?: () => void
  onSelectVelocityAction: (actionText: string) => void
  isLoading?: boolean
  elapsedSeconds?: number
  onSimulate?: () => void
}

export function KineticContinuityCard({
  isActive,
  onActivate,
  isExpanded,
  onToggleExpand,
  initialPosture,
  currentPosture,
  onOriginPostureChange,
  onResetPosture,
  onSelectVelocityAction,
}: KineticContinuityCardProps) {
  const [isCustomMode, setIsCustomMode] = useState(false)

  // Find active preset if matches baseline
  const activePreset = STANCE_PRESETS.find(
    (p) => p.snapshot.trim() === initialPosture.trim()
  )

  const handleSelectPreset = (preset: StancePreset) => {
    setIsCustomMode(false)
    onOriginPostureChange(preset.snapshot)
  }

  return (
    <div
      className={`w-[346px] rounded-[28px] transition-all select-none border backdrop-blur-2xl relative overflow-hidden ${
        isActive
          ? 'bg-white/[0.08] border-[#34d399]/40 shadow-[inset_0_1px_0_rgba(52,211,153,0.30),0_0_24px_rgba(52,211,153,0.12)]'
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
                ? 'bg-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : 'bg-[#34d399]/40 group-hover:bg-[#34d399]/70'
            }`}
          />
          <div className="flex items-baseline gap-1.5 truncate">
            <span className="text-[15px] sm:text-[15.5px] font-semibold text-[#F1F1F1] tracking-tight">
              ท่วงท่าต่อเนื่อง
            </span>
            <span className="text-[11px] font-normal text-white/40 truncate">
              (สรีระและจังหวะ)
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
                ? 'bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/35 shadow-[inset_0_1px_0_rgba(52,211,153,0.20)]'
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
                  value={initialPosture}
                  onChange={(e) => onOriginPostureChange(e.target.value)}
                  placeholder="พิมพ์ช็อตภาพนิ่งสรีระ เช่น 'ยืนหันข้างกอดอกแน่น ปลายเล็บจิกแขนเสื้อตัวเอง'"
                  rows={2}
                  className="w-full text-[11px] p-2 rounded-xl bg-black/30 border border-white/10 text-[#F1F1F1] placeholder-white/20 focus:outline-none focus:border-white/30 resize-none leading-relaxed"
                />
              </div>
            )}

            {/* Active Stance Snapshot Display (Dual-State In-Memory Mirror) */}
            {currentPosture.trim() !== initialPosture.trim() ? (
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-[#34d399]/25 space-y-1.5">
                <div className="flex items-center justify-between text-[9.5px] font-mono">
                  <span className="text-[#34d399] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
                    ท่าปัจจุบัน (เทิร์น 2+)
                  </span>
                  {onResetPosture && (
                    <button
                      type="button"
                      onClick={onResetPosture}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-white/70 hover:text-white transition-colors cursor-pointer border border-white/10 text-[9px]"
                      title="รีเซ็ตสรีระกลับสู่ท่าตั้งต้น"
                    >
                      <RotateCcw size={9} />
                      <span>รีเซ็ตสรีระ</span>
                    </button>
                  )}
                </div>
                <div className="text-[11px] text-[#F1F1F1] font-sans leading-snug">
                  "{currentPosture}"
                </div>
                <div className="text-[9.5px] text-white/40 font-mono truncate pt-0.5 border-t border-white/[0.04]">
                  เริ่มจาก: "{initialPosture}"
                </div>
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-0.5">
                <div className="text-[9px] font-mono text-white/40">ท่าตั้งต้น (ORIGIN):</div>
                <div className="text-[10.5px] text-white/80 italic leading-snug">
                  "{initialPosture || 'ยังไม่ได้ระบุท่าตั้งต้น'}"
                </div>
              </div>
            )}
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
        </div>
      )}
    </div>
  )
}
