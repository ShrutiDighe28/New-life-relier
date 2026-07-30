import LogoBrand from "@/components/LogoBrand";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/utils/themeManager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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

const BLUE = "#2563EB";

const RECENT_DOCTORS = [
    { id: "1", name: "Dr. Sarah Jenkins", spec: "Cardiologist", initials: "SJ", patients: 340, status: "Active" },
    { id: "2", name: "Dr. Arjun Mehta", spec: "Neurologist", initials: "AM", patients: 210, status: "Active" },
    { id: "3", name: "Dr. Priya Kapoor", spec: "Dermatologist", initials: "PK", patients: 178, status: "On Leave" },
    { id: "4", name: "Dr. Rohit Sharma", spec: "Orthopedic", initials: "RS", patients: 295, status: "Active" },
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
    const { colors, isDark, toggleTheme } = useTheme();

    const [showNotif, setShowNotif] = useState(false);
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const [activityFilter, setActivityFilter] = useState<"all" | "security" | "billing" | "system">("all");

    const unread = notifications.filter((n) => n.unread).length;
    const adminName = user?.fullName || "Admin User";
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
    const C = { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isDark ? colors.cardBorder : "#E8EFF5" };

    const filteredActivity = React.useMemo(() => {
        if (activityFilter === "all") return INITIAL_ACTIVITY;
        return INITIAL_ACTIVITY.filter((a) => a.type === activityFilter);
    }, [activityFilter]);

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    };

    return (
        <SafeAreaView style={[s.root, { backgroundColor: colors.background }]} edges={["top"]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

                {/* HEADER */}
                <View style={s.header}>
                    <View style={{ flex: 1 }}>
                        <LogoBrand size={24} fontSize={16} style={{ marginBottom: 5 }} />
                        <Text style={[s.greeting, { color: colors.text }]}>{greeting}, {adminName} 👋</Text>
                        <Text style={[s.role, { color: colors.textSecondary }]}>Hospital Administration Portal</Text>
                    </View>

                    <View style={s.hBtns}>
                        <TouchableOpacity
                            style={[s.hBtn, { backgroundColor: isDark ? colors.card : "#F1F5F9" }]}
                            onPress={toggleTheme}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name={isDark ? "weather-sunny" : "weather-night"}
                                size={19}
                                color={isDark ? "#F59E0B" : "#64748B"}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[s.hBtn, { backgroundColor: isDark ? colors.card : "#F1F5F9" }]}
                            onPress={() => setShowNotif(true)}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons name="bell-outline" size={19} color={colors.textSecondary} />
                            {unread > 0 && (
                                <View style={s.badge}>
                                    <Text style={s.badgeTxt}>{unread}</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.push("/admin/(tabs)/settings" as any)} activeOpacity={0.85}>
                            <View style={s.avt}>
                                <Text style={s.avtTxt}>{adminName.slice(0, 2).toUpperCase()}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* KPI CHIPS SCROLL */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 10, paddingBottom: 2 }}
                    style={{ marginBottom: 20 }}
                >
                    {[
                        { label: "Total Doctors", value: "48", icon: "doctor", sub: "+3 this month" },
                        { label: "Total Patients", value: "2,840", icon: "account-group-outline", sub: "+124 this week" },
                        { label: "Appointments", value: "186", icon: "calendar-month-outline", sub: "Today" },
                        { label: "Revenue Today", value: "Rs. 52k", icon: "cash-multiple", sub: "+18% vs yesterday" },
                        { label: "Pending Approvals", value: "7", icon: "clock-alert-outline", sub: "Action required" },
                        { label: "Platform Rating", value: "4.8", icon: "star-outline", sub: "All doctors avg" },
                    ].map((item, i) => (
                        <View key={i} style={[s.kpiCard, C]}>
                            <View style={[s.kpiIco, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                                <MaterialCommunityIcons name={item.icon as any} size={20} color={BLUE} />
                            </View>
                            <Text style={[s.kpiVal, { color: colors.text }]}>{item.value}</Text>
                            <Text style={[s.kpiLbl, { color: colors.textSecondary }]}>{item.label}</Text>
                            <Text style={[s.kpiSub, { color: BLUE }]}>{item.sub}</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* SYSTEM HEALTH METRICS CARD */}
                <View style={[s.systemMetricsCard, C]}>
                    <View style={s.sysHeader}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <View style={s.livePulseDot} />
                            <Text style={[s.sysTitle, { color: colors.text }]}>System Performance Monitor</Text>
                        </View>
                        <Text style={[s.sysStatusBadge, { color: "#10B981" }]}>● Operational</Text>
                    </View>

                    <View style={s.sysGrid}>
                        <View style={s.sysItem}>
                            <Text style={[s.sysVal, { color: colors.text }]}>42%</Text>
                            <Text style={[s.sysLbl, { color: colors.textSecondary }]}>Server Load</Text>
                        </View>

                        <View style={s.sysVDivider} />

                        <View style={s.sysItem}>
                            <Text style={[s.sysVal, { color: colors.text }]}>128</Text>
                            <Text style={[s.sysLbl, { color: colors.textSecondary }]}>Active Sessions</Text>
                        </View>

                        <View style={s.sysVDivider} />

                        <View style={s.sysItem}>
                            <Text style={[s.sysVal, { color: colors.text }]}>12ms</Text>
                            <Text style={[s.sysLbl, { color: colors.textSecondary }]}>DB Latency</Text>
                        </View>

                        <View style={s.sysVDivider} />

                        <View style={s.sysItem}>
                            <Text style={[s.sysVal, { color: colors.text }]}>99.9%</Text>
                            <Text style={[s.sysLbl, { color: colors.textSecondary }]}>Monthly Uptime</Text>
                        </View>
                    </View>
                </View>

                {/* HERO BANNER */}
                <LinearGradient colors={["#1E3A8A", "#2563EB"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "800" }}>Hospital Overview</Text>
                        <Text style={{ color: "#BFDBFE", fontSize: 12, marginTop: 2 }}>July 2026  •  Live analytics</Text>
                        <View style={{ flexDirection: "row", gap: 24, marginTop: 14 }}>
                            {[{ v: "99.8%", l: "Uptime" }, { v: "4.8s", l: "Avg Load" }, { v: "12.4k", l: "API Calls/hr" }].map((x, i) => (
                                <View key={i}>
                                    <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "800" }}>{x.v}</Text>
                                    <Text style={{ color: "#BFDBFE", fontSize: 11, marginTop: 1 }}>{x.l}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <MaterialCommunityIcons name="shield-check-outline" size={50} color="rgba(255,255,255,0.2)" />
                </LinearGradient>

                {/* CHARTS */}
                {[
                    { title: "Weekly Appointments", data: WEEKLY, color: BLUE, value: "186 today", sub: "+12% vs last week" },
                    { title: "Revenue Trend (Lakhs)", data: REVENUE, color: "#10B981", value: "Rs. 7.2L", sub: "Peak performance day" },
                ].map((chart, ci) => (
                    <View key={ci} style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text, marginBottom: 10 }}>{chart.title}</Text>
                        <View style={[s.card, C]}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <View>
                                    <Text style={{ fontSize: 21, fontWeight: "800", color: colors.text }}>{chart.value}</Text>
                                    <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 1 }}>{chart.sub}</Text>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#ECFDF5", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 }}>
                                    <MaterialCommunityIcons name="trending-up" size={13} color="#10B981" />
                                    <Text style={{ color: "#10B981", fontSize: 11, fontWeight: "700" }}>Up</Text>
                                </View>
                            </View>
                            <SparkBar data={chart.data} color={chart.color} h={58} />
                            <View style={{ flexDirection: "row", marginTop: 6 }}>
                                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                                    <Text key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: colors.textSecondary, fontWeight: "600" }}>{d}</Text>
                                ))}
                            </View>
                        </View>
                    </View>
                ))}

                {/* QUICK ACTIONS GRID */}
                <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text, marginBottom: 12 }}>Quick Actions</Text>
                <View style={s.actionsGrid}>
                    {[
                        { label: "Manage Doctors", icon: "doctor", route: "/admin/(tabs)/doctors" },
                        { label: "Manage Patients", icon: "account-group-outline", route: "/admin/(tabs)/patients" },
                        { label: "View Reports", icon: "chart-bar", route: "/admin/(tabs)/reports" },
                        { label: "Portal Settings", icon: "cog-outline", route: "/admin/(tabs)/settings" },
                    ].map((item, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[s.actionItem, C]}
                            onPress={() => router.push(item.route as any)}
                            activeOpacity={0.85}
                        >
                            <View style={[s.actionIco, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                                <MaterialCommunityIcons name={item.icon as any} size={20} color={BLUE} />
                            </View>
                            <Text style={[s.actionLbl, { color: colors.text }]} numberOfLines={1}>{item.label}</Text>
                            <MaterialCommunityIcons name="chevron-right" size={16} color="#94A3B8" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* RECENT DOCTORS */}
                <View style={{ marginBottom: 22 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>Recent Doctors</Text>
                        <TouchableOpacity onPress={() => router.push("/admin/(tabs)/doctors" as any)}>
                            <Text style={{ color: BLUE, fontSize: 13, fontWeight: "700" }}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    {RECENT_DOCTORS.map((doc, i) => (
                        <View key={doc.id} style={[s.docRow, C, { marginBottom: i < RECENT_DOCTORS.length - 1 ? 8 : 0 }]}>
                            <View style={[s.init, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                                <Text style={{ color: BLUE, fontSize: 14, fontWeight: "800" }}>{doc.initials}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>{doc.name}</Text>
                                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>{doc.spec}  •  {doc.patients} patients</Text>
                            </View>
                            <View style={[s.pill, { backgroundColor: doc.status === "Active" ? "#ECFDF5" : "#FFFBEB" }]}>
                                <Text style={{ color: doc.status === "Active" ? "#10B981" : "#D97706", fontSize: 10, fontWeight: "700" }}>{doc.status}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* ACTIVITY FEED WITH FILTERS */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>Recent Activity</Text>
                </View>

                {/* Activity filter chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingBottom: 10 }}>
                    {(["all", "security", "system", "billing"] as const).map((tag) => (
                        <TouchableOpacity
                            key={tag}
                            onPress={() => setActivityFilter(tag)}
                            style={[
                                s.actFilterChip,
                                activityFilter === tag ? { backgroundColor: BLUE } : { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
                            ]}
                        >
                            <Text style={{ fontSize: 11, fontWeight: "700", color: activityFilter === tag ? "#FFFFFF" : colors.textSecondary, textTransform: "capitalize" }}>
                                {tag}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={[s.card, C, { marginBottom: 32 }]}>
                    {filteredActivity.map((item, i) => (
                        <View key={item.id} style={[s.actRow, { borderBottomWidth: i < filteredActivity.length - 1 ? 1 : 0, borderColor: isDark ? "#334155" : "#F1F5F9" }]}>
                            <View style={[s.actIco, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                                <MaterialCommunityIcons name={item.icon as any} size={15} color={BLUE} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>{item.title}</Text>
                                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 1 }}>{item.sub}</Text>
                            </View>
                            <Text style={{ fontSize: 10, color: colors.textSecondary }}>{item.time}</Text>
                        </View>
                    ))}
                </View>

            </ScrollView>

            {/* NOTIFICATIONS MODAL */}
            <Modal visible={showNotif} transparent animationType="slide" onRequestClose={() => setShowNotif(false)}>
                <Pressable style={s.overlay} onPress={() => setShowNotif(false)}>
                    <Pressable style={[s.sheet, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
                        <View style={[s.handle, { backgroundColor: isDark ? "#334155" : "#CBD5E1" }]} />
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <Text style={[s.sheetTitle, { color: colors.text }]}>Notifications</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                {unread > 0 && (
                                    <TouchableOpacity onPress={markAllRead}>
                                        <Text style={{ color: BLUE, fontSize: 12, fontWeight: "700" }}>Mark all read</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {notifications.map((n) => (
                                <View key={n.id} style={[s.nRow, { backgroundColor: n.unread ? (isDark ? "#2563EB12" : "#EFF6FF") : "transparent", borderColor: isDark ? "#334155" : "#F1F5F9" }]}>
                                    <View style={[s.nIco, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                                        <MaterialCommunityIcons name={n.icon as any} size={17} color={BLUE} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>{n.title}</Text>
                                        <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>{n.body}</Text>
                                        <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 2 }}>{n.time}</Text>
                                    </View>
                                    {n.unread && <View style={[s.dot, { backgroundColor: BLUE }]} />}
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
    scroll: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 },
    greeting: { fontSize: 17, fontWeight: "800", letterSpacing: -0.3, marginTop: 2 },
    role: { fontSize: 12, fontWeight: "500", marginTop: 2 },
    hBtns: { flexDirection: "row", alignItems: "center", gap: 8 },
    hBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
    badge: { position: "absolute", top: 4, right: 4, backgroundColor: "#EF4444", minWidth: 15, height: 15, borderRadius: 8, justifyContent: "center", alignItems: "center", paddingHorizontal: 2 },
    badgeTxt: { color: "#FFFFFF", fontSize: 8, fontWeight: "800" },
    avt: { width: 38, height: 38, borderRadius: 19, backgroundColor: BLUE, justifyContent: "center", alignItems: "center" },
    avtTxt: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },

    // KPI Cards
    kpiCard: { borderRadius: 18, borderWidth: 1, padding: 14, minWidth: 135, gap: 3 },
    kpiIco: { width: 36, height: 36, borderRadius: 11, justifyContent: "center", alignItems: "center", marginBottom: 2 },
    kpiVal: { fontSize: 20, fontWeight: "800" },
    kpiLbl: { fontSize: 11, fontWeight: "600" },
    kpiSub: { fontSize: 10, fontWeight: "600" },

    // System Metrics
    systemMetricsCard: { borderRadius: 18, borderWidth: 1, padding: 14, marginBottom: 18 },
    sysHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    livePulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#10B981" },
    sysTitle: { fontSize: 13, fontWeight: "800" },
    sysStatusBadge: { fontSize: 11, fontWeight: "700" },
    sysGrid: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
    sysItem: { alignItems: "center", flex: 1 },
    sysVal: { fontSize: 16, fontWeight: "800" },
    sysLbl: { fontSize: 10, fontWeight: "600", marginTop: 2 },
    sysVDivider: { width: 1, height: 22, backgroundColor: "rgba(148,163,184,0.2)" },

    hero: { borderRadius: 22, padding: 18, marginBottom: 20, flexDirection: "row", alignItems: "center" },
    card: { borderRadius: 18, borderWidth: 1, padding: 16 },

    // Actions Grid
    actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
    actionItem: { width: "48%", borderRadius: 16, borderWidth: 1, padding: 12, flexDirection: "row", alignItems: "center", gap: 8 },
    actionIco: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    actionLbl: { fontSize: 12, fontWeight: "700", flex: 1 },

    docRow: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, padding: 12 },
    init: { width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center" },
    pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },

    actFilterChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
    actRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
    actIco: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },

    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 22, paddingTop: 10, maxHeight: "80%" },
    handle: { width: 44, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
    sheetTitle: { fontSize: 19, fontWeight: "800" },
    nRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 12, borderWidth: 1, marginBottom: 6 },
    nIco: { width: 38, height: 38, borderRadius: 11, justifyContent: "center", alignItems: "center" },
    dot: { width: 7, height: 7, borderRadius: 4 },
});
