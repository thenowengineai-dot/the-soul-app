import type { AnnouncementItem } from './types'

export const ANNOUNCEMENT_ITEMS: AnnouncementItem[] = [
  {
    id: 1,
    bgColor: '#241512',
    hoverBgColor: '#2e1814',
    accentColor: '#FF7A30',
    tagText: 'โปรโมชั่นพิเศษ',
    badge: '1/5',
    hasTimer: true,
    mainText: 'โปรโมชั่นพิเศษวันนี้! เฉพาะวันเดียวเท่านั้น!',
    highlightText: 'ลดสูงสุดถึง 60%',
    highlightColor: '#FF5722',
    characterImage: '/promo_avatar.png',
    characterName: 'โปรโมชั่นพิเศษ'
  },
  {
    id: 2,
    bgColor: '#27181f',
    hoverBgColor: '#321c27',
    accentColor: '#FB7185',
    tagText: 'อัปเดตระบบ',
    badge: '2/5',
    hasTimer: false,
    mainText: 'เพิ่มฟีเจอร์ Persona และ User Notes',
    highlightText: 'จดจำคู่สนทนาแล้ว 🐾',
    highlightColor: '#FDA4AF',
    characterImage: 'https://i.pinimg.com/1200x/60/8d/e0/608de07b09fe6e34f8b9517213bc4a24.jpg', // ชิน อา-ยอง
    characterName: 'ชิน อา-ยอง'
  },
  {
    id: 3,
    bgColor: '#1d1526',
    hoverBgColor: '#261a33',
    accentColor: '#C084FC',
    tagText: 'บอทใหม่ ✨',
    badge: '3/5',
    hasTimer: false,
    mainText: 'เปิดตัว "มิน โซรา" แชทบอทโรแมนติกดราม่า',
    highlightText: 'พร้อมพูดคุยแล้ววันนี้',
    highlightColor: '#D8B4FE',
    characterImage: 'https://i.pinimg.com/1200x/8a/4c/29/8a4c29a25512df428e613a3be2dc5ec6.jpg', // มิน โซรา
    characterName: 'มิน โซรา'
  },
  {
    id: 4,
    bgColor: '#131926',
    hoverBgColor: '#192233',
    accentColor: '#38BDF8',
    tagText: 'เควสต์ประจำสัปดาห์ ⚡',
    badge: '4/5',
    hasTimer: false,
    mainText: 'ร่วมกิจกรรมเช็คชื่อต่อเนื่อง 7 วัน',
    highlightText: 'รับแต้มสนทนาฟรี 500 แต้ม',
    highlightColor: '#38BDF8',
    characterImage: 'https://i.pinimg.com/1200x/0c/ec/b2/0cecb2d865879661b09b2612dabd639b.jpg', // แบ ซูจิน
    characterName: 'แบ ซูจิน'
  },
  {
    id: 5,
    bgColor: '#241416',
    hoverBgColor: '#30181c',
    accentColor: '#F87171',
    tagText: 'มาแรงสัปดาห์นี้ 🔥',
    badge: '5/5',
    hasTimer: false,
    mainText: 'ยอดสนทนาสัปดาห์นี้ทะลุ 10 ล้านข้อความ!',
    highlightText: 'ขอบคุณนักแชททุกคน',
    highlightColor: '#FCA5A5',
    characterImage: 'https://i.pinimg.com/1200x/b7/43/d6/b743d64a327453033fe7db8d1e7d298d.jpg', // โอ ดาอิน
    characterName: 'โอ ดาอิน'
  }
]
