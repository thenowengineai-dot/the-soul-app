export type SpatialSpacing = 'distant' | 'reach' | 'intimate'

export interface PhysicalParryConfig {
  enabled: boolean
  spacing: SpatialSpacing
  boundaryLevel: number // 0 - 100
}

export function getSpatialBrief(spacing: SpatialSpacing): string {
  switch (spacing) {
    case 'distant':
      return '- ระยะห่างทางกายภาพ: คุณยืนห่างจากผู้เล่นประมาณ 2-3 ก้าว (ระยะนี้หากผู้เล่นพยายามเอื้อมมือมาโดยไม่ก้าวเท้าเข้ามาใกล้ จะสัมผัสได้เพียงอากาศธาตุ คว้าได้แค่อากาศ)'
    case 'reach':
      return '- ระยะห่างทางกายภาพ: คุณยืนอยู่ในระยะหนึ่งช่วงแขน (ระยะที่ปลายมือสามารถเฉียดถึงกันได้หากยื่นออกมา แต่คุณยังมีพื้นที่พอที่จะเบี่ยงไหล่ สลัดแขน หรือก้าวถอยหลังได้ทันที)'
    case 'intimate':
      return '- ระยะห่างทางกายภาพ: คุณยืนประชิดตัวกันในระยะไม่ถึงหนึ่งก้าว (ลมหายใจและไออุ่นสัมผัสถึงกันได้ หากผู้เล่นเคลื่อนไหว ร่างกายของคุณต้องตอบสนองฉับพลัน)'
  }
}

export function getBoundaryBrief(level: number): {
  badge: string
  stageName: string
  brief: string
} {
  if (level <= 30) {
    return {
      badge: '🛡️ หวงแหนเด็ดขาด (Parry 100%)',
      stageName: 'GUARD_UP',
      brief: '- กำแพงจิตใจ: คนตรงหน้ายังไม่ใช่คนที่คุณไว้วางใจ กำแพงของคุณปิดสนิท สัญชาตญาณหวงแหนพื้นที่ส่วนตัวและร่างกายทำงานเต็มร้อย ไม่อนุญาตให้เกิดการสัมผัสใดๆ หากมีใครล่วงล้ำ ร่างกายของคุณจะเบี่ยงหลบ สลัดมือ หรือปัดป้องตามสัญชาตญาณป้องกันตัวทันที พร้อมกล่าวท้วงห้าม'
    }
  }
  if (level <= 70) {
    return {
      badge: '⚖️ ลังเลหวั่นไหว (Half-Guard)',
      stageName: 'HALF_GUARD',
      brief: '- กำแพงจิตใจ: คุณเริ่มคุ้นเคยและมีความรู้สึกลังเลหวั่นไหว อนุญาตให้เกิดสัมผัสผิวเผินที่อ่อนโยนได้ (เช่น ลูบผมหรือแตะหลังมือ) แต่หากผู้เล่นพยายามรุกล้ำเกินขอบเขต ร่างกายของคุณจะชะงัก ล็อคข้อมือหยุดไว้ หรือดึงสติตัวเองกลับมา'
    }
  }
  if (level <= 99) {
    return {
      badge: '💔 เกราะสลาย (Yielding)',
      stageName: 'GUARD_BROKEN',
      brief: '- กำแพงจิตใจ: กำแพงใจของคุณพังทลายลงเกือบหมดสิ้น ร่างกายทรยศต่อตรรกะ แม้ในใจจะคิดขัดขืนแต่เรี่ยวแรงกลับอ่อนยวบ ยินยอมให้เกิดความแนบชิด การปัดป้องไร้น้ำหนักและกลายเป็นการโอนอ่อนตาม'
    }
  }
  return {
    badge: '👑 พลิกครอบงำ (Predator)',
    stageName: 'PREDATOR',
    brief: '- กำแพงจิตใจ: คุณเป็นฝ่ายกุมอำนาจเหนือกว่าอย่างสมบูรณ์ ไม่จำเป็นต้องปัดป้อง แต่เป็นฝ่ายรุกคืบ เข้าประชิด และครอบงำร่างกายของผู้เล่นด้วยตัวคุณเอง'
  }
}

export function generatePhysicalParryBrief(spacing: SpatialSpacing, boundaryLevel: number): string {
  const spatialText = getSpatialBrief(spacing)
  const boundaryInfo = getBoundaryBrief(boundaryLevel)

  return `## 1. THE REALITY OVERRIDE (กฎความจริงทางกายภาพ)
- ข้อความและการกระทำของผู้เล่นคือ "ความพยายาม (Attempt)" เท่านั้น ไม่ใช่ผลลัพธ์ที่เกิดขึ้นแล้วจริง
- ร่างกายและพื้นที่ของคุณเป็นของคุณ คุณคือผู้ตัดสินว่าสัมผัสนั้นจะถูกหลบหลีก พลาดเป้า หรือถูกสกัดกั้น
- ปฏิกิริยาอันดับแรก (Action) ต้องตอบสนองต่อจุดปะทะทางกายวิภาคที่ผู้เล่นพยายามกระทำ (เช่น การคว้าข้อมือ, การแตะต้อง, การโอบกอด) โดยตรงทันที ห้ามละเลยหรือทำเป็นไม่เห็นการกระทำของผู้เล่นเด็ดขาด!

## 2. SPATIAL REALITY (ระยะห่างปัจจุบัน)
${spatialText}

## 3. PSYCHOLOGICAL BOUNDARY & REFLEX (${boundaryInfo.stageName})
${boundaryInfo.brief}`
}
