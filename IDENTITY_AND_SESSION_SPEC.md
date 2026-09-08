# 🔑 Identity, Session & Room Entry Architecture (The Soul Engine 5.5)
> **เอกสารวิเคราะห์และสเปกระบบไอดี, เซสชัน, การเปลี่ยนผ่านผู้เล่น, และการเข้าห้องแชท**  
> **สถานะ:** สำหรับรีเช็กความสมบูรณ์และส่งต่อให้ AI Session ถัดไปทำงานต่อได้ทันที

---

## 🏨 1. ปรัชญา "กุญแจห้องโรงแรม" (The Hotel Keycard Metaphor)

แนวคิดสถาปัตยกรรมของ The Soul Engine เปรียบเสมือน **"ระบบโรงแรมอัจฉริยะ"**:

```text
┌───────────────────────────────┐
│     🏛️ เคาน์เตอร์โรงแรม       │
│  (Auth / Reception Desk)      │  <-- มาแค่ "ครั้งแรก" เพื่อรับกุญแจ หรือมา "แจ้งชื่ออัปเกรด"
└───────────────┬───────────────┘
                │ มอบคีย์การ์ด (user_id + session_id)
                ▼
┌───────────────────────────────┐
│       🔑 คีย์การ์ดห้อง         │
│  (Client localStorage / State)│  <-- แขกถือกุญแจติดตัวไว้ตลอดเวลา
└───────────────┬───────────────┘
                │ รูดบัตรเปิดประตูเข้าห้องได้ทันที (Zero Reception Friction)
                ▼
┌───────────────────────────────┐
│       🚪 ห้องพักส่วนตัว        │
│   (ChatRoom / Active Session) │  <-- เข้ามาเมื่อไหร่ ข้าวของ (Affection, ประวัติ, เสื้อผ้า)
└───────────────────────────────┘      ยังคงอยู่ตำแหน่งเดิม 100% (Hot Cache / Neon)
```

### หลักการทำงานตามแนวคิดนี้:
1. **ไม่ต้องไปเคาน์เตอร์ทุกครั้ง (No Redundant Receptions):**
   - เมื่อผู้เล่นได้รับ "กุญแจห้อง" (`session_id` และ `user_id`) ไปแล้ว การเข้าห้องแชท หรือการส่งข้อความแต่ละเทิร์น **ไม่จำเป็นต้องเริ่มสร้าง session ใหม่ หรือต้องไปยืนยันตัวตนซ้ำซ้อน**
   - ไคลเอนต์เพียงแค่ยื่น `session_id` ไปพร้อมกับคำขอ ประตูห้องจะเปิดต้อนรับทันที
2. **ห้องไม่หายแม้ปิดประตู (Intact Room State):**
   - แม้ผู้เล่นจะปิดแท็บ, Refresh หน้าเว็บ, หรือออกจากห้องไปเลือกตัวละครอื่น ข้าวของในห้อง (ประวัติแชท 20 รอบ, ค่า Affection, Desire, ท่าทาง Kinematics, เสื้อผ้าปัจจุบัน) จะถูกพิทักษ์ไว้ใน **Upstash Redis Hot Cache** และ **Neon PostgreSQL** อย่างถาวร
3. **การอัปเกรดแขกจรเป็นสมาชิก (Walk-in Guest to VIP Member):**
   - แขกที่เดินเข้าพักแบบไม่แจ้งชื่อ (Guest) สามารถเดินไปเคาน์เตอร์ทีหลังเพื่อ "แสดงบัตร Google" (Sign in with Google)
   - พนักงานโรงแรม (ระบบ) จะไม่โยนของเก่าทิ้ง แต่จะ **โอนสิทธิ์ห้องเดิมทั้งหมด** ให้มาผูกกับชื่อบัญชีใหม่ทันที แขกยังคงเดินกลับไปไขห้องเดิมที่มีความทรงจำเดิมครบถ้วน!

---

## 👤 2. สเปกระบบไอดีผู้เล่น (Player Identity System)

