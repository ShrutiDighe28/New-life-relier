import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTheme } from "@/utils/themeManager";

export default function AIAssistantCard() {
    const router = useRouter();
    const fadeAnim = useMemo(() => new Animated.Value(0), []);
    const slideAnim = useMemo(() => new Animated.Value(20), []);
    const { colors, isDark } = useTheme();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 100, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 7, delay: 100, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <LinearGradient 
                colors={isDark ? [colors.card, "#1E293B"] : ["#EFF6FF", "#DBEAFE", "#EFF6FF"]} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 1 }} 
                style={[styles.container, isDark ? { borderColor: colors.cardBorder, borderWidth: 1 } : { borderColor: "#BFDBFE", borderWidth: 1 }]}
            >
                <View style={styles.contentRow}>
                    {/* Premium Medical AI Vector Graphic */}
                    <View style={styles.graphicContainer}>
                        <View style={styles.iconCircleOuter}>
                            <View style={styles.iconCircleInner}>
                                <MaterialCommunityIcons name="stethoscope" size={38} color="#2563EB" />
                            </View>
                        </View>
                        {/* Decorative floating elements */}
                        <View style={styles.floatingDot1} />
                        <View style={styles.floatingDot2} />
                        <MaterialCommunityIcons name="plus" size={16} color="#3B82F6" style={styles.floatingCross} />
                    </View>

                    <View style={styles.chatSection}>
                        <View style={styles.headerRow}>
                            <MaterialCommunityIcons name="robot-outline" size={18} color="#2563EB" />
                            <Text style={styles.aiTitle}>LifeRelier AI Assistant</Text>
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity onPress={() => router.push("/ai/assistant")} style={{ padding: 4 }}>
                                <MaterialCommunityIcons name="dots-horizontal" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.chatBubble, { backgroundColor: colors.background }]}>
                            <Text style={[styles.chatText, { color: colors.text }]}>
                                Your <Text style={styles.highlightText}>Vitamin D</Text> level is low for <Text style={styles.highlightText}>3 months</Text>.
                            </Text>
                            <Text style={[styles.chatSubText, { color: colors.textSecondary }]}>Would you like diet recommendations?</Text>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.9}
                            style={styles.button}
                            onPress={() => router.push("/ai/assistant")}
                        >
                            <Text style={styles.buttonText}>View Recommendations</Text>
                            <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 18,
        borderRadius: 20,
        padding: 16,
        elevation: 3,
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
    },
    contentRow: { flexDirection: "row", alignItems: "center" },
    graphicContainer: {
        justifyContent: "center",
        alignItems: "center",
        paddingRight: 16,
        paddingVertical: 10,
        position: "relative",
        width: 100,
    },
    iconCircleOuter: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        justifyContent: "center",
        alignItems: "center",
    },
    iconCircleInner: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    floatingDot1: {
        position: "absolute",
        top: 8,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#F59E0B",
    },
    floatingDot2: {
        position: "absolute",
        bottom: 12,
        left: 4,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#10B981",
    },
    floatingCross: {
        position: "absolute",
        top: 24,
        left: -4,
    },
    chatSection: {
        flex: 1,
        justifyContent: "space-between",
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    aiTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#2563EB",
        marginLeft: 6,
    },
    chatBubble: {
        borderRadius: 16,
        borderTopLeftRadius: 4,
        padding: 14,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 1,
    },
    chatText: {
        fontSize: 14,
        fontWeight: "500",
        lineHeight: 22,
    },
    highlightText: { color: "#EF4444", fontWeight: "700" },
    chatSubText: { marginTop: 8, fontSize: 13 },
    button: {
        backgroundColor: "#1D4ED8",
        alignSelf: "flex-start",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
    },
    buttonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13, marginRight: 6 },
});