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
      className="sticky bottom-0 z-20 w-full pt-2 pb-4 sm:pb-5 mt-auto bg-gradient-to-t from-[#121214] via-[#121214]/95 to-transparent pointer-events-none"
    >
      <div className="w-full max-w-[740px] mx-auto px-4 sm:px-6 relative pointer-events-auto">
        
        {/* 💬 Typing Indicator Docked Right Above Input Capsule (Apple iMessage / Telegram Style) */}
        {isTyping && (
          <div className="absolute bottom-[calc(100%+10px)] left-4 sm:left-6 z-30 pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
            <TypingIndicator avatarUrl={chatAvatar} name={chatName} variant={typingVariant} />
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            Unified Capsule Input Bar (Apple iMessage Minimalist Pill)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="w-full relative">
          <div 
            className={`w-full h-[58px] sm:h-[60px] bg-gradient-to-b from-white/[0.06] via-white/[0.035] to-white/[0.015] backdrop-blur-2xl rounded-full flex items-center px-2.5 sm:px-3 border border-white/[0.07] hover:border-white/15 focus-within:border-white/25 focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.6)] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_6px_28px_rgba(0,0,0,0.55)] ${
              isStreaming ? 'opacity-70' : ''
            }`}
          >
            {/* ปุ่ม (+) ด้านในกล่องพิมพ์ซ้ายมือ (เปิดเมนู/ใส่อีโมจิ) ทรงกลมมน 40px นุ่มนวล */}
            <div className="relative shrink-0 flex items-center" ref={plusMenuRef}>
              <button 
                type="button"
                onClick={() => setIsPlusMenuOpen(prev => !prev)}
                title="ตัวเลือกเพิ่มเติม"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 border ${
                  isPlusMenuOpen || isEmojiOpen
                    ? 'bg-white/20 text-white border-white/25 shadow-inner'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white border-white/[0.05]'
                }`}
              >
                <Plus size={19} strokeWidth={1.75} className={`transition-transform duration-200 ${isPlusMenuOpen ? 'rotate-45' : ''}`} />
              </button>

              {/* Plus Menu Action Popover */}
              {isPlusMenuOpen && (
                <div className="absolute bottom-[calc(100%+12px)] left-0 z-50 w-[200px] bg-[#18181B]/95 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_12px_32px_rgba(0,0,0,0.6)] rounded-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
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
              className={`flex-1 bg-transparent outline-none text-[#F2F2F5] placeholder-white/35 text-[15px] px-3.5 font-normal ${
                isStreaming ? 'cursor-not-allowed' : ''
              }`} 
            />

            {/* ปุ่มด้านขวามือในกล่องพิมพ์: Waveform 40px ตอนว่างเปล่า vs. Send Arrow 40px ตอนมีข้อความ */}
            {hasText ? (
              <button 
                type="button"
                onClick={onSendMessage}
                disabled={isStreaming}
                title="ส่งข้อความ"
                className={`w-10 h-10 rounded-full bg-gradient-to-br from-[#EA1D52] via-[#D11142] to-[#9C0C30] border border-[#FF4D75]/40 text-white flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shrink-0 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_12px_rgba(209,17,66,0.4)] ${
                  isStreaming ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <ArrowUp size={19} strokeWidth={2.2} />
              </button>
            ) : (
              <button 
                type="button"
                disabled
                title="การส่งเสียง (Voice Input)"
                className="w-10 h-10 rounded-full flex items-center justify-center text-white/35 transition-all shrink-0 cursor-default"
              >
                <AudioLines size={18} strokeWidth={1.75} />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default ChatInputBar
