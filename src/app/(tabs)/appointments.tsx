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
import { Switch } from "react-native";

const { width } = Dimensions.get("window");

type TabType = 'upcoming' | 'booked' | 'completed' | 'cancelled' | 'all';

export default function AppointmentsScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { appointments, cancelAppointment, deleteAppointment, refreshAppointments, aiRemindersOn, toggleAiReminders } = useAppointments();
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
        router.push(`/appointments/book?id=${id}`);
    };

    const handleCancel = async (id: string) => {
        await cancelAppointment(id);
    };

    // Calculate Summary Stats
    const stats = useMemo(() => {
        return {
            total: appointments.length,
            upcoming: appointments.filter(a => a.status === 'upcoming').length,
            booked: appointments.filter(a => a.status === 'upcoming').length, // Assuming booked = upcoming for now
            completed: appointments.filter(a => a.status === 'completed').length,
            cancelled: appointments.filter(a => a.status === 'cancelled').length,
        };
    }, [appointments]);

    // Filter appointments based on Tab, Search, and Selected Date (if applicable)
    const filteredAppointments = useMemo(() => {
        let filtered = appointments;

        // Tab Filter
        if (activeTab !== 'all') {
            if (activeTab === 'booked') {
                filtered = filtered.filter(a => a.status === 'upcoming');
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
                (a.clinic && a.clinic.toLowerCase().includes(query))
            );
        }

        // Sort by date (descending typically, but can be ascending for upcoming)
        filtered = filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return filtered;
    }, [appointments, activeTab, searchQuery]);


    const getTabIcon = (id: TabType) => {
        switch (id) {
            case 'upcoming': return 'calendar-clock';
            case 'booked': return 'calendar-check';
            case 'completed': return 'checkbox-marked-circle-outline';
            case 'cancelled': return 'close-circle-outline';
            case 'all': return 'calendar-multiple';
            default: return 'calendar';
        }
    };

    const TabButton = ({ id, label }: { id: TabType, label: string }) => {
        const isActive = activeTab === id;
        const iconName = getTabIcon(id);
        return (
            <TouchableOpacity
                style={[
                    styles.tabButton,
                    isActive && { backgroundColor: colors.primary, borderColor: colors.primary },
                    !isActive && { borderColor: isDark ? '#334155' : '#E2E8F0' }
                ]}
                onPress={() => setActiveTab(id)}
            >
                <MaterialCommunityIcons 
                    name={iconName} 
                    size={15} 
                    color={isActive ? '#FFFFFF' : colors.textSecondary} 
                    style={{ marginRight: 6 }} 
                />
                <Text style={[
                    styles.tabText,
                    isActive ? { color: '#FFFFFF' } : { color: colors.textSecondary }
                ]}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    const listHeader = (
        <>
            <SummaryCards {...stats} />

            <View style={[styles.aiToggleContainer, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}>
                <View style={styles.aiToggleTextContainer}>
                    <MaterialCommunityIcons name="robot-outline" size={24} color={colors.primary} />
                    <View style={{ marginLeft: 12 }}>
                        <Text style={[styles.aiToggleTitle, { color: colors.text }]}>AI Reminders</Text>
                        <Text style={[styles.aiToggleSub, { color: colors.textSecondary }]}>Get smart push notifications</Text>
                    </View>
                </View>
                <Switch
                    value={aiRemindersOn}
                    onValueChange={toggleAiReminders}
                    trackColor={{ false: "#767577", true: colors.primary }}
                />
            </View>

            <ModernCalendar 
                appointments={appointments} 
                selectedDate={selectedDate} 
                onDateSelect={setSelectedDate} 
            />

            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: isDark ? colors.card : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
                    <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search by ID, Doctor, or Clinic..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <MaterialCommunityIcons name="close-circle" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.tabsScrollView}
                contentContainerStyle={styles.tabsContentContainer}
            >
                <TabButton id="upcoming" label="Upcoming" />
                <TabButton id="booked" label="Booked" />
                <TabButton id="completed" label="Completed" />
                <TabButton id="cancelled" label="Cancelled" />
                <TabButton id="all" label="All" />
            </ScrollView>
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
                    ListHeaderComponent={listHeader}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                />
            </View>

            <TouchableOpacity 
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/appointments/book")}
            >
                <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
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
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 48,
        borderRadius: 16,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
    },
    tabsScrollView: {
        marginBottom: 16,
    },
    tabsContentContainer: {
        paddingLeft: 20,
        paddingRight: 28, // Extra padding on the right to ensure the last button isn't cut off when scrolling
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    aiToggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 20,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
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
        marginTop: 2,
    },
    fab: {
        position: 'absolute',
        bottom: 100,
        right: 24,
        width: 58,
        height: 58,
        borderRadius: 29,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
});