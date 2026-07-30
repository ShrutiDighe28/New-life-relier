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

const CARD_DATA: { key: keyof Omit<SummaryCardsProps, never>; title: string; icon: any; color: string; darkBg: string; lightBg: string }[] = [
    { key: 'total', title: 'Total', icon: 'calendar-month', color: '#6366F1', darkBg: '#312E81', lightBg: '#EEF2FF' },
    { key: 'upcoming', title: 'Upcoming', icon: 'clock-fast', color: '#2563EB', darkBg: '#1E3A8A', lightBg: '#EFF6FF' },
    { key: 'booked', title: 'Booked', icon: 'calendar-check', color: '#7C3AED', darkBg: '#4C1D95', lightBg: '#F5F3FF' },
    { key: 'completed', title: 'Completed', icon: 'check-decagram', color: '#10B981', darkBg: '#064E3B', lightBg: '#ECFDF5' },
    { key: 'cancelled', title: 'Cancelled', icon: 'close-circle', color: '#EF4444', darkBg: '#7F1D1D', lightBg: '#FEF2F2' },
];

export default function SummaryCards({ total, upcoming, booked, completed, cancelled }: SummaryCardsProps) {
    const { colors, isDark } = useTheme();
    const values: Record<string, number> = { total, upcoming, booked, completed, cancelled };

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
            decelerationRate="fast"
            snapToInterval={140}
        >
            {CARD_DATA.map((card) => (
                <View
                    key={card.key}
                    style={[
                        styles.card,
                        { backgroundColor: isDark ? card.darkBg : card.lightBg },
                    ]}
                >
                    <View style={[styles.iconCircle, { backgroundColor: `${card.color}20` }]}>
                        <MaterialCommunityIcons name={card.icon} size={22} color={card.color} />
                    </View>
                    <Text style={[styles.count, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                        {values[card.key] ?? 0}
                    </Text>
                    <Text style={[styles.title, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                        {card.title}
                    </Text>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    card: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 14,
        borderRadius: 20,
        minWidth: 128,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    count: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 2,
    },
    title: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
});
