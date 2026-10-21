import {
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import type { SpatialSpacing } from '../modules/physicalParryModule'

interface StageControllerCardProps {
  isActive: boolean
  onActivate: () => void
  isExpanded: boolean
  onToggleExpand: () => void
  spacing: SpatialSpacing
  onSpacingChange: (spacing: SpatialSpacing) => void
}

export function StageControllerCard({
  isActive,
  onActivate,
  isExpanded,
  onToggleExpand,
  spacing,
  onSpacingChange,
}: StageControllerCardProps) {
  return (
    <div
      className={`w-full rounded-[28px] transition-all select-none border backdrop-blur-2xl relative overflow-hidden ${
        isActive
          ? 'bg-white/[0.08] border-[#38bdf8]/40 shadow-[inset_0_1px_0_rgba(56,189,248,0.30),0_0_24px_rgba(56,189,248,0.12)]'
          : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] hover:border-white/15'
      }`}
    >
      {/* 1. Accordion Header Row */}
      <div 
        onClick={onToggleExpand}
        className="px-4 py-3.5 flex items-center justify-between gap-2 cursor-pointer select-none"
      >
        <div className="flex-1 flex items-baseline gap-2 text-left group min-w-0 truncate">
          <span
            className={`w-2 h-2 rounded-full shrink-0 transition-all ${
              isActive
                ? 'bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                : 'bg-white/20'
            }`}
          />
          <span className="text-[16px] sm:text-[17px] font-semibold text-[#F1F1F1] tracking-tight shrink-0">
            ขอบเขตสัมผัส
          </span>
          <span className="text-[11.5px] font-normal text-white/45 truncate">
            ระยะห่าง • สัมผัส
          </span>
        </div>

        {/* Right Header Actions: Tactile ENGAGED / BYPASS Switch + Chevron */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onActivate()
            }}
            className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 select-none ${
              isActive
                ? 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/35 shadow-[inset_0_1px_0_rgba(56,189,248,0.20)]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20'
            }`}
            title={isActive ? 'คลิกเพื่อปิด' : 'คลิกเพื่อเปิดใช้งาน'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#38bdf8]' : 'bg-white/30'}`} />
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

      {/* 2. Expandable Body Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 select-none animate-in fade-in duration-150">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-black/30 border border-white/10">
            {(['distant', 'reach', 'intimate'] as SpatialSpacing[]).map((s) => {
              const isSelected = spacing === s
              const labels: Record<SpatialSpacing, { th: string; en: string }> = {
                distant: { th: '2-3 ก้าว', en: 'Distant' },
                reach: { th: 'ช่วงแขน', en: 'Reach' },
                intimate: { th: 'แนบชิด', en: 'Intimate' },
              }

              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSpacingChange(s)}
                  className={`py-2 px-2 rounded-xl text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/[0.14] text-white shadow-sm border border-white/15 font-medium'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="text-[12.5px] sm:text-[13px] font-sans font-semibold leading-tight">
                    {labels[s].th}
                  </div>
                  <div className="text-[10px] sm:text-[10.5px] font-mono text-white/45 tracking-tight mt-0.5">
                    {labels[s].en}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

