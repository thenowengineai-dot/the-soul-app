import { useState, useMemo } from 'react'
import {
  X,
  Search,
  Pin,
  Trash2,
  BookOpen,
  Shield,
  MapPin,
  Scroll,
  BookMarked
} from 'lucide-react'
import type { LoreCard } from '../types'

interface WorldCabinetDrawerProps {
  isOpen: boolean
  onClose: () => void
  cards: LoreCard[]
  pinnedCardIds: string[]
  onTogglePin: (cardId: string) => void
  onDeleteCard: (cardId: string) => Promise<void>
}

const CATEGORY_META: Record<string, { label: string; color: string; border: string; bg: string; icon: typeof Shield }> = {
  faction: {
    label: 'การแบ่งขั้ว',
    color: 'text-indigo-300',
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/10',
    icon: Shield,
  },
  location: {
    label: 'สถานที่',
    color: 'text-emerald-300',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    icon: MapPin,
  },
  rule: {
    label: 'กฎเกณฑ์',
    color: 'text-amber-300',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    icon: Scroll,
  },
  lore: {
    label: 'ตำนาน / ปริศนา',
    color: 'text-purple-300',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    icon: BookMarked,
  },
}

export function WorldCabinetDrawer({
  isOpen,
  onClose,
  cards,
  pinnedCardIds,
  onTogglePin,
  onDeleteCard,
}: WorldCabinetDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const matchCat = selectedCategory === 'all' || card.category === selectedCategory
      const query = searchQuery.trim().toLowerCase()
      if (!query) return matchCat

      const matchTitle = card.title.toLowerCase().includes(query)
      const matchContent = card.content.toLowerCase().includes(query)
      const matchTags = card.tags.some(t => t.toLowerCase().includes(query))
      return matchCat && (matchTitle || matchContent || matchTags)
    })
  }, [cards, selectedCategory, searchQuery])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-[28px] bg-[#141416] border border-white/10 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.08] shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
              <BookOpen size={16} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[17px] font-semibold text-[#F1F1F1] tracking-tight">
                  ตู้ลิ้นชักคลังวัตถุดิบโลก (The World Cabinet)
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/25">
                  {cards.length} การ์ดในคลัง
                </span>
                {pinnedCardIds.length > 0 && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/25">
                    {pinnedCardIds.length} การ์ดประจำฉาก (Pinned)
                  </span>
                )}
              </div>
              <p className="text-[11.5px] text-white/50 mt-0.5">
                เลือกปักหมุดการ์ดเพื่อนำไปเป็น 'การ์ดประจำฉาก (Slot 1)' ให้ AI Director ใช้งาน
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

        {/* Toolbar: Category Filter & Search Input */}
        <div className="px-6 py-3 border-b border-white/[0.06] flex items-center justify-between gap-4 bg-white/[0.01]">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-mono">
            {['all', 'faction', 'location', 'rule', 'lore'].map(cat => {
              const label = cat === 'all' ? 'ทั้งหมด' : CATEGORY_META[cat]?.label || cat
              const isActive = selectedCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white/15 text-white font-medium border border-white/20'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-64">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาตามชื่อ หรือแท็ก..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/30 border border-white/10 text-[11.5px] text-white placeholder-white/25 focus:outline-none focus:border-[#38bdf8]/40"
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredCards.length === 0 ? (
            <div className="py-16 text-center text-white/30 text-[13px] font-sans">
              ไม่พบการ์ดวัตถุดิบในหมวดนี้
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredCards.map(card => {
                const meta = CATEGORY_META[card.category] || CATEGORY_META.lore
                const IconComp = meta.icon
                const isPinned = pinnedCardIds.includes(card.id)

                return (
                  <div
                    key={card.id}
                    className={`rounded-2xl p-4 transition-all flex flex-col justify-between gap-3 border ${
                      isPinned
                        ? 'bg-amber-400/[0.05] border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.06)]'
                        : 'bg-white/[0.03] hover:bg-white/[0.05] border-white/[0.08]'
                    }`}
                  >
                    <div>
                      {/* Card Top: Category + Delete */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono flex items-center gap-1 ${meta.bg} ${meta.color} border ${meta.border}`}>
                          <IconComp size={10} />
                          <span>{meta.label}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => onDeleteCard(card.id)}
                          className="text-white/25 hover:text-rose-400 p-1 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                          title="ลบการ์ดนี้ออกจากตู้คลัง"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* Title */}
                      <h4 className="text-[13.5px] font-semibold text-[#F1F1F1] tracking-tight">
                        {card.title}
                      </h4>

                      {/* Content */}
                      <p className="text-[11.5px] text-white/70 mt-1 leading-relaxed line-clamp-3">
                        {card.content}
                      </p>

                      {/* Tags */}
                      {card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {card.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono text-white/50 bg-white/[0.04] border border-white/5"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action: Pin / Unpin Button */}
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-white/30">
                        ID: {card.id}
                      </span>

                      <button
                        type="button"
                        onClick={() => onTogglePin(card.id)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 border active:scale-95 ${
                          isPinned
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-sm'
                            : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white border-white/10'
                        }`}
                      >
                        <Pin size={11} className={isPinned ? 'fill-amber-300 text-amber-300' : ''} />
                        <span>{isPinned ? 'ปักหมุดแล้ว (Active)' : 'ปักหมุดประจำฉาก'}</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] flex items-center justify-end shrink-0 bg-white/[0.02]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-[12px] font-medium bg-white/10 hover:bg-white/15 text-white transition-all cursor-pointer"
          >
            ปิดตู้คลัง
          </button>
        </div>

      </div>
    </div>
  )
}
export default WorldCabinetDrawer
