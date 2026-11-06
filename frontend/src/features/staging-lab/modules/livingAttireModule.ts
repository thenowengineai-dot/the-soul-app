import type { AttireZoneId, AttireLifecycleStage, SurfaceMutationItem } from '../types'

export interface AttireLayerItem {
  id: string
  slotLabel: string
  description: string
  isInnerHidden?: boolean
}

export interface AttireZoneState {
  zoneId: AttireZoneId
  label: string
  shortLabel: string
  layers: AttireLayerItem[]
  condition: string
  lifecycle: AttireLifecycleStage
}

export type PersonAttireProfile = Record<AttireZoneId, AttireZoneState>

export interface LivingAttireState {
  actor: PersonAttireProfile
  player: PersonAttireProfile
  activePresetId: string
}

export interface LivingAttirePreset {
  id: string
  title: string
  subtitle: string
  locationContext: string
  state: LivingAttireState
}

export interface SensoryCatalystCue {
  id: string
  stepLabel: string
  title: string
  playerInput: string
  expectedBehavior: string
  preMutation?: {
    target: 'actor' | 'player'
    zoneId: AttireZoneId
    condition: string
    lifecycle: AttireLifecycleStage
  }
}

export const ATTIRE_ZONE_ORDER: AttireZoneId[] = [
  'head_hair_face',
  'upper_body',
  'lower_body',
  'feet_footwear',
]

export const ATTIRE_ZONE_META: Record<
  AttireZoneId,
  { label: string; shortLabel: string; hint: string }
> = {
  head_hair_face: {
    label: '1. ศีรษะ เส้นผม & ใบหน้า',
    shortLabel: 'ผม & ใบหน้า',
    hint: 'ทรงผม, ที่ผูกผม/กิ๊บ/หมวก, ต่างหู และสภาพเปียก/หยดน้ำเกาะใบหน้า',
  },
  upper_body: {
    label: '2. ลำตัวบน แขน & มือ (Multi-Layer)',
    shortLabel: 'ลำตัวบน & เสื้อ',
    hint: 'เสื้อนอก, เสื้อชั้นใน/บรา, สร้อยคอ, นาฬิกา, มือ และความเปียกชื้นแนบเนื้อ',
  },
  lower_body: {
    label: '3. ลำตัวล่าง (Multi-Layer)',
    shortLabel: 'ลำตัวล่าง',
    hint: 'กางเกง/กระโปรง, การถกขากางเกง, ชุดชั้นใน และสภาพเปียก/เปื้อนโคลน',
  },
  feet_footwear: {
    label: '4. เท้า & รองเท้า',
    shortLabel: 'เท้า & รองเท้า',
    hint: 'รองเท้า, ถุงเท้า, การถอดรองเท้าวางทิ้งไว้ และสัมผัสฝ่าเท้าเปล่า',
  },
}

/**
 * สร้างโครงสร้างชุดเริ่มต้นสำหรับ "โรงย้อมผ้าครามริมลำธาร" (Indigo Stream Dyehouse)
 * สอดคล้องกับ Stage Cell 5 มิติ: ถอดรองเท้าสานไว้โคนต้นกุ่มน้ำ เท้าเปล่าลุยน้ำตื้น เสื้อเชิ้ตขาวพับแขน
 */
