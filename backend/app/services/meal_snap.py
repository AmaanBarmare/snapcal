"""Meal Snap pipeline: image → dish identification → nutrition lookup → payload."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.adapters.vision import DishGuess, get_vision_adapter
from app.services.nutrition_lookup import lookup_dish


def _category_for(name: str) -> str | None:
    n = name.lower()
    if "mushroom" in n and "pizza" in n:
        return "swiggy_common"
    if any(t in n for t in ("biryani", "pizza", "burger", "noodle", "manchurian")):
        return "swiggy_common"
    if any(t in n for t in ("dosa", "idli", "upma", "poha", "paratha", "thepla", "vada")):
        return "breakfast"
    if any(t in n for t in ("rice", "khichdi", "pulao")):
        return "rice"
    if any(t in n for t in ("dal", "curry", "paneer", "rajma", "chole", "sabzi", "sambar")):
        return "dal_curry"
    if any(t in n for t in ("samosa", "vada pav", "pani puri", "bhel", "pav bhaji")):
        return "snacks_street"
    if any(t in n for t in ("chicken", "mutton", "fish", "prawn", "egg", "tikka", "tandoori")):
        return "protein"
    return None


def run_meal_snap(
    db: Session,
    image_b64: str,
    *,
    swiggy_hint: bool = False,
) -> dict:
    """Identify dish(es) from the image and look up nutrition for each."""
    vision = get_vision_adapter()
    guesses: list[DishGuess] = vision.identify_meal(image_b64)

    items = []
    for g in guesses:
        result = lookup_dish(
            db,
            g.name_english,
            category_hint=_category_for(g.name_english),
            serving_grams=g.serving_grams,
        )
        nutrition = result.to_payload() if result else None
        items.append({
            "vision": g.to_payload(),
            "nutrition": nutrition,
        })

    primary = items[0] if items else None
    needs_confirmation = bool(primary and primary["vision"]["confidence"] < 70)

    return {
        "items": items,
        "primary": primary,
        "needs_confirmation": needs_confirmation,
        "source": "swiggy_menu_data" if swiggy_hint else "snapcal_indian_food_db",
    }
