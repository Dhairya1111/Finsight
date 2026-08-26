from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.core.config import get_settings
from app.core.database import init_db

settings = get_settings()
PROJECT_ROOT = Path(__file__).resolve().parents[2]
FRONTEND_DIST = PROJECT_ROOT / "frontend" / "dist"
FRONTEND_ASSETS = FRONTEND_DIST / "assets"


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="FinSight API",
    description="AI-powered financial and economic intelligence platform API",
    version="0.1.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list + ["http://localhost", "http://127.0.0.1"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router)

if FRONTEND_ASSETS.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_ASSETS), name="frontend-assets")


@app.get("/", include_in_schema=False, response_model=None)
def root():
    index_path = FRONTEND_DIST / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return JSONResponse({"message": "FinSight frontend build not found. Run the frontend build first."})


@app.get("/{full_path:path}", include_in_schema=False, response_model=None)
def spa_fallback(full_path: str):
    if full_path.startswith("api/") or full_path in {"api", "docs", "openapi.json", "redoc"}:
        return JSONResponse({"detail": "Not found."}, status_code=404)

    index_path = FRONTEND_DIST / "index.html"
    asset_path = FRONTEND_DIST / full_path

    if asset_path.exists() and asset_path.is_file():
        return FileResponse(asset_path)
    if index_path.exists():
        return FileResponse(index_path)
    return JSONResponse({"message": "FinSight frontend build not found. Run the frontend build first."})
