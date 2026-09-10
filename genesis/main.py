import os
import sys
import uvicorn
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Ensure genesis directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

from genesis.pipeline import GenesisPipeline

logger = logging.getLogger("GENESIS_SERVER")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s - \033[95m[GENESIS_API]\033[0m - %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

app = FastAPI(
    title="The Soul Genesis Engine",
    description="Microservice 2: World Creator, The Muse & Card Compilation Engine",
    version="2.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = GenesisPipeline()


# =========================================================================
# 📋 Pydantic Request Models
# =========================================================================

class ChatMessage(BaseModel):
    role: Optional[str] = None
    sender: Optional[str] = None
    content: Optional[str] = None
    text: Optional[str] = None
    id: Optional[str] = None
    timestamp: Optional[str] = None
    actionSuggestions: Optional[List[str]] = None

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, Any]]
    mode: str = "world"  # "character" or "world"
    image_base64: Optional[str] = None
    scratchpad_state: Optional[Dict[str, Any]] = None
    draft_id: Optional[str] = None
    user_id: Optional[str] = None

class DraftRequest(BaseModel):
    history: List[Dict[str, Any]]
    mode: str = "world"
    current_draft: Optional[str] = None

class BuildRequest(BaseModel):
    history: List[Dict[str, Any]]
    mode: str = "world"
    character_data: Optional[Dict[str, Any]] = None
    master_brief: Optional[str] = None
    timeline_json: Optional[Dict[str, Any]] = None

class ExtractRequest(BaseModel):
    history: List[Dict[str, Any]]
    mode: str = "world"

class SaveDraftRequest(BaseModel):
    data: Dict[str, Any]
    mode: str = "world"
    user_id: str

class PublishRequest(BaseModel):
    world_id: str
    user_id: str

class ColorRequest(BaseModel):
    image_base64: str

class ValidateWorldRequest(BaseModel):
    world_data: Dict[str, Any]

class InjectBeatRequest(BaseModel):
    prev_beat: Optional[Dict[str, Any]] = None
    next_beat: Optional[Dict[str, Any]] = None
    prompt: str
    master_brief: Optional[str] = None
    character_data: Optional[Dict[str, Any]] = None

class ImproveBeatRequest(BaseModel):
    beats: List[Dict[str, Any]]
    prompt: str
    master_brief: Optional[str] = None
    character_data: Optional[Dict[str, Any]] = None

class MuseHistorySaveRequest(BaseModel):
    draft_id: str
    user_id: str
    messages: List[Dict[str, Any]]
    scratchpad: Optional[Dict[str, Any]] = None


# =========================================================================
# 🔌 Endpoints
# =========================================================================

@app.get("/")
async def health_check():
    return {
        "status": "ok",
        "service": "The Soul Genesis Engine",
        "version": "2.0.0",
        "storage": "Neon PostgreSQL (JSONB) + Upstash Redis Hot Cache"
    }

@app.post("/api/genesis/chat")
async def genesis_chat(req: ChatRequest):
    """Processes turn with The Muse and optionally persists history."""
    try:
        response_str = pipeline.process_chat(
            message=req.message,
            history=req.history,
            mode=req.mode,
            image_base64=req.image_base64,
            scratchpad_state=req.scratchpad_state
        )

        # Auto-save history if draft_id and user_id are supplied
        if req.draft_id and req.user_id:
            updated_messages = list(req.history)
            updated_messages.append({"sender": "user", "text": req.message, "timestamp": "now"})
            try:
                parsed_resp = json.loads(response_str)
                bot_text = parsed_resp.get("reply_text_part1", "") + "\n" + parsed_resp.get("reply_text_part2", "")
                suggestions = [item.get("text", "") for item in parsed_resp.get("extracted_ideas", [])]
                updated_messages.append({
                    "sender": "muse",
                    "text": bot_text.strip(),
                    "timestamp": "now",
                    "actionSuggestions": suggestions
                })
            except Exception:
                updated_messages.append({"sender": "muse", "text": response_str, "timestamp": "now"})

            await pipeline.save_muse_chat(req.draft_id, req.user_id, updated_messages, req.scratchpad_state)

        return {"response": response_str}
    except Exception as e:
        logger.error(f"Error in /api/genesis/chat: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/genesis/muse/{draft_id}")
async def get_muse_conversation(draft_id: str):
    """Loads Muse conversation history from Neon PostgreSQL (JSONB)."""
    try:
        data = await pipeline.load_muse_chat(draft_id)
        return {"status": "success", "data": data}
    except Exception as e:
        logger.error(f"Error loading muse conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/genesis/muse")
async def save_muse_conversation(req: MuseHistorySaveRequest):
    """Saves Muse conversation history to Neon PostgreSQL (JSONB)."""
    try:
        success = await pipeline.save_muse_chat(
            draft_id=req.draft_id,
            user_id=req.user_id,
            messages=req.messages,
            scratchpad=req.scratchpad
        )
        return {"status": "success", "saved": success}
    except Exception as e:
        logger.error(f"Error saving muse conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/genesis/draft")
async def genesis_draft(req: DraftRequest):
    """Generates master brief draft."""
    try:
        brief = pipeline.draft_master_brief(req.history, req.mode, req.current_draft)
        return {"status": "success", "data": brief}
    except Exception as e:
        logger.error(f"Error in /api/genesis/draft: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/genesis/extract")
async def genesis_extract(req: ExtractRequest):
    """Extracts timeline storyboard structure."""
    try:
        result = pipeline.extract_storyboard(req.history, req.mode)
        return {"status": "success", "data": result}
    except Exception as e:
        logger.error(f"Error in /api/genesis/extract: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/genesis/build")
async def genesis_build(req: BuildRequest):
    """Builds final JSON cards for character and world."""
    try:
        result_json = pipeline.build_final_json(
            history=req.history,
            mode=req.mode,
            character_data=req.character_data,
            master_brief=req.master_brief,
            timeline_json=req.timeline_json
        )
        return {"status": "success", "data": result_json}
    except Exception as e:
        logger.error(f"Error in /api/genesis/build: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/genesis/save")
async def genesis_save(req: SaveDraftRequest):
    """Saves draft to Neon PostgreSQL and Upstash Redis Hot Cache."""
    try:
        world_id = await pipeline.save_draft(req.data, req.mode, req.user_id)
        return {"status": "success", "world_id": world_id}
    except Exception as e:
        logger.error(f"Error in /api/genesis/save: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/genesis/drafts/{user_id}")
async def list_drafts(user_id: str):
    """Lists all drafts for the given user."""
    try:
        drafts = await pipeline.list_drafts(user_id)
        return {"status": "success", "data": drafts}
    except Exception as e:
        logger.error(f"Error listing drafts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/genesis/drafts/{user_id}/{world_id}")
async def load_draft(user_id: str, world_id: str):
    """Loads a specific draft."""
    try:
        draft = await pipeline.load_draft(world_id, user_id)
        if not draft:
            raise HTTPException(status_code=404, detail="Draft not found")
        return {"status": "success", "data": draft}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error loading draft: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/genesis/drafts/{user_id}/{world_id}")
async def delete_draft(user_id: str, world_id: str):
    """Deletes a draft."""
    try:
        success = await pipeline.delete_draft(world_id, user_id)
        return {"status": "success", "deleted": success}
    except Exception as e:
        logger.error(f"Error deleting draft: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/genesis/publish")
async def genesis_publish(req: PublishRequest):
    """
    ⚡ PUBLISH CAMPAIGN:
    Saves to Neon as 'published' AND injects directly into Upstash Redis Hot Cache.
    Players in the chat engine can start playing in 0.002s!
    """
    try:
        success = await pipeline.publish_draft(req.world_id, req.user_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to publish campaign")
        return {"status": "success", "message": "Published successfully to Neon & Hot Cache"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error publishing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/genesis/unpublish")
async def genesis_unpublish(req: PublishRequest):
    """Reverts campaign to draft status and clears Hot Cache."""
    try:
        success = await pipeline.unpublish_draft(req.world_id, req.user_id)
        return {"status": "success", "message": "Unpublished successfully"}
    except Exception as e:
        logger.error(f"Error unpublishing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/genesis/validate")
async def validate_world(req: ValidateWorldRequest):
    """Validates world data against The Engine Manifesto."""
    try:
        result = pipeline.validate_world(req.world_data)
        return {"status": "success", "data": result}
    except Exception as e:
        logger.error(f"Error validating world: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/genesis/extract-color")
async def extract_color(req: ColorRequest):
    """Extracts dominant theme color from character portrait."""
    try:
        hex_color = pipeline.extract_color(req.image_base64)
        return {"hex": hex_color}
    except Exception as e:
        logger.error(f"Error extracting color: {e}")
        return {"hex": "#EF264C"}

@app.post("/api/genesis/inject-beat")
async def inject_beat(req: InjectBeatRequest):
    try:
        beats = pipeline.inject_beat(req.prev_beat, req.next_beat, req.prompt, req.master_brief, req.character_data)
        return {"status": "success", "beats": beats}
    except Exception as e:
        logger.error(f"Error in inject_beat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/genesis/improve-beat")
async def improve_beat(req: ImproveBeatRequest):
    try:
        beats = pipeline.improve_beat(req.beats, req.prompt, req.master_brief, req.character_data)
        return {"status": "success", "beats": beats}
    except Exception as e:
        logger.error(f"Error in improve_beat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("genesis.main:app", host="0.0.0.0", port=port, reload=True)
