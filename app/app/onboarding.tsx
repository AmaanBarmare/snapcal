import { Image } from "expo-image";
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
import Card from "@/components/Card";
import { postOnboarding } from "@/lib/api";
import { colors, radius, spacing, type } from "@/lib/theme";
import { useSessionStore } from "@/store/sessionStore";

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDCCypghIzpjx02PXpHtRPrM18L-hjvbS2HkegT33kSiploR3dezZmltuZfGu5D6E2sRzBSUD1AwXJOTrIhaqezhz6A7Tof_diegiufmvUTI_3ZjnZuTv2n7bjIrzrnl7SMdzWd-o45FUMTA0dCeHRwypZy9kaclD2e8smlIThHZ1sprJgqpYu-LLxawqyhc8wPAoCZ9E-Jy4q-O8Fb9l8h-EsRSPrOgCYHYDnJdVu8mVLUzdRoJ-HCN119A7CR-wf2s_MfOYLpdhM";

type Goal = "lose" | "maintain" | "gain";
type Activity = "sedentary" | "lightly_active" | "very_active";

const GOAL_OPTIONS: { key: Goal; label: string; hint: string; icon: string }[] = [
  { key: "lose", label: "Lose weight", hint: "Mild calorie deficit", icon: "📉" },
  { key: "maintain", label: "Maintain", hint: "Eat at maintenance", icon: "⚖️" },
  { key: "gain", label: "Build muscle", hint: "Mild surplus", icon: "💪" },
];

const ACTIVITY_OPTIONS: { key: Activity; label: string; hint: string; icon: string }[] = [
  { key: "sedentary", label: "Sedentary", hint: "Mostly desk, no workouts", icon: "🪑" },
  { key: "lightly_active", label: "Lightly active", hint: "Walks + 2-3 workouts/wk", icon: "🚶" },
  { key: "very_active", label: "Very active", hint: "Lifts/runs almost daily", icon: "🏃" },
];

const VALUE_PROPS = [
  { icon: "🛡", title: "Indian nutrition that works" },
  { icon: "🍳", title: "Recipes from your fridge" },
  { icon: "🛒", title: "Order ingredients on Instamart" },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState<"welcome" | "form">("welcome");
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

  if (step === "welcome") {
    return (
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <View style={styles.hero}>
          <Image source={{ uri: HERO_IMAGE }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <View style={styles.heroGradient} />
        </View>
        <ScrollView contentContainerStyle={styles.welcomeScroll}>
          <Text style={styles.welcomeTitle}>Snap your food. Know what's in it.</Text>
          <Text style={styles.welcomeSub}>AI-powered nutrition for the Indian plate.</Text>

          {VALUE_PROPS.map((v) => (
            <Card key={v.title} style={styles.valueCard}>
              <View style={styles.valueIcon}>
                <Text style={{ fontSize: 22 }}>{v.icon}</Text>
              </View>
              <Text style={styles.valueTitle}>{v.title}</Text>
            </Card>
          ))}

          <Button label="Get started →" onPress={() => setStep("form")} style={{ marginTop: spacing.lg }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.formScroll}>
          <Pressable onPress={() => setStep("welcome")} style={styles.back}>
            <Text style={styles.backGlyph}>←</Text>
          </Pressable>

          <Text style={styles.formTitle}>Three quick questions</Text>
          <Text style={styles.formSub}>We'll set your daily calorie + macro targets.</Text>

          <Text style={styles.qLabel}>1. What's your goal?</Text>
          <View style={styles.optGroup}>
            {GOAL_OPTIONS.map((o) => (
              <Option
                key={o.key}
                label={o.label}
                hint={o.hint}
                icon={o.icon}
                active={goal === o.key}
                onPress={() => setGoal(o.key)}
              />
            ))}
          </View>

          <Text style={styles.qLabel}>2. Roughly how much do you weigh?</Text>
          <Card style={styles.weightCard}>
            <TextInput
              value={weightStr}
              onChangeText={setWeightStr}
              keyboardType="number-pad"
              style={styles.weightInput}
              maxLength={3}
            />
            <Text style={styles.weightUnit}>kg</Text>
          </Card>

          <Text style={styles.qLabel}>3. How active are you?</Text>
          <View style={styles.optGroup}>
            {ACTIVITY_OPTIONS.map((o) => (
              <Option
                key={o.key}
                label={o.label}
                hint={o.hint}
                icon={o.icon}
                active={activity === o.key}
                onPress={() => setActivity(o.key)}
              />
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            label={busy ? "Saving…" : "Save and start"}
            onPress={onSubmit}
            loading={busy}
            style={{ marginTop: spacing.xl }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Option({
  label,
  hint,
  icon,
  active,
  onPress,
}: {
  label: string;
  hint: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <Card style={[styles.opt, active && styles.optActive]}>
        <View style={styles.optIcon}>
          <Text>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.optLabel}>{label}</Text>
          <Text style={styles.optHint}>{hint}</Text>
        </View>
        <View style={[styles.radio, active && styles.radioActive]} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    height: 280,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 248, 245, 0.55)",
  },
  welcomeScroll: {
    paddingHorizontal: spacing.gridMargin,
    paddingBottom: spacing.xxl,
    marginTop: -spacing.xl,
  },
  welcomeTitle: {
    ...type.headlineLg,
    color: colors.onSurface,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  welcomeSub: {
    ...type.bodyLg,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  valueCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  valueIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  valueTitle: {
    ...type.headlineMd,
    color: colors.onSurface,
    flex: 1,
  },
  formScroll: {
    paddingHorizontal: spacing.gridMargin,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.lg,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  backGlyph: {
    fontSize: 22,
    color: colors.onSurfaceVariant,
  },
  formTitle: {
    ...type.headlineLg,
    color: colors.onSurface,
  },
  formSub: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  qLabel: {
    ...type.headlineMd,
    fontSize: 16,
    color: colors.onSurface,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  optGroup: {
    gap: spacing.sm,
  },
  opt: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  optActive: {
    borderWidth: 2,
    borderColor: colors.primaryContainer,
  },
  optIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  optLabel: {
    ...type.headlineMd,
    fontSize: 16,
    color: colors.onSurface,
  },
  optHint: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
  },
  radioActive: {
    borderColor: colors.primaryContainer,
    backgroundColor: colors.primaryContainer,
  },
  weightCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  weightInput: {
    ...type.displayCalories,
    fontSize: 36,
    color: colors.onSurface,
    minWidth: 90,
  },
  weightUnit: {
    ...type.headlineMd,
    color: colors.onSurfaceVariant,
  },
  error: {
    color: colors.error,
    ...type.bodyMd,
    fontWeight: "600",
    marginTop: spacing.md,
  },
});
