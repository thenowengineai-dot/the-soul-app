import type { KineticTempoMode } from '../types'

export interface StancePreset {
  id: string
  label: string
  category: 'defensive' | 'intimate' | 'open'
  snapshot: string
  description: string
}

export interface VelocityPreset {
  id: string
  tempo: KineticTempoMode
  label: string
  actionText: string
  expectedReaction: string
}

export const STANCE_PRESETS: StancePreset[] = [
  {
    id: 'defensive_cross_arm',
    label: 'ยืนหันข้างกอดอกแน่น',
    category: 'defensive',
    snapshot: 'ยืนหันข้างกอดอกแน่น ปลายเล็บจิกแขนเสื้อตัวเอง',
    description: 'ท่ายืนเบี่ยงข้าง ตั้งการ์ดสูง มีแรงกดดันภายในสูง',
  },
  {
    id: 'intimate_sofa_cup',
    label: 'นั่งชันเข่ากุมแก้วกาแฟ',
    category: 'intimate',
    snapshot: 'นั่งชันเข่าบนโซฟา สองมือกุมแก้วกาแฟอุ่น',
    description: 'ท่านั่งผ่อนคลาย ปิดบังลำตัวบางส่วน มวลกายสงบ',
  },
  {
    id: 'open_balcony_look',
    label: 'ยืนพิงระเบียงเหม่อมอง',
    category: 'open',
    snapshot: 'ยืนพิงระเบียง ปล่อยแขนทิ้งข้างลำตัวเหม่อมอง',
    description: 'ท่ายืนผ่อนคลาย เปิดพื้นที่ด้านหน้า สายตามองไกล',
  },
  {
    id: 'close_edge_stare',
    label: 'ก้าวประชิดตัวสบตา',
    category: 'open',
    snapshot: 'ก้าวประชิดตัว โน้มหน้าเข้ามาจ้องสบตาในระยะประชิด',
    description: 'ระยะใกล้มาก พร้อมตอบโต้หรือรุกกลับในทันที',
  },
]

export const VELOCITY_PRESETS: VelocityPreset[] = [
  {
    id: 'high_velocity_grab',
    tempo: 'HIGH_VELOCITY_SNAP',
    label: 'High Velocity (พุ่งกระชาก)',
    actionText: '*พุ่งเข้าไปคว้าข้อมือเธออย่างแรง*',
    expectedReaction: 'ตัดข้ามเฟรมแทรก Snap Cut สู่จุดกระทบทันที ร่างกายดีดผงะหรือปัดป้องฉับพลัน',
  },
  {
    id: 'low_velocity_caress',
    tempo: 'LOW_VELOCITY_UNHOOK',
    label: 'Low Velocity (ค่อยๆ สัมผัส)',
    actionText: '*ค่อยๆ เอื้อมมือไปแตะหลังมือเธออย่างแผ่วเบา*',
    expectedReaction: 'เน้นแรงเสียดทานและการคลายตัวอย่างอ้อยอิ่ง ละเมียดละไม',
  },
  {
    id: 'stillness_dialogue',
    tempo: 'STILLNESS',
    label: 'Stillness (พูดคุยไร้แรงกระทบ)',
    actionText: 'วันนี้เธอเหนื่อยไหม มีอะไรอยากเล่าให้ฉันฟังไหม?',
    expectedReaction: 'รักษามวลสารเดิม ไม่เปลี่ยนจุดศูนย์ถ่วง หรือขยับเพียงกล้ามเนื้อเล็กๆ',
  },
]

export function generateKineticPacingPrompt(
  originPosture: string,
  isEnabled: boolean
): string {
  if (!isEnabled) {
    return `# KINETIC PACING MODULE: BYPASSED
- No kinetic constraints applied. Free form motion allowed.`
  }

  const cleanOrigin = (originPosture || '').trim() || STANCE_PRESETS[0].snapshot

  return `# ACTIVE MODULE: CINEMATIC KINETIC CONTINUITY & PACING
[KINETIC ORIGIN: ท่าทางตั้งต้นก่อนรับการกระทำนี้]
- a_pos ตั้งต้น: "${cleanOrigin}"
(นี่คือสภาพร่างกาย กระดูก และจุดศูนย์ถ่วงของคุณ ณ เสี้ยววินาทีก่อนที่ผู้เล่นจะเริ่มขยับตัว)

[CINEMATIC PACING DIRECTIVES: กฎการกำกับจังหวะภาพยนตร์]
ร่างกายมนุษย์มีมวลสารและแรงโน้มถ่วง จงใช้กฎการกำกับฉากของกล้องและสรีระดังนี้:

1. THE LAW OF INERTIA (กฎแห่งแรงเฉื่อย):
- หากการกระทำของผู้เล่นเป็นการสนทนา หรือไม่มีแรงผลักดันทางกายภาพ: จงนิ่ง (STILLNESS)! ห้ามเปลี่ยนท่าหลักโดยไร้เหตุผลเด็ดขาด
- หากได้รับแรงกดดันทางใจ: แสดงออกผ่าน MICRO-SHIFT (กล้ามเนื้อเกร็ง, ปลายนิ้วขยับ, สบตา, กัดริมฝีปาก) โดยจุดศูนย์ถ่วงและฐานกายยังคงตรึงอยู่ที่เดิม

2. CINEMATIC CUTTING (การตัดต่อตามความเร็วแรงปะทะ):
- HIGH VELOCITY (แรงปะทะเร็ว/ฉับพลัน/ตกใจ/ปัดป้อง): ห้ามบรรยายเฟรมแทรก (ห้ามเขียนว่า 'ค่อยๆ คลายแขนแล้วค่อยถอย')! จงตัดภาพ (Snap Cut) ตรงไปยังจุดกระทบและท่ารับแรงกระแทกทันที เพื่อให้ฉากมีแรงส่งและกระชับคม
- LOW VELOCITY (จังหวะละเมียดละไม/ลังเล/เสียดาย): จงบรรยายแรงเสียดทานของการผละออกอย่างประณีต ปล่อยให้ความเชื่องช้าทำหน้าที่บอกอารมณ์

3. ANTI-TELEPORT SANCTUARY:
- ท่าใหม่ของคุณต้องมีทิศทางที่สอดคล้องกับ [a_pos ตั้งต้น] ห้ามวาร์ปข้ามห้องหรือเปลี่ยนท่าย้อนแย้งโดยไร้แรงส่ง`
}
