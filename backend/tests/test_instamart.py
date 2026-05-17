"""Tests for the gap analyzer + Instamart guardrails (PRD §8)."""

import pytest

from app.adapters.swiggy import MockSwiggy, reset_swiggy_client_for_tests
from app.services.gap_analyzer import CartCapExceeded, build_cart_from_missing


@pytest.fixture(autouse=True)
def _fresh_swiggy():
    reset_swiggy_client_for_tests()
    yield
    reset_swiggy_client_for_tests()


def test_gap_analyzer_prefers_go_to_brands():
    client = MockSwiggy()
    r = build_cart_from_missing(
        client=client,
        user_id=1,
        missing_ingredients=["paneer", "atta", "rice"],
        cart_cap_inr=2000,
    )
    by_name = {i.name.lower(): i for i in r.cart_items}
    # Amul paneer is in `your_go_to_items` → should be picked
    assert any(i.brand == "Amul" and "paneer" in i.name.lower() for i in r.cart_items)
    # Aashirvaad atta is the preferred brand
    assert any(i.brand == "Aashirvaad" for i in r.cart_items)


def test_gap_analyzer_marks_unavailable():
    client = MockSwiggy()
    r = build_cart_from_missing(
        client=client,
        user_id=1,
        missing_ingredients=["paneer", "imaginarium_root"],
        cart_cap_inr=2000,
    )
    assert "imaginarium_root" in r.unavailable
    assert any("paneer" in i.name.lower() for i in r.cart_items)


def test_gap_analyzer_raises_when_over_cap():
    client = MockSwiggy()
    huge = ["atta", "ghee", "rice", "paneer", "dal", "oil", "sugar", "salt", "butter"]
    with pytest.raises(CartCapExceeded):
        build_cart_from_missing(
            client=client,
            user_id=1,
            missing_ingredients=huge,
            cart_cap_inr=200,
        )


def test_build_cart_endpoint_returns_eta_and_items(client):
    r = client.post(
        "/api/instamart/cart",
        json={
            "user_id": 1,
            "recipe_name": "Paneer Bhurji",
            "missing_ingredients": ["paneer", "onions", "tomatoes", "coriander"],
            "recipe_calories_per_serving": 320,
            "recipe_protein_per_serving_g": 18.0,
        },
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["cartId"] > 0
    assert len(body["items"]) >= 3
    assert body["total"] > 0
    assert body["etaMinutes"] > 0
    assert body["cartCapInr"] == 1000


def test_checkout_blocked_without_confirmation_token(client):
    r = client.post(
        "/api/instamart/cart",
        json={
            "user_id": 1,
            "recipe_name": "Aloo Paratha",
            "missing_ingredients": ["atta", "potato"],
        },
    )
    cart_id = r.json()["cartId"]
    bad = client.post(
        "/api/instamart/checkout",
        json={"cart_id": cart_id, "confirmation_token": "FORGED", "payment_mode": "UPI"},
    )
    assert bad.status_code == 403
    assert "guardrail" in bad.json()["detail"].lower()


def test_full_three_step_flow_succeeds(client):
    r = client.post(
        "/api/instamart/cart",
        json={
            "user_id": 1,
            "recipe_name": "Dal Tadka",
            "missing_ingredients": ["toor dal", "onions", "ghee"],
        },
    )
    cart_id = r.json()["cartId"]

    confirm = client.post("/api/instamart/confirm", json={"cart_id": cart_id})
    assert confirm.status_code == 200
    token = confirm.json()["confirmationToken"]
    assert token

    checkout = client.post(
        "/api/instamart/checkout",
        json={"cart_id": cart_id, "confirmation_token": token, "payment_mode": "UPI"},
    )
    assert checkout.status_code == 200, checkout.text
    body = checkout.json()
    assert body["orderId"].startswith("SW_ORD_")
    assert body["codWarning"] is False


def test_checkout_token_is_single_use(client):
    r = client.post(
        "/api/instamart/cart",
        json={
            "user_id": 1,
            "recipe_name": "Poha",
            "missing_ingredients": ["poha", "peanuts"],
        },
    )
    cart_id = r.json()["cartId"]
    token = client.post("/api/instamart/confirm", json={"cart_id": cart_id}).json()[
        "confirmationToken"
    ]
    client.post(
        "/api/instamart/checkout",
        json={"cart_id": cart_id, "confirmation_token": token, "payment_mode": "UPI"},
    )
    second = client.post(
        "/api/instamart/checkout",
        json={"cart_id": cart_id, "confirmation_token": token, "payment_mode": "UPI"},
    )
    assert second.status_code == 409


def test_cod_warning_is_surfaced(client):
    r = client.post(
        "/api/instamart/cart",
        json={
            "user_id": 1,
            "recipe_name": "Egg Bhurji",
            "missing_ingredients": ["eggs", "onions"],
        },
    )
    cart_id = r.json()["cartId"]
    token = client.post("/api/instamart/confirm", json={"cart_id": cart_id}).json()[
        "confirmationToken"
    ]
    checkout = client.post(
        "/api/instamart/checkout",
        json={"cart_id": cart_id, "confirmation_token": token, "payment_mode": "COD"},
    )
    assert checkout.status_code == 200
    assert checkout.json()["codWarning"] is True
