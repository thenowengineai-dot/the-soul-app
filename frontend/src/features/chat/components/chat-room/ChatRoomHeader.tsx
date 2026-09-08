import { ChevronRight, PanelLeftOpen, PanelLeftClose, PanelRightOpen, Terminal } from 'lucide-react'
import { HeaderActionGroup } from '../../../navigation'
import type { ChatRoomHeaderProps } from '../../types'

export type { ChatRoomHeaderProps }

export function ChatRoomHeader({
  chat,
  isChatListOpen = true,
  onToggleChatList,
  isHudOpen = true,
  onToggleHud,
  isInspectorOpen = false,
  onToggleInspector,
  coinBalance = 1250,
  notificationCount = 3,
  onCoinClick,
  onNotificationClick,
  onProfileClick,
  userInitial = 'A',
  userName = 'Alice',
  userEmail = '',
  planName = 'Free Plan',
  isLoggedIn = false,
  onLoginClick,
  onSignupClick,
  isProfileDropdownOpen = false,
  onCloseProfileDropdown,
  onEditProfileClick,
  onSignOut,
}: ChatRoomHeaderProps) {
  if (!chat) return null

  return (
    <div className="sticky top-0 z-30 w-full pl-2 sm:pl-3 pr-2 sm:pr-4 pt-3 pb-2 flex items-center justify-between pointer-events-none select-none relative">
      {/* Left: [Toggle ChatList Button] */}
      <div className="flex items-center gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={onToggleChatList}
          title={isChatListOpen ? 'ซ่อนแถบแชท' : 'เปิดแถบแชท'}
          className="w-8 h-8 rounded-full bg-[#121212]/65 backdrop-blur-xl border border-white/[0.07] hover:border-white/20 hover:bg-white/10 text-app-secondary hover:text-app-primary flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 select-none"
        >
          {isChatListOpen ? (
            <PanelLeftClose size={16} strokeWidth={1.8} />
          ) : (
            <PanelLeftOpen size={16} strokeWidth={1.8} />
          )}
        </button>
      </div>

      {/* Center: Character Identity & Status Pill (Dual-Line Stacked Glassmorphism Pill: รูป + ชื่อ + สถานะ + Chevron) */}
      <div className="absolute left-1/2 -translate-x-1/2 top-2 sm:top-2.5 pointer-events-auto">
        <div 
          onClick={onToggleHud}
          title="เปิด/ปิด แถบสถานะตัวละคร (HUD)"
          className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 bg-[#121212]/75 backdrop-blur-xl border border-white/15 hover:border-white/30 hover:bg-white/10 rounded-full shadow-2xl transition-all cursor-pointer group select-none active:scale-95"
        >
          {/* รูปโปรไฟล์ตัวละคร */}
          <div className="relative w-[32px] h-[32px] sm:w-[34px] sm:h-[34px] rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/20 shadow-md">
            <img 
              src={chat.avatar} 
              alt={chat.name} 
              referrerPolicy="no-referrer" 
              className="w-full h-full object-cover" 
            />
            {/* จุดสถานะออนไลน์สีเขียว */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-1.5 ring-[#121212]" />
          </div>

          {/* ข้อความหลังรูป (2 บรรทัด: ชื่อตัวละคร + สถานะ/อารมณ์สไตล์ LINE/Discord) */}
          <div className="flex flex-col text-left justify-center min-w-0 pr-0.5">
            <div className="flex items-center gap-1 leading-tight">
              <span className="font-bold text-app-primary text-[12.5px] sm:text-[13px] truncate group-hover:text-white transition-colors">
                {chat.name} 💕
              </span>
            </div>
            <span className="text-[10.5px] sm:text-[11px] text-app-secondary leading-tight truncate max-w-[130px] sm:max-w-[210px] group-hover:text-app-primary/80 transition-colors">
              {chat.statusMessage || "ออนไลน์ • พร้อมคุยเสมอ"}
            </span>
          </div>

          {/* Chevron ลูกศร */}
          <ChevronRight size={14} className="text-app-secondary group-hover:text-app-primary transition-colors flex-shrink-0 opacity-70 group-hover:opacity-100" />
        </div>
      </div>

      {/* Right: User Actions [Coin Balance Pill] [Notification Bell] [Profile] or [Login/Signup] + [Toggle HUD Button] */}
      <div className="flex items-center gap-2 pointer-events-auto ml-auto">
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

        {/* Toggle Inspector Button (Dev Console) - เด่นชัด สีเขียวมรกต อยู่ฝั่งขวาติดกับ HUD */}
        {onToggleInspector && (
          <button
            type="button"
            onClick={onToggleInspector}
            title={isInspectorOpen ? 'ปิดหน้าต่าง Dev Console & Inspector' : 'เปิดหน้าต่าง Dev Console & Inspector'}
            className={`h-8 px-2.5 rounded-full backdrop-blur-xl border transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-1.5 select-none ${
              isInspectorOpen
                ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 shadow-emerald-500/15'
                : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40'
            }`}
          >
            <Terminal size={14} strokeWidth={2.2} />
            <span className="text-[11px] font-mono font-bold tracking-wide hidden sm:inline">
              DEV
            </span>
          </button>
        )}

        {/* Toggle Character HUD Button (แสดงเฉพาะตอนที่ HUD ซ่อนอยู่ เพื่อให้มีปุ่มปิดเปิดเพียงปุ่มเดียวที่ขวาสุด) */}
        {onToggleHud && !isHudOpen && (
          <button
            type="button"
            onClick={onToggleHud}
            title="เปิดแถบสถานะตัวละคร"
            className="w-8 h-8 rounded-full bg-[#121212]/65 backdrop-blur-xl border border-white/[0.07] hover:border-white/20 hover:bg-white/10 text-app-secondary hover:text-app-primary flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 select-none"
          >
            <PanelRightOpen size={16} strokeWidth={1.8} />
          </button>
        )}
      </div>
    </div>
  )
}

export default ChatRoomHeader
