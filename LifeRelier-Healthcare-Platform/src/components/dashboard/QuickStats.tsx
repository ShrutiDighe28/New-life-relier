import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useTheme } from "@/utils/themeManager";

const stats = [
    { id: 1, title: "Reports", value: "12", icon: "file-document-outline", color: "#3B82F6", bgColor: "#EFF6FF", route: "/(tabs)/reports" },
    { id: 2, title: "Appointments", value: "3", icon: "calendar-month-outline", color: "#10B981", bgColor: "#ECFDF5", route: "/(tabs)/appointments" },
    { id: 3, title: "Medications", value: "5", icon: "pill", color: "#8B5CF6", bgColor: "#F5F3FF", route: "/profile/medicines" },
    { id: 4, title: "Alerts", value: "2", icon: "bell-outline", color: "#F97316", bgColor: "#FFF7ED", route: "/settings/notifications" },
];

export default function QuickStats() {
    const router = useRouter();
    const fadeAnim = useMemo(() => new Animated.Value(0), []);
    const slideAnim = useMemo(() => new Animated.Value(20), []);
    const { colors, isDark } = useTheme();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 300, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 7, delay: 300, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {stats.map((item) => (
                <View key={item.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
                    <View style={styles.topRow}>
                        <View style={[styles.iconBox, { backgroundColor: isDark ? colors.backgroundSecondary : item.bgColor }]}>
                            <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
                        </View>
                        <Text style={[styles.value, { color: colors.text }]}>{item.value}</Text>
                    </View>
                    <Text style={[styles.title, { color: colors.textSecondary }]}>{item.title}</Text>

                    <TouchableOpacity
                        style={styles.viewAllBtn}
                        onPress={() => router.push(item.route as any)}
                    >
                        <Text style={styles.viewAllText}>View All</Text>
                        <MaterialCommunityIcons name="arrow-right" size={14} color="#2563EB" />
                    </TouchableOpacity>
                </View>
            ))}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 20, marginHorizontal: 20, flexDirection: "row", justifyContent: "space-between" },
    card: {
        width: "23%", backgroundColor: "#FFFFFF", borderRadius: 16,
        paddingVertical: 14, paddingHorizontal: 8, alignItems: "center",
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03, shadowRadius: 10, elevation: 2,
    },
    topRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", width: "100%", marginBottom: 8 },
    iconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center" },
    value: { fontSize: 18, fontWeight: "800", color: "#0F172A", marginLeft: 6 },
    title: { fontSize: 11, color: "#64748B", fontWeight: "600", marginBottom: 12, textAlign: "center" },
    viewAllBtn: { flexDirection: "row", alignItems: "center" },
    viewAllText: { fontSize: 10, color: "#2563EB", fontWeight: "700", marginRight: 2 },
});