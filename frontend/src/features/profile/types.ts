export interface ProfileViewProps {
  userName?: string
  userEmail?: string
  userInitial?: string
  avatarUrl?: string
  coinBalance?: number
  pronouns?: string
  aboutMe?: string
  username?: string
  onSaveProfile?: (updatedData: {
    name: string
    username: string
    pronouns: string
    aboutMe: string
    avatarUrl?: string
  }) => void
  onRedeemCoupon?: (couponCode: string) => {
    success: boolean
    message: string
    coinsAdded?: number
  } | Promise<{
    success: boolean
    message: string
    coinsAdded?: number
  }>
  onSignOut?: () => void
  onBackToHome?: () => void
  onTopUpCoins?: () => void
}
