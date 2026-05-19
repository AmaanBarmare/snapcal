import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, shadow, spacing, type } from "@/lib/theme";

export default function PoweredBySwiggy({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.wrap, compact && styles.compact, shadow.ambient]}>
      <View style={styles.monogram}>
        <Text style={styles.monogramText}>S</Text>
      </View>
      <Text style={styles.label}>Powered by Swiggy</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignSelf: "center",
  },
  compact: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  monogram: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  monogramText: {
    color: colors.onPrimary,
    fontSize: 10,
    fontWeight: "800",
  },
  label: {
    ...type.labelCaps,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.8,
    textTransform: "none",
    fontSize: 11,
  },
});
