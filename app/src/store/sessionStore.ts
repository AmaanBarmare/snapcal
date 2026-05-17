import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const ONBOARDED_KEY = "snapcal.onboardedAt";

interface SessionState {
  onboardedAt: string | null;
  hydrating: boolean;
  hydrate: () => Promise<void>;
  markOnboarded: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
  onboardedAt: null,
  hydrating: true,
  hydrate: async () => {
    try {
      const v = await AsyncStorage.getItem(ONBOARDED_KEY);
      set({ onboardedAt: v, hydrating: false });
    } catch {
      set({ hydrating: false });
    }
  },
  markOnboarded: async () => {
    const now = new Date().toISOString();
    await AsyncStorage.setItem(ONBOARDED_KEY, now);
    set({ onboardedAt: now });
  },
  resetOnboarding: async () => {
    await AsyncStorage.removeItem(ONBOARDED_KEY);
    set({ onboardedAt: null });
  },
}));
