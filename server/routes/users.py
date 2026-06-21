"""Mimpi Dashboard — User Management Routes"""

import json
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from server.database import db_query, db_execute
from server.auth import _hash_password, _verify_password

router = APIRouter()

# ── Pydantic Models ──
class CreateUserRequest(BaseModel):
    username: str
    password: str
    role: str = "user"

class UpdateUserRequest(BaseModel):
    username: str | None = None
    role: str | None = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ChangeUsernameRequest(BaseModel):
    new_username: str

# ── User Management ──
@router.get("/api/users")
async def get_users(request: Request = None):
    user_role = request.state.user_role if hasattr(request.state, "user_role") else "user"

    if user_role != "admin":
        # Regular users can only see themselves
        user_id = request.state.user_id
        row = db_query("SELECT id, username, role, created_at FROM users WHERE id = %s", [user_id])

        return {"users": row if row else []}

    # Admin can see all users
    rows = db_query("SELECT id, username, role, created_at FROM users ORDER BY id")

    return {"users": rows}

@router.post("/api/users")
async def create_user(request: Request = None, data: CreateUserRequest = None):
    user_role = request.state.user_role

    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")

    if data:
        username = data.username
        password = data.password
        role = data.role
    else:
        body = await request.json()
        username = body.get("username", "")
        password = body.get("password", "")
        role = body.get("role", "user")

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password required")

    hashed = _hash_password(password)

    db_execute("INSERT INTO users (username, password_hash, role) VALUES (%s, %s, %s)", (username, hashed, role))

    return {"ok": True, "username": username}

@router.put("/api/users/{user_id}")
async def update_user(user_id: int, request: Request = None, data: UpdateUserRequest = None):
    user_role = request.state.user_role

    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")

    if data:
        username = data.username
        role = data.role
    else:
        body = await request.json()
        username = body.get("username")
        role = body.get("role")

    if username:
        db_execute("UPDATE users SET username = %s WHERE id = %s", (username, user_id))
    if role:
        db_execute("UPDATE users SET role = %s WHERE id = %s", (role, user_id))

    return {"ok": True}

@router.delete("/api/users/{user_id}")
async def delete_user(user_id: int, request: Request = None):
    user_role = request.state.user_role

    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")

    # Don't allow deleting yourself
    current_user_id = request.state.user_id

    if user_id == current_user_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    db_execute("DELETE FROM users WHERE id = %s", [user_id])

    return {"ok": True}

@router.put("/api/user/password")
async def change_password(request: Request = None, data: ChangePasswordRequest = None):
    if data:
        current_password = data.current_password
        new_password = data.new_password
    else:
        body = await request.json()
        current_password = body.get("current_password", "")
        new_password = body.get("new_password", "")

    user_id = request.state.user_id

    # Verify current password
    row = db_query("SELECT password_hash FROM users WHERE id = %s", [user_id])

    if not row:
        raise HTTPException(status_code=404, detail="User not found")

    if not _verify_password(current_password, row[0]["password_hash"]):
        raise HTTPException(status_code=401, detail="Current password incorrect")

    # Update password
    hashed = _hash_password(new_password)

    db_execute("UPDATE users SET password_hash = %s WHERE id = %s", (hashed, user_id))

    return {"ok": True}

@router.put("/api/user/username")
async def change_username(request: Request = None, data: ChangeUsernameRequest = None):
    if data:
        new_username = data.new_username
    else:
        body = await request.json()
        new_username = body.get("new_username", "")

    user_id = request.state.user_id

    if not new_username:
        raise HTTPException(status_code=400, detail="Username required")

    db_execute("UPDATE users SET username = %s WHERE id = %s", (new_username, user_id))

    return {"ok": True}
