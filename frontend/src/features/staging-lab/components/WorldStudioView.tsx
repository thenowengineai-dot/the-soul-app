import { useState } from 'react'
import {
  Sparkles,
  Zap,
  Play,
  Search,
  Pin,
  Trash2,
  Plus,
  BookOpen,
  Save,
  Tag,
  Shield,
  MapPin,
  Scroll,
  BookMarked,
  ArrowLeft,
  Flame,
  Check
} from 'lucide-react'
import type { LoreCard, MacroWorldPreset } from '../types'

interface WorldStudioViewProps {
  macroWorldLore: string
  onMacroWorldLoreChange: (lore: string) => void
  sparkText: string
  onSparkChange: (spark: string) => void
  cabinetCards: LoreCard[]
  pinnedCardIds: string[]
  onTogglePin: (cardId: string) => void
  onDeleteCabinetCard: (cardId: string) => Promise<void>
  onSaveCardsToCabinet: (cards: LoreCard[]) => Promise<void>
  onEnterStage: () => void
  onBackToHome: () => void
}

const CATEGORY_META: Record<string, { label: string; color: string; border: string; bg: string; icon: typeof Shield }> = {
  faction: {
    label: 'การแบ่งขั้ว / สถาบัน',
    color: 'text-indigo-300',
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/10',
    icon: Shield,
  },
  location: {
    label: 'สถานที่ / สถาปัตยกรรม',
    color: 'text-emerald-300',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    icon: MapPin,
  },
  rule: {
    label: 'กฎเกณฑ์ / กลไก / ข้อห้าม',
    color: 'text-amber-300',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    icon: Scroll,
  },
  lore: {
    label: 'ตำนาน / ปริศนา / ผู้คน',
    color: 'text-purple-300',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    icon: BookMarked,
  },
}

const QUICK_WORLD_PRESETS: MacroWorldPreset[] = [
  {
    id: 'magic_school',
    title: 'โรงเรียนเวทมนตร์แห่งศตวรรษ',
    subtitle: '100 ปี • แบ่งบ้าน • สัตว์วิเศษ • แอบซ่อนจากมนุษย์',
    lore: `เป็นโรงเรียนเวทมนตร์อันดับหนึ่ง ที่เหล่าพ่อมดแม่มดทุกบ้านต้องเอาลูกมาเรียน โดยต่างจากสังคมมนุษย์ทั่วไป โรงเรียนอายุเกินกว่า 100 ปี มีพ่อมดศาสตร์มืด มีการแบ่งบ้านในโรงเรียน มีอาจารย์ที่ยูนีคทุ่มเทเพื่อเด็กๆ มีโลกของตัวเอง มีสัตว์วิเศษ มีความแฟนตาซี ใช้ไม้กายสิทธิ์เพื่อร่ายคาถา แอบอยู่ในโลกของเราและโดนโลกของเรากีดกัน คนเยอะ ห้องเรียนเยอะ สถานที่ลึกลับ มูดแอนด์โทนของการแข่งขัน ความเป็นเพื่อน ปริศนา และตัวร้าย...`
  },
  {
    id: 'euphonium_band',
    title: 'ชมรมดนตรี ม.ปลาย & การแข่งขันระดับประเทศ',
    subtitle: 'ห้องซ้อม • น้ำมันหยอดวาล์ว • ทะเลาะบนสะพาน • คัดตัวจริง',
    lore: `เด็กสาวที่เล่นยูโฟเนียมย้ายเข้ามา ม.ปลาย ปี 1 กะว่าจะใช้ชีวิตธรรมดาๆ แต่โดนเพื่อนจับเซ็นชื่อเข้าชมรมเครื่องเป่า และวงกำลังจะเข้าสู่การแข่งขันระดับประเทศ มีการแข่งขันกันในวงระหว่างรุ่นพี่กับเด็กใหม่ มีดราม่าออดิชันคัดเลือกตัวจริง บรรยากาศค่ำคืนหลังเลิกซ้อม เดินข้ามทางรถไฟกินไอติมบนสะพาน และคำสัญญาว่าจะเป็นคนที่พิเศษ...`
  },
  {
    id: 'pirates_legend',
    title: 'ตำนานโจรสลัด & คำสาปเหรียญทอง',
    subtitle: 'เรือจม • เข็มทิศไม่ชี้เหนือ • เหรียญแอซเท็ก • ดวลดาบ',
    lore: `กัปตันโจรสลัดที่เรือเล็กกำลังจมน้ำเทียบท่า พกเข็มทิศที่ไม่เคยชี้ทิศเหนือและปืนที่มีกระสุนแค่นัดเดียว เข้าไปพัวพันกับการดวลดาบในโรงตีเหล็ก และการตามล่าหาเรือในตำนานแบล็กเพิร์ล ท่ามกลางคำสาปเหรียญทองคำที่เปลี่ยนคนเป็นโครงกระดูกใต้แสงจันทร์...`
  }
]

