"""Mimpi Dashboard — Authentication Helpers & Middleware"""

import secrets
from datetime import datetime, timezone, timedelta

import bcrypt
from fastapi import Request
from fastapi.responses import JSONResponse

from server.config import SESSION_EXPIRY_HOURS
from server.database import db_query

# ── Auth helpers ──
def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def _verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

def _create_session_token() -> str:
    return secrets.token_hex(32)

def _check_auth(request: Request) -> dict | None:
    token = request.cookies.get("mimpi_session")

    if not token:
        return None
    row = db_query(
        "SELECT s.*, u.username, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = %s AND s.expires_at > NOW()",
        [token],
    )

    if not row:
        return None

    return {"user_id": row[0]["user_id"], "username": row[0]["username"], "role": row[0]["role"]}

def _get_session_cookie(request: Request) -> str | None:
    return request.cookies.get("mimpi_session")

# ── Admin Endpoints ──
# Endpoints that require admin role
ADMIN_ENDPOINTS = [
    "/api/users",
    "/api/settings/storage-mode",
    "/api/gallery/batch-delete",
    "/api/cleanup-sessions",
]

# ── Auth Middleware ──
async def auth_middleware(request: Request, call_next):
    # Check auth ONLY for API endpoints
    if request.url.path.startswith("/api/"):
        # Skip auth for login/logout/verify
        if request.url.path in ("/api/login", "/api/logout", "/api/verify"):
            return await call_next(request)

        # Check auth
        user = _check_auth(request)

        if not user:
            return JSONResponse({"detail": "Unauthorized"}, status_code=401)

        # Add role-based access control for admin endpoints
        if request.url.path in ADMIN_ENDPOINTS and user.get("role") != "admin":
            return JSONResponse({"detail": "Forbidden"}, status_code=403)

        request.state.user = user
        request.state.user_id = user["user_id"]
        request.state.username = user["username"]
        request.state.user_role = user["role"]

    # Allow everything else (static files, SPA fallback, login page)
    return await call_next(request)
