import React from "react";
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@/utils/themeManager";
import LogoBrand from "@/components/LogoBrand";

const BLUE = "#2563EB";

const MONTHLY_REVENUE  = [38, 45, 52, 41, 60, 55, 72];
const WEEKLY_PATIENTS  = [68, 92, 78, 110, 95, 72, 120];
const APPOINTMENTS_MON = [42, 55, 48, 62, 58, 44, 70];
const DOCTOR_PERF      = [
    { name: "Dr. Sarah Jenkins", spec: "Cardiologist",    rating: 4.9, patients: 340, revenue: "Rs. 2.7L", initials: "SJ" },
    { name: "Dr. Arjun Mehta",   spec: "Neurologist",     rating: 4.7, patients: 210, revenue: "Rs. 2.1L", initials: "AM" },
    { name: "Dr. Rohit Sharma",  spec: "Orthopedic",      rating: 4.6, patients: 295, revenue: "Rs. 2.6L", initials: "RS" },
    { name: "Dr. Vikram Singh",  spec: "General Phys.",   rating: 4.5, patients: 520, revenue: "Rs. 2.0L", initials: "VS" },
    { name: "Dr. Meera Nair",    spec: "Psychiatrist",    rating: 4.8, patients:  98, revenue: "Rs. 1.2L", initials: "MN" },
];
const RECENT_REPORTS = [
    { id: "1", title: "July 2026 Performance Report",     category: "Monthly",   date: "Jul 24, 2026", status: "Ready"   },
    { id: "2", title: "Q2 Revenue Analytics",             category: "Quarterly", date: "Jul 1, 2026",  status: "Ready"   },
    { id: "3", title: "Patient Satisfaction Survey",      category: "Survey",    date: "Jun 30, 2026", status: "Ready"   },
    { id: "4", title: "Doctor Utilisation Report",        category: "Monthly",   date: "Jul 20, 2026", status: "Ready"   },
    { id: "5", title: "August 2026 Forecast",             category: "Forecast",  date: "Jul 24, 2026", status: "Pending" },
];

function SparkBar({ data, color, h = 60 }: { data: number[]; color: string; h?: number }) {
    const max = Math.max(...data);
    return (
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 5, height: h }}>
            {data.map((v, i) => (
                <View key={i} style={{ flex: 1, height: Math.max(4, (v / max) * h), backgroundColor: i === data.length - 1 ? color : color + "50", borderRadius: 4 }} />
            ))}
        </View>
    );
}

