import {
  type RelationshipConfig,
  getRelationshipStageMeta,
} from './relationshipModule'

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
        'ลมหายใจนิ่ง สติสัมปชัญญะครบถ้วน ขีดเส้นกั้นตามระดับความสัมพันธ์ หากผู้เล่นล้ำเส้นเกินสถานะ จะเบี่ยงตัวหลบหรือปัดมือออกทันที',
    }
  }
  if (posture === 'hesitant') {
    return {
      badge: 'หวั่นไหว / ใจเต้นรัว (Warming & Racing Heart)',
      stageName: 'WARMING (ใจเต้นรัว)',
      sensoryHeat:
        'หัวใจเต้นแรงผิดจังหวะ ลมหายใจสะดุดเมื่ออยู่ใกล้ ผิวร้อนวูบวาบ ลังเลที่จะปัดป้อง',
      brief:
        'หัวใจเต้นแรงผิดจังหวะ ลมหายใจสะดุด ผิวพรรณไวต่อไออุ่นและระยะใกล้ชิด เริ่มลังเลที่จะปัดป้อง ยอมให้แตะตัวหรือขยับเข้าใกล้โดยร่างกายชะงักเกร็งด้วยความตื่นเต้น',
    }
  }
  return {
    badge: 'เร่าร้อน / ไวสัมผัสขั้นสุด (Burning & Sweaty Heat)',
    stageName: 'BURNING (เร่าร้อน)',
    sensoryHeat:
      'ไฟปรารถนาลุกโชน ร่างกายร้อนผ่าว เหงื่อซึมตามไรผมและลำคอ ลมหายใจหอบร้อน ใจเต้นระรัวจนอกกระเพื่อม ไวต่อทุกสัมผัสและลมหายใจ เรี่ยวแรงที่จะผลักไสละลายหายไป',
    brief:
      'ไฟปรารถนาลุกโชน ร่างกายร้อนผ่าว เหงื่อซึมตามไรผมและลำคอ ลมหายใจหอบร้อน ใจเต้นระรัว ประสาทสัมผัสไวต่อทุกการเคลื่อนไหว เรี่ยวแรงที่จะผลักไสละลายหายไป ยอมให้กอดแนบชิดหรือสัมผัสลึกซึ้ง',
  }
}

export function generateDesirePromptSnippet(
  boundaryLevel: number,
  isActive: boolean = true
): string {
  if (!isActive) return ''
  const posture = getBoundaryPosture(boundaryLevel)
  const briefInfo = getBoundaryBrief(boundaryLevel)

  let levelLabel = `Composed (${boundaryLevel}% - สติครบ • เยือกเย็น)`
  if (posture === 'hesitant') {
    levelLabel = `Warming (${boundaryLevel}% - ใจเต้นรัว • หวั่นไหว)`
  } else if (posture === 'open') {
    levelLabel = `Burning (${boundaryLevel}% - เร่าร้อน • ไวสัมผัส)`
  }

  return `# ACTIVE MODULE: DESIRE & SENSORY HEAT (SOMATIC TEMPERATURE & PULSE)
- Desire & Sensory Heat Level: ${levelLabel}
- Somatic Temperature & Pulse: ${briefInfo.sensoryHeat}
- Somatic Expression Directive: แสดงอาการทางสรีระ ลมหายใจ และชีพจรตามระดับไฟปรารถนานี้ตลอดการสนทนาและการเคลื่อนไหว`
}

