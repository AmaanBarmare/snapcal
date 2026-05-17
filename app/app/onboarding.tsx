import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/Button";
import PoweredBySwiggy from "@/components/PoweredBySwiggy";
import { postOnboarding } from "@/lib/api";
import { colors, radius, shadow, spacing } from "@/lib/theme";
import { useSessionStore } from "@/store/sessionStore";

type Goal = "lose" | "maintain" | "gain";
type Activity = "sedentary" | "lightly_active" | "very_active";

const GOAL_OPTIONS: { key: Goal; label: string; hint: string }[] = [
  { key: "lose", label: "Lose weight", hint: "Mild calorie deficit" },
  { key: "maintain", label: "Maintain", hint: "Eat at maintenance" },
  { key: "gain", label: "Build muscle", hint: "Mild surplus" },
];

const ACTIVITY_OPTIONS: { key: Activity; label: string; hint: string }[] = [
  { key: "sedentary", label: "Sedentary", hint: "Mostly desk, no workouts" },
  { key: "lightly_active", label: "Lightly active", hint: "Walks + 2-3 workouts/wk" },
  { key: "very_active", label: "Very active", hint: "Lifts/runs almost daily" },
];

export default function OnboardingScreen() {
  const [goal, setGoal] = useState<Goal>("maintain");
  const [weightStr, setWeightStr] = useState("70");
  const [activity, setActivity] = useState<Activity>("lightly_active");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markOnboarded = useSessionStore((s) => s.markOnboarded);

  async function onSubmit() {
    const weight = Number(weightStr);
    if (!Number.isFinite(weight) || weight < 30 || weight > 250) {
      setError("Enter a weight between 30 and 250 kg.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await postOnboarding({ goal, weight_kg: weight, activity_level: activity });
      await markOnboarded();
      router.back();
    } catch (e: any) {
      setError(e?.message ?? "Could not save. Make sure the backend is running.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
          <PoweredBySwiggy compact />
          <Text style={styles.title}>Three quick questions</Text>
          <Text style={styles.subtitle}>
            We'll set a daily calorie + macro target. Change it any time.
          </Text>

          <View style={styles.section}>
            <Text style={styles.qLabel}>1. What's your goal?</Text>
            <View style={styles.optGroup}>
              {GOAL_OPTIONS.map((o) => (
                <Option
                  key={o.key}
                  label={o.label}
                  hint={o.hint}
                  active={goal === o.key}
                  onPress={() => setGoal(o.key)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.qLabel}>2. Roughly how much do you weigh?</Text>
            <View style={styles.weightRow}>
              <TextInput
                value={weightStr}
                onChangeText={setWeightStr}
                keyboardType="number-pad"
                style={styles.weightInput}
                maxLength={3}
              />
              <Text style={styles.weightUnit}>kg</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.qLabel}>3. How active are you?</Text>
            <View style={styles.optGroup}>
              {ACTIVITY_OPTIONS.map((o) => (
                <Option
                  key={o.key}
                  label={o.label}
                  hint={o.hint}
                  active={activity === o.key}
                  onPress={() => setActivity(o.key)}
                />
              ))}
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            label={busy ? "Saving…" : "Save and start"}
            onPress={onSubmit}
            loading={busy}
            style={{ marginTop: spacing.lg }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Option({
  label,
  hint,
  active,
  onPress,
}: {
  label: string;
  hint: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.opt, active && styles.optActive]}
    >
      <View style={[styles.radio, active && styles.radioActive]} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.optLabel, active && { color: colors.text }]}>{label}</Text>
        <Text style={styles.optHint}>{hint}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  section: {
    marginTop: spacing.xl,
  },
  qLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  optGroup: {
    gap: spacing.sm,
  },
  opt: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  optActive: {
    borderColor: colors.brand,
  },
  optLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  optHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderStrong,
  },
  radioActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brand,
  },

  weightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weightInput: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.text,
    minWidth: 90,
  },
  weightUnit: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: "700",
  },

  error: {
    color: colors.danger,
    marginTop: spacing.md,
    fontWeight: "600",
  },
});
