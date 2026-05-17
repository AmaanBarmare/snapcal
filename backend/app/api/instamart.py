"""Instamart routes — three-stage guardrailed checkout (PRD §8).

Stage 1: POST /api/instamart/cart       build a cart from missing ingredients
Stage 2: POST /api/instamart/confirm    issue a single-use confirmation token
Stage 3: POST /api/instamart/checkout   consume the token, finalise via update_cart + checkout

`checkout` is *structurally* impossible without an explicit Stage 2 from the
frontend — the backend won't run `update_cart` / `checkout` against the
Swiggy client until a stored confirmation token matches.
"""

import secrets
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.adapters.swiggy import CartItem, get_swiggy_client
from app.db.models import InstamartCart, MealLog
from app.db.session import get_session
from app.services.gap_analyzer import CartCapExceeded, build_cart_from_missing
from app.settings import get_settings

router = APIRouter(prefix="/instamart", tags=["instamart"])


class BuildCartBody(BaseModel):
    user_id: int = 1
    recipe_name: str = Field(..., min_length=1)
    missing_ingredients: list[str] = Field(..., min_length=1)
    recipe_calories_per_serving: int | None = None
    recipe_protein_per_serving_g: float | None = None


class ConfirmBody(BaseModel):
    cart_id: int  # internal InstamartCart.id


class CheckoutBody(BaseModel):
    cart_id: int
    confirmation_token: str
    payment_mode: str = "UPI"  # UPI | COD | CARD


@router.post("/cart")
def build_cart(payload: BuildCartBody, db: Session = Depends(get_session)) -> dict:
    settings = get_settings()
    client = get_swiggy_client(settings)
    try:
        result = build_cart_from_missing(
            client=client,
            user_id=payload.user_id,
            missing_ingredients=payload.missing_ingredients,
            cart_cap_inr=settings.cart_cap_inr,
        )
    except CartCapExceeded as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    cart_row = InstamartCart(
        user_id=payload.user_id,
        recipe_name=payload.recipe_name,
        items_json=[i.to_payload() for i in result.cart_items],
        total_inr=result.total_inr,
        eta_minutes=12 if result.total_inr < 300 else 18 if result.total_inr < 700 else 25,
    )
    db.add(cart_row)
    db.commit()
    db.refresh(cart_row)

    return {
        "cartId": cart_row.id,
        "recipeName": cart_row.recipe_name,
        "items": cart_row.items_json,
        "total": cart_row.total_inr,
        "etaMinutes": cart_row.eta_minutes,
        "unavailable": result.unavailable,
        "cartCapInr": settings.cart_cap_inr,
        "plannedNutrition": {
            "calories": payload.recipe_calories_per_serving,
            "proteinG": payload.recipe_protein_per_serving_g,
        },
    }


@router.post("/confirm")
def confirm_cart(payload: ConfirmBody, db: Session = Depends(get_session)) -> dict:
    cart = db.query(InstamartCart).filter(InstamartCart.id == payload.cart_id).first()
    if cart is None:
        raise HTTPException(status_code=404, detail="Cart not found.")
    if cart.checked_out_at is not None:
        raise HTTPException(status_code=409, detail="Cart already checked out.")
    token = secrets.token_urlsafe(24)
    cart.confirmation_token = token
    cart.confirmed_at = datetime.utcnow()
    db.add(cart)
    db.commit()
    return {"cartId": cart.id, "confirmationToken": token}


@router.post("/checkout")
def checkout(payload: CheckoutBody, db: Session = Depends(get_session)) -> dict:
    cart = db.query(InstamartCart).filter(InstamartCart.id == payload.cart_id).first()
    if cart is None:
        raise HTTPException(status_code=404, detail="Cart not found.")
    if cart.checked_out_at is not None:
        raise HTTPException(status_code=409, detail="Cart already checked out.")
    if not cart.confirmation_token or cart.confirmation_token != payload.confirmation_token:
        raise HTTPException(
            status_code=403,
            detail=(
                "Missing or invalid confirmation token. Place Order requires an "
                "explicit /confirm step. This is a hard guardrail."
            ),
        )

    payment_mode = payload.payment_mode.upper()
    cod_warning = payment_mode == "COD"

    client = get_swiggy_client()
    items = [
        CartItem(
            product_id=i["productId"],
            name=i["name"],
            brand=i["brand"],
            quantity=i["quantity"],
            price_inr=i["price"],
        )
        for i in cart.items_json
    ]
    real_cart = client.update_cart(items)
    order = client.checkout(real_cart.cart_id, payment_mode)

    cart.order_id = order.order_id
    cart.checked_out_at = datetime.utcnow()
    cart.confirmation_token = None  # single-use
    db.add(cart)

    # Log planned meal to dashboard
    db.add(
        MealLog(
            user_id=cart.user_id,
            dish_name=cart.recipe_name,
            calories=0,
            source="mode1",
            is_planned=True,
            swiggy_order_id=order.order_id,
        )
    )
    db.commit()

    return {
        "orderId": order.order_id,
        "cartId": cart.id,
        "total": order.total_inr,
        "etaMinutes": order.eta_minutes,
        "paymentMode": payment_mode,
        "placedAt": order.placed_at,
        "codWarning": cod_warning,
    }
