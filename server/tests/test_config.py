"""Tests for Configuration module"""

import pytest
import os
from unittest.mock import patch, MagicMock
from pathlib import Path

from server.config import (
    PROJECT_DIR,
    MIMPI_DIST,
    MIMPI_ASSETS,
    GALLERY_DIR,
    THUMB_DIR,
    COM_URI,
    COM_TOKEN,
    COM_AUTH,
    HOST,
    PORT,
    DB_CONFIG,
    S3_FILER_URL,
    S3_BUCKET,
    AUTH_USERNAME,
    AUTH_PASSWORD,
    SESSION_EXPIRY_HOURS,
    STORAGE_MODES,
    DEFAULT_STORAGE_MODE,
    DB_VERSION,
)


class TestPaths:
    """Test path configuration"""
    
    def test_project_dir_is_absolute(self):
        """PROJECT_DIR should be an absolute path"""
        assert PROJECT_DIR.is_absolute()
    
    def test_project_dir_contains_mimpi(self):
        """PROJECT_DIR should contain 'mimpi' directory"""
        assert (PROJECT_DIR / "mimpi").exists()
    
    def test_mimpi_dist_path(self):
        """MIMPI_DIST should point to mimpi/dist"""
        expected = PROJECT_DIR / "mimpi" / "dist"
        assert MIMPI_DIST == expected
    
    def test_mimpi_assets_path(self):
        """MIMPI_ASSETS should point to mimpi/dist/assets"""
        expected = PROJECT_DIR / "mimpi" / "dist" / "assets"
        assert MIMPI_ASSETS == expected
    
    def test_gallery_dir_created(self):
        """GALLERY_DIR should exist"""
        assert GALLERY_DIR.exists()
    
    def test_thumb_dir_created(self):
        """THUMB_DIR should exist"""
        assert THUMB_DIR.exists()


class TestServerConfig:
    """Test server configuration"""
    
    def test_host_default(self):
        """HOST should default to 0.0.0.0"""
        with patch.dict(os.environ, {}, clear=True):
            # Reload module to get defaults
            import importlib
            import server.config
            importlib.reload(server.config)
            assert server.config.HOST == "0.0.0.0"
    
    def test_port_default(self):
        """PORT should default to 8001"""
        with patch.dict(os.environ, {}, clear=True):
            import importlib
            import server.config
            importlib.reload(server.config)
            assert server.config.PORT == 8001
    
    def test_port_is_integer(self):
        """PORT should be an integer"""
        assert isinstance(PORT, int)


class TestDatabaseConfig:
    """Test database configuration"""
    
    def test_db_config_has_required_keys(self):
        """DB_CONFIG should have all required keys"""
        required_keys = ["host", "port", "database", "user", "password"]
        for key in required_keys:
            assert key in DB_CONFIG
    
    def test_db_port_is_integer(self):
        """DB port should be an integer"""
        assert isinstance(DB_CONFIG["port"], int)
    
    def test_db_config_has_autocommit(self):
        """DB_CONFIG should have autocommit setting"""
        assert "autocommit" in DB_CONFIG
        assert DB_CONFIG["autocommit"] is True


class TestAuthConfig:
    """Test authentication configuration"""
    
    def test_session_expiry_hours(self):
        """SESSION_EXPIRY_HOURS should be 168 (7 days)"""
        assert SESSION_EXPIRY_HOURS == 168
    
    def test_auth_username_exists(self):
        """AUTH_USERNAME should be defined"""
        assert AUTH_USERNAME is not None


class TestStorageConfig:
    """Test storage configuration"""
    
    def test_storage_modes_defined(self):
        """STORAGE_MODES should be defined"""
        assert isinstance(STORAGE_MODES, list)
    
    def test_storage_modes_contains_expected_values(self):
        """STORAGE_MODES should contain expected modes"""
        assert "local" in STORAGE_MODES
        assert "seaweedfs" in STORAGE_MODES
        assert "both" in STORAGE_MODES
    
    def test_default_storage_mode(self):
        """DEFAULT_STORAGE_MODE should be seaweedfs"""
        assert DEFAULT_STORAGE_MODE == "seaweedfs"


class TestComfyConfig:
    """Test ComfyUI configuration"""
    
    def test_com_uri_exists(self):
        """COM_URI should be defined"""
        assert COM_URI is not None
    
    def test_com_auth_format(self):
        """COM_AUTH should start with ? if token exists"""
        if COM_TOKEN:
            assert COM_AUTH.startswith("?")
            assert "token=" in COM_AUTH


class TestDBVersion:
    """Test database version"""
    
    def test_db_version_is_integer(self):
        """DB_VERSION should be an integer"""
        assert isinstance(DB_VERSION, int)
    
    def test_db_version_positive(self):
        """DB_VERSION should be positive"""
        assert DB_VERSION > 0
