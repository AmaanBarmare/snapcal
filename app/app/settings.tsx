import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/Button";
import Card from "@/components/Card";
import { HealthResponse, health } from "@/lib/api";
import { colors, spacing, type } from "@/lib/theme";
import { useSessionStore } from "@/store/sessionStore";

export default function SettingsScreen() {
  const resetOnboarding = useSessionStore((s) => s.resetOnboarding);
  const [healthInfo, setHealthInfo] = useState<HealthResponse | null>(null);

  useEffect(() => {
    health()
      .then(setHealthInfo)
      .catch(() => setHealthInfo(null));
  }, []);

  async function rerunOnboarding() {
    await resetOnboarding();
    router.push("/onboarding");
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSub}>Demo controls</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.sectionTitle}>Account</Text>
          <Text style={styles.body}>
            SnapCal uses a single demo user on this device. Update your weight, goal,
            and activity level anytime.
          </Text>
          <Button
            label="Edit goals & targets"
            onPress={() => router.push("/onboarding")}
            style={{ marginTop: spacing.lg }}
          />
          <Button
            label="Reset onboarding"
            variant="ghost"
            onPress={rerunOnboarding}
            style={{ marginTop: spacing.sm }}
          />
        </Card>

        <Card style={styles.sectionGap}>
          <Text style={styles.sectionTitle}>Developer</Text>
          <View style={styles.devRow}>
            <Text style={styles.devLabel}>API status</Text>
            <Text style={styles.devValue}>
              {healthInfo ? healthInfo.status : "unreachable"}
            </Text>
          </View>
          <View style={styles.devRow}>
            <Text style={styles.devLabel}>Mock mode</Text>
            <Text style={styles.devValue}>
              {healthInfo ? (healthInfo.mocks ? "on" : "off") : "—"}
            </Text>
          </View>
          <View style={styles.devRow}>
            <Text style={styles.devLabel}>API version</Text>
            <Text style={styles.devValue}>{healthInfo?.version ?? "—"}</Text>
          </View>
        </Card>

        <Card style={styles.sectionGap}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.body}>
            SnapCal — camera-first food intelligence for Indian consumers. Powered by
            Swiggy Instamart & Food MCPs (demo build).
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.gridMargin,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...type.headlineLg,
    color: colors.onSurface,
  },
  headerSub: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  scroll: {
    paddingHorizontal: spacing.gridMargin,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    ...type.labelCaps,
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginBottom: spacing.sm,
  },
  body: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  sectionGap: {
    marginTop: spacing.lg,
  },
  devRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  devLabel: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
  },
  devValue: {
    ...type.bodyMd,
    color: colors.onSurface,
    fontWeight: "700",
  },
});