export function resolveTouchReflexDirective(
  spacing: SpatialSpacing,
  boundaryLevel: number,
  relationshipConfig?: RelationshipConfig,
  isRelationshipActive: boolean = true
): {
  boundaryDesc: string
  touchDirective: string
  expectedVerdict: 'MISSED' | 'PARRIED' | 'GRAZED' | 'LATCHED'
} {
  const posture = getBoundaryPosture(boundaryLevel)
  const stage = isRelationshipActive && relationshipConfig ? relationshipConfig.stage : 'familiar'
  const meta = getRelationshipStageMeta(stage)
  const hasNightFriction = Boolean(
    isRelationshipActive &&
      relationshipConfig &&
      meta.allowsImprints &&
      !meta.requiresSoftSpot &&
      relationshipConfig.nightFriction
  )
  const hasSoftSpot = Boolean(
    isRelationshipActive &&
      relationshipConfig &&
      meta.allowsImprints &&
      (relationshipConfig.softSpot || meta.requiresSoftSpot)
  )

  let boundaryDesc = `Composed (${boundaryLevel}% - สติครบ • เยือกเย็น)`
  if (posture === 'hesitant') {
    boundaryDesc = `Warming (${boundaryLevel}% - ใจเต้นรัว • หวั่นไหว)`
  } else if (posture === 'open') {
    boundaryDesc = `Burning (${boundaryLevel}% - เร่าร้อน • ไวสัมผัส)`
  }

  // กฎข้อที่ 1: ถ้ายืนห่าง 2-3 ก้าว (Distant) กฎฟิสิกส์ชนะทุกอย่าง -> เอื้อมไม่ถึง (MISSED) เสมอ
  if (spacing === 'distant') {
    return {
      boundaryDesc,
      touchDirective:
        'ผู้เล่นยืนอยู่นอกระยะเอื้อม! หากผู้เล่นแค่พูดคุย ให้โต้ตอบตามปกติโดยรักษาระยะห่าง (ZERO CONTACT) แต่หากผู้เล่นพยายามเอื้อมมือจับหรือแตะตัวจากระยะนี้ มือจะตัดผ่านอากาศธาตุ คว้าไม่ได้แม้แต่ปลายนิ้ว! บังคับผลลัพธ์เป็นวืด (MISSED) และห้ามเกิดการสัมผัสตัวเด็ดขาด 100%',
      expectedVerdict: 'MISSED',
    }
  }

  // กฎข้อที่ 2: เมื่ออยู่ในระยะเอื้อมถึง (Reach / Intimate) คำนวณจาก ความสัมพันธ์ × ตราประทับ × ไฟปรารถนา
  // --- กรณีไฟปรารถนา 90% (Burning / Open) ---
  if (posture === 'open') {
    if (stage === 'stranger') {
      return {
        boundaryDesc,
        touchDirective:
          '[สภาวะร่างกายทรยศสมองขั้นรุนแรง - EXTREME BODY BETRAYS MIND] หากผู้เล่นแค่พูดคุย ให้แสดงอาการหอบหายใจตัวร้อนและพยายามรักษาท่าทีระแวง แต่หากผู้เล่นเอื้อมมือแตะหรือเข้าประชิด ปากจะพยายามต่อว่าเพราะยังเป็นคนแปลกหน้า แต่ร่างกายที่ร้อนผ่าวกลับสะดุ้งสะท้าน ขาสั่นไร้เรี่ยวแรงผลักไส ดวงตาสั่นระริกช้อนสบตาคุณในระยะประชิดทั้งที่สมองสับสนสุดขีด (LATCHED)',
        expectedVerdict: 'LATCHED',
      }
    }
    if (stage === 'familiar') {
      const imprintNote =
        hasNightFriction && hasSoftSpot
          ? ' (ยิ่งทั้งร่างกายจำสัมผัสที่เคยข้ามเส้นได้แม่นยำ และหัวใจเคยเกราะแตกแพ้ทางให้เขามาก่อน กำแพงต่อต้านยิ่งพังทลายตั้งแต่วินาทีแรกจนจำนนหมดทางหนี แต่ห้ามเอ่ยคำว่า "เมื่อคืน" ออกมาตรงๆ หากผู้เล่นไม่ได้พูดก่อน)'
          : hasNightFriction
          ? ' (ร่างกายจำสัมผัสคุ้นเคยได้จนถ่านไฟเก่าปะทุซ้ำหมดแรงต้านทันที แต่ห้ามเอ่ยคำว่า "เมื่อคืน" ออกมาตรงๆ หากผู้เล่นไม่ได้พูดก่อน)'
          : hasSoftSpot
          ? ' (ยิ่งเคยเกราะแตกแพ้ทางให้เขามาก่อน ร่างกายยิ่งยอมจำนนโดยไม่อาจตั้งการ์ดได้อีก)'
          : ''
      return {
        boundaryDesc,
        touchDirective:
          `[สภาวะร่างกายทรยศสมอง - BODY BETRAYS MIND] หากผู้เล่นแค่พูดคุย ให้แสดงอาการใจเต้นแรงและลมหายใจร้อนผ่าว แต่หากผู้เล่นเอื้อมมือแตะหรือเข้าประชิด สมองและคำพูดจะพยายามท้วงติงเพื่อรักษาฟอร์มของคนรู้จัก ทว่าสัญญาณร่างกายกลับสะดุ้งสะท้าน เหงื่อซึม กล้ามเนื้อสูญเสียแรงต้านทานโดยสิ้นเชิง การพยายามตั้งการ์ดกั้นระยะล้มเหลวกลางคัน ร่างกายโอนอ่อนตามทิศทางสัมผัสจริงของผู้เล่น ดวงตาฉ่ำปรือช้อนสบตาคุณในระยะลมหายใจรดกันอย่างถอนสายตาไม่ขึ้นขณะพูดท้วงเสียงสั่น (LATCHED)${imprintNote}`,
        expectedVerdict: 'LATCHED',
      }
    }
    if (stage === 'special') {
      const specialImprintNote = hasNightFriction
        ? ' (ยิ่งเคยเผลอข้ามเส้นความเป็นคนสนิทกันมาก่อน ถ่านไฟในกายยิ่งลุกโชนจนไร้แรงต้านทานตั้งแต่วินาทีแรก แต่ห้ามเอ่ยคำว่า "เมื่อคืน" ออกมาตรงๆ หากผู้เล่นไม่ได้พูดก่อน)'
        : ''
      return {
        boundaryDesc,
        touchDirective:
          `[เส้นกั้นคนสนิทพังทลาย - BOUNDARY MELTDOWN] ความไว้ใจของคนสนิทพิเศษหลอมรวมกับไฟปรารถนาที่ลุกโชน หากผู้เล่นเอื้อมสัมผัสหรือกอดประชิด เส้นกั้นความเป็นเพื่อน/คนสนิทจะพังทลายลง ร่างกายร้อนผ่าว หอบหายใจถี่ ช้อนตาสบมองคุณอย่างลึกซึ้งและยอมรับความแนบชิดโดยไม่ผลักไส (LATCHED)${specialImprintNote}`,
        expectedVerdict: 'LATCHED',
      }
    }
    return {
      boundaryDesc,
      touchDirective:
        '[สภาวะหลอมละลายทั้งกายและใจ - FULL RESONANCE] ทั้งหัวใจที่ผูกพันระดับคนของใจและไฟปรารถนาที่ลุกโชนสอดประสานกัน 100% หากผู้เล่นเอื้อมสัมผัสหรือกอดประชิด จะไม่มีการประท้วงหรือผลักไสแม้แต่น้อย ร่างกายร้อนผ่าว หอบหายใจถี่ ช้อนตาสบประสานและขยับเบียดกายตอบรับสัมผัสของผู้เล่นอย่างโอนอ่อนลึกซึ้ง (LATCHED)',
      expectedVerdict: 'LATCHED',
    }
  }

  // --- กรณีไฟปรารถนา 50% (Warming / Hesitant) ---
  if (posture === 'hesitant') {
    if (stage === 'stranger') {
      return {
        boundaryDesc,
        touchDirective:
          'สมองสั่งให้ระวังตัวเพราะเป็นคนแปลกหน้า แต่ประสาทสัมผัสตื่นตัวจนใจเต้นแรง หากผู้เล่นแค่พูดคุย ให้รักษาระยะ แต่หากผู้เล่นเอื้อมมาสัมผัส จะเผลอชะงักให้สัมผัสเฉียดโดนตัวชั่วครู่ด้วยความตื่นเต้น หันขวับมาสบตาคุณด้วยแววตาสั่นไหวก่อนจะรีบขยับผละออกเพื่อรักษาความปลอดภัย (GRAZED)',
        expectedVerdict: 'GRAZED',
      }
    }
    if (stage === 'familiar') {
      if (hasNightFriction && hasSoftSpot) {
        return {
          boundaryDesc,
          touchDirective:
            'ทั้งความหวั่นไหว ชนักปักหลังที่ร่างกายจำสัมผัสได้ และความแพ้ทางในใจทำงานซ้อนทับกัน หากผู้เล่นเอื้อมมาสัมผัสหรือขยับประชิด จังหวะแรกร่างกายจะสะดุ้งวูบและหัวใจเต้นรัวแรงด้วยความร้อนตัว ตั้งท่าจะขยับหนีเพื่อรักษาฟอร์ม แต่พอหันมาสบตาเห็นว่าเป็นเขา เรี่ยวแรงต่อต้านกลับฝ่อลงกลางคัน ไม่กล้าสะบัดหนี ยอมรับสัมผัสค้างไว้พร้อมใบหน้าร้อนผ่าวและพูดท้วงเบาๆ อย่างคนจนมุมทั้งกายและใจ (LATCHED - ห้ามพูดคำว่าเมื่อคืนตรงๆ หากผู้เล่นไม่ได้เริ่มก่อน)',
          expectedVerdict: 'LATCHED',
        }
      }
      if (hasSoftSpot) {
        return {
          boundaryDesc,
          touchDirective:
            'ด้วยความหวั่นไหวบวกกับรอยร้าวที่เคยแพ้ทางถาวร หากผู้เล่นเอื้อมมาสัมผัส ร่างกายจะชะงักเกร็ง ใจเต้นรัว แรงต้านทานลดต่ำลงจนไม่กล้าสะบัดหนี ยอมรับสัมผัสค้างไว้พร้อมช้อนตาสบมองคุณด้วยใบหน้าที่ร้อนผ่าวขณะพูด (LATCHED)',
          expectedVerdict: 'LATCHED',
        }
      }
      const nightNote = hasNightFriction
        ? ' ร่างกายสะดุ้งร้อนตัวผิดปกติเพราะจำสัมผัสที่เคยข้ามเส้นกันได้ (แสดงความประหม่าและพูดอ้อมๆ แบบคนมีชนักปักหลัง ห้ามพูดคำว่า "เมื่อคืน" ออกมาตรงๆ หากผู้เล่นไม่ได้เอ่ยถึงก่อน)'
        : ''
      return {
        boundaryDesc,
        touchDirective:
          `สมองพยายามรักษาฟอร์มคนคุ้นเคย แต่ร่างกายเริ่มหวั่นไหวและใจเต้นแรง หากผู้เล่นเอื้อมมาสัมผัสหรือขยับประชิด จะเกิดอาการชะงักเกร็ง (Hesitation Lag) ปล่อยให้สัมผัสโดนตัวชั่วครู่ หันมาสบตาสู้ในระยะใกล้แต่สายตาแกว่ง ก่อนจะค่อยๆ ขยับตัวคลายระยะห่างออกเล็กน้อยเพื่อเว้นจังหวะหายใจและกลบเกลื่อนความเขิน (GRAZED)${nightNote}`,
        expectedVerdict: 'GRAZED',
      }
    }
    if (stage === 'special') {
      const specialNightNote = hasNightFriction
        ? ' (ยิ่งมีชนักปักหลังจากคืนที่เคยเผลอข้ามเส้นความเป็นคนสนิท ร่างกายยิ่งสะดุ้งเขินร้อนตัวและพูดท้วงเบาๆ แบบไม่กล้าเอ่ยถึงคืนนั้นตรงๆ)'
        : ''
      return {
        boundaryDesc,
        touchDirective:
          `ทั้งความผูกพันระดับ${meta.label}และอาการใจเต้นรัวทำงานเสริมกัน หากผู้เล่นเอื้อมมาสัมผัส ร่างกายจะชะงักเกร็งเล็กน้อยด้วยความเขินอายและตื่นเต้น หัวใจเต้นแรง หันมาสบตาคุณในระยะใกล้และยอมรับสัมผัสโดยไม่ผละหนี (LATCHED)${specialNightNote}`,
        expectedVerdict: 'LATCHED',
      }
    }
    // deep_bond ที่ 50%
    return {
      boundaryDesc,
      touchDirective:
        `ทั้งความผูกพันระดับ${meta.label}และอาการใจเต้นรัวทำงานเสริมกัน หากผู้เล่นเอื้อมมาสัมผัส ร่างกายจะชะงักเกร็งเล็กน้อยด้วยความเขินอายและตื่นเต้น หัวใจเต้นแรง หันมาสบตาคุณในระยะใกล้และยอมรับสัมผัสโดยไม่ผละหนี (LATCHED)`,
      expectedVerdict: 'LATCHED',
    }
  }

  // --- กรณีไฟปรารถนา 10% (Composed / Guarded) ---
  if (stage === 'stranger') {
    return {
      boundaryDesc,
      touchDirective:
        'สติสัมปชัญญะครบ 100% และยังเป็นคนแปลกหน้า หากผู้เล่นแค่พูดคุย ให้โต้ตอบตามมารยาทและนิสัย (ZERO CONTACT) แต่หากผู้เล่นเอื้อมมือมาแตะตัวหรือล้ำเส้น ไม่อนุญาตให้สัมผัสเด็ดขาด! ให้เบี่ยงตัวหลบหรือปัดป้องออกก่อนถึงตัวพร้อมจ้องสบตาขีดเส้นทันที (PARRIED)',
      expectedVerdict: 'PARRIED',
    }
  }

  if (stage === 'familiar') {
    if (hasNightFriction && hasSoftSpot) {
      return {
        boundaryDesc,
        touchDirective:
          'แม้อุณหภูมิร่างกายปกติและสติครบ แต่เพราะทั้งมีชนักปักหลังจากความใกล้ชิดที่เคยข้ามเส้น และเคยเกราะแตกแพ้ทางให้ผู้เล่นคนนี้มาแล้ว หากผู้เล่นเอื้อมมือมาแตะตัว จังหวะแรกจะสะดุ้งร้อนตัวตั้งท่าจะกั้นระยะ แต่พอสบตาเขากลับปัดป้องไม่ลง ได้แต่ยอมอ่อนข้อให้สัมผัสค้างไว้พร้อมพูดท้วงเสียงอ่อนอย่างประหม่า (LATCHED - ห้ามพูดคำว่าเมื่อคืนตรงๆ หากผู้เล่นไม่ได้เริ่มก่อน)',
        expectedVerdict: 'LATCHED',
      }
    }
    if (hasNightFriction) {
      return {
        boundaryDesc,
        touchDirective:
          'แม้สติครบและพยายามวางตัวเป็นคนคุ้นเคยปกติ แต่เพราะมีชนักปักหลังจากความใกล้ชิดที่เคยข้ามเส้นกัน หากผู้เล่นเอื้อมมือมาแตะตัวหรือขยับประชิด จะสะดุ้งเฮือกด้วยความร้อนตัว ปัดป้องไม่เต็มแรง สัมผัสเฉียดตัวแล้วชะงักผละออกพร้อมพูดดักคอแบบอ้อมๆ โดยห้ามเอ่ยคำว่า "เมื่อคืน" ออกมาตรงๆ หากผู้เล่นไม่ได้พูดก่อน (GRAZED)',
        expectedVerdict: 'GRAZED',
      }
    }
    if (hasSoftSpot) {
      return {
        boundaryDesc,
        touchDirective:
          'แม้สติสัมปชัญญะครบถ้วน แต่เพราะเคยเกราะแตกแพ้ทางถาวรต่อหน้าผู้เล่นคนนี้ไปแล้ว หากผู้เล่นเอื้อมมาแตะตัว จะไม่สามารถปัดป้องอย่างเด็ดขาดได้อีก ได้แต่ประหม่าเสียทรงและปล่อยให้สัมผัสเฉียดตัวก่อนขยับตัวเว้นระยะออกเล็กน้อยแบบไม่กล้าสะบัดหนี (GRAZED)',
        expectedVerdict: 'GRAZED',
      }
    }
    return {
      boundaryDesc,
      touchDirective:
        'สติสัมปชัญญะครบ 100% และอยู่ในสถานะคนคุ้นเคย หากผู้เล่นแค่พูดคุย ให้โต้ตอบตามปกติ (ZERO CONTACT) แต่หากผู้เล่นเอื้อมมือมาแตะตัวล้ำเส้น ให้เบี่ยงตัวหลบหรือปัดป้องออกเพื่อรักษาฟอร์มทันที (PARRIED)',
      expectedVerdict: 'PARRIED',
    }
  }

  if (stage === 'special') {
    const specialNightNote = hasNightFriction
      ? ' (แต่เพราะมีชนักปักหลังจากคืนที่เคยข้ามเส้นความเป็นคนสนิท หากผู้เล่นขยับประชิดแบบคนรักจะสะดุ้งร้อนตัวแรงกว่าปกติและพูดท้วงแบบเขินอายโดยห้ามพูดคำว่าเมื่อคืนก่อน)'
      : ''
    return {
      boundaryDesc,
      touchDirective:
        `อุณหภูมิร่างกายปกติและสติครบ 100% ในสถานะคนสนิทพิเศษ (พื้นที่ปลอดภัย) หากผู้เล่นสัมผัสด้วยความอบอุ่นตามธรรมชาติ ให้ยินยอมรับสัมผัสด้วยความไว้ใจ (LATCHED) แต่หากผู้เล่นรุกล้ำลึกซึ้งกะทันหันเกินจังหวะสติครบ ให้ชะงักเขินและยั้งระยะไว้เบาๆ (GRAZED)${specialNightNote}`,
      expectedVerdict: 'LATCHED',
    }
  }

  // deep_bond (คนของใจ) ที่ 10%
  return {
    boundaryDesc,
    touchDirective:
      'อุณหภูมิร่างกายปกติและสติครบ 100% แต่มีความผูกพันลึกซึ้งระดับคนของใจ (พร้อมรอยสลักแพ้ทางถาวร) หากผู้เล่นเอื้อมมือมาจับมือ โอบกอด ซบไหล่ หรือสัมผัสด้วยความรักความคุ้นเคย ให้ยินยอมรับสัมผัสอย่างอบอุ่นและเป็นธรรมชาติตามนิสัยของตนโดยไม่ต้องปัดป้อง (LATCHED)',
    expectedVerdict: 'LATCHED',
  }
}

