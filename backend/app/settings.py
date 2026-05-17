"""Centralised settings (loaded from `.env` at the repo root).

Every external dependency in SnapCal has a mock implementation behind the
same interface. The single switch that toggles the entire app between
"runs offline with no keys" and "calls real GPT-4o / Claude / Swiggy MCP"
is `USE_MOCKS`. Default: true (demo-friendly).
"""

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

REPO_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(REPO_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    use_mocks: bool = Field(default=True)

    openai_api_key: str = Field(default="")
    anthropic_api_key: str = Field(default="")
    gemini_api_key: str = Field(default="")

    supabase_url: str = Field(default="")
    supabase_anon_key: str = Field(default="")
    supabase_service_key: str = Field(default="")

    swiggy_client_id: str = Field(default="")
    swiggy_client_secret: str = Field(default="")
    swiggy_redirect_uri: str = Field(default="http://localhost:8000/api/swiggy/callback")
    swiggy_mcp_base_url: str = Field(default="")

    daily_snap_limit: int = Field(default=50)
    cart_cap_inr: int = Field(default=1000)

    db_url: str = Field(default="sqlite:///./snapcal.db")
    log_level: str = Field(default="INFO")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
