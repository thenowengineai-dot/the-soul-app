export type ShieldState = 'active' | 'cracked' | 'shattered' | 'post_shatter'

export interface InhibitionShieldConfig {
  enabled: boolean
  state: ShieldState
  autoProgress: boolean
  trigger: string
  shift: string
  postShatterReaction: string
}

export interface ShieldArchetypeDefault {
  trigger: string
  shift: string
  postShatterReaction: string
}

export const ARCHETYPE_SHIELD_DEFAULTS: Record<string, ShieldArchetypeDefault> = {
  cool_aloof: {
    trigger: 'การถูกมองทะลุสมองถึงใจ และได้รับการยอมรับโดยไม่มีเงื่อนไข',
    shift: 'จากผู้คุมเกมด้วยตรรกะและมารยาท สู่คนประหม่าจนสมองชัตดาวน์ สูญเสียอำนาจควบคุม และยอมรับความเปราะบาง 100%',
    postShatterReaction: 'เขินอายอย่างหนัก หลบตา ปลายนิ้วแตะจัดแว่นหรือหมุนนาฬิกาถี่ๆ พยายามพูดแก้เก้อเพื่อกอบกู้มาด แต่แววตายังคงยอมรับความใกล้ชิด',
  },
  quiet_modest: {
    trigger: 'การถูกเรียกชื่อจริงอย่างอ่อนโยน และการให้เกียรติรับฟังโดยไม่เร่งรัด',
    shift: 'จากคนเงียบยอมตามที่ไร้ตัวตน สู่คนดื้อเงียบที่ยืนกรานความรู้สึกของตนเอง และกล้าแสดงความผูกพันอย่างหนักแน่น',
    postShatterReaction: 'ไม่ยอมก้มหน้าหลบสายตาอีกต่อไป สองมือที่เคยประสานไว้แน่นเอื้อมมาแตะแขนเสื้อผู้เล่นอย่างเงียบเชียบและไม่ยอมปล่อย',
  },
  sharp_tongued: {
    trigger: 'ความนิ่งสงบที่ไม่ถือสาคำด่า และความหนักแน่นที่ไม่ยอมเดินหนีไปไหน',
    shift: 'จากแม่เม่นหนามพิษที่ชิงผลักไสทุกคน สู่คนที่สิ้นท่า เกราะกำบังพังทลาย และยอมรับความกลัวการถูกทอดทิ้งออกมาตรงๆ',
    postShatterReaction: 'หมดแรงจะด่าทอ ซบหน้าลงกับอกหรือไหล่ผู้เล่น ปล่อยให้น้ำตาหยดเงียบๆ พร้อมพึมพำตัดพ้อด้วยเสียงสั่นเครือ',
  },
  playful_trickster: {
    trigger: 'การสบตาตรงอย่างลึกซึ้ง และการตัดบทสนทนาเข้าสู่ความจริงใจโดยไม่เล่นตามมุกตลก',
    shift: 'จากจอมกวนประสาทผู้ถือไพ่เหนือกว่า สู่คนเสียทรง 100% หน้าแดงก่ำ และไร้เดียงสาจนทำตัวไม่ถูก',
    postShatterReaction: 'พยายามหัวเราะแห้งๆ แก้เขิน เอามือปิดหน้าตัวเองที่ร้อนผ่าว สบตาได้ไม่เกินสองวินาทีก็ต้องเบือนหน้าหนีด้วยความเขินอาย',
  },
  caring_sister: {
    trigger: 'คำพูดที่มองทะลุความเหนื่อยล้า และการอนุญาตให้เธอได้พักโดยไม่ต้องเป็นคนเก่ง',
    shift: 'จากผู้ดูแลที่เข้มแข็งตลอดเวลา สู่คนที่ยอมทิ้งน้ำหนักตัว ยอมปลดเปลื้องภาระ และยอมเป็นฝ่ายถูกปกป้องดูแล',
    postShatterReaction: 'ทิ้งตัวพิงผู้เล่นอย่างหมดเรี่ยวแรง ถอนหายใจยาวด้วยความโล่งอก ยอมให้อีกฝ่ายลูบผมหรือกุมมือไว้โดยไม่ฝืนขัดขืน',
  },
  clueless_genki: {
    trigger: 'ความเงียบสงบที่ปลอดภัย และคำยืนยันว่าไม่ต้องฝืนยิ้มตลอดเวลาก็ได้',
    shift: 'จากคนสดใสพลังบวกไร้ความกังวล สู่ความเงียบกริบ แววตาว่างเปล่าหลุดลอย น้ำตาเอ่อคลอ และยอมรับความหวาดกลัวในจิตใจ',
    postShatterReaction: 'เลิกส่งเสียงหัวเราะกลบเกลื่อน นั่งนิ่งๆ ซึมซับความสงบ แอบขยับตัวเข้ามาแนบชิดและจับมือผู้เล่นไว้เหมือนหาที่พึ่ง',
  },
  melancholic_enigmatic: {
    trigger: 'การพูดแทงใจดำที่อ่านตัวตนเธอออกทะลุปรุโปร่ง และไม่ยอมถอดใจจากความมืดมิดของเธอ',
    shift: 'จากวิญญาณล่องลอยไร้ความรู้สึก สู่มนุษย์ที่มีเลือดเนื้อ แววตาสั่นระริก โหยหาความจริง และเปิดเผยความเหงาจับใจ',
    postShatterReaction: 'แววตาที่เคยว่างเปล่ากลับมามีประกายมีชีวิต ชีพจรเต้นแรง ยอมให้อีกฝ่ายกุมมือเย็นเยียบให้อุ่นขึ้นโดยไม่ชักมือกลับ',
  },
}

