// ─── LearnCraft Theme (Teal/Green Learning Platform) ──────────────────────────
export const colors = {
  // Primary teal/green
  primary: "#5A9B8E",
  primaryDark: "#4A8A7D",
  primaryLight: "#6AABA0",

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
  navy: "#0D1B2A",
  navyMid: "#112236",
  navyLight: "#1A3050",
  navyCard: "#142840",
  midnight: "#020817",
  midnightMid: "#0F172A",

  gold: "#E8A838",
  goldLight: "#F2C26A",
  goldDark: "#D4922A",
  goldPale: "rgba(232,168,56,0.10)",
  goldDim: "rgba(232,168,56,0.12)",
  goldSoft: "rgba(232,168,56,0.15)",
  goldBorder: "rgba(232,168,56,0.30)",

  cream: "#FAF7F2",
  white: "#FFFFFF",
  black: "#000000",
  ink: "#0D1B2A",

  muted: "#8A9BB0",
  mutedDark: "#5A7080",
  mutedSlate: "#64748B",
  mutedBg: "rgba(138,155,176,0.14)",

  border: "#E4EAF2",
  borderSoft: "#D9E2EE",
  borderSlate: "#E2E8F0",
  inputBg: "#F4F7FB",
  cardTint: "#EEF2F8",

  success: "#27AE60",
  successAlt: "#10B981",
  successPale: "rgba(39,174,96,0.10)",
  successBorder: "rgba(39,174,96,0.25)",

  error: "#E05252",
  errorAlt: "#EF4444",
  errorPale: "rgba(224,82,82,0.10)",
  errorBorder: "rgba(224,82,82,0.25)",

  warning: "#F59E0B",
  warningPale: "rgba(245,158,11,0.10)",
  warningBorder: "rgba(245,158,11,0.25)",
  warningBorderSoft: "rgba(245,158,11,0.22)",

  info: "#3B82F6",
  infoLight: "#4DA6FF",
  infoPale: "rgba(59,130,246,0.10)",
  infoBorder: "rgba(59,130,246,0.20)",

  purple: "#8B5CF6",
  purplePale: "rgba(139,92,246,0.10)",
  purpleBorder: "rgba(139,92,246,0.25)",

  glass: "rgba(255,255,255,0.06)",
  glassStrong: "rgba(255,255,255,0.05)",
  whiteMuted: "rgba(255,255,255,0.5)",
  whatsapp: "#25D366",
};

export const splashColors = {
  navy: {
    950: "#010409",
    900: "#020817",
    850: "#0A1120",
    800: "#0F172A",
    700: "#1E293B",
  },
  gold: {
    DEFAULT: "#E8A838",
    light: "#F4C566",
    dark: "#B47C1C",
    glow: "rgba(232, 168, 56, 0.35)",
    gradient: ["#F4C566", "#E8A838", "#B47C1C"] as const,
  },
  white: "#FFFFFF",
  muted: "rgba(255, 255, 255, 0.5)",
  subtle: "rgba(255, 255, 255, 0.1)",
  accent: "rgba(232, 168, 56, 0.15)",
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
