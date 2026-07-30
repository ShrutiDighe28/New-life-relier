import { Dimensions, Platform } from 'react-native';
import '@/global.css';

const { width } = Dimensions.get('window');

// Original theme exports
export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

// New design tokens exports
export const COLORS = {
  primaryBlue: '#2563EB',
  primaryRed: '#EF4444',
  background: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E5E7EB',
  primaryText: '#0F172A',
  secondaryText: '#64748B',
  success: '#22C55E',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const SIZES = {
  radius: 20,
  screenWidth: width,
};

export const SHADOWS = {
  soft: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 24,
    fontWeight: '800' as const,
  },
  h2: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  body: {
    fontSize: 14,
  },
  caption: {
    fontSize: 12,
  },
};
