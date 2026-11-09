import {
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import {
  type PersonaArchetype,
  CANONICAL_PERSONA_PRESETS
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
  const isCustomArchetype = !CANONICAL_PERSONA_PRESETS.some(
    (preset) => preset.id === currentArchetype.id
  )

  const handleSelectPreset = (preset: PersonaArchetype) => {
    onArchetypeChange({ ...preset })
  }

  const handleFieldChange = (field: keyof PersonaArchetype, value: string) => {
    onArchetypeChange({
      ...currentArchetype,
      [field]: value,
    })
  }

  return (
    <div
      className={`w-full rounded-[28px] transition-all select-none border backdrop-blur-2xl relative overflow-hidden ${
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
          <span className="text-[16px] sm:text-[17px] font-semibold text-[#F1F1F1] tracking-tight">
            สายตัวละคร
          </span>
          {isCustomArchetype && (
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-[#EF264C]/15 border border-[#EF264C]/35 text-[#EF264C] truncate max-w-[150px]">
              {currentArchetype.name || 'ตัวละครยูนีค'}
            </span>
          )}
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
                ? 'bg-[#818cf8]/15 text-[#818cf8] border border-[#818cf8]/35 shadow-[inset_0_1px_0_rgba(129,140,248,0.20)]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20'
            }`}
            title={isActive ? 'คลิกเพื่อปิด' : 'คลิกเพื่อเปิดใช้งาน'}
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
            title={isExpanded ? 'พับเก็บ' : 'คลี่ออก'}
          >
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* 2. Expanded Content Body */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 select-none animate-in fade-in duration-150">
          {/* Unique Soul from World Studio Banner */}
          {isCustomArchetype && (
            <div className="rounded-2xl p-3 sm:p-3.5 bg-gradient-to-br from-[#EF264C]/12 via-black/40 to-black/20 border border-[#EF264C]/30 space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-[#EF264C] uppercase tracking-wider">
                    ✨ ตัวละครยูนีคจากโลก
                  </span>
                  <span className="text-white/25">•</span>
                  <span className="text-[13px] font-bold text-[#F1F1F1]">
                    {currentArchetype.name}
                  </span>
                </div>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/[0.06] text-white/70 border border-white/10">
                  {currentArchetype.tagline || 'The Unique Soul'}
                </span>
              </div>

              {currentArchetype.appearanceAndCharm && (
                <div className="rounded-xl p-2.5 bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="text-[10.5px] font-medium text-white/45 block">
                    สรีระและเสน่ห์ดึงดูด (Physical & Charm):
                  </span>
                  <p className="text-[11.5px] text-white/80 leading-relaxed font-sans line-clamp-3">
                    {currentArchetype.appearanceAndCharm}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Preset Selector Grid */}
          <div className="space-y-1.5">
            <div className="text-[11px] text-white/40 flex items-center justify-between">
              <span>
                {isCustomArchetype
                  ? 'หรือสลับใช้ 7 แม่พิมพ์ความคมมาตรฐาน:'
                  : '7 แม่พิมพ์ความคมมาตรฐาน:'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {CANONICAL_PERSONA_PRESETS.map((preset) => {
                const isSelected = preset.id === currentArchetype.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`py-1.5 px-3 rounded-xl text-[12px] sm:text-[12.5px] font-sans transition-all cursor-pointer flex items-center gap-1.5 ${
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
          </div>

          {/* The Keystone Tether (Wearable Prop / Tactile Anchor) */}
          <div className="rounded-2xl p-2.5 bg-black/30 border border-white/[0.06] focus-within:border-[#818cf8]/40 transition-all">
            <div className="text-[11.5px] font-medium text-white/60 font-sans mb-1.5">
              วัตถุเหนี่ยวรั้งประจำกาย
            </div>
            <input
              type="text"
              value={currentArchetype.keystoneTether}
              onChange={(e) => handleFieldChange('keystoneTether', e.target.value)}
              className="w-full bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/10 focus:border-[#818cf8]/40 text-[12.5px] sm:text-[13px] text-[#F1F1F1] focus:outline-none font-sans placeholder-white/35 transition-all"
              placeholder="เช่น นาฬิกาข้อมือเรือนเรียบ, ชายกระโปรง..."
            />
          </div>
        </div>
      )}
    </div>
  )
}
