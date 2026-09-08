# 📋 Master Handover & System Architecture (The Soul Engine 5.5)
> **เอกสารส่งต่องานฉบับสมบูรณ์สำหรับ AI Session ถัดไป**  
> **วันที่บันทึก:** 2026-09-08 | **สถานะระบบ:** พร้อมทำงานต่อเนื่องทันที 100%

---

## 🎯 1. ข้อมูลเซิร์ฟเวอร์ & สภาพแวดล้อม (Cloud Infrastructure)
- **Active Codebase Root:** `/Users/aliceer/solccai/the_soul_app/` (พัฒนา ค้นหา และแก้ไขเฉพาะในนี้เท่านั้น)
  - **Frontend:** `the_soul_app/frontend/` (React + TypeScript + Tailwind CSS)
  - **Backend:** `the_soul_app/backend/` (FastAPI + Neon PostgreSQL + Upstash Redis Hot Cache + Google Vertex AI)
- **คลังอ้างอิงเดิม (Read-Only Reference):** `/Users/aliceer/solccai/_legacy_my_ai_engine/` (ห้ามแก้ไขเด็ดขาด)
- **Cloud Run Production Server:**
  - **Service Name:** `the-soul-backend`
  - **Region:** `asia-southeast1` (Singapore)
  - **Container Port:** `8080`
  - **Production Endpoint:** `https://the-soul-backend-330377476882.asia-southeast1.run.app`
  - **GCP Project ID:** `the-soul-app-prod` (Project Number: `330377476882`)
  - **Auth Mode:** Keyless Google Cloud IAM Service Account (สิทธิ์ `roles/aiplatform.user` / Vertex AI User)
  - **Vertex AI Location:** `global` (ตัวแปรสภาพแวดล้อม: `VERTEX_LOCATION=global`)

---

## 🤖 2. โมเดล AI ประจำแต่ละ Agent (No Fallback Cascade)
รันตรงผ่าน Vertex AI ตามสเปกแอปเก่า 100% โดยตัดระบบ Fallback Retry ทิ้งเพื่อความเสถียร:

| Agent | โมเดลหลัก | Thinking Config | หน้าที่ในไปป์ไลน์ |
| :--- | :--- | :--- | :--- |
| **🕵️‍♂️ Evaluator Agent** | `gemini-3.5-flash-lite` | `thinking_level="medium"` | ประเมินแต้ม Affection/Desire, ท่าทางผู้เล่น (`p_pos`), อารมณ์ (`stance`), สับราง Beat Routing |
| **🎬 Director Agent** | `gemini-3.5-flash-lite` | `thinking_level="medium"` | ผู้กำกับฉาก: คุมเลนส์กล้องภาพยนตร์ (Gear 1 บรรยายฉากกว้าง / Gear 2 ซูมประชิด 1 ฟุต / Gear 3 เงียบ) |
| **🎭 Actor Agent** | `gemini-3.8-flash` | `thinking_level="medium"` | นักแสดงนำ: สวมบทบาท ตอบโต้ Action ภาษากาย และ Dialogue บทพูด ในรูปแบบ JSON Block |

---

## 💾 3. สถาปัตยกรรมข้อมูล 3 เลเยอร์ (Hot / Warm / Cold Storage Flow)

ระบบใช้แนวคิด **Tiered Memory Hierarchy** เพื่อให้การอ่านเขียนมี Zero Latency และคงทนถาวร:

```text
[ ผู้เล่นส่งข้อความ ] ──► [ AI ประมวลผลเทิร์น ] ──► [ รวมร่างเป็น 1 Unified Round ]
                                                              │
               ┌──────────────────────────────────────────────┴──────────────────────────────┐
               ▼                                                                             ▼
    ⚡ HOT CACHE (Upstash Redis)                                                  💾 WARM / COLD STORAGE (Neon PostgreSQL)
    • ละเอียดระดับมิลลิวินาที (Zero Latency)                                         • แอบเซฟ Asynchronous เบื้องหลัง (Non-blocking)
    • session:{id}:state (Kinematics a_pos, p_pos)                                  • ตาราง game_sessions (Metadata สถานะเซฟ)
    • session:{id}:rounds (Sliding Window 20 เทิร์นล่าสุด)                            • ตาราง session_rounds (JSONB Archive ถาวร)
                                                                                             │
                                                                                             ▼
                                                                                 🧊 DEEP COLD MEMORY (Qdrant Vector DB)
                                                                                 • RAG เก็บความทรงจำระยะยาว (Extracted Memories)
```

### รายละเอียดแต่ละเลเยอร์:
1. **🔥 Hot Cache (Upstash Redis REST API - `engine/redis_cache.py`):**
   - **วัตถุประสงค์:** ความเร็วสูงสุด ตอบสนองหน้าบ้านและโหลด State ไปป์ไลน์ได้ทันทีโดยไม่ต้องรอ Query ฐานข้อมูลหนักๆ
   - **`session:{session_id}:state`:** เก็บ Live Kinematics (`a_pos`, `p_pos`, `affection`, `desire`, `tension_gauge`, `current_outfit`)
   - **`session:{session_id}:rounds`:** เก็บประวัติ 20 เทิร์นล่าสุดด้วยคำสั่ง Atomic Pipeline `RPUSH` + `LTRIM key -20 -1` (จำกัดขนาด Sliding Window อัตโนมัติ)
2. **☕ Warm Storage (Neon Serverless PostgreSQL - `engine/postgres_core.py`):**
   - **วัตถุประสงค์:** ความคงทนของข้อมูล (ACID Persistence) สำรองเซฟเกมถาวร
   - รันผ่าน `asyncio.create_task()` เบื้องหลัง เพื่อไม่ให้บล็อก SSE Stream ที่กำลังพ่นกลับไปหาผู้เล่น
   - **ตาราง `users`:** เก็บข้อมูลตัวตน (`gst_<uuid>` หรือ Google Member)
   - **ตาราง `game_sessions`:** เก็บเซฟเกมและความคืบหน้าของแต่ละแคมเปญ
   - **ตาราง `session_rounds`:** บันทึกโครงสร้าง `UnifiedInteractionRound` ทั้งก้อนลงในคอลัมน์ `round_data` (JSONB)
3. **🧊 Cold Storage (Qdrant Vector DB - `engine/memory_core.py`):**
   - **วัตถุประสงค์:** ความจำระยะยาวเชิงความหมาย (Semantic Long-term RAG)
   - เมื่อ Evaluator สกัดความจำ (`memory_extracted`) ระบบจะแปลงเป็น Vector Embeddings บันทึกลง Qdrant เพื่อค้นหามาย้อนเตือนความจำในอนาคต

---

## 📦 4. แกนหลัก `UNIFIED_ROUND_SPEC` (Master Round Blueprint)
- **1 Round ในระบบของเรา = 1 วงรอบเหตุการณ์สมบูรณ์ (Atomic Unit)**
  $$\text{Player Input (สิ่งที่ผู้เล่นกระทำ)} \longrightarrow \text{Response Timeline (สิ่งที่โลกและบอทตอบสนอง)} \longrightarrow \text{State Snapshot (สเตตัสผลลัพธ์)}$$
- **โครงสร้างของ 1 Round:**
  ```json
  {
    "round_id": "round_1725711950_001",
    "round_number": 1,
    "timestamp": 1725711950000,
    "player": { "text": "สวัสดีครับ", "action": null },
    "response": [
      { "order": 1, "type": "vo_main", "text": "สายลมอุ่นพัดผ่านหน้าต่าง..." },
      { "order": 2, "type": "action", "text": "(เงยหน้าขึ้นมอง)" },
      { "order": 3, "type": "dialogue", "text": "ยินดีต้อนรับสู่หอสมุดหลวง" }
    ],
    "state": { "a_pos": "นั่งอ่านตำรา", "p_pos": "ยืนหน้าประตู", "affection": 10 }
  }
  ```

---

## ⚡ 5. โครงสร้าง "ตัวแปลง (The Adapter)" ที่ส่งให้ AI แต่ละตัว

เนื่องจาก **AI (Google Gemini / Vertex AI) ไม่รู้จักคำว่า Round หรือ Order** แต่ต้องการรูปแบบบทสนทนาเฉพาะทาง เราจึงมี Adapter แปลงข้อมูลจาก Round ของเราไปให้ AI แต่ละตัวอย่างแม่นยำ:

### 🔄 1-to-1 Mapping:
$$\mathbf{1\ Round\ ใน\ Redis/Neon} \iff \mathbf{1\ เทิร์นที่ส่งให้\ AI\ (2\ ข้อความ:\ User\ 1\ +\ Assistant\ 1)}$$
- 3 Round ใน DB = 3 เทิร์นส่งให้ AI (6 ข้อความ)
- 6 Round ใน DB = 6 เทิร์นส่งให้ AI (12 ข้อความ)

---

### 🧩 กลไกของตัวแปลงในแต่ละเลเยอร์:

#### ก. ฝั่ง Frontend (`frontend/.../ChatRoom.tsx` - ฟังก์ชัน `buildTurnHistory`):
- ดึงรายการบับเบิ้ลทั้งหมดในแชทมารวบรวมตามเทิร์น
- รวมภาษากายและบทพูดของบอทในเทิร์นนั้นเข้าเป็น **1 ข้อความ Assistant เดียวกัน**:
  - `content`: `"*(เงยหน้าขึ้นมอง)* ยินดีต้อนรับสู่หอสมุดหลวง"`
  - `action`: `"เงยหน้าขึ้นมอง"`
  - `voice_over`: `"สายลมอุ่นพัดผ่านหน้าต่าง..."` (แนบห้อยไปด้วยเสมอ)
- ตัดส่งไปหลังบ้าน **6 เทิร์นย้อนหลังล่าสุดพอดีเป๊ะ (`turns.slice(-12)`)**

#### ข. ฝั่ง Backend Dispatcher (`engine/pipeline.py` & `context_builder.py`):
1. **🕵️‍♂️ Evaluator Agent:**
   - ได้รับประวัติ **4 ข้อความล่าสุด (2 เทิร์น)** (`eval_hist[-4:]`)
   - แปลงเป็น **Transcript Text String** ฝังใน System Prompt:
     ```text
     USER: สวัสดีครับ
     ASSISTANT: (เงยหน้าขึ้นมอง) ยินดีต้อนรับสู่หอสมุดหลวง
     ```
   - *เหตุผล:* ส่งเป็น Text Dossier เพื่อให้ AI ทำหน้าที่เป็นกรรมการตัดสิน ไม่งงว่าเป็นคนคุยแชท
2. **🎬 Director Agent:**
   - สกัดบริบท **1 เทิร์นล่าสุดเท่านั้น** จาก `chat_history`
   - แปลงเป็น **Screenplay Script Text** ฝังใน System Prompt โดย **VO อยู่บรรทัดบนสุดเสมอ**:
     ```text
     Director VO: สายลมอุ่นพัดผ่านหน้าต่าง...
     Actor Action: เงยหน้าขึ้นมอง
     Actor Dialogue: ยินดีต้อนรับสู่หอสมุดหลวง
     ```
   - *เหตุผล:* Director ได้อ่านสภาพแวดล้อมก่อนการกระทำตามลำดับเวลาภาพยนตร์ และรู้ว่าเทิร์นที่แล้วบรรยายอะไรไปเพื่อไม่ให้บรรยายซ้ำ
3. **🎭 Actor Agent:**
   - ได้รับ **Message Array สูงสุด 13 ข้อความ (ประวัติ 6 เทิร์น = 12 ข้อความ + ปัจจุบัน 1 ข้อความ)**
   - แปลงเป็นรูปแบบ Native ของ Google Vertex AI (`user` ↔ `model` ห่อด้วย `parts: [{text}]`)
   - **ความปลอดภัย 100%:** Actor จะไม่เห็นฟิลด์ `voice_over` เลย (ป้องกันตัวละครพูดเสียงบรรยายออกมา) และมีระบบ **Defensive Merging** รวบข้อความกรณี Role เดียวกันติดกัน ป้องกัน Vertex AI พ่น Error

---

## 🛠️ 6. Verification & Quality Gates
- **Frontend Check:**
  - `npm run build` (`tsc -b && vite build`) ──► **0 errors (Exit Code 0)**
  - `npx oxlint --deny-warnings` ──► **0 warnings, 0 errors**
- **Backend Check:**
  - `python3 -m py_compile` ──► **0 syntax errors**
- **คำสั่งต้องห้าม:** **ห้ามรัน `npm run dev` เด็ดขาดทุกกรณี** (มี Background Dev Server รันอยู่แล้ว)

---

## 📌 7. สถานะงานปัจจุบัน (Current State)
- โครงสร้าง History และ Adapter ระหว่าง Frontend / Backend / Redis / Neon / Vertex AI สอดประสานกันสมบูรณ์ 100%
- หากเปิด Session ใหม่ AI สามารถอ่านไฟล์นี้ (`HANDOVER_SESSION.md`) เพื่อเข้าใจสถาปัตยกรรมและทำงานต่อได้ทันทีครับ
