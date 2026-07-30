import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '@/utils/themeManager';
import { RADIUS, SPACING, TYPOGRAPHY } from '@/constants/DesignSystem';

export type StatusType = 
    | 'active' | 'completed' | 'pending' | 'cancelled' 
    | 'emergency' | 'urgent' | 'in_progress' | 'scheduled' 
    | 'approved' | 'rejected' | 'success' | 'warning' | 'error' | 'info';

interface StatusBadgeProps {
    status: StatusType | string;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    label,
    size = 'md',
    style,
}) => {
    const { colors, isDark } = useTheme();

    const normalizedStatus = (status || '').toLowerCase().replace(' ', '_');

    const getStatusColors = (): { bg: string; text: string; border?: string } => {
        switch (normalizedStatus) {
            case 'active':
            case 'completed':
            case 'approved':
            case 'success':
                return {
                    bg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                    text: isDark ? '#60A5FA' : '#1D4ED8',
                    border: isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE',
                };
            case 'pending':
            case 'scheduled':
            case 'in_progress':
            case 'warning':
                return {
                    bg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
                    text: isDark ? '#FBBF24' : '#92400E',
                    border: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A',
                };
            case 'emergency':
            case 'urgent':
            case 'cancelled':
            case 'rejected':
            case 'error':
                return {
                    bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
                    text: isDark ? '#F87171' : '#991B1B',
                    border: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FCA5A5',
                };
            case 'info':
            default:
                return {
                    bg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                    text: isDark ? '#60A5FA' : '#1E40AF',
                    border: isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE',
                };
        }
    };

    const palette = getStatusColors();

    const displayLabel = label || normalizedStatus.replace('_', ' ').toUpperCase();

    const sizeStyles = {
        sm: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10 },
        md: { paddingHorizontal: 10, paddingVertical: 4, fontSize: 11 },
        lg: { paddingHorizontal: 14, paddingVertical: 6, fontSize: 12 },
    }[size];

    return (
        <View
            style={[
                styles.badge,
                {
                    backgroundColor: palette.bg,
                    borderColor: palette.border || 'transparent',
                    paddingHorizontal: sizeStyles.paddingHorizontal,
                    paddingVertical: sizeStyles.paddingVertical,
                },
                style,
            ]}
        >
            <Text
                style={[
                    TYPOGRAPHY.badge,
                    {
                        color: palette.text,
                        fontSize: sizeStyles.fontSize,
                    },
                ]}
            >
                {displayLabel}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        borderRadius: RADIUS.full,
        borderWidth: 1,
        alignSelf: 'flex-start',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default StatusBadge;
