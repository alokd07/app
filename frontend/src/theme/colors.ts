// ─── Primary Palette (Navy + Gold Premium Theme) ─────────────────────────────
export const colors = {
  // Primary colors
  primary: '#E8A838',        // Gold
  primaryDark: '#D4922A',    // Dark gold
  primaryLight: '#F2C26A',   // Light gold
  
  // Navy shades
  navy: '#0D1B2A',
  navyMid: '#112236',
  navyLight: '#1A3050',
  
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  cream: '#FAF7F2',
  ink: '#0D1B2A',
  
  gray: {
    50: '#F8F9FA',
    100: '#F1F3F5',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#ADB5BD',
    500: '#6C757D',
    600: '#495057',
    700: '#343A40',
    800: '#212529',
    900: '#1A1D20',
  },
  
  // Semantic colors
  success: '#27AE60',
  error: '#E05252',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Additional
  muted: '#8A9BB0',
  border: '#D9E2EE',
  inputBg: '#F4F7FB',
  goldPale: '#FDF3DC',
  
  // Legacy teal (for gradual migration)
  teal: {
    50: '#F0F9F7',
    100: '#D1F0E8',
    200: '#A3E1D1',
    300: '#75D2BA',
    400: '#47C3A3',
    500: '#2D7A6B',
    600: '#246158',
    700: '#1B4945',
    800: '#123132',
    900: '#09191F',
  },
};

// ─── Typography System (Manrope) ──────────────────────────────────────────────
export const fonts = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semiBold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extraBold: 'Manrope_800ExtraBold',
};

export const typography = {
  h1: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.8,
  },
  h2: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  h3: {
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 32,
  },
  h4: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  h5: {
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
  button: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
  },
};

// ─── Design Tokens ────────────────────────────────────────────────────────────
export const palette = {
  navy: '#0D1B2A',
  navyMid: '#112236',
  navyLight: '#1A3050',
  gold: '#E8A838',
  goldLight: '#F2C26A',
  goldPale: '#FDF3DC',
  cream: '#FAF7F2',
  white: '#FFFFFF',
  ink: '#0D1B2A',
  muted: '#8A9BB0',
  border: '#D9E2EE',
  inputBg: '#F4F7FB',
};
