import { useTheme } from "@/utils/themeManager";
import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "@/components/dashboard/Header";
import Greeting from "@/components/dashboard/Greeting";
import AIAssistantCard from "@/components/dashboard/AIAssistantCard";
import MedicineReminder from "@/components/dashboard/HealthScore";
import QuickStats from "@/components/dashboard/QuickStats";
import AppointmentCard from "@/components/dashboard/AppointmentCard";
import RecentReportCard from "@/components/dashboard/RecentReportCard";
import HealthInsights from "@/components/dashboard/HealthInsights";
import EmergencyBanner from "@/components/dashboard/EmergencyBanner";

const FadeInView = ({ children, delay }: { children: React.ReactNode; delay: number }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(16)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 500,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, translateY, delay]);

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
            {children}
        </Animated.View>
    );
};

export default function HomeScreen() {
    const { colors } = useTheme();

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
            edges={["top"]}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                style={{ backgroundColor: colors.background }}
            >
                <Header pageTitle="Dashboard" showProfileButton />

                <View style={styles.section}>
                    <FadeInView delay={50}><Greeting /></FadeInView>
                    <FadeInView delay={100}><AIAssistantCard /></FadeInView>
                    <FadeInView delay={150}><QuickStats /></FadeInView>
                    <FadeInView delay={200}><AppointmentCard /></FadeInView>
                    <FadeInView delay={250}><MedicineReminder /></FadeInView>
                    <FadeInView delay={300}><RecentReportCard /></FadeInView>
                    <FadeInView delay={350}><HealthInsights /></FadeInView>
                    <FadeInView delay={400}><EmergencyBanner /></FadeInView>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingBottom: 120,
    },
    section: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 16,
        gap: 20,
    },
});