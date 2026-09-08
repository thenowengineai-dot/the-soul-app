import { Menu, SquarePlus, Settings, User } from 'lucide-react'
import { SIDEBAR_MENU } from '../mockData'
import CreatorSubscriptions from './CreatorSubscriptions'
import type { SidebarProps } from '../types'

export type { SidebarProps }

interface MenuIconProps {
  id: string
  isActive: boolean
  DefaultIcon: React.ComponentType<{ size?: number | string; strokeWidth?: number | string; className?: string }>
}

function MenuIcon({ id, isActive, DefaultIcon }: MenuIconProps) {
  if (!isActive) {
    return <DefaultIcon strokeWidth={2.2} size={20} className="flex-shrink-0" />
  }

  // Active state: ใช้ไอคอนเดิม 100% ที่ถูกถมสีขาว (ไม่ใช่ไอคอนใหม่ และแชทไม่มีจุดข้างใน)
  if (id === 'home') {
    // ไอคอน Home เดิม: ถมสีขาว โดยช่องประตูเป็นสีดำชัดเจน
    return (
      <div className="relative w-5 h-5 flex items-center justify-center flex-shrink-0">
        <DefaultIcon 
          strokeWidth={2} 
          size={20} 
          className="fill-white text-white" 
        />
        <svg viewBox="0 0 24 24" className="absolute inset-0 w-full h-full pointer-events-none">
          <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8z" fill="black" />
        </svg>
      </div>
    )
  }

  if (id === 'quests') {
    // ไอคอน Compass เดิม: ถมสีขาวเฉพาะเข็มทิศด้านใน วงกลมด้านนอกเป็นเส้นโปร่ง
    return (
      <DefaultIcon 
        strokeWidth={2} 
        size={20} 
        className="flex-shrink-0 text-white [&>path]:fill-white" 
      />
    )
  }

  if (id === 'pricing') {
    // ไอคอน Tag (Pricing): เมื่อ active ให้ถมสีขาว และช่องร้อยเชือกวงกลมเป็นสีดำ
    return (
      <DefaultIcon 
        strokeWidth={2} 
        size={20} 
        className="flex-shrink-0 fill-white text-white [&>circle]:fill-black [&>circle]:stroke-black" 
      />
    )
  }

  // สำหรับ Crown, MessageCircle (ไอคอนเดิม ไม่มีจุดด้านใน), Heart: ใช้ไอคอนเดิมถมสีขาว
  return (
    <DefaultIcon 
      strokeWidth={2} 
      size={20} 
      className="flex-shrink-0 fill-white text-white" 
    />
  )
}

