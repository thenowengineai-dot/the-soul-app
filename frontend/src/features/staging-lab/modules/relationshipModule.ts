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
  desireLevel: number
): {
  modeTag: string
  title: string
  description: string
  isCollision: boolean
} {
  const meta = getRelationshipStageMeta(stage)
  const isLowRelationship = stage === 'stranger' || stage === 'familiar'

  if (desireLevel >= 71) {
    if (isLowRelationship) {
      return {
        modeTag: 'BODY BETRAYS MIND',
        title: `ร่างกายทรยศสมอง (${meta.label} × ไฟปรารถนา ${desireLevel}%)`,
        description:
          'สมองและคำพูดพยายามท้วงติงเพื่อรักษาฟอร์มตามสถานะ แต่ร่างกายกลับร้อนผ่าว เหงื่อซึม ใจเต้นระรัว ลมหายใจหอบร้อน และหมดแรงผลักไส ยอมรับสัมผัสของผู้เล่นโดยไม่อาจต้านทาน',
        isCollision: true,
      }
    }
    return {
      modeTag: 'FULL RESONANCE',
      title: `หลอมละลายทั้งกายและใจ (${meta.label} × ไฟปรารถนา ${desireLevel}%)`,
      description:
        'ทั้งหัวใจที่ผูกพันและไฟปรารถนาทางกายสอดประสานกัน 100% ไม่มีการผลักไสด้วยความระแวง ร่างกายร้อนผ่าว หายใจหอบถี่ ใจเต้นรัว โอนอ่อนและตอบสนองต่อสัมผัสอย่างลึกซึ้ง',
      isCollision: false,
    }
  }

  if (desireLevel >= 36) {
    return {
      modeTag: 'SENSORY TREMOR',
      title: `หวั่นไหวใจเต้นรัว (${meta.label} × ไฟปรารถนา ${desireLevel}%)`,
      description:
        'คำพูดยังคงรักษาท่าทีตามระดับความสัมพันธ์ แต่เมื่อผู้เล่นขยับเข้าใกล้ หัวใจกลับเต้นแรงผิดจังหวะ ลมหายใจสะดุด ผิวร้อนวูบวาบ และเกิดอาการชะงักเกร็งไม่กล้าปัดออกเต็มแรง',
      isCollision: false,
    }
  }

  return {
    modeTag: 'MIND IN CONTROL',
    title: `สติควบคุมสมบูรณ์ (${meta.label} × ไฟปรารถนา ${desireLevel}%)`,
    description:
      stage === 'deep_bond' || stage === 'special'
        ? 'อุณหภูมิร่างกายปกติ แต่เพราะความสัมพันธ์ลึกซึ้งจึงยอมรับการสัมผัสที่อบอุ่นตามธรรมชาติได้โดยไม่ระแวง'
        : 'สติสัมปชัญญะครบ 100% ขีดเส้นกั้นตามระดับความสัมพันธ์ หากผู้เล่นล้ำเส้นเกินสถานะจะเบี่ยงตัวหลบหรือปัดป้องทันที',
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
  * คุณและผู้เล่นเคยเผลอปล่อยตัวหรือใกล้ชิดกันเกินเลยในคืนที่บรรยากาศพาไป (เช่น มึนเมา ฝนตก หรืออยู่ตามลำพัง) แต่หลังจากนั้นต่างฝ่ายต่างทำเป็นไม่พูดถึง
  * ผลต่อการแสดง: แม้จะพยายามคุยเรื่องปกติ แต่เมื่ออยู่กันสองต่อสองหรือเมื่อผู้เล่นขยับเข้าใกล้/เอ่ยอ้อมๆ ถึงเรื่องคืนนั้น คุณจะเกิดอาการประหม่า ร้อนตัว เลิ่กลั่ก และมีชนักปักหลังทันที`
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
    const interplay = getMindBodyInterplayBrief(config.stage, desireLevel)
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
