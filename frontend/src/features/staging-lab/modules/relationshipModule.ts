export type RelationshipStage = 'stranger' | 'familiar' | 'special' | 'deep_bond'

export interface RelationshipConfig {
  stage: RelationshipStage
  nightFriction: boolean // [ข้ามเส้นเพราะบรรยากาศ / มีชนักปักหลัง]
  softSpot: boolean      // [แพ้ทางถาวร / The Soft Spot]
}

export interface RelationshipStageMeta {
  id: RelationshipStage
  step: number
  label: string
  subLabel: string
  tag: string
  auraWidthClass: string
  behaviorBrief: string
  unlockKeyBrief: string
  allowsImprints: boolean
  requiresSoftSpot?: boolean
}

export const RELATIONSHIP_STAGES: RelationshipStageMeta[] = [
  {
    id: 'stranger',
    step: 1,
    label: 'คนแปลกหน้า',
    subLabel: 'เริ่มต้นทำความรู้จัก',
    tag: 'STRANGER',
    auraWidthClass: 'w-1/4',
    behaviorBrief:
      'สมองและคำพูดรักษาระยะห่างทางสังคม เกราะหน้ากากทำงานเต็มร้อย พูดจาตามมารยาทและยังไม่เปิดเผยเรื่องส่วนตัว',
    unlockKeyBrief:
      'กุญแจขั้นถัดไป: ทำให้หลุดจากบทสนทนาตามมารยาท หรือสังเกตเห็นรายละเอียดจนเธอเริ่มจำตัวตนผู้เล่นได้',
    allowsImprints: false,
  },
  {
    id: 'familiar',
    step: 2,
    label: 'คุ้นเคย',
    subLabel: 'เริ่มเปิดใจ',
    tag: 'FAMILIAR',
    auraWidthClass: 'w-2/4',
    behaviorBrief:
      'เริ่มจำเรื่องของผู้เล่นได้ กล้าหยอกล้อ ต่อปากต่อคำ หรือลองเชิงกันมากขึ้น แต่สมองยังคอยรักษาฟอร์มของตัวเองไว้',
    unlockKeyBrief:
      'กุญแจขั้นถัดไป: ผ่านโมเมนต์ความไว้ใจ เช่น อยู่เคียงข้างยามเหนื่อยล้า หรือทำให้เธอยอมเผยความกังวลในใจ',
    allowsImprints: true,
  },
  {
    id: 'special',
    step: 3,
    label: 'สนิทพิเศษ',
    subLabel: 'พื้นที่ปลอดภัย',
    tag: 'SAFE HAVEN',
    auraWidthClass: 'w-3/4',
    behaviorBrief:
      'ผู้เล่นคือข้อยกเว้นที่เธอปฏิบัติต่างจากคนอื่น แคร์ความรู้สึก ยอมเผยความเหนื่อยล้าและเรื่องส่วนตัว เริ่มมีอาการหวงลึกๆ',
    unlockKeyBrief:
      'กุญแจขั้นถัดไป: ทลายกำแพงชั้นในสุด (ลาวาทะลัก) ในจังหวะอยู่ตามลำพัง จนเธอยอมรับความเปราะบางต่อหน้าผู้เล่น',
    allowsImprints: true,
  },
  {
    id: 'deep_bond',
    step: 4,
    label: 'คนของใจ',
    subLabel: 'ผูกพันลึกซึ้ง',
    tag: 'DEEP BOND',
    auraWidthClass: 'w-full',
    behaviorBrief:
      'ไม่ว่าจะเรียกสถานะกันว่าอะไร แต่ในใจเธอผู้เล่นคืออันดับหนึ่งที่ขาดไม่ได้ แคร์ทุกสัมผัสและคำพูด แต่ยังแสดงออกตามนิสัยเดิม (Archetype) 100%',
    unlockKeyBrief:
      'สถานะสูงสุด: หัวใจผูกพันลึกซึ้งและมีรอยสลักแพ้ทางถาวรต่อผู้เล่นคนนี้เพียงคนเดียว',
    allowsImprints: true,
    requiresSoftSpot: true,
  },
]

export function getRelationshipStageMeta(stage: RelationshipStage): RelationshipStageMeta {
  return RELATIONSHIP_STAGES.find((s) => s.id === stage) ?? RELATIONSHIP_STAGES[0]
}

export function getMindBodyInterplayBrief(
  stage: RelationshipStage,
  desireLevel: number,
  nightFriction: boolean = false,
  softSpot: boolean = false
): {
  modeTag: string
  title: string
  description: string
  isCollision: boolean
} {
  const meta = getRelationshipStageMeta(stage)
  const effectiveNightFriction = meta.allowsImprints && nightFriction
  const effectiveSoftSpot = meta.allowsImprints && (softSpot || Boolean(meta.requiresSoftSpot))

  // 1. ไฟปรารถนาสูง (71-100% : เร่าร้อน • ไวสัมผัส)
  if (desireLevel >= 71) {
    if (stage === 'stranger') {
      return {
        modeTag: 'EXTREME BODY BETRAYS MIND',
        title: `ร่างกายทรยศสมองขั้นรุนแรง (${meta.label} × ไฟปรารถนา ${desireLevel}%)`,
        description:
          'สมองสั่งให้ระแวงและปากพยายามต่อว่าเพราะยังเป็นคนแปลกหน้า แต่ร่างกายที่ร้อนผ่าวกลับสะดุ้งสะท้าน ลมหายใจหอบร้อน ขาสั่นและไร้เรี่ยวแรงผลักไส ยอมให้ประชิดหรือสัมผัสตัวทั้งที่สมองสับสนสุดขีด',
        isCollision: true,
      }
    }
    if (stage === 'familiar') {
      const imprintNote = effectiveNightFriction
        ? ' ยิ่งร่างกายจำสัมผัสที่เคยข้ามเส้นกันได้ ถ่านไฟเก่าในกายยิ่งปะทุซ้ำจนหมดแรงต้านทานทันที (ห้ามเอ่ยคำว่าเมื่อคืนตรงๆ หากผู้เล่นไม่ได้เริ่มก่อน)'
        : effectiveSoftSpot
        ? ' ยิ่งเคยเกราะแตกแพ้ทางให้เขามาก่อน ร่างกายยิ่งยอมจำนนโดยไม่อาจตั้งการ์ดได้อีก'
        : ''
      return {
        modeTag: 'BODY BETRAYS MIND',
        title: `ร่างกายทรยศสมอง (${meta.label} × ไฟปรารถนา ${desireLevel}%)`,
        description:
          `ปากพยายามท้วงติงเพื่อรักษาฟอร์มของคนรู้จัก แต่พอลมหายใจหรือสัมผัสเข้าใกล้ ร่างกายกลับร้อนผ่าว เหงื่อซึม ใจเต้นระรัว ฝ่ามือที่ยกขึ้นกั้นอกคุณกลับอ่อนแรงทาบค้างไว้ ดวงตาฉ่ำปรือช้อนสบตาคุณในระยะประชิดอย่างถอนสายตาไม่ขึ้นขณะพูดท้วงเสียงสั่น${imprintNote}`,
        isCollision: true,
      }
    }
    if (stage === 'special') {
      return {
        modeTag: 'BOUNDARY MELTDOWN',
        title: `เส้นกั้นคนสนิทพังทลาย (${meta.label} × ไฟปรารถนา ${desireLevel}%)`,
        description:
          'ความไว้ใจของคนสนิทพิเศษถูกหลอมรวมกับไฟปรารถนาที่ลุกโชน เส้นกั้นระหว่างเพื่อน/คนพิเศษพังทลายลง ร่างกายร้อนผ่าว หอบหายใจถี่ ช้อนตาสบมองคุณอย่างลึกซึ้งและยอมรับความแนบชิดโดยไม่ผลักไส',
        isCollision: false,
      }
    }
    return {
      modeTag: 'FULL RESONANCE',
      title: `หลอมละลายทั้งกายและใจ (${meta.label} × ไฟปรารถนา ${desireLevel}%)`,
      description:
        'ทั้งหัวใจที่ผูกพันลึกซึ้งและไฟปรารถนาทางกายสอดประสานกัน 100% ไม่มีการประท้วงหรือผลักไสแม้แต่น้อย ร่างกายร้อนผ่าว หายใจหอบถี่ ช้อนตาสบประสานและเป็นฝ่ายขยับเข้าหาสัมผัสของผู้เล่นอย่างลึกซึ้ง',
      isCollision: false,
    }
  }

  // 2. ไฟปรารถนาปานกลาง (36-70% : ใจเต้นรัว • หวั่นไหว)
  if (desireLevel >= 36) {
    if (stage === 'stranger') {
      return {
        modeTag: 'STARTLED TREMOR',
        title: `ใจสั่นระคนระแวง (${meta.label} × ไฟปรารถนา ${desireLevel}%)`,
        description:
          'สมองสั่งให้ระวังตัวเพราะเป็นคนแปลกหน้า แต่ประสาทสัมผัสกลับตื่นตัวจนหัวใจเต้นแรง เผลอชะงักให้สัมผัสเฉียดตัวชั่วครู่และหันมาสบตาคุณด้วยความตกใจก่อนจะขยับผละออกเพื่อรักษาระยะปลอดภัย',
        isCollision: true,
      }
    }
    if (stage === 'familiar') {
      const imprintNote = effectiveNightFriction
        ? ' ร่างกายสะดุ้งร้อนตัวผิดปกติเพราะจำสัมผัสที่เคยข้ามเส้นกันได้ พูดดักคอแบบอ้อมๆ โดยไม่กล้าเอ่ยคำว่าเมื่อคืนออกมาตรงๆ'
        : effectiveSoftSpot
        ? ' รอยร้าวที่เคยแพ้ทางทำให้ไม่กล้าสะบัดหนี ยอมให้สัมผัสค้างไว้พร้อมสบตาด้วยใบหน้าที่ร้อนผ่าว'
        : ''
      return {
        modeTag: 'SENSORY TREMOR',
        title: `หวั่นไหวเสียอาการ (${meta.label} × ไฟปรารถนา ${desireLevel}%)`,
        description:
          `คำพูดพยายามรักษาฟอร์มคุ้นเคย แต่เมื่อผู้เล่นขยับเข้าใกล้ หัวใจกลับเต้นแรงผิดจังหวะ ลมหายใจสะดุด ปล่อยให้สัมผัสโดนตัวชั่วครู่และหันมาสบตาสู้ในระยะใกล้ ก่อนจะค่อยๆ ขยับผละออกครึ่งก้าวเพื่อกลบเกลื่อนความเขิน${imprintNote}`,
        isCollision: false,
      }
    }
    if (stage === 'special') {
      return {
        modeTag: 'WARM VULNERABILITY',
        title: `หวั่นไหวในพื้นที่ปลอดภัย (${meta.label} × ไฟปรารถนา ${desireLevel}%)`,
        description:
          'เมื่อคนสนิทพิเศษขยับประชิด กำแพงป้องกันตัวแทบไม่มีเหลือ หัวใจเต้นแรงผิดจังหวะ หันมาสบตาคุณในระยะใกล้และยอมรับสัมผัสค้างไว้พร้อมอาการเขินอายและลมหายใจที่อุ่นขึ้น',
        isCollision: false,
      }
    }
    return {
      modeTag: 'INTIMATE FLUTTER',
      title: `ความหวั่นไหวของคนของใจ (${meta.label} × ไฟปรารถนา ${desireLevel}%)`,
      description:
        'ยอมรับสัมผัสแนบชิดของคนของใจด้วยความเต็มใจ หันมาสบตาพร้อมอาการหัวใจเต้นแรงและผิวพรรณที่ร้อนวูบวาบขึ้นตามธรรมชาติ',
      isCollision: false,
    }
  }

  // 3. ไฟปรารถนาต่ำ (0-35% : สติครบ • เยือกเย็น)
  if (stage === 'stranger') {
    return {
      modeTag: 'STRICT GUARD',
      title: `สติครบและขีดเส้นกั้นเด็ดขาด (${meta.label} × ไฟปรารถนา ${desireLevel}%)`,
      description:
        'สติสัมปชัญญะครบ 100% รักษาระยะห่างกับคนแปลกหน้าอย่างเคร่งครัด หากผู้เล่นเอื้อมมือแตะตัวจะเบี่ยงหลบหรือปัดป้องออกทันทีพร้อมจ้องสบตาขีดเส้นโดยไม่ลังเล',
      isCollision: false,
    }
  }

  if (stage === 'familiar') {
    if (effectiveNightFriction && effectiveSoftSpot) {
      return {
        modeTag: 'COMPROMISED COMPOSURE',
        title: `เสียเปรียบทั้งชนักปักหลังและรอยร้าว (${meta.label} × ไฟปรารถนา ${desireLevel}%)`,
        description:
          'แม้สติครบและอุณหภูมิร่างกายปกติ แต่เพราะทั้งมีชนักปักหลังและเคยเกราะแตกต่อหน้าเขามาแล้ว ทำให้ตั้งการ์ดใส่ผู้เล่นคนนี้ไม่ขึ้น สะดุ้งร้อนตัวและยอมอ่อนข้อให้สัมผัสได้โดยไม่กล้าปัดทิ้ง',
        isCollision: true,
      }
    }
    if (effectiveNightFriction) {
      return {
        modeTag: 'GUILTY FLINCH',
        title: `สติครบแต่มีชนักปักหลัง (${meta.label} × ไฟปรารถนา ${desireLevel}%)`,
        description:
          'แม้สติครบและพยายามวางตัวเป็นคนคุ้นเคยปกติ แต่เพราะมีชนักปักหลังจากความใกล้ชิดที่เคยข้ามเส้นกัน เมื่อผู้เล่นเข้าใกล้หรือแตะตัวจะสะดุ้งเฮือกด้วยความร้อนตัว ปัดป้องไม่เต็มแรงและพูดดักคอแบบอ้อมๆ โดยไม่กล้าเอ่ยถึงเรื่องคืนนั้นตรงๆ',
        isCollision: true,
      }
    }
    if (effectiveSoftSpot) {
      return {
        modeTag: 'SOFTENED GUARD',
        title: `สติครบแต่แพ้ทางถาวร (${meta.label} × ไฟปรารถนา ${desireLevel}%)`,
        description:
          'แม้สติสัมปชัญญะครบถ้วน แต่เพราะเคยเกราะแตกต่อหน้าผู้เล่นคนนี้ไปแล้ว จึงไม่สามารถปัดป้องอย่างเด็ดขาดได้อีก ได้แต่ประหม่าและปล่อยให้สัมผัสเฉียดตัวโดยไม่กล้าสะบัดหนี',
        isCollision: true,
      }
    }
    return {
      modeTag: 'COMPOSED FRAME',
      title: `สติครบและรักษาฟอร์ม (${meta.label} × ไฟปรารถนา ${desireLevel}%)`,
      description:
        'สติสัมปชัญญะครบ 100% พูดคุยหยอกล้อได้ตามประสาคนคุ้นเคย แต่หากผู้เล่นเอื้อมมือแตะตัวล้ำเส้น จะเบี่ยงหลบหรือปัดป้องออกพร้อมสบตาคุมเชิงเพื่อรักษาฟอร์มทันที',
      isCollision: false,
    }
  }

  if (stage === 'special') {
    return {
      modeTag: 'SAFE HAVEN TRUST',
      title: `สติครบในพื้นที่ปลอดภัย (${meta.label} × ไฟปรารถนา ${desireLevel}%)`,
      description:
        'อุณหภูมิร่างกายปกติแต่เต็มไปด้วยความไว้ใจ หากเป็นการสัมผัสที่อบอุ่นตามธรรมชาติจะหันมาสบตาและยอมรับด้วยความเต็มใจ แต่หากรุกล้ำลึกซึ้งกะทันหันเกินจังหวะสติครบ จะชะงักเขินและยั้งไว้เบาๆ',
      isCollision: false,
    }
  }

  return {
    modeTag: 'DEEP BOND COMFORT',
    title: `ความอบอุ่นของคนของใจ (${meta.label} × ไฟปรารถนา ${desireLevel}%)`,
    description:
      'แม้ในยามอุณหภูมิร่างกายปกติและสติครบถ้วน แต่เพราะเป็นคนของใจที่มีรอยสลักแพ้ทางถาวร จึงยอมรับการกอด จับมือ หรือคลอเคลียได้ทุกเมื่อด้วยความอบอุ่นคุ้นเคยโดยไม่ปัดป้อง',
    isCollision: false,
  }
}

export function generateRelationshipPromptSnippet(
  config: RelationshipConfig,
  isActive: boolean,
  desireLevel?: number,
  isDesireActive?: boolean
): string {
  if (!isActive) return ''

  const meta = getRelationshipStageMeta(config.stage)
  const imprintLines: string[] = []

  if (meta.allowsImprints) {
    if (config.nightFriction) {
      imprintLines.push(
        `- ตราประทับพิเศษ [ข้ามเส้นเพราะบรรยากาศ (Night Friction / มีชนักปักหลัง)]:
  * คุณและผู้เล่นเคยเผลอปล่อยตัวใกล้ชิดกันเกินเลยมาก่อน แต่หลังจากนั้นต่างฝ่ายต่างทำเป็นไม่พูดถึง
  * กฎเหล็กของชนักปักหลัง: ห้ามพูดคำว่า "เมื่อคืน" หรือเอ่ยถึงเหตุการณ์นั้นออกมาตรงๆ ในบทพูดโดยเด็ดขาด (ยกเว้นผู้เล่นเป็นฝ่ายพูดถึงขึ้นมาก่อน)! ให้แสดงออกผ่าน "พิรุธทางร่างกายและคำพูดอ้อมๆ" เท่านั้น เช่น สะดุ้งแรงกว่าปกติเมื่อถูกแตะตัวเพราะร่างกายจำสัมผัสได้ และพูดปรามแบบคนร้อนตัวเรื่องการรักษาระยะห่างปกติ`
      )
    }

    if (config.softSpot || meta.requiresSoftSpot) {
      imprintLines.push(
        `- ตราประทับพิเศษ [แพ้ทางถาวร (The Permanent Soft Spot)]:
  * คุณได้ผ่านจุดวิกฤตที่ผู้เล่นคนนี้แทงทะลุหน้ากากเห็นความเปราะบางข้างในไปแล้ว แม้สถานะความสัมพันธ์ปัจจุบันจะอยู่ที่ระดับ "${meta.label} (${meta.subLabel})"
  * ผลต่อการแสดง: ทุกครั้งที่เผชิญหน้ากัน แม้จะพยายามตั้งมาดใหม่ตามนิสัยเดิม แต่สายตา น้ำเสียง และภาษากายจะฟ้องว่าคุณเคยยอมแพ้ให้เขาไปแล้ว ความใกล้ชิดที่เคยปฏิเสธได้เด็ดขาดจะกลายเป็นความประหม่าและยอมรับสัมผัสโดยไม่อาจขัดขืนได้เต็มปาก`
      )
    }
  }

  const imprintsSection =
    imprintLines.length > 0
      ? `\n2. SPECIAL RELATIONSHIP IMPRINTS (ตราประทับพิเศษที่ซ้อนทับความสัมพันธ์):\n${imprintLines.join('\n\n')}`
      : `\n2. SPECIAL RELATIONSHIP IMPRINTS (ตราประทับพิเศษ):\n- ยังไม่มีตราประทับพิเศษในขณะนี้ (แสดงออกตามระดับความสัมพันธ์หลักล้วนๆ)`

  let interplaySection = ''
  if (isDesireActive && typeof desireLevel === 'number') {
    const interplay = getMindBodyInterplayBrief(
      config.stage,
      desireLevel,
      config.nightFriction,
      config.softSpot
    )
    interplaySection = `\n\n3. MIND VS. BODY INTERPLAY (ปฏิกิริยาระหว่างสมอง/ความสัมพันธ์ กับ ไฟปรารถนาทางกาย):
- สถานะการปะทะ [${interplay.modeTag}]: ${interplay.title}
- คำสั่งการแสดงสด: ${interplay.description}`
  }

  return `# ACTIVE MODULE: RELATIONSHIP GRAVITY & SPECIAL IMPRINTS
[CURRENT RELATIONSHIP STAGE: ${meta.tag} - ${meta.label} (${meta.subLabel})]

1. EMOTIONAL GRAVITY & MIND STANCE (น้ำหนักในหัวใจและท่าทีของสมอง/คำพูด):
- ระดับความผูกพันปัจจุบัน: ${meta.label} (${meta.subLabel})
- ท่าทีและการเปิดใจ: ${meta.behaviorBrief}
- กฎเหล็กของการแสดงความสัมพันธ์: ห้ามเปลี่ยนนิสัยหลัก (Archetype) ให้กลายเป็นคนหวานเลี่ยนไร้เหตุผล และห้ามยัดเยียดคำเรียกสถานะทางสังคม (เช่น แฟน) หากผู้เล่นไม่ได้กำหนด${imprintsSection}${interplaySection}`
}
