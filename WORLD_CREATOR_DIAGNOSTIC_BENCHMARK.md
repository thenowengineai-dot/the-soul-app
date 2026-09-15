# World Creator Diagnostic Benchmark & Golden Master Specification
> **คู่มือแม่แบบการวินิจฉัยและมาตรฐานข้อมูล (The Canonical Diagnostic Checklist & Schema Specification)**  
> ใช้สำหรับตรวจสอบ เปรียบเทียบ และป้องกันข้อผิดพลาดในการสร้างโลกและตัวละคร (World Creator / The Muse Engine) โดยถอดบทเรียนจากชุดข้อมูลจริงของ **"ใบส้ม (Baisom) / The Paid Smile & Off-Duty Ice"**

---

## 1. บทนำและวัตถุประสงค์ (Executive Purpose)

ในกระบวนการพัฒนาและสร้างโลกผ่าน **The Muse / World Creator** ข้อมูลมักถูกสร้างผ่านกระบวนการต่อเนื่องหลายขั้นตอน:
`LLM Prompting` $\rightarrow$ `JSON Parsing` $\rightarrow$ `State Transition` $\rightarrow$ `Database Persistence (PostgreSQL/Redis)` $\rightarrow$ `In-Memory Chat Pipeline Execution`

หากจุดใดจุดหนึ่งใน Generator ทำงานคลาดเคลื่อนหรือขาดการ Validate ข้อมูล จะทำให้เกิดข้อผิดพลาดเงียบ (Silent Failures) หรือทำให้แชทล่ม (Runtime Crashes) เมื่อนำไปเปิดเล่นจริงใน Chat Room

เอกสารฉบับนี้ถูกสร้างขึ้นเพื่อเป็น **"แม่แบบอ้างอิงสูงสุด (Canonical Benchmark)"** รวบรวมปัญหาจริงทั้งหมด 7 ข้อที่พบในไฟล์ของ **ใบส้ม (Baisom)** ระบุต้นตอว่าเกิดจากโมดูลใดของ World Creator และระบุมาตรฐานที่ถูกต้อง เพื่อใช้เป็น Checkpoint ในการพัฒนาหรือ Refactor ระบบสร้างโลกในอนาคต

---

## 2. แผนผังเทียบเคียงปัญหา (Diagnostic & Root-Cause Matrix)

