import { useState, useRef } from 'react'
import type React from 'react'
import { Plus, ArrowUp, Smile, Asterisk } from 'lucide-react'
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
  chatAvatar = '',
  chatName = '',
}: ChatInputBarProps) {
  const [isEmojiOpen, setIsEmojiOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isStreaming) {
        onSendMessage?.()
      }
    }
    onKeyDown?.(e)
  }

  // Smart Asterisk Inserter: วาง *|* พร้อมดึง Cursor ไว้ตรงกลางอัตโนมัติ (หรือครอบข้อความที่เลือกไว้)
  const handleInsertAsterisk = () => {
    const input = inputRef.current
    if (!input) return

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

  return (
    <div data-no-advance className="sticky bottom-0 z-20 w-full pt-4 pb-4 mt-auto bg-gradient-to-t from-app-bg from-60% via-app-bg/95 via-35% to-transparent pointer-events-none">
      <div className="w-full max-w-[800px] mx-auto px-4 sm:px-6 relative pointer-events-auto">
        {/* 💬 Typing Indicator Docked Right Above Input Box & Floating in Front of Bubbles (Twitter / X Style) */}
        {isTyping && (
          <div className="absolute bottom-[calc(100%+8px)] left-4 sm:left-6 z-30 pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
            <TypingIndicator avatarUrl={chatAvatar} name={chatName} />
          </div>
        )}

        <div className="w-full flex items-center gap-2 sm:gap-2.5 relative">
          {/* Plus Button (แนบรูปหรือไฟล์) - ความสูงมาตรฐาน h-10 sm:h-11 เท่ากันเป๊ะ */}
          <button 
            type="button"
            title="แนบรูปหรือไฟล์"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 border border-white/5 hover:border-white/10 hover:bg-white/15 text-app-primary flex items-center justify-center transition-all shrink-0 cursor-pointer"
          >
            <Plus size={19} className="sm:w-5 sm:h-5" />
          </button>

          {/* Emoji Button & Popover (Twitter / X Style) - ความสูงมาตรฐาน h-10 sm:h-11 เท่ากันเป๊ะ */}
          <div className="relative shrink-0 flex items-center">
            <button 
              type="button"
              onClick={() => setIsEmojiOpen((prev) => !prev)}
              title="ใส่อีโมจิ"
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all shrink-0 border cursor-pointer ${
                isEmojiOpen 
                  ? 'bg-white/20 border-white/20 text-app-primary' 
                  : 'bg-white/10 border-white/5 text-app-primary hover:bg-white/15 hover:border-white/10'
              }`}
            >
              <Smile size={19} className="sm:w-5 sm:h-5" />
            </button>

            {/* Native Dark Glassmorphic Emoji Popover */}
            <EmojiPickerPopover 
              isOpen={isEmojiOpen}
              onClose={() => setIsEmojiOpen(false)}
              onSelectEmoji={handleSelectEmoji}
            />
          </div>

          {/* Action Asterisk Button (* Action Inserter) - ความสูงมาตรฐาน h-10 sm:h-11 เท่ากันเป๊ะ */}
          <button 
            type="button"
            onClick={handleInsertAsterisk}
            title="สร้างท่าทาง (*action*)"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 border border-white/5 hover:border-white/10 hover:bg-white/15 active:scale-95 text-app-primary flex items-center justify-center transition-all shrink-0 cursor-pointer group"
          >
            <Asterisk size={19} className="sm:w-5 sm:h-5 transition-transform duration-200 group-hover:rotate-45" />
          </button>
          
          {/* Input Wrapper (กล่องพิมพ์) - ระยะห่างเท่ากันทุกช่อง gap-2 sm:gap-3 + ขอบบางเฉียบ border-white/5 + ล็อกความสูง h-10 sm:h-11 */}
          <div className={`flex-1 h-10 sm:h-11 bg-app-surface rounded-full flex items-center pl-4 sm:pl-5 pr-1.5 border border-white/5 focus-within:border-white/15 transition-all ${isStreaming ? 'opacity-70' : ''}`}>
            <input 
              ref={inputRef}
              type="text" 
              value={inputMessage}
              onChange={(e) => onInputChange?.(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder={isStreaming ? "กำลังตอบกลับ..." : "พิมพ์ข้อความ หรือ *เพื่อแสดงท่าทาง*..."} 
              className={`flex-1 bg-transparent outline-none text-app-primary placeholder-app-muted text-[15px] ${isStreaming ? 'cursor-not-allowed' : ''}`} 
            />
            {/* Send Button (สีแดง Velvet Carmine เดียวกันกับบับเบิ้ลข้อความ) */}
            <button 
              type="button"
              onClick={onSendMessage}
              disabled={isStreaming || !inputMessage.trim()}
              title="ส่งข้อความ"
              className={`w-8 h-8 rounded-full bg-gradient-to-br from-[#D22147] via-[#B8163A] to-[#8E0D29] border border-white/10 flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shrink-0 ml-2 cursor-pointer shadow-sm ${
                isStreaming || !inputMessage.trim() ? 'opacity-40 cursor-not-allowed active:scale-100' : ''
              }`}
            >
              <ArrowUp size={18} strokeWidth={2.5} className="text-app-primary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInputBar
