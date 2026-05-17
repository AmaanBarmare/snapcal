"""Vision adapter — identifies dishes / fridge ingredients from a base64 image.

Two implementations:
- MockVision: deterministic, hash-stable; lets the entire demo run offline.
- OpenAIVision: real GPT-4o calls (PRD §7 primary model).

Both implement `VisionAdapter`. The factory `get_vision_adapter()` chooses
based on `USE_MOCKS`.
"""

from __future__ import annotations

import base64
import hashlib
import json
import logging
from dataclasses import dataclass
from typing import Protocol

from app.settings import Settings, get_settings

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class DishGuess:
    name_english: str
    name_hindi: str
    serving_grams: float
    confidence: float  # 0-100

    def to_payload(self) -> dict:
        return {
            "name_english": self.name_english,
            "name_hindi": self.name_hindi,
            "serving_grams": self.serving_grams,
            "confidence": round(self.confidence, 1),
        }


@dataclass(frozen=True)
class IngredientGuess:
    name: str
    quantity: str
    confidence: str  # high | medium | low

    def to_payload(self) -> dict:
        return {"name": self.name, "quantity": self.quantity, "confidence": self.confidence}


class VisionAdapter(Protocol):
    def identify_meal(self, image_b64: str) -> list[DishGuess]:
        """Identify dish(es) in a meal photo. Returns 1–3 guesses."""

    def identify_fridge_contents(self, image_b64: str) -> list[IngredientGuess]:
        """Identify ingredients visible in a fridge interior photo."""


# ----------------------------------------------------------------------------
# Mock implementation
# ----------------------------------------------------------------------------

_MOCK_MEAL_ROTATION: list[list[DishGuess]] = [
    [DishGuess("Dal Tadka", "दाल तड़का", 180, 92.0)],
    [DishGuess("Masala Dosa", "मसाला डोसा", 150, 88.0)],
    [DishGuess("Chicken Biryani", "चिकन बिरयानी", 350, 90.0)],
    [DishGuess("Poha", "पोहा", 150, 94.0)],
    [DishGuess("Paneer Butter Masala", "पनीर बटर मसाला", 180, 87.0)],
    [DishGuess("Rajma", "राजमा", 180, 91.0), DishGuess("Jeera Rice", "जीरा चावल", 150, 89.0)],
    [DishGuess("Idli", "इडली", 100, 95.0), DishGuess("Sambar", "सांबर", 200, 93.0)],
    [DishGuess("Chole Bhature", "छोले भटूरे", 350, 89.0)],
]

_MOCK_FRIDGE_ROTATION: list[list[IngredientGuess]] = [
    [
        IngredientGuess("Eggs", "6 eggs", "high"),
        IngredientGuess("Onions", "3 medium", "high"),
        IngredientGuess("Tomatoes", "4 medium", "high"),
        IngredientGuess("Capsicum", "2 small", "high"),
        IngredientGuess("Paneer", "200g block", "medium"),
        IngredientGuess("Curd", "1 small tub", "high"),
        IngredientGuess("Coriander", "1 small bunch", "medium"),
        IngredientGuess("Butter", "Amul 100g", "high"),
    ],
    [
        IngredientGuess("Atta", "Aashirvaad 1kg", "high"),
        IngredientGuess("Potatoes", "5 medium", "high"),
        IngredientGuess("Onions", "4 medium", "high"),
        IngredientGuess("Ginger", "small piece", "medium"),
        IngredientGuess("Green chillies", "5-6 nos", "medium"),
        IngredientGuess("Curd", "1 tub", "high"),
        IngredientGuess("Lemon", "2 nos", "high"),
        IngredientGuess("Mustard seeds", "small jar", "low"),
    ],
    [
        IngredientGuess("Toor dal", "500g pack", "high"),
        IngredientGuess("Tomatoes", "3 nos", "high"),
        IngredientGuess("Onions", "2 nos", "high"),
        IngredientGuess("Ghee", "small jar", "high"),
        IngredientGuess("Garlic", "1 small head", "medium"),
        IngredientGuess("Cumin seeds", "small jar", "low"),
        IngredientGuess("Spinach", "1 bunch", "medium"),
    ],
]


class MockVision:
    """Deterministic mock. Same image always returns the same answer."""

    def _pick(self, image_b64: str, rotation_size: int) -> int:
        if not image_b64:
            return 0
        h = hashlib.sha256(image_b64.encode("utf-8", errors="ignore")).hexdigest()
        return int(h[:8], 16) % rotation_size

    def identify_meal(self, image_b64: str) -> list[DishGuess]:
        idx = self._pick(image_b64, len(_MOCK_MEAL_ROTATION))
        return list(_MOCK_MEAL_ROTATION[idx])

    def identify_fridge_contents(self, image_b64: str) -> list[IngredientGuess]:
        idx = self._pick(image_b64, len(_MOCK_FRIDGE_ROTATION))
        return list(_MOCK_FRIDGE_ROTATION[idx])


