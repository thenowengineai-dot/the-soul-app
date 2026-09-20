import React from 'react';

export interface TypingIndicatorProps {
  /** สีของจุด (default: #BEBEC4 หรือกำหนดเป็นสีเฉพาะของตัวละคร / แบรนด์ เช่น #EF264C) */
  dotColor?: string;
  /** รูป Avatar ขนาดจิ๋วสไตล์ Twitter DM (ถ้าต้องการแสดงเคียงข้างบับเบิ้ล) */
  avatarUrl?: string;
  /** แสดง Avatar หรือไม่ (default: false เพื่อให้ตำแหน่งและความสูงตรงกับบับเบิ้ล AI เป๊ะๆ) */
  showAvatar?: boolean;
  /** ชื่อผู้พิมพ์ (สำหรับ aria-label) */
  name?: string;
  /** ข้อความอธิบายสถานะเพิ่มเติม (deprecated: เพื่อความคลีน ไม่แสดงผลใต้บับเบิ้ล) */
  subtext?: string;
  /** รูปแบบการแสดงผล */
  variant?: 'bubble' | 'with-text' | 'action' | 'hybrid';
  /** คลาส CSS เพิ่มเติมสำหรับ wrapper */
  className?: string;
}

/**
 * 💬 Reusable Typing Indicator Component (Apple iMessage & Twitter X Style)
 * ดีไซน์เดียวกับบับเบิ้ลข้อความฝั่ง AI เป๊ะๆ 1:1 ทั้งความสูง (34.5px/35px), สีพื้นหลัง (#1D1D1F),
 * มุมโค้ง (rounded-[18px] rounded-bl-none), และ Padding (px-[15px] py-1.5)
 * ไร้ข้อความอธิบายด้านล่างตามหลักมินิมอล เพื่อความคลีน สวยงาม และเป็นธรรมชาติ
 * 🌟 รองรับ variant='hybrid' สำหรับ Hybrid Living Presence (✦ • • •) สัญลักษณ์สากลแห่งการมีชีวิต
 * 🌟 รองรับ variant='action' สำหรับ Action Presence (✦ กำลังเคลื่อนไหว...)
 */
export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  dotColor,
  avatarUrl,
  showAvatar = false,
  name,
  variant = 'bubble',
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 select-none animate-in fade-in duration-200 ${className}`}
      role="status"
      aria-label={
        variant === 'action'
          ? `${name || 'AI'} กำลังเคลื่อนไหว...`
          : variant === 'hybrid'
          ? `${name || 'AI'} กำลังตอบสนอง...`
          : `${name || 'AI'} is typing...`
      }
    >
      {/* 1. Avatar จิ๋ว (แสดงเฉพาะเมื่อเปิด showAvatar เป็น true) */}
      {showAvatar && avatarUrl && (
        <img
          src={avatarUrl}
          alt={name || 'Avatar'}
          className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/10 shadow-sm"
        />
      )}

      {/* 2. บับเบิ้ลแสดงสถานะ: ดีไซน์ 1:1 กับ MessageBubble ของบ็อต (#2f2f35, min-h-[38px], Speech Tail) */}
      {variant === 'action' ? (
        // 🌟 Action Presence Indicator: บับเบิ้ลสไตล์เดียวกับ Dialogue ของบ็อต 1:1 เป๊ะๆ
        // พื้นหลัง #2f2f35, ความสูง min-h-[38px] px-4 py-2, ขอบมน rounded-[18px] rounded-bl-[4px] พร้อม Apple Speech Tail
        <div className="relative inline-block select-none animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-2 min-h-[38px] bg-[#2f2f35] text-white rounded-[18px] rounded-bl-[4px] flex items-center gap-2 text-[14px] leading-[22px] font-normal shadow-sm">
            {/* สัญลักษณ์ประกายดาว ✦ ลอยเบาๆ กะพริบจังหวะนุ่มนวล */}
            <span className="text-[11px] text-white/70 animate-pulse shrink-0 select-none">✦</span>
            
            {/* ข้อความ Apple Intelligence Shimmer (คลื่นแสงสีขาวไหลผ่านตัวหนังสืออย่างสง่างาม) */}
            <span className="bg-gradient-to-r from-white/45 via-white to-white/45 bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer-fast font-normal tracking-wide select-none">
              กำลังเคลื่อนไหว...
            </span>
          </div>

          {/* 📍 Apple Speech Tail (หัวแหลมคำพูด) แนบมุมล่างซ้าย 1:1 กับ MessageBubble */}
          <svg 
            className="absolute bottom-0 -left-[6px] w-[10px] h-[15px] pointer-events-none" 
            viewBox="0 0 10 15"
            fill="#2f2f35"
          >
            <path d="M10,0 C10,5 7,11 0,15 L10,15 Z" />
          </svg>
        </div>
      ) : variant === 'hybrid' ? (
        // 🌟 Hybrid Living Presence Indicator (ดาว + 3 จุด ในบับเบิ้ลบ็อต #2f2f35 พร้อมหาง)
        <div className="relative inline-block select-none animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-2 min-h-[38px] bg-[#2f2f35] text-white rounded-[18px] rounded-bl-[4px] flex items-center gap-2.5 shadow-sm">
            <span className="text-[11px] text-white/70 animate-pulse shrink-0 select-none">✦</span>
            <div className="inline-flex items-center gap-1.5 h-[22px]">
              <span className="w-1.5 h-1.5 rounded-full animate-typing-dot-1 shrink-0 bg-white/75" />
              <span className="w-1.5 h-1.5 rounded-full animate-typing-dot-2 shrink-0 bg-white/75" />
              <span className="w-1.5 h-1.5 rounded-full animate-typing-dot-3 shrink-0 bg-white/75" />
            </div>
          </div>
          {/* Apple Speech Tail */}
          <svg 
            className="absolute bottom-0 -left-[6px] w-[10px] h-[15px] pointer-events-none" 
            viewBox="0 0 10 15"
            fill="#2f2f35"
          >
            <path d="M10,0 C10,5 7,11 0,15 L10,15 Z" />
          </svg>
        </div>
      ) : (
        // 💬 Dialogue Typing Indicator (จุด 3 จุด ในบับเบิ้ลบ็อต #2f2f35 พร้อมหางคำพูด 1:1)
        <div className="relative inline-block select-none animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-2 min-h-[38px] bg-[#2f2f35] rounded-[18px] rounded-bl-[4px] flex items-center justify-center shadow-sm">
            <div className="inline-flex items-center gap-1.5 h-[22px]">
              <span
                className="w-1.5 h-1.5 rounded-full animate-typing-dot-1 shrink-0 bg-white/75"
                style={dotColor ? { backgroundColor: dotColor } : undefined}
              />
              <span
                className="w-1.5 h-1.5 rounded-full animate-typing-dot-2 shrink-0 bg-white/75"
                style={dotColor ? { backgroundColor: dotColor } : undefined}
              />
              <span
                className="w-1.5 h-1.5 rounded-full animate-typing-dot-3 shrink-0 bg-white/75"
                style={dotColor ? { backgroundColor: dotColor } : undefined}
              />
            </div>
          </div>
          {/* Apple Speech Tail */}
          <svg 
            className="absolute bottom-0 -left-[6px] w-[10px] h-[15px] pointer-events-none" 
            viewBox="0 0 10 15"
            fill="#2f2f35"
          >
            <path d="M10,0 C10,5 7,11 0,15 L10,15 Z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default TypingIndicator;
