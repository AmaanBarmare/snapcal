import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/Button";
import { postFridgeScan, postMealSnap } from "@/lib/api";
import { colors, radius, spacing, type } from "@/lib/theme";
import { useCameraStore } from "@/store/cameraStore";

const FACE_BACK: CameraType = "back";

export default function SnapScreen() {
  const mode = useCameraStore((s) => s.mode);
  const setMode = useCameraStore((s) => s.setMode);
  const [permission, requestPermission] = useCameraPermissions();
  const camRef = useRef<CameraView | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tabBarHeight = useBottomTabBarHeight();

  async function onShutter() {
    if (busy || !camRef.current) return;
    setBusy(true);
    setError(null);
    try {
      const shot = await camRef.current.takePictureAsync({
        base64: true,
        quality: 0.6,
        skipProcessing: false,
      });
      if (!shot?.base64) throw new Error("Could not read camera image.");
      if (mode === "meal") {
        const res = await postMealSnap(shot.base64);
        router.push({
          pathname: "/result/meal",
          params: { payload: JSON.stringify(res) },
        });
      } else {
        const res = await postFridgeScan(shot.base64);
        router.push({
          pathname: "/result/fridge",
          params: { payload: JSON.stringify(res) },
        });
      }
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!permission) {
    return (
      <SafeAreaView style={styles.permissionWrap}>
        <ActivityIndicator color={colors.primaryContainer} />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionWrap}>
        <Text style={styles.permTitle}>SnapCal needs your camera</Text>
        <Text style={styles.permBody}>
          Point at your food or your fridge — photos are discarded after AI reads them.
        </Text>
        <Button label="Allow camera" onPress={requestPermission} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView ref={camRef} style={StyleSheet.absoluteFill} facing={FACE_BACK} />

      <View style={styles.gridOverlay} pointerEvents="none">
        <View style={styles.gridH} />
        <View style={[styles.gridH, { top: "50%" }]} />
        <View style={styles.gridV} />
        <View style={[styles.gridV, { left: "50%" }]} />
      </View>

      <View style={styles.gradientTop} pointerEvents="none" />
      <View style={styles.gradientBottom} pointerEvents="none" />

      <SafeAreaView style={styles.overlay} edges={["top"]}>
        <View style={styles.toggleWrap}>
          <View style={styles.toggle}>
            <Pressable
              onPress={() => setMode("fridge")}
              style={[styles.toggleBtn, mode === "fridge" && styles.toggleBtnActive]}
            >
              <Text style={[styles.toggleText, mode === "fridge" && styles.toggleTextActive]}>
                Fridge
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode("meal")}
              style={[styles.toggleBtn, mode === "meal" && styles.toggleBtnActive]}
            >
              <Text style={[styles.toggleText, mode === "meal" && styles.toggleTextActive]}>
                Meal
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <View
        style={[styles.bottomControls, { bottom: tabBarHeight + spacing.lg }]}
        pointerEvents="box-none"
      >
        <Text style={styles.hint}>
          {mode === "meal" ? "Point at your food" : "Open the fridge fully"}
        </Text>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={onShutter}
          disabled={busy}
          style={({ pressed }) => [
            styles.shutter,
            busy && { opacity: 0.5 },
            pressed && !busy && { transform: [{ scale: 0.95 }] },
          ]}
        >
          {busy ? (
            <ActivityIndicator color={colors.onSurface} />
          ) : (
            <View style={styles.shutterInner} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  permissionWrap: {
    flex: 1,
    padding: spacing.gridMargin,
    justifyContent: "center",
    gap: spacing.xl,
    backgroundColor: colors.background,
  },
  permTitle: {
    ...type.headlineLg,
    color: colors.onSurface,
  },
  permBody: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
  },

  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
    zIndex: 1,
  },
  gridH: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#fff",
  },
  gridV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#fff",
  },
  gradientTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  gradientBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  overlay: {
    zIndex: 2,
    alignItems: "center",
    paddingTop: spacing.sm,
  },
  toggleWrap: {
    alignItems: "center",
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: "rgba(244, 222, 211, 0.85)",
    borderRadius: radius.pill,
    padding: 4,
  },
  toggleBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  toggleBtnActive: {
    backgroundColor: colors.primaryContainer,
  },
  toggleText: {
    ...type.labelCaps,
    color: colors.onSurfaceVariant,
    fontSize: 11,
  },
  toggleTextActive: {
    color: colors.onPrimary,
  },

  bottomControls: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 2,
    gap: spacing.lg,
    paddingHorizontal: spacing.gridMargin,
  },
  hint: {
    ...type.bodyMd,
    color: colors.surfaceContainerLowest,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  errorBanner: {
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: radius.md,
    width: "100%",
  },
  errorText: {
    color: colors.onPrimary,
    ...type.bodyMd,
    fontWeight: "600",
  },
  shutter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  shutterInner: {
    width: "100%",
    height: "100%",
    borderRadius: 36,
    backgroundColor: colors.surfaceContainerLowest,
  },
});
