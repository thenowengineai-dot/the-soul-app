import { useState } from 'react'
import ChatListHeader from './ChatListHeader'
import ChatSearchBox from './ChatSearchBox'
import ChatItem from './ChatItem'
import type { ChatListProps } from '../../types'

export type { ChatListProps }

export function ChatList({ 
  onBackToHome, 
  chats = [], 
  selectedChatId, 
  onSelectChat, 
  isOpen = true,
  dividerVariant = 'symmetric',
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredChats = searchQuery.trim() === ''
    ? chats
    : chats.filter(chat => 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.message.toLowerCase().includes(searchQuery.toLowerCase())
      )

  return (
    <div className={`
      h-full flex-shrink-0 border-r border-white/[0.06] hidden md:flex flex-col bg-[#0F1012] backdrop-blur-xl z-10 overflow-hidden transition-all duration-300 ease-in-out
      ${isOpen ? 'w-[300px] opacity-100' : 'w-0 border-r-0 opacity-0 pointer-events-none'}
    `}>
      {/* Inner Fixed Container (คงความกว้างไว้เพื่อไม่ให้เลย์เอาต์บีบตัวขณะสไลด์เปิด-ปิด) */}
      <div className="w-[300px] h-full flex flex-col flex-shrink-0">
        <div 
          style={{ overscrollBehavior: 'none' }}
          className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar relative overscroll-none touch-pan-y"
        >
          
          {/* Sticky Header & Search Box (Apple Frosted Glass Style) */}
          <div className="sticky top-0 z-20 px-3.5 sm:px-4 pt-3.5 sm:pt-4 pb-3 sm:pb-3.5 bg-[#0F1012]/80 backdrop-blur-md flex flex-col gap-2.5">
            <ChatListHeader onBackToHome={onBackToHome} />
            <ChatSearchBox searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          </div>

          {/* List of Chats */}
          <div className="pt-1 pb-2">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat, index) => (
                <ChatItem 
                  key={chat.id} 
                  {...chat} 
                  isActive={selectedChatId === chat.id}
                  showDivider={index < filteredChats.length - 1}
                  dividerVariant={dividerVariant}
                  onClick={() => onSelectChat?.(chat)} 
                />
              ))
            ) : (
              <div className="py-12 px-4 text-center select-none">
                <p className="text-[13px] text-app-muted font-light">
                  ไม่มีบทสนทนาอื่น
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatList
