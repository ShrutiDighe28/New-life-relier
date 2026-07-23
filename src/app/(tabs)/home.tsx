import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/utils/themeManager";
import { useAuth } from "@/context/AuthContext";

import {
    Header,
    Greeting,
    AIAssistantCard,
    MedicineReminder,
    QuickStats,
    AppointmentCard,
    RecentReportCard,
    HealthInsights,
    EmergencyBanner,
} from "@/components/dashboard";

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
                <Header />

                <Greeting />

                <AIAssistantCard />

                <QuickStats />
                
                <MedicineReminder />

                <AppointmentCard />

                <RecentReportCard />

                <HealthInsights />

                <EmergencyBanner />
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
});