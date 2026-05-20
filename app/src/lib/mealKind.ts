import type { DashboardMeal } from "@/lib/api";

export type MealKind = "fridgescan" | "mealsnap";

export function getMealKind(
  meal: Pick<DashboardMeal, "source" | "isPlanned">
): MealKind {
  if (meal.isPlanned || meal.source === "mode1") {
    return "fridgescan";
  }
  return "mealsnap";
}

export function isFridgeScanMeal(
  meal: Pick<DashboardMeal, "source" | "isPlanned">
): boolean {
  return getMealKind(meal) === "fridgescan";
}
