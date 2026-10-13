import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  ArrowDownToLine,
  Play
} from 'lucide-react'
import {
  KINETIC_SCENARIOS,
  type KineticScenario,
  type ChoreographyCue
} from '../modules/kineticContinuityModule'

interface KineticContinuityCardProps {
  isActive: boolean
  onActivate: () => void
  isExpanded: boolean
  onToggleExpand: () => void
  initialPosture: string
  currentPosture: string
  onOriginPostureChange: (posture: string) => void
  onResetPosture?: () => void
  onSelectVelocityAction?: (actionText: string) => void
  onPreFillAction?: (actionText: string) => void
}

export function KineticContinuityCard({
  isActive,
  onActivate,
  isExpanded,
  onToggleExpand,
  initialPosture,
  currentPosture,
  onOriginPostureChange,
  onResetPosture,
  onSelectVelocityAction,
  onPreFillAction,
}: KineticContinuityCardProps) {
  const [isCustomMode, setIsCustomMode] = useState(false)

  // Find active scenario by matching initialPosture snapshot, or default to first
  const activeScenario =
    KINETIC_SCENARIOS.find(
      (s) => s.stance.trim() === initialPosture.trim()
    ) || KINETIC_SCENARIOS[0]

  const handleSelectScenario = (scenario: KineticScenario) => {
    setIsCustomMode(false)
    onOriginPostureChange(scenario.stance)
    if (onResetPosture) {
      onResetPosture()
    }
  }

  const handlePreFill = (actionText: string) => {
    if (onPreFillAction) {
      onPreFillAction(actionText)
    } else if (onSelectVelocityAction) {
      onSelectVelocityAction(actionText)
    }
  }

  const handleQuickRun = (e: React.MouseEvent, actionText: string) => {
    e.stopPropagation()
    if (onSelectVelocityAction) {
      onSelectVelocityAction(actionText)
    }
  }

  const isEvolved = currentPosture.trim() !== initialPosture.trim()

  return (
    <div
      className={`w-[346px] rounded-[28px] transition-all select-none border backdrop-blur-2xl relative overflow-hidden ${
        isActive
          ? 'bg-white/[0.08] border-[#34d399]/40 shadow-[inset_0_1px_0_rgba(52,211,153,0.30),0_0_24px_rgba(52,211,153,0.12)]'
          : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] hover:border-white/15'
      }`}
    >
      {/* 1. Accordion Header Row (The Effect Rack / Pedalboard Style) */}
      <div 
        onClick={onToggleExpand}
        className="px-4 py-3.5 flex items-center justify-between gap-2 cursor-pointer select-none"
      >
        <div className="flex-1 flex items-center gap-2 text-left group min-w-0">
          <span
            className={`w-2 h-2 rounded-full shrink-0 transition-all ${
              isActive
                ? 'bg-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : 'bg-white/20'
            }`}
          />
          <div className="flex items-baseline gap-1.5 truncate">
            <span className="text-[15px] sm:text-[15.5px] font-semibold text-[#F1F1F1] tracking-tight">
              ท่วงท่าต่อเนื่อง
            </span>
            <span className="text-[11px] font-normal text-white/40 truncate">
              (สรีระและจังหวะ)
            </span>
          </div>
        </div>

        {/* Right Header Actions: Tactile ENGAGED / BYPASS Switch + Chevron */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onActivate()
            }}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 select-none ${
              isActive
                ? 'bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/35 shadow-[inset_0_1px_0_rgba(52,211,153,0.20)]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20'
            }`}
            title={isActive ? 'คลิกเพื่อบายพาส (Bypass)' : 'คลิกเพื่อเสียบใช้งาน (Engage)'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#34d399]' : 'bg-white/30'}`} />
            <span>{isActive ? 'ENGAGED' : 'BYPASS'}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand()
            }}
            className="w-6 h-6 rounded-full bg-white/[0.04] hover:bg-white/[0.10] text-white/35 hover:text-white/80 flex items-center justify-center transition-all cursor-pointer"
            title={isExpanded ? 'พับเก็บการ์ด' : 'คลี่ออกดูการ์ด'}
          >
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* 2. Expandable Body Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 space-y-3.5 border-t border-white/[0.06]">
          {/* Section 1: Scenario Selector Pills */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-white/60">
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#34d399]" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">
                  สถานการณ์จำลอง (SCENARIO)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomMode(!isCustomMode)}
                className="text-[9.5px] text-white/40 hover:text-white/80 transition-colors cursor-pointer font-mono"
              >
                {isCustomMode ? 'ใช้ 3 ฉากหลัก' : 'กำหนดเอง'}
              </button>
            </div>

            {!isCustomMode ? (
              <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-black/30 border border-white/10">
                {KINETIC_SCENARIOS.map((s) => {
                  const isSelected = activeScenario.id === s.id
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectScenario(s)}
                      className={`py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/40 shadow-sm font-medium'
                          : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="text-[11px] font-medium tracking-tight">
                        {s.shortLabel}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div>
                <textarea
                  value={initialPosture}
                  onChange={(e) => onOriginPostureChange(e.target.value)}
                  placeholder="พิมพ์ช็อตภาพนิ่งสรีระ เช่น 'ยืนหันข้างกอดอกแน่น ปลายเล็บจิกแขนเสื้อตัวเอง'"
                  rows={2}
                  className="w-full text-[11px] p-2.5 rounded-2xl bg-black/30 border border-white/10 text-[#F1F1F1] placeholder-white/20 focus:outline-none focus:border-white/30 resize-none leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* Section 2: Live Silhouette Scoreboard (Single Active Slot) */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isEvolved
                      ? 'bg-[#34d399] animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                      : 'bg-[#34d399]/60'
                  }`}
                />
                <span className="text-[#34d399] font-semibold uppercase tracking-wider">
                  {isEvolved ? 'LIVE SILHOUETTE (เทิร์น 2+)' : 'LIVE SILHOUETTE (ท่าตั้งต้น)'}
                </span>
              </div>

              {/* Permanent Reset Button (↺ รีเซ็ตสรีระ) */}
              {onResetPosture && (
                <button
                  type="button"
                  onClick={onResetPosture}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] text-white/60 hover:text-white transition-all cursor-pointer border border-white/10 hover:border-white/20 text-[9.5px] font-mono active:scale-95"
                  title="รีเซ็ตสรีระกลับสู่ท่าตั้งต้นของฉาก"
                >
                  <RotateCcw size={10} />
                  <span>รีเซ็ต</span>
                </button>
              )}
            </div>

            <div className="text-[11.5px] text-[#F1F1F1] font-sans leading-relaxed bg-black/25 p-2.5 rounded-xl border border-white/[0.06]">
              "{currentPosture}"
            </div>

            {isEvolved && (
              <div className="text-[9.5px] text-white/40 font-mono truncate pt-0.5">
                ออกตัวจาก: "{initialPosture}"
              </div>
            )}
          </div>

          {/* Section 3: Choreography Cues (Scene Director Guidance) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-white/50 px-0.5">
              <span className="uppercase tracking-wider">
                ไกด์การเคลื่อนไหว 3 จังหวะ
              </span>
              <span className="text-white/35 text-[9px]">
                แตะเพื่อหยอดลงแชท
              </span>
            </div>

            <div className="space-y-1.5">
              {activeScenario.cues.map((cue: ChoreographyCue) => (
                <div
                  key={cue.step}
                  onClick={() => handlePreFill(cue.actionText)}
                  className="group p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#34d399]/30 transition-all cursor-pointer text-left select-none"
                  title="คลิกเพื่อหยอดข้อความนี้ลงในช่องแชท"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-4 h-4 rounded-full bg-white/[0.06] text-white/60 text-[9px] font-mono font-semibold flex items-center justify-center shrink-0">
                        {cue.step}
                      </span>
                      <span className="text-[10.5px] font-medium text-white/80 group-hover:text-white truncate">
                        {cue.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-mono text-white/60 flex items-center gap-0.5 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/10">
                        <ArrowDownToLine size={9} />
                        <span>หยอด</span>
                      </span>
                      {onSelectVelocityAction && (
                        <button
                          type="button"
                          onClick={(e) => handleQuickRun(e, cue.actionText)}
                          className="p-1 rounded bg-[#34d399]/15 hover:bg-[#34d399]/30 text-[#34d399] transition-all cursor-pointer"
                          title="ส่งทดสอบทันที"
                        >
                          <Play size={9} fill="currentColor" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-[10px] text-white/55 group-hover:text-white/90 line-clamp-1 italic">
                    {cue.actionText}
                  </div>
                  <div className="text-[9px] text-[#34d399]/70 group-hover:text-[#34d399] line-clamp-1 mt-0.5">
                    {cue.intent}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
