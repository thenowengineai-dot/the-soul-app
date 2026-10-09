export type SpatialSpacing = 'distant' | 'reach' | 'intimate'
export type BoundaryPosture = 'guarded' | 'hesitant' | 'open'

export interface PhysicalParryConfig {
  enabled: boolean
  spacing: SpatialSpacing
  boundaryLevel: number // 0 - 100
}

export function getBoundaryPosture(level: number): BoundaryPosture {
  if (level <= 35) return 'guarded'
  if (level <= 75) return 'hesitant'
  return 'open'
}

export function getBoundaryBrief(level: number): {
  badge: string
  stageName: string
  brief: string
} {
  const posture = getBoundaryPosture(level)
  if (posture === 'guarded') {
    return {
      badge: 'หวงแหนเด็ดขาด (Parry 100%)',
      stageName: 'GUARD_UP',
      brief: 'กำแพงปิดสนิท สัญชาตญาณหวงแหนพื้นที่ส่วนตัวและร่างกายทำงานเต็มร้อย ไม่อนุญาตให้สัมผัส ปัดป้องหรือสกัดมือทิ้งกลางอากาศทันที'
    }
  }
  if (posture === 'hesitant') {
    return {
      badge: 'ลังเลหวั่นไหว (Hesitant / Graze)',
      stageName: 'HESITANT',
      brief: 'เริ่มหวั่นไหว ลังเล สับสน อนุญาตให้เกิดสัมผัสเฉียดผิวหรือโดนบางเบาแล้วสะดุ้งชะงัก ค่อยๆ ดึงมือถอยหนี'
    }
  }
  return {
    badge: 'เกราะสลายยินยอม (Open / Latched)',
    stageName: 'OPEN',
    brief: 'กำแพงใจเปิดออก ร่างกายยินยอมและโอนอ่อนตาม ยอมให้เกิดการกุมมือ โอบกอด หรือสัมผัสแนบแน่นค้างไว้'
  }
}

export function generatePhysicalParryBrief(
  spacing: SpatialSpacing,
  boundaryLevel: number,
  playerInput: string = ''
): string {
  const posture = getBoundaryPosture(boundaryLevel)

  let distDesc = 'Reach (1 ช่วงแขน เอื้อมถึงกันได้)'
  let distDirective = 'อยู่ในระยะวิกฤต สามารถยกแขนปัดป้อง สกัดกั้น หรือเบี่ยงตัวหลบได้ทันควัน'
  if (spacing === 'distant') {
    distDesc = 'Distant (ห่าง 2-3 ก้าว อยู่นอกระยะเอื้อม)'
    distDirective = 'เป้าหมายอยู่นอกระยะเอื้อม มือตัดผ่านอากาศธาตุ เกิดผลลัพธ์วืด (MISSED) ห้ามเกิดการสัมผัส 100%'
  } else if (spacing === 'intimate') {
    distDesc = 'Intimate (ประชิดตัว แนบชิดศูนย์ก้าว)'
    distDirective = 'อยู่ในระยะแนบชิด การเคลื่อนไหวส่งผลต่อสรีระและร่างกายโดยตรงทันที'
  }

  let boundaryDesc = 'Guarded (หวงตัวเด็ดขาด 100% ป้องกันตัวเต็มที่)'
  let boundaryDirective = 'ไม่อนุญาตให้เกิดการสัมผัสเด็ดขาด ยกแขนปัดทิ้งหรือสกัดกั้นกลางอากาศก่อนถึงตัว (PARRIED)'
  if (posture === 'hesitant') {
    boundaryDesc = 'Hesitant (หวั่นไหว ลังเล สับสน กำแพงจิตใจแตกร้าว)'
    boundaryDirective = 'สัมผัสโดนเพียงผิวเผินหรือเฉียดปลายนิ้วแล้วสะดุ้งชะงัก ดึงมือถอยหนีด้วยความสับสน (GRAZED)'
  } else if (posture === 'open') {
    boundaryDesc = 'Open (ยินยอม กำแพงใจพังทลาย)'
    boundaryDirective = 'ยินยอมรับสัมผัส ร่างกายโอนอ่อนตาม เกิดการกุมมือหรือโอบกอดแนบแน่น (LATCHED)'
  }

  return `[PHYSICAL REALITY]
- Distance: ${distDesc}
- Character Boundary Posture: ${boundaryDesc}
- Player Attempt: ${playerInput || 'เคลื่อนไหวเข้าหาเป้าหมาย'}
- Physical Directive: ${distDirective}
- Boundary Directive: ${boundaryDirective}`
}
