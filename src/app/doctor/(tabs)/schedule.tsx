import { useTheme } from "@/utils/themeManager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import CalendarHeader from "../components/CalendarHeader";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { appointmentStore, Appointment } from "@/utils/appointmentStore";

export default function DoctorScheduleScreen() {
    const { colors, isDark } = useTheme();
    const router = useRouter();

    const todayStr = new Date().toISOString().split("T")[0];
    const [selectedDate, setSelectedDate] = useState("2026-07-24");
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        setAppointments(appointmentStore.getAppointmentsForDate(selectedDate));
    }, [selectedDate]);

    useEffect(() => {
        const unsubscribe = appointmentStore.subscribe(() => {
            setAppointments(appointmentStore.getAppointmentsForDate(selectedDate));
        });
        return unsubscribe;
    }, [selectedDate]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            <CalendarHeader selectedDate={selectedDate} onSelect={setSelectedDate} />

            {/* Appointment Timeline List */}
            <View style={styles.listContainer}>
                {appointments.length > 0 ? (
                    <FlatList
                        data={appointments}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 110 }}
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
                                                {item.phone && (
                                                    <Text style={[styles.phoneText, { color: colors.textSecondary }]}>
                                                        {item.phone}
                                                    </Text>
                                                )}
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

            {/* Floating Action Button (FAB) */}
            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.88}
                onPress={() => router.push("/doctor/add-appointment")}
            >
                <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    phoneText: {
        fontSize: 11,
        marginTop: 1,
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
        zIndex: 99,
    },
});
