import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/utils/themeManager';
import { RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '@/constants/DesignSystem';

export interface StatCardProps {
    title: string;
    value: string | number;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    iconColor?: string;
    iconBg?: string;
    trend?: {
        value: string;
        isPositive?: boolean;
        label?: string;
    };
    subtitle?: string;
    onPress?: () => void;
    style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    iconColor,
    iconBg,
    trend,
    subtitle,
    onPress,
    style,
}) => {
    const { colors, isDark } = useTheme();

    const cardIconColor = iconColor || colors.primary;
    const cardIconBg = iconBg || (isDark ? 'rgba(16, 185, 129, 0.15)' : '#D1FAE5');

    const Content = (
        <View style={styles.contentContainer}>
            <View style={styles.topRow}>
                <View style={[styles.iconBox, { backgroundColor: cardIconBg }]}>
                    <MaterialCommunityIcons name={icon} size={22} color={cardIconColor} />
                </View>
                {trend && (
                    <View
                        style={[
                            styles.trendBadge,
                            {
                                backgroundColor: trend.isPositive
                                    ? isDark
                                        ? 'rgba(16, 185, 129, 0.15)'
                                        : '#D1FAE5'
                                    : isDark
                                    ? 'rgba(239, 68, 68, 0.15)'
                                    : '#FEE2E2',
                            },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name={trend.isPositive ? 'arrow-up-thin' : 'arrow-down-thin'}
                            size={14}
                            color={
                                trend.isPositive
                                    ? isDark
                                        ? '#34D399'
                                        : '#065F46'
                                    : isDark
                                    ? '#F87171'
                                    : '#991B1B'
                            }
                        />
                        <Text
                            style={[
                                TYPOGRAPHY.captionBold,
                                {
                                    fontSize: 11,
                                    color: trend.isPositive
                                        ? isDark
                                            ? '#34D399'
                                            : '#065F46'
                                        : isDark
                                        ? '#F87171'
                                        : '#991B1B',
                                },
                            ]}
                        >
                            {trend.value}
                        </Text>
                    </View>
                )}
            </View>

            <Text style={[TYPOGRAPHY.h2, { color: colors.text, marginTop: SPACING.sm }]}>
                {value}
            </Text>

            <Text style={[TYPOGRAPHY.captionBold, { color: colors.textSecondary, marginTop: 2 }]}>
                {title}
            </Text>

            {subtitle && (
                <Text style={[TYPOGRAPHY.caption, { color: colors.textMuted, marginTop: 4 }]}>
                    {subtitle}
                </Text>
            )}
        </View>
    );

    const containerStyle = [
        styles.card,
        {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
        },
        SHADOWS.sm,
        style,
    ];

    if (onPress) {
        return (
            <TouchableOpacity style={containerStyle} onPress={onPress} activeOpacity={0.75}>
                {Content}
            </TouchableOpacity>
        );
    }

    return <View style={containerStyle}>{Content}</View>;
};

const styles = StyleSheet.create({
    card: {
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        padding: SPACING.lg,
        flex: 1,
        minWidth: 140,
    },
    contentContainer: {
        flexDirection: 'column',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.xs + 2,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
    },
});

export default StatCard;