export function createIndigoStreamAttireState(): LivingAttireState {
  return {
    activePresetId: 'indigo_stream_dyehouse',
    actor: {
      head_hair_face: {
        zoneId: 'head_hair_face',
        label: ATTIRE_ZONE_META.head_hair_face.label,
        shortLabel: ATTIRE_ZONE_META.head_hair_face.shortLabel,
        layers: [
          {
            id: 'a_hair',
            slotLabel: 'ทรงผม',
            description: 'ผมยาวสลวยมัดรวบหลวมๆ มีปอยผมระข้างแก้ม',
          },
          {
            id: 'a_hairtie',
            slotLabel: 'ที่ผูกผม',
            description: 'เศษผ้าฝ้ายย้อมครามผูกเป็นโบว์เล็กๆ',
          },
        ],
        condition: '',
        lifecycle: 'DORMANT',
      },
      upper_body: {
        zoneId: 'upper_body',
        label: ATTIRE_ZONE_META.upper_body.label,
        shortLabel: ATTIRE_ZONE_META.upper_body.shortLabel,
        layers: [
          {
            id: 'a_top_outer',
            slotLabel: 'เสื้อชั้นนอก',
            description: 'เสื้อเชิ้ตผ้าฝ้ายทอมือสีขาวดิบเนื้อบาง พับแขนเสื้อลอยขึ้นเหนือข้อศอก',
          },
          {
            id: 'a_top_inner',
            slotLabel: 'เสื้อชั้นใน',
            description: 'บราลูกไม้สีน้ำเงินครามเข้ม (ซ่อนอยู่ใต้เสื้อเชิ้ตขาว)',
            isInnerHidden: true,
          },
          {
            id: 'a_necklace',
            slotLabel: 'สร้อยคอ',
            description: 'สร้อยเงินเส้น細พร้อมจี้หินสีฟ้าใสระดับไหปลาร้า',
          },
        ],
        condition: '',
        lifecycle: 'DORMANT',
      },
      lower_body: {
        zoneId: 'lower_body',
        label: ATTIRE_ZONE_META.lower_body.label,
        shortLabel: ATTIRE_ZONE_META.lower_body.shortLabel,
        layers: [
          {
            id: 'a_bottom_outer',
            slotLabel: 'กางเกง',
            description: 'กางเกงผ้าลินินขายาวสีครีม ถกขากางเกงขึ้นถึงครึ่งหน้าแข้ง',
          },
          {
            id: 'a_bottom_inner',
            slotLabel: 'ชั้นใน',
            description: 'ชั้นในผ้าฝ้ายสีขาวเข้าชุด',
            isInnerHidden: true,
          },
        ],
        condition: 'ชายกางเกงที่ถกขึ้นมีรอยน้ำลำธารกระเซ็นชื้นเล็กน้อย',
        lifecycle: 'LINGERING',
      },
      feet_footwear: {
        zoneId: 'feet_footwear',
        label: ATTIRE_ZONE_META.feet_footwear.label,
        shortLabel: ATTIRE_ZONE_META.feet_footwear.shortLabel,
        layers: [
          {
            id: 'a_shoes',
            slotLabel: 'รองเท้า',
            description: 'รองเท้าสานไม้ไผ่ (ถอดวางทิ้งไว้ตรงโคนต้นกุ่มน้ำริมตลิ่ง)',
          },
          {
            id: 'a_feet',
            slotLabel: 'เท้า',
            description: 'เท้าเปล่าเปลือย (ไม่สวมถุงเท้า)',
          },
        ],
        condition: 'ถอดรองเท้าสานไว้ริมตลิ่ง เท้าเปล่าแช่อยู่ในน้ำลำธารใสเย็นระดับตาตุ่ม เหยียบหินกรวดมน',
        lifecycle: 'LINGERING',
      },
    },
    player: {
      head_hair_face: {
        zoneId: 'head_hair_face',
        label: ATTIRE_ZONE_META.head_hair_face.label,
        shortLabel: ATTIRE_ZONE_META.head_hair_face.shortLabel,
        layers: [
          {
            id: 'p_hair',
            slotLabel: 'ทรงผม',
            description: 'ทรงผมธรรมชาติพัดพลิ้วตามลมภูเขา',
          },
        ],
        condition: '',
        lifecycle: 'DORMANT',
      },
      upper_body: {
        zoneId: 'upper_body',
        label: ATTIRE_ZONE_META.upper_body.label,
        shortLabel: ATTIRE_ZONE_META.upper_body.shortLabel,
        layers: [
          {
            id: 'p_top_outer',
            slotLabel: 'เสื้อชั้นนอก',
            description: 'เสื้อเชิ้ตลินินแขนยาวสีขาว พับแขนขึ้นถึงศอก',
          },
          {
            id: 'p_watch',
            slotLabel: 'นาฬิกา',
            description: 'นาฬิกาข้อมือสายหนังสีน้ำตาลเข้ม',
          },
        ],
        condition: '',
        lifecycle: 'DORMANT',
      },
      lower_body: {
        zoneId: 'lower_body',
        label: ATTIRE_ZONE_META.lower_body.label,
        shortLabel: ATTIRE_ZONE_META.lower_body.shortLabel,
        layers: [
          {
            id: 'p_bottom',
            slotLabel: 'กางเกง',
            description: 'กางเกงชิโน่สีเทาอ่อน พับขากางเกงขึ้นหนีน้ำ',
          },
        ],
        condition: '',
        lifecycle: 'DORMANT',
      },
      feet_footwear: {
        zoneId: 'feet_footwear',
        label: ATTIRE_ZONE_META.feet_footwear.label,
        shortLabel: ATTIRE_ZONE_META.feet_footwear.shortLabel,
        layers: [
          {
            id: 'p_shoes',
            slotLabel: 'รองเท้า',
            description: 'รองเท้าแตะหนัง (ถอดวางคู่กันตรงโคนต้นกุ่มน้ำ)',
          },
          {
            id: 'p_feet',
            slotLabel: 'เท้า',
            description: 'เท้าเปล่าเปลือย',
          },
        ],
        condition: 'ถอดรองเท้าวางไว้ริมตลิ่ง เท้าเปล่าจุ่มในสายน้ำตื้นเย็นเฉียบและทรายเปียก',
        lifecycle: 'LINGERING',
      },
    },
  }
}

