import { Menu, ArrowLeft, ChevronDown } from 'lucide-react'
import type { ChatListHeaderProps } from '../../types'

export type { ChatListHeaderProps }

export function ChatListHeader({ onBackToHome, onToggleCollapse }: ChatListHeaderProps) {
  return (
    <div className="flex items-center justify-between min-h-[38px] h-9 sm:h-10">
      <div className="flex items-center gap-1.5 -ml-1">
        {onToggleCollapse && (
          <button 
            type="button"
            onClick={onToggleCollapse}
            title="ย่อแถบแชท"
            aria-label="ย่อแถบแชท"
            className="w-9 h-9 sm:w-[38px] sm:h-[38px] rounded-full bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 text-white/85 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] active:scale-95 select-none shrink-0"
          >
            <Menu size={18} strokeWidth={2} />
          </button>
        )}
        <button 
          type="button"
          onClick={onBackToHome}
          title="กลับหน้าแรก"
          className="w-8 h-8 rounded-full hover:bg-white/10 text-white/75 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft size={18} strokeWidth={2} />
        </button>
        <h2 className="text-[19px] sm:text-[20px] font-bold text-app-primary flex items-center tracking-tight -translate-y-[0.5px]">แชท</h2>
      </div>
      <button 
        type="button"
        className="h-8 px-2.5 sm:px-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 text-white/85 hover:text-white flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] select-none text-[12px] sm:text-[12.5px] font-medium tracking-tight shrink-0"
      >
        <span>ทั้งหมด</span>
        <ChevronDown size={13} className="text-white/60" />
      </button>
    </div>
  )
}

export default ChatListHeader
