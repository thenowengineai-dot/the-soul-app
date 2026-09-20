import { useState, useRef, useEffect } from 'react'
import type React from 'react'
import { 
  Plus, 
  ArrowUp, 
  AudioLines,
  Asterisk,
  Smile,
  Image as ImageIcon
} from 'lucide-react'
import { TypingIndicator } from '../../../../components/common'
import type { ChatInputBarProps } from '../../types'
import EmojiPickerPopover from './EmojiPickerPopover'

export type { ChatInputBarProps }

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

  const inputRef = useRef<HTMLInputElement>(null)
  const plusMenuRef = useRef<HTMLDivElement>(null)

  // ปิดเมนูป็อปอัพเมื่อคลิกด้านนอก
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
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
      className="sticky bottom-0 z-20 w-full pt-2 pb-4 sm:pb-5 mt-auto bg-gradient-to-t from-[#151517] via-[#151517]/80 to-transparent pointer-events-none"
    >
      <div className="w-full max-w-[740px] mx-auto px-4 sm:px-6 relative pointer-events-auto">
        
        {/* 💬 Typing Indicator Docked Right Above Input Capsule (Apple iMessage / Telegram Style) */}
        {isTyping && (
          <div className="absolute bottom-[calc(100%+10px)] left-4 sm:left-6 z-30 pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
            <TypingIndicator avatarUrl={chatAvatar} name={chatName} variant={typingVariant} />
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            Unified Capsule Input Dock (Apple White Frosted Glass: h-[44px] sm:h-[46px])
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div 
          className={`w-full h-[44px] sm:h-[46px] bg-white/[0.10] hover:bg-white/[0.14] focus-within:bg-white/[0.14] backdrop-blur-2xl rounded-full flex items-center pl-1.5 sm:pl-2 pr-1.5 sm:pr-2 border border-white/[0.16] hover:border-white/[0.25] focus-within:border-white/[0.35] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.20),0_4px_20px_rgba(0,0,0,0.35)] relative ${
            isStreaming ? 'opacity-70' : ''
          }`}
        >
          {/* ปุ่ม (+) ภายในกล่องพิมพ์ฝั่งซ้าย (Apple White Frosted Glass Pill) */}
          <div className="relative shrink-0 flex items-center" ref={plusMenuRef}>
            <button 
              type="button"
              onClick={() => setIsPlusMenuOpen(prev => !prev)}
              title="ตัวเลือกเพิ่มเติม"
              className={`w-[32px] h-[32px] sm:w-[34px] sm:h-[34px] rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 border ${
                isPlusMenuOpen || isEmojiOpen
                  ? 'bg-white/25 text-white border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]'
                  : 'bg-white/[0.08] hover:bg-white/[0.16] border-white/[0.12] hover:border-white/25 text-white/75 hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]'
              }`}
            >
              <Plus size={17} strokeWidth={2.2} className={`transition-transform duration-200 ${isPlusMenuOpen ? 'rotate-45' : ''}`} />
            </button>

            {/* Plus Menu Action Popover */}
            {isPlusMenuOpen && (
              <div className="absolute bottom-[calc(100%+12px)] left-0 z-50 w-[210px] bg-[#151517]/95 backdrop-blur-2xl border border-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_12px_32px_rgba(0,0,0,0.6)] rounded-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
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

          {/* ช่องกรอกข้อความ (Personalized Placeholder พร้อมระยะ Breathing Room) */}
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
            className={`flex-1 bg-transparent outline-none text-white placeholder-white/40 text-[14px] sm:text-[14.5px] px-2.5 font-normal tracking-tight ${
              isStreaming ? 'cursor-not-allowed' : ''
            }`} 
          />

          {/* ปุ่มด้านขวามือในกล่องพิมพ์: Waveform ตอนว่างเปล่า vs. Carmine Send Arrow ตอนมีข้อความ */}
          {hasText ? (
            <button 
              type="button"
              onClick={onSendMessage}
              disabled={isStreaming}
              title="ส่งข้อความ"
              className={`w-[32px] h-[32px] sm:w-[34px] sm:h-[34px] rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white flex items-center justify-center border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.30),0_2px_8px_rgba(239,38,76,0.35)] active:scale-95 transition-all shrink-0 cursor-pointer ${
                isStreaming ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ArrowUp size={17} strokeWidth={2.4} />
            </button>
          ) : (
            <button 
              type="button"
              disabled
              title="การส่งเสียง (Voice Input)"
              className="w-[32px] h-[32px] sm:w-[34px] sm:h-[34px] rounded-full flex items-center justify-center bg-white/[0.06] border border-white/[0.10] text-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all shrink-0 cursor-default"
            >
              <AudioLines size={16} strokeWidth={1.8} />
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

export default ChatInputBar
