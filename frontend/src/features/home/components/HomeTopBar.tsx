import { Search } from 'lucide-react'
import { HeaderActionGroup } from '../../navigation'
import type { HomeTopBarProps } from '../types'

export type { HomeTopBarProps }

export default function HomeTopBar({
  onLogoClick,
  coinBalance = 1250,
  notificationCount = 3,
  onCoinClick,
  onNotificationClick,
  onProfileClick,
  userInitial = 'A',
  userName = 'Alice',
  userEmail = '',
  planName = 'Free Plan',
  searchQuery = '',
  onSearchChange,
  isLoggedIn = false,
  onLoginClick,
  onSignupClick,
  isProfileDropdownOpen = false,
  onCloseProfileDropdown,
  onEditProfileClick,
  onSignOut,
}: HomeTopBarProps) {
  return (
    <header className="w-full h-16 bg-[#121214]/95 backdrop-blur-xl border-b border-white/[0.06] z-30 transition-all duration-200 flex items-center justify-between px-6 shrink-0 select-none">
      {/* 1. Far Left: Pure Brand Logo (Downbeat: Quiet & Confident) */}
      <div className="flex items-center shrink-0">
        <div 
          onClick={onLogoClick}
          title="Maomoi Ai"
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-xl group-hover:bg-white/[0.06] transition-all flex-shrink-0">
            <img 
              src="/logo/logo.png" 
              alt="Maomoi Ai Logo" 
              className="w-8 h-8 object-contain drop-shadow-[0_2px_10px_rgba(236,72,153,0.35)] group-hover:scale-105 transition-transform duration-200" 
            />
          </div>
          <div className="flex items-center overflow-hidden">
            <img 
              src="/logo/maomoi_ai_white.png" 
              alt="Maomoi Ai" 
              className="h-5 w-auto object-contain flex-shrink-0" 
            />
          </div>
        </div>
      </div>

      {/* 2. Center: Slim Pillow Search Capsule (Apple Safari/Spotlight: 40px height with 12px vertical breathing room) */}
      <div className="flex-1 flex justify-center max-w-[460px] md:max-w-[520px] mx-4 sm:mx-6">
        <div className="group flex items-center w-full h-10 bg-[#18181D]/90 backdrop-blur-xl rounded-full px-3.5 border border-white/[0.08] hover:border-white/20 focus-within:border-white/30 shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition-all duration-200">
          <Search className="text-[#86868B] group-focus-within:text-[#F5F5F7] transition-colors flex-shrink-0" size={15} strokeWidth={1.8} />
          <input 
            type="text" 
            placeholder="ค้นหาตัวละคร, เรื่องราว, หรือบทบาท..." 
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full bg-transparent text-[#F5F5F7] placeholder-[#86868B] pl-2.5 pr-2 outline-none text-[13.5px] font-normal" 
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10.5px] font-mono text-[#86868B] bg-white/[0.06] border border-white/[0.08] select-none shrink-0">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* 3. Far Right: Header Action Group (Coin, Notification, Profile or Login/Signup) */}
      <div className="shrink-0 flex items-center">
        <HeaderActionGroup
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
        />
      </div>
    </header>
  );
}
