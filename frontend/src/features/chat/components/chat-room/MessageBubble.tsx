import type { MessageBubbleProps } from '../../types'

export type { MessageBubbleProps }

export function MessageBubble({ 
  message, 
  isMe = false, 
  isLast = false, 
  marginTop = 'mt-4' 
}: MessageBubbleProps) {
  // 1. จัดการ VO (Voice Over / คำบรรยายบรรยากาศและฉาก สไตล์มังงะ / X Card - space บนล่างโปร่งสบายตา my-14)
  if (message.type === 'vo') {
    return (
      <div className="w-full flex justify-center my-14 px-3">
        <div className="w-full max-w-[420px] bg-[#121212]/85 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-6 shadow-2xl transition-all select-text hover:border-white/20">
          <p className="text-[15px] leading-relaxed text-app-secondary font-light tracking-wide whitespace-pre-line text-left">
            {message.text}
          </p>
        </div>
      </div>
    )
  }

  // 2. Chat Bubbles & Actions (Golden Ratio Rhythm: จังหวะเว้นวรรคสมดุลแบบ Modern Luxury)
  const isAction = message.type === 'action'

  return (
    <div className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'} ${marginTop}`}>
      {isAction ? (
        // Action: โครงสร้างความสูงเท่า Bubble + ขีดเว้นระยะบนล่างให้ไม่อึดอัด + ไล่สี Gradient
        <div className="max-w-[70%] flex items-stretch gap-3 pl-1 group">
          {/* ขีดเส้นหนา 2px มน พร้อม my-0.5 เว้นระยะหัว-ท้ายเบาๆ และไล่เฉดสีนุ่มนวล */}
          <div className="w-[2px] self-stretch my-0.5 rounded-full bg-gradient-to-b from-white/45 via-app-secondary to-white/10 flex-shrink-0 transition-all duration-200 group-hover:from-white/70 group-hover:via-app-secondary" />
          
          {/* ข้อความ Action: ฟอนต์ 15 เท่า Bubble + py-1.5 leading-normal ให้ความสูงและ space เท่ากับ Bubble เป๊ะ */}
          <div className="py-1.5 text-[15px] leading-normal text-app-secondary font-light select-text">
            {message.text}
          </div>
        </div>
      ) : (
        // Normal Chat Bubble: ปรับความสูงให้เพรียวกระชับขึ้น py-1.5 leading-normal โดยขนาดฟอนต์ 15px เท่าเดิม
        <div className={`
          max-w-[70%] px-[15px] py-1.5 text-[15px] leading-normal
          ${isMe 
            ? 'bg-gradient-to-br from-[#D22147] via-[#B8163A] to-[#8E0D29] text-app-primary rounded-[18px] rounded-br-none border border-white/10 shadow-sm' 
            : 'bg-app-surface text-[rgb(230,233,234)] rounded-[18px] rounded-bl-none'}
        `}>
          {message.text}
        </div>
      )}

      {isMe && isLast && (
        <span className="text-[11px] text-app-secondary mt-1 mr-1 select-none font-normal">
          อ่านแล้ว
        </span>
      )}
    </div>
  )
}

export default MessageBubble
