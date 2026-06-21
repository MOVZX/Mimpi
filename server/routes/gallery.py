"""Mimpi Dashboard — Gallery Routes"""

from fastapi import APIRouter, Request, HTTPException
from server.database import db_query, db_execute
from server.config import S3_FILER_URL, S3_BUCKET, GALLERY_DIR
from server.cache import cache_get, cache_set, _make_key, clear_user_cache
from urllib.parse import quote
from server.auth import _check_auth
from server.settings import get_storage_mode
import httpx
import logging
from pathlib import Path

router = APIRouter()
logger = logging.getLogger("uvicorn")

# ── Gallery CRUD ──
def _row_to_item(row: dict) -> dict:
    return {
        "id": row["id"],
        "user_id": row.get("user_id", 1),
        "filename": row["filename"],
        "thumbnail": row.get("thumbnail", ""),
        "prompt": row.get("prompt", ""),
        "promptNegative": row.get("prompt_negative", ""),
        "seed": row.get("seed", ""),
        "checkpoint": row.get("checkpoint", ""),
        "sampler": row.get("sampler", ""),
        "scheduler": row.get("scheduler", ""),
        "steps": row.get("steps", 0),
        "cfg": float(row["cfg"]) if row.get("cfg") else 0,
        "resolution": row.get("resolution", ""),
        "imageMode": row.get("image_mode", ""),
        "galleryName": row.get("gallery_name") or "",
        "width": row.get("width", 0),
        "height": row.get("height", 0),
        "timestamp": row["timestamp"].isoformat() if row.get("timestamp") else "",
        "storageMode": row.get("storage_mode", ""),
    }

# ── Gallery CRUD (SeaweedFS Filer) ──
@router.get("/api/galleries")
async def list_galleries(request: Request):
    user_id = request.state.user_id
    key = _make_key("galleries", str(user_id))
    cached = await cache_get(key)

    if cached is not None:
        return {"galleries": cached}
    rows = db_query(
        "SELECT id, name, created_at FROM galleries WHERE user_id = %s ORDER BY name",
        [user_id],
    )

    await cache_set(key, rows, ttl=300)

    return {"galleries": rows}

@router.post("/api/galleries")
async def create_gallery(request: Request, data: dict):
    user_id = request.state.user_id
    name = data.get("name", "").strip()

    if not name:
        raise HTTPException(400, "Nama gallery wajib diisi")
    try:
        db_execute(
            "INSERT INTO galleries (user_id, name) VALUES (%s, %s)",
            [user_id, name],
        )

        rows = db_query("SELECT MAX(id) AS id FROM galleries WHERE user_id = %s", [user_id])
        new_id = rows[0]["id"] if rows else None

        await clear_user_cache(user_id)

        return {"message": "Gallery ditambahkan", "id": new_id, "name": name}
    except Exception as e:
        if "Duplicate" in str(e):
            raise HTTPException(409, f"Gallery '{name}' sudah ada")

        raise HTTPException(500, str(e))

@router.put("/api/galleries/{gallery_id}")
async def update_gallery(request: Request, gallery_id: int, data: dict):
    user_id = request.state.user_id
    name = data.get("name", "").strip()

    if not name:
        raise HTTPException(400, "Nama gallery wajib diisi")

    existing = db_query("SELECT id FROM galleries WHERE id = %s AND user_id = %s", [gallery_id, user_id])

    if not existing:
        raise HTTPException(404, "Gallery tidak ditemukan")

    # Update the gallery name
    old_name = db_query("SELECT name FROM galleries WHERE id = %s", [gallery_id])[0]["name"]

    db_execute("UPDATE galleries SET name = %s WHERE id = %s AND user_id = %s", [name, gallery_id, user_id])
    # Also update gallery_name in images that reference the old name
    db_execute("UPDATE images SET gallery_name = %s WHERE gallery_name = %s AND user_id = %s",
               [name, old_name, user_id])

    await clear_user_cache(user_id)

    return {"message": "Gallery diperbarui"}

@router.delete("/api/galleries/{gallery_id}")
async def delete_gallery(request: Request, gallery_id: int):
    user_id = request.state.user_id
    existing = db_query("SELECT id, name FROM galleries WHERE id = %s AND user_id = %s", [gallery_id, user_id])

    if not existing:
        raise HTTPException(404, "Gallery tidak ditemukan")

    gallery_name = existing[0]["name"]

    db_execute("DELETE FROM galleries WHERE id = %s AND user_id = %s", [gallery_id, user_id])
    # Set images in this gallery to null
    db_execute("UPDATE images SET gallery_name = NULL WHERE gallery_name = %s AND user_id = %s",
               [gallery_name, user_id])

    await clear_user_cache(user_id)

    return {"message": "Gallery dihapus"}