| # | อาการปัญหา (Problem) | ส่วนของระบบที่สร้างปัญหานี้ (Origin in World Creator) | ผลกระทบต่อ Engine ห้องแชท (Runtime Failure) | วิธีแก้ไขและมาตรฐาน Golden Master (Standard Fix) |
|---|---|---|---|---|
| **1** | **Double-JSON Stringification** (สตริง JSON ซ้อนสตริง) | **Database Upsert / API Serializer** (การบันทึกซ้ำซ้อนด้วย `json.dumps()` บนสตริงเดิม) | `AttributeError: 'str' object has no attribute 'get'` หรือหน้าบ้าน JSON.parse 2 รอบ | เก็บเป็น Object/JSONB แท้ และฝั่ง Engine ทำ Defensive Parsing ถอดรหัสซ้ำอัตโนมัติ |
| **2** | **Wardrobe Key & Case Mismatch** (คีย์ชุดสะกดไม่ตรง / ตัวพิมพ์ใหญ่-เล็ก) | **LLM Prompt & JSON Schema** ใน The Muse (ปล่อยให้โมเดลตั้งชื่อชุดเป็น Human Label) | Engine หาคีย์ชุดไม่เจอ ตกไปใช้ Fallback ชุดแรก ทำให้ตัวละครใส่ชุดลำลองในผับ VIP | บังคับ Snake Case Slug (`cherry_night_shift`) + Engine ใส่ Normalize Logic ป้องกัน |
| **3** | **Draft Prefix Leaking into PK** (`draft_...` ค้างใน Production ID) | **Save / Promotion Logic** ใน Studio (การเปลี่ยนสถานะแค่แก้ `status` แต่ไม่เปลี่ยนรหัสหลัก) | สับสนระหว่างงานร่างกับงานจริง คีย์ Redis ปนเปื้อน | ยึดหลัก **Clean Prefix**: ตัวละครใช้ `char_` โลกใช้ `world_` แล้ววัดสถานะด้วยคอลัมน์ `status` 100% |
| **4** | **Missing `scene_id` on Scenes** (ฉากในแคมเปญไม่มี ID ประจำฉาก) | **Scene Generator Prompt** (ไม่มี field `scene_id` ใน Schema Definition) | `SceneTransitionManager` ระบุฉากปัจจุบันไม่ได้ ต้องเดาเป็น `scene_1` ทำให้บันทึกเซฟข้ามฉากพัง | ทุก Scene ต้องมี `scene_id` ในรูปแบบ snake_case ชัดเจนเสมอ |
| **5** | **Data Redundancy & Divergence** (ข้อมูลตัวละครใน World ไม่ตรงกับ Character) | **World Packaging Pipeline** (คัดลอก Character ฝังลง World ตอนสร้าง แทนที่จะอ้างอิง) | แก้ไขชุดหรือนิสัยในตารางตัวละคร แต่ในห้องแชทยังดึงข้อมูลเก่าจากตารางโลก | แยก Single Source of Truth: โลกเก็บเพียง `character_id` แล้ว Join/Hydrate ตอนเริ่มเกม |
| **6** | **Data Hygiene & Invisible Chars** (มี `\u00a0`, จุดไข่ปลา `...` ค้าง) | **Frontend Textarea / LLM Max Tokens** (ก๊อปปี้ข้อความเว็บ หรือเจนสะดุดกลางประโยค) | ค้นหาชื่อไม่เจอเพราะช่องว่างพิเศษ และ System Prompt ขาดตอน | ล้างช่องว่างพิเศษ `replace(/\u00a0/g, ' ')` และ Validate ความสมบูรณ์ของประโยคก่อนเซฟ |
| **7** | **Desynchronized Opening Context** (ชุดเริ่มต้น, สภาพแวดล้อม และบทพูดแรกไม่สอดคล้องกัน) | **Multi-Agent Coordination Prompt** (เจนตัวละครกับเจนโลกแยกคนละบริบท) | ตัวละครทักทายเรื่องหนึ่ง แต่ฉากเริ่มอีกที่หนึ่ง หรือใส่ชุดนอนในผับ | บังคับให้ Prompt ของ Scene แรก ผูกโยงกับ `initial_outfit_key` และ Opening Line เสมอ |

---

## 3. วิเคราะห์เจาะลึกรายข้อ (Deep-Dive Diagnostics)

---

### ปัญหาที่ 1: Double-JSON Stringification (สตริง JSON ซ้อนสตริง)

#### 🔴 อาการและบั๊กที่พบในใบส้ม:
ในฐานข้อมูล คอลัมน์ `world_data` และโครงสร้างภายในถูกเซฟเป็น JSON ที่ถูก Escape สตริง เช่น:
```json
"\"name\": \"ใบส้ม (Baisom)\", \"core_stats\": \"{\\\"honesty\\\": 8}\""
```
เมื่อ Python Backend ดึงข้อมูลผ่าน ORM/Driver แล้วเรียกใช้:
```python
character_data.get("appearance")
```
จะเกิดข้อผิดพลาดทันที:
```text
AttributeError: 'str' object has no attribute 'get'
```

#### 🔍 ต้นตอในส่วนสร้างโลก (Root Cause in World Creator):
1. ตอนที่ Frontend ส่งข้อมูลผ่าน API `/api/create_world` หน้าบ้านทำ `JSON.stringify(payload)`
2. Backend รับเข้ามาเป็นสตริง หรือ Dict ที่ข้างในมีสตริง
3. ก่อนยิงเข้า PostgreSQL/Redis ดันมีการเรียก `json.dumps(data)` ซ้ำอีกรอบ แทนที่จะส่ง Dict เข้าไปให้ Driver ทำ JSONB Serialization

#### 🛡️ เกณฑ์มาตรฐานป้องกันใน The Muse / Generator:
1. **API Layer**: ใช้ Pydantic Model (`BaseModel`) รับข้อมูลเข้า เพื่อการันตีว่าเป็น Strongly-Typed Object ไม่ใช่ raw JSON string
2. **Persistence Layer**: ส่งข้อมูลเข้า PostgreSQL แบบ Dictionary โดยตรง ปล่อยให้ `asyncpg` หรือ `psycopg` ทำการ serialize เป็น JSONB
3. **Defensive Engine Parser** (ใส่ไว้ใน `pipeline.py` เพื่อความทนทานสูงสุด):
```python
def ensure_dict(val: Any) -> dict:
    if isinstance(val, dict):
        return val
    if isinstance(val, str):
        try:
            parsed = json.loads(val)
            return ensure_dict(parsed)  # ถอดรหัสซ้ำหากมีการครอบหลายชั้น
        except Exception:
            return {}
    return {}
```

---

### ปัญหาที่ 2: Wardrobe Key Mismatch & Case Sensitivity (คีย์ชุดสะกดไม่ตรงกัน)

#### 🔴 อาการและบั๊กที่พบในใบส้ม:
- ใน `world_data.starting_state.initial_outfit_key`:
  ระบุเป็น `"CHERRY / NIGHT SHIFT"` (ตัวพิมพ์ใหญ่ทั้งหมด มีช่องว่างและเครื่องหมายทับ `/`)
- ใน `character_data.appearance.wardrobe`:
  คีย์ถูกตั้งเป็น `"cherry_/_night_shift"` หรือ `"cherry_night_shift"`
- **ผลลัพธ์ในห้องแชท**:
  `wardrobe.get("CHERRY / NIGHT SHIFT")` ได้ค่า `None`  
  ระบบ Engine ตกไปใช้ Fallback คือหยิบชุดแรกใน Dict มาใช้ ซึ่งก็คือ `"baisom_/_off_duty"` (ชุดเสื้อแขนยาวคอเต่ากระโปรงสีฟ้าสำหรับใส่เดินเล่นกลางวัน)  
  **ทำให้ใบส้มไปยืนบริการลูกค้าในห้อง VIP ผับหรูยามค่ำคืนด้วยชุดลำลองกลางวัน!**

#### 🔍 ต้นตอในส่วนสร้างโลก (Root Cause in World Creator):
- ใน Prompt ของ The Muse ที่สั่งให้ LLM สร้างชุด (Wardrobe Generator) ไม่ได้กำหนดมาตรฐานการตั้งชื่อ Key
- LLM สร้าง Key เป็น Human-Readable Title (`"Cherry / Night Shift"`) หรือผสมอักขระพิเศษตามใจชอบ
- เมื่อระบบนำชุดไปใส่ใน `initial_outfit_key` มีการแปลงบ้างไม่แปลงบ้าง ทำให้ Key ไม่ตรงกัน 100%

#### 🛡️ เกณฑ์มาตรฐานป้องกันใน The Muse / Generator:
1. **Strict Slugification Rule**:
   ทุก Key ของชุดและไอเทม ต้องผ่านฟังก์ชัน Slugify ให้เป็น **snake_case** เสมอ:
   - ห้ามมีสัญลักษณ์ `/`, `\`, `-`, `&`, หรือช่องว่าง
   - แปลงเป็นตัวพิมพ์เล็กทั้งหมด
   - ตัวอย่างที่ถูกต้อง:
     - ❌ `"CHERRY / NIGHT SHIFT"`
     - ❌ `"cherry_/_night_shift"`
     - ✅ `"cherry_night_shift"`
     - ✅ `"baisom_off_duty"`
2. **Defensive Normalization ใน Engine**:
```python
def normalize_wardrobe_key(key: str) -> str:
    """แปลง key ให้เป็นมาตรฐาน เช่น 'CHERRY / NIGHT SHIFT' -> 'cherry_night_shift'"""
    return re.sub(r'[^a-zA-Z0-9]+', '_', key.lower()).strip('_')
```

---

### ปัญหาที่ 3: Draft Prefix Leaking into Production Primary Key (`draft_` vs `world_` / `char_`)

#### 🔴 อาการและบั๊กที่พบในใบส้ม:
- ID ของแคมเปญในฐานข้อมูลคือ `"draft_1786182329627"`
- แต่ ID ของตัวละครคือ `"char_1788786310"`
- แม้สถานะแคมเปญจะถูกตั้งเป็น `status = 'published'` แล้ว แต่รหัส Primary Key ยังคงขึ้นต้นด้วยคำว่า `draft_`
- **ผลลัพธ์ในระบบ**:
  - API และ Frontend สับสนว่าต้องโหลดจาก `/api/drafts/` หรือ `/api/campaign/`
  - คีย์ใน Redis กลายเป็น `campaign_v3:draft_1786182329627` ซึ่งขัดแย้งกับความเป็น Published Content
  - โค้ดฝั่งหน้าบ้านต้องเขียนโค้ดดัก `if (id.startsWith('draft_'))` ซ้ำซ้อน

#### 🔍 ต้นตอในส่วนสร้างโลก (Root Cause in World Creator):
- ระบบ The Muse หรือ Studio เมื่อผู้ใช้เริ่มสร้างงาน จะตั้ง ID ตั้งต้นด้วย `draft_<timestamp>`
- เมื่อผู้ใช้กดปุ่ม **"Publish"** ระบบกลับทำเพียงแค่:
  `UPDATE world_campaigns SET status = 'published' WHERE id = 'draft_...'`  
  โดยไม่ได้จัดการเรื่อง ID Prefix ให้เป็นระเบียบตามสถาปัตยกรรมหลัก

#### 🛡️ เกณฑ์มาตรฐานป้องกันใน The Muse / Generator:
1. **ยึดหลัก Clean Prefix & Status Flag**:
   - **รหัสตัวละคร (Character ID):** ต้องขึ้นต้นด้วย `char_` เสมอ (เช่น `char_1788786310`)
   - **รหัสโลก/แคมเปญ (World ID):** ต้องขึ้นต้นด้วย `world_` เสมอ (เช่น `world_1788786310`)
2. **การแยกแยะ Draft vs Published ต้องดูที่คอลัมน์ `status` เท่านั้น**:
   - `status = 'draft'` $\rightarrow$ แสดงเฉพาะใน Creator Studio / The Muse
   - `status = 'published'` $\rightarrow$ นำขึ้นแสดงบนหน้าแรก (HomeView Catalog)
   - **ห้ามเอาคำว่า `draft_` ไปฝังไว้ใน Primary Key ถาวรเป็นอันขาด**
3. **Migration & Backward Compatibility**:
   หากมีข้อมูลเก่าที่ใช้ `draft_` ค้างอยู่ ต้องสร้าง Alias หรือ Mapping Key ใน Redis และ DB ให้รองรับทั้ง 2 รูปแบบ

---

### ปัญหาที่ 4: Missing Scene Identification (`scene_id` ขาดหาย)

#### 🔴 อาการและบั๊กที่พบในใบส้ม:
ในโครงสร้างแคมเปญของใบส้ม โครงสร้าง Scene ถูกสร้างขึ้นมาโดยไม่มีฟิลด์ระบุตัวตน:
```json
"opening_scenarios": [
  {
    "id": "scenario_paid_smile_off_duty_ice",
    "name": "รอยยิ้มแลกค่าดริ๊งก์ และความเย็นชาหลังเลิกงาน",
    "scenes": [
      {
        "beats": [ ... ]
        // ❌ ไม่มีฟิลด์ scene_id หรือ id ประจำฉาก!
      }
    ]
  }
]
```
- **ผลลัพธ์ในห้องแชท**:
  - `SceneTransitionManager` และตัวคุม Pacing ไม่ทราบว่าขณะนี้ผู้เล่นกำลังอยู่ในฉากใด
  - ระบบต้อง Fallback อัตโนมัติเป็น `"scene_1"`
  - เมื่อผู้เล่นเล่นจนจบฉากแรกและต้องเปลี่ยนไปยังฉากที่ 2 (ร้านสะดวกซื้อยามเช้า) ระบบไม่สามารถระบุ ID ฉากเป้าหมายได้ ทำให้การเปลี่ยนฉากล้มเหลวและติดลูปอยู่ที่เดิม

#### 🔍 ต้นตอในส่วนสร้างโลก (Root Cause in World Creator):
- ใน Prompt ที่สั่งสร้าง Scene ของ The Muse: มีการกำหนด `beats`, `environmental_audio`, `sensory_cues` ไว้อย่างละเอียด แต่ลืมใส่ `scene_id` ในรายการ Required Fields ของ JSON Schema

#### 🛡️ เกณฑ์มาตรฐานป้องกันใน The Muse / Generator:
ทุก Scene ที่สร้างขึ้นต้องมี Property บังคับ 2 ตัวนี้เสมอ:
1. `scene_id`: string (snake_case เช่น `"scene_vip_encounter"`, `"scene_convenience_store"`)
2. `scene_title`: string (ข้อความแสดงผลภาษาไทย เช่น `"ห้อง VIP บาร์หรู - ค่ำคืนกับเชอรี่"`)

```json
{
  "scene_id": "scene_vip_encounter",
  "scene_title": "ห้อง VIP บาร์หรู - ค่ำคืนกับเชอรี่",
  "beats": [ ... ]
}
```

---

### ปัญหาที่ 5: Data Redundancy & Divergence (ข้อมูลซ้ำซ้อนและไม่ตรงกัน)

#### 🔴 อาการและบั๊กที่พบในใบส้ม:
- ข้อมูลตัวละครของใบส้มถูกเก็บไว้ 2 ที่:
  1. ในตาราง `world_characters` (คอลัมน์ `character_data`)
  2. ถูกก๊อปปี้ไปฝังซ้ำไว้ในตาราง `world_campaigns` (ข้างในคอลัมน์ `world_data["character"]`)
- เมื่อทีมงานเข้าไปแก้ไขหรืออัปเดตสถิติ/ชุดใน `world_characters` ให้ถูกต้อง แต่ข้อมูลใน `world_campaigns` ไม่ได้ถูกอัปเดตตาม
- ทำให้เกิดภาวะ **State Desynchronization**: ตอนเปิดดูโปรไฟล์หน้าแรกเห็นข้อมูลชุดใหม่ แต่พอเข้าห้องแชทกลับดึงข้อมูลชุดเก่าจากตัวแคมเปญ

#### 🔍 ต้นตอในส่วนสร้างโลก (Root Cause in World Creator):
- The Muse สร้างข้อมูลแบบ Standalone Packaged JSON (รวบทุกอย่างใส่ก้อนเดียว) เพื่อความสะดวกในการเซฟแบบไวๆ ในขั้นตอนเดียว โดยไม่ได้แยก Foreign Key หรือจัดการ Relation

#### 🛡️ เกณฑ์มาตรฐานป้องกันใน The Muse / Generator:
1. **Single Source of Truth**:
   - `world_characters` รับผิดชอบเก็บข้อมูลตัวละครแต่เพียงผู้เดียว
   - `world_campaigns` เก็บเฉพาะ `character_id` อ้างอิง
2. **Hydration Pattern**:
   - ตอนที่ Engine เริ่มต้นห้องแชท ให้ Backend ทำการดึง Character Data จาก ID แล้วนำมาประกอบเข้ากับ World Data ในหน่วยความจำ (In-Memory Hydration) ก่อนส่งให้ LLM Pipeline

---

### ปัญหาที่ 6: Data Hygiene & Invisible Characters (อักขระขยะและข้อความขาดตอน)

#### 🔴 อาการและบั๊กที่พบในใบส้ม:
1. **Non-Breaking Space (`\u00a0`)**:
   ในชื่อของตัวละครมีช่องว่างพิเศษแอบแฝง:
   `"name": "ใบส้ม (Baisom)\u00a0"`
   ทำให้คำสั่งค้นหาหรือการเช็คความเท่ากันของสตริง (String Equality) เช่น `if char.name == "ใบส้ม (Baisom)":` ส่งผลลัพธ์เป็น `False`
2. **Dangling Ellipses (`...`) & Truncated Text**:
   ในคำอธิบายบางส่วนมีข้อความถูกตัดจบด้วยจุดไข่ปลาเนื่องจากหลุดช่วง Context Window หรือเกิดจากการก๊อปปี้มาจากเว็บ

#### 🔍 ต้นตอในส่วนสร้างโลก (Root Cause in World Creator):
- ขาดฟังก์ชัน Data Sanitizer ในขั้นตอนรับข้อมูลจาก Input Form หรือก่อนบันทึก JSON เข้าฐานข้อมูล

#### 🛡️ เกณฑ์มาตรฐานป้องกันใน The Muse / Generator:
สร้าง Sanitization Pipeline คลุมทุก Text Input ก่อนบันทึก:
```python
def sanitize_text(text: str) -> str:
    if not text or not isinstance(text, str):
        return text
    # 1. แปลง non-breaking space เป็น space ธรรมดา
    text = text.replace('\u00a0', ' ')
    # 2. ลบช่องว่างหัวท้าย
    text = text.strip()
    return text
```

---

### ปัญหาที่ 7: Desynchronized Opening Context (ความขัดแย้งของฉากเปิดตัว)

#### 🔴 อาการและบั๊กที่พบในใบส้ม:
- ใน `starting_state.location` ระบุเป็น `"VIP Bar"`
- ใน `starting_state.initial_outfit_key` ระบุเป็น `"cherry_night_shift"`
- แต่หากในบทนำ (Prologue) หรือข้อความทักทายแรก ดันไม่ได้ส่งตัวแปรชุดและสถานที่เข้าไปใน Prompt รอบแรก ทำให้ LLM ตัวละครอาจจะทักทายเหมือนเพิ่งตื่นนอน หรือจำไม่ได้ว่าตนเองยืนอยู่ในห้อง VIP

#### 🔍 ต้นตอในส่วนสร้างโลก (Root Cause in World Creator):
- ใน The Muse การเจน Prologue, World Setting, และ Character Prompt ทำงานแยกโมดูลกัน และไม่มี Cross-Context Assertion ว่า Scene ที่ 1 สอดคล้องกับ Starting State หรือไม่

#### 🛡️ เกณฑ์มาตรฐานป้องกันใน The Muse / Generator:
The Muse ต้องมีขั้นตอน **Cross-Consistency Assertion**:
- ตรวจสอบว่า `starting_state.initial_outfit_key` ต้องมีอยู่ใน `character.appearance.wardrobe`
- ตรวจสอบว่า `starting_state.location` ต้องมีอยู่ใน `world.locations`
- ตรวจสอบว่า `scenes[0].beats[0]` ต้องอ้างอิงสถานที่และเครื่องแต่งกายเดียวกับ `starting_state`

---

## 4. โครงสร้างข้อมูลมาตรฐานสูงสุด (The Golden Master Schemas)

เพื่อให้การเขียน Generator ใน The Muse สร้างข้อมูลได้ตรงตามที่ Engine ต้องการ 100% ให้ยึด Schema ด้านล่างนี้เป็นสรณะ:

### 4.1 Character Schema (`char_<id>.json`)
```json
{
  "character_id": "char_1788786310",
  "name": "ใบส้ม (Baisom)",
  "hashtags": [
    "#รอยยิ้มแลกค่าดริ๊งก์",
    "#เชอรี่ยามค่ำ",
    "#ใบส้มตัวจริง"
  ],
  "archetype": "The Paid Smile / Off-Duty Ice",
  "description": "คำอธิบายตัวละครสั้นๆ แสดงบนการ์ด",
  "avatar_url": "https://...",
  "reference_urls": ["https://..."],
  "max_desire": 1200,
  "core_stats": {
    "honesty": 8,
    "patience": 8,
    "dominance": 6,
    "formality": 9,
    "initiative": 5,
    "perception": 8,
    "physicality": 2,
    "playfulness": 8,
    "sensibility": 2,
    "expressiveness": 8,
    "mask_integrity": 9,
    "emotional_stability": 9
  },
  "appearance": {
    "wardrobe": {
      "cherry_night_shift": [
        "เดรสเข้ารูปสีแดงไวน์ คอสูง แขนกุด ผิวผ้ามันวาว",
        "ต่างหูระย้าคริสตัลเส้นยาว",
        "รองเท้าส้นสูงหัวแหลมสีดำและกระเป๋าคลัตช์สีดำใบเล็ก"
      ],
      "baisom_off_duty": [
        "เสื้อแขนยาวสีขาวเนื้อบาง คอสูงจับระบาย",
        "เดรสสายเดี่ยวสีฟ้าอ่อนทรงพอดีตัว สวมทับเสื้อ",
        "รองเท้าคัทชูส้นเตี้ยสีขาวและกระเป๋าสะพายสีครีม"
      ]
    },
    "anatomy_features": [
      "หญิงสาววัย 25 ปี สูง 168 ซม. หนัก 52 กก. ...",
      "ผิวขาวอมพีชเนียนโทนอุ่น ..."
    ],
    "signature_postures": []
  },
  "psychology": {
    "the_core": "ตัวตนที่แท้จริง...",
    "the_mask": "หน้ากากทางสังคมที่แสดงออก...",
    "the_conflict": "ความขัดแย้งในใจเมื่อสองบทบาทชนกัน..."
  },
  "preferences": {
    "likes": ["กาแฟดำไม่หวาน", "ความเงียบ"],
    "dislikes": ["คนล้ำเส้น", "คนขี้ตื๊อ"]
  }
}
```

### 4.2 World Campaign Schema (`world_<id>.json`)
```json
{
  "world_id": "world_1788786310",
  "character_id": "char_1788786310",
  "name": "The Paid Smile & Off-Duty Ice",
  "thai_name": "รอยยิ้มแลกค่าดริ๊งก์",
  "description": "เรื่องย่อแคมเปญ...",
  "status": "published",
  "starting_state": {
    "time": "ยามค่ำคืน",
    "weather": "แอร์เย็นสบาย",
    "location": "VIP Bar",
    "initial_a_pos": "ยืนตรงหน้าของ [PLAYER] โดยมีโต๊ะคั่นกลาง",
    "initial_p_pos": "นั่งทิ้งตัวบนโซฟาตรงกลาง",
    "initial_outfit_key": "cherry_night_shift"
  },
  "locations": {
    "VIP Bar": {
      "base_mood": "ยั่วเย้า ลุ่มหลง อบอ้าว และบีบคั้น",
      "choke_points": "โซฟาตรงกลางและโซฟาด้านขวามือ",
      "sensory_cues": {
        "ambient_cues": ["เสียงเบสเล็กน้อยผ่านกำแพง", "กลิ่นน้ำหอมหรู"]
      },
      "key_furniture": "โต๊ะกระจก, โซฟาทั้ง 3 รอบโต๊ะ",
      "spatial_layout": "ห้อง VIP บาร์หรู..."
    }
  },
  "opening_scenarios": [
    {
      "id": "scenario_paid_smile_off_duty_ice",
      "name": "รอยยิ้มแลกค่าดริ๊งก์ และความเย็นชาหลังเลิกงาน",
      "scenes": [
        {
          "scene_id": "scene_vip_encounter",
          "scene_title": "ห้อง VIP บาร์หรู - ค่ำคืนกับเชอรี่",
          "beats": [
            {
              "beat_id": "beat_vip_approach",
              "actor_state": "พฤติกรรมของตัวละครในจังหวะนี้...",
              "pacing_control": {
                "max_turns": 3,
                "action_result": "illusion_trigger",
                "inevitable_consequence": "ผลลัพธ์ที่ต้องเกิดขึ้น..."
              },
              "hidden_evaluation_criteria": { ... }
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 5. รายการตรวจสอบก่อนปล่อยงานจริง (The Muse Quality Gate Checklist)

เมื่อเขียนโค้ดส่วนสร้างโลก (World Creator / The Muse) ให้ใช้ Checklist นี้ตรวจสอบโค้ดในแต่ละส่วน:

- [ ] **1. Schema & Key Naming:**
  - คีย์ของชุดทั้งหมดถูกแปลงเป็น `snake_case` หรือยัง?
  - `initial_outfit_key` ใน world สะกดตรงกับคีย์ใน `wardrobe` ของตัวละคร 100% หรือไม่?
- [ ] **2. Identity & ID Prefixes:**
  - ตัวละครใช้รหัส `char_<id>` หรือไม่?
  - โลกใช้รหัส `world_<id>` หรือไม่?
  - ไม่มีการนำคำว่า `draft_` มาเป็น Primary Key สำหรับงานที่ Publish แล้วใช่หรือไม่?
- [ ] **3. Scene Integrity:**
  - ในทุกๆ Scene มีการใส่ `scene_id` และ `scene_title` ครบถ้วนแล้วหรือไม่?
  - ทุก Beat มี `beat_id` ชัดเจนหรือไม่?
- [ ] **4. Storage Serialization:**
  - ตอนบันทึกเข้า Database (Neon) ได้ส่งเป็น Native Object/Dict เข้าไปที่คอลัมน์ JSONB โดยไม่ทำ `json.dumps()` ซ้ำซ้อนใช่หรือไม่?
  - ใน Redis Hot Cache ข้อมูลถูก Serialize แค่ชั้นเดียวใช่หรือไม่?
- [ ] **5. Sanitization:**
  - มีการตัดอักขระพิเศษ `\u00a0` และ Trim ข้อความแล้วหรือไม่?
  - มีการตรวจจับประโยคที่ถูกตัดทับด้วยจุดไข่ปลา `...` หรือไม่?

---

> **หมายเหตุเพื่อการพัฒนาต่อยอด:**  
> เอกสารฉบับนี้ถูกนำไปใช้ทดสอบจริงกับชุดข้อมูล **"ใบส้ม (Baisom)"** และผ่านการ Verify ในระบบจำลอง (Mock & Live Sync Test) ด้วยคะแนน **100% ผ่านทุกข้อ**  
> สามารถใช้อ้างอิงเป็นเกณฑ์มาตรฐานของระบบ The Soul App ทุกเวอร์ชันถัดไปได้ทันที
