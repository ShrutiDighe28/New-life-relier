import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@/utils/themeManager";
import { Header } from "@/components/dashboard";
import { useAppointments } from "@/context/AppointmentsContext";
import { Alert } from "react-native";

const { width } = Dimensions.get("window");

// Using Context for data instead of hardcoded lists

// Helper to draw the custom grid of May 2024 calendar
const renderCalendarDays = (colors: any) => {
    // May 2024 starts on a Wednesday (index 3: Sun=0, Mon=1, Tue=2, Wed=3)
    const startOffset = 3;
    const daysInMonth = 31;
    const cells: React.ReactNode[] = [];

    // Fill empty offset cells
    for (let i = 0; i < startOffset; i++) {
        cells.push(<View key={`empty-${i}`} style={styles.calendarCellEmpty} />);
    }

    // Fill days
    for (let day = 1; day <= daysInMonth; day++) {
        let activeStyle = null;
        let textStyle = null;
        let showDot = false;
        let dotColor: string | undefined = undefined;

        if (day === 14) {
            // Cardiology (Blue)
            activeStyle = { backgroundColor: "#2563EB" };
            textStyle = { color: "#FFFFFF" };
        } else if (day === 18) {
            // General Physician (Green)
            activeStyle = { backgroundColor: "#10B981" };
            textStyle = { color: "#FFFFFF" };
        } else if (day === 24) {
            // Dermatology (Orange) with a tiny blue dot underneath
            activeStyle = { backgroundColor: "#F59E0B" };
            textStyle = { color: "#FFFFFF" };
            showDot = true;
            dotColor = "#2563EB";
        }

        cells.push(
            <View key={`day-${day}`} style={styles.calendarCell}>
                <View style={[styles.calendarCellDay, activeStyle]}>
                    <Text style={[styles.calendarCellDayText, { color: activeStyle ? textStyle?.color : colors.text }]}>{day}</Text>
                </View>
                {showDot && <View style={[styles.calendarDot, { backgroundColor: dotColor }]} />}
            </View>
        );
    }

    return cells;
};

