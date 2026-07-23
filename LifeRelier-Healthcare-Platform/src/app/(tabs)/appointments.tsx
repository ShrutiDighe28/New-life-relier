import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    TextInput,
    Dimensions,
    Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@/utils/themeManager";
import { Header } from "@/components/dashboard";
import { useAppointments, Appointment } from "@/context/AppointmentsContext";
import SummaryCards from "@/components/appointments/SummaryCards";
import ModernCalendar from "@/components/appointments/ModernCalendar";
import HistoryList from "@/components/appointments/HistoryList";

const { width } = Dimensions.get("window");

type TabType = 'upcoming' | 'booked' | 'completed' | 'cancelled' | 'all';

export default function AppointmentsScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { appointments, cancelAppointment, deleteAppointment, refreshAppointments, aiRemindersOn, toggleAiReminders, isLoading } = useAppointments();
    const [refreshing, setRefreshing] = useState(false);

    const [activeTab, setActiveTab] = useState<TabType>('upcoming');
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await refreshAppointments();
        } finally {
            setRefreshing(false);
        }
    }, [refreshAppointments]);

    const handleView = (id: string) => {
        router.push(`/appointments/appointment-details?id=${id}`);
    };

    const handleReschedule = (id: string) => {
        router.push(`/appointments/book?rescheduleId=${id}`);
    };

    const handleCancel = async (id: string) => {
        await cancelAppointment(id);
    };

    // Calculate Summary Stats
    const stats = useMemo(() => {
        return {
            total: appointments.length,
            upcoming: appointments.filter(a => a.status === 'upcoming' && a.tag !== 'Rescheduled').length,
            booked: appointments.filter(a => a.tag === 'Rescheduled').length,
            completed: appointments.filter(a => a.status === 'completed').length,
            cancelled: appointments.filter(a => a.status === 'cancelled').length,
        };
    }, [appointments]);

    // Filter appointments based on Tab, Search, and Selected Date
    const filteredAppointments = useMemo(() => {
        let filtered = appointments;

        // Tab Filter
        if (activeTab !== 'all') {
            if (activeTab === 'booked') {
                filtered = filtered.filter(a => a.tag === 'Rescheduled'); // Map Booked to Rescheduled tag for now
            } else {
                filtered = filtered.filter(a => a.status === activeTab);
            }
        }

        // Search Filter (ID, Doctor, Specialty, Clinic)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(a =>
                a.id.toLowerCase().includes(query) ||
                a.doctorName.toLowerCase().includes(query) ||
                a.specialty.toLowerCase().includes(query) ||
                (a.clinic && a.clinic.toLowerCase().includes(query)) ||
                (a.appointmentId && String(a.appointmentId).includes(query))
            );
        }

        // Sort by date (newest first for history, soonest first for upcoming)
        filtered = [...filtered].sort((a, b) => {
            const dateA = new Date(a.date.split(' • ')[0]).getTime();
            const dateB = new Date(b.date.split(' • ')[0]).getTime();
            if (isNaN(dateA) || isNaN(dateB)) return 0;
            return activeTab === 'completed' || activeTab === 'cancelled' ? dateB - dateA : dateA - dateB;
        });

        return filtered;
    }, [appointments, activeTab, searchQuery]);

    const TABS: { id: TabType; label: string; icon: any }[] = [
        { id: 'upcoming', label: 'Upcoming', icon: 'clock-fast' },
        { id: 'booked', label: 'Booked', icon: 'calendar-check' },
        { id: 'completed', label: 'Completed', icon: 'check-decagram' },
        { id: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline' },
        { id: 'all', label: 'All', icon: 'view-list' },
    ];

    const listHeader = (
        <>
            <SummaryCards {...stats} />

            {/* AI Reminders Toggle */}
            <View style={[styles.aiToggleContainer, {
                backgroundColor: isDark ? colors.card : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
            }]}>
                <View style={styles.aiToggleTextContainer}>
                    <View style={[styles.aiIconBg, { backgroundColor: `${colors.primary}15` }]}>
                        <MaterialCommunityIcons name="robot-outline" size={20} color={colors.primary} />
                    </View>
                    <View style={{ marginLeft: 12 }}>
                        <Text style={[styles.aiToggleTitle, { color: colors.text }]}>AI Reminders</Text>
                        <Text style={[styles.aiToggleSub, { color: colors.textSecondary }]}>Smart push notifications</Text>
                    </View>
                </View>
                <Switch
                    value={aiRemindersOn}
                    onValueChange={toggleAiReminders}
                    trackColor={{ false: isDark ? '#475569' : '#CBD5E1', true: colors.primary }}
                    thumbColor={aiRemindersOn ? '#FFFFFF' : '#F1F5F9'}
                />
            </View>

            <ModernCalendar
                appointments={appointments}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
            />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, {
                    backgroundColor: isDark ? colors.card : '#FFFFFF',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                }]}>
                    <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search by Apt ID, Doctor, Specialty..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")} activeOpacity={0.6}>
                            <MaterialCommunityIcons name="close-circle" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filter Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer} contentContainerStyle={styles.tabsContent}>
                {TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <TouchableOpacity
                            key={tab.id}
                            style={[
                                styles.tabButton,
                                { borderColor: isDark ? '#334155' : '#E2E8F0' },
                                isActive && { backgroundColor: colors.primary, borderColor: colors.primary },
                            ]}
                            onPress={() => setActiveTab(tab.id)}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name={tab.icon}
                                size={14}
                                color={isActive ? '#FFFFFF' : colors.textSecondary}
                            />
                            <Text style={[
                                styles.tabText,
                                { color: colors.textSecondary },
                                isActive && { color: '#FFFFFF' },
                            ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Results count */}
            <View style={styles.resultsRow}>
                <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
                    {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} found
                </Text>
            </View>
        </>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            <Header title="Appointments" showNotificationButton={true} />

            <View style={styles.listSection}>
                <HistoryList
                    appointments={filteredAppointments}
                    onView={handleView}
                    onReschedule={handleReschedule}
                    onCancel={handleCancel}
                    isLoading={isLoading}
                    ListHeaderComponent={listHeader}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                />
            </View>

            {/* FAB */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/appointments/book")}
                activeOpacity={0.8}
            >
                <MaterialCommunityIcons name="plus" size={26} color="#FFFFFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listSection: {
        flex: 1,
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 14,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        height: 48,
        borderRadius: 16,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
    },
    tabsContainer: {
        marginBottom: 8,
    },
    tabsContent: {
        paddingHorizontal: 20,
        gap: 8,
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    resultsRow: {
        paddingHorizontal: 20,
        marginBottom: 8,
        marginTop: 4,
    },
    resultsText: {
        fontSize: 13,
        fontWeight: '500',
    },
    aiToggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    aiIconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiToggleTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    aiToggleTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    aiToggleSub: {
        fontSize: 12,
        marginTop: 1,
    },
    fab: {
        position: 'absolute',
        bottom: 28,
        right: 24,
        width: 58,
        height: 58,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
});