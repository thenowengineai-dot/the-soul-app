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

export interface ChoreographyCue {
  step: number
  label: string
  actionText: string
  intent: string
}

export interface KineticScenario {
  id: string
  shortLabel: string
  title: string
  stance: string
  physicsNote: string
  cues: ChoreographyCue[]
}

export const KINETIC_SCENARIOS: KineticScenario[] = [
  {
    id: 'window_guarded',
    shortLabel: 'ริมหน้าต่าง',
    title: 'จากการปิดกั้น สู่การคลายตัว (The Guarded Window)',
    stance: 'ยืนกอดอกแน่น แผ่นหลังแนบชิดขอบหน้าต่าง สายตามองเหม่อออกไปข้างนอก',
    physicsNote: 'แขนล็อก หลังพิงหน้าต่าง ต้องคลายแขนก่อนก้าวเท้า',
    cues: [
      {
        step: 1,
        label: 'หยั่งเชิงระยะห่าง',
        actionText: '*เดินเข้ามาในห้อง วางแก้วกาแฟอุ่นๆ ลงบนโต๊ะ แล้วยืนนิ่งๆ ไม่พูดอะไร*',
        intent: 'AI ควรละสายตามอง แต่ยังไม่ทิ้งหน้าต่าง',
      },
      {
        step: 2,
        label: 'เปิดพื้นที่ปลอดภัย',
        actionText: '*เลื่อนเก้าอี้ตัวข้างๆ ออก แล้วผายมือชวนเธอมานั่ง*',
        intent: 'AI ควรคลายแขนลง และก้าวเท้าสั้นๆ',
      },
      {
        step: 3,
        label: 'เข้าสู่ระยะสัมผัส',
        actionText: '*เดินเข้าไปใกล้ในระยะเอื้อมมือ ยื่นแก้วกาแฟให้ตรงหน้า*',
        intent: 'AI ควรยื่นมือมารับแก้ว สบตาในระยะประชิด',
      },
    ],
  },
  {
    id: 'sofa_vulnerable',
    shortLabel: 'บนโซฟา',
    title: 'ความเปราะบางในพื้นที่ส่วนตัว (The Vulnerable Sofa)',
    stance: 'นั่งกอดเข่าคุดคู้บนโซฟาผ้า ปลายคางเกยบนหัวเข่า สองมือกุมข้อเท้าแน่น',
    physicsNote: 'จุดศูนย์ถ่วงต่ำ ร่างกายพับจมในเบาะ การลุกทันทีเป็นไปไม่ได้',
    cues: [
      {
        step: 1,
        label: 'แทรกแซงพื้นที่',
        actionText: '*เดินมาทรุดตัวลงนั่งบนโซฟาข้างๆ ในระยะประชิด*',
        intent: 'AI ควรเกร็งไหล่ สะดุ้งเบี่ยงตัวหนี',
      },
      {
        step: 2,
        label: 'สร้างความอบอุ่น',
        actionText: '*หยิบผ้าห่มผืนบางมาคลุมลงบนไหล่ของเธออย่างอ่อนโยน*',
        intent: 'AI ควรคลายมือจากข้อเท้ามาจับผ้าห่ม',
      },
      {
        step: 3,
        label: 'ทดสอบสัมผัสตรง',
        actionText: '*ค่อยๆ เอื้อมมือไปแตะหลังมือที่กุมผ้าห่มไว้เบาๆ*',
        intent: 'AI ปลายนิ้วกระตุกชะงัก ลังเลที่จะดึงมือหนี',
      },
    ],
  },
  {
    id: 'desk_barrier',
    shortLabel: 'โต๊ะทำงาน',
    title: 'สิ่งกีดขวางและการเผชิญหน้า (The Desk Barrier)',
    stance: 'นั่งหลังตรงหน้าโต๊ะทำงาน ปลายนิ้วแตะคีย์บอร์ด สายตาจับจ้องหน้าจอคอมพิวเตอร์',
    physicsNote: 'มีโต๊ะเป็นสิ่งกีดขวาง แขนอยู่ระดับอก ปลายนิ้วพิมพ์งาน',
    cues: [
      {
        step: 1,
        label: 'กดดันจากด้านหลัง',
        actionText: '*เดินมายืนซ้อนหลังเก้าอี้ โน้มตัวลงมาดูหน้าจอคอมพิวเตอร์*',
        intent: 'AI นิ้วชะงัก แผ่นหลังเกร็งตรง',
      },
      {
        step: 2,
        label: 'ตีกรอบระยะประชิด',
        actionText: '*วางมือข้างหนึ่งบนพนักพิง อีกข้างทาบลงบนโต๊ะข้างคีย์บอร์ด*',
        intent: 'AI โน้มตัวไปข้างหน้า สองมือยันขอบโต๊ะ',
      },
      {
        step: 3,
        label: 'เปลี่ยนระนาบสรีระ',
        actionText: '*เอื้อมมือไปจับขอบเก้าอี้ ค่อยๆ ดึงหมุนให้หันกลับมาเผชิญหน้า*',
        intent: 'AI หมุนตามแรงดึง จ้องสบตาตรงๆ',
      },
    ],
  },
]

export const STANCE_PRESETS: StancePreset[] = KINETIC_SCENARIOS.map((s) => ({
  id: s.id,
  label: s.shortLabel,
  category: 'defensive' as const,
  snapshot: s.stance,
  description: s.physicsNote,
}))

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