export function WorldStudioView({
  macroWorldLore,
  onMacroWorldLoreChange,
  sparkText,
  onSparkChange,
  cabinetCards,
  pinnedCardIds,
  onTogglePin,
  onDeleteCabinetCard,
  onSaveCardsToCabinet,
  onEnterStage,
  onBackToHome,
}: WorldStudioViewProps) {
  const [cabinetSearchQuery, setCabinetSearchQuery] = useState('')
  const [isSprouting, setIsSprouting] = useState(false)
  const [isExtractingSpark, setIsExtractingSpark] = useState(false)
  const [sproutedCards, setSproutedCards] = useState<LoreCard[]>([])
  const [activeTab, setActiveTab] = useState<'canvas' | 'cards'>('canvas')
  const [justSavedNotification, setJustSavedNotification] = useState(false)

  // Filter cabinet cards
  const filteredCabinetCards = cabinetCards.filter(c => {
    const q = cabinetSearchQuery.trim().toLowerCase()
    if (!q) return true
    return (
      c.title.toLowerCase().includes(q) ||
      c.content.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q))
    )
  })

  // 1. Sprout Lore Cards (Call backend dissect)
  const handleSproutCards = async () => {
    if (!macroWorldLore.trim() || isSprouting) return
    setIsSprouting(true)
    try {
      let res: Response
      const payload = { raw_text: macroWorldLore, world_id: 'default_world' }
      try {
        res = await fetch('http://localhost:8000/api/sandbox/world/dissect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch {
        res = await fetch('https://the-soul-backend-330377476882.asia-southeast1.run.app/api/sandbox/world/dissect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (res.ok) {
        const data = await res.json()
        setSproutedCards(data.cards || [])
        setActiveTab('cards')
      }
    } catch (e) {
      console.error('Sprout failed:', e)
    } finally {
      setIsSprouting(false)
    }
  }

  // 2. Extract The Spark (Heuristic extraction or quick anchor)
  const handleExtractSpark = () => {
    if (!macroWorldLore.trim() || isExtractingSpark) return
    setIsExtractingSpark(true)
    setTimeout(() => {
      // Pick first 2 impactful sentences as spark anchor if spark is empty
      const sentences = macroWorldLore
        .split(/[.\n]/)
        .map(s => s.trim())
        .filter(Boolean)
      const extracted = sentences.slice(0, 2).join(' ')
      if (extracted) {
        onSparkChange(extracted)
      }
      setIsExtractingSpark(false)
    }, 400)
  }

  // 3. Save Sprouted Cards to Cabinet
  const handleSaveSproutedToCabinet = async () => {
    if (sproutedCards.length === 0) return
    await onSaveCardsToCabinet(sproutedCards)
    setJustSavedNotification(true)
    setTimeout(() => setJustSavedNotification(false), 2500)
  }

  const handleUpdateSproutedCard = (idx: number, field: keyof LoreCard, value: any) => {
    setSproutedCards(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  const handleDeleteSproutedCard = (idx: number) => {
    setSproutedCards(prev => prev.filter((_, i) => i !== idx))
  }

  const handleAddManualCard = () => {
    const newCard: LoreCard = {
      id: `card_manual_${Date.now()}`,
      title: 'การ์ดวัตถุดิบใหม่',
      category: 'lore',
      summary: '',
      content: '',
      tags: ['คีย์เวิร์ด'],
      created_at: Math.floor(Date.now() / 1000),
    }
    setSproutedCards(prev => [newCard, ...prev])
    setActiveTab('cards')
  }

  return (
    <div className="w-full h-screen flex flex-col bg-[#0B0B0C] text-[#F1F1F1] select-none overflow-hidden font-sans">
      
      {/* 1. Master Navigation Header */}
      <header className="h-14 px-6 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#0E0E10]/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToHome}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="กลับหน้าหลัก"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="h-4 w-[1px] bg-white/10" />

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <span className="text-[15px] font-semibold tracking-tight text-[#F1F1F1]">
              The World Studio
            </span>
            <span className="text-[10px] font-mono text-white/40 uppercase px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10">
              Studio-First Mode
            </span>
          </div>
        </div>

        {/* Center Mode Tabs: Canvas vs Sprouted Cards */}
        <div className="h-8 p-0.5 rounded-full bg-white/[0.04] border border-white/10 flex items-center gap-1 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('canvas')}
            className={`h-full px-3.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'canvas'
                ? 'bg-white/15 text-white font-medium shadow-sm'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <span>ผืนผ้าใบต้นฉบับ</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`h-full px-3.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cards'
                ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30 font-medium shadow-sm'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <span>การ์ดที่แตกแขนง</span>
            {sproutedCards.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-purple-500 text-[9px] font-mono flex items-center justify-center text-white">
                {sproutedCards.length}
              </span>
            )}
          </button>
        </div>

        {/* Right CTA: Action / Enter Stage Button */}
        <div className="flex items-center gap-3">
          {pinnedCardIds.length > 0 && (
            <span className="text-[11px] font-mono text-amber-300/80 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 flex items-center gap-1">
              <Pin size={10} className="fill-amber-300" />
              <span>{pinnedCardIds.length} การ์ดประจำฉาก</span>
            </span>
          )}

          <button
            type="button"
            onClick={onEnterStage}
            className="h-9 px-4 rounded-full bg-gradient-to-r from-[#EF264C] to-purple-600 hover:from-[#f43f5e] hover:to-purple-500 text-white font-medium text-[12.5px] transition-all cursor-pointer shadow-lg shadow-[#EF264C]/25 flex items-center gap-2 active:scale-95"
          >
            <Play size={13} className="fill-white" />
            <span>ก้าวขึ้นสู่เวที (Enter Stage)</span>
          </button>
        </div>
      </header>

      {/* 2. Workspace Body: Left Cabinet Sidebar + Center Master Canvas */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column: The World Cabinet (ตู้ลิ้นชักการ์ดโลก) */}
        <aside className="w-[300px] border-r border-white/[0.08] flex flex-col bg-[#0F0F11] shrink-0">
          {/* Cabinet Header */}
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={15} className="text-[#38bdf8]" />
              <span className="text-[13px] font-semibold text-[#F1F1F1]">
                ตู้คลังวัตถุดิบ
              </span>
              <span className="text-[10px] font-mono text-white/40 px-1.5 py-0.5 rounded bg-white/[0.04]">
                {cabinetCards.length}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddManualCard}
              className="w-6 h-6 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="เพิ่มการ์ดใหม่ด้วยตนเอง"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Cabinet Search */}
          <div className="px-3 pt-3 pb-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={cabinetSearchQuery}
                onChange={(e) => setCabinetSearchQuery(e.target.value)}
                placeholder="ค้นหาการ์ดในคลัง..."
                className="w-full pl-7 pr-2.5 py-1 text-[11px] bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-[#38bdf8]/40"
              />
            </div>
          </div>

          {/* Cabinet Cards List */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
            {filteredCabinetCards.length === 0 ? (
              <div className="py-12 text-center text-white/30 text-[11.5px] px-4 leading-relaxed">
                ตู้คลังยังว่างเปล่า<br />
                พิมพ์เรื่องราวตรงกลางแล้วกดปุ่ม <span className="text-purple-300">แตกแขนงไอเดีย</span> เพื่อเริ่มเก็บการ์ด
              </div>
            ) : (
              filteredCabinetCards.map(card => {
                const meta = CATEGORY_META[card.category] || CATEGORY_META.lore
                const IconComp = meta.icon
                const isPinned = pinnedCardIds.includes(card.id)

                return (
                  <div
                    key={card.id}
                    className={`p-2.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                      isPinned
                        ? 'bg-amber-400/[0.06] border-amber-400/35 shadow-sm'
                        : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono flex items-center gap-1 ${meta.bg} ${meta.color}`}>
                        <IconComp size={9} />
                        <span>{meta.label}</span>
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onTogglePin(card.id)}
                          className={`p-1 rounded transition-all cursor-pointer ${
                            isPinned
                              ? 'text-amber-300 bg-amber-400/15'
                              : 'text-white/25 hover:text-white hover:bg-white/10'
                          }`}
                          title={isPinned ? 'ปลดหมุดออกจากฉาก' : 'ปักหมุดเป็น Slot 1 ประจำฉาก'}
                        >
                          <Pin size={11} className={isPinned ? 'fill-amber-300' : ''} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteCabinetCard(card.id)}
                          className="p-1 rounded text-white/20 hover:text-rose-400 hover:bg-white/10 transition-all cursor-pointer"
                          title="ลบออกจากคลัง"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    <div className="text-[12px] font-medium text-[#F1F1F1] truncate">
                      {card.title}
                    </div>

                    <div className="text-[10.5px] text-white/50 line-clamp-2 leading-relaxed font-sans">
                      {card.content}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </aside>

        {/* Center Stage: The Master Canvas & Sprouted Cards */}
        <main className="flex-1 overflow-y-auto p-8 flex justify-center bg-[#0B0B0C]">
          <div className="w-full max-w-3xl space-y-6">

            {/* Notification when saved */}
            {justSavedNotification && (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-[12px] flex items-center gap-2 animate-in fade-in duration-150">
                <Check size={14} className="text-emerald-400" />
                <span>บันทึกการ์ดทั้งหมดเข้าตู้คลังใน Upstash Redis เรียบร้อยแล้ว!</span>
              </div>
            )}

            {activeTab === 'canvas' ? (
              /* TAB 1: THE MASTER SCRATCHPAD */
              <div className="space-y-6">
                
                {/* Poetic Question Header */}
                <div className="space-y-1.5 pt-2">
                  <h2 className="text-[26px] sm:text-[28px] font-bold text-[#F1F1F1] tracking-tight leading-tight">
                    ทั้งหมดนี้เป็นเรื่องราวเกี่ยวกับอะไร...
                  </h2>
                  <p className="text-[13px] text-white/50 leading-relaxed">
                    พิมพ์พรั่งพรูไอเดีย กฎเกณฑ์ ปมขัดแย้ง หรือผู้คนในโลกใบนี้ได้อย่างอิสระ... จากนั้นให้ AI ช่วยสกัดและแตกแขนงเป็นการ์ดเข้าคลัง
                  </p>
                </div>

                {/* Quick Presets Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-[10.5px] font-mono text-white/30 uppercase shrink-0">แม่แบบ:</span>
                  {QUICK_WORLD_PRESETS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onMacroWorldLoreChange(p.lore)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer whitespace-nowrap active:scale-95"
                    >
                      {p.title}
                    </button>
                  ))}
                </div>

                {/* The Big Centerpiece Textarea */}
                <div className="rounded-2xl p-1 bg-white/[0.02] border border-white/10 shadow-2xl focus-within:border-amber-400/40 transition-all">
                  <textarea
                    rows={10}
                    value={macroWorldLore}
                    onChange={(e) => onMacroWorldLoreChange(e.target.value)}
                    placeholder="เล่าเรื่องราวทั้งหมดที่อยู่ในหัวของคุณออกมาได้เลย... เช่น เป็นโรงเรียนเวทมนตร์ 100 ปี มีการแบ่งบ้าน มีระบบสะสมคะแนนจากนาฬิกาทราย หอนอนแยกชายหญิง กฎเคอร์ฟิวห้ามออกจากห้องหลัง 4 ทุ่ม และมีมิตรภาพของเพื่อน..."
                    className="w-full p-4 bg-transparent text-[14px] text-[#F1F1F1] placeholder-white/20 focus:outline-none resize-none leading-relaxed font-sans"
                  />
                  
                  {/* Footer inside canvas: Action Buttons */}
                  <div className="p-3 border-t border-white/[0.06] flex items-center justify-between gap-3 bg-black/20 rounded-b-xl">
                    <span className="text-[11px] font-mono text-white/35">
                      {macroWorldLore.length} ตัวอักษร
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Action 1: Extract Spark */}
                      <button
                        type="button"
                        onClick={handleExtractSpark}
                        disabled={isExtractingSpark || !macroWorldLore.trim()}
                        className={`px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all cursor-pointer flex items-center gap-1.5 border active:scale-95 ${
                          isExtractingSpark
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                            : 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-200 border-amber-400/25'
                        }`}
                        title="สกัดแก่นชนวนเหตุแรกที่ทำให้ทุกอย่างหมุน"
                      >
                        <Zap size={13} className="text-amber-400" />
                        <span>{isExtractingSpark ? 'กำลังสกัด...' : '⚡ สกัด The Spark'}</span>
                      </button>

                      {/* Action 2: Sprout Lore Cards */}
                      <button
                        type="button"
                        onClick={handleSproutCards}
                        disabled={isSprouting || !macroWorldLore.trim()}
                        className={`px-4 py-1.5 rounded-xl text-[12px] font-medium transition-all cursor-pointer flex items-center gap-1.5 border shadow-lg active:scale-95 ${
                          isSprouting
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 cursor-wait'
                            : 'bg-purple-500 hover:bg-purple-600 text-white border-purple-400/50 shadow-purple-500/20'
                        }`}
                        title="ให้ AI ช่วยอ่านและแยกแยะเรื่องราวออกมาเป็นการ์ดวัตถุดิบเข้าคลัง"
                      >
                        <Sparkles size={13} className={isSprouting ? 'animate-spin' : ''} />
                        <span>{isSprouting ? 'กำลังแตกแขนง...' : '🌱 แตกแขนงไอเดีย (Sprout)'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* The Spark Display (If extracted) */}
                {sparkText && (
                  <div className="rounded-2xl p-4 bg-amber-400/[0.04] border border-amber-400/25 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-amber-300">
                      <span className="flex items-center gap-1.5">
                        <Flame size={13} className="text-amber-400" />
                        <span>จุดเริ่มต้นที่ทำให้ทุกอย่างหมุน (The Inciting Spark)</span>
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={sparkText}
                      onChange={(e) => onSparkChange(e.target.value)}
                      placeholder="ชนวนเหตุแรก..."
                      className="w-full bg-black/25 p-2.5 rounded-xl border border-white/10 text-[12.5px] text-white/90 focus:outline-none focus:border-amber-400/40 resize-none leading-relaxed font-sans"
                    />
                  </div>
                )}

              </div>
            ) : (
              /* TAB 2: SPROUTED CARDS REVIEW TRAY */
              <div className="space-y-6">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[22px] font-bold text-[#F1F1F1] tracking-tight">
                      การ์ดวัตถุดิบที่แตกแขนงออกมา
                    </h3>
                    <p className="text-[12px] text-white/50 mt-0.5">
                      ตรวจเช็กและแก้ไขเนื้อหาได้อิสระ ก่อนกดบันทึกเข้าตู้คลังจริง
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddManualCard}
                      className="px-3 py-1.5 rounded-xl text-[11.5px] font-medium bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus size={13} />
                      <span>เพิ่มการ์ด</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveSproutedToCabinet}
                      disabled={sproutedCards.length === 0}
                      className="px-4 py-1.5 rounded-xl text-[12px] font-medium bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <Save size={13} />
                      <span>บันทึกเข้าตู้คลัง ({sproutedCards.length} ใบ)</span>
                    </button>
                  </div>
                </div>

                {/* Bento Grid of Sprouted Cards */}
                {sproutedCards.length === 0 ? (
                  <div className="py-20 text-center text-white/30 text-[13px]">
                    ยังไม่มีการ์ดที่แตกแขนง<br />
                    สลับกลับไปที่ <span className="text-amber-300">ผืนผ้าใบต้นฉบับ</span> แล้วกดปุ่ม 🌱 แตกแขนงไอเดีย
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sproutedCards.map((card, idx) => {
                      const meta = CATEGORY_META[card.category] || CATEGORY_META.lore
                      const IconComp = meta.icon

                      return (
                        <div
                          key={card.id || idx}
                          className="rounded-2xl p-4 bg-white/[0.03] border border-white/[0.08] flex flex-col gap-3 group relative"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono flex items-center gap-1 ${meta.bg} ${meta.color} border ${meta.border}`}>
                              <IconComp size={10} />
                              <span>{meta.label}</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => handleDeleteSproutedCard(idx)}
                              className="text-white/20 hover:text-rose-400 p-1 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                              title="ลบการ์ดนี้"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => handleUpdateSproutedCard(idx, 'title', e.target.value)}
                            placeholder="ชื่อการ์ด..."
                            className="w-full text-[13.5px] font-semibold text-[#F1F1F1] bg-black/25 px-2.5 py-1.5 rounded-lg border border-white/10 focus:border-purple-400/50 focus:outline-none"
                          />

                          <textarea
                            rows={4}
                            value={card.content}
                            onChange={(e) => handleUpdateSproutedCard(idx, 'content', e.target.value)}
                            placeholder="เนื้อหาของการ์ด..."
                            className="w-full text-[12px] text-white/80 bg-black/25 px-2.5 py-2 rounded-lg border border-white/10 focus:border-purple-400/50 focus:outline-none resize-none leading-relaxed font-sans"
                          />

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Tag size={11} className="text-white/30 shrink-0" />
                            {card.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[10px] font-mono text-white/60"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

              </div>
            )}

          </div>
        </main>

      </div>
    </div>
  )
}
export default WorldStudioView
