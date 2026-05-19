import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { FridgeScanResponse, postRecipes } from "@/lib/api";
import { colors, radius, spacing, type } from "@/lib/theme";

const PILL_DOTS = ["#E53935", "#FFF59D", "#FFFFFF", "#CE93D8", "#4CAF50", "#FC8019"];

export default function FridgeResultScreen() {
  const params = useLocalSearchParams<{ payload?: string }>();
  const initial = useMemo<FridgeScanResponse | null>(() => {
    try {
      return params.payload ? (JSON.parse(params.payload) as FridgeScanResponse) : null;
    } catch {
      return null;
    }
  }, [params.payload]);

  const [items, setItems] = useState<string[]>(
    () => initial?.ingredients.map((i) => i.name) ?? []
  );
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  if (!initial) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errTitle}>Couldn't read your fridge</Text>
        <Text style={styles.errBody}>Try a clearer shot with the door fully open.</Text>
        <Button label="Try again" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </SafeAreaView>
    );
  }

  function add() {
    const t = text.trim();
    if (!t) return;
    setItems((prev) => Array.from(new Set([...prev, t])));
    setText("");
    setEditing(true);
  }

  function remove(name: string) {
    setItems((prev) => prev.filter((p) => p !== name));
    setEditing(true);
  }

  async function findRecipes() {
    if (items.length === 0) {
      setError("Add at least one ingredient.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const r = await postRecipes(items);
      router.push({
        pathname: "/result/recipes",
        params: {
          ingredients: JSON.stringify(items),
          recipes: JSON.stringify(r.recipes),
        },
      });
    } catch (e: any) {
      setError(e?.message ?? "Could not get recipes.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backGlyph}>←</Text>
          </Pressable>

          <Text style={styles.title}>What's in your fridge</Text>
          <Text style={styles.subtitle}>We identified these ingredients from your snap.</Text>

          <View style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>Detected</Text>
            <Pressable onPress={() => setEditing((e) => !e)} style={styles.editBtn}>
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillScroll}
          >
            {items.map((name, i) => (
              <View key={name} style={styles.ingredientPill}>
                <View
                  style={[styles.pillDot, { backgroundColor: PILL_DOTS[i % PILL_DOTS.length] }]}
                />
                <Text style={styles.pillLabel}>{name}</Text>
                {editing ? (
                  <Pressable hitSlop={8} onPress={() => remove(name)}>
                    <Text style={styles.pillRemove}>×</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
            <Pressable onPress={() => setEditing(true)} style={styles.addPill}>
              <Text style={styles.addPillText}>+</Text>
            </Pressable>
          </ScrollView>

          {editing ? (
            <View style={styles.addRow}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Add ingredient…"
                placeholderTextColor={colors.onSurfaceVariant}
                style={styles.input}
                onSubmitEditing={add}
                returnKeyType="done"
              />
              <Pressable
                onPress={add}
                style={[styles.addBtn, !text.trim() && { opacity: 0.4 }]}
                disabled={!text.trim()}
              >
                <Text style={styles.addBtnText}>Add</Text>
              </Pressable>
            </View>
          ) : null}

          {items.length >= 3 ? (
            <View style={styles.aiCard}>
              <Text style={styles.aiIcon}>✨</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiTitle}>Perfect Match</Text>
                <Text style={styles.aiBody}>
                  Looks like you have everything needed for a fresh meal from what's in your fridge.
                </Text>
              </View>
            </View>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.footer}>
            <PoweredBySwiggy />
            <Button
              label={busy ? "Finding recipes…" : "Find recipes →"}
              onPress={findRecipes}
              loading={busy}
              style={{ marginTop: spacing.lg, alignSelf: "stretch" }}
            />
          </View>

          {busy ? (
            <ActivityIndicator color={colors.primaryContainer} style={{ marginTop: spacing.md }} />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
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
    padding: spacing.gridMargin,
  },
  errTitle: {
    ...type.headlineLg,
    color: colors.onSurface,
  },
  errBody: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  scroll: {
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
  title: {
    ...type.headlineLg,
    color: colors.onSurface,
  },
  subtitle: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...type.headlineMd,
    color: colors.onSurface,
  },
  editBtn: {
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  editText: {
    ...type.labelCaps,
    color: colors.primary,
    fontSize: 11,
  },
  pillScroll: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  ingredientPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    ...{
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pillLabel: {
    ...type.bodyLg,
    color: colors.onSurface,
    fontWeight: "600",
  },
  pillRemove: {
    fontSize: 18,
    color: colors.onSurfaceVariant,
    marginLeft: 4,
  },
  addPill: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  addPillText: {
    fontSize: 24,
    color: colors.onSurfaceVariant,
  },
  addRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...type.bodyMd,
    color: colors.onSurface,
    height: 56,
  },
  addBtn: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    justifyContent: "center",
  },
  addBtnText: {
    ...type.headlineMd,
    fontSize: 15,
    color: colors.onPrimary,
  },
  aiCard: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  aiIcon: {
    fontSize: 22,
  },
  aiTitle: {
    ...type.headlineMd,
    fontSize: 16,
    color: colors.onSurface,
    marginBottom: 4,
  },
  aiBody: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
  },
  error: {
    color: colors.error,
    ...type.bodyMd,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  footer: {
    alignItems: "center",
    marginTop: spacing.xl,
  },
});
