export interface AnnouncementItem {
  id: number
  bgColor: string
  hoverBgColor: string
  accentColor: string
  tagText: string
  badge: string
  hasTimer: boolean
  mainText: string
  highlightText?: string
  highlightColor?: string
  characterImage: string
  characterName: string
}

export type GenderType = 'all' | 'female' | 'male' | 'non-binary'
export type SortType = 'trending' | 'popular' | 'recent' | null

export interface HomeTopBarProps {
  onLogoClick?: () => void
  coinBalance?: number
  notificationCount?: number
  onCoinClick?: () => void
  onNotificationClick?: () => void
  onProfileClick?: () => void
  userInitial?: string
  userName?: string
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export interface HomeViewProps {
  onNavigateToChat: (character?: import('../characters/types').Character, options?: { forceNewSession?: boolean }) => void
  coinBalance?: number
  notificationCount?: number
  onCoinClick?: () => void
  onNotificationClick?: () => void
  onProfileClick?: () => void
  userInitial?: string
  userName?: string
}

