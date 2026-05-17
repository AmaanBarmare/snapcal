from app.services.nutrition_lookup import lookup_dish


def test_exact_match_dal_tadka(db_session):
    r = lookup_dish(db_session, "dal tadka")
    assert r is not None
    assert r.dish.dish_id == "IND_001"
    assert r.match_type == "exact"


def test_alias_match_tarka_dal(db_session):
    r = lookup_dish(db_session, "tarka dal")
    assert r is not None
    assert r.dish.dish_id == "IND_001"
    assert r.match_type == "alias"


def test_fuzzy_match_typo(db_session):
    r = lookup_dish(db_session, "dal taka")  # typo of dal tadka
    assert r is not None
    assert r.dish.dish_id == "IND_001"
    assert r.match_type == "fuzzy"
    assert r.confidence >= 80


def test_unknown_dish_returns_none(db_session):
    r = lookup_dish(db_session, "xyzzyhonk")
    assert r is None


def test_category_fallback(db_session):
    r = lookup_dish(db_session, "unknown north indian curry thing", category_hint="dal_curry")
    assert r is not None
    assert r.match_type in {"fuzzy", "category_fallback"}


def test_payload_per_serving_scales_correctly(db_session):
    r = lookup_dish(db_session, "dal tadka", serving_grams=360)
    assert r is not None
    p = r.to_payload()
    assert p["serving"]["grams"] == 360
    # 90 cal/100g * 3.6 = ~324
    assert 315 <= p["per_serving"]["calories"] <= 335
    assert p["cooking_method_variance"] == "low"


def test_lookup_endpoint(client):
    r = client.get("/api/nutrition/lookup", params={"dish": "poha"})
    assert r.status_code == 200
    body = r.json()
    assert body["dish_id"] == "IND_026"
    assert body["name_english"] == "Poha"
    assert "per_serving" in body


def test_lookup_endpoint_404(client):
    r = client.get("/api/nutrition/lookup", params={"dish": "absolutelynotadish"})
    assert r.status_code == 404
