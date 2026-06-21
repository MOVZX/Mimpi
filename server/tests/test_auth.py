"""Tests for Authentication module"""

import pytest
import asyncio
from unittest.mock import Mock, patch, MagicMock, AsyncMock
from datetime import datetime, timezone

import bcrypt
from fastapi import Request
from fastapi.responses import JSONResponse

from server.auth import (
    _hash_password,
    _verify_password,
    _create_session_token,
    _check_auth,
    _get_session_cookie,
    ADMIN_ENDPOINTS,
    auth_middleware,
)


class TestPasswordHashing:
    """Test password hashing functions"""
    
    def test_hash_password_produces_valid_hash(self):
        """Hashed password should be a valid bcrypt hash"""
        password = "test_password_123"
        hashed = _hash_password(password)
        
        assert hashed.startswith("$2b$")
        assert len(hashed) > 50  # bcrypt hashes are typically 60 chars
    
    def test_verify_password_correct(self):
        """Password verification should work with correct password"""
        password = "test_password_123"
        hashed = _hash_password(password)
        
        assert _verify_password(password, hashed) is True
    
    def test_verify_password_incorrect(self):
        """Password verification should fail with wrong password"""
        password = "test_password_123"
        hashed = _hash_password(password)
        
        assert _verify_password("wrong_password", hashed) is False
    
    def test_different_passwords_produce_different_hashes(self):
        """Different passwords should produce different hashes"""
        hash1 = _hash_password("password1")
        hash2 = _hash_password("password2")
        
        assert hash1 != hash2


class TestSessionToken:
    """Test session token creation"""
    
    def test_token_is_hex_string(self):
        """Token should be a valid hex string"""
        token = _create_session_token()
        
        assert all(c in '0123456789abcdef' for c in token)
    
    def test_token_length(self):
        """Token should be 64 characters (32 bytes hex)"""
        token = _create_session_token()
        
        assert len(token) == 64
    
    def test_tokens_are_unique(self):
        """Each token should be unique"""
        tokens = [_create_session_token() for _ in range(100)]
        
        assert len(tokens) == len(set(tokens))


class TestAdminEndpoints:
    """Test ADMIN_ENDPOINTS configuration"""
    
    def test_admin_endpoints_defined(self):
        """ADMIN_ENDPOINTS should be defined"""
        assert len(ADMIN_ENDPOINTS) > 0
    
    def test_admin_endpoints_list(self):
        """ADMIN_ENDPOINTS should contain expected endpoints"""
        expected = [
            "/api/users",
            "/api/settings/storage-mode",
            "/api/gallery/batch-delete",
            "/api/cleanup-sessions",
        ]
        
        for endpoint in expected:
            assert endpoint in ADMIN_ENDPOINTS
    
    def test_admin_endpoints_are_api_paths(self):
        """All admin endpoints should start with /api/"""
        for endpoint in ADMIN_ENDPOINTS:
            assert endpoint.startswith("/api/")


