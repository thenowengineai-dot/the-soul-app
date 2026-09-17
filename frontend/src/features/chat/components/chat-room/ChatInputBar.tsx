import { useState, useRef, useEffect } from 'react'
import type React from 'react'
import { 
  Plus, 
  ArrowUp, 
  Sparkles, 
  MessageSquare, 
  ChevronDown, 
  Maximize2, 
  SlidersHorizontal,
  AudioLines,
  Asterisk,
  Smile,
  Image as ImageIcon
} from 'lucide-react'
import { TypingIndicator } from '../../../../components/common'
import type { ChatInputBarProps } from '../../types'
import EmojiPickerPopover from './EmojiPickerPopover'

export type { ChatInputBarProps }

// คำแนะนำเริ่มต้นสำหรับการกด "คำตอบที่แนะนำ"
const SUGGESTED_REPLIES = [
  'สวัสดี! วันนี้เป็นอย่างไรบ้าง?',
  '*เดินเข้าไปทักทายด้วยรอยยิ้ม* มีเวลาคุยกันไหม?',
  'คิดถึงจัง ช่วงนี้ทำอะไรอยู่บ้าง?',
  '*สบตาเงียบๆ ก่อนจะเอ่ยขึ้นมา* กำลังคิดอะไรอยู่เหรอ?',
]

// ตัวเลือกโหมดการสนทนา
const CONVERSATION_MODES = [
  { id: 'daily', label: 'การสนทนาประจำวัน', icon: '💬' },
  { id: 'roleplay', label: 'โหมดสวมบทบาท (Roleplay)', icon: '🎭' },
  { id: 'intimate', label: 'บรรยากาศใกล้ชิด (Intimate)', icon: '✨' },
]

