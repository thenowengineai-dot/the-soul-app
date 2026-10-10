import type { SpatialSpacing } from './physicalParryModule'
import { getBoundaryBrief } from './physicalParryModule'

export function generateUnifiedFusionPrompt(
  spacing: SpatialSpacing,
  boundaryLevel: number,
  originPosture: string,
  playerInput: string = ''
): string {
  const boundaryInfo = getBoundaryBrief(boundaryLevel)

  let distDesc = 'Reach (1 ช่วงแขน เอื้อมถึงกันได้)'
  let distDirective = 'อยู่ในระยะวิกฤต สามารถยกแขนปัดป้อง สกัดกั้น หรือเบี่ยงตัวหลบได้ทันควัน'
  if (spacing === 'distant') {
    distDesc = 'Distant (ห่าง 2-3 ก้าว อยู่นอกระยะเอื้อม)'
    distDirective = 'เป้าหมายอยู่นอกระยะเอื้อม มือตัดผ่านอากาศธาตุ เกิดผลลัพธ์วืด (MISSED) ห้ามเกิดการสัมผัส 100%'
  } else if (spacing === 'intimate') {
    distDesc = 'Intimate (ประชิดตัว แนบชิดศูนย์ก้าว)'
    distDirective = 'อยู่ในระยะแนบชิด การเคลื่อนไหวส่งผลต่อสรีระและร่างกายโดยตรงทันที'
  }

  const cleanOrigin = (originPosture || '').trim() || 'ยืนหันข้างกอดอกแน่น ปลายเล็บจิกแขนเสื้อตัวเอง'

  return `# ACTIVE MODULE: UNIFIED FUSION ENGINE (BOUNDARY & KINETIC INTEGRATION)
[1. KINETIC ORIGIN: สภาพร่างกายและจุดศูนย์ถ่วงตั้งต้น]
- a_pos ตั้งต้น: "${cleanOrigin}"
(นี่คือตำแหน่งสรีระ มวลสาร และการจัดวางแขนของคุณก่อนที่ผู้เล่นจะเริ่มขยับตัว)

[2. PHYSICAL REALITY & HITBOX BOUNDARY (ขอบเขตสัมผัสทางกายภาพ)]
- Spatial Spacing: ${distDesc}
- Boundary Posture: ${boundaryInfo.stageName} (${boundaryLevel}%) - ${boundaryInfo.badge}
- Player Attempt: ${playerInput || 'เคลื่อนไหวเข้าหาเป้าหมาย'}
- Spacing Rule: ${distDirective}
- Boundary Rule: ${boundaryInfo.brief}

[3. CINEMATIC KINETIC PACING (กฎจังหวะสรีระภาพยนตร์)]
- THE LAW OF INERTIA: หากผู้เล่นเพียงพูดคุย หรือไม่มีแรงผลักดันทางกายภาพ จงนิ่ง (STILLNESS) ห้ามเปลี่ยนท่าโดยไร้เหตุผล
- HIGH VELOCITY SNAP: เมื่อเกิดแรงปะทะฉับพลัน หรือการปัดป้องเด็ดขาด ให้ตัดข้ามเฟรมแทรก (Snap Cut) ตรงสู่จุดกระทบและท่ารับแรงทันที
- LOW VELOCITY UNHOOK: เมื่อเกิดการสัมผัสหรือผละออกอย่างช้าๆ ให้เน้นแรงเสียดทานและการคลายตัวอย่างประณีต
- ANTI-TELEPORT SANCTUARY: ท่าทางใหม่ต้องเริ่มคลายตัวออกจาก a_pos ตั้งต้นเสมอ ห้ามวาร์ปข้ามมิติเวลา`
}
