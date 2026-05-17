import { create } from "zustand";

export type CameraMode = "meal" | "fridge";

interface CameraState {
  mode: CameraMode;
  setMode: (m: CameraMode) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  mode: "meal",
  setMode: (mode) => set({ mode }),
}));
