from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "FarmLink API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite+aiosqlite:///./farmlink.db"  # Override with PostgreSQL in production
    DATABASE_URL_SYNC: str = "sqlite:///./farmlink.db"

    FRONTEND_URL: str = "http://localhost:5173"

    SECRET_KEY: str = "farmlink-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    PAYSTACK_SECRET_KEY: str = ""
    PAYSTACK_PUBLIC_KEY: str = ""

    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    REDIS_URL: str = "redis://localhost:6379"

    SMILE_ID_API_KEY: str = ""
    SMILE_ID_PARTNER_ID: str = ""

    AGENT_COMMISSION_PERCENT: float = 10.0
    PLATFORM_FEE_PERCENT: float = 2.5

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
