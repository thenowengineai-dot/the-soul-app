import React from 'react';

export interface TokenBadgeTextProps {
  /** ข้อความดิบที่มี token เช่น [PLAYER] หรือ [ACTOR] */
  text?: string;
  /** ชื่อตัวละครสำหรับแทนที่ [ACTOR] เช่น "มาฮิโระ" */
  actorName?: string;
  /** ชื่อผู้เล่นสำหรับแทนที่ [PLAYER] ดีฟอลต์คือ "คุณ" */
  playerName?: string;
  /** คลาส CSS เพิ่มเติมสำหรับ wrapper span */
  className?: string;
  /** กรองคำกำกับเทคนิคภาษาอังกฤษ (เช่น Player Anchor:, 3D Geometry:, |) ออกสำหรับการแสดงผลหน้าบ้าน */
  stripMetadata?: boolean;
}

// รองรับทั้ง [PLAYER], [ACTOR], [player], [actor], และ [player ] (มีช่องว่างภายในวงเล็บ)
const TOKEN_REGEX = /(\[\s*(?:player|actor)\s*\])/gi;

/**
 * กรอง metadata คำกำกับ AI หลังบ้าน (เช่น "Player Anchor:", "3D Geometry:", "Skin Micro-Details:", "Wardrobe Continuity:", "|")
 * ออกสำหรับการแสดงผลหน้าบ้าน เพื่อให้อ่านเป็นบทบรรยายภาษาไทยที่ลื่นไหล
 */
function stripPromptMetadata(text?: string): string {
  if (!text) return '';
  return text
    // ลบหัวข้อคำกำกับภาษาอังกฤษเชิงเทคนิค
    .replace(
      /(?:Player\s*Anchor|3D\s*Geometry|Skin\s*Micro[\s-]*Details|Wardrobe\s*Continuity|Physical\s*Anchor|Spatial\s*Anchor|\[?🔥?\s*SYSTEM\s*DIRECTIVE\]?)\s*:\s*/gi,
      ''
    )
    // แปลงตัวแบ่ง pipe | ให้กลายเป็นเว้นวรรค
    .replace(/\s*\|\s*/g, ' ')
    // ยุบช่องว่างซ้ำซ้อนให้เป็น space เดียว
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * TokenBadgeText: คอมโพเนนต์แปลงคำนามตัวแทน (Tokens) ให้เป็น Inline Badge สไตล์ Code Pill
 * - [PLAYER] -> สีฟ้าสด (Electric Sky Blue: #00D2FF) แทนผู้เล่น ("คุณ")
 * - [ACTOR]  -> สีชมพูสด (Vivid Hot Pink: #FF3880) แทนตัวละครบอท
 * - ฟอนต์น้ำหนัก 400 (font-normal) เพื่อให้อ่านลื่นไหลเสมือนตัวหนังสือปกติ ไม่สะดุดสายตา
 * - พื้นหลังโปร่งแสงบางเบา (bg-white/[0.04]) ไร้เส้นขอบ กลืนไปกับพื้นหลังตามบรีฟ
 * - รองรับการกรองคำกำกับเทคนิคภาษาอังกฤษ (stripMetadata) ออกจากหน้าบ้านโดยที่หลังบ้านยังมีครบ
 */
export const TokenBadgeText: React.FC<TokenBadgeTextProps> = ({
  text,
  actorName = 'ตัวละคร',
  playerName = 'คุณ',
  className = '',
  stripMetadata = true,
}) => {
  if (!text) return null;

  const rawText = stripMetadata ? stripPromptMetadata(text) : text;
  const parts = rawText.split(TOKEN_REGEX);

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        const lower = part.toLowerCase();

        // 🟢 ตรวจจับ [PLAYER] / [player] -> ตัวแทนผู้เล่น (สีฟ้าสด คมชัด ฟอนต์ 400 ไร้ขอบ อ่านลื่นไหล ชิดพอดีคำ)
        if (lower.includes('player')) {
          return (
            <span
              key={idx}
              title="ตัวแทนผู้เล่น [PLAYER]"
              style={{ color: '#00D2FF', fontWeight: 400 }}
              className="inline-flex items-center px-1 py-[1px] rounded-[3px] bg-white/[0.04] font-normal align-baseline select-none transition-colors"
            >
              {playerName}
            </span>
          );
        }

        // 🔴 ตรวจจับ [ACTOR] / [actor] -> ตัวแทนตัวละคร (สีชมพูสด คมชัด ฟอนต์ 400 ไร้ขอบ อ่านลื่นไหล ชิดพอดีคำ)
        if (lower.includes('actor')) {
          return (
            <span
              key={idx}
              title={`ตัวแทนตัวละคร [ACTOR]: ${actorName}`}
              style={{ color: '#FF3880', fontWeight: 400 }}
              className="inline-flex items-center px-1 py-[1px] rounded-[3px] bg-white/[0.04] font-normal align-baseline select-none transition-colors"
            >
              {actorName}
            </span>
          );
        }

        // ข้อความธรรมดาทั่วไป
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </span>
  );
};

export default TokenBadgeText;
