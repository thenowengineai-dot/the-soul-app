import type { MessageBubbleProps } from '../../types'

export type { MessageBubbleProps }

export function MessageBubble({ 
  message, 
  isMe = false, 
  isLast: _isLast = false, 
  isLastInGroup = false,
  isRead = false,
  marginTop = 'mt-4' 
}: MessageBubbleProps) {
  // 1. จัดการ VO (Voice Over / คำบรรยายบรรยากาศและฉาก สไตล์มังงะ / X Card - space บนล่างโปร่งสบายตา my-14)
  if (message.type === 'vo') {
    return (
      <div className="w-full flex justify-center my-14 px-3">
        <div className="w-full max-w-[420px] bg-[#0D0D0D] border border-white/10 rounded-2xl px-6 py-6 shadow-2xl transition-all select-text hover:border-white/20">
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
        // Action: The Guiding Star Trail (ดาวประกาย 4 แฉกยอดบน + หางเส้นแสงดิ่งยาวตามบรรทัด)
        <div className="max-w-[70%] py-1.5 flex items-stretch gap-2.5 pl-1 group">
          {/* แกนประกายดาว: ดาว 4 แฉกคมกริบ + เส้นแสงไล่เฉดสีทอดยาวตามความสูงตัวหนังสือจริง */}
          <div className="flex flex-col items-center flex-shrink-0 my-1 self-stretch w-2.5">
            {/* ดาวประกาย 4 แฉกยอดบนสุด (Four-point Starlight Sparkle) - ขนาดเพรียวบาง 9px */}
            <svg 
              viewBox="0 0 24 24" 
              className="w-[9px] h-[9px] text-white/85 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:text-white" 
              fill="currentColor"
            >
              <path d="M12 0 Q12 12 0 12 Q12 12 12 24 Q12 12 24 12 Q12 12 12 0 Z" />
            </svg>
            
            {/* เส้นแสงดาวตกทอดยาวลงมาตามบรรทัด (Starlight Trail) - บางเฉียบคมกริบ 1px + เว้น space สบายตา mt-1.5 (6px) */}
            <div className="w-[1px] flex-1 min-h-[3px] mt-1.5 rounded-full bg-gradient-to-b from-white/60 via-app-secondary/50 to-transparent transition-all duration-200 group-hover:from-white/80 group-hover:via-app-secondary/70" />
          </div>
          
          {/* ข้อความ Action: ฟอนต์ 15 leading-normal สีเทารอง #BEBEC4 select-text */}
          <div className="text-[15px] leading-normal text-app-secondary font-normal select-text">
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

      {isMe && (isLastInGroup || isRead) && (
        <span 
          className={`text-[11px] mt-1 mr-1 select-none font-normal transition-all duration-300 animate-in fade-in ${
            isRead ? 'text-app-secondary' : 'text-app-secondary/60'
          }`}
        >
          {isRead ? 'อ่านแล้ว' : 'ส่งแล้ว'}
        </span>
      )}
    </div>
  )
}

export default MessageBubble
