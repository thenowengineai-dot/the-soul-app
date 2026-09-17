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
  variant?: 'bubble' | 'with-text' | 'action';
  /** คลาส CSS เพิ่มเติมสำหรับ wrapper */
  className?: string;
}

/**
 * 💬 Reusable Typing Indicator Component (Apple iMessage & Twitter X Style)
 * ดีไซน์เดียวกับบับเบิ้ลข้อความฝั่ง AI เป๊ะๆ 1:1 ทั้งความสูง (34.5px/35px), สีพื้นหลัง (#1D1D1F),
 * มุมโค้ง (rounded-[18px] rounded-bl-none), และ Padding (px-[15px] py-1.5)
 * ไร้ข้อความอธิบายด้านล่างตามหลักมินิมอล เพื่อความคลีน สวยงาม และเป็นธรรมชาติ
 * 🌟 รองรับ variant='action' สำหรับแสดง Action Presence (✦ กำลังเคลื่อนไหว...)
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
      aria-label={variant === 'action' ? `${name || 'AI'} กำลังเคลื่อนไหว...` : `${name || 'AI'} is typing...`}
    >
      {/* 1. Avatar จิ๋ว (แสดงเฉพาะเมื่อเปิด showAvatar เป็น true) */}
      {showAvatar && avatarUrl && (
        <img
          src={avatarUrl}
          alt={name || 'Avatar'}
          className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/10 shadow-sm"
        />
      )}

      {/* 2. บับเบิ้ลแสดงสถานะ: แยกประเภทระหว่าง Action Presence (✦ กำลังเคลื่อนไหว...) กับ Typing (3 จุด) */}
      {variant === 'action' ? (
        // 🌟 Action Presence Indicator (The Starlight Pulse: ✦ กำลังเคลื่อนไหว...)
        <div className="inline-flex items-center gap-2 px-[14px] py-1.5 min-h-[34.5px] h-[34.5px] bg-app-surface border border-white/10 rounded-[18px] rounded-bl-none shadow-sm animate-in fade-in zoom-in-95 duration-200">
          {/* ดาวประกาย 4 แฉก (Four-point Starlight Sparkle) กะพริบจังหวะลมหายใจ */}
          <svg 
            viewBox="0 0 24 24" 
            className="w-3 h-3 text-white/90 animate-pulse shrink-0" 
            fill="currentColor"
          >
            <path d="M12 0 Q12 12 0 12 Q12 12 12 24 Q12 12 24 12 Q12 12 12 0 Z" />
          </svg>
          <span className="text-[12.5px] text-app-secondary font-normal tracking-wide">
            กำลังเคลื่อนไหว...
          </span>
        </div>
      ) : (
        // บับเบิ้ล 3 จุด สไตล์ Apple iMessage & X Lights Out (สเปกเดียวกับ AI MessageBubble 1:1 เป๊ะๆ)
        <div className="inline-flex items-center justify-center px-[15px] py-1.5 min-h-[34.5px] h-[34.5px] bg-app-surface rounded-[18px] rounded-bl-none shadow-sm">
          <div className="inline-flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full animate-typing-dot-1 shrink-0"
              style={{ backgroundColor: dotColor || '#BEBEC4' }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full animate-typing-dot-2 shrink-0"
              style={{ backgroundColor: dotColor || '#BEBEC4' }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full animate-typing-dot-3 shrink-0"
              style={{ backgroundColor: dotColor || '#BEBEC4' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingIndicator;
