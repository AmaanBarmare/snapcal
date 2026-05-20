import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "@/components/AppHeader";
import Button from "@/components/Button";
import Card from "@/components/Card";
import MealListCard from "@/components/MealListCard";
import { getHistory } from "@/lib/api";
import { colors, spacing, type } from "@/lib/theme";

interface Item {
  id: number;
  timestamp: string;
  dishName: string;
  calories: number;
  proteinG: number;
  source: string;
  isPlanned: boolean;
}

export default function HistoryScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      setError(null);
      getHistory(14)
        .then((r) => {
          if (!cancelled) setItems(r.meals);
        })
        .catch(() => {
          if (!cancelled) {
            setError(
              "Can't reach the SnapCal backend. Make sure it's running on port 8000 and your phone is on the same Wi‑Fi."
            );
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [reloadKey])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator color={colors.primaryContainer} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Card style={styles.errorCard}>
          <Text style={styles.errorTitle}>Backend unreachable</Text>
          <Text style={styles.errorBody}>{error}</Text>
          <Button label="Retry" onPress={() => setReloadKey((k) => k + 1)} />
        </Card>
      </SafeAreaView>
    );
  }

  const grouped: Record<string, Item[]> = {};
  for (const m of items) {
    const day = new Date(m.timestamp).toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    grouped[day] = grouped[day] ?? [];
    grouped[day].push(m);
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.subtitle}>Last 14 days</Text>

        {items.length === 0 ? (
          <Card style={styles.empty}>
            <Text style={styles.emptyTitle}>No meals yet</Text>
            <Text style={styles.emptyBody}>
              Snap meals on the Snap tab and they'll appear here.
            </Text>
          </Card>
        ) : (
          Object.entries(grouped).map(([day, list]) => (
            <View key={day} style={{ marginTop: spacing.lg }}>
              <Text style={styles.day}>{day}</Text>
              {list.map((m) => (
                <MealListCard key={m.id} meal={m} />
              ))}
            </View>
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
  subtitle: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  day: {
    ...type.labelCaps,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
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
