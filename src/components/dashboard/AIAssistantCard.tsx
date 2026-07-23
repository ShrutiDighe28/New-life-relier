import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTheme } from "@/utils/themeManager";
import { useReports } from "@/context/ReportsContext";

export default function AIAssistantCard() {
    const router = useRouter();
    const fadeAnim = useMemo(() => new Animated.Value(0), []);
    const slideAnim = useMemo(() => new Animated.Value(15), []);
    const { colors, isDark } = useTheme();
    const { reports } = useReports();
    const hasData = reports.length > 0;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 100, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 8, delay: 100, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], marginHorizontal: 20, marginTop: 12 }}>
            <LinearGradient
                colors={isDark ? ["#1E293B", "#0F172A"] : ["#EFF6FF", "#E0E7FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardContainer}
            >
                {/* Decorative Background Elements */}
                <View style={styles.bgDecoration1} />
                <View style={styles.bgDecoration2} />

                <View style={styles.contentRow}>
                    <View style={styles.leftContent}>
                        <View style={styles.headerRow}>
                            <View style={[styles.iconWrapper, { backgroundColor: isDark ? "rgba(59, 130, 246, 0.2)" : "#FFFFFF" }]}>
                                <MaterialCommunityIcons name="brain" size={20} color="#2563EB" />
                            </View>
                            <Text style={[styles.aiTitle, { color: isDark ? "#FFFFFF" : "#1E3A8A" }]}>
                                LifeRelier AI
                            </Text>
                        </View>

                        <View style={styles.messageContainer}>
                            {hasData ? (
                                <>
                                    <Text style={[styles.messageTitle, { color: isDark ? "#F8FAFC" : "#0F172A" }]}>
                                        Health Insight Ready
                                    </Text>
                                    <Text style={[styles.messageBody, { color: isDark ? "#94A3B8" : "#475569" }]}>
                                        Based on your recent reports, we have personalized recommendations for you.
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Text style={[styles.messageTitle, { color: isDark ? "#F8FAFC" : "#0F172A" }]}>
                                        Meet Your AI Assistant
                                    </Text>
                                    <Text style={[styles.messageBody, { color: isDark ? "#94A3B8" : "#475569" }]}>
                                        Upload your health records to get personalized insights and recommendations.
                                    </Text>
                                </>
                            )}
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.actionButton, { backgroundColor: "#2563EB" }]}
                            onPress={() => hasData ? router.push("/ai/assistant") : router.push("/(tabs)/reports")}
                        >
                            <Text style={styles.actionButtonText}>
                                {hasData ? "View Insights" : "Upload Data"}
                            </Text>
                            <MaterialCommunityIcons name="arrow-right" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.rightGraphic}>
                        <MaterialCommunityIcons name="robot-outline" size={80} color="rgba(37, 99, 235, 0.15)" style={styles.robotGraphic} />
                    </View>
                </View>
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: 24,
        padding: 24,
        overflow: "hidden",
        position: "relative",
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },
    bgDecoration1: {
        position: "absolute",
        top: -40,
        right: -40,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: "rgba(59, 130, 246, 0.08)",
    },
    bgDecoration2: {
        position: "absolute",
        bottom: -20,
        right: 40,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(59, 130, 246, 0.05)",
    },
    contentRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    leftContent: {
        flex: 1,
        paddingRight: 16,
        zIndex: 1,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    iconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    aiTitle: {
        fontSize: 16,
        fontWeight: "700",
    },
    messageContainer: {
        marginBottom: 20,
    },
    messageTitle: {
        fontSize: 20,
        fontWeight: "800",
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    messageBody: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "400",
    },
    actionButton: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 9999, // Pill shape
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    actionButtonText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
        marginRight: 6,
    },
    rightGraphic: {
        position: "absolute",
        right: -20,
        bottom: -20,
        zIndex: 0,
    },
    robotGraphic: {
        transform: [{ rotate: "15deg" }],
    },
});