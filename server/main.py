"""Mimpi Dashboard — Main Entry Point"""

import sys
import logging
import asyncio
from pathlib import Path

# Add project root to sys.path so server package can be imported
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI, Request
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from server.database import migrate_db
from server.logging_config import setup_logging
from server.auth import auth_middleware
from server.routes import gallery, auth, users, presets, models, generation, settings


# ── Logging Configuration ──
# Use structured JSON logging for production
logger = setup_logging(level="INFO", json_format=True)

# ── App ──
app = FastAPI(on_startup=[migrate_db])

# ── Graceful Shutdown ──
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down...")

# ── CORS Middleware ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Security Headers Middleware ──
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Cache-Control"] = "no-store"

    return response

# ── Request Timeout Middleware ──
# Protects against long-running requests blocking the server
@app.middleware("http")
async def request_timeout_middleware(request: Request, call_next):
    """Add request timeout protection for API endpoints."""
    if request.url.path.startswith("/api/"):
        # Set a reasonable timeout for API requests (5 minutes)
        timeout = 300
        try:
            response = await asyncio.wait_for(
                call_next(request),
                timeout=timeout
            )
            return response
        except asyncio.TimeoutError:
            return JSONResponse(
                {"detail": "Request timeout. Operation took too long."},
                status_code=504
            )
    return await call_next(request)

app.middleware("http")(security_headers_middleware)
app.middleware("http")(auth_middleware)

# ── Periodic Rate Limiter Cleanup ──
# Clean up expired rate limiter entries periodically
# Rate limiters are defined in routes/generation.py and routes/auth.py

async def periodic_rate_limiter_cleanup():
    """Periodically clean up expired rate limiter entries."""
    while True:
        await asyncio.sleep(300)  # Run every 5 minutes
        try:
            # Import rate limiters lazily to avoid circular imports
            from server.routes.generation import _generate_limiter
            from server.routes.auth import _login_limiter
            _generate_limiter.cleanup_expired()
            _login_limiter.cleanup_expired()
        except Exception as e:
            logger.error(f"Rate limiter cleanup failed: {e}")

# ── Startup Event ──
@app.on_event("startup")
async def startup_event():
    """Start periodic cleanup task."""
    asyncio.create_task(periodic_rate_limiter_cleanup())

# Register all routes
app.include_router(gallery.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(presets.router)
app.include_router(models.router)
app.include_router(generation.router)
app.include_router(settings.router)

if __name__ == "__main__":
    import uvicorn
    from server.config import HOST, PORT

    uvicorn.run(app, host=HOST, port=PORT)
