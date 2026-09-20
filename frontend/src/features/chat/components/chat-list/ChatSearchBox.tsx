import { Search, X } from 'lucide-react'
import type { ChatSearchBoxProps } from '../../types'

export type { ChatSearchBoxProps }

export function ChatSearchBox({ searchQuery, onSearchChange }: ChatSearchBoxProps) {
  return (
    <div className="group flex items-center w-full h-[38px] sm:h-[40px] bg-white/[0.06] hover:bg-white/[0.10] focus-within:bg-white/[0.10] backdrop-blur-2xl rounded-full px-3 sm:px-3.5 border border-white/[0.10] hover:border-white/[0.18] focus-within:border-white/[0.26] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-200">
      <Search 
        size={15} 
        strokeWidth={2} 
        className="text-white/50 group-focus-within:text-white/90 group-hover:text-white/80 transition-colors flex-shrink-0" 
      />
      <input 
        type="text" 
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="ค้นหาบทสนทนา..." 
        className="w-full bg-transparent text-white placeholder-white/40 pl-2.5 pr-1 outline-none text-[13px] sm:text-[13.5px] font-normal tracking-tight" 
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => onSearchChange('')}
          title="ล้างการค้นหา"
          className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
        >
          <X size={13} strokeWidth={2.2} />
        </button>
      )}
    </div>
  )
}

export default ChatSearchBox