export const LIVING_ATTIRE_PRESETS: LivingAttirePreset[] = [
  {
    id: 'indigo_stream_dyehouse',
    title: 'โรงย้อมผ้าครามริมลำธาร',
    subtitle: 'เชิ้ตขาวบางพับแขน + บราสีครามเข้ม + ถอดรองเท้าสานลุยน้ำตื้น',
    locationContext:
      'โรงย้อมผ้าครามพื้นบ้านริมลำธารตอนสาย แดดสดใส ลมภูเขาพัดผ้ามัดย้อมสีครามและสีขาวสะบัดพลิ้ว เดินเท้าเปล่าลุยน้ำตื้นช่วยกันตากผ้า',
    state: createIndigoStreamAttireState(),
  },
  {
    id: 'chest_splashed_wet_cling',
    title: 'หลังโดนสาดน้ำใส่ช่วงอก (เพิ่งเปียกสดๆ ⚡)',
    subtitle: 'เชิ้ตขาวเปียกชุ่มแนบเนื้อเห็นชั้นใน + ปอยผมเปียกเกาะแก้ม (ทดสอบ Turn 1 -> Turn 2)',
    locationContext:
      'กลางลำธารตื้นหลังจังหวะสะบัดผ้าครามสาดน้ำใส่กัน หยดน้ำกระเซ็นเปียกช่วงอกและใบหน้า',
    state: (() => {
      const base = createIndigoStreamAttireState()
      base.activePresetId = 'chest_splashed_wet_cling'
      base.actor.head_hair_face.condition =
        'ปอยผมข้างแก้มเปียกลู่แนบผิวหน้า มีหยดน้ำใสเกาะพวงแก้มและปลายคาง'
      base.actor.head_hair_face.lifecycle = 'FRESH'
      base.actor.upper_body.condition =
        'เสื้อเชิ้ตผ้าฝ้ายสีขาวช่วงอกและไหล่เปียกชุ่มน้ำจนหนักและแนบลู่ติดผิวเนื้อ โปร่งแสงจนมองเห็นเงาบราลูกไม้สีครามเข้มข้างใต้ชัดเจน'
      base.actor.upper_body.lifecycle = 'FRESH'
      return base
    })(),
  },
  {
    id: 'double_layer_rain_shelter',
    title: 'เสื้อ 2 ชั้นหลบฝนชายคาไม้',
    subtitle: 'เสื้อคลุมไหมพรมนอกเปียกชื้น แต่เสื้อสายเดี่ยวข้างในยังแห้งอุ่น',
    locationContext:
      'ศาลาริมทางไม้เก่าแก่ท่ามกลางฝนภูเขาโปรยปราย ลมชื้นพัดละอองฝนสาดเข้ามาทางระเบียง',
    state: (() => {
      const base = createIndigoStreamAttireState()
      base.activePresetId = 'double_layer_rain_shelter'
      base.actor.upper_body.layers = [
        {
          id: 'a_cardigan',
          slotLabel: 'เสื้อคลุมชั้นนอก',
          description: 'คาร์ดิแกนไหมพรมถักสีครีมตัวโคร่ง คลุมทับไหล่',
        },
        {
          id: 'a_camisole',
          slotLabel: 'เสื้อตัวใน',
          description: 'เสื้อสายเดี่ยวผ้าซาตินสีขาวนวลแนบสรีระ',
        },
        {
          id: 'a_bra',
          slotLabel: 'เสื้อชั้นใน',
          description: 'บราไร้ขอบสีเนื้อ',
          isInnerHidden: true,
        },
        {
          id: 'a_watch',
          slotLabel: 'นาฬิกาข้อมือ',
          description: 'นาฬิกาเรือนเล็กสายสแตนเลสสีโรสโกลด์',
        },
      ]
      base.actor.upper_body.condition =
        'เสื้อคาร์ดิแกนไหมพรมชั้นนอกชุ่มละอองฝนจนหนักและเย็น แต่เสื้อสายเดี่ยวด้านในยังแห้งสนิท'
      base.actor.upper_body.lifecycle = 'LINGERING'
      base.actor.feet_footwear.layers = [
        {
          id: 'a_sneakers',
          slotLabel: 'รองเท้า',
          description: 'รองเท้าผ้าใบสีขาว (ยังสวมอยู่)',
        },
        {
          id: 'a_socks',
          slotLabel: 'ถุงเท้า',
          description: 'ถุงเท้าข้อสั้นสีขาว',
        },
      ]
      base.actor.feet_footwear.condition =
        'ปลายรองเท้าผ้าใบและขอบถุงเท้าชื้นแฉะจากการวิ่งลุยแอ่งน้ำฝน'
      base.actor.feet_footwear.lifecycle = 'LINGERING'
      return base
    })(),
  },
]

