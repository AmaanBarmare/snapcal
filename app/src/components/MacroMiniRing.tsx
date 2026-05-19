import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { colors, type } from "@/lib/theme";

interface MacroMiniRingProps {
  value: number;
  target: number;
  label: string;
  color: string;
  unit?: string;
}

export default function MacroMiniRing({
  value,
  target,
  label,
  color,
  unit = "g",
}: MacroMiniRingProps) {
  const size = 48;
  const stroke = 4;
  const ratio = target > 0 ? Math.min(1, value / target) : 0;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - ratio);

  return (
    <View style={styles.wrap}>
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors.surfaceContainer}
            strokeWidth={stroke}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${circumference},${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <Text style={styles.value}>
          {Math.round(value)}
          {unit}
        </Text>
      </View>
      <View style={styles.labelRow}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: 8,
  },
  value: {
    position: "absolute",
    ...type.macroNumber,
    fontSize: 14,
    color: colors.onSurface,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    ...type.labelCaps,
    color: colors.onSurfaceVariant,
    fontSize: 11,
  },
});