ระบบแบ่งประเภทผู้เล่นออกเป็น 2 สถานะที่ไร้รอยต่อ:

```text
[ ผู้เล่นเข้าเว็บครั้งแรก ] 
         │
         ▼
 🟢 โหมดผู้เล่นจร (Guest)
    - สร้าง ID: gst_<uuid> ทันทีใน localStorage
    - บันทึกลง Neon PostgreSQL: users (is_guest = TRUE)
    - เริ่มคุยได้ทันที ไม่ต้องกรอกฟอร์มใดๆ (Zero Friction)
         │
         │ (เมื่อผู้เล่นประทับใจ แล้วกด "ล็อกอิน Google")
         ▼
 🔵 โหมดสมาชิก (Registered Member)
    - ได้รับ ID: usr_<google_sub_prefix>
    - บันทึกลง Neon PostgreSQL: users (is_guest = FALSE, email, avatar_url)
    - ⚡ เกิดการ Migrate: โอนย้าย session ทั้งหมดจาก gst_* -> usr_* ทันที
```

### รายละเอียดโครงสร้างไอดี:

| ประเภทไอดี | รูปแบบ Prefix | ตัวอย่าง | แหล่งจัดเก็บหลัก | สิทธิ์และการคงอยู่ |
| :--- | :--- | :--- | :--- | :--- |
| **Guest ID** | `gst_<uuid>` | `gst_e3b0c442-98fc...` | Client `localStorage` (`the_soul_guest_id`) & Neon `users` | ถาวรบนเครื่องนั้นจนกว่าจะเคลียร์แคช หรือโอนย้ายไปเป็นสมาชิก |
| **Member ID** | `usr_<id>` | `usr_110293847561` | Client `localStorage` (`the_soul_user`) & Neon `users` | ผูกกับ Google Account ถาวร สามารถล็อกอินข้ามเครื่องได้ |

---

## 🔄 3. กลไกการเปลี่ยนผ่าน (Seamless Guest-to-Member Migration)

### ปัญหาคลาสสิกของเกมทั่วไป:
ผู้เล่นคุยกับบอทจนผูกพันไปหลายสิบเทิร์น เมื่อระบบเตือนให้สมัครสมาชิก พอกดสมัครแล้วเซฟเก่าหาย ต้องมาเริ่มคุยใหม่ตั้งแต่เทิร์นแรก ทำให้สูญเสียผู้เล่นทันที

### ทางแก้ใน The Soul Engine (`/api/auth/google`):
เมื่อผู้เล่นกดล็อกอิน Google หน้าบ้านจะส่ง `guest_id` เดิมที่มีอยู่ในเครื่องแนบไปด้วย:

```typescript
// Frontend: loginWithGoogle() ใน chatApi.ts
const guestId = getGuestId(); // ดึง gst_... จาก localStorage
const res = await fetch('/api/auth/google', {
  method: 'POST',
  body: JSON.stringify({ credential, guest_id: guestId })
});
```

Backend (`the_soul_app/backend/api/routes.py`) จะดำเนินการโอนย้ายสิทธิ์ใน Neon PostgreSQL ทันที:
```python
# Backend: auth_google_endpoint()
if request.guest_id and request.guest_id.startswith("gst_"):
    pool = await pg.get_pool()
    async with pool.acquire() as conn:
        res = await conn.execute(
            "UPDATE game_sessions SET user_id = $1 WHERE user_id = $2;",
            user_id, request.guest_id
        )
        migrated_count = int(res.split(" ")[-1]) if "UPDATE" in res else 0
        logger.info(f"🔄 Migrated {migrated_count} sessions from {request.guest_id} to {user_id}")
```

**ผลลัพธ์:**
- ทุก `game_sessions` ที่เคยเป็นของ `gst_...` จะกลายเป็นของ `usr_...` ทันที
- ประวัติการคุย (`game_rounds`), ค่าความสัมพันธ์ใน Redis Hot Cache ยังคงอยู่ครบสมบูรณ์ 100%

---

