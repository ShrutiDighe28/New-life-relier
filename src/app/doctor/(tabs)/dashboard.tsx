import React from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";

import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationsContext";
import { useTheme } from "@/utils/themeManager";
import { PageHeader, StatCard, SectionCard, StatusBadge } from "@/components/common";
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from "@/constants/DesignSystem";

const RECENT_PATIENTS = [
    { id: "1", name: "Aarav Sharma", age: "34, Male", condition: "Hypertension", lastVisit: "Yesterday", status: "active" },
    { id: "2", name: "Priya Patel", age: "28, Female", condition: "Follow-up Checkup", lastVisit: "2 days ago", status: "scheduled" },
    { id: "3", name: "Rajesh Verma", age: "52, Male", condition: "Diabetes Type-2", lastVisit: "1 week ago", status: "completed" },
];

export default function DoctorDashboardScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const { unreadCount } = useNotifications();

    const doctorName = user?.fullName || "Dr. Sarah Jenkins";
    const doctorSpec = (user as any)?.rawApiData?.specialization || "Cardiologist";

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            <PageHeader
                portalName="Doctor Portal"
                portalIcon="doctor"
                pageTitle="Overview"
                showNotificationButton
                unreadCount={unreadCount}
                onNotificationPress={() => router.push("/doctor/notifications")}
                rightAction={
                    <TouchableOpacity onPress={() => router.push("/doctor/(tabs)/profile")} activeOpacity={0.8}>
                        <Image
                            source={require("@/assets/images/dashboard/doctor.png")}
                            style={styles.headerAvatar}
                        />
                    </TouchableOpacity>
                }
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Doctor Banner */}
                <View style={styles.bannerRow}>
                    <View style={styles.bannerLeft}>
                        <Text style={[TYPOGRAPHY.h2, { color: colors.text }]}>
                            Good Morning, {doctorName.startsWith("Dr.") ? doctorName : `Dr. ${doctorName}`} 👋
                        </Text>
                        <Text style={[TYPOGRAPHY.body, { color: colors.primary, fontWeight: '600', marginTop: 2 }]}>
                            {doctorSpec} • OPD Clinic #4
                        </Text>
                    </View>
                </View>

                {/* Next Appointment Card (Clean Corporate Card with Emerald Accent) */}
                <View
                    style={[
                        styles.nextAppointmentCard,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.cardBorder,
                            borderLeftWidth: 5,
                            borderLeftColor: colors.primary,
                        },
                        SHADOWS.sm,
                    ]}
                >
                    <View style={styles.nextHeader}>
                        <View style={styles.nextBadge}>
                            <MaterialCommunityIcons name="clock-outline" size={14} color={colors.primary} />
                            <Text style={[styles.nextBadgeText, { color: colors.textSecondary }]}>Next Appointment • In 25 min</Text>
                        </View>
                        <StatusBadge status="urgent" label="New Patient" size="sm" />
                    </View>

                    <View style={styles.nextPatientRow}>
                        <View style={[styles.nextPatientAvatar, { backgroundColor: isDark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF" }]}>
                            <Text style={[styles.nextAvatarText, { color: colors.primary }]}>AS</Text>
                        </View>
                        <View style={styles.nextPatientDetails}>
                            <Text style={[styles.nextPatientName, { color: colors.text }]}>Aarav Sharma</Text>
                            <Text style={[styles.nextPatientSub, { color: colors.textSecondary }]}>10:30 AM • Video Consultation</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={[styles.startConsultBtn, { backgroundColor: colors.primary }]}
                        onPress={() => router.push("/doctor/(tabs)/consult")}
                    >
                        <MaterialCommunityIcons name="video-outline" size={20} color="#FFFFFF" />
                        <Text style={[styles.startConsultText, { color: "#FFFFFF" }]}>Start Consultation</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Row (4 StatCards) */}
                <View style={styles.statsGrid}>
                    <StatCard
                        title="Today Total"
                        value="12"
                        icon="calendar-check"
                        iconColor="#2563EB"
                        trend={{ value: "+8%", isPositive: true }}
                    />
                    <StatCard
                        title="Pending"
                        value="3"
                        icon="clock-alert-outline"
                        iconColor="#D97706"
                        iconBg={isDark ? "rgba(217, 119, 6, 0.15)" : "#FEF3C7"}
                    />
                </View>
                <View style={[styles.statsGrid, { marginTop: SPACING.sm }]}>
                    <StatCard
                        title="Completed"
                        value="8"
                        icon="check-circle-outline"
                        iconColor="#10B981"
                        iconBg={isDark ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5"}
                    />
                    <StatCard
                        title="Cancelled"
                        value="1"
                        icon="close-circle-outline"
                        iconColor="#EF4444"
                        iconBg={isDark ? "rgba(239, 68, 68, 0.15)" : "#FEE2E2"}
                    />
                </View>

                {/* Quick Actions */}
                <Text style={[TYPOGRAPHY.h3, { color: colors.text, marginTop: SPACING.lg, marginBottom: SPACING.xs }]}>
                    Quick Actions
                </Text>
                <View style={styles.quickActionsGrid}>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, SHADOWS.sm]}
                        onPress={() => router.push("/doctor/(tabs)/patients")}
                        activeOpacity={0.75}
                    >
                        <View style={[styles.actionIconBg, { backgroundColor: isDark ? "rgba(5, 150, 105, 0.15)" : "#ECFDF5" }]}>
                            <MaterialCommunityIcons name="account-group-outline" size={24} color={colors.primary} />
                        </View>
                        <Text style={[TYPOGRAPHY.bodyBold, { color: colors.text, marginTop: SPACING.sm }]}>My Patients</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, SHADOWS.sm]}
                        onPress={() => router.push("/doctor/(tabs)/schedule")}
                        activeOpacity={0.75}
                    >
                        <View style={[styles.actionIconBg, { backgroundColor: isDark ? "rgba(13, 148, 136, 0.15)" : "#CCFBF1" }]}>
                            <MaterialCommunityIcons name="calendar-month-outline" size={24} color="#0D9488" />
                        </View>
                        <Text style={[TYPOGRAPHY.bodyBold, { color: colors.text, marginTop: SPACING.sm }]}>Schedule</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, SHADOWS.sm]}
                        activeOpacity={0.75}
                    >
                        <View style={[styles.actionIconBg, { backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5" }]}>
                            <MaterialCommunityIcons name="file-document-outline" size={24} color="#10B981" />
                        </View>
                        <Text style={[TYPOGRAPHY.bodyBold, { color: colors.text, marginTop: SPACING.sm }]}>Prescriptions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, SHADOWS.sm]}
                        activeOpacity={0.75}
                    >
                        <View style={[styles.actionIconBg, { backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#FEF3C7" }]}>
                            <MaterialCommunityIcons name="chart-bar" size={24} color="#F59E0B" />
                        </View>
                        <Text style={[TYPOGRAPHY.bodyBold, { color: colors.text, marginTop: SPACING.sm }]}>Reports</Text>
                    </TouchableOpacity>
                </View>

                {/* Earnings Summary Card */}
                <SectionCard title="Weekly Overview" subtitle="Consultation earnings & trends" icon="finance">
                    <View style={styles.earningsHeader}>
                        <View>
                            <Text style={[TYPOGRAPHY.caption, { color: colors.textSecondary }]}>This Week Earnings</Text>
                            <Text style={[TYPOGRAPHY.h1, { color: colors.primary }]}>₹ 48,500</Text>
                        </View>
                        <View style={[styles.growthBadge, { backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5" }]}>
                            <Text style={[TYPOGRAPHY.badge, { color: colors.primary }]}>vs last week ↑ 12%</Text>
                        </View>
                    </View>

                    {/* Mini Visual Bar Chart */}
                    <View style={styles.chartRow}>
                        {[40, 65, 80, 55, 95, 70, 90].map((h, i) => (
                            <View key={i} style={styles.barCol}>
                                <View style={[styles.bar, { height: h, backgroundColor: i === 4 ? colors.primary : isDark ? "#243D2E" : "#D1FAE5" }]} />
                                <Text style={[TYPOGRAPHY.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                                </Text>
                            </View>
                        ))}
                    </View>
                </SectionCard>

                {/* Recent Patients */}
                <SectionCard
                    title="Recent Patients"
                    subtitle="Patient visits & records"
                    icon="account-group"
                    actionLabel="See All"
                    onActionPress={() => router.push("/doctor/(tabs)/patients")}
                >
                    <View style={styles.recentList}>
                        {RECENT_PATIENTS.map((p) => (
                            <TouchableOpacity
                                key={p.id}
                                style={[styles.patientCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                                onPress={() => router.push("/doctor/(tabs)/patients")}
                                activeOpacity={0.75}
                            >
                                <View style={[styles.patientAvatar, { backgroundColor: isDark ? "rgba(16, 185, 129, 0.2)" : "#ECFDF5" }]}>
                                    <Text style={[styles.patientAvatarText, { color: colors.primary }]}>
                                        {p.name.substring(0, 2).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.patientInfo}>
                                    <Text style={[TYPOGRAPHY.bodyBold, { color: colors.text }]}>{p.name}</Text>
                                    <Text style={[TYPOGRAPHY.caption, { color: colors.textSecondary }]}>
                                        {p.age} • {p.condition}
                                    </Text>
                                </View>
                                <StatusBadge status={p.status} size="sm" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </SectionCard>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: 40,
    },
    bannerRow: {
        marginBottom: SPACING.md,
    },
    bannerLeft: {
        flex: 1,
    },
    nextAppointmentCard: {
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    nextHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.md,
    },
    nextBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    nextBadgeText: {
        fontSize: 12,
        fontWeight: "600",
    },
    nextPatientRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: SPACING.lg,
    },
    nextPatientAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.md,
    },
    nextAvatarText: {
        fontSize: 16,
        fontWeight: "700",
    },
    nextPatientDetails: {
        flex: 1,
    },
    nextPatientName: {
        fontSize: 18,
        fontWeight: "700",
    },
    nextPatientSub: {
        fontSize: 13,
        marginTop: 2,
    },
    startConsultBtn: {
        borderRadius: RADIUS.lg,
        paddingVertical: SPACING.md,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: SPACING.xs,
    },
    startConsultText: {
        fontSize: 15,
        fontWeight: "700",
    },
    statsGrid: {
        flexDirection: "row",
        gap: SPACING.md,
    },
    quickActionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: SPACING.md,
        marginBottom: SPACING.md,
    },
    actionCard: {
        width: "47%",
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
    },
    actionIconBg: {
        width: 42,
        height: 42,
        borderRadius: RADIUS.md,
        justifyContent: "center",
        alignItems: "center",
    },
    earningsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.md,
    },
    growthBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.full,
    },
    chartRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        height: 100,
        paddingTop: SPACING.md,
    },
    barCol: {
        alignItems: "center",
        flex: 1,
    },
    bar: {
        width: 14,
        borderRadius: RADIUS.xs,
    },
    recentList: {
        gap: SPACING.sm,
    },
    patientCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
    },
    patientAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.md,
    },
    patientAvatarText: {
        fontSize: 14,
        fontWeight: "700",
    },
    patientInfo: {
        flex: 1,
    },
});
