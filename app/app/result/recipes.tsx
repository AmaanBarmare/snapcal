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

import AppHeader from "@/components/AppHeader";
import Card from "@/components/Card";
import PoweredBySwiggy from "@/components/PoweredBySwiggy";
import { Recipe, buildInstamartCart } from "@/lib/api";
import { colors, radius, spacing, type } from "@/lib/theme";

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
  const [selected, setSelected] = useState(0);

  async function chooseRecipe(r: Recipe) {
    if (busy) return;
    if (r.missing_count === 0) {
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
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Recipes for you</Text>
        <Text style={styles.subtitle}>Based on your recent snaps and pantry.</Text>

        <View style={{ alignSelf: "flex-start", marginVertical: spacing.md }}>
          <PoweredBySwiggy compact />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {recipes.map((r, idx) => {
          const isSelected = idx === selected;
          return (
            <Pressable
              key={r.name_english}
              disabled={!!busy}
              onPress={() => {
                setSelected(idx);
                chooseRecipe(r);
              }}
              style={({ pressed }) => [pressed && !busy && { opacity: 0.92 }]}
            >
              <Card
                style={[
                  styles.recipeCard,
                  isSelected && styles.recipeCardSelected,
                  busy === r.name_english && { opacity: 0.6 },
                ]}
              >
                {idx === 0 ? (
                  <View style={styles.bestBadge}>
                    <Text style={styles.bestBadgeText}>BEST MATCH</Text>
                  </View>
                ) : null}

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
                  <Meta label={`${r.cook_time_minutes} min`} />
                  <Meta label={r.difficulty} />
                  <Meta label={`${Math.round(r.protein_per_serving_g)}g protein`} accent />
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
                        <Text style={styles.missBadgeText}>
                          {r.missing_count} from Instamart
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.ingMiss}>
                      {r.ingredients_missing.map((i) => i.name).join(" · ")}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.ingAllSet}>Everything is in your fridge ✓</Text>
                )}

                <View style={styles.cardFoot}>
                  <Text style={styles.cardFootText}>
                    {r.missing_count === 0 ? "Tap to cook" : "Tap to order missing ingredients"}
                  </Text>
                  <Text style={styles.cardFootArrow}>→</Text>
                </View>

                {busy === r.name_english ? (
                  <View style={styles.cardOverlay}>
                    <ActivityIndicator color={colors.onPrimary} />
                    <Text style={styles.overlayText}>Building Instamart cart…</Text>
                  </View>
                ) : null}
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function Meta({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <Text style={[styles.metaLabel, accent && { color: colors.ringProtein }]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.gridMargin,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...type.headlineLg,
    color: colors.onSurface,
    marginTop: spacing.md,
  },
  subtitle: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  error: {
    color: colors.error,
    ...type.bodyMd,
    fontWeight: "600",
    marginTop: spacing.md,
  },
  recipeCard: {
    marginBottom: spacing.lg,
    overflow: "hidden",
  },
  recipeCardSelected: {
    borderWidth: 2,
    borderColor: colors.primaryContainer,
  },
  bestBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderBottomLeftRadius: radius.lg,
    borderTopRightRadius: radius.card - 2,
    zIndex: 1,
  },
  bestBadgeText: {
    ...type.labelCaps,
    color: colors.onPrimary,
    fontSize: 10,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing.sm,
  },
  dish: {
    ...type.headlineMd,
    color: colors.onSurface,
  },
  dishHi: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  kcalBlock: {
    alignItems: "flex-end",
    marginLeft: spacing.md,
  },
  kcal: {
    ...type.macroNumber,
    fontSize: 22,
    color: colors.onSurface,
  },
  kcalLabel: {
    ...type.labelCaps,
    color: colors.onSurfaceVariant,
    fontSize: 10,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  metaLabel: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    fontWeight: "600",
  },
  ingBlock: {
    marginTop: spacing.md,
  },
  ingHead: {
    ...type.labelCaps,
    color: colors.onSurfaceVariant,
    fontSize: 10,
  },
  ingAvail: {
    ...type.bodyMd,
    color: colors.success,
    fontWeight: "600",
    marginTop: 4,
  },
  ingMiss: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  ingAllSet: {
    ...type.bodyMd,
    color: colors.success,
    fontWeight: "700",
    marginTop: spacing.md,
  },
  missHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  missBadge: {
    backgroundColor: colors.secondaryContainer,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  missBadgeText: {
    ...type.labelCaps,
    color: colors.primary,
    fontSize: 10,
  },
  cardFoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainer,
  },
  cardFootText: {
    ...type.bodyMd,
    fontWeight: "700",
    color: colors.onSurface,
  },
  cardFootArrow: {
    fontSize: 18,
    color: colors.onSurface,
    fontWeight: "800",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(36, 25, 18, 0.75)",
    borderRadius: radius.card,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayText: {
    color: colors.onPrimary,
    marginTop: spacing.sm,
    ...type.bodyMd,
    fontWeight: "700",
  },
});
