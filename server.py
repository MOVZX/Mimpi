#!/usr/bin/env python3
"""Mimpi Dashboard Backend"""
import json, os, random, re, secrets
from datetime import datetime, timezone, timedelta
from pathlib import Path

from dotenv import load_dotenv
import mysql.connector
import bcrypt
import httpx
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request, Response
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from PIL import Image

load_dotenv()

# ── Paths ──
PROJECT_DIR = Path(__file__).resolve().parent
MIMPI_DIST = PROJECT_DIR / "mimpi-src" / "dist"
MIMPI_ASSETS = MIMPI_DIST / "assets"
GALLERY_DIR = PROJECT_DIR / "gallery"
THUMB_DIR = PROJECT_DIR / "thumbnails"
GALLERY_DIR.mkdir(exist_ok=True)
THUMB_DIR.mkdir(exist_ok=True)

# ── Config ──
COM_URI = os.environ.get("COMFY_URI", "https://comfyui.idihore.id")
COM_TOKEN = os.environ.get("COMFY_TOKEN", "")
COM_AUTH = f"?token={COM_TOKEN}" if COM_TOKEN else ""

# ── MariaDB ──
DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "port": int(os.environ.get("DB_PORT", "3306")),
    "database": os.environ.get("DB_NAME", "mimpi"),
    "user": os.environ.get("DB_USER", "mimpi"),
    "password": os.environ.get("DB_PASSWORD", ""),
    "autocommit": True,
}

# ── Auth ──
AUTH_USERNAME = os.environ.get("AUTH_USERNAME", "admin")
AUTH_PASSWORD = os.environ.get("AUTH_PASSWORD", "admin")
SESSION_EXPIRY_HOURS = 168  # 7 days

# ── DB helpers ──
def get_db():
    return mysql.connector.connect(**DB_CONFIG)

def db_query(sql, params=None, multi=False):
    conn = get_db()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(sql, params or ())
        if multi:
            results = [dict(r) for r in cur]
            cur.close()
            return results
        result = cur.fetchall()
        cur.close()
        return result
    finally:
        conn.close()

def db_execute(sql, params=None):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(sql, params or ())
        cur.close()
    finally:
        conn.close()

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
        request.state.user = user
        request.state.user_id = user["user_id"]
        request.state.username = user["username"]
        request.state.user_role = user["role"]
    
    # Allow everything else (static files, SPA fallback, login page)
    return await call_next(request)

# ── Auto Migration ──
DB_VERSION = 4

MIGRATION_SQL = """
CREATE TABLE IF NOT EXISTS images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL DEFAULT 1,
    filename VARCHAR(255) NOT NULL,
    thumbnail VARCHAR(255),
    prompt TEXT,
    prompt_negative TEXT,
    seed VARCHAR(50),
    checkpoint VARCHAR(255),
    sampler VARCHAR(50),
    scheduler VARCHAR(50),
    steps INT DEFAULT 0,
    cfg DECIMAL(5,2) DEFAULT 0,
    resolution VARCHAR(20),
    image_mode VARCHAR(20),
    width INT DEFAULT 0,
    height INT DEFAULT 0,
    timestamp DATETIME NOT NULL,
    INDEX idx_timestamp (timestamp DESC),
    INDEX idx_checkpoint (checkpoint),
    INDEX idx_sampler (sampler)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS _migration (
    id INT AUTO_INCREMENT PRIMARY KEY,
    version INT NOT NULL UNIQUE,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(128) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comfy_servers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    url VARCHAR(255) NOT NULL DEFAULT '',
    token VARCHAR(255) NOT NULL DEFAULT '',
    is_active TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
"""

