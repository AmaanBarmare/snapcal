"""SQLAlchemy models for SnapCal.

Schema mirrors PRD §7 (User Data Layer) and §9 (Indian Food Database).
"""

from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class IndianDish(Base):
    """One row per Indian dish; the moat per PRD §9."""

    __tablename__ = "indian_food_db"

    dish_id: Mapped[str] = mapped_column(String, primary_key=True)
    name_english: Mapped[str] = mapped_column(String, index=True)
    name_hindi: Mapped[str] = mapped_column(String, default="")
    aliases: Mapped[list[str]] = mapped_column(JSON, default=list)
    category: Mapped[str] = mapped_column(String, index=True)
    region: Mapped[str] = mapped_column(String, default="")

    calories_per_100g: Mapped[float] = mapped_column(Float)
    protein_per_100g: Mapped[float] = mapped_column(Float)
    carbs_per_100g: Mapped[float] = mapped_column(Float)
    fat_per_100g: Mapped[float] = mapped_column(Float)
    fibre_per_100g: Mapped[float] = mapped_column(Float, default=0.0)
    sodium_per_100g_mg: Mapped[float] = mapped_column(Float, default=0.0)

    serving_unit: Mapped[str] = mapped_column(String, default="katori")
    serving_grams: Mapped[float] = mapped_column(Float, default=180.0)

    cooking_method_variance: Mapped[str] = mapped_column(String, default="medium")
    notes: Mapped[str] = mapped_column(Text, default="")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String, default="local@snapcal.demo", index=True)
    goal: Mapped[str] = mapped_column(String, default="maintain")  # lose | maintain | gain
    weight_kg: Mapped[float] = mapped_column(Float, default=70.0)
    activity_level: Mapped[str] = mapped_column(
        String, default="lightly_active"
    )  # sedentary | lightly_active | very_active
    daily_calorie_target: Mapped[int] = mapped_column(Integer, default=2000)
    daily_protein_target_g: Mapped[int] = mapped_column(Integer, default=100)
    daily_carbs_target_g: Mapped[int] = mapped_column(Integer, default=250)
    daily_fat_target_g: Mapped[int] = mapped_column(Integer, default=65)
    onboarded_at: Mapped[datetime | None] = mapped_column(DateTime, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class MealLog(Base):
    __tablename__ = "meal_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    dish_name: Mapped[str] = mapped_column(String)
    dish_name_hindi: Mapped[str] = mapped_column(String, default="")
    serving_grams: Mapped[float] = mapped_column(Float, default=180.0)
    calories: Mapped[float] = mapped_column(Float)
    protein_g: Mapped[float] = mapped_column(Float, default=0.0)
    carbs_g: Mapped[float] = mapped_column(Float, default=0.0)
    fat_g: Mapped[float] = mapped_column(Float, default=0.0)
    fibre_g: Mapped[float] = mapped_column(Float, default=0.0)
    source: Mapped[str] = mapped_column(String, default="mode2")  # mode1 | mode2 | manual
    swiggy_order_id: Mapped[str | None] = mapped_column(String, default=None, nullable=True)
    photo_url: Mapped[str | None] = mapped_column(String, default=None, nullable=True)
    is_planned: Mapped[bool] = mapped_column(default=False)


class FridgeScan(Base):
    __tablename__ = "fridge_scans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    detected_ingredients: Mapped[list[str]] = mapped_column(JSON, default=list)
    recipe_chosen: Mapped[str | None] = mapped_column(String, default=None, nullable=True)
    instamart_order_id: Mapped[str | None] = mapped_column(String, default=None, nullable=True)


class InstamartCart(Base):
    """Server-side cart bookkeeping. Holds the single-use confirmation token
    that gates `/api/instamart/checkout`."""

    __tablename__ = "instamart_carts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    recipe_name: Mapped[str] = mapped_column(String)
    items_json: Mapped[list[dict]] = mapped_column(JSON, default=list)
    total_inr: Mapped[float] = mapped_column(Float, default=0.0)
    eta_minutes: Mapped[int] = mapped_column(Integer, default=15)
    confirmation_token: Mapped[str | None] = mapped_column(String, default=None, nullable=True)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime, default=None, nullable=True)
    checked_out_at: Mapped[datetime | None] = mapped_column(DateTime, default=None, nullable=True)
    order_id: Mapped[str | None] = mapped_column(String, default=None, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
