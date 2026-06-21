"""Mimpi Dashboard — Settings Routes"""

from fastapi import APIRouter, Request, HTTPException
from server.settings import get_storage_mode, set_storage_mode, reset_settings_cache
from server.auth import _check_auth
from server.database import get_pool_stats

router = APIRouter()


@router.get("/api/settings")
async def get_settings(request: Request):
    """Get all settings (currently storage_mode)."""
    user = _check_auth(request)
    if not user:
        raise HTTPException(401, "Unauthorized")

    return {
        "storage_mode": get_storage_mode(),
    }


@router.put("/api/settings/storage-mode")
async def update_storage_mode(request: Request, data: dict):
    """Update storage mode setting."""
    user = _check_auth(request)
    if not user:
        raise HTTPException(401, "Unauthorized")

    # Only admin can change storage settings
    if user.get("role") != "admin":
        raise HTTPException(403, "Forbidden: Admin only")

    mode = data.get("storage_mode", "").strip().lower()
    if not set_storage_mode(mode):
        raise HTTPException(400, f"Invalid storage mode. Valid options: {', '.join(['local', 'seaweedfs', 'both'])}")

    reset_settings_cache()

    return {"message": "Storage mode updated", "storage_mode": mode}


@router.get("/api/settings/pool-stats")
async def get_pool_stats_endpoint(request: Request):
    """Get database connection pool statistics."""
    user = _check_auth(request)
    if not user:
        raise HTTPException(401, "Unauthorized")

    return get_pool_stats()
