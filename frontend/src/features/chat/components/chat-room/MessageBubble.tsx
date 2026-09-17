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

  // 1. จัดการ VO (Voice Over): สไตล์ Frameless Ambient Horizon ไร้กล่องทึบ ลอยโปร่งกลางเส้นคั่นไล่เฉดสี
  if (message.type === 'vo') {
    return (
      <div className={`w-full flex justify-center px-4 select-text ${marginTop}`}>
        <div className="w-full max-w-[620px] flex flex-col items-center py-2">
          {/* เส้นคั่นบางเฉียบด้านบนแบบไล่เฉดจางหายหัว-ท้าย */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent mb-3.5" />
          
          {/* ข้อความบรรยายฉาก ฟอนต์ 13.5px สีเทาสว่าง อ่านสบายตา 3 บรรทัด */}
          <p className="text-[13.5px] sm:text-[14px] leading-relaxed text-[#9CA3AF] font-light text-center px-4 tracking-wide select-text">
            {message.text}
          </p>

          {/* เส้นคั่นบางเฉียบด้านล่างแบบไล่เฉดจางหายหัว-ท้าย */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent mt-3.5" />
        </div>
      </div>
    )
  }

  // 2. Chat Bubbles & Actions (สไตล์ X Lights Out + Literary Roleplay)
  const isAction = message.type === 'action'

  return (
    <div className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'} ${marginTop}`}>
      {/* 🏷️ จุดยึดสายตาหัวแถว (Visual Anchor):
          - ฝั่งผู้เล่น: ป้าย "ฉัน" สีเทาบางๆ
          - ฝั่งตัวละคร: Avatar วงกลม (32px) + ชื่อตัวละคร */}
      {isMe && isFirstInGroup && (
        <span className="text-[12px] font-medium text-app-secondary/80 mr-2 mb-1.5 select-none tracking-wide">
          ฉัน
        </span>
      )}

      {!isMe && isFirstInGroup && (
        <div className="flex items-center gap-2.5 mb-2 ml-0.5 select-none">
          {chatAvatar ? (
            <img
              src={chatAvatar}
              alt={chatName || 'Character'}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-white/10 shadow-sm"
            />
          ) : (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[12px] text-white/80 font-medium">
              {(chatName || 'C')[0]}
            </div>
          )}
          <span className="text-[13.5px] font-medium text-[#F2F2F5] tracking-wide">
            {chatName || 'Character'}
          </span>
        </div>
      )}

      {/* 💬 แถวคอนเทนต์ (Action หรือ Dialogue)
          สำหรับฝั่งตัวละคร: เยื้องเข้ามา pl-[38px] sm:pl-[42px] ให้ตรงกับแนวใต้ชื่อเสมอ */}
      <div className={`w-full flex ${isMe ? 'justify-end' : 'justify-start pl-[38px] sm:pl-[42px]'}`}>
        {isAction ? (
          // 🌟 Action (ภาษากาย / ท่าทาง):
          // เส้นขีด | สีขาวบางเฉียบ + ตัวเอียงสีเทา #9E9EA0 + ระยะห่างสบายตา my-1.5
          <div className="flex items-start gap-2.5 py-0.5 select-text my-1.5 max-w-[90%] sm:max-w-[80%]">
            <div className="w-[2px] self-stretch min-h-[16px] rounded-full bg-white/30 shrink-0 my-0.5" />
            <p className="text-[13.5px] sm:text-[14px] leading-relaxed text-[#9E9EA0] italic font-normal">
              {message.text}
            </p>
          </div>
        ) : (
          // 💬 Dialogue (บับเบิ้ลคำพูด):
          // ทรงแคปซูลมนสมดุล rounded-2xl + Padding อิ่มตัว px-4.5 py-3 + ขอบคม 1px
          <div className={`
            px-4.5 py-2.5 sm:px-5 sm:py-3 text-[15px] leading-relaxed select-text max-w-[85%] sm:max-w-[75%] rounded-2xl shadow-sm
            ${isMe 
              ? 'bg-gradient-to-br from-[#D22147] via-[#B8163A] to-[#8E0D29] text-app-primary border border-white/10' 
              : 'bg-[#1C1C1E] text-[#EDEDED] border border-white/[0.08]'}
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
