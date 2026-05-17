from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_session
from app.services.nutrition_lookup import lookup_dish

router = APIRouter(prefix="/nutrition", tags=["nutrition"])


@router.get("/lookup")
def lookup(
    dish: str = Query(..., min_length=1),
    category_hint: str | None = Query(default=None),
    serving_grams: float | None = Query(default=None, gt=0),
    db: Session = Depends(get_session),
) -> dict:
    result = lookup_dish(db, dish, category_hint=category_hint, serving_grams=serving_grams)
    if result is None:
        raise HTTPException(status_code=404, detail=f"No nutrition data for '{dish}'.")
    return result.to_payload()
