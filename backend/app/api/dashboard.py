"""Mode 3 — Today dashboard, meal logging, and 3-question onboarding."""

from datetime import datetime, time, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.models import MealLog, User
from app.db.session import get_session
from app.services.targets import compute_targets

router = APIRouter(tags=["dashboard"])


class OnboardingBody(BaseModel):
    user_id: int = 1
    goal: str = Field(..., pattern="^(lose|maintain|gain)$")
    weight_kg: float = Field(..., gt=20, lt=300)
    activity_level: str = Field(..., pattern="^(sedentary|lightly_active|very_active)$")


class MealLogBody(BaseModel):
    user_id: int = 1
    dish_name: str = Field(..., min_length=1)
    dish_name_hindi: str = ""
    serving_grams: float = 180.0
    calories: float = Field(..., ge=0)
    protein_g: float = 0.0
    carbs_g: float = 0.0
    fat_g: float = 0.0
    fibre_g: float = 0.0
    source: str = "mode2"
    photo_url: str | None = None
    swiggy_order_id: str | None = None
    is_planned: bool = False


@router.post("/onboarding")
def onboarding(payload: OnboardingBody, db: Session = Depends(get_session)) -> dict:
    user = db.query(User).filter(User.id == payload.user_id).first()
    if user is None:
        user = User(id=payload.user_id)
        db.add(user)
    user.goal = payload.goal
    user.weight_kg = payload.weight_kg
    user.activity_level = payload.activity_level

    targets = compute_targets(
        goal=payload.goal,
        weight_kg=payload.weight_kg,
        activity_level=payload.activity_level,
    )
    user.daily_calorie_target = targets.calories
    user.daily_protein_target_g = targets.protein_g
    user.daily_carbs_target_g = targets.carbs_g
    user.daily_fat_target_g = targets.fat_g
    user.onboarded_at = datetime.utcnow()
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "userId": user.id,
        "goal": user.goal,
        "weightKg": user.weight_kg,
        "activityLevel": user.activity_level,
        "targets": {
            "calories": user.daily_calorie_target,
            "proteinG": user.daily_protein_target_g,
            "carbsG": user.daily_carbs_target_g,
            "fatG": user.daily_fat_target_g,
        },
    }


@router.delete("/meallog/{meal_id}")
def delete_meal(
    meal_id: int,
    user_id: int = Query(default=1),
    db: Session = Depends(get_session),
) -> dict:
    row = (
        db.query(MealLog)
        .filter(MealLog.id == meal_id, MealLog.user_id == user_id)
        .first()
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Meal not found")
    db.delete(row)
    db.commit()
    return {"deleted": True, "id": meal_id}


@router.post("/meallog")
def log_meal(payload: MealLogBody, db: Session = Depends(get_session)) -> dict:
    row = MealLog(
        user_id=payload.user_id,
        dish_name=payload.dish_name,
        dish_name_hindi=payload.dish_name_hindi,
        serving_grams=payload.serving_grams,
        calories=payload.calories,
        protein_g=payload.protein_g,
        carbs_g=payload.carbs_g,
        fat_g=payload.fat_g,
        fibre_g=payload.fibre_g,
        source=payload.source,
        photo_url=payload.photo_url,
        swiggy_order_id=payload.swiggy_order_id,
        is_planned=payload.is_planned,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"id": row.id, "timestamp": row.timestamp.isoformat()}


def _day_bounds(now: datetime) -> tuple[datetime, datetime]:
    start = datetime.combine(now.date(), time.min)
    end = start + timedelta(days=1)
    return start, end


@router.get("/profile")
def profile(user_id: int = Query(default=1), db: Session = Depends(get_session)) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    meals_logged = (
        db.query(MealLog).filter(MealLog.user_id == user_id).count()
    )

    return {
        "userId": user.id,
        "displayName": "Demo User",
        "email": user.email,
        "goal": user.goal,
        "weightKg": user.weight_kg,
        "activityLevel": user.activity_level,
        "onboarded": user.onboarded_at is not None,
        "onboardedAt": user.onboarded_at.isoformat() if user.onboarded_at else None,
        "targets": {
            "calories": user.daily_calorie_target,
            "proteinG": user.daily_protein_target_g,
            "carbsG": user.daily_carbs_target_g,
            "fatG": user.daily_fat_target_g,
        },
        "stats": {
            "mealsLogged": meals_logged,
        },
    }


@router.get("/dashboard/today")
def today(user_id: int = Query(default=1), db: Session = Depends(get_session)) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    start, end = _day_bounds(datetime.utcnow())
    logs = (
        db.query(MealLog)
        .filter(MealLog.user_id == user_id, MealLog.timestamp >= start, MealLog.timestamp < end)
        .order_by(MealLog.timestamp.asc())
        .all()
    )

    total_cal = round(sum(l.calories for l in logs), 1)
    total_protein = round(sum(l.protein_g for l in logs), 1)
    total_carbs = round(sum(l.carbs_g for l in logs), 1)
    total_fat = round(sum(l.fat_g for l in logs), 1)

    return {
        "date": start.date().isoformat(),
        "onboarded": user.onboarded_at is not None,
        "targets": {
            "calories": user.daily_calorie_target,
            "proteinG": user.daily_protein_target_g,
            "carbsG": user.daily_carbs_target_g,
            "fatG": user.daily_fat_target_g,
        },
        "totals": {
            "calories": total_cal,
            "proteinG": total_protein,
            "carbsG": total_carbs,
            "fatG": total_fat,
        },
        "meals": [
            {
                "id": l.id,
                "timestamp": l.timestamp.isoformat(),
                "dishName": l.dish_name,
                "dishNameHindi": l.dish_name_hindi,
                "servingGrams": l.serving_grams,
                "calories": l.calories,
                "proteinG": l.protein_g,
                "carbsG": l.carbs_g,
                "fatG": l.fat_g,
                "source": l.source,
                "swiggyOrderId": l.swiggy_order_id,
                "isPlanned": l.is_planned,
            }
            for l in logs
        ],
    }


@router.get("/history")
def history(user_id: int = Query(default=1), days: int = Query(default=7, le=30), db: Session = Depends(get_session)) -> dict:
    end = datetime.utcnow()
    start = end - timedelta(days=days)
    logs = (
        db.query(MealLog)
        .filter(MealLog.user_id == user_id, MealLog.timestamp >= start)
        .order_by(MealLog.timestamp.desc())
        .all()
    )
    return {
        "days": days,
        "meals": [
            {
                "id": l.id,
                "timestamp": l.timestamp.isoformat(),
                "dishName": l.dish_name,
                "calories": l.calories,
                "proteinG": l.protein_g,
                "source": l.source,
                "isPlanned": l.is_planned,
            }
            for l in logs
        ],
    }