# ----------------------------------------------------------------------------
# Real GPT-4o implementation
# ----------------------------------------------------------------------------

_MEAL_SYSTEM_PROMPT = (
    "You are analysing a photo of food. Identify the dish(es) visible. "
    "Prioritise Indian dishes. For each dish return: name_english, name_hindi "
    "(if applicable), serving_grams (visual estimate of weight in grams), "
    "confidence (0-100). If multiple dishes (e.g. thali), list each separately "
    "(max 3). Return ONLY JSON of shape: "
    '{"dishes": [{"name_english": "...", "name_hindi": "...", '
    '"serving_grams": 180, "confidence": 88}]}'
)

_FRIDGE_SYSTEM_PROMPT = (
    "You are analysing a photo of a refrigerator interior. Return a JSON object "
    "with an `ingredients` array of items you can identify with high confidence. "
    "Use common Indian household names. For each include: name, quantity (rough), "
    "confidence (high|medium|low). Only include items clearly visible. "
    'Return ONLY JSON of shape: {"ingredients": [{"name": "...", "quantity": "...", '
    '"confidence": "high"}]}'
)


class OpenAIVision:
    """Real GPT-4o vision adapter.

    Used when USE_MOCKS=false AND OPENAI_API_KEY is set. Defensive: if the
    SDK or key is missing at runtime, we log and fall back to MockVision
    rather than crash the demo.
    """

    def __init__(self, api_key: str):
        self.api_key = api_key
        try:
            from openai import OpenAI

            self._client = OpenAI(api_key=api_key)
        except Exception as exc:
            logger.warning("OpenAI SDK init failed; will fall back to mock: %s", exc)
            self._client = None

    def _is_b64(self, s: str) -> bool:
        try:
            base64.b64decode(s, validate=True)
            return True
        except Exception:
            return False

    def _call(self, image_b64: str, system_prompt: str) -> dict:
        if self._client is None:
            raise RuntimeError("OpenAI client unavailable")
        image_url = (
            image_b64 if image_b64.startswith("data:") else f"data:image/jpeg;base64,{image_b64}"
        )
        resp = self._client.chat.completions.create(
            model="gpt-4o",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Analyse this image."},
                        {"type": "image_url", "image_url": {"url": image_url}},
                    ],
                },
            ],
            max_tokens=600,
            temperature=0.2,
        )
        return json.loads(resp.choices[0].message.content or "{}")

    def identify_meal(self, image_b64: str) -> list[DishGuess]:
        try:
            data = self._call(image_b64, _MEAL_SYSTEM_PROMPT)
        except Exception as exc:
            logger.warning("GPT-4o meal call failed, falling back to mock: %s", exc)
            return MockVision().identify_meal(image_b64)
        out: list[DishGuess] = []
        for d in (data.get("dishes") or [])[:3]:
            out.append(
                DishGuess(
                    name_english=str(d.get("name_english", "")).strip(),
                    name_hindi=str(d.get("name_hindi", "")).strip(),
                    serving_grams=float(d.get("serving_grams", 180) or 180),
                    confidence=float(d.get("confidence", 70) or 70),
                )
            )
        return out or MockVision().identify_meal(image_b64)

    def identify_fridge_contents(self, image_b64: str) -> list[IngredientGuess]:
        try:
            data = self._call(image_b64, _FRIDGE_SYSTEM_PROMPT)
        except Exception as exc:
            logger.warning("GPT-4o fridge call failed, falling back to mock: %s", exc)
            return MockVision().identify_fridge_contents(image_b64)
        out: list[IngredientGuess] = []
        for it in data.get("ingredients") or []:
            name = str(it.get("name", "")).strip()
            if not name:
                continue
            out.append(
                IngredientGuess(
                    name=name,
                    quantity=str(it.get("quantity", "")).strip(),
                    confidence=str(it.get("confidence", "medium")).strip().lower(),
                )
            )
        return out or MockVision().identify_fridge_contents(image_b64)


# ----------------------------------------------------------------------------
# Factory
# ----------------------------------------------------------------------------


def get_vision_adapter(settings: Settings | None = None) -> VisionAdapter:
    s = settings or get_settings()
    if s.use_mocks or not s.openai_api_key:
        return MockVision()
    return OpenAIVision(api_key=s.openai_api_key)
