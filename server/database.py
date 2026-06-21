"""Mimpi Dashboard — Database Helpers & Migration"""

import logging
from server.config import DB_CONFIG, DB_VERSION, AUTH_USERNAME, AUTH_PASSWORD

import mysql.connector
import mysql.connector.pooling
import bcrypt

# ── Auth helpers (needed by database migration) ──
def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

# ── Connection Pool ──
_pool = None

def _get_pool():
    global _pool

    if _pool is None:
        _pool = mysql.connector.pooling.MySQLConnectionPool(
            pool_name="mimpi_pool",
            pool_size=10,
            pool_reset_session=True,
            **DB_CONFIG
        )

    return _pool

# ── DB helpers ──
def get_db():
    return _get_pool().get_connection()


def get_pool_stats():
    """Get database connection pool statistics.
    
    Returns:
        Dictionary with pool statistics including pool size and connections in use.
    """
    global _pool
    if _pool:
        return {
            "pool_size": _pool._pool_size,
            "connections_in_use": len(_pool._connections),
        }
    return {"pool_size": 0, "connections_in_use": 0}

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

# ── Auto Migration ──
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

CREATE TABLE IF NOT EXISTS zimage_presets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL DEFAULT 1,
    title VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    negative TEXT NOT NULL DEFAULT '',
    model VARCHAR(255) NOT NULL DEFAULT 'Z-Image/beyondREALITY_V30.safetensors',
    sampler VARCHAR(50) NOT NULL DEFAULT 'euler',
    scheduler VARCHAR(50) NOT NULL DEFAULT 'simple',
    steps INT NOT NULL DEFAULT 10,
    cfg DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    width INT NOT NULL DEFAULT 896,
    height INT NOT NULL DEFAULT 1152,
    res_mode VARCHAR(50) NOT NULL DEFAULT '896×1600',
    loras TEXT NOT NULL DEFAULT '[]',
    use_dynamic_seed TINYINT(1) NOT NULL DEFAULT 1,
    use_inc_seed TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_zimage_presets_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description VARCHAR(255) NOT NULL DEFAULT '',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sdxl_presets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL DEFAULT 1,
    title VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    negative TEXT NOT NULL DEFAULT '',
    model VARCHAR(255) NOT NULL DEFAULT '',
    sampler VARCHAR(50) NOT NULL DEFAULT 'lcm',
    scheduler VARCHAR(50) NOT NULL DEFAULT 'exponential',
    steps INT NOT NULL DEFAULT 8,
    cfg DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    width INT NOT NULL DEFAULT 896,
    height INT NOT NULL DEFAULT 1152,
    loras TEXT NOT NULL DEFAULT '[]',
    use_dmd2 TINYINT(1) NOT NULL DEFAULT 0,
    use_custom_clip TINYINT(1) NOT NULL DEFAULT 0,
    clip_skip_val INT NOT NULL DEFAULT -2,
    use_upscale TINYINT(1) NOT NULL DEFAULT 0,
    upscaler VARCHAR(255) NOT NULL DEFAULT '4x-ClearRealityV1.pth',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sdxl_presets_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
