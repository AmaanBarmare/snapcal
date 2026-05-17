"""Indian Food DB lookup with exact → alias → fuzzy → category fallback.

Mirrors PRD §9 mapping algorithm.
"""

from __future__ import annotations

from dataclasses import dataclass

from rapidfuzz import fuzz, process
from sqlalchemy.orm import Session

from app.db.models import IndianDish

FUZZY_MIN_SCORE = 80  # below this we either ask or fall back to category
CATEGORY_FALLBACK = {
    "dal_curry": "IND_099",  # Generic North Indian Curry
    "rice": "IND_045",  # Plain Rice
    "breakfast": "IND_100",  # Generic South Indian Tiffin
    "swiggy_common": "IND_097",  # Thali
    "protein": "IND_069",  # Chicken Curry
    "snacks_street": "IND_059",  # Bhel Puri
    "roti_bread": "IND_038",  # Roti
    "drinks_dessert": "IND_088",  # Masala Chai
}


@dataclass(frozen=True)
class NutritionResult:
    dish: IndianDish
    match_type: str  # exact | alias | fuzzy | category_fallback
    confidence: float  # 0-100
    serving_grams: float

    def to_payload(self) -> dict:
        d = self.dish
        per100 = {
            "calories": d.calories_per_100g,
            "protein_g": d.protein_per_100g,
            "carbs_g": d.carbs_per_100g,
            "fat_g": d.fat_per_100g,
            "fibre_g": d.fibre_per_100g,
            "sodium_mg": d.sodium_per_100g_mg,
        }
        ratio = self.serving_grams / 100.0
        per_serving = {
            "calories": round(d.calories_per_100g * ratio),
            "protein_g": round(d.protein_per_100g * ratio, 1),
            "carbs_g": round(d.carbs_per_100g * ratio, 1),
            "fat_g": round(d.fat_per_100g * ratio, 1),
            "fibre_g": round(d.fibre_per_100g * ratio, 1),
            "sodium_mg": round(d.sodium_per_100g_mg * ratio),
        }
        return {
            "dish_id": d.dish_id,
            "name_english": d.name_english,
            "name_hindi": d.name_hindi,
            "category": d.category,
            "region": d.region,
            "match_type": self.match_type,
            "match_confidence": round(self.confidence, 1),
            "serving": {
                "unit": d.serving_unit,
                "grams": self.serving_grams,
            },
            "per_100g": per100,
            "per_serving": per_serving,
            "cooking_method_variance": d.cooking_method_variance,
            "notes": d.notes,
        }


def lookup_dish(
    db: Session,
    query: str,
    *,
    category_hint: str | None = None,
    serving_grams: float | None = None,
) -> NutritionResult | None:
    """Resolve `query` to a NutritionResult or None if nothing usable."""
    if not query or not query.strip():
        return None
    q = query.strip().lower()

    rows: list[IndianDish] = db.query(IndianDish).all()
    if not rows:
        return None

    by_name = {r.name_english.lower(): r for r in rows}
    if q in by_name:
        dish = by_name[q]
        return NutritionResult(
            dish=dish,
            match_type="exact",
            confidence=100.0,
            serving_grams=serving_grams or dish.serving_grams,
        )

    for r in rows:
        for alias in r.aliases or []:
            if alias.lower() == q:
                return NutritionResult(
                    dish=r,
                    match_type="alias",
                    confidence=98.0,
                    serving_grams=serving_grams or r.serving_grams,
                )

    candidates: dict[str, IndianDish] = {}
    for r in rows:
        candidates[r.name_english.lower()] = r
        for alias in r.aliases or []:
            candidates.setdefault(alias.lower(), r)

    best = process.extractOne(q, list(candidates.keys()), scorer=fuzz.WRatio)
    if best and best[1] >= FUZZY_MIN_SCORE:
        key, score, _ = best
        dish = candidates[key]
        return NutritionResult(
            dish=dish,
            match_type="fuzzy",
            confidence=float(score),
            serving_grams=serving_grams or dish.serving_grams,
        )

    if category_hint:
        fallback_id = CATEGORY_FALLBACK.get(category_hint)
        if fallback_id:
            dish = db.query(IndianDish).filter(IndianDish.dish_id == fallback_id).first()
            if dish:
                return NutritionResult(
                    dish=dish,
                    match_type="category_fallback",
                    confidence=45.0,
                    serving_grams=serving_grams or dish.serving_grams,
                )

    return None
