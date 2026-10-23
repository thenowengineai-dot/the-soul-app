import { useState } from 'react'
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Compass
} from 'lucide-react'

import type { StagePreset } from '../types'

interface WorldStageCardProps {
  isActive: boolean
  onActivate: () => void
  isExpanded: boolean
  onToggleExpand: () => void
  onGenerate: (prompt: string, genre?: string) => Promise<void>
  isGenerating?: boolean
}

const STAGE_PRESETS: StagePreset[] = [
  {
    id: 'wingardium',
    title: 'ห้องเรียนวิงการ์เดียม',
    desc: 'อัฒจันทร์หินโบราณ ขนห่านสีขาว แสงแดดยามบ่าย',
    prompt: 'ห้องเรียนวิงการ์เดียมเลวิโอซาในปราสาทเวทมนตร์โบราณ บรรยากาศยามบ่าย อัฒจันทร์หินครึ่งวงกลม ขนห่านสีขาวบนโต๊ะเรียนไม้',
    genre: 'แฟนตาซี / เวทมนตร์โบราณ'
  },
  {
    id: 'sassy_park',
    title: 'สวนสนุกร้างยามค่ำคืน',
    desc: 'ม้าหมุนสองชั้น รั้วตาข่ายเหล็กสนิม ละอองฝนโปรยปราย',
    prompt: 'สวนสนุกปิดตอนกลางคืน ฝนตกปรอยๆ ม้าหมุนม้าไม้เก่าสองชั้น ซอกรั้วตาข่ายเหล็กที่ถูกงัดเป็นช่องแคบ บรรยากาศโรแมนติกคอเมดี้ยุค 2000s',
    genre: 'โรแมนติกคอเมดี้ / วัยรุ่น 2000s'
  },
  {
    id: 'bachelor_room',
    title: 'ห้องพักหนุ่มโสดระเกะระกะ',
    desc: 'อพาร์ตเมนต์เก่า กองมังงะ แอร์ครางหึ่ง ผนังบางติดห้องข้างๆ',
    prompt: 'ห้องเช่าอพาร์ตเมนต์เก่า 6 เสื่อของหนุ่มโสด กองเสื้อผ้าและมังงะระเกะระกะ แอร์เก่าส่งเสียงครางหึ่ง ผนังห้องบางจนได้ยินเสียงห้องข้างๆ',
    genre: 'สไลซ์ออฟไลฟ์ / รอมคอมโมเดิร์น'
  }
]

export function WorldStageCard({
  isActive,
  onActivate,
  isExpanded,
  onToggleExpand,
  onGenerate,
  isGenerating = false,
}: WorldStageCardProps) {
  const [promptInput, setPromptInput] = useState(STAGE_PRESETS[0].prompt)
  const [selectedGenre, setSelectedGenre] = useState(STAGE_PRESETS[0].genre)

  const handleSelectPreset = (preset: typeof STAGE_PRESETS[0]) => {
    setPromptInput(preset.prompt)
    setSelectedGenre(preset.genre)
  }

  const handleTriggerGenerate = async () => {
    if (isGenerating) return
    await onGenerate(promptInput, selectedGenre)
  }

  return (
    <div
      className={`w-full rounded-[28px] transition-all select-none border backdrop-blur-2xl relative overflow-hidden ${
        isActive
          ? 'bg-white/[0.08] border-amber-400/40 shadow-[inset_0_1px_0_rgba(251,191,36,0.25),0_0_24px_rgba(251,191,36,0.10)]'
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
                ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                : 'bg-white/20'
            }`}
          />
          <span className="text-[16px] sm:text-[17px] font-semibold text-[#F1F1F1] tracking-tight">
            ผืนเวทีมโนทัศน์
          </span>
          <span className="text-[11px] font-mono text-amber-400/70 uppercase px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
            Stage Cell
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
                ? 'bg-amber-400/15 text-amber-300 border border-amber-400/35 shadow-[inset_0_1px_0_rgba(251,191,36,0.20)]'
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
          {/* Preset Inspiration Pills */}
          <div>
            <div className="text-[11px] font-mono text-white/50 mb-1.5 flex items-center gap-1">
              <Compass size={11} className="text-amber-400/80" />
              <span>แรงบันดาลใจฉาก (Quick Presets):</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {STAGE_PRESETS.map((preset) => {
                const isSelected = promptInput === preset.prompt
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-3 py-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col gap-0.5 ${
                      isSelected
                        ? 'bg-amber-400/10 border-amber-400/30 text-white shadow-sm'
                        : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5 text-white/60 hover:text-white/90'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[12px] font-medium">
                      <span className={isSelected ? 'text-amber-300 font-semibold' : 'text-[#F1F1F1]'}>
                        {preset.title}
                      </span>
                      <span className="text-[10px] font-mono text-white/40">
                        {preset.genre}
                      </span>
                    </div>
                    <span className="text-[11px] text-white/40 line-clamp-1">
                      {preset.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Scene Input Prompt Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-white/50">
                บรีฟผืนเวที (Scene Brief / Physical Reality):
              </label>
              {selectedGenre && (
                <span className="text-[10px] font-mono text-amber-400/60">
                  {selectedGenre}
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="ระบุสถานที่ บรรยากาศ แสงเงา กลิ่น หรือพร็อพรอบตัว..."
              className="w-full px-3 py-2 text-[12.5px] rounded-xl bg-black/40 border border-white/10 text-[#F1F1F1] placeholder-white/20 focus:outline-none focus:border-amber-400/50 transition-all resize-none leading-relaxed font-sans"
            />
          </div>

          {/* Action Trigger Button */}
          <button
            type="button"
            disabled={isGenerating || !promptInput.trim()}
            onClick={handleTriggerGenerate}
            className={`w-full py-2.5 px-3 rounded-xl font-medium text-[12.5px] tracking-tight transition-all cursor-pointer flex items-center justify-center gap-2 select-none active:scale-[0.98] ${
              isGenerating
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30 animate-pulse'
                : 'bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-300 hover:text-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.15)]'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw size={13} className="animate-spin text-amber-400" />
                <span>กำลังเนรมิตมโนทัศน์ 5 มิติ...</span>
              </>
            ) : (
              <>
                <Sparkles size={13} className="text-amber-400" />
                <span>✦ เนรมิตผืนเวที (Generate Stage Cell)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
