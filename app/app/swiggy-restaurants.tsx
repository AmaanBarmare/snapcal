import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
import {
  SwiggyOrder,
  getSwiggyMenuNutrition,
  getSwiggyOrders,
  postMealSnap,
} from "@/lib/api";
import { colors, radius, shadow, spacing } from "@/lib/theme";

export default function SwiggyRestaurantsScreen() {
  const params = useLocalSearchParams<{ dish?: string }>();
  const dish = params.dish ?? "";

  const [orders, setOrders] = useState<SwiggyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSwiggyOrders()
      .then(setOrders)
      .catch((e) => setError(e?.message ?? "Could not load orders."))
      .finally(() => setLoading(false));
  }, []);

  async function pick(o: SwiggyOrder) {
    if (busy) return;
    setBusy(o.orderId);
    setError(null);
    try {
      const match = await getSwiggyMenuNutrition(o.orderId, dish);
      // re-use the meal result screen with the swiggy match payload
      const fake = await postMealSnap("swiggy:" + o.orderId);
      router.replace({
        pathname: "/result/meal",
        params: {
          payload: JSON.stringify(fake),
          source: "swiggy",
          swiggyOrderId: o.orderId,
          swiggyMatch: JSON.stringify(match.match ?? {}),
        },
      });
    } catch (e: any) {
      setError(e?.message ?? "Could not match menu.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.cap}>SWIGGY ORDER DETECTION</Text>
        <Text style={styles.title}>Which order is this from?</Text>
        <Text style={styles.body}>
          We'll cross-reference the restaurant's menu to give you exact nutrition data
          using `search_menu`.
        </Text>
        <View style={{ alignItems: "flex-start", marginTop: spacing.sm }}>
          <PoweredBySwiggy compact />
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: spacing.xl }} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          orders.map((o) => (
            <Pressable
              key={o.orderId}
              onPress={() => pick(o)}
              disabled={!!busy}
              style={({ pressed }) => [
                styles.row,
                pressed && !busy && { opacity: 0.9 },
                busy === o.orderId && { opacity: 0.6 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.restaurant}>{o.restaurant}</Text>
                <Text style={styles.meta}>
                  ₹{Math.round(o.total)} · {o.paymentMode} · {new Date(o.placedAt).toLocaleDateString("en-IN")}
                </Text>
              </View>
              {busy === o.orderId ? <ActivityIndicator /> : <Text style={styles.arrow}>→</Text>}
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
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
  body: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  row: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    ...shadow.card,
  },
  restaurant: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  arrow: {
    fontSize: 22,
    color: colors.text,
    fontWeight: "800",
  },
  error: {
    color: colors.danger,
    marginTop: spacing.md,
    fontWeight: "600",
  },
});