function Sidebar({
  isSidebarExpanded,
  setIsSidebarExpanded,
  selectedMenu,
  handleMenuClick,
  onLogoClick,
  onComposeClick,
  followedCreators,
  onCreatorClick,
  isHomeMode = false,
  userName = 'Alice',
  userInitial = 'A',
  userHandle = '@alice',
  isLoggedIn = false,
  onLoginClick,
}: SidebarProps) {
  const handleLogo = onLogoClick || (() => handleMenuClick('home'));
  const handleCompose = onComposeClick || (() => handleMenuClick('chats'));

  return (
    <div className={`
      ${isSidebarExpanded ? 'w-[230px] px-3.5' : 'w-[70px] px-3'} 
      ${isHomeMode ? 'h-full pt-2.5 sm:pt-3' : 'h-screen pt-3.5 sm:pt-4'} 
      flex-shrink-0 border-r border-app-border flex flex-col pb-3 bg-app-bg/50 backdrop-blur-xl relative transition-all duration-300 ease-in-out z-20 select-none overscroll-none touch-pan-y
    `}>
        
      {/* Circular Hamburger Button sitting directly on the gray divider line, positioned between Logo and Home icon */}
      <button 
        type="button"
        onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
        title={isSidebarExpanded ? "ย่อแถบเมนู" : "ขยายแถบเมนู"}
        className={`absolute -right-3.5 ${isHomeMode ? 'top-[9px] sm:top-[11px]' : 'top-[48px] sm:top-[52px]'} z-30 w-7 h-7 rounded-full bg-[#161616] border border-app-border flex items-center justify-center text-app-primary/90 hover:text-app-primary hover:bg-[#252525] hover:border-white/40 shadow-lg cursor-pointer transition-all duration-200 hover:scale-110`}
      >
        <Menu size={14} strokeWidth={2.2} />
      </button>

      {/* Top Logo (Rendered only when NOT in home mode; on home mode, it is displayed in HomeTopBar) */}
      {!isHomeMode && (
        <div 
          onClick={handleLogo}
          title="Maomoi Ai"
          className={`flex items-center ${isSidebarExpanded ? 'px-1 mb-3 gap-2.5' : 'justify-center mb-3'} h-[40px] sm:h-[42px] cursor-pointer group select-none`}
        >
          <div className="w-[40px] h-[40px] sm:w-[42px] sm:h-[42px] flex items-center justify-center rounded-xl group-hover:bg-white/[0.06] transition-all flex-shrink-0">
            <img 
              src="/logo/logo.png" 
              alt="Maomoi Ai Logo" 
              className="w-[34px] h-[34px] sm:w-[36px] sm:h-[36px] object-contain drop-shadow-[0_2px_10px_rgba(236,72,153,0.35)] group-hover:scale-105 transition-transform duration-200" 
            />
          </div>
          {isSidebarExpanded && (
            <div className="flex items-center overflow-hidden transition-all duration-200">
              <img 
                src="/logo/maomoi_ai_white.png" 
                alt="Maomoi Ai" 
                className="h-[20px] w-auto object-contain flex-shrink-0" 
              />
            </div>
          )}
        </div>
      )}

      {/* Middle Scrollable Section: Menu Items + Divider + Creator Subscriptions */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col min-h-0 py-1 overscroll-contain touch-pan-y">
        {/* Menu Items (YouTube Style with comfortable spacing) */}
        <div className="flex flex-col gap-1.5 w-full">
          {SIDEBAR_MENU.map(item => {
            const Icon = item.icon;
            const isActive = selectedMenu === item.id;
            
            if (!isSidebarExpanded) {
              // Collapsed Mode (Icon only + Tooltip) - 44px Standard
              return (
                <div key={item.id} className="relative flex items-center justify-center w-full">
                  <button
                    type="button"
                    title={item.label}
                    onClick={() => handleMenuClick(item.id)}
                    className="w-[44px] h-[44px] flex items-center justify-center rounded-xl cursor-pointer transition-all duration-150 text-app-primary hover:bg-white/10"
                  >
                    <MenuIcon id={item.id} isActive={isActive} DefaultIcon={Icon} />
                  </button>
                </div>
              );
            }

            // Expanded Mode (Row with Icon + Text Label as in Ref Image) - 44px Standard
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleMenuClick(item.id)}
                className={`w-full h-[44px] flex items-center gap-3 px-2.5 rounded-xl cursor-pointer transition-all duration-150 text-left text-app-primary hover:bg-white/10 ${
                  isActive ? 'font-medium' : ''
                }`}
              >
                <MenuIcon id={item.id} isActive={isActive} DefaultIcon={Icon} />
                <span className="text-[13.5px] truncate leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Gray Hairline Divider Between Main Menu & Subscriptions */}
        <div className="w-full h-[1px] bg-app-border my-3 shrink-0" />

        {/* Creator Subscriptions (YouTube Style: Circular Avatar + Creator Name + New Bot Dot) */}
        <CreatorSubscriptions 
          isSidebarExpanded={isSidebarExpanded}
          creators={followedCreators}
          onCreatorClick={onCreatorClick}
        />

        {/* Gray Hairline Divider Before Action Button */}
        <div className="w-full h-[1px] bg-app-border my-3 shrink-0" />

        {/* Create Button ("สร้าง" with SquarePlus icon on White background) - 44px Standard */}
        <div className={`mt-0.5 mb-2 ${isSidebarExpanded ? 'w-full' : 'relative flex justify-center'}`}>
          <button 
            type="button"
            title="สร้าง"
            onClick={handleCompose}
            className={`
              ${isSidebarExpanded ? 'w-full h-[44px] px-2.5 rounded-xl flex items-center gap-3 font-medium' : 'w-[44px] h-[44px] rounded-xl flex items-center justify-center'}
              bg-app-primary text-black hover:opacity-90 transition-all cursor-pointer shadow-md
            `}
          >
            <SquarePlus strokeWidth={2.2} size={20} className="flex-shrink-0" />
            {isSidebarExpanded && <span className="text-[13.5px] font-semibold truncate">สร้าง</span>}
          </button>
        </div>

      </div>

      {/* Bottom Area: User Profile Dock (Twitter/X & ChatGPT Style) + Settings */}
      <div className="mt-auto pt-2 border-t border-app-border w-full flex flex-col gap-1.5">
        {/* User Profile Dock: คลิกเพื่อเข้าหน้าโปรไฟล์ & ศูนย์ควบคุม */}
        {isLoggedIn ? (
          isSidebarExpanded ? (
            <button
              type="button"
              title="โปรไฟล์ & ศูนย์ควบคุมของคุณ"
              onClick={() => handleMenuClick('profile')}
              className={`w-full h-[48px] flex items-center gap-2.5 px-2 rounded-2xl cursor-pointer transition-all duration-150 text-left ${
                selectedMenu === 'profile'
                  ? 'bg-white/15 border border-white/20 text-white font-medium shadow-md'
                  : 'hover:bg-white/10 text-app-primary border border-transparent'
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-[34px] h-[34px] rounded-full ring-1 ring-[#2F3336] bg-gradient-to-br from-[#2D2D32] to-[#1C1C1E] flex items-center justify-center">
                  <span className="text-[13px] font-bold text-app-primary leading-none">
                    {userInitial}
                  </span>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[rgb(13,13,13)]" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="text-[13px] font-bold truncate leading-tight">
                  {userName}
                </span>
                <span className="text-[11px] text-app-secondary truncate leading-tight">
                  {userHandle || '@traveler'}
                </span>
              </div>
            </button>
          ) : (
            <div className="relative flex items-center justify-center w-full">
              <button
                type="button"
                title={`โปรไฟล์: ${userName}`}
                onClick={() => handleMenuClick('profile')}
                className={`w-[44px] h-[44px] flex items-center justify-center rounded-xl cursor-pointer transition-all duration-150 ${
                  selectedMenu === 'profile'
                    ? 'bg-white/15 border border-white/20'
                    : 'hover:bg-white/10'
                }`}
              >
                <div className="relative">
                  <div className="w-[32px] h-[32px] rounded-full ring-1 ring-[#2F3336] bg-gradient-to-br from-[#2D2D32] to-[#1C1C1E] flex items-center justify-center">
                    <span className="text-[12px] font-bold text-app-primary leading-none">
                      {userInitial}
                    </span>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1.5 ring-[rgb(13,13,13)]" />
                </div>
              </button>
            </div>
          )
        ) : (
          /* Guest Mode: ปุ่มเข้าสู่ระบบแบบกระชับ */
          isSidebarExpanded ? (
            <button
              type="button"
              onClick={onLoginClick}
              className="w-full h-[42px] flex items-center justify-center gap-2 px-3.5 rounded-xl bg-[#EF264C] hover:bg-[#d91d40] text-white text-[14px] font-medium cursor-pointer transition-all shadow-sm active:scale-95"
            >
              <User size={16} />
              <span>เข้าสู่ระบบ</span>
            </button>
          ) : (
            <div className="relative flex items-center justify-center w-full">
              <button
                type="button"
                title="เข้าสู่ระบบ"
                onClick={onLoginClick}
                className="w-[44px] h-[44px] flex items-center justify-center rounded-xl bg-[#EF264C]/15 hover:bg-[#EF264C]/25 text-[#EF264C] border border-[#EF264C]/30 cursor-pointer transition-all duration-150 active:scale-95"
              >
                <User size={18} strokeWidth={2.2} />
              </button>
            </div>
          )
        )}

        {/* Settings Button */}
        {isSidebarExpanded ? (
          <button
            type="button"
            onClick={() => handleMenuClick('settings')}
            className={`w-full h-[40px] flex items-center gap-3 px-2.5 rounded-xl cursor-pointer transition-all duration-150 text-left text-app-secondary hover:text-app-primary hover:bg-white/5 ${
              selectedMenu === 'settings' ? 'font-medium text-app-primary bg-white/5' : ''
            }`}
          >
            <Settings strokeWidth={2.2} size={18} className="flex-shrink-0" />
            <span className="text-[13px] truncate leading-tight">
              การตั้งค่า
            </span>
          </button>
        ) : (
          <div className="relative flex items-center justify-center w-full">
            <button
              type="button"
              title="การตั้งค่า"
              onClick={() => handleMenuClick('settings')}
              className="w-[44px] h-[40px] flex items-center justify-center rounded-xl cursor-pointer transition-all duration-150 text-app-secondary hover:text-app-primary hover:bg-white/5"
            >
              <Settings strokeWidth={2.2} size={18} />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default Sidebar;

