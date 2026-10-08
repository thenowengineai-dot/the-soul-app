import type { SandboxPreset } from './types'

export const SANDBOX_PRESETS: SandboxPreset[] = [
  {
    id: 'preset_parry',
    title: '🛡️ ปัดป้องระยะประชิด (Physical Parry)',
    subtitle: 'เกราะหนา 100% ปัดป้องการล่วงล้ำฉับพลัน',
    badge: 'PARRY TEST',
    badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    character_id: 'victoria',
    player_input: '(ฉันก้าวเข้าไปคว้าข้อมือเธอไว้แน่น) อยู่คนเดียวจริงเหรอ?',
    distance: 'intimate',
    inhibition_shield: 'active',
    desire_level: 15,
    climate: 'ห้องสภานักเรียนยามเย็น แสงแดดส้มสลัว',
    held_prop: 'แฟ้มเอกสารรายงาน',
    actor_posture: 'ยืนพิงโต๊ะไม้โอ๊ค จัดเอกสาร',
    player_posture: 'ก้าวประชิดตัว เอื้อมมือคว้าข้อมือเธอ'
  },
  {
    id: 'preset_shattered',
    title: '💔 เกราะแตกสลาย (Armor Shatter)',
    subtitle: 'สติแตก ร่างกายทรยศตรรกะ ไร้แรงขัดขืน',
    badge: 'SHATTER TEST',
    badgeColor: 'border-[#EF264C]/30 text-[#EF264C] bg-[#EF264C]/10',
    character_id: 'victoria',
    player_input: '(ฉันสบตาเธอเงียบๆ ก่อนจะใช้นิ้วโป้งเกลี่ยไล้รอยน้ำตาบนแก้มเนียนอย่างแผ่วเบา)',
    distance: 'intimate',
    inhibition_shield: 'shattered',
    desire_level: 40,
    climate: 'ห้องประชุมมืดสลัว บรรยากาศเงียบสงัดจนได้ยินเสียงลมหายใจ',
    held_prop: 'มือเปล่า',
    actor_posture: 'นั่งทรุดตัวบนเก้าอี้ ดวงตาสั่นระริก',
    player_posture: 'โน้มตัวลงมาประชิด ยื่นมือแตะแก้ม'
  },
  {
    id: 'preset_your_name',
    title: '🌧️ ละอองฝน Your Name (Micro-Climate)',
    subtitle: 'เสื้อเปียกแนบเนื้อ ลมหนาวปะทะ และถ้วยชาร้อน',
    badge: 'SENSORY ANCHOR',
    badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    character_id: 'cher',
    player_input: '(ฉันยื่นถ้วยชาดินเผาร้อนควันกรุ่นให้เธอ) เสื้อเปียกหมดแล้ว... ดื่มนี่ก่อนสิ',
    distance: 'reach',
    inhibition_shield: 'active',
    desire_level: 25,
    climate: 'ฝนกระหน่ำหลังคา อากาศหนาวเยียบ ไออุ่นลอยจากถ้วยชา',
    held_prop: 'ถ้วยชาดินเผาร้อนควันกรุ่น',
    actor_posture: 'กอดอกแน่น ยืนสั่นเทา ปอยผมเปียกแนบแก้ม',
    player_posture: 'ยืนห่างครึ่งก้าว ยื่นถ้วยชาดินเผาให้'
  },
  {
    id: 'preset_whiff',
    title: '💨 ตีวืดระยะไกล (Out of Reach Whiff)',
    subtitle: 'ระยะห่างเกินเอื้อมถึง คว้าได้แค่อากาศ',
    badge: 'HITBOX TEST',
    badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    character_id: 'may',
    player_input: '(ฉันก้าวเข้ามากะทันหันแล้วพยายามจะโผเข้ากอดเธอ)',
    distance: 'distant',
    inhibition_shield: 'active',
    desire_level: 10,
    climate: 'โถงทางเดินกว้างขวาง ลมพัดผ่าน',
    held_prop: 'กระเป๋านักเรียน',
    actor_posture: 'ยืนห่างออกไป 2 เมตร หันหลังให้ครึ่งตัว',
    player_posture: 'กระโจนเข้าหาจากระยะไกล'
  }
]
