# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.db import create_db_and_tables
from app.api.v1 import auth, subscriptions


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan events.

    On startup: Create database tables (for development).
    In production, use Alembic migrations instead.
    """
    print("Starting up...")
    create_db_and_tables()
    yield
    print("Shutting down...")


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
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
