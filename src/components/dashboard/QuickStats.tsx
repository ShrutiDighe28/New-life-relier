import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useTheme } from "@/utils/themeManager";

export default function QuickStats() {
    const router = useRouter();
    const fadeAnim = useMemo(() => new Animated.Value(0), []);
    const slideAnim = useMemo(() => new Animated.Value(15), []);
    const { colors, isDark } = useTheme();

    const actions = [
        { id: 1, title: "Book", icon: "calendar-plus", color: "#2563EB", bgColor: isDark ? "rgba(37, 99, 235, 0.15)" : "#EFF6FF", route: "/(tabs)/appointments" },
        { id: 2, title: "Upload", icon: "cloud-upload", color: "#10B981", bgColor: isDark ? "rgba(16, 185, 129, 0.15)" : "#ECFDF5", route: "/(tabs)/reports" },
        { id: 3, title: "Medicines", icon: "pill", color: "#8B5CF6", bgColor: isDark ? "rgba(139, 92, 246, 0.15)" : "#F5F3FF", route: "/profile/medicines" },
        { id: 4, title: "AI Chat", icon: "brain", color: "#F59E0B", bgColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#FFF7ED", route: "/(tabs)/aihub" },
    ];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 8, delay: 200, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {actions.map((item) => (
                <TouchableOpacity
                    key={item.id}
                    style={styles.actionItem}
                    onPress={() => router.push(item.route as any)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.iconWrapper, { backgroundColor: item.bgColor }]}>
                        <MaterialCommunityIcons name={item.icon as any} size={26} color={item.color} />
                    </View>
                    <Text style={[styles.actionTitle, { color: colors.text }]}>{item.title}</Text>
                </TouchableOpacity>
            ))}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        marginHorizontal: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    actionItem: {
        alignItems: "center",
        width: 72,
    },
    iconWrapper: {
        width: 60,
        height: 60,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    actionTitle: {
        fontSize: 12,
        fontWeight: "600",
        textAlign: "center",
    },
});