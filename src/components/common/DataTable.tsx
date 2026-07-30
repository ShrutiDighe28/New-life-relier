import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/utils/themeManager';
import { RADIUS, SPACING, TYPOGRAPHY } from '@/constants/DesignSystem';
import StatusBadge, { StatusType } from './StatusBadge';

export interface Column<T> {
    key: string;
    title: string;
    width?: number | string;
    flex?: number;
    align?: 'left' | 'center' | 'right';
    render?: (item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (item: T, index: number) => string;
    onRowPress?: (item: T) => void;
    emptyText?: string;
    style?: ViewStyle;
}

export function DataTable<T extends Record<string, any>>({
    columns,
    data,
    keyExtractor,
    onRowPress,
    emptyText = 'No data available',
    style,
}: DataTableProps<T>) {
    const { colors, isDark } = useTheme();

    if (!data || data.length === 0) {
        return (
            <View style={[styles.emptyContainer, { borderColor: colors.cardBorder }]}>
                <MaterialCommunityIcons name="table-off" size={32} color={colors.textMuted} />
                <Text style={[TYPOGRAPHY.caption, { color: colors.textMuted, marginTop: SPACING.xs }]}>
                    {emptyText}
                </Text>
            </View>
        );
    }

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.container, style]}>
            <View style={{ minWidth: '100%' }}>
                {/* Header Row */}
                <View style={[styles.headerRow, { backgroundColor: isDark ? colors.surfaceVariant : '#F3F4F6', borderBottomColor: colors.border }]}>
                    {columns.map((col) => (
                        <View
                            key={col.key}
                            style={[
                                styles.cell,
                                col.width ? { width: typeof col.width === 'number' ? col.width : undefined } : { flex: col.flex || 1 },
                                { alignItems: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start' },
                            ]}
                        >
                            <Text style={[TYPOGRAPHY.captionBold, { color: colors.textSecondary }]}>
                                {col.title}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Data Rows */}
                {data.map((item, index) => {
                    const rowKey = keyExtractor(item, index);
                    const isEven = index % 2 === 0;
                    const rowBg = isEven
                        ? colors.card
                        : isDark
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'rgba(0, 0, 0, 0.015)';

                    const RowComponent = onRowPress ? TouchableOpacity : View;

                    return (
                        <RowComponent
                            key={rowKey}
                            onPress={onRowPress ? () => onRowPress(item) : undefined}
                            activeOpacity={0.7}
                            style={[
                                styles.dataRow,
                                {
                                    backgroundColor: rowBg,
                                    borderBottomColor: colors.divider,
                                },
                            ]}
                        >
                            {columns.map((col) => {
                                let content: React.ReactNode;

                                if (col.render) {
                                    content = col.render(item, index);
                                } else {
                                    const val = item[col.key];
                                    if (col.key === 'status' && typeof val === 'string') {
                                        content = <StatusBadge status={val as StatusType} size="sm" />;
                                    } else {
                                        content = (
                                            <Text
                                                style={[TYPOGRAPHY.body, { color: colors.text }]}
                                                numberOfLines={1}
                                            >
                                                {val !== undefined && val !== null ? String(val) : '-'}
                                            </Text>
                                        );
                                    }
                                }

                                return (
                                    <View
                                        key={col.key}
                                        style={[
                                            styles.cell,
                                            col.width ? { width: typeof col.width === 'number' ? col.width : undefined } : { flex: col.flex || 1 },
                                            { alignItems: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start' },
                                        ]}
                                    >
                                        {content}
                                    </View>
                                );
                            })}
                        </RowComponent>
                    );
                })}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: RADIUS.md,
        overflow: 'hidden',
    },
    headerRow: {
        flexDirection: 'row',
        paddingVertical: SPACING.sm + 2,
        paddingHorizontal: SPACING.md,
        borderBottomWidth: 1,
    },
    dataRow: {
        flexDirection: 'row',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    cell: {
        paddingHorizontal: SPACING.xs,
        justifyContent: 'center',
    },
    emptyContainer: {
        padding: SPACING.xxl,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: RADIUS.lg,
    },
});

export default DataTable;
