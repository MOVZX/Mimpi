"""Mimpi Dashboard — Generation & Static File Routes"""

import json
import httpx
import logging
import time
from pathlib import Path
from datetime import datetime, timezone
from PIL import Image
from fastapi import APIRouter, Request, UploadFile, File, Form, HTTPException, Response
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel, Field, field_validator
import asyncio
from urllib.parse import quote
from server.cache import clear_user_cache
from server.database import db_query, db_execute
from server.config import PROJECT_DIR, MIMPI_DIST, MIMPI_ASSETS, GALLERY_DIR, THUMB_DIR, COM_URI, COM_TOKEN, COM_AUTH
from server.config import S3_FILER_URL, S3_BUCKET
from server.settings import get_storage_mode
from server.auth import _check_auth
from server.helpers import get_active_comfy
from server.rate_limiter import RateLimiter
from datetime import timedelta

logger = logging.getLogger("uvicorn")
router = APIRouter()

# ── Pydantic Models ──
class GenerateRequest(BaseModel):
    """Request model with proper input validation."""
    workflow: dict
    max_workflow_size: int = 1024 * 1024  # 1MB limit
    
    @field_validator("workflow")
    @classmethod
    def validate_workflow(cls, v):
        """Validate workflow structure and size."""
        if not isinstance(v, dict):
            raise ValueError("Workflow must be a dictionary")
        # Check JSON serialization size
        if len(json.dumps(v)) > cls.max_workflow_size:
            raise ValueError("Workflow too large")
        return v

# ── Rate Limiting ──
# Use deque-based RateLimiter to prevent memory leaks
# asyncio.Lock provides async safety for concurrent requests
_generate_limiter = RateLimiter(
    window=timedelta(seconds=60),
    max_attempts=10,
    lock=asyncio.Lock(),
)

async def _check_generate_rate_limit(ip: str) -> bool:
    """Check if IP has exceeded generation rate limit. Returns True if allowed."""
    return await _generate_limiter.is_allowed(ip)

# ── Comfy Servers ──
@router.get("/api/comfy-servers")
async def list_servers():
    rows = db_query("SELECT id, name, url, LEFT(token, 8) AS token_preview, is_active, created_at FROM comfy_servers ORDER BY id")

    return {"servers": rows}

@router.post("/api/comfy-servers")
async def add_server(data: dict):
    name = data.get("name", "").strip()
    url = data.get("url", "").strip()
    token = data.get("token", "").strip()

    if not name or not url:
        raise HTTPException(400, "Nama dan URL wajib diisi")
    try:
        db_execute("INSERT INTO comfy_servers (name, url, token) VALUES (%s, %s, %s)", [name, url, token])

        rows = db_query("SELECT COUNT(*) AS cnt FROM comfy_servers")

        if rows and rows[0]["cnt"] == 1:
            db_execute("UPDATE comfy_servers SET is_active = 1 WHERE name = %s", [name])

        return {"message": "Server ditambahkan", "name": name}
    except Exception as e:
        if "Duplicate" in str(e):
            raise HTTPException(409, f"Nama server '{name}' sudah ada")

        raise HTTPException(500, str(e))

@router.put("/api/comfy-servers")
async def update_server(data: dict):
    name = data.get("name", "").strip()
    url = data.get("url", "").strip()
    token = data.get("token", "").strip()

    if not name or not url:
        raise HTTPException(400, "Nama dan URL wajib diisi")

    existing = db_query("SELECT id FROM comfy_servers WHERE name = %s", [name])

    if not existing:
        raise HTTPException(404, f"Server '{name}' tidak ditemukan")

    db_execute("UPDATE comfy_servers SET url = %s, token = %s WHERE name = %s", [url, token, name])

    return {"message": "Server diupdate", "name": name}