## 🚪 4. ระบบ Session ID และความสัมพันธ์ (Session & Room Architecture)

### โครงสร้างความสัมพันธ์ (Entity Relationship):
- **1 User (`user_id`)** สามารถเปิดห้องเล่นกับหลายตัวละครได้พร้อมกัน
- **1 Character (`character_id`)** สามารถมี Session ที่ `active` ได้ 1 ห้องต่อผู้เล่น 1 คน (เพื่อป้องกันความสับสนของบทบาท)
- **1 Session (`session_id`)** มีค่าเฉพาะคือ `sess_<uuid>` ประกอบด้วยรอบการเล่นหลายรอบ (`game_rounds`)

```text
    ┌────────────────┐
    │     Users      │ (usr_... หรือ gst_...)
    └───────┬────────┘
            │ 1
            │ มีได้หลายห้อง (กับตัวละครคนละตัว)
            ▼ N
    ┌────────────────┐
    │  Game_Sessions │ (sess_<uuid>, character_id, status='active')
    └───────┬────────┘
            │ 1
            │ บันทึกรอบการเล่นต่อเนื่อง
            ▼ N
    ┌────────────────┐
    │  Game_Rounds   │ (round_number 0, 1, 2, ... เก็บ JSONB)
    └────────────────┘
```

### การจัดเก็บข้อมูลตามลำดับชั้น (Tiered Data Flow):
1. **⚡ Hot Tier (Upstash Redis Hot Cache - เข้าถึง 0.001 วินาที):**
   - `session:{session_id}:rounds` (List ของ Unified Round สูงสุด 20 รอบล่าสุด)
   - `session:{session_id}:state` (Hash สถานะสด: Affection, Desire, Posture, Stance, Wardrobe)
2. **💾 Cold Tier (Neon PostgreSQL JSONB - บันทึกถาวร):**
   - ตาราง `game_sessions`: ควบคุมสถานะห้อง (`active` / `archived`)
   - ตาราง `game_rounds`: เก็บเนื้อหารอบการเล่นครบถ้วนสมบูรณ์

---

## 🚶‍♂️ 5. วงจรชีวิตการเข้าห้องแชท (Room Entry Lifecycle)

เมื่อผู้เล่นคลิกการ์ดตัวละครเพื่อเข้าสู่ห้องแชท (`ChatRoom.tsx`):

```text
[ ผู้เล่นคลิกเข้าห้องตัวละคร (character_id) ]
                     │
                     ▼
         ผู้ใช้สั่งบังคับเริ่มใหม่หรือไม่?
        (currentChat.forceNewSession)
         ├── [ ใช่ ] ───────► เรียก startNewSession() -> เปิดฉาก Turn 0 (Prologue)
         │
         └── [ ไม่ใช่ (ปกติ) ]
                     │
                     ▼
             เรียก loadSession(character_id)
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
   [ พบ Session เก่า ]      [ ไม่พบ Session เก่า ]
   - ดึงรอบเล่นจาก Redis     - เรียก startNewSession()
   - ถ้าแคชหมด ดึงจาก Neon   - ออก Session ID ใหม่
   - กางประวัติแชทบนหน้าจอ   - เล่นฉากเปิดตัว Turn 0 (Prologue)
   - ผู้เล่นคุยต่อได้ทันที    - บันทึกลง Hot Cache & Neon
```

### รายละเอียด Endpoint ที่เกี่ยวข้อง:
1. **`POST /api/load_session` (การไขกุญแจห้องเดิม):**
   - ส่ง: `{ user_id, character_id, session_id? }`
   - ค้นหา: Session ล่าสุดที่สถานะเป็น `active` ของผู้ใช้นั้นกับตัวละครนั้น
   - คืนค่า: รายการข้อความ (`messages`), สเตตัสความสัมพันธ์ล่าสุด (`characterStats`, `actorPosture`, `stance`, `tensionGauge`)
2. **`POST /api/start_session` (การสร้างห้องใหม่):**
   - ส่ง: `{ user_id, character_id, world_id }`
   - คืนค่า: `session_id` ใหม่ (`sess_<uuid>`) พร้อม `initial_state` จาก World Data

---

## 🔍 6. เช็กลิสต์การตรวจสอบระบบไอดี (Identity & Session Audit Checklist)

สำหรับผู้พัฒนาและ AI Session ถัดไป ใช้ตรวจสอบความถูกต้องและพิจารณาปรับปรุง:

### ✅ จุดที่ออกแบบและทำงานได้ดีแล้วในปัจจุบัน:
- [x] **Zero-Friction Guest:** ผู้เล่นใหม่ไม่ต้องสมัครสมาชิก ระบบสร้าง `gst_<uuid>` ให้อัตโนมัติและเล่นได้ทันที
- [x] **Guest Migration:** มีระบบ SQL โอนย้าย Session เมื่อล็อกอิน Google ไม่ทำให้ประวัติการแชทสูญหาย
- [x] **Unified Round Integration:** การโหลด Session เชื่อมต่อกับ `UNIFIED_ROUND_SPEC` ทั้ง Redis Hot Cache และ Neon PostgreSQL
- [x] **Single Active Session per Character:** เมื่อกลับมาคุยกับตัวละครเดิม ระบบจะดึงห้องเดิมที่คุยค้างไว้ให้อัตโนมัติ

### 💡 จุดที่ควรนำมารีเช็กหรือต่อยอดในอนาคต (Review & Discussion Points):
1. **การจำกัด Guest Session บน Neon:**
   - ปัจจุบัน Guest ทุกคนถูกบันทึกลงตาราง `users` ใน Neon ในอนาคตควรมี Background Cron คอย Clean up หรือ Archive Guest Sessions ที่ไม่มีการเคลื่อนไหวเกิน 30 วันหรือไม่?
2. **การแชร์ Session หรือ Multi-device สำหรับ Guest:**
   - ปัจจุบัน Guest ผูกกับ `localStorage` ของเบราว์เซอร์เครื่องนั้น หากเปลี่ยนเครื่องหรือเปิดแท็บ Incognito จะเป็น Guest คนใหม่ (ถือเป็นพฤติกรรมมาตรฐานของเว็บแอป) แต่ควรมีแจ้งเตือนสั้นๆ แนะนำให้ผู้เล่น "ผูกบัญชี Google เพื่อเซฟข้อมูลข้ามเครื่อง" หรือไม่?
3. **ความปลอดภัยของ Session ID (Authorization Check):**
   - ตรวจสอบว่าใน `/api/chat` มีการตรวจเช็กหรือไม่ว่า `session_id` ที่ส่งมานั้นเป็นของผู้เล่น `user_id` นั้นจริง เพื่อป้องกันไม่ให้ผู้ใช้อื่นเดา `session_id` แล้วเข้าถึงห้องของผู้อื่นได้
4. **URL Query Param สำหรับ Session ID:**
   - ปัจจุบันการเข้าห้องแชทอาศัย State ใน React และการค้นหาจาก `user_id + character_id` ในอนาคตต้องการให้มี URL เชิงลึก เช่น `/chat/:characterId?session=:sessionId` เพื่อให้กดแชร์หรือกด Bookmark หน้าห้องได้โดยตรงหรือไม่?

---

## 📌 7. สรุปคำแนะนำสำหรับ AI Session ถัดไป
- เมื่อผู้ใช้พูดถึง **"ระบบไอดี"**, **"Guest"**, **"การโอนย้ายข้อมูล"**, หรือ **"กุญแจโรงแรม"** ให้อ้างอิงเอกสารฉบับนี้เป็นแกนหลัก
- หากต้องการดูโค้ดจริง:
  - ฝั่ง Backend ตรวจสอบที่: `the_soul_app/backend/api/routes.py` และ `postgres_core.py`
  - ฝั่ง Frontend ตรวจสอบที่: `the_soul_app/frontend/src/features/chat/chatApi.ts` และ `ChatRoom.tsx`
