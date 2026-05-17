"""Idempotent DB seed.

Creates all tables and populates the Indian Food DB on first call.
Safe to call repeatedly — it does not duplicate existing rows.
"""

import json
import logging
from pathlib import Path

from app.db.models import IndianDish, User
from app.db.session import Base, SessionLocal, engine

logger = logging.getLogger(__name__)

SEED_PATH = Path(__file__).resolve().parent.parent / "data" / "indian_food_seed.json"


def seed_indian_dishes() -> int:
    """Insert the seed dishes if the table is empty. Returns rows inserted."""
    with SessionLocal() as db:
        existing = db.query(IndianDish).count()
        if existing > 0:
            logger.info("Indian food DB already seeded (%d rows). Skipping.", existing)
            return 0
        with SEED_PATH.open("r", encoding="utf-8") as fh:
            rows = json.load(fh)
        for row in rows:
            db.add(IndianDish(**row))
        db.commit()
        logger.info("Seeded %d Indian dishes.", len(rows))
        return len(rows)


def ensure_demo_user() -> int:
    """Ensure there is one local demo user (id=1) used by the unauth demo."""
    with SessionLocal() as db:
        existing = db.query(User).filter(User.id == 1).first()
        if existing:
            return existing.id
        user = User(id=1)
        db.add(user)
        db.commit()
        return user.id


def init_db() -> None:
    """Create tables and seed. Called at app startup."""
    Base.metadata.create_all(bind=engine)
    seed_indian_dishes()
    ensure_demo_user()
