import { useState, useEffect } from 'react'
import type { MessageBubbleProps } from '../../types'

export type { MessageBubbleProps }

export function MessageBubble({ 
  message, 
  isMe = false, 
  isLast: _isLast = false, 
  isFirstInGroup = false,
  isLastInGroup = false,
  isRead = false,
  marginTop = 'mt-4',
  chatAvatar,
  chatName,
}: MessageBubbleProps) {
  // 🌟 Tactile Feedback สไตล์ X: หน่วงเวลาก่อนขึ้น "ส่งแล้ว" เล็กน้อย (~380ms) เพื่อจำลอง Network Flight
  // หากเป็นข้อความเดิมที่อ่านแล้ว (isRead = true) ให้แสดงผลทันทีโดยไม่ต้องหน่วง
  const [isDelivered, setIsDelivered] = useState(isRead)

  useEffect(() => {
    if (isRead) {
      setIsDelivered(true)
      return
    }
    const timer = setTimeout(() => {
      setIsDelivered(true)
    }, 380)
    return () => clearTimeout(timer)
  }, [isRead])

  // 1. จัดการ VO (Voice Over / คำบรรยายบรรยากาศและฉาก - สไตล์ Cinematic Horizon กว้าง 660px อ่านง่าย 3-4 บรรทัด ไม่เป็นแท่งทึบ)
  if (message.type === 'vo') {
    return (
      <div className={`w-full flex justify-center px-2 select-text ${marginTop}`}>
        <div className="w-full max-w-[660px] relative px-5 sm:px-7 py-4 sm:py-5 rounded-2xl bg-[#131315]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl transition-all hover:border-white/15">
          {/* Subtle Scene Header Badge */}
          <div className="flex items-center justify-center gap-2.5 mb-2.5">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/20" />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C] animate-pulse shrink-0" />
              <span className="text-[11px] font-medium tracking-wider text-app-secondary uppercase">
                บรรยากาศของฉาก
              </span>
            </div>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/20" />
          </div>

          {/* VO Content */}
          <p className="text-[13.5px] sm:text-[14px] leading-relaxed text-[#A6A6B0] font-light tracking-wide text-center select-text">
            {message.text}
          </p>
        </div>
      </div>
    )
  }

  // 2. Chat Bubbles & Actions (สไตล์ Luxury Messenger: มี Avatar และแนวคอลัมน์ตรงกันเป๊ะ)
  const isAction = message.type === 'action'

  return (
    <div className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'} ${marginTop}`}>
      {/* 🏷️ ชื่อตัวละคร: แสดงบางๆ นุ่มนวลเฉพาะข้อความแรกสุดของเทิร์นบ็อต */}
      {!isMe && isFirstInGroup && chatName && (
        <span className="text-[12px] text-app-secondary/70 font-medium ml-9 sm:ml-10 mb-1 select-none tracking-wide">
          {chatName}
        </span>
      )}

      {/* 💬 แถวหลัก (Message Row) */}
      <div className={`flex items-end gap-2 sm:gap-2.5 max-w-[85%] sm:max-w-[78%] ${isMe ? 'justify-end ml-auto' : 'justify-start'}`}>
        {/* 👤 Avatar ฝั่งตัวละคร (แสดงที่บับเบิ้ลสุดท้ายของกลุ่ม หรือเป็น Spacer เพื่อให้แนวข้อความตรงกันเสมอ) */}
        {!isMe && (
          <div className="w-7 sm:w-8 h-7 sm:h-8 shrink-0 flex items-center justify-center mb-0.5">
            {isLastInGroup && chatAvatar ? (
              <img
                src={chatAvatar}
                alt={chatName || 'Character'}
                className="w-7 sm:w-8 h-7 sm:h-8 rounded-full object-cover border border-white/10 shadow-sm select-none"
              />
            ) : isLastInGroup ? (
              <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[12px] text-white/80 font-medium">
                {(chatName || 'C')[0]}
              </div>
            ) : null}
          </div>
        )}

        {/* 🎭 ข้อความ Action หรือ บทพูด Dialogue */}
        {isAction ? (
          // 🌟 Action (ภาษากาย / ท่าทาง): สไตล์ Editorial Novel Roleplay
          // ขนาด 13.5px สีเทาควันบุหรี่ (#9E9EA8) + ดาว ✦ นำหน้า + ไร้เส้นขีดดิ่งกั้นสายตา
          <div className="py-1 px-1 flex items-start gap-2 select-text my-0.5">
            <span className="text-[10px] text-white/60 select-none mt-[4px] shrink-0">
              ✦
            </span>
            <p className="text-[13.5px] sm:text-[14px] leading-relaxed text-[#9E9EA8] italic font-normal">
              {message.text}
            </p>
          </div>
        ) : (
          // 💬 Normal Chat Bubble:
          <div className={`
            px-4 py-2 text-[15px] leading-relaxed select-text
            ${isMe 
              ? 'bg-gradient-to-br from-[#D22147] via-[#B8163A] to-[#8E0D29] text-app-primary rounded-[18px] rounded-br-none border border-white/10 shadow-sm' 
              : 'bg-[#1C1C1E] text-[#EDEDED] rounded-[18px] rounded-bl-[4px] border border-white/[0.07] shadow-sm'}
          `}>
            {message.text}
          </div>
        )}
      </div>

      {/* ⏱️ สถานะ "ส่งแล้ว" / "อ่านแล้ว" ของผู้เล่น */}
      {isMe && (isLastInGroup || isRead) && (
        <span 
          className={`text-[11px] mt-1 mr-1 select-none font-normal transition-all duration-300 ${
            isDelivered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-0.5 pointer-events-none'
          } ${isRead ? 'text-app-secondary' : 'text-app-secondary/60'}`}
        >
          {isRead ? 'อ่านแล้ว' : 'ส่งแล้ว'}
        </span>
      )}
    </div>
  )
}

export default MessageBubble
