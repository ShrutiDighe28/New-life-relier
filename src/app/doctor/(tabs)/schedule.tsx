import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
<<<<<<< HEAD
=======
    Modal,
    TextInput,
    Linking,
    Image,
    Animated,
    RefreshControl,
    LayoutAnimation,
    Pressable,
>>>>>>> 629a36a (sign in and login page , schedule page)
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@/utils/themeManager";
<<<<<<< HEAD
=======
import { useAuth } from "@/context/AuthContext";
import { Calendar } from "react-native-calendars";
import { useRouter } from "expo-router";
>>>>>>> 629a36a (sign in and login page , schedule page)

const DAYS_DATA = [
    { day: "Mon", date: "24", fullDate: "2026-07-24", isToday: true },
    { day: "Tue", date: "25", fullDate: "2026-07-25", isToday: false },
    { day: "Wed", date: "26", fullDate: "2026-07-26", isToday: false },
    { day: "Thu", date: "27", fullDate: "2026-07-27", isToday: false },
    { day: "Fri", date: "28", fullDate: "2026-07-28", isToday: false },
    { day: "Sat", date: "29", fullDate: "2026-07-29", isToday: false },
    { day: "Sun", date: "30", fullDate: "2026-07-30", isToday: false },
];

const SCHEDULE_DATA: Record<string, any[]> = {
    "2026-07-24": [
        { id: "1", time: "09:30 AM", patient: "Rahul Gupta", initials: "RG", type: "New", typeColor: "#2563EB", status: "Confirmed", statusColor: "#10B981" },
        { id: "2", time: "10:30 AM", patient: "Aarav Sharma", initials: "AS", type: "New", typeColor: "#2563EB", status: "Confirmed", statusColor: "#10B981" },
        { id: "3", time: "11:45 AM", patient: "Priya Patel", initials: "PP", type: "Follow-up", typeColor: "#0D9488", status: "Pending", statusColor: "#F59E0B" },
        { id: "4", time: "02:00 PM", patient: "Vikram Malhotra", initials: "VM", type: "Emergency", typeColor: "#EF4444", status: "Confirmed", statusColor: "#10B981" },
        { id: "5", time: "04:30 PM", patient: "Sneha Reddy", initials: "SR", type: "Follow-up", typeColor: "#0D9488", status: "Cancelled", statusColor: "#94A3B8" },
    ],
    "2026-07-25": [
        { id: "6", time: "10:00 AM", patient: "Meera Nair", initials: "MN", type: "Follow-up", typeColor: "#0D9488", status: "Confirmed", statusColor: "#10B981" },
        { id: "7", time: "01:30 PM", patient: "Karan Johar", initials: "KJ", type: "New", typeColor: "#2563EB", status: "Confirmed", statusColor: "#10B981" },
    ],
};

