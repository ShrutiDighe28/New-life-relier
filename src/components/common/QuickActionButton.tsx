import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/utils/themeManager';
import { RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '@/constants/DesignSystem';

export interface QuickActionButtonProps {
    title: string;
    description?: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    onPress: () => void;
    accentColor?: string;
    style?: ViewStyle;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
    title,
    description,
    icon,
    onPress,
    accentColor,
    style,
}) => {
    const { colors, isDark } = useTheme();

    const activeAccent = accentColor || colors.primary;
    const activeBg = isDark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5';

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                },
                SHADOWS.sm,
                style,
            ]}
            onPress={onPress}
            activeOpacity={0.75}
        >
            <View style={[styles.iconContainer, { backgroundColor: activeBg }]}>
                <MaterialCommunityIcons name={icon} size={24} color={activeAccent} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[TYPOGRAPHY.bodyBold, { color: colors.text }]} numberOfLines={1}>
                    {title}
                </Text>
                {description && (
                    <Text style={[TYPOGRAPHY.caption, { color: colors.textMuted, marginTop: 2 }]} numberOfLines={1}>
                        {description}
                    </Text>
                )}
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        marginVertical: SPACING.xs,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    textContainer: {
        flex: 1,
    },
});

export default QuickActionButton;
