import os
import uuid
import logging
from typing import List, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
from google import genai

logger = logging.getLogger("MEMORY_CORE")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - \033[90m[MEMORY]\033[0m - %(message)s")

class MemoryCore:
    def __init__(
        self, 
        collection_name: str = "ai_dating_memories", 
        embedding_model: str = "text-embedding-004",
        vector_size: int = 768
    ):
        self.collection_name = collection_name
        self.embedding_model = embedding_model
        
        self.project_id = os.getenv("VERTEX_PROJECT") or os.getenv("GOOGLE_CLOUD_PROJECT")
        self.location = os.getenv("VERTEX_LOCATION", "global")
        self.genai_client = genai.Client(vertexai=True, project=self.project_id, location=self.location)

        try:
            qdrant_url = os.getenv("QDRANT_URL")
            qdrant_api_key = os.getenv("QDRANT_API_KEY")
            
            if qdrant_url and qdrant_api_key:
                self.qdrant = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
                logger.info("Connected to Qdrant Cloud.")
            else:
                logger.warning("No QDRANT_URL or QDRANT_API_KEY found, falling back to local memory disabled.")
                self.qdrant = None
                return

            if not self.qdrant.collection_exists(self.collection_name):
                self.qdrant.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
                )
                logger.info(f"Created new Qdrant collection: {self.collection_name}")
            else:
                logger.info(f"Connected to existing Qdrant collection: {self.collection_name}")
        except Exception as e:
            logger.error(f"Failed to initialize Qdrant: {e}")
            self.qdrant = None

    async def _get_embedding(self, text: str) -> List[float]:
        try:
            response = await self.genai_client.aio.models.embed_content(
                model=self.embedding_model,
                contents=text
            )
            return response.embeddings[0].values
        except Exception as e:
            logger.error(f"Embedding Error: {e}")
            return [0.0] * 768

    async def save_memory(self, user_id: str, character_id: str, memory_text: str, session_id: str) -> bool:
        if not self.qdrant or not memory_text or memory_text.strip() == "":
            return False
        logger.info(f"Saving new memory for {character_id} in session {session_id}: '{memory_text}'")
        try:
            memory_vector = await self._get_embedding(memory_text)
            point_id = str(uuid.uuid4())
            self.qdrant.upsert(
                collection_name=self.collection_name,
                points=[
                    PointStruct(
                        id=point_id,
                        vector=memory_vector,
                        payload={
                            "user_id": user_id,
                            "character_id": character_id,
                            "session_id": session_id,
                            "text": memory_text,
                            "timestamp": import_time_if_needed()
                        }
                    )
                ]
            )
            logger.info("Memory saved successfully.")
            return True
        except Exception as e:
            logger.error(f"Failed to save memory: {e}")
            return False

    async def retrieve_relevant_memories(
        self, 
        user_id: str, 
        character_id: str, 
        current_input: str,
        session_id: str,
        limit: int = 2,
        threshold: float = 0.5
    ) -> str:
        if not self.qdrant or not current_input:
            return ""
        logger.info(f"Searching memories related to: '{current_input}'")
        try:
            query_vector = await self._get_embedding(current_input)
            
            # 🌟 อัปเดตใหม่: ใช้ query_points (รองรับเวอร์ชั่นล่าสุด) หรือ search
            if hasattr(self.qdrant, 'query_points'):
                search_result = self.qdrant.query_points(
                    collection_name=self.collection_name,
                    query=query_vector,
                    query_filter=Filter(
                        must=[
                            FieldCondition(key="user_id", match=MatchValue(value=user_id)),
                            FieldCondition(key="character_id", match=MatchValue(value=character_id)),
                            FieldCondition(key="session_id", match=MatchValue(value=session_id)),
                        ]
                    ),
                    limit=limit
                ).points
            else:
                search_result = self.qdrant.search(
                    collection_name=self.collection_name,
                    query_vector=query_vector,
                    query_filter=Filter(
                        must=[
                            FieldCondition(key="user_id", match=MatchValue(value=user_id)),
                            FieldCondition(key="character_id", match=MatchValue(value=character_id)),
                            FieldCondition(key="session_id", match=MatchValue(value=session_id)),
                        ]
                    ),
                    limit=limit
                )
            
            relevant_memories = [
                hit.payload["text"] 
                for hit in search_result 
                if hit.score > threshold
            ]
            
            if relevant_memories:
                memory_str = "\n".join([f"- {mem}" for mem in relevant_memories])
                logger.info(f"Found {len(relevant_memories)} relevant memories.")
                return memory_str
            else:
                logger.info("No relevant memories found.")
                return ""
        except Exception as e:
            logger.error(f"Failed to retrieve memories: {e}")
            return ""

def import_time_if_needed():
    from datetime import datetime
    return datetime.now().isoformat()