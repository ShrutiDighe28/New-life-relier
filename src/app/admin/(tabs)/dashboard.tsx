import React, { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/utils/themeManager";
import { PageHeader, StatCard, SectionCard, StatusBadge } from "@/components/common";
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from "@/constants/DesignSystem";

const RECENT_DOCTORS = [
    { id: "1", name: "Dr. Sarah Jenkins", spec: "Cardiologist", initials: "SJ", patients: 340, status: "active" },
    { id: "2", name: "Dr. Arjun Mehta", spec: "Neurologist", initials: "AM", patients: 210, status: "active" },
    { id: "3", name: "Dr. Priya Kapoor", spec: "Dermatologist", initials: "PK", patients: 178, status: "pending" },
    { id: "4", name: "Dr. Rohit Sharma", spec: "Orthopedic", initials: "RS", patients: 295, status: "active" },
];

const INITIAL_ACTIVITY = [
    { id: "1", type: "system", icon: "account-plus-outline", title: "New Doctor Registered", sub: "Dr. Kavya Reddy — Pediatrician", time: "5 min ago" },
    { id: "2", type: "system", icon: "file-check-outline", title: "Report Approved", sub: "Monthly performance — July 2026", time: "22 min ago" },
    { id: "3", type: "security", icon: "account-remove-outline", title: "Patient Account Deleted", sub: "ID PT20987 — Request by patient", time: "1 hr ago" },
    { id: "4", type: "security", icon: "alert-circle-outline", title: "Emergency Alert Raised", sub: "Priya Patel — ICU admission", time: "2 hr ago" },
    { id: "5", type: "billing", icon: "cash-check", title: "Payment Received", sub: "Invoice #4821 — Rs. 24,500", time: "3 hr ago" },
];

const INITIAL_NOTIFICATIONS = [
    { id: "1", icon: "doctor", title: "Pending Verification", body: "Dr. Arjun Kumar awaiting credential verification", time: "Just now", unread: true },
    { id: "2", icon: "alert-octagon-outline", title: "System Alert", body: "Server memory load at 87% — monitoring active", time: "10 min ago", unread: true },
    { id: "3", icon: "file-chart-outline", title: "Monthly Report Ready", body: "July 2026 analytics report generated successfully", time: "1 hr ago", unread: true },
    { id: "4", icon: "cash-multiple", title: "Revenue Milestone", body: "Rs. 10L revenue target reached for July", time: "3 hr ago", unread: false },
    { id: "5", icon: "account-clock-outline", title: "Licence Expiry Warning", body: "Dr. Priya Kapoor — medical licence expires in 7 days", time: "Yesterday", unread: false },
];

const WEEKLY = [6, 9, 7, 12, 10, 8, 14];
const REVENUE = [4.2, 5.1, 3.8, 6.4, 5.9, 4.7, 7.2];

function SparkBar({ data, color, h = 56 }: { data: number[]; color: string; h?: number }) {
    const max = Math.max(...data);
    return (
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4, height: h }}>
            {data.map((v, i) => (
                <View
                    key={i}
                    style={{
                        flex: 1,
                        height: Math.max(4, (v / max) * h),
                        backgroundColor: i === data.length - 1 ? color : color + "50",
                        borderRadius: 3,
                    }}
                />
            ))}
        </View>
    );
}

