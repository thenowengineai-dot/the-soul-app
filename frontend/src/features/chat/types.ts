import type React from 'react'

export type ChatMessageType = 'msg' | 'date' | 'vo' | 'action'
export type ChatSender = 'me' | 'them'

export interface ChatMessage {
  id: number | string
  type: ChatMessageType
  text: string
  sender?: ChatSender
}

export interface ChatConversation {
  id: number | string
  name: string
  message: string
  time: string
  unread: boolean
  unreadCount?: number
  verified?: boolean
  locked?: boolean
  avatar: string
  color?: string
  statusMessage?: string
}

// ----------------------------------------------------------------------
// 1. Chat List Zone Contracts
// ----------------------------------------------------------------------

export interface ChatItemProps {
  id?: number | string
  avatar: string
  color?: string
  name: string
  verified?: boolean
  locked?: boolean
  message: string
  time: string
  unread?: boolean
  unreadCount?: number
  isActive?: boolean
  onClick?: () => void
}

export interface ChatListHeaderProps {
  onBackToHome: () => void
}

export interface ChatSearchBoxProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export interface ChatListProps {
  onBackToHome: () => void
  chats?: ChatConversation[]
  selectedChatId?: number | string
  onSelectChat?: (chat: ChatConversation) => void
  isOpen?: boolean
  onToggleCollapse?: () => void
}

// ----------------------------------------------------------------------
// 2. Chat Room Zone Contracts
// ----------------------------------------------------------------------

export interface ChatRoomHeaderProps {
  chat?: ChatConversation
  isChatListOpen?: boolean
  onToggleChatList?: () => void
  isHudOpen?: boolean
  onToggleHud?: () => void
  coinBalance?: number
  notificationCount?: number
  onCoinClick?: () => void
  onNotificationClick?: () => void
  onProfileClick?: () => void
  userInitial?: string
  userName?: string
}

export interface MessageBubbleProps {
  message: ChatMessage
  isMe?: boolean
  isLast?: boolean
  marginTop?: string
  chatAvatar?: string
  chatName?: string
}

export interface MessageListProps {
  messages: ChatMessage[]
  chatAvatar?: string
  chatName?: string
}

export interface ChatInputBarProps {
  inputMessage?: string
  onInputChange?: (value: string) => void
  onSendMessage?: () => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export interface ChatRoomProps {
  chat?: ChatConversation
  messages?: ChatMessage[]
  isChatListOpen?: boolean
  onToggleChatList?: () => void
  isHudOpen?: boolean
  onToggleHud?: () => void
  coinBalance?: number
  notificationCount?: number
  onCoinClick?: () => void
  onNotificationClick?: () => void
  onProfileClick?: () => void
  userInitial?: string
  userName?: string
}

// ----------------------------------------------------------------------
// 3. Character HUD Zone Contracts
// ----------------------------------------------------------------------

export interface CharacterGauge {
  label: string
  status?: string
  current: number
  max: number
  color?: string
}

export interface CharacterEnvironment {
  time: string
  location: string
  weather: string
}

export interface CharacterHudData {
  characterId: number | string
  name: string
  gender: string
  age: string
  role?: string
  avatar: string
  image?: string
  pose: string
  outfit: string
  relationship: CharacterGauge
  desire: CharacterGauge
  environment: CharacterEnvironment
}

export interface HudHeaderProps {
  panelWidth: 'normal' | 'wide'
  onSetPanelWidth: (width: 'normal' | 'wide') => void
  onClose: () => void
}

export interface HudVisualCardProps {
  image?: string
  avatar: string
  name: string
  outfit: string
  pose: string
}

export interface HudIdentityMetaProps {
  name: string
  gender: string
  age: string
  role?: string
}

export interface HudGaugesProps {
  relationship: CharacterGauge
  desire: CharacterGauge
}

export interface HudEnvironmentProps {
  environment: CharacterEnvironment
}

export interface CharacterHudProps {
  data?: CharacterHudData
  isOpen: boolean
  onClose: () => void
}

// ----------------------------------------------------------------------
// 4. Chat View Root Contract
// ----------------------------------------------------------------------

export interface ChatViewProps {
  onBackToHome: () => void
  onSelectChat?: (chat: ChatConversation) => void
  coinBalance?: number
  notificationCount?: number
  onCoinClick?: () => void
  onNotificationClick?: () => void
  onProfileClick?: () => void
  userInitial?: string
  userName?: string
}

// ----------------------------------------------------------------------
// 5. The Unified Interaction Round Contracts (The Master Specification)
// ----------------------------------------------------------------------

export type SegmentType = 'vo_main' | 'vo_intimate' | 'action' | 'dialogue'

export interface ResponseSegment {
  order: number
  type: SegmentType
  text: string
}

export interface PlayerInput {
  text: string
  action?: string | null
  selected_choice_id?: string | null
}

export interface SystemChoice {
  choice_id: string
  text: string
  matched_path: string
}

export interface RoundStateSnapshot {
  affection: number
  desire: number
  a_pos: string
  p_pos: string
  scene_id: string
  beat_id: string
}

export interface UnifiedInteractionRound {
  round_id: string
  round_number: number
  timestamp: number
  player: PlayerInput | null
  response: ResponseSegment[]
  system_choices?: SystemChoice[] | null
  state: RoundStateSnapshot
}

