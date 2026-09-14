import os
import sys
import json
import urllib.request
import urllib.error

# Ensure module path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
sys.path.insert(0, os.path.dirname(current_dir))

from genesis.redis_hot import GenesisRedisHotCache

def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def sync_to_upstash(char_data, world_data):
    print("🚀 [1/2] Connecting to Upstash Redis Hot Cache...")
    redis = GenesisRedisHotCache()
    char_id = char_data.get("character_id", "char_1788786310")
    world_id = world_data.get("world_id", "draft_1786182329627")

    # Primary real world ID
    ok1 = redis.publish_character_and_world(
        character_id=char_id,
        character_data=char_data,
        world_id=world_id,
        world_data=world_data
    )

    # Alias world_1788786310 for backward compatibility
    ok2 = redis.publish_character_and_world(
        character_id=char_id,
        character_data=char_data,
        world_id="world_1788786310",
        world_data=world_data
    )

    if ok1 and ok2:
        print(f"✅ Upstash Redis Hot Cache injected successfully for {char_id}, {world_id}, and world_1788786310!")
        return True
    else:
        print(f"⚠️ Upstash Redis sync returned partial success: ok1={ok1}, ok2={ok2}")
        return ok1 or ok2

async def sync_to_neon_async(char_data, world_data):
    print("🐘 [2/2] Connecting to Neon Serverless PostgreSQL via asyncpg...")
    from genesis.postgres_world import PostgresWorld
    db = PostgresWorld()
    char_id = char_data.get("character_id", "char_1788786310")
    world_id = world_data.get("world_id", "draft_1786182329627")
    creator_id = "creator_master"
    name = world_data.get("name", "The Paid Smile & Off-Duty Ice")

    workspace_meta = {
        "themeColor": "#EF264C",
        "character_image_base64": char_data.get("avatar_url", "")
    }

    try:
        # 1. Save and publish primary draft_1786182329627
        saved_id1 = await db.save_draft(
            world_id=world_id,
            creator_id=creator_id,
            name=name,
            world_data=world_data,
            character_data=char_data,
            workspace_meta=workspace_meta
        )
        pub1 = await db.publish_draft(world_id, creator_id)
        print(f"💾 Saved and published to Neon DB draft: {saved_id1} (status: {pub1})")

        # 2. Save and publish alias world_1788786310
        saved_id2 = await db.save_draft(
            world_id="world_1788786310",
            creator_id=creator_id,
            name=name,
            world_data=world_data,
            character_data=char_data,
            workspace_meta=workspace_meta
        )
        pub2 = await db.publish_draft("world_1788786310", creator_id)
        print(f"💾 Saved and published alias to Neon DB draft: {saved_id2} (status: {pub2})")

        await db.close_pool()
        return True
    except Exception as e:
        print(f"❌ Error in Neon PostgreSQL sync: {e}")
        try:
            await db.close_pool()
        except Exception:
            pass
        return False

async def main_async(char_data, world_data):
    redis_ok = sync_to_upstash(char_data, world_data)
    neon_ok = await sync_to_neon_async(char_data, world_data)
    print(f"\n📊 Final Result: Upstash Redis = {redis_ok} | Neon PostgreSQL = {neon_ok}")

if __name__ == "__main__":
    char_file = os.path.join(os.path.dirname(current_dir), "backend", "data", "characters", "baisom.json")
    world_file = os.path.join(os.path.dirname(current_dir), "backend", "data", "worlds", "draft_1786182329627.json")

    char_data = load_json(char_file)
    world_data = load_json(world_file)

    import asyncio
    asyncio.run(main_async(char_data, world_data))
