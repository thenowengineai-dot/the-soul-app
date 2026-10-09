
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
      className="w-[346px] rounded-[28px] p-5 bg-white/[0.06] hover:bg-white/[0.08] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all flex flex-col justify-between relative select-none"
      style={{ minHeight: '620px' }}
    >
      {/* 1. Header Row (Apple Bento Plaque Style) */}
      <div className="flex items-center justify-between shrink-0 mb-4">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBackToHome}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] active:scale-95"
            title="กลับหน้าหลัก"
          >
            <ArrowLeft size={14} strokeWidth={2.2} />
          </button>
          <div>
            <h2 className="text-[17px] font-semibold text-[#F1F1F1] tracking-tight leading-none">
              แผงควบคุมเวที
            </h2>
            <p className="text-[11px] font-normal text-white/40 mt-1">
              ระบบเวทีจำลอง (Stage Controller)
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
            <span className="text-[11px] font-medium text-white/50 tracking-wider">
              ชุดสภาวะจำลองด่วน <span className="text-[9.5px] text-white/30 font-mono">(PRESETS)</span>
            </span>
            <Target size={12} className="text-white/40" />
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => onApplyPreset('reach', 10, '(ฉันเอื้อมมือจะเข้าไปจับหน้าอกเธอ)')}
              className="p-2.5 rounded-2xl bg-black/30 hover:bg-white/[0.08] border border-white/10 text-white/80 hover:text-white text-left transition-all active:scale-98"
            >
              <div className="font-medium text-[#F1F1F1] text-[11.5px]">สกัดกั้นก่อนถึงตัว (Parry)</div>
              <div className="text-[9.5px] text-white/40 mt-0.5">1 ช่วงแขน · กำแพง 10%</div>
            </button>

            <button
              type="button"
              onClick={() => onApplyPreset('distant', 0, '(ฉันเอื้อมมือไปคว้าข้อมือเธอไว้แน่น)')}
              className="p-2.5 rounded-2xl bg-black/30 hover:bg-white/[0.08] border border-white/10 text-white/80 hover:text-white text-left transition-all active:scale-98"
            >
              <div className="font-medium text-[#F1F1F1] text-[11.5px]">วืดกลางอากาศ (Whiff)</div>
              <div className="text-[9.5px] text-white/40 mt-0.5">ห่าง 2 ก้าว · กำแพง 0%</div>
            </button>

            <button
              type="button"
              onClick={() => onApplyPreset('reach', 20, '(ฉันก้าวเข้าไปคว้าข้อมือเธอไว้แน่น)')}
              className="p-2.5 rounded-2xl bg-black/30 hover:bg-white/[0.08] border border-white/10 text-white/80 hover:text-white text-left transition-all active:scale-98"
            >
              <div className="font-medium text-[#F1F1F1] text-[11.5px]">สะบัดข้อมือหลุด (Break)</div>
              <div className="text-[9.5px] text-white/40 mt-0.5">1 ช่วงแขน · กำแพง 20%</div>
            </button>

            <button
              type="button"
              onClick={() => onApplyPreset('intimate', 85, '(ฉันดึงตัวเธอเข้ามากอดแนบแน่น)')}
              className="p-2.5 rounded-2xl bg-black/30 hover:bg-white/[0.08] border border-white/10 text-white/80 hover:text-white text-left transition-all active:scale-98"
            >
              <div className="font-medium text-[#F1F1F1] text-[11.5px]">เกราะสลายยินยอม (Yield)</div>
              <div className="text-[9.5px] text-white/40 mt-0.5">ประชิดตัว · สลายเกราะ 85%</div>
            </button>
          </div>
        </div>

        {/* Widget B: Spatial Distance (Segmented Switcher) */}
        <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
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
                  className={`py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/15 text-white font-medium border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]'
                      : 'text-white/45 hover:text-white/80'
                  }`}
                >
                  <div className="text-[11px] leading-tight">{labels[s].th}</div>
                  <div className="text-[9px] opacity-60 font-mono">{labels[s].en}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Widget C: Poise / Psychological Boundary Equalizer */}
        <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-white/50 tracking-wider">
              กำแพงจิตใจและสติ <span className="text-[9.5px] text-white/30 font-mono">(BOUNDARY)</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
              ระดับ {boundaryLevel}%
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-black/30 border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-medium text-[#F1F1F1]">
                {boundaryInfo.stageName}
              </span>
              <button
                type="button"
                onClick={onToggleParry}
                className={`text-[9.5px] px-2 py-0.5 rounded-full border transition-all ${
                  isParryEnabled
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-white/40'
                }`}
              >
                {isParryEnabled ? 'ระบบสกัดกั้นทำงาน' : 'ปิดระบบสกัดกั้น'}
              </button>
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed">
              {boundaryInfo.brief}
            </p>
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
            <span className="text-[11px] font-medium text-white/50 tracking-wider">
              ความเร็วการคิด <span className="text-[9.5px] text-white/30 font-mono">(THINKING)</span>
            </span>
            <span className="text-[10px] font-mono text-white/40">
              {thinkingBudget} โทเค็น
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-black/30 border border-white/10">
            {[
              { label: 'ปิด (0)', val: 0 },
              { label: 'ด่วน', val: 128 },
              { label: 'สั้น', val: 256 },
              { label: 'ลึก', val: 1024 },
            ].map((item) => {
              const isSelected = thinkingBudget === item.val
              return (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => onThinkingBudgetChange(item.val)}
                  className={`py-1 rounded-xl text-[10.5px] font-medium transition-all ${
                    isSelected
                      ? 'bg-white/15 text-white shadow-sm border border-white/20'
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
            <span className="tracking-wider">เกตเวย์ <span className="text-[9.5px] font-mono opacity-60">(GATEWAY)</span></span>
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
              โลคอล (8000)
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
              คลาวด์รัน (Cloud)
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
              <span>กำลังประมวลผล... ({elapsedSeconds}s)</span>
            </>
          ) : (
            <>
              <Zap size={14} fill="currentColor" />
              <span>จำลองสภาวะปัจจุบัน (Simulate Turn)</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default StageControllerCard
