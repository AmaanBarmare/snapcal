"""Gap analyzer — converts a recipe's missing-ingredients list into a real
Instamart cart, preferring brands from the user's go_to_items history."""

from __future__ import annotations

from dataclasses import dataclass

from app.adapters.swiggy import CartItem, Product, SwiggyClient


class CartCapExceeded(Exception):
    """Raised when proposed cart exceeds the configured INR cap (PRD §8)."""


@dataclass
class GapResult:
    cart_items: list[CartItem]
    unavailable: list[str]
    total_inr: float


def _pick_product(
    options: list[Product], preferred_brands: set[str]
) -> Product | None:
    if not options:
        return None
    for p in options:
        if p.in_stock and p.brand in preferred_brands:
            return p
    for p in options:
        if p.in_stock:
            return p
    return None


def build_cart_from_missing(
    *,
    client: SwiggyClient,
    user_id: int,
    missing_ingredients: list[str],
    cart_cap_inr: int,
) -> GapResult:
    """For each missing ingredient run `search_products`, then choose a product
    biased toward the user's `your_go_to_items` brands. Aggregates total and
    enforces the cap."""
    go_to = client.your_go_to_items(user_id)
    preferred = {p.brand for p in go_to}

    seen: set[str] = set()
    chosen: list[CartItem] = []
    unavailable: list[str] = []

    for ing in missing_ingredients:
        norm = ing.strip()
        if not norm or norm.lower() in seen:
            continue
        seen.add(norm.lower())
        options = client.search_products(norm)
        product = _pick_product(options, preferred)
        if product is None:
            unavailable.append(norm)
            continue
        chosen.append(
            CartItem(
                product_id=product.product_id,
                name=product.name,
                brand=product.brand,
                quantity=1,
                price_inr=product.price_inr,
            )
        )

    total = round(sum(i.price_inr * i.quantity for i in chosen), 2)
    if total > cart_cap_inr:
        raise CartCapExceeded(
            f"Proposed cart total ₹{total} exceeds the configured ₹{cart_cap_inr} cap."
        )
    return GapResult(cart_items=chosen, unavailable=unavailable, total_inr=total)
