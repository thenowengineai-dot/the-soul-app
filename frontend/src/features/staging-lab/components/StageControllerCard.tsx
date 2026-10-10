import {
  RotateCcw,
  Zap,
  Shield,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import type { SpatialSpacing } from '../modules/physicalParryModule'
import { getBoundaryBrief } from '../modules/physicalParryModule'

interface StageControllerCardProps {
  isActive: boolean
  onActivate: () => void
  isExpanded: boolean
  onToggleExpand: () => void
  spacing: SpatialSpacing
  onSpacingChange: (spacing: SpatialSpacing) => void
  boundaryLevel: number
  onBoundaryChange: (level: number) => void
  isLoading: boolean
  elapsedSeconds: number
  onSimulate: () => void
}

export function StageControllerCard({
  isActive,
  onActivate,
  isExpanded,
  onToggleExpand,
  spacing,
  onSpacingChange,
  boundaryLevel,
  onBoundaryChange,
  isLoading,
  elapsedSeconds,
  onSimulate,
}: StageControllerCardProps) {
  const boundaryInfo = getBoundaryBrief(boundaryLevel)

  return (
    <div
      className={`w-[346px] rounded-[24px] transition-all select-none border backdrop-blur-2xl ${
        isActive
          ? 'bg-white/[0.07] border-[#38bdf8]/40 shadow-[0_0_24px_rgba(56,189,248,0.10)]'
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
                ? 'bg-[#38bdf8]/15 border-[#38bdf8]/40 text-[#38bdf8]'
                : 'bg-white/[0.05] border-white/10 text-white/50 group-hover:text-white/80'
            }`}
          >
            <Shield size={14} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/10 text-[#38bdf8] font-bold">
                การ์ดที่ 1
              </span>
              <h2 className="text-[14.5px] font-semibold text-[#F1F1F1] tracking-tight leading-none">
                ขอบเขตสัมผัส
              </h2>
            </div>
            <p className="text-[10.5px] font-normal text-white/40 mt-1">
              Physical Boundary & Parry
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
                ? 'bg-[#38bdf8]/20 text-[#bae6fd] border-[#38bdf8]/50 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                : 'bg-white/[0.04] text-white/40 border-white/10 hover:text-white/70 hover:bg-white/[0.08]'
            }`}
            title={isActive ? 'การ์ดนี้กำลังถูกทดสอบ' : 'คลิกเพื่อเลือกทดสอบการ์ดนี้'}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive ? 'bg-[#38bdf8] animate-pulse' : 'bg-white/30'
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
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-white/[0.06]">
          {/* Widget A: Spatial Distance (Segmented Switcher) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-white/50 tracking-wider">
                ระยะห่างทางกายภาพ <span className="text-[9.5px] text-white/30 font-mono">(SPACING)</span>
              </span>
              <span className="text-[10px] font-mono text-white/40 uppercase">
                {spacing}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-black/30 border border-white/10">
              {(['distant', 'reach', 'intimate'] as SpatialSpacing[]).map((s) => {
                const isSelected = spacing === s
                const labels: Record<SpatialSpacing, { th: string; sub: string }> = {
                  distant: { th: '2-3 ก้าว', sub: 'Distant' },
                  reach: { th: 'ช่วงแขน', sub: 'Reach' },
                  intimate: { th: 'แนบชิด', sub: 'Intimate' },
                }

                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onSpacingChange(s)}
                    className={`py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white/[0.14] text-white shadow-sm border border-white/10 font-medium'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="text-[11px] leading-tight font-medium">{labels[s].th}</div>
                    <div className="text-[9px] text-white/40 uppercase tracking-tighter mt-0.5">
                      {labels[s].sub}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Widget B: Physical Boundary Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-white/50 tracking-wider">
                ระดับการหวงตัว <span className="text-[9.5px] text-white/30 font-mono">(BOUNDARY)</span>
              </span>
              <span className="text-[11.5px] font-mono font-medium text-[#F1F1F1]">
                {boundaryLevel}%
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
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#38bdf8]"
              />
              <div className="flex justify-between text-[9px] font-mono text-white/30 mt-1">
                <span>0% (หวงตัวเด็ดขาด)</span>
                <span>50%</span>
                <span>100% (ยินยอม)</span>
              </div>
            </div>
          </div>

          {/* Widget C: Active Posture Badge */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <div className="flex items-center justify-between text-[10.5px]">
              <span className="font-medium text-white/70">สภาวะจิตใจและผัสสะ:</span>
              <span className="font-mono text-[10px] text-[#38bdf8] font-bold">
                {boundaryInfo.stageName}
              </span>
            </div>
            <p className="text-[11px] text-white/80 leading-relaxed font-sans">
              {boundaryInfo.brief}
            </p>
          </div>

          {/* Widget D: Action CTA (รันเฉพาะการ์ด 1) */}
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
                <span>กำลังจำลองขอบเขต... ({elapsedSeconds.toFixed(1)}s)</span>
              </>
            ) : (
              <>
                <Zap size={13} fill="currentColor" />
                <span>รันจำลองการ์ดที่ 1</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
