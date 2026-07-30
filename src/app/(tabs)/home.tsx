import { useTheme } from "@/utils/themeManager";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    AIAssistantCard,
    AppointmentCard,
    EmergencyBanner,
    Greeting,
    Header,
    HealthInsights,
    MedicineReminder,
    QuickStats,
    RecentReportCard,
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