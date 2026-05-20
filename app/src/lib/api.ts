/**
 * Backend API client.
 *
 * In Expo Go dev, the base URL is derived from the Metro bundler host so it
 * always matches the LAN IP your phone already uses for the QR code. Override
 * with EXPO_PUBLIC_API_URL for production or fixed staging hosts.
 */

import Constants from "expo-constants";
import axios from "axios";
import { Platform } from "react-native";

const BACKEND_PORT = "8000";

function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();

  // Expo Go dev: reuse the same host Metro is served from (e.g. 192.168.1.22).
  if (__DEV__ && Platform.OS !== "web") {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const host = hostUri.split(":")[0];
      return `http://${host}:${BACKEND_PORT}`;
    }
  }

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${BACKEND_PORT}`;
  }

  return `http://localhost:${BACKEND_PORT}`;
}

const baseURL = resolveApiBaseUrl();

export const api = axios.create({
  baseURL,
  timeout: 30_000,
});

export const apiBaseUrl = baseURL;

// ---------------- types ----------------

export interface HealthResponse {
  status: string;
  version: string;
  mocks: boolean;
}

export interface VisionDish {
  name_english: string;
  name_hindi: string;
  serving_grams: number;
  confidence: number;
}

export interface NutritionServing {
  unit: string;
  grams: number;
}

export interface NutritionPayload {
  dish_id: string;
  name_english: string;
  name_hindi: string;
  category: string;
  region: string;
  match_type: string;
  match_confidence: number;
  serving: NutritionServing;
  per_100g: Record<string, number>;
  per_serving: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fibre_g: number;
    sodium_mg: number;
  };
  cooking_method_variance: string;
  notes: string;
}

export interface MealSnapItem {
  vision: VisionDish;
  nutrition: NutritionPayload | null;
}

export interface MealSnapResponse {
  items: MealSnapItem[];
  primary: MealSnapItem | null;
  needs_confirmation: boolean;
  source: string;
}

export interface FridgeIngredient {
  name: string;
  quantity: string;
  confidence: "high" | "medium" | "low";
}

export interface FridgeScanResponse {
  scan_id: number;
  ingredients: FridgeIngredient[];
  timestamp: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
}

export interface Recipe {
  name_english: string;
  name_hindi: string;
  cook_time_minutes: number;
  difficulty: string;
  calories_per_serving: number;
  protein_per_serving_g: number;
  ingredients_available: RecipeIngredient[];
  ingredients_missing: RecipeIngredient[];
  missing_count: number;
}

export interface RecipesResponse {
  ingredients_provided: string[];
  recipes: Recipe[];
  generated_at: string;
}

