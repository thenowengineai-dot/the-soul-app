import type { ComponentType } from 'react'

export interface SidebarMenuItem {
  id: string
  label: string
  icon: ComponentType<{ size?: number | string; strokeWidth?: number | string; className?: string }>
}

export interface FollowedCreator {
  id: string
  name: string
  avatar?: string
  handle?: string
  charactersCount?: number
  hasNewBot?: boolean
}

export interface CreatorSubscriptionsProps {
  isSidebarExpanded: boolean
  creators?: FollowedCreator[]
  onCreatorClick?: (creatorId: string) => void
  selectedCreatorId?: string | null
}

export interface HeaderActionGroupProps {
  coinBalance?: number
  notificationCount?: number
  onCoinClick?: () => void
  onNotificationClick?: () => void
  onProfileClick?: () => void
  userInitial?: string
  userName?: string
  className?: string
}

export interface SidebarProps {
  isSidebarExpanded: boolean
  setIsSidebarExpanded: (expanded: boolean) => void
  selectedMenu: string
  handleMenuClick: (id: string) => void
  onLogoClick?: () => void
  onComposeClick?: () => void
  followedCreators?: FollowedCreator[]
  onCreatorClick?: (creatorId: string) => void
  isHomeMode?: boolean
}

