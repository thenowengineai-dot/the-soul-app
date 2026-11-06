import React from 'react'
import {
  Search,
  X,
  CheckCircle2,
  Save,
  Trash2,
} from 'lucide-react'
import type { LoreCard } from '../../../types'

interface StudioCabinetViewProps {
  savedCabinetCardsCount: number
  filteredCabinetCards: LoreCard[]
  cabinetSearchQuery: string
  onSearchChange: (q: string) => void
  activeTagPopoverCardId: string | null
  renderCardTags: (card: LoreCard, noteId?: string, extraBadge?: React.ReactNode) => React.ReactNode
  onToggleChildCardSaveState: (sourceNoteId: string, card: LoreCard) => Promise<void>
  handleDeleteCardFromCabinetView: (cardId: string, sourceNoteId?: string) => Promise<void>
  handleUpdateCardEverywhere: (cardId: string, updates: Partial<LoreCard>, sourceNoteId?: string) => void
}

export const StudioCabinetView: React.FC<StudioCabinetViewProps> = ({
  savedCabinetCardsCount,
  filteredCabinetCards,
  cabinetSearchQuery,
  onSearchChange,
  activeTagPopoverCardId,
  renderCardTags,
  onToggleChildCardSaveState,
  handleDeleteCardFromCabinetView,
  handleUpdateCardEverywhere,
}) => {
  return (
    <div className="space-y-6 sm:space-y-7 animate-in fade-in duration-150">
      {/* Header Bar: Title on left, Minimalist Apple Search Capsule on right */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <span className="text-[18px] sm:text-[20px] font-medium text-[#F1F1F1]">
            ตู้ลิ้นชัก
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-white/[0.06] text-white/50 border border-white/[0.06]">
            {savedCabinetCardsCount}
          </span>
        </div>

        {/* Apple-style Minimal Search Capsule */}
        <div className="relative flex items-center w-48 sm:w-64 bg-white/[0.04] hover:bg-white/[0.06] focus-within:bg-white/[0.07] border border-white/[0.08] focus-within:border-white/20 rounded-full px-3 py-1.5 transition-all">
          <Search size={13} className="text-white/40 shrink-0 mr-2" />
          <input
            type="text"
            value={cabinetSearchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ค้นหาการ์ดที่เซฟ..."
            className="w-full text-[12px] text-[#F1F1F1] bg-transparent focus:outline-none placeholder-white/30 font-sans"
          />
          {cabinetSearchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-white/30 hover:text-white ml-1 cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {filteredCabinetCards.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-white/[0.06] text-center text-white/30 text-[12.5px]">
          {cabinetSearchQuery.trim()
            ? `ไม่พบการ์ดที่ตรงกับ "${cabinetSearchQuery}"`
            : 'ยังไม่มีการ์ดที่บันทึกเข้าตู้ลิ้นชัก'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {filteredCabinetCards.map(card => {
            const isPopoverOpen = activeTagPopoverCardId === card.id
            return (
              <div
                key={card.id}
                className={`rounded-2xl p-5 sm:p-5.5 border border-white/[0.09] hover:border-white/[0.18] transition-all flex flex-col justify-between group backdrop-blur-md bg-[#141416]/75 hover:bg-[#141416]/85 relative h-[255px] sm:h-[265px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_35px_rgba(0,0,0,0.45)] ${
                  isPopoverOpen ? 'overflow-visible z-30' : 'overflow-hidden z-10'
                }`}
              >
                {/* Top Subtle Accent Bar (Gray idle -> Carmine Red on hover) */}
                <div className="absolute top-0 left-6 w-10 sm:w-12 h-[2px] bg-white/20 group-hover:bg-[#EF264C] rounded-b transition-colors" />

                <div className={`space-y-3 flex-1 flex flex-col h-full ${
                  isPopoverOpen ? 'overflow-visible' : 'overflow-hidden'
                }`}>
                  {/* Top Bar: Free-form Tags on Left, Status Pill & Delete on Right */}
                  <div className="flex items-center justify-between gap-2 shrink-0">
                    {/* Free-form Tags & Source Note Origin */}
                    {renderCardTags(
                      card,
                      card.sourceNoteId,
                      card.sourceNoteTitle ? (
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono text-white/30 bg-white/[0.02] border border-white/[0.05] truncate max-w-[130px]"
                          title={`มาจากส่วนขยาย: ${card.sourceNoteTitle}`}
                        >
                          {card.sourceNoteTitle}
                        </span>
                      ) : null
                    )}

                    {/* Status Action: รอเข้าตู้ / เข้าตู้ลิ้นชัก ⇄ ในตู้ลิ้นชัก */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {card.isSavedToCabinet ? (
                        <button
                          type="button"
                          onClick={() => onToggleChildCardSaveState(card.sourceNoteId || '', card)}
                          className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-500/50 flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                          title="คลิกเพื่อเปลี่ยนกลับเป็น draft"
                        >
                          <CheckCircle2 size={11} className="text-emerald-400" />
                          <span>ในตู้ลิ้นชัก</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onToggleChildCardSaveState(card.sourceNoteId || '', card)}
                          className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono bg-white/[0.06] hover:bg-rose-500/20 text-white/50 hover:text-rose-200 border border-white/[0.10] hover:border-rose-500/40 flex items-center gap-1 transition-all cursor-pointer active:scale-95 group/btn"
                          title="save เข้าตู้ลิ้นชัก"
                        >
                          <Save size={11} className="text-white/40 group-hover/btn:text-rose-300 transition-colors" />
                          <span className="group-hover/btn:hidden">รอเข้าตู้</span>
                          <span className="hidden group-hover/btn:inline">เข้าตู้ลิ้นชัก</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteCardFromCabinetView(card.id, card.sourceNoteId)}
                        className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-400 p-1 rounded-md hover:bg-white/[0.04] transition-all cursor-pointer"
                        title="ลบการ์ดนี้"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Pure Markdown Title (Seamless, Borderless) */}
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => handleUpdateCardEverywhere(card.id, { title: e.target.value }, card.sourceNoteId)}
                    placeholder="ชื่อการ์ด..."
                    className="w-full text-[15px] font-medium text-[#F1F1F1] bg-transparent outline-none border-none p-0 placeholder-white/20 shrink-0"
                  />

                  {/* Pure Markdown Content (Locked Scrollable Area) */}
                  <textarea
                    value={card.content}
                    onChange={(e) => handleUpdateCardEverywhere(card.id, { content: e.target.value }, card.sourceNoteId)}
                    placeholder="เขียนเนื้อหาหรือสกัดเป็นวัตถุดิบย่อย..."
                    className="w-full text-[13px] text-white/75 bg-transparent outline-none resize-none leading-relaxed font-sans placeholder-white/20 border-none p-0 flex-1 overflow-y-auto"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
