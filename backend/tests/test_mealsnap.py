import base64
from pathlib import Path

from app.db.seed import seed_indian_dishes


def _fake_image(seed: str) -> str:
    return base64.b64encode(seed.encode("utf-8")).decode("ascii")


def _large_demo_image() -> str:
    """Simulates a high-res phone photo (packaged pizza box demo)."""
    return "x" * 250_000


def _pizza_box_image() -> str | None:
    asset = Path.home() / ".cursor/projects/Users-amaanbarmare-Desktop-snapcal/assets/IMG_3703-d78e877d-1da6-4204-b8f0-424a76424fab.png"
    if not asset.exists():
        return None
    return base64.b64encode(asset.read_bytes()).decode("ascii")


def test_mealsnap_returns_dish_and_nutrition(client):
    r = client.post("/api/mealsnap", json={"image_b64": _fake_image("a"), "swiggy_hint": False})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["primary"] is not None
    v = body["primary"]["vision"]
    assert v["name_english"]
    assert isinstance(v["confidence"], float)
    n = body["primary"]["nutrition"]
    assert n is not None
    assert n["per_serving"]["calories"] > 0


def test_mealsnap_is_deterministic_per_image(client):
    img = _fake_image("dal-tadka-bytes")
    r1 = client.post("/api/mealsnap", json={"image_b64": img})
    r2 = client.post("/api/mealsnap", json={"image_b64": img})
    assert r1.json()["primary"]["vision"]["name_english"] == r2.json()["primary"]["vision"]["name_english"]


def test_mealsnap_swiggy_hint_changes_source(client):
    r = client.post(
        "/api/mealsnap", json={"image_b64": _fake_image("b"), "swiggy_hint": True}
    )
    assert r.json()["source"] == "swiggy_menu_data"


def test_mealsnap_empty_image_rejected(client):
    r = client.post("/api/mealsnap", json={"image_b64": ""})
    assert r.status_code == 422


def test_mealsnap_upload_size_limit(client):
    big = b"x" * (11 * 1024 * 1024)
    r = client.post("/api/mealsnap/upload", files={"image": ("big.jpg", big, "image/jpeg")})
    assert r.status_code == 413


def test_mealsnap_mushroom_pizza_whole_pie(client, db_session):
    seed_indian_dishes()
    img = _large_demo_image()
    r = client.post("/api/mealsnap", json={"image_b64": img, "swiggy_hint": False})
    assert r.status_code == 200, r.text
    body = r.json()
    assert len(body["items"]) == 1
    v = body["primary"]["vision"]
    n = body["primary"]["nutrition"]
    assert v["name_english"] == "Mushroom Pizza"
    assert v["serving_grams"] == 398
    assert n["dish_id"] == "IND_101"
    assert n["per_serving"]["calories"] == 840
    assert n["serving"]["unit"] == "whole pizza"
    assert n["serving"]["grams"] == 398


def test_mealsnap_mushroom_pizza_asset_image(client, db_session):
    seed_indian_dishes()
    img = _pizza_box_image()
    if img is None:
        return
    r = client.post("/api/mealsnap", json={"image_b64": img, "swiggy_hint": False})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["primary"]["vision"]["name_english"] == "Mushroom Pizza"
    assert body["primary"]["nutrition"]["per_serving"]["calories"] == 840