export function ChatInputBar({
  inputMessage = '',
  onInputChange,
  onSendMessage,
  onKeyDown,
  isStreaming = false,
  isTyping = false,
  typingVariant = 'bubble',
  chatAvatar = '',
  chatName = '',
}: ChatInputBarProps) {
  const [isEmojiOpen, setIsEmojiOpen] = useState(false)
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false)
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false)
  const [isSuggestedOpen, setIsSuggestedOpen] = useState(false)
  const [activeMode, setActiveMode] = useState(CONVERSATION_MODES[0])

  const inputRef = useRef<HTMLInputElement>(null)
  const modeMenuRef = useRef<HTMLDivElement>(null)
  const suggestedMenuRef = useRef<HTMLDivElement>(null)
  const plusMenuRef = useRef<HTMLDivElement>(null)

  // ปิดเมนูป็อปอัพเมื่อคลิกด้านนอก
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (modeMenuRef.current && !modeMenuRef.current.contains(target)) {
        setIsModeMenuOpen(false)
      }
      if (suggestedMenuRef.current && !suggestedMenuRef.current.contains(target)) {
        setIsSuggestedOpen(false)
      }
      if (plusMenuRef.current && !plusMenuRef.current.contains(target)) {
        setIsPlusMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isStreaming && inputMessage.trim()) {
        onSendMessage?.()
      }
    }
    onKeyDown?.(e)
  }

  // ✻ Smart Asterisk Inserter: วาง *|* พร้อมดึง Cursor ไว้ตรงกลางอัตโนมัติ (หรือครอบข้อความที่เลือกไว้)
  const handleInsertAsterisk = () => {
    const input = inputRef.current
    if (!input) {
      onInputChange?.((inputMessage ? inputMessage + ' ' : '') + '**')
      return
    }

    const start = input.selectionStart ?? inputMessage.length
    const end = input.selectionEnd ?? inputMessage.length

    if (start !== end) {
      // มีการเลือกข้อความไว้ -> ครอบด้วยดอกจัน *ข้อความ*
      const selectedText = inputMessage.slice(start, end)
      const newText = inputMessage.slice(0, start) + `*${selectedText}*` + inputMessage.slice(end)
      onInputChange?.(newText)

      requestAnimationFrame(() => {
        input.focus()
        input.setSelectionRange(start + selectedText.length + 2, start + selectedText.length + 2)
      })
    } else {
      // ไม่มีข้อความเลือก -> วาง ** และดึง Cursor ไปอยู่ตรงกลาง *|*
      const newText = inputMessage.slice(0, start) + '**' + inputMessage.slice(start)
      onInputChange?.(newText)

      requestAnimationFrame(() => {
        input.focus()
        input.setSelectionRange(start + 1, start + 1)
      })
    }
  }

  // ✦ แทรกลิสต์คำตอบที่แนะนำลงในกล่องข้อความ
  const handleSelectSuggested = (reply: string) => {
    onInputChange?.(reply)
    setIsSuggestedOpen(false)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }

  // แทรกอีโมจิตรงตำแหน่ง Cursor ทันที พร้อมคงสถานะ Focus
  const handleSelectEmoji = (emoji: string) => {
    const input = inputRef.current
    if (!input) {
      onInputChange?.(inputMessage + emoji)
      return
    }

    const start = input.selectionStart ?? inputMessage.length
    const end = input.selectionEnd ?? inputMessage.length

    const newText = inputMessage.slice(0, start) + emoji + inputMessage.slice(end)
    onInputChange?.(newText)

    requestAnimationFrame(() => {
      input.focus()
      const newCursorPos = start + emoji.length
      input.setSelectionRange(newCursorPos, newCursorPos)
    })
  }

  const hasText = inputMessage.trim().length > 0

  return (
    <div 
      data-no-advance 
      className="sticky bottom-0 z-20 w-full pt-2 pb-4 sm:pb-5 mt-auto bg-gradient-to-t from-[#0F0F10] via-[#0F0F10]/95 to-transparent pointer-events-none"
    >
      <div className="w-full max-w-[800px] mx-auto px-4 sm:px-6 relative pointer-events-auto flex flex-col gap-2.5">
        
        {/* 💬 Typing Indicator Docked Right Above Context Chips (Twitter / X Style) */}
        {isTyping && (
          <div className="absolute bottom-[calc(100%+10px)] left-4 sm:left-6 z-30 pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
            <TypingIndicator avatarUrl={chatAvatar} name={chatName} variant={typingVariant} />
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            แถวที่ 1: Contextual Action Chips Row (แถบชิปบริบทสไตล์ Reference Image)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="w-full flex items-center justify-between gap-1.5 sm:gap-2 px-0.5">
          {/* ซ้ายสุด: ปุ่มขยายหน้าจอ (Maximize) */}
          <button
            type="button"
            title="ขยายหน้าจอ"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-[#EDEDED] hover:bg-white/[0.08] active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <Maximize2 size={15} />
          </button>

          {/* ชิปตรงกลาง (เลื่อนแนวนอนได้บนจอมือถือ) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            {/* ชิปที่ 1: โหมดการสนทนา [ 💬 การสนทนาประจำวัน ▼ ] */}
            <div className="relative shrink-0" ref={modeMenuRef}>
              <button
                type="button"
                onClick={() => setIsModeMenuOpen(prev => !prev)}
                title="เปลี่ยนโหมดการสนทนา"
                className={`px-3 py-1.5 rounded-full text-[12px] sm:text-[12.5px] font-medium flex items-center gap-1.5 transition-all cursor-pointer border shadow-sm ${
                  isModeMenuOpen 
                    ? 'bg-white/15 border-white/25 text-[#EDEDED]' 
                    : 'bg-[#18181C]/90 hover:bg-[#222228] border-white/[0.08] hover:border-white/20 text-[#D1D1D6]'
                }`}
              >
                <MessageSquare size={13} className="text-[#A1A1A8]" />
                <span>{activeMode.label}</span>
                <ChevronDown size={12} className={`text-[#8E8E93] transition-transform duration-200 ${isModeMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mode Menu Dropdown */}
              {isModeMenuOpen && (
                <div className="absolute bottom-full mb-2 left-0 z-50 w-[220px] bg-[#161618]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[11px] font-semibold text-[#8E8E93] px-3 py-1.5 uppercase tracking-wider">
                    โหมดการสนทนา
                  </div>
                  {CONVERSATION_MODES.map(mode => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        setActiveMode(mode)
                        setIsModeMenuOpen(false)
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12.5px] text-left transition-all cursor-pointer ${
                        activeMode.id === mode.id 
                          ? 'bg-white/12 text-white font-medium' 
                          : 'text-[#C7C7CC] hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      <span className="text-[14px]">{mode.icon}</span>
                      <span>{mode.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ชิปที่ 2: เพิ่มสถานการณ์ [ ✻ เพิ่มสถานการณ์ ] */}
            <button
              type="button"
              onClick={handleInsertAsterisk}
              title="แทรกเครื่องหมายสถานการณ์ (*ท่าทาง*)"
              className="px-3 py-1.5 rounded-full bg-[#18181C]/90 hover:bg-[#222228] border border-white/[0.08] hover:border-white/20 text-[#D1D1D6] hover:text-[#EDEDED] text-[12px] sm:text-[12.5px] font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-sm group active:scale-95"
            >
              <Asterisk size={13} className="text-[#A1A1A8] transition-transform duration-200 group-hover:rotate-45" />
              <span>เพิ่มสถานการณ์</span>
            </button>

            {/* ชิปที่ 3: คำตอบที่แนะนำ [ ✦ คำตอบที่แนะนำ ] */}
            <div className="relative shrink-0" ref={suggestedMenuRef}>
              <button
                type="button"
                onClick={() => setIsSuggestedOpen(prev => !prev)}
                title="เลือกคำตอบที่แนะนำ"
                className={`px-3 py-1.5 rounded-full text-[12px] sm:text-[12.5px] font-medium flex items-center gap-1.5 transition-all cursor-pointer border shadow-sm ${
                  isSuggestedOpen 
                    ? 'bg-white/15 border-white/25 text-[#EDEDED]' 
                    : 'bg-[#18181C]/90 hover:bg-[#222228] border-white/[0.08] hover:border-white/20 text-[#D1D1D6]'
                }`}
              >
                <Sparkles size={13} className="text-amber-400/90" />
                <span>คำตอบที่แนะนำ</span>
              </button>

              {/* Suggested Replies Popover */}
              {isSuggestedOpen && (
                <div className="absolute bottom-full mb-2 right-0 sm:left-0 z-50 w-[280px] sm:w-[320px] bg-[#161618]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[11px] font-semibold text-[#8E8E93] px-2.5 py-1 uppercase tracking-wider flex items-center justify-between">
                    <span>คำตอบที่แนะนำ</span>
                    <Sparkles size={11} className="text-amber-400" />
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    {SUGGESTED_REPLIES.map((reply, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSuggested(reply)}
                        className="w-full text-left px-3 py-2 rounded-xl text-[12.5px] text-[#D1D1D6] hover:text-white hover:bg-white/[0.08] active:scale-[0.98] transition-all cursor-pointer leading-snug"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ขวาสุด: ปุ่มปรับแต่งการสนทนา (Sliders / Tune) */}
          <button
            type="button"
            title="ปรับแต่งการสนทนา"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-[#EDEDED] hover:bg-white/[0.08] active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <SlidersHorizontal size={15} />
          </button>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            แถวที่ 2: Unified Capsule Input Bar (กล่องพิมพ์ทรงแคปซูลชิ้นเดียวสมบูรณ์แบบ)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="w-full relative">
          <div 
            className={`w-full h-[52px] bg-[#18181C]/95 backdrop-blur-xl rounded-full flex items-center pl-2 pr-2 sm:pl-2.5 sm:pr-2.5 border border-white/10 hover:border-white/15 focus-within:border-white/30 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.45)] ${
              isStreaming ? 'opacity-70' : ''
            }`}
          >
            {/* ปุ่ม (+) ด้านในกล่องพิมพ์ซ้ายมือ (เปิดเมนู/ใส่อีโมจิ) */}
            <div className="relative shrink-0 flex items-center" ref={plusMenuRef}>
              <button 
                type="button"
                onClick={() => setIsPlusMenuOpen(prev => !prev)}
                title="ตัวเลือกเพิ่มเติม"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                  isPlusMenuOpen || isEmojiOpen
                    ? 'bg-white/20 text-white shadow-inner'
                    : 'bg-white/[0.07] hover:bg-white/12 text-[#C7C7CC] hover:text-white'
                }`}
              >
                <Plus size={18} className={`transition-transform duration-200 ${isPlusMenuOpen ? 'rotate-45' : ''}`} />
              </button>

              {/* Plus Menu Action Popover */}
              {isPlusMenuOpen && (
                <div className="absolute bottom-[calc(100%+10px)] left-0 z-50 w-[200px] bg-[#161618]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlusMenuOpen(false)
                      setIsEmojiOpen(true)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-[#D1D1D6] hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                  >
                    <Smile size={16} className="text-amber-400" />
                    <span>ใส่อีโมจิ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlusMenuOpen(false)
                      handleInsertAsterisk()
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-[#D1D1D6] hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                  >
                    <Asterisk size={16} className="text-[#8E8E93]" />
                    <span>แทรกสถานการณ์ (*...*)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPlusMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-[#D1D1D6] hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                  >
                    <ImageIcon size={16} className="text-blue-400" />
                    <span>ส่งรูปภาพ</span>
                  </button>
                </div>
              )}

              {/* Native Dark Glassmorphic Emoji Popover */}
              <EmojiPickerPopover 
                isOpen={isEmojiOpen}
                onClose={() => setIsEmojiOpen(false)}
                onSelectEmoji={handleSelectEmoji}
              />
            </div>

            {/* ช่องกรอกข้อความ (Personalized Placeholder) */}
            <input 
              ref={inputRef}
              type="text" 
              value={inputMessage}
              onChange={(e) => onInputChange?.(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder={
                isStreaming 
                  ? "กำลังตอบกลับ..." 
                  : `กำลังส่งข้อความไปหา ${chatName || 'ตัวละคร'}...`
              } 
              className={`flex-1 bg-transparent outline-none text-[#F2F2F5] placeholder-[#71767B] text-[14.5px] sm:text-[15px] px-3 font-normal ${
                isStreaming ? 'cursor-not-allowed' : ''
              }`} 
            />

            {/* ปุ่มด้านขวามือในกล่องพิมพ์: Waveform/Mic ตอนว่างเปล่า vs. Send Arrow ตอนมีข้อความ */}
            {hasText ? (
              <button 
                type="button"
                onClick={onSendMessage}
                disabled={isStreaming}
                title="ส่งข้อความ"
                className={`w-9 h-9 rounded-full bg-gradient-to-br from-[#8C1D38] via-[#75162D] to-[#5A0E20] border border-[#A82B49]/50 text-white flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shrink-0 cursor-pointer shadow-md ${
                  isStreaming ? 'opacity-40 cursor-not-allowed active:scale-100' : ''
                }`}
              >
                <ArrowUp size={18} strokeWidth={2.5} />
              </button>
            ) : (
              <button
                type="button"
                title="ข้อความเสียง"
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-[#EDEDED] hover:bg-white/[0.06] active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <AudioLines size={18} />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default ChatInputBar
