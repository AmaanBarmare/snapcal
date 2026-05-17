import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/lib/theme";

interface MacroBarProps {
  label: string;
  unit?: string;
  value: number;
  target: number;
  color: string;
}

export default function MacroBar({ label, value, target, color, unit = "g" }: MacroBarProps) {
  const ratio = target > 0 ? Math.max(0, Math.min(1.2, value / target)) : 0;
  return (
    <View style={styles.row}>
      <View style={styles.head}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {Math.round(value)}
          <Text style={styles.muted}> / {Math.round(target)} {unit}</Text>
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.min(ratio, 1) * 100}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: spacing.md,
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  muted: {
    color: colors.textMuted,
    fontWeight: "400",
  },
  track: {
    height: 8,
    backgroundColor: colors.ringTrack,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.pill,
  },
});
