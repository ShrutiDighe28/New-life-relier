import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Image, Animated, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useTheme } from "@/utils/themeManager";

export default function HealthScore() {
    const router = useRouter();
    const slideAnim = useMemo(() => new Animated.Value(20), []);
    const fadeAnim = useMemo(() => new Animated.Value(0), []);
    const { colors, isDark } = useTheme();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 7, delay: 200, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    const handleNavigate = () => {
        router.push("/profile/goals");
    };

    return (
        <Animated.View style={[styles.wrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.header}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Health Score</Text>
                <TouchableOpacity onPress={handleNavigate}>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: isDark ? 1 : 0 }]}
                activeOpacity={0.9}
                onPress={handleNavigate}
            >
                <View style={styles.progressContainer}>
                    <View style={[styles.progressRing, { borderColor: isDark ? colors.background : "#E2E8F0", borderTopColor: "#10B981", borderRightColor: "#10B981", borderBottomColor: "#10B981" }]}>
                        <View style={styles.innerCircle}>
                            <Text style={[styles.scoreText, { color: colors.text }]}>87</Text>
                            <Text style={styles.outOfText}>/100</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.statusText}>Excellent</Text>
                    <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>Great job! Keep maintaining your healthy routine.</Text>
                </View>

                <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.backgroundSecondary : "#ECFDF5" }]}>
                    <Image source={require("@/assets/images/dashboard/shield.png")} style={styles.shieldIcon} />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrapper: { marginHorizontal: 20, marginTop: 24 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 3,
    },
    progressContainer: { marginRight: 16 },
    progressRing: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 6,
        borderColor: "#E2E8F0",
        borderTopColor: "#10B981",
        borderRightColor: "#10B981",
        borderBottomColor: "#10B981",
        justifyContent: "center",
        alignItems: "center",
        transform: [{ rotate: "-45deg" }],
    },
    innerCircle: { transform: [{ rotate: "45deg" }], justifyContent: "center", alignItems: "center" },
    scoreText: { fontSize: 26, fontWeight: "800", color: "#0F172A", lineHeight: 30 },
    outOfText: { fontSize: 11, color: "#94A3B8", fontWeight: "600" },
    infoContainer: { flex: 1, paddingRight: 10 },
    statusText: { fontSize: 18, fontWeight: "700", color: "#10B981", marginBottom: 4 },
    subtitleText: { fontSize: 13, color: "#64748B", lineHeight: 18 },
    iconContainer: {
        width: 60, height: 60, borderRadius: 30, backgroundColor: "#ECFDF5",
        justifyContent: "center", alignItems: "center",
    },
    shieldIcon: { width: 32, height: 32, resizeMode: "contain", tintColor: "#10B981" },
});