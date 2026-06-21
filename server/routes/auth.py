"""Mimpi Dashboard — Authentication Routes"""

import asyncio
import json
import time
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
from server.database import db_query, db_execute
from server.auth import _verify_password, _create_session_token
from server.rate_limiter import RateLimiter
from datetime import timedelta

router = APIRouter()

# ── Pydantic Models ──
class LoginRequest(BaseModel):
    username: str
    password: str

# ── Rate Limiting ──
# Use deque-based RateLimiter to prevent memory leaks
# asyncio.Lock provides async safety for concurrent requests
_login_limiter = RateLimiter(
    window=timedelta(seconds=300),
    max_attempts=10,
    lock=asyncio.Lock(),
)

async def _check_rate_limit(ip: str) -> bool:
    """Check if IP has exceeded login rate limit. Returns True if allowed."""
    return await _login_limiter.is_allowed(ip)

# ── Auth endpoints ──
@router.post("/api/login")
async def api_login(request: Request, data: LoginRequest):
    ip = request.client.host if request.client else ""

    if not await _check_rate_limit(ip):
        return JSONResponse({"ok": False, "error": "Too many login attempts. Please try again later."}, status_code=429)

    username = data.username
    password = data.password

    # Check credentials
    row = db_query("SELECT id, password_hash, role FROM users WHERE username = %s", [username])

    if not row:
        return JSONResponse({"ok": False, "error": "Username atau password salah"}, status_code=401)

    if not _verify_password(password, row[0]["password_hash"]):
        return JSONResponse({"ok": False, "error": "Username atau password salah"}, status_code=401)

    user_role = row[0].get("role", "user")
    # Create session
    token = _create_session_token()
    expires_at = (datetime.now(timezone.utc) + timedelta(hours=168)).strftime("%Y-%m-%d %H:%M:%S")

    db_execute(
        "INSERT INTO sessions (id, user_id, token, expires_at, ip_address) VALUES (%s, %s, %s, %s, %s)",
        (token, row[0]["id"], token, expires_at, request.client.host if request.client else ""),
    )

    resp = JSONResponse({"ok": True, "username": username, "role": user_role})

    resp.set_cookie(
        key="mimpi_session",
        value=token,
        httponly=True,
        secure=True,  # Only send over HTTPS
        samesite="strict",  # Strict CSRF protection
        max_age=168 * 3600,
    )

    return resp

@router.post("/api/logout")
async def api_logout(request: Request):
    token = request.cookies.get("mimpi_session")

    if token:
        db_execute("DELETE FROM sessions WHERE token = %s", [token])

    resp = JSONResponse({"ok": True})

    resp.delete_cookie(key="mimpi_session")

    return resp

@router.get("/api/verify")
async def api_verify(request: Request):
    from server.auth import _check_auth

    user = _check_auth(request)

    if user:
        return {"authenticated": True, "username": user["username"], "role": user["role"]}

    return {"authenticated": False}

# ── Session Cleanup ──
@router.post("/api/cleanup-sessions")
async def cleanup_sessions():
    """Remove expired sessions from the database."""
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    result = db_execute("DELETE FROM sessions WHERE expires_at < %s", [now])

    return {"cleaned": result}
