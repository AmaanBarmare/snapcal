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
import Card from "@/components/Card";
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

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      getHistory(14)
        .then((r) => {
          if (!cancelled) setItems(r.meals);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator color={colors.primaryContainer} />
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
                <Card key={m.id} style={styles.mealCard}>
                  <View style={styles.mealThumb}>
                    <Text style={{ fontSize: 24 }}>🍽</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dish}>{m.dishName}</Text>
                    <Text style={styles.meta}>
                      {new Date(m.timestamp).toLocaleTimeString("en-IN", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      {" · "}
                      {m.source === "mode1" ? "FridgeScan" : "Meal Snap"}
                      {m.isPlanned ? " · planned" : ""}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.kcal}>{Math.round(m.calories)}</Text>
                    <Text style={styles.kcalLabel}>kcal</Text>
                  </View>
                </Card>
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
  mealCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  mealThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  dish: {
    ...type.headlineMd,
    fontSize: 16,
    color: colors.onSurface,
  },
  meta: {
    ...type.bodyMd,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  kcal: {
    ...type.macroNumber,
    color: colors.primaryContainer,
  },
  kcalLabel: {
    ...type.labelCaps,
    fontSize: 10,
    color: colors.onSurfaceVariant,
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
