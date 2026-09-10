import type React from 'react'
import { Plus, ArrowUp } from 'lucide-react'
import { TypingIndicator } from '../../../../components/common'
import type { ChatInputBarProps } from '../../types'

export type { ChatInputBarProps }

export function ChatInputBar({
  inputMessage = '',
  onInputChange,
  onSendMessage,
  onKeyDown,
  isStreaming = false,
  chatName = '',
}: ChatInputBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage?.()
    }
    onKeyDown?.(e)
  }

  return (
    <div className="sticky bottom-0 z-20 w-full pt-4 pb-4 mt-auto bg-gradient-to-t from-app-bg from-60% via-app-bg/95 via-35% to-transparent pointer-events-none">
      <div className="w-full max-w-[800px] mx-auto px-4 sm:px-6 flex flex-col gap-2.5 pointer-events-auto">
        {/* 💬 Typing Indicator Docked Right Above Input Box (Twitter / X Style) */}
        {isStreaming && (
          <div className="pl-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <TypingIndicator name={chatName} />
          </div>
        )}

        <div className="w-full flex items-center gap-3">
        {/* Plus Button */}
        <button 
          type="button"
          title="แนบรูปหรือไฟล์"
          className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors shrink-0 border border-white/5 cursor-pointer"
        >
          <Plus size={24} className="text-app-primary" />
        </button>
        
        {/* Input Wrapper (Solid Original Apple Dark Gray) */}
        <div className="flex-1 bg-app-surface rounded-full flex items-center pl-5 pr-1.5 py-1.5 border border-white/10 focus-within:border-white/25 transition-all shadow-xl">
          <input 
            type="text" 
            value={inputMessage}
            onChange={(e) => onInputChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="พิมพ์ข้อความที่นี่..." 
            className="flex-1 bg-transparent outline-none text-app-primary placeholder-app-secondary text-[15px]" 
          />
          {/* Send Button (สีแดง Velvet Carmine เดียวกันกับบับเบิ้ลข้อความ) */}
          <button 
            type="button"
            onClick={onSendMessage}
            title="ส่งข้อความ"
            className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D22147] via-[#B8163A] to-[#8E0D29] border border-white/10 flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shrink-0 ml-2 cursor-pointer shadow-sm"
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
