import { Search } from 'lucide-react'
import type { ChatSearchBoxProps } from '../../types'

export type { ChatSearchBoxProps }

export function ChatSearchBox({ searchQuery, onSearchChange }: ChatSearchBoxProps) {
  return (
    <div className="group flex items-center w-full h-[36px] sm:h-[38px] bg-white/5 rounded-full px-3.5 border border-white/10 focus-within:border-[#EF264C] focus-within:shadow-[0_0_14px_rgba(239,38,76,0.22)] focus-within:bg-black transition-all duration-200">
      <Search className="text-[rgb(113,118,123)] group-focus-within:text-[#EF264C] transition-colors flex-shrink-0" size={16} strokeWidth={2} />
      <input 
        type="text" 
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="ค้นหา" 
        className="w-full bg-transparent text-app-primary placeholder-[rgb(113,118,123)] pl-2.5 outline-none text-xs sm:text-[13px]" 
      />
    </div>
  )
}

export default ChatSearchBox
