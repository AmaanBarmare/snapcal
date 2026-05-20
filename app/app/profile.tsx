import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/Button";
import Card from "@/components/Card";
import { UserProfileResponse, getProfile } from "@/lib/api";
import { colors, radius, spacing, type } from "@/lib/theme";

const GOAL_LABELS: Record<UserProfileResponse["goal"], string> = {
  lose: "Lose weight",
  maintain: "Maintain",
  gain: "Build muscle",
};

const ACTIVITY_LABELS: Record<UserProfileResponse["activityLevel"], string> = {
  sedentary: "Sedentary",
  lightly_active: "Lightly active",
  very_active: "Very active",
};

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProfile(await getProfile());
    } catch {
      setProfile(null);
      setError("Complete setup to see your profile, or check that the backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSub}>Your SnapCal demo account</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primaryContainer} />
        </View>
      ) : error || !profile ? (
        <View style={styles.center}>
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No profile yet</Text>
            <Text style={styles.emptyBody}>{error}</Text>
            <Button
              label="Set up goals"
              onPress={() => router.push("/onboarding")}
              style={{ marginTop: spacing.lg, alignSelf: "stretch" }}
            />
            <Button
              label="Retry"
              variant="ghost"
              onPress={load}
              style={{ marginTop: spacing.sm }}
            />
          </Card>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.hero}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
            <Text style={styles.name}>{profile.displayName}</Text>
            <Text style={styles.email}>{profile.email}</Text>
            {profile.onboardedAt ? (
              <Text style={styles.memberSince}>
                Member since{" "}
                {new Date(profile.onboardedAt).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            ) : null}
          </View>

          <Card>
            <Text style={styles.sectionTitle}>Your goals</Text>
            <ProfileRow label="Goal" value={GOAL_LABELS[profile.goal]} />
            <ProfileRow label="Weight" value={`${profile.weightKg} kg`} />
            <ProfileRow
              label="Activity"
              value={ACTIVITY_LABELS[profile.activityLevel]}
            />
          </Card>

          <Card style={styles.sectionGap}>
            <Text style={styles.sectionTitle}>Daily targets</Text>
            <ProfileRow
              label="Calories"
              value={`${profile.targets.calories.toLocaleString("en-IN")} kcal`}
            />
            <ProfileRow label="Protein" value={`${profile.targets.proteinG} g`} />
            <ProfileRow label="Carbs" value={`${profile.targets.carbsG} g`} />
            <ProfileRow label="Fat" value={`${profile.targets.fatG} g`} />
          </Card>

          <Card style={styles.sectionGap}>
            <Text style={styles.sectionTitle}>Activity</Text>
            <ProfileRow
              label="Meals logged"
              value={String(profile.stats.mealsLogged)}
            />
          </Card>

          <Button
            label="Edit goals"
            variant="secondary"
            onPress={() => router.push("/onboarding")}
            style={{ marginTop: spacing.xl }}
          />
        </ScrollView>
      )}
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
  center: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.gridMargin,
  },
  emptyCard: {
    width: "100%",
    alignItems: "center",
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
  scroll: {
    paddingHorizontal: spacing.gridMargin,
    paddingBottom: spacing.xxl,
  },
  hero: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  name: {
    ...type.headlineLg,
    color: colors.onSurface,
  },
  email: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  memberSince: {
    ...type.labelCaps,
    color: colors.onSurfaceVariant,
    fontSize: 10,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...type.labelCaps,
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginBottom: spacing.md,
  },
  sectionGap: {
    marginTop: spacing.lg,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  rowLabel: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
  },
  rowValue: {
    ...type.bodyMd,
    color: colors.onSurface,
    fontWeight: "700",
    textAlign: "right",
    flexShrink: 1,
    marginLeft: spacing.md,
  },
});
