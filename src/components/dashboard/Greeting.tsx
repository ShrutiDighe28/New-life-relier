import React, { useEffect, useMemo } from "react";
import { Text, StyleSheet, Animated, View } from "react-native";
import { useTheme } from "@/utils/themeManager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useAuth } from '@/context/AuthContext';

export default function Greeting() {
    const { user } = useAuth();
    const { colors } = useTheme();

    const getGreetingByTime = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return { text: "Good Morning", icon: "weather-sunny", color: "#F59E0B" };
        if (hour >= 12 && hour < 17) return { text: "Good Afternoon", icon: "weather-partly-cloudy", color: "#F97316" };
        return { text: "Good Evening", icon: "weather-night", color: colors.primary };
    };

    const timeData = getGreetingByTime();
    const userName = user?.firstName || user?.userName || user?.fullName?.split(' ')[0] || "User";
    const subtitle = "Here's your health summary for today.";

    const slideAnim = useMemo(() => new Animated.Value(15), []);
    const fadeAnim = useMemo(() => new Animated.Value(0), []);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* Time-of-day row */}
            <View style={styles.timeRow}>
                <MaterialCommunityIcons name={timeData.icon as any} size={16} color={timeData.color} />
                <Text style={[styles.timeText, { color: timeData.color }]}>{timeData.text}</Text>
            </View>

            {/* Main greeting */}
            <Text style={[styles.greeting, { color: colors.text }]}>
                Hi, <Text style={[styles.userName, { color: colors.primary }]}>{userName}</Text> 👋
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 4,
        marginBottom: 4,
    },
    timeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        marginBottom: 6,
    },
    timeText: {
        fontSize: 13,
        fontWeight: "600",
        letterSpacing: 0.3,
        textTransform: "uppercase",
    },
    greeting: {
        fontSize: 26,
        fontWeight: "800",
        lineHeight: 32,
        letterSpacing: -0.5,
    },
    userName: {
        fontWeight: "800",
    },
    subtitle: {
        marginTop: 5,
        fontSize: 14,
        fontWeight: "500",
    },
});