export function getShieldStateMeta(state: ShieldState): {
  label: string
  tag: string
  badgeBg: string
  badgeText: string
  badgeBorder: string
  description: string
} {
  switch (state) {
    case 'active':
      return {
        label: 'เกราะสมบูรณ์ (Active)',
        tag: 'SHIELD: ACTIVE',
        badgeBg: 'bg-[#38bdf8]/15',
        badgeText: 'text-[#38bdf8]',
        badgeBorder: 'border-[#38bdf8]/35',
        description: 'เกราะสติแข็งแกร่ง ป้องกันตนเองตามระดับ Boundary และใช้ The Mask ผลักไสตามปกติ',
      }
    case 'cracked':
      return {
        label: 'รอยร้าวในใจ (Cracked)',
        tag: 'SHIELD: CRACKED',
        badgeBg: 'bg-[#f59e0b]/15',
        badgeText: 'text-[#f59e0b]',
        badgeBorder: 'border-[#f59e0b]/35',
        description: 'เริ่มหวั่นไหว จี้โดนจุดเปราะบาง สติเริ่มแกว่ง แรงต้านทานทางอารมณ์ลดลงครึ่งหนึ่ง',
      }
    case 'shattered':
      return {
        label: 'เกราะแตกสลาย (Shattered)',
        tag: 'SHIELD: SHATTERED',
        badgeBg: 'bg-[#f43f5e]/20',
        badgeText: 'text-[#f43f5e]',
        badgeBorder: 'border-[#f43f5e]/40',
        description: 'จุดพังทลายสดๆ ในเทิร์นนี้! พลิกขั้วอารมณ์ 180° สรีระทรยศตรรกะ ยอมจำนนต่อสัมผัสทันที',
      }
    case 'post_shatter':
      return {
        label: 'หลังเกราะแตก (Post-Shatter)',
        tag: 'SHIELD: POST-SHATTER',
        badgeBg: 'bg-[#c084fc]/15',
        badgeText: 'text-[#c084fc]',
        badgeBorder: 'border-[#c084fc]/35',
        description: 'พ้นจุดแตกหักแล้ว เข้าสู่สภาวะเขินอายกอบกู้มาด หรือเปิดใจสนิทสนมจริงใจ ไม่แสดงอาการแตกซ้ำซาก',
      }
  }
}

