import { ArrowLeft, ChevronDown } from 'lucide-react'
import type { ChatListHeaderProps } from '../../types'

export type { ChatListHeaderProps }

export function ChatListHeader({ onBackToHome }: ChatListHeaderProps) {
  return (
    <div className="flex items-center justify-between h-[40px] sm:h-[42px] mb-2.5">
      <div className="flex items-center gap-1.5 -ml-2">
        <button 
          type="button"
          onClick={onBackToHome}
          title="กลับหน้าแรก"
          className="w-7 h-7 rounded-full hover:bg-white/10 text-[rgb(113,118,123)] hover:text-app-primary flex items-center justify-center transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-[22px] sm:text-[23px] font-bold text-app-primary leading-none">แชท</h2>
      </div>
      <button 
        type="button"
        className="h-[26px] sm:h-[27px] px-2.5 rounded-full bg-[#121212]/65 backdrop-blur-xl border border-white/[0.07] hover:border-white/20 hover:bg-white/10 text-app-secondary hover:text-app-primary flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm select-none text-[11px] sm:text-[11.5px] font-medium"
      >
        <span>ทั้งหมด</span>
        <ChevronDown size={11} className="opacity-75" />
      </button>
    </div>
  )
}

export default ChatListHeader
