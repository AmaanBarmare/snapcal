"""SnapCal FastAPI entrypoint.

Run with:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

The `0.0.0.0` bind is so a phone on the same WiFi can reach it via the
laptop's LAN IP (Expo Go demo flow).
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.api import fridgescan, health, mealsnap, nutrition
from app.db.seed import init_db
from app.settings import get_settings


def _configure_logging(level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )


def create_app() -> FastAPI:
    settings = get_settings()
    _configure_logging(settings.log_level)

    app = FastAPI(
        title="SnapCal API",
        version=__version__,
        description=(
            "Camera-first food intelligence backend for Indian users. "
            "Powered by Swiggy Instamart + Food MCPs."
        ),
    )

    # CORS — wide-open for the demo because the Expo client may hit us
    # from any LAN origin. Tightened in production.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router, prefix="/api")
    app.include_router(nutrition.router, prefix="/api")
    app.include_router(mealsnap.router, prefix="/api")
    app.include_router(fridgescan.router, prefix="/api")

    @app.on_event("startup")
    def _on_start() -> None:
        init_db()

    logging.getLogger(__name__).info(
        "SnapCal API booted — version=%s mocks=%s", __version__, settings.use_mocks
    )
    return app


app = create_app()
