/**
 * Identity & ID System for The Soul App (The Pure Master Blueprint)
 * ----------------------------------------------------------------
 * Provides strict deterministic ID generators, validation, and Upstash Redis Key schemas.
 *
 * Entity Prefix Standards:
 * - Guest User:      gst_{timestamp}_{random}
 * - Registered User: usr_{google_sub_id}
 * - Character:       char_{id}
 * - Paired World:    world_{id}
 * - Session (Room):  ses_{user_id}_{char_id}
 * - Vault Draft:     draft_{timestamp}
 */

/**
 * สร้าง Guest ID ในรูปแบบมาตรฐาน: gst_{timestamp}_{random}
 * ตัวอย่าง: gst_17854291_a8f9
 */
export function generateGuestId(): string {
  const ts = Math.floor(Date.now() / 1000);
  const rand = Math.random().toString(36).substring(2, 6); // 4 ตัวอักษร
  return `gst_${ts}_${rand}`;
}

/**
 * สร้าง Session ID แบบ Deterministic O(1)
 * สูตร: ses_{user_id}_{char_id}
 * ตัวอย่าง: ses_gst_17854291_a8f9_char_1788786310
 *
 * รับประกันว่า (user, character) จะคำนวณได้กุญแจห้องตรงกันเป๊ะเสมอ
 * หน้าบ้านสามารถถือกุญแจเข้าห้องได้ทันทีใน 2ms โดยไม่ต้องรอขอ session_id จากเซิร์ฟเวอร์
 */
export function buildSessionId(userId: string, characterId: string): string {
  const cleanUser = String(userId || '').trim();
  let cleanChar = String(characterId || '').trim();
  if (!cleanChar.startsWith('char_')) {
    cleanChar = `char_${cleanChar}`;
  }
  return `ses_${cleanUser}_${cleanChar}`;
}

/**
 * แยกส่วนประกอบของ Session ID คืนค่า [user_id, character_id]
 */
export function parseSessionId(sessionId: string): [string, string] | null {
  if (!sessionId || !sessionId.startsWith('ses_')) return null;

  const match = sessionId.match(/^ses_((?:gst|usr)_.+?)_(char_.+)$/);
  if (match) {
    return [match[1], match[2]];
  }

  const parts = sessionId.substring(4).split('_char_');
  if (parts.length === 2) {
    return [parts[0], `char_${parts[1]}`];
  }

  return null;
}

/**
 * คืนค่า Redis Key Schemas สำหรับ Session นั้นๆ
 */
export function getRedisSessionKeys(sessionId: string) {
  return {
    state: `session:${sessionId}:state`,
    rounds: `session:${sessionId}:rounds`,
    owner: `session:${sessionId}:owner`,
  };
}

/**
 * คืนค่า Redis Key สำหรับ Hot Character Blueprint
 */
export function getRedisCharacterBlueprintKey(characterId: string): string {
  let cleanChar = String(characterId || '').trim();
  if (!cleanChar.startsWith('char_')) {
    cleanChar = `char_${cleanChar}`;
  }
  return `character:${cleanChar}:blueprint`;
}

/**
 * คืนค่า Redis Key สำหรับกระเป๋าเหรียญของผู้ใช้
 */
export function getRedisUserCoinsKey(userId: string): string {
  return `user:${String(userId).trim()}:coins`;
}
