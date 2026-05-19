import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { colors, radius, shadow, spacing } from "@/lib/theme";

export default function Card({
  children,
  style,
  elevated,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
}) {
  return (
    <View style={[styles.card, elevated && shadow.elevated, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.card,
    padding: spacing.lg,
    ...shadow.ambient,
  },
});
