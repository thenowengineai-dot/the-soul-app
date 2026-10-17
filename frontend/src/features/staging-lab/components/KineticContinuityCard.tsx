import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
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
  // Find active scenario by matching initialPosture snapshot, or default to first
  const activeScenario =
    KINETIC_SCENARIOS.find(
      (s) => s.stance.trim() === initialPosture.trim()
    ) || KINETIC_SCENARIOS[0]

  const handleSelectScenario = (scenario: KineticScenario) => {
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
      className={`w-full rounded-[28px] transition-all select-none border backdrop-blur-2xl relative overflow-hidden ${
        isActive
          ? 'bg-white/[0.08] border-[#34d399]/40 shadow-[inset_0_1px_0_rgba(52,211,153,0.30),0_0_24px_rgba(52,211,153,0.12)]'
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
                ? 'bg-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : 'bg-white/20'
            }`}
          />
          <span className="text-[15px] sm:text-[15.5px] font-semibold text-[#F1F1F1] tracking-tight">
            ท่วงท่าต่อเนื่อง
          </span>
        </div>

        {/* Right Header Actions: Reset Button + Tactile ENGAGED / BYPASS Switch + Chevron */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onResetPosture && isEvolved && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onResetPosture()
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] text-white/60 hover:text-white transition-all cursor-pointer border border-white/10 text-[9.5px] font-sans active:scale-95"
              title="รีเซ็ตกลับสู่ท่าเริ่มต้น"
            >
              <RotateCcw size={9} />
              <span>รีเซ็ต</span>
            </button>
          )}

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
            title={isActive ? 'คลิกเพื่อปิด' : 'คลิกเพื่อเปิดใช้งาน'}
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
            title={isExpanded ? 'พับเก็บ' : 'คลี่ออก'}
          >
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* 2. Expandable Body Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 space-y-2.5 select-none animate-in fade-in duration-150">
          {/* Segmented Preset Switcher (3 Main Scenarios) */}
          <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-black/30 border border-white/10">
            {KINETIC_SCENARIOS.map((s) => {
              const isSelected = activeScenario.id === s.id && !isEvolved

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectScenario(s)}
                  className={`py-2 px-2 rounded-xl text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/[0.14] text-white shadow-sm border border-white/15 font-medium'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="text-[11px] font-sans font-medium">
                    {s.shortLabel}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Streamlined Choreography Cues (01, 02, 03 style) */}
          <div className="space-y-1.5 pt-0.5">
            {activeScenario.cues.map((cue: ChoreographyCue) => (
              <div
                key={cue.step}
                onClick={() => handlePreFill(cue.actionText)}
                className="group p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#34d399]/30 transition-all cursor-pointer flex items-center justify-between gap-2 text-left"
                title="คลิกเพื่อหยอดข้อความนี้ลงในช่องแชท"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="px-1.5 py-0.5 rounded-md bg-white/[0.06] text-white/50 text-[9.5px] font-mono shrink-0">
                    0{cue.step}
                  </span>
                  <span className="text-[11px] text-white/75 group-hover:text-white truncate font-sans">
                    {cue.actionText.replace(/^\*|\*$/g, '')}
                  </span>
                </div>

                {onSelectVelocityAction && (
                  <button
                    type="button"
                    onClick={(e) => handleQuickRun(e, cue.actionText)}
                    className="w-5 h-5 rounded-full bg-white/[0.04] hover:bg-[#34d399]/20 text-white/40 hover:text-[#34d399] flex items-center justify-center transition-all cursor-pointer shrink-0 opacity-40 group-hover:opacity-100"
                    title="ส่งเข้าแชททันที"
                  >
                    <Play size={9} fill="currentColor" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