/**
 * ชุดคิวทดสอบ 3 จังหวะ (3-Step Verification Choreography):
 * พิสูจน์ว่า Turn 1 บรรยายผัสสะแรก -> Turn 2 ไม่พูดซ้ำแต่ตอบสนองต่อลม -> Turn 3 ตอบสนองต่อสายตา
 */
export const ATTIRE_TEST_CUES: SensoryCatalystCue[] = [
  {
    id: 'step1_fresh_splash',
    stepLabel: 'เทิร์น 1: สาดน้ำ (⚡ เพิ่งเกิด)',
    title: 'สะบัดชายผ้าครามสาดน้ำใส่หน้าอกเธอ',
    playerInput:
      '(ฉันแกล้งออกแรงสะบัดชายผ้าครามที่เปียกชุ่มในมือ จนละอองน้ำเย็นเฉียบสาดกระจายเข้าใส่ช่วงอกและใบหน้าของเธอเต็มๆ)',
    expectedBehavior:
      'AI ต้องบรรยายจังหวะน้ำปะทะ: เสื้อเชิ้ตขาวดูดน้ำจนหนักแนบผิว เผยเงาเสื้อชั้นในสีเข้ม และหยดน้ำเกาะแก้ม/ปอยผม',
    preMutation: {
      target: 'actor',
      zoneId: 'upper_body',
      condition:
        'เสื้อเชิ้ตขาวช่วงอกเปียกชุ่มน้ำลำธาร แนบลู่ติดผิวเนื้อจนโปร่งแสงเห็นเงาบราลูกไม้สีครามเข้มข้างใต้',
      lifecycle: 'FRESH',
    },
  },
  {
    id: 'step2_lingering_wind',
    stepLabel: 'เทิร์น 2: ลมภูเขาพัด (⏳ ค้างคา + ตัวกระตุ้นลม)',
    title: 'ลมภูเขาพัดวูบผ่านลำธารขณะช่วยกันตากผ้าต่อ',
    playerInput:
      '(พอพาดผ้าผืนแรกเสร็จ ลมภูเขาเย็นๆ ก็พัดวูบใหญ่ผ่านร่มไม้ไผ่เข้ามาปะทะตัวเราสองคน) ผืนต่อไปตากตรงราวสูงโน้นไหม?',
    expectedBehavior:
      'ห้ามบรรยายซ้ำว่าเพิ่งเปียกน้ำ! แต่ต้องแสดงผลข้างเคียง เช่น เผลอห่อไหล่หรือกอดอกเพราะลมเย็นพัดโดนเสื้อชื้นช่วงอก',
  },
  {
    id: 'step3_lingering_calm',
    stepLabel: 'เทิร์น 3: คุยเรื่องอื่น (⏳ ค้างคา + ไร้ตัวกระตุ้น)',
    title: 'ชวนดูปลาน้อยในน้ำ (ไม่มีอะไรไปกวนเสื้อที่เปียก)',
    playerInput:
      '(ฉันชี้ให้เธอดูฝูงปลาตัวเล็กๆ ที่ว่ายทวนน้ำอยู่ข้างก้อนหินใกล้ปลายเท้าเรา) ดูตรงหินก้อนนั้นสิ ปลาว่ายมาเต็มเลย',
    expectedBehavior:
      'AI ต้องสนใจปลาและสายน้ำที่เท้า โดย "ไม่พูดถึงเสื้อเปียกหรือเสื้อชั้นในซ้ำเลยแม้แต่คำเดียว" เพราะไม่มีตัวกระตุ้นที่ช่วงอก',
  },
]

