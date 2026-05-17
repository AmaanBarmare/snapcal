import { useFocusEffect, router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/Button";
import MacroBar from "@/components/MacroBar";
import PoweredBySwiggy from "@/components/PoweredBySwiggy";
import Ring from "@/components/Ring";
import { DashboardTodayResponse, getToday } from "@/lib/api";
import { colors, radius, shadow, spacing } from "@/lib/theme";
import { useSessionStore } from "@/store/sessionStore";

function formatTime(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export default function TodayScreen() {
  const { onboardedAt, hydrating } = useSessionStore();
  const [today, setToday] = useState<DashboardTodayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getToday();
      setToday(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!hydrating && !onboardedAt) {
      router.push("/onboarding");
    }
  }, [hydrating, onboardedAt]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  if (loading || !today) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  const date = new Date(today.date).toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          load();
        }} />}
      >
        <View style={styles.header}>
          <Text style={styles.dateLabel}>Today</Text>
          <Text style={styles.dateValue}>{date}</Text>
        </View>

        <View style={[styles.card, styles.ringCard]}>
          <Ring
            value={today.totals.calories}
            target={today.targets.calories}
            label="kcal eaten"
            subLabel={`of ${today.targets.calories}`}
          />
          <View style={styles.macros}>
            <MacroBar
              label="Protein"
              value={today.totals.proteinG}
              target={today.targets.proteinG}
              color={colors.ringProtein}
            />
            <MacroBar
              label="Carbs"
              value={today.totals.carbsG}
              target={today.targets.carbsG}
              color={colors.ringCarbs}
            />
            <MacroBar
              label="Fat"
              value={today.totals.fatG}
              target={today.targets.fatG}
              color={colors.ringFat}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meals today</Text>
          {today.meals.length === 0 ? (
            <View style={[styles.card, styles.empty]}>
              <Text style={styles.emptyTitle}>Nothing logged yet</Text>
              <Text style={styles.emptyBody}>
                Open the Snap tab and point your camera at your meal. SnapCal does the rest.
              </Text>
              <Button label="Open camera" onPress={() => router.push("/(tabs)")} style={{ marginTop: spacing.md }} />
            </View>
          ) : (
            today.meals.map((m) => (
              <View key={m.id} style={[styles.card, styles.mealRow]}>
                <View style={{ flex: 1 }}>
                  <View style={styles.mealHead}>
                    <Text style={styles.mealName}>{m.dishName}</Text>
                    {m.isPlanned ? (
                      <View style={styles.plannedBadge}>
                        <Text style={styles.plannedBadgeText}>PLANNED</Text>
                      </View>
                    ) : null}
                    {m.source === "mode1" || m.swiggyOrderId ? (
                      <PoweredBySwiggy compact />
                    ) : null}
                  </View>
                  <Text style={styles.mealMeta}>
                    {formatTime(m.timestamp)} · {Math.round(m.servingGrams)}g
                  </Text>
                </View>
                <View style={styles.mealNumbers}>
                  <Text style={styles.mealKcal}>{Math.round(m.calories)}</Text>
                  <Text style={styles.mealKcalLabel}>kcal</Text>
                  <Text style={styles.mealProtein}>P {Math.round(m.proteinG)}g</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    marginBottom: spacing.lg,
  },
  dateLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  dateValue: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    marginTop: 2,
  },

  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  ringCard: {
    alignItems: "center",
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  macros: {
    width: "100%",
    marginTop: spacing.xl,
  },

  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },

  empty: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  emptyBody: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 20,
  },

  mealRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  mealHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  mealName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  mealMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  mealNumbers: {
    alignItems: "flex-end",
    marginLeft: spacing.md,
  },
  mealKcal: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    lineHeight: 24,
  },
  mealKcalLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  mealProtein: {
    fontSize: 12,
    color: colors.ringProtein,
    fontWeight: "700",
    marginTop: 4,
  },

  plannedBadge: {
    backgroundColor: colors.brandAccentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  plannedBadgeText: {
    fontSize: 10,
    color: colors.brandAccent,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
