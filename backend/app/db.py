# app/db.py
from sqlmodel import create_engine, SQLModel, Session
from app.core.config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=True,  # Set to False in production
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)


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
    with Session(engine) as session:
        yield session