@router.delete("/api/comfy-servers/{name}")
async def delete_server(name: str):
    existing = db_query("SELECT id, is_active FROM comfy_servers WHERE name = %s", [name])

    if not existing:
        raise HTTPException(404, f"Server '{name}' tidak ditemukan")

    db_execute("DELETE FROM comfy_servers WHERE name = %s", [name])

    if existing[0]["is_active"]:
        remaining = db_query("SELECT name FROM comfy_servers LIMIT 1")

        if remaining:
            db_execute("UPDATE comfy_servers SET is_active = 1 WHERE name = %s", [remaining[0]["name"]])

    return {"message": "Server dihapus"}

@router.post("/api/comfy-servers/activate")
async def activate_server(data: dict):
    name = data.get("name", "").strip()

    if not name:
        raise HTTPException(400, "Nama server wajib diisi")

    existing = db_query("SELECT id FROM comfy_servers WHERE name = %s", [name])

    if not existing:
        raise HTTPException(404, f"Server '{name}' tidak ditemukan")

    db_execute("UPDATE comfy_servers SET is_active = 0")
    db_execute("UPDATE comfy_servers SET is_active = 1 WHERE name = %s", [name])

    return {"message": f"Server '{name}' aktif", "name": name}

# ── Generate ──
@router.post("/api/generate")
async def api_generate(request: Request, data: GenerateRequest):
    ip = request.client.host if request.client else ""

    if not await _check_generate_rate_limit(ip):
        raise HTTPException(429, "Too many generation requests. Please try again later.")

    workflow = data.workflow

    if not workflow: raise HTTPException(400, "Workflow required")

    comfy_url, comfy_auth = get_active_comfy()

    try:
        async with httpx.AsyncClient(timeout=300) as client:
            r = await client.post(f"{comfy_url}/prompt{comfy_auth}", json={"prompt": workflow})

            r.raise_for_status()

            return r.json()
    except Exception as e:
        detail = "Gagal memproses gambar"

        if isinstance(e, httpx.HTTPStatusError):
            try:
                body = e.response.json()

                if "error" in body: detail = body["error"].get("message", detail)
                elif "detail" in body: detail = body["detail"]
            except Exception: pass
        raise HTTPException(502, detail)

@router.post("/api/comfy/free")
async def api_comfy_free():
    """Unload all models from ComfyUI GPU memory."""
    comfy_url, comfy_auth = get_active_comfy()

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                f"{comfy_url}/free{comfy_auth}",
                json={"unload_models": True, "free_memory": True},
            )

            r.raise_for_status()

            return {"status": "ok", "message": "Model berhasil diunload dari GPU"}
    except Exception as e:
        detail = "Gagal unload model"

        if isinstance(e, httpx.HTTPStatusError):
            try:
                body = e.response.json()

                if "error" in body: detail = body["error"].get("message", detail)
                elif "detail" in body: detail = body["detail"]
            except Exception: pass
        raise HTTPException(502, detail)

@router.get("/api/history/{prompt_id}")
async def get_history(prompt_id: str):
    comfy_url, comfy_auth = get_active_comfy()

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.get(f"{comfy_url}/history/{prompt_id}{comfy_auth}")

            return r.json() if r.status_code == 200 else {}
    except Exception: return {}

# ── Image View ──
@router.get("/api/view")
async def view_image(filename: str, subfolder: str = "", img_type: str = "output"):
    comfy_url, comfy_auth = get_active_comfy()

    try:
        url = f"{comfy_url}/view{comfy_auth}&filename={filename}&subfolder={subfolder}&type={img_type}"

        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.get(url)

            if r.status_code == 200:
                return Response(content=r.content, media_type=r.headers.get("content-type", "image/png"))
            raise HTTPException(502, "Gagal mengambil gambar dari ComfyUI")
    except httpx.RequestError:
        raise HTTPException(502, "Gagal mengambil gambar dari ComfyUI")

