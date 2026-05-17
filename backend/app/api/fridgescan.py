"""Mode 1 entry points:
- POST /api/fridgescan   — image → ingredient list
- POST /api/recipes      — confirmed ingredient list → 3 Indian recipes
"""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.adapters.recipes import get_recipe_adapter
from app.adapters.vision import get_vision_adapter
from app.db.models import FridgeScan
from app.db.session import get_session

router = APIRouter(tags=["fridgescan"])


class FridgeScanBody(BaseModel):
    image_b64: str = Field(..., min_length=1)
    user_id: int = 1


class RecipeBody(BaseModel):
    ingredients: list[str] = Field(..., min_length=1)
    user_id: int = 1


@router.post("/fridgescan")
def fridge_scan(payload: FridgeScanBody, db: Session = Depends(get_session)) -> dict:
    vision = get_vision_adapter()
    items = vision.identify_fridge_contents(payload.image_b64)
    if not items:
        raise HTTPException(
            status_code=422,
            detail="Could not identify any ingredients. Try better lighting or open the fridge door fully.",
        )
    detected = [it.name for it in items]
    scan = FridgeScan(user_id=payload.user_id, detected_ingredients=detected)
    db.add(scan)
    db.commit()
    db.refresh(scan)
    return {
        "scan_id": scan.id,
        "ingredients": [i.to_payload() for i in items],
        "timestamp": scan.timestamp.isoformat(),
    }


@router.post("/recipes")
def recipes(payload: RecipeBody) -> dict:
    cleaned = [i.strip() for i in payload.ingredients if i and i.strip()]
    engine = get_recipe_adapter()
    recipes = engine.suggest_recipes(cleaned)
    return {
        "ingredients_provided": cleaned,
        "recipes": [r.to_payload() for r in recipes],
        "generated_at": datetime.utcnow().isoformat(),
    }