export default function DoctorScheduleScreen() {
    const { colors, isDark } = useTheme();
    const [selectedDate, setSelectedDate] = useState("2026-07-24");

<<<<<<< HEAD
    const appointments = SCHEDULE_DATA[selectedDate] || [];
=======
    const [baseDate, setBaseDate] = useState(todayStr);
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    const [localAppointments, setLocalAppointments] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [skeletonLoading, setSkeletonLoading] = useState(false);

    // Selected Appointment for Action Sheet
    const [actionAppointment, setActionAppointment] = useState<any>(null);
    const [showActionModal, setShowActionModal] = useState(false);

    const weekData = useMemo(() => generateWeekData(baseDate), [baseDate]);
    const rawScheduleData: any = useMemo(() => getDynamicScheduleData(weekData), [weekData]);

    const markedDates = useMemo(() => {
        let dates: any = {};
        Object.keys(rawScheduleData).forEach(date => {
            if (rawScheduleData[date].length > 0) {
                dates[date] = { marked: true, dotColor: '#0D9488' };
            }
        });
        
        // Ensure selected date has correct styling
        dates[selectedDate] = { 
            ...dates[selectedDate], 
            selected: true, 
            selectedColor: '#0D9488',
        };
        
        // Ensure today's date is recognizable if not selected
        if (todayStr !== selectedDate) {
            dates[todayStr] = { 
                ...dates[todayStr], 
                today: true, 
            };
        }
        
        return dates;
    }, [rawScheduleData, selectedDate, todayStr]);

    // Sync local state when selected date or mock data changes
    useEffect(() => {
        setLocalAppointments(rawScheduleData[selectedDate] || []);
    }, [selectedDate, rawScheduleData]);

    const handleSelectDateFromCalendar = (dateString: string) => {
        setSkeletonLoading(true);
        setSelectedDate(dateString);
        
        // If the selected date is not in the current weekData, shift the base date
        const isInWeek = weekData.some(day => day.fullDate === dateString);
        if (!isInWeek) {
            setBaseDate(dateString);
        }
        setShowCalendarModal(false);
        setTimeout(() => {
            setSkeletonLoading(false);
        }, 500);
    };

    // Format header subtitle month
    const headerTitle = useMemo(() => {
        const d = new Date(selectedDate);
        return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }, [selectedDate]);

    // Dynamic stats summary for active day
    const stats = useMemo(() => {
        const total = localAppointments.length;
        const completed = localAppointments.filter(a => a.status === "Completed").length;
        const pending = localAppointments.filter(a => a.status === "Upcoming" || a.status === "Ongoing").length;
        return { total, completed, pending };
    }, [localAppointments]);

    // Apply filters and searches
    const filteredAppointments = useMemo(() => {
        let list = localAppointments;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            list = list.filter(app => 
                app.patient.toLowerCase().includes(query) ||
                app.type.toLowerCase().includes(query) ||
                (app.clinic && app.clinic.toLowerCase().includes(query))
            );
        }

        if (activeFilter !== "All") {
            list = list.filter(app => {
                if (activeFilter === "Emergency") return app.type === "Emergency";
                return app.status.toLowerCase() === activeFilter.toLowerCase();
            });
        }

        return list;
    }, [localAppointments, searchQuery, activeFilter]);

    // Simulated pull to refresh
    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
            // reset status values for dev testing
            setLocalAppointments(rawScheduleData[selectedDate] || []);
        }, 1200);
    };

    // Animation for skeleton loading
    const [pulseAnim] = useState(new Animated.Value(0.3));
    useEffect(() => {
        if (skeletonLoading) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 0.7, duration: 600, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(0.3);
        }
    }, [skeletonLoading]);

    // Handle Quick actions
    const handleStatusUpdate = (status: "Completed" | "Cancelled" | "Ongoing" | "Upcoming") => {
        if (!actionAppointment) return;
        
        let color = "#2563EB";
        if (status === "Completed") color = "#10B981";
        if (status === "Cancelled") color = "#94A3B8";
        if (status === "Ongoing") color = "#0D9488";

        setLocalAppointments(prev => prev.map(app => {
            if (app.id === actionAppointment.id) {
                return { ...app, status, statusColor: color };
            }
            return app;
        }));
        setShowActionModal(false);
    };

    // Layout animation on filter or date change
    useEffect(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }, [filteredAppointments, selectedDate]);

    const router = useRouter();
    const doctorName = user?.fullName || "Dr. Sarah Jenkins";
    const doctorSpec = (user as any)?.rawApiData?.specialization || "Cardiologist";
>>>>>>> 629a36a (sign in and login page , schedule page)

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>My Schedule</Text>
                    <Text style={[styles.dateSubtitle, { color: colors.textSecondary }]}>July 2026</Text>
                </View>
                <TouchableOpacity style={[styles.headerBtn, { backgroundColor: isDark ? colors.card : "#F8FAFC" }]}>
                    <MaterialCommunityIcons name="calendar-range" size={22} color={colors.text} />
                </TouchableOpacity>
            </View>

