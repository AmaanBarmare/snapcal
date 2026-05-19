import { Tabs } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radius, shadow, spacing, type } from "@/lib/theme";

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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 72 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 12,
          paddingHorizontal: spacing.lg,
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
          ...shadow.tabBar,
        },
        tabBarButton: (props) => {
          const { ref, ...rest } = props;
          return (
            <Pressable
              {...rest}
              style={({ pressed }) => [
                props.style,
                { flex: 1, alignItems: "center", justifyContent: "center" },
                pressed && { opacity: 0.85 },
              ]}
            />
          );
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  tabInactive: {
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    gap: 2,
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
    fontSize: 11,
  },
  tabLabel: {
    ...type.labelCaps,
    color: colors.onSurfaceVariant,
    fontSize: 11,
  },
});
