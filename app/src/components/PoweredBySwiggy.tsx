import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/lib/theme";

export default function PoweredBySwiggy({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      <View style={styles.dot} />
      <Text style={styles.label}>Powered by Swiggy</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.brandAccentSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  compact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brandAccent,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.brandAccent,
    letterSpacing: 0.3,
  },
});
