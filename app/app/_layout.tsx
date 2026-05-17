import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useSessionStore } from "@/store/sessionStore";

export default function RootLayout() {
  const hydrate = useSessionStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#FFFBF6" } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ presentation: "modal" }} />
          <Stack.Screen name="result/meal" options={{ presentation: "card" }} />
          <Stack.Screen name="result/fridge" options={{ presentation: "card" }} />
          <Stack.Screen name="result/recipes" options={{ presentation: "card" }} />
          <Stack.Screen name="result/instamart" options={{ presentation: "card" }} />
          <Stack.Screen name="result/order" options={{ presentation: "card" }} />
          <Stack.Screen name="swiggy-restaurants" options={{ presentation: "modal" }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