/**
 * ฟังก์ชันเลื่อนสถานะเมื่อจบเทิร์น (Turn-Delta Lifecycle Promotion):
 * ทุกโซนที่เป็น 'FRESH' (⚡ เพิ่งเกิดในเทิร์นที่แล้ว) จะถูกเปลี่ยนเป็น 'LINGERING' (⏳ ค้างคา) ทันที
 * เพื่อป้องกันไม่ให้ AI บรรยายซ้ำในเทิร์นถัดไป 100%
 */
export function promoteFreshToLingering(state: LivingAttireState): LivingAttireState {
  const nextActor: PersonAttireProfile = { ...state.actor }
  const nextPlayer: PersonAttireProfile = { ...state.player }

  for (const zoneId of ATTIRE_ZONE_ORDER) {
    const aZone = nextActor[zoneId]
    if (aZone.lifecycle === 'FRESH') {
      nextActor[zoneId] = {
        ...aZone,
        lifecycle: aZone.condition.trim() ? 'LINGERING' : 'DORMANT',
      }
    }
    const pZone = nextPlayer[zoneId]
    if (pZone.lifecycle === 'FRESH') {
      nextPlayer[zoneId] = {
        ...pZone,
        lifecycle: pZone.condition.trim() ? 'LINGERING' : 'DORMANT',
      }
    }
  }

  return {
    ...state,
    actor: nextActor,
    player: nextPlayer,
  }
}

/**
 * อัปเดตสภาพพื้นผิวของโซนใดโซนหนึ่ง (เมื่อกดปุ่มจำลอง หรือแก้ไขด้วยมือ)
 */
