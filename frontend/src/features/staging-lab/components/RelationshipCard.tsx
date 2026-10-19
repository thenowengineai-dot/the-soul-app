import {
  ChevronDown,
  ChevronUp,
  KeyRound,
  Lock,
  Flame,
  Wine
} from 'lucide-react'
import {
  type RelationshipConfig,
  type RelationshipStage,
  RELATIONSHIP_STAGES,
  getRelationshipStageMeta
} from '../modules/relationshipModule'

interface RelationshipCardProps {
  isActive: boolean
  onActivate: () => void
  config: RelationshipConfig
  onChange: (next: RelationshipConfig) => void
  isExpanded: boolean
  onToggleExpand: () => void
}

export function RelationshipCard({
  isActive,
  onActivate,
  config,
  onChange,
  isExpanded,
  onToggleExpand,
}: RelationshipCardProps) {
  const currentMeta = getRelationshipStageMeta(config.stage)

  const handleStageSelect = (nextStage: RelationshipStage) => {
    const nextMeta = getRelationshipStageMeta(nextStage)
    if (!nextMeta.allowsImprints) {
      // Natural rule: Stranger cannot have special imprints yet
      onChange({
        stage: nextStage,
        nightFriction: false,
        softSpot: false,
      })
      return
    }

    if (nextMeta.requiresSoftSpot) {
      // Natural rule: Deep Bond ("คนของใจ") always includes The Soft Spot and clears Night Friction
      onChange({
        ...config,
        stage: nextStage,
        nightFriction: false,
        softSpot: true,
      })
      return
    }

    onChange({
      ...config,
      stage: nextStage,
    })
  }

  const handleToggleNightFriction = () => {
    if (config.stage === 'stranger') {
      onChange({
        ...config,
        stage: 'familiar',
        nightFriction: true,
      })
      return
    }
    if (config.stage === 'deep_bond') {
      onChange({
        ...config,
        stage: 'special',
        nightFriction: true,
      })
      return
    }
    onChange({
      ...config,
      nightFriction: !config.nightFriction,
    })
  }

  const handleToggleSoftSpot = () => {
    if (config.stage === 'stranger') {
      onChange({
        ...config,
        stage: 'familiar',
        softSpot: true,
      })
      return
    }
    if (config.stage === 'deep_bond') {
      return
    }
    onChange({
      ...config,
      softSpot: !config.softSpot,
    })
  }

  const isSoftSpotEffective =
    currentMeta.allowsImprints && (config.softSpot || Boolean(currentMeta.requiresSoftSpot))
  const isNightFrictionEffective =
    currentMeta.allowsImprints && !currentMeta.requiresSoftSpot && config.nightFriction

  return (
    <div
      className={`w-full rounded-[28px] transition-all select-none border backdrop-blur-2xl relative overflow-hidden ${
        isActive
          ? 'bg-white/[0.08] border-[#f472b6]/40 shadow-[inset_0_1px_0_rgba(244,114,182,0.22)]'
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
              isActive ? 'bg-[#f472b6]' : 'bg-white/20'
            }`}
          />
          <span className="text-[15px] sm:text-[15.5px] font-semibold text-[#F1F1F1] tracking-tight shrink-0">
            ความสัมพันธ์
          </span>
          <span className="text-[11px] font-normal text-white/40 truncate">
            สมอง • คำพูด • ศักดิ์ศรี
          </span>
        </div>

        {/* Right Header: Tactile ENGAGED/BYPASS Switch + Chevron */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onActivate()
            }}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 select-none ${
              isActive
                ? 'bg-[#f472b6]/15 text-[#f472b6] border border-[#f472b6]/35'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20'
            }`}
            title={isActive ? 'คลิกเพื่อปิด' : 'คลิกเพื่อเปิดใช้งาน'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#f472b6]' : 'bg-white/30'}`} />
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
        <div className="px-4 pb-4 pt-1 space-y-3 select-none animate-in fade-in duration-150">
          {/* Frosted Blurred Aura Track (Hides exact % to prevent farming) */}
          <div className="relative h-7 rounded-full bg-black/50 border border-white/10 p-1 flex items-center overflow-hidden">
            {/* Blurred Glowing Aura Fill */}
            <div
              className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#f472b6]/40 via-[#ec4899]/75 to-[#EF264C]/90 blur-[5px] ${currentMeta.auraWidthClass}`}
            />
            {/* Frosted Glass Veil Over Aura */}
            <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-[2px] pointer-events-none" />

            {/* 3 Key Lock Divider Gates Between the 4 Stages */}
            <div className="absolute inset-0 grid grid-cols-4 pointer-events-none">
              {RELATIONSHIP_STAGES.map((s, idx) => {
                const isUnlocked = currentMeta.step >= s.step
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-end pr-1.5 border-r border-white/[0.07] last:border-r-0"
                  >
                    {idx < 3 && (
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                          currentMeta.step > s.step
                            ? 'bg-[#f472b6]/30 text-[#F1F1F1] border border-[#f472b6]/50'
                            : isUnlocked
                            ? 'bg-black/60 text-[#f472b6] border border-[#f472b6]/40'
                            : 'bg-black/60 text-white/25 border border-white/10'
                        }`}
                      >
                        {currentMeta.step > s.step ? (
                          <KeyRound size={8} />
                        ) : (
                          <Lock size={8} />
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 4-Stage Segmented Control */}
          <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-black/30 border border-white/10">
            {RELATIONSHIP_STAGES.map((s) => {
              const isSelected = config.stage === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleStageSelect(s.id)}
                  className={`py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/[0.14] text-[#f472b6] shadow-sm border border-[#f472b6]/30 font-medium'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="text-[10.5px] font-sans font-medium leading-tight truncate">{s.label}</div>
                  <div className="text-[8.5px] font-sans text-white/40 tracking-tight mt-0.5 truncate">
                    {s.subLabel}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Twin Perk-Style Imprint Capsules */}
          <div className="space-y-1.5 pt-0.5">
            <div className="text-[10px] font-medium text-white/40 font-sans px-0.5">
              ตราประทับพิเศษ
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {/* Badge 1: Night Friction / ข้ามเส้นเพราะบรรยากาศ */}
              <button
                type="button"
                onClick={handleToggleNightFriction}
                className={`py-2 px-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                  isNightFrictionEffective
                    ? 'bg-[#a855f7]/15 border-[#a855f7]/45 text-[#F1F1F1] shadow-sm'
                    : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.08] text-white/40'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Wine size={12} className={isNightFrictionEffective ? 'text-[#d8b4fe]' : 'text-white/30'} />
                  <span className="text-[10.5px] font-sans font-medium truncate">
                    ข้ามเส้นเพราะบรรยากาศ
                  </span>
                </div>
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isNightFrictionEffective ? 'bg-[#c084fc] shadow-[0_0_6px_rgba(192,132,252,0.8)]' : 'bg-white/20'
                  }`}
                />
              </button>

              {/* Badge 2: Permanent Soft Spot / แพ้ทางถาวร */}
              <button
                type="button"
                onClick={handleToggleSoftSpot}
                className={`py-2 px-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                  isSoftSpotEffective
                    ? 'bg-[#EF264C]/15 border-[#EF264C]/45 text-[#F1F1F1] shadow-sm'
                    : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.08] text-white/40'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Flame size={12} className={isSoftSpotEffective ? 'text-[#fda4af]' : 'text-white/30'} />
                  <span className="text-[10.5px] font-sans font-medium truncate">
                    แพ้ทางถาวร
                  </span>
                </div>
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isSoftSpotEffective ? 'bg-[#EF264C] shadow-[0_0_6px_rgba(239,38,76,0.8)]' : 'bg-white/20'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
