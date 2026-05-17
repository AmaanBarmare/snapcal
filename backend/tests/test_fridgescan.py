import base64


def _fake_image(seed: str) -> str:
    return base64.b64encode(seed.encode("utf-8")).decode("ascii")


def test_fridgescan_returns_ingredients(client):
    r = client.post("/api/fridgescan", json={"image_b64": _fake_image("fridge-1")})
    assert r.status_code == 200, r.text
    body = r.json()
    assert "scan_id" in body
    assert len(body["ingredients"]) >= 5
    assert all("name" in i and "confidence" in i for i in body["ingredients"])


def test_recipes_returns_exactly_three(client):
    r = client.post(
        "/api/recipes",
        json={"ingredients": ["Paneer", "Onions", "Tomatoes", "Coriander", "Salt"]},
    )
    assert r.status_code == 200
    body = r.json()
    assert len(body["recipes"]) == 3


def test_recipes_ordered_by_fewest_missing(client):
    r = client.post(
        "/api/recipes",
        json={
            "ingredients": [
                "Toor dal",
                "Onions",
                "Tomatoes",
                "Garlic",
                "Cumin seeds",
                "Ghee",
                "Turmeric",
                "Salt",
                "Paneer",
                "Green chillies",
                "Coriander",
                "Oil",
            ]
        },
    )
    recipes = r.json()["recipes"]
    missing = [r["missing_count"] for r in recipes]
    assert missing == sorted(missing)


def test_recipes_payload_shape(client):
    r = client.post("/api/recipes", json={"ingredients": ["Paneer", "Onions"]})
    rec = r.json()["recipes"][0]
    for k in (
        "name_english",
        "name_hindi",
        "cook_time_minutes",
        "difficulty",
        "calories_per_serving",
        "protein_per_serving_g",
        "ingredients_available",
        "ingredients_missing",
        "missing_count",
    ):
        assert k in rec, f"missing field {k}"
