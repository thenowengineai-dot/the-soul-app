import React, { useRef, useEffect } from 'react'
import {
  Trash2,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Archive,
  Plus,
  Save,
} from 'lucide-react'
import type { ExpansionNote, LoreCard } from '../../../types'

interface StudioNoteViewProps {
  currentNote: ExpansionNote
  generatingNoteId: string | null
  isDissectingNote: boolean
  savingNoteToCabinetId: string | null
  activeTagPopoverCardId: string | null
  combinedWorldLore: string
  renderCardTags: (card: LoreCard, noteId?: string, extraBadge?: React.ReactNode) => React.ReactNode
  handleUpdateNote: (noteId: string, updates: Partial<ExpansionNote>) => void
  handleDeleteNote: (noteId: string) => void
  handleGenerateNoteContentFromTitle: (
    note: ExpansionNote,
    forceMode?: 'generate' | 'regenerate' | 'polish'
  ) => void
  handleToggleNoteCabinetSaveState: (note: ExpansionNote) => void
  handleDissectCurrentNote: (note: ExpansionNote) => void
  handleDeleteChildCard: (noteId: string, cardId: string) => void
  handleToggleChildCardSaveState: (noteId: string, card: LoreCard) => void
}

export const StudioNoteView: React.FC<StudioNoteViewProps> = ({
  currentNote,
  generatingNoteId,
  isDissectingNote,
  savingNoteToCabinetId,
  activeTagPopoverCardId,
  combinedWorldLore,
  renderCardTags,
  handleUpdateNote,
  handleDeleteNote,
  handleGenerateNoteContentFromTitle,
  handleToggleNoteCabinetSaveState,
  handleDissectCurrentNote,
  handleDeleteChildCard,
  handleToggleChildCardSaveState,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      const el = textareaRef.current
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
      const raf = requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
      })
      return () => cancelAnimationFrame(raf)
    }
  }, [currentNote.id, currentNote.content])

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Note Surface: Expansive, Borderless Typography, Smoked Glass Sanctuary */}
      <div
        className={`rounded-2xl p-6 sm:p-8 backdrop-blur-xl bg-[#141416]/80 hover:bg-[#141416]/85 border border-white/[0.12] hover:border-white/[0.18] space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_20px_45px_rgba(0,0,0,0.6)] relative group transition-all ${
          activeTagPopoverCardId === currentNote.id ? 'overflow-visible z-30' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <input
            type="text"
            value={currentNote.title}
            onChange={(e) => handleUpdateNote(currentNote.id, { title: e.target.value })}
            placeholder="ชื่อส่วนขยาย (เว้นว่างไว้ให้ AI ตั้งชื่อให้ตอนเก็บเข้าตู้ได้)..."
            className="w-full text-[24px] sm:text-[28px] font-semibold text-[#F1F1F1] bg-transparent outline-none border-none p-0 placeholder-white/20 leading-tight"
          />

          <div className="flex items-center gap-2 shrink-0">
            {(() => {
              const hasNoteContent = Boolean(currentNote.content.trim())
              const isNotePlayerEdited = Boolean(currentNote.isPlayerEdited && hasNoteContent)
              const isThisNoteGenerating = generatingNoteId === currentNote.id

              return (
                <>
                  <button
                    type="button"
                    onClick={() => handleGenerateNoteContentFromTitle(currentNote)}
                    disabled={
                      (!currentNote.title.trim() && !isNotePlayerEdited) ||
                      generatingNoteId !== null ||
                      (!combinedWorldLore && !isNotePlayerEdited)
                    }
                    className="h-[30px] px-3 rounded-full bg-[#EF264C]/15 hover:bg-[#EF264C]/25 border border-[#EF264C]/45 text-[#EF264C] text-[12px] font-medium flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed select-none"
                    title={
                      !hasNoteContent
                        ? 'ให้ AI เจนเนื้อหาส่วนขยายตามหัวข้อนี้จากเนื้อหาโลกหลัก'
                        : isNotePlayerEdited
                          ? 'นำเนื้อหาที่คุณพิมพ์ในกล่องนี้ไปจัดระเบียบ เรียบเรียงคำ และแต่งต่อให้เข้ากับโลกหลัก'
                          : 'เจนเนื้อหามุมมองใหม่จากหัวข้อเดิม'
                    }
                  >
                    {!hasNoteContent || isNotePlayerEdited ? (
                      <Sparkles size={12} className={isThisNoteGenerating ? 'animate-spin text-[#EF264C]' : ''} />
                    ) : (
                      <RefreshCw size={12} className={isThisNoteGenerating ? 'animate-spin text-[#EF264C]' : ''} />
                    )}
                    <span>
                      {isThisNoteGenerating
                        ? isNotePlayerEdited
                          ? 'กำลังเรียบเรียง...'
                        : hasNoteContent
                            ? 'กำลังเจนใหม่...'
                            : 'กำลังเจนเนื้อหา...'
                        : !hasNoteContent
                          ? 'เจนเนื้อหา'
                          : isNotePlayerEdited
                            ? 'เรียบเรียงเนื้อหา'
                            : 'เจนเนื้อหาใหม่'}
                    </span>
                  </button>

                  {isNotePlayerEdited && currentNote.title.trim() && combinedWorldLore && (
                    <button
                      type="button"
                      onClick={() => handleGenerateNoteContentFromTitle(currentNote, 'regenerate')}
                      disabled={generatingNoteId !== null}
                      className="w-[30px] h-[30px] rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.10] hover:border-[#EF264C]/45 text-white/50 hover:text-[#EF264C] flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed shrink-0"
                      title="เจนเนื้อหาใหม่จากหัวข้อเดิม (ล้างข้อความที่พิมพ์)"
                    >
                      <RefreshCw size={12} />
                    </button>
                  )}
                </>
              )
            })()}

            {/* Subtle, Discreet Delete Note Button */}
            <button
              type="button"
              onClick={() => handleDeleteNote(currentNote.id)}
              className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/[0.04] transition-all cursor-pointer shrink-0"
              title="ลบโน้ตนี้"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Note Content Textarea (Auto-stretches to Unlimited Length) */}
        <textarea
          ref={textareaRef}
          rows={6}
          value={currentNote.content}
          onInput={(e) => {
            e.currentTarget.style.height = 'auto'
            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
          }}
          onChange={(e) =>
            handleUpdateNote(currentNote.id, {
              content: e.target.value,
              isPlayerEdited: Boolean(e.target.value.trim()),
            })
          }
          placeholder="พิมพ์ขยายความรายละเอียดของส่วนขยายนี้ได้อย่างอิสระ..."
          className="w-full text-[15px] sm:text-[16px] text-[#F1F1F1] bg-transparent focus:outline-none resize-none leading-relaxed font-sans placeholder-white/20 border-none p-0 min-h-[140px] overflow-hidden"
        />

        {/* Bottom Bar of Main Expansion Card: Left = #Tags, Right = Direct Save to Cabinet */}
        <div className="pt-4 mt-2 border-t border-white/[0.08] flex items-center justify-between gap-3 flex-wrap">
          {renderCardTags(
            {
              id: currentNote.id,
              title: currentNote.title,
              category: currentNote.category || 'lore',
              summary: currentNote.summary,
              content: currentNote.content,
              tags: currentNote.tags || [],
              isSavedToCabinet: currentNote.isSavedToCabinet,
              sourceNoteId: currentNote.id,
            },
            currentNote.id
          )}

          <div className="flex items-center gap-2 shrink-0">
            {savingNoteToCabinetId === currentNote.id ? (
              <button
                type="button"
                disabled
                className="h-[30px] px-3.5 rounded-full text-[11.5px] font-medium bg-[#EF264C]/15 text-[#EF264C] border border-[#EF264C]/45 flex items-center gap-1.5 opacity-80 cursor-wait select-none"
              >
                <Sparkles size={12} className="animate-spin text-[#EF264C]" />
                <span>กำลังตั้งชื่อและเก็บเข้าตู้...</span>
              </button>
            ) : currentNote.isSavedToCabinet ? (
              <button
                type="button"
                onClick={() => handleToggleNoteCabinetSaveState(currentNote)}
                className="h-[30px] px-3.5 rounded-full text-[11.5px] font-medium bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-500/50 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 select-none"
                title="เก็บอยู่ในตู้ลิ้นชักแล้ว (คลิกเพื่อนำออกจากตู้ลิ้นชัก)"
              >
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span>ในตู้ลิ้นชัก</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleToggleNoteCabinetSaveState(currentNote)}
                disabled={!currentNote.content.trim() && !currentNote.title.trim()}
                className="h-[30px] px-3.5 rounded-full text-[11.5px] font-medium bg-white/[0.06] hover:bg-[#EF264C]/20 text-white/75 hover:text-[#F1F1F1] border border-white/[0.12] hover:border-[#EF264C]/50 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group/save select-none"
                title="ดึงการ์ดหลักใบนี้เข้าตู้ลิ้นชักโดยตรง (หากยังไม่มีชื่อหัวข้อ AI จะตั้งชื่อและติดแท็กให้อัตโนมัติ)"
              >
                <Archive size={12} className="text-white/50 group-hover/save:text-[#EF264C] transition-colors" />
                <span>เก็บเข้าตู้ลิ้นชัก</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Optional Sub-Cards Section: "แยกการ์ดย่อยเพิ่มเติม" */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-white/60">
              แยกการ์ดย่อยเพิ่มเติม
            </span>
            {currentNote.childCards.length > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10.5px] font-mono bg-white/[0.06] text-white/50">
                {currentNote.childCards.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* สกัดการ์ดย่อย Button */}
            <button
              type="button"
              onClick={() => handleDissectCurrentNote(currentNote)}
              disabled={isDissectingNote || !currentNote.content.trim()}
              className="px-3 py-1 rounded-full text-[11.5px] bg-white/[0.04] hover:bg-rose-500/20 text-white/60 hover:text-rose-200 border border-white/[0.09] hover:border-rose-500/40 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed select-none"
              title="ให้ AI ช่วยหั่นเนื้อหาในโน้ตนี้แยกออกเป็นหลายการ์ดย่อย"
            >
              <Sparkles size={11} className={isDissectingNote ? 'animate-spin text-rose-300' : 'text-white/40'} />
              <span>{isDissectingNote ? 'กำลังสกัด...' : 'สกัดการ์ดย่อย'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const newChild: LoreCard = {
                  id: `child_manual_${Date.now()}`,
                  title: 'การ์ดย่อยใหม่',
                  category: 'lore',
                  content: '',
                  tags: ['วัตถุดิบ'],
                  isSavedToCabinet: false,
                  sourceNoteId: currentNote.id,
                }
                handleUpdateNote(currentNote.id, {
                  childCards: [newChild, ...currentNote.childCards],
                })
              }}
              className="px-3 py-1 rounded-full text-[11.5px] bg-white/[0.04] hover:bg-white/[0.10] text-white/60 hover:text-white border border-white/[0.09] transition-all cursor-pointer flex items-center gap-1 active:scale-95 select-none"
              title="เพิ่มการ์ดย่อยใหม่ด้วยตัวเอง"
            >
              <Plus size={12} />
              <span>เพิ่มการ์ดย่อย</span>
            </button>
          </div>
        </div>

        {currentNote.childCards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {currentNote.childCards.map((card) => {
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

                  <div
                    className={`space-y-3 flex-1 flex flex-col h-full ${
                      isPopoverOpen ? 'overflow-visible' : 'overflow-hidden'
                    }`}
                  >
                    {/* Top Bar: Free-form Tags on Left, Status Pill & Delete on Right */}
                    <div className="flex items-center justify-between gap-2 shrink-0">
                      {renderCardTags(card, currentNote.id)}

                      {/* Status Action: รอเข้าตู้ / เข้าตู้ลิ้นชัก ⇄ ในตู้ลิ้นชัก */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {card.isSavedToCabinet ? (
                          <button
                            type="button"
                            onClick={() => handleToggleChildCardSaveState(currentNote.id, card)}
                            className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-500/50 flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                            title="คลิกเพื่อนำออกจากตู้ลิ้นชักกลับเป็นร่าง"
                          >
                            <CheckCircle2 size={11} className="text-emerald-400" />
                            <span>ในตู้ลิ้นชัก</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleChildCardSaveState(currentNote.id, card)}
                            className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono bg-white/[0.06] hover:bg-rose-500/20 text-white/50 hover:text-rose-200 border border-white/[0.10] hover:border-rose-500/40 flex items-center gap-1 transition-all cursor-pointer active:scale-95 group/btn"
                            title="บันทึกเข้าตู้ลิ้นชัก"
                          >
                            <Save size={11} className="text-white/40 group-hover/btn:text-rose-300 transition-colors" />
                            <span className="group-hover/btn:hidden">รอเข้าตู้</span>
                            <span className="hidden group-hover/btn:inline">เข้าตู้ลิ้นชัก</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteChildCard(currentNote.id, card.id)}
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
                      onChange={(e) => {
                        const newTitle = e.target.value
                        handleUpdateNote(currentNote.id, {
                          childCards: currentNote.childCards.map((c) =>
                            c.id === card.id ? { ...c, title: newTitle } : c
                          ),
                        })
                      }}
                      placeholder="ชื่อการ์ด..."
                      className="w-full text-[15px] font-medium text-[#F1F1F1] bg-transparent outline-none border-none p-0 placeholder-white/20 shrink-0"
                    />

                    {/* Pure Markdown Content (Locked Scrollable Area) */}
                    <textarea
                      value={card.content}
                      onChange={(e) => {
                        const newContent = e.target.value
                        handleUpdateNote(currentNote.id, {
                          childCards: currentNote.childCards.map((c) =>
                            c.id === card.id ? { ...c, content: newContent } : c
                          ),
                        })
                      }}
                      placeholder="เนื้อหาของการ์ด..."
                      className="w-full text-[13px] text-white/75 bg-transparent outline-none resize-none leading-relaxed font-sans border-none p-0 placeholder-white/20 flex-1 overflow-y-auto"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
