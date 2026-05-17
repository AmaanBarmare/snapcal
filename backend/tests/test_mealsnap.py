import base64


def _fake_image(seed: str) -> str:
    return base64.b64encode(seed.encode("utf-8")).decode("ascii")


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
