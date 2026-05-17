import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/Button";
import PoweredBySwiggy from "@/components/PoweredBySwiggy";
import { CheckoutResponse } from "@/lib/api";
import { colors, radius, shadow, spacing } from "@/lib/theme";

export default function OrderConfirmationScreen() {
  const params = useLocalSearchParams<{ payload?: string }>();
  const order = useMemo<(CheckoutResponse & { recipeName?: string }) | null>(() => {
    try {
      return params.payload ? JSON.parse(params.payload) : null;
    } catch {
      return null;
    }
  }, [params.payload]);

  if (!order) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.title}>No order data</Text>
        <Button label="Home" onPress={() => router.replace("/(tabs)/today")} style={{ marginTop: spacing.md }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.wrap}>
        <View style={styles.tickWrap}>
          <Text style={styles.tick}>✓</Text>
        </View>
        <Text style={styles.title}>Order placed</Text>
        {order.recipeName ? (
          <Text style={styles.subtitle}>Ingredients for {order.recipeName} are on the way</Text>
        ) : null}

        <View style={styles.card}>
          <Row label="Order ID" value={order.orderId} mono />
          <Row label="Total" value={`₹${Math.round(order.total)}`} />
          <Row label="Estimated delivery" value={`~${order.etaMinutes} min`} />
          <Row label="Payment" value={order.paymentMode} />
          {order.codWarning ? (
            <Text style={styles.cod}>COD orders cannot be cancelled from SnapCal.</Text>
          ) : null}
        </View>

        <View style={styles.swig}>
          <PoweredBySwiggy />
          <Text style={styles.swigText}>
            Tracking and cancellation flow through the Swiggy app.
          </Text>
        </View>

        <Button label="Back to Today" onPress={() => router.replace("/(tabs)/today")} />
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, mono && { fontFamily: "Menlo" }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  tickWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.successSoft,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  tick: {
    fontSize: 44,
    color: colors.success,
    fontWeight: "800",
    lineHeight: 48,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xs,
    lineHeight: 22,
  },

  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginVertical: spacing.lg,
    ...shadow.card,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "600",
  },
  rowValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "700",
  },
  cod: {
    fontSize: 12,
    color: colors.warning,
    marginTop: spacing.sm,
    fontStyle: "italic",
  },

  swig: {
    alignItems: "center",
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  swigText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
  },
});
