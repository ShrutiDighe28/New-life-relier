import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/utils/themeManager';
import { RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '@/constants/DesignSystem';

export interface SectionCardProps {
    title: string;
    subtitle?: string;
    icon?: keyof typeof MaterialCommunityIcons.glyphMap;
    actionLabel?: string;
    onActionPress?: () => void;
    children: React.ReactNode;
    style?: ViewStyle;
    noPadding?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({
    title,
    subtitle,
    icon,
    actionLabel,
    onActionPress,
    children,
    style,
    noPadding = false,
}) => {
    const { colors } = useTheme();

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                },
                SHADOWS.sm,
                style,
            ]}
        >
            <View style={[styles.header, { borderBottomColor: colors.divider }]}>
                <View style={styles.titleContainer}>
                    {icon && (
                        <MaterialCommunityIcons
                            name={icon}
                            size={20}
                            color={colors.primary}
                            style={{ marginRight: SPACING.sm }}
                        />
                    )}
                    <View>
                        <Text style={[TYPOGRAPHY.h3, { color: colors.text }]}>{title}</Text>
                        {subtitle && (
                            <Text style={[TYPOGRAPHY.caption, { color: colors.textMuted, marginTop: 2 }]}>
                                {subtitle}
                            </Text>
                        )}
                    </View>
                </View>
                {actionLabel && onActionPress && (
                    <TouchableOpacity
                        onPress={onActionPress}
                        style={styles.actionBtn}
                        activeOpacity={0.7}
                    >
                        <Text style={[TYPOGRAPHY.captionBold, { color: colors.primary }]}>
                            {actionLabel}
                        </Text>
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={16}
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                )}
            </View>

            <View style={noPadding ? null : styles.body}>{children}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        overflow: 'hidden',
        marginVertical: SPACING.sm,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    body: {
        padding: SPACING.lg,
    },
});

export default SectionCard;
