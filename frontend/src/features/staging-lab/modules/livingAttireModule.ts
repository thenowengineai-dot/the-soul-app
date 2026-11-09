import type {
  AttireZoneId,
  AttireLifecycleStage,
  SurfaceMutationItem,
  CharacterSkinBlueprint,
} from '../types'

export type { AttireZoneId, AttireLifecycleStage, SurfaceMutationItem }

export type AttireLayerOrder = 'intimate' | 'inner' | 'outer' | 'accessory'

export interface AttireLayerItem {
  id: string
  slotLabel: string
  description: string
  layerOrder?: AttireLayerOrder
  isInnerHidden?: boolean
  layerCondition?: string
  layerLifecycle?: AttireLifecycleStage
  isRemoved?: boolean
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
  {
    id: 'wet_inner_dry_outer_shirt',
    title: 'สายเดี่ยวเปียกแนบผิว + เสื้อเชิ้ตนอกแห้งคลุมไหล่',
    subtitle: 'เสื้อสายเดี่ยวชั้นในเปียกชุ่มน้ำจนโปร่งแสง แต่เสื้อเชิ้ตตัวนอกที่คลุมทับแห้งสนิท',
    locationContext:
      'ริมลำธารหลังขึ้นจากน้ำ สวมเสื้อเชิ้ตแห้งคลุมไหล่ทับเสื้อสายเดี่ยวที่เปียกชุ่มแนบลู่ติดผิวเนื้อ',
    state: (() => {
      const base = createIndigoStreamAttireState()
      base.activePresetId = 'wet_inner_dry_outer_shirt'
      base.actor.upper_body.layers = [
        {
          id: 'a_bra_hidden',
          slotLabel: 'ชั้นในสุด',
          description: 'โนบรา (ไม่ได้สวมเสื้อชั้นใน)',
          layerOrder: 'intimate',
          layerCondition: 'ยอดอกตั้งชันจากความเย็นของผ้าเปียกแนบเนื้อ',
          layerLifecycle: 'FRESH',
          isInnerHidden: true,
        },
        {
          id: 'a_inner_camisole',
          slotLabel: 'เสื้อตัวใน',
          description: 'เสื้อสายเดี่ยวผ้าคอตตอนสีขาวบางแนบเนื้อ',
          layerOrder: 'inner',
          layerCondition:
            'เปียกชุ่มน้ำลำธารแนบลู่ติดผิวเนื้อช่วงอกจนโปร่งแสงเห็นรอยนูนยอดอกสีชมพูระเรื่อ',
          layerLifecycle: 'FRESH',
        },
        {
          id: 'a_outer_shirt',
          slotLabel: 'เสื้อตัวนอก',
          description: 'เสื้อเชิ้ตแขนยาวสีเข้มตัวโคร่ง สวมทับแบบไม่ติดกระดุม',
          layerOrder: 'outer',
          layerCondition: 'แห้งสนิท คลุมลาดไหล่และแผ่นหลังไว้ แต่แหวกสาบเสื้อด้านหน้าออก',
          layerLifecycle: 'DORMANT',
        },
      ]
      base.actor.upper_body.condition =
        'เสื้อสายเดี่ยวสีขาวข้างในเปียกชุ่มน้ำแนบลู่ติดผิวเนื้อจนโปร่งแสง แต่เสื้อเชิ้ตตัวนอกที่คลุมทับแห้งสนิท'
      base.actor.upper_body.lifecycle = 'FRESH'
      return base
    })(),
  },
]

/**
 * เพิ่มชั้นเสื้อผ้าใหม่ในโซนที่กำหนด
 */
export function addZoneLayer(
  state: LivingAttireState,
  target: 'actor' | 'player',
  zoneId: AttireZoneId,
  newLayer: AttireLayerItem
): LivingAttireState {
  const profile = { ...state[target] }
  const zone = { ...profile[zoneId] }
  zone.layers = [...zone.layers, newLayer]
  profile[zoneId] = zone
  return { ...state, [target]: profile }
}

/**
 * อัปเดตข้อมูลของชั้นเสื้อผ้าเฉพาะชิ้น (เช่น แก้ไขสภาพเฉพาะชิ้น, ปลดกระดุม, หรือสลับถอดออก)
 */
export function updateZoneLayer(
  state: LivingAttireState,
  target: 'actor' | 'player',
  zoneId: AttireZoneId,
  layerId: string,
  updates: Partial<AttireLayerItem>
): LivingAttireState {
  const profile = { ...state[target] }
  const zone = { ...profile[zoneId] }
  zone.layers = zone.layers.map((l) => (l.id === layerId ? { ...l, ...updates } : l))
  profile[zoneId] = zone
  return { ...state, [target]: profile }
}

/**
 * ลบชั้นเสื้อผ้าออกจากโซน
 */
