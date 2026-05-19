import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { colors, type } from "@/lib/theme";

interface RingProps {
  size?: number;
  stroke?: number;
  value: number;
  target: number;
  color?: string;
  trackColor?: string;
  label?: string;
  subLabel?: string;
}

export default function Ring({
  size = 256,
  stroke = 12,
  value,
  target,
  color = colors.ringCalories,
  trackColor = colors.surfaceContainerHigh,
  label,
  subLabel,
}: RingProps) {
  const ratio = target > 0 ? Math.max(0, Math.min(1.15, value / target)) : 0;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(ratio, 1));

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference},${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.value}>{Math.round(value).toLocaleString("en-IN")}</Text>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        {subLabel ? <Text style={styles.sub}>{subLabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: "absolute",
    alignItems: "center",
  },
  value: {
    ...type.displayCalories,
    color: colors.onSurface,
  },
  label: {
    ...type.bodyLg,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  sub: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
});
