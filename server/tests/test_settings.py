"""Tests for Settings module"""

import pytest
from unittest.mock import patch, MagicMock

from server.settings import (
    get_storage_mode,
    set_storage_mode,
    reset_settings_cache,
    STORAGE_MODE_KEY,
    _settings_cache,
)


class TestGetStorageMode:
    """Test get_storage_mode function"""
    
    def test_returns_default_when_not_set(self):
        """Should return default storage mode when not configured"""
        with patch('server.settings.db_query') as mock_db, \
             patch('server.settings.db_execute') as mock_exec:
            mock_db.return_value = None  # No setting found
            mock_exec.return_value = None
            
            # Clear cache to test default
            reset_settings_cache()
            
            mode = get_storage_mode()
            assert mode == "seaweedfs"
    
    def test_returns_cached_value(self):
        """Should return cached value without database query"""
        reset_settings_cache()
        
        # Pre-populate cache
        _settings_cache[STORAGE_MODE_KEY] = "local"
        
        with patch('server.settings.db_query') as mock_db:
            mode = get_storage_mode()
            assert mode == "local"
            # Should not query database when cached
            mock_db.assert_not_called()
    
    def test_returns_database_value_when_not_cached(self):
        """Should query database when value not in cache"""
        reset_settings_cache()
        
        with patch('server.settings.db_query') as mock_db, \
             patch('server.settings.db_execute') as mock_exec:
            mock_db.return_value = [{"value": "local"}]
            
            mode = get_storage_mode()
            assert mode == "local"
            mock_db.assert_called_once()
    
    def test_defaults_to_seaweedfs_when_invalid_value(self):
        """Should default to seaweedfs when invalid mode returned"""
        reset_settings_cache()
        
        with patch('server.settings.db_query') as mock_db, \
             patch('server.settings.db_execute') as mock_exec:
            mock_db.return_value = [{"value": "invalid_mode"}]
            
            mode = get_storage_mode()
            assert mode == "seaweedfs"
    
    def test_caches_database_value(self):
        """Should cache value from database"""
        reset_settings_cache()
        
        with patch('server.settings.db_query') as mock_db, \
             patch('server.settings.db_execute') as mock_exec:
            mock_db.return_value = [{"value": "local"}]
            
            get_storage_mode()
            assert _settings_cache[STORAGE_MODE_KEY] == "local"


class TestSetStorageMode:
    """Test set_storage_mode function"""
    
    def test_sets_valid_mode(self):
        """Should set valid storage mode"""
        reset_settings_cache()
        
        with patch('server.settings.db_execute') as mock_exec:
            result = set_storage_mode("local")
            assert result is True
            mock_exec.assert_called_once()
    
    def test_updates_cache(self):
        """Should update cache after setting"""
        reset_settings_cache()
        
        with patch('server.settings.db_execute') as mock_exec:
            set_storage_mode("seaweedfs")
            assert _settings_cache[STORAGE_MODE_KEY] == "seaweedfs"
    
    def test_rejects_invalid_mode(self):
        """Should reject invalid storage mode"""
        reset_settings_cache()
        
        with patch('server.settings.db_execute') as mock_exec:
            result = set_storage_mode("invalid")
            assert result is False
            mock_exec.assert_not_called()
    
    def test_accepts_all_valid_modes(self):
        """Should accept all valid storage modes"""
        reset_settings_cache()
        
        valid_modes = ["local", "seaweedfs", "both"]
        
        with patch('server.settings.db_execute') as mock_exec:
            for mode in valid_modes:
                result = set_storage_mode(mode)
                assert result is True


class TestResetSettingsCache:
    """Test reset_settings_cache function"""
    
    def test_clears_all_cache_entries(self):
        """Should clear all cache entries"""
        _settings_cache["key1"] = "value1"
        _settings_cache["key2"] = "value2"
        
        reset_settings_cache()
        
        assert len(_settings_cache) == 0
    
    def test_clears_storage_mode_cache(self):
        """Should clear storage mode cache"""
        _settings_cache[STORAGE_MODE_KEY] = "local"
        
        reset_settings_cache()
        
        assert STORAGE_MODE_KEY not in _settings_cache


class TestSettingsCacheIsolation:
    """Test that settings cache works correctly in isolation"""
    
    def test_multiple_settings_can_be_cached(self):
        """Multiple settings should be cacheable independently"""
        reset_settings_cache()
        
        # Simulate caching multiple settings
        _settings_cache["setting1"] = "value1"
        _settings_cache["setting2"] = "value2"
        
        assert _settings_cache["setting1"] == "value1"
        assert _settings_cache["setting2"] == "value2"
