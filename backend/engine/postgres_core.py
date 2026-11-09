import os
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional
import asyncpg

from engine.telemetry import get_telemetry_logger

logger = get_telemetry_logger("POSTGRES")


class PostgresCore:
    """
    PostgreSQL Client for Neon Serverless Postgres
    ---------------------------------------------
    Manages persistent storage for:
    1. Users (users table: guest & member identities)
    2. Game Sessions (game_sessions table: save slot metadata)
    3. Session Rounds (session_rounds table: complete UnifiedInteractionRound JSONB archives)
    """

    _pool: Optional[asyncpg.Pool] = None

    def __init__(self, database_url: Optional[str] = None):
        raw_url = database_url or os.getenv("DATABASE_URL", "")
        if not raw_url:
            self._load_env_fallback()
            raw_url = os.getenv("DATABASE_URL", "")

        self.database_url = raw_url.strip("\"'")
        if self.database_url:
            # Strip query params for asyncpg connection string compatibility
            self.clean_url = self.database_url.split("?")[0]
        else:
            self.clean_url = ""
            logger.warning("DATABASE_URL not found for PostgresCore.")

    def _load_env_fallback(self):
        env_paths = [
            os.path.join(os.getcwd(), ".env"),
            os.path.join(os.path.dirname(__file__), "..", ".env"),
        ]
        for path in env_paths:
            if os.path.exists(path):
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        for line in f:
                            line = line.strip()
                            if line.startswith("#") or "=" not in line:
                                continue
                            k, v = line.split("=", 1)
                            os.environ[k.strip()] = v.strip().strip("\"'")
                except Exception as e:
                    logger.warning(f"Failed to read fallback .env from {path}: {e}")

    async def get_pool(self) -> asyncpg.Pool:
        """Lazily initializes and returns the asyncpg connection pool."""
        if PostgresCore._pool is None or PostgresCore._pool._closed:
            if not self.clean_url:
                raise RuntimeError("DATABASE_URL is not configured.")
            logger.info("Initializing Neon PostgreSQL asyncpg connection pool...")
            PostgresCore._pool = await asyncpg.create_pool(
                self.clean_url,
                ssl="require",
                min_size=1,
                max_size=10,
                command_timeout=15.0
            )
            logger.info("✅ Neon PostgreSQL connection pool ready.")
        return PostgresCore._pool

    async def close_pool(self):
        """Gracefully closes the connection pool."""
        if PostgresCore._pool and not PostgresCore._pool._closed:
            await PostgresCore._pool.close()
            logger.info("Neon PostgreSQL connection pool closed.")

    # -------------------------------------------------------------
    # 👤 User & Identity Operations
    # -------------------------------------------------------------

    async def get_or_create_user(
        self,
        user_id: str,
        name: str = "นักเดินทางนิรนาม",
        email: Optional[str] = None,
        avatar_url: Optional[str] = None,
        google_id: Optional[str] = None,
        is_guest: bool = False
    ) -> Dict[str, Any]:
        """Ensures a user exists in the users table and returns their record."""
        pool = await self.get_pool()
        async with pool.acquire() as conn:
            # Check if user exists by ID
            row = await conn.fetchrow("SELECT * FROM users WHERE id = $1;", user_id)
            if row:
                # Update last login
                await conn.execute("UPDATE users SET last_login_at = NOW() WHERE id = $1;", user_id)
                return dict(row)

            # Check if user exists by Google ID
            if google_id:
                row_google = await conn.fetchrow("SELECT * FROM users WHERE google_id = $1;", google_id)
                if row_google:
                    await conn.execute("UPDATE users SET last_login_at = NOW() WHERE id = $1;", row_google["id"])
                    return dict(row_google)

            # Insert new user
            row = await conn.fetchrow("""
                INSERT INTO users (id, email, name, avatar_url, google_id, is_guest, created_at, last_login_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                ON CONFLICT (id) DO UPDATE SET last_login_at = NOW()
                RETURNING *;
            """, user_id, email, name, avatar_url, google_id, is_guest)
            logger.info(f"Created user record: {user_id} (is_guest={is_guest})")
            return dict(row)

    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves user profile by ID."""
        pool = await self.get_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("SELECT * FROM users WHERE id = $1;", user_id)
            return dict(row) if row else None

    # -------------------------------------------------------------
    # 🎮 Game Session Operations
    # -------------------------------------------------------------

    async def create_game_session(
        self,
        session_id: str,
        user_id: str,
        campaign_id: str,
        character_id: str
    ) -> Dict[str, Any]:
        """Creates a new game session save slot."""
        pool = await self.get_pool()
        async with pool.acquire() as conn:
            # Ensure user exists first
            user_exists = await conn.fetchval("SELECT 1 FROM users WHERE id = $1;", user_id)
            if not user_exists:
                is_guest = user_id.startswith("gst_")
                await conn.execute("""
                    INSERT INTO users (id, name, is_guest)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (id) DO NOTHING;
                """, user_id, "นักเดินทางนิรนาม" if is_guest else "Player", is_guest)

            row = await conn.fetchrow("""
                INSERT INTO game_sessions (id, user_id, campaign_id, character_id, status, created_at, updated_at)
                VALUES ($1, $2, $3, $4, 'active', NOW(), NOW())
                ON CONFLICT (id) DO UPDATE SET updated_at = NOW()
                RETURNING *;
            """, session_id, user_id, campaign_id, character_id)
            logger.info(f"Created game session: {session_id} for user: {user_id}")
            return dict(row)

    async def get_game_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a specific game session."""
        pool = await self.get_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("SELECT * FROM game_sessions WHERE id = $1;", session_id)
            return dict(row) if row else None

    async def get_user_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        """Retrieves all active sessions for a user."""
        pool = await self.get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, user_id, campaign_id, character_id, status, created_at, updated_at
                FROM game_sessions
                WHERE user_id = $1 AND status = 'active'
                ORDER BY updated_at DESC;
            """, user_id)
            return [dict(r) for r in rows]

    async def archive_session(self, session_id: str) -> bool:
        """Soft-deletes/archives a game session."""
        pool = await self.get_pool()
        async with pool.acquire() as conn:
            res = await conn.execute("""
                UPDATE game_sessions SET status = 'archived', updated_at = NOW()
                WHERE id = $1;
            """, session_id)
            return "UPDATE" in res

    # -------------------------------------------------------------
    # 📦 Unified Round (JSONB) Operations
    # -------------------------------------------------------------

    async def save_round(
        self,
        session_id: str,
        round_number: int,
        round_data: Dict[str, Any]
    ) -> bool:
        """
        Saves a complete Atomic UnifiedInteractionRound as JSONB.
        Round ID format: rnd_{session_id}_{round_number:03d}
        """
        round_id = f"rnd_{session_id}_{round_number:03d}"
        round_json = json.dumps(round_data, ensure_ascii=False)
        pool = await self.get_pool()
        async with pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO session_rounds (id, session_id, round_number, round_data, created_at)
                VALUES ($1, $2, $3, $4::jsonb, NOW())
                ON CONFLICT (session_id, round_number) 
                DO UPDATE SET round_data = EXCLUDED.round_data;
            """, round_id, session_id, round_number, round_json)

            # Update session timestamp
            await conn.execute("UPDATE game_sessions SET updated_at = NOW() WHERE id = $1;", session_id)
            logger.info(f"Persisted Round {round_number} to Postgres (JSONB) for session: {session_id}")
            return True

    async def get_rounds(self, session_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Retrieves complete Unified Rounds from Postgres JSONB ordered chronologically.
        Used as deep fallback if Redis Hot Cache is empty.
        """
        pool = await self.get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT round_data FROM session_rounds
                WHERE session_id = $1
                ORDER BY round_number ASC
                LIMIT $2;
            """, session_id, limit)
            rounds = []
            for r in rows:
                val = r["round_data"]
                rounds.append(json.loads(val) if isinstance(val, str) else val)
            return rounds

    async def clear_session_rounds(self, session_id: str) -> bool:
        """Deletes all rounds for a session (e.g. on New Game reset)."""
        pool = await self.get_pool()
        async with pool.acquire() as conn:
            await conn.execute("DELETE FROM session_rounds WHERE session_id = $1;", session_id)
            return True

    async def migrate_guest_session(self, old_session_id: str, new_session_id: str, new_user_id: str) -> bool:
        """
        Migrates a guest game_session and its rounds in Neon DB to the registered user.
        """
        pool = await self.get_pool()
        async with pool.acquire() as conn:
            async with conn.transaction():
                target_exists = await conn.fetchval("SELECT 1 FROM game_sessions WHERE id = $1;", new_session_id)
                if target_exists:
                    await conn.execute("DELETE FROM session_rounds WHERE session_id = $1;", new_session_id)
                    await conn.execute("DELETE FROM game_sessions WHERE id = $1;", new_session_id)

                await conn.execute("""
                    UPDATE game_sessions 
                    SET id = $1, user_id = $2, updated_at = NOW() 
                    WHERE id = $3;
                """, new_session_id, new_user_id, old_session_id)
                await conn.execute("""
                    UPDATE session_rounds
                    SET session_id = $1
                    WHERE session_id = $2;
                """, new_session_id, old_session_id)
            logger.info(f"✅ Migrated DB session {old_session_id} -> {new_session_id} for user {new_user_id}")
            return True



    # -------------------------------------------------------------
    # 🪙 Wallet & Coupon Operations
    # -------------------------------------------------------------

    async def get_or_create_wallet(self, user_id: str, default_bonus: int = 50) -> Dict[str, Any]:
        """
        Retrieves user wallet. If it doesn't exist, creates one with default starter bonus.
        """
        pool = await self.get_pool()
        async with pool.acquire() as conn:
            # Ensure user exists in users table
            user_exists = await conn.fetchval("SELECT 1 FROM users WHERE id = $1;", user_id)
            if not user_exists:
                is_guest = user_id.startswith("gst_")
                await conn.execute("""
                    INSERT INTO users (id, name, is_guest)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (id) DO NOTHING;
                """, user_id, "นักเดินทางนิรนาม" if is_guest else "Player", is_guest)

            row = await conn.fetchrow("SELECT * FROM user_wallets WHERE user_id = $1;", user_id)
            if row:
                return dict(row)

            # Create new wallet with starter bonus
            async with conn.transaction():
                new_row = await conn.fetchrow("""
                    INSERT INTO user_wallets (user_id, balance, total_earned, total_spent, updated_at)
                    VALUES ($1, $2, $2, 0, NOW())
                    ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
                    RETURNING *;
                """, user_id, default_bonus)

                if default_bonus > 0:
                    await conn.execute("""
                        INSERT INTO coin_transactions (user_id, amount, balance_after, tx_type, description)
                        VALUES ($1, $2, $2, 'initial_bonus', 'โบนัสเหรียญเริ่มต้นสำหรับผู้ใช้ใหม่');
                    """, user_id, default_bonus)

                logger.info(f"Created wallet for user {user_id} with initial bonus {default_bonus}")
                return dict(new_row)

    async def get_wallet(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves wallet record by user_id."""
        pool = await self.get_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("SELECT * FROM user_wallets WHERE user_id = $1;", user_id)
            return dict(row) if row else None

    async def redeem_coupon(self, user_id: str, code: str) -> Dict[str, Any]:
        """
        Redeems a coupon atomically for a user.
        Enforces:
        1. Coupon exists & is active
        2. Not expired
        3. Within global quota (current_redemptions < max_redemptions)
        4. User has not already redeemed this coupon
        """
        clean_code = code.strip().upper()
        if not clean_code:
            return {"success": False, "message": "กรุณาระบุรหัสคูปอง"}

        # Ensure user wallet exists
        await self.get_or_create_wallet(user_id)

        pool = await self.get_pool()
        async with pool.acquire() as conn:
            async with conn.transaction():
                coupon = await conn.fetchrow("""
                    SELECT * FROM coupons 
                    WHERE code = $1 
                    FOR UPDATE;
                """, clean_code)

                if not coupon:
                    return {"success": False, "message": "รหัสคูปองไม่ถูกต้อง หรือไม่มีในระบบ"}

                if not coupon["is_active"]:
                    return {"success": False, "message": "คูปองนี้ถูกระงับการใช้งานแล้ว"}

                # Check expiration
                if coupon["expires_at"]:
                    now_val = await conn.fetchval("SELECT NOW();")
                    if coupon["expires_at"] < now_val:
                        return {"success": False, "message": "คูปองนี้หมดอายุการใช้งานแล้ว"}

                # Check global quota
                if coupon["current_redemptions"] >= coupon["max_redemptions"]:
                    return {"success": False, "message": "คูปองนี้ถูกใช้งานจนครบโควตาสิทธิ์แล้ว"}

                # Check if user already redeemed
                already_redeemed = await conn.fetchval("""
                    SELECT 1 FROM coupon_redemptions 
                    WHERE coupon_id = $1 AND user_id = $2;
                """, coupon["id"], user_id)

                if already_redeemed:
                    return {"success": False, "message": "คุณเคยแลกรับโค้ดคูปองนี้ไปแล้ว"}

                reward = coupon["coin_reward"]

                # 1. Record redemption
                await conn.execute("""
                    INSERT INTO coupon_redemptions (coupon_id, user_id, coins_granted, redeemed_at)
                    VALUES ($1, $2, $3, NOW());
                """, coupon["id"], user_id, reward)

                # 2. Increment global quota counter
                await conn.execute("""
                    UPDATE coupons 
                    SET current_redemptions = current_redemptions + 1 
                    WHERE id = $1;
                """, coupon["id"])

                # 3. Credit coins to user wallet
                updated_balance = await conn.fetchval("""
                    UPDATE user_wallets 
                    SET balance = balance + $1, 
                        total_earned = total_earned + $1, 
                        updated_at = NOW()
                    WHERE user_id = $2 
                    RETURNING balance;
                """, reward, user_id)

                # 4. Insert ledger transaction
                await conn.execute("""
                    INSERT INTO coin_transactions (user_id, amount, balance_after, tx_type, description)
                    VALUES ($1, $2, $3, 'coupon_redeem', $4);
                """, user_id, reward, updated_balance, f"แลกรับคูปอง {clean_code} (+{reward} เหรียญ)")

                logger.info(f"User {user_id} redeemed coupon {clean_code} (+{reward} coins, new balance: {updated_balance})")
                return {
                    "success": True,
                    "message": f"แลกรับสำเร็จ! ได้รับ +{reward:,} เหรียญ 🪙",
                    "coins_added": reward,
                    "balance": updated_balance
                }

    async def deduct_coins_for_round(
        self,
        user_id: str,
        session_id: str,
        round_number: int,
        amount: int = 10
    ) -> Optional[int]:
        """
        Deducts coins for a completed chat turn/round atomically.
        Returns new balance if successful, or None if balance is insufficient.
        """
        pool = await self.get_pool()
        async with pool.acquire() as conn:
            async with conn.transaction():
                current_balance = await conn.fetchval("""
                    SELECT balance FROM user_wallets 
                    WHERE user_id = $1 
                    FOR UPDATE;
                """, user_id)

                if current_balance is None:
                    # Initialize wallet with 0 or fallback
                    await conn.execute("""
                        INSERT INTO user_wallets (user_id, balance, total_earned, total_spent, updated_at)
                        VALUES ($1, 0, 0, 0, NOW())
                        ON CONFLICT (user_id) DO NOTHING;
                    """, user_id)
                    current_balance = 0

                if current_balance < amount:
                    logger.warning(f"User {user_id} has insufficient balance: {current_balance} < {amount}")
                    return None

                new_balance = await conn.fetchval("""
                    UPDATE user_wallets 
                    SET balance = balance - $1, 
                        total_spent = total_spent + $1, 
                        updated_at = NOW()
                    WHERE user_id = $2 
                    RETURNING balance;
                """, amount, user_id)

                await conn.execute("""
                    INSERT INTO coin_transactions (user_id, amount, balance_after, tx_type, session_id, round_number, description)
                    VALUES ($1, $2, $3, 'round_deduction', $4, $5, $6);
                """, user_id, -amount, new_balance, session_id, round_number, f"ค่าบริการรอบสนทนาที่ {round_number}")

                logger.info(f"Deducted {amount} coins from {user_id} for round {round_number}. Remaining: {new_balance}")
                return new_balance

    async def migrate_guest_wallet(self, guest_id: str, member_id: str) -> bool:
        """
        Migrates wallet balance, coupon redemptions, and transactions from guest to member.
        """
        if not guest_id or not member_id or guest_id == member_id:
            return False

        pool = await self.get_pool()
        async with pool.acquire() as conn:
            async with conn.transaction():
                guest_wallet = await conn.fetchrow("SELECT * FROM user_wallets WHERE user_id = $1 FOR UPDATE;", guest_id)
                if not guest_wallet:
                    return False

                # Ensure member wallet exists
                member_wallet = await conn.fetchrow("SELECT * FROM user_wallets WHERE user_id = $1 FOR UPDATE;", member_id)
                if not member_wallet:
                    await conn.execute("""
                        INSERT INTO user_wallets (user_id, balance, total_earned, total_spent, updated_at)
                        VALUES ($1, 0, 0, 0, NOW())
                        ON CONFLICT (user_id) DO NOTHING;
                    """, member_id)

                guest_bal = guest_wallet["balance"]
                guest_earned = guest_wallet["total_earned"]
                guest_spent = guest_wallet["total_spent"]

                # Transfer balances
                if guest_bal > 0 or guest_earned > 0 or guest_spent > 0:
                    await conn.execute("""
                        UPDATE user_wallets 
                        SET balance = balance + $1, 
                            total_earned = total_earned + $2, 
                            total_spent = total_spent + $3, 
                            updated_at = NOW()
                        WHERE user_id = $4;
                    """, guest_bal, guest_earned, guest_spent, member_id)

                    await conn.execute("""
                        UPDATE user_wallets 
                        SET balance = 0, updated_at = NOW() 
                        WHERE user_id = $1;
                    """, guest_id)

                # Transfer coupon redemptions (ignore if member already redeemed same coupon)
                await conn.execute("""
                    UPDATE coupon_redemptions 
                    SET user_id = $1 
                    WHERE user_id = $2 
                    AND NOT EXISTS (
                        SELECT 1 FROM coupon_redemptions cr2 
                        WHERE cr2.user_id = $1 AND cr2.coupon_id = coupon_redemptions.coupon_id
                    );
                """, member_id, guest_id)

                # Transfer ledger transactions
                await conn.execute("""
                    UPDATE coin_transactions 
                    SET user_id = $1 
                    WHERE user_id = $2;
                """, member_id, guest_id)

                logger.info(f"🔄 Migrated wallet from {guest_id} (+{guest_bal} coins) to {member_id}")
                return True

    # -------------------------------------------------------------
    # 🧠 Long-Term Memory & Session Summaries
    # -------------------------------------------------------------

    async def save_extracted_memory(
        self,
        user_id: str,
        character_id: str,
        memory_text: str,
        session_id: Optional[str] = None
    ) -> bool:
        """
        Saves extracted memory into Neon PostgreSQL.
        Automatically initializes the extracted_memories table if not present.
        """
        if not memory_text or not memory_text.strip():
            return False

        try:
            pool = await self.get_pool()
            async with pool.acquire() as conn:
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS extracted_memories (
                        id SERIAL PRIMARY KEY,
                        user_id TEXT NOT NULL,
                        character_id TEXT NOT NULL,
                        session_id TEXT,
                        memory_text TEXT NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                    CREATE INDEX IF NOT EXISTS idx_extracted_memories_user_char 
                    ON extracted_memories (user_id, character_id);
                """)
                await conn.execute("""
                    INSERT INTO extracted_memories (user_id, character_id, session_id, memory_text, created_at)
                    VALUES ($1, $2, $3, $4, NOW());
                """, user_id, character_id, session_id, memory_text.strip())
                logger.info(f"🧠 [NEON MEMORY] Saved extracted memory for {character_id}: '{memory_text[:60]}...'")
                return True
        except Exception as e:
            logger.error(f"Failed to save extracted memory to Neon DB: {e}")
            return False

    async def get_user_active_sessions_summary(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Retrieves active session summaries for a user across all characters.
        Fetches the latest round from session_rounds to display the last message.
        """
        try:
            pool = await self.get_pool()
            async with pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT DISTINCT ON (s.character_id)
                        s.id, s.character_id, s.created_at, s.updated_at, s.status,
                        (
                            SELECT sr.round_data 
                            FROM session_rounds sr 
                            WHERE sr.session_id = s.id 
                            ORDER BY sr.round_number DESC 
                            LIMIT 1
                        ) as latest_round
                    FROM game_sessions s
                    WHERE s.user_id = $1 AND s.status = 'active'
                    ORDER BY s.character_id, s.updated_at DESC;
                """, user_id)

                summaries = []
                for r in rows:
                    last_msg = None
                    if r["latest_round"]:
                        rd = r["latest_round"]
                        if isinstance(rd, str):
                            try:
                                rd = json.loads(rd)
                            except Exception:
                                rd = {}
                        responses = rd.get("response", [])
                        if responses:
                            last_seg = responses[-1]
                            last_msg = {
                                "role": "ai",
                                "message": last_seg.get("text", ""),
                                "action": last_seg.get("action") if last_seg.get("type") == "action" else None,
                                "created_at": r["updated_at"].isoformat() if r["updated_at"] else None
                            }
                    summaries.append({
                        "id": r["id"],
                        "character_id": r["character_id"],
                        "character_codename": r["character_id"],
                        "status": r["status"],
                        "created_at": r["created_at"].isoformat() if r["created_at"] else None,
                        "updated_at": r["updated_at"].isoformat() if r["updated_at"] else None,
                        "last_message": last_msg
                    })
                return summaries
        except Exception as e:
            logger.error(f"Error fetching active sessions summary from Neon: {e}")
            return []

    async def get_user_sessions_by_character(self, user_id: str, character_id: str) -> List[Dict[str, Any]]:
        """
        Retrieves all save slots for a user and character from Neon PostgreSQL.
        """
        try:
            pool = await self.get_pool()
            async with pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT id, user_id, campaign_id, character_id, status, created_at, updated_at
                    FROM game_sessions
                    WHERE user_id = $1 AND character_id = $2
                    ORDER BY updated_at DESC;
                """, user_id, character_id)
                return [
                    {
                        "id": r["id"],
                        "created_at": r["created_at"].isoformat() if r["created_at"] else None,
                        "updated_at": r["updated_at"].isoformat() if r["updated_at"] else None,
                        "status": r["status"]
                    }
                    for r in rows
                ]
        except Exception as e:
            logger.error(f"Error fetching user sessions for character from Neon: {e}")
            return []

    # -------------------------------------------------------------
    # 🌍 World Studio Atomic Workspace Operations (Neon PostgreSQL)
    # -------------------------------------------------------------

    async def _ensure_studio_tables(self, conn) -> None:
        """Ensures studio_worlds and studio_cards tables and indexes exist in Neon."""
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS studio_worlds (
                id VARCHAR(100) PRIMARY KEY,
                user_id VARCHAR(64) NOT NULL,
                title VARCHAR(255) NOT NULL,
                active_character_id VARCHAR(100),
                has_lore BOOLEAN NOT NULL DEFAULT FALSE,
                has_spark BOOLEAN NOT NULL DEFAULT FALSE,
                character_count INT NOT NULL DEFAULT 0,
                stage_count INT NOT NULL DEFAULT 0,
                cabinet_card_count INT NOT NULL DEFAULT 0,
                lore_data JSONB NOT NULL DEFAULT '{}'::jsonb,
                workspace_data JSONB NOT NULL DEFAULT '{}'::jsonb,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            ALTER TABLE studio_worlds ADD COLUMN IF NOT EXISTS active_character_id VARCHAR(100);
            ALTER TABLE studio_worlds ADD COLUMN IF NOT EXISTS has_lore BOOLEAN NOT NULL DEFAULT FALSE;
            ALTER TABLE studio_worlds ADD COLUMN IF NOT EXISTS has_spark BOOLEAN NOT NULL DEFAULT FALSE;
            ALTER TABLE studio_worlds ADD COLUMN IF NOT EXISTS character_count INT NOT NULL DEFAULT 0;
            ALTER TABLE studio_worlds ADD COLUMN IF NOT EXISTS stage_count INT NOT NULL DEFAULT 0;
            ALTER TABLE studio_worlds ADD COLUMN IF NOT EXISTS cabinet_card_count INT NOT NULL DEFAULT 0;
            ALTER TABLE studio_worlds ADD COLUMN IF NOT EXISTS lore_data JSONB NOT NULL DEFAULT '{}'::jsonb;
            ALTER TABLE studio_worlds ADD COLUMN IF NOT EXISTS workspace_data JSONB NOT NULL DEFAULT '{}'::jsonb;
            CREATE INDEX IF NOT EXISTS idx_studio_worlds_user ON studio_worlds(user_id, updated_at DESC);

            CREATE TABLE IF NOT EXISTS studio_cards (
                id VARCHAR(100) PRIMARY KEY,
                world_id VARCHAR(100) NOT NULL REFERENCES studio_worlds(id) ON DELETE CASCADE,
                user_id VARCHAR(64) NOT NULL,
                card_type VARCHAR(32) NOT NULL,
                category VARCHAR(32) NOT NULL DEFAULT 'general',
                title VARCHAR(255) NOT NULL,
                is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
                anchor_tags TEXT[] NOT NULL DEFAULT '{}',
                content_text TEXT NOT NULL DEFAULT '',
                embedding JSONB DEFAULT NULL,
                card_data JSONB NOT NULL DEFAULT '{}'::jsonb,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_studio_cards_world_type ON studio_cards(world_id, card_type, created_at ASC);
            CREATE INDEX IF NOT EXISTS idx_studio_cards_user_type ON studio_cards(user_id, card_type, updated_at DESC);
        """)

    async def save_studio_world(
        self,
        world_id: str,
        user_id: str,
        title: str,
        workspace_data: Dict[str, Any]
    ) -> bool:
        """
        Saves or updates a complete WorldWorkspace into studio_worlds and studio_cards.
        Decomposes characters, stage cells, cabinet cards, and notes into atomic cards.
        """
        try:
            pool = await self.get_pool()
            clean_title = (title or workspace_data.get("title") or "โลกที่ยังไม่มีชื่อ").strip()
            raw_lore = str(workspace_data.get("rawLore") or "").strip()
            spark_text = str(workspace_data.get("sparkText") or "").strip()
            has_lore = bool(raw_lore)
            has_spark = bool(spark_text)

            characters = workspace_data.get("characters") or []
            stage_cells = workspace_data.get("stageCells") or []
            cabinet_cards = workspace_data.get("cabinetCards") or []
            notes = workspace_data.get("notes") or []
            active_char_id = workspace_data.get("activeCharacterId") or (characters[0].get("id") if characters else None)

            lore_data = {
                "rawLore": raw_lore,
                "extraLoreBlocks": workspace_data.get("extraLoreBlocks") or [],
                "sparkText": spark_text,
                "pinnedCardIds": workspace_data.get("pinnedCardIds") or [],
            }

            async with pool.acquire() as conn:
                await self._ensure_studio_tables(conn)
                async with conn.transaction():
                    # 1. Upsert header into studio_worlds
                    await conn.execute("""
                        INSERT INTO studio_worlds (
                            id, user_id, title, active_character_id, has_lore, has_spark,
                            character_count, stage_count, cabinet_card_count, lore_data, workspace_data,
                            created_at, updated_at
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, NOW(), NOW())
                        ON CONFLICT (id) DO UPDATE SET
                            user_id = EXCLUDED.user_id,
                            title = EXCLUDED.title,
                            active_character_id = EXCLUDED.active_character_id,
                            has_lore = EXCLUDED.has_lore,
                            has_spark = EXCLUDED.has_spark,
                            character_count = EXCLUDED.character_count,
                            stage_count = EXCLUDED.stage_count,
                            cabinet_card_count = EXCLUDED.cabinet_card_count,
                            lore_data = EXCLUDED.lore_data,
                            workspace_data = EXCLUDED.workspace_data,
                            updated_at = NOW();
                    """, world_id, user_id, clean_title, active_char_id, has_lore, has_spark,
                        len(characters), len(stage_cells), len(cabinet_cards),
                        json.dumps(lore_data, ensure_ascii=False),
                        json.dumps(workspace_data, ensure_ascii=False)
                    )

                    # 2. Synchronize studio_cards (Characters)
                    for c in characters:
                        c_id = c.get("id") or f"chr_{uuid.uuid4().hex[:8]}"
                        c_title = c.get("name") or "ตัวละครยูนีค"
                        c_content = f"{c_title}: {c.get('roleTagline', '')}. {c.get('appearanceAndCharm', '')} {c.get('coreWound', '')}".strip()
                        c_tags = [c_title, c.get("matchedArchetypeLabel", "")]
                        await conn.execute("""
                            INSERT INTO studio_cards (
                                id, world_id, user_id, card_type, category, title, is_pinned,
                                anchor_tags, content_text, card_data, created_at, updated_at
                            )
                            VALUES ($1, $2, $3, 'character', 'persona', $4, FALSE, $5, $6, $7::jsonb, NOW(), NOW())
                            ON CONFLICT (id) DO UPDATE SET
                                title = EXCLUDED.title,
                                anchor_tags = EXCLUDED.anchor_tags,
                                content_text = EXCLUDED.content_text,
                                card_data = EXCLUDED.card_data,
                                updated_at = NOW();
                        """, c_id, world_id, user_id, c_title, c_tags, c_content, json.dumps(c, ensure_ascii=False))

                    # 3. Synchronize studio_cards (Stage Cells - 1 cell = 1 card)
                    for cell in stage_cells:
                        cell_id = cell.get("id") or f"cel_{uuid.uuid4().hex[:8]}"
                        cell_title = cell.get("title") or "ฉากเวที"
                        cell_desc = cell.get("description") or ""
                        cell_tags = [cell_title]
                        await conn.execute("""
                            INSERT INTO studio_cards (
                                id, world_id, user_id, card_type, category, title, is_pinned,
                                anchor_tags, content_text, card_data, created_at, updated_at
                            )
                            VALUES ($1, $2, $3, 'stage_cell', 'location', $4, FALSE, $5, $6, $7::jsonb, NOW(), NOW())
                            ON CONFLICT (id) DO UPDATE SET
                                title = EXCLUDED.title,
                                anchor_tags = EXCLUDED.anchor_tags,
                                content_text = EXCLUDED.content_text,
                                card_data = EXCLUDED.card_data,
                                updated_at = NOW();
                        """, cell_id, world_id, user_id, cell_title, cell_tags, cell_desc, json.dumps(cell, ensure_ascii=False))

                    # 4. Synchronize studio_cards (Cabinet Cards)
                    for card in cabinet_cards:
                        card_id = card.get("id") or f"crd_{uuid.uuid4().hex[:8]}"
                        card_title = card.get("title") or "การ์ดข้อมูล"
                        card_cat = card.get("category") or "lore"
                        card_content = card.get("content") or ""
                        card_tags = card.get("tags") or []
                        is_pinned = bool(card.get("isPinnedToStage"))
                        await conn.execute("""
                            INSERT INTO studio_cards (
                                id, world_id, user_id, card_type, category, title, is_pinned,
                                anchor_tags, content_text, card_data, created_at, updated_at
                            )
                            VALUES ($1, $2, $3, 'cabinet_card', $4, $5, $6, $7, $8, $9::jsonb, NOW(), NOW())
                            ON CONFLICT (id) DO UPDATE SET
                                category = EXCLUDED.category,
                                title = EXCLUDED.title,
                                is_pinned = EXCLUDED.is_pinned,
                                anchor_tags = EXCLUDED.anchor_tags,
                                content_text = EXCLUDED.content_text,
                                card_data = EXCLUDED.card_data,
                                updated_at = NOW();
                        """, card_id, world_id, user_id, card_cat, card_title, is_pinned, card_tags, card_content, json.dumps(card, ensure_ascii=False))

                    # 5. Synchronize studio_cards (Notes)
                    for note in notes:
                        note_id = note.get("id") or f"not_{uuid.uuid4().hex[:8]}"
                        note_title = note.get("title") or "โน้ตขยายความ"
                        note_content = note.get("content") or ""
                        note_tags = note.get("tags") or []
                        await conn.execute("""
                            INSERT INTO studio_cards (
                                id, world_id, user_id, card_type, category, title, is_pinned,
                                anchor_tags, content_text, card_data, created_at, updated_at
                            )
                            VALUES ($1, $2, $3, 'note', 'general', $4, FALSE, $5, $6, $7::jsonb, NOW(), NOW())
                            ON CONFLICT (id) DO UPDATE SET
                                title = EXCLUDED.title,
                                anchor_tags = EXCLUDED.anchor_tags,
                                content_text = EXCLUDED.content_text,
                                card_data = EXCLUDED.card_data,
                                updated_at = NOW();
                        """, note_id, world_id, user_id, note_title, note_tags, note_content, json.dumps(note, ensure_ascii=False))

                logger.info(f"💾 [UNIVERSAL_VAULT] Persisted world {world_id} ('{clean_title}') with {len(characters)} chars, {len(stage_cells)} cells, {len(cabinet_cards)} cards")
                return True
        except Exception as e:
            logger.error(f"Error saving studio world {world_id} to Neon: {e}", exc_info=True)
            return False

    async def upsert_studio_card(
        self,
        card_id: str,
        world_id: str,
        user_id: str,
        card_type: str,
        title: str,
        content_text: str,
        card_data: Dict[str, Any],
        category: str = "general",
        anchor_tags: Optional[List[str]] = None,
        is_pinned: bool = False,
        embedding: Optional[Any] = None
    ) -> bool:
        """
        Saves or updates a single card directly into studio_cards in 1-2ms.
        Updates card counters in studio_worlds atomically.
        """
        try:
            pool = await self.get_pool()
            tags = anchor_tags or []
            embed_json = json.dumps(embedding) if embedding else None
            async with pool.acquire() as conn:
                await self._ensure_studio_tables(conn)
                async with conn.transaction():
                    await conn.execute("""
                        INSERT INTO studio_cards (
                            id, world_id, user_id, card_type, category, title, is_pinned,
                            anchor_tags, content_text, embedding, card_data, created_at, updated_at
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, NOW(), NOW())
                        ON CONFLICT (id) DO UPDATE SET
                            card_type = EXCLUDED.card_type,
                            category = EXCLUDED.category,
                            title = EXCLUDED.title,
                            is_pinned = EXCLUDED.is_pinned,
                            anchor_tags = EXCLUDED.anchor_tags,
                            content_text = EXCLUDED.content_text,
                            embedding = COALESCE(EXCLUDED.embedding, studio_cards.embedding),
                            card_data = EXCLUDED.card_data,
                            updated_at = NOW();
                    """, card_id, world_id, user_id, card_type, category, title, is_pinned,
                        tags, content_text, embed_json, json.dumps(card_data, ensure_ascii=False))

                    # Update counter in studio_worlds
                    if card_type == "character":
                        await conn.execute("""
                            UPDATE studio_worlds SET 
                                character_count = (SELECT COUNT(*) FROM studio_cards WHERE world_id = $1 AND card_type = 'character'),
                                updated_at = NOW()
                            WHERE id = $1;
                        """, world_id)
                    elif card_type == "stage_cell":
                        await conn.execute("""
                            UPDATE studio_worlds SET 
                                stage_count = (SELECT COUNT(*) FROM studio_cards WHERE world_id = $1 AND card_type = 'stage_cell'),
                                updated_at = NOW()
                            WHERE id = $1;
                        """, world_id)
                    elif card_type == "cabinet_card":
                        await conn.execute("""
                            UPDATE studio_worlds SET 
                                cabinet_card_count = (SELECT COUNT(*) FROM studio_cards WHERE world_id = $1 AND card_type = 'cabinet_card'),
                                updated_at = NOW()
                            WHERE id = $1;
                        """, world_id)

                logger.info(f"🃏 [CARD_VAULT] Upserted card {card_id} ({card_type}: '{title}') for world {world_id}")
                return True
        except Exception as e:
            logger.error(f"Error upserting card {card_id} to studio_cards: {e}", exc_info=True)
            return False

    async def get_studio_cards(
        self,
        world_id: str,
        card_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieves cards from studio_cards for a world, optionally filtered by card_type.
        """
        try:
            pool = await self.get_pool()
            async with pool.acquire() as conn:
                await self._ensure_studio_tables(conn)
                if card_type:
                    rows = await conn.fetch("""
                        SELECT id, world_id, user_id, card_type, category, title, is_pinned,
                               anchor_tags, content_text, card_data, created_at, updated_at
                        FROM studio_cards
                        WHERE world_id = $1 AND card_type = $2
                        ORDER BY created_at ASC;
                    """, world_id, card_type)
                else:
                    rows = await conn.fetch("""
                        SELECT id, world_id, user_id, card_type, category, title, is_pinned,
                               anchor_tags, content_text, card_data, created_at, updated_at
                        FROM studio_cards
                        WHERE world_id = $1
                        ORDER BY created_at ASC;
                    """, world_id)

                cards = []
                for r in rows:
                    cd = r["card_data"]
                    if isinstance(cd, str):
                        try:
                            cd = json.loads(cd)
                        except Exception:
                            cd = {}
                    cards.append({
                        "id": r["id"],
                        "world_id": r["world_id"],
                        "card_type": r["card_type"],
                        "category": r["category"],
                        "title": r["title"],
                        "is_pinned": r["is_pinned"],
                        "anchor_tags": r["anchor_tags"] or [],
                        "content_text": r["content_text"],
                        "card_data": cd,
                        "created_at": r["created_at"].isoformat() if r["created_at"] else None,
                        "updated_at": r["updated_at"].isoformat() if r["updated_at"] else None,
                    })
                return cards
        except Exception as e:
            logger.error(f"Error getting studio cards for world {world_id}: {e}", exc_info=True)
            return []

    async def delete_studio_card(self, card_id: str, user_id: Optional[str] = None) -> bool:
        """Deletes a single card from studio_cards."""
        try:
            pool = await self.get_pool()
            async with pool.acquire() as conn:
                await self._ensure_studio_tables(conn)
                if user_id:
                    res = await conn.execute("DELETE FROM studio_cards WHERE id = $1 AND user_id = $2;", card_id, user_id)
                else:
                    res = await conn.execute("DELETE FROM studio_cards WHERE id = $1;", card_id)
                logger.info(f"🗑️ [CARD_VAULT] Deleted card {card_id}")
                return "DELETE" in res
        except Exception as e:
            logger.error(f"Error deleting studio card {card_id}: {e}", exc_info=True)
            return False

    async def list_studio_worlds(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Retrieves all worlds for a user, assembled with their cards into WorldWorkspace format.
        """
        try:
            pool = await self.get_pool()
            async with pool.acquire() as conn:
                await self._ensure_studio_tables(conn)
                world_rows = await conn.fetch("""
                    SELECT id, user_id, title, active_character_id, has_lore, has_spark,
                           character_count, stage_count, cabinet_card_count, lore_data, workspace_data,
                           created_at, updated_at
                    FROM studio_worlds
                    WHERE user_id = $1
                    ORDER BY updated_at DESC;
                """, user_id)

                results = []
                for w in world_rows:
                    w_id = w["id"]
                    # Fetch all cards for this world
                    card_rows = await conn.fetch("""
                        SELECT id, card_type, card_data FROM studio_cards
                        WHERE world_id = $1 ORDER BY created_at ASC;
                    """, w_id)

                    chars = []
                    cells = []
                    cab_cards = []
                    notes = []
                    for cr in card_rows:
                        cd = cr["card_data"]
                        if isinstance(cd, str):
                            try:
                                cd = json.loads(cd)
                            except Exception:
                                cd = {}
                        ctype = cr["card_type"]
                        if ctype == "character":
                            chars.append(cd)
                        elif ctype == "stage_cell":
                            cells.append(cd)
                        elif ctype == "cabinet_card":
                            cab_cards.append(cd)
                        elif ctype == "note":
                            notes.append(cd)

                    lore_data = w["lore_data"]
                    if isinstance(lore_data, str):
                        try:
                            lore_data = json.loads(lore_data)
                        except Exception:
                            lore_data = {}

                    # Assemble into WorldWorkspace structure
                    ws = {
                        "id": w["id"],
                        "title": w["title"],
                        "rawLore": lore_data.get("rawLore", ""),
                        "extraLoreBlocks": lore_data.get("extraLoreBlocks", []),
                        "sparkText": lore_data.get("sparkText", ""),
                        "pinnedCardIds": lore_data.get("pinnedCardIds", []),
                        "characters": chars,
                        "stageCells": cells,
                        "cabinetCards": cab_cards,
                        "notes": notes,
                        "activeCharacterId": w["active_character_id"],
                        "created_at": int(w["created_at"].timestamp() * 1000) if w["created_at"] else int(time.time() * 1000)
                    }
                    results.append(ws)
                logger.info(f"📂 [UNIVERSAL_VAULT] Assembled {len(results)} worlds with cards for user {user_id}")
                return results
        except Exception as e:
            logger.error(f"Error listing studio worlds from Neon: {e}", exc_info=True)
            return []

    async def get_studio_world(self, world_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a single WorldWorkspace assembled with its cards from studio_cards.
        """
        try:
            pool = await self.get_pool()
            async with pool.acquire() as conn:
                await self._ensure_studio_tables(conn)
                w = await conn.fetchrow("""
                    SELECT id, user_id, title, active_character_id, has_lore, has_spark,
                           character_count, stage_count, cabinet_card_count, lore_data, workspace_data,
                           created_at, updated_at
                    FROM studio_worlds
                    WHERE id = $1;
                """, world_id)
                if not w:
                    return None

                card_rows = await conn.fetch("""
                    SELECT id, card_type, card_data FROM studio_cards
                    WHERE world_id = $1 ORDER BY created_at ASC;
                """, world_id)

                chars, cells, cab_cards, notes = [], [], [], []
                for cr in card_rows:
                    cd = cr["card_data"]
                    if isinstance(cd, str):
                        try:
                            cd = json.loads(cd)
                        except Exception:
                            cd = {}
                    ctype = cr["card_type"]
                    if ctype == "character":
                        chars.append(cd)
                    elif ctype == "stage_cell":
                        cells.append(cd)
                    elif ctype == "cabinet_card":
                        cab_cards.append(cd)
                    elif ctype == "note":
                        notes.append(cd)

                lore_data = w["lore_data"]
                if isinstance(lore_data, str):
                    try:
                        lore_data = json.loads(lore_data)
                    except Exception:
                        lore_data = {}

                return {
                    "id": w["id"],
                    "title": w["title"],
                    "rawLore": lore_data.get("rawLore", ""),
                    "extraLoreBlocks": lore_data.get("extraLoreBlocks", []),
                    "sparkText": lore_data.get("sparkText", ""),
                    "pinnedCardIds": lore_data.get("pinnedCardIds", []),
                    "characters": chars,
                    "stageCells": cells,
                    "cabinetCards": cab_cards,
                    "notes": notes,
                    "activeCharacterId": w["active_character_id"],
                    "created_at": int(w["created_at"].timestamp() * 1000) if w["created_at"] else int(time.time() * 1000)
                }
        except Exception as e:
            logger.error(f"Error getting studio world {world_id} from Neon: {e}", exc_info=True)
            return None

    async def delete_studio_world(self, world_id: str, user_id: Optional[str] = None) -> bool:
        """Deletes a world (cascades to all studio_cards in that world)."""
        try:
            pool = await self.get_pool()
            async with pool.acquire() as conn:
                await self._ensure_studio_tables(conn)
                if user_id:
                    res = await conn.execute("DELETE FROM studio_worlds WHERE id = $1 AND user_id = $2;", world_id, user_id)
                else:
                    res = await conn.execute("DELETE FROM studio_worlds WHERE id = $1;", world_id)
                logger.info(f"🗑️ [UNIVERSAL_VAULT] Deleted studio world {world_id} (and all attached cards)")
                return "DELETE" in res
        except Exception as e:
            logger.error(f"Error deleting studio world {world_id} from Neon: {e}", exc_info=True)
            return False


# Singleton Instance
_postgres_core_instance: Optional[PostgresCore] = None

def get_postgres_core() -> PostgresCore:
    global _postgres_core_instance
    if _postgres_core_instance is None:
        _postgres_core_instance = PostgresCore()
    return _postgres_core_instance

