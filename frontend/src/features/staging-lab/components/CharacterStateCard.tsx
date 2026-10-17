import {
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import type { RelationshipStage } from '../modules/relationshipModule'

interface CharacterStateCardProps {
  isActive: boolean
  onActivate: () => void
  boundaryLevel: number
  onBoundaryChange: (level: number) => void
  isExpanded: boolean
  onToggleExpand: () => void
  relationshipStage?: RelationshipStage
  isRelationshipActive?: boolean
}

export function CharacterStateCard({
  isActive,
  onActivate,
  boundaryLevel,
  onBoundaryChange,
  isExpanded,
  onToggleExpand,
}: CharacterStateCardProps) {
  const quickPresets = [
    { label: 'สติครบ', sub: 'เยือกเย็น', value: 10 },
    { label: 'ใจเต้นรัว', sub: 'หวั่นไหว', value: 50 },
    { label: 'เร่าร้อน', sub: 'ไวสัมผัส', value: 90 },
  ]

  return (
    <div
      className={`w-full rounded-[28px] transition-all select-none border backdrop-blur-2xl relative overflow-hidden ${
        isActive
          ? 'bg-white/[0.08] border-[#f59e0b]/40 shadow-[inset_0_1px_0_rgba(245,158,11,0.25),0_0_24px_rgba(245,158,11,0.08)]'
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
                ? 'bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                : 'bg-white/20'
            }`}
          />
          <span className="text-[15px] sm:text-[15.5px] font-semibold text-[#F1F1F1] tracking-tight shrink-0">
            ไฟปรารถนา
          </span>
          <span className="text-[11px] font-normal text-white/40 truncate">
            อุณหภูมิร่างกาย • เหงื่อ • หัวใจ
          </span>
        </div>

        {/* Right Header: Tactile ENGAGED / BYPASS Switch + Chevron */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onActivate()
            }}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 select-none ${
              isActive
                ? 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/35 shadow-[inset_0_1px_0_rgba(245,158,11,0.20)]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20'
            }`}
            title={isActive ? 'คลิกเพื่อปิด' : 'คลิกเพื่อเปิดใช้งาน'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#f59e0b]' : 'bg-white/30'}`} />
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
        <div className="px-4 pb-4 pt-1 space-y-2.5 select-none animate-in fade-in duration-150">
          {/* Quick Preset Segmented Control */}
          <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-black/30 border border-white/10">
            {quickPresets.map((p) => {
              const isSelected = Math.abs(boundaryLevel - p.value) <= 15
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => onBoundaryChange(p.value)}
                  className={`py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/[0.14] text-[#f59e0b] shadow-sm border border-[#f59e0b]/30 font-medium'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="text-[11px] font-sans font-medium leading-tight">{p.label}</div>
                  <div className="text-[9px] font-sans text-white/40 tracking-tight mt-0.5">{p.sub}</div>
                </button>
              )
            })}
          </div>

          {/* Clean Tactile Slider with Live Percentage */}
          <div className="px-2 py-1.5 rounded-2xl bg-black/20 border border-white/[0.05] flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={boundaryLevel}
              onChange={(e) => onBoundaryChange(Number(e.target.value))}
              className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#f59e0b]"
            />
            <span className="font-mono text-[11px] text-[#f59e0b] font-medium w-8 text-right shrink-0">
              {boundaryLevel}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

