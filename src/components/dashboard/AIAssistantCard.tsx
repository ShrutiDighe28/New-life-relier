import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useTheme } from "@/utils/themeManager";
import { useReports } from "@/context/ReportsContext";
import { SHADOWS } from "@/constants/DesignSystem";

export default function AIAssistantCard() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { reports } = useReports();
    const hasData = reports.length > 0;

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.1, duration: 1200, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
            ])
        ).start();
    }, [pulseAnim]);

    return (
        <View
            style={[
                styles.cardContainer,
                {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    borderWidth: 1,
                    marginTop: 4,
                },
                SHADOWS.sm,
            ]}
        >
            <View style={styles.contentRow}>
                <View style={styles.leftContent}>
                    <View style={styles.headerRow}>
                        <View style={[styles.iconWrapper, { backgroundColor: isDark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF" }]}>
                            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                                <MaterialCommunityIcons name="brain" size={20} color={colors.primary} />
                            </Animated.View>
                        </View>
                        <Text style={[styles.aiTitle, { color: colors.text }]}>
                            LifeRelier AI
                        </Text>
                    </View>

                    <View style={styles.messageContainer}>
                        {hasData ? (
                            <>
                                <Text style={[styles.messageTitle, { color: colors.text }]}>
                                    Health Insight Ready
                                </Text>
                                <Text style={[styles.messageBody, { color: colors.textSecondary }]}>
                                    Based on your recent reports, we have personalized recommendations for you.
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={[styles.messageTitle, { color: colors.text }]}>
                                    Meet Your AI Assistant
                                </Text>
                                <Text style={[styles.messageBody, { color: colors.textSecondary }]}>
                                    Upload your health records to get personalized insights and recommendations.
                                </Text>
                            </>
                        )}
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => hasData ? router.push("/ai/assistant") : router.push("/(tabs)/reports")}
                        style={styles.actionBtnWrap}
                    >
                        <View style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                            <Text style={styles.actionButtonText}>
                                {hasData ? "View Insights" : "Upload Data"}
                            </Text>
                            <MaterialCommunityIcons name="arrow-right" size={16} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>
                </View>

                <Animated.View style={[styles.rightGraphic, { transform: [{ scale: pulseAnim }] }]}>
                    <MaterialCommunityIcons name="robot-outline" size={80} color={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(5, 150, 105, 0.08)"} style={styles.robotGraphic} />
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: 24,
        padding: 20,
        overflow: "hidden",
        position: "relative",
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    bgDecoration1: {},
    bgDecoration2: {},
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
    actionBtnWrap: {
        alignSelf: "flex-start",
        borderRadius: 9999,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 9999,
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