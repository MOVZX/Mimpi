"""Mimpi Dashboard — Settings Management"""

import logging
from server.config import DEFAULT_STORAGE_MODE, STORAGE_MODES
from server.database import db_query, db_execute

logger = logging.getLogger("uvicorn")

# ── Settings Keys ──
STORAGE_MODE_KEY = "storage_mode"

# ── Settings Cache ──
_settings_cache = {}


def _get_setting(key: str, default: str = "") -> str:
    """Get a setting value from database with caching."""
    if key in _settings_cache:
        return _settings_cache[key]

    row = db_query("SELECT value FROM settings WHERE key = %s", [key])
    if row:
        value = row[0]["value"]
        _settings_cache[key] = value
        return value

    # Set default if not exists
    db_execute(
        "INSERT INTO settings (key, value, description) VALUES (%s, %s, %s) "
        "ON DUPLICATE KEY UPDATE value = VALUES(value)",
        [key, default, "Default setting"],
    )
    _settings_cache[key] = default
    return default


def get_storage_mode() -> str:
    """Get current storage mode from settings."""
    mode = _get_setting(STORAGE_MODE_KEY, DEFAULT_STORAGE_MODE)
    if mode not in STORAGE_MODES:
        logger.warning(f"⚠️  Invalid storage mode '{mode}', defaulting to '{DEFAULT_STORAGE_MODE}'")
        mode = DEFAULT_STORAGE_MODE
    return mode


def set_storage_mode(mode: str) -> bool:
    """Set storage mode in settings."""
    if mode not in STORAGE_MODES:
        logger.warning(f"⚠️  Invalid storage mode: {mode}")
        return False

    db_execute(
        "UPDATE settings SET value = %s, updated_at = NOW() WHERE key = %s",
        [mode, STORAGE_MODE_KEY],
    )
    _settings_cache[STORAGE_MODE_KEY] = mode
    logger.info(f"✅ Storage mode changed to: {mode}")
    return True


def reset_settings_cache():
    """Reset settings cache (call after mutation)."""
    _settings_cache.clear()
