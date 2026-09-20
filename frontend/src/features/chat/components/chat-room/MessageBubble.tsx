import { useState, useEffect } from 'react'
import type { MessageBubbleProps } from '../../types'

export type { MessageBubbleProps }

export function MessageBubble({ 
  message, 
  isMe = false, 
  isLast: _isLast = false, 
  isFirstInGroup: _isFirstInGroup = false,
  isLastInGroup = false,
  isRead = false,
  marginTop = 'mt-4',
  chatAvatar: _chatAvatar,
  chatName: _chatName,
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

  // 1. จัดการ Date Divider (Apple Musical Rest): แถบวันที่คั่นจังหวะพักสายตากึ่งกลางจอ
  if (message.type === 'date') {
    return (
      <div className="w-full flex items-center justify-center my-6 sm:my-8 select-none">
        <span className="text-[11px] font-medium text-white/40 tracking-widest uppercase px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] shadow-sm">
          {message.text}
        </span>
      </div>
    )
  }

  // 2. จัดการ VO (Voice Over): Cinematic Prologue (บทบรรยายฉากทรงพลังสไตล์ Harry Potter)
  // ตัวตรง 15-16px น้ำหนัก 400 สีเงินแสงจันทร์ #D6D6DC ขนาบด้วยเส้นขอบฟ้าและ Space กว้างขวาง
  if (message.type === 'vo') {
    return (
      <div className="w-full flex flex-col items-center justify-center px-6 select-text my-12 sm:my-16 animate-in fade-in duration-300">
        {/* เส้นขอบฟ้าเหนือบทบรรยาย (Horizon Line - Hairline Gradient Fade) */}
        <div className="w-full max-w-[280px] sm:max-w-[420px] h-[1px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent mb-5 sm:mb-6 select-none" />

        {/* ข้อความบทบรรยายฉาก (Cinematic Monochromatic Typography: ตัวตรง ไม่เอียง คมชัดทรงพลัง) */}
        <p className="max-w-[580px] text-[15px] sm:text-[16px] leading-[1.85] text-[#D6D6DC] font-normal text-center tracking-wide select-text">
          {message.text}
        </p>

        {/* เส้นขอบฟ้าใต้บทบรรยาย (Horizon Line - Hairline Gradient Fade) */}
        <div className="w-full max-w-[280px] sm:max-w-[420px] h-[1px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent mt-5 sm:mt-6 select-none" />
      </div>
    )
  }

  // 3. Chat Bubbles & Actions (สไตล์ Apple iMessage: ไร้รูปหน้า/ชื่อ + Perfect Pill + หางคำพูดที่ข้อความสุดท้าย)
  const isAction = message.type === 'action'

  return (
    <div className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'} ${marginTop}`}>
      {/* 💬 แถวคอนเทนต์ (Action หรือ Dialogue) - ปลด Avatar วงกลมและชื่อออก ให้บับเบิ้ลแนบขอบจออย่างสะอาดตาสไตล์ iMessage */}
      <div className={`w-full flex ${isMe ? 'justify-end' : 'justify-start'}`}>
        {isAction ? (
          // 🌟 Action (บทกวีกำกับฉาก / Whispered Stage Direction สไตล์ Apple):
          // ไร้กล่องทึบ แนบขอบซ้ายอย่างสง่างาม ใช้จุดประกายสีเงินมินิมอล ✦ คุมโทนขาวดำ ไม่ใช้สีทอง
          <div className={`flex items-start gap-2 py-0.5 select-text max-w-[92%] sm:max-w-[85%] ${isMe ? 'justify-end' : 'justify-start px-1'}`}>
            <span className="text-[10px] text-white/35 shrink-0 select-none mt-1">✦</span>
            <p className="text-[13.5px] sm:text-[14px] leading-relaxed text-[#A1A1A8] italic font-normal tracking-wide">
              {message.text}
            </p>
          </div>
        ) : (
          // 💬 Dialogue (Apple iMessage Perfect Pill & Speech Tail):
          // - ความสูงมาตรฐาน 1 บรรทัด: 38px (py-2 + leading-[22px]) สระไทยบน-ล่างไม่ถูกตัด
          // - บับเบิ้ลในกลุ่มซ้อน (Stack): Perfect Pill มนกลม ไม่มีหาง
          // - บับเบิ้ลสุดท้าย (isLastInGroup): มีหัวแหลม/หางคำพูด (Speech Tail) เชื่อมโยงหาผู้ส่ง
          <div className="relative inline-block max-w-[85%] sm:max-w-[75%]">
            <div className={`
              px-4 py-2 text-[15px] leading-[22px] select-text transition-all min-h-[38px] flex items-center font-normal
              ${isMe 
                ? `bg-gradient-to-br from-[#ff0030] to-[#ea0063] text-[#F2F2F5] ${
                    isLastInGroup 
                      ? 'rounded-[18px] rounded-br-[4px]' 
                      : 'rounded-[18px]'
                  }` 
                : `bg-[#2f2f35] text-[#E5E5EA] ${
                    isLastInGroup 
                      ? 'rounded-[18px] rounded-bl-[4px]' 
                      : 'rounded-[18px]'
                  }`
              }
            `}>
              {message.text}
            </div>

            {/* 📍 Apple Speech Tail (หัวแหลมคำพูด): แสดงเฉพาะข้อความสุดท้ายของแต่ละกลุ่ม (isLastInGroup) เท่านั้น */}
            {isLastInGroup && isMe && (
              <svg 
                className="absolute bottom-0 -right-[6px] w-[10px] h-[15px] pointer-events-none" 
                viewBox="0 0 10 15"
                fill="#ea0063"
              >
                <path d="M0,0 C0,5 3,11 10,15 L0,15 Z" />
              </svg>
            )}

            {isLastInGroup && !isMe && (
              <svg 
                className="absolute bottom-0 -left-[6px] w-[10px] h-[15px] pointer-events-none" 
                viewBox="0 0 10 15"
                fill="#2f2f35"
              >
                <path d="M10,0 C10,5 7,11 0,15 L10,15 Z" />
              </svg>
            )}
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
