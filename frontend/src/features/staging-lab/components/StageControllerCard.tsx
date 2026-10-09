
import {
  ArrowLeft,
  RotateCcw,
  Zap,
  Target,
  Server,
  Layers
} from 'lucide-react'
import type { SpatialSpacing } from '../modules/physicalParryModule'
import { getBoundaryBrief } from '../modules/physicalParryModule'

interface StageControllerCardProps {
  spacing: SpatialSpacing
  onSpacingChange: (spacing: SpatialSpacing) => void
  boundaryLevel: number
  onBoundaryChange: (level: number) => void
  isParryEnabled: boolean
  onToggleParry: () => void
  thinkingBudget: number
  onThinkingBudgetChange: (budget: number) => void
  serverTarget: 'local' | 'cloud'
  onServerTargetChange: (target: 'local' | 'cloud') => void
  isLoading: boolean
  elapsedSeconds: number
  onSimulate: () => void
  onApplyPreset: (spacing: SpatialSpacing, boundary: number, input: string) => void
  onBackToHome: () => void
  onOpenPromptInspector?: () => void
}

export function StageControllerCard({
  spacing,
  onSpacingChange,
  boundaryLevel,
  onBoundaryChange,
  isParryEnabled,
  onToggleParry,
  thinkingBudget,
  onThinkingBudgetChange,
  serverTarget,
  onServerTargetChange,
  isLoading,
  elapsedSeconds,
  onSimulate,
  onApplyPreset,
  onBackToHome,
  onOpenPromptInspector,
}: StageControllerCardProps) {
  const boundaryInfo = getBoundaryBrief(boundaryLevel)

  return (
    <div
      className="w-[346px] rounded-[28px] p-5 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all flex flex-col justify-between relative select-none"
      style={{ minHeight: '620px' }}
    >
      {/* 1. Header Row (Apple Bento Plaque Style) */}
      <div className="flex items-center justify-between shrink-0 mb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToHome}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] active:scale-95"
            title="กลับหน้าหลัก"
          >
            <ArrowLeft size={14} strokeWidth={2.2} />
          </button>
          <div>
            <h2 className="text-[17.5px] font-semibold text-[#F1F1F1] tracking-tight leading-none">
              Stage Controller
            </h2>
            <p className="text-[11.5px] font-normal text-white/40 mt-1">
              Physical Arbiter & Staging Setup
            </p>
          </div>
        </div>

        {onOpenPromptInspector && (
          <button
            type="button"
            onClick={onOpenPromptInspector}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] active:scale-95"
            title="ตรวจสอบ Prompt จริง"
          >
            <Layers size={13} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* 2. Middle Body: Apple Tactile Widget Controls */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar py-1">
        {/* Widget A: Quick Matrix Presets */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-medium text-white/50 tracking-wider uppercase">
              Quick Matrix Presets
            </span>
            <Target size={12} className="text-white/40" />
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => onApplyPreset('reach', 10, '(ฉันเอื้อมมือจะเข้าไปจับหน้าอกเธอ)')}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] text-white/80 hover:text-white text-left transition-all active:scale-98"
            >
              <div className="font-medium text-[#F1F1F1]">Pre-Contact Parry</div>
              <div className="text-[9.5px] text-white/40">Reach / 10% Guard</div>
            </button>

            <button
              type="button"
              onClick={() => onApplyPreset('distant', 0, '(ฉันเอื้อมมือไปคว้าข้อมือเธอไว้แน่น)')}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] text-white/80 hover:text-white text-left transition-all active:scale-98"
            >
              <div className="font-medium text-[#F1F1F1]">Whiff Trajectory</div>
              <div className="text-[9.5px] text-white/40">Distant / 0% Guard</div>
            </button>

            <button
              type="button"
              onClick={() => onApplyPreset('reach', 20, '(ฉันก้าวเข้าไปคว้าข้อมือเธอไว้แน่น)')}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] text-white/80 hover:text-white text-left transition-all active:scale-98"
            >
              <div className="font-medium text-[#F1F1F1]">Wrist Break</div>
              <div className="text-[9.5px] text-white/40">Reach / 20% Guard</div>
            </button>

            <button
              type="button"
              onClick={() => onApplyPreset('intimate', 85, '(ฉันดึงตัวเธอเข้ามากอดแนบแน่น)')}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] text-white/80 hover:text-white text-left transition-all active:scale-98"
            >
              <div className="font-medium text-[#F1F1F1]">Yielding Intimacy</div>
              <div className="text-[9.5px] text-white/40">Intimate / 85% Guard</div>
            </button>
          </div>
        </div>

        {/* Widget B: Spatial Distance (Segmented Switcher) */}
        <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-medium text-white/50 tracking-wider uppercase">
              Spatial Distance
            </span>
            <span className="text-[10px] font-mono text-white/40 uppercase">
              {spacing}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black/30 border border-white/[0.08]">
            {(['distant', 'reach', 'intimate'] as SpatialSpacing[]).map((s) => {
              const labels: Record<SpatialSpacing, { th: string; en: string }> = {
                distant: { th: 'ห่าง 2 ก้าว', en: 'Distant' },
                reach: { th: '1 ช่วงแขน', en: 'Reach' },
                intimate: { th: 'ประชิดตัว', en: 'Intimate' },
              }
              const isSelected = spacing === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSpacingChange(s)}
                  className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/10 text-white font-medium border border-white/15 shadow-sm'
                      : 'text-white/45 hover:text-white/80'
                  }`}
                >
                  <div className="text-[11px] leading-tight">{labels[s].th}</div>
                  <div className="text-[9px] opacity-60">{labels[s].en}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Widget C: Poise / Psychological Boundary Equalizer */}
        <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-medium text-white/50 tracking-wider uppercase">
              Psychological Boundary
            </span>
            <span className="text-[10.5px] font-mono text-emerald-400 font-semibold">
              {boundaryLevel}%
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-white/60 px-0.5">
            <span className="text-[10.5px] text-white/80 font-medium">
              {boundaryInfo.stageName}
            </span>
            <button
              type="button"
              onClick={onToggleParry}
              className={`text-[9.5px] px-2 py-0.5 rounded-full border transition-all ${
                isParryEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/5 border-white/10 text-white/40'
              }`}
            >
              {isParryEnabled ? 'Arbiter Active' : 'Arbiter Off'}
            </button>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            value={boundaryLevel}
            onChange={(e) => onBoundaryChange(Number(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#EF264C]"
          />
        </div>

        {/* Widget D: Thinking Budget Selector */}
        <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-medium text-white/50 tracking-wider uppercase">
              Thinking Speed
            </span>
            <span className="text-[10px] font-mono text-white/40">
              {thinkingBudget} tokens
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1 p-0.5 rounded-xl bg-black/30 border border-white/[0.08]">
            {[
              { label: 'Off', val: 0 },
              { label: 'Fast', val: 128 },
              { label: 'Low', val: 256 },
              { label: 'Med', val: 1024 },
            ].map((item) => {
              const isSelected = thinkingBudget === item.val
              return (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => onThinkingBudgetChange(item.val)}
                  className={`py-1 rounded-lg text-[10.5px] font-medium transition-all ${
                    isSelected
                      ? 'bg-white/15 text-white shadow-sm border border-white/10'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Widget E: Server Target Switcher */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10.5px]">
          <div className="flex items-center gap-1.5 text-white/50">
            <Server size={12} />
            <span className="uppercase tracking-wider">Gateway</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onServerTargetChange('local')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                serverTarget === 'local'
                  ? 'bg-white/15 text-white border border-white/15'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              Local 8000
            </button>
            <button
              type="button"
              onClick={() => onServerTargetChange('cloud')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                serverTarget === 'cloud'
                  ? 'bg-white/15 text-white border border-white/15'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              Cloud Run
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bottom Execution Bar: Tactile Carmine Simulate Action */}
      <div className="pt-3 border-t border-white/[0.08] shrink-0">
        <button
          type="button"
          onClick={onSimulate}
          disabled={isLoading}
          className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-medium text-[13px] transition-all cursor-pointer shadow-[0_2px_12px_rgba(239,38,76,0.25)] ${
            isLoading
              ? 'bg-white/10 text-white/40 cursor-not-allowed'
              : 'bg-[#EF264C] hover:bg-[#d91d40] text-white active:scale-98'
          }`}
        >
          {isLoading ? (
            <>
              <RotateCcw size={14} className="animate-spin" />
              <span>Simulating... ({elapsedSeconds}s)</span>
            </>
          ) : (
            <>
              <Zap size={14} fill="currentColor" />
              <span>Simulate Current State</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default StageControllerCard
