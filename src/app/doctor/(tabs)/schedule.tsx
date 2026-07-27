import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@/utils/themeManager";

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

    const appointments = SCHEDULE_DATA[selectedDate] || [];

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
                            </Text>
                            <Text style={[styles.dateNum, { color: colors.text }, isSelected && styles.dayTextSelected]}>
                                {item.date}
                            </Text>
                            {item.isToday && <View style={[styles.todayDot, isSelected && { backgroundColor: "#FFFFFF" }]} />}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

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
            <TouchableOpacity activeOpacity={0.9} style={styles.fab}>
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
    dayScroll: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        gap: 10,
    },
    dayPill: {
        width: 60,
        height: 76,
        borderRadius: 22,
        borderWidth: 1.5,
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
        fontSize: 13,
        fontWeight: "700",
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
        borderRadius: 20,
        borderWidth: 1.5,
        padding: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    patientLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F0FDFA",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#0D9488",
        fontSize: 14,
        fontWeight: "800",
    },
    patientName: {
        fontSize: 15,
        fontWeight: "700",
    },
    badgeRow: {
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