export default function AdminDashboardScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { colors, isDark } = useTheme();

    const [showNotif, setShowNotif] = useState(false);
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const [activityFilter, setActivityFilter] = useState<"all" | "security" | "billing" | "system">("all");

    const unread = notifications.filter((n) => n.unread).length;
    const adminName = user?.fullName || "Admin User";
    const C = { backgroundColor: colors.card, borderColor: colors.cardBorder };

    const filteredActivity = React.useMemo(() => {
        if (activityFilter === "all") return INITIAL_ACTIVITY;
        return INITIAL_ACTIVITY.filter((a) => a.type === activityFilter);
    }, [activityFilter]);

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    };

    return (
        <SafeAreaView style={[s.root, { backgroundColor: colors.background }]} edges={["top"]}>
            <PageHeader
                portalName="Admin Portal"
                portalIcon="shield-crown"
                pageTitle="Dashboard"
                showNotificationButton
                unreadCount={unread}
                onNotificationPress={() => setShowNotif(true)}
                rightAction={
                    <TouchableOpacity onPress={() => router.push("/admin/(tabs)/settings" as any)} activeOpacity={0.8}>
                        <View style={[s.avt, { backgroundColor: colors.badgeBg }]}>
                            <Text style={[s.avtTxt, { color: colors.badgeText }]}>
                                {adminName.slice(0, 2).toUpperCase()}
                            </Text>
                        </View>
                    </TouchableOpacity>
                }
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
                {/* HERO BANNER (Clean Corporate Card) */}
                <View
                    style={[
                        s.hero,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.cardBorder,
                            borderLeftWidth: 5,
                            borderLeftColor: colors.primary,
                        },
                        SHADOWS.sm,
                    ]}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={[TYPOGRAPHY.h2, { color: colors.text }]}>Hospital Operations Overview</Text>
                        <Text style={[TYPOGRAPHY.caption, { color: colors.textSecondary, marginTop: 2 }]}>Welcome back, {adminName} • Live System Status</Text>
                        <View style={{ flexDirection: "row", gap: 24, marginTop: 16 }}>
                            {[{ v: "99.8%", l: "Uptime" }, { v: "4.8s", l: "Avg Load" }, { v: "12.4k", l: "API Calls/hr" }].map((x, i) => (
                                <View key={i}>
                                    <Text style={{ color: colors.primary, fontSize: 18, fontWeight: "800" }}>{x.v}</Text>
                                    <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 1 }}>{x.l}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <MaterialCommunityIcons name="shield-check-outline" size={48} color={colors.primary} />
                </View>

                {/* KPI STAT CARDS */}
                <Text style={[TYPOGRAPHY.h3, { color: colors.text, marginBottom: SPACING.sm }]}>Key Performance Indicators</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: SPACING.md, paddingBottom: 4 }}
                    style={{ marginBottom: SPACING.lg }}
                >
                    <StatCard title="Total Doctors" value="48" icon="doctor" iconColor={colors.primary} trend={{ value: "+3 this mo", isPositive: true }} />
                    <StatCard title="Total Patients" value="2,840" icon="account-group-outline" iconColor="#0D9488" trend={{ value: "+124 wk", isPositive: true }} />
                    <StatCard title="Appointments" value="186" icon="calendar-month-outline" iconColor="#10B981" subtitle="Today" />
                    <StatCard title="Revenue Today" value="₹ 52,000" icon="cash-multiple" iconColor="#F59E0B" trend={{ value: "+18%", isPositive: true }} />
                </ScrollView>

                {/* SYSTEM HEALTH METRICS CARD */}
                <SectionCard title="System Performance Monitor" subtitle="Live server status & diagnostics" icon="pulse">
                    <View style={s.sysGrid}>
                        <View style={s.sysItem}>
                            <Text style={[s.sysVal, { color: colors.primary }]}>42%</Text>
                            <Text style={[s.sysLbl, { color: colors.textSecondary }]}>Server Load</Text>
                        </View>
                        <View style={[s.sysVDivider, { backgroundColor: colors.divider }]} />
                        <View style={s.sysItem}>
                            <Text style={[s.sysVal, { color: colors.text }]}>128</Text>
                            <Text style={[s.sysLbl, { color: colors.textSecondary }]}>Active Sessions</Text>
                        </View>
                        <View style={[s.sysVDivider, { backgroundColor: colors.divider }]} />
                        <View style={s.sysItem}>
                            <Text style={[s.sysVal, { color: colors.text }]}>12ms</Text>
                            <Text style={[s.sysLbl, { color: colors.textSecondary }]}>DB Latency</Text>
                        </View>
                        <View style={[s.sysVDivider, { backgroundColor: colors.divider }]} />
                        <View style={s.sysItem}>
                            <Text style={[s.sysVal, { color: colors.primary }]}>99.9%</Text>
                            <Text style={[s.sysLbl, { color: colors.textSecondary }]}>Monthly Uptime</Text>
                        </View>
                    </View>
                </SectionCard>

                {/* CHARTS */}
                {[
                    { title: "Weekly Appointments", data: WEEKLY, color: colors.primary, value: "186 today", sub: "+12% vs last week" },
                    { title: "Revenue Trend (Lakhs)", data: REVENUE, color: "#0D9488", value: "₹ 7.2L", sub: "Peak performance day" },
                ].map((chart, ci) => (
                    <SectionCard key={ci} title={chart.title} subtitle={chart.sub} icon="chart-timeline-variant">
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <Text style={[TYPOGRAPHY.h1, { color: colors.text }]}>{chart.value}</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5", paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full }}>
                                <MaterialCommunityIcons name="trending-up" size={14} color={colors.primary} />
                                <Text style={[TYPOGRAPHY.captionBold, { color: colors.primary }]}>Up</Text>
                            </View>
                        </View>
                        <SparkBar data={chart.data} color={chart.color} h={58} />
                        <View style={{ flexDirection: "row", marginTop: 8 }}>
                            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                                <Text key={i} style={{ flex: 1, textAlign: "center", fontSize: 11, color: colors.textSecondary, fontWeight: "600" }}>{d}</Text>
                            ))}
                        </View>
                    </SectionCard>
                ))}

                {/* QUICK ACTIONS GRID */}
                <Text style={[TYPOGRAPHY.h3, { color: colors.text, marginTop: SPACING.md, marginBottom: SPACING.xs }]}>Quick Management</Text>
                <View style={s.actionsGrid}>
                    {[
                        { label: "Manage Doctors", icon: "doctor", route: "/admin/(tabs)/doctors" },
                        { label: "Manage Patients", icon: "account-group-outline", route: "/admin/(tabs)/patients" },
                        { label: "View Reports", icon: "chart-bar", route: "/admin/(tabs)/reports" },
                        { label: "Portal Settings", icon: "cog-outline", route: "/admin/(tabs)/settings" },
                    ].map((item, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[s.actionItem, C, SHADOWS.sm]}
                            onPress={() => router.push(item.route as any)}
                            activeOpacity={0.75}
                        >
                            <View style={[s.actionIco, { backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : "#ECFDF5" }]}>
                                <MaterialCommunityIcons name={item.icon as any} size={20} color={colors.primary} />
                            </View>
                            <Text style={[TYPOGRAPHY.bodyBold, { color: colors.text, flex: 1 }]} numberOfLines={1}>{item.label}</Text>
                            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* RECENT DOCTORS */}
                <SectionCard
                    title="Recent Doctors"
                    subtitle="Newly onboarded medical staff"
                    icon="doctor"
                    actionLabel="See All"
                    onActionPress={() => router.push("/admin/(tabs)/doctors" as any)}
                >
                    {RECENT_DOCTORS.map((doc, i) => (
                        <View key={doc.id} style={[s.docRow, { borderBottomWidth: i < RECENT_DOCTORS.length - 1 ? 1 : 0, borderColor: colors.divider }]}>
                            <View style={[s.init, { backgroundColor: isDark ? "rgba(16, 185, 129, 0.2)" : "#ECFDF5" }]}>
                                <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "800" }}>{doc.initials}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[TYPOGRAPHY.bodyBold, { color: colors.text }]}>{doc.name}</Text>
                                <Text style={[TYPOGRAPHY.caption, { color: colors.textSecondary, marginTop: 1 }]}>{doc.spec} • {doc.patients} patients</Text>
                            </View>
                            <StatusBadge status={doc.status} size="sm" />
                        </View>
                    ))}
                </SectionCard>

                {/* ACTIVITY FEED WITH FILTERS */}
                <SectionCard title="Recent Activity" subtitle="Real-time system audit logs" icon="history">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingBottom: 10 }}>
                        {(["all", "security", "system", "billing"] as const).map((tag) => (
                            <TouchableOpacity
                                key={tag}
                                onPress={() => setActivityFilter(tag)}
                                style={[
                                    s.actFilterChip,
                                    activityFilter === tag
                                        ? { backgroundColor: colors.primary }
                                        : { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9" },
                                ]}
                            >
                                <Text style={{ fontSize: 11, fontWeight: "700", color: activityFilter === tag ? "#FFFFFF" : colors.textSecondary, textTransform: "capitalize" }}>
                                    {tag}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {filteredActivity.map((item, i) => (
                        <View key={item.id} style={[s.actRow, { borderBottomWidth: i < filteredActivity.length - 1 ? 1 : 0, borderColor: colors.divider }]}>
                            <View style={[s.actIco, { backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : "#ECFDF5" }]}>
                                <MaterialCommunityIcons name={item.icon as any} size={16} color={colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[TYPOGRAPHY.bodyBold, { color: colors.text }]}>{item.title}</Text>
                                <Text style={[TYPOGRAPHY.caption, { color: colors.textSecondary, marginTop: 1 }]}>{item.sub}</Text>
                            </View>
                            <Text style={[TYPOGRAPHY.caption, { color: colors.textMuted }]}>{item.time}</Text>
                        </View>
                    ))}
                </SectionCard>
            </ScrollView>

            {/* NOTIFICATIONS MODAL */}
            <Modal visible={showNotif} transparent animationType="slide" onRequestClose={() => setShowNotif(false)}>
                <Pressable style={s.overlay} onPress={() => setShowNotif(false)}>
                    <Pressable style={[s.sheet, { backgroundColor: colors.card }]}>
                        <View style={[s.handle, { backgroundColor: colors.border }]} />
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <Text style={[TYPOGRAPHY.h2, { color: colors.text }]}>Notifications</Text>
                            {unread > 0 && (
                                <TouchableOpacity onPress={markAllRead}>
                                    <Text style={[TYPOGRAPHY.captionBold, { color: colors.primary }]}>Mark all read</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {notifications.map((n) => (
                                <View key={n.id} style={[s.notifRow, { borderBottomColor: colors.divider }]}>
                                    <MaterialCommunityIcons name={n.icon as any} size={20} color={colors.primary} style={{ marginRight: 12 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[TYPOGRAPHY.bodyBold, { color: colors.text }]}>{n.title}</Text>
                                        <Text style={[TYPOGRAPHY.caption, { color: colors.textSecondary, marginTop: 2 }]}>{n.body}</Text>
                                        <Text style={[TYPOGRAPHY.caption, { color: colors.textMuted, marginTop: 4 }]}>{n.time}</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1 },
    scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: 40 },
    avt: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
    avtTxt: { fontSize: 13, fontWeight: "700" },
    hero: { borderRadius: RADIUS.xl, padding: SPACING.lg, flexDirection: "row", alignItems: "center", marginBottom: SPACING.lg },
    sysGrid: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: SPACING.sm },
    sysItem: { alignItems: "center" },
    sysVal: { fontSize: 18, fontWeight: "800" },
    sysLbl: { fontSize: 11, marginTop: 2 },
    sysVDivider: { width: 1, height: 28 },
    actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.md, marginBottom: SPACING.lg },
    actionItem: { width: "47%", flexDirection: "row", alignItems: "center", padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, gap: SPACING.sm },
    actionIco: { width: 36, height: 36, borderRadius: RADIUS.md, justifyContent: "center", alignItems: "center" },
    docRow: { flexDirection: "row", alignItems: "center", paddingVertical: SPACING.md, gap: SPACING.md },
    init: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
    actFilterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full },
    actRow: { flexDirection: "row", alignItems: "center", paddingVertical: SPACING.md, gap: SPACING.md },
    actIco: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    sheet: { borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.lg, maxHeight: "70%" },
    handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: SPACING.md },
    notifRow: { flexDirection: "row", paddingVertical: SPACING.md, borderBottomWidth: 1 },
});
