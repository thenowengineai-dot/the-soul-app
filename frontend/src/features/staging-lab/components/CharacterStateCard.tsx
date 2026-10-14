import {
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { getBoundaryBrief } from '../modules/physicalParryModule'

interface CharacterStateCardProps {
  isActive: boolean
  onActivate: () => void
  boundaryLevel: number
  onBoundaryChange: (level: number) => void
  isExpanded: boolean
  onToggleExpand: () => void
}

export function CharacterStateCard({
  isActive,
  onActivate,
  boundaryLevel,
  onBoundaryChange,
  isExpanded,
  onToggleExpand,
}: CharacterStateCardProps) {
  const boundaryInfo = getBoundaryBrief(boundaryLevel)

  const quickPresets = [
    { label: 'เข้มงวด', value: 10, tag: 'Guarded' },
    { label: 'ลังเล', value: 50, tag: 'Hesitant' },
    { label: 'เปิดรับ', value: 90, tag: 'Receptive' },
  ]

  return (
    <div
      className={`w-[346px] rounded-[28px] transition-all select-none border backdrop-blur-2xl relative overflow-hidden ${
        isActive
          ? 'bg-white/[0.08] border-[#f59e0b]/40 shadow-[inset_0_1px_0_rgba(245,158,11,0.25),0_0_24px_rgba(245,158,11,0.08)]'
          : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] hover:border-white/15'
      }`}
    >
      {/* 1. Header Row (Upper Deck - Character State) */}
      <div 
        onClick={onToggleExpand}
        className="px-4 py-3.5 flex items-center justify-between gap-2 cursor-pointer select-none"
      >
        <div className="flex-1 flex items-center gap-2 text-left group min-w-0">
          <span
            className={`w-2 h-2 rounded-full shrink-0 transition-all ${
              isActive
                ? 'bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                : 'bg-white/20'
            }`}
          />
          <div className="flex items-baseline gap-1.5 truncate">
            <span className="text-[15px] sm:text-[15.5px] font-semibold text-[#F1F1F1] tracking-tight">
              ระดับความหวงตัว
            </span>
            <span className="text-[11px] font-normal text-white/40 truncate">
              (กำแพงจิตใจ / การเปิดรับ)
            </span>
          </div>
        </div>

        {/* Right Header: Value Pill + Tactile ENGAGED / BYPASS Switch + Chevron */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium flex items-center gap-1.5 select-none bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/35 shadow-[inset_0_1px_0_rgba(245,158,11,0.20)]"
            title="ค่าสถานะสภาวะจิตใจของตัวละคร (Single Source of Truth)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
            <span>{boundaryLevel}%</span>
          </div>

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
            title={isActive ? 'คลิกเพื่อบายพาส (Bypass)' : 'คลิกเพื่อเสียบใช้งาน (Engage)'}
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
            title={isExpanded ? 'พับเก็บแผงสภาวะ' : 'คลี่ออกดูแผงสภาวะ'}
          >
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* 2. Expandable Body Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 space-y-3.5 border-t border-white/[0.06]">
          {/* Slider Row */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-white/50 tracking-wider">
                ระดับความหวงตัว <span className="text-[9.5px] text-white/30 font-mono">(DESIRE & BOUNDARY)</span>
              </span>
              <span className="font-mono text-[#f59e0b] font-semibold">
                {boundaryInfo.stageName}
              </span>
            </div>

            <div className="px-1 py-1">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={boundaryLevel}
                onChange={(e) => onBoundaryChange(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#f59e0b]"
              />
              <div className="flex justify-between text-[9px] font-mono text-white/30 mt-1">
                <span>0% (ปิดกั้นเด็ดขาด)</span>
                <span>50%</span>
                <span>100% (ยินยอม)</span>
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-3 gap-1.5">
            {quickPresets.map((p) => {
              const isSelected = Math.abs(boundaryLevel - p.value) <= 15
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => onBoundaryChange(p.value)}
                  className={`py-1 px-2 rounded-xl text-center transition-all cursor-pointer text-[10.5px] border ${
                    isSelected
                      ? 'bg-[#f59e0b]/15 border-[#f59e0b]/40 text-[#f59e0b] font-medium'
                      : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-white/50 hover:text-white/80'
                  }`}
                >
                  <div className="leading-tight">{p.label}</div>
                  <div className="text-[9px] opacity-60 font-mono">{p.value}%</div>
                </button>
              )
            })}
          </div>

          {/* Somatic Psychology Brief */}
          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-0.5">
            <div className="text-[10px] text-white/40 uppercase font-mono tracking-wider">
              สภาวะผัสสะและเจตจำนงภายใน:
            </div>
            <p className="text-[11px] text-white/75 leading-relaxed font-sans">
              {boundaryInfo.brief}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

