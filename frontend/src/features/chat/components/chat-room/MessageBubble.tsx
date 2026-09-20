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

  // 2. จัดการ VO (Voice Over): แนวทาง A [Zen Horizon - เส้นขอบฟ้าเดี่ยว]
  // ลอยโปร่งกลางจอ เว้นระยะ space หายใจ my-8 sm:my-10 เส้นขอบฟ้าเดี่ยว 1px ด้านบน จางหายหัว-ท้าย ไร้เส้นล่างประกบเป็นแบนเนอร์
  if (message.type === 'vo') {
    return (
      <div className="w-full flex justify-center px-4 select-text my-8 sm:my-10">
        <div className="w-full max-w-[590px] flex flex-col items-center">
          {/* เส้นขอบฟ้าเดี่ยว (Zen Horizon Hairline) บางเฉียบ 1px ไล่เฉดจางหายหัว-ท้าย */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4 sm:mb-5" />
          
          {/* ข้อความบรรยายฉาก ฟอนต์ 13px-13.5px สีเงินนุ่มนวล พร้อม leading-[1.7] สำหรับวรรณยุกต์ไทย */}
          <p className="text-[13px] sm:text-[13.5px] leading-[1.7] text-[#9CA3AF] font-light text-center px-6 tracking-wide select-text italic">
            {message.text}
          </p>
        </div>
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
          // ไร้กล่องทึบ แนบขอบซ้ายอย่างสง่างาม มีดาวประกาย ✦ สีทองอำพันจิ๋ว เว้นช่องว่างควบคุมด้วย mt-2 (8px)
          <div className={`flex items-start gap-2 py-0.5 select-text max-w-[92%] sm:max-w-[85%] ${isMe ? 'justify-end' : 'justify-start px-1'}`}>
            <span className="text-[11px] text-amber-400/80 shrink-0 select-none mt-1">✦</span>
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
              px-4 py-2 text-[15px] leading-[22px] select-text transition-all min-h-[38px] flex items-center
              ${isMe 
                ? `bg-gradient-to-br from-[#EA1D52] via-[#D11142] to-[#9C0C30] text-[#FFEBF0] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_3px_12px_rgba(209,17,66,0.25)] ${
                    isLastInGroup 
                      ? 'rounded-[18px] rounded-br-[4px]' 
                      : 'rounded-[18px]'
                  }` 
                : `bg-[#26262A] text-[#F2F2F5] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.3)] ${
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
                fill="#9C0C30"
              >
                <path d="M0,0 C0,5 3,11 10,15 L0,15 Z" />
              </svg>
            )}

            {isLastInGroup && !isMe && (
              <svg 
                className="absolute bottom-0 -left-[6px] w-[10px] h-[15px] pointer-events-none" 
                viewBox="0 0 10 15"
                fill="#26262A"
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
