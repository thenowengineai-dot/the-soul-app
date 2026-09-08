import type { ChatConversation, ChatMessage, CharacterHudData } from './types'

export const MOCK_CHATS: ChatConversation[] = [
  { 
    id: 1, 
    name: "ชิน อา-ยอง", 
    message: "ได้โปรดหยุดเถอะ... ถ้าคนอื่นเห็นเข้าล่ะก็...", 
    time: "12m", 
    unread: true, 
    unreadCount: 3,
    verified: true, 
    avatar: "https://i.pinimg.com/1200x/60/8d/e0/608de07b09fe6e34f8b9517213bc4a24.jpg",
    statusMessage: "ในห้องชมรมคนเดียว... 🤫",
    defaultWorld: "lacquered_glasses_black_lace_secret_01"
  },
  { 
    id: 2, 
    name: "ฮันนารี", 
    message: "มาเล่นบนเตียงทั้งวันกับพี่สาวกันเถอะ เธอเป็นเด็กดีใช่ไหม?", 
    time: "45m", 
    unread: true, 
    unreadCount: 1,
    avatar: "https://i.pinimg.com/736x/32/f6/17/32f617cd2fd08759eca04c027f66674d.jpg",
    statusMessage: "ว่างทั้งวัน... มาหาหน่อยสิ 💋",
    defaultWorld: "secret_signal_after_school_01"
  },
  { 
    id: 3, 
    name: "จาง ซอนยอง", 
    message: "อย่าทำแบบนี้... คุณไม่ควรทำแบบนี้กับฉันตอนไม่มีใครอยู่", 
    time: "2h", 
    unread: false, 
    avatar: "https://i.pinimg.com/736x/a5/22/bc/a522bcfb7f3e125929c8ff2213c9d3cb.jpg",
    statusMessage: "อ่านหนังสืออยู่ อย่าเพิ่งกวนนะ 📚",
    defaultWorld: "midnight_deadline_01"
  },
  { 
    id: 4, 
    name: "ยู จินอา", 
    message: "แอบมองฉันอยู่นานแล้วใช่ไหมล่ะ? เจ้าบ้า... คิดว่าไม่รู้เหรอ", 
    time: "5h", 
    unread: true, 
    unreadCount: 5,
    avatar: "https://i.pinimg.com/736x/b6/d6/98/b6d6981647638b2ad2ce1505f52d8d1d.jpg",
    statusMessage: "แอบมองเธออยู่นะ เจ้าบ้า 🙈",
    defaultWorld: "starry_land_01"
  },
  { 
    id: 5, 
    name: "ปาร์ค ซอฮยอน", 
    message: "ถ้าคืนนี้เธออยู่ต่อ... ฉันสัญญาว่าจะไม่ปล่อยให้เธอกลับนะ", 
    time: "1d", 
    unread: false, 
    avatar: "https://i.pinimg.com/736x/d8/17/b9/d817b9207bc55aae576816c90e252d99.jpg",
    statusMessage: "คืนนี้ไม่อยากอยู่คนเดียวเลย 🌙",
    defaultWorld: "stadium_under_bleachers_01"
  },
  { 
    id: 6, 
    name: "คัง มินจี", 
    message: "ช่วยติวหนังสือให้หน่อยสิ... หรือเราจะทำอย่างอื่นที่สนุกกว่านี้ดี?", 
    time: "1d", 
    unread: false, 
    avatar: "https://i.pinimg.com/1200x/97/a5/e6/97a5e6d5a5b35584805c0dec650a63b2.jpg",
    statusMessage: "ติวหนังสือเสร็จแล้ว ไปเล่นเกมกัน 🎮",
    defaultWorld: "aces_secret_lesson_01"
  },
  { 
    id: 7, 
    name: "ซง ฮายูล", 
    message: "แค่กาแฟแก้วเดียว มันไม่พอชดเชยสิ่งที่เธอทำกับฉันหรอกนะ", 
    time: "2d", 
    unread: false, 
    avatar: "https://i.pinimg.com/736x/32/80/3b/32803bcef9511fed94091a8b7ec7f226.jpg",
    statusMessage: "จิบกาแฟแก้วโปรด ☕"
  },
  { 
    id: 8, 
    name: "แบ ซูจิน", 
    message: "ความลับของเราสองคนเมื่อคืน... ห้ามบอกใครเด็ดขาดเลยนะ", 
    time: "3d", 
    unread: true, 
    unreadCount: 2,
    avatar: "https://i.pinimg.com/1200x/0c/ec/b2/0cecb2d865879661b09b2612dabd639b.jpg",
    statusMessage: "ความลับของเราสองคน... 🤫"
  },
  { 
    id: 9, 
    name: "ยุน แชวอน", 
    message: "หัวใจฉันเต้นแรงขนาดนี้ เธอไม่ได้ยินจริงๆ เหรอ...?", 
    time: "5d", 
    unread: false, 
    avatar: "https://i.pinimg.com/736x/5d/0b/a2/5d0ba2f62633c2093a4c411f7f39b718.jpg",
    statusMessage: "หัวใจเต้นแรงจัง 💓"
  },
  { 
    id: 10, 
    name: "โอ ดาอิน", 
    message: "ประตูห้องล็อคแล้วล่ะ... คราวนี้ไม่มีใครมาขัดจังหวะเราได้แล้ว", 
    time: "1w", 
    unread: false, 
    avatar: "https://i.pinimg.com/1200x/b7/43/d6/b743d64a327453033fe7db8d1e7d298d.jpg",
    statusMessage: "ห้ามดื้อกับฉันนะ 🗝️"
  },
]

export const MOCK_MESSAGES: ChatMessage[] = [
  { id: 1, type: 'msg', sender: "them", text: "รุ่นน้องคะ วันนี้จะเข้ามาเคลียร์เอกสารที่ห้องชมรมไหม?" },
  { id: 2, type: 'msg', sender: "them", text: "ฉันชงชาอุ่นๆ เตรียมไว้ให้แล้วนะ บรรยากาศเงียบดีจังเลย 🍵" },
  { id: 3, type: 'msg', sender: "me", text: "กำลังเดินไปพอดีเลยครับ วันนี้รุ่นพี่อยู่คนเดียวเหรอครับ?" },
  { id: 4, type: 'msg', sender: "them", text: "อื้อ... วันนี้คนอื่นติดซ้อมกิจกรรมกันหมด เลยเหลือแค่เราสองคนน่ะสิ..." },
  { id: 5, type: 'msg', sender: "them", text: "ข้างนอกฝนตกหนักมากเลย เธอยังกลับไม่ได้ใช่ไหม?" },
  { id: 6, type: 'msg', sender: "me", text: "ติดฝนยาวเลยครับ ร่มก็ไม่ได้พกมาด้วย" },
  { id: 7, type: 'msg', sender: "them", text: "งั้น... อยู่ด้วยกันในนี้ต่ออีกหน่อยได้ไหม? ฉันยังไม่อยากให้เธอกลับเลย" },
  { id: 8, type: 'msg', sender: "me", text: "ได้สิครับ อยู่ข้างๆ รุ่นพี่แบบนี้ผมก็มีความสุขเหมือนกัน" },
  { id: 9, type: 'msg', sender: "them", text: "อรุณสวัสดิ์นะ! เมื่อคืนนอนหลับสบายดีไหม?" },
  { id: 10, type: 'msg', sender: "me", text: "คิดถึงเรื่องเมื่อวานจนนอนไม่ค่อยหลับเลยครับ" },
  { id: 11, type: 'msg', sender: "them", text: "บ้าจริง... พูดอะไรออกมาน่ะ ฉันก็เขินเป็นนะ! ///" },
  { id: 12, type: 'msg', sender: "me", text: "ไม่ต้องกังวลนะ เรื่องเมื่อตอนเย็นไม่มีใครเห็นแน่นอน" },
  { id: 13, type: 'msg', sender: "them", text: "โชคดีจัง... ตอนที่เธอเข้ามาใกล้ ฉันตกใจจนหัวใจเต้นแรงแทบระเบิดเลย" },
  { id: 14, type: 'action', sender: "them", text: "เธอยกมือขึ้นทาบอกเบาๆ พวงแก้มใสขึ้นสีแดงระเรื่อ ดวงตาสีน้ำตาลหวานหลุบมองต่ำด้วยความประหม่า" },
  { id: 15, type: 'msg', sender: "them", text: "ได้โปรดหยุดแกล้งฉันเถอะ... ถ้ามีใครมาเห็นเข้าล่ะก็ ฉันคงมองหน้าคนอื่นไม่ติดแน่ๆ... ฮ่า..." },

  // กล่อง VO (Voice Over / คำบรรยายบรรยากาศและฉาก สไตล์มังงะ/X Card)
  { 
    id: 16, 
    type: 'vo', 
    text: "แสงไฟนีออนในห้องชมรมสะท้อนลงบนโต๊ะไม้เก่า เสียงหยดฝนกระทบกระจกหน้าต่างเบาๆ คล้ายจังหวะดนตรียามค่ำคืน บรรยากาศเงียบสงัดทำให้ระยะห่างของทั้งสองคนค่อยๆ ลดลง จนได้ยินแม้กระทั่งเสียงลมหายใจอุ่นๆ ที่แผ่วเบา ในแววตาของรุ่นพี่สาวมีทั้งความสับสนและความอ่อนไหวที่ไม่เคยเปิดเผยให้ใครได้เห็นมาก่อน..." 
  },

  { id: 17, type: 'msg', sender: "me", text: "ถ้ากลัวคนอื่นเห็น คราวหน้าเราไปที่ที่เงียบกว่านี้กันไหมล่ะครับ?" },
  { id: 18, type: 'msg', sender: "them", text: "ที่ที่เงียบกว่านี้เหรอ...? หมายถึงที่ไหนกันน่ะ... เจ้าเด็กบ้า ✨" },
]

