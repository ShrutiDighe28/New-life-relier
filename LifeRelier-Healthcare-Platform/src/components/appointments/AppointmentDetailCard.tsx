import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/utils/themeManager';
import { Appointment } from '@/context/AppointmentsContext';
import { getSpecialtyColor } from '@/utils/calendarUtils';

interface AppointmentDetailCardProps {
    appointment: Appointment;
    onView: (id: string) => void;
    onReschedule: (id: string) => void;
    onCancel: (id: string) => Promise<void>;
}

export default function AppointmentDetailCard({ appointment, onView, onReschedule, onCancel }: AppointmentDetailCardProps) {
    const { colors, isDark } = useTheme();
    const [isCancelling, setIsCancelling] = useState(false);

    const specialtyColor = getSpecialtyColor(appointment.specialty);
    const isCompleted = appointment.status === 'completed';
    const isCancelled = appointment.status === 'cancelled';
    const isUpcoming = appointment.status === 'upcoming';

    let statusColor = colors.primary;
    let statusBg = `${colors.primary}15`;
    let statusText = 'Upcoming';

    if (isCompleted) {
        statusColor = '#10b981';
        statusBg = '#10b98115';
        statusText = 'Completed';
    } else if (isCancelled) {
        statusColor = '#ef4444';
        statusBg = '#ef444415';
        statusText = 'Cancelled';
    }

    const handleCancel = async () => {
        setIsCancelling(true);
        try {
            await onCancel(appointment.id);
        } finally {
            setIsCancelling(false);
        }
    };

    const avatarSource = appointment.avatar
        ? (typeof appointment.avatar === 'number' ? appointment.avatar : (typeof appointment.avatar === 'string' ? { uri: appointment.avatar } : appointment.avatar))
        : { uri: 'https://via.placeholder.com/150' };

    return (
        <View style={[styles.card, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}>
            <View style={styles.header}>
                <View style={styles.doctorInfo}>
                    <Image 
                        source={avatarSource} 
                        style={styles.avatar} 
                    />
                    <View style={styles.doctorDetails}>
                        <Text style={[styles.doctorName, { color: colors.text }]}>{appointment.doctorName}</Text>
                        <Text style={[styles.specialty, { color: colors.textSecondary }]}>{appointment.specialty}</Text>
                        <View style={styles.locationContainer}>
                            <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.textSecondary} />
                            <Text style={[styles.clinic, { color: colors.textSecondary }]}>
                                {appointment.clinic || 'Main Branch'}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]} />

            <View style={styles.dateTimeContainer}>
                <View style={styles.dateTimeBlock}>
                    <MaterialCommunityIcons name="calendar-month-outline" size={20} color={specialtyColor} />
                    <View style={styles.dateTimeTextContainer}>
                        <Text style={[styles.dateTimeLabel, { color: colors.textSecondary }]}>Date</Text>
                        <Text style={[styles.dateTimeValue, { color: colors.text }]}>{appointment.date.split(" • ")[0]}</Text>
                    </View>
                </View>
                <View style={styles.dateTimeBlock}>
                    <MaterialCommunityIcons name="clock-outline" size={20} color={specialtyColor} />
                    <View style={styles.dateTimeTextContainer}>
                        <Text style={[styles.dateTimeLabel, { color: colors.textSecondary }]}>Time</Text>
                        <Text style={[styles.dateTimeValue, { color: colors.text }]}>{appointment.date.split(" • ")[1] || ""}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: `${colors.primary}15` }]}
                    onPress={() => onView(appointment.id)}
                >
                    <Text style={[styles.actionButtonText, { color: colors.primary }]}>View Details</Text>
                </TouchableOpacity>

                {isUpcoming && (
                    <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: `${colors.primary}15` }]}
                        onPress={() => onReschedule(appointment.id)}
                    >
                        <Text style={[styles.actionButtonText, { color: colors.primary }]}>Reschedule</Text>
                    </TouchableOpacity>
                )}

                {isUpcoming && (
                    <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: '#ef444415' }]}
                        onPress={handleCancel}
                        disabled={isCancelling}
                    >
                        {isCancelling ? (
                            <ActivityIndicator size="small" color="#ef4444" />
                        ) : (
                            <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Cancel</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    doctorInfo: {
        flexDirection: 'row',
        flex: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    doctorDetails: {
        flex: 1,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    specialty: {
        fontSize: 14,
        marginBottom: 4,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    clinic: {
        fontSize: 12,
        marginLeft: 4,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginVertical: 16,
    },
    dateTimeContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    dateTimeBlock: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateTimeTextContainer: {
        marginLeft: 8,
    },
    dateTimeLabel: {
        fontSize: 12,
    },
    dateTimeValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
