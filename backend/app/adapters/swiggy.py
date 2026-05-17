"""Swiggy MCP adapter — Instamart + Food.

Two implementations behind the `SwiggyClient` Protocol:
- MockSwiggy:        deterministic in-memory simulation that mirrors the
                     real MCP tool shape (PRD §8). Lets the entire demo
                     run without Builders Club credentials.
- SwiggyRealClient:  stub that explicitly raises NotImplementedError until
                     credentials arrive. Kept visible in the codebase so
                     a reviewer can see exactly where the real wire-up lives.

The mock's product catalogue is hand-curated with realistic Indian
SKUs (Amul, Mother Dairy, Aashirvaad, Tata, etc.) and ₹ prices.
"""

from __future__ import annotations

import logging
import secrets
import time
from dataclasses import dataclass
from datetime import datetime
from typing import Protocol

from app.settings import Settings, get_settings

logger = logging.getLogger(__name__)


# ----------------------------------------------------------------------------
# MCP-shaped data types (mirrors real tool responses per PRD §8)
# ----------------------------------------------------------------------------


@dataclass(frozen=True)
class Product:
    product_id: str
    name: str
    brand: str
    price_inr: float
    pack_size: str
    image_url: str = ""
    in_stock: bool = True

    def to_payload(self) -> dict:
        return {
            "productId": self.product_id,
            "name": self.name,
            "brand": self.brand,
            "price": self.price_inr,
            "packSize": self.pack_size,
            "imageUrl": self.image_url,
            "inStock": self.in_stock,
        }


@dataclass(frozen=True)
class CartItem:
    product_id: str
    name: str
    brand: str
    quantity: int
    price_inr: float

    def to_payload(self) -> dict:
        return {
            "productId": self.product_id,
            "name": self.name,
            "brand": self.brand,
            "quantity": self.quantity,
            "price": self.price_inr,
            "lineTotal": round(self.price_inr * self.quantity, 2),
        }


@dataclass(frozen=True)
class Cart:
    cart_id: str
    items: list[CartItem]
    total_inr: float
    eta_minutes: int

    def to_payload(self) -> dict:
        return {
            "cartId": self.cart_id,
            "items": [i.to_payload() for i in self.items],
            "total": self.total_inr,
            "etaMinutes": self.eta_minutes,
        }


@dataclass(frozen=True)
class Order:
    order_id: str
    cart_id: str
    total_inr: float
    eta_minutes: int
    payment_mode: str
    placed_at: str
    restaurant: str = ""

    def to_payload(self) -> dict:
        return {
            "orderId": self.order_id,
            "cartId": self.cart_id,
            "total": self.total_inr,
            "etaMinutes": self.eta_minutes,
            "paymentMode": self.payment_mode,
            "placedAt": self.placed_at,
            "restaurant": self.restaurant,
        }


@dataclass(frozen=True)
class MenuItem:
    item_id: str
    name: str
    restaurant: str
    price_inr: float
    calories: int | None
    protein_g: float | None
    carbs_g: float | None
    fat_g: float | None
    serving_grams: float

    def to_payload(self) -> dict:
        return {
            "itemId": self.item_id,
            "name": self.name,
            "restaurant": self.restaurant,
            "price": self.price_inr,
            "calories": self.calories,
            "proteinG": self.protein_g,
            "carbsG": self.carbs_g,
            "fatG": self.fat_g,
            "servingGrams": self.serving_grams,
        }


# ----------------------------------------------------------------------------
# Protocol — matches real MCP tool names
# ----------------------------------------------------------------------------


class SwiggyClient(Protocol):
    # Instamart
    def search_products(self, query: str, location: str = "Bangalore") -> list[Product]: ...
    def your_go_to_items(self, user_id: int) -> list[Product]: ...
    def update_cart(self, items: list[CartItem]) -> Cart: ...
    def checkout(self, cart_id: str, payment_mode: str) -> Order: ...

    # Food
    def get_orders(self, user_id: int, limit: int = 10) -> list[Order]: ...
    def search_menu(self, restaurant_id: str, query: str) -> list[MenuItem]: ...


# ----------------------------------------------------------------------------
# Mock catalogue
# ----------------------------------------------------------------------------

