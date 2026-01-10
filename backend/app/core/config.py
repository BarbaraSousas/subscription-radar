# app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/subs"
    JWT_SECRET: str = "change-me"
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60*24
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def fix_database_url(cls, v: str) -> str:
        """
        Railway provides postgres:// URLs, but SQLAlchemy needs postgresql://
        Also ensure we use psycopg2 driver.
        """
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql://", 1)
        if v.startswith("postgresql://") and "+psycopg2" not in v:
            v = v.replace("postgresql://", "postgresql+psycopg2://", 1)
        return v

settings = Settings()