# ── Image Conversion Helpers ──
def _generate_thumb_name(original_fname: str) -> str:
    """Generate thumbnail filename from original.
    
    Note: Original images are kept in PNG format to preserve ComfyUI workflow metadata.
    Thumbnails are generated as WebP for smaller file sizes.
    """
    return original_fname.replace(".png", "_thumb.webp").replace(".webp", "_thumb.webp")


# ── Storage Helpers ──
def _get_storage_mode() -> str:
    """Get current storage mode."""
    return get_storage_mode()


def _should_upload_to_filer() -> bool:
    """Check if we should upload to SeaweedFS based on storage mode."""
    mode = _get_storage_mode()
    return mode in ("seaweedfs", "both")


def _should_save_locally() -> bool:
    """Check if we should save locally based on storage mode."""
    mode = _get_storage_mode()
    return mode in ("local", "both")


async def _upload_to_filer(img_bytes: bytes, fname: str, gallery: str, is_thumb: bool = False) -> str:
    """Upload image to SeaweedFS. Returns the filename stored."""
    try:
        filer_base = f"{S3_FILER_URL}/buckets/{S3_BUCKET}"
        folder = f"{quote(gallery)}/" if gallery else ""
        storage_fname = fname if not is_thumb else fname.replace(".png", "_thumb.webp").replace(".webp", "_thumb.webp")
        url = f"{filer_base}/{folder}{quote(storage_fname)}"

        async with httpx.AsyncClient(timeout=60) as client:
            r = await client.put(url, content=img_bytes)
            r.raise_for_status()
            return storage_fname
    except Exception as e:
        logger.error(f"Filer upload failed: {e}")
        return ""


async def _save_locally(img_bytes: bytes, fname: str, gallery: str, is_thumb: bool = False) -> str:
    """Save image to local filesystem. Returns the path."""
    try:
        dest_dir = GALLERY_DIR if not gallery else GALLERY_DIR / gallery
        dest_dir.mkdir(parents=True, exist_ok=True)
        storage_fname = fname if not is_thumb else fname.replace(".png", "_thumb.webp").replace(".webp", "_thumb.webp")
        dest_path = dest_dir / storage_fname

        with open(dest_path, "wb") as f:
            f.write(img_bytes)

        return str(dest_path)
    except Exception as e:
        logger.error(f"Local save failed: {e}")
        return ""


# ── Save Image ──
class SaveImageRequest(BaseModel):
    """Validated request model for saving images."""
    prompt: str = Field(default="", max_length=1000)
    promptNegative: str = Field(default="", max_length=1000)
    seed: str = Field(default="", max_length=50, pattern=r"^\d+$")
    steps: int = Field(default=0, ge=1, le=100)
    cfg: float = Field(default=0, ge=0, le=20)
    resolution: str = Field(default="", max_length=50)
    imageMode: str = Field(default="", max_length=50)
    galleryName: str = Field(default="", max_length=100)
    checkpoint: str = Field(default="", max_length=200)
    sampler: str = Field(default="", max_length=100)
    scheduler: str = Field(default="", max_length=100)

