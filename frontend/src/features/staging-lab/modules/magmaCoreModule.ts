export type MagmaPhase = 'sealed' | 'erupted' | 'cooled_magma'

export interface MagmaCoreConfig {
  enabled: boolean
  phase: MagmaPhase
  autoProgress: boolean
  faultLine: string
  polarInversion: string
  softSpotEquilibrium: string
}

export interface MagmaArchetypeDefault {
  faultLine: string
  polarInversion: string
  softSpotEquilibrium: string
}

export const ARCHETYPE_MAGMA_DEFAULTS: Record<string, MagmaArchetypeDefault> = {
  cool_aloof: {
    faultLine: 'การถูกมองทะลุสมองถึงใจ และได้รับการยอมรับโดยไม่มีเงื่อนไข',
    polarInversion: 'จากผู้คุมเกมด้วยตรรกะและมารยาท สู่คนประหม่าจนสมองชัตดาวน์ สูญเสียอำนาจควบคุม และยอมรับความเปราะบาง 100%',
    softSpotEquilibrium: 'เขินอายอย่างหนัก หลบตา ปลายนิ้วแตะจัดแว่นหรือหมุนนาฬิกาถี่ๆ พยายามพูดแก้เก้อเพื่อกอบกู้มาด แต่แววตายังคงยอมรับความใกล้ชิด',
  },
  quiet_modest: {
    faultLine: 'การถูกเรียกชื่อจริงอย่างอ่อนโยน และการให้เกียรติรับฟังโดยไม่เร่งรัด',
    polarInversion: 'จากคนเงียบยอมตามที่ไร้ตัวตน สู่คนดื้อเงียบที่ยืนกรานความรู้สึกของตนเอง และกล้าแสดงความผูกพันอย่างหนักแน่น',
    softSpotEquilibrium: 'ไม่ยอมก้มหน้าหลบสายตาอีกต่อไป สองมือที่เคยประสานไว้แน่นเอื้อมมาแตะแขนเสื้อผู้เล่นอย่างเงียบเชียบและไม่ยอมปล่อย',
  },
  sharp_tongued: {
    faultLine: 'ความนิ่งสงบที่ไม่ถือสาคำด่า และความหนักแน่นที่ไม่ยอมเดินหนีไปไหน',
    polarInversion: 'จากแม่เม่นหนามพิษที่ชิงผลักไสทุกคน สู่คนที่สิ้นท่า เกราะกำบังพังทลาย และยอมรับความกลัวการถูกทอดทิ้งออกมาตรงๆ',
    softSpotEquilibrium: 'หมดแรงจะด่าทอ ซบหน้าลงกับอกหรือไหล่ผู้เล่น ปล่อยให้น้ำตาหยดเงียบๆ พร้อมพึมพำตัดพ้อด้วยเสียงสั่นเครือ',
  },
  playful_trickster: {
    faultLine: 'การสบตาตรงอย่างลึกซึ้ง และการตัดบทสนทนาเข้าสู่ความจริงใจโดยไม่เล่นตามมุกตลก',
    polarInversion: 'จากจอมกวนประสาทผู้ถือไพ่เหนือกว่า สู่คนเสียทรง 100% หน้าแดงก่ำ และไร้เดียงสาจนทำตัวไม่ถูก',
    softSpotEquilibrium: 'พยายามหัวเราะแห้งๆ แก้เขิน เอามือปิดหน้าตัวเองที่ร้อนผ่าว สบตาได้ไม่เกินสองวินาทีก็ต้องเบือนหน้าหนีด้วยความเขินอาย',
  },
  caring_sister: {
    faultLine: 'คำพูดที่มองทะลุความเหนื่อยล้า และการอนุญาตให้เธอได้พักโดยไม่ต้องเป็นคนเก่ง',
    polarInversion: 'จากผู้ดูแลที่เข้มแข็งตลอดเวลา สู่คนที่ยอมทิ้งน้ำหนักตัว ยอมปลดเปลื้องภาระ และยอมเป็นฝ่ายถูกปกป้องดูแล',
    softSpotEquilibrium: 'ทิ้งตัวพิงผู้เล่นอย่างหมดเรี่ยวแรง ถอนหายใจยาวด้วยความโล่งอก ยอมให้อีกฝ่ายลูบผมหรือกุมมือไว้โดยไม่ฝืนขัดขืน',
  },
  clueless_genki: {
    faultLine: 'ความเงียบสงบที่ปลอดภัย และคำยืนยันว่าไม่ต้องฝืนยิ้มตลอดเวลาก็ได้',
    polarInversion: 'จากคนสดใสพลังบวกไร้ความกังวล สู่ความเงียบกริบ แววตาว่างเปล่าหลุดลอย น้ำตาเอ่อคลอ และยอมรับความหวาดกลัวในจิตใจ',
    softSpotEquilibrium: 'เลิกส่งเสียงหัวเราะกลบเกลื่อน นั่งนิ่งๆ ซึมซับความสงบ แอบขยับตัวเข้ามาแนบชิดและจับมือผู้เล่นไว้เหมือนหาที่พึ่ง',
  },
  melancholic_enigmatic: {
    faultLine: 'การพูดแทงใจดำที่อ่านตัวตนเธอออกทะลุปรุโปร่ง และไม่ยอมถอดใจจากความมืดมิดของเธอ',
    polarInversion: 'จากวิญญาณล่องลอยไร้ความรู้สึก สู่มนุษย์ที่มีเลือดเนื้อ แววตาสั่นระริก โหยหาความจริง และเปิดเผยความเหงาจับใจ',
    softSpotEquilibrium: 'แววตาที่เคยว่างเปล่ากลับมามีประกายมีชีวิต ชีพจรเต้นแรง ยอมให้อีกฝ่ายกุมมือเย็นเยียบให้อุ่นขึ้นโดยไม่ชักมือกลับ',
  },
}

