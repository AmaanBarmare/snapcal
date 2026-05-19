/**
 * SnapCal design tokens — from stitch_snapcal_mobile_ui_design/snapcal/DESIGN.md
 */

export const colors = {
  background: "#fff8f5",
  surface: "#fff8f5",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#fff1ea",
  surfaceContainer: "#ffeadf",
  surfaceContainerHigh: "#fae4d8",
  surfaceContainerHighest: "#f4ded3",
  surfaceVariant: "#f4ded3",

  onBackground: "#241912",
  onSurface: "#241912",
  onSurfaceVariant: "#574236",

  primary: "#984800",
  primaryContainer: "#fc8019",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#5e2a00",

  secondary: "#6e5b48",
  secondaryContainer: "#f8dec5",
  onSecondaryContainer: "#74614d",

  tertiary: "#006590",
  tertiaryContainer: "#00adf3",

  outline: "#8b7264",
  outlineVariant: "#dec1b0",

  error: "#ba1a1a",
  errorContainer: "#ffdad6",

  success: "#16a34a",
  successSoft: "#dcfce7",
  warning: "#d97706",
  warningSoft: "#fef3c7",

  // Macro ring semantics (Stitch mapping)
  ringTrack: "#ffeadf",
  ringCalories: "#fc8019",
  ringProtein: "#006590",
  ringCarbs: "#984800",
  ringFat: "#6e5b48",
  ringFibre: "#6e5b48",

  overlayDark: "rgba(15, 16, 20, 0.55)",

  // Legacy aliases used across the app
  bg: "#fff8f5",
  bgElevated: "#ffffff",
  text: "#241912",
  textMuted: "#574236",
  textInverse: "#ffffff",
  border: "#dec1b0",
  borderStrong: "#8b7264",
  brand: "#984800",
  brandAccent: "#fc8019",
  brandAccentSoft: "#f8dec5",
  danger: "#ba1a1a",
  dangerSoft: "#ffdad6",
};

export const spacing = {
  gridMargin: 20,
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
  card: 16,
  shutter: 40,
};

export const shadow = {
  ambient: {
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  elevated: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  tabBar: {
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  /** @deprecated use shadow.ambient */
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
};

export const fontFamily = {
  regular: "PlusJakartaSans_400Regular",
  bold: "PlusJakartaSans_700Bold",
  extraBold: "PlusJakartaSans_800ExtraBold",
};

export const type = {
  displayCalories: {
    fontFamily: fontFamily.extraBold,
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: -0.96,
  },
  headlineLg: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.28,
  },
  headlineMd: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    lineHeight: 26,
  },
  bodyLg: {
    fontFamily: fontFamily.regular,
    fontSize: 17,
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 20,
  },
  labelCaps: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: "uppercase" as const,
  },
  macroNumber: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    lineHeight: 22,
  },
};
