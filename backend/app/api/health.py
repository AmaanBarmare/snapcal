from fastapi import APIRouter

from app import __version__
from app.settings import get_settings

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict[str, object]:
    settings = get_settings()
    return {
        "status": "ok",
        "version": __version__,
        "mocks": settings.use_mocks,
    }
