import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { mockReports } from "@/utils/mockReportsData";
import { useTheme } from "@/utils/themeManager";

export default function RecentReportCard() {
    const router = useRouter();
    const slideAnim = useMemo(() => new Animated.Value(20), []);
    const fadeAnim = useMemo(() => new Animated.Value(0), []);
    const { colors, isDark } = useTheme();

    // Get the most recent report from our mockup database
    const latestReport = useMemo(() => {
        return mockReports[0] || {
            id: "cbc",
            title: "Complete Blood Count (CBC)",
            date: "20 May 2026",
            labName: "LifeRelier Pathology Lab",
            status: "Normal",
            icon: "flask-outline",
        };
    }, []);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 500, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 7, delay: 500, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    const getStatusColors = (status: string) => {
        if (status === "Normal") {
            return { bg: "#DCFCE7", text: "#166534" };
        } else if (status === "Borderline" || status === "Review") {
            return { bg: "#FEF3C7", text: "#B45309" };
        }
        return { bg: "#FEE2E2", text: "#991B1B" };
    };

    const statusColors = getStatusColors(latestReport.status);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.header}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Report</Text>
                <TouchableOpacity onPress={() => router.push("/(tabs)/reports")}>
                    <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: isDark ? 1 : 0 }]}
                onPress={() => router.push(`/reports/report-details?id=${latestReport.id}`)}
            >
                <View style={[styles.iconWrapper, { backgroundColor: isDark ? colors.backgroundSecondary : "#EFF6FF" }]}>
                    <MaterialCommunityIcons name={latestReport.icon as any} size={28} color="#3B82F6" />
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
                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} style={{ marginLeft: 8 }} />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: { marginHorizontal: 20, marginTop: 24 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
    viewAll: { fontSize: 14, fontWeight: "600", color: "#2563EB" },
    card: {
        backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center",
        shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04, shadowRadius: 14, elevation: 3,
    },
    iconWrapper: { width: 50, height: 50, borderRadius: 12, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" },
    content: { flex: 1, marginLeft: 14 },
    title: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
    subtitle: { marginTop: 4, color: "#64748B", fontSize: 12 },
    rightSection: { flexDirection: "row", alignItems: "center" },
    badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    badgeText: { fontWeight: "700", fontSize: 12 },
});