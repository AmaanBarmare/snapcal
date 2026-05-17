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
import PoweredBySwiggy from "@/components/PoweredBySwiggy";
import { postFridgeScan, postMealSnap } from "@/lib/api";
import { colors, radius, spacing } from "@/lib/theme";
import { useCameraStore } from "@/store/cameraStore";

const FACE_BACK: CameraType = "back";

export default function SnapScreen() {
  const mode = useCameraStore((s) => s.mode);
  const setMode = useCameraStore((s) => s.setMode);
  const [permission, requestPermission] = useCameraPermissions();
  const camRef = useRef<CameraView | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionWrap}>
        <Text style={styles.title}>SnapCal needs your camera</Text>
        <Text style={styles.body}>
          Point at your food or your fridge — we never store the photos. They're
          discarded after our AI identifies what's in them.
        </Text>
        <Button label="Allow camera" onPress={requestPermission} />
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView ref={camRef} style={StyleSheet.absoluteFill} facing={FACE_BACK} />

      <SafeAreaView style={styles.overlay} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <PoweredBySwiggy compact />
          <View style={styles.toggle}>
            <Pressable
              onPress={() => setMode("fridge")}
              style={[
                styles.toggleBtn,
                mode === "fridge" && styles.toggleBtnActive,
              ]}
            >
              <Text style={[styles.toggleText, mode === "fridge" && styles.toggleTextActive]}>
                Fridge
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode("meal")}
              style={[
                styles.toggleBtn,
                mode === "meal" && styles.toggleBtnActive,
              ]}
            >
              <Text style={[styles.toggleText, mode === "meal" && styles.toggleTextActive]}>
                Meal
              </Text>
            </Pressable>
          </View>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.hintWrap}>
          {mode === "meal" ? (
            <Text style={styles.hint}>Point at your food</Text>
          ) : (
            <View>
              <Text style={styles.hint}>Open the fridge fully</Text>
              <Text style={styles.subHint}>One photo. Good lighting helps.</Text>
            </View>
          )}
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.shutterRow}>
          <Pressable
            onPress={onShutter}
            disabled={busy}
            style={({ pressed }) => [
              styles.shutter,
              busy && { opacity: 0.5 },
              pressed && !busy && { transform: [{ scale: 0.96 }] },
            ]}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.shutterInner} />
            )}
          </Pressable>
          <Text style={styles.shutterLabel}>
            {busy ? (mode === "fridge" ? "Reading your fridge…" : "Identifying your meal…") : "Tap to capture"}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  permissionWrap: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: "center",
    gap: spacing.lg,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
  },
  body: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },

  overlay: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: radius.pill,
    padding: 4,
  },
  toggleBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  toggleBtnActive: {
    backgroundColor: colors.bgElevated,
  },
  toggleText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  toggleTextActive: {
    color: colors.text,
  },

  hintWrap: {
    alignItems: "center",
  },
  hint: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowRadius: 4,
  },
  subHint: {
    color: "#fff",
    fontSize: 13,
    opacity: 0.85,
    textAlign: "center",
    marginTop: 4,
  },

  errorBanner: {
    backgroundColor: colors.danger,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  errorText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  shutterRow: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  shutter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
  },
  shutterLabel: {
    color: "#fff",
    marginTop: spacing.sm,
    fontWeight: "600",
    fontSize: 13,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowRadius: 3,
  },
});
