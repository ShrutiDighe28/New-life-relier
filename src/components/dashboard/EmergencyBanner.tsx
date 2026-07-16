import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/utils/themeManager";

export default function EmergencyBanner() {
    const slideAnim = useMemo(() => new Animated.Value(20), []);
    const fadeAnim = useMemo(() => new Animated.Value(0), []);
    const { colors, isDark } = useTheme();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 700, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 7, delay: 700, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    return (
        <Animated.View style={[styles.wrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => console.log("Navigate to Emergency Card")}
            >
                <LinearGradient colors={isDark ? [colors.card, colors.card] : ["#EFF6FF", "#E0F2FE"]} style={[styles.container, isDark && { borderColor: colors.cardBorder, borderWidth: 1 }]}>
                    <View style={[styles.iconCircle, { backgroundColor: isDark ? colors.background : "#FFFFFF" }]}>
                        <MaterialCommunityIcons name="medical-bag" size={26} color="#3B82F6" />
                    </View>

                    <View style={styles.info}>
                        <Text style={[styles.title, { color: isDark ? colors.text : "#1E3A8A" }]}>Emergency Health Card</Text>
                        <Text style={[styles.subtitle, { color: isDark ? colors.textSecondary : "#475569" }]}>Quick access to your critical medical information</Text>
                    </View>

                    <View style={[styles.arrowBtn, { backgroundColor: isDark ? colors.background : "#FFFFFF" }]}>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#3B82F6" />
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrapper: { marginHorizontal: 20, marginTop: 8, marginBottom: 100 },
    container: { borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center" },
    iconCircle: {
        width: 50, height: 50, borderRadius: 16, backgroundColor: "#FFFFFF",
        justifyContent: "center", alignItems: "center", marginRight: 14,
        shadowColor: "#3B82F6", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 8, elevation: 2,
    },
    info: { flex: 1, paddingRight: 10 },
    title: { color: "#1E3A8A", fontSize: 16, fontWeight: "700" },
    subtitle: { marginTop: 4, color: "#475569", fontSize: 12, lineHeight: 16 },
    arrowBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF",
        justifyContent: "center", alignItems: "center", shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    },
});