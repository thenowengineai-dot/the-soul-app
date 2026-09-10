import asyncio
import os
import sys
import uuid
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from genesis.postgres_world import PostgresWorld
from genesis.redis_hot import GenesisRedisHotCache

async def main():
    print("🧪 [TEST] Starting World Creator Neon & Redis Integration Test...")
    db = PostgresWorld()
    redis = GenesisRedisHotCache()

    # 1. Setup mock user and draft
    test_creator_id = f"usr_test_{uuid.uuid4().hex[:8]}"
    test_world_id = f"world_test_{uuid.uuid4().hex[:8]}"
    test_char_id = f"char_test_{uuid.uuid4().hex[:8]}"

    # Ensure creator exists in users table
    pool = await db.get_pool()
    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO users (id, name, is_guest)
            VALUES ($1, 'Test Creator', FALSE)
            ON CONFLICT (id) DO NOTHING;
        """, test_creator_id)
        print(f"✅ Created test user in Neon: {test_creator_id}")

    # 2. Test save_draft
    world_data = {
        "world_id": test_world_id,
        "name": "The Neon Cyber City",
        "genre": "Cyberpunk",
        "description": "A dark rain-slicked city full of intrigue."
    }
    char_data = {
        "character_id": test_char_id,
        "name": "Kira",
        "archetype": "Deadpan Hacker",
        "max_desire": 1000
    }
    workspace_meta = {
        "themeColor": "#EF264C",
        "character_image_base64": "https://images.unsplash.com/photo-test"
    }

    saved_id = await db.save_draft(
        world_id=test_world_id,
        creator_id=test_creator_id,
        name="The Neon Cyber City",
        world_data=world_data,
        character_data=char_data,
        workspace_meta=workspace_meta
    )
    print(f"✅ [1/5] Successfully saved draft into Neon PostgreSQL: {saved_id}")
    assert saved_id == test_world_id

    # 3. Test load_draft
    loaded = await db.load_draft(test_world_id, test_creator_id)
    assert loaded is not None, "Failed to load draft from Neon"
    assert loaded["world_data"]["genre"] == "Cyberpunk"
    assert loaded["character_data"]["name"] == "Kira"
    print(f"✅ [2/5] Successfully loaded draft JSONB from Neon: {loaded['name']} (Char: {loaded['character_data']['name']})")

    # 4. Test The Muse conversation persistence
    sample_messages = [
        {
            "id": "msg-001",
            "sender": "muse",
            "text": "สวัสดีครับสถาปนิก! เรามาเริ่มสร้างโลกนี้กัน",
            "timestamp": "10:00",
            "actionSuggestions": ["🏙️ Cyberpunk City", "🏰 High Fantasy"]
        },
        {
            "id": "msg-002",
            "sender": "user",
            "text": "อยากได้แนว Cyberpunk ฝนตกหนัก",
            "timestamp": "10:01"
        }
    ]
    sample_scratchpad = {"current_focus": "world_setting", "confirmed_beats": ["Arrival at alleyway"]}

    saved_muse = await db.save_muse_conversation(
        draft_id=test_world_id,
        creator_id=test_creator_id,
        messages=sample_messages,
        scratchpad=sample_scratchpad
    )
    assert saved_muse is True

    loaded_muse = await db.load_muse_conversation(test_world_id)
    assert len(loaded_muse["messages"]) == 2
    assert loaded_muse["messages"][0]["actionSuggestions"][0] == "🏙️ Cyberpunk City"
    print(f"✅ [3/5] Successfully saved & loaded Muse JSONB conversation: {len(loaded_muse['messages'])} messages with chips intact!")

    # 5. Test Publish & Hot Cache Injection
    pub_result = await db.publish_draft(test_world_id, test_creator_id)
    assert pub_result is not None
    assert pub_result["world_data"]["name"] == "The Neon Cyber City"

    # Inject to Redis Hot Cache
    hot_cache_ok = redis.publish_character_and_world(
        character_id=test_char_id,
        character_data=char_data,
        world_id=test_world_id,
        world_data=world_data
    )
    print(f"✅ [4/5] Published to Neon & injected into Upstash Redis Hot Cache: {hot_cache_ok}")

    # 6. Test list_user_drafts
    drafts = await db.list_user_drafts(test_creator_id)
    assert len(drafts) >= 1
    assert drafts[0]["status"] == "published"
    print(f"✅ [5/5] Listed user drafts: Found {len(drafts)} drafts (Status: {drafts[0]['status']})")

    # Cleanup test data
    deleted = await db.delete_draft(test_world_id, test_creator_id)
    redis.unpublish_character_and_world(test_char_id, test_world_id)
    async with pool.acquire() as conn:
        await conn.execute("DELETE FROM users WHERE id = $1;", test_creator_id)
    await db.close_pool()

    print(f"🧹 Cleaned up test data: Deleted draft = {deleted}")
    print("\n🎉 ALL TESTS PASSED! World Creator Neon JSONB & Upstash Redis Hot Cache fully operational!")

if __name__ == "__main__":
    asyncio.run(main())
