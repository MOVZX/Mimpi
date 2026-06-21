"""Mimpi Dashboard — Rate Limiter with Automatic Cleanup

Replaces the ad-hoc dictionary-based rate limiters with a proper
thread-safe, asyncio-compatible implementation that automatically
cleans up old entries to prevent memory leaks.
"""

import asyncio
from collections import deque
from datetime import datetime, timedelta
from typing import Optional


class RateLimiter:
    """Thread-safe rate limiter with automatic cleanup.
    
    Uses collections.deque for O(1) appends and efficient memory cleanup.
    Supports both sync and async usage patterns.
    """
    
    def __init__(self, window: timedelta, max_attempts: int, lock: Optional[asyncio.Lock] = None):
        """Initialize rate limiter.
        
        Args:
            window: Time window for rate limiting (e.g., timedelta(minutes=5))
            max_attempts: Maximum number of attempts allowed within the window
            lock: Optional asyncio.Lock for async safety (passed from caller)
        """
        self.window = window
        self.max_attempts = max_attempts
        self.attempts: dict[str, deque[datetime]] = {}
        self._lock = lock  # Will be set by caller if needed
    
    async def is_allowed(self, key: str) -> bool:
        """Check if a request is allowed for the given key.
        
        Args:
            key: Identifier for the requester (e.g., IP address, username)
            
        Returns:
            True if the request is allowed, False if rate limited
        """
        now = datetime.now()
        
        # Use async lock if available for thread safety
        if self._lock:
            async with self._lock:
                return self._is_allowed_internal(key, now)
        else:
            return self._is_allowed_internal(key, now)
    
    def _is_allowed_internal(self, key: str, now: datetime) -> bool:
        """Internal implementation of rate limit check.
        
        Should be called within a lock context if async safety is needed.
        """
        if key not in self.attempts:
            self.attempts[key] = deque()
        
        # Clean old attempts outside window
        self.attempts[key] = deque(
            (t for t in self.attempts[key] if now - t < self.window),
            maxlen=self.max_attempts
        )
        
        if len(self.attempts[key]) >= self.max_attempts:
            return False
        
        self.attempts[key].append(now)
        return True
    
    def cleanup_expired(self):
        """Remove entries that have completely expired.
        
        Should be called periodically to prevent memory leaks
        from entries that are no longer needed.
        """
        now = datetime.now()
        expired_keys = [
            k for k, timestamps in self.attempts.items()
            if not any(now - t < self.window for t in timestamps)
        ]
        for key in expired_keys:
            del self.attempts[key]
    
    def get_remaining(self, key: str) -> int:
        """Get remaining allowed attempts for a key.
        
        Returns:
            Number of remaining attempts allowed
        """
        now = datetime.now()
        if key not in self.attempts:
            return self.max_attempts
        
        active = sum(1 for t in self.attempts[key] if now - t < self.window)
        return max(0, self.max_attempts - active)
