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
import { useAppointments, Appointment } from "@/context/AppointmentsContext";
import {
    getDaysInMonth,
    getStartDayOfWeek,
    formatMonthYear,
    parseAppointmentDate,
    isSameDay,
    getSpecialtyColor,
} from "@/utils/calendarUtils";

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

export default function CalendarScreen() {
    const router = useRouter();
    const { appointments } = useAppointments();

    const today = new Date();
    const [currentDate, setCurrentDate] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
    const [specialtyFilter, setSpecialtyFilter] = useState("All");

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        setSelectedDay(1);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        setSelectedDay(1);
    };

    // Calculate events for selected day from real user appointments
    const eventsForDay = useMemo(() => {
        const targetDate = new Date(year, month, selectedDay);
        
        const matched = appointments.filter((app) => {
            const parsed = parseAppointmentDate(app.date);
            return parsed ? isSameDay(parsed, targetDate) : false;
        });

        const mapped: ScheduledEvent[] = matched.map((app) => {
            const [, timePart] = app.date.split(" • ");
            const color = getSpecialtyColor(app.specialty);
            return {
                id: app.id,
                doctorName: app.doctorName,
                specialty: app.specialty,
                time: timePart || "Scheduled",
                type: app.hasVideo ? "Video" : "Clinic",
                clinic: app.clinic,
                color,
                bgColor: color === "#2563EB" ? "#EFF6FF" : color === "#10B981" ? "#E8F5E9" : "#FEF3C7",
            };
        });

        if (specialtyFilter === "All") return mapped;
        return mapped.filter((e) => e.specialty === specialtyFilter);
    }, [appointments, year, month, selectedDay, specialtyFilter]);

    // Map of days in current month that have appointments
    const appointmentDaysMap = useMemo(() => {
        const map: Record<number, string> = {};
        appointments.forEach((app) => {
            const appDate = parseAppointmentDate(app.date);
            if (appDate && appDate.getFullYear() === year && appDate.getMonth() === month) {
                map[appDate.getDate()] = getSpecialtyColor(app.specialty);
            }
        });
        return map;
    }, [appointments, year, month]);

    // Calendar grid rendering
    const renderCalendarGrid = () => {
        const offset = getStartDayOfWeek(year, month);
        const totalDays = getDaysInMonth(year, month);
        const days: React.ReactNode[] = [];

        for (let i = 0; i < offset; i++) {
            days.push(<View key={`empty-${i}`} style={styles.gridCellEmpty} />);
        }

        for (let day = 1; day <= totalDays; day++) {
            const dotColor = appointmentDaysMap[day];
            const hasAppointment = !!dotColor;
            const isSelected = selectedDay === day;

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

    const selectedDateObj = new Date(year, month, selectedDay);
    const selectedDateFormatted = selectedDateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

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
                    <View style={styles.calendarHeaderRow}>
                        <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
                            <MaterialCommunityIcons name="chevron-left" size={24} color="#475569" />
                        </TouchableOpacity>
                        <Text style={styles.calendarMonthTitle}>{formatMonthYear(currentDate)}</Text>
                        <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#475569" />
                        </TouchableOpacity>
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
                    <Text style={styles.timelineHeading}>Schedule for {selectedDateFormatted}</Text>

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
    calendarHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    navBtn: {
        padding: 6,
        borderRadius: 8,
    },
    calendarMonthTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
    },
    weekdayRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 12,
    },
    weekdayText: {
        width: 36,
        textAlign: "center",
        fontSize: 12,
        fontWeight: "600",
        color: "#64748B",
    },
    gridRow: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    gridCell: {
        width: `${100 / 7}%`,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 2,
        borderRadius: 12,
    },
    gridCellEmpty: {
        width: `${100 / 7}%`,
        height: 40,
    },
    gridCellSelected: {
        backgroundColor: "#2563EB",
    },
    dayText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1E293B",
    },
    dayTextSelected: {
        color: "#FFFFFF",
    },
    appointmentDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        marginTop: 2,
    },
    timelineSection: {
        marginHorizontal: 20,
        marginTop: 24,
    },
    timelineHeading: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 14,
    },
    timelineEventCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderLeftWidth: 4,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    eventLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    timeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 12,
    },
    timeText: {
        fontSize: 12,
        fontWeight: "700",
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
        fontSize: 12,
        fontWeight: "600",
        marginTop: 2,
    },
    eventClinic: {
        fontSize: 11,
        color: "#64748B",
        marginTop: 2,
    },
    eventRight: {
        marginLeft: 8,
    },
    actionBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
    },
    actionBtnText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "700",
    },
    clinicIndicator: {
        flexDirection: "row",
        alignItems: "center",
    },
    clinicIndicatorText: {
        fontSize: 12,
        color: "#475569",
        marginLeft: 4,
        fontWeight: "500",
    },
    emptyState: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    emptyText: {
        marginTop: 8,
        fontSize: 13,
        color: "#64748B",
        fontWeight: "500",
    },
});
