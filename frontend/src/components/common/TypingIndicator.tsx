import React from 'react';

export interface TypingIndicatorProps {
  /** รูป Avatar ขนาดจิ๋วสไตล์ Twitter DM (ถ้ามี) */
  avatarUrl?: string;
  /** ชื่อผู้พิมพ์ เช่น "The Muse", "Kira" */
  name?: string;
  /** ข้อความอธิบายสถานะเพิ่มเติม เช่น "กำลังคิดและถักทอโครงสร้าง..." หรือ "กำลังตอบกลับ..." */
  subtext?: string;
  /** สีของจุด (default: #ACACB2 หรือกำหนดเป็นสีเฉพาะของตัวละคร / แบรนด์ #EF264C) */
  dotColor?: string;
  /** รูปแบบ: 'bubble' (บับเบิ้ล 3 จุดสไตล์ iMessage) หรือ 'with-text' (มีข้อความกำกับใต้บับเบิ้ล) */
  variant?: 'bubble' | 'with-text';
  /** คลาส CSS เพิ่มเติม */
  className?: string;
}

/**
 * 💬 Reusable Typing Indicator Component (Apple iMessage & Twitter X Style)
 * ใช้แสดงสถานะกำลังพิมพ์/กำลังประมวลผล ทั้งในห้องแชทหลัก (ChatRoom) และสตูดิโอ The Muse (TheMuseChat)
 */
export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  avatarUrl,
  name,
  subtext,
  dotColor,
  variant = 'bubble',
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-end gap-2.5 py-1 select-none animate-in fade-in duration-200 ${className}`}
      aria-label={`${name || 'AI'} is typing`}
    >
      {/* 1. Avatar จิ๋วสไตล์ Twitter DM (ถ้ามี) */}
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt={name || 'Avatar'}
          className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/10 shadow-sm"
        />
      )}

      {/* 2. Bubble & Subtext */}
      <div className="flex flex-col gap-1 items-start">
        {/* บับเบิ้ล 3 จุด สไตล์ Apple iMessage & X Lights Out */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[18px] rounded-bl-none bg-[#1D1D1F] border border-[#2F3336] shadow-sm">
          <span
            className="w-1.5 h-1.5 rounded-full animate-typing-dot-1 shrink-0"
            style={{ backgroundColor: dotColor || '#ACACB2' }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full animate-typing-dot-2 shrink-0"
            style={{ backgroundColor: dotColor || '#ACACB2' }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full animate-typing-dot-3 shrink-0"
            style={{ backgroundColor: dotColor || '#ACACB2' }}
          />
        </div>

        {/* ข้อความกำกับ (ถ้าเลือก variant="with-text" หรือมีข้อความ subtext / name) */}
        {(variant === 'with-text' || subtext) && (
          <div className="flex items-center gap-1.5 text-[12px] text-[#ACACB2] pl-1 font-normal tracking-wide">
            {name && <span className="text-[#F2F2F5] font-medium">{name}</span>}
            {subtext && <span>{subtext}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingIndicator;