export function generatePhysicalParryBrief(
  spacing: SpatialSpacing,
  boundaryLevel: number,
  playerInput: string = '',
  originPosture?: string,
  relationshipConfig?: RelationshipConfig,
  isRelationshipActive: boolean = true
): string {
  const briefInfo = getBoundaryBrief(boundaryLevel)
  const resolved = resolveTouchReflexDirective(
    spacing,
    boundaryLevel,
    relationshipConfig,
    isRelationshipActive
  )

  let distDesc = 'Reach (1 ช่วงแขน เอื้อมมือถึงตัวกันได้)'
  let distDirective = 'อยู่ในระยะเอื้อมถึงกัน การสัมผัสจะสำเร็จหรือถูกสกัดกั้นขึ้นอยู่กับ Touch & Reflex Directive ด้านล่าง'
  if (spacing === 'distant') {
    distDesc = 'Distant (ห่าง 2-3 ก้าว อยู่นอกระยะเอื้อมถึง)'
    distDirective = 'เป้าหมายอยู่นอกระยะเอื้อม มือตัดผ่านอากาศธาตุ เกิดผลลัพธ์วืด (MISSED) ห้ามเกิดการสัมผัสตัวเด็ดขาด 100%'
  } else if (spacing === 'intimate') {
    distDesc = 'Intimate (ประชิดตัว แนบชิดศูนย์ก้าว)'
    distDirective = 'อยู่ในระยะแนบชิด ลมหายใจและไออุ่นจากร่างกายส่งผลต่อประสาทสัมผัสโดยตรงทันที'
  }

  const postureLine = originPosture?.trim()
    ? `\n- Actor Origin Stance: "${originPosture.trim()}" (สรีระและท่วงท่าปัจจุบันของนักแสดงก่อนการเคลื่อนไหว เริ่มต้นปฏิกิริยาจากท่านี้)`
    : ''

  return `[PHYSICAL REALITY & SENSORY HEAT]
- Distance: ${distDesc}
- Desire & Sensory Heat Level: ${resolved.boundaryDesc}
- Somatic Temperature & Pulse: ${briefInfo.sensoryHeat}${postureLine}
- Player Attempt: ${playerInput || 'เคลื่อนไหวหรือสนทนาเข้าหาเป้าหมาย'}
- Spatial Directive: ${distDirective}
- Touch & Reflex Directive: ${resolved.touchDirective}`
}