export function removeZoneLayer(
  state: LivingAttireState,
  target: 'actor' | 'player',
  zoneId: AttireZoneId,
  layerId: string
): LivingAttireState {
  const profile = { ...state[target] }
  const zone = { ...profile[zoneId] }
  zone.layers = zone.layers.filter((l) => l.id !== layerId)
  profile[zoneId] = zone
  return { ...state, [target]: profile }
}

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
 * ผสาน Layer 0 (3D Skin & Somatic Physics) เข้ากับ Layer 1-4 (Multi-Layer Attire)
 * และแยกศักดิ์ศรีของข้อมูลออกเป็น 3 ตะกร้าอย่างเด็ดขาด (FRESH vs LINGERING vs DORMANT)
 */
export function generateLivingAttirePrompt(
  state: LivingAttireState,
  isEnabled: boolean = true,
  actorSkin?: CharacterSkinBlueprint | null
): string {
  if (!isEnabled) {
    return `# LIVING ATTIRE & SOMATIC SURFACE MODULE: BYPASSED`
  }

  const freshLines: string[] = []
  const lingeringLines: string[] = []
  const dormantActorLines: string[] = []
  const dormantPlayerLines: string[] = []

  const ORDER_WEIGHT: Record<string, number> = {
    intimate: 1,
    inner: 2,
    outer: 3,
    accessory: 4,
  }

  const collectPersonZones = (
    profile: PersonAttireProfile,
    ownerLabel: string,
    dormantBucket: string[],
    _isActor?: boolean
  ) => {
    for (const zoneId of ATTIRE_ZONE_ORDER) {
      const zone = profile[zoneId]
      // Sort layers by order: intimate -> inner -> outer -> accessory
      const sortedLayers = [...zone.layers].sort((a, b) => {
        const wa = a.layerOrder ? ORDER_WEIGHT[a.layerOrder] || 3 : 3
        const wb = b.layerOrder ? ORDER_WEIGHT[b.layerOrder] || 3 : 3
        return wa - wb
      })

      const layerDesc = sortedLayers
        .map((l) => {
          const removedTag = l.isRemoved ? ' [ถอดออกแล้ว]' : ''
          const hiddenTag = l.isInnerHidden && !l.isRemoved ? ' [ชั้นในซ่อนอยู่ใต้ชุดนอก]' : ''
          const condTag = l.layerCondition ? ` (สภาพ: ${l.layerCondition})` : ''
          const orderTag = l.layerOrder ? `[${l.layerOrder.toUpperCase()}] ` : ''
          return `${orderTag}${l.slotLabel}: ${l.description}${hiddenTag}${removedTag}${condTag}`
        })
        .join(' | ')

      if (layerDesc) {
        dormantBucket.push(`- [${zone.shortLabel}]: ${layerDesc}`)
      }

      // Check per-layer fresh/lingering conditions
      for (const l of sortedLayers) {
        if (l.layerCondition && l.layerCondition.trim()) {
          const lCond = l.layerCondition.trim()
          if (l.layerLifecycle === 'FRESH') {
            freshLines.push(
              `- ⚡ [${ownerLabel} - ${zone.shortLabel} -> ${l.slotLabel}]: ${lCond} (${l.description})`
            )
          } else if (l.layerLifecycle === 'LINGERING') {
            lingeringLines.push(
              `- ⏳ [${ownerLabel} - ${zone.shortLabel} -> ${l.slotLabel}]: ${lCond}`
            )
          }
        }
      }

      // Check zone-level condition
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

  collectPersonZones(state.actor, 'ตัวคุณ (Actor)', dormantActorLines, true)
  collectPersonZones(state.player, 'ผู้เล่น (Player)', dormantPlayerLines, false)

  const sections: string[] = [
    `# ACTIVE MODULE: 3D SOMATIC SKIN & MULTI-LAYER LIVING ATTIRE (ระบบเรือนร่าง 3 มิติและชุดหลายชั้นแยกสถานะ)`,
  ]

  // ตะกร้าที่ 0: 🧬 BARE SKIN, ANATOMY & MOTION PHYSICS (ถ้ามี Skin Blueprint ของตัวละคร)
  const hasSkin =
    actorSkin &&
    (actorSkin.bareAnatomyAndVolume ||
      actorSkin.skinSurfaceAndIntimateMarks ||
      actorSkin.somaticMotionPhysics ||
      actorSkin.intimateDnaAndWearingHabit)

  if (hasSkin) {
    const skinLines: string[] = []
    if (actorSkin.bareAnatomyAndVolume) {
      skinLines.push(`• โครงสร้างหุ่น 3 มิติ & จุดรับแรงดึงผ้า: ${actorSkin.bareAnatomyAndVolume}`)
    }
    if (actorSkin.skinSurfaceAndIntimateMarks) {
      skinLines.push(`• พื้นผิวหนัง เส้นผม & ความลับใต้ชุดชั้นใน: ${actorSkin.skinSurfaceAndIntimateMarks}`)
    }
    if (actorSkin.somaticMotionPhysics) {
      skinLines.push(`• ฟิสิกส์การเคลื่อนไหว (Soft-Body Physics): ${actorSkin.somaticMotionPhysics}`)
    }
    if (actorSkin.intimateDnaAndWearingHabit) {
      skinLines.push(`• รสนิยมชั้นใน & นิสัยการสวมใส่ผ้า: ${actorSkin.intimateDnaAndWearingHabit}`)
    }

    sections.push(
      `[🧬 0. BARE SKIN, ANATOMY & MOTION PHYSICS — เรือนร่างเปลือยเปล่า ชั้นใต้ร่มผ้า และฟิสิกส์สรีระประจำตัวคุณ]
${skinLines.join('\n')}
👉 กฎเหล็กของฟิสิกส์เรือนร่าง 3 มิติ (3D Flesh-to-Fabric Physics Rule):
- เสื้อผ้าทุกชิ้นด้านล่างนี้สวมทับอยู่บนเรือนร่าง 3 มิติด้านบน! เมื่อบรรยายท่าทาง การหายใจ การก้มตัว เดิน วิ่ง หรือถูกสัมผัส จงคำนวณแรงดึงของเนื้อผ้ากับสรีระจริงเสมอ (เช่น เนินอกอวบอิ่มดันสาบเสื้อ, ขอบชุดที่รัดจมลึกในร่องก้นกลมเด้ง, หรือการกระเพื่อมไหวของมวลเนื้อนุ่มใต้ผ้าบาง)
- หากเสื้อผ้าเปียกน้ำจนโปร่งแสง แหวกออก หรือถูกปลด/ถอดออก จงอ้างอิงสีผิว ยอดอก และลักษณะใต้ร่มผ้าจาก [0. BARE SKIN] ด้านบนนี้โดยตรง 100%`
    )
  }

  // ตะกร้าที่ 1: ⚡ FRESH IMPACT (เพิ่งเปลี่ยนสดๆ ในเทิร์นนี้ — ต้องบรรยายผัสสะแรก!)
  if (freshLines.length > 0) {
    sections.push(
      `[⚡ 1. FRESH SURFACE & LAYER IMPACT — เพิ่งเกิดสดๆ ในเทิร์นนี้ (จงบรรยายผัสสะแรก!)]
${freshLines.join('\n')}
👉 คำสั่งการแสดงสำหรับจุดที่เพิ่งเกิด (Per-Layer Contrast Directive):
- เหตุการณ์ด้านบนนี้เพิ่งเกิดขึ้นสดๆ ในเทิร์นนี้! จงบรรยายปฏิกิริยาทางสรีระ (Somatic Reaction) ในท่อน action ของคุณอย่างมีชีวิตชีวา
- เน้นความตัดกันของแต่ละเลเยอร์ตามจริง: หากชั้นในเปียกชุ่มแนบเนื้อแต่ชั้นนอกแห้งสนิท ให้บรรยายความเย็นของผ้าเปียกที่ทาบติดผิวเนื้อช่วงอก ตัดกับสัมผัสของเสื้อตัวนอกที่ยังแห้งและคลุมทับอยู่
- เน้นผัสสะจริง: ความเย็นวาบที่ซึมผ่านเนื้อผ้า, น้ำหนักของผ้าที่อมน้ำจนถ่วงลงหรือแนบลู่ติดผิวเนื้อ (Wet Cling), ความโปร่งแสงของผ้าสีอ่อนเมื่อเปียกที่เผยให้เห็นเงาชั้นในข้างใต้ หรือหยดน้ำที่เกาะพวงแก้มและปอยผม`
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

  // ตะกร้าที่ 3: 🔒 DORMANT INVENTORY (คลังชุดและเลเยอร์ทั้งหมด — เรียงจากในออกนอก)
  sections.push(
    `[🔒 3. INSIDE-OUT LAYER STACK INVENTORY — คลังชุดและเลเยอร์เรียงจากในออกนอก]
ชุดของตัวคุณ (Actor):
${dormantActorLines.join('\n')}
ชุดของผู้เล่น (Player):
${dormantPlayerLines.join('\n')}
👉 กฎการรับรู้คลังชุด (NO CHECKLIST SYNDROME):
- นี่คือชุดทุกเลเยอร์และเครื่องประดับที่สวมใส่อยู่จริงในฉาก เรียงลำดับจากชั้นแนบเนื้อออกสู่ชั้นนอกสุด **ห้ามนำมาบรรยายเรียงชิ้นโดยไร้เหตุผลเด็ดขาด!**
- ชิ้นที่มีป้าย [ชั้นในซ่อนอยู่ใต้ชุดนอก] จะถูกมองเห็นได้ก็ต่อเมื่อเสื้อชั้นนอกเปียกชุ่มจนโปร่งแสง ปลดกระดุม หรือเลิกออกเท่านั้น
- ชิ้นที่มีป้าย [ถอดออกแล้ว] หมายถึงถูกปลดเปลื้องออกแล้ว ผิวเนื้อในโซนนั้นจึงสัมผัสกับบรรยากาศโดยตรง
- หากการกระทำทำให้ชุดหรือร่างกายโซนใดเปลี่ยนสภาพใหม่ (เช่น โดนสาดน้ำเปียก, ถอดรองเท้า, ปลดกระดุม, พับแขนเสื้อ) ให้บรรยายผัสสะนั้นอย่างเป็นธรรมชาติ และรายงานโซนที่เพิ่งเปลี่ยนในฟิลด์ "surface_mutations" ของ JSON Output`
  )

  return sections.join('\n\n')
}
