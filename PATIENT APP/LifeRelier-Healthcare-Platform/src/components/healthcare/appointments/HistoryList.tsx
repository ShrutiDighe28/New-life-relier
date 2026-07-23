import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Appointment } from '@/context/AppointmentsContext';
import AppointmentDetailCard from './AppointmentDetailCard';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/utils/themeManager';

interface HistoryListProps {
    appointments: Appointment[];
    onView: (id: string) => void;
    onReschedule: (id: string) => void;
    onCancel: (id: string) => Promise<void>;
    isLoading?: boolean;
    ListHeaderComponent?: React.ReactElement | null;
    refreshControl?: React.ReactElement<any>;
}

export default function HistoryList({ appointments, onView, onReschedule, onCancel, isLoading = false, ListHeaderComponent = null, refreshControl }: HistoryListProps) {
    const { colors, isDark } = useTheme();

    const renderEmptyComponent = () => {
        if (isLoading) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                </View>
            );
        }

        return (
            <View style={styles.centerContainer}>
                <MaterialCommunityIcons name="calendar-remove" size={64} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Appointments Found</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                    There are no appointments matching your current filters.
                </Text>
            </View>
        );
    };

    return (
        <FlatList
            data={appointments}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={ListHeaderComponent}
            ListEmptyComponent={renderEmptyComponent}
            refreshControl={refreshControl}
            renderItem={({ item }) => (
                <AppointmentDetailCard
                    appointment={item}
                    onView={onView}
                    onReschedule={onReschedule}
                    onCancel={onCancel}
                />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingTop: 8,
        paddingBottom: 40,
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        minHeight: 300,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});
