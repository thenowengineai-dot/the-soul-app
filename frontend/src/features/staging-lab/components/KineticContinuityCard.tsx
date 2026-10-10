import { useState } from 'react'
import {
  RotateCcw,
  Zap,
  Layers,
  Activity,
  Compass,
  Play,
  ArrowLeft
} from 'lucide-react'
import {
  STANCE_PRESETS,
  VELOCITY_PRESETS,
  type StancePreset,
  type VelocityPreset
} from '../modules/kineticContinuityModule'

interface KineticContinuityCardProps {
  originPosture: string
  onOriginPostureChange: (posture: string) => void
  isKineticEnabled: boolean
  onToggleKinetic: () => void
  onSelectVelocityAction: (actionText: string) => void
  isLoading: boolean
  elapsedSeconds: number
  onSimulate: () => void
  onBackToHome?: () => void
  onOpenPromptInspector?: () => void
}

export function KineticContinuityCard({
  originPosture,
  onOriginPostureChange,
  isKineticEnabled,
  onToggleKinetic,
  onSelectVelocityAction,
  isLoading,
  elapsedSeconds,
  onSimulate,
  onBackToHome,
  onOpenPromptInspector,
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
    <div className="w-[346px] rounded-[28px] p-5 bg-white/[0.06] hover:bg-white/[0.08] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all flex flex-col justify-between relative select-none">
      {/* 1. Header Plaque */}
      <div className="flex items-center justify-between shrink-0 mb-3.5">
        <div className="flex items-center gap-2.5">
          {onBackToHome ? (
            <button
              type="button"
              onClick={onBackToHome}
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] active:scale-95"
              title="กลับหน้าหลัก"
            >
              <ArrowLeft size={14} strokeWidth={2.2} />
            </button>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#34d399]/10 border border-[#34d399]/30 flex items-center justify-center text-[#34d399]">
              <Activity size={15} strokeWidth={2.2} />
            </div>
          )}
          <div>
            <h2 className="text-[16px] font-semibold text-[#F1F1F1] tracking-tight leading-none">
              สรีระและแรงเฉื่อย
            </h2>
            <p className="text-[11px] font-normal text-white/40 mt-1">
              Kinetic Continuity & Pacing
            </p>
          </div>
        </div>

        {/* Engine Switch Pill */}
        <button
          type="button"
          onClick={onToggleKinetic}
          className={`px-2.5 py-1 rounded-full text-[10.5px] font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
            isKineticEnabled
              ? 'bg-[#34d399]/15 text-[#a7f3d0] border-[#34d399]/30 shadow-[0_0_12px_rgba(52,211,153,0.15)]'
              : 'bg-white/[0.04] text-white/40 border-white/10 hover:text-white/60'
          }`}
          title="เปิด/ปิดโมดูลสรีระและแรงเฉื่อย"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isKineticEnabled ? 'bg-[#34d399]' : 'bg-white/30'
            }`}
          />
          {isKineticEnabled ? 'ACTIVE' : 'BYPASSED'}
        </button>
      </div>

      <div className="space-y-3.5 shrink-0">
        {/* 2. Origin Stance Selector (The Kinetic Seed) */}
        <div className="rounded-2xl p-3 bg-white/[0.03] border border-white/[0.07] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-white/80">
              <Compass size={13} className="text-[#38bdf8]" />
              <span>พิกัดสรีระตั้งต้น (a_pos)</span>
            </div>
            <button
              type="button"
              onClick={() => setIsCustomMode(!isCustomMode)}
              className="text-[10px] text-white/40 hover:text-white/80 transition-colors cursor-pointer font-mono"
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
                    <div className="text-[11px] font-medium truncate leading-tight">
                      {p.label}
                    </div>
                    <div className="text-[9.5px] text-white/40 line-clamp-1 mt-0.5">
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
                placeholder="พิมพ์ช็อตภาพนิ่งสรีระ 8-15 พยางค์ เช่น 'ยืนหันข้างกอดอกแน่น ปลายเล็บจิกแขนเสื้อตัวเอง'"
                rows={2}
                className="w-full text-[11.5px] p-2 rounded-xl bg-black/30 border border-white/10 text-[#F1F1F1] placeholder-white/20 focus:outline-none focus:border-white/30 resize-none leading-relaxed"
              />
            </div>
          )}

          {/* Active Stance Snapshot Display */}
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[10.5px] text-white/70 italic leading-snug">
            "{originPosture || 'ยังไม่ได้ระบุท่าตั้งต้น'}"
          </div>
        </div>

        {/* 3. Velocity Triggers (Cinema Pacing Presets) */}
        <div className="rounded-2xl p-3 bg-white/[0.03] border border-white/[0.07] space-y-2">
          <div className="flex items-center justify-between text-[11.5px] font-medium text-white/80">
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
                  <div className="text-[11px] font-medium text-white/90 group-hover:text-white flex items-center gap-1.5">
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
                  <div className="text-[10px] text-white/40 mt-0.5 line-clamp-1">
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

      {/* 4. Action CTA & Prompt Studio Trigger */}
      <div className="mt-4 pt-3.5 border-t border-white/[0.08] space-y-2 shrink-0">
        <button
          type="button"
          onClick={onSimulate}
          disabled={isLoading}
          className={`w-full h-11 rounded-full font-medium text-[13px] tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98] ${
            isLoading
              ? 'bg-white/10 text-white/50 border border-white/10 cursor-not-allowed'
              : 'bg-[#F1F1F1] hover:bg-white text-black border border-white/40 hover:shadow-[0_0_24px_rgba(255,255,255,0.2)]'
          }`}
        >
          {isLoading ? (
            <>
              <RotateCcw size={14} className="animate-spin text-white/60" />
              <span>กำลังจำลองจังหวะ... ({elapsedSeconds.toFixed(1)}s)</span>
            </>
          ) : (
            <>
              <Zap size={14} fill="currentColor" />
              <span>รันจำลองการเคลื่อนไหว</span>
            </>
          )}
        </button>

        {onOpenPromptInspector && (
          <button
            type="button"
            onClick={onOpenPromptInspector}
            className="w-full py-1.5 text-center text-[10.5px] font-mono text-white/40 hover:text-white/80 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Layers size={11} />
            <span>ตรวจสอบ Assembled Prompt Studio</span>
          </button>
        )}
      </div>
    </div>
  )
}
