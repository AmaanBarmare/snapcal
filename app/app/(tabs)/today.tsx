import { useFocusEffect, router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "@/components/AppHeader";
import Button from "@/components/Button";
import Card from "@/components/Card";
import MacroMiniRing from "@/components/MacroMiniRing";
import MealListCard from "@/components/MealListCard";
import Ring from "@/components/Ring";
import { DashboardTodayResponse, deleteMeal, getToday } from "@/lib/api";
import { getMealKind } from "@/lib/mealKind";
import { colors, radius, spacing, type } from "@/lib/theme";
import { useSessionStore } from "@/store/sessionStore";

export default function TodayScreen() {
  const { onboardedAt, hydrating } = useSessionStore();
  const [today, setToday] = useState<DashboardTodayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getToday();
      setToday(data);
    } catch {
      setError(
        "Can't reach the SnapCal backend. Make sure it's running on port 8000 and your phone is on the same Wi‑Fi."
      );
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

  const confirmDelete = useCallback(
    (mealId: number, dishName: string) => {
      Alert.alert(
        "Remove from Today?",
        `Remove "${dishName}" from today's log?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              setDeletingId(mealId);
              try {
                await deleteMeal(mealId);
                await load();
              } catch {
                Alert.alert(
                  "Couldn't remove",
                  "Check that the backend is running and try again."
                );
              } finally {
                setDeletingId(null);
              }
            },
          },
        ]
      );
    },
    [load]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator color={colors.primaryContainer} />
      </SafeAreaView>
    );
  }

  if (error || !today) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Card style={styles.errorCard}>
          <Text style={styles.errorTitle}>Backend unreachable</Text>
          <Text style={styles.errorBody}>{error ?? "Something went wrong."}</Text>
          <Button label="Retry" onPress={() => { setLoading(true); load(); }} />
        </Card>
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
        <Text style={styles.sectionHint}>
          Swipe left on a card to delete · FridgeScan = planned · Meal Snap = logged
        </Text>

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
          <>
            {today.meals.some((m) => getMealKind(m) === "fridgescan") ? (
              <Text style={styles.subsectionTitle}>Planned (FridgeScan)</Text>
            ) : null}
            {today.meals
              .filter((m) => getMealKind(m) === "fridgescan")
              .map((m) => (
                <MealListCard
                  key={m.id}
                  meal={m}
                  onDelete={() => confirmDelete(m.id, m.dishName)}
                  deleting={deletingId === m.id}
                />
              ))}

            {today.meals.some((m) => getMealKind(m) === "mealsnap") ? (
              <Text
                style={[
                  styles.subsectionTitle,
                  today.meals.some((m) => getMealKind(m) === "fridgescan") &&
                    styles.subsectionTitleSpaced,
                ]}
              >
                Logged (Meal Snap)
              </Text>
            ) : null}
            {today.meals
              .filter((m) => getMealKind(m) === "mealsnap")
              .map((m) => (
                <MealListCard
                  key={m.id}
                  meal={m}
                  onDelete={() => confirmDelete(m.id, m.dishName)}
                  deleting={deletingId === m.id}
                />
              ))}
          </>
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
    paddingHorizontal: spacing.gridMargin,
  },
  errorCard: {
    width: "100%",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  errorTitle: {
    ...type.headlineMd,
    color: colors.onSurface,
  },
  errorBody: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
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
    marginBottom: spacing.sm,
  },
  sectionHint: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  subsectionTitle: {
    ...type.labelCaps,
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginBottom: spacing.sm,
  },
  subsectionTitleSpaced: {
    marginTop: spacing.lg,
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
});