@router.get("/api/gallery")
async def get_gallery(page: int = 1, limit: int = 48, sort: str = "newest", search: str = "", model: str = "", gallery: str = "", request: Request = None):
    # Filter by user_id unless admin
    user_id = request.state.user_id if hasattr(request.state, "user_id") else 1
    user_role = request.state.user_role if hasattr(request.state, "user_role") else "user"
    # Try cache
    cache_key = _make_key("gallery", str(user_id), str(page), str(limit), sort, search, model, gallery)

    if not search and not model and not gallery:
        cached = await cache_get(cache_key)

        if cached is not None:
            return cached

    where, params = [], []

    if user_role != "admin":
        where.append("user_id = %s")
        params.append(user_id)

    if search:
        s = f"%{search}%"

        where.append("(prompt LIKE %s OR prompt_negative LIKE %s OR checkpoint LIKE %s OR seed LIKE %s)")
        params.extend([s, s, s, s])

    if model:
        where.append("checkpoint = %s")
        params.append(model)

    if gallery:
        gallery_clean = gallery.strip()

        if gallery_clean:
            where.append("gallery_name = %s")
            params.append(gallery_clean)

    where_sql = (" WHERE " + " AND ".join(where)) if where else ""
    count_sql = f"SELECT COUNT(*) AS total FROM images{where_sql}"
    total = db_query(count_sql, params)[0]["total"]
    valid_orders = {"newest": "timestamp DESC", "oldest": "timestamp ASC"}
    order = valid_orders.get(sort, "timestamp DESC")
    total_pages = max(1, (total + limit - 1) // limit)
    page = max(1, min(page, total_pages))
    offset = (page - 1) * limit
    sql = f"SELECT * FROM images{where_sql} ORDER BY {order} LIMIT %s OFFSET %s"
    rows = db_query(sql, params + [limit, offset], multi=True)
    items = [_row_to_item(r) for r in rows]
    result = {"items": items, "total": total, "page": page, "total_pages": total_pages}

    # Cache only unfiltered queries (search/model/gallery filters are too varied)
    if not search and not model and not gallery:
        await cache_set(cache_key, result, ttl=30)

    return result

@router.delete("/api/gallery/{item_id}")
async def delete_gallery(item_id: int, request: Request = None):
    user_id = request.state.user_id if request and hasattr(request.state, "user_id") else 1
    user_role = request.state.user_role if request and hasattr(request.state, "user_role") else "user"

    # Check ownership unless admin
    if user_role != "admin":
        row = db_query("SELECT user_id FROM images WHERE id = %s", [item_id])

        if not row or row[0]["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Forbidden")

    # Get file info before deleting
    img = db_query("SELECT filename, gallery_name, storage_mode FROM images WHERE id = %s AND user_id = %s", [item_id, user_id])

    if not img:
        raise HTTPException(404, "Gambar tidak ditemukan")

    fname = img[0]["filename"]
    gal = img[0].get("gallery_name") or ""
    storage_mode = img[0].get("storage_mode") or get_storage_mode()
    filer_base = f"{S3_FILER_URL}/buckets/{S3_BUCKET}"
    folder = f"{quote(gal)}/" if gal else ""

    # Delete based on storage mode
    # For "both" mode: delete from local FIRST, then SeaweedFS
    if storage_mode in ("local", "both"):
        # Delete from local filesystem (first for both mode)
        def _del_local(path: str) -> bool:
            try:
                local_path = GALLERY_DIR / (gal if gal else "") / path
                if local_path.exists():
                    local_path.unlink()
                    return True
                return True  # File doesn't exist, consider it deleted
            except Exception:
                return False

        ok_orig = _del_local(fname)
        ok_thumb = _del_local(fname.replace(".png", "_thumb.webp").replace(".webp", "_thumb.webp"))

        if not ok_orig or not ok_thumb:
            raise HTTPException(502, "Gagal menghapus file dari storage, data tetap disimpan")

    if storage_mode in ("seaweedfs", "both"):
        # Delete from SeaweedFS (second for both mode)
        async def _del_filer(path: str):
            try:
                async with httpx.AsyncClient(timeout=10) as c:
                    r = await c.delete(f"{filer_base}/{folder}{quote(path)}")
                    return r.status_code in (200, 202, 204, 404)
            except Exception:
                return False

        ok_orig = await _del_filer(fname)
        ok_thumb = await _del_filer(fname.replace(".png", "_thumb.webp").replace(".webp", "_thumb.webp"))

        if not ok_orig or not ok_thumb:
            raise HTTPException(502, "Gagal menghapus file dari storage, data tetap disimpan")

    # Delete from DB
    db_execute("DELETE FROM images WHERE id = %s AND user_id = %s", [item_id, user_id])

    await clear_user_cache(user_id)

    return {"ok": True}

@router.post("/api/gallery/batch-delete")
async def batch_delete_gallery(ids: list[int], request: Request = None):
    user_id = request.state.user_id
    user_role = request.state.user_role
    deleted = 0
    errors = []

    for id_val in ids:
        try:
            if user_role != "admin":
                img = db_query("SELECT filename, gallery_name, storage_mode FROM images WHERE id = %s AND user_id = %s", [id_val, user_id])
            else:
                img = db_query("SELECT filename, gallery_name, storage_mode FROM images WHERE id = %s", [id_val])

            if not img:
                continue

            fname = img[0]["filename"]
            gal = img[0].get("gallery_name") or ""
            storage_mode = img[0].get("storage_mode") or get_storage_mode()
            folder = f"{quote(gal)}/" if gal else ""

            # Delete based on storage mode
            # For "both" mode: delete from local FIRST, then SeaweedFS
            if storage_mode in ("local", "both"):
                def _del_local(path: str) -> bool:
                    try:
                        local_path = GALLERY_DIR / (gal if gal else "") / path
                        if local_path.exists():
                            local_path.unlink()
                            return True
                        return True
                    except Exception:
                        return False

                ok1 = _del_local(fname)
                ok2 = _del_local(fname.replace(".png", "_thumb.webp").replace(".webp", "_thumb.webp"))

                if not ok1 or not ok2:
                    errors.append(id_val)
                    continue

            if storage_mode in ("seaweedfs", "both"):
                async def _del_filer(path: str):
                    try:
                        async with httpx.AsyncClient(timeout=10) as c:
                            r = await c.delete(f"{S3_FILER_URL}/buckets/{S3_BUCKET}/{folder}{quote(path)}")

                            return r.status_code in (200, 202, 204, 404)
                    except Exception:
                        return False

                ok1 = await _del_filer(fname)
                ok2 = await _del_filer(fname.replace(".png", "_thumb.webp").replace(".webp", "_thumb.webp"))

                if not ok1 or not ok2:
                    errors.append(id_val)
                    continue

            if user_role != "admin":
                db_execute("DELETE FROM images WHERE id = %s AND user_id = %s", [id_val, user_id])
            else:
                db_execute("DELETE FROM images WHERE id = %s", [id_val])

            deleted += 1
        except Exception:
            errors.append(id_val)

    await clear_user_cache(user_id)

    return {"ok": True, "deleted": deleted, "errors": errors}

@router.get("/api/stats")
async def get_stats(request: Request = None):
    user_id = request.state.user_id
    user_role = request.state.user_role
    # Try cache first
    cached = await cache_get(f"stats:{user_id}")

    if cached is not None:
        return cached

    if user_role != "admin":
        total_row = db_query("SELECT COUNT(*) AS total FROM images WHERE user_id = %s", [user_id])[0]

        models = db_query("""
            SELECT SUBSTRING_INDEX(checkpoint, '/', -1) AS name, COUNT(*) AS count
            FROM images WHERE checkpoint != '' AND user_id = %s GROUP BY name ORDER BY count DESC LIMIT 20
        """, [user_id], multi=True)

        samplers = db_query("""
            SELECT sampler AS name, COUNT(*) AS count
            FROM images WHERE sampler != '' AND user_id = %s GROUP BY sampler ORDER BY count DESC LIMIT 20
        """, [user_id], multi=True)

        monthly = db_query("""
            SELECT DATE_FORMAT(timestamp, '%Y-%m') AS month, COUNT(*) AS count
            FROM images WHERE user_id = %s GROUP BY month ORDER BY month
        """, [user_id], multi=True)
    else:
        total_row = db_query("SELECT COUNT(*) AS total FROM images")[0]

        models = db_query("""
            SELECT SUBSTRING_INDEX(checkpoint, '/', -1) AS name, COUNT(*) AS count
            FROM images WHERE checkpoint != '' GROUP BY name ORDER BY count DESC LIMIT 20
        """, multi=True)

        samplers = db_query("""
            SELECT sampler AS name, COUNT(*) AS count
            FROM images WHERE sampler != '' GROUP BY sampler ORDER BY count DESC LIMIT 20
        """, multi=True)

        monthly = db_query("""
            SELECT DATE_FORMAT(timestamp, '%Y-%m') AS month, COUNT(*) AS count
            FROM images GROUP BY month ORDER BY month
        """, multi=True)

    total = total_row["total"]

    result = {
        "total": total,
        "top_models": [{"name": r["name"], "count": r["count"]} for r in models],
        "samplers": [{"name": r["name"], "count": r["count"]} for r in samplers],
        "monthly": [{"month": r["month"], "count": r["count"]} for r in monthly],
    }

    # Cache stats — changes only when images are added/deleted
    await cache_set(f"stats:{user_id}", result, ttl=120)

    return result
