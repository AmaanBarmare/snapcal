import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, type } from "@/lib/theme";

interface PillTagProps {
  label: string;
  onRemove?: () => void;
  variant?: "default" | "available" | "missing";
}

export function PillTag({ label, onRemove, variant = "default" }: PillTagProps) {
  return (
    <View
      style={[
        styles.pill,
        variant === "available" && styles.available,
        variant === "missing" && styles.missing,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === "available" && styles.textAvailable,
          variant === "missing" && styles.textMissing,
        ]}
      >
        {label}
      </Text>
      {onRemove ? (
        <Pressable hitSlop={10} onPress={onRemove} style={styles.close}>
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.pill,
    paddingLeft: spacing.lg,
    paddingRight: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  available: {
    backgroundColor: colors.successSoft,
  },
  missing: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  text: {
    ...type.bodyMd,
    color: colors.onSurface,
    fontFamily: type.bodyMd.fontFamily,
    fontWeight: "600",
  },
  textAvailable: {
    color: colors.success,
  },
  textMissing: {
    color: colors.onSurfaceVariant,
  },
  close: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginLeft: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceContainerHighest,
  },
  closeText: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
  },
});
