import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface ScheduledEvent {
    id: string;
    doctorName: string;
    specialty: string;
    time: string;
    type: "Video" | "Clinic";
    clinic: string;
    color: string;
    bgColor: string;
}

const appointmentsByDate: Record<number, ScheduledEvent[]> = {
    14: [
        { id: "e1", doctorName: "Dr. James Anderson", specialty: "Cardiology", time: "10:30 AM", type: "Video", clinic: "HeartCare Clinic, NY", color: "#2563EB", bgColor: "#EFF6FF" }
    ],
    18: [
        { id: "e2", doctorName: "Dr. Sarah Thompson", specialty: "General Physician", time: "02:00 PM", type: "Clinic", clinic: "CityCare Hospital, NY", color: "#10B981", bgColor: "#E8F5E9" }
    ],
    24: [
        { id: "e3", doctorName: "Dr. Michael Lee", specialty: "Dermatology", time: "11:15 AM", type: "Clinic", clinic: "Skin & You Clinic, NY", color: "#F59E0B", bgColor: "#FEF3C7" }
    ]
};

export default function CalendarScreen() {
    const router = useRouter();

    const [selectedDay, setSelectedDay] = useState<number>(14);
    const [specialtyFilter, setSpecialtyFilter] = useState("All");

    const eventsForDay = useMemo(() => {
        const events = appointmentsByDate[selectedDay] || [];
        if (specialtyFilter === "All") return events;
        return events.filter((e) => e.specialty === specialtyFilter);
    }, [selectedDay, specialtyFilter]);

    // May 2024 calendar rendering
    const renderCalendarGrid = () => {
        const offset = 3; // Wed
        const totalDays = 31;
        const days: React.ReactNode[] = [];

        for (let i = 0; i < offset; i++) {
            days.push(<View key={`empty-${i}`} style={styles.gridCellEmpty} />);
        }

        for (let day = 1; day <= totalDays; day++) {
            const hasAppointment = !!appointmentsByDate[day];
            const isSelected = selectedDay === day;

            let dotColor = "#94A3B8";
            if (day === 14) dotColor = "#2563EB";
            else if (day === 18) dotColor = "#10B981";
            else if (day === 24) dotColor = "#F59E0B";

            days.push(
                <TouchableOpacity
                    key={`day-${day}`}
                    style={[
                        styles.gridCell,
                        isSelected && styles.gridCellSelected,
                    ]}
                    onPress={() => setSelectedDay(day)}
                >
                    <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{day}</Text>
                    {hasAppointment && !isSelected && (
                        <View style={[styles.appointmentDot, { backgroundColor: dotColor }]} />
                    )}
                </TouchableOpacity>
            );
        }

        return days;
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#071739" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Calendar Schedule</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Specialty Filter chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
                    {["All", "Cardiology", "General Physician", "Dermatology"].map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterChip,
                                specialtyFilter === filter && styles.filterChipActive,
                            ]}
                            onPress={() => setSpecialtyFilter(filter)}
                        >
                            <Text style={[styles.filterChipText, specialtyFilter === filter && styles.filterChipTextActive]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Calendar Panel */}
                <View style={styles.calendarCard}>
                    <View style={styles.calendarHeader}>
                        <Text style={styles.calendarMonthTitle}>May 2024</Text>
                    </View>

                    <View style={styles.weekdayRow}>
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w, idx) => (
                            <Text key={idx} style={styles.weekdayText}>{w}</Text>
                        ))}
                    </View>

                    <View style={styles.gridRow}>
                        {renderCalendarGrid()}
                    </View>
                </View>

                {/* Day Schedule timeline list */}
                <View style={styles.timelineSection}>
                    <Text style={styles.timelineHeading}>Schedule for May {selectedDay}, 2024</Text>

                    {eventsForDay.length > 0 ? (
                        eventsForDay.map((event) => (
                            <View key={event.id} style={[styles.timelineEventCard, { borderColor: event.color }]}>
                                <View style={styles.eventLeft}>
                                    <View style={[styles.timeBadge, { backgroundColor: event.bgColor }]}>
                                        <Text style={[styles.timeText, { color: event.color }]}>{event.time}</Text>
                                    </View>
                                    
                                    <View style={styles.eventMeta}>
                                        <Text style={styles.eventDoctor}>{event.doctorName}</Text>
                                        <Text style={[styles.eventSpecialty, { color: event.color }]}>{event.specialty}</Text>
                                        <Text style={styles.eventClinic}>{event.clinic}</Text>
                                    </View>
                                </View>

                                <View style={styles.eventRight}>
                                    {event.type === "Video" ? (
                                        <TouchableOpacity
                                            style={[styles.actionBtn, { backgroundColor: event.color }]}
                                            onPress={() => router.push("/appointments/consultation")}
                                        >
                                            <Text style={styles.actionBtnText}>Join Call</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={styles.clinicIndicator}>
                                            <MaterialCommunityIcons name="office-building" size={16} color="#475569" />
                                            <Text style={styles.clinicIndicatorText}>In-person</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="calendar-blank-outline" size={44} color="#94A3B8" />
                            <Text style={styles.emptyText}>No appointments scheduled for this day</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
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
        paddingHorizontal: 16,
        height: 60,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    headerBtn: {
        width: 38,
        height: 38,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#071739",
    },
    scrollContent: {
        paddingBottom: 40,
    },
    filtersRow: {
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    filterChip: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
    filterChipText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#475569",
    },
    filterChipTextActive: {
        color: "#FFFFFF",
    },
    calendarCard: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 20,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 6,
        elevation: 2,
    },
    calendarHeader: {
        alignItems: "center",
        marginBottom: 16,
    },
    calendarMonthTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0F172A",
    },
    weekdayRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    weekdayText: {
        flex: 1,
        textAlign: "center",
        fontSize: 11,
        fontWeight: "700",
        color: "#94A3B8",
    },
    gridRow: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    gridCell: {
        width: "14.28%", // 7 columns
        aspectRatio: 1.0,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 4,
        position: "relative",
    },
    gridCellSelected: {
        backgroundColor: "#EFF6FF",
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: "#2563EB",
    },
    gridCellEmpty: {
        width: "14.28%",
        aspectRatio: 1.0,
    },
    dayText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#334155",
    },
    dayTextSelected: {
        color: "#2563EB",
    },
    appointmentDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        position: "absolute",
        bottom: 2,
    },
    timelineSection: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    timelineHeading: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 16,
    },
    timelineEventCard: {
        backgroundColor: "#FFFFFF",
        borderLeftWidth: 4,
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    eventLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    timeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 12,
    },
    timeText: {
        fontSize: 10,
        fontWeight: "800",
    },
    eventMeta: {
        flex: 1,
    },
    eventDoctor: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
    },
    eventSpecialty: {
        fontSize: 11,
        fontWeight: "600",
        marginTop: 1,
    },
    eventClinic: {
        fontSize: 11,
        color: "#64748B",
        marginTop: 2,
    },
    eventRight: {
        marginLeft: 10,
    },
    actionBtn: {
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    actionBtnText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "700",
    },
    clinicIndicator: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 8,
    },
    clinicIndicatorText: {
        fontSize: 10,
        color: "#475569",
        fontWeight: "600",
        marginLeft: 4,
    },
    emptyState: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 30,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    emptyText: {
        fontSize: 12,
        color: "#64748B",
        textAlign: "center",
        marginTop: 8,
    },
});
