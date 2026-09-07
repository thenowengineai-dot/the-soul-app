import { useState } from 'react'
import ChatRoomHeader from './ChatRoomHeader'
import MessageList from './MessageList'
import ChatInputBar from './ChatInputBar'
import { MOCK_MESSAGES, MOCK_CHATS } from '../../mockData'
import type { ChatRoomProps, ChatMessage } from '../../types'

export type { ChatRoomProps }

export function ChatRoom({ 
  chat = MOCK_CHATS[0], 
  messages = MOCK_MESSAGES,
  isChatListOpen = true,
  onToggleChatList,
  isHudOpen = true,
  onToggleHud,
  coinBalance = 1250,
  notificationCount = 3,
  onCoinClick,
  onNotificationClick,
  onProfileClick,
  userInitial = 'A',
  userName = 'Alice',
}: ChatRoomProps) {
  const currentChat = chat || MOCK_CHATS[0]
  const [prevChatId, setPrevChatId] = useState(currentChat.id)
  const [sentMessages, setSentMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')

  if (currentChat.id !== prevChatId) {
    setPrevChatId(currentChat.id)
    setSentMessages([])
  }

  const allMessages = [...messages, ...sentMessages]

  const handleSendMessage = () => {
    if (!inputText.trim()) return

    const newMsg: ChatMessage = {
      id: Date.now(),
      type: 'msg',
      text: inputText.trim(),
      sender: 'me',
    }

    setSentMessages(prev => [...prev, newMsg])
    setInputText('')
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-app-bg z-0 overflow-hidden relative min-w-0">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto flex flex-col no-scrollbar relative">
        {/* Floating Sticky Header (Frameless Glassmorphism Pills) */}
        <ChatRoomHeader
          chat={currentChat}
          isChatListOpen={isChatListOpen}
          onToggleChatList={onToggleChatList}
          isHudOpen={isHudOpen}
          onToggleHud={onToggleHud}
          coinBalance={coinBalance}
          notificationCount={notificationCount}
          onCoinClick={onCoinClick}
          onNotificationClick={onNotificationClick}
          onProfileClick={onProfileClick}
          userInitial={userInitial}
          userName={userName}
        />

        {/* Main Conversation Column */}
        <MessageList
          messages={allMessages}
          chatAvatar={currentChat.avatar}
          chatName={currentChat.name}
        />

        {/* Sticky Bottom Bar */}
        <ChatInputBar
          inputMessage={inputText}
          onInputChange={setInputText}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  )
}

export default ChatRoom
