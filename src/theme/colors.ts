// ─── LearnCraft Theme (Gold/Navy Learning Platform) ──────────────────────────
export const colors = {
  // Primary navy
  primary: "#0D1B2A",
  primaryDark: "#020817",
  primaryLight: "#1A3050",

  // Neutrals
  white: "#FFFFFF",
  black: "#000000",
  background: "#F8F9FA",
  surface: "#FFFFFF",

  gray: {
    50: "#F8F9FA",
    100: "#F1F3F5",
    200: "#E9ECEF",
    300: "#DEE2E6",
    400: "#ADB5BD",
    500: "#6C757D",
    600: "#495057",
    700: "#343A40",
    800: "#212529",
    900: "#1A1D20",
  },

  // Semantic colors
  success: "#28A745",
  error: "#DC3545",
  warning: "#FFC107",
  info: "#17A2B8",

  // Additional
  text: {
    primary: "#212529",
    secondary: "#6C757D",
    disabled: "#ADB5BD",
    hint: "#868E96",
  },

  // Badge colors
  badge: {
    linguist: "#E3F2FD",
    linguistText: "#1976D2",
  },
};

// Shared color tokens for app screens (app/*)
export const appColors = {
  navy: colors.primary,
  navyMid: colors.primaryLight,
  navyLight: "#243B53",
  navyCard: "#112236",
  midnight: colors.primaryDark,
  midnightMid: "#0F172A",

  // Gold accents for highlighted actions and emphasis.
  gold: "#E8A838",
  goldLight: "#F2C26A",
  goldDark: "#D4922A",
  goldPale: "rgba(232,168,56,0.10)",
  goldDim: "rgba(232,168,56,0.12)",
  goldSoft: "rgba(232,168,56,0.15)",
  goldBorder: "rgba(232,168,56,0.30)",

  cream: colors.background,
  white: colors.white,
  black: colors.black,
  ink: colors.text.primary,

  muted: colors.text.hint,
  mutedDark: colors.text.secondary,
  mutedSlate: colors.gray[600],
  mutedBg: "rgba(108,117,125,0.14)",

  border: colors.gray[200],
  borderSoft: colors.gray[300],
  borderSlate: colors.gray[200],
  inputBg: colors.gray[100],
  cardTint: colors.gray[50],

  success: colors.success,
  successAlt: "#20A070",
  successPale: "rgba(40,167,69,0.10)",
  successBorder: "rgba(40,167,69,0.25)",

  error: colors.error,
  errorAlt: "#C9303E",
  errorPale: "rgba(220,53,69,0.10)",
  errorBorder: "rgba(220,53,69,0.25)",

  warning: colors.warning,
  warningPale: "rgba(255,193,7,0.10)",
  warningBorder: "rgba(255,193,7,0.25)",
  warningBorderSoft: "rgba(255,193,7,0.22)",

  info: colors.info,
  infoLight: "#4BB5C6",
  infoPale: "rgba(23,162,184,0.10)",
  infoBorder: "rgba(23,162,184,0.20)",

  purple: colors.primaryLight,
  purplePale: "rgba(26,48,80,0.10)",
  purpleBorder: "rgba(26,48,80,0.25)",

  glass: "rgba(255,255,255,0.28)",
  glassStrong: "rgba(255,255,255,0.42)",
  whiteMuted: "rgba(255,255,255,0.65)",
  whatsapp: "#25D366",
};

export const splashColors = {
  navy: {
    950: "#010409",
    900: "#020817",
    850: "#0A1120",
    800: "#0D1B2A",
    700: "#1A3050",
  },
  gold: {
    DEFAULT: appColors.gold,
    light: appColors.goldLight,
    dark: appColors.goldDark,
    glow: "rgba(232,168,56,0.35)",
    gradient: [
      appColors.goldLight,
      appColors.gold,
      appColors.goldDark,
    ] as const,
  },
  white: colors.white,
  muted: "rgba(255, 255, 255, 0.72)",
  subtle: "rgba(255, 255, 255, 0.14)",
  accent: "rgba(232,168,56,0.15)",
};

// ─── Typography (Manrope) ─────────────────────────────────────────────────────
export const fonts = {
  regular: "Manrope_400Regular",
  medium: "Manrope_500Medium",
  semiBold: "Manrope_600SemiBold",
  bold: "Manrope_700Bold",
  extraBold: "Manrope_800ExtraBold",
};

export const typography = {
  h1: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 36,
  },
  h2: {
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  h4: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  body1: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  body2: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
};
