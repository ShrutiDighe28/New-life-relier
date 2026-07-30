import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import LogoBrand from '@/components/LogoBrand';
import { useTheme } from '@/utils/themeManager';
import { RADIUS, SPACING, TYPOGRAPHY } from '@/constants/DesignSystem';

export interface PageHeaderProps {
    portalName: 'Patient Portal' | 'Doctor Portal' | 'Admin Portal';
    portalIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
    pageTitle?: string;
    showBackButton?: boolean;
    onBackPress?: () => void;
    showThemeToggle?: boolean;
    showNotificationButton?: boolean;
    unreadCount?: number;
    onNotificationPress?: () => void;
    rightAction?: React.ReactNode;
    style?: ViewStyle;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    portalName,
    portalIcon = 'hospital-building',
    pageTitle,
    showBackButton = false,
    onBackPress,
    showThemeToggle = true,
    showNotificationButton = true,
    unreadCount = 0,
    onNotificationPress,
    rightAction,
    style,
}) => {
    const router = useRouter();
    const { colors, isDark, toggleTheme } = useTheme();

    const handleBack = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            router.back();
        }
    };

    return (
        <View
            style={[
                styles.header,
                {
                    backgroundColor: colors.background,
                    borderBottomColor: colors.divider,
                },
                style,
            ]}
        >
            <View style={styles.leftSection}>
                {showBackButton && (
                    <TouchableOpacity style={styles.iconBtn} onPress={handleBack} activeOpacity={0.7}>
                        <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
                    </TouchableOpacity>
                )}

                <View style={styles.brandBlock}>
                    <LogoBrand size={24} fontSize={16} />
                    <View style={styles.badgeRow}>
                        <View style={[styles.portalBadge, { backgroundColor: colors.badgeBg }]}>
                            <MaterialCommunityIcons name={portalIcon} size={11} color={colors.badgeText} />
                            <Text style={[styles.portalBadgeText, { color: colors.badgeText }]}>
                                {portalName}
                            </Text>
                        </View>

                        {pageTitle && (
                            <>
                                <View style={[styles.badgeDivider, { backgroundColor: colors.border }]} />
                                <Text
                                    style={[TYPOGRAPHY.captionBold, { color: colors.textSecondary }]}
                                    numberOfLines={1}
                                >
                                    {pageTitle}
                                </Text>
                            </>
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.rightSection}>
                {rightAction}

                {showThemeToggle && (
                    <TouchableOpacity style={styles.iconBtn} onPress={toggleTheme} activeOpacity={0.7}>
                        <MaterialCommunityIcons
                            name={isDark ? 'weather-sunny' : 'weather-night'}
                            size={20}
                            color={isDark ? '#FBBF24' : colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}

                {showNotificationButton && (
                    <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={onNotificationPress || (() => router.push('/notifications' as any))}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="bell-outline" size={20} color={colors.textSecondary} />
                        {unreadCount > 0 && (
                            <View style={[styles.unreadBadge, { backgroundColor: colors.error }]}>
                                <Text style={styles.unreadText}>
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        minHeight: 56,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    brandBlock: {
        flexDirection: 'column',
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    portalBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.xs + 2,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
        marginRight: SPACING.xs,
    },
    portalBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 3,
    },
    badgeDivider: {
        width: 1,
        height: 10,
        marginHorizontal: SPACING.xs,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.full,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    unreadBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        minWidth: 14,
        height: 14,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 2,
    },
    unreadText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '700',
    },
});

export default PageHeader;