<<<<<<< HEAD
            {/* Horizontal Day Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
                {DAYS_DATA.map((item) => {
                    const isSelected = item.fullDate === selectedDate;
                    return (
                        <TouchableOpacity
                            key={item.fullDate}
                            style={[
                                styles.dayPill,
                                { backgroundColor: isDark ? colors.card : "#F8FAFC", borderColor: colors.cardBorder },
                                isSelected && styles.dayPillSelected,
                            ]}
                            onPress={() => setSelectedDate(item.fullDate)}
                        >
                            <Text style={[styles.dayName, { color: colors.textSecondary }, isSelected && styles.dayTextSelected]}>
                                {item.day}
=======
            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />
                }
            >
                {/* Stats Row */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statBox, { backgroundColor: isDark ? colors.card : "#EFF6FF" }]}>
                        <Text style={[styles.statNumber, { color: "#2563EB" }]}>{stats.total}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: isDark ? colors.card : "#F0FDF4" }]}>
                        <Text style={[styles.statNumber, { color: "#10B981" }]}>{stats.completed}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: isDark ? colors.card : "#FFFBEB" }]}>
                        <Text style={[styles.statNumber, { color: "#D97706" }]}>{stats.pending}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
                    </View>
                </View>

                {/* Date Selection Info & Horizontal selector */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{headerTitle}</Text>
                </View>
                <View style={{ height: 90 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
                        {weekData.map((item) => {
                            const isSelected = item.fullDate === selectedDate;
                            return (
                                <TouchableOpacity
                                    key={item.fullDate}
                                    style={[
                                        styles.dayPill,
                                        { backgroundColor: isDark ? colors.card : "#F8FAFC", borderColor: colors.cardBorder },
                                        isSelected && styles.dayPillSelected,
                                    ]}
                                    onPress={() => handleSelectDateFromCalendar(item.fullDate)}
                                >
                                    <Text style={[styles.dayName, { color: colors.textSecondary }, isSelected && styles.dayTextSelected]}>
                                        {item.day}
                                    </Text>
                                    <Text style={[styles.dateNum, { color: colors.text }, isSelected && styles.dayTextSelected]}>
                                        {item.date}
                                    </Text>
                                    {item.isToday && <View style={[styles.todayDot, isSelected && { backgroundColor: "#FFFFFF" }]} />}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Search and Filters Bar */}
                <View style={styles.controlsContainer}>
                    <View style={[styles.searchBar, { backgroundColor: isDark ? colors.card : "#F8FAFC", borderColor: colors.cardBorder }]}>
                        <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Search patient, clinic or type..."
                            placeholderTextColor="#94A3B8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                <MaterialCommunityIcons name="close-circle" size={18} color={colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Filter Chips */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                        {[
                            { label: "All", icon: "format-list-bulleted" },
                            { label: "Today", icon: "calendar-today" },
                            { label: "Upcoming", icon: "clock-outline" },
                            { label: "Ongoing", icon: "play-circle-outline" },
                            { label: "Completed", icon: "check-circle-outline" },
                            { label: "Cancelled", icon: "close-circle-outline" },
                            { label: "Emergency", icon: "alert-circle-outline" },
                        ].map((filter) => {
                            const isActive = activeFilter === filter.label;
                            return (
                                <TouchableOpacity
                                    key={filter.label}
                                    onPress={() => {
                                        if (filter.label === "Today") {
                                            handleSelectDateFromCalendar(todayStr);
                                            setActiveFilter("All");
                                        } else {
                                            setActiveFilter(filter.label);
                                        }
                                    }}
                                    style={[
                                        styles.filterChip,
                                        { backgroundColor: isDark ? colors.card : "#F1F5F9", borderColor: colors.cardBorder },
                                        isActive && { backgroundColor: "#0D9488", borderColor: "#0D9488" }
                                    ]}
                                >
                                    <MaterialCommunityIcons 
                                        name={filter.icon as any} 
                                        size={14} 
                                        color={isActive ? "#FFFFFF" : colors.textSecondary} 
                                        style={{ marginRight: 6 }}
                                    />
                                    <Text style={[styles.chipText, { color: colors.textSecondary }, isActive && { color: "#FFFFFF" }]}>
                                        {filter.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Appointments Timeline Section */}
                <View style={styles.listContainer}>
                    {skeletonLoading ? (
                        <View style={{ gap: 16 }}>
                            {[1, 2, 3].map((i) => (
                                <Animated.View 
                                    key={i} 
                                    style={[
                                        styles.skeletonCard, 
                                        { backgroundColor: isDark ? colors.card : "#E2E8F0", opacity: pulseAnim }
                                    ]} 
                                />
                            ))}
                        </View>
                    ) : filteredAppointments.length > 0 ? (
                        filteredAppointments.map((item, index) => {
                            const isOngoing = item.status === "Ongoing";
                            return (
                                <View key={item.id} style={styles.appointmentRow}>
                                    <View style={styles.timeCol}>
                                        <Text style={[styles.timeText, { color: colors.text }]}>{item.time}</Text>
                                        <View style={[styles.timelineNode, { backgroundColor: item.statusColor }]} />
                                        {index !== filteredAppointments.length - 1 && <View style={[styles.timelineLine, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]} />}
                                    </View>

                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={() => {
                                            setActionAppointment(item);
                                            setShowActionModal(true);
                                        }}
                                        style={[
                                            styles.card,
                                            { 
                                                backgroundColor: isDark ? colors.card : "#FFFFFF", 
                                                borderColor: isOngoing ? "#0D9488" : colors.cardBorder 
                                            },
                                            isOngoing && styles.cardHighlight
                                        ]}
                                    >
                                        <View style={styles.cardHeader}>
                                            <View style={styles.patientLeft}>
                                                <View style={styles.avatar}>
                                                    <Text style={styles.avatarText}>{item.initials}</Text>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.patientName, { color: colors.text }]}>{item.patient}</Text>
                                                    <Text style={[styles.clinicText, { color: colors.textSecondary }]} numberOfLines={1}>
                                                        {item.clinic}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={[styles.statusBadge, { backgroundColor: `${item.statusColor}12` }]}>
                                                <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
                                            </View>
                                        </View>

                                        <View style={[styles.cardDivider, { backgroundColor: colors.divider }]} />

                                        <View style={styles.cardFooter}>
                                            <View style={styles.metaRow}>
                                                <View style={[styles.typeBadge, { backgroundColor: `${item.typeColor}12` }]}>
                                                    <Text style={[styles.typeText, { color: item.typeColor }]}>{item.type}</Text>
                                                </View>
                                                <View style={styles.durationRow}>
                                                    <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textSecondary} />
                                                    <Text style={[styles.durationText, { color: colors.textSecondary }]}>{item.duration}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.actionsRow}>
                                                <TouchableOpacity 
                                                    style={[styles.actionBtn, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}
                                                    onPress={() => Linking.openURL(`tel:${item.phone}`)}
                                                >
                                                    <MaterialCommunityIcons name="phone-outline" size={16} color="#0D9488" />
                                                </TouchableOpacity>
                                                <TouchableOpacity 
                                                    style={[styles.actionBtn, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}
                                                    onPress={() => Linking.openURL(`sms:${item.phone}`)}
                                                >
                                                    <MaterialCommunityIcons name="message-text-outline" size={16} color="#0D9488" />
                                                </TouchableOpacity>
                                                <TouchableOpacity 
                                                    style={[styles.actionBtn, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}
                                                    onPress={() => {
                                                        setActionAppointment(item);
                                                        setShowActionModal(true);
                                                    }}
                                                >
                                                    <MaterialCommunityIcons name="dots-horizontal" size={16} color="#0D9488" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            );
                        })
                    ) : (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="calendar-remove-outline" size={64} color="#94A3B8" style={{ opacity: 0.6 }} />
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Consultations Found</Text>
                            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                                No appointments match your current filters.
>>>>>>> 629a36a (sign in and login page , schedule page)
                            </Text>
                            <Text style={[styles.dateNum, { color: colors.text }, isSelected && styles.dayTextSelected]}>
                                {item.date}
                            </Text>
                            {item.isToday && <View style={[styles.todayDot, isSelected && { backgroundColor: "#FFFFFF" }]} />}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

<<<<<<< HEAD
            {/* Appointment Timeline List */}
            <View style={styles.listContainer}>
                {appointments.length > 0 ? (
                    <FlatList
                        data={appointments}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        renderItem={({ item }) => (
                            <View style={styles.appointmentRow}>
                                <View style={styles.timeCol}>
                                    <Text style={[styles.timeText, { color: colors.text }]}>{item.time}</Text>
                                    <View style={styles.timelineLine} />
=======
            {/* Calendar Picker Modal */}
            <Modal
                visible={showCalendarModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCalendarModal(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setShowCalendarModal(false)}
                >
                    <View style={[styles.calendarModalContent, { backgroundColor: isDark ? colors.card : "#FFFFFF" }]}>
                        <Calendar
                            current={selectedDate}
                            onDayPress={(day) => handleSelectDateFromCalendar(day.dateString)}
                            markedDates={markedDates}
                            enableSwipeMonths={true}
                            monthFormat={'MMMM yyyy'}
                            theme={{
                                calendarBackground: isDark ? colors.card : "#FFFFFF",
                                textSectionTitleColor: colors.textSecondary,
                                selectedDayBackgroundColor: "#0D9488",
                                selectedDayTextColor: "#ffffff",
                                todayTextColor: "#0D9488",
                                dayTextColor: colors.text,
                                textDisabledColor: isDark ? "#334155" : "#D1D5DB",
                                dotColor: "#0D9488",
                                selectedDotColor: "#ffffff",
                                arrowColor: "#0D9488",
                                monthTextColor: colors.text,
                                textDayFontWeight: "600",
                                textMonthFontWeight: "bold",
                                textDayHeaderFontWeight: "500",
                            }}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Appointment Action Modal */}
            <Modal
                visible={showActionModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowActionModal(false)}
            >
                <TouchableOpacity 
                    style={styles.bottomSheetOverlay} 
                    activeOpacity={1} 
                    onPress={() => setShowActionModal(false)}
                >
                    <View style={[styles.bottomSheetContent, { backgroundColor: isDark ? colors.card : "#FFFFFF" }]}>
                        <View style={[styles.sheetIndicator, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]} />
                        
                        {actionAppointment && (
                            <>
                                <Text style={[styles.sheetTitle, { color: colors.text }]}>Manage Consultation</Text>
                                <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
                                    For {actionAppointment.patient} • {actionAppointment.time}
                                </Text>

                                <View style={styles.sheetButtonsContainer}>
                                    {actionAppointment.status !== "Completed" && (
                                        <TouchableOpacity 
                                            style={[styles.sheetBtn, { backgroundColor: "#F0FDF4" }]}
                                            onPress={() => handleStatusUpdate("Completed")}
                                        >
                                            <MaterialCommunityIcons name="check-circle-outline" size={22} color="#10B981" />
                                            <Text style={[styles.sheetBtnText, { color: "#166534" }]}>Mark as Completed</Text>
                                        </TouchableOpacity>
                                    )}

                                    {actionAppointment.status !== "Ongoing" && actionAppointment.status !== "Completed" && (
                                        <TouchableOpacity 
                                            style={[styles.sheetBtn, { backgroundColor: "#ECFDF5" }]}
                                            onPress={() => handleStatusUpdate("Ongoing")}
                                        >
                                            <MaterialCommunityIcons name="play-circle-outline" size={22} color="#0D9488" />
                                            <Text style={[styles.sheetBtnText, { color: "#0F766E" }]}>Start Consultation</Text>
                                        </TouchableOpacity>
                                    )}

                                    <TouchableOpacity 
                                        style={[styles.sheetBtn, { backgroundColor: "#FEF2F2" }]}
                                        onPress={() => handleStatusUpdate("Cancelled")}
                                    >
                                        <MaterialCommunityIcons name="cancel" size={22} color="#EF4444" />
                                        <Text style={[styles.sheetBtnText, { color: "#991B1B" }]}>Cancel Appointment</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={[styles.sheetBtn, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}
                                        onPress={() => {
                                            setShowActionModal(false);
                                            setShowCalendarModal(true);
                                        }}
                                    >
                                        <MaterialCommunityIcons name="calendar-edit" size={22} color="#2563EB" />
                                        <Text style={[styles.sheetBtnText, { color: "#1D4ED8" }]}>Reschedule</Text>
                                    </TouchableOpacity>
>>>>>>> 629a36a (sign in and login page , schedule page)
                                </View>

                                <View style={[styles.card, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.patientLeft}>
                                            <View style={styles.avatar}>
                                                <Text style={styles.avatarText}>{item.initials}</Text>
                                            </View>
                                            <View>
                                                <Text style={[styles.patientName, { color: colors.text }]}>{item.patient}</Text>
                                                <View style={styles.badgeRow}>
                                                    <View style={[styles.typeBadge, { backgroundColor: `${item.typeColor}15` }]}>
                                                        <Text style={[styles.typeText, { color: item.typeColor }]}>{item.type}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={[styles.statusBadge, { backgroundColor: `${item.statusColor}15` }]}>
                                            <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="calendar-remove-outline" size={64} color="#94A3B8" />
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Appointments Scheduled</Text>
                        <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                            You have no consultations set for this day.
                        </Text>
                    </View>
                )}
            </View>

            {/* FAB Button */}
<<<<<<< HEAD
            <TouchableOpacity activeOpacity={0.9} style={styles.fab}>
=======
            <Pressable 
                onPress={() => router.push('/doctor/add-appointment')}
                style={({ pressed }) => [
                    styles.fab, 
                    { backgroundColor: colors.primary },
                    pressed && { transform: [{ scale: 0.92 }], opacity: 0.9 }
                ] as any}
                android_ripple={{ color: 'rgba(255,255,255,0.3)', borderless: true, radius: 28 }}
            >
>>>>>>> 629a36a (sign in and login page , schedule page)
                <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
    },
    dateSubtitle: {
        fontSize: 14,
        fontWeight: "500",
        marginTop: 2,
    },
    headerBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },
<<<<<<< HEAD
=======
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 12,
    },
    statBox: {
        flex: 1,
        borderRadius: 20,
        paddingVertical: 14,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 1,
    },
    statNumber: {
        fontSize: 22,
        fontWeight: "800",
    },
    statLabel: {
        fontSize: 11,
        fontWeight: "600",
        marginTop: 4,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
    },
>>>>>>> 629a36a (sign in and login page , schedule page)
    dayScroll: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        gap: 10,
    },
    dayPill: {
<<<<<<< HEAD
        width: 60,
        height: 76,
        borderRadius: 22,
        borderWidth: 1.5,
=======
        width: 58,
        height: 72,
        borderRadius: 18,
        borderWidth: 1,
>>>>>>> 629a36a (sign in and login page , schedule page)
        justifyContent: "center",
        alignItems: "center",
    },
    dayPillSelected: {
        backgroundColor: "#0D9488",
        borderColor: "#0D9488",
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    dayName: {
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 4,
    },
    dateNum: {
        fontSize: 18,
        fontWeight: "800",
    },
    dayTextSelected: {
        color: "#FFFFFF",
    },
    todayDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: "#0D9488",
        marginTop: 4,
    },
<<<<<<< HEAD
=======
    controlsContainer: {
        paddingHorizontal: 20,
        marginTop: 10,
        gap: 12,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        height: 44,
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 12,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 13,
        fontWeight: "500",
        padding: 0,
    },
    chipsScroll: {
        gap: 8,
        paddingVertical: 4,
    },
    filterChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 12,
        fontWeight: "600",
    },
>>>>>>> 629a36a (sign in and login page , schedule page)
    listContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    appointmentRow: {
        flexDirection: "row",
        marginBottom: 16,
        gap: 12,
    },
    timeCol: {
        width: 70,
        alignItems: "center",
        paddingTop: 4,
    },
    timeText: {
<<<<<<< HEAD
        fontSize: 13,
        fontWeight: "700",
=======
        fontSize: 12,
        fontWeight: "700",
    },
    timelineNode: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginTop: 8,
        borderWidth: 2.5,
        borderColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
>>>>>>> 629a36a (sign in and login page , schedule page)
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: "#E2E8F0",
        marginTop: 8,
        borderRadius: 1,
    },
    card: {
        flex: 1,
<<<<<<< HEAD
        borderRadius: 20,
        borderWidth: 1.5,
        padding: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
=======
        borderRadius: 24,
        borderWidth: 1,
        padding: 16,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 3,
    },
    cardHighlight: {
        borderWidth: 1.5,
        shadowColor: "#0D9488",
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 5,
    },
>>>>>>> 629a36a (sign in and login page , schedule page)
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    patientLeft: {
        flexDirection: "row",
        alignItems: "center",
<<<<<<< HEAD
        gap: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F0FDFA",
=======
        gap: 12,
        flex: 1,
        marginRight: 10,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(13, 148, 136, 0.08)",
>>>>>>> 629a36a (sign in and login page , schedule page)
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#0D9488",
<<<<<<< HEAD
        fontSize: 14,
=======
        fontSize: 16,
>>>>>>> 629a36a (sign in and login page , schedule page)
        fontWeight: "800",
    },
    patientName: {
        fontSize: 15,
<<<<<<< HEAD
        fontWeight: "700",
    },
    badgeRow: {
=======
        fontWeight: "800",
        letterSpacing: -0.2,
    },
    clinicText: {
        fontSize: 12,
        fontWeight: "600",
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        flexShrink: 0,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "700",
    },
    cardDivider: {
        height: 1,
        marginVertical: 14,
    },
    cardFooter: {
>>>>>>> 629a36a (sign in and login page , schedule page)
        flexDirection: "row",
        marginTop: 4,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    typeText: {
        fontSize: 11,
        fontWeight: "700",
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "700",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "800",
        marginTop: 16,
    },
    emptySub: {
<<<<<<< HEAD
=======
        fontSize: 14,
        marginTop: 6,
        textAlign: "center",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    calendarModalContent: {
        width: "90%",
        borderRadius: 24,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    bottomSheetOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    bottomSheetContent: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 15,
    },
    sheetIndicator: {
        width: 46,
        height: 5,
        borderRadius: 3,
        alignSelf: "center",
        marginBottom: 20,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: "800",
        letterSpacing: -0.3,
    },
    sheetSubtitle: {
        fontSize: 13,
        fontWeight: "500",
        marginTop: 4,
        marginBottom: 24,
    },
    sheetButtonsContainer: {
        gap: 12,
    },
    sheetBtn: {
        flexDirection: "row",
        alignItems: "center",
        height: 50,
        borderRadius: 14,
        paddingHorizontal: 16,
        gap: 12,
    },
    sheetBtnText: {
>>>>>>> 629a36a (sign in and login page , schedule page)
        fontSize: 14,
        marginTop: 4,
    },
    fab: {
        position: "absolute",
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#0D9488",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
    },
});
