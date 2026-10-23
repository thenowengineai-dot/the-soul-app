import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Flame,
  Sparkles,
  Zap
} from 'lucide-react'
import type { IncitingSparkPreset } from '../types'

interface IncitingSparkCardProps {
  isActive: boolean
  onActivate: () => void
  isExpanded: boolean
  onToggleExpand: () => void
  sparkText: string
  onSparkChange: (newSpark: string) => void
}

const INCITING_SPARK_PRESETS: IncitingSparkPreset[] = [
  {
    id: 'euphonium',
    title: 'ใบสมัครมัดมือชก & สายตาเพื่อนทรัมเป็ต',
    subtitle: 'อยากอยู่เงียบๆ • โดนเพื่อนลากเซ็นชื่อ • สบตาคู่แค้นเก่า • การซ้อมวันแรก',
    spark: `ตั้งใจจะใช้ชีวิต ม.ปลาย ปี 1 แบบเงียบๆ ไม่เด่น แต่เพื่อนสนิทจับเซ็นชื่อมัดมือชกเข้าชมรมเครื่องเป่า ยื่นใบสมัครใส่มือแล้วลากเข้าห้องซ้อม ทันทีที่ประตูเปิดออก ดันไปสบตากับเพื่อนเป่าทรัมเป็ตที่เคยร้องไห้แทบขาดใจตอนแข่งแพ้ ม.ต้น และเธอกำลังจ้องมาด้วยสายตาที่เอาจริงจนน่าขนลุก...`
  },
  {
    id: 'pirates',
    title: 'เรือจมมิดน้ำ & เข็มทิศหมุนติ้ว',
    subtitle: 'ก้าวลงจากเสากระโดง • เข็มทิศไม่ชี้ทิศเหนือ • เหรียญทองต้องสาป • ดวลดาบในโรงตีเหล็ก',
    spark: `ยืนอยู่บนยอดเสากระโดงของเรือเล็กที่กำลังจมน้ำ ก้าวเหยียบสะพานเทียบท่าพอดีตอนเรือมิดน้ำพอดิบพอดี ในตัวพกเข็มทิศที่ไม่เคยชี้ทิศเหนือ และปืนที่มีกระสุนแค่นัดเดียว ก่อนจะเข้าไปพัวพันกับการดวลดาบในโรงตีเหล็ก และการปล้นชิงตัวลูกสาวข้าหลวงพร้อมเหรียญทองคำต้องสาปที่ไม่มีใครเชื่อว่ามีจริง...`
  },
  {
    id: 'hogwarts',
    title: 'จดหมายใต้บันได & ประตูที่พังทลาย',
    subtitle: 'เด็กกำพร้า • จดหมายบินว่อน • คืนพายุ • ประตูพัง "เธอคือพ่อมด"',
    spark: `เด็กกำพร้าที่นอนอยู่ห้องใต้บันได จู่ๆ มีจดหมายตราขี้ผึ้งสีแดงส่งมาไม่หยุดจนบินว่อนเต็มห้องนั่งเล่น ลุงป้าพยายามหนีไปกบดานที่กระท่อมกลางเกาะร้างในคืนพายุคลั่ง ก่อนที่คนตัวยักษ์จะพังประตูไม้เข้ามาพร้อมเค้กวันเกิดและพูดว่า "เธอคือพ่อมด"...`
  },
  {
    id: 'cyberpunk',
    title: 'ชิปความทรงจำเถื่อน & รอยเลือดที่เบาะหลัง',
    subtitle: 'ตรอกฝนกรด • รับงานส่งของด่วน • ผู้โดยสารหมดสติ • ไซเรนตำรวจไล่หลัง',
    spark: `คนขับแท็กซี่กะดึกในตรอกสลัมที่ฝนกรดตกหนัก จู่ๆ มีหญิงสาวบาดเจ็บสาหัสกระโดดขึ้นมาที่เบาะหลังพร้อมกระเป๋าใส่ชิปประสาทเถื่อนที่ถูกล็อกรหัส ก่อนที่เสียงไซเรนของหน่วยกวาดล้างบรรษัทจะดังก้องมาจากท้ายซอย...`
  }
]

const SPARK_LENSES = [
  {
    label: '⚡ เหตุการณ์มัดมือชกที่ถอยไม่ได้',
    text: '\n[เหตุการณ์ที่ถอยไม่ได้]: เกิดอะไรขึ้นในวินาทีแรกที่ทำให้เราหรือตัวละครต้องมาตกอยู่ในสถานการณ์นี้ทันที?'
  },
  {
    label: '🗝️ ของแปลกหรือความลับที่มีปม',
    text: '\n[ของแปลก & ปมในมือ]: มีสิ่งของ จดหมาย อาวุธ หรือความลับอะไรที่ถูกหยิบยื่นหรือพกติดตัวมา?'
  },
  {
    label: '⚔️ การปะทะแรกที่สะกิดใจ',
    text: '\n[การปะทะแรก]: ใครคือคนแรกที่สบตา พูดแทงใจดำ หรือเดินเข้ามาขวางทางเรา?'
  }
]