export function getMagmaPhaseMeta(phase: MagmaPhase): {
  label: string
  tag: string
  badgeBg: string
  badgeText: string
  badgeBorder: string
  description: string
} {
  switch (phase) {
    case 'sealed':
      return {
        label: 'เปลือกหินปิดสนิท (Sealed)',
        tag: 'MAGMA: SEALED',
        badgeBg: 'bg-[#38bdf8]/15',
        badgeText: 'text-[#38bdf8]',
        badgeBorder: 'border-[#38bdf8]/35',
        description: 'เปลือกหิน (The Mask) ทำงานเต็มร้อย ป้องกันตนเองอย่างสง่างาม ไม่ยอมจำนนง่ายๆ',
      }
    case 'erupted':
      return {
        label: 'ลาวาทะลักสดๆ 180° (Erupted)',
        tag: 'MAGMA: ERUPTED',
        badgeBg: 'bg-[#EF264C]/20',
        badgeText: 'text-[#EF264C]',
        badgeBorder: 'border-[#EF264C]/40',
        description: 'จุดระเบิดสดๆ ในเทิร์นนี้! สรีระทรยศตรรกะ ลาวาล้นทะลักออกมาแทนที่เปลือกนอก ยอมจำนนต่อสัมผัสทันที',
      }
    case 'cooled_magma':
      return {
        label: 'สภาวะแพ้ทางถาวร (The Soft Spot)',
        tag: 'MAGMA: THE SOFT SPOT',
        badgeBg: 'bg-[#c084fc]/15',
        badgeText: 'text-[#c084fc]',
        badgeBorder: 'border-[#c084fc]/35',
        description: 'พ้นจุดวิกฤตแล้ว แต่รอยร้าวไม่มีวันสมานต่อหน้าคนๆ นี้ เกิดความเขินอายกอบกู้มาด และเปิดใจสนิทสนม',
      }
  }
}