"""

async def migrate_db():
    logger = logging.getLogger("uvicorn")

    # Create database
    try:
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
    except Exception as e:
        logger.error(f"❌ Failed to connect to database: {e}")
        logger.warning("⚠️  Server will run without database. Please ensure MySQL is running.")

        return

    # Create tables
    conn = get_db()
    cur = conn.cursor()

    for stmt in MIGRATION_SQL.strip().split(";"):
        stmt = stmt.strip()

        if stmt:
            cur.execute(stmt)

    logger.info("✅ Tables created/verified")

    # Run migrations
    # Cleanup expired sessions
    try:
        cur.execute("SELECT COUNT(*) AS cnt FROM sessions WHERE expires_at < NOW()")

        expired = cur.fetchone()[0]

        if expired:
            cur.execute("DELETE FROM sessions WHERE expires_at < NOW()")
            logger.info(f"🧹 Cleaned {expired} expired sessions")
    except Exception as e:
        logger.warning(f"⚠️  Session cleanup failed: {e}")

    cur.execute("SELECT version FROM _migration ORDER BY version DESC LIMIT 1")

    result = cur.fetchone()
    current_version = result[0] if result else 0

    if current_version < DB_VERSION:
        logger.info(f"🔄 Migrating from v{current_version} to v{DB_VERSION}...")

        if current_version < 4:
            try:
                cur.execute("ALTER TABLE images ADD COLUMN user_id INT NOT NULL DEFAULT 1")
                cur.execute("ALTER TABLE images ADD INDEX idx_user_id (user_id)")
                logger.info("✅ Added user_id to images table")
            except Exception as e:
                logger.warning(f"⚠️  Could not add user_id to images table: {e}")
            try:
                cur.execute("ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user'")
                logger.info("✅ Added role to users table")
            except Exception as e:
                logger.warning(f"⚠️  Could not add role to users table: {e}")

            # Update existing images to user_id 1 (admin)
            cur.execute("UPDATE images SET user_id = 1 WHERE user_id = 0")
            logger.info("✅ Migrated existing images to user_id 1")

        if current_version < 6:
            alter_cols = [
                ("model", "VARCHAR(255) NOT NULL DEFAULT 'Z-Image/beyondREALITY_V30.safetensors'"),
                ("sampler", "VARCHAR(50) NOT NULL DEFAULT 'euler'"),
                ("scheduler", "VARCHAR(50) NOT NULL DEFAULT 'simple'"),
                ("steps", "INT NOT NULL DEFAULT 10"),
                ("res_mode", "VARCHAR(50) NOT NULL DEFAULT '896×1152'"),
                ("loras", "TEXT NOT NULL DEFAULT '[]'"),
                ("use_dynamic_seed", "TINYINT(1) NOT NULL DEFAULT 1"),
                ("use_inc_seed", "TINYINT(1) NOT NULL DEFAULT 0"),
                ("updated_at", "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
            ]

            for col_name, col_def in alter_cols:
                try:
                    cur.execute(f"ALTER TABLE zimage_presets ADD COLUMN {col_name} {col_def}")
                    logger.info(f"✅ Added {col_name} to zimage_presets")
                except Exception as e:
                    logger.warning(f"⚠️  Could not add {col_name} to zimage_presets: {e}")

            # Fix default values for existing rows
            try:
                cur.execute("UPDATE zimage_presets SET model = 'Z-Image/beyondREALITY_V30.safetensors' WHERE model = ''")
                cur.execute("UPDATE zimage_presets SET sampler = 'euler' WHERE sampler = ''")
                cur.execute("UPDATE zimage_presets SET scheduler = 'simple' WHERE scheduler = ''")
                cur.execute("UPDATE zimage_presets SET steps = 10 WHERE steps = 8")
                cur.execute("UPDATE zimage_presets SET height = 1152 WHERE height = 1600")
                logger.info("✅ Fixed default values for zimage_presets")
            except Exception as e:
                logger.warning(f"⚠️  Could not fix zimage_presets default values: {e}")

        if current_version < 7:
            alter_cols_sdxl = [
                ("loras", "TEXT NOT NULL DEFAULT '[]'"),
                ("use_dmd2", "TINYINT(1) NOT NULL DEFAULT 0"),
                ("use_custom_clip", "TINYINT(1) NOT NULL DEFAULT 0"),
                ("clip_skip_val", "INT NOT NULL DEFAULT -2"),
                ("use_upscale", "TINYINT(1) NOT NULL DEFAULT 0"),
                ("upscaler", "VARCHAR(255) NOT NULL DEFAULT '4x-ClearRealityV1.pth'"),
                ("updated_at", "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
            ]

            for col_name, col_def in alter_cols_sdxl:
                try:
                    cur.execute(f"ALTER TABLE sdxl_presets ADD COLUMN {col_name} {col_def}")
                    logger.info(f"✅ Added {col_name} to sdxl_presets")
                except Exception as e:
                    logger.warning(f"⚠️  Could not add {col_name} to sdxl_presets: {e}")

        if current_version < 8:
            # Add storage_mode column to images table
            try:
                cur.execute("ALTER TABLE images ADD COLUMN storage_mode VARCHAR(20) NOT NULL DEFAULT 'seaweedfs'")
                logger.info("✅ Added storage_mode to images table")
            except Exception as e:
                logger.warning(f"⚠️  Could not add storage_mode to images table: {e}")

            # Insert default storage settings
            try:
                cur.execute("INSERT IGNORE INTO settings (key, value, description) VALUES (%s, %s, %s)",
                           ("storage_mode", "seaweedfs", "Storage backend mode: local, seaweedfs, or both"))
                logger.info("✅ Initialized storage settings")
            except Exception as e:
                logger.warning(f"⚠️  Could not initialize storage settings: {e}")

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
