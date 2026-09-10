import os
import re
import time
import uuid
import base64
import logging
from typing import Dict, Any, Optional

try:
    from google.cloud import storage
    GCS_AVAILABLE = True
except ImportError:
    storage = None
    GCS_AVAILABLE = False

logger = logging.getLogger("GCS_STORAGE")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s - \033[93m[GCS_STORAGE]\033[0m - %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME", "the-soul-media-storage")


def get_storage_client() -> Optional[Any]:
    """Initializes and returns a Google Cloud Storage Client."""
    if not GCS_AVAILABLE:
        logger.error("google-cloud-storage library is not installed.")
        return None

    possible_keys = [
        os.getenv("GOOGLE_APPLICATION_CREDENTIALS", ""),
        os.path.join(os.path.dirname(__file__), "..", "service_account_key.json"),
        os.path.join(os.path.dirname(__file__), "service_account_key.json"),
        os.path.join(os.getcwd(), "backend", "service_account_key.json"),
        os.path.join(os.getcwd(), "service_account_key.json"),
    ]

    for key_path in possible_keys:
        if key_path and os.path.exists(key_path):
            try:
                client = storage.Client.from_service_account_json(key_path)
                return client
            except Exception as e:
                logger.warning(f"Could not load GCS client from {key_path}: {e}")

    # Fallback to Application Default Credentials (e.g. on Google Cloud Run)
    try:
        return storage.Client()
    except Exception as e:
        logger.error(f"Failed to initialize default GCS Client: {e}")
        return None


def upload_base64_image(
    image_base64: str,
    user_id: Optional[str] = "anonymous",
    folder: Optional[str] = "characters",
    filename: Optional[str] = None,
    bucket_name: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Uploads a Base64-encoded image to Google Cloud Storage.
    Returns the public CDN URL and blob metadata.
    """
    if not image_base64:
        raise ValueError("Image data is empty.")

    target_bucket = bucket_name or GCS_BUCKET_NAME

    # 1. Determine MIME type and clean Base64 payload
    content_type = "image/webp"
    raw_b64 = image_base64

    if "," in image_base64:
        header, raw_b64 = image_base64.split(",", 1)
        header_lower = header.lower()
        if "image/jpeg" in header_lower or "image/jpg" in header_lower:
            content_type = "image/jpeg"
        elif "image/png" in header_lower:
            content_type = "image/png"
        elif "image/gif" in header_lower:
            content_type = "image/gif"
        elif "image/webp" in header_lower:
            content_type = "image/webp"

    ext_map = {
        "image/webp": "webp",
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
    }
    ext = ext_map.get(content_type, "webp")

    # 2. Decode bytes
    try:
        binary_data = base64.b64decode(raw_b64)
    except Exception as e:
        raise ValueError(f"Failed to decode base64 image data: {e}")

    # 3. Generate clean unique blob name
    clean_user = re.sub(r"[^a-zA-Z0-9_-]", "", user_id or "anonymous")[:32]
    clean_folder = (folder or "characters").strip("/")

    if not filename:
        unique_id = uuid.uuid4().hex[:10]
        blob_name = f"{clean_folder}/{clean_user}_{int(time.time())}_{unique_id}.{ext}"
    else:
        clean_file = re.sub(r"[^a-zA-Z0-9_.-]", "", filename)
        blob_name = f"{clean_folder}/{clean_file}"

    # 4. Upload to GCS
    client = get_storage_client()
    if client is None:
        raise RuntimeError("Google Cloud Storage client is not available or configured.")

    try:
        bucket = client.bucket(target_bucket)
        blob = bucket.blob(blob_name)
        blob.upload_from_string(binary_data, content_type=content_type)

        # Attempt to make public for direct browser access
        # (will safely pass if uniform bucket-level access is enforced)
        try:
            blob.make_public()
        except Exception:
            pass

        public_url = f"https://storage.googleapis.com/{target_bucket}/{blob_name}"
        logger.info(f"✅ [GCS] Image uploaded successfully: {public_url} ({len(binary_data)} bytes)")

        return {
            "status": "success",
            "url": public_url,
            "blob_name": blob_name,
            "bucket": target_bucket,
            "size": len(binary_data),
            "content_type": content_type,
        }
    except Exception as e:
        logger.error(f"❌ [GCS] Failed to upload image to bucket {target_bucket}: {e}", exc_info=True)
        raise RuntimeError(f"GCS Upload Error: {e}")
