import { useState } from 'react'
import { ChatList } from './chat-list'
import { ChatRoom } from './chat-room'
import CharacterHud from './CharacterHud'
import { MOCK_CHATS, getCharacterHudData } from '../mockData'
import type { ChatViewProps, ChatConversation } from '../types'

export type { ChatViewProps }

function ChatView({ 
  onBackToHome, 
  onSelectChat,
  coinBalance,
  notificationCount,
  onCoinClick,
  onNotificationClick,
  onProfileClick,
  userInitial,
  userName,
}: ChatViewProps) {
  const [selectedChat, setSelectedChat] = useState<ChatConversation>(MOCK_CHATS[0]);
  const [isChatListOpen, setIsChatListOpen] = useState<boolean>(true);
  const [isHudOpen, setIsHudOpen] = useState<boolean>(true);

  const handleSelectChat = (chat: ChatConversation) => {
    setSelectedChat(chat);
    onSelectChat?.(chat);
  };

  const hudData = getCharacterHudData(selectedChat);

  return (
    <div className="flex-1 h-screen overflow-hidden flex relative">
      <ChatList 
        onBackToHome={onBackToHome} 
        chats={MOCK_CHATS}
        selectedChatId={selectedChat.id}
        onSelectChat={handleSelectChat} 
        isOpen={isChatListOpen}
        onToggleCollapse={() => setIsChatListOpen(false)}
      />
      <ChatRoom 
        chat={selectedChat} 
        isChatListOpen={isChatListOpen}
        onToggleChatList={() => setIsChatListOpen(prev => !prev)}
        isHudOpen={isHudOpen}
        onToggleHud={() => setIsHudOpen(prev => !prev)}
        coinBalance={coinBalance}
        notificationCount={notificationCount}
        onCoinClick={onCoinClick}
        onNotificationClick={onNotificationClick}
        onProfileClick={onProfileClick}
        userInitial={userInitial}
        userName={userName}
      />
      <CharacterHud 
        data={hudData}
        isOpen={isHudOpen}
        onClose={() => setIsHudOpen(false)}
      />
    </div>
  )
}

export default ChatView
