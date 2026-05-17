/**
 * Design tokens for SnapCal.
 *
 * Brand palette intentionally leans on Indian warmth + Swiggy's saffron
 * accent so the Powered-by-Swiggy badge feels integrated, not bolted on.
 */

export const colors = {
  bg: "#FFFBF6",
  bgElevated: "#FFFFFF",
  text: "#1A1B1F",
  textMuted: "#6B6E78",
  textInverse: "#FFFFFF",
  border: "#E8E1D2",
  borderStrong: "#CFC6B0",

  brand: "#1A1B1F",
  brandAccent: "#FC8019",      // Swiggy saffron — co-branding signal
  brandAccentSoft: "#FFE5CC",

  success: "#16A34A",
  successSoft: "#DCFCE7",
  warning: "#D97706",
  warningSoft: "#FEF3C7",
  danger: "#DC2626",
  dangerSoft: "#FEE2E2",

  ringTrack: "#EFEAE0",
  ringCalories: "#FC8019",
  ringProtein: "#16A34A",
  ringCarbs: "#D97706",
  ringFat: "#7C3AED",

  overlayDark: "rgba(15, 16, 20, 0.55)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const font = {
  number: "System",
  body: "System",
};

export const shadow = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
};
