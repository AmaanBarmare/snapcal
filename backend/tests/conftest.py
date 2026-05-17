"""Shared pytest fixtures.

Uses a file-backed SQLite DB for tests so that the TestClient (which opens
its own connections) sees the seeded data. The file is removed at session
end. DB_URL is overridden BEFORE any app modules are imported so the
engine in `app.db.session` picks it up.
"""

import os
import tempfile
from pathlib import Path

_TMP_DB = Path(tempfile.gettempdir()) / "snapcal_test.db"
if _TMP_DB.exists():
    _TMP_DB.unlink()

os.environ["DB_URL"] = f"sqlite:///{_TMP_DB}"
os.environ["USE_MOCKS"] = "true"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.db.seed import init_db  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _bootstrap_db():
    init_db()
    yield
    if _TMP_DB.exists():
        _TMP_DB.unlink()


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
