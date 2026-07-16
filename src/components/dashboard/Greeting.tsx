import React, { useEffect, useMemo } from "react";
import { Text, StyleSheet, Animated } from "react-native";
import { useTheme } from "@/utils/themeManager";

type GreetingProps = {
    greeting?: string;
    userName?: string;
    subtitle?: string;
};

export default function Greeting({
    greeting = "Good Morning",
    userName = "Rahul",
    subtitle = "Here's your health summary for today.",
}: GreetingProps) {
    const slideAnim = useMemo(() => new Animated.Value(15), []);
    const fadeAnim = useMemo(() => new Animated.Value(0), []);
    const { colors } = useTheme();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={[styles.greeting, { color: colors.text }]}>
                {greeting}, <Text style={styles.userName}>{userName}</Text> 👋
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginTop: 24,
        marginBottom: 10,
    },
    greeting: {
        fontSize: 26,
        fontWeight: "800",
        color: "#0F172A",
    },
    userName: {
        color: "#2563EB",
    },
    subtitle: {
        marginTop: 6,
        fontSize: 15,
        color: "#64748B",
    },
});