async def migrate_db():
    import logging
    logger = logging.getLogger("uvicorn")

    # Create database
    conn = mysql.connector.connect(
        host=DB_CONFIG["host"], port=DB_CONFIG["port"],
        user=DB_CONFIG["user"], password=DB_CONFIG["password"],
    )
    cur = conn.cursor()
    db_name = DB_CONFIG["database"]
    cur.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    logger.info(f"✅ Database '{db_name}' ready")
    cur.close()
    conn.close()

    # Create tables
    conn = get_db()
    cur = conn.cursor()
    for stmt in MIGRATION_SQL.strip().split(";"):
        stmt = stmt.strip()
        if stmt:
            cur.execute(stmt)
    logger.info("✅ Tables created/verified")

    # Run migrations
    cur.execute("SELECT version FROM _migration ORDER BY version DESC LIMIT 1")
    result = cur.fetchone()
    current_version = result[0] if result else 0

    if current_version < DB_VERSION:
        logger.info(f"🔄 Migrating from v{current_version} to v{DB_VERSION}...")
        # v2: added users table
        # v3: added sessions table
        # v4: added user_id to images, role to users
        if current_version < 4:
            try:
                cur.execute("ALTER TABLE images ADD COLUMN user_id INT NOT NULL DEFAULT 1")
                cur.execute("ALTER TABLE images ADD INDEX idx_user_id (user_id)")
                logger.info("✅ Added user_id to images table")
            except:
                pass  # Column might already exist
            try:
                cur.execute("ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user'")
                logger.info("✅ Added role to users table")
            except:
                pass  # Column might already exist
            # Update existing images to user_id 1 (admin)
            cur.execute("UPDATE images SET user_id = 1 WHERE user_id = 0")
            logger.info("✅ Migrated existing images to user_id 1")
        cur.execute("INSERT INTO _migration (version) VALUES (%s)", (DB_VERSION,))
        logger.info(f"✅ Migrated to v{DB_VERSION}")

        # Create default admin user if not exists
        cur.execute("SELECT COUNT(*) FROM users WHERE username = %s", (AUTH_USERNAME,))
        if cur.fetchone()[0] == 0:
            hashed = _hash_password(AUTH_PASSWORD)
            cur.execute("INSERT INTO users (username, password_hash) VALUES (%s, %s)", (AUTH_USERNAME, hashed))
            logger.info(f"✅ Default user '{AUTH_USERNAME}' created")

    cur.close()
    conn.close()

# ── App ──
app = FastAPI(on_startup=[migrate_db])
app.middleware("http")(auth_middleware)

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
        "width": row.get("width", 0),
        "height": row.get("height", 0),
        "timestamp": row["timestamp"].isoformat() if row.get("timestamp") else "",
    }