class TestAuthMiddleware:
    """Test auth middleware behavior"""
    
    def _create_mock_request(self, path: str, cookies: dict = None):
        """Helper to create a mock Request object"""
        mock_request = Mock(spec=Request)
        mock_request.url = Mock()
        mock_request.url.path = path
        mock_request.cookies = cookies or {}
        mock_request.state = Mock()
        mock_request.client = Mock()
        mock_request.client.host = "127.0.0.1"
        
        # Mock call_next as an async function using AsyncMock
        mock_request.call_next = AsyncMock(return_value=JSONResponse({"status": "ok"}))
        
        return mock_request
    
    def test_allows_non_api_paths(self):
        """Non-API paths should be allowed without auth"""
        async def test():
            request = self._create_mock_request("/index.html")
            response = await auth_middleware(request, request.call_next)
            return response.status_code
        
        assert asyncio.run(test()) == 200
    
    def test_allows_login_endpoint(self):
        """Login endpoint should be accessible without auth"""
        async def test():
            request = self._create_mock_request("/api/login")
            response = await auth_middleware(request, request.call_next)
            return response.status_code
        
        assert asyncio.run(test()) == 200
    
    def test_allows_logout_endpoint(self):
        """Logout endpoint should be accessible without auth"""
        async def test():
            request = self._create_mock_request("/api/logout")
            response = await auth_middleware(request, request.call_next)
            return response.status_code
        
        assert asyncio.run(test()) == 200
    
    def test_allows_verify_endpoint(self):
        """Verify endpoint should be accessible without auth"""
        async def test():
            request = self._create_mock_request("/api/verify")
            response = await auth_middleware(request, request.call_next)
            return response.status_code
        
        assert asyncio.run(test()) == 200
    
    def test_blocks_unauthenticated_api_request(self):
        """Unauthenticated API request should return 401"""
        async def test():
            request = self._create_mock_request("/api/users")
            response = await auth_middleware(request, request.call_next)
            return response.status_code
        
        assert asyncio.run(test()) == 401
    
    @pytest.mark.asyncio
    async def test_allows_authenticated_api_request(self):
        """Authenticated API request should be allowed"""
        mock_request = self._create_mock_request("/api/gallery")
        mock_request.cookies = {"mimpi_session": "valid_token"}
        
        # Mock db_query to return a valid user
        with patch('server.auth.db_query') as mock_db:
            mock_db.return_value = [{
                "user_id": 1,
                "username": "testuser",
                "role": "user"
            }]
            
            response = await auth_middleware(mock_request, mock_request.call_next)
            assert response.status_code == 200
    
    def test_blocks_non_admin_access_to_admin_endpoint(self):
        """Non-admin user should not access admin endpoints"""
        async def test():
            mock_request = self._create_mock_request("/api/users")
            mock_request.cookies = {"mimpi_session": "valid_token"}
            
            with patch('server.auth.db_query') as mock_db:
                mock_db.return_value = [{
                    "user_id": 1,
                    "username": "testuser",
                    "role": "user"  # Not admin
                }]
                
                response = await auth_middleware(mock_request, mock_request.call_next)
                return response.status_code
        
        assert asyncio.run(test()) == 403
    
    def test_allows_admin_access_to_admin_endpoint(self):
        """Admin user should access admin endpoints"""
        async def test():
            mock_request = self._create_mock_request("/api/users")
            mock_request.cookies = {"mimpi_session": "valid_token"}
            
            with patch('server.auth.db_query') as mock_db:
                mock_db.return_value = [{
                    "user_id": 1,
                    "username": "admin",
                    "role": "admin"
                }]
                
                response = await auth_middleware(mock_request, mock_request.call_next)
                return response.status_code
        
        assert asyncio.run(test()) == 200
    
    def test_sets_request_state_for_authenticated_user(self):
        """Authenticated user state should be set on request"""
        async def test():
            mock_request = self._create_mock_request("/api/gallery")
            mock_request.cookies = {"mimpi_session": "valid_token"}
            
            with patch('server.auth.db_query') as mock_db:
                mock_db.return_value = [{
                    "user_id": 42,
                    "username": "testuser",
                    "role": "admin"
                }]
                
                await auth_middleware(mock_request, mock_request.call_next)
                
                return (
                    mock_request.state.user_id == 42 and
                    mock_request.state.username == "testuser" and
                    mock_request.state.user_role == "admin"
                )
        
        assert asyncio.run(test()) is True


class TestSessionCookie:
    """Test session cookie retrieval"""
    
    def test_gets_session_cookie(self):
        """Should return session cookie when present"""
        mock_request = Mock(spec=Request)
        mock_request.cookies = {"mimpi_session": "test_token"}
        
        result = _get_session_cookie(mock_request)
        assert result == "test_token"
    
    def test_returns_none_when_no_cookie(self):
        """Should return None when no session cookie"""
        mock_request = Mock(spec=Request)
        mock_request.cookies = {}
        
        result = _get_session_cookie(mock_request)
        assert result is None
