import type { Character, CharacterStat, CharacterEvent } from './types'

export const DEFAULT_CHARACTER_STATS: CharacterStat[] = [
  { key: 'initiative', label: 'Initiative', subLabel: 'ความรุกเข้าหา', value: 5 },
  { key: 'playfulness', label: 'Playfulness', subLabel: 'ความขี้แกล้ง', value: 8 },
  { key: 'dominance', label: 'Dominance', subLabel: 'ความเป็นผู้นำ/ข่ม', value: 4 },
  { key: 'physicality', label: 'Physicality', subLabel: 'ความโหยหาสัมผัส', value: 7 },
  { key: 'honesty', label: 'Honesty', subLabel: 'ความปากตรงกับใจ', value: 3 },
  { key: 'sensibility', label: 'Sensibility', subLabel: 'ความไวต่อสัมผัส', value: 5 },
  { key: 'expressiveness', label: 'Expressiveness', subLabel: 'การแสดงสีหน้า', value: 6 },
  { key: 'emotional_stability', label: 'Emotional Stability', subLabel: 'ความมั่นคงอารมณ์', value: 5 },
];

export const DEFAULT_CHARACTER_EVENTS: CharacterEvent[] = [
  {
    id: 'ev-1',
    title: 'พบกันครั้งแรกในค่ำคืนฝนตก',
    location: 'บ้านพัก ซอย 4',
    isUnlocked: true,
    image: 'https://i.pinimg.com/1200x/60/8d/e0/608de07b09fe6e34f8b9517213bc4a24.jpg',
    chapter: 'บทนำ'
  },
  {
    id: 'ev-2',
    title: 'ล่าท้าผีตึกร้างตอนตี 3',
    location: 'ตึกร้างท้ายซอย',
    isUnlocked: false,
    image: 'https://i.pinimg.com/736x/5d/0b/a2/5d0ba2f62633c2093a4c411f7f39b718.jpg',
    chapter: 'บทที่ 3'
  },
  {
    id: 'ev-3',
    title: 'เที่ยวสวนสนุกยามค่ำคืน',
    location: 'สวนสนุกวันเดอร์',
    isUnlocked: false,
    image: 'https://i.pinimg.com/1200x/c4/58/58/c458584f61a5ccbb739ac719abaf2e9f.jpg',
    chapter: 'บทที่ 7'
  },
  {
    id: 'ev-4',
    title: 'เดทลับริมชายหาดใต้แสงจันทร์',
    location: 'ชายหาดซันเซ็ต',
    isUnlocked: false,
    image: 'https://i.pinimg.com/736x/26/9c/89/269c897b77e000d443e778cd7ac7db72.jpg',
    chapter: 'บทที่ 12'
  },
  {
    id: 'ev-5',
    title: 'ความลับในห้องเก็บของสองต่อสอง',
    location: 'ห้องเก็บของหลังบ้าน',
    isUnlocked: false,
    image: 'https://i.pinimg.com/736x/a5/22/bc/a522bcfb7f3e125929c8ff2213c9d3cb.jpg',
    chapter: 'บทที่ 18'
  },
];

export const CATEGORIES: string[] = [
  'ทั้งหมด',
  'ความโรแมนติก',
  'แฟนตาซี',
  'รายวัน',
  'ระทึกขวัญ',
  'ตลก',
  'ละคร',
  'เป็นต้น'
]

