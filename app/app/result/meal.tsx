import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/Button";
import PoweredBySwiggy from "@/components/PoweredBySwiggy";
import {
  MealSnapResponse,
  postMealLog,
} from "@/lib/api";
import { colors, radius, shadow, spacing } from "@/lib/theme";

export default function MealResultScreen() {
  const params = useLocalSearchParams<{ payload?: string; source?: string; swiggyOrderId?: string; swiggyMatch?: string }>();
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
        <Text style={styles.title}>Couldn't identify that</Text>
        <Text style={styles.body}>
          Try a clearer shot with better lighting.
        </Text>
        <Button label="Try again" onPress={() => router.back()} style={{ marginTop: spacing.md }} />
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
  const sourceLabel = isSwiggySource ? "Nutrition from Swiggy menu data" : "From SnapCal Indian food DB";

  async function logMeal() {
    if (logged || logging) return;
    setLogging(true);
    try {
      await postMealLog({
        dish_name: swiggyMatch?.name ?? v.name_english,
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.cap}>MEAL IDENTIFIED</Text>
        <Text style={styles.dish}>{swiggyMatch?.name ?? v.name_english}</Text>
        {v.name_hindi ? <Text style={styles.dishHi}>{v.name_hindi}</Text> : null}

        <View style={styles.confRow}>
          <ConfidenceDot value={v.confidence} />
          <Text style={styles.confText}>{Math.round(v.confidence)}% confidence</Text>
          <Text style={styles.sep}>·</Text>
          <Text style={styles.confText}>~{Math.round(servingGrams)}g serving</Text>
        </View>

        <View style={[styles.card, styles.heroCard]}>
          <Text style={styles.kcal}>{Math.round(calories)}</Text>
          <Text style={styles.kcalLabel}>kcal per serving</Text>

          <View style={styles.macroGrid}>
            <Macro label="Protein" value={proteinG} unit="g" color={colors.ringProtein} />
            <Macro label="Carbs" value={carbsG} unit="g" color={colors.ringCarbs} />
            <Macro label="Fat" value={fatG} unit="g" color={colors.ringFat} />
            <Macro label="Fibre" value={fibreG} unit="g" color={colors.textMuted} />
          </View>

          <View style={styles.sourceRow}>
            {isSwiggySource ? <PoweredBySwiggy compact /> : null}
            <Text style={styles.sourceText}>{sourceLabel}</Text>
          </View>
        </View>

        {!isSwiggySource && n?.cooking_method_variance === "high" ? (
          <View style={styles.varianceCard}>
            <Text style={styles.varianceTitle}>Cooking variance: high</Text>
            <Text style={styles.varianceBody}>
              This dish ranges widely by preparation. Showing midpoint estimate.
            </Text>
          </View>
        ) : null}

        <Button
          label={logged ? "Logged ✓" : logging ? "Logging…" : "Log this meal"}
          onPress={logMeal}
          loading={logging}
          disabled={logged}
        />
        {!isSwiggySource ? (
          <Button
            label="This is from Swiggy"
            onPress={tryFromSwiggy}
            variant="secondary"
            style={{ marginTop: spacing.sm }}
          />
        ) : null}
        <Button label="Not right? Try again" onPress={() => router.back()} variant="ghost" />
      </ScrollView>
    </SafeAreaView>
  );
}

function ConfidenceDot({ value }: { value: number }) {
  const color = value >= 80 ? colors.success : value >= 50 ? colors.warning : colors.danger;
  return <View style={[s.dot, { backgroundColor: color }]} />;
}

const s = StyleSheet.create({
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

function Macro({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <View style={styles.macroItem}>
      <View style={[styles.macroDot, { backgroundColor: color }]} />
      <View>
        <Text style={styles.macroValue}>
          {Math.round(value)}
          <Text style={styles.macroUnit}>{unit}</Text>
        </Text>
        <Text style={styles.macroLabel}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  body: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
  },

  cap: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  dish: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
    marginTop: spacing.xs,
  },
  dishHi: {
    fontSize: 20,
    color: colors.textMuted,
    fontWeight: "600",
    marginTop: 2,
  },

  confRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  confText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "600",
  },
  sep: {
    color: colors.textMuted,
  },

  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    ...shadow.card,
  },
  heroCard: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  kcal: {
    fontSize: 72,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -2,
    lineHeight: 76,
  },
  kcalLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "600",
    marginTop: 2,
  },

  macroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  macroItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minWidth: "45%",
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },
  macroUnit: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "700",
  },
  macroLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  sourceRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sourceText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
  },

  varianceCard: {
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  varianceTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.warning,
  },
  varianceBody: {
    fontSize: 12,
    color: colors.warning,
    marginTop: 2,
  },
});
