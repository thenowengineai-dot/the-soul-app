import {
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import {
  type MagmaPhase,
  type MagmaCoreConfig,
} from '../modules/magmaCoreModule'

interface MagmaCoreCardProps {
  isActive: boolean
  onActivate: () => void
  config: MagmaCoreConfig
  onChange: (config: MagmaCoreConfig) => void
  isExpanded: boolean
  onToggleExpand: () => void
}

const PHASES: { id: MagmaPhase; label: string; sub: string }[] = [
  { id: 'sealed', label: 'เก็บซ่อน', sub: 'ตั้งการ์ด' },
  { id: 'erupted', label: 'ลาวาทะลัก', sub: 'เกราะแตก' },
  { id: 'cooled_magma', label: 'แพ้ทางถาวร', sub: 'ยอมจำนน' },
]

export function MagmaCoreCard({
  isActive,
  onActivate,
  config,
  onChange,
  isExpanded,
  onToggleExpand,
}: MagmaCoreCardProps) {
  const handlePhaseChange = (phase: MagmaPhase) => {
    onChange({
      ...config,
      phase,
    })
  }

  return (
    <div
      className={`w-full rounded-[28px] transition-all select-none border backdrop-blur-2xl relative overflow-hidden ${
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
          <span className="text-[15px] sm:text-[15.5px] font-semibold text-[#F1F1F1] tracking-tight">
            แกนลาวา
          </span>
        </div>

        {/* Right Header: ENGAGED / BYPASS Switch + Chevron */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onActivate()
            }}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 select-none ${
              isActive
                ? 'bg-[#EF264C]/15 text-[#EF264C] border border-[#EF264C]/35 shadow-[inset_0_1px_0_rgba(239,38,76,0.20)]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20'
            }`}
            title={isActive ? 'คลิกเพื่อปิด' : 'คลิกเพื่อเปิดใช้งาน'}
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
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand()
            }}
            className="w-6 h-6 rounded-full bg-white/[0.04] hover:bg-white/[0.10] text-white/35 hover:text-white/80 flex items-center justify-center transition-all cursor-pointer"
            title={isExpanded ? 'พับเก็บ' : 'คลี่ออก'}
          >
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* 2. Accordion Body */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 select-none animate-in fade-in duration-150">
          {/* 3-Phase Tactile Segmented Buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {PHASES.map((p) => {
              const isSelected = config.phase === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePhaseChange(p.id)}
                  className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 ${
                    isSelected
                      ? p.id === 'erupted'
                        ? 'bg-[#EF264C]/25 text-[#EF264C] border border-[#EF264C]/50 shadow-sm font-semibold'
                        : p.id === 'cooled_magma'
                        ? 'bg-[#c084fc]/20 text-[#c084fc] border border-[#c084fc]/40 shadow-sm font-semibold'
                        : 'bg-white/15 text-[#F1F1F1] border border-white/30 shadow-sm font-semibold'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white/80 border border-white/10'
                  }`}
                >
                  <span className="text-[12px] font-semibold tracking-tight">{p.label}</span>
                  <span className="text-[9.5px] opacity-60 font-sans">{p.sub}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