export default function AppointmentsScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { upcomingAppointments, historyItems, aiRemindersOn, toggleAiReminders, cancelAppointment } = useAppointments();

    const handleCancel = (id: string) => {
        Alert.alert(
            "Cancel Appointment",
            "Are you sure you want to cancel this appointment?",
            [
                { text: "No, Keep", style: "cancel" },
                { text: "Yes, Cancel", style: "destructive", onPress: () => cancelAppointment(id) }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            {/* Reusable App Header */}
            <Header showBackButton />

            <ScrollView
                style={{ backgroundColor: colors.background }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Title Illustration Section */}
                <View style={[styles.titleSection, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.divider }]}>
                    <View style={styles.titleLeft}>
                        <Text style={[styles.pageTitle, { color: colors.text }]}>Appointments</Text>
                        <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
                            Manage your appointments and stay on top of your health.
                        </Text>
                    </View>
                    <View style={{ backgroundColor: colors.badgeBg, padding: 12, borderRadius: 16 }}>
                        <MaterialCommunityIcons name="calendar-multiselect" size={48} color={colors.primary} />
                    </View>
                </View>

                {/* 2-Column Split Section */}
                <View style={styles.splitRow}>
                    {/* Left Column: Upcoming Cards (55% width) */}
                    <View style={styles.leftCol}>
                        <View style={styles.colHeaderRow}>
                            <Text style={[styles.columnHeading, { color: colors.text }]}>Upcoming Appointments</Text>
                        </View>

                        {upcomingAppointments.length === 0 ? (
                            <View style={[styles.emptyStateCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                                <MaterialCommunityIcons name="calendar-blank-outline" size={48} color={colors.textSecondary} />
                                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No Upcoming Appointments</Text>
                                <Text style={[styles.emptyStateDesc, { color: colors.textSecondary }]}>You have no scheduled visits.</Text>
                            </View>
                        ) : (
                            upcomingAppointments.map((app) => (
                                <View key={app.id} style={[styles.upcomingCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                                    <View style={[styles.cardHeader, { borderBottomColor: colors.divider }]}>
                                        <Image source={app.avatar} style={styles.doctorAvatar} />
                                        <View style={styles.doctorInfo}>
                                            {app.tag && (
                                                <View style={[styles.tag, { backgroundColor: app.tagBg }]}>
                                                    <Text style={[styles.tagText, { color: app.tagColor }]}>
                                                        {app.tag}
                                                    </Text>
                                                </View>
                                            )}
                                            <View style={styles.nameRow}>
                                                <Text style={[styles.doctorName, { color: colors.text }]}>
                                                    {app.doctorName}{' '}
                                                    <MaterialCommunityIcons name={"check-decagram" as any} size={14} color="#2563EB" />
                                                </Text>
                                            </View>
                                            <View style={styles.specialtyRow}>
                                                <MaterialCommunityIcons name={app.specialtyIcon as any} size={14} color={app.specialtyColor} />
                                                <Text style={[styles.specialtyText, { color: app.specialtyColor }]}>
                                                    {app.specialty}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Card details row list */}
                                    <View style={styles.cardDetails}>
                                        <View style={styles.detailRow}>
                                            <MaterialCommunityIcons name="calendar-clock" size={14} color={colors.textSecondary} />
                                            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{app.date}</Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.textSecondary} />
                                            <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>{app.clinic}</Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <MaterialCommunityIcons name="shield-check-outline" size={14} color={colors.textSecondary} />
                                            <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>{app.insurance}</Text>
                                        </View>
                                    </View>

                                    {/* Video Consult Action */}
                                    {app.hasVideo && (
                                        <TouchableOpacity
                                            style={styles.videoConsultBtn}
                                            onPress={() => router.push("/appointments/consultation")}
                                        >
                                            <MaterialCommunityIcons name="video-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                                            <Text style={styles.videoConsultBtnText}>Join Video Consultation</Text>
                                        </TouchableOpacity>
                                    )}

                                    {/* Outline Action Buttons Row */}
                                    <View style={styles.cardActionsRow}>
                                        <TouchableOpacity 
                                            style={styles.cardActionOutlineBtn}
                                            onPress={() => router.push(`/appointments/book?rescheduleId=${app.id}`)}
                                        >
                                            <MaterialCommunityIcons name="calendar-edit" size={12} color="#2563EB" style={{ marginRight: 2 }} />
                                            <Text style={styles.actionBtnTextBlue} numberOfLines={1} ellipsizeMode="tail">Reschedule</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.cardActionOutlineBtn, { borderColor: "#EF4444" }]}
                                            onPress={() => handleCancel(app.id)}
                                        >
                                            <MaterialCommunityIcons name="close-circle-outline" size={12} color="#EF4444" style={{ marginRight: 2 }} />
                                            <Text style={styles.actionBtnTextRed} numberOfLines={1} ellipsizeMode="tail">Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>

                    {/* Right Column: Calendar Widget & AI Reminder (45% width) */}
                    <View style={styles.rightCol}>
                        <View style={styles.colHeaderRow}>
                            <Text style={[styles.columnHeading, { color: colors.text }]}>View Calendar</Text>
                            <TouchableOpacity onPress={() => router.push("/appointments/calendar")}>
                                <MaterialCommunityIcons name="calendar-month-outline" size={18} color="#2563EB" />
                            </TouchableOpacity>
                        </View>

                        {/* Custom Calendar Widget */}
                        <View style={[styles.calendarWidget, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <View style={styles.calendarHeader}>
                                <Text style={[styles.calendarTitle, { color: colors.text }]}>May 2024</Text>
                                <View style={styles.calendarNav}>
                                    <TouchableOpacity style={styles.navArrow}>
                                        <MaterialCommunityIcons name="chevron-left" size={18} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.navArrow}>
                                        <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.weekdaysRow}>
                                {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                                    <Text key={idx} style={[styles.weekdayText, { color: colors.textSecondary }]}>{day}</Text>
                                ))}
                            </View>

                            <View style={styles.daysGrid}>
                                {renderCalendarDays(colors)}
                            </View>

                            {/* Legend section */}
                            <View style={[styles.legendContainer, { borderTopColor: colors.divider }]}>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: "#2563EB" }]} />
                                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>Cardiology</Text>
                                </View>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
                                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>Physician</Text>
                                </View>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
                                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>Dermatology</Text>
                                </View>
                            </View>
                        </View>

                        {/* AI Reminders Card */}
                        <View style={[styles.aiRemindersCard, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                            <View style={styles.aiRemindersHeader}>
                                <View style={styles.bellBadgeIcon}>
                                    <MaterialCommunityIcons name={aiRemindersOn ? "bell-ring-outline" : "bell-off-outline"} size={18} color="#FFFFFF" />
                                </View>
                                <Text style={[styles.aiRemindersTitle, isDark && { color: '#60A5FA' }]}>AI Appointment Reminder</Text>
                            </View>
                            <Text style={[styles.aiRemindersDesc, isDark && { color: '#94A3B8' }]}>
                                AI will remind you before your appointments and help you prepare better.
                            </Text>
                            
                            <View style={[styles.aiReminderStatus, isDark && { backgroundColor: '#0F172A' }]}>
                                <MaterialCommunityIcons name={aiRemindersOn ? "clock-check-outline" : "clock-remove-outline"} size={16} color={aiRemindersOn ? "#10B981" : "#EF4444"} />
                                <Text style={[styles.aiStatusText, { color: aiRemindersOn ? "#10B981" : "#EF4444" }]}>
                                    {aiRemindersOn ? 'Reminders On' : 'Reminders Off'}
                                </Text>
                            </View>

                            <TouchableOpacity style={styles.manageRemindersBtn} onPress={toggleAiReminders}>
                                <Text style={[styles.manageRemindersText, isDark && { color: '#60A5FA' }]}>Manage Reminders</Text>
                                <MaterialCommunityIcons name="chevron-right" size={14} color={isDark ? "#60A5FA" : "#2563EB"} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* History Section (Full Width underneath split grid) */}
                <View style={styles.historySection}>
                    <View style={styles.historyHeader}>
                        <Text style={[styles.historyHeadingTitle, { color: colors.text }]}>Appointment History</Text>
                        <TouchableOpacity>
                            <Text style={styles.historyViewAll}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {historyItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                            onPress={() => router.push(`/appointments/appointment-details?id=${item.id}`)}
                        >
                            <View style={styles.historyLeft}>
                                <View style={styles.avatarCheckmarkWrapper}>
                                    <Image source={item.avatar} style={styles.historyAvatar} />
                                {item.status === 'completed' ? (
                                    <View style={styles.checkmarkBadge}>
                                        <MaterialCommunityIcons name="check" size={10} color="#FFFFFF" />
                                    </View>
                                ) : (
                                    <View style={[styles.checkmarkBadge, { backgroundColor: "#EF4444" }]}>
                                        <MaterialCommunityIcons name="close" size={10} color="#FFFFFF" />
                                    </View>
                                )}
                            </View>

                            <View style={styles.historyMeta}>
                                <Text style={[styles.historyDoctorName, { color: colors.text }]}>{item.doctorName}</Text>
                                <Text style={[styles.historySpecialtyText, { color: item.specialtyColor }]}>
                                    {item.specialty}
                                </Text>
                                <Text style={[styles.historyDate, { color: colors.textSecondary }]}>{item.date}</Text>
                                <Text style={[styles.historyClinic, { color: colors.textSecondary }]}>{item.clinic}</Text>
                            </View>
                        </View>

                        <View style={styles.historyRight}>
                            <View style={[styles.completedBadge, item.status === 'cancelled' && { backgroundColor: '#FEE2E2' }]}>
                                <Text style={[styles.completedBadgeText, item.status === 'cancelled' && { color: '#EF4444' }]}>
                                    {item.status === 'completed' ? 'Completed' : 'Cancelled'}
                                </Text>
                            </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} style={{ marginLeft: 8 }} />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Bottom Floating Book Action FAB */}
            <View style={styles.bottomFabContainer}>
                <TouchableOpacity
                    style={styles.fabBtn}
                    onPress={() => router.push("/appointments/book")}
                >
                    <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.fabBtnText}>Book New Appointment</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        height: 60,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        marginRight: 10,
        width: 34,
        height: 34,
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        width: 140,
        height: 40,
        resizeMode: "contain",
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    notificationWrapper: {
        position: "relative",
        marginRight: 16,
    },
    badge: {
        position: "absolute",
        top: -4,
        right: -4,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#EF4444",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#FFFFFF",
    },
    badgeText: {
        color: "#FFFFFF",
        fontSize: 9,
        fontWeight: "800",
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    scrollContent: {
        paddingBottom: 110,
    },
    titleSection: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        backgroundColor: "#FFFFFF",
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    titleLeft: {
        flex: 1,
        paddingRight: 10,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#071739",
    },
    pageSubtitle: {
        fontSize: 13,
        color: "#64748B",
        marginTop: 4,
        lineHeight: 18,
    },
    titleImage: {
        width: 120,
        height: 80,
        resizeMode: "contain",
    },
    splitRow: {
        flexDirection: "row",
        paddingHorizontal: 12,
        marginTop: 20,
    },
    leftCol: {
        width: "56%",
        paddingRight: 8,
    },
    rightCol: {
        width: "44%",
        paddingLeft: 8,
    },
    colHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
        minHeight: 24,
    },
    columnHeading: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0F172A",
    },
    upcomingCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        paddingBottom: 10,
    },
    doctorAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    doctorInfo: {
        flex: 1,
    },
    tag: {
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 9,
        fontWeight: "800",
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    doctorName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#071739",
    },
    specialtyRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
    },
    specialtyText: {
        fontSize: 11,
        fontWeight: "600",
        marginLeft: 4,
    },
    cardDetails: {
        marginVertical: 10,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    detailText: {
        fontSize: 11,
        color: "#475569",
        marginLeft: 6,
        fontWeight: "500",
    },
    videoConsultBtn: {
        backgroundColor: "#2563EB",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 10,
    },
    videoConsultBtnText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "700",
    },
    cardActionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cardActionOutlineBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#2563EB",
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 2,
        marginHorizontal: 2,
    },
    actionBtnTextBlue: {
        color: "#2563EB",
        fontSize: 9,
        fontWeight: "700",
    },
    actionBtnTextRed: {
        color: "#EF4444",
        fontSize: 9,
        fontWeight: "700",
    },
    emptyStateCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: 16,
    },
    emptyStateTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
        marginTop: 12,
        marginBottom: 4,
    },
    emptyStateDesc: {
        fontSize: 11,
        color: "#64748B",
        textAlign: "center",
    },
    calendarWidget: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        padding: 14,
        marginBottom: 16,
    },
    calendarHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    calendarTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#0F172A",
    },
    calendarNav: {
        flexDirection: "row",
    },
    navArrow: {
        padding: 2,
        marginLeft: 8,
    },
    weekdaysRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    weekdayText: {
        flex: 1,
        textAlign: "center",
        fontSize: 10,
        fontWeight: "600",
        color: "#94A3B8",
    },
    daysGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    calendarCell: {
        width: "14.28%", // 7 columns
        aspectRatio: 1.1,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    calendarCellEmpty: {
        width: "14.28%",
        aspectRatio: 1.1,
    },
    calendarCellDay: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    calendarCellDayText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#334155",
    },
    calendarDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        position: "absolute",
        bottom: 1,
    },
    legendContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 14,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        paddingTop: 10,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 10,
        marginBottom: 4,
    },
    legendDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    legendText: {
        fontSize: 9,
        fontWeight: "600",
        color: "#64748B",
    },
    aiRemindersCard: {
        backgroundColor: "#EFF6FF",
        borderWidth: 1,
        borderColor: "#DBEAFE",
        borderRadius: 20,
        padding: 14,
    },
    aiRemindersHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    bellBadgeIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    aiRemindersTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: "#1E3A8A",
        flex: 1,
    },
    aiRemindersDesc: {
        fontSize: 10,
        color: "#2563EB",
        lineHeight: 14,
    },
    aiReminderStatus: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: "flex-start",
    },
    aiStatusText: {
        fontSize: 9,
        fontWeight: "700",
        color: "#166534",
        marginLeft: 4,
    },
    manageRemindersBtn: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
    },
    manageRemindersText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#2563EB",
        marginRight: 2,
    },
    historySection: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    historyHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    historyHeadingTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
    },
    historyViewAll: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2563EB",
    },
    historyCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.01,
        shadowRadius: 6,
        elevation: 1,
    },
    historyLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    avatarCheckmarkWrapper: {
        position: "relative",
        marginRight: 12,
    },
    historyAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    checkmarkBadge: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#10B981",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#FFFFFF",
    },
    historyMeta: {
        flex: 1,
    },
    historyDoctorName: {
        fontSize: 13,
        fontWeight: "700",
        color: "#0F172A",
    },
    historySpecialtyText: {
        fontSize: 10,
        fontWeight: "600",
        marginTop: 1,
    },
    historyDate: {
        fontSize: 10,
        color: "#64748B",
        marginTop: 2,
    },
    historyClinic: {
        fontSize: 10,
        color: "#94A3B8",
        marginTop: 1,
    },
    historyRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    completedBadge: {
        backgroundColor: "#E8F5E9",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    completedBadgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#10B981",
    },
    bottomFabContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "transparent",
        paddingHorizontal: 20,
        paddingVertical: 14,
        alignItems: "center",
    },
    fabBtn: {
        backgroundColor: "#2563EB",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 24,
        paddingVertical: 12,
        paddingHorizontal: 20,
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    fabBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },
});