export function applyZoneCondition(
  state: LivingAttireState,
  target: 'actor' | 'player',
  zoneId: AttireZoneId,
  newCondition: string,
  explicitLifecycle?: AttireLifecycleStage
): LivingAttireState {
  const cleanCond = newCondition.trim()
  const targetProfile = { ...state[target] }
  const currentZone = targetProfile[zoneId]

  let nextLifecycle: AttireLifecycleStage = 'DORMANT'
  if (cleanCond) {
    if (explicitLifecycle) {
      nextLifecycle = explicitLifecycle
    } else if (currentZone.condition.trim() === cleanCond) {
      nextLifecycle = currentZone.lifecycle === 'DORMANT' ? 'LINGERING' : currentZone.lifecycle
    } else {
      nextLifecycle = 'FRESH'
    }
  }

  targetProfile[zoneId] = {
    ...currentZone,
    condition: cleanCond,
    lifecycle: nextLifecycle,
  }

  return {
    ...state,
    [target]: targetProfile,
  }
}

/**
 * ประมวลผลหลังจบเทิร์นแบบครบวงจร:
 * 1. เลื่อนป้าย 'FRESH' เดิมจากเทิร์นที่เพิ่งเล่นจบ ให้กลายเป็น 'LINGERING' (เพราะ AI เพิ่งบรรยายไปแล้วในเทิร์นนี้)
 * 2. หาก AI คาย `surface_mutations` ใหม่ที่เกิดขึ้นระหว่างเทิร์นออกมา ให้บันทึกไว้เป็นสถานะค้างคาต่อเนื่องสำหรับเทิร์นถัดไป
 */
export function reconcilePostTurnAttireState(
  prevState: LivingAttireState,
  mutations?: SurfaceMutationItem[] | null
): LivingAttireState {
  // 1. ทุกโซนที่เป็น FRESH ในเทิร์นนี้ ได้ถูก AI บรรยายไปแล้ว -> เปลี่ยนเป็น LINGERING สำหรับเทิร์นหน้าทันที
  let nextState = promoteFreshToLingering(prevState)

  // 2. หาก AI รายงาน surface_mutations ที่เพิ่งเกิดในเทิร์นนี้ (และ AI เพิ่งบรรยายใน response_sequence ไปแล้ว)
  // ให้บันทึก condition ล่าสุดลงในการ์ดในสถานะ LINGERING เพื่อใช้เป็นผลต่อเนื่องในเทิร์นถัดไปโดยไม่พูดซ้ำ!
  if (Array.isArray(mutations) && mutations.length > 0) {
    for (const mut of mutations) {
      const targetKey: 'actor' | 'player' =
        String(mut.target || 'actor').toLowerCase() === 'player' ? 'player' : 'actor'
      const rawZone = String(mut.zone || '').toLowerCase().trim() as AttireZoneId
      if (!ATTIRE_ZONE_ORDER.includes(rawZone)) continue

      const cleanCond = String(mut.condition || '').trim()
      if (!cleanCond) continue

      const profile = { ...nextState[targetKey] }
      const existingZone = profile[rawZone]
      profile[rawZone] = {
        ...existingZone,
        condition: cleanCond,
        // เนื่องจาก Actor เพิ่งบรรยายเหตุการณ์นี้ไปในเทิร์นที่จบลง สถานะสำหรับเทิร์นถัดไปจึงเป็น LINGERING ทันที!
        lifecycle: 'LINGERING',
      }
      nextState = {
        ...nextState,
        [targetKey]: profile,
      }
    }
  }

  return nextState
}

/**
 * สร้าง Lean Modular Prompt Snippet สำหรับฉีดเข้าสู่ Actor
 * แยกศักดิ์ศรีของข้อมูลออกเป็น 3 ตะกร้าอย่างเด็ดขาด (FRESH vs LINGERING vs DORMANT)
 */
