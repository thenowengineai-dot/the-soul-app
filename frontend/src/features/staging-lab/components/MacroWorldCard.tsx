import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Globe2,
  Sparkles,
  BookOpen
} from 'lucide-react'
import type { MacroWorldPreset } from '../types'

interface MacroWorldCardProps {
  isActive: boolean
  onActivate: () => void
  isExpanded: boolean
  onToggleExpand: () => void
  loreText: string
  onLoreChange: (newLore: string) => void
  onDissect?: () => void
  isDissecting?: boolean
  cabinetCardCount?: number
  onOpenCabinet?: () => void
}

const MACRO_WORLD_PRESETS: MacroWorldPreset[] = [
  {
    id: 'magic_school',
    title: 'โรงเรียนเวทมนตร์แห่งศตวรรษ',
    subtitle: '100 ปี • แบ่งบ้าน • สัตว์วิเศษ • แอบซ่อนจากมนุษย์',
    lore: `เป็นโรงเรียนเวทมนตร์อันดับหนึ่ง ที่เหล่าพ่อมดแม่มดทุกบ้านต้องเอาลูกมาเรียน โดยต่างจากสังคมมนุษย์ทั่วไป โรงเรียนอายุเกินกว่า 100 ปี มีพ่อมดศาสตร์มืด มีการแบ่งบ้านในโรงเรียน มีอาจารย์ที่ยูนีคทุ่มเทเพื่อเด็กๆ มีโลกของตัวเอง มีสัตว์วิเศษ มีความแฟนตาซี ใช้ไม้กายสิทธิ์เพื่อร่ายคาถา แอบอยู่ในโลกของเราและโดนโลกของเรากีดกัน คนเยอะ ห้องเรียนเยอะ สถานที่ลึกลับ มูดแอนด์โทนของการแข่งขัน ความเป็นเพื่อน ปริศนา และตัวร้าย...`
  },
  {
    id: 'cyberpunk_city',
    title: 'มหานครนีออนใต้เงาบรรษัท',
    subtitle: 'ฝนกรด • ชิปเถื่อน • บรรษัทกุมอำนาจ • ตรอกสลัม',
    lore: `มหานครที่ฝนกรดตกตลอดปี บรรษัทเทคโนโลยียักษ์ใหญ่กุมอำนาจเหนือกฎหมาย ผู้คนดิ้นรนในตรอกสลัมใต้ดิน มีการค้าชิปความทรงจำเถื่อน ดัดแปลงอวัยวะกลไก แสงนีออนสว่างตัดกับเงามืด มูดแอนด์โทนของการเอาชีวิตรอด ความหวาดระแวง และการหักหลังท่ามกลางสายฝน...`
  },
  {
    id: 'tokyo_romcom',
    title: 'โตเกียวร่วมสมัย & คนเหงาข้างห้อง',
    subtitle: 'ห้องเช่า 6 เสื่อ • ผนังบาง • แฟนเช่า • ซ่อนความลับ',
    lore: `เมืองหลวงโตเกียวอันเร่งรีบ ท่ามกลางอพาร์ตเมนต์ไม้เก่าอายุ 30 ปีที่ผนังบางเฉียบ คนรุ่นใหม่ที่โดดเดี่ยวทำงานพิเศษหาเช้ากินค่ำ มีบริการเช่าแฟนสาวตัวท็อป มีเรื่องราวของการปกปิดตัวตนที่แท้จริง มูดแอนด์โทนของความเคอะเขิน ความอบอุ่นปนขำขัน และความรักที่เริ่มต้นจากความเข้าใจผิด...`
  }
]

const CATALYST_SPARKS = [
  { label: '🏛️ รากเหง้า & ประวัติศาสตร์', text: '\n[รากเหง้า & ยุคสมัย]: โลกนี้ก่อตั้งมานานแค่ไหน มีประวัติศาสตร์อะไรที่ทุกคนจดจำ?' },
  { label: '👥 ผู้คน & การแบ่งขั้ว', text: '\n[โครงสร้างสังคม & การแบ่งพวก]: มีบ้าน สำนัก ก๊ก หรือการแข่งขันกันอย่างไร?' },
  { label: '🔮 กฎเกณฑ์ & พลัง/สิ่งของ', text: '\n[กฎเกณฑ์ & สิ่งวิเศษ]: ใช้ชีวิตกันอย่างไร มีเวทมนตร์ เครื่องราง หรือเทคโนโลยีอะไร?' },
  { label: '🌑 เงามืด & ปริศนา', text: '\n[เงามืด & ภัยคุกคาม]: ใครคือตัวร้ายหรือสิ่งที่กำลังคุกคามโลกนี้อยู่เบื้องหลัง?' },
  { label: '🎭 มูดแอนด์โทนหลัก', text: '\n[มูดแอนด์โทน]: บรรยากาศหลักคือการผจญภัย ความอบอุ่น หรือความลึกลับระแวง?' }
]

