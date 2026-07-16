import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/utils/themeManager";
import { useAuth } from "@/context/AuthContext";

import {
    Header,
    Greeting,
    AIAssistantCard,
    HealthScore,
    QuickStats,
    AppointmentCard,
    RecentReportCard,
    HealthInsights,
    EmergencyBanner,
} from "@/components/dashboard";

export default function HomeScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();

    // Extract first name from full name or default to User
    const firstName = user?.fullName ? user.fullName.split(" ")[0] : "User";

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

                <Greeting
                    userName={firstName}
                    greeting="Good Morning"
                    subtitle="Here's your health summary for today."
                />

                <AIAssistantCard />

                <HealthScore />

                <QuickStats />

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
        backgroundColor: "#FFFFFF",
    },

    content: {
        paddingBottom: 120,
    },
});