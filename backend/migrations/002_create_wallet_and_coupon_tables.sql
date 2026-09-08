-- ==========================================================
-- 🪙 Neon PostgreSQL Migration: Wallet, Coupons & Token Ledger
-- ==========================================================

-- 1. ตารางกระเป๋าเหรียญผู้ใช้ (รองรับทั้ง gst_* และ usr_*)
CREATE TABLE IF NOT EXISTS user_wallets (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 50 CHECK (balance >= 0),
    total_earned INTEGER NOT NULL DEFAULT 50,
    total_spent INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ตารางรหัสคูปองสำหรับกลุ่ม Creator / Alpha Tester
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(32) UNIQUE NOT NULL,
    coin_reward INTEGER NOT NULL CHECK (coin_reward > 0),
    max_redemptions INTEGER NOT NULL DEFAULT 100,
    current_redemptions INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ตารางประวัติการแลกคูปอง (ป้องกันผู้ใช้คนเดิมแลกซ้ำ 1 user : 1 coupon)
CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id SERIAL PRIMARY KEY,
    coupon_id INTEGER NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coins_granted INTEGER NOT NULL,
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_coupon UNIQUE (coupon_id, user_id)
);

-- 4. บัญชีแยกประเภทธุรกรรมเหรียญ (Audit Ledger)
CREATE TABLE IF NOT EXISTS coin_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    tx_type VARCHAR(32) NOT NULL, -- 'coupon_redeem', 'round_deduction', 'initial_bonus', 'guest_migration'
    session_id VARCHAR(64),
    round_number INTEGER,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coin_tx_user ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- 5. Seed โค้ดคูปองสำหรับกลุ่ม Creator Alpha
INSERT INTO coupons (code, coin_reward, max_redemptions, description)
VALUES 
    ('MAOMOI2026', 500, 50, 'Creator Alpha Pass - 500 Coins (Max 50 Uses)'),
    ('MAOMOI', 300, 100, 'Creator Community Pack - 300 Coins (Max 100 Uses)'),
    ('CREATORVIP', 1000, 20, 'VIP Creator Alpha Pack - 1,000 Coins (Max 20 Uses)'),
    ('MAOMOIFREE', 100, 200, 'Free Starter Pack - 100 Coins (Max 200 Uses)'),
    ('WELCOME100', 100, 500, 'Welcome Tester Gift - 100 Coins (Max 500 Uses)')
ON CONFLICT (code) DO NOTHING;
