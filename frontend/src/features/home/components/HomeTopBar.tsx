import { Search, Menu } from 'lucide-react'
import { HeaderActionGroup } from '../../navigation'
import type { HomeTopBarProps } from '../types'

export type { HomeTopBarProps }

export default function HomeTopBar({
  onLogoClick,
  onToggleSidebar,
  isSidebarExpanded = false,
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
    <header className="w-full bg-[rgb(13,13,13)]/95 backdrop-blur-xl border-b border-app-border z-30 transition-all duration-200 flex items-center justify-between pl-[22px] pr-4 sm:pr-6 md:pr-8 py-3 sm:py-3.5 shrink-0 select-none">
      {/* 1. Far Left: Hamburger Menu + Full Logo (YouTube Style) */}
      <div className="flex items-center gap-4 shrink-0">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title={isSidebarExpanded ? "ย่อแถบเมนู" : "ขยายแถบเมนู"}
            aria-label={isSidebarExpanded ? "ย่อแถบเมนู" : "ขยายแถบเมนู"}
            className="w-10 h-10 rounded-full flex items-center justify-center text-app-primary hover:bg-white/[0.08] active:scale-95 transition-all cursor-pointer select-none shrink-0"
          >
            <Menu size={20} strokeWidth={2} />
          </button>
        )}

        <div 
          onClick={onLogoClick}
          title="Maomoi Ai"
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl group-hover:bg-white/[0.06] transition-all flex-shrink-0">
            <img 
              src="/logo/logo.png" 
              alt="Maomoi Ai Logo" 
              className="w-8 h-8 sm:w-[34px] sm:h-[34px] object-contain drop-shadow-[0_2px_10px_rgba(236,72,153,0.35)] group-hover:scale-105 transition-transform duration-200" 
            />
          </div>
          <div className="flex items-center overflow-hidden">
            <img 
              src="/logo/maomoi_ai_white.png" 
              alt="Maomoi Ai" 
              className="h-5 sm:h-[21px] w-auto object-contain flex-shrink-0" 
            />
          </div>
        </div>
      </div>

      {/* 2. Center: Search Box (Same design as original) */}
      <div className="flex-1 flex justify-center max-w-[460px] md:max-w-[520px] lg:max-w-[560px] mx-3 sm:mx-6">
        <div className="group flex items-center w-full h-[42px] sm:h-[44px] bg-transparent rounded-full px-4 border border-app-border hover:border-white/20 focus-within:border-[#EF264C] focus-within:hover:border-[#EF264C] transition-all duration-200">
          <Search className="text-app-secondary transition-colors flex-shrink-0" size={17} strokeWidth={2} />
          <input 
            type="text" 
            placeholder="ค้นหา..." 
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full bg-transparent text-app-primary placeholder-app-secondary pl-3 outline-none text-[14px] sm:text-[15px]" 
          />
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
