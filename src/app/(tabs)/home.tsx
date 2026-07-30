import { useTheme } from "@/utils/themeManager";
import { ScrollView, StyleSheet } from "react-native";
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