export const MOCK_CHARACTERS: Character[] = [
  {
    id: 1,
    name: "ชิน อา-ยอง",
    quote: '"ได้โปรดหยุดเถอะ... ถ้าคนอื่นเห็นเข้าล่ะ... ฮ่า..."',
    views: "5,830,000",
    messages: "170,000",
    image: "https://i.pinimg.com/1200x/60/8d/e0/608de07b09fe6e34f8b9517213bc4a24.jpg",
    images: [
      "https://i.pinimg.com/1200x/60/8d/e0/608de07b09fe6e34f8b9517213bc4a24.jpg",
      "https://i.pinimg.com/736x/5d/0b/a2/5d0ba2f62633c2093a4c411f7f39b718.jpg",
      "https://i.pinimg.com/1200x/c4/58/58/c458584f61a5ccbb739ac719abaf2e9f.jpg",
      "https://i.pinimg.com/736x/26/9c/89/269c897b77e000d443e778cd7ac7db72.jpg"
    ],
    badge: "ใหม่",
    creator: {
      name: "Morosta",
      subscribers: "65.8K ผู้ติดตาม",
      totalInteractions: "2.4M การตอบโต้",
      isFollowed: false
    },
    hashtags: ["#โรแมนติก", "#รุ่นพี่", "#ความรักลับๆ", "#ดราม่า", "#อนิเมะ"],
    updatedTime: "เมื่อสักครู่นี้เอง",
    storyIntroduction: "เรื่องราวเริ่มต้นขึ้นในห้องชมรมหลังเลิกเรียน ท่ามกลางแสงอาทิตย์ยามเย็นที่ส่องผ่านหน้าต่าง คุณและรุ่นพี่อา-ยองต้องอยู่เคลียร์เอกสารด้วยกันเพียงสองคน บรรยากาศที่เงียบสงัดทำให้เสียงหัวใจเต้นชัดเจนขึ้นทุกขณะ...\n\nสิ่งที่คุณจะได้พบในเรื่องนี้:\n• ความสัมพันธ์ลับๆ ระหว่างรุ่นพี่สาวขี้อายกับรุ่นน้องคนสนิท\n• บทสนทนาหวานซึ้งและหยอกล้อที่ค่อยๆ ทวีความใกล้ชิด\n• ค้นหาความลับที่เธอซ่อนไว้ในสมุดไดอารี่ประจำตัว",
    stats: [
      { key: 'initiative', label: 'Initiative', subLabel: 'ความรุกเข้าหา', value: 4 },
      { key: 'playfulness', label: 'Playfulness', subLabel: 'ความขี้แกล้ง', value: 3 },
      { key: 'dominance', label: 'Dominance', subLabel: 'ความเป็นผู้นำ/ข่ม', value: 4 },
      { key: 'physicality', label: 'Physicality', subLabel: 'ความโหยหาสัมผัส', value: 6 },
      { key: 'honesty', label: 'Honesty', subLabel: 'ความปากตรงกับใจ', value: 3 },
      { key: 'sensibility', label: 'Sensibility', subLabel: 'ความไวต่อสัมผัส', value: 8 },
      { key: 'expressiveness', label: 'Expressiveness', subLabel: 'การแสดงสีหน้า', value: 5 },
      { key: 'emotional_stability', label: 'Emotional Stability', subLabel: 'ความมั่นคงอารมณ์', value: 5 },
    ]
  },
  {
    id: 2,
    name: "ฮันนารี",
    quote: '"มาเล่นบนเตียงทั้งวันกับพี่สาวกันเถอะ เธอเป็นเด็กดีใช่ไหม?"',
    views: "4,010,000",
    messages: "130,000",
    image: "https://i.pinimg.com/736x/32/f6/17/32f617cd2fd08759eca04c027f66674d.jpg",
    images: [
      "https://i.pinimg.com/736x/32/f6/17/32f617cd2fd08759eca04c027f66674d.jpg",
      "https://i.pinimg.com/1200x/e9/32/a7/e932a7f62ece5b4041b86b90110af6f2.jpg",
      "https://i.pinimg.com/736x/32/0c/b5/320cb5fde81a791bee0f1c9ac38f7a28.jpg"
    ],
    creator: {
      name: "Nari Official",
      subscribers: "120K ผู้ติดตาม",
      totalInteractions: "1.8M การตอบโต้",
      isFollowed: true
    },
    hashtags: ["#พี่สาว", "#ขี้อ้อน", "#โรแมนติก", "#รายวัน"],
    updatedTime: "10 นาทีที่แล้ว",
    storyIntroduction: "เรื่องราวเริ่มต้นในวันหยุดสุดสัปดาห์ที่แสนเงียบสงบ เมื่อพี่สาวข้างบ้านอย่างนารีชวนคุณมานั่งเล่นที่ห้องของเธอ รอยยิ้มแสนหวานและคำพูดหยอกล้อทำให้วันธรรมดาไม่เหมือนเดิมอีกต่อไป...\n\nสิ่งที่คุณจะได้พบในเรื่องนี้:\n• บทสนทนาแสนอบอุ่นและขี้อ้อนสไตล์พี่สาวข้างบ้าน\n• การใช้เวลาร่วมกันในวันสบายๆ ที่เต็มไปด้วยความรู้สึกพิเศษ\n• ความในใจที่เธอไม่เคยกล้าบอกใครมาก่อน",
    stats: [
      { key: 'initiative', label: 'Initiative', subLabel: 'ความรุกเข้าหา', value: 9 },
      { key: 'playfulness', label: 'Playfulness', subLabel: 'ความขี้แกล้ง', value: 9 },
      { key: 'dominance', label: 'Dominance', subLabel: 'ความเป็นผู้นำ/ข่ม', value: 7 },
      { key: 'physicality', label: 'Physicality', subLabel: 'ความโหยหาสัมผัส', value: 8 },
      { key: 'honesty', label: 'Honesty', subLabel: 'ความปากตรงกับใจ', value: 8 },
      { key: 'sensibility', label: 'Sensibility', subLabel: 'ความไวต่อสัมผัส', value: 7 },
      { key: 'expressiveness', label: 'Expressiveness', subLabel: 'การแสดงสีหน้า', value: 8 },
      { key: 'emotional_stability', label: 'Emotional Stability', subLabel: 'ความมั่นคงอารมณ์', value: 7 },
    ]
  },
  {
    id: 3,
    name: "จาง ซอนยอง",
    quote: '"อย่าทำแบบนี้!! คุณไม่ควรทำแบบนี้กับฉันตอนที่ไม่มีใครอยู่!"',
    views: "2,846,380",
    messages: "91,202",
    image: "https://i.pinimg.com/736x/a5/22/bc/a522bcfb7f3e125929c8ff2213c9d3cb.jpg",
    creator: {
      name: "Webtoon Master",
      subscribers: "340K ผู้ติดตาม",
      totalInteractions: "5.2M การตอบโต้",
      isFollowed: false
    },
    hashtags: ["#ลูกสาวเจ้าของบ้าน", "#ภรรยาผู้มีคุณธรรม", "#ผู้หญิงที่แต่งงานแล้ว", "#แม่", "#ความรักของแม่", "#โชคร้าย", "#แม่ของจุนพโย"],
    updatedTime: "เมื่อสักครู่นี้เอง",
    storyIntroduction: "เรื่องราวเริ่มต้นขึ้นเมื่อคุณได้ย้ายเข้ามาอยู่ในบ้านเช่าแห่งนี้ ซอนยองในฐานะภรรยาเจ้าของบ้านคอยดูแลความเรียบร้อยอยู่เสมอ แต่เบื้องหลังรอยยิ้มอันอบอุ่นและท่าทางสุภาพนั้น ซ่อนความเหงาและปัญหาครอบครัวที่ไม่มีใครเคยรับรู้ จนกระทั่งคืนฝนตกที่คุณได้เผชิญหน้ากับเธอเพียงลำพัง...\n\nสิ่งที่คุณจะได้พบในเรื่องนี้:\n• บทสนทนาที่เต็มไปด้วยความลับ ความลังเลใจ และความสับสนในความสัมพันธ์\n• การตัดสินใจเลือกเส้นทางว่าจะรักษาระยะห่าง หรือก้าวข้ามเส้นแบ่งต้องห้าม\n• ฉากอารมณ์ดราม่าลึกซึ้งและพัฒนาการของตัวละครที่จะค่อยๆ เปิดใจให้คุณทีละนิด",
    stats: [
      { key: 'initiative', label: 'Initiative', subLabel: 'ความรุกเข้าหา', value: 5 },
      { key: 'playfulness', label: 'Playfulness', subLabel: 'ความขี้แกล้ง', value: 8 },
      { key: 'dominance', label: 'Dominance', subLabel: 'ความเป็นผู้นำ/ข่ม', value: 4 },
      { key: 'physicality', label: 'Physicality', subLabel: 'ความโหยหาสัมผัส', value: 7 },
      { key: 'honesty', label: 'Honesty', subLabel: 'ความปากตรงกับใจ', value: 3 },
      { key: 'sensibility', label: 'Sensibility', subLabel: 'ความไวต่อสัมผัส', value: 5 },
      { key: 'expressiveness', label: 'Expressiveness', subLabel: 'การแสดงสีหน้า', value: 6 },
      { key: 'emotional_stability', label: 'Emotional Stability', subLabel: 'ความมั่นคงอารมณ์', value: 5 },
    ]
  },
  {
    id: 4,
    name: "ยู จินอา",
    quote: '"แอบมองฉันอยู่นานแล้วใช่ไหมล่ะ? เจ้าบ้า... คิดว่าไม่รู้เหรอ"',
    views: "3.45 ล้าน",
    messages: "112,000",
    image: "https://i.pinimg.com/736x/b6/d6/98/b6d6981647638b2ad2ce1505f52d8d1d.jpg",
    images: [
      "https://i.pinimg.com/736x/b6/d6/98/b6d6981647638b2ad2ce1505f52d8d1d.jpg",
      "https://i.pinimg.com/1200x/b7/43/d6/b743d64a327453033fe7db8d1e7d298d.jpg",
      "https://i.pinimg.com/736x/c8/62/9d/c8629de865b35832b4c98094c071ebf8.jpg"
    ],
    badge: "ใหม่"
  },
  {
    id: 5,
    name: "ปาร์ค ซอฮยอน",
    quote: '"ถ้าคืนนี้เธออยู่ต่อ... ฉันสัญญาว่าจะไม่ปล่อยให้เธอกลับนะ"',
    views: "6.12 ล้าน",
    messages: "245,000",
    image: "https://i.pinimg.com/736x/d8/17/b9/d817b9207bc55aae576816c90e252d99.jpg"
  },
  {
    id: 6,
    name: "คัง มินจี",
    quote: '"ช่วยติวหนังสือให้หน่อยสิ... หรือเราจะทำอย่างอื่นที่สนุกกว่านี้ดี?"',
    views: "4.28 ล้าน",
    messages: "158,000",
    image: "https://i.pinimg.com/1200x/97/a5/e6/97a5e6d5a5b35584805c0dec650a63b2.jpg",
    images: [
      "https://i.pinimg.com/1200x/97/a5/e6/97a5e6d5a5b35584805c0dec650a63b2.jpg",
      "https://i.pinimg.com/1200x/0c/ec/b2/0cecb2d865879661b09b2612dabd639b.jpg",
      "https://i.pinimg.com/736x/32/80/3b/32803bcef9511fed94091a8b7ec7f226.jpg",
      "https://i.pinimg.com/1200x/8a/4c/29/8a4c29a25512df428e613a3be2dc5ec6.jpg"
    ],
    badge: "ใหม่"
  },
  {
    id: 7,
    name: "ซง ฮายูล",
    quote: '"แค่กาแฟแก้วเดียว มันไม่พอชดเชยสิ่งที่เธอทำกับฉันหรอกนะ"',
    views: "5.19 ล้าน",
    messages: "189,000",
    image: "https://i.pinimg.com/736x/32/80/3b/32803bcef9511fed94091a8b7ec7f226.jpg"
  },
  {
    id: 8,
    name: "แบ ซูจิน",
    quote: '"ความลับของเราสองคนเมื่อคืน... ห้ามบอกใครเด็ดขาดเลยนะ"',
    views: "7.30 ล้าน",
    messages: "310,000",
    image: "https://i.pinimg.com/1200x/0c/ec/b2/0cecb2d865879661b09b2612dabd639b.jpg"
  },
  {
    id: 9,
    name: "ยุน แชวอน",
    quote: '"หัวใจฉันเต้นแรงขนาดนี้ เธอไม่ได้ยินจริงๆ เหรอ...?"',
    views: "3.88 ล้าน",
    messages: "140,000",
    image: "https://i.pinimg.com/736x/5d/0b/a2/5d0ba2f62633c2093a4c411f7f39b718.jpg",
    badge: "ใหม่"
  },
  {
    id: 10,
    name: "ชเว ซูอา",
    quote: '"มองใกล้ๆ แบบนี้ คิดจะทำอะไรน่ะ? ถ้าไม่เริ่ม ฉันจะเริ่มก่อนนะ"',
    views: "6.75 ล้าน",
    messages: "285,000",
    image: "https://i.pinimg.com/1200x/c4/58/58/c458584f61a5ccbb739ac719abaf2e9f.jpg"
  },
  {
    id: 11,
    name: "ลี ยูนา",
    quote: '"เป็นแค่รุ่นน้องแท้ๆ อย่ามาทำตัวน่ารักต่อหน้าฉันบ่อยนักสิ"',
    views: "4.52 ล้าน",
    messages: "176,000",
    image: "https://i.pinimg.com/1200x/e9/32/a7/e932a7f62ece5b4041b86b90110af6f2.jpg",
    badge: "ใหม่"
  },
  {
    id: 12,
    name: "โอ ดาอิน",
    quote: '"ประตูห้องล็อคแล้วล่ะ... คราวนี้ไม่มีใครมาขัดจังหวะเราได้แล้ว"',
    views: "8.40 ล้าน",
    messages: "390,000",
    image: "https://i.pinimg.com/1200x/b7/43/d6/b743d64a327453033fe7db8d1e7d298d.jpg"
  },
  {
    id: 13,
    name: "โก อึนบี",
    quote: '"ถ้าเธอต้องการฉันขนาดนั้น... ก็พิสูจน์ให้เห็นสิว่ารักจริง"',
    views: "5.67 ล้าน",
    messages: "215,000",
    image: "https://i.pinimg.com/736x/26/9c/89/269c897b77e000d443e778cd7ac7db72.jpg"
  },
  {
    id: 14,
    name: "มิน โซรา",
    quote: '"ฝนตกหนักแบบนี้ ค้างที่ห้องฉันก่อนเถอะ... เตียงกว้างพอสำหรับสองคน"',
    views: "9.14 ล้าน",
    messages: "450,000",
    image: "https://i.pinimg.com/1200x/8a/4c/29/8a4c29a25512df428e613a3be2dc5ec6.jpg",
    badge: "ใหม่"
  },
  {
    id: 15,
    name: "คิม ยูริ",
    quote: '"ทำไมต้องหลบตากันด้วยล่ะ? เมื่อกี้ยังกล้าจับมือฉันอยู่เลยนี่นา"',
    views: "4.95 ล้าน",
    messages: "192,000",
    image: "https://i.pinimg.com/736x/32/0c/b5/320cb5fde81a791bee0f1c9ac38f7a28.jpg"
  },
  {
    id: 16,
    name: "ซอ จียอน",
    quote: '"อย่าให้ความหวังถ้าไม่ได้คิดอะไร... เพราะฉันคิดจริงไปแล้วนะ"',
    views: "7.82 ล้าน",
    messages: "330,000",
    image: "https://i.pinimg.com/736x/c8/62/9d/c8629de865b35832b4c98094c071ebf8.jpg"
  }
]
