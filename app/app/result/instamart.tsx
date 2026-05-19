import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/Button";
import PoweredBySwiggy from "@/components/PoweredBySwiggy";
import {
  BuildCartResponse,
  checkoutInstamart,
  confirmInstamartCart,
} from "@/lib/api";
import Card from "@/components/Card";
import { colors, radius, spacing, type } from "@/lib/theme";

type Payment = "UPI" | "COD" | "CARD";

export default function InstamartScreen() {
  const params = useLocalSearchParams<{ payload?: string }>();
  const cart = useMemo<(BuildCartResponse & { skipOrder?: boolean }) | null>(() => {
    try {
      return params.payload ? JSON.parse(params.payload) : null;
    } catch {
      return null;
    }
  }, [params.payload]);

  const [payment, setPayment] = useState<Payment>("UPI");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"review" | "confirming" | "ordering">("review");

  if (!cart) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errTitle}>Cart not available</Text>
        <Button label="Back" onPress={() => router.back()} style={{ marginTop: spacing.md }} />
      </SafeAreaView>
    );
  }

  const overCap = cart.total > cart.cartCapInr;
  const cod = payment === "COD";

  async function placeOrder() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      setStep("confirming");
      const confirm = await confirmInstamartCart(cart!.cartId);
      setStep("ordering");
      const order = await checkoutInstamart({
        cartId: cart!.cartId,
        confirmationToken: confirm.confirmationToken,
        paymentMode: payment,
      });
      router.replace({
        pathname: "/result/order",
        params: { payload: JSON.stringify({ ...order, recipeName: cart!.recipeName }) },
      });
    } catch (e: any) {
      setStep("review");
      setError(e?.response?.data?.detail ?? e?.message ?? "Order failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.title}>Order missing ingredients</Text>
        <Text style={styles.recipe}>For {cart.recipeName}</Text>
        <View style={{ alignItems: "flex-start", marginTop: spacing.sm }}>
          <PoweredBySwiggy compact />
        </View>

        {cart.skipOrder ? (
          <Card style={styles.allSet}>
            <Text style={styles.allSetTitle}>You have everything you need ✓</Text>
            <Text style={styles.allSetBody}>
              No Instamart order required. Time to cook.
            </Text>
            <Button
              label="Go to Today"
              onPress={() => router.replace("/(tabs)/today")}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        ) : (
          <>
            <Card style={{ marginTop: spacing.lg }}>
              {cart.items.map((it) => (
                <View key={it.productId} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{it.name}</Text>
                    <Text style={styles.itemBrand}>{it.brand} · qty {it.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>₹{Math.round(it.lineTotal)}</Text>
                </View>
              ))}

              {cart.unavailable.length > 0 ? (
                <View style={styles.unavail}>
                  <Text style={styles.unavailHead}>Not available on Instamart</Text>
                  <Text style={styles.unavailBody}>{cart.unavailable.join(", ")}</Text>
                </View>
              ) : null}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{Math.round(cart.total)}</Text>
              </View>

              <View style={styles.etaRow}>
                <Text style={styles.etaText}>Estimated delivery: ~{cart.etaMinutes} min</Text>
              </View>
            </Card>

            {overCap ? (
              <View style={styles.warningCard}>
                <Text style={styles.warningTitle}>
                  Cart exceeds ₹{cart.cartCapInr} cap
                </Text>
                <Text style={styles.warningBody}>
                  SnapCal limits demo carts to ₹{cart.cartCapInr} to protect against accidental spends.
                </Text>
              </View>
            ) : null}

            <Card style={{ marginTop: spacing.lg }}>
              <Text style={styles.payHead}>Payment</Text>
              <View style={styles.payRow}>
                {(["UPI", "COD", "CARD"] as Payment[]).map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setPayment(p)}
                    style={[styles.payBtn, payment === p && styles.payBtnActive]}
                  >
                    <Text style={[styles.payBtnText, payment === p && styles.payBtnTextActive]}>{p}</Text>
                  </Pressable>
                ))}
              </View>

              {cod ? (
                <View style={styles.codWarning}>
                  <Text style={styles.codTitle}>Cash on delivery</Text>
                  <Text style={styles.codBody}>
                    COD orders cannot be cancelled once placed.
                  </Text>
                </View>
              ) : null}
            </Card>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              label={
                step === "confirming"
                  ? "Confirming…"
                  : step === "ordering"
                    ? "Placing your order…"
                    : "Place order on Instamart"
              }
              onPress={placeOrder}
              loading={busy}
              disabled={overCap}
            />
            <Button
              label="Skip ordering"
              onPress={() => router.replace("/(tabs)/today")}
              variant="ghost"
              style={{ marginTop: spacing.sm }}
            />

            <Text style={styles.guardrailNote}>
              SnapCal will not place an order without your explicit tap. The
              backend enforces this with a single-use confirmation token.
            </Text>

            {busy ? (
              <View style={{ marginTop: spacing.md, alignItems: "center" }}>
                <ActivityIndicator />
              </View>
            ) : null}
          </>
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
    padding: spacing.xl,
  },
  errTitle: {
    ...type.headlineLg,
    color: colors.onSurface,
  },
  title: {
    ...type.headlineLg,
    color: colors.onSurface,
  },
  recipe: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  itemBrand: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
  },
  etaRow: {
    marginTop: spacing.sm,
  },
  etaText: {
    fontSize: 13,
    color: colors.textMuted,
  },

  unavail: {
    backgroundColor: colors.warningSoft,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  unavailHead: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  unavailBody: {
    fontSize: 13,
    color: colors.warning,
    marginTop: 2,
  },

  warningCard: {
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.danger,
  },
  warningBody: {
    fontSize: 13,
    color: colors.danger,
    marginTop: 2,
  },

  payHead: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  payRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  payBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  payBtnActive: {
    borderColor: colors.brand,
    backgroundColor: colors.bgElevated,
  },
  payBtnText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "700",
  },
  payBtnTextActive: {
    color: colors.text,
  },

  codWarning: {
    backgroundColor: colors.warningSoft,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  codTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.warning,
  },
  codBody: {
    fontSize: 13,
    color: colors.warning,
    marginTop: 2,
  },

  error: {
    color: colors.danger,
    fontWeight: "600",
    marginTop: spacing.md,
  },

  guardrailNote: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.md,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: spacing.md,
  },

  allSet: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  allSetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.success,
  },
  allSetBody: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: "center",
  },
});
