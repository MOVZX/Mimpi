"""Mimpi Dashboard — Shared Helpers"""

import logging
from server.config import COM_URI, COM_TOKEN
from server.database import db_query

logger = logging.getLogger("uvicorn")


def get_active_comfy():
    """Get the active ComfyUI server URL and auth string."""
    rows = db_query("SELECT url, token FROM comfy_servers WHERE is_active = 1 LIMIT 1")

    if rows:
        url = rows[0]["url"]
        token = rows[0]["token"]
    else:
        url = COM_URI
        token = COM_TOKEN

    auth = f"?token={token}" if token else ""

    return url, auth