export interface CartItem {
  productId: string;
  name: string;
  brand: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface BuildCartResponse {
  cartId: number;
  recipeName: string;
  items: CartItem[];
  total: number;
  etaMinutes: number;
  unavailable: string[];
  cartCapInr: number;
  plannedNutrition: { calories: number | null; proteinG: number | null };
}

export interface ConfirmResponse {
  cartId: number;
  confirmationToken: string;
}

export interface CheckoutResponse {
  orderId: string;
  cartId: number;
  total: number;
  etaMinutes: number;
  paymentMode: string;
  placedAt: string;
  codWarning: boolean;
}

export interface SwiggyOrder {
  orderId: string;
  restaurant: string;
  total: number;
  etaMinutes: number;
  paymentMode: string;
  placedAt: string;
}

export interface SwiggyMenuMatch {
  itemId: string;
  name: string;
  restaurant: string;
  price: number;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  servingGrams: number;
}

export interface SwiggyMenuResponse {
  match: SwiggyMenuMatch | null;
  items: SwiggyMenuMatch[];
  source: string;
}

export interface DashboardMeal {
  id: number;
  timestamp: string;
  dishName: string;
  dishNameHindi: string;
  servingGrams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  source: string;
  swiggyOrderId: string | null;
  isPlanned: boolean;
}

export interface UserProfileResponse {
  userId: number;
  displayName: string;
  email: string;
  goal: "lose" | "maintain" | "gain";
  weightKg: number;
  activityLevel: "sedentary" | "lightly_active" | "very_active";
  onboarded: boolean;
  onboardedAt: string | null;
  targets: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  stats: {
    mealsLogged: number;
  };
}

export interface DashboardTodayResponse {
  date: string;
  onboarded: boolean;
  targets: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  totals: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  meals: DashboardMeal[];
}

// ---------------- calls ----------------

export async function health() {
  const r = await api.get<HealthResponse>("/api/health");
  return r.data;
}

export async function postMealSnap(imageB64: string, swiggyHint = false) {
  const r = await api.post<MealSnapResponse>("/api/mealsnap", {
    image_b64: imageB64,
    swiggy_hint: swiggyHint,
  });
  return r.data;
}

export async function postFridgeScan(imageB64: string) {
  const r = await api.post<FridgeScanResponse>("/api/fridgescan", {
    image_b64: imageB64,
  });
  return r.data;
}

export async function postRecipes(ingredients: string[]) {
  const r = await api.post<RecipesResponse>("/api/recipes", {
    ingredients,
  });
  return r.data;
}

export async function postOnboarding(input: {
  goal: "lose" | "maintain" | "gain";
  weight_kg: number;
  activity_level: "sedentary" | "lightly_active" | "very_active";
}) {
  const r = await api.post("/api/onboarding", { user_id: 1, ...input });
  return r.data as {
    userId: number;
    goal: string;
    weightKg: number;
    activityLevel: string;
    targets: {
      calories: number;
      proteinG: number;
      carbsG: number;
      fatG: number;
    };
  };
}

export async function postMealLog(meal: {
  dish_name: string;
  dish_name_hindi?: string;
  serving_grams: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fibre_g?: number;
  source?: string;
  swiggy_order_id?: string | null;
}) {
  const r = await api.post("/api/meallog", { user_id: 1, ...meal });
  return r.data as { id: number; timestamp: string };
}

export async function deleteMeal(mealId: number) {
  const r = await api.delete(`/api/meallog/${mealId}`, {
    params: { user_id: 1 },
  });
  return r.data as { deleted: boolean; id: number };
}

export async function getProfile() {
  const r = await api.get<UserProfileResponse>("/api/profile", {
    params: { user_id: 1 },
  });
  return r.data;
}

export async function getToday() {
  const r = await api.get<DashboardTodayResponse>("/api/dashboard/today", {
    params: { user_id: 1 },
  });
  return r.data;
}

export async function getHistory(days = 7) {
  const r = await api.get("/api/history", { params: { user_id: 1, days } });
  return r.data as {
    days: number;
    meals: Array<{
      id: number;
      timestamp: string;
      dishName: string;
      calories: number;
      proteinG: number;
      source: string;
      isPlanned: boolean;
    }>;
  };
}

export async function buildInstamartCart(args: {
  recipeName: string;
  missingIngredients: string[];
  recipeCalories?: number;
  recipeProtein?: number;
}) {
  const r = await api.post<BuildCartResponse>("/api/instamart/cart", {
    user_id: 1,
    recipe_name: args.recipeName,
    missing_ingredients: args.missingIngredients,
    recipe_calories_per_serving: args.recipeCalories,
    recipe_protein_per_serving_g: args.recipeProtein,
  });
  return r.data;
}

export async function confirmInstamartCart(cartId: number) {
  const r = await api.post<ConfirmResponse>("/api/instamart/confirm", {
    cart_id: cartId,
  });
  return r.data;
}

export async function checkoutInstamart(args: {
  cartId: number;
  confirmationToken: string;
  paymentMode: "UPI" | "COD" | "CARD";
}) {
  const r = await api.post<CheckoutResponse>("/api/instamart/checkout", {
    cart_id: args.cartId,
    confirmation_token: args.confirmationToken,
    payment_mode: args.paymentMode,
  });
  return r.data;
}

export async function getSwiggyOrders() {
  const r = await api.get<{ orders: SwiggyOrder[] }>("/api/swiggy/orders", {
    params: { user_id: 1 },
  });
  return r.data.orders;
}

export async function getSwiggyMenuNutrition(restaurantId: string, dish: string) {
  const r = await api.get<SwiggyMenuResponse>("/api/swiggy/menu/nutrition", {
    params: { restaurant_id: restaurantId, dish },
  });
  return r.data;
}
