import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useTheme } from "@/utils/themeManager";

const ACTIONS: Array<{ id: number; title: string; subtitle: string; icon: string; route: string }> = [
    { id: 1, title: "Book", subtitle: "Appointment", icon: "calendar-plus", route: "/(tabs)/appointments" },
    { id: 2, title: "Reports", subtitle: "Upload", icon: "cloud-upload-outline", route: "/(tabs)/reports" },
    { id: 3, title: "Medicines", subtitle: "Reminders", icon: "pill", route: "/profile/medicines" },
    { id: 4, title: "AI Chat", subtitle: "Assistant", icon: "brain", route: "/(tabs)/aihub" },
];

export default function QuickStats() {
    const router = useRouter();
    const fadeAnim = useMemo(() => new Animated.Value(0), []);
    const slideAnim = useMemo(() => new Animated.Value(15), []);
    const { colors, isDark } = useTheme();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 8, delay: 200, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {ACTIONS.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => router.push(item.route as any)}
                        activeOpacity={0.75}
                        style={[
                            styles.actionCard,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.cardBorder,
                            },
                        ]}
                    >
                        <View style={[styles.iconWrapper, { backgroundColor: isDark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF" }]}>
                            <MaterialCommunityIcons name={item.icon as any} size={26} color={colors.primary} />
                        </View>
                        <Text style={[styles.actionTitle, { color: colors.text }]}>{item.title}</Text>
                        <Text style={[styles.actionSub, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 12,
        letterSpacing: -0.3,
    },
    scrollContent: {
        gap: 12,
        paddingBottom: 4,
    },
    actionCard: {
        width: 105,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: "flex-start",
        gap: 10,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    iconWrapper: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: "700",
    },
    actionSub: {
        fontSize: 11,
        fontWeight: "500",
        marginTop: -6,
    },
});