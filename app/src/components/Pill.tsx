import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/lib/theme";

interface PillTagProps {
  label: string;
  onRemove?: () => void;
}

export function PillTag({ label, onRemove }: PillTagProps) {
  return (
    <View style={styles.pill}>
      <Text style={styles.text}>{label}</Text>
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
    backgroundColor: colors.bgElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingLeft: spacing.md,
    paddingRight: 6,
    paddingVertical: 6,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  close: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginLeft: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ringTrack,
  },
  closeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
  },
});
