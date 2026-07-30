import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@/utils/themeManager";
import { useHealth } from "@/context/HealthContext";

export default function HealthInsights() {
    const slideAnim = useMemo(() => new Animated.Value(20), []);
    const fadeAnim = useMemo(() => new Animated.Value(0), []);
    const { colors, isDark } = useTheme();
    const { metrics } = useHealth();
    
    const stepsVal = metrics.steps !== "0" ? metrics.steps : "0";
    const stepsProgress = stepsVal === "0" ? 0 : Math.min((parseInt(stepsVal.replace(/,/g, "")) / 10000) * 100, 100) || 0;
    
    const sleepVal = metrics.sleep !== "--h --m" ? metrics.sleep : "0h 0m";
    const sleepProgress = sleepVal === "0h 0m" ? 0 : 85; 
    
    const hrVal = metrics.heartRate !== "-- bpm" ? metrics.heartRate : "0 bpm";
    const hrProgress = hrVal === "0 bpm" ? 0 : 50;
    
    const waterVal = "0/8";
    const waterProgress = 0;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 500, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 8, delay: 500, useNativeDriver: true }),
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
                <InsightCard colors={colors} isDark={isDark} icon="shoe-sneaker" color="#10B981" bg="rgba(16, 185, 129, 0.15)" title="Steps" value={stepsVal} subtitle={stepsVal === "0" ? "No Data" : "/ 10,000 steps"} progress={stepsProgress} route="Steps Insight" />
                <InsightCard colors={colors} isDark={isDark} icon="weather-night" color="#3B82F6" bg="rgba(59, 130, 246, 0.15)" title="Sleep" value={sleepVal} subtitle={sleepVal === "0h 0m" ? "No Data" : "Good"} progress={sleepProgress} route="Sleep Insight" />
                <InsightCard colors={colors} isDark={isDark} icon="heart-pulse" color="#EF4444" bg="rgba(239, 68, 68, 0.15)" title="Heart Rate" value={hrVal} subtitle={hrVal === "0 bpm" ? "No Data" : "Normal"} progress={hrProgress} route="Heart Rate Insight" />
                <InsightCard colors={colors} isDark={isDark} icon="cup-water" color="#F59E0B" bg="rgba(245, 158, 11, 0.15)" title="Water Intake" value={waterVal} subtitle={waterVal === "0/8" ? "No Data" : "glasses"} progress={waterProgress} route="Water Insight" />
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
            <View style={[styles.iconBg, { backgroundColor: bg }]}>
                <MaterialCommunityIcons name={icon} size={24} color={color} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>{title}</Text>
                <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9" }]}>
                <View style={[styles.progressBarFill, { backgroundColor: color, width: `${progress}%` }]} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 24, marginHorizontal: 20 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    title: { fontSize: 18, fontWeight: "700", letterSpacing: -0.3 },
    viewAll: { color: "#2563EB", fontWeight: "600", fontSize: 13 },
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    card: {
        width: "48%", borderRadius: 20, padding: 16, marginBottom: 16,
        shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05, shadowRadius: 12, elevation: 3,
    },
    iconBg: { width: 44, height: 44, borderRadius: 16, justifyContent: "center", alignItems: "center", marginBottom: 12 },
    textContainer: { marginBottom: 14 },
    cardTitle: { fontSize: 13, fontWeight: "600", marginBottom: 2 },
    value: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
    subtitle: { marginTop: 4, color: "#94A3B8", fontSize: 11, fontWeight: "500" },
    progressBarBg: { height: 6, borderRadius: 3, overflow: "hidden" },
    progressBarFill: { height: "100%", borderRadius: 3 },
});