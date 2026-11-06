import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  RotateCcw,
  User,
  Bot,
  Zap,
  Clock,
  Lock,
} from 'lucide-react'
import type { AttireZoneId, AttireLifecycleStage } from '../types'
import type {
  LivingAttireState,
  SensoryCatalystCue,
  PersonAttireProfile,
} from '../modules/livingAttireModule'
import {
  ATTIRE_ZONE_ORDER,
  LIVING_ATTIRE_PRESETS,
  ATTIRE_TEST_CUES,
  applyZoneCondition,
  createIndigoStreamAttireState,
} from '../modules/livingAttireModule'


interface LivingAttireCardProps {
  isActive: boolean
  onActivate: () => void
  isExpanded: boolean
  onToggleExpand: () => void
  attireState: LivingAttireState
  onChangeAttireState: (next: LivingAttireState) => void
  onPreFillAction?: (text: string) => void
}

export function LivingAttireCard({
  isActive,
  onActivate,
  isExpanded,
  onToggleExpand,
  attireState,
  onChangeAttireState,
  onPreFillAction,
}: LivingAttireCardProps) {
  const [activePerson, setActivePerson] = useState<'actor' | 'player'>('actor')
  const [editingZone, setEditingZone] = useState<AttireZoneId | null>(null)
  const [editInput, setEditInput] = useState<string>('')

  const currentProfile: PersonAttireProfile = attireState[activePerson]


  const handleSelectPreset = (presetId: string) => {
    const found = LIVING_ATTIRE_PRESETS.find((p) => p.id === presetId)
    if (found) {
      onChangeAttireState(JSON.parse(JSON.stringify(found.state)))
    }
  }

  const handleResetToIndigo = () => {
    onChangeAttireState(createIndigoStreamAttireState())
  }

  const handleStartEdit = (zoneId: AttireZoneId) => {
    setEditingZone(zoneId)
    setEditInput(currentProfile[zoneId].condition)
  }

  const handleSaveEdit = (zoneId: AttireZoneId, explicitLifecycle?: AttireLifecycleStage) => {
    const next = applyZoneCondition(
      attireState,
      activePerson,
      zoneId,
      editInput,
      explicitLifecycle
    )
    onChangeAttireState(next)
    setEditingZone(null)
  }

  const handleClearZone = (zoneId: AttireZoneId) => {
    const next = applyZoneCondition(attireState, activePerson, zoneId, '', 'DORMANT')
    onChangeAttireState(next)
  }

  const handleApplyCue = (cue: SensoryCatalystCue) => {
    let nextState = attireState
    if (cue.preMutation) {
      nextState = applyZoneCondition(
        attireState,
        cue.preMutation.target,
        cue.preMutation.zoneId,
        cue.preMutation.condition,
        cue.preMutation.lifecycle
      )
      onChangeAttireState(nextState)
    }
    if (onPreFillAction) {
      onPreFillAction(cue.playerInput)
    }
  }

  // Count active zones
  const freshCount = ATTIRE_ZONE_ORDER.filter(
    (z) => attireState.actor[z].lifecycle === 'FRESH' || attireState.player[z].lifecycle === 'FRESH'
  ).length
  const lingeringCount = ATTIRE_ZONE_ORDER.filter(
    (z) => attireState.actor[z].lifecycle === 'LINGERING' || attireState.player[z].lifecycle === 'LINGERING'
  ).length

  return (
    <div
      className={`w-full rounded-[28px] transition-all select-none border backdrop-blur-2xl relative overflow-hidden ${
        isActive
          ? 'bg-white/[0.08] border-[#38bdf8]/40 shadow-[inset_0_1px_0_rgba(56,189,248,0.25),0_0_24px_rgba(56,189,248,0.08)]'
          : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] hover:border-white/15'
      }`}
    >
      {/* 1. Accordion Header Row */}
      <div
        onClick={onToggleExpand}
        className="px-4 py-3.5 flex items-center justify-between gap-2 cursor-pointer select-none"
      >
        <div className="flex-1 flex items-baseline gap-2 text-left min-w-0 truncate">
          <span
            className={`w-2 h-2 rounded-full shrink-0 transition-all ${
              isActive
                ? 'bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                : 'bg-white/20'
            }`}
          />
          <span className="text-[16px] sm:text-[17px] font-semibold text-[#F1F1F1] tracking-tight shrink-0">
            ชุด & ผัสสะ 4 โซน
          </span>
          <span className="text-[11.5px] font-normal text-white/45 truncate">
            {freshCount > 0 ? (
              <span className="text-amber-300 font-mono font-medium">⚡ {freshCount} เพิ่งเกิด</span>
            ) : lingeringCount > 0 ? (
              <span className="text-sky-300 font-mono font-medium">⏳ {lingeringCount} ค้างคา</span>
            ) : (
              'สรีระ • เสื้อผ้าทุกชั้น • เท้าเปล่า'
            )}
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
        <div className="px-4 pb-4 pt-1 space-y-3 select-none animate-in fade-in duration-150">
          {/* Micro Subtitle Description */}
          <div className="text-[12px] sm:text-[12.5px] font-sans text-white/60 flex items-center justify-between gap-1.5 pt-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[#38bdf8]">✦</span>
              <span>ระบบชุดไร้ขีดจำกัด สลับป้ายเพิ่งเกิด ⚡ สู่ค้างคา ⏳ กันพูดซ้ำ</span>
            </div>
            <button
              type="button"
              onClick={handleResetToIndigo}
              className="text-[10.5px] font-mono text-white/40 hover:text-sky-300 flex items-center gap-1 transition-colors cursor-pointer"
              title="รีเซ็ตเป็นชุดโรงย้อมผ้าครามเริ่มต้น"
            >
              <RotateCcw size={10} />
              <span>รีเซ็ต</span>
            </button>
          </div>

          {/* Preset Chips */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10.5px] font-mono uppercase tracking-wider text-white/40">
              สถานการณ์จำลอง (Presets):
            </span>
            <div className="grid grid-cols-1 gap-1">
              {LIVING_ATTIRE_PRESETS.map((p) => {
                const isSelected = attireState.activePresetId === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-sky-500/15 border border-sky-400/40 text-sky-200'
                        : 'bg-black/20 hover:bg-white/[0.05] border border-white/[0.06] text-white/70'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-[12px] font-semibold truncate">{p.title}</div>
                      <div className="text-[10px] text-white/40 truncate">{p.subtitle}</div>
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Test Cues: 3-Turn Sensory Verification Flow */}
          <div className="p-2.5 rounded-2xl bg-black/30 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-white/60 font-semibold flex items-center gap-1.5">
                <Sparkles size={11} className="text-amber-400" />
                <span>ชุดทดสอบ 3 จังหวะ (พิสูจน์ไม่พูดซ้ำ):</span>
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {ATTIRE_TEST_CUES.map((cue) => (
                <button
                  key={cue.id}
                  type="button"
                  onClick={() => handleApplyCue(cue)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-sky-500/15 border border-white/[0.06] hover:border-sky-400/30 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-white/80 group-hover:text-sky-300">
                    <span className="font-semibold">{cue.stepLabel}</span>
                    <span className="text-[9.5px] text-white/40 group-hover:text-sky-400">คลิกใส่ข้อความ ↵</span>
                  </div>
                  <div className="text-[10px] text-white/50 truncate mt-0.5">{cue.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Person Selector: Actor vs Player */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-black/30 border border-white/10 text-[12px] font-medium">
            <button
              type="button"
              onClick={() => setActivePerson('actor')}
              className={`py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activePerson === 'actor'
                  ? 'bg-sky-500/20 text-sky-200 border border-sky-400/30 font-semibold shadow-sm'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Bot size={13} />
              <span>ตัวละคร (Actor)</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePerson('player')}
              className={`py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activePerson === 'player'
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 font-semibold shadow-sm'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <User size={13} />
              <span>ผู้เล่น (Player)</span>
            </button>
          </div>

          {/* 4-Zone Surface Matrix */}
          <div className="space-y-2">
            {ATTIRE_ZONE_ORDER.map((zoneId) => {
              const zone = currentProfile[zoneId]
              const isEditing = editingZone === zoneId

              const lifecycleBadge =
                zone.lifecycle === 'FRESH' ? (
                  <span className="px-1.5 py-0.5 rounded-full text-[9.5px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Zap size={9} />
                    <span>FRESH</span>
                  </span>
                ) : zone.lifecycle === 'LINGERING' ? (
                  <span className="px-1.5 py-0.5 rounded-full text-[9.5px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                    <Clock size={9} />
                    <span>LINGERING</span>
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-full text-[9.5px] font-mono bg-white/[0.05] text-white/40 border border-white/10 flex items-center gap-1">
                    <Lock size={8} />
                    <span>DORMANT</span>
                  </span>
                )

              return (
                <div
                  key={zoneId}
                  className={`p-2.5 rounded-2xl border transition-all ${
                    zone.lifecycle === 'FRESH'
                      ? 'bg-amber-500/[0.06] border-amber-500/30'
                      : zone.lifecycle === 'LINGERING'
                      ? 'bg-sky-500/[0.05] border-sky-500/25'
                      : 'bg-black/20 border-white/[0.06]'
                  }`}
                >
                  {/* Zone Header */}
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <div className="text-[12px] font-semibold text-white/90">
                      {zone.label}
                    </div>
                    {lifecycleBadge}
                  </div>

                  {/* Layers Inventory List */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {zone.layers.map((l) => (
                      <span
                        key={l.id}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                          l.isInnerHidden
                            ? 'bg-purple-500/10 border-purple-500/20 text-purple-200'
                            : 'bg-white/[0.04] border-white/10 text-white/70'
                        }`}
                        title={l.description}
                      >
                        <span className="opacity-40">{l.slotLabel}:</span>
                        <span className="font-medium truncate max-w-[150px]">{l.description}</span>
                      </span>
                    ))}
                  </div>

                  {/* Live Condition Editor */}
                  {isEditing ? (
                    <div className="space-y-1.5 pt-1">
                      <textarea
                        value={editInput}
                        onChange={(e) => setEditInput(e.target.value)}
                        placeholder="พิมพ์สภาพเปียก/ชื้น/เลอะ เช่น 'เสื้อเชิ้ตขาวเปียกน้ำแนบเนื้อเห็นเสื้อใน'..."
                        rows={2}
                        className="w-full text-[11.5px] p-2 rounded-xl bg-black/40 border border-sky-400/40 text-white focus:outline-none focus:ring-1 focus:ring-sky-400 font-sans resize-none"
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingZone(null)}
                          className="px-2 py-1 rounded-lg text-[10.5px] text-white/40 hover:text-white cursor-pointer"
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(zoneId, 'LINGERING')}
                          className="px-2.5 py-1 rounded-lg text-[10.5px] bg-sky-500/20 text-sky-200 border border-sky-400/30 hover:bg-sky-500/30 cursor-pointer"
                          title="บันทึกเป็นสภาพค้างคา (เล่าไปแล้ว)"
                        >
                          บันทึกเป็น LINGERING ⏳
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(zoneId, 'FRESH')}
                          className="px-2.5 py-1 rounded-lg text-[10.5px] bg-amber-500/20 text-amber-200 border border-amber-400/30 hover:bg-amber-500/30 font-semibold cursor-pointer"
                          title="บันทึกเป็นสภาพเพิ่งเกิดสดๆ (AI ต้องบรรยายผัสสะแรก)"
                        >
                          บันทึกเป็น FRESH ⚡
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex-1 truncate">
                        {zone.condition ? (
                          <span
                            className={`font-sans ${
                              zone.lifecycle === 'FRESH'
                                ? 'text-amber-200 font-medium'
                                : 'text-sky-200'
                            }`}
                          >
                            {zone.condition}
                          </span>
                        ) : (
                          <span className="text-white/30 italic">สภาพปกติ แห้งสนิท ไม่ถูกรบกวน</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {zone.condition && (
                          <button
                            type="button"
                            onClick={() => handleClearZone(zoneId)}
                            className="text-[10px] text-white/30 hover:text-rose-400 px-1.5 py-0.5 rounded cursor-pointer"
                            title="ล้างสภาพเป็นปกติ"
                          >
                            ล้าง
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(zoneId)}
                          className="text-[10px] text-sky-300 hover:text-sky-200 bg-sky-500/10 hover:bg-sky-500/20 px-2 py-0.5 rounded-lg border border-sky-400/20 cursor-pointer"
                        >
                          {zone.condition ? 'แก้ไข' : '+ ปรับสภาพ'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
