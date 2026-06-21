"""Mimpi Dashboard — Configuration & Paths"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# ── Paths ──
PROJECT_DIR = Path(__file__).resolve().parent.parent
MIMPI_DIST = PROJECT_DIR / "mimpi" / "dist"
MIMPI_ASSETS = MIMPI_DIST / "assets"
GALLERY_DIR = PROJECT_DIR / "gallery"
THUMB_DIR = PROJECT_DIR / "thumbnails"

GALLERY_DIR.mkdir(exist_ok=True)
THUMB_DIR.mkdir(exist_ok=True)

# ── Config ──
COM_URI = os.environ.get("COMFY_URI", "")
COM_TOKEN=os.environ.get("COMFY_TOKEN", "")
COM_AUTH=f"?token={COM_TOKEN}" if COM_TOKEN else ""

# ── Server ──
HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "8001"))

# ── MariaDB ──
DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "port": int(os.environ.get("DB_PORT", "3306")),
    "database": os.environ.get("DB_NAME", "mimpi"),
    "user": os.environ.get("DB_USER", "mimpi"),
    "password": os.environ.get("DB_PASSWORD", ""),
    "autocommit": True,
}

# ── SeaweedFS ──
S3_FILER_URL = os.environ.get("S3_FILER_URL", "")
S3_BUCKET = os.environ.get("S3_BUCKET", "")

# ── Auth ──
AUTH_USERNAME=os.environ.get("AUTH_USERNAME", "admin")
AUTH_PASSWORD=os.environ.get("AUTH_PASSWORD", "admin")
SESSION_EXPIRY_HOURS = 168  # 7 days

# ── Storage Modes ──
STORAGE_MODES = ["local", "seaweedfs", "both"]
DEFAULT_STORAGE_MODE = "seaweedfs"

# ── DB Migration ──
DB_VERSION = 8
