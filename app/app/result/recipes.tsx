import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PoweredBySwiggy from "@/components/PoweredBySwiggy";
import { Recipe, buildInstamartCart } from "@/lib/api";
import { colors, radius, shadow, spacing } from "@/lib/theme";

export default function RecipesScreen() {
  const params = useLocalSearchParams<{ ingredients?: string; recipes?: string }>();
  const recipes = useMemo<Recipe[]>(() => {
    try {
      return params.recipes ? (JSON.parse(params.recipes) as Recipe[]) : [];
    } catch {
      return [];
    }
  }, [params.recipes]);

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function chooseRecipe(r: Recipe) {
    if (busy) return;
    if (r.missing_count === 0) {
      // nothing to order — head straight to "let's cook" by logging planned meal
      router.push({
        pathname: "/result/instamart",
        params: {
          payload: JSON.stringify({
            recipeName: r.name_english,
            items: [],
            total: 0,
            etaMinutes: 0,
            unavailable: [],
            cartCapInr: 1000,
            plannedNutrition: {
              calories: r.calories_per_serving,
              proteinG: r.protein_per_serving_g,
            },
            cartId: 0,
            skipOrder: true,
          }),
        },
      });
      return;
    }
    setBusy(r.name_english);
    setError(null);
    try {
      const cart = await buildInstamartCart({
        recipeName: r.name_english,
        missingIngredients: r.ingredients_missing.map((m) => m.name),
        recipeCalories: r.calories_per_serving,
        recipeProtein: r.protein_per_serving_g,
      });
      router.push({
        pathname: "/result/instamart",
        params: { payload: JSON.stringify(cart) },
      });
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? "Could not build cart.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.cap}>3 RECIPES YOU CAN MAKE</Text>
        <Text style={styles.title}>Ranked by fewest missing</Text>

        <View style={{ alignItems: "flex-start", marginTop: spacing.sm }}>
          <PoweredBySwiggy compact />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {recipes.map((r) => (
          <Pressable
            key={r.name_english}
            disabled={!!busy}
            onPress={() => chooseRecipe(r)}
            style={({ pressed }) => [
              styles.card,
              pressed && !busy && { opacity: 0.9 },
              busy === r.name_english && { opacity: 0.6 },
            ]}
          >
            <View style={styles.cardHead}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dish}>{r.name_english}</Text>
                {r.name_hindi ? <Text style={styles.dishHi}>{r.name_hindi}</Text> : null}
              </View>
              <View style={styles.kcalBlock}>
                <Text style={styles.kcal}>{r.calories_per_serving}</Text>
                <Text style={styles.kcalLabel}>kcal</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Meta icon="◔" label={`${r.cook_time_minutes} min`} />
              <Meta icon="◆" label={r.difficulty} />
              <Meta icon="◉" label={`${Math.round(r.protein_per_serving_g)}g protein`} color={colors.ringProtein} />
            </View>

            <View style={styles.ingBlock}>
              <Text style={styles.ingHead}>You have</Text>
              <Text style={styles.ingAvail}>
                {r.ingredients_available.length > 0
                  ? r.ingredients_available.map((i) => i.name).join(" · ")
                  : "—"}
              </Text>
            </View>

            {r.ingredients_missing.length > 0 ? (
              <View style={styles.ingBlock}>
                <View style={styles.missHead}>
                  <Text style={styles.ingHead}>You'll need</Text>
                  <View style={styles.missBadge}>
                    <Text style={styles.missBadgeText}>{r.missing_count} from Instamart</Text>
                  </View>
                </View>
                <Text style={styles.ingMiss}>
                  {r.ingredients_missing.map((i) => i.name).join(" · ")}
                </Text>
              </View>
            ) : (
              <View style={styles.ingBlock}>
                <Text style={styles.ingAllSet}>Everything you need is in your fridge ✓</Text>
              </View>
            )}

            <View style={styles.cardFoot}>
              <Text style={styles.cardFootText}>
                {r.missing_count === 0 ? "Tap to cook" : "Tap to order missing ingredients"}
              </Text>
              <Text style={styles.cardFootArrow}>→</Text>
            </View>

            {busy === r.name_english ? (
              <View style={styles.cardOverlay}>
                <ActivityIndicator color="#fff" />
                <Text style={{ color: "#fff", marginTop: spacing.sm, fontWeight: "700" }}>
                  Building Instamart cart…
                </Text>
              </View>
            ) : null}
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Meta({ icon, label, color }: { icon: string; label: string; color?: string }) {
  return (
    <View style={styles.meta}>
      <Text style={[styles.metaIcon, color && { color }]}>{icon}</Text>
      <Text style={[styles.metaLabel, color && { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cap: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    marginTop: spacing.xs,
  },
  error: {
    color: colors.danger,
    fontWeight: "600",
    marginTop: spacing.md,
  },

  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    ...shadow.card,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  dish: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  dishHi: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: "600",
    marginTop: 2,
  },
  kcalBlock: {
    alignItems: "flex-end",
    marginLeft: spacing.md,
  },
  kcal: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    lineHeight: 28,
  },
  kcalLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaIcon: {
    fontSize: 13,
    color: colors.textMuted,
  },
  metaLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "600",
  },

  ingBlock: {
    marginTop: spacing.md,
  },
  ingHead: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  ingAvail: {
    fontSize: 13,
    color: colors.success,
    fontWeight: "600",
    marginTop: 4,
    lineHeight: 18,
  },
  ingMiss: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "500",
    marginTop: 4,
    lineHeight: 18,
  },
  ingAllSet: {
    fontSize: 13,
    color: colors.success,
    fontWeight: "700",
    marginTop: 4,
  },

  missHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  missBadge: {
    backgroundColor: colors.brandAccentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  missBadgeText: {
    fontSize: 11,
    color: colors.brandAccent,
    fontWeight: "800",
  },

  cardFoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cardFootText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  cardFootArrow: {
    fontSize: 18,
    color: colors.text,
    fontWeight: "800",
  },

  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,16,20,0.7)",
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
});
