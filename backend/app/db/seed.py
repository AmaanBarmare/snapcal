"""Idempotent DB seed.

Creates all tables and populates the Indian Food DB on first call.
Safe to call repeatedly — it does not duplicate existing rows.
"""

import json
import logging
from datetime import datetime
from pathlib import Path

from app.db.models import IndianDish, User
from app.db.session import Base, SessionLocal, engine

logger = logging.getLogger(__name__)

SEED_PATH = Path(__file__).resolve().parent.parent / "data" / "indian_food_seed.json"

DEMO_USER_ID = 1

# Canonical demo profile — kept in sync with User model defaults in models.py.
DEMO_USER_PROFILE = {
    "email": "local@snapcal.demo",
    "goal": "maintain",
    "weight_kg": 70.0,
    "activity_level": "lightly_active",
    "daily_calorie_target": 2000,
    "daily_protein_target_g": 100,
    "daily_carbs_target_g": 250,
    "daily_fat_target_g": 65,
}


def seed_indian_dishes() -> int:
    """Upsert all dishes from the seed JSON. Returns rows inserted or updated."""
    with SEED_PATH.open("r", encoding="utf-8") as fh:
        rows = json.load(fh)
    inserted = 0
    updated = 0
    with SessionLocal() as db:
        for row in rows:
            dish_id = row["dish_id"]
            existing = db.query(IndianDish).filter(IndianDish.dish_id == dish_id).first()
            if existing is None:
                db.add(IndianDish(**row))
                inserted += 1
            else:
                for key, value in row.items():
                    setattr(existing, key, value)
                updated += 1
        db.commit()
    if inserted or updated:
        logger.info(
            "Indian food DB sync: %d inserted, %d updated (%d total in seed).",
            inserted,
            updated,
            len(rows),
        )
    else:
        logger.info("Indian food DB already in sync (%d dishes).", len(rows))
    return inserted + updated


def _apply_demo_profile(user: User) -> None:
    for key, value in DEMO_USER_PROFILE.items():
        setattr(user, key, value)
    if user.onboarded_at is None:
        user.onboarded_at = datetime.utcnow()


def ensure_demo_user() -> int:
    """Ensure demo user id=1 exists and matches the canonical seed profile."""
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == DEMO_USER_ID).first()
        if user is None:
            user = User(id=DEMO_USER_ID, **DEMO_USER_PROFILE, onboarded_at=datetime.utcnow())
            db.add(user)
            logger.info("Created demo user (id=1) with seed profile.")
        else:
            _apply_demo_profile(user)
            logger.info("Synced demo user (id=1) to seed profile.")
        db.commit()
        return user.id


def init_db() -> None:
    """Create tables and seed. Called at app startup."""
    Base.metadata.create_all(bind=engine)
    seed_indian_dishes()
    ensure_demo_user()