export function MacroWorldCard({
  isActive,
  onActivate,
  isExpanded,
  onToggleExpand,
  loreText,
  onLoreChange,
  onDissect,
  isDissecting = false,
  cabinetCardCount = 0,
  onOpenCabinet,
}: MacroWorldCardProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(MACRO_WORLD_PRESETS[0].id)

  const handleSelectPreset = (preset: MacroWorldPreset) => {
    setSelectedPresetId(preset.id)
    onLoreChange(preset.lore)
  }

  const handleInjectSpark = (sparkText: string) => {
    const current = (loreText || '').trimEnd()
    onLoreChange(current ? `${current}\n${sparkText}` : sparkText.trimStart())
  }

  return (
    <div
      className={`w-full rounded-[28px] transition-all select-none border backdrop-blur-2xl relative overflow-hidden ${
        isActive
          ? 'bg-white/[0.08] border-[#38bdf8]/40 shadow-[inset_0_1px_0_rgba(56,189,248,0.25),0_0_24px_rgba(56,189,248,0.10)]'
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
                ? 'bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                : 'bg-white/20'
            }`}
          />
          <span className="text-[16px] sm:text-[17px] font-semibold text-[#F1F1F1] tracking-tight">
            จักรวาลแห่งโลก
          </span>
          <span className="text-[11px] font-mono text-[#38bdf8]/80 uppercase px-1.5 py-0.5 rounded bg-[#38bdf8]/10 border border-[#38bdf8]/20">
            World Bible
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

      {/* 2. Expanded Content Body */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 select-none animate-in fade-in duration-150">
          {/* Quick World Presets */}
          <div>
            <div className="text-[11px] font-mono text-white/50 mb-1.5 flex items-center gap-1">
              <BookOpen size={11} className="text-[#38bdf8]/80" />
              <span>แรงบันดาลใจโลก (World Archetypes):</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {MACRO_WORLD_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-3 py-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col gap-0.5 ${
                      isSelected
                        ? 'bg-[#38bdf8]/10 border-[#38bdf8]/30 text-white shadow-sm'
                        : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5 text-white/60 hover:text-white/90'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[12px] font-medium">
                      <span className={isSelected ? 'text-[#38bdf8] font-semibold' : 'text-[#F1F1F1]'}>
                        {preset.title}
                      </span>
                      <span className="text-[10px] font-mono text-white/40">
                        {preset.id === 'magic_school' ? 'CANONICAL' : ''}
                      </span>
                    </div>
                    <span className="text-[11px] text-white/40 line-clamp-1">
                      {preset.subtitle}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Imagination Catalyst Sparks (ปุ่มเปิดจินตนาการ) */}
          <div>
            <div className="text-[11px] font-mono text-white/50 mb-1.5 flex items-center gap-1">
              <Sparkles size={11} className="text-[#38bdf8]/80" />
              <span>ปุ่มจุดประกายจินตนาการ (Catalyst Sparks):</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {CATALYST_SPARKS.map((spark, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleInjectSpark(spark.text)}
                  className="px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-[#38bdf8]/15 border border-white/10 hover:border-[#38bdf8]/30 text-[10.5px] text-white/60 hover:text-[#38bdf8] transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                  title="คลิกเพื่อแทรกปมฉุกคิดนี้ลงในคัมภีร์โลก"
                >
                  <span>{spark.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* World Lore Freeform Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-white/50 flex items-center gap-1">
                <Globe2 size={11} className="text-[#38bdf8]/70" />
                <span>คัมภีร์โลก (World Bible):</span>
              </label>
              <span className="text-[10px] font-mono text-white/35">
                {loreText.length} อักษร
              </span>
            </div>
            <textarea
              rows={6}
              value={loreText}
              onChange={(e) => onLoreChange(e.target.value)}
              placeholder="บอกเล่าเรื่องราว ปรัชญา และมวลรวมของโลกใบนี้อย่างอิสระ... (เช่น โรงเรียนเวทมนตร์ 100 ปี มีการแบ่งบ้าน มีสัตว์วิเศษ ซ่อนตัวจากโลกมนุษย์...)"
              className="w-full px-3 py-2 text-[12.5px] rounded-xl bg-black/40 border border-white/10 text-[#F1F1F1] placeholder-white/20 focus:outline-none focus:border-[#38bdf8]/50 transition-all resize-none leading-relaxed font-sans"
            />

            {/* Action Bar: Dissect into Lore Cards + View Cabinet Drawer */}
            <div className="pt-1 flex items-center justify-between gap-2">
              {onOpenCabinet && (
                <button
                  type="button"
                  onClick={onOpenCabinet}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-mono text-white/50 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
                  title="เปิดดูการ์ดทั้งหมดในตู้ลิ้นชักคลังโลก"
                >
                  <BookOpen size={12} className="text-[#38bdf8]" />
                  <span>ตู้คลัง ({cabinetCardCount})</span>
                </button>
              )}

              {onDissect && (
                <button
                  type="button"
                  onClick={onDissect}
                  disabled={isDissecting || !loreText.trim()}
                  className={`px-3 py-1.5 rounded-xl text-[11.5px] font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 border ml-auto ${
                    isDissecting
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 cursor-wait'
                      : 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 border-purple-500/35 hover:border-purple-400/50 shadow-sm'
                  } ${!loreText.trim() ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <Sparkles size={13} className={isDissecting ? 'animate-spin text-purple-300' : 'text-purple-300'} />
                  <span>{isDissecting ? 'กำลังสกัดการ์ด...' : 'สกัดเป็นการ์ดเข้าคลัง'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MacroWorldCard
