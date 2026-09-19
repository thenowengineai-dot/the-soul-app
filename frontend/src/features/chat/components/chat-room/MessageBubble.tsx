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

  // 2. จัดการ VO (Voice Over): เส้นขอบฟ้าแห่งการพักสายตา (Zenith Horizon of Rest)
  // ลอยโปร่งกลางจอ เว้นระยะ space หายใจ my-8 sm:my-10 ตัวหนังสือเอียงบางเบา อ่านสบายตาดั่งพักบทสนทนา
  if (message.type === 'vo') {
    return (
      <div className={`w-full flex justify-center px-4 select-text my-8 sm:my-10`}>
        <div className="w-full max-w-[580px] flex flex-col items-center py-2.5">
          {/* เส้นคั่นบางเฉียบด้านบนแบบไล่เฉดจางหายหัว-ท้าย */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
          
          {/* ข้อความบรรยายฉาก ฟอนต์ 13.5px สีเงินนุ่มนวล อ่านสบายตา เว้นวรรคมีจังหวะ */}
          <p className="text-[13.5px] sm:text-[14px] leading-relaxed text-[#9CA3AF] font-light text-center px-6 tracking-wide select-text italic">
            {message.text}
          </p>

          {/* เส้นคั่นบางเฉียบด้านล่างแบบไล่เฉดจางหายหัว-ท้าย */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mt-4" />
        </div>
      </div>
    )
  }

  // 3. Chat Bubbles & Actions (สไตล์ Apple Tactile Pill + ไร้เส้นขอบ + สรีระมือ)
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
          // 🌟 Action (บทกวีกำกับฉาก / Whispered Stage Direction สไตล์ Apple):
          // ไร้กล่องทึบ ปล่อยให้ Whitespace ทำหน้าที่สร้างความสงบนิ่ง มีดาวประกาย ✦ สีทองอำพันจิ๋ว
          <div className="flex items-start gap-2.5 py-1 select-text my-2.5 max-w-[92%] sm:max-w-[88%]">
            <span className="text-[11px] text-amber-400/80 shrink-0 select-none mt-1">✦</span>
            <p className="text-[13.5px] sm:text-[14px] leading-relaxed text-[#A1A1A8] italic font-normal tracking-wide">
              {message.text}
            </p>
          </div>
        ) : (
          // 💬 Dialogue (บับเบิ้ลหมอน Squircle ไร้เส้นขอบกระด้าง - Pure Seamless Liquid Cushion):
          // ฝั่งผู้เล่น: สีแดงฉ่ำสด Juicy Ruby Velvet ไร้เส้นขอบ + ขอบมน Asymmetric Pill (ชี้หาผู้ส่ง) + เงาลอยตัวนุ่มลึก
          // ฝั่งตัวละคร: กระจกฝ้าโปร่งแสง ไร้เส้นขอบ + ขอบมน Asymmetric Pill (ชี้หาตัวละคร) + Inset แสงขอบบนบางเบา
          <div className={`
            px-5 py-3 text-[15px] leading-relaxed select-text max-w-[85%] sm:max-w-[78%] transition-all
            ${isMe 
              ? 'rounded-[22px] rounded-br-[6px] bg-gradient-to-br from-[#EA1D52] via-[#D11142] to-[#9C0C30] text-[#FFEBF0] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_16px_rgba(209,17,66,0.28)]' 
              : 'rounded-[22px] rounded-bl-[6px] bg-gradient-to-b from-white/[0.07] via-white/[0.04] to-white/[0.02] backdrop-blur-xl text-[#F2F2F5] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_18px_rgba(0,0,0,0.35)]'}
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
