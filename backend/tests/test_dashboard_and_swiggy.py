def test_onboarding_writes_targets(client):
    r = client.post(
        "/api/onboarding",
        json={"user_id": 1, "goal": "maintain", "weight_kg": 72, "activity_level": "lightly_active"},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["targets"]["calories"] > 1500
    assert body["targets"]["proteinG"] > 80


def test_profile_returns_user(client):
    client.post(
        "/api/onboarding",
        json={"user_id": 1, "goal": "gain", "weight_kg": 68, "activity_level": "very_active"},
    )
    r = client.get("/api/profile", params={"user_id": 1})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["displayName"] == "Demo User"
    assert body["goal"] == "gain"
    assert body["weightKg"] == 68
    assert body["targets"]["calories"] > 0
    assert body["onboarded"] is True


def test_profile_missing_user_404(client):
    r = client.get("/api/profile", params={"user_id": 999})
    assert r.status_code == 404


def test_delete_meal_removes_from_today(client):
    client.post(
        "/api/onboarding",
        json={"user_id": 1, "goal": "maintain", "weight_kg": 72, "activity_level": "lightly_active"},
    )
    created = client.post(
        "/api/meallog",
        json={
            "user_id": 1,
            "dish_name": "To Delete",
            "calories": 100,
            "protein_g": 5,
            "carbs_g": 10,
            "fat_g": 2,
        },
    ).json()
    meal_id = created["id"]
    r = client.delete(f"/api/meallog/{meal_id}", params={"user_id": 1})
    assert r.status_code == 200, r.text
    assert r.json()["deleted"] is True
    today = client.get("/api/dashboard/today", params={"user_id": 1}).json()
    assert not any(m["id"] == meal_id for m in today["meals"])


def test_delete_meal_not_found(client):
    r = client.delete("/api/meallog/99999", params={"user_id": 1})
    assert r.status_code == 404


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
