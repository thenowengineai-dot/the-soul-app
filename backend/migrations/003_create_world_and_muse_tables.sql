-- ==========================================================
-- 🌍 Neon PostgreSQL Migration: World Campaigns, Characters & The Muse
-- ==========================================================

-- 1. ตารางเก็บข้อมูลโลก (World Campaigns & Lore) ในรูปแบบ JSONB
CREATE TABLE IF NOT EXISTS world_campaigns (
    id VARCHAR(100) PRIMARY KEY,
    creator_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    character_id VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
    world_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    workspace_meta JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_world_campaigns_creator ON world_campaigns(creator_id, status);
CREATE INDEX IF NOT EXISTS idx_world_campaigns_status ON world_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_world_campaigns_updated ON world_campaigns(updated_at DESC);

-- 2. ตารางเก็บข้อมูลตัวละคร (Characters) ในรูปแบบ JSONB
CREATE TABLE IF NOT EXISTS world_characters (
    id VARCHAR(100) PRIMARY KEY,
    creator_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'published'
    character_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_world_characters_creator ON world_characters(creator_id, status);
CREATE INDEX IF NOT EXISTS idx_world_characters_status ON world_characters(status);

-- 3. ตารางประวัติแชทกับ The Muse (AI พี่เลี้ยงสร้างโลก) ในรูปแบบ JSONB
CREATE TABLE IF NOT EXISTS the_muse_conversations (
    draft_id VARCHAR(100) PRIMARY KEY,
    creator_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    scratchpad JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_muse_conv_creator ON the_muse_conversations(creator_id);