@app.get("/api/gallery")
async def get_gallery(page: int = 1, limit: int = 48, sort: str = "newest", search: str = "", model: str = "", request: Request = None):
    # Filter by user_id unless admin
    user_id = request.state.user_id if hasattr(request.state, "user_id") else 1
    user_role = request.state.user_role if hasattr(request.state, "user_role") else "user"
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
    where_sql = (" WHERE " + " AND ".join(where)) if where else ""
    count_sql = f"SELECT COUNT(*) AS total FROM images{where_sql}"
    total = db_query(count_sql, params)[0]["total"]
    order = "timestamp DESC" if sort == "newest" else "timestamp ASC"
    total_pages = max(1, (total + limit - 1) // limit)
    page = max(1, min(page, total_pages))
    offset = (page - 1) * limit
    sql = f"SELECT * FROM images{where_sql} ORDER BY {order} LIMIT %s OFFSET %s"
    rows = db_query(sql, params + [limit, offset], multi=True)
    items = [_row_to_item(r) for r in rows]
    return {"items": items, "total": total, "page": page, "total_pages": total_pages}

@app.delete("/api/gallery/{item_id}")
async def delete_gallery(item_id: int, request: Request = None):
    user_id = request.state.user_id
    user_role = request.state.user_role
    # Check ownership unless admin
    if user_role != "admin":
        row = db_query("SELECT user_id FROM images WHERE id = %s", [item_id])
        if not row or row[0]["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Forbidden")
    db_execute("DELETE FROM images WHERE id = %s", [item_id])
    return {"ok": True}

@app.post("/api/gallery/batch-delete")
async def batch_delete_gallery(ids: list[int], request: Request = None):
    user_id = request.state.user_id
    user_role = request.state.user_role
    if user_role != "admin":
        placeholders = ",".join(["%s"] * len(ids))
        db_execute(f"DELETE FROM images WHERE id IN ({placeholders}) AND user_id = %s", ids + [user_id])
    else:
        placeholders = ",".join(["%s"] * len(ids))
        db_execute(f"DELETE FROM images WHERE id IN ({placeholders})", ids)
    return {"ok": True, "deleted": len(ids)}

@app.get("/api/stats")
async def get_stats(request: Request = None):
    user_id = request.state.user_id
    user_role = request.state.user_role
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
            SELECT DATE_FORMAT(timestamp, '%%Y-%%m') AS month, COUNT(*) AS count
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
            SELECT DATE_FORMAT(timestamp, '%%Y-%%m') AS month, COUNT(*) AS count
            FROM images GROUP BY month ORDER BY month
        """, multi=True)
    total = total_row["total"]
    models = db_query("""
        SELECT SUBSTRING_INDEX(checkpoint, '/', -1) AS name, COUNT(*) AS count
        FROM images WHERE checkpoint != '' GROUP BY name ORDER BY count DESC LIMIT 20
    """, multi=True)
    samplers = db_query("""
        SELECT sampler AS name, COUNT(*) AS count
        FROM images WHERE sampler != '' GROUP BY sampler ORDER BY count DESC LIMIT 20
    """, multi=True)
    monthly = db_query("""
        SELECT DATE_FORMAT(timestamp, '%%Y-%%m') AS month, COUNT(*) AS count
        FROM images GROUP BY month ORDER BY month
    """, multi=True)
    return {
        "total": total,
        "top_models": [{"name": r["name"], "count": r["count"]} for r in models],
        "samplers": [{"name": r["name"], "count": r["count"]} for r in samplers],
        "monthly": [{"month": r["month"], "count": r["count"]} for r in monthly],
    }

@app.get("/api/models")
async def get_models():
    rows = db_query("SELECT DISTINCT checkpoint FROM images WHERE checkpoint != '' ORDER BY checkpoint")
    return {"models": [r["checkpoint"] for r in rows]}

# ── Auth endpoints ──
@app.post("/api/login")
async def api_login(request: Request):
    body = await request.json()
    username = body.get("username", "")
    password = body.get("password", "")
    # Check credentials
    row = db_query("SELECT id, password_hash FROM users WHERE username = %s", [username])
    if not row:
        return JSONResponse({"ok": False, "error": "Username atau password salah"}, status_code=401)
    if not _verify_password(password, row[0]["password_hash"]):
        return JSONResponse({"ok": False, "error": "Username atau password salah"}, status_code=401)
    # Create session
    token = _create_session_token()
    expires_at = (datetime.now(timezone.utc) + timedelta(hours=SESSION_EXPIRY_HOURS)).strftime("%Y-%m-%d %H:%M:%S")
    db_execute(
        "INSERT INTO sessions (id, user_id, token, expires_at, ip_address) VALUES (%s, %s, %s, %s, %s)",
        (token, row[0]["id"], token, expires_at, request.client.host if request.client else ""),
    )
    resp = JSONResponse({"ok": True, "username": username})
    resp.set_cookie(
        key="mimpi_session",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=SESSION_EXPIRY_HOURS * 3600,
    )
    return resp

@app.post("/api/logout")
async def api_logout(request: Request):
    token = _get_session_cookie(request)
    if token:
        db_execute("DELETE FROM sessions WHERE token = %s", [token])
    resp = JSONResponse({"ok": True})
    resp.delete_cookie(key="mimpi_session")
    return resp

@app.get("/api/verify")
async def api_verify(request: Request):
    user = _check_auth(request)
    if user:
        return {"authenticated": True, "username": user["username"], "role": user["role"]}
    return {"authenticated": False}

def _get_session_cookie(request: Request) -> str | None:
    return request.cookies.get("mimpi_session")

# ── User Management ──
@app.get("/api/users")
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

@app.post("/api/users")
async def create_user(request: Request = None):
    user_role = request.state.user_role
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    body = await request.json()
    username = body.get("username", "")
    password = body.get("password", "")
    role = body.get("role", "user")
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password required")
    hashed = _hash_password(password)
    db_execute("INSERT INTO users (username, password_hash, role) VALUES (%s, %s, %s)", (username, hashed, role))
    return {"ok": True, "username": username}

@app.put("/api/users/{user_id}")
async def update_user(user_id: int, request: Request = None, body: dict = None):
    import json
    user_role = request.state.user_role
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    if body is None:
        body = await request.json()
    username = body.get("username")
    role = body.get("role")
    if username:
        db_execute("UPDATE users SET username = %s WHERE id = %s", (username, user_id))
    if role:
        db_execute("UPDATE users SET role = %s WHERE id = %s", (role, user_id))
    return {"ok": True}

@app.delete("/api/users/{user_id}")
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

@app.put("/api/user/password")
async def change_password(request: Request = None):
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

@app.put("/api/user/username")
async def change_username(request: Request = None):
    body = await request.json()
    new_username = body.get("new_username", "")
    user_id = request.state.user_id
    if not new_username:
        raise HTTPException(status_code=400, detail="Username required")
    db_execute("UPDATE users SET username = %s WHERE id = %s", (new_username, user_id))
    return {"ok": True}

# ── Presets parser ──
_HAIR_COLOURS = [
    "black", "brunette/brown", "dark brown", "medium brown", "light brown",
    "blonde", "platinum blonde", "ash blonde", "honey blonde", "strawberry blonde",
    "red", "auburn", "copper red", "cherry red", "gray/silver", "white",
    "lavender", "ombre", "balayage", "highlights/lowlights", "rose gold",
    "bronde", "mermaid", "icy blonde", "smoky gray", "mocha brown",
    "caramel highlights", "opal", "root shadow", "color melt", "foilayage",
]
_HAIR_STYLES = [
    "bob", "pixie cut", "shag", "mullet",
    "french braid", "dutch braid", "fishtail braid", "boxer braids",
    "cornrows", "micro braids", "fulani braids", "goddess braids", "braid",
    "bun", "top knot", "chignon", "ballerina bun", "french twist", "victory roll",
    "high ponytail", "low ponytail", "bubble ponytail", "side ponytail", "half-up ponytail",
    "layered cut", "feathered", "beach waves", "sleek straight", "curly",
    "blunt bangs", "side-swept bangs", "curtain bangs", "wispy bangs", "baby bangs",
    "wolf cut", "fade", "space buns", "half-up half-down", "pineapple updo",
]
_HAIR_ADJECTIVES = ["long", "messy", "wet", "sleek", "voluminous", "tousled", "flowing", "textured"]
_ROOMS = [
    "bedroom", "living room", "bathroom", "shower", "kitchen", "hot tub",
    "balcony", "hotel room", "rooftop", "master suite", "jacuzzi room",
    "attic", "library", "wine cellar", "fireplace lounge", "private pool",
    "sauna", "sunroom", "loft", "candlelit bath", "penthouse suite",
    "secluded cabin", "massage room", "velvet lounge", "garden gazebo",
    "private terrace", "mirrored room", "art studio", "yacht cabin",
    "hidden nook", "church", "woods cottage", "dining room", "patio",
]

def _random_hair_colour(): return random.choice(_HAIR_COLOURS)
def _random_hair_style(): return random.choice(_HAIR_STYLES)
def _random_hair_adjective(): return random.choice(_HAIR_ADJECTIVES)
def _random_age(): return (int(random.random() * 13) | 25)
def _random_room(): return random.choice(_ROOMS)

def _generate_dynamic_prompt(attire: str, room: str, nsfw: bool) -> str:
    prompt = (
        f"1girl, solo, stunningly beautiful {_random_age()}-year-old woman, "
        f"{_random_hair_adjective()} {_random_hair_style()} {_random_hair_colour()} hair, "
        f"wearing {attire}, {room}, intricate details"
    )
    if not nsfw:
        prompt += ", sfw"
    return prompt

# ── Presets ──

def _generate_prompts_from(templates: dict, nsfw: bool) -> dict:
    result = {}
    for key, data in templates.items():
        room = data["room"] if data["room"] else _random_room()
        prompts = {}
        for idx, attire in enumerate(data["attires"], 1):
            prompts[str(idx)] = _generate_dynamic_prompt(attire, room, nsfw)
        result[key] = {"label": data["label"], "prompts": prompts}
    return result


def _get_active_comfy():
    """Cari active server dari DB, fallback ke env vars."""
    rows = db_query("SELECT url, token FROM comfy_servers WHERE is_active = 1 LIMIT 1")
    if rows:
        url = rows[0]["url"]
        token = rows[0]["token"]
    else:
        url = COM_URI
        token = COM_TOKEN
    auth = f"?token={token}" if token else ""
    return url, auth


# ── Checkpoints ──
@app.get("/api/checkpoints")
async def get_checkpoints():
    cp_path = PROJECT_DIR / "js" / "checkpoints.json"
    if not cp_path.exists(): return {"categories": []}
    return json.loads(cp_path.read_text())

@app.get("/api/presets")
async def get_presets():
    result = {}
    js_dir = PROJECT_DIR / "js"
    for key in ("general", "nsfw", "sfw"):
        f = js_dir / f"presets-{key}.json"
        if f.exists():
            result[key] = json.loads(f.read_text())
    return result


# ── ComfyUI Servers ──
@app.get("/api/comfy-servers")
async def list_servers():
    rows = db_query("SELECT id, name, url, LEFT(token, 8) AS token_preview, is_active, created_at FROM comfy_servers ORDER BY id")
    return {"servers": rows}

@app.post("/api/comfy-servers")
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

@app.put("/api/comfy-servers")
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

@app.delete("/api/comfy-servers/{name}")
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

@app.post("/api/comfy-servers/activate")
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
@app.post("/api/generate")
async def api_generate(data: dict):
    workflow = data.get("workflow", {})
    if not workflow: raise HTTPException(400, "Workflow required")
    comfy_url, comfy_auth = _get_active_comfy()
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

@app.post("/api/comfy/free")
async def api_comfy_free():
    """Unload all models from ComfyUI GPU memory."""
    comfy_url, comfy_auth = _get_active_comfy()
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

@app.get("/api/history/{prompt_id}")
async def get_history(prompt_id: str):
    comfy_url, comfy_auth = _get_active_comfy()
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.get(f"{comfy_url}/history/{prompt_id}{comfy_auth}")
            return r.json() if r.status_code == 200 else {}
    except Exception: return {}

@app.get("/api/view")
async def view_image(filename: str, subfolder: str = "", img_type: str = "output"):
    comfy_url, comfy_auth = _get_active_comfy()
    try:
        url = f"{comfy_url}/view{comfy_auth}&filename={filename}&subfolder={subfolder}&type={img_type}"
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.get(url)
            if r.status_code == 200:
                return Response(content=r.content, media_type=r.headers.get("content-type", "image/png"))
            raise HTTPException(502, "Gagal mengambil gambar dari ComfyUI")
    except httpx.RequestError:
        raise HTTPException(502, "Gagal mengambil gambar dari ComfyUI")

def _create_thumbnail(img_path: Path, thumb_path: Path) -> str:
    try:
        with Image.open(img_path) as im:
            im.thumbnail((400, 400))
            thumb_ext = ".jpg"
            thumb_path = thumb_path.with_suffix(thumb_ext)
            if im.mode in ("RGBA", "P"): im = im.convert("RGB")
            im.save(thumb_path, "JPEG", quality=70)
            return thumb_path.name
    except Exception:
        return ""

@app.post("/api/save")
async def save_image(
    request: Request,
    image: UploadFile = File(...),
    prompt: str = Form(""), promptNegative: str = Form(""),
    seed: str = Form(""), checkpoint: str = Form(""),
    sampler: str = Form(""), scheduler: str = Form(""),
    steps: str = Form(""), cfg: str = Form(""),
    resolution: str = Form(""), imageMode: str = Form(""),
):
    ext = Path(image.filename or ".png").suffix or ".png"
    fname = f"{int(datetime.now(timezone.utc).timestamp())}{ext}"
    img_path = GALLERY_DIR / fname
    img_path.write_bytes(await image.read())
    thumb_name = _create_thumbnail(img_path, THUMB_DIR / fname)
    try: im = Image.open(img_path); w, h = im.size
    except: w, h = 0, 0
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    user_id = request.state.user_id if hasattr(request.state, "user_id") else 1
    db_execute("""
        INSERT INTO images (user_id, filename, thumbnail, prompt, prompt_negative,
            seed, checkpoint, sampler, scheduler, steps, cfg,
            resolution, image_mode, width, height, timestamp)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        user_id, fname, thumb_name, prompt, promptNegative,
        seed, checkpoint, sampler, scheduler,
        int(steps) if steps else 0,
        float(cfg) if cfg else 0,
        resolution, imageMode, w, h, ts,
    ))
    return {"ok": True, "filename": fname}

# ── Static Files ──
@app.get("/favicon.ico")
async def favicon():
    return Response(content='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🌙</text></svg>', media_type="image/svg+xml")

@app.get("/")
async def index():
    idx = MIMPI_DIST / "index.html"
    if idx.exists(): return HTMLResponse(idx.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>Build belum tersedia</h1>")

@app.get("/assets/{filename}")
async def assets(filename: str):
    p = MIMPI_ASSETS / filename
    if not p.exists(): raise HTTPException(404)
    ct = "text/css" if filename.endswith(".css") else "application/javascript" if filename.endswith(".js") else "application/octet-stream"
    return FileResponse(str(p), media_type=ct)

@app.get("/gallery/{filename}")
async def gallery(filename: str):
    p = GALLERY_DIR / filename
    if not p.exists(): raise HTTPException(404)
    return FileResponse(str(p))

@app.get("/thumbnails/{filename}")
async def thumb(filename: str):
    p = THUMB_DIR / filename
    if not p.exists(): p = GALLERY_DIR / filename
    if not p.exists(): raise HTTPException(404)
    return FileResponse(str(p))

if __name__ == "__main__":
    import uvicorn
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8001"))
    uvicorn.run(app, host=host, port=port)
