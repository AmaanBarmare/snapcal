import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "@/components/AppHeader";
import Button from "@/components/Button";
import Card from "@/components/Card";
import MacroMiniRing from "@/components/MacroMiniRing";
import PoweredBySwiggy from "@/components/PoweredBySwiggy";
import { MealSnapResponse, postMealLog } from "@/lib/api";
import { colors, radius, spacing, type } from "@/lib/theme";

export default function MealResultScreen() {
  const params = useLocalSearchParams<{
    payload?: string;
    source?: string;
    swiggyOrderId?: string;
    swiggyMatch?: string;
  }>();
  const data = useMemo<MealSnapResponse | null>(() => {
    try {
      return params.payload ? (JSON.parse(params.payload) as MealSnapResponse) : null;
    } catch {
      return null;
    }
  }, [params.payload]);

  const swiggyMatch = useMemo(() => {
    try {
      return params.swiggyMatch ? JSON.parse(params.swiggyMatch) : null;
    } catch {
      return null;
    }
  }, [params.swiggyMatch]);

  const [logged, setLogged] = useState(false);
  const [logging, setLogging] = useState(false);

  if (!data || !data.primary) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errTitle}>Couldn't identify that</Text>
        <Text style={styles.errBody}>Try a clearer shot with better lighting.</Text>
        <Button label="Try again" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </SafeAreaView>
    );
  }

  const primary = data.primary;
  const v = primary.vision;
  const n = primary.nutrition;
  const isSwiggySource = !!swiggyMatch || params.source === "swiggy";
  const calories = swiggyMatch?.calories ?? n?.per_serving.calories ?? 0;
  const proteinG = swiggyMatch?.proteinG ?? n?.per_serving.protein_g ?? 0;
  const carbsG = swiggyMatch?.carbsG ?? n?.per_serving.carbs_g ?? 0;
  const fatG = swiggyMatch?.fatG ?? n?.per_serving.fat_g ?? 0;
  const fibreG = n?.per_serving.fibre_g ?? 0;
  const servingGrams = swiggyMatch?.servingGrams ?? n?.serving.grams ?? v.serving_grams;
  const dishName = swiggyMatch?.name ?? v.name_english;
  const confidence = v.confidence;

  async function logMeal() {
    if (logged || logging) return;
    setLogging(true);
    try {
      await postMealLog({
        dish_name: dishName,
        dish_name_hindi: v.name_hindi,
        serving_grams: servingGrams,
        calories,
        protein_g: proteinG,
        carbs_g: carbsG,
        fat_g: fatG,
        fibre_g: fibreG,
        source: isSwiggySource ? "mode2_swiggy" : "mode2",
        swiggy_order_id: params.swiggyOrderId ?? null,
      });
      setLogged(true);
      setTimeout(() => router.replace("/(tabs)/today"), 600);
    } finally {
      setLogging(false);
    }
  }

  function tryFromSwiggy() {
    router.push({
      pathname: "/swiggy-restaurants",
      params: { dish: v.name_english },
    });
  }

  const confColor =
    confidence >= 80 ? colors.success : confidence >= 50 ? colors.warning : colors.error;

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroHead}>
          <View style={styles.thumb}>
            <Text style={styles.thumbEmoji}>🍽</Text>
          </View>
          <View style={styles.titleRow}>
            <Text style={styles.dish}>{dishName}</Text>
            <View style={[styles.confDot, { backgroundColor: confColor }]} />
          </View>
          {v.name_hindi ? <Text style={styles.dishHi}>{v.name_hindi}</Text> : null}
          <Text style={styles.confLabel}>
            {confidence >= 80 ? "High confidence match" : "Medium confidence match"}
          </Text>
        </View>

        <Card style={styles.nutritionCard}>
          <Text style={styles.kcal}>{Math.round(calories)}</Text>
          <Text style={styles.kcalUnit}>kcal</Text>

          <View style={styles.macroRow}>
            <MacroMiniRing
              label="Protein"
              value={proteinG}
              target={40}
              color={colors.ringProtein}
            />
            <MacroMiniRing
              label="Carbs"
              value={carbsG}
              target={80}
              color={colors.primaryContainer}
            />
            <MacroMiniRing label="Fat" value={fatG} target={30} color={colors.error} />
            <MacroMiniRing
              label="Fibre"
              value={fibreG}
              target={15}
              color={colors.secondary}
            />
          </View>
        </Card>

        {!isSwiggySource && n?.cooking_method_variance === "high" ? (
          <Card style={styles.variance}>
            <Text style={styles.varianceTitle}>Cooking variance: high</Text>
            <Text style={styles.varianceBody}>
              This dish ranges widely by preparation. Showing midpoint estimate.
            </Text>
          </Card>
        ) : null}

        <Button
          label={logged ? "Logged ✓" : logging ? "Logging…" : "Log this meal"}
          onPress={logMeal}
          loading={logging}
          disabled={logged}
          style={{ marginTop: spacing.lg }}
        />
        {!isSwiggySource ? (
          <Button
            label="This is from Swiggy"
            onPress={tryFromSwiggy}
            variant="secondary"
            style={{ marginTop: spacing.sm }}
          />
        ) : null}
        <Pressable onPress={() => router.back()} style={styles.notRight}>
          <Text style={styles.notRightText}>Not right?</Text>
        </Pressable>

        {isSwiggySource ? <PoweredBySwiggy /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.gridMargin,
  },
  errTitle: {
    ...type.headlineLg,
    color: colors.onSurface,
  },
  errBody: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  scroll: {
    paddingHorizontal: spacing.gridMargin,
    paddingBottom: spacing.xxl,
  },
  heroHead: {
    alignItems: "center",
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  thumb: {
    width: 96,
    height: 96,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 4,
    borderColor: colors.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  thumbEmoji: {
    fontSize: 40,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dish: {
    ...type.headlineLg,
    color: colors.onSurface,
    textAlign: "center",
  },
  dishHi: {
    ...type.headlineMd,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  confDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  confLabel: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  nutritionCard: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  kcal: {
    ...type.displayCalories,
    color: colors.primaryContainer,
  },
  kcalUnit: {
    ...type.bodyLg,
    color: colors.onSurfaceVariant,
    marginTop: -4,
    marginBottom: spacing.xl,
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: spacing.xs,
  },
  variance: {
    marginTop: spacing.lg,
    backgroundColor: colors.warningSoft,
  },
  varianceTitle: {
    ...type.labelCaps,
    color: colors.warning,
    fontSize: 11,
  },
  varianceBody: {
    ...type.bodyMd,
    color: colors.warning,
    marginTop: 4,
  },
  notRight: {
    alignSelf: "center",
    marginTop: spacing.lg,
    padding: spacing.sm,
  },
  notRightText: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    textDecorationLine: "underline",
  },
});