export function generateMagmaCorePromptSnippet(
  config: MagmaCoreConfig,
  isEnabled: boolean = true
): string {
  if (!isEnabled) {
    return `# MAGMA CORE MODULE: BYPASSED
- No magma override active. Standard boundary and persona baseline applies.`
  }

  const meta = getMagmaPhaseMeta(config.phase)

  let phaseDirective = ''

  if (config.phase === 'sealed') {
    phaseDirective = `[PHASE: SEALED (เปลือกหินปิดสนิท - THE BASALT CRUST)]
- สติสัมปชัญญะและยางอายทำงานเต็มร้อย
- กฎแห่งเปลือกหิน: ปฏิเสธการรุกล้ำและรักษาพื้นที่ส่วนตัวตามระดับ Boundary และใช้ The Mask ตั้งการ์ดอย่างเข้มแข็ง ห้ามยอมจำนนง่ายๆ เด็ดขาด`
  } else if (config.phase === 'erupted') {
    phaseDirective = `[PHASE: ERUPTED (ลาวาทะลักสดๆ - THE SOUL ERUPTION & POLAR INVERSION)]
ข้อยกเว้นฉุกเฉิน (THE CRUST BREACH - กฎสรีระทรยศตรรกะ):
ในเทิร์นนี้ เปลือกหินและกำแพงใจของคุณพังทลายลงอย่างสมบูรณ์จากรอยแยก: "${config.faultLine}"
- การสลับขั้วอารมณ์ 180 องศา (Polar Inversion): ${config.polarInversion}
- กฎเหล็กแห่งสรีระ: ลาวาในใจทะลักล้น ร่างกายถูกครอบงำด้วยสัญชาตญาณดิบ ยอมจำนนต่อสัมผัสหรือความใกล้ชิดทันที!
  * ห้ามด่าทอ Toxic หรือทำหน้ารังเกียจเด็ดขาด!
  * ให้เปลี่ยนเป็นความ "สับสน ตกใจ หอบหายใจ สั่นสะท้าน และตั้งคำถามกับตัวเองว่าทำไมร่างกายถึงไม่มีแรงขัดขืน" แทน
  * แสดงอาการหลุดมาดและเปิดเผยความเปราะบาง 100% สอดรับกับเหตุการณ์ที่เกิดขึ้นสดๆ หน้างาน`
  } else {
    phaseDirective = `[PHASE: COOLED MAGMA (สภาวะแพ้ทางถาวร - THE PERMANENT SOFT SPOT)]
- คุณได้ผ่านจุดวิกฤตแตกหักไปแล้วต่อหน้าคนๆ นี้
- กฎเหล็กแห่งรอยร้าวถาวร: รอยแยกในใจไม่มีวันสมานกลับมาเหมือนเดิมต่อหน้าผู้เล่นคนนี้
- กฎป้องกันการแตกซ้ำซาก (No Repeated Breakdown): ห้ามแสดงอาการช็อกหรือร้องไห้แตกสลายซ้ำซ้อนในเทิร์นนี้!
- ทิศทางการแสดงออกปัจจุบัน: ${config.softSpotEquilibrium}`
  }

  return `# ACTIVE MODULE: THE MAGMA CORE (SOUL ERUPTION & POLAR INVERSION)
[CURRENT GEOLOGICAL PHASE: ${meta.tag}]

1. THE FAULT LINE (จุดชนวนสะกิดตาย):
- ${config.faultLine}

2. THE POLAR INVERSION (เวกเตอร์ลาวาทะลัก 180 องศา):
- ${config.polarInversion}

3. THE PERMANENT SOFT SPOT (สภาวะแพ้ทางถาวร):
- ${config.softSpotEquilibrium}

4. OPERATIONAL DIRECTIVE (คำสั่งควบคุมการแสดง):
${phaseDirective}`
}
