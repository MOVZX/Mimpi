"""Mimpi Dashboard — Redis Cache Layer"""

import hashlib
import json
import logging
from typing import Any, Callable

import redis.asyncio as aioredis

logger = logging.getLogger("uvicorn")

# ── Connection ──
_redis: aioredis.Redis | None = None
_cache_enabled = True


async def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        try:
            _redis = aioredis.from_url("redis://localhost:6379/0", decode_responses=True)
            await _redis.ping()
            logger.info("✅ Redis cache connected")
        except Exception as e:
            logger.warning(f"⚠️ Redis unavailable, cache disabled: {e}")
            global _cache_enabled
            _cache_enabled = False
            return None
    return _redis


def _make_key(prefix: str, *parts: str | int) -> str:
    """Build a deterministic cache key from parts."""
    raw = ":".join(str(p) for p in parts)
    # Hash long keys to avoid Redis key length issues
    if len(raw) > 200:
        h = hashlib.md5(raw.encode()).hexdigest()
        return f"{prefix}:{h}"
    return f"{prefix}:{raw}"


async def cache_get(key: str) -> Any | None:
    """Get cached value. Returns parsed JSON or None."""
    r = await get_redis()
    if not r or not _cache_enabled:
        return None
    try:
        val = await r.get(key)
        return json.loads(val) if val else None
    except Exception as e:
        logger.debug(f"Cache GET error: {e}")
        return None


async def cache_set(key: str, value: Any, ttl: int = 30) -> None:
    """Set cached value with TTL (default 30s)."""
    r = await get_redis()
    if not r or not _cache_enabled:
        return
    try:
        await r.setex(key, ttl, json.dumps(value, default=str))
    except Exception as e:
        logger.debug(f"Cache SET error: {e}")


async def cache_del(pattern: str) -> None:
    """Alias for cache_invalidate. Deletes all keys matching a pattern."""
    await cache_invalidate(pattern)


async def cache_invalidate(pattern: str) -> None:
    """Invalidate all keys matching a pattern (e.g. 'gallery:list:1')."""
    r = await get_redis()
    if not r or not _cache_enabled:
        return
    try:
        keys = await r.keys(pattern)
        if keys:
            await r.delete(*keys)
            logger.debug(f"Cache invalidated: {pattern} ({len(keys)} keys)")
    except Exception as e:
        logger.debug(f"Cache INVALIDATE error: {e}")


async def cached(
    key_prefix: str,
    ttl: int,
    fetcher: Callable[[], Any],
    *key_parts: str | int,
) -> Any:
    """Cache-aside helper: check cache → miss → fetch → store → return."""
    key = _make_key(key_prefix, *key_parts)
    cached_val = await cache_get(key)
    if cached_val is not None:
        return cached_val
    val = await fetcher()
    if val is not None:
        await cache_set(key, val, ttl)
    return val


async def clear_user_cache(user_id: int) -> None:
    """Invalidate ALL caches for a given user.
    
    Call this from every mutation endpoint (add/edit/delete) to ensure
    gallery, presets, stats, and any future caches stay in sync.
    
    Keys to clear:
      galleries:{user_id}            — list of galleries
      gallery:{user_id}:*             — paginated gallery image lists
      stats:{user_id}                 — dashboard statistics
      zimage-presets:{user_id}        — Z-Image presets (list)
      zimage-presets:{user_id}:*      — future sub-keys
      sdxl-presets:{user_id}          — SDXL presets (list)
      sdxl-presets:{user_id}:*        — future sub-keys
      models-list                     — shared models list (no user)
    """
    prefix = str(user_id)
    patterns = [
        f"galleries:{prefix}",
        f"gallery:{prefix}:*",
        f"stats:{prefix}",
        f"zimage-presets:{prefix}",
        f"zimage-presets:{prefix}:*",
        f"sdxl-presets:{prefix}",
        f"sdxl-presets:{prefix}:*",
        "models-list",
    ]
    for p in patterns:
        await cache_invalidate(p)
