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

import { getHistory } from "@/lib/api";
import { colors, radius, shadow, spacing } from "@/lib/theme";

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
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>Last 14 days</Text>

        {items.length === 0 ? (
          <View style={[styles.card, styles.empty]}>
            <Text style={styles.emptyTitle}>No meals yet</Text>
            <Text style={styles.emptyBody}>
              Snap meals on the Snap tab and they'll appear here.
            </Text>
          </View>
        ) : (
          Object.entries(grouped).map(([day, list]) => (
            <View key={day} style={{ marginTop: spacing.lg }}>
              <Text style={styles.day}>{day}</Text>
              {list.map((m) => (
                <View key={m.id} style={styles.card}>
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
                </View>
              ))}
            </View>
          ))
        )}
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
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  day: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    ...shadow.card,
  },
  dish: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  kcal: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  kcalLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },

  empty: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    marginTop: spacing.lg,
    ...shadow.card,
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
  },
});
