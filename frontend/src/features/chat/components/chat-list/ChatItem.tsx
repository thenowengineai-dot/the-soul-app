import { BadgeCheck, Lock } from 'lucide-react'
import type { ChatItemProps } from '../../types'

export type { ChatItemProps }

export function ChatItem({ 
  avatar, 
  color, 
  name, 
  verified, 
  locked, 
  badge,
  message, 
  time, 
  unread, 
  isActive, 
  isTyping = false, 
  showDivider = false,
  dividerVariant = 'symmetric',
  onClick 
}: ChatItemProps) {
  const isImage = avatar?.startsWith('http')
  
  return (
    <div 
      onClick={onClick} 
      className={`relative flex items-center gap-3.5 sm:gap-4 px-3.5 sm:px-4 py-3.5 sm:py-4 cursor-pointer transition-colors select-none ${
        isActive ? 'bg-white/[0.08]' : 'hover:bg-white/5'
      }`}
    >
      {/* 1. รูปโปรไฟล์ตัวละคร */}
      <div className={`w-[50px] sm:w-[52px] h-[50px] sm:h-[52px] rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-xl font-medium ring-1 ring-white/10 ${!isImage ? color : 'bg-gray-700'}`}>
        {isImage ? (
          <img src={avatar} alt={name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
        ) : (
          <span>{avatar}</span>
        )}
      </div>

      {/* 2. ฝั่งเนื้อหา: 2 แถวแบบ Balance (Apple Messages / Telegram Style) */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* แถวที่ 1: ชื่อตัวละคร, ป้ายแท็กตัวอย่าง & ตัวเลขเวลา */}
        <div className="flex items-center justify-between gap-2 mb-1 sm:mb-1.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-app-primary truncate text-[14px] sm:text-[15px] leading-tight">
              {name}
            </span>
            {badge && (
              <span className="px-1.5 py-0.5 rounded text-[10.5px] font-semibold bg-[#EF264C]/15 border border-[#EF264C]/40 text-[#EF264C] shrink-0 select-none">
                {badge}
              </span>
            )}
            {verified && <BadgeCheck size={15} className="text-[#EF264C] flex-shrink-0 fill-current text-black" />}
            {locked && <Lock size={13} className="text-app-muted flex-shrink-0" />}
          </div>
          <span className="text-[12px] leading-tight text-app-muted font-normal shrink-0">
            {time}
          </span>
        </div>
        
        {/* แถวที่ 2: ข้อความล่าสุด หรือ 1:1 Mini Replica Bubble (สไตล์ห้องแชทเป๊ะๆ ตัดมุมล่างซ้าย rounded-bl-none) */}
        <div className="flex items-center justify-between gap-2 min-w-0 h-[21px]">
          {isTyping ? (
            <div className="flex-1 min-w-0 flex items-center animate-in fade-in duration-200 select-none">
              <div 
                className="inline-flex items-center justify-center gap-1 px-3 h-[21px] rounded-[11px] rounded-bl-none bg-app-surface border border-white/[0.06] shadow-sm"
                role="status"
                aria-label={`${name} กำลังพิมพ์...`}
              >
                <span className="w-[3px] h-[3px] rounded-full bg-[#BEBEC4] animate-typing-dot-1 shrink-0" />
                <span className="w-[3px] h-[3px] rounded-full bg-[#BEBEC4] animate-typing-dot-2 shrink-0" />
                <span className="w-[3px] h-[3px] rounded-full bg-[#BEBEC4] animate-typing-dot-3 shrink-0" />
              </div>
            </div>
          ) : (
            <p className="flex-1 min-w-0 text-[13.5px] sm:text-[14px] text-app-muted truncate leading-snug">
              {message}
            </p>
          )}
          {unread && !isTyping && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C] shrink-0" />
          )}
        </div>
      </div>

      {/* 3. เส้นคั่นแนวนอนบางเฉียบสไตล์ Twitter X (บางเท่ากับเส้นใต้แชทสดฝั่งขวา ไม่ชิดขอบซ้ายขวา) */}
      {showDivider && (
        <div 
          className={`absolute bottom-0 h-[1px] bg-[#2F3336]/60 pointer-events-none transition-opacity ${
            dividerVariant === 'indented'
              ? 'left-[76px] sm:left-[82px] right-3.5 sm:right-4'
              : 'left-3.5 right-3.5 sm:left-4 sm:right-4'
          }`} 
        />
      )}
    </div>
  )
}

export default ChatItem