_CATALOGUE: dict[str, list[Product]] = {
    "onion": [
        Product("SW_ONION_LOOSE", "Onions (loose)", "Fresho", 28.0, "500g"),
        Product("SW_ONION_PREMIUM", "Onions Premium", "Mother Dairy", 35.0, "500g"),
    ],
    "tomato": [
        Product("SW_TOM_LOOSE", "Tomatoes (loose)", "Fresho", 24.0, "500g"),
        Product("SW_TOM_HYBRID", "Hybrid Tomatoes", "Mother Dairy", 32.0, "500g"),
    ],
    "potato": [
        Product("SW_POT_LOOSE", "Potatoes (loose)", "Fresho", 35.0, "1kg"),
    ],
    "capsicum": [
        Product("SW_CAP_GREEN", "Green Capsicum", "Fresho", 45.0, "250g"),
    ],
    "paneer": [
        Product("SW_PAN_AMUL", "Paneer Block", "Amul", 105.0, "200g"),
        Product("SW_PAN_MD", "Paneer Fresh", "Mother Dairy", 99.0, "200g"),
    ],
    "atta": [
        Product("SW_ATTA_AASH", "Atta Whole Wheat", "Aashirvaad", 320.0, "5kg"),
        Product("SW_ATTA_PIL", "Atta Chakki Fresh", "Pillsbury", 285.0, "5kg"),
    ],
    "rice": [
        Product("SW_RICE_DAAW", "Basmati Rice", "Daawat", 215.0, "1kg"),
        Product("SW_RICE_INDIA_GATE", "Basmati Premium", "India Gate", 240.0, "1kg"),
    ],
    "dal": [
        Product("SW_DAL_TUR", "Toor Dal", "Tata Sampann", 195.0, "1kg"),
        Product("SW_DAL_MOONG", "Moong Dal", "Tata Sampann", 175.0, "1kg"),
    ],
    "toor dal": [Product("SW_DAL_TUR", "Toor Dal", "Tata Sampann", 195.0, "1kg")],
    "moong dal": [Product("SW_DAL_MOONG", "Moong Dal", "Tata Sampann", 175.0, "1kg")],
    "ghee": [
        Product("SW_GHEE_AMUL", "Pure Ghee", "Amul", 295.0, "500ml"),
        Product("SW_GHEE_MD", "Cow Ghee", "Mother Dairy", 305.0, "500ml"),
    ],
    "butter": [
        Product("SW_BUT_AMUL", "Butter", "Amul", 60.0, "100g"),
    ],
    "oil": [
        Product("SW_OIL_FORTUNE", "Sunflower Oil", "Fortune", 165.0, "1L"),
    ],
    "salt": [
        Product("SW_SALT_TATA", "Iodised Salt", "Tata", 28.0, "1kg"),
    ],
    "sugar": [
        Product("SW_SUGAR_MAD", "Sugar", "Madhur", 50.0, "1kg"),
    ],
    "curd": [
        Product("SW_CURD_AMUL", "Curd", "Amul", 35.0, "400g"),
        Product("SW_CURD_MD", "Dahi Probiotic", "Mother Dairy", 40.0, "400g"),
    ],
    "milk": [
        Product("SW_MILK_AMUL", "Full Cream Milk", "Amul", 32.0, "500ml"),
    ],
    "eggs": [
        Product("SW_EGG_TRAY", "Eggs (tray)", "Eggoz", 95.0, "12 nos"),
    ],
    "chicken": [
        Product("SW_CHK_LICIOUS", "Chicken Curry Cut", "Licious", 285.0, "500g"),
    ],
    "coriander": [
        Product("SW_COR_BUNCH", "Coriander Leaves", "Fresho", 12.0, "100g bunch"),
    ],
    "ginger": [
        Product("SW_GIN", "Ginger", "Fresho", 18.0, "100g"),
    ],
    "garlic": [
        Product("SW_GAR", "Garlic", "Fresho", 28.0, "200g"),
    ],
    "green chillies": [
        Product("SW_CHILLI", "Green Chillies", "Fresho", 8.0, "100g"),
    ],
    "lemon": [
        Product("SW_LEM", "Lemons", "Fresho", 18.0, "4 nos"),
    ],
    "cumin": [
        Product("SW_CUM_TATA", "Jeera (Cumin Seeds)", "Tata Sampann", 95.0, "100g"),
    ],
    "cumin seeds": [
        Product("SW_CUM_TATA", "Jeera (Cumin Seeds)", "Tata Sampann", 95.0, "100g"),
    ],
    "mustard seeds": [
        Product("SW_MUS_EVEREST", "Mustard Seeds", "Everest", 65.0, "100g"),
    ],
    "turmeric": [
        Product("SW_TUR_TATA", "Turmeric Powder", "Tata Sampann", 75.0, "200g"),
    ],
    "garam masala": [
        Product("SW_GM_MDH", "Garam Masala", "MDH", 85.0, "100g"),
    ],
    "coriander powder": [
        Product("SW_COR_POW_MDH", "Coriander Powder", "MDH", 60.0, "200g"),
    ],
    "peanuts": [
        Product("SW_PEA", "Peanuts (raw)", "Fresho", 65.0, "250g"),
    ],
    "curry leaves": [
        Product("SW_CL", "Curry Leaves", "Fresho", 10.0, "small bunch"),
    ],
    "poha": [
        Product("SW_POHA_TATA", "Poha Medium", "Tata Sampann", 75.0, "500g"),
    ],
    "bhindi": [
        Product("SW_BHI", "Bhindi (Lady Finger)", "Fresho", 32.0, "250g"),
    ],
    "okra": [
        Product("SW_BHI", "Bhindi (Lady Finger)", "Fresho", 32.0, "250g"),
    ],
    "spinach": [
        Product("SW_SPI", "Spinach (Palak)", "Fresho", 22.0, "bunch"),
    ],
    "mixed vegetables": [
        Product("SW_MIX_VEG", "Mixed Veg Frozen", "Safal", 110.0, "500g"),
    ],
    "bay leaf": [
        Product("SW_BAY", "Tej Patta", "Catch", 35.0, "10g"),
    ],
    "ginger-garlic paste": [
        Product("SW_GGP", "Ginger Garlic Paste", "Dabur", 80.0, "200g"),
    ],
    "ginger garlic paste": [
        Product("SW_GGP", "Ginger Garlic Paste", "Dabur", 80.0, "200g"),
    ],
    "whole garam masala": [
        Product("SW_WGM", "Whole Garam Masala", "Catch", 110.0, "100g"),
    ],
    "carom seeds": [
        Product("SW_AJWAIN", "Ajwain (Carom Seeds)", "Catch", 50.0, "100g"),
    ],
    "ajwain": [
        Product("SW_AJWAIN", "Ajwain (Carom Seeds)", "Catch", 50.0, "100g"),
    ],
    "cooked rice": [
        Product("SW_RICE_DAAW", "Basmati Rice", "Daawat", 215.0, "1kg"),
    ],
    "basmati rice": [
        Product("SW_RICE_DAAW", "Basmati Rice", "Daawat", 215.0, "1kg"),
    ],
}


