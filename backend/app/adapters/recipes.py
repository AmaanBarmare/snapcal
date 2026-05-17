"""Recipe engine adapter — Claude Sonnet 4 for production, deterministic mock for demo.

Both implementations satisfy the `RecipeAdapter` Protocol. Selection happens
via `get_recipe_adapter()`.
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from typing import Protocol

from app.settings import Settings, get_settings

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class RecipeIngredient:
    name: str
    quantity: str = ""

    def to_payload(self) -> dict:
        return {"name": self.name, "quantity": self.quantity}


@dataclass(frozen=True)
class Recipe:
    name_english: str
    name_hindi: str
    cook_time_minutes: int
    difficulty: str  # Easy | Medium
    calories_per_serving: int
    protein_per_serving_g: float
    ingredients_available: list[RecipeIngredient] = field(default_factory=list)
    ingredients_missing: list[RecipeIngredient] = field(default_factory=list)

    @property
    def missing_count(self) -> int:
        return len(self.ingredients_missing)

    def to_payload(self) -> dict:
        return {
            "name_english": self.name_english,
            "name_hindi": self.name_hindi,
            "cook_time_minutes": self.cook_time_minutes,
            "difficulty": self.difficulty,
            "calories_per_serving": self.calories_per_serving,
            "protein_per_serving_g": self.protein_per_serving_g,
            "ingredients_available": [i.to_payload() for i in self.ingredients_available],
            "ingredients_missing": [i.to_payload() for i in self.ingredients_missing],
            "missing_count": self.missing_count,
        }


class RecipeAdapter(Protocol):
    def suggest_recipes(self, ingredients: list[str]) -> list[Recipe]: ...


# ----------------------------------------------------------------------------
# Mock — handcrafted Indian recipes; ranks by fewest missing
# ----------------------------------------------------------------------------

_RECIPE_LIBRARY: list[dict] = [
    {
        "name_english": "Paneer Bhurji",
        "name_hindi": "पनीर भुर्जी",
        "cook_time_minutes": 15,
        "difficulty": "Easy",
        "calories_per_serving": 320,
        "protein_per_serving_g": 18.0,
        "required": [
            ("Paneer", "200g"),
            ("Onions", "1 medium, chopped"),
            ("Tomatoes", "1 medium, chopped"),
            ("Green chillies", "2 nos"),
            ("Coriander", "small bunch"),
            ("Oil or butter", "1 tbsp"),
            ("Salt", "to taste"),
            ("Turmeric", "1/4 tsp"),
        ],
    },
    {
        "name_english": "Aloo Paratha",
        "name_hindi": "आलू पराठा",
        "cook_time_minutes": 30,
        "difficulty": "Medium",
        "calories_per_serving": 380,
        "protein_per_serving_g": 9.0,
        "required": [
            ("Atta (wheat flour)", "2 cups"),
            ("Potatoes", "3 medium, boiled"),
            ("Onions", "1 small, chopped"),
            ("Green chillies", "1-2 nos"),
            ("Coriander", "small bunch"),
            ("Salt", "to taste"),
            ("Ghee or oil", "for cooking"),
            ("Carom seeds (ajwain)", "1/4 tsp"),
        ],
    },
    {
        "name_english": "Dal Tadka",
        "name_hindi": "दाल तड़का",
        "cook_time_minutes": 25,
        "difficulty": "Easy",
        "calories_per_serving": 220,
        "protein_per_serving_g": 11.0,
        "required": [
            ("Toor dal", "1 cup"),
            ("Onions", "1 medium"),
            ("Tomatoes", "1 medium"),
            ("Garlic", "4 cloves"),
            ("Cumin seeds", "1 tsp"),
            ("Ghee", "1 tbsp"),
            ("Turmeric", "1/2 tsp"),
            ("Salt", "to taste"),
        ],
    },
    {
        "name_english": "Vegetable Poha",
        "name_hindi": "वेज पोहा",
        "cook_time_minutes": 15,
        "difficulty": "Easy",
        "calories_per_serving": 290,
        "protein_per_serving_g": 6.5,
        "required": [
            ("Poha (flattened rice)", "2 cups"),
            ("Onions", "1 medium"),
            ("Potatoes", "1 small"),
            ("Green chillies", "1-2 nos"),
            ("Mustard seeds", "1/2 tsp"),
            ("Curry leaves", "few"),
            ("Peanuts", "2 tbsp"),
            ("Lemon", "1/2"),
            ("Turmeric", "1/4 tsp"),
        ],
    },
    {
        "name_english": "Vegetable Pulao",
        "name_hindi": "वेज पुलाव",
        "cook_time_minutes": 35,
        "difficulty": "Medium",
        "calories_per_serving": 340,
        "protein_per_serving_g": 7.0,
        "required": [
            ("Basmati rice", "1 cup"),
            ("Mixed vegetables", "1 cup"),
            ("Onions", "1 medium"),
            ("Ghee or oil", "2 tbsp"),
            ("Whole garam masala", "1 tsp"),
            ("Ginger-garlic paste", "1 tsp"),
            ("Salt", "to taste"),
        ],
    },
    {
        "name_english": "Egg Bhurji",
        "name_hindi": "अंडा भुर्जी",
        "cook_time_minutes": 10,
        "difficulty": "Easy",
        "calories_per_serving": 280,
        "protein_per_serving_g": 18.0,
        "required": [
            ("Eggs", "4 nos"),
            ("Onions", "1 medium"),
            ("Tomatoes", "1 small"),
            ("Green chillies", "1-2 nos"),
            ("Coriander", "small bunch"),
            ("Oil", "1 tbsp"),
            ("Salt", "to taste"),
            ("Turmeric", "1/4 tsp"),
        ],
    },
    {
        "name_english": "Jeera Rice",
        "name_hindi": "जीरा चावल",
        "cook_time_minutes": 20,
        "difficulty": "Easy",
        "calories_per_serving": 250,
        "protein_per_serving_g": 4.5,
        "required": [
            ("Basmati rice", "1 cup"),
            ("Cumin seeds", "1 tsp"),
            ("Ghee", "1 tbsp"),
            ("Bay leaf", "1"),
            ("Salt", "to taste"),
        ],
    },
    {
        "name_english": "Curd Rice",
        "name_hindi": "दही चावल",
        "cook_time_minutes": 15,
        "difficulty": "Easy",
        "calories_per_serving": 230,
        "protein_per_serving_g": 7.0,
        "required": [
            ("Cooked rice", "1.5 cups"),
            ("Curd", "1 cup"),
            ("Mustard seeds", "1/2 tsp"),
            ("Curry leaves", "few"),
            ("Green chillies", "1 no"),
            ("Salt", "to taste"),
        ],
    },
    {
        "name_english": "Mixed Vegetable Curry",
        "name_hindi": "मिक्स वेज",
        "cook_time_minutes": 30,
        "difficulty": "Medium",
        "calories_per_serving": 240,
        "protein_per_serving_g": 6.0,
        "required": [
            ("Mixed vegetables", "2 cups"),
            ("Onions", "1 medium"),
            ("Tomatoes", "2 medium"),
            ("Ginger-garlic paste", "1 tsp"),
            ("Garam masala", "1 tsp"),
            ("Salt", "to taste"),
            ("Oil", "1 tbsp"),
        ],
    },
    {
        "name_english": "Aloo Bhindi",
        "name_hindi": "आलू भिंडी",
        "cook_time_minutes": 25,
        "difficulty": "Easy",
        "calories_per_serving": 210,
        "protein_per_serving_g": 4.0,
        "required": [
            ("Bhindi (okra)", "300g"),
            ("Potatoes", "2 medium"),
            ("Onions", "1 medium"),
            ("Cumin seeds", "1 tsp"),
            ("Coriander powder", "1 tsp"),
            ("Salt", "to taste"),
            ("Oil", "2 tbsp"),
        ],
    },
]


def _normalise(s: str) -> str:
    return s.strip().lower()


def _ingredient_present(needed: str, available: set[str]) -> bool:
    """Loose membership: 'Onions' matches when fridge has 'onions'/'red onions' etc."""
    n = _normalise(needed)
    base = n.split(" (")[0].strip()
    if base in available:
        return True
    for a in available:
        if base in a or a in base:
            return True
        first_word = base.split()[0] if base else ""
        if first_word and first_word in a:
            return True
    return False


class MockRecipes:
    def suggest_recipes(self, ingredients: list[str]) -> list[Recipe]:
        available = {_normalise(i) for i in ingredients if i}

        scored: list[Recipe] = []
        for r in _RECIPE_LIBRARY:
            avail_list: list[RecipeIngredient] = []
            missing_list: list[RecipeIngredient] = []
            for name, qty in r["required"]:
                if _ingredient_present(name, available):
                    avail_list.append(RecipeIngredient(name=name, quantity=qty))
                else:
                    missing_list.append(RecipeIngredient(name=name, quantity=qty))
            scored.append(
                Recipe(
                    name_english=r["name_english"],
                    name_hindi=r["name_hindi"],
                    cook_time_minutes=r["cook_time_minutes"],
                    difficulty=r["difficulty"],
                    calories_per_serving=r["calories_per_serving"],
                    protein_per_serving_g=r["protein_per_serving_g"],
                    ingredients_available=avail_list,
                    ingredients_missing=missing_list,
                )
            )

        scored.sort(key=lambda r: (r.missing_count, r.cook_time_minutes))
        return scored[:3]


# ----------------------------------------------------------------------------
# Real Claude Sonnet 4 implementation
# ----------------------------------------------------------------------------

_RECIPE_SYSTEM_PROMPT = (
    "You are an Indian home cooking assistant. Given a list of available "
    "ingredients, return exactly 3 Indian home-cooking recipes that can be "
    "made primarily with these ingredients. Order by fewest missing "
    "ingredients first. Return ONLY JSON of shape: "
    '{"recipes": [{"name_english": "...", "name_hindi": "...", '
    '"cook_time_minutes": 25, "difficulty": "Easy", "calories_per_serving": 250, '
    '"protein_per_serving_g": 12, "ingredients_available": [{"name": "...", '
    '"quantity": "..."}], "ingredients_missing": [{"name": "...", '
    '"quantity": "..."}]}]} . Difficulty is Easy or Medium only.'
)


class ClaudeRecipes:
    def __init__(self, api_key: str):
        self.api_key = api_key
        try:
            import anthropic

            self._client = anthropic.Anthropic(api_key=api_key)
        except Exception as exc:
            logger.warning("Anthropic SDK init failed; will fall back to mock: %s", exc)
            self._client = None

    def suggest_recipes(self, ingredients: list[str]) -> list[Recipe]:
        if self._client is None:
            return MockRecipes().suggest_recipes(ingredients)
        user_msg = f"Available ingredients: {', '.join(ingredients) or '(none)'}"
        try:
            resp = self._client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1500,
                system=_RECIPE_SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_msg}],
            )
            text = ""
            for block in resp.content:
                if getattr(block, "type", None) == "text":
                    text += block.text
            data = json.loads(text)
        except Exception as exc:
            logger.warning("Claude recipe call failed, falling back to mock: %s", exc)
            return MockRecipes().suggest_recipes(ingredients)

        out: list[Recipe] = []
        for r in (data.get("recipes") or [])[:3]:
            avail = [
                RecipeIngredient(name=i.get("name", ""), quantity=i.get("quantity", ""))
                for i in r.get("ingredients_available") or []
            ]
            miss = [
                RecipeIngredient(name=i.get("name", ""), quantity=i.get("quantity", ""))
                for i in r.get("ingredients_missing") or []
            ]
            out.append(
                Recipe(
                    name_english=r.get("name_english", ""),
                    name_hindi=r.get("name_hindi", ""),
                    cook_time_minutes=int(r.get("cook_time_minutes", 20) or 20),
                    difficulty=str(r.get("difficulty", "Easy")),
                    calories_per_serving=int(r.get("calories_per_serving", 250) or 250),
                    protein_per_serving_g=float(r.get("protein_per_serving_g", 8) or 8),
                    ingredients_available=avail,
                    ingredients_missing=miss,
                )
            )
        out.sort(key=lambda r: r.missing_count)
        return out or MockRecipes().suggest_recipes(ingredients)


def get_recipe_adapter(settings: Settings | None = None) -> RecipeAdapter:
    s = settings or get_settings()
    if s.use_mocks or not s.anthropic_api_key:
        return MockRecipes()
    return ClaudeRecipes(api_key=s.anthropic_api_key)