export const MOCK_HUD_MAP: Record<number | string, CharacterHudData> = {
  1: {
    characterId: 1,
    name: "ชิน อา-ยอง",
    gender: "หญิง",
    age: "19 ปี",
    role: "ประธานชมรมวรรณกรรม",
    avatar: "https://i.pinimg.com/1200x/60/8d/e0/608de07b09fe6e34f8b9517213bc4a24.jpg",
    image: "https://i.pinimg.com/1200x/60/8d/e0/608de07b09fe6e34f8b9517213bc4a24.jpg",
    pose: "เอามือทาบอก หลบสายตาด้วยความประหม่า",
    outfit: "ชุดนักเรียน ม.ปลาย เสื้อเชิ้ตเปียกฝนเล็กน้อย",
    relationship: {
      label: "ความสัมพันธ์",
      status: "หวั่นไหวและเริ่มเปิดใจ",
      current: 68,
      max: 100,
    },
    desire: {
      label: "ความปรารถนา",
      status: "ระงับอารมณ์ไม่อยู่",
      current: 82,
      max: 100,
    },
    environment: {
      time: "21:45 น. (ยามวิกาล)",
      location: "ห้องชมรมวรรณกรรม ชั้น 3",
      weather: "ฝนตกหนัก ฟ้าร้องเบาๆ",
    },
  },
  2: {
    characterId: 2,
    name: "ฮันนารี",
    gender: "หญิง",
    age: "24 ปี",
    role: "พี่สาวข้างห้อง",
    avatar: "https://i.pinimg.com/736x/32/f6/17/32f617cd2fd08759eca04c027f66674d.jpg",
    image: "https://i.pinimg.com/736x/32/f6/17/32f617cd2fd08759eca04c027f66674d.jpg",
    pose: "นอนเท้าคางบนเตียง ยิ้มเย้ายวนขี้เล่น",
    outfit: "ชุดนอนสายเดี่ยวผ้าซาตินสีดำ",
    relationship: {
      label: "ความสัมพันธ์",
      status: "สนิทสนมเป็นพิเศษ",
      current: 74,
      max: 100,
    },
    desire: {
      label: "ความปรารถนา",
      status: "อยากแกล้งให้เขิน",
      current: 65,
      max: 100,
    },
    environment: {
      time: "23:15 น. (ดึกสงัด)",
      location: "ห้องนอนของพี่สาว ชั้น 4",
      weather: "อากาศเย็นสบาย ลมพัดเอื่อย",
    },
  },
}

export function getCharacterHudData(chat?: ChatConversation): CharacterHudData {
  if (!chat) {
    return {
      characterId: 'unknown',
      name: 'ไม่ระบุ',
      gender: 'หญิง',
      age: '20 ปี',
      role: 'ตัวละครหลัก',
      avatar: '',
      image: '',
      pose: 'ยืน/นั่งอิสระตามบริบท',
      outfit: 'ชุดเริ่มต้น',
      relationship: {
        label: 'ความสัมพันธ์',
        status: 'เริ่มต้นทำความรู้จัก',
        current: 0,
        max: 100,
      },
      desire: {
        label: 'ความปรารถนา',
        status: 'ยังไม่มีความปรารถนา',
        current: 0,
        max: 100,
      },
      environment: {
        time: '14:00 น.',
        location: 'สถานที่นัดพบ',
        weather: 'ปกติ แจ่มใส',
      },
    }
  }

  const env = chat.initialEnvironment || {
    time: '14:00 น.',
    location: 'สถานที่นัดพบ',
    weather: 'ปกติ แจ่มใส',
  }

  return {
    characterId: chat.id,
    name: chat.name,
    gender: 'หญิง',
    age: '20 ปี',
    role: 'ตัวละครหลัก',
    avatar: chat.avatar,
    image: chat.image || chat.avatar,
    pose: chat.initialPose || 'ยืน/นั่งอิสระตามบริบท',
    outfit: chat.initialOutfit || 'ชุดเริ่มต้น',
    relationship: {
      label: 'ความสัมพันธ์',
      status: 'เริ่มต้นทำความรู้จัก',
      current: 0,
      max: 100,
    },
    desire: {
      label: 'ความปรารถนา',
      status: 'ยังไม่มีความปรารถนา',
      current: 0,
      max: 100,
    },
    environment: env,
  }
}
