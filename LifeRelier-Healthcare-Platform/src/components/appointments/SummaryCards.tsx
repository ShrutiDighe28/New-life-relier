import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useTheme } from '@/utils/themeManager';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

interface SummaryCardsProps {
    total: number;
    upcoming: number;
    booked: number;
    completed: number;
    cancelled: number;
}

export default function SummaryCards({ total, upcoming, booked, completed, cancelled }: SummaryCardsProps) {
    const { colors, isDark } = useTheme();

    const Card = ({ title, count, icon, color }: { title: string, count: number, icon: any, color: string }) => (
        <View style={[styles.card, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                <MaterialCommunityIcons name={icon} size={24} color={color} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.count, { color: colors.text }]}>{count}</Text>
                <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
            </View>
        </View>
    );

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
            <Card title="Total" count={total} icon="calendar-month" color={colors.primary} />
            <Card title="Upcoming" count={upcoming} icon="clock-outline" color="#3b82f6" />
            <Card title="Booked" count={booked} icon="calendar-check" color="#8b5cf6" />
            <Card title="Completed" count={completed} icon="check-circle-outline" color="#10b981" />
            <Card title="Cancelled" count={cancelled} icon="close-circle-outline" color="#ef4444" />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        gap: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        minWidth: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    textContainer: {
        justifyContent: 'center',
    },
    count: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    title: {
        fontSize: 13,
        fontWeight: '500',
    },
});
