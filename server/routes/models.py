"""Mimpi Dashboard — Models & Checkpoints Routes"""

import json
from fastapi import APIRouter
from server.database import db_query
from server.models import ZIMAGE_CHECKPOINTS, ZIMAGE_LORAS
from server.cache import cache_get, cache_set

router = APIRouter()

# ── Z-Image Models ──
@router.get("/api/zimage-models")
async def list_zimage_models():
    return {
        "checkpoints": ZIMAGE_CHECKPOINTS,
        "loras": ZIMAGE_LORAS,
    }

# ── Checkpoints ──
@router.get("/api/checkpoints")
async def get_checkpoints():
    from server.config import PROJECT_DIR

    cp_path = PROJECT_DIR / "js" / "checkpoints.json"

    if not cp_path.exists(): return {"categories": []}

    return json.loads(cp_path.read_text())

# ── Models List ──
@router.get("/api/models")
async def get_models():
    cached = await cache_get("models-list")

    if cached is not None:
        return {"models": cached}

    rows = db_query("SELECT DISTINCT checkpoint FROM images WHERE checkpoint != '' ORDER BY checkpoint")
    result = [r["checkpoint"] for r in rows]

    await cache_set("models-list", result, ttl=300)

    return {"models": result}
