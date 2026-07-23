import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
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

/** Generate initials from doctor name e.g. "Dr. James Anderson" → "JA" */
const getInitials = (name: string): string => {
    const parts = name.replace(/^Dr\.?\s*/i, '').trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    if (parts.length === 1 && parts[0].length > 0) return parts[0][0].toUpperCase();
    return '?';
};

/** Get a consistent color for initials avatar based on name hash */
const getAvatarColor = (name: string): string => {
    const avatarColors = ['#6366F1', '#2563EB', '#7C3AED', '#0891B2', '#059669', '#D97706'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
};

export default function AppointmentDetailCard({ appointment, onView, onReschedule, onCancel }: AppointmentDetailCardProps) {
    const { colors, isDark } = useTheme();
    const [isCancelling, setIsCancelling] = useState(false);

    const specialtyColor = getSpecialtyColor(appointment.specialty);
    const isCompleted = appointment.status === 'completed';
    const isCancelled = appointment.status === 'cancelled';
    const isUpcoming = appointment.status === 'upcoming';

    // Status config
    let statusIcon: any = 'clock-outline';
    let statusColor = colors.primary;
    let statusBg = `${colors.primary}15`;
    let statusText = appointment.tag || 'Upcoming';

    if (isCompleted) {
        statusIcon = 'check-circle';
        statusColor = '#10B981';
        statusBg = '#10B98115';
        statusText = 'Completed';
    } else if (isCancelled) {
        statusIcon = 'close-circle';
        statusColor = '#EF4444';
        statusBg = '#EF444415';
        statusText = 'Cancelled';
    } else if (appointment.tag === 'Rescheduled') {
        statusIcon = 'calendar-sync';
        statusColor = '#7C3AED';
        statusBg = '#7C3AED15';
        statusText = 'Rescheduled';
    }

    const handleCancel = () => {
        Alert.alert(
            'Cancel Appointment',
            `Are you sure you want to cancel your appointment with ${appointment.doctorName}?`,
            [
                { text: 'Keep Appointment', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        setIsCancelling(true);
                        try {
                            await onCancel(appointment.id);
                        } finally {
                            setIsCancelling(false);
                        }
                    },
                },
            ]
        );
    };

    const initials = getInitials(appointment.doctorName);
    const avatarBgColor = getAvatarColor(appointment.doctorName);
    const [datePart, timePart] = (appointment.date || '').split(' • ');

    // Format appointment ID display
    const displayId = appointment.appointmentId
        ? `APT-${String(appointment.appointmentId).padStart(4, '0')}`
        : `APT-${appointment.id.slice(-6).toUpperCase()}`;

    return (
        <View style={[styles.card, {
            backgroundColor: isDark ? colors.card : '#FFFFFF',
            borderColor: isDark ? '#334155' : '#E2E8F0',
            borderLeftColor: specialtyColor,
        }]}>
            {/* Top row: Doctor info + status badge */}
            <View style={styles.topRow}>
                <View style={styles.doctorRow}>
                    {/* Initials Avatar */}
                    <View style={[styles.avatar, { backgroundColor: avatarBgColor }]}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <View style={styles.doctorMeta}>
                        <Text style={[styles.doctorName, { color: colors.text }]} numberOfLines={1}>
                            {appointment.doctorName}
                        </Text>
                        <Text style={[styles.specialty, { color: specialtyColor }]}>
                            {appointment.specialty}
                        </Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                    <MaterialCommunityIcons name={statusIcon} size={14} color={statusColor} />
                    <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                </View>
            </View>

            {/* Info grid: ID, Clinic, Date, Time */}
            <View style={[styles.infoGrid, { borderColor: isDark ? '#334155' : '#F1F5F9' }]}>
                <View style={styles.infoItem}>
                    <MaterialCommunityIcons name="pound" size={16} color={colors.textSecondary} />
                    <View style={styles.infoTextBlock}>
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Appointment ID</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>{displayId}</Text>
                    </View>
                </View>

                <View style={styles.infoItem}>
                    <MaterialCommunityIcons name="hospital-building" size={16} color={colors.textSecondary} />
                    <View style={styles.infoTextBlock}>
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Clinic</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
                            {appointment.clinic || 'Main Branch'}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoItem}>
                    <MaterialCommunityIcons name="calendar-month-outline" size={16} color={colors.textSecondary} />
                    <View style={styles.infoTextBlock}>
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Date</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>{datePart || '—'}</Text>
                    </View>
                </View>

                <View style={styles.infoItem}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textSecondary} />
                    <View style={styles.infoTextBlock}>
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Time</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>{timePart || '—'}</Text>
                    </View>
                </View>

                {appointment.insurance && (
                    <View style={styles.infoItem}>
                        <MaterialCommunityIcons name="shield-check-outline" size={16} color={colors.textSecondary} />
                        <View style={styles.infoTextBlock}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Insurance</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{appointment.insurance}</Text>
                        </View>
                    </View>
                )}

                {appointment.consultationFee && (
                    <View style={styles.infoItem}>
                        <MaterialCommunityIcons name="cash" size={16} color={colors.textSecondary} />
                        <View style={styles.infoTextBlock}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Fee</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{appointment.consultationFee}</Text>
                        </View>
                    </View>
                )}

                {appointment.symptoms && (
                    <View style={[styles.infoItem, { width: '100%', marginTop: 6 }]}>
                        <MaterialCommunityIcons name="clipboard-text-outline" size={16} color={colors.textSecondary} />
                        <View style={styles.infoTextBlock}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Symptoms / Reason</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={2}>{appointment.symptoms}</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Primary Action Banner: Video Call or Check-in (if upcoming) */}
            {isUpcoming && appointment.hasVideo && (
                <TouchableOpacity
                    style={[
                        styles.primaryBanner,
                        {
                            backgroundColor: isDark ? '#059669' : '#10B981',
                            shadowColor: '#10B981',
                        }
                    ]}
                    onPress={() => Alert.alert("Video Call", "Joining virtual consultation room...")}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Join Telemedicine Video Call"
                >
                    <View style={styles.primaryBannerLeft}>
                        <View style={styles.iconBadge}>
                            <MaterialCommunityIcons name="video" size={20} color="#FFFFFF" />
                        </View>
                        <View style={styles.primaryBannerText}>
                            <Text style={styles.primaryBannerTitle}>Join Video Call</Text>
                            <Text style={styles.primaryBannerSub}>Virtual Consultation Room Ready</Text>
                        </View>
                    </View>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            )}

            {isUpcoming && !appointment.hasVideo && (
                <TouchableOpacity
                    style={[
                        styles.primaryBanner,
                        {
                            backgroundColor: isDark ? '#D97706' : '#F59E0B',
                            shadowColor: '#F59E0B',
                        }
                    ]}
                    onPress={() => Alert.alert("Clinic Check-in", "Please show this QR code at the front desk.")}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Clinic Check-in QR Code"
                >
                    <View style={styles.primaryBannerLeft}>
                        <View style={styles.iconBadge}>
                            <MaterialCommunityIcons name="qrcode-scan" size={20} color="#FFFFFF" />
                        </View>
                        <View style={styles.primaryBannerText}>
                            <Text style={styles.primaryBannerTitle}>Clinic Check-in (QR)</Text>
                            <Text style={styles.primaryBannerSub}>Scan at front desk upon arrival</Text>
                        </View>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            )}

            {/* Secondary Action Row */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: isDark ? `${colors.primary}25` : `${colors.primary}12` }]}
                    onPress={() => onView(appointment.id)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="View Details"
                >
                    <MaterialCommunityIcons name="eye-outline" size={16} color={colors.primary} />
                    <Text style={[styles.actionText, { color: colors.primary }]}>View</Text>
                </TouchableOpacity>

                {isUpcoming && (
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: isDark ? '#7C3AED25' : '#7C3AED12' }]}
                        onPress={() => onReschedule(appointment.id)}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel="Reschedule Appointment"
                    >
                        <MaterialCommunityIcons name="calendar-edit" size={16} color={isDark ? '#A78BFA' : '#7C3AED'} />
                        <Text style={[styles.actionText, { color: isDark ? '#A78BFA' : '#7C3AED' }]}>Reschedule</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: isDark ? '#EF444425' : '#EF444412' }]}
                    onPress={handleCancel}
                    disabled={isCancelling}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={isUpcoming ? "Cancel Appointment" : "Remove Appointment Record"}
                >
                    {isCancelling ? (
                        <ActivityIndicator size="small" color={isDark ? '#FCA5A5' : '#EF4444'} />
                    ) : (
                        <>
                            <MaterialCommunityIcons
                                name={isUpcoming ? "close-circle-outline" : "trash-can-outline"}
                                size={16}
                                color={isDark ? '#FCA5A5' : '#EF4444'}
                            />
                            <Text style={[styles.actionText, { color: isDark ? '#FCA5A5' : '#EF4444' }]}>
                                {isUpcoming ? "Cancel" : "Remove"}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 18,
        marginHorizontal: 20,
        marginBottom: 14,
        borderWidth: 1,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    doctorRow: {
        flexDirection: 'row',
        flex: 1,
        marginRight: 8,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    doctorMeta: {
        flex: 1,
        justifyContent: 'center',
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    specialty: {
        fontSize: 13,
        fontWeight: '600',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        paddingVertical: 14,
        marginBottom: 14,
        rowGap: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        gap: 8,
    },
    infoTextBlock: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '500',
        marginBottom: 1,
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '600',
    },
    primaryBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 14,
        marginBottom: 12,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
        elevation: 3,
    },
    primaryBannerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconBadge: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBannerText: {
        marginLeft: 10,
        flex: 1,
    },
    primaryBannerTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    primaryBannerSub: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 11,
        fontWeight: '500',
        marginTop: 1,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        minHeight: 40,
        borderRadius: 12,
        gap: 4,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
