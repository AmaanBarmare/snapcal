from app.db.models import User
from app.db.seed import DEMO_USER_PROFILE, ensure_demo_user


def test_demo_user_matches_seed_profile(db_session):
    ensure_demo_user()
    user = db_session.query(User).filter(User.id == 1).first()
    assert user is not None
    assert user.email == DEMO_USER_PROFILE["email"]
    assert user.goal == DEMO_USER_PROFILE["goal"]
    assert user.weight_kg == DEMO_USER_PROFILE["weight_kg"]
    assert user.activity_level == DEMO_USER_PROFILE["activity_level"]
    assert user.daily_calorie_target == DEMO_USER_PROFILE["daily_calorie_target"]
    assert user.daily_protein_target_g == DEMO_USER_PROFILE["daily_protein_target_g"]
    assert user.daily_carbs_target_g == DEMO_USER_PROFILE["daily_carbs_target_g"]
    assert user.daily_fat_target_g == DEMO_USER_PROFILE["daily_fat_target_g"]
    assert user.onboarded_at is not None