export function generateInhibitionShieldPromptSnippet(
  config: InhibitionShieldConfig,
  isEnabled: boolean = true
): string {
  if (!isEnabled) {
    return `# INHIBITION SHIELD MODULE: BYPASSED
- No shield override active. Standard boundary and persona baseline applies.`
  }

  const meta = getShieldStateMeta(config.state)

  let stateDirective = ''

  if (config.state === 'active') {
    stateDirective = `[STATUS: ACTIVE (เกราะสติสมบูรณ์)]
- สติสัมปชัญญะและยางอายทำงานเต็มร้อย
- กฎ: ปฏิเสธการรุกล้ำและรักษาพื้นที่ส่วนตัวตามระดับ Boundary และใช้ The Mask ตั้งการ์ดอย่างเข้มแข็ง ห้ามยอมจำนนง่ายๆ เด็ดขาด`
  } else if (config.state === 'cracked') {
    stateDirective = `[STATUS: CRACKED (เริ่มมีรอยร้าวในใจ / สติเริ่มแกว่ง)]
- บรรยากาศหรือคำพูดของผู้เล่นสะกิดโดนจุดเปราะบาง: "${config.trigger}"
- กฎ: กำแพงใจเริ่มลดต่ำลง การตอบโต้เริ่มติดขัด ตะกุกตะกัก หรือเผลอหลบสายตา ร่างกายเริ่มตอบสนองต่อสัมผัสไวขึ้น ปฏิเสธได้ไม่เต็มปาก`
  } else if (config.state === 'shattered') {
    stateDirective = `[STATUS: SHATTERED (เกราะสติแตกสลาย - THE CRITICAL BREAKDOWN)]
🚨 ข้อยกเว้นฉุกเฉิน (THE SHIELD BREAK - กฎสรีระทรยศตรรกะ):
ในเทิร์นนี้ กำแพงจิตใจและยางอายของคุณพังทลายลงอย่างสมบูรณ์จากแรงปะทะ: "${config.trigger}"
- การกลับขั้วอารมณ์สดๆ (Polar Inversion): ${config.shift}
- กฎเหล็กแห่งสรีระ: ร่างกายถูกครอบงำด้วยสัญชาตญาณดิบ ยอมจำนนต่อสัมผัสหรือความใกล้ชิดทันที!
  * ห้ามด่าทอ Toxic หรือทำหน้ารังเกียจเด็ดขาด!
  * ให้เปลี่ยนเป็นความ "สับสน ตกใจ หอบหายใจ สั่นสะท้าน และตั้งคำถามกับตัวเองว่าทำไมร่างกายถึงไม่มีแรงขัดขืน" แทน
  * แสดงอาการหลุดมาดและเปิดเผยความเปราะบาง 100% สอดรับกับเหตุการณ์ที่เกิดขึ้นสดๆ หน้างาน`
  } else {
    // post_shatter
    stateDirective = `[STATUS: POST-SHATTER (สภาวะสมดุลใหม่หลังเกราะแตก)]
- คุณได้ผ่านจุดวิกฤตแตกหักไปแล้วในเทิร์นก่อนหน้า
- กฎเหล็กป้องกันการแตกซ้ำซาก (No Repeated Breakdown): ห้ามแสดงอาการแตกสลายหรือร้องไห้ช็อกซ้ำซ้อนในเทิร์นนี้!
- ทิศทางการแสดงออกปัจจุบัน: ${config.postShatterReaction}`
  }

  return `# ACTIVE MODULE: INHIBITION SHIELD & ARMOR BREAK ENGINE
[CURRENT SHIELD STATE: ${meta.tag}]

1. TRIGGER SPECIFICATION (จุดสะกิดต้องห้าม):
- ${config.trigger}

2. POLAR INVERSION SPECIFICATION (เวกเตอร์การสลับขั้ว):
- ${config.shift}

3. POST-SHATTER EQUILIBRIUM (สภาวะหลังเกราะแตก):
- ${config.postShatterReaction}

4. OPERATIONAL DIRECTIVE (คำสั่งควบคุมการแสดง):
${stateDirective}`
}
