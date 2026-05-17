def test_onboarding_writes_targets(client):
    r = client.post(
        "/api/onboarding",
        json={"user_id": 1, "goal": "maintain", "weight_kg": 72, "activity_level": "lightly_active"},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["targets"]["calories"] > 1500
    assert body["targets"]["proteinG"] > 80


def test_meallog_and_today(client):
    client.post(
        "/api/onboarding",
        json={"user_id": 1, "goal": "maintain", "weight_kg": 72, "activity_level": "lightly_active"},
    )
    r = client.post(
        "/api/meallog",
        json={
            "user_id": 1,
            "dish_name": "Test Dal",
            "calories": 200,
            "protein_g": 10,
            "carbs_g": 25,
            "fat_g": 5,
        },
    )
    assert r.status_code == 200
    today = client.get("/api/dashboard/today", params={"user_id": 1}).json()
    assert today["onboarded"] is True
    assert any(m["dishName"] == "Test Dal" for m in today["meals"])
    assert today["totals"]["calories"] >= 200


def test_swiggy_get_orders_mocked(client):
    r = client.get("/api/swiggy/orders", params={"user_id": 1})
    assert r.status_code == 200
    orders = r.json()["orders"]
    assert len(orders) > 0
    assert any("Behrouz" in o["restaurant"] for o in orders)


def test_swiggy_menu_nutrition_returns_food_data(client):
    r = client.get("/api/swiggy/menu/nutrition", params={"restaurant_id": "SW_ORD_8821", "dish": "chicken biryani"})
    assert r.status_code == 200
    body = r.json()
    assert body["match"] is not None
    assert body["match"]["calories"] > 0
    assert body["source"] == "swiggy_menu_data"
