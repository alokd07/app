// ─── LearnCraft Theme (Teal/Green Learning Platform) ──────────────────────────
export const colors = {
  // Primary teal/green
  primary: '#5A9B8E',
  primaryDark: '#4A8A7D',
  primaryLight: '#6AABA0',
  
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  
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
  success: '#28A745',
  error: '#DC3545',
  warning: '#FFC107',
  info: '#17A2B8',
  
  // Additional
  text: {
    primary: '#212529',
    secondary: '#6C757D',
    disabled: '#ADB5BD',
    hint: '#868E96',
  },
  
  // Badge colors
  badge: {
    linguist: '#E3F2FD',
    linguistText: '#1976D2',
  },
};

// ─── Typography (Manrope) ─────────────────────────────────────────────────────
export const fonts = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semiBold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extraBold: 'Manrope_800ExtraBold',
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
