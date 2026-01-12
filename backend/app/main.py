# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.db import create_db_and_tables
from app.api.v1 import auth, subscriptions, analytics
import os


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan events.

    On startup: Create database tables (for development).
    In production, use Alembic migrations instead.
    """
    print("=" * 50)
    print("STARTUP: Beginning application startup...")
    print(f"STARTUP: PORT environment variable: {os.getenv('PORT', 'NOT SET')}")
    print(f"STARTUP: DATABASE_URL starts with: {settings.DATABASE_URL[:20]}...")
    print(f"STARTUP: CORS_ORIGINS: {settings.CORS_ORIGINS}")
    print("=" * 50)

    # Temporarily disable database table creation to debug Railway deployment
    # try:
    #     print("STARTUP: Creating database tables...")
    #     create_db_and_tables()
    #     print("STARTUP: ✓ Database tables created successfully")
    # except Exception as e:
    #     print(f"STARTUP: ✗ Warning: Could not create database tables: {e}")
    #     print("STARTUP: App will continue, but database operations may fail")

    print("STARTUP: ✓ Application startup complete (DB creation disabled)")
    print("=" * 50)
    yield
    print("SHUTDOWN: Shutting down...")


# Create FastAPI application
app = FastAPI(
    title="Subscription Radar API",
    description="Track and manage recurring subscriptions",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(subscriptions.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")


@app.get("/")
def root():
    """
    Root endpoint.
    Returns API information.
    """
    return {
        "message": "Subscription Radar API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """
    Health check endpoint.
    Use this for monitoring and load balancers.
    """
    from app.db import engine

    health_status = {
        "status": "healthy",
        "database": "unknown"
    }

    # Check database connection
    if engine is None:
        health_status["database"] = "not_configured"
    else:
        try:
            from sqlalchemy import text
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            health_status["database"] = "connected"
        except Exception as e:
            health_status["database"] = f"error: {str(e)[:50]}"

    return health_status


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
