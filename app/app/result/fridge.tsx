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
import { PillTag } from "@/components/Pill";
import PoweredBySwiggy from "@/components/PoweredBySwiggy";
import { FridgeScanResponse, postRecipes } from "@/lib/api";
import { colors, radius, shadow, spacing } from "@/lib/theme";

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

  if (!initial) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.title}>Couldn't read your fridge</Text>
        <Text style={styles.body}>Try a clearer shot with the door fully open.</Text>
        <Button label="Try again" onPress={() => router.back()} style={{ marginTop: spacing.md }} />
      </SafeAreaView>
    );
  }

  function add() {
    const t = text.trim();
    if (!t) return;
    setItems((prev) => Array.from(new Set([...prev, t])));
    setText("");
  }

  function remove(name: string) {
    setItems((prev) => prev.filter((p) => p !== name));
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
          <Text style={styles.cap}>FRIDGE SCANNED</Text>
          <Text style={styles.title}>We see {items.length} items</Text>
          <Text style={styles.body}>
            Tap × on anything we got wrong. Add more if we missed something.
          </Text>

          <View style={styles.tagBox}>
            <View style={styles.tagWrap}>
              {items.map((name) => (
                <PillTag key={name} label={name} onRemove={() => remove(name)} />
              ))}
            </View>

            <View style={styles.addRow}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Add ingredient…"
                placeholderTextColor={colors.textMuted}
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
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            label={busy ? "Finding Indian recipes…" : "Find recipes →"}
            onPress={findRecipes}
            loading={busy}
            style={{ marginTop: spacing.lg }}
          />

          <View style={{ alignItems: "center", marginTop: spacing.md }}>
            <PoweredBySwiggy />
          </View>

          {busy ? (
            <View style={{ marginTop: spacing.md }}>
              <ActivityIndicator />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
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
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    marginTop: spacing.xs,
  },
  body: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  cap: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  tagBox: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    ...shadow.card,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text,
  },
  addBtn: {
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  error: {
    color: colors.danger,
    marginTop: spacing.md,
    fontWeight: "600",
  },
});
