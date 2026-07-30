import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const RADIUS = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
};

export const TYPOGRAPHY = {
    h1: { fontSize: 28, fontWeight: '700' as TextStyle['fontWeight'], letterSpacing: -0.5 },
    h2: { fontSize: 22, fontWeight: '700' as TextStyle['fontWeight'], letterSpacing: -0.3 },
    h3: { fontSize: 18, fontWeight: '600' as TextStyle['fontWeight'], letterSpacing: -0.2 },
    subtitle: { fontSize: 16, fontWeight: '600' as TextStyle['fontWeight'] },
    body: { fontSize: 14, fontWeight: '400' as TextStyle['fontWeight'] },
    bodyBold: { fontSize: 14, fontWeight: '600' as TextStyle['fontWeight'] },
    caption: { fontSize: 12, fontWeight: '400' as TextStyle['fontWeight'] },
    captionBold: { fontSize: 12, fontWeight: '600' as TextStyle['fontWeight'] },
    badge: { fontSize: 11, fontWeight: '600' as TextStyle['fontWeight'], letterSpacing: 0.3 },
};

export const SHADOWS = {
    sm: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    md: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
};
