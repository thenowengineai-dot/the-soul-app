import os
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional
import asyncpg

logger = logging.getLogger("POSTGRES_CORE")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s - \033[94m[POSTGRES]\033[0m - %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


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


# Singleton Instance
_postgres_core_instance: Optional[PostgresCore] = None

def get_postgres_core() -> PostgresCore:
    global _postgres_core_instance
    if _postgres_core_instance is None:
        _postgres_core_instance = PostgresCore()
    return _postgres_core_instance