export function IncitingSparkCard({
  isActive,
  onActivate,
  isExpanded,
  onToggleExpand,
  sparkText,
  onSparkChange,
}: IncitingSparkCardProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(INCITING_SPARK_PRESETS[0].id)

  const handleSelectPreset = (preset: IncitingSparkPreset) => {
    setSelectedPresetId(preset.id)
    onSparkChange(preset.spark)
  }

  const handleInjectLens = (lensText: string) => {
    const current = (sparkText || '').trimEnd()
    onSparkChange(current ? `${current}\n${lensText}` : lensText.trimStart())
  }

  return (
    <div
      className={`w-full rounded-[28px] transition-all select-none border backdrop-blur-2xl relative overflow-hidden ${
        isActive
          ? 'bg-white/[0.08] border-amber-400/40 shadow-[inset_0_1px_0_rgba(245,158,11,0.25),0_0_24px_rgba(245,158,11,0.10)]'
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
                ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                : 'bg-white/20'
            }`}
          />
          <span className="text-[16px] sm:text-[17px] font-semibold text-[#F1F1F1] tracking-tight">
            จุดเริ่มต้นที่ทำให้ทุกอย่างหมุน
          </span>
          <span className="text-[11px] font-mono text-amber-400/90 uppercase px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
            Card 0 • The Spark
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
                ? 'bg-amber-400/15 text-amber-300 border border-amber-400/35 shadow-[inset_0_1px_0_rgba(245,158,11,0.20)]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20'
            }`}
            title={isActive ? 'คลิกเพื่อปิด' : 'คลิกเพื่อเปิดใช้งาน'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-amber-400' : 'bg-white/30'}`} />
            <span>{isActive ? 'ENGAGED' : 'BYPASS'}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand()
            }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            aria-label={isExpanded ? 'ย่อการ์ด' : 'ขยายการ์ด'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-white/70" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/40" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Expanded Content Body */}
      {isExpanded && (
        <div className="px-4 pb-4.5 pt-1 space-y-3.5 border-t border-white/[0.06]">
          {/* Subtitle / Philosophy Note */}
          <div className="flex items-center justify-between text-[11.5px] text-white/50">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400/90" />
              <span>ชนวนเหตุ วินาทีมัดมือชก หรือสิ่งของที่ทำให้ถอยกลับไม่ได้</span>
            </span>
            <span className="font-mono text-[10.5px] text-white/30">
              {sparkText?.length || 0} ตัวอักษร
            </span>
          </div>

          {/* Quick Presets Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10.5px] font-mono uppercase text-white/40 tracking-wider">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400/80" />
                <span>ชนวนเหตุแม่แบบ (Masterpiece Sparks)</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {INCITING_SPARK_PRESETS.map((p) => {
                const isSelected = selectedPresetId === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`p-2 rounded-xl text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-400/[0.12] border-amber-400/40 shadow-sm'
                        : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06] hover:border-white/15'
                    }`}
                  >
                    <div className="text-[11.5px] font-medium text-[#F1F1F1] truncate">
                      {p.title}
                    </div>
                    <div className="text-[10px] text-white/40 truncate mt-0.5">
                      {p.subtitle}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Catalyst Lenses: 3 Thought-Provoking Pills */}
          <div className="space-y-1.5">
            <div className="text-[10.5px] font-mono uppercase text-white/40 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400/80" />
              <span>เลนส์ช่วยฉุกคิด (คลิกเพื่อแทรกหัวข้อ)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SPARK_LENSES.map((lens, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleInjectLens(lens.text)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.04] hover:bg-amber-400/10 border border-white/10 hover:border-amber-400/30 text-white/70 hover:text-amber-200 transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                  title="คลิกเพื่อแทรกหัวข้อนี้ลงในช่องเขียน"
                >
                  <span>{lens.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Freeform Spark Canvas */}
          <div className="relative">
            <textarea
              value={sparkText}
              onChange={(e) => onSparkChange(e.target.value)}
              placeholder="พิมพ์วินาทีแรกที่เรื่องราวเริ่มต้นขึ้น... เกิดอะไรขึ้น ใครทำอะไรแปลกๆ มีของชิ้นไหน หรือเหตุการณ์บีบบังคับอะไรที่ทำให้เราถอยกลับไม่ได้แล้ว..."
              rows={5}
              className="w-full px-3.5 py-3 rounded-2xl bg-black/25 hover:bg-black/35 focus:bg-black/40 border border-white/10 focus:border-amber-400/40 text-[#F1F1F1] text-[12.5px] leading-relaxed resize-y focus:outline-none transition-all placeholder:text-white/25 selection:bg-amber-400/30 font-sans"
            />
          </div>
        </div>
      )}
    </div>
  )
}
