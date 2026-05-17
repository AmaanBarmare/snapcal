"""POST /api/mealsnap — Mode 2 entry point.

Accepts either a multipart image upload or a JSON body with base64 string.
"""

import base64

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from fastapi import File as FastFile
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import get_session
from app.services.meal_snap import run_meal_snap

router = APIRouter(prefix="/mealsnap", tags=["mealsnap"])


class MealSnapBody(BaseModel):
    image_b64: str = Field(..., min_length=1)
    swiggy_hint: bool = False


@router.post("")
def mealsnap_json(payload: MealSnapBody, db: Session = Depends(get_session)) -> dict:
    return run_meal_snap(db, payload.image_b64, swiggy_hint=payload.swiggy_hint)


@router.post("/upload")
async def mealsnap_upload(
    image: UploadFile = FastFile(...),
    db: Session = Depends(get_session),
) -> dict:
    raw = await image.read()
    if len(raw) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image exceeds 10MB limit.")
    b64 = base64.b64encode(raw).decode("ascii")
    return run_meal_snap(db, b64)
