import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useTheme } from "@/utils/themeManager";
import { useAppointments } from "@/context/AppointmentsContext";

export default function AppointmentCard() {
    const router = useRouter();
    const { upcomingAppointments } = useAppointments();
    const slideAnim = useMemo(() => new Animated.Value(20), []);
    const fadeAnim = useMemo(() => new Animated.Value(0), []);
    const { colors, isDark } = useTheme();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 400, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 7, delay: 400, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    if (!upcomingAppointments || upcomingAppointments.length === 0) {
        return null;
    }

    const upcomingApp = upcomingAppointments[0];
    const [datePart, timePart] = upcomingApp.date.split(" • ");
    const [month, dayYear] = datePart.split(" ");
    const day = dayYear.replace(",", "");
    
    let dayText = "DAY";
    try {
        const dateObj = new Date(datePart);
        if (!isNaN(dateObj.getTime())) {
            dayText = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        }
    } catch (e) {}

    const handleNavigate = () => {
        router.push(`/appointments/appointment-details?id=${upcomingApp.id}`);
    };

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Appointment</Text>

            <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: isDark ? 1 : 0 }]}
                onPress={handleNavigate}
            >
                <View style={[styles.dateBox, { borderColor: colors.cardBorder }]}>
                    <View style={styles.dateMonth}>
                        <Text style={styles.monthText}>{month.toUpperCase()}</Text>
                    </View>
                    <View style={[styles.dateDay, { backgroundColor: colors.backgroundSecondary }]}>
                        <Text style={[styles.dayNum, { color: colors.text }]}>{day}</Text>
                        <Text style={[styles.dayText, { color: colors.textSecondary }]}>{dayText}</Text>
                    </View>
                </View>

                <View style={styles.info}>
                    <Text style={[styles.doctorName, { color: colors.text }]}>{upcomingApp.doctorName}</Text>
                    <Text style={[styles.speciality, { color: colors.textSecondary }]}>{upcomingApp.specialty}</Text>
                    <View style={styles.detailsRow}>
                        <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.detailText, { color: colors.textSecondary }]}>{timePart}</Text>
                        <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.textSecondary} style={{ marginLeft: 10 }} />
                        <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>{upcomingApp.clinic.split(',')[0]}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={handleNavigate}
                >
                    <Text style={styles.actionText}>View Details</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: { marginHorizontal: 20, marginTop: 24 },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 12 },
    card: {
        backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center",
        shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04, shadowRadius: 14, elevation: 3,
    },
    dateBox: { width: 55, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "#E2E8F0" },
    dateMonth: { backgroundColor: "#2563EB", paddingVertical: 4, alignItems: "center" },
    monthText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
    dateDay: { backgroundColor: "#FFFFFF", paddingVertical: 6, alignItems: "center" },
    dayNum: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
    dayText: { fontSize: 10, fontWeight: "600", color: "#64748B" },
    info: { flex: 1, marginLeft: 14 },
    doctorName: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
    speciality: { fontSize: 13, color: "#64748B", marginTop: 2, marginBottom: 6 },
    detailsRow: { flexDirection: "row", alignItems: "center" },
    detailText: { fontSize: 12, color: "#64748B", marginLeft: 4 },
    actionBtn: { borderWidth: 1.5, borderColor: "#2563EB", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
    actionText: { color: "#2563EB", fontSize: 12, fontWeight: "700" },
});