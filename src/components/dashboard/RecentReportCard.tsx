import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useReports } from "@/context/ReportsContext";
import { useTheme } from "@/utils/themeManager";

export default function RecentReportCard() {
    const router = useRouter();
    const slideAnim = useMemo(() => new Animated.Value(20), []);
    const fadeAnim = useMemo(() => new Animated.Value(0), []);
    const { colors, isDark } = useTheme();

    const { reports } = useReports();
    const latestReport = reports[0] || null;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 400, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 8, delay: 400, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    const getStatusColors = (status: string) => {
        if (status === "Normal") return { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981" };
        if (status === "Borderline" || status === "Review") return { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B" };
        return { bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444" };
    };

    const statusColors = latestReport ? getStatusColors(latestReport.status) : { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981" };

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.header}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Report</Text>
                <TouchableOpacity onPress={() => router.push("/(tabs)/reports")}>
                    <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
            </View>

            {latestReport ? (
                <TouchableOpacity
                    activeOpacity={0.9}
                    style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: isDark ? 1 : 0 }]}
                    onPress={() => router.push(`/reports/report-details?id=${latestReport.id}`)}
                >
                    <View style={[styles.iconWrapper, { backgroundColor: "rgba(37, 99, 235, 0.1)" }]}>
                        <MaterialCommunityIcons name={latestReport.icon as any} size={28} color="#2563EB" />
                    </View>

                    <View style={styles.content}>
                        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                            {latestReport.title}
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                            {latestReport.date} • {latestReport.labName}
                        </Text>
                    </View>

                    <View style={styles.rightSection}>
                        <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
                            <Text style={[styles.badgeText, { color: statusColors.text }]}>{latestReport.status}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    activeOpacity={0.9}
                    style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: isDark ? 1 : 0 }]}
                    onPress={() => router.push("/(tabs)/reports")}
                >
                    <View style={[styles.iconWrapper, { backgroundColor: isDark ? colors.backgroundSecondary : "#F1F5F9" }]}>
                        <MaterialCommunityIcons name="file-plus-outline" size={28} color={colors.textSecondary} />
                    </View>
                    <View style={styles.content}>
                        <Text style={[styles.title, { color: colors.text }]}>No Reports Yet</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your uploaded reports will appear here</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: { marginHorizontal: 20, marginTop: 24 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: "700", letterSpacing: -0.3 },
    viewAll: { fontSize: 13, fontWeight: "600", color: "#2563EB" },
    card: {
        borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center",
        shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05, shadowRadius: 12, elevation: 3,
    },
    iconWrapper: { width: 50, height: 50, borderRadius: 16, justifyContent: "center", alignItems: "center" },
    content: { flex: 1, marginLeft: 14 },
    title: { fontSize: 16, fontWeight: "700" },
    subtitle: { marginTop: 4, fontSize: 12, fontWeight: "500" },
    rightSection: { flexDirection: "row", alignItems: "center" },
    badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
    badgeText: { fontWeight: "700", fontSize: 11 },
});