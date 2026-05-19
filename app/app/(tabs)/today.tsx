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

import AppHeader from "@/components/AppHeader";
import Button from "@/components/Button";
import Card from "@/components/Card";
import MacroMiniRing from "@/components/MacroMiniRing";
import PoweredBySwiggy from "@/components/PoweredBySwiggy";
import Ring from "@/components/Ring";
import { DashboardTodayResponse, getToday } from "@/lib/api";
import { colors, radius, spacing, type } from "@/lib/theme";
import { useSessionStore } from "@/store/sessionStore";

function formatTime(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

function mealPeriod(ts: string): string {
  const h = new Date(ts).getHours();
  if (h < 11) return "BREAKFAST";
  if (h < 16) return "LUNCH";
  if (h < 18) return "SNACK";
  return "DINNER";
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
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator color={colors.primaryContainer} />
      </SafeAreaView>
    );
  }

  const date = new Date(today.date).toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <AppHeader />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.primaryContainer}
          />
        }
      >
        <View style={styles.dateBlock}>
          <Text style={styles.dateTitle}>{date}</Text>
          <Text style={styles.dateSub}>You're on track!</Text>
        </View>

        <View style={styles.ringWrap}>
          <Ring
            value={today.totals.calories}
            target={today.targets.calories}
            subLabel={`/ ${today.targets.calories.toLocaleString("en-IN")} kcal`}
          />
        </View>

        <View style={styles.macroGrid}>
          <Card style={styles.macroCard}>
            <MacroMiniRing
              label="Protein"
              value={today.totals.proteinG}
              target={today.targets.proteinG}
              color={colors.ringProtein}
            />
          </Card>
          <Card style={styles.macroCard}>
            <MacroMiniRing
              label="Carbs"
              value={today.totals.carbsG}
              target={today.targets.carbsG}
              color={colors.ringCarbs}
            />
          </Card>
          <Card style={styles.macroCard}>
            <MacroMiniRing
              label="Fat"
              value={today.totals.fatG}
              target={today.targets.fatG}
              color={colors.ringFat}
            />
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Today's meals</Text>

        {today.meals.length === 0 ? (
          <Card style={styles.empty}>
            <Text style={styles.emptyTitle}>Nothing logged yet</Text>
            <Text style={styles.emptyBody}>
              Open the Snap tab and point your camera at your meal.
            </Text>
            <Button
              label="Open camera"
              onPress={() => router.push("/(tabs)")}
              style={{ marginTop: spacing.lg, alignSelf: "stretch" }}
            />
          </Card>
        ) : (
          today.meals.map((m) => (
            <Card key={m.id} style={styles.mealCard}>
              <View style={styles.mealThumb}>
                <Text style={styles.mealThumbEmoji}>🍽</Text>
              </View>
              <View style={styles.mealBody}>
                <Text style={styles.mealMeta}>
                  {mealPeriod(m.timestamp)} • {formatTime(m.timestamp)}
                </Text>
                <Text style={styles.mealName} numberOfLines={2}>
                  {m.dishName}
                </Text>
                {m.source === "mode1" || m.swiggyOrderId ? (
                  <PoweredBySwiggy compact />
                ) : null}
              </View>
              <View style={styles.mealKcal}>
                <Text style={styles.mealKcalNum}>{Math.round(m.calories)}</Text>
                <Text style={styles.mealKcalUnit}>kcal</Text>
              </View>
            </Card>
          ))
        )}
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
  },
  scroll: {
    paddingHorizontal: spacing.gridMargin,
    paddingBottom: 120,
  },
  dateBlock: {
    alignItems: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  dateTitle: {
    ...type.headlineMd,
    color: colors.onSurface,
  },
  dateSub: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  ringWrap: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  macroGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  macroCard: {
    flex: 1,
    padding: spacing.md,
    alignItems: "center",
  },
  sectionTitle: {
    ...type.headlineMd,
    color: colors.onSurface,
    marginBottom: spacing.lg,
  },
  empty: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...type.headlineMd,
    color: colors.onSurface,
  },
  emptyBody: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  mealCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  mealThumb: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  mealThumbEmoji: {
    fontSize: 28,
  },
  mealBody: {
    flex: 1,
    gap: 4,
  },
  mealMeta: {
    ...type.labelCaps,
    color: colors.onSurfaceVariant,
    fontSize: 10,
  },
  mealName: {
    ...type.headlineMd,
    color: colors.onSurface,
    fontSize: 18,
  },
  mealKcal: {
    alignItems: "flex-end",
  },
  mealKcalNum: {
    ...type.macroNumber,
    color: colors.primaryContainer,
    fontSize: 20,
  },
  mealKcalUnit: {
    ...type.labelCaps,
    color: colors.onSurfaceVariant,
    fontSize: 10,
  },
});
