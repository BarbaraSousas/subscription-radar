# app/db.py
from sqlmodel import create_engine, SQLModel, Session
from app.core.config import settings

# Create database engine with connection retry settings
try:
    engine = create_engine(
        settings.DATABASE_URL,
        echo=True,  # Set to False in production
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        connect_args={
            "connect_timeout": 10,
            "options": "-c statement_timeout=30000"
        }
    )
    print(f"✓ Database engine created successfully")
except Exception as e:
    print(f"✗ Warning: Failed to create database engine: {e}")
    print(f"  DATABASE_URL prefix: {settings.DATABASE_URL[:30]}...")
    engine = None


def create_db_and_tables():
    """
    Create all database tables.
    This is useful for development. In production, use Alembic migrations.
    """
    SQLModel.metadata.create_all(engine)


def get_session():
    """
    Dependency to get database session.
    Use this in FastAPI route dependencies.
    """
    if engine is None:
        raise RuntimeError("Database engine not initialized. Check DATABASE_URL configuration.")
    with Session(engine) as session:
        yield session
