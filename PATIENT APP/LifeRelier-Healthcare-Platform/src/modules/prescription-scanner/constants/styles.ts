import { Platform } from 'react-native';

export const SHADOW_STYLES = {
  small: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
    web: {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    },
  }),
  medium: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    web: {
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.08)',
    },
  }),
};

export const HIT_SLOP = {
  small: { top: 10, bottom: 10, left: 10, right: 10 },
  medium: { top: 15, bottom: 15, left: 15, right: 15 },
};
