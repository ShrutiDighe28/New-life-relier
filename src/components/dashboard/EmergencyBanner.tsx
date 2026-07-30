import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/utils/themeManager";
import { useRouter } from "expo-router";

export default function EmergencyBanner() {
    const router = useRouter();
    const slideAnim = useMemo(() => new Animated.Value(20), []);
    const fadeAnim = useMemo(() => new Animated.Value(0), []);
    const { colors, isDark } = useTheme();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 8, delay: 600, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    return (
        <Animated.View style={[styles.wrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push("/emergency/emergency-card")}
            >
                <LinearGradient 
                    colors={isDark ? ["rgba(239, 68, 68, 0.2)", "rgba(239, 68, 68, 0.05)"] : ["#FEF2F2", "#FEE2E2"]} 
                    style={[styles.container, isDark && { borderColor: "rgba(239, 68, 68, 0.3)", borderWidth: 1 }]}
                >
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="medical-bag" size={26} color="#EF4444" />
                    </View>

                    <View style={styles.info}>
                        <Text style={[styles.title, { color: isDark ? colors.text : "#991B1B" }]}>Emergency Health Card</Text>
                        <Text style={[styles.subtitle, { color: isDark ? colors.textSecondary : "#B91C1C" }]}>Quick access to your critical medical information</Text>
                    </View>

                    <View style={styles.arrowBtn}>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#EF4444" />
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrapper: { marginHorizontal: 20, marginTop: 8, marginBottom: 16 },
    container: { borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center" },
    iconCircle: {
        width: 50, height: 50, borderRadius: 16, backgroundColor: "rgba(239, 68, 68, 0.15)",
        justifyContent: "center", alignItems: "center", marginRight: 14,
    },
    info: { flex: 1, paddingRight: 10 },
    title: { fontSize: 16, fontWeight: "700", letterSpacing: -0.3 },
    subtitle: { marginTop: 4, fontSize: 12, lineHeight: 16, fontWeight: "500" },
    arrowBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(239, 68, 68, 0.1)",
        justifyContent: "center", alignItems: "center",
    },
});