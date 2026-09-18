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
    return <DefaultIcon strokeWidth={2} size={24} className="flex-shrink-0" />
  }

  // Active state: ใช้ไอคอนเดิม 100% ที่ถูกถมสีขาว (ไม่ใช่ไอคอนใหม่ และแชทไม่มีจุดข้างใน)
  if (id === 'home') {
    // ไอคอน Home เดิม: ถมสีขาว โดยช่องประตูเป็นสีดำชัดเจน
    return (
      <div className="relative w-6 h-6 flex items-center justify-center flex-shrink-0">
        <DefaultIcon 
          strokeWidth={2} 
          size={24} 
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
        size={24} 
        className="flex-shrink-0 text-white [&>path]:fill-white" 
      />
    )
  }

  if (id === 'pricing') {
    // ไอคอน Tag (Pricing): เมื่อ active ให้ถมสีขาว และช่องร้อยเชือกวงกลมเป็นสีดำ
    return (
      <DefaultIcon 
        strokeWidth={2} 
        size={24} 
        className="flex-shrink-0 fill-white text-white [&>circle]:fill-black [&>circle]:stroke-black" 
      />
    )
  }

  // สำหรับ Crown, MessageCircle (ไอคอนเดิม ไม่มีจุดด้านใน), Heart: ใช้ไอคอนเดิมถมสีขาว
  return (
    <DefaultIcon 
      strokeWidth={2} 
      size={24} 
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
      ${isSidebarExpanded ? 'w-[240px] px-3' : 'w-[72px] px-2'} 
      ${isHomeMode ? 'h-full pt-2 sm:pt-2.5' : 'h-screen pt-2 sm:pt-2.5'} 
      flex-shrink-0 border-r border-white/[0.06] flex flex-col pb-3 bg-[#101012]/95 backdrop-blur-xl relative transition-all duration-300 ease-in-out z-20 select-none overscroll-none touch-pan-y
    `}>
      {/* Circular Hamburger Button sitting directly on the gray divider line (เฉพาะตอนเข้าห้องแชท / !isHomeMode ตามการออกแบบเดิม) */}
      {!isHomeMode && (
        <button 
          type="button"
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          title={isSidebarExpanded ? "ย่อแถบเมนู" : "ขยายแถบเมนู"}
          aria-label={isSidebarExpanded ? "ย่อแถบเมนู" : "ขยายแถบเมนู"}
          className="absolute -right-3.5 top-[36px] sm:top-[38px] z-30 w-7 h-7 rounded-full bg-[#161616] border border-app-border flex items-center justify-center text-app-primary hover:text-white hover:bg-[#252525] hover:border-white/40 shadow-lg cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 select-none"
        >
          <Menu size={14} strokeWidth={2.2} />
        </button>
      )}

      {/* Top Logo (Rendered only when NOT in home mode; on home mode, it is displayed in HomeTopBar) */}
      {!isHomeMode && (
        <div 
          onClick={handleLogo}
          title="Maomoi Ai"
          className={`flex items-center ${isSidebarExpanded ? 'px-1 mb-2 gap-3' : 'justify-center mb-2'} h-10 cursor-pointer group select-none`}
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-xl group-hover:bg-white/[0.06] transition-all flex-shrink-0">
            <img 
              src="/logo/logo.png" 
              alt="Maomoi Ai Logo" 
              className="w-8 h-8 object-contain drop-shadow-[0_2px_10px_rgba(236,72,153,0.35)] group-hover:scale-105 transition-transform duration-200" 
            />
          </div>
          {isSidebarExpanded && (
            <div className="flex items-center overflow-hidden transition-all duration-200">
              <img 
                src="/logo/maomoi_ai_white.png" 
                alt="Maomoi Ai" 
                className="h-5 w-auto object-contain flex-shrink-0" 
              />
            </div>
          )}
        </div>
      )}

      {/* Middle Scrollable Section: Menu Items + Divider + Creator Subscriptions */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col min-h-0 py-1 overscroll-contain touch-pan-y">
        {/* Menu Items (Apple 48px Height Cushion System) */}
        <div className="flex flex-col gap-1.5 w-full">
          {SIDEBAR_MENU.map(item => {
            const Icon = item.icon;
            const isActive = selectedMenu === item.id;
            
            if (!isSidebarExpanded) {
              // Collapsed Mode (48px Icon Capsule) - Soft Island
              return (
                <div key={item.id} className="relative flex items-center justify-center w-full">
                  <button
                    type="button"
                    title={item.label}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-12 h-12 flex items-center justify-center rounded-2xl cursor-pointer transition-all duration-150 ${
                      isActive 
                        ? 'bg-white/10 text-[#F5F5F7] shadow-sm' 
                        : 'text-[#86868B] hover:text-[#F5F5F7] hover:bg-white/[0.06]'
                    }`}
                  >
                    <MenuIcon id={item.id} isActive={isActive} DefaultIcon={Icon} />
                  </button>
                </div>
              );
            }

            // Expanded Mode (Row with Icon + Text Label - 48px Soft Cushion Island)
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleMenuClick(item.id)}
                className={`w-full h-12 flex items-center gap-3 px-3 rounded-2xl cursor-pointer transition-all duration-150 text-left ${
                  isActive 
                    ? 'bg-white/10 text-[#F5F5F7] font-semibold shadow-sm' 
                    : 'text-[#86868B] hover:text-[#F5F5F7] hover:bg-white/[0.06]'
                }`}
              >
                <MenuIcon id={item.id} isActive={isActive} DefaultIcon={Icon} />
                <span className="text-[14px] truncate leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Gray Hairline Divider Between Main Menu & Subscriptions */}
        <div className="w-full h-[1px] bg-white/[0.06] my-3 shrink-0" />

        {/* Creator Subscriptions */}
        <CreatorSubscriptions 
          isSidebarExpanded={isSidebarExpanded}
          creators={followedCreators}
          onCreatorClick={onCreatorClick}
        />

        {/* Gray Hairline Divider Before Action Button */}
        <div className="w-full h-[1px] bg-white/[0.06] my-3 shrink-0" />

        {/* Create Button ("สร้าง" 48px Pill Capsule) */}
        <div className={`mt-0.5 mb-2 ${isSidebarExpanded ? 'w-full' : 'relative flex justify-center'}`}>
          <button 
            type="button"
            title="สร้าง"
            onClick={handleCompose}
            className={`
              ${isSidebarExpanded ? 'w-full h-12 px-4 rounded-full flex items-center justify-center gap-2.5 font-medium' : 'w-12 h-12 rounded-full flex items-center justify-center'}
              bg-white text-black hover:bg-white/90 active:scale-95 transition-all cursor-pointer shadow-[0_4px_16px_rgba(255,255,255,0.12)]
            `}
          >
            <SquarePlus strokeWidth={2} size={20} className="flex-shrink-0" />
            {isSidebarExpanded && <span className="text-[14px] font-semibold truncate">สร้าง</span>}
          </button>
        </div>

      </div>

      {/* Bottom Area: User Profile Dock + Settings (Apple 8pt Rhythm) */}
      <div className="mt-auto pt-2 border-t border-white/[0.06] w-full flex flex-col gap-1.5">
        {/* User Profile Dock: คลิกเพื่อเข้าหน้าโปรไฟล์ & ศูนย์ควบคุม */}
        {isLoggedIn ? (
          isSidebarExpanded ? (
            <button
              type="button"
              title="โปรไฟล์ & ศูนย์ควบคุมของคุณ"
              onClick={() => handleMenuClick('profile')}
              className={`w-full h-14 flex items-center gap-3 px-3 rounded-2xl cursor-pointer transition-all duration-150 text-left ${
                selectedMenu === 'profile'
                  ? 'bg-white/15 border border-white/20 text-white font-medium shadow-md'
                  : 'hover:bg-white/10 text-app-primary border border-transparent'
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full ring-1 ring-[#2F3336] bg-gradient-to-br from-[#2D2D32] to-[#1C1C1E] flex items-center justify-center">
                  <span className="text-[13px] font-bold text-app-primary leading-none">
                    {userInitial}
                  </span>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[rgb(13,13,13)]" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="text-[13.5px] font-bold truncate leading-tight">
                  {userName}
                </span>
                <span className="text-[11.5px] text-app-secondary truncate leading-tight">
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
                className={`w-12 h-12 flex items-center justify-center rounded-2xl cursor-pointer transition-all duration-150 ${
                  selectedMenu === 'profile'
                    ? 'bg-white/15 border border-white/20'
                    : 'hover:bg-white/10'
                }`}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full ring-1 ring-[#2F3336] bg-gradient-to-br from-[#2D2D32] to-[#1C1C1E] flex items-center justify-center">
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
              className="w-full h-12 flex items-center justify-center gap-2 px-3 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white text-[14px] font-medium cursor-pointer transition-all shadow-sm active:scale-95"
            >
              <User size={20} />
              <span>เข้าสู่ระบบ</span>
            </button>
          ) : (
            <div className="relative flex items-center justify-center w-full">
              <button
                type="button"
                title="เข้าสู่ระบบ"
                onClick={onLoginClick}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-[#EF264C]/15 hover:bg-[#EF264C]/25 text-[#EF264C] border border-[#EF264C]/30 cursor-pointer transition-all duration-150 active:scale-95"
              >
                <User size={20} strokeWidth={2} />
              </button>
            </div>
          )
        )}

        {/* Settings Button (48px Row) */}
        {isSidebarExpanded ? (
          <button
            type="button"
            onClick={() => handleMenuClick('settings')}
            className={`w-full h-12 flex items-center gap-3 px-3 rounded-2xl cursor-pointer transition-all duration-150 text-left text-app-secondary hover:text-app-primary hover:bg-white/5 ${
              selectedMenu === 'settings' ? 'font-medium text-app-primary bg-white/5' : ''
            }`}
          >
            <Settings strokeWidth={2} size={22} className="flex-shrink-0" />
            <span className="text-[14px] truncate leading-tight">
              การตั้งค่า
            </span>
          </button>
        ) : (
          <div className="relative flex items-center justify-center w-full">
            <button
              type="button"
              title="การตั้งค่า"
              onClick={() => handleMenuClick('settings')}
              className="w-12 h-12 flex items-center justify-center rounded-2xl cursor-pointer transition-all duration-150 text-app-secondary hover:text-app-primary hover:bg-white/5"
            >
              <Settings strokeWidth={2} size={22} />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default Sidebar;

