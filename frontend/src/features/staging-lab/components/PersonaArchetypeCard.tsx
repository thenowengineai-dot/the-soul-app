import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  User,
  Heart,
  Activity,
  Anchor
} from 'lucide-react'
import {
  type PersonaArchetype,
  CANONICAL_PERSONA_PRESETS,
  getBaseDefenseStageInfo
} from '../modules/personaArchetypeModule'

interface PersonaArchetypeCardProps {
  isActive: boolean
  onActivate: () => void
  currentArchetype: PersonaArchetype
  onArchetypeChange: (archetype: PersonaArchetype) => void
  isExpanded: boolean
  onToggleExpand: () => void
}

export function PersonaArchetypeCard({
  isActive,
  onActivate,
  currentArchetype,
  onArchetypeChange,
  isExpanded,
  onToggleExpand,
}: PersonaArchetypeCardProps) {
  const handleSelectPreset = (preset: PersonaArchetype) => {
    onArchetypeChange({ ...preset })
  }

  const stageInfo = getBaseDefenseStageInfo(currentArchetype.baseDefenseStage ?? 5)

  const handleFieldChange = (field: keyof PersonaArchetype, value: string | number) => {
    onArchetypeChange({
      ...currentArchetype,
      [field]: value,
    })
  }

  const handleResetToPreset = () => {
    const original = CANONICAL_PERSONA_PRESETS.find(p => p.id === currentArchetype.id) || CANONICAL_PERSONA_PRESETS[0]
    onArchetypeChange({ ...original })
  }

  return (
    <div
      className={`w-[346px] rounded-[28px] transition-all select-none border backdrop-blur-2xl relative overflow-hidden ${
        isActive
          ? 'bg-white/[0.08] border-[#818cf8]/40 shadow-[inset_0_1px_0_rgba(129,140,248,0.25),0_0_24px_rgba(129,140,248,0.10)]'
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
                ? 'bg-[#818cf8] shadow-[0_0_8px_rgba(129,140,248,0.8)]'
                : 'bg-white/20'
            }`}
          />
          <div className="flex items-baseline gap-1.5 truncate">
            <span className="text-[15px] sm:text-[15.5px] font-semibold text-[#F1F1F1] tracking-tight">
              สายตัวละคร
            </span>
            <span className="text-[11px] font-normal text-white/40 truncate">
              (แม่พิมพ์ 4 เสาหลัก)
            </span>
          </div>
        </div>

        {/* Right Header: Active Preset Pill + ENGAGED / BYPASS Switch + Chevron */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium flex items-center gap-1.5 select-none bg-[#818cf8]/15 text-[#818cf8] border border-[#818cf8]/35 shadow-[inset_0_1px_0_rgba(129,140,248,0.20)]"
            title="สายตัวละครที่เลือกใช้งาน"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]" />
            <span className="truncate max-w-[85px]">{currentArchetype.name}</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onActivate()
            }}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 select-none ${
              isActive
                ? 'bg-[#818cf8]/15 text-[#818cf8] border border-[#818cf8]/35 shadow-[inset_0_1px_0_rgba(129,140,248,0.20)]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20'
            }`}
            title={isActive ? 'คลิกเพื่อบายพาส (Bypass)' : 'คลิกเพื่อเสียบใช้งาน (Engage)'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#818cf8]' : 'bg-white/30'}`} />
            <span>{isActive ? 'ENGAGED' : 'BYPASS'}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand()
            }}
            className="w-6 h-6 rounded-full bg-white/[0.04] hover:bg-white/[0.10] text-white/35 hover:text-white/80 flex items-center justify-center transition-all cursor-pointer"
            title={isExpanded ? 'พับเก็บแผงสายตัวละคร' : 'คลี่ออกดูแผงสายตัวละคร'}
          >
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* 2. Expanded Content Body */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 space-y-3.5 border-t border-white/[0.06] select-none animate-in fade-in duration-150">
          {/* Preset Selector Grid */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-white/50 mb-2">
              <span className="flex items-center gap-1.5 text-white/70">
                <Sparkles size={11} className="text-[#818cf8]" />
                <span>เลือก 1 ใน 7 สไตล์มาตรฐาน</span>
              </span>
              <button
                type="button"
                onClick={handleResetToPreset}
                className="text-[10px] text-white/40 hover:text-[#818cf8] flex items-center gap-1 transition-colors cursor-pointer"
                title="รีเซ็ตข้อความทั้ง 5 ช่องกลับสู่ค่าเริ่มต้นของสายนี้"
              >
                <RotateCcw size={10} />
                <span>รีเซ็ตค่าเดิม</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {CANONICAL_PERSONA_PRESETS.map((preset) => {
                const isSelected = preset.id === currentArchetype.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`py-1 px-2.5 rounded-xl text-[11px] font-sans transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#818cf8]/20 border border-[#818cf8]/45 text-[#F1F1F1] font-medium shadow-[inset_0_1px_0_rgba(129,140,248,0.3)]'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-[#818cf8]' : 'bg-white/20'
                      }`}
                    />
                    <span>{preset.name}</span>
                  </button>
                )
              })}
            </div>

            {/* Stat E (Base Defense Stage) Indicator Badge */}
            <div className="mt-2.5 flex items-center justify-between px-3 py-1.5 rounded-2xl bg-black/40 border border-white/[0.07]">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold border ${stageInfo.color} shrink-0`}>
                  {stageInfo.tag}
                </span>
                <span className="text-[10px] font-normal text-white/70 font-sans truncate">
                  {stageInfo.label}
                </span>
              </div>
              <span className="text-[9.5px] font-mono text-white/40 shrink-0 ml-1" title="พลังเกราะตั้งต้นสำหรับคำนวณเบื้องหลัง (ไม่ถูกส่งเข้า Prompt)">
                STAT E: {currentArchetype.baseDefenseStage ?? 5}/10
              </span>
            </div>
          </div>

          {/* 5 Psychological Pillars (Editable Textareas) */}
          <div className="space-y-2.5 pt-1">
            {/* Pillar 1: Core Wound */}
            <div className="rounded-2xl p-2.5 bg-black/30 border border-white/[0.06] focus-within:border-[#f59e0b]/40 transition-all">
              <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-white/60 font-sans mb-1">
                <ShieldAlert size={11} className="text-[#f59e0b]" />
                <span>1. ปมฝังใจในอดีต (The Core Wound)</span>
              </div>
              <textarea
                value={currentArchetype.coreWound}
                onChange={(e) => handleFieldChange('coreWound', e.target.value)}
                rows={2}
                className="w-full bg-transparent text-[11px] text-[#F1F1F1] leading-relaxed resize-none focus:outline-none font-sans placeholder-white/30"
                placeholder="ระบุบาดแผลในอดีตที่เป็นต้นตอของความกลัว..."
              />
            </div>

            {/* Pillar 2: Hidden Core */}
            <div className="rounded-2xl p-2.5 bg-black/30 border border-white/[0.06] focus-within:border-[#f43f5e]/40 transition-all">
              <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-white/60 font-sans mb-1">
                <Heart size={11} className="text-[#f43f5e]" />
                <span>2. เนื้อแท้และความกระหายลึก (The Hidden Core)</span>
              </div>
              <textarea
                value={currentArchetype.hiddenCore}
                onChange={(e) => handleFieldChange('hiddenCore', e.target.value)}
                rows={2}
                className="w-full bg-transparent text-[11px] text-[#F1F1F1] leading-relaxed resize-none focus:outline-none font-sans placeholder-white/30"
                placeholder="ระบุสิ่งที่หัวใจเธอโหยหามากที่สุดแต่ไม่กล้าเอ่ยปากขอ (Unmet Need)..."
              />
            </div>

            {/* Pillar 3: The Mask & Friction */}
            <div className="rounded-2xl p-2.5 bg-black/30 border border-white/[0.06] focus-within:border-[#818cf8]/40 transition-all">
              <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-white/60 font-sans mb-1">
                <User size={11} className="text-[#818cf8]" />
                <span>3. หน้ากากและกลยุทธ์กำแพง (The Mask & Friction)</span>
              </div>
              <textarea
                value={currentArchetype.theMask}
                onChange={(e) => handleFieldChange('theMask', e.target.value)}
                rows={2}
                className="w-full bg-transparent text-[11px] text-[#F1F1F1] leading-relaxed resize-none focus:outline-none font-sans placeholder-white/30"
                placeholder="อธิบายบุคลิกภายนอกและกลยุทธ์การตั้งการ์ด/ผลักไสเวลาเสียอาการ..."
              />
            </div>

            {/* The Keystone Tether (Wearable Prop / Tactile Anchor) */}
            <div className="rounded-2xl p-2.5 bg-black/30 border border-white/[0.06] focus-within:border-[#06b6d4]/40 transition-all">
              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-white/60 font-sans">
                  <Anchor size={11} className="text-[#06b6d4]" />
                  <span>วัตถุเหนี่ยวรั้งประจำกาย (The Keystone Tether)</span>
                </div>
                <span className="text-[9.5px] font-mono text-white/40">ของใช้/สมอยึดสติ</span>
              </div>
              <input
                type="text"
                value={currentArchetype.keystoneTether}
                onChange={(e) => handleFieldChange('keystoneTether', e.target.value)}
                className="w-full bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/10 focus:border-[#06b6d4]/40 text-[11px] text-[#F1F1F1] focus:outline-none font-sans placeholder-white/30 transition-all"
                placeholder="เช่น แว่นตากรอบบาง, นาฬิกาข้อมือ, ยางรัดผม, สร้อยคอ, แหวน..."
              />
            </div>

            {/* Pillar 4: Body Tells & Gaze */}
            <div className="rounded-2xl p-2.5 bg-black/30 border border-white/[0.06] focus-within:border-[#06b6d4]/40 transition-all">
              <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-white/60 font-sans mb-1">
                <Activity size={11} className="text-[#06b6d4]" />
                <span>4. สมอยึดสรีระและสายตา (Body Tells & Gaze)</span>
              </div>
              <textarea
                value={currentArchetype.bodyTells}
                onChange={(e) => handleFieldChange('bodyTells', e.target.value)}
                rows={2}
                className="w-full bg-transparent text-[11px] text-[#F1F1F1] leading-relaxed resize-none focus:outline-none font-sans placeholder-white/30 font-mono"
                placeholder="ระบุสมอยึด [อวัยวะรั่วไหล] และ [ทิศทางสายตา]..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