@router.post("/api/save")
async def save_image(
    request: Request,
    image: UploadFile = File(...),
    prompt: str = Form(""), promptNegative: str = Form(""),
    seed: str = Form(""), checkpoint: str = Form(""),
    sampler: str = Form(""), scheduler: str = Form(""),
    steps: str = Form(""), cfg: str = Form(""),
    resolution: str = Form(""), imageMode: str = Form(""),
    galleryName: str = Form(""),
):
    # Validate input using Pydantic model
    try:
        validated = SaveImageRequest(
            prompt=prompt,
            promptNegative=promptNegative,
            seed=seed,
            steps=steps,
            cfg=cfg,
            resolution=resolution,
            imageMode=imageMode,
            galleryName=galleryName,
            checkpoint=checkpoint,
            sampler=sampler,
            scheduler=scheduler,
        )
    except Exception as e:
        raise HTTPException(400, f"Invalid input: {str(e)}")

    import uuid
    fname = f"{uuid.uuid4().hex[:12].upper()}.png"
    gallery = galleryName.strip() if galleryName else ""
    img_bytes = await image.read()

    # IMPORTANT: Keep original in PNG format to preserve ComfyUI workflow metadata
    # WebP lossless does NOT preserve PNG text chunks where workflow is embedded
    original_fname = fname
    original_bytes = img_bytes

    storage_mode = _get_storage_mode()
    thumb_name = ""
    w, h = 0, 0

    # Generate thumbnail ONCE and reuse for both storage destinations
    thumb_bytes = None
    thumb_name = ""
    try:
        from PIL import Image as PILImage
        from io import BytesIO

        pil_img = PILImage.open(BytesIO(original_bytes))
        w, h = pil_img.size
        new_w = 480
        new_h = int(h * (new_w / w))
        thumb_img = pil_img.resize((new_w, new_h), PILImage.LANCZOS)
        thumb_buf = BytesIO()
        thumb_img.save(thumb_buf, "WEBP", quality=80)
        thumb_bytes = thumb_buf.getvalue()
        thumb_name = _generate_thumb_name(original_fname)
    except Exception as e:
        logger.error(f"Thumbnail generation failed: {e}")
        thumb_name = ""

    # Handle storage based on mode
    # For "both" mode: save to local FIRST, then upload to SeaweedFS
    # This ensures local storage is available immediately for the user
    if _should_save_locally():
        # Save original locally (first for both mode) - PNG to preserve workflow metadata
        await _save_locally(original_bytes, original_fname, gallery)

        # Save thumbnail locally (WebP, quality 80)
        if thumb_bytes:
            await _save_locally(thumb_bytes, original_fname, gallery, is_thumb=True)

    if _should_upload_to_filer():
        # Upload original to SeaweedFS (second for both mode) - PNG to preserve workflow metadata
        await _upload_to_filer(original_bytes, original_fname, gallery)

        # Upload thumbnail (reuse the same bytes generated above)
        if thumb_bytes:
            await _upload_to_filer(thumb_bytes, original_fname, gallery, is_thumb=True)

    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    user_id = request.state.user_id if hasattr(request.state, "user_id") else 1

    db_execute("""
        INSERT INTO images (user_id, filename, thumbnail, prompt, prompt_negative,
            seed, checkpoint, sampler, scheduler, steps, cfg,
            resolution, image_mode, gallery_name, width, height, timestamp, storage_mode)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        user_id, fname, thumb_name, prompt, promptNegative,
        seed, checkpoint, sampler, scheduler,
        int(steps) if steps else 0,
        float(cfg) if cfg else 0,
        resolution, imageMode, gallery or None, w, h, ts, storage_mode,
    ))

    await clear_user_cache(user_id)

    return {"ok": True, "filename": fname}

# ── Image Proxy ──
def _get_image_path(filename: str, gallery_name: str = "") -> Path:
    """Get the local path for an image."""
    if gallery_name:
        return GALLERY_DIR / gallery_name / filename
    return GALLERY_DIR / filename


@router.get("/api/image/{gallery_name:path}/{filename:path}")
async def image_proxy(gallery_name: str, filename: str):
    storage_mode = _get_storage_mode()

    # Try local storage first (for local/both modes)
    if storage_mode in ("local", "both"):
        local_path = _get_image_path(filename, gallery_name)
        if local_path.exists():
            ct = "image/png" if filename.endswith(".png") else "image/webp" if filename.endswith(".webp") else "image/jpeg" if filename.endswith((".jpg",".jpeg")) else "application/octet-stream"
            return FileResponse(str(local_path), media_type=ct)

    # Try SeaweedFS (for seaweedfs/both modes)
    if storage_mode in ("seaweedfs", "both"):
        url = f"{S3_FILER_URL}/buckets/{S3_BUCKET}/{quote(gallery_name)}/{quote(filename)}"

        try:
            async with httpx.AsyncClient(timeout=30) as c:
                r = await c.get(url)

                if r.status_code == 200:
                    ct = "image/png" if filename.endswith(".png") else "image/webp" if filename.endswith(".webp") else "image/jpeg" if filename.endswith((".jpg",".jpeg")) else r.headers.get("content-type","application/octet-stream")

                    return Response(content=r.content, media_type=ct)
        except httpx.RequestError:
            pass

    raise HTTPException(404, "Gambar tidak ditemukan")


@router.get("/api/image/{filename:path}")
async def image_proxy_root(filename: str):
    storage_mode = _get_storage_mode()

    # Try local storage first (for local/both modes)
    if storage_mode in ("local", "both"):
        local_path = _get_image_path(filename)
        if local_path.exists():
            ct = "image/png" if filename.endswith(".png") else "image/webp" if filename.endswith(".webp") else "image/jpeg" if filename.endswith((".jpg",".jpeg")) else "application/octet-stream"
            return FileResponse(str(local_path), media_type=ct)

    # Try SeaweedFS (for seaweedfs/both modes)
    if storage_mode in ("seaweedfs", "both"):
        url = f"{S3_FILER_URL}/buckets/{S3_BUCKET}/{quote(filename)}"

        try:
            async with httpx.AsyncClient(timeout=30) as c:
                r = await c.get(url)

                if r.status_code == 200:
                    ct = "image/png" if filename.endswith(".png") else "image/webp" if filename.endswith(".webp") else "image/jpeg" if filename.endswith((".jpg",".jpeg")) else r.headers.get("content-type","application/octet-stream")

                    return Response(content=r.content, media_type=ct)
        except httpx.RequestError:
            pass

    raise HTTPException(404, "Gambar tidak ditemukan")

# ── Static Files ──
@router.get("/favicon.ico")
async def favicon():
    return Response(content='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🌙</text></svg>', media_type="image/svg+xml")

@router.get("/")
async def index():
    idx = MIMPI_DIST / "index.html"

    if idx.exists(): return HTMLResponse(idx.read_text(encoding="utf-8"))

    return HTMLResponse("<h1>Build belum tersedia</h1>")

@router.get("/assets/{filename}")
async def assets(filename: str):
    p = MIMPI_ASSETS / filename

    if not p.exists(): raise HTTPException(404)

    ct = "text/css" if filename.endswith(".css") else "application/javascript" if filename.endswith(".js") else "application/octet-stream"

    return FileResponse(str(p), media_type=ct)

@router.get("/gallery/{filename}")
async def gallery(filename: str):
    p = GALLERY_DIR / filename

    if not p.exists(): raise HTTPException(404)

    return FileResponse(str(p))

@router.get("/thumbnails/{filename}")
async def thumb(filename: str):
    p = THUMB_DIR / filename

    if not p.exists(): p = GALLERY_DIR / filename
    if not p.exists(): raise HTTPException(404)

    return FileResponse(str(p))

# ── Health Check ──
@router.get("/api/health")
async def health_check():
    """Enhanced health check that verifies actual service health."""
    health = {"status": "ok", "checks": {}}
    
    # Check database connection
    try:
        from server.database import get_db
        conn = get_db()
        health["checks"]["database"] = "connected"
    except Exception as e:
        health["checks"]["database"] = f"error: {str(e)}"
        health["status"] = "degraded"
    
    # Check ComfyUI connection
    try:
        from server.helpers import get_active_comfy
        comfy_url, _ = get_active_comfy()
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(f"{comfy_url}/server")
            health["checks"]["comfyui"] = "connected" if r.status_code == 200 else "disconnected"
    except Exception as e:
        health["checks"]["comfyui"] = f"error: {str(e)}"
        health["status"] = "degraded"
    
    # Check storage mode
    try:
        from server.settings import get_storage_mode
        mode = get_storage_mode()
        health["checks"]["storage"] = mode
    except Exception as e:
        health["checks"]["storage"] = f"error: {str(e)}"
        health["status"] = "degraded"
    
    return health