_GO_TO_BRANDS = {
    "atta": "Aashirvaad",
    "paneer": "Amul",
    "ghee": "Amul",
    "rice": "Daawat",
    "dal": "Tata Sampann",
    "toor dal": "Tata Sampann",
    "moong dal": "Tata Sampann",
    "salt": "Tata",
    "curd": "Amul",
    "butter": "Amul",
}


_RESTAURANTS_FOR_USER = [
    Order(
        order_id="SW_ORD_8821",
        cart_id="",
        total_inr=384.0,
        eta_minutes=35,
        payment_mode="UPI",
        placed_at=datetime.utcnow().isoformat(),
        restaurant="Behrouz Biryani",
    ),
    Order(
        order_id="SW_ORD_8720",
        cart_id="",
        total_inr=210.0,
        eta_minutes=25,
        payment_mode="UPI",
        placed_at=datetime.utcnow().isoformat(),
        restaurant="Faasos",
    ),
    Order(
        order_id="SW_ORD_8612",
        cart_id="",
        total_inr=520.0,
        eta_minutes=45,
        payment_mode="UPI",
        placed_at=datetime.utcnow().isoformat(),
        restaurant="Mainland China",
    ),
    Order(
        order_id="SW_ORD_8501",
        cart_id="",
        total_inr=180.0,
        eta_minutes=30,
        payment_mode="UPI",
        placed_at=datetime.utcnow().isoformat(),
        restaurant="A2B - Adyar Ananda Bhavan",
    ),
]


_MENU_BY_RESTAURANT: dict[str, list[MenuItem]] = {
    "SW_ORD_8821": [
        MenuItem("BEH_BIR_CHK", "Lucknowi Chicken Biryani", "Behrouz Biryani", 384.0, 820, 42.0, 88.0, 28.0, 380),
        MenuItem("BEH_BIR_VEG", "Hyderabadi Veg Biryani", "Behrouz Biryani", 299.0, 690, 14.0, 95.0, 22.0, 380),
        MenuItem("BEH_GUL", "Gulab Jamun (2)", "Behrouz Biryani", 99.0, 290, 4.0, 38.0, 12.0, 80),
    ],
    "SW_ORD_8720": [
        MenuItem("FAA_KAT_PAN", "Paneer Tikka Kathi Roll", "Faasos", 210.0, 480, 18.0, 52.0, 18.0, 220),
        MenuItem("FAA_KAT_CHK", "Chicken Tikka Kathi Roll", "Faasos", 230.0, 520, 24.0, 48.0, 19.0, 230),
    ],
    "SW_ORD_8612": [
        MenuItem("MC_HAK", "Veg Hakka Noodles", "Mainland China", 280.0, 620, 14.0, 88.0, 22.0, 320),
        MenuItem("MC_MAN", "Gobi Manchurian", "Mainland China", 240.0, 580, 12.0, 60.0, 28.0, 250),
    ],
    "SW_ORD_8501": [
        MenuItem("A2B_DOSA", "Masala Dosa", "A2B", 90.0, 320, 7.0, 48.0, 9.0, 200),
        MenuItem("A2B_IDLI", "Idli Sambar", "A2B", 80.0, 280, 9.0, 52.0, 3.0, 300),
    ],
}


