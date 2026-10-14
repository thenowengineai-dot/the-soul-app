import {
  ChevronDown,
  ChevronUp,
  Flame,
  RotateCw
} from 'lucide-react'
import {
  type MagmaPhase,
  type MagmaCoreConfig,
  getMagmaPhaseMeta
} from '../modules/magmaCoreModule'

interface MagmaCoreCardProps {
  isActive: boolean
  onActivate: () => void
  config: MagmaCoreConfig
  onChange: (config: MagmaCoreConfig) => void
  baseDefenseStage?: number
  isExpanded: boolean
  onToggleExpand: () => void
}

export function MagmaCoreCard({
  isActive,
  onActivate,
  config,
  onChange,
  baseDefenseStage = 5,
  isExpanded,
  onToggleExpand,
}: MagmaCoreCardProps) {
  const meta = getMagmaPhaseMeta(config.phase)

  const handlePhaseChange = (phase: MagmaPhase) => {
    onChange({
      ...config,
      phase,
    })
  }

  const handleFieldChange = (field: keyof MagmaCoreConfig, value: string | boolean) => {
    onChange({
      ...config,
      [field]: value,
    })
  }

  const phases: MagmaPhase[] = ['sealed', 'erupted', 'cooled_magma']

  return (
    <div
      className={`w-[346px] rounded-[28px] transition-all select-none border backdrop-blur-2xl relative overflow-hidden ${
        isActive
          ? 'bg-white/[0.08] border-[#EF264C]/40 shadow-[inset_0_1px_0_rgba(239,38,76,0.25),0_0_24px_rgba(239,38,76,0.10)]'
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
                ? 'bg-[#EF264C] shadow-[0_0_8px_rgba(239,38,76,0.8)]'
                : 'bg-white/20'
            }`}
          />
          <div className="flex items-baseline gap-1.5 truncate">
            <span className="text-[15px] sm:text-[15.5px] font-semibold text-[#F1F1F1] tracking-tight">
              แกนลาวา & การปะทุ
            </span>
            <span className="text-[11px] font-normal text-white/40 truncate">
              (แร็ค 03 • The Magma Core)
            </span>
          </div>
        </div>

        {/* Right Header: Active Phase Pill + ENGAGED / BYPASS Switch + Chevron */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className={`px-2 py-0.5 rounded-full text-[9.5px] font-mono font-medium flex items-center gap-1 select-none border ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder}`}
            title={meta.description}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="truncate max-w-[95px] uppercase">{config.phase.replace('_', ' ')}</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onActivate()
            }}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 select-none ${
              isActive
                ? 'bg-[#EF264C]/15 text-[#EF264C] border border-[#EF264C]/35 shadow-[inset_0_1px_0_rgba(239,38,76,0.20)]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70 border border-white/10'
            }`}
            title="คลิกเพื่อ เปิด/ปิด การจำลองแกนลาวา"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                isActive ? 'bg-[#EF264C] animate-pulse' : 'bg-white/30'
              }`}
            />
            <span>{isActive ? 'ENGAGED' : 'BYPASS'}</span>
          </button>

          <button
            type="button"
            className="w-5 h-5 flex items-center justify-center text-white/40 group-hover:text-white/80 transition-colors cursor-pointer"
            aria-label="ย่อ/ขยายการ์ด"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* 2. Accordion Body */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 flex flex-col gap-3.5 border-t border-white/[0.06]">
          {/* Section A: 3-Phase Tactile Segmented Capsule */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-white/70 tracking-tight flex items-center gap-1.5">
                <Flame size={12} className="text-[#EF264C]" />
                <span>สภาวะภูเขาไฟ (The 3 Geological Phases)</span>
              </span>
              <span className="text-[10px] font-mono text-white/35">
                Stat E: {baseDefenseStage}/10
              </span>
            </div>

            {/* Segmented Control Pill */}
            <div className="grid grid-cols-3 p-1 rounded-2xl bg-black/40 border border-white/10 gap-1 select-none">
              {phases.map((p) => {
                const isSelected = config.phase === p
                let activeStyle = ''
                if (isSelected) {
                  if (p === 'sealed') {
                    activeStyle = 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40 shadow-sm'
                  } else if (p === 'erupted') {
                    activeStyle = 'bg-[#EF264C]/25 text-[#EF264C] border border-[#EF264C]/50 shadow-sm font-semibold'
                  } else {
                    activeStyle = 'bg-[#c084fc]/20 text-[#c084fc] border border-[#c084fc]/40 shadow-sm'
                  }
                } else {
                  activeStyle = 'text-white/45 hover:text-white/80 hover:bg-white/[0.04] border border-transparent'
                }

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePhaseChange(p)}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-mono transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 ${activeStyle}`}
                  >
                    <span className="font-semibold uppercase tracking-wider text-[9.5px]">
                      {p === 'cooled_magma' ? 'SOFT SPOT' : p}
                    </span>
                    <span className="text-[8.5px] opacity-75 truncate max-w-[85px]">
                      {p === 'sealed' ? 'เปลือกปิด' : p === 'erupted' ? 'ลาวาทะลัก' : 'แพ้ทางถาวร'}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Dynamic Status Description Banner */}
            <div className={`p-2 rounded-xl border text-[10.5px] font-sans leading-relaxed transition-all ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}`}>
              <div className="flex items-center gap-1.5 font-semibold text-[11px] mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>{meta.label}</span>
              </div>
              <p className="text-white/70 text-[10px]">
                {meta.description}
              </p>
            </div>
          </div>

          {/* Section B: Auto-Progression Valve Pill */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-2">
              <RotateCw size={12} className={config.autoProgress ? 'text-[#EF264C]' : 'text-white/30'} />
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-medium text-white/80">
                  วาล์วระบายอัตโนมัติ (Auto-Progression Valve)
                </span>
                <span className="text-[9.5px] text-white/40 font-mono">
                  เมื่อเกิด Erupted จะถอยสู่ Soft Spot อัตโนมัติหลังจบเทิร์น
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleFieldChange('autoProgress', !config.autoProgress)}
              className={`px-2 py-0.5 rounded-full text-[9.5px] font-mono transition-all cursor-pointer ${
                config.autoProgress
                  ? 'bg-[#EF264C]/20 text-[#EF264C] border border-[#EF264C]/40 font-semibold'
                  : 'bg-white/[0.04] text-white/40 border border-white/10'
              }`}
            >
              {config.autoProgress ? 'AUTO: ON' : 'AUTO: OFF'}
            </button>
          </div>

          {/* Section C: The 2 Core Magma Vectors */}
          <div className="flex flex-col gap-2.5">
            {/* 1. The Fault Line (จุดชนวนสะกิดตาย) */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-[10px] font-mono font-medium text-white/50 uppercase tracking-wider flex items-center justify-between">
                <span>1. The Fault Line (จุดชนวนสะกิดตาย)</span>
                <span className="text-[9px] text-[#38bdf8]/70">The Trigger</span>
              </label>
              <textarea
                value={config.faultLine}
                onChange={(e) => handleFieldChange('faultLine', e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 focus:border-[#EF264C]/50 text-white/90 text-[11px] font-sans leading-relaxed resize-none focus:outline-none transition-all no-scrollbar"
                placeholder="ระบุคำพูดหรือการสัมผัสที่เจาะทะลุเปลือกหินได้ทันที..."
              />
            </div>

            {/* 2. The Polar Inversion (เวกเตอร์ลาวาทะลัก 180 องศา) */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-[10px] font-mono font-medium text-white/50 uppercase tracking-wider flex items-center justify-between">
                <span>2. Polar Inversion (เวกเตอร์ลาวาทะลัก 180°)</span>
                <span className="text-[9px] text-[#EF264C]/80">Eruption Vector</span>
              </label>
              <textarea
                value={config.polarInversion}
                onChange={(e) => handleFieldChange('polarInversion', e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 focus:border-[#EF264C]/50 text-white/90 text-[11px] font-sans leading-relaxed resize-none focus:outline-none transition-all no-scrollbar"
                placeholder="ระบุการกลับขั้วอารมณ์จากหน้ามือเป็นหลังมือเมื่อเกราะแตก..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
