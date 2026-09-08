# 📋 Project Handover & System Status (The Soul Engine 5.5)
> **เอกสารส่งต่องานสำหรับ AI Session ถัดไป**  
> **วันที่บันทึก:** 2026-09-08 | **สถานะล่าสุด:** พร้อมทำงานต่อเนื่องทันที 100%

---

## 🎯 1. ภาพรวมโปรเจกต์และขอบเขตโฟลเดอร์ (Workspace Scope & Architecture)
โปรเจกต์นี้คือ **"The Soul Engine 5.5"** ซึ่งกำลังรันและพัฒนาบน Production ใหม่:

### 📂 กฎการแบ่งแยกโฟลเดอร์ (Strict Folder Scope):
- **🟢 Active Production Root (แอปใหม่ - โฟลเดอร์ทำงานหลักแห่งเดียว):**
  - ทุกการพัฒนา, การค้นหา (`grep_search`), การแก้ไข, การสร้างไฟล์ หรือรันคำสั่ง **ต้องทำอยู่ภายใน `the_soul_app/` เท่านั้น**
  - **Frontend:** `the_soul_app/frontend/` (React + TypeScript + Tailwind CSS)
  - **Backend:** `the_soul_app/backend/` (FastAPI + Neon PostgreSQL + Upstash Redis Hot Cache + Google Vertex AI)
- **🔴 Legacy Archives (แอปเก่า - คลังข้อมูลอ้างอิง ห้ามแตะ 100%):**
  - `_legacy_my_ai_engine/` (โค้ด AI Engine ดั้งเดิม: Evaluator, Director, Actor และ Prompt เก่า)
  - `_legacy_soul_backend/` (Backend เก่า)
  - `chat-ui/` (UI เก่า)
  - **กฎเหล็ก:** โฟลเดอร์เหล่านี้ถูกเก็บไว้เป็น "คลังอ้างอิง (Read-Only Reference) ปลอดภัย 100%" **ห้ามแก้ไขหรือสร้างไฟล์ใหม่เด็ดขาด** หากต้องการศึกษาตรรกะเดิมหรือก๊อปปี้ฟีเจอร์ ให้ใช้คำสั่ง `view_file` เพื่อนำไอเดียมาต่อยอดใน `the_soul_app/` เท่านั้น

### ☁️ เซิร์ฟเวอร์ Production บน Google Cloud Run:
- **Service Name:** `the-soul-backend`
- **ภูมิภาค (Region):** `asia-southeast1` (Singapore)
- **สถาปัตยกรรม:** เซิร์ฟเวอร์จริงรัน Backend จาก `the_soul_app/backend/` ให้บริการ API ต่างๆ เช่น `/api/chat`, `/api/evaluator`, `/api/director`
- **Authentication & Vertex AI:** รันแบบ Keyless ผ่าน Google Service Account IAM สิทธิ์ `Vertex AI User` โดยตรง ไม่ต้องใช้ Service Account Key JSON และเชื่อมต่อ Google Vertex AI API (Location: `global`) ในการเรียกโมเดล Gemini ทั้งหมด

---

## 🤖 2. โมเดล AI ประจำแต่ละ Agent (Current Active Models)
ทุก Agent ถูกเซ็ตตรงตามแอปเก่าเป๊ะ และรันผ่าน Google ADC (Vertex AI) ใน `location: "global"` โดย**ไม่มีระบบ Fallback Cascade**:

| Agent | โมเดลที่ใช้งาน | Thinking Config | หน้าที่หลัก |
| :--- | :--- | :--- | :--- |
| **🕵️‍♂️ Evaluator Agent** | `gemini-3.5-flash-lite` | `thinking_level="medium"` | สอดแนม/ประเมิน Affection, Desire, Stance, Posture, Beat Routing |
| **🎬 Director Agent** | `gemini-3.5-flash-lite` | `thinking_level="medium"` | ควบคุมผัสสะ บรรยากาศ และพรรณนาฉาก (Voice Over: Gear 1 / 2 / 3) |
| **🎭 Actor Agent** | `gemini-3.8-flash` | `thinking_level="medium"` | สวมบทบาท ตอบโต้ Action และ Dialogue ในรูปแบบ JSON Block |

---

## 🔄 3. สิ่งที่เพิ่งทำเสร็จสมบูรณ์ล่าสุด (Recent Key Implementations)

### ก. การปรับจูนสถาปัตยกรรมประวัติแชท (History & Turn Alignment) ให้เท่าแอปเก่า 100%
ก่อนหน้านี้แอปใหม่ส่งบับเบิ้ลแบบแยกชิ้นและไม่จำกัด ทำให้ประวัติบวมและหลุดสเปก เราได้แก้ไขให้ตรงกับสเปกเดิมแล้ว:

1. **นิยามของ 1 เทิร์น (Turn Definition):**
   - **1 เทิร์น = 2 ข้อความเสมอ** (`user` 1 ข้อความ + `assistant` 1 ข้อความ)
   - สอดคล้องกับ **1 Round ใน `UNIFIED_ROUND_SPEC`** (Neon & Redis) แบบ 1-to-1
   - **6 เทิร์น = 12 ข้อความคู่สลับกัน**

2. **Frontend (`the_soul_app/frontend/src/features/chat/components/chat-room/ChatRoom.tsx`):**
   - มีฟังก์ชัน `buildTurnHistory(chatMessages, 6)`:
     - รวมบทพูดและภาษากายของบอทในเทิร์นนั้นเป็นข้อความเดียว: `*(action)* dialogue`
     - แนบ `voice_over` ของเทิร์นนั้นไปด้วยในฟิลด์ `voice_over: botVo`
     - ตัดประวัติย้อนหลัง **6 เทิร์นพอดีเป๊ะ (สูงสุด 12 ข้อความ)**

3. **Backend (`the_soul_app/backend/engine/pipeline.py` & `context_builder.py`):**
   - หัว Pipeline ตัด `raw_history = history[-12:]`
   - **🕵️‍♂️ Evaluator:** ได้รับข้อความ **4 ข้อความล่าสุด (2 เทิร์น)** เป็น Text Transcript (`USER:` / `ASSISTANT:`) ฝังใน System Prompt
   - **🎬 Director:** สกัดบริบท **1 เทิร์นล่าสุด** (`Director VO:`, `Actor Action:`, `Actor Dialogue:`) ฝังใน System Prompt โดย VO จะอยู่บรรทัดบนสุดเสมอ
   - **🎭 Actor:** ได้รับ **Message Array สูงสุด 13 ข้อความ (ประวัติ 6 เทิร์น = 12 ข้อความ + 1 ข้อความปัจจุบันของผู้เล่น)** ในรูปแบบ `user` ↔ `model` (ห่อด้วย `parts: [{text}]`)

4. **ระบบความปลอดภัยของ Vertex AI (`the_soul_app/backend/agents/actor_agent.py`):**
   - มีฟังก์ชันป้องกัน Role ซ้ำ (Defensive Merging): หากมี `user` หรือ `model` ติดกัน 2 ข้อความ จะจับรวมข้อความ (`\n`) ทันที เพื่อรับประกัน Strict Alternating Turns ตามกฎของ Vertex AI

---

## 💾 4. สถาปัตยกรรมข้อมูลและระบบไอดี (Data, Identity & Storage)
- **ระบบไอดี, เซสชัน และปรัชญากุญแจโรงแรม:** ดูรายละเอียดเชิงลึกและเช็กลิสต์ได้ที่ **[`IDENTITY_AND_SESSION_SPEC.md`](./IDENTITY_AND_SESSION_SPEC.md)**
- **The Single Source of Truth ของข้อมูลรอบการเล่น:** ดูรายละเอียดเต็มได้ที่ `UNIFIED_ROUND_SPEC.md`
- **Upstash Redis Hot Cache (`redis_cache.py`):**
  - เก็บรอบการเล่น 20 เทิร์นล่าสุด: `session:{session_id}:rounds` (List ของ Unified Round)
  - เก็บสถานะ Kinematics และฟิสิกส์สด: `session:{session_id}:state`
- **Neon PostgreSQL (`postgres_core.py`):**
  - บันทึกผู้ใช้และสถานะ Guest/Member: ตาราง `users`
  - บันทึกสถานะห้องเล่น: ตาราง `game_sessions`
  - บันทึกถาวรประวัติการเล่น: ตาราง `game_rounds` ในรูปแบบ `JSONB`

---

## 🚀 5. สถานะ Git และโค้ดปัจจุบัน
- **Frontend Quality Gate:**
  - `npm run build` (`tsc -b && vite build`) → **Passed (Exit Code 0)**
  - `npx oxlint --deny-warnings` → **Passed (0 warnings, 0 errors)**
- **Backend Quality Gate:**
  - `python3 -m py_compile` → **Passed (0 syntax errors)**
- **Git State:**
  - Commit ล่าสุด: `83d6a60` (*fix(engine): restore legacy 6-turn history architecture and bubble aggregation across agents*)
  - พุชขึ้น `origin/main` บน GitHub เรียบร้อยแล้ว

---

## 📌 6. สิ่งที่ AI ตัวต่อไปควรทราบเมื่อเริ่มงานต่อทันที (Next Directives)
1. **กฎเหล็กการทำงาน (จาก `GEMINI.md`):**
   - **โฟลเดอร์ทำงานหลักแห่งเดียว:** ทำงานและแก้ไขไฟล์เฉพาะใน **`the_soul_app/`** เท่านั้น (โฟลเดอร์ `_legacy_*` และ `chat-ui/` ห้ามแก้ไขหรือสร้างไฟล์ใหม่เด็ดขาด เป็น Read-Only Reference)
   - **ห้ามรันคำสั่ง `npm run dev` เด็ดขาดทุกกรณี** (มี Dev Server รันอยู่ใน Background อยู่แล้ว)
   - การ Build / Lint ทุกครั้งต้องผ่าน 100% (`npm run build` และ `npx oxlint --deny-warnings`)
2. **งานที่ดำเนินอยู่ตอนนี้:**
   - ผู้ใช้เพิ่งทำความเข้าใจโครงสร้าง History / Turn Sizing / VO Attachment ระหว่าง Frontend และ Backend ครบถ้วน
   - หากผู้ใช้สั่งให้ทดสอบ ให้ช่วยผู้ใช้มอนิเตอร์การรันเทิร์นบน Cloud Run หรือตรวจสอบ Log ของ API `/api/chat`
   - หากผู้ใช้มีคำถามเกี่ยวกับระบบ ไอดีผู้เล่น เซสชัน หรือต้องการปรับแต่งฟีเจอร์ใด สามารถอ้างอิงเอกสารฉบับนี้, **`IDENTITY_AND_SESSION_SPEC.md`** และ **`UNIFIED_ROUND_SPEC.md`** ได้ทันที
