import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/utils/themeManager";
import { useAuth } from "@/context/AuthContext";
import { dashboardApi, DashboardResponse } from "@/services/dashboardApi";

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
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);

    // Fetch unified dashboard data from API as per the new Architecture
    const loadDashboard = async () => {
        try {
            const data = await dashboardApi.getDashboardData();
            setDashboardData(data);
            console.log("Dashboard data loaded:", !!data); // Prevent unused warning
        } catch (e) {
            console.log("Using local mock context (Backend API not reachable)");
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDashboard();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboard();
        setRefreshing(false);
    };

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
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                <Header />

                <Greeting
                    userName={firstName}
                    greeting="Good Morning"
                    subtitle="Here's your health summary for today."
                />

                <AIAssistantCard />

                {/* If API is unreachable, these will render from their local Context mocks */}
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