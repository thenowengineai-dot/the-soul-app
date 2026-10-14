import {
  ChevronDown,
  ChevronUp,
  Shield,
  Zap,
  RotateCw,
  HeartHandshake,
  Sparkles
} from 'lucide-react'
import {
  type ShieldState,
  type InhibitionShieldConfig,
  getShieldStateMeta
} from '../modules/inhibitionShieldModule'

interface InhibitionShieldCardProps {
  isActive: boolean
  onActivate: () => void
  config: InhibitionShieldConfig
  onChange: (config: InhibitionShieldConfig) => void
  baseDefenseStage?: number
  isExpanded: boolean
  onToggleExpand: () => void
}

export function InhibitionShieldCard({
  isActive,
  onActivate,
  config,
  onChange,
  baseDefenseStage = 5,
  isExpanded,
  onToggleExpand,
}: InhibitionShieldCardProps) {
  const meta = getShieldStateMeta(config.state)

  const handleStateChange = (state: ShieldState) => {
    onChange({
      ...config,
      state,
    })
  }

  const handleFieldChange = (field: keyof InhibitionShieldConfig, value: string | boolean) => {
    onChange({
      ...config,
      [field]: value,
    })
  }

  const states: ShieldState[] = ['active', 'cracked', 'shattered', 'post_shatter']

  return (
    <div
      className={`w-[346px] rounded-[28px] transition-all select-none border backdrop-blur-2xl relative overflow-hidden ${
        isActive
          ? 'bg-white/[0.08] border-[#f43f5e]/40 shadow-[inset_0_1px_0_rgba(244,63,94,0.25),0_0_24px_rgba(244,63,94,0.10)]'
          : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] hover:border-white/15'
      }`}
    >
      {/* 1. Accordion Header Row */}
      <div
        onClick={onToggleExpand}
        className="px-4 py-3.5 flex items-center justify-between gap-2 cursor-pointer select-none"
      >
        <div className="flex-1 flex items-center gap-2 text-left group min-w-0">
          <span
            className={`w-2 h-2 rounded-full shrink-0 transition-all ${
              isActive
                ? 'bg-[#f43f5e] shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                : 'bg-white/20'
            }`}
          />
          <div className="flex items-baseline gap-1.5 truncate">
            <span className="text-[15px] sm:text-[15.5px] font-semibold text-[#F1F1F1] tracking-tight">
              เกราะสติ & การแตกหัก
            </span>
            <span className="text-[11px] font-normal text-white/40 truncate">
              (แร็ค 03 • The Armor Break)
            </span>
          </div>
        </div>

        {/* Right Header: Active State Pill + ENGAGED / BYPASS Switch + Chevron */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className={`px-2 py-0.5 rounded-full text-[9.5px] font-mono font-medium flex items-center gap-1 select-none border ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder}`}
            title={meta.description}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="truncate max-w-[90px] uppercase">{config.state}</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onActivate()
            }}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 select-none ${
              isActive
                ? 'bg-[#f43f5e]/15 text-[#f43f5e] border border-[#f43f5e]/35 shadow-[inset_0_1px_0_rgba(244,63,94,0.20)]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70 border border-white/10'
            }`}
            title="คลิกเพื่อ เปิด/ปิด การจำลองเกราะสติ"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                isActive ? 'bg-[#f43f5e] animate-pulse' : 'bg-white/30'
              }`}
            />
            <span>{isActive ? 'ENGAGED' : 'BYPASS'}</span>
          </button>

          <button
            type="button"
            className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
            aria-label="ย่อ/ขยายการ์ด"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* 2. Expanded Body Panel */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 space-y-3.5 border-t border-white/[0.06] select-none animate-in fade-in duration-150">
          {/* Tactile 4-State Segmented Control Capsule */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-white/50 mb-2">
              <span className="flex items-center gap-1.5 text-white/70">
                <Shield size={11} className="text-[#f43f5e]" />
                <span>สถานะเกราะสติหน้างาน</span>
              </span>
              <span className="text-[10px] font-mono text-white/40">
                BASE DEFENSE: {baseDefenseStage}/10
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-black/40 border border-white/[0.07]">
              {states.map((st) => {
                const isSelected = config.state === st
                const sMeta = getShieldStateMeta(st)
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStateChange(st)}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-mono font-medium transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? `${sMeta.badgeBg} ${sMeta.badgeText} border ${sMeta.badgeBorder} shadow-sm font-semibold`
                        : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="uppercase tracking-tight truncate max-w-full">
                      {st.replace('_', '-')}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* State Description Micro Pill */}
            <div className="mt-2 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[10.5px] text-white/60 font-sans leading-relaxed flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-current text-[#f43f5e] shrink-0" />
              <span>{meta.description}</span>
            </div>
          </div>

          {/* Auto-Progression Valve Switch */}
          <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-black/30 border border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Sparkles size={12} className="text-[#c084fc]" />
              <div className="text-left">
                <div className="text-[11px] font-medium text-white/80 font-sans leading-tight">
                  Auto-Progression Valve
                </div>
                <div className="text-[9.5px] text-white/40 font-sans">
                  ดีดเข้า POST-SHATTER อัตโนมัติเมื่อตอบจบ 1 เทิร์น
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleFieldChange('autoProgress', !config.autoProgress)}
              className={`px-2 py-0.5 rounded-full text-[9.5px] font-mono font-medium transition-all cursor-pointer border ${
                config.autoProgress
                  ? 'bg-[#c084fc]/15 text-[#c084fc] border-[#c084fc]/35'
                  : 'bg-white/[0.04] text-white/40 border-white/10'
              }`}
            >
              {config.autoProgress ? 'AUTO ON' : 'HOLD STATE'}
            </button>
          </div>

          {/* 3 Bento Textareas: Trigger, Polar Inversion Shift, Post-Shatter Reaction */}
          <div className="space-y-2.5 pt-0.5">
            {/* Box 1: The Fatal Trigger */}
            <div className="rounded-2xl p-2.5 bg-black/30 border border-white/[0.06] focus-within:border-[#f59e0b]/40 transition-all">
              <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-white/60 font-sans mb-1">
                <Zap size={11} className="text-[#f59e0b]" />
                <span>1. จุดสะกิดต้องห้าม (The Fatal Trigger)</span>
              </div>
              <textarea
                value={config.trigger}
                onChange={(e) => handleFieldChange('trigger', e.target.value)}
                rows={2}
                className="w-full bg-transparent text-[11px] text-[#F1F1F1] leading-relaxed resize-none focus:outline-none font-sans placeholder-white/30"
                placeholder="ระบุคำพูดหรือการกระทำที่แทงใจดำจนเกราะพังทลาย..."
              />
            </div>

            {/* Box 2: Polar Inversion Shift */}
            <div className="rounded-2xl p-2.5 bg-black/30 border border-white/[0.06] focus-within:border-[#f43f5e]/40 transition-all">
              <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-white/60 font-sans mb-1">
                <RotateCw size={11} className="text-[#f43f5e]" />
                <span>2. การสลับขั้ว 180° สดๆ (Polar Inversion Shift)</span>
              </div>
              <textarea
                value={config.shift}
                onChange={(e) => handleFieldChange('shift', e.target.value)}
                rows={2}
                className="w-full bg-transparent text-[11px] text-[#F1F1F1] leading-relaxed resize-none focus:outline-none font-sans placeholder-white/30"
                placeholder="ระบุทิศทางการพลิกขั้วอารมณ์: จากมาดเดิม สู่สภาพหลุดมาด..."
              />
            </div>

            {/* Box 3: Post-Shatter Reaction */}
            <div className="rounded-2xl p-2.5 bg-black/30 border border-white/[0.06] focus-within:border-[#c084fc]/40 transition-all">
              <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-white/60 font-sans mb-1">
                <HeartHandshake size={11} className="text-[#c084fc]" />
                <span>3. สภาวะสมดุลใหม่หลังเกราะแตก (Post-Shatter Reaction)</span>
              </div>
              <textarea
                value={config.postShatterReaction}
                onChange={(e) => handleFieldChange('postShatterReaction', e.target.value)}
                rows={2}
                className="w-full bg-transparent text-[11px] text-[#F1F1F1] leading-relaxed resize-none focus:outline-none font-sans placeholder-white/30"
                placeholder="ระบุกิริยาในเทิร์นถัดไปหลังจากเกราะแตก: เขินอายแก้เก้อ หรือเปิดใจสนิทสนม..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
