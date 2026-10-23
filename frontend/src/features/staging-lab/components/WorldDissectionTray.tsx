import { useState } from 'react'
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Save,
  Tag,
  Shield,
  MapPin,
  Scroll,
  BookMarked
} from 'lucide-react'
import type { LoreCard } from '../types'

interface WorldDissectionTrayProps {
  isOpen: boolean
  onClose: () => void
  initialCards: LoreCard[]
  latencyMs?: number
  modelName?: string
  onSaveToCabinet: (cards: LoreCard[]) => Promise<void>
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

export function WorldDissectionTray({
  isOpen,
  onClose,
  initialCards,
  latencyMs = 0,
  modelName = 'gemini-3.8-flash',
  onSaveToCabinet,
}: WorldDissectionTrayProps) {
  const [cards, setCards] = useState<LoreCard[]>(initialCards)
  const [isSaving, setIsSaving] = useState(false)

  const handleUpdateCard = (idx: number, field: keyof LoreCard, value: any) => {
    setCards(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  const handleDeleteCard = (idx: number) => {
    setCards(prev => prev.filter((_, i) => i !== idx))
  }

  const handleAddCard = () => {
    const newCard: LoreCard = {
      id: `card_custom_${Date.now()}`,
      title: 'การ์ดวัตถุดิบใหม่',
      category: 'lore',
      summary: '',
      content: '',
      tags: ['คีย์เวิร์ด'],
      created_at: Math.floor(Date.now() / 1000),
    }
    setCards(prev => [...prev, newCard])
  }

  const handleSave = async () => {
    if (cards.length === 0) return
    setIsSaving(true)
    try {
      await onSaveToCabinet(cards)
      onClose()
    } catch (e) {
      console.error('Failed to save to cabinet:', e)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-[28px] bg-[#141416] border border-white/10 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.08] shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Sparkles size={16} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[17px] font-semibold text-[#F1F1F1] tracking-tight">
                  ถาดตรวจรับการ์ดวัตถุดิบ (Lore Dissection Tray)
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25">
                  {cards.length} การ์ดที่สกัดได้
                </span>
              </div>
              <p className="text-[11.5px] text-white/50 mt-0.5">
                AI สกัดเนื้อเรื่องออกเป็นชิ้นส่วนย่อย ตรวจเช็กและแก้ไขข้อความก่อนนำเข้าตู้คลังจริง
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Cards Tray */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {cards.map((card, idx) => {
              const meta = CATEGORY_META[card.category] || CATEGORY_META.lore
              const IconComp = meta.icon

              return (
                <div
                  key={card.id || idx}
                  className="rounded-2xl p-4 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] transition-all flex flex-col gap-3 group relative"
                >
                  {/* Card Header: Category + Title + Delete */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono flex items-center gap-1 ${meta.bg} ${meta.color} border ${meta.border}`}>
                        <IconComp size={10} />
                        <span>{meta.label}</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCard(idx)}
                      className="text-white/30 hover:text-rose-400 p-1 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                      title="ลบการ์ดใบนี้"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Title Input */}
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => handleUpdateCard(idx, 'title', e.target.value)}
                    placeholder="ชื่อการ์ด..."
                    className="w-full text-[14px] font-semibold text-[#F1F1F1] bg-black/25 px-2.5 py-1.5 rounded-lg border border-white/10 focus:border-purple-400/50 focus:outline-none"
                  />

                  {/* Content Textarea */}
                  <textarea
                    rows={4}
                    value={card.content}
                    onChange={(e) => handleUpdateCard(idx, 'content', e.target.value)}
                    placeholder="เนื้อหาของการ์ด..."
                    className="w-full text-[12px] text-white/80 bg-black/25 px-2.5 py-2 rounded-lg border border-white/10 focus:border-purple-400/50 focus:outline-none resize-none leading-relaxed font-sans"
                  />

                  {/* Tags Editor */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Tag size={11} className="text-white/30 shrink-0" />
                    {card.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[10.5px] font-mono text-white/60"
                      >
                        {tag}
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="+ เพิ่มแท็ก"
                      className="text-[10.5px] font-mono bg-transparent text-white/40 focus:text-white focus:outline-none w-20 px-1 border-b border-white/10 focus:border-purple-400"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const target = e.target as HTMLInputElement
                          const val = target.value.trim()
                          if (val && !card.tags.includes(val)) {
                            handleUpdateCard(idx, 'tags', [...card.tags, val])
                            target.value = ''
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Add New Card Button */}
          <button
            type="button"
            onClick={handleAddCard}
            className="w-full py-3 rounded-2xl border border-dashed border-white/15 hover:border-purple-400/40 bg-white/[0.01] hover:bg-purple-500/[0.05] text-[12px] font-medium text-white/50 hover:text-purple-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>เพิ่มการ์ดวัตถุดิบใหม่ด้วยตนเอง</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-white/[0.08] shrink-0 bg-white/[0.02]">
          <div className="text-[11px] font-mono text-white/40 flex items-center gap-2">
            <span>Model: {modelName}</span>
            {latencyMs > 0 && <span>• {latencyMs}ms</span>}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[12px] font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || cards.length === 0}
              className="px-4.5 py-2 rounded-xl text-[12px] font-medium bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/25 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 font-sans"
            >
              <Save size={14} />
              <span>{isSaving ? 'กำลังบันทึก...' : `บันทึกเข้าตู้คลัง (${cards.length} ใบ)`}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
export default WorldDissectionTray
