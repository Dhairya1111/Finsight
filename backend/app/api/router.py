from __future__ import annotations

from fastapi import APIRouter

from app.api.routes import ai, economics, events, finance, health, markets, ml, simulation

api_router = APIRouter(prefix="/api")
api_router.include_router(health.router, tags=["health"])
api_router.include_router(finance.router, prefix="/finance", tags=["finance"])
api_router.include_router(markets.router, prefix="/markets", tags=["markets"])
api_router.include_router(economics.router, prefix="/economics", tags=["economics"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["simulation"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(ml.router, prefix="/ml", tags=["machine-learning"])
