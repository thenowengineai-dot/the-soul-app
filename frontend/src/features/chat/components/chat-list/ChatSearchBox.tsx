import { Search } from 'lucide-react'
import type { ChatSearchBoxProps } from '../../types'

export type { ChatSearchBoxProps }

export function ChatSearchBox({ searchQuery, onSearchChange }: ChatSearchBoxProps) {
  return (
    <div className="group flex items-center w-full h-[38px] sm:h-[40px] bg-transparent rounded-full px-3.5 border border-app-border hover:border-white/20 focus-within:border-[#EF264C] focus-within:hover:border-[#EF264C] transition-all duration-200">
      <Search className="text-app-muted transition-colors flex-shrink-0" size={16} strokeWidth={2} />
      <input 
        type="text" 
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="ค้นหา..." 
        className="w-full bg-transparent text-app-primary placeholder-app-muted pl-2.5 outline-none text-xs sm:text-[13px]" 
      />
    </div>
  )
}

export default ChatSearchBox
