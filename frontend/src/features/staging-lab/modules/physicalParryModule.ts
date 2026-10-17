export type SpatialSpacing = 'distant' | 'reach' | 'intimate'
export type BoundaryPosture = 'guarded' | 'hesitant' | 'open'

export interface PhysicalParryConfig {
  enabled: boolean
  spacing: SpatialSpacing
  boundaryLevel: number // 0 - 100 (Desire & Sensory Heat Level)
}

export function getBoundaryPosture(level: number): BoundaryPosture {
  if (level <= 35) return 'guarded'
  if (level <= 70) return 'hesitant'
  return 'open'
}

export function getBoundaryBrief(level: number): {
  badge: string
  stageName: string
  sensoryHeat: string
  brief: string
} {
  const posture = getBoundaryPosture(level)
  if (posture === 'guarded') {
    return {
      badge: 'สติครบ / เยือกเย็น (Cold & Composed)',
      stageName: 'COMPOSED (สติครบ)',
      sensoryHeat: 'อุณหภูมิร่างกายปกติ ลมหายใจนิ่งสม่ำเสมอ ควบคุมสติและสรีระได้ 100%',
      brief:
        'ลมหายใจนิ่ง สติสัมปชัญญะครบถ้วน ขีดเส้นกั้นตามระดับความสัมพันธ์ หากผู้เล่นล้ำเส้นเกินสถานะ จะเบี่ยงตัวหลบหรือปัดมือออกทันที'
    }
  }
  if (posture === 'hesitant') {
    return {
      badge: 'หวั่นไหว / ใจเต้นรัว (Warming & Racing Heart)',
      stageName: 'WARMING (ใจเต้นรัว)',
      sensoryHeat:
        'หัวใจเริ่มเต้นแรงผิดจังหวะ ลมหายใจสะดุดเมื่ออยู่ใกล้ ผิวบริเวณที่ถูกเฉียดร้อนวูบวาบ ต้องแอบกลืนน้ำลาย',
      brief:
        'หัวใจเต้นแรงผิดจังหวะ ลมหายใจสะดุด ผิวร้อนวูบวาบเมื่อถูกเฉียดใกล้ เริ่มลังเลที่จะปัดป้อง ยอมให้แตะตัวหรือขยับเข้าใกล้โดยร่างกายชะงักเกร็งด้วยความตื่นเต้น'
    }
  }
  return {
    badge: 'เร่าร้อน / ไวสัมผัสขั้นสุด (Burning & Sweaty Heat)',
    stageName: 'BURNING (เร่าร้อน)',
    sensoryHeat:
      'ร่างกายร้อนผ่าวไวต่อสัมผัสขั้นสุด เหงื่อเม็ดเล็กซึมตามไรผมและลำคอ ลมหายใจหอบร้อน หัวใจเต้นระรัวจนแผ่นอกกระเพื่อม สั่นสะท้านทุกครั้งที่ถูกแตะหรือถูกลมหายใจเป่ารด',
    brief:
      'ไฟปรารถนาลุกโชน ร่างกายร้อนผ่าว เหงื่อซึมตามไรผมและลำคอ ลมหายใจหอบร้อน ใจเต้นระรัว ไวต่อทุกปลายนิ้วและลมหายใจ เรี่ยวแรงที่จะผลักไสละลายหายไป ยอมให้กอดแนบชิดหรือสัมผัสลึกซึ้ง'
  }
}

export function generatePhysicalParryBrief(
  spacing: SpatialSpacing,
  boundaryLevel: number,
  playerInput: string = '',
  originPosture?: string
): string {
  const posture = getBoundaryPosture(boundaryLevel)
  const briefInfo = getBoundaryBrief(boundaryLevel)

  let distDesc = 'Reach (1 ช่วงแขน เอื้อมถึงกันได้)'
  let distDirective = 'อยู่ในระยะเอื้อมถึง สามารถสัมผัส ปัดป้อง หรือเบี่ยงตัวหลบได้ตามระดับไฟปรารถนา'
  if (spacing === 'distant') {
    distDesc = 'Distant (ห่าง 2-3 ก้าว อยู่นอกระยะเอื้อม)'
    distDirective = 'เป้าหมายอยู่นอกระยะเอื้อม มือตัดผ่านอากาศธาตุ เกิดผลลัพธ์วืด (MISSED) ห้ามเกิดการสัมผัส 100%'
  } else if (spacing === 'intimate') {
    distDesc = 'Intimate (ประชิดตัว แนบชิดศูนย์ก้าว)'
    distDirective = 'อยู่ในระยะแนบชิด ลมหายใจและอุณหภูมิร่างกายส่งผลต่อประสาทสัมผัสโดยตรงทันที'
  }

  let boundaryDesc = `Composed (${boundaryLevel}% - สติครบ 100% ป้องกันตัวตามระยะความสัมพันธ์)`
  let boundaryDirective =
    'ไม่อนุญาตให้ล้ำเส้นเกินสถานะ ยกแขนปัดทิ้งหรือเบี่ยงตัวหลบก่อนถึงตัว (PARRIED)'
  if (posture === 'hesitant') {
    boundaryDesc = `Warming (${boundaryLevel}% - หวั่นไหว ใจเต้นรัว ผิวร้อนวูบวาบ)`
    boundaryDirective =
      'สัมผัสโดนผิวหรือเฉียดปลายนิ้วแล้วสะดุ้งชะงัก ลมหายใจสะดุด หัวใจเต้นแรง ดึงมือถอยช้าๆ ด้วยความสับสน (GRAZED)'
  } else if (posture === 'open') {
    boundaryDesc = `Burning (${boundaryLevel}% - เร่าร้อน ไวสัมผัสขั้นสุด เหงื่อซึม ใจเต้นระรัว)`
    boundaryDirective =
      'ร่างกายพ่ายแพ้ต่อไฟปรารถนา เหงื่อซึม ลมหายใจหอบร้อน ไร้เรี่ยวแรงผลักไส ยอมรับสัมผัสแนบแน่น (LATCHED)'
  }

  const postureLine = originPosture?.trim()
    ? `\n- Actor Origin Stance: "${originPosture.trim()}" (สรีระและท่วงท่าปัจจุบันของนักแสดงก่อนการเคลื่อนไหว เริ่มต้นปฏิกิริยาจากท่านี้)`
    : ''

  return `[PHYSICAL REALITY & SENSORY HEAT]
- Distance: ${distDesc}
- Desire & Sensory Heat Level: ${boundaryDesc}
- Somatic Temperature & Pulse: ${briefInfo.sensoryHeat}${postureLine}
- Player Attempt: ${playerInput || 'เคลื่อนไหวเข้าหาเป้าหมาย'}
- Spatial Directive: ${distDirective}
- Touch & Reflex Directive: ${boundaryDirective}`
}
