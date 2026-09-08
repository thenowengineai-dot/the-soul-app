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
      h-full flex-shrink-0 border-r border-app-border hidden md:flex flex-col bg-[rgb(13,13,13)] backdrop-blur-xl z-10 overflow-hidden transition-all duration-300 ease-in-out
      ${isOpen ? 'w-[280px] opacity-100' : 'w-0 border-r-0 opacity-0 pointer-events-none'}
    `}>
      {/* Inner Fixed Container (คงความกว้างไว้เพื่อไม่ให้เลย์เอาต์บีบตัวขณะสไลด์เปิด-ปิด) */}
      <div className="w-[280px] h-full flex flex-col flex-shrink-0">
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar relative overscroll-contain touch-pan-y">
          
          {/* Sticky Header & Search Box (X / Twitter Frosted Glass Style) */}
          <div className="sticky top-0 z-20 px-3.5 sm:px-4 pt-3.5 sm:pt-4 pb-2 sm:pb-2.5 bg-[rgb(13,13,13)]/80 backdrop-blur-md">
            <ChatListHeader onBackToHome={onBackToHome} />
            <ChatSearchBox searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          </div>

          {/* List of Chats */}
          <div className="pt-1 pb-2">
            {filteredChats.length > 0 ? (
              filteredChats.map(chat => (
                <ChatItem 
                  key={chat.id} 
                  {...chat} 
                  isActive={selectedChatId === chat.id}
                  onClick={() => onSelectChat?.(chat)} 
                />
              ))
            ) : (
              <div className="py-12 px-4 text-center select-none">
                <p className="text-[13px] text-app-secondary/60 font-light">
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