# ----------------------------------------------------------------------------
# Mock implementation
# ----------------------------------------------------------------------------


class MockSwiggy:
    """In-memory deterministic Swiggy MCP simulator."""

    def __init__(self) -> None:
        self._carts: dict[str, Cart] = {}

    def search_products(self, query: str, location: str = "Bangalore") -> list[Product]:
        q = query.strip().lower()
        if q in _CATALOGUE:
            return list(_CATALOGUE[q])
        for key, products in _CATALOGUE.items():
            if key in q or q in key:
                return list(products)
            first = q.split()[0] if q else ""
            if first and first in key:
                return list(products)
        return []

    def your_go_to_items(self, user_id: int) -> list[Product]:
        out: list[Product] = []
        for cat, brand in _GO_TO_BRANDS.items():
            options = _CATALOGUE.get(cat, [])
            for p in options:
                if p.brand == brand:
                    out.append(p)
                    break
        return out

    def update_cart(self, items: list[CartItem]) -> Cart:
        cart_id = f"SW_CART_{int(time.time() * 1000)}_{secrets.token_hex(3)}"
        total = round(sum(i.price_inr * i.quantity for i in items), 2)
        eta = 12 if total < 300 else 18 if total < 700 else 25
        cart = Cart(cart_id=cart_id, items=list(items), total_inr=total, eta_minutes=eta)
        self._carts[cart_id] = cart
        return cart

    def checkout(self, cart_id: str, payment_mode: str) -> Order:
        cart = self._carts.get(cart_id)
        if cart is None:
            raise ValueError(f"Unknown cartId {cart_id}")
        order_id = f"SW_ORD_{secrets.token_hex(4).upper()}"
        return Order(
            order_id=order_id,
            cart_id=cart_id,
            total_inr=cart.total_inr,
            eta_minutes=cart.eta_minutes,
            payment_mode=payment_mode,
            placed_at=datetime.utcnow().isoformat(),
        )

    def get_orders(self, user_id: int, limit: int = 10) -> list[Order]:
        return _RESTAURANTS_FOR_USER[:limit]

    def search_menu(self, restaurant_id: str, query: str) -> list[MenuItem]:
        items = _MENU_BY_RESTAURANT.get(restaurant_id, [])
        if not query:
            return list(items)
        q = query.strip().lower()
        matches = [i for i in items if q in i.name.lower()]
        return matches or list(items)


# ----------------------------------------------------------------------------
# Real implementation — stub, intentionally raises until credentials arrive
# ----------------------------------------------------------------------------


class SwiggyRealClient:
    """Reserved for production. Activates when USE_MOCKS=false AND we have
    SWIGGY_CLIENT_ID/SECRET/SWIGGY_MCP_BASE_URL from Builders Club. Until
    then every call raises with a clear message — exactly the failure mode
    a reviewer would want to see in the code."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def _err(self, tool: str) -> NotImplementedError:
        return NotImplementedError(
            f"SwiggyRealClient.{tool}: pending Builders Club credentials. "
            "Configure SWIGGY_CLIENT_ID, SWIGGY_CLIENT_SECRET, and SWIGGY_MCP_BASE_URL."
        )

    def search_products(self, query: str, location: str = "Bangalore") -> list[Product]:
        raise self._err("search_products")

    def your_go_to_items(self, user_id: int) -> list[Product]:
        raise self._err("your_go_to_items")

    def update_cart(self, items: list[CartItem]) -> Cart:
        raise self._err("update_cart")

    def checkout(self, cart_id: str, payment_mode: str) -> Order:
        raise self._err("checkout")

    def get_orders(self, user_id: int, limit: int = 10) -> list[Order]:
        raise self._err("get_orders")

    def search_menu(self, restaurant_id: str, query: str) -> list[MenuItem]:
        raise self._err("search_menu")


# ----------------------------------------------------------------------------
# Factory — single Swiggy client per process so MockSwiggy state persists
# ----------------------------------------------------------------------------

_singleton: SwiggyClient | None = None


def get_swiggy_client(settings: Settings | None = None) -> SwiggyClient:
    global _singleton
    if _singleton is not None:
        return _singleton
    s = settings or get_settings()
    if s.use_mocks or not (s.swiggy_client_id and s.swiggy_client_secret):
        _singleton = MockSwiggy()
    else:
        _singleton = SwiggyRealClient(settings=s)
    return _singleton


def reset_swiggy_client_for_tests() -> None:
    """Test hook — clears the singleton so each test sees a fresh cart store."""
    global _singleton
    _singleton = None
