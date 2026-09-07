import asyncio
import json
import os
import uuid
import asyncpg
import os
import uuid
import asyncpg

# Read .env natively
if os.path.exists(".env"):
    with open(".env", "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip().strip('"').strip("'")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL is not set in .env")

# Strip query params for asyncpg and pass ssl='require'
clean_url = DATABASE_URL.split("?")[0]

async def run_test():
    print(f"🔗 Connecting to Neon Postgres: {clean_url.split('@')[-1]} ...")
    conn = await asyncpg.connect(clean_url, ssl="require")
    try:
        # 1. Check tables
        tables = await conn.fetch("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name IN ('users', 'game_sessions', 'session_rounds');
        """)
        found_tables = [t['table_name'] for t in tables]
        print(f"✅ Found tables in Neon: {found_tables}")
        assert "users" in found_tables, "Missing users table"
        assert "game_sessions" in found_tables, "Missing game_sessions table"
        assert "session_rounds" in found_tables, "Missing session_rounds table"

        # 2. Test Guest ID creation
        guest_id = f"gst_{uuid.uuid4()}"
        await conn.execute("""
            INSERT INTO users (id, name, is_guest)
            VALUES ($1, $2, $3)
            ON CONFLICT (id) DO NOTHING;
        """, guest_id, "นักเดินทางนิรนาม", True)
        print(f"✅ [GUEST ID TEST] Created guest user: {guest_id}")

        # 3. Test Member ID (Google) creation
        google_user_id = f"usr_{uuid.uuid4().hex[:12]}"
        test_google_id = f"google_sub_{uuid.uuid4().hex[:8]}"
        await conn.execute("""
            INSERT INTO users (id, email, name, avatar_url, google_id, is_guest)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (google_id) DO NOTHING;
        """, google_user_id, "alice.test@gmail.com", "Alice Test", "https://avatar.com/alice.png", test_google_id, False)
        print(f"✅ [MEMBER ID TEST] Created Google member: {google_user_id} (Google ID: {test_google_id})")

        # 4. Test Game Session creation (linked to Guest)
        session_id = f"sess_{uuid.uuid4()}"
        campaign_id = "draft_1784828245593" # Mahiro campaign ID
        character_id = "draft_1784828245593"
        await conn.execute("""
            INSERT INTO game_sessions (id, user_id, campaign_id, character_id, status)
            VALUES ($1, $2, $3, $4, $5);
        """, session_id, guest_id, campaign_id, character_id, "active")
        print(f"✅ [SESSION TEST] Created game session: {session_id} for user: {guest_id}")

        # 5. Test Unified Round storage (JSONB)
        round_id = f"rnd_{session_id}_000"
        sample_round_data = {
            "round_id": round_id,
            "round_number": 0,
            "timestamp": 1725711900000,
            "player": None,
            "response": [
                {
                    "order": 1,
                    "type": "vo_main",
                    "text": "แสงอาทิตย์อัสดงสีส้มอิฐสาดส่องลอดผ่านหน้าต่างบานเกล็ด บรรยากาศเงียบสงัด"
                },
                {
                    "order": 2,
                    "type": "action",
                    "text": "(มาฮิโระนั่งกอดอกอยู่ริมโต๊ะทำงาน ปอยผมทิ้งตัวลงมาคลอเคลียแก้ม)"
                },
                {
                    "order": 3,
                    "type": "dialogue",
                    "text": "ถ้าจะยืนมองอยู่ตรงประตูก็เข้ามาข้างในสิ... ลมมันตีเข้ามาหนาวนะ"
                }
            ],
            "state": {
                "affection": 20,
                "desire": 10,
                "a_pos": "นั่งกอดอกริมโต๊ะทำงาน",
                "p_pos": "ยืนอยู่หน้าประตูห้อง",
                "scene_id": "scene_library_afternoon",
                "beat_id": "beat_opening_encounter"
            }
        }
        await conn.execute("""
            INSERT INTO session_rounds (id, session_id, round_number, round_data)
            VALUES ($1, $2, $3, $4::jsonb);
        """, round_id, session_id, 0, json.dumps(sample_round_data, ensure_ascii=False))
        print(f"✅ [JSONB ROUND TEST] Saved Atomic Unified Round 0 into session_rounds!")

        # 6. Test Reading back from JSONB
        row = await conn.fetchrow("""
            SELECT round_number, round_data FROM session_rounds 
            WHERE session_id = $1 AND round_number = 0;
        """, session_id)
        saved_data = json.loads(row['round_data'])
        print(f"✅ [RETRIEVAL TEST] Successfully retrieved round 0 from JSONB!")
        print(f"   - Actor Posture: {saved_data['state']['a_pos']}")
        print(f"   - Response Segments: {len(saved_data['response'])} items")

        print("\n🎉 ALL TESTS PASSED! Neon PostgreSQL schema and identity architecture is 100% verified!")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(run_test())
