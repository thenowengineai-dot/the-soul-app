import logging
import os

# ==========================================
# 🔑 ตั้งค่า API KEYS และ CREDENTIALS (GLOBAL)
# ตั้งไว้ตรงนี้เพื่อให้ทุก Agent ในระบบดึงไปใช้ได้อัตโนมัติ
# ==========================================
import tempfile

# ==========================================
# 🔐 AUTHENTICATION (GCP vs GEMINI API KEY)
# ==========================================
if os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
    print("✅ [AUTH] GOOGLE_APPLICATION_CREDENTIALS is already set.")
elif "GCP_CREDENTIALS_JSON" in os.environ:
    try:
        creds_json = os.environ["GCP_CREDENTIALS_JSON"]
        fd, path = tempfile.mkstemp(suffix=".json")
        with os.fdopen(fd, 'w') as f:
            f.write(creds_json)
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = path
        print("✅ [AUTH] Successfully loaded GCP credentials from Secret in main.py.")
    except Exception as e:
        print(f"❌ [AUTH] Failed to load GCP credentials: {e}")
elif "GEMINI_API_KEY" in os.environ:
    print("✅ [AUTH] Using GEMINI_API_KEY for authentication.")
else:
    print("⚠️ [AUTH] No GCP_CREDENTIALS_JSON or GEMINI_API_KEY found. API calls may fail.")

# ==========================================

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ดึง Router จากไฟล์ api/routes.py มาใช้งาน
from api.routes import router as api_router

# 🛡️ SMART CORS CONFIGURATION (ยืดหยุ่น & ปลอดภัยสูง รองรับ Localhost และ Cloud Run ทุกพอร์ต)
default_dev_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8080",
]

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
cors_origins = list(default_dev_origins)
if allowed_origins_env and allowed_origins_env != "*":
    for orig in allowed_origins_env.split(","):
        orig_clean = orig.strip()
        if orig_clean and orig_clean not in cors_origins:
            cors_origins.append(orig_clean)

# Regular expression to match any localhost / 127.0.0.1 port and Google Cloud Run domains
allow_origin_regex = r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$|^https://.*\.run\.app$|^https://.*\.a\.run\.app$"

# 🛡️ CONDITIONAL SWAGGER DOCS (ซ่อนโครงสร้าง API บน Production ป้องกันคู่แข่งส่อง)
is_production = os.getenv("ENVIRONMENT", "development").lower() == "production"

app = FastAPI(
    title="The Soul AI Character Engine", 
    description="ระบบ Game Engine สมัยใหม่ที่ขับเคลื่อนด้วย Multi-Agent System & Unified Round",
    version="2.0.0",
    docs_url=None if is_production else "/docs",
    redoc_url=None if is_production else "/redoc",
    openapi_url=None if is_production else "/openapi.json"
)

# ตั้งค่า CORS ป้องกันเว็บแปลกปลอมยิงเข้าหา API
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# นำ Endpoint จาก routes.py มาแปะเข้ากับแอปหลัก โดยเติม /api นำหน้า
app.include_router(api_router, prefix="/api")

@app.get("/")
async def health_check():
    """
    Endpoint สำหรับเช็กว่า Server รันอยู่ไหม
    """
    return {"status": "ok", "message": "AI Character Engine is running smoothly! (Google AI Studio Ready)"}

# ==========================================
# คำสั่งรันเซิร์ฟเวอร์
# ==========================================
if __name__ == "__main__":
    # รันด้วย Uvicorn (รองรับ PORT จาก Environment Variable สำหรับ Hugging Face)
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