export function generateLivingAttirePrompt(
  state: LivingAttireState,
  isEnabled: boolean = true
): string {
  if (!isEnabled) {
    return `# LIVING ATTIRE & SOMATIC SURFACE MODULE: BYPASSED`
  }

  const freshLines: string[] = []
  const lingeringLines: string[] = []
  const dormantActorLines: string[] = []
  const dormantPlayerLines: string[] = []

  const collectPersonZones = (
    profile: PersonAttireProfile,
    ownerLabel: string,
    dormantBucket: string[]
  ) => {
    for (const zoneId of ATTIRE_ZONE_ORDER) {
      const zone = profile[zoneId]
      const layerDesc = zone.layers
        .map((l) => {
          const hiddenTag = l.isInnerHidden ? ' [ชั้นในซ่อนอยู่ใต้ชุดนอก]' : ''
          return `${l.slotLabel}: ${l.description}${hiddenTag}`
        })
        .join(' | ')

      if (layerDesc) {
        dormantBucket.push(`- [${zone.shortLabel}]: ${layerDesc}`)
      }

      const cond = zone.condition.trim()
      if (cond) {
        if (zone.lifecycle === 'FRESH') {
          freshLines.push(`- ⚡ [${ownerLabel} - ${zone.shortLabel}]: ${cond} (ประกอบด้วย: ${layerDesc})`)
        } else if (zone.lifecycle === 'LINGERING') {
          lingeringLines.push(`- ⏳ [${ownerLabel} - ${zone.shortLabel}]: ${cond}`)
        }
      }
    }
  }

  collectPersonZones(state.actor, 'ตัวคุณ (Actor)', dormantActorLines)
  collectPersonZones(state.player, 'ผู้เล่น (Player)', dormantPlayerLines)

  const sections: string[] = [
    `# ACTIVE MODULE: LIVING ATTIRE & SOMATIC SURFACE (ระบบชุดไร้ขีดจำกัดและผัสสะพื้นผิวกาย 4 โซน)`,
  ]

  // ตะกร้าที่ 1: ⚡ FRESH IMPACT (เพิ่งเปลี่ยนสดๆ ในเทิร์นนี้ — ต้องบรรยายผัสสะแรก!)
  if (freshLines.length > 0) {
    sections.push(
      `[⚡ 1. FRESH SURFACE IMPACT — เพิ่งเกิดสดๆ ในเทิร์นนี้ (จงบรรยายผัสสะแรก!)]
${freshLines.join('\n')}
👉 คำสั่งการแสดงสำหรับจุดที่เพิ่งเกิด (Fresh Impact Directive):
- เหตุการณ์ด้านบนนี้เพิ่งเกิดขึ้นสดๆ ในเทิร์นนี้! จงบรรยายปฏิกิริยาทางสรีระ (Somatic Reaction) ในท่อน action ของคุณอย่างมีชีวิตชีวา
- เน้นผัสสะจริงตามเลเยอร์ของชุด: ความเย็นวาบที่ซึมผ่านเนื้อผ้า, น้ำหนักของผ้าที่อมน้ำจนถ่วงลงหรือแนบลู่ติดผิวเนื้อ (Wet Cling), ความโปร่งแสงของผ้าสีอ่อนเมื่อเปียกที่เผยให้เห็นเงาชั้นในข้างใต้ หรือหยดน้ำที่เกาะพวงแก้มและปอยผม`
    )
  }

  // ตะกร้าที่ 2: ⏳ LINGERING AFTERMATH (สภาพค้างคาจากเทิร์นก่อน — ห้ามเล่าซ้ำเหมือนเพิ่งเกิดใหม่!)
  if (lingeringLines.length > 0) {
    sections.push(
      `[⏳ 2. LINGERING PHYSICAL AFTERMATH — สภาพค้างคาจากเทิร์นก่อน (เล่าไปแล้ว ห้ามรายงานซ้ำ!)]
${lingeringLines.join('\n')}
👉 กฎเหล็กป้องกันการบรรยายซ้ำ (ZERO-REPETITION & CATALYST RULE):
- สภาพค้างคาด้านบนนี้เกิดขึ้นและถูกบรรยายไปแล้วในเทิร์นก่อนหน้า **ห้ามบรรยายซ้ำเด็ดขาดว่ามันเพิ่งเปียกหรือเพิ่งเห็นเสื้อชั้นในราวกับเป็นเรื่องใหม่!**
- จงนำสภาพค้างคานี้มาแสดงเป็น **"ผลข้างเคียงตามธรรมชาติ"** เฉพาะเมื่อมี **"ตัวกระตุ้นใหม่ (Catalyst)"** ในเทิร์นนี้มากระทบเท่านั้น:
  1. หากมีลมพัด/อากาศเย็น -> แสดงอาการหนาวสะท้าน เผลอห่อไหล่ หรือยกแขนกอดอกเพราะความชื้นที่ค้างอยู่บนเสื้อ
  2. หากมีการขยับตัว/ก้มเงย -> แสดงความรู้สึกของเนื้อผ้าชื้นที่ฝืดรั้งผิว หรือใช้ปลายนิ้วดึงสาบเสื้อที่แนบเนื้อออกห่างตัวเบาๆ
  3. หากผู้เล่นจ้องมองหรือก้าวเข้ามาประชิด -> แสดงความเขินอายหรือระวังตัว เช่น ยกมือหรือผืนผ้าขึ้นบังช่วงอกที่เสื้อยังบางชื้น
  4. หากเป็นการเดิน/ขยับเท้า -> รับรู้สัมผัสของฝ่าเท้าเปล่าในน้ำเย็น หินกรวด หรือทรายเปียกอย่างเป็นธรรมชาติ
- 🚫 **หากการกระทำในเทิร์นนี้เป็นเรื่องอื่นที่ไม่ได้ไปกระตุ้นจุดที่ค้างคาเลย จงปล่อยผ่านเงียบๆ 100% ห้ามเอ่ยถึงสภาพเดิมซ้ำแม้แต่คำเดียว!**`
    )
  }

  // ตะกร้าที่ 3: 🔒 DORMANT INVENTORY (คลังชุดและเลเยอร์ทั้งหมด — รู้แต่ไม่พูดเรียงชิ้น)
  sections.push(
    `[🔒 3. DORMANT ATTIRE & LAYER INVENTORY — คลังชุดและเครื่องประดับที่สวมใส่อยู่จริง]
ชุดของตัวคุณ (Actor):
${dormantActorLines.join('\n')}
ชุดของผู้เล่น (Player):
${dormantPlayerLines.join('\n')}
👉 กฎการรับรู้คลังชุด (NO CHECKLIST SYNDROME):
- นี่คือชุดทุกเลเยอร์และเครื่องประดับที่สวมใส่อยู่จริงในฉาก **ห้ามนำมาบรรยายเรียงชิ้นโดยไร้เหตุผลเด็ดขาด!**
- ชิ้นที่มีป้าย [ชั้นในซ่อนอยู่ใต้ชุดนอก] จะถูกมองเห็นได้ก็ต่อเมื่อเสื้อชั้นนอกเปียกชุ่มจนโปร่งแสง ปลดกระดุม หรือเลิกออกเท่านั้น
- หากการกระทำของผู้เล่นหรือของคุณในเทิร์นนี้ทำให้ชุดหรือร่างกายโซนใดเปลี่ยนสภาพใหม่ (เช่น โดนสาดน้ำเปียก, ถอดรองเท้า, พับแขนเสื้อ, ปอยผมเปียกน้ำ) ให้บรรยายผัสสะนั้นอย่างเป็นธรรมชาติ และรายงานโซนที่เพิ่งเปลี่ยนในฟิลด์ "surface_mutations" ของ JSON Output`
  )

  return sections.join('\n\n')
}
