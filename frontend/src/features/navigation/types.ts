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
  userEmail?: string
  planName?: string
  className?: string
  isLoggedIn?: boolean
  onLoginClick?: () => void
  onSignupClick?: () => void
  isProfileDropdownOpen?: boolean
  onCloseProfileDropdown?: () => void
  onEditProfileClick?: () => void
  onSignOut?: () => void
}

export interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'signup'
  onGoogleSuccess?: (credential: string) => void
  onEmailSubmit?: (email: string, mode: 'login' | 'signup') => void
  isSubmitting?: boolean
}

export interface ProfileDropdownProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
  userEmail?: string
  userInitial?: string
  avatarUrl?: string
  coinBalance?: number
  planName?: string
  onEditProfileClick: () => void
  onSignOut: () => void
  onTopUpClick?: () => void
}

export interface ProfileSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
  userEmail?: string
  userInitial?: string
  avatarUrl?: string
  coinBalance?: number
  pronouns?: string
  aboutMe?: string
  onSaveProfile?: (updatedData: { name: string; username: string; pronouns: string; aboutMe: string; avatarUrl?: string }) => void
  onRedeemCoupon?: (couponCode: string) => { success: boolean; message: string; coinsAdded?: number }
  onSignOut?: () => void
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
  userName?: string
  userInitial?: string
  userHandle?: string
  isLoggedIn?: boolean
  onLoginClick?: () => void
}


