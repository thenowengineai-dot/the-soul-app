import { useState } from 'react'
import { ChatList } from './chat-list'
import { ChatRoom } from './chat-room'
import CharacterHud from './CharacterHud'
import { MOCK_CHATS, getCharacterHudData } from '../mockData'
import type { ChatViewProps, ChatConversation, CharacterHudData } from '../types'

export type { ChatViewProps }

function ChatView({ 
  onBackToHome, 
  activeCharacter,
  onSelectChat,
  coinBalance,
  notificationCount,
  onCoinClick,
  onNotificationClick,
  onProfileClick,
  userInitial,
  userName,
  userEmail,
  planName,
  isLoggedIn,
  onLoginClick,
  onSignupClick,
  isProfileDropdownOpen,
  onCloseProfileDropdown,
  onEditProfileClick,
  onSignOut,
  onCoinBalanceUpdate,
}: ChatViewProps) {
  const [prevActive, setPrevActive] = useState<ChatConversation | null | undefined>(activeCharacter);
  const [selectedChat, setSelectedChat] = useState<ChatConversation>(() => activeCharacter || MOCK_CHATS[0]);
  const [isCurrentStreaming, setIsCurrentStreaming] = useState<boolean>(false);
  const [allChats, setAllChats] = useState<ChatConversation[]>(() => {
    const initial = activeCharacter || MOCK_CHATS[0];
    const others = MOCK_CHATS.filter(c => String(c.id) !== String(initial.id));
    return [initial, ...others];
  });
  const [isChatListOpen, setIsChatListOpen] = useState<boolean>(true);
  const [activeRightPanel, setActiveRightPanel] = useState<'none' | 'hud' | 'inspector'>('hud');
  const [liveHudData, setLiveHudData] = useState<CharacterHudData>(() => getCharacterHudData(activeCharacter || MOCK_CHATS[0]));

  const isHudOpen = activeRightPanel === 'hud';
  const isInspectorOpen = activeRightPanel === 'inspector';

  const handleToggleHud = () => {
    setActiveRightPanel(prev => prev === 'hud' ? 'none' : 'hud');
  };

  const handleToggleInspector = () => {
    setActiveRightPanel(prev => prev === 'inspector' ? 'none' : 'inspector');
  };

  const handleCloseRightPanel = () => {
    setActiveRightPanel('none');
  };

  const handleSwitchToHud = () => {
    setActiveRightPanel('hud');
  };

  const handleSwitchToInspector = () => {
    setActiveRightPanel('inspector');
  };

  if (activeCharacter && activeCharacter !== prevActive) {
    setPrevActive(activeCharacter);
    setSelectedChat(activeCharacter);
    setLiveHudData(getCharacterHudData(activeCharacter));
    setAllChats(prev => {
      const exists = prev.some(c => String(c.id) === String(activeCharacter.id));
      if (exists) {
        return prev.map(c => String(c.id) === String(activeCharacter.id) ? activeCharacter : c);
      }
      return [activeCharacter, ...prev];
    });
  }

  const handleSelectChat = (chat: ChatConversation) => {
    setSelectedChat(chat);
    setLiveHudData(getCharacterHudData(chat));
    onSelectChat?.(chat);
  };

  const handleLatestMessageChange = (lastText: string) => {
    setAllChats(prev => prev.map(c => {
      if (String(c.id) === String(selectedChat.id)) {
        return { ...c, message: lastText, time: 'เมื่อสักครู่' };
      }
      return c;
    }));
  };

  const handleHudUpdate = (data: {
    actor_posture?: string
    player_posture?: string
    tension?: number
    stance?: string
    dominance_state?: string
    affection?: number
    desire?: number
    current_outfit?: string
    environment?: {
      time: string
      location: string
      weather: string
    }
  }) => {
    setLiveHudData(prev => {
      const updated = { ...prev }
      if (data.actor_posture && data.actor_posture !== 'คงท่าเดิม' && data.actor_posture !== 'null') {
        updated.pose = data.actor_posture
      }
      if (data.current_outfit && data.current_outfit !== 'คงชุดเดิม' && data.current_outfit !== 'null') {
        updated.outfit = data.current_outfit
      }
      if (data.environment) {
        updated.environment = {
          time: data.environment.time || prev.environment.time,
          location: data.environment.location || prev.environment.location,
          weather: data.environment.weather || prev.environment.weather,
        }
      }
      if (data.affection !== undefined) {
        updated.relationship = {
          ...prev.relationship,
          current: Math.min(prev.relationship.max, Math.max(0, data.affection)),
          status: data.affection >= 70 ? 'ผูกพันอย่างลึกซึ้ง' : (data.affection >= 40 ? 'คุ้นเคยและสบายใจ' : (data.affection > 0 ? 'กำลังทำความรู้จัก' : 'เริ่มต้นทำความรู้จัก')),
        }
      }
      if (data.desire !== undefined) {
        updated.desire = {
          ...prev.desire,
          current: Math.min(prev.desire.max, Math.max(0, data.desire)),
          status: data.desire >= 70 ? 'โหยหาสัมผัสแนบชิด' : (data.desire >= 40 ? 'ใจเต้นแรงเมื่อสบตา' : (data.desire > 0 ? 'อยากคุยด้วยนานขึ้น' : 'ยังไม่มีความปรารถนา')),
        }
      }
      return updated
    })
  }

  const chatsForList = allChats.map(c => ({
    ...c,
    isTyping: String(c.id) === String(selectedChat.id) ? isCurrentStreaming : (c.isTyping ?? false),
  }));

  return (
    <div className="flex-1 h-screen overflow-hidden flex relative">
      <ChatList 
        onBackToHome={onBackToHome} 
        chats={chatsForList}
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
        onToggleHud={handleToggleHud}
        isInspectorOpen={isInspectorOpen}
        onToggleInspector={handleToggleInspector}
        onCloseInspector={handleCloseRightPanel}
        onSwitchToHud={handleSwitchToHud}
        coinBalance={coinBalance}
        notificationCount={notificationCount}
        onCoinClick={onCoinClick}
        onNotificationClick={onNotificationClick}
        onProfileClick={onProfileClick}
        userInitial={userInitial}
        userName={userName}
        userEmail={userEmail}
        planName={planName}
        isLoggedIn={isLoggedIn}
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        isProfileDropdownOpen={isProfileDropdownOpen}
        onCloseProfileDropdown={onCloseProfileDropdown}
        onEditProfileClick={onEditProfileClick}
        onSignOut={onSignOut}
        onCoinBalanceUpdate={onCoinBalanceUpdate}
        onHudUpdate={handleHudUpdate}
        onStreamingChange={setIsCurrentStreaming}
        onLatestMessageChange={handleLatestMessageChange}
      />
      <CharacterHud 
        data={liveHudData}
        isOpen={isHudOpen}
        onClose={handleCloseRightPanel}
        onOpenInspector={handleSwitchToInspector}
      />
    </div>
  )
}

export default ChatView
