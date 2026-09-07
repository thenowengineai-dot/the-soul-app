# 📜 Unified Interaction Round Specification (พิมพ์เขียวแม่แบบ 1 เทิร์น)
### เอกสารมาตรฐานโครงสร้างข้อมูลและการจัดเรียงเทิร์น (The Single Source of Truth)

เอกสารนี้จัดทำขึ้นเพื่อใช้เป็น **"แม่แบบหลัก (Master Template)"** สำหรับการจัดเก็บข้อมูล, การประมวลผลของ AI Engine, และการแสดงผลบนหน้าจอ (UI) เพื่อแก้ปัญหา **Out-of-Order Segments (บับเบิ้ลสลับที่)** อย่างถาวร 100%

---

## 1. ปรัชญาและแนวคิดหลัก (Core Philosophy)

* **The Unified Interaction Round:** นิยามว่า "1 เทิร์น" คือ **1 วงรอบของเหตุการณ์ที่เกิดขึ้นสมบูรณ์** ประกอบด้วย:
  $$\text{Player Input (สิ่งที่ผู้เล่นกระทำ)} \longrightarrow \text{Response Timeline (สิ่งที่โลกและตัวละครตอบสนอง)} \longrightarrow \text{State Snapshot (สเตตัสผลลัพธ์)}$$
* **Atomic Unit (หนึ่งเดียวไม่แยกส่วน):** ในระดับฐานข้อมูล (Redis Hot Cache และ Cold Storage) 1 เทิร์นจะถูกจัดเก็บเป็น **1 JSON Document ก้อนเดียว** ห้ามแตกกระจายออกเป็นหลายแถวใน SQL เหมือนระบบเดิมเด็ดขาด
* **Fluid Chronicle:** ภายใน `response` อนุญาตให้มี `vo_main`, `vo_intimate`, `action`, และ `dialogue` ได้อย่างอิสระ ไม่จำกัดจำนวน และเรียงลำดับก่อนหลังอย่างไรก็ได้ตามที่ AI ประพันธ์ออกมา

---

## 2. แม่แบบข้อมูล JSON (Master JSON Templates)

### 2.1 แม่แบบเทิร์นปกติระหว่างเล่น (Normal Gameplay Round)
ใช้เมื่อผู้เล่นพิมพ์ตอบโต้ และ AI ตอบกลับพร้อมการกระทำ, คำพูด และอาจมี VO ใกล้ชิด (Gear 2):

```json
{
  "round_id": "round_1725711950_005",
  "round_number": 5,
  "timestamp": 1725711950000,

  "player": {
    "text": "(ฉันก้าวเข้าไปประชิดตัวแล้วดึงข้อมือเธอไว้แน่น) อยู่คนเดียวจริงเหรอ?",
    "action": "ก้าวเข้าไปประชิดตัวแล้วดึงข้อมือเธอไว้แน่น",
    "selected_choice_id": null
  },

  "response": [
    {
      "order": 1,
      "type": "vo_intimate",
      "text": "ลมหายใจอุ่นเป่ารดผิวต้นคอในระยะเผาขน กลิ่นหอมแป้งเด็กจางๆ ปะทะเข้ากับความเงียบที่บีบหัวใจ"
    },
    {
      "order": 2,
      "type": "action",
      "text": "(เธอสะดุ้งสุดตัว ร่างกายเกร็งชะงัก พยายามจะบิดข้อมือออกแต่เรี่ยวแรงกลับหดหาย)"
    },
    {
      "order": 3,
      "type": "dialogue",
      "text": "ป...ปล่อยนะ! เข้ามาใกล้ขนาดนี้ตั้งแต่เมื่อไหร่กันยะ!?"
    },
    {
      "order": 4,
      "type": "action",
      "text": "(ใบหน้าเนียนขึ้นสีแดงระเรื่อจนลามไปถึงใบหู ก่อนจะเบือนสายตาหลบไปอีกทาง)"
    },
    {
      "order": 5,
      "type": "dialogue",
      "text": "แล้วก็... ฉันจะอยู่คนเดียวหรือไม่ มันเกี่ยวอะไรกับนายด้วยเล่า..."
    }
  ],

  "system_choices": null,

  "state": {
    "affection": 48,
    "desire": 65,
    "a_pos": "ยืนเบี่ยงหน้าหลบสายตา มือถูกจับ",
    "p_pos": "ยืนประชิดตัว จับข้อมือเธอไว้",
    "scene_id": "scene_library_afternoon",
    "beat_id": "beat_secret_confrontation"
  }
}
```

---

### 2.2 แม่แบบเทิร์นเปิดเกม (Turn 0: Prologue / Opening Scenario)
ใช้เมื่อเริ่มเกมครั้งแรก ผู้เล่นยังไม่ได้พิมพ์อะไรเลย (`player: null`) มี VO หลัก (Gear 1) นำร่อง:

```json
{
  "round_id": "round_1725711900_000",
  "round_number": 0,
  "timestamp": 1725711900000,

  "player": null,

  "response": [
    {
      "order": 1,
      "type": "vo_main",
      "text": "แสงอาทิตย์อัสดงสีส้มอิฐสาดส่องลอดผ่านหน้าต่างบานเกล็ด บรรยากาศเงียบสงัดจนได้ยินเสียงเข็มนาฬิกาเดินเป็นจังหวะ"
    },
    {
      "order": 2,
      "type": "action",
      "text": "(อลิสนั่งกอดอกอยู่ริมโต๊ะทำงาน ปอยผมสีน้ำตาลทิ้งตัวลงมาคลอเคลียแก้ม เธอกำลังก้มหน้าอ่านเอกสารอย่างตั้งอกตั้งใจ)"
    },
    {
      "order": 3,
      "type": "dialogue",
      "text": "ถ้าจะยืนมองอยู่ตรงประตูก็เข้ามาข้างในสิ... ลมมันตีเข้ามาหนาวนะ"
    }
  ],

  "system_choices": [
    {
      "choice_id": "c_walk_in",
      "text": "เดินเข้าไปนั่งตรงข้ามเธอเงียบๆ",
      "matched_path": "path_gentle_approach"
    },
    {
      "choice_id": "c_tease_door",
      "text": "แกล้งเคาะประตูแซวเรื่องที่เธอเผลอทำหน้าจริงจัง",
      "matched_path": "path_playful_tease"
    }
  ],

  "state": {
    "affection": 20,
    "desire": 10,
    "a_pos": "นั่งกอดอกริมโต๊ะทำงาน",
    "p_pos": "ยืนอยู่หน้าประตูห้องชมรม",
    "scene_id": "scene_library_afternoon",
    "beat_id": "beat_opening_encounter"
  }
}
```

---

### 2.3 แม่แบบเทิร์นคุยปกติไร้ VO (Gear 3: The Silence)
ใช้เมื่อเป็นการสนทนาทั่วไป ไม่มีการเปลี่ยนฉากและไม่มีความใกล้ชิดรุนแรง (`response` จะมีเฉพาะ action และ dialogue สลับกัน):

```json
{
  "round_id": "round_1725712100_006",
  "round_number": 6,
  "timestamp": 1725712100000,

  "player": {
    "text": "ก็เห็นหน้าแดง นึกว่าไม่สบายเสียอีก",
    "action": null,
    "selected_choice_id": null
  },

  "response": [
    {
      "order": 1,
      "type": "action",
      "text": "(เธอเชิดหน้าขึ้น กัดริมฝีปากล่างเบาๆ เหมือนพยายามรวบรวมสติ)"
    },
    {
      "order": 2,
      "type": "dialogue",
      "text": "ใครหน้าแดงกันยะ! อากาศมันร้อนต่างหากเล่า รีบปล่อยมือได้แล้ว!"
    }
  ],

  "system_choices": null,

  "state": {
    "affection": 50,
    "desire": 63,
    "a_pos": "เชิดหน้าขึ้น พยายามดึงมือกลับ",
    "p_pos": "ยืนประชิดตัว จับข้อมือเธอไว้",
    "scene_id": "scene_library_afternoon",
    "beat_id": "beat_secret_confrontation"
  }
}
```

---

## 3. พจนานุกรมข้อมูล (Data Dictionary)

