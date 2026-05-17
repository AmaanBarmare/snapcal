"""Swiggy Food MCP endpoints — Mode 2's novel nutrition cross-reference.

`/api/swiggy/orders`    → get_orders (last 10)
`/api/swiggy/menu`      → search_menu(restaurantId, query) → nutrition
"""

from fastapi import APIRouter, Query

from app.adapters.swiggy import get_swiggy_client

router = APIRouter(prefix="/swiggy", tags=["swiggy"])


@router.get("/orders")
def recent_orders(user_id: int = Query(default=1), limit: int = Query(default=10, le=20)) -> dict:
    client = get_swiggy_client()
    orders = client.get_orders(user_id=user_id, limit=limit)
    return {"orders": [o.to_payload() for o in orders]}


@router.get("/menu/nutrition")
def menu_nutrition(restaurant_id: str = Query(...), dish: str = Query(default="")) -> dict:
    """Cross-reference Vision AI's dish guess against a Swiggy restaurant menu.

    This is the novel API use we're applying with — uses `search_menu` as a
    grounding source for Indian-accurate nutrition data."""
    client = get_swiggy_client()
    items = client.search_menu(restaurant_id, dish)
    if not items:
        return {"items": [], "source": "swiggy_menu_data", "match": None}
    best = items[0]
    return {
        "match": best.to_payload(),
        "items": [i.to_payload() for i in items],
        "source": "swiggy_menu_data",
    }
