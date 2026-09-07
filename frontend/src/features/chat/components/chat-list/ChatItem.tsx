import { BadgeCheck, Lock } from 'lucide-react'
import type { ChatItemProps } from '../../types'

export type { ChatItemProps }

export function ChatItem({ 
  avatar, 
  color, 
  name, 
  verified, 
  locked, 
  message, 
  time, 
  unread, 
  isActive, 
  onClick 
}: ChatItemProps) {
  const isImage = avatar?.startsWith('http')
  
  return (
    <div 
      onClick={onClick} 
      className={`relative flex items-center gap-3.5 sm:gap-4 px-3.5 sm:px-4 py-3 sm:py-3.5 cursor-pointer transition-colors select-none ${
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
        {/* แถวที่ 1: ชื่อตัวละคร & ตัวเลขเวลา */}
        <div className="flex items-center justify-between gap-2 mb-1 sm:mb-1.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-app-primary truncate text-[14px] sm:text-[15px] leading-tight">
              {name}
            </span>
            {verified && <BadgeCheck size={15} className="text-[#EF264C] flex-shrink-0 fill-current text-black" />}
            {locked && <Lock size={13} className="text-[rgb(113,118,123)] flex-shrink-0" />}
          </div>
          <span className="text-[12px] leading-tight text-[rgb(113,118,123)] font-normal shrink-0">
            {time}
          </span>
        </div>
        
        {/* แถวที่ 2: ข้อความล่าสุด & จุดแจ้งเตือน (#EF264C) */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <p className="flex-1 min-w-0 text-[13.5px] sm:text-[14px] text-[rgb(113,118,123)] truncate leading-snug">
            {message}
          </p>
          {unread && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C] shrink-0" />
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatItem
