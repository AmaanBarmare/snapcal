import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, spacing, type } from "@/lib/theme";

export default function AppHeader({
  onSettings,
}: {
  onSettings?: () => void;
}) {
  return (
    <View style={styles.bar}>
      <View style={styles.avatar}>
        <Text style={styles.avatarGlyph}>👤</Text>
      </View>
      <Text style={styles.title}>SnapCal</Text>
      <Pressable
        onPress={onSettings}
        style={({ pressed }) => [styles.settings, pressed && { opacity: 0.7 }]}
        hitSlop={12}
      >
        <Text style={styles.settingsGlyph}>⚙</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
    paddingHorizontal: spacing.gridMargin,
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarGlyph: {
    fontSize: 18,
  },
  title: {
    ...type.headlineLg,
    color: colors.primary,
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
  },
  settings: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsGlyph: {
    fontSize: 20,
    color: colors.primary,
  },
});
