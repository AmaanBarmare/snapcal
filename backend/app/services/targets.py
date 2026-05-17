"""Simple Mifflin-St Jeor-ish daily target calculator for the 3-question onboarding."""

from __future__ import annotations

from dataclasses import dataclass

GOAL = {"lose": -300, "maintain": 0, "gain": 350}
ACTIVITY = {"sedentary": 1.35, "lightly_active": 1.5, "very_active": 1.7}


@dataclass(frozen=True)
class DailyTargets:
    calories: int
    protein_g: int
    carbs_g: int
    fat_g: int


def compute_targets(*, goal: str, weight_kg: float, activity_level: str) -> DailyTargets:
    base = 22 * weight_kg + 500  # rough resting expenditure proxy
    mult = ACTIVITY.get(activity_level, 1.5)
    delta = GOAL.get(goal, 0)
    cal = int(round(base * mult + delta, -1))
    protein = int(round(weight_kg * 1.6))
    fat = int(round(cal * 0.25 / 9))
    carbs = int(round((cal - protein * 4 - fat * 9) / 4))
    return DailyTargets(calories=cal, protein_g=protein, carbs_g=carbs, fat_g=fat)
