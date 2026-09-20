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
  showDivider: _showDivider = false,
  dividerVariant: _dividerVariant = 'symmetric',
  onClick 
}: ChatItemProps) {
  const isImage = avatar?.startsWith('http')
  
  return (
    <div 
      onClick={onClick} 
      className={`group relative mx-2 my-1 flex items-center gap-3.5 px-3.5 py-3 rounded-2xl cursor-pointer transition-all duration-200 select-none ${
        isActive 
          ? 'bg-white/[0.08] shadow-sm ring-1 ring-white/[0.06]' 
          : 'hover:bg-white/[0.04] active:scale-[0.98]'
      }`}
    >
      {/* 1. รูปโปรไฟล์ตัวละคร: ขยายสู่ 50px Apple Tactile Sweet Spot คมชัดเต็มอิ่ม */}
      <div className={`w-[50px] h-[50px] rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-lg font-medium ring-1 ring-white/10 shadow-sm ${!isImage ? color : 'bg-gray-700'}`}>
        {isImage ? (
          <img src={avatar} alt={name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
        ) : (
          <span>{avatar}</span>
        )}
      </div>

      {/* 2. ฝั่งเนื้อหา: 2 แถวแบบ Balance (Apple Messages / Telegram Style) */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* แถวที่ 1: ชื่อตัวละคร, ป้ายแท็กตัวอย่าง & ตัวเลขเวลา */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-[#F5F5F7] truncate text-[14px] leading-tight">
              {name}
            </span>
            {badge && (
              <span className="px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold bg-[#EF264C]/15 border border-[#EF264C]/35 text-[#EF264C] shrink-0 select-none">
                {badge}
              </span>
            )}
            {verified && <BadgeCheck size={14} className="text-[#EF264C] flex-shrink-0 fill-current text-black" />}
            {locked && <Lock size={12} className="text-[#6E6E73] flex-shrink-0" />}
          </div>
          <span className="text-[11px] leading-tight text-[#8E8E93] font-normal shrink-0">
            {time}
          </span>
        </div>
        
        {/* แถวที่ 2: ข้อความล่าสุด หรือ 1:1 Mini Replica Bubble */}
        <div className="flex items-center justify-between gap-2 min-w-0 h-[20px]">
          {isTyping ? (
            <div className="flex-1 min-w-0 flex items-center animate-in fade-in duration-200 select-none">
              <div 
                className="inline-flex items-center justify-center gap-1 px-2.5 h-[20px] rounded-full bg-white/[0.08] border border-white/[0.06] shadow-sm"
                role="status"
                aria-label={`${name} กำลังพิมพ์...`}
              >
                <span className="w-[3px] h-[3px] rounded-full bg-[#BEBEC4] animate-typing-dot-1 shrink-0" />
                <span className="w-[3px] h-[3px] rounded-full bg-[#BEBEC4] animate-typing-dot-2 shrink-0" />
                <span className="w-[3px] h-[3px] rounded-full bg-[#BEBEC4] animate-typing-dot-3 shrink-0" />
              </div>
            </div>
          ) : (
            <p className="flex-1 min-w-0 text-[13px] text-[#8E8E93] group-hover:text-[#BEBEC4] truncate leading-snug font-normal">
              {message}
            </p>
          )}
          {unread && !isTyping && (
            <span className="w-2 h-2 rounded-full bg-[#EF264C] shrink-0" />
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatItem
