# 🌟 The Soul Engine & Unified Experience (Player Edition)

บ้านใหม่ที่ถูกคัดแยกเฉพาะส่วนสำคัญของ **ระบบผู้เล่น (Player Experience)** แบบ Clean Monorepo ไร้ไฟล์ขยะตกค้าง พร้อมส่งขึ้น Production:
- **Backend (`backend/`):** Google Cloud Run (FastAPI + Upstash Redis Hot Cache + Vertex AI)
- **Frontend (`frontend/`):** Cloudflare Pages (React + TypeScript + Dark Minimalist Editorial Design System)

---

## 📁 โครงสร้างระบบ (Architecture)

```text
the_soul_app/
├── .gitignore                         👉 ป้องกัน .env, service_account_key, node_modules
├── README.md                          👉 เอกสารคู่มือระบบและการ Deploy
├── UNIFIED_ROUND_SPEC.md              👉 มาตรฐาน 1 Interaction Round = 1 Atomic Document
│
├── frontend/                          👉 [หน้าบ้านผู้เล่นใหม่ (สำหรับ Cloudflare Pages)]
│   ├── src/
│   │   ├── features/
│   │   │   ├── chat/                  - ระบบห้องแชทสไตล์ X + Unified Round
│   │   │   ├── home/                  - หน้ารายการตัวละครสไตล์ YouTube
│   │   │   ├── characters/            - การ์ดและดีเทลตัวละคร
│   │   │   └── navigation/            - แถบเมนูข้าง (Sidebar)
│   │   └── types/                     - Type Contracts มาตรฐาน TypeScript 100%
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
└── backend/                           👉 [หลังบ้าน AI Engine (สำหรับ Google Cloud Run)]
    ├── agents/                        - Multi-Agent System (Actor, Director, Evaluator)
    ├── engine/
    │   ├── pipeline.py                - ท่อประมวลผลหลัก (เชื่อม Redis Hot Cache & Vertex AI)
    │   ├── round_assembler.py         - ตัวแพ็กกล่อง Unified Interaction Round
    │   ├── redis_cache.py             - Upstash Redis Hot Cache Client
    │   └── transitions.py             - กฎเหล็กสับฉาก 27 จังหวะ (Protected Domain Core)
    ├── api/                           - FastAPI Routes & Schemas (/api/chat, /api/start_session)
    ├── data/                          - คลังข้อมูลตัวละคร (may.json), ฉาก, และโลก (worlds)
    ├── Dockerfile                     - คำสั่งประกอบร่างคอนเทนเนอร์สำหรับ Google Cloud Run
    ├── requirements.txt               - ไลบรารี Python เฉพาะที่จำเป็น
    └── main.py                        - ทางเข้าเซิร์ฟเวอร์หลัก
```

---

## 🚀 คู่มือการนำขึ้นระบบจริง (Deployment Guide)

### 1. หลังบ้าน: Google Cloud Run (`backend/`)
1. ไปที่ **Google Cloud Console** $\rightarrow$ **Cloud Run** $\rightarrow$ กด **"Create Service"**
2. เลือก **"Continuously deploy from a repository"** และชี้มาที่ GitHub Repo นี้
3. ตั้งค่า Build Context / Source:
   - **Root Directory / Dockerfile Directory:** `backend`
4. การตั้งค่า Service:
   - **Region:** `asia-southeast1` (Singapore)
   - **Authentication:** เลือก `Allow unauthenticated invocations`
5. **Environment Variables (ใส่ในหน้า Cloud Run):**
   - `UPSTASH_REDIS_REST_URL`: URL ของ Upstash Redis
   - `UPSTASH_REDIS_REST_TOKEN`: Token ของ Upstash Redis
   - `VERTEX_PROJECT`: Google Cloud Project ID
   - `VERTEX_LOCATION`: `us-central1` หรือ `asia-southeast1`
   - `GOOGLE_GENAI_USE_ENTERPRISE`: `True`

---

### 2. หน้าบ้าน: Cloudflare Pages (`frontend/`)
1. ไปที่ **Cloudflare Dashboard** $\rightarrow$ **Workers & Pages** $\rightarrow$ **Create Application** $\rightarrow$ **Pages**
2. เลือก **Connect to Git** และเลือก GitHub Repo นี้
3. ตั้งค่า Build Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Build output directory:** `dist`
4. กด **Save and Deploy** เสร็จสิ้น!

---

## 🧪 การทดสอบระบบในเครื่อง (Verification)

### Backend:
```bash
cd backend
python3 test_unified_round.py
python3 test_redis_hot_cache.py
python3 test_kinematics_redis_sync.py
```

### Frontend:
```bash
cd frontend
npm run build
npx oxlint --deny-warnings
```