| ส่วนของข้อมูล | ฟิลด์ | ชนิดข้อมูล | คำอธิบาย |
| :--- | :--- | :--- | :--- |
| **ส่วนหัว (Header)** | `round_id` | `string` | รหัสเฉพาะของเทิร์น เช่น `"round_{timestamp}_{number}"` |
| | `round_number` | `number` | ลำดับเทิร์น (0 = Opening, 1, 2, 3...) |
| | `timestamp` | `number` | เวลาสร้างระดับมิลลิวินาที (Unix epoch) |
| **ฝั่งผู้เล่น (`player`)** | `text` | `string` | ข้อความที่ส่งเข้ามารวมทั้งคำพูดและแอคชั่น |
| | `action` | `string \| null` | แอคชั่นของผู้เล่นที่สกัดได้ (ถ้ามี) |
| | `selected_choice_id`| `string \| null` | รหัสปุ่มตัวเลือกที่ผู้เล่นกด (ถ้ามี) |
| **ไทม์ไลน์ตอบสนอง (`response`)** | `order` | `number` | เลขลำดับในเทิร์นนั้น เริ่มจาก 1 เสมอ (1, 2, 3...) |
| | `type` | `enum` | หมวดหมู่ของข้อความ: `"vo_main"`, `"vo_intimate"`, `"action"`, `"dialogue"` |
| | `text` | `string` | ข้อความเนื้อหา |
| **ตัวเลือกทางแยก (`system_choices`)**| `choice_id` | `string` | รหัสประจำตัวเลือก |
| | `text` | `string` | ข้อความบนปุ่มชอยส์ |
| | `matched_path` | `string` | รหัสทางแยกที่ตรงกับ `entry_path_id` ของ Scene/Beat ถัดไป |
| **สเตตัสผลลัพธ์ (`state`)** | `affection` | `number` | คะแนนความสนิทสนม (0-100) |
| | `desire` | `number` | คะแนนความโหยหาทางกาย (0-100) |
| | `a_pos` | `string` | ท่าทางและจุดศูนย์ถ่วงของ AI |
| | `p_pos` | `string` | ท่าทางและจุดศูนย์ถ่วงของผู้เล่น |
| | `scene_id` | `string` | รหัสฉากปัจจุบัน |
| | `beat_id` | `string` | รหัสบีตปัจจุบัน |

---

## 4. สัญญาประเภท TypeScript (Strict TypeScript Contract)

สำหรับนำไปใช้งานในทั้ง **Backend (Cloudflare Worker)** และ **Frontend (`chat-ui`)**:

```typescript
export type SegmentType = 'vo_main' | 'vo_intimate' | 'action' | 'dialogue';

export interface ResponseSegment {
  order: number;
  type: SegmentType;
  text: string;
}

export interface PlayerInput {
  text: string;
  action?: string | null;
  selected_choice_id?: string | null;
}

export interface SystemChoice {
  choice_id: string;
  text: string;
  matched_path: string;
}

export interface RoundStateSnapshot {
  affection: number;
  desire: number;
  a_pos: string;
  p_pos: string;
  scene_id: string;
  beat_id: string;
}

export interface UnifiedInteractionRound {
  round_id: string;
  round_number: number;
  timestamp: number;
  player: PlayerInput | null;
  response: ResponseSegment[];
  system_choices?: SystemChoice[] | null;
  state: RoundStateSnapshot;
}
```

---

## 5. การรับประกันความถูกต้อง 100% (Guarantees)

1. **ไม่แตกไฟล์ ไม่แตกตาราง (Atomic Consistency):** จัดเก็บลงใน Redis ผ่านคำสั่ง `RPUSH session:{id}:rounds JSON.stringify(round)` ทำให้ไม่มีวันเกิดสภาวะ Race Condition หรือข้อมูลครึ่งๆ กลางๆ
2. **Deterministic Sequence:** หน้าบ้านวนลูป `round.response` ตาม Array Index หรือ `.sort((a, b) => a.order - b.order)` จะได้ลำดับที่ถูกต้องตรงกับที่ AI Engine คิดเสมอ
3. **Rollback & Load Game Ready:** มี `state` ฝังในทุกเทิร์น สามารถทำระบบ Undo หรือย้อนเซฟไปยังเทิร์นที่ต้องการได้ทันทีโดยไม่ต้องคำนวณย้อนหลังใหม่