export default function AdminReportsScreen() {
    const { colors, isDark } = useTheme();
    const [activeTab, setActiveTab] = React.useState<"Overview" | "Revenue" | "Doctors" | "Reports">("Overview");
    const C = { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isDark ? colors.cardBorder : "#E8EFF5" };

    const TABS = ["Overview", "Revenue", "Doctors", "Reports"] as const;

    return (
        <SafeAreaView style={[s.root, { backgroundColor: colors.background }]} edges={["top"]}>

            {/* HEADER */}
            <View style={s.header}>
                <View>
                    <LogoBrand size={24} fontSize={16} style={{ marginBottom: 5 }} />
                    <Text style={[s.title, { color: colors.text }]}>Analytics & Reports</Text>
                </View>
                <TouchableOpacity style={[s.exportBtn, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]} activeOpacity={0.85}>
                    <MaterialCommunityIcons name="download-outline" size={18} color={BLUE} />
                    <Text style={{ color: BLUE, fontWeight: "700", fontSize: 12 }}>Export</Text>
                </TouchableOpacity>
            </View>

            {/* TABS */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 10 }}>
                {TABS.map((t) => (
                    <TouchableOpacity key={t} onPress={() => setActiveTab(t)} activeOpacity={0.8}
                        style={[s.tabPill, activeTab === t ? { backgroundColor: BLUE } : { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
                        <Text style={[s.tabTxt, { color: activeTab === t ? "#FFF" : colors.textSecondary }]}>{t}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

                {/* ── OVERVIEW ── */}
                {activeTab === "Overview" && (
                    <>
                        {/* Top KPIs */}
                        <LinearGradient colors={["#1E3A8A","#2563EB"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.heroBanner}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: "#BFDBFE", fontSize: 12, fontWeight: "600" }}>JULY 2026  •  MONTH TO DATE</Text>
                                <Text style={{ color: "#FFF", fontSize: 22, fontWeight: "800", marginTop: 6 }}>Rs. 52 Lakh</Text>
                                <Text style={{ color: "#BFDBFE", fontSize: 12, marginTop: 2 }}>Total Revenue this month</Text>
                                <View style={{ flexDirection: "row", gap: 20, marginTop: 14 }}>
                                    {[{ v: "2,840", l: "Patients" }, { v: "186", l: "Today's Appts" }, { v: "48", l: "Doctors" }].map((x, i) => (
                                        <View key={i}>
                                            <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "800" }}>{x.v}</Text>
                                            <Text style={{ color: "#BFDBFE", fontSize: 10, marginTop: 1 }}>{x.l}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                            <MaterialCommunityIcons name="chart-line-variant" size={54} color="rgba(255,255,255,0.18)" />
                        </LinearGradient>

                        {/* KPI Row */}
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 22 }}>
                            {[
                                { label: "Appointments",  val: "186",   icon: "calendar-month-outline", sub: "+12% vs last week" },
                                { label: "New Patients",  val: "124",   icon: "account-plus-outline",   sub: "This week"         },
                                { label: "Avg Rating",    val: "4.8",   icon: "star-outline",           sub: "Platform-wide"     },
                                { label: "Bed Occupancy", val: "73%",   icon: "hospital-building",      sub: "Admitted wards"    },
                            ].map((item, i) => (
                                <View key={i} style={[s.kpiCard, C, { width: "47%" }]}>
                                    <View style={[s.kpiIco, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                                        <MaterialCommunityIcons name={item.icon as any} size={19} color={BLUE} />
                                    </View>
                                    <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text, marginTop: 6 }}>{item.val}</Text>
                                    <Text style={{ fontSize: 12, fontWeight: "700", color: colors.textSecondary }}>{item.label}</Text>
                                    <Text style={{ fontSize: 10, color: BLUE, marginTop: 2 }}>{item.sub}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Weekly patients chart */}
                        <Text style={[s.sectionTitle, { color: colors.text }]}>Weekly Patients</Text>
                        <View style={[s.card, C, { marginBottom: 22 }]}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>120 <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: "600" }}>today</Text></Text>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#ECFDF5", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                                    <MaterialCommunityIcons name="trending-up" size={13} color="#10B981" />
                                    <Text style={{ color: "#10B981", fontSize: 11, fontWeight: "700" }}>+15%</Text>
                                </View>
                            </View>
                            <SparkBar data={WEEKLY_PATIENTS} color={BLUE} h={64} />
                            <View style={{ flexDirection: "row", marginTop: 6 }}>
                                {["M","T","W","T","F","S","S"].map((d, i) => (
                                    <Text key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: colors.textSecondary, fontWeight: "600" }}>{d}</Text>
                                ))}
                            </View>
                        </View>

                        {/* Appointment stats */}
                        <Text style={[s.sectionTitle, { color: colors.text }]}>Appointments by Day</Text>
                        <View style={[s.card, C, { marginBottom: 22 }]}>
                            <SparkBar data={APPOINTMENTS_MON} color="#10B981" h={56} />
                            <View style={{ flexDirection: "row", marginTop: 6 }}>
                                {["M","T","W","T","F","S","S"].map((d, i) => (
                                    <Text key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: colors.textSecondary, fontWeight: "600" }}>{d}</Text>
                                ))}
                            </View>
                        </View>
                    </>
                )}

                {/* ── REVENUE ── */}
                {activeTab === "Revenue" && (
                    <>
                        <Text style={[s.sectionTitle, { color: colors.text }]}>Monthly Revenue (Lakhs)</Text>
                        <View style={[s.card, C, { marginBottom: 22 }]}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <View>
                                    <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>Rs. 52L</Text>
                                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>July 2026 MTD</Text>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#ECFDF5", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                                    <MaterialCommunityIcons name="trending-up" size={13} color="#10B981" />
                                    <Text style={{ color: "#10B981", fontSize: 11, fontWeight: "700" }}>+22%</Text>
                                </View>
                            </View>
                            <SparkBar data={MONTHLY_REVENUE} color={BLUE} h={70} />
                            <View style={{ flexDirection: "row", marginTop: 6 }}>
                                {["Jan","Feb","Mar","Apr","May","Jun","Jul"].map((m, i) => (
                                    <Text key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: colors.textSecondary, fontWeight: "600" }}>{m}</Text>
                                ))}
                            </View>
                        </View>
                        {/* Revenue breakdown */}
                        <Text style={[s.sectionTitle, { color: colors.text }]}>Revenue Breakdown</Text>
                        <View style={[s.card, C, { marginBottom: 22 }]}>
                            {[
                                { label: "Consultation Fees", pct: 48, val: "Rs. 25L",  color: BLUE       },
                                { label: "Procedures",        pct: 28, val: "Rs. 14.5L",color: "#10B981"  },
                                { label: "Lab Tests",         pct: 14, val: "Rs. 7.3L", color: "#D97706"  },
                                { label: "Pharmacy",          pct: 10, val: "Rs. 5.2L", color: "#8B5CF6"  },
                            ].map((row, i) => (
                                <View key={i} style={{ marginBottom: i < 3 ? 14 : 0 }}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                                        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>{row.label}</Text>
                                        <Text style={{ fontSize: 13, fontWeight: "700", color: row.color }}>{row.val}  <Text style={{ color: colors.textSecondary, fontWeight: "500" }}>({row.pct}%)</Text></Text>
                                    </View>
                                    <View style={{ height: 8, borderRadius: 4, backgroundColor: isDark ? "#334155" : "#F1F5F9", overflow: "hidden" }}>
                                        <View style={{ width: `${row.pct}%`, height: "100%", backgroundColor: row.color, borderRadius: 4 }} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* ── DOCTORS ── */}
                {activeTab === "Doctors" && (
                    <>
                        <Text style={[s.sectionTitle, { color: colors.text }]}>Doctor Performance</Text>
                        {DOCTOR_PERF.map((doc, i) => (
                            <View key={i} style={[s.docRow, C, { marginBottom: 8 }]}>
                                <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: isDark ? "#1E293B" : "#EFF6FF", justifyContent: "center", alignItems: "center", marginRight: 12 }}>
                                    <Text style={{ color: BLUE, fontSize: 13, fontWeight: "800" }}>{doc.initials}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>{doc.name}</Text>
                                    <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 1 }}>{doc.spec}</Text>
                                </View>
                                <View style={{ alignItems: "flex-end" }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                                        <MaterialCommunityIcons name="star" size={12} color="#F59E0B" />
                                        <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text }}>{doc.rating}</Text>
                                    </View>
                                    <Text style={{ fontSize: 11, color: BLUE, fontWeight: "600", marginTop: 2 }}>{doc.revenue}</Text>
                                </View>
                            </View>
                        ))}
                    </>
                )}

                {/* ── REPORTS ── */}
                {activeTab === "Reports" && (
                    <>
                        <Text style={[s.sectionTitle, { color: colors.text }]}>Generated Reports</Text>
                        {RECENT_REPORTS.map((r) => (
                            <View key={r.id} style={[s.reportRow, C, { marginBottom: 8 }]}>
                                <View style={[s.reportIco, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                                    <MaterialCommunityIcons name="file-chart-outline" size={18} color={BLUE} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>{r.title}</Text>
                                    <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 1 }}>{r.date}  •  {r.category}</Text>
                                </View>
                                <View style={[{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: r.status === "Ready" ? "#ECFDF5" : "#FFFBEB" }]}>
                                    <Text style={{ color: r.status === "Ready" ? "#10B981" : "#D97706", fontSize: 10, fontWeight: "700" }}>{r.status}</Text>
                                </View>
                                <TouchableOpacity style={{ marginLeft: 8 }} hitSlop={8} activeOpacity={0.8}>
                                    <MaterialCommunityIcons name="download-outline" size={18} color={BLUE} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
    title: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
    exportBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
    tabPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18 },
    tabTxt: { fontSize: 13, fontWeight: "700" },
    scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },
    heroBanner: { borderRadius: 22, padding: 20, marginBottom: 22, flexDirection: "row", alignItems: "center" },
    kpiCard: { borderRadius: 18, borderWidth: 1, padding: 14 },
    kpiIco: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 12, letterSpacing: -0.3 },
    card: { borderRadius: 18, borderWidth: 1, padding: 16 },
    docRow: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, padding: 12 },
    reportRow: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, padding: 12 },
    reportIco: { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
});
