import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { colors, radius, spacing, type } from "@/lib/theme";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        variant === "danger" && styles.danger,
        isDisabled && { opacity: 0.5 },
        pressed && !isDisabled && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" || variant === "danger" ? colors.onPrimary : colors.onSurface}
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant === "primary" && styles.labelPrimary,
            variant === "secondary" && styles.labelSecondary,
            variant === "ghost" && styles.labelGhost,
            variant === "danger" && styles.labelPrimary,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  primary: {
    backgroundColor: colors.primaryContainer,
    ...{
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
  },
  secondary: {
    backgroundColor: colors.secondaryContainer,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  danger: {
    backgroundColor: colors.error,
  },
  label: {
    ...type.headlineMd,
    fontSize: 17,
  },
  labelPrimary: {
    color: colors.onPrimary,
  },
  labelSecondary: {
    color: colors.onSecondaryContainer,
  },
  labelGhost: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    textDecorationLine: "underline",
    fontFamily: type.bodyMd.fontFamily,
    fontWeight: "400",
  },
});
