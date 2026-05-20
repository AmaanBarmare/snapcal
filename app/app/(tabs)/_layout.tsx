import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radius, spacing, type } from "@/lib/theme";

function TabBarIcon({
  label,
  glyph,
  focused,
}: {
  label: string;
  glyph: string;
  focused: boolean;
}) {
  if (focused) {
    return (
      <View style={styles.tabActive}>
        <Text style={styles.tabGlyphActive}>{glyph}</Text>
        <Text style={styles.tabLabelActive}>{label}</Text>
      </View>
    );
  }
  return (
    <View style={styles.tabInactive}>
      <Text style={styles.tabGlyph}>{glyph}</Text>
      <Text style={styles.tabLabel}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 64 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        // Default tab buttons — custom Pressable wrappers broke layout on iOS (SDK 54).
        tabBarStyle: {
          height: tabBarHeight,
          paddingTop: 8,
          paddingBottom: insets.bottom,
          paddingHorizontal: spacing.sm,
          backgroundColor: colors.surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.outlineVariant,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: -2 },
            },
            android: { elevation: 12 },
          }),
        },
        tabBarItemStyle: {
          paddingVertical: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Snap",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon label="Snap" glyph="📷" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon label="Today" glyph="📅" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon label="History" glyph="🕐" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabActive: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: colors.secondaryContainer,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
    minWidth: 72,
  },
  tabInactive: {
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
    minWidth: 72,
  },
  tabGlyphActive: {
    fontSize: 22,
  },
  tabGlyph: {
    fontSize: 22,
    opacity: 0.55,
  },
  tabLabelActive: {
    ...type.labelCaps,
    color: colors.onSecondaryContainer,
    fontSize: 10,
  },
  tabLabel: {
    ...type.labelCaps,
    color: colors.onSurfaceVariant,
    fontSize: 10,
  },
});
