from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "FinSight"
    app_env: str = "development"
    app_debug: bool = True
    demo_mode: bool = True

    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    database_url: str = "sqlite:///./finsight.db"
    max_upload_mb: int = 5

    market_provider: Literal["demo", "yfinance"] = "yfinance"
    economic_provider: Literal["demo", "world_bank"] = "demo"
    ai_provider: Literal["fallback", "openai_compatible"] = "fallback"

    openai_api_key: str | None = None
    openai_base_url: str | None = None
    model_temperature: float = Field(default=0.2, ge=0.0, le=1.0)

    github_url: str = "https://github.com/your-username/finsight"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
