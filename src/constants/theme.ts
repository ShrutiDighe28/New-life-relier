/**
 * Healthcare Platform Design System Theme
 */
import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#2563EB',      // Trustworthy Blue
    primaryLight: '#DCEBFF', // Soft Blue background
    primaryDark: '#0A48D6',  // Deep Blue
    
    secondary: '#0EA5E9',    // Accents
    
    background: '#FFFFFF',   // Clean White
    backgroundAlt: '#F8FAFC',// Off-white for sections
    
    text: '#0F172A',         // Slate 900 (High contrast)
    textSecondary: '#64748B',// Slate 500 (Subtitles)
    textMuted: '#94A3B8',    // Slate 400 (Placeholders)
    
    success: '#10B981',      // Emerald Green
    successLight: '#D1FAE5',
    warning: '#F59E0B',      // Amber
    warningLight: '#FEF3C7',
    error: '#EF4444',        // Red
    errorLight: '#FEE2E2',
    
    border: '#E2E8F0',       // Slate 200
    card: '#FFFFFF',
    backgroundElement: '#F1F5F9',
    backgroundSelected: '#E2E8F0',
  },
  dark: {
    primary: '#3B82F6',
    primaryLight: '#1E3A8A',
    primaryDark: '#60A5FA',
    
    secondary: '#38BDF8',
    
    background: '#0F172A',
    backgroundAlt: '#1E293B',
    
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    
    success: '#10B981',
    successLight: '#064E3B',
    warning: '#F59E0B',
    warningLight: '#78350F',
    error: '#EF4444',
    errorLight: '#7F1D1D',
    
    border: '#334155',
    card: '#1E293B',
    backgroundElement: '#334155',
    backgroundSelected: '#475569',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const MaxContentWidth = 1200;
export const BottomTabInset = 80;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'System',
    serif: 'serif',
    rounded: 'System',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: 4,
  one: 8,
  two: 16,
  three: 24,
  four: 32,
  five: 40,
  six: 48,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};
