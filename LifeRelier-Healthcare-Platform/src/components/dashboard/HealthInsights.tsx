import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@/utils/themeManager";

export default function HealthInsights() {
    const slideAnim = useMemo(() => new Animated.Value(20), []);
    const fadeAnim = useMemo(() => new Animated.Value(0), []);
    const { colors, isDark } = useTheme();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 7, delay: 600, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Health Insights</Text>
                <TouchableOpacity onPress={() => console.log("Navigate to All Insights")}>
                    <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.grid}>
                <InsightCard colors={colors} isDark={isDark} icon="shoe-sneaker" color="#10B981" bg="#ECFDF5" title="Steps" value="7,842" subtitle="/ 10,000 steps" progress={78} route="Steps Insight" />
                <InsightCard colors={colors} isDark={isDark} icon="weather-night" color="#3B82F6" bg="#EFF6FF" title="Sleep" value="7h 15m" subtitle="Good" progress={85} route="Sleep Insight" />
                <InsightCard colors={colors} isDark={isDark} icon="heart-pulse" color="#EF4444" bg="#FEF2F2" title="Heart Rate" value="72 bpm" subtitle="Normal" progress={50} route="Heart Rate Insight" />
                <InsightCard colors={colors} isDark={isDark} icon="cup-water" color="#F59E0B" bg="#FFF7ED" title="Water Intake" value="6/8" subtitle="glasses" progress={75} route="Water Insight" />
            </View>
        </Animated.View>
    );
}

function InsightCard({ colors, isDark, icon, color, bg, title, value, subtitle, progress, route }: any) {
    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: isDark ? 1 : 0 }]}
            activeOpacity={0.9}
            onPress={() => console.log(`Maps to ${route}`)}
        >
            <View style={[styles.iconBg, { backgroundColor: isDark ? colors.backgroundSecondary : bg }]}>
                <MaterialCommunityIcons name={icon} size={24} color={color} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>{title}</Text>
                <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: isDark ? colors.background : "#F1F5F9" }]}>
                <View style={[styles.progressBarFill, { backgroundColor: color, width: `${progress}%` }]} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 24, marginHorizontal: 20 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    title: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
    viewAll: { color: "#2563EB", fontWeight: "700", fontSize: 14 },
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    card: {
        width: "48%", backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, marginBottom: 16,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03, shadowRadius: 10, elevation: 2,
    },
    iconBg: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", marginBottom: 12 },
    textContainer: { marginBottom: 14 },
    cardTitle: { fontSize: 13, fontWeight: "600", color: "#64748B" },
    value: { marginTop: 4, fontSize: 20, fontWeight: "800", color: "#0F172A" },
    subtitle: { marginTop: 2, color: "#94A3B8", fontSize: 11, fontWeight: "500" },
    progressBarBg: { height: 6, backgroundColor: "#F1F5F9", borderRadius: 3, overflow: "hidden" },
    progressBarFill: { height: "100%", borderRadius: 3 },
});