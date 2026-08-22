from __future__ import annotations

from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter()


@router.get("/health")
def health_check() -> dict[str, object]:
    settings = get_settings()
    return {
        "status": "ok",
        "app_name": settings.app_name,
        "demo_mode": settings.demo_mode,
        "market_provider": settings.market_provider,
        "economic_provider": settings.economic_provider,
        "ai_provider": settings.ai_provider,
    }
