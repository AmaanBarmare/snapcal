import React, { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";

import Card from "@/components/Card";
import PoweredBySwiggy from "@/components/PoweredBySwiggy";
import { getMealKind } from "@/lib/mealKind";
import { colors, radius, spacing, type } from "@/lib/theme";

export type MealListItem = {
  id: number;
  timestamp: string;
  dishName: string;
  calories: number;
  source: string;
  isPlanned: boolean;
};

const DELETE_WIDTH = 88;

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function mealPeriod(ts: string): string {
  const h = new Date(ts).getHours();
  if (h < 11) return "Breakfast";
  if (h < 16) return "Lunch";
  if (h < 18) return "Snack";
  return "Dinner";
}

function DeleteAction({
  onPress,
  deleting,
  progress,
}: {
  onPress: () => void;
  deleting: boolean;
  progress: Animated.AnimatedInterpolation<number>;
}) {
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
    extrapolate: "clamp",
  });

  return (
    <Pressable
      onPress={onPress}
      disabled={deleting}
      style={styles.deleteAction}
      accessibilityRole="button"
      accessibilityLabel="Delete meal"
    >
      <Animated.View style={[styles.deleteActionInner, { transform: [{ scale }] }]}>
        {deleting ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <>
            <Text style={styles.deleteIcon}>🗑</Text>
            <Text style={styles.deleteLabel}>Delete</Text>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

function MealCardContent({ meal }: { meal: MealListItem }) {
  const kind = getMealKind(meal);
  const isFridge = kind === "fridgescan";
  const fromSwiggyMenu = meal.source === "mode2_swiggy";

  return (
    <Card
      style={[
        styles.card,
        isFridge ? styles.cardFridge : styles.cardMealSnap,
      ]}
    >
      <View
        style={[
          styles.thumb,
          isFridge ? styles.thumbFridge : styles.thumbMealSnap,
        ]}
      >
        <Text style={styles.thumbEmoji}>{isFridge ? "🧊" : "📷"}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.kindBadge,
              isFridge ? styles.kindBadgeFridge : styles.kindBadgeMealSnap,
            ]}
          >
            <Text
              style={[
                styles.kindBadgeText,
                isFridge ? styles.kindBadgeTextFridge : styles.kindBadgeTextMealSnap,
              ]}
            >
              {isFridge ? "FridgeScan" : "Meal Snap"}
            </Text>
          </View>
          {isFridge ? (
            <View style={styles.plannedBadge}>
              <Text style={styles.plannedBadgeText}>Planned</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.meta}>
          {mealPeriod(meal.timestamp)} · {formatTime(meal.timestamp)}
        </Text>
        <Text style={styles.dishName} numberOfLines={2}>
          {meal.dishName}
        </Text>

        {isFridge ? (
          <View style={styles.swiggyRow}>
            <PoweredBySwiggy compact />
          </View>
        ) : fromSwiggyMenu ? (
          <Text style={styles.swiggyHint}>Nutrition from Swiggy menu</Text>
        ) : null}
      </View>

      <View style={styles.kcalCol}>
        {isFridge ? (
          <>
            <Text style={styles.plannedKcal}>Planned</Text>
            <Text style={styles.plannedKcalSub}>not logged</Text>
          </>
        ) : (
          <>
            <Text style={styles.kcalNum}>{Math.round(meal.calories)}</Text>
            <Text style={styles.kcalUnit}>kcal</Text>
          </>
        )}
      </View>
    </Card>
  );
}

export default function MealListCard({
  meal,
  onDelete,
  deleting = false,
}: {
  meal: MealListItem;
  onDelete?: () => void;
  deleting?: boolean;
}) {
  const swipeRef = useRef<Swipeable>(null);

  const card = <MealCardContent meal={meal} />;

  if (!onDelete) {
    return <View style={styles.wrapper}>{card}</View>;
  }

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>
  ) => (
    <DeleteAction
      progress={progress}
      deleting={deleting}
      onPress={() => {
        swipeRef.current?.close();
        onDelete();
      }}
    />
  );

  return (
    <View style={styles.wrapper}>
      <Swipeable
        ref={swipeRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
        rightThreshold={DELETE_WIDTH / 2}
        enabled={!deleting}
      >
        {card}
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.md,
    overflow: "hidden",
  },
  cardFridge: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryContainer,
    backgroundColor: colors.surfaceContainerLow,
  },
  cardMealSnap: {
    borderLeftWidth: 4,
    borderLeftColor: colors.ringProtein,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbFridge: {
    backgroundColor: colors.secondaryContainer,
  },
  thumbMealSnap: {
    backgroundColor: colors.surfaceContainerLow,
  },
  thumbEmoji: {
    fontSize: 28,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  kindBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  kindBadgeFridge: {
    backgroundColor: colors.primaryContainer,
  },
  kindBadgeMealSnap: {
    backgroundColor: colors.tertiaryContainer,
  },
  kindBadgeText: {
    ...type.labelCaps,
    fontSize: 9,
  },
  kindBadgeTextFridge: {
    color: colors.onPrimary,
  },
  kindBadgeTextMealSnap: {
    color: colors.onPrimary,
  },
  plannedBadge: {
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  plannedBadgeText: {
    ...type.labelCaps,
    fontSize: 9,
    color: colors.onSurfaceVariant,
  },
  meta: {
    ...type.labelCaps,
    color: colors.onSurfaceVariant,
    fontSize: 10,
    textTransform: "none",
    letterSpacing: 0,
  },
  dishName: {
    ...type.headlineMd,
    color: colors.onSurface,
    fontSize: 18,
  },
  swiggyRow: {
    alignSelf: "flex-start",
    marginTop: 2,
  },
  swiggyHint: {
    ...type.bodyMd,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  kcalCol: {
    alignItems: "flex-end",
    minWidth: 56,
  },
  kcalNum: {
    ...type.macroNumber,
    color: colors.primaryContainer,
    fontSize: 20,
  },
  kcalUnit: {
    ...type.labelCaps,
    color: colors.onSurfaceVariant,
    fontSize: 10,
  },
  plannedKcal: {
    ...type.labelCaps,
    color: colors.primary,
    fontSize: 11,
    textTransform: "none",
    letterSpacing: 0,
  },
  plannedKcalSub: {
    ...type.labelCaps,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: "none",
    letterSpacing: 0,
    marginTop: 2,
  },
  deleteAction: {
    width: DELETE_WIDTH,
    marginLeft: spacing.sm,
    borderRadius: radius.card,
    overflow: "hidden",
    backgroundColor: colors.error,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteActionInner: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
  },
  deleteIcon: {
    fontSize: 20,
  },
  deleteLabel: {
    ...type.labelCaps,
    color: colors.onPrimary,
    fontSize: 10,
    textTransform: "none",
    letterSpacing: 0,
  },
});
