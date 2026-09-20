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
  typingVariant = 'action',
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
        
        {/* แถวที่ 2: ข้อความล่าสุด หรือ สถานะสด (กำลังเคลื่อนไหว... / กำลังพิมพ์...) */}
        <div className="flex items-center justify-between gap-2 min-w-0 h-[20px]">
          {isTyping ? (
            <div className="flex-1 min-w-0 flex items-center animate-in fade-in duration-200 select-none">
              {typingVariant === 'action' || typingVariant === 'hybrid' ? (
                // 🌟 Action Presence: สัญลักษณ์ ✦ สีคาร์ไมน์เรด + Apple Intelligence Shimmer
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10px] text-[#EF264C] shrink-0 animate-pulse select-none">✦</span>
                  <span className="text-[12.5px] sm:text-[13px] font-medium bg-gradient-to-r from-[#EF264C] via-[#ff708d] to-[#EF264C] bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer-fast truncate tracking-wide">
                    กำลังเคลื่อนไหว...
                  </span>
                </div>
              ) : (
                // 💬 Typing Presence: กำลังพิมพ์ + 3 จุดเด้งดุ๊กดิ๊ก สีคาร์ไมน์เรด
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[12.5px] sm:text-[13px] font-medium text-[#EF264C] shrink-0">
                    กำลังพิมพ์
                  </span>
                  <div className="inline-flex items-center gap-0.5 ml-0.5">
                    <span className="w-1 h-1 rounded-full bg-[#EF264C] animate-typing-dot-1 shrink-0" />
                    <span className="w-1 h-1 rounded-full bg-[#EF264C] animate-typing-dot-2 shrink-0" />
                    <span className="w-1 h-1 rounded-full bg-[#EF264C] animate-typing-dot-3 shrink-0" />
                  </div>
                </div>
              )}
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
