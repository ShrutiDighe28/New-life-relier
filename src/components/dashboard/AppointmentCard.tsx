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
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 300, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 8, delay: 300, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    if (!upcomingAppointments || upcomingAppointments.length === 0) {
        return null;
    }

    const upcomingApp = upcomingAppointments[0];
    const dateStr = upcomingApp.date || "";
    const [datePart = "", timePart = dateStr] = dateStr.includes(" • ") ? dateStr.split(" • ") : [dateStr, ""];

    let month = "JUN";
    let day = "15";

    if (datePart) {
        try {
            const dateObj = new Date(datePart);
            if (!isNaN(dateObj.getTime())) {
                month = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
                day = String(dateObj.getDate());
            } else {
                const parts = datePart.replace(",", "").split(" ");
                if (parts.length >= 2) {
                    month = (parts[0] || "JUN").toUpperCase();
                    day = parts[1] || "15";
                }
            }
        } catch (e) {}
    }

    const handleNavigate = () => {
        router.push(`/appointments/appointment-details?id=${upcomingApp.id}`);
    };

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.headerRow}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Next Appointment</Text>
                <TouchableOpacity onPress={() => router.push("/(tabs)/appointments")}>
                    <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>See All</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                activeOpacity={0.9}
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                        borderWidth: 1,
                        borderLeftWidth: 4,
                        borderLeftColor: colors.primary,
                    },
                ]}
                onPress={handleNavigate}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.doctorInfoRow}>
                        <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF" }]}>
                            <Text style={[styles.avatarText, { color: colors.primary }]}>
                                {(upcomingApp.doctorName || "D").charAt(0)}
                            </Text>
                        </View>
                        <View style={styles.doctorDetails}>
                            <Text style={[styles.doctorName, { color: colors.text }]}>{upcomingApp.doctorName}</Text>
                            <Text style={[styles.speciality, { color: colors.textSecondary }]}>{upcomingApp.specialty}</Text>
                        </View>
                    </View>
                    <View style={[styles.dateBox, { backgroundColor: isDark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF" }]}>
                        <Text style={[styles.monthText, { color: colors.primary }]}>{month}</Text>
                        <Text style={[styles.dayNum, { color: colors.primary }]}>{day}</Text>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.divider }]} />

                <View style={styles.footerRow}>
                    <View style={styles.infoPill}>
                        <MaterialCommunityIcons name="clock-outline" size={15} color={colors.primary} />
                        <Text style={[styles.pillText, { color: colors.textSecondary }]}>{timePart}</Text>
                    </View>
                    <View style={[styles.separator, { backgroundColor: colors.divider }]} />
                    <View style={styles.infoPill}>
                        <MaterialCommunityIcons name="map-marker-outline" size={15} color={colors.primary} />
                        <Text style={[styles.pillText, { color: colors.textSecondary }]} numberOfLines={1}>
                            {(upcomingApp.clinic || "").split(',')[0]}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 0 },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    sectionTitle: { fontSize: 17, fontWeight: "700", letterSpacing: -0.3 },
    card: {
        borderRadius: 16,
        padding: 16,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    doctorInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    avatarPlaceholder: {
        width: 46,
        height: 46,
        borderRadius: 23,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    avatarText: {
        fontSize: 19,
        fontWeight: "700",
    },
    doctorDetails: { flex: 1 },
    doctorName: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
    speciality: { fontSize: 13, fontWeight: "500" },
    dateBox: {
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    monthText: { fontSize: 10, fontWeight: "700", marginBottom: 2, letterSpacing: 0.5 },
    dayNum: { fontSize: 17, fontWeight: "800" },
    divider: {
        height: 1,
        width: "100%",
        marginVertical: 12,
    },
    footerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    separator: {
        width: 1,
        height: 14,
    },
    infoPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    pillText: {
        fontSize: 13,
        fontWeight: "500",
    },
});