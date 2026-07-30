import LogoBrand from "@/components/LogoBrand";
import { useTheme } from "@/utils/themeManager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BLUE = "#2563EB";

// ─── Types ───────────────────────────────────────────────────────────────────
type ReportStatus = "Pending" | "Reviewed" | "Critical" | "Normal";
type ReportType = "Lab Report" | "Blood Test" | "X-Ray" | "MRI" | "CT Scan" | "Prescription" | "ECG" | "Ultrasound";

interface MedReport {
    id: string;
    reportId: string;
    title: string;
    type: ReportType;
    patient: string;
    patientId: string;
    doctor: string;
    uploadDate: string;
    status: ReportStatus;
    result: string;
    fileSize: string;
    pageCount: number;
    initials: string;
    avatarColor: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const REPORTS: MedReport[] = [
    { id: "1", reportId: "RPT-2026-001", title: "Complete Blood Count (CBC)", type: "Blood Test", patient: "Aarav Sharma", patientId: "PT-10234", doctor: "Dr. Sarah Jenkins", uploadDate: "Today, 09:30 AM", status: "Reviewed", result: "All values within normal range", fileSize: "1.2 MB", pageCount: 3, initials: "AS", avatarColor: "#2563EB" },
    { id: "2", reportId: "RPT-2026-002", title: "Cardiac Holter Monitoring", type: "ECG", patient: "Priya Patel", patientId: "PT-10456", doctor: "Dr. Sarah Jenkins", uploadDate: "Today, 08:15 AM", status: "Critical", result: "Irregular rhythm — requires attention", fileSize: "4.8 MB", pageCount: 12, initials: "PP", avatarColor: "#DC2626" },
    { id: "3", reportId: "RPT-2026-003", title: "MRI Brain Scan", type: "MRI", patient: "Meera Nair", patientId: "PT-10987", doctor: "Dr. Arjun Mehta", uploadDate: "Yesterday, 03:00 PM", status: "Normal", result: "No structural abnormality detected", fileSize: "22.5 MB", pageCount: 28, initials: "MN", avatarColor: "#3B82F6" },
    { id: "4", reportId: "RPT-2026-004", title: "Fasting Blood Glucose & HbA1c", type: "Lab Report", patient: "Rajesh Verma", patientId: "PT-10789", doctor: "Dr. Vikram Singh", uploadDate: "Jul 25, 2026", status: "Pending", result: "Awaiting pathologist review", fileSize: "0.8 MB", pageCount: 2, initials: "RV", avatarColor: "#1D4ED8" },
    { id: "5", reportId: "RPT-2026-005", title: "Left Forearm X-Ray", type: "X-Ray", patient: "Karan Singh", patientId: "PT-11002", doctor: "Dr. Rohit Sharma", uploadDate: "Jul 25, 2026", status: "Reviewed", result: "Radius fracture — casting confirmed", fileSize: "6.2 MB", pageCount: 4, initials: "KS", avatarColor: "#475569" },
    { id: "6", reportId: "RPT-2026-006", title: "Abdomen Ultrasound", type: "Ultrasound", patient: "Sunita Joshi", patientId: "PT-11034", doctor: "Dr. Arjun Mehta", uploadDate: "Jun 28, 2026", status: "Normal", result: "Kidney stone passed — clear", fileSize: "8.1 MB", pageCount: 6, initials: "SJ", avatarColor: "#64748B" },
    { id: "7", reportId: "RPT-2026-007", title: "Lipid Profile Panel", type: "Blood Test", patient: "Vikram Malhotra", patientId: "PT-10654", doctor: "Dr. Rohit Sharma", uploadDate: "Jul 26, 2026", status: "Pending", result: "Awaiting review", fileSize: "1.0 MB", pageCount: 2, initials: "VM", avatarColor: "#1E40AF" },
    { id: "8", reportId: "RPT-2026-008", title: "Chest CT Scan", type: "CT Scan", patient: "Ananya Sen", patientId: "PT-10321", doctor: "Dr. Vikram Singh", uploadDate: "Jul 28, 2026", status: "Pending", result: "New upload — pending radiologist", fileSize: "34.7 MB", pageCount: 45, initials: "AS", avatarColor: "#94A3B8" },
    { id: "9", reportId: "RPT-2026-009", title: "Hypertension Prescription", type: "Prescription", patient: "Aarav Sharma", patientId: "PT-10234", doctor: "Dr. Sarah Jenkins", uploadDate: "Today, 10:00 AM", status: "Reviewed", result: "Amlodipine 5mg OD — 30 days", fileSize: "0.3 MB", pageCount: 1, initials: "AS", avatarColor: "#2563EB" },
    { id: "10", reportId: "RPT-2026-010", title: "Echocardiogram Report", type: "ECG", patient: "Priya Patel", patientId: "PT-10456", doctor: "Dr. Sarah Jenkins", uploadDate: "Jul 20, 2026", status: "Critical", result: "EF 45% — Moderate dysfunction", fileSize: "5.5 MB", pageCount: 8, initials: "PP", avatarColor: "#DC2626" },
];

const TYPE_CFG: Record<ReportType, { icon: string; color: string; bg: string }> = {
    "Lab Report":   { icon: "flask-outline",            color: "#2563EB", bg: "#EFF6FF" },
    "Blood Test":   { icon: "water-outline",            color: "#DC2626", bg: "#FEF2F2" },
    "X-Ray":        { icon: "radioactive-circle-outline", color: "#64748B", bg: "#F1F5F9" },
    "MRI":          { icon: "circle-slice-8",           color: "#1E40AF", bg: "#DBEAFE" },
    "CT Scan":      { icon: "layers-outline",           color: "#475569", bg: "#F1F5F9" },
    "Prescription": { icon: "pill",                     color: "#16A34A", bg: "#F0FDF4" },
    "ECG":          { icon: "heart-pulse",              color: "#DC2626", bg: "#FEF2F2" },
    "Ultrasound":   { icon: "waveform",                 color: "#2563EB", bg: "#EFF6FF" },
};

const STATUS_CFG: Record<ReportStatus, { color: string; bg: string; icon: string }> = {
    "Reviewed": { color: "#16A34A", bg: "#F0FDF4", icon: "check-circle-outline" },
    "Normal":   { color: "#2563EB", bg: "#EFF6FF", icon: "information-outline" },
    "Pending":  { color: "#D97706", bg: "#FFFBEB", icon: "clock-outline" },
    "Critical": { color: "#DC2626", bg: "#FEF2F2", icon: "alert-circle-outline" },
};

const FILTER_CHIPS = [
    { key: "All",          label: "All",          icon: "view-grid-outline" },
    { key: "Pending",      label: "Pending",      icon: "clock-outline" },
    { key: "Critical",     label: "Critical",     icon: "alert-circle-outline" },
    { key: "Reviewed",     label: "Reviewed",     icon: "check-circle-outline" },
    { key: "Lab Report",   label: "Lab Reports",  icon: "flask-outline" },
    { key: "Blood Test",   label: "Blood Tests",  icon: "water-outline" },
    { key: "X-Ray",        label: "X-Ray",        icon: "radioactive-circle-outline" },
    { key: "MRI",          label: "MRI",          icon: "circle-slice-8" },
    { key: "CT Scan",      label: "CT Scan",      icon: "layers-outline" },
    { key: "Prescription", label: "Prescription", icon: "pill" },
] as const;

const SORT_OPTIONS = [
    { key: "newest",   label: "Newest First" },
    { key: "oldest",   label: "Oldest First" },
    { key: "patient",  label: "Patient Name" },
    { key: "type",     label: "Report Type" },
];

const MONTHLY_REVENUE = [38, 45, 52, 41, 60, 55, 72];
const WEEKLY_PATIENTS = [68, 92, 78, 110, 95, 72, 120];
const APPOINTMENTS_MON = [42, 55, 48, 62, 58, 44, 70];
const DOCTOR_PERF = [
    { name: "Dr. Sarah Jenkins", spec: "Cardiologist", rating: 4.9, patients: 340, revenue: "Rs. 2.7L", initials: "SJ" },
    { name: "Dr. Arjun Mehta", spec: "Neurologist", rating: 4.7, patients: 210, revenue: "Rs. 2.1L", initials: "AM" },
    { name: "Dr. Rohit Sharma", spec: "Orthopedic", rating: 4.6, patients: 295, revenue: "Rs. 2.6L", initials: "RS" },
    { name: "Dr. Vikram Singh", spec: "General Phys.", rating: 4.5, patients: 520, revenue: "Rs. 2.0L", initials: "VS" },
    { name: "Dr. Meera Nair", spec: "Psychiatrist", rating: 4.8, patients: 98, revenue: "Rs. 1.2L", initials: "MN" },
];

function SparkBar({ data, color, h = 60 }: { data: number[]; color: string; h?: number }) {
    const max = Math.max(...data);
    return (
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 5, height: h }}>
            {data.map((v, i) => (
                <View
                    key={i}
                    style={{
                        flex: 1,
                        height: Math.max(4, (v / max) * h),
                        backgroundColor: i === data.length - 1 ? color : color + "55",
                        borderRadius: 4,
                    }}
                />
            ))}
        </View>
    );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AdminReportsScreen() {
    const { colors, isDark } = useTheme();

    const [activeTab, setActiveTab] = useState<"Reports" | "Overview" | "Revenue" | "Doctors">("Reports");
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<string>("All");
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "patient" | "type">("newest");
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState<MedReport | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [toastMsg, setToastMsg] = useState("");

    const C = { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isDark ? colors.cardBorder : "#E2E8F0" };

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 3000);
    };

    const handleFilterChange = (key: string) => {
        setIsLoading(true);
        setActiveFilter(key);
        setTimeout(() => setIsLoading(false), 220);
    };

    const handleExport = (format: string) => {
        setExporting(true);
        setTimeout(() => {
            setExporting(false);
            setShowExportModal(false);
            showToast(`Report exported as ${format} successfully!`);
        }, 1400);
    };

    // Summary stats
    const stats = useMemo(() => ({
        total: REPORTS.length,
        pending: REPORTS.filter(r => r.status === "Pending").length,
        reviewed: REPORTS.filter(r => r.status === "Reviewed").length,
        critical: REPORTS.filter(r => r.status === "Critical").length,
        today: REPORTS.filter(r => r.uploadDate.startsWith("Today")).length,
    }), []);

    // Filter + Search + Sort
    const filtered = useMemo(() => {
        let list = [...REPORTS];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(r =>
                r.patient.toLowerCase().includes(q) ||
                r.reportId.toLowerCase().includes(q) ||
                r.doctor.toLowerCase().includes(q) ||
                r.type.toLowerCase().includes(q) ||
                r.title.toLowerCase().includes(q)
            );
        }
        if (activeFilter !== "All") {
            // could be a status or a type filter
            list = list.filter(r => r.status === activeFilter || r.type === activeFilter);
        }
        list.sort((a, b) => {
            if (sortBy === "patient") return a.patient.localeCompare(b.patient);
            if (sortBy === "type") return a.type.localeCompare(b.type);
            if (sortBy === "oldest") return a.id.localeCompare(b.id);
            return b.id.localeCompare(a.id); // newest
        });
        return list;
    }, [search, activeFilter, sortBy]);

    const resetFilters = () => {
        setSearch("");
        setActiveFilter("All");
        setSortBy("newest");
    };

    const TABS: Array<{ key: string; label: string; icon: string }> = [
        { key: "Reports",  label: "Reports",  icon: "file-document-multiple-outline" },
        { key: "Overview", label: "Overview", icon: "chart-line-variant" },
        { key: "Revenue",  label: "Revenue",  icon: "cash-multiple" },
        { key: "Doctors",  label: "Doctors",  icon: "doctor" },
    ];

    return (
        <SafeAreaView style={[s.root, { backgroundColor: colors.background }]} edges={["top"]}>

            {/* ── HEADER ── */}
            <View style={s.header}>
                <LogoBrand size={22} fontSize={15} style={{ marginBottom: 6 }} />
                <View style={s.headerRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={[s.pageTitle, { color: colors.text }]}>Analytics & Reports</Text>
                        <Text style={[s.pageSub, { color: colors.textSecondary }]}>July 2026 · LifeRelier Platform</Text>
                    </View>
                    <TouchableOpacity
                        style={[s.exportBtn, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}
                        onPress={() => setShowExportModal(true)}
                        activeOpacity={0.85}
                    >
                        <MaterialCommunityIcons name="download-outline" size={16} color={BLUE} />
                        <Text style={{ color: BLUE, fontWeight: "700", fontSize: 12 }}>Export</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── TABS — fixed full-width underline bar ── */}
            <View style={[s.tabBar, { borderBottomColor: isDark ? "#334155" : "#E2E8F0" }]}>
                {TABS.map(tab => {
                    const isActive = activeTab === tab.key;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setActiveTab(tab.key as any)}
                            activeOpacity={0.75}
                            style={[s.tabItem, isActive && { borderBottomColor: BLUE, borderBottomWidth: 2 }]}
                        >
                            <MaterialCommunityIcons
                                name={tab.icon as any}
                                size={15}
                                color={isActive ? BLUE : colors.textSecondary}
                            />
                            <Text style={[s.tabItemTxt, { color: isActive ? BLUE : colors.textSecondary }]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

                {/* ══════════════════════════════════════════════
                    TAB 1 — REPORTS
                ══════════════════════════════════════════════ */}
                {activeTab === "Reports" && (
                    <>
                        {/* 1. Summary Cards */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.statsScroll}>
                            {[
                                { label: "Total",     val: stats.total,    icon: "file-document-multiple-outline", color: BLUE,      bg: isDark ? "#1E293B" : "#EFF6FF" },
                                { label: "Pending",   val: stats.pending,  icon: "clock-outline",                  color: "#D97706",  bg: isDark ? "#78350F20" : "#FFFBEB" },
                                { label: "Reviewed",  val: stats.reviewed, icon: "check-circle-outline",           color: "#16A34A",  bg: isDark ? "#14532D20" : "#F0FDF4" },
                                { label: "Critical",  val: stats.critical, icon: "alert-circle-outline",           color: "#DC2626",  bg: isDark ? "#7F1D1D20" : "#FEF2F2" },
                                { label: "Today",     val: stats.today,    icon: "calendar-today",                 color: BLUE,       bg: isDark ? "#1E3A8A20" : "#EFF6FF" },
                            ].map((st, i) => (
                                <View key={i} style={[s.statCard, C]}>
                                    <View style={[s.statIco, { backgroundColor: st.bg }]}>
                                        <MaterialCommunityIcons name={st.icon as any} size={17} color={st.color} />
                                    </View>
                                    <Text style={[s.statVal, { color: colors.text }]}>{st.val}</Text>
                                    <Text style={[s.statLbl, { color: colors.textSecondary }]}>{st.label}</Text>
                                </View>
                            ))}
                        </ScrollView>

                        {/* 2. Search Bar */}
                        <View style={s.searchWrap}>
                            <View style={[s.searchBar, C]}>
                                <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
                                <TextInput
                                    style={[s.searchInput, { color: colors.text }]}
                                    placeholder="Search by patient, doctor, report ID or type..."
                                    placeholderTextColor="#94A3B8"
                                    value={search}
                                    onChangeText={setSearch}
                                />
                                {search.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}>
                                        <MaterialCommunityIcons name="close-circle" size={17} color="#94A3B8" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* 3. Filter Chips */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
                            {FILTER_CHIPS.map(chip => {
                                const isSel = activeFilter === chip.key;
                                return (
                                    <TouchableOpacity
                                        key={chip.key}
                                        onPress={() => handleFilterChange(chip.key)}
                                        activeOpacity={0.8}
                                        style={[
                                            s.filterChip,
                                            isSel ? s.filterChipActive : [C, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }],
                                        ]}
                                    >
                                        <MaterialCommunityIcons
                                            name={chip.icon as any}
                                            size={13}
                                            color={isSel ? "#FFFFFF" : colors.textSecondary}
                                        />
                                        <Text style={[s.filterChipTxt, { color: isSel ? "#FFFFFF" : colors.textSecondary }]}>
                                            {chip.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        {/* 4. Sort Row */}
                        <View style={s.sortRow}>
                            <Text style={[s.resultsCount, { color: colors.textSecondary }]}>
                                {filtered.length} report{filtered.length !== 1 ? "s" : ""}
                                {activeFilter !== "All" ? ` · ${activeFilter}` : ""}
                            </Text>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                {(search || activeFilter !== "All") && (
                                    <TouchableOpacity onPress={resetFilters}>
                                        <Text style={s.resetTxt}>Reset</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={[s.sortBtn, C]}
                                    onPress={() => setShowSortMenu(!showSortMenu)}
                                    activeOpacity={0.8}
                                >
                                    <MaterialCommunityIcons name="sort-variant" size={14} color={BLUE} />
                                    <Text style={[s.sortBtnTxt, { color: colors.text }]} numberOfLines={1}>
                                        {SORT_OPTIONS.find(o => o.key === sortBy)?.label}
                                    </Text>
                                    <MaterialCommunityIcons name="chevron-down" size={13} color="#94A3B8" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {showSortMenu && (
                            <View style={[s.sortMenu, C]}>
                                {SORT_OPTIONS.map(opt => (
                                    <TouchableOpacity
                                        key={opt.key}
                                        style={[s.sortMenuRow, sortBy === opt.key && { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}
                                        onPress={() => { setSortBy(opt.key as any); setShowSortMenu(false); }}
                                    >
                                        <Text style={[s.sortMenuTxt, { color: sortBy === opt.key ? BLUE : colors.text }]}>{opt.label}</Text>
                                        {sortBy === opt.key && <MaterialCommunityIcons name="check" size={14} color={BLUE} />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* 5. Report Cards */}
                        {isLoading ? (
                            <View style={s.loadingBox}>
                                <ActivityIndicator size="small" color={BLUE} />
                                <Text style={[{ fontSize: 12, marginTop: 8, color: colors.textSecondary }]}>Loading reports...</Text>
                            </View>
                        ) : filtered.length === 0 ? (
                            <View style={s.emptyBox}>
                                <View style={s.emptyIcoCircle}>
                                    <MaterialCommunityIcons name="file-search-outline" size={44} color="#94A3B8" style={{ opacity: 0.5 }} />
                                </View>
                                <Text style={[s.emptyTitle, { color: colors.text }]}>No Reports Found</Text>
                                <Text style={[s.emptySub, { color: colors.textSecondary }]}>
                                    No reports match your search or active filters.
                                </Text>
                                <TouchableOpacity style={s.emptyResetBtn} onPress={resetFilters}>
                                    <MaterialCommunityIcons name="refresh" size={14} color="#FFFFFF" />
                                    <Text style={s.emptyResetTxt}>Clear Filters</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={s.cardsList}>
                                {filtered.map(r => {
                                    const tc = TYPE_CFG[r.type];
                                    const sc = STATUS_CFG[r.status];
                                    return (
                                        <View
                                            key={r.id}
                                            style={[
                                                s.reportCard, C,
                                                r.status === "Critical" && { borderLeftWidth: 3, borderLeftColor: "#DC2626" },
                                            ]}
                                        >
                                            {/* Card Header */}
                                            <View style={s.cardHeader}>
                                                {/* Report type icon */}
                                                <View style={[s.reportTypeIco, { backgroundColor: tc.bg }]}>
                                                    <MaterialCommunityIcons name={tc.icon as any} size={22} color={tc.color} />
                                                </View>

                                                <View style={s.cardMeta}>
                                                    <Text style={[s.reportTitle, { color: colors.text }]} numberOfLines={1}>
                                                        {r.title}
                                                    </Text>
                                                    <Text style={[s.reportId, { color: BLUE }]}>{r.reportId}</Text>
                                                    <View style={[s.typeBadge, { backgroundColor: tc.bg }]}>
                                                        <Text style={[s.typeBadgeTxt, { color: tc.color }]}>{r.type}</Text>
                                                    </View>
                                                </View>

                                                <View style={[s.statusPill, { backgroundColor: sc.bg }]}>
                                                    <MaterialCommunityIcons name={sc.icon as any} size={11} color={sc.color} />
                                                    <Text style={[s.statusPillTxt, { color: sc.color }]}>{r.status}</Text>
                                                </View>
                                            </View>

                                            {/* Patient & Doctor Row */}
                                            <View style={[s.infoBar, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                                                <View style={s.infoBarItem}>
                                                    <View style={[s.miniAvt, { backgroundColor: r.avatarColor }]}>
                                                        <Text style={s.miniAvtTxt}>{r.initials}</Text>
                                                    </View>
                                                    <View>
                                                        <Text style={[s.infoBarLbl, { color: colors.textSecondary }]}>Patient</Text>
                                                        <Text style={[s.infoBarVal, { color: colors.text }]} numberOfLines={1}>{r.patient}</Text>
                                                    </View>
                                                </View>
                                                <View style={s.infoBarDivider} />
                                                <View style={s.infoBarItem}>
                                                    <MaterialCommunityIcons name="doctor" size={16} color="#64748B" />
                                                    <View>
                                                        <Text style={[s.infoBarLbl, { color: colors.textSecondary }]}>Doctor</Text>
                                                        <Text style={[s.infoBarVal, { color: colors.text }]} numberOfLines={1}>
                                                            {r.doctor.replace("Dr. ", "")}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* Result Preview */}
                                            <View style={[s.resultPreview, {
                                                backgroundColor: r.status === "Critical"
                                                    ? (isDark ? "#450A0A20" : "#FEF2F2")
                                                    : (isDark ? "#0F172A" : "#F8FAFC")
                                            }]}>
                                                <MaterialCommunityIcons
                                                    name="text-box-outline"
                                                    size={13}
                                                    color={r.status === "Critical" ? "#DC2626" : BLUE}
                                                />
                                                <Text
                                                    style={[s.resultPreviewTxt, {
                                                        color: r.status === "Critical" ? "#DC2626" : colors.textSecondary
                                                    }]}
                                                    numberOfLines={2}
                                                >
                                                    {r.result}
                                                </Text>
                                            </View>

                                            {/* Meta Row — date, file size, pages */}
                                            <View style={s.metaRow}>
                                                <View style={s.metaItem}>
                                                    <MaterialCommunityIcons name="clock-outline" size={11} color="#94A3B8" />
                                                    <Text style={s.metaTxt}>{r.uploadDate}</Text>
                                                </View>
                                                <View style={s.metaItem}>
                                                    <MaterialCommunityIcons name="file-outline" size={11} color="#94A3B8" />
                                                    <Text style={s.metaTxt}>{r.fileSize}</Text>
                                                </View>
                                                <View style={s.metaItem}>
                                                    <MaterialCommunityIcons name="book-open-page-variant-outline" size={11} color="#94A3B8" />
                                                    <Text style={s.metaTxt}>{r.pageCount} page{r.pageCount !== 1 ? "s" : ""}</Text>
                                                </View>
                                            </View>

                                            {/* Action Buttons */}
                                            <View style={s.actionsRow}>
                                                <TouchableOpacity
                                                    style={[s.actionBtn, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}
                                                    onPress={() => { setSelectedReport(r); setShowDetailModal(true); }}
                                                    activeOpacity={0.75}
                                                >
                                                    <MaterialCommunityIcons name="eye-outline" size={13} color={BLUE} />
                                                    <Text style={[s.actionBtnTxt, { color: BLUE }]}>View</Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={[s.actionBtn, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}
                                                    onPress={() => showToast(`Downloading ${r.reportId}...`)}
                                                    activeOpacity={0.75}
                                                >
                                                    <MaterialCommunityIcons name="download-outline" size={13} color="#64748B" />
                                                    <Text style={[s.actionBtnTxt, { color: "#64748B" }]}>Download</Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={[s.actionBtn, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}
                                                    onPress={() => showToast(`Sharing ${r.reportId}...`)}
                                                    activeOpacity={0.75}
                                                >
                                                    <MaterialCommunityIcons name="share-outline" size={13} color="#64748B" />
                                                    <Text style={[s.actionBtnTxt, { color: "#64748B" }]}>Share</Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={[s.actionBtnIcon, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}
                                                    onPress={() => Alert.alert("More Actions", `Print · Delete · ${r.reportId}`)}
                                                    activeOpacity={0.75}
                                                >
                                                    <MaterialCommunityIcons name="dots-horizontal" size={15} color={colors.textSecondary} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </>
                )}

                {/* ══════════════════════════════════════════════
                    TAB 2 — OVERVIEW
                ══════════════════════════════════════════════ */}
                {activeTab === "Overview" && (
                    <>
                        <LinearGradient colors={["#1E3A8A", "#2563EB"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.heroBanner}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: "#BFDBFE", fontSize: 12, fontWeight: "600" }}>JULY 2026  ·  MONTH TO DATE</Text>
                                <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "800", marginTop: 6 }}>Rs. 52 Lakh</Text>
                                <Text style={{ color: "#BFDBFE", fontSize: 12, marginTop: 2 }}>Total Revenue this month</Text>
                                <View style={{ flexDirection: "row", gap: 20, marginTop: 14 }}>
                                    {[{ v: "2,840", l: "Patients" }, { v: "186", l: "Today's Appts" }, { v: "48", l: "Doctors" }].map((x, i) => (
                                        <View key={i}>
                                            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "800" }}>{x.v}</Text>
                                            <Text style={{ color: "#BFDBFE", fontSize: 10, marginTop: 1 }}>{x.l}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                            <MaterialCommunityIcons name="chart-line-variant" size={54} color="rgba(255,255,255,0.18)" />
                        </LinearGradient>

                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 22 }}>
                            {[
                                { label: "Appointments", val: "186", icon: "calendar-month-outline", sub: "+12% vs last week" },
                                { label: "New Patients", val: "124", icon: "account-plus-outline", sub: "This week" },
                                { label: "Avg Rating", val: "4.8", icon: "star-outline", sub: "Platform-wide" },
                                { label: "Bed Occupancy", val: "73%", icon: "hospital-building", sub: "Admitted wards" },
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

                        <Text style={[s.sectionTitle, { color: colors.text }]}>Weekly Patients</Text>
                        <View style={[s.chartCard, C, { marginBottom: 22 }]}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>
                                    120 <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: "600" }}>today</Text>
                                </Text>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F0FDF4", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                                    <MaterialCommunityIcons name="trending-up" size={13} color="#16A34A" />
                                    <Text style={{ color: "#16A34A", fontSize: 11, fontWeight: "700" }}>+15%</Text>
                                </View>
                            </View>
                            <SparkBar data={WEEKLY_PATIENTS} color={BLUE} h={64} />
                            <View style={{ flexDirection: "row", marginTop: 6 }}>
                                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                                    <Text key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: colors.textSecondary, fontWeight: "600" }}>{d}</Text>
                                ))}
                            </View>
                        </View>

                        <Text style={[s.sectionTitle, { color: colors.text }]}>Appointments by Day</Text>
                        <View style={[s.chartCard, C, { marginBottom: 22 }]}>
                            <SparkBar data={APPOINTMENTS_MON} color="#16A34A" h={56} />
                            <View style={{ flexDirection: "row", marginTop: 6 }}>
                                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                                    <Text key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: colors.textSecondary, fontWeight: "600" }}>{d}</Text>
                                ))}
                            </View>
                        </View>
                    </>
                )}

                {/* ══════════════════════════════════════════════
                    TAB 3 — REVENUE
                ══════════════════════════════════════════════ */}
                {activeTab === "Revenue" && (
                    <>
                        <Text style={[s.sectionTitle, { color: colors.text }]}>Monthly Revenue (Lakhs)</Text>
                        <View style={[s.chartCard, C, { marginBottom: 22 }]}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <View>
                                    <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>Rs. 52L</Text>
                                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>July 2026 MTD</Text>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F0FDF4", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                                    <MaterialCommunityIcons name="trending-up" size={13} color="#16A34A" />
                                    <Text style={{ color: "#16A34A", fontSize: 11, fontWeight: "700" }}>+22%</Text>
                                </View>
                            </View>
                            <SparkBar data={MONTHLY_REVENUE} color={BLUE} h={70} />
                            <View style={{ flexDirection: "row", marginTop: 6 }}>
                                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m, i) => (
                                    <Text key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: colors.textSecondary, fontWeight: "600" }}>{m}</Text>
                                ))}
                            </View>
                        </View>

                        <Text style={[s.sectionTitle, { color: colors.text }]}>Revenue Breakdown</Text>
                        <View style={[s.chartCard, C, { marginBottom: 22 }]}>
                            {[
                                { label: "Consultation Fees", pct: 48, val: "Rs. 25L", color: BLUE },
                                { label: "Procedures", pct: 28, val: "Rs. 14.5L", color: "#16A34A" },
                                { label: "Lab Tests", pct: 14, val: "Rs. 7.3L", color: "#D97706" },
                                { label: "Pharmacy", pct: 10, val: "Rs. 5.2L", color: "#64748B" },
                            ].map((row, i, arr) => (
                                <View key={i} style={{ marginBottom: i < arr.length - 1 ? 14 : 0 }}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                                        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>{row.label}</Text>
                                        <Text style={{ fontSize: 13, fontWeight: "700", color: row.color }}>
                                            {row.val}  <Text style={{ color: colors.textSecondary, fontWeight: "500" }}>({row.pct}%)</Text>
                                        </Text>
                                    </View>
                                    <View style={{ height: 8, borderRadius: 4, backgroundColor: isDark ? "#334155" : "#F1F5F9", overflow: "hidden" }}>
                                        <View style={{ width: `${row.pct}%`, height: "100%", backgroundColor: row.color, borderRadius: 4 }} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* ══════════════════════════════════════════════
                    TAB 4 — DOCTORS
                ══════════════════════════════════════════════ */}
                {activeTab === "Doctors" && (
                    <>
                        <Text style={[s.sectionTitle, { color: colors.text }]}>Doctor Performance</Text>
                        {DOCTOR_PERF.map((doc, i) => (
                            <View key={i} style={[s.docRow, C, { marginBottom: 10 }]}>
                                <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: isDark ? "#1E293B" : "#EFF6FF", justifyContent: "center", alignItems: "center", marginRight: 12 }}>
                                    <Text style={{ color: BLUE, fontSize: 13, fontWeight: "800" }}>{doc.initials}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>{doc.name}</Text>
                                    <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 1 }}>{doc.spec} · {doc.patients} patients</Text>
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

            </ScrollView>

            {/* ── REPORT DETAIL MODAL ── */}
            <Modal visible={showDetailModal} transparent animationType="slide" onRequestClose={() => setShowDetailModal(false)}>
                <Pressable style={s.modalOverlay} onPress={() => setShowDetailModal(false)}>
                    <Pressable style={[s.modalSheet, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
                        <View style={s.modalHandle} />
                        {selectedReport && (() => {
                            const tc = TYPE_CFG[selectedReport.type];
                            const sc = STATUS_CFG[selectedReport.status];
                            return (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {/* Hero */}
                                    <LinearGradient colors={["#1E3A8A", "#2563EB"]} style={s.detailHero}>
                                        <View style={[s.detailReportIco, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                                            <MaterialCommunityIcons name={tc.icon as any} size={32} color="#FFFFFF" />
                                        </View>
                                        <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "800", marginTop: 12, textAlign: "center" }}>
                                            {selectedReport.title}
                                        </Text>
                                        <Text style={{ color: "#BFDBFE", fontSize: 13, marginTop: 4 }}>{selectedReport.reportId}</Text>
                                        <View style={[s.statusPill, { backgroundColor: sc.bg, marginTop: 10 }]}>
                                            <MaterialCommunityIcons name={sc.icon as any} size={11} color={sc.color} />
                                            <Text style={[s.statusPillTxt, { color: sc.color }]}>{sc.label}</Text>
                                        </View>
                                    </LinearGradient>

                                    {/* Stats */}
                                    <View style={{ flexDirection: "row", justifyContent: "space-around", paddingVertical: 14 }}>
                                        {[
                                            { v: selectedReport.type, l: "Type" },
                                            { v: selectedReport.fileSize, l: "File Size" },
                                            { v: `${selectedReport.pageCount} pg`, l: "Pages" },
                                        ].map((x, i) => (
                                            <View key={i} style={{ alignItems: "center" }}>
                                                <Text style={{ fontSize: 14, fontWeight: "800", color: colors.text }}>{x.v}</Text>
                                                <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 2 }}>{x.l}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* PDF Thumbnail placeholder */}
                                    <View style={[s.pdfThumb, { borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                                        <MaterialCommunityIcons name="file-pdf-box" size={48} color="#DC2626" />
                                        <Text style={[s.pdfThumbLbl, { color: colors.text }]}>{selectedReport.title}</Text>
                                        <Text style={[s.pdfThumbSub, { color: colors.textSecondary }]}>
                                            {selectedReport.fileSize} · {selectedReport.pageCount} pages
                                        </Text>
                                        <TouchableOpacity
                                            style={[s.pdfViewBtn, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}
                                            onPress={() => showToast("Opening PDF viewer...")}
                                        >
                                            <MaterialCommunityIcons name="eye-outline" size={15} color={BLUE} />
                                            <Text style={{ color: BLUE, fontWeight: "700", fontSize: 13 }}>Preview Report</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Detail rows */}
                                    {[
                                        { icon: "account-outline", label: "Patient", val: `${selectedReport.patient} (${selectedReport.patientId})` },
                                        { icon: "doctor", label: "Attending Doctor", val: selectedReport.doctor },
                                        { icon: "clock-outline", label: "Upload Date", val: selectedReport.uploadDate },
                                        { icon: "text-box-outline", label: "Result Summary", val: selectedReport.result },
                                    ].map(row => (
                                        <View key={row.label} style={[s.dRow, { borderColor: isDark ? "#334155" : "#F1F5F9" }]}>
                                            <View style={[s.dIco, { backgroundColor: isDark ? "#0F172A" : "#EFF6FF" }]}>
                                                <MaterialCommunityIcons name={row.icon as any} size={15} color={BLUE} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: "600" }}>{row.label}</Text>
                                                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginTop: 1 }}>{row.val}</Text>
                                            </View>
                                        </View>
                                    ))}

                                    {/* Modal actions */}
                                    <View style={{ gap: 10, paddingVertical: 16 }}>
                                        {[
                                            { icon: "download-outline", label: "Download Report", color: BLUE, bg: isDark ? "#1E293B" : "#EFF6FF" },
                                            { icon: "share-outline", label: "Share with Doctor", color: BLUE, bg: isDark ? "#1E293B" : "#EFF6FF" },
                                            { icon: "printer-outline", label: "Print Report", color: "#64748B", bg: isDark ? "#1E293B" : "#F1F5F9" },
                                            { icon: "delete-outline", label: "Delete Report", color: "#DC2626", bg: "#FEF2F2" },
                                        ].map(btn => (
                                            <TouchableOpacity
                                                key={btn.label}
                                                style={[s.modalActionBtn, { backgroundColor: btn.bg }]}
                                                onPress={() => {
                                                    setShowDetailModal(false);
                                                    showToast(`${btn.label} — ${selectedReport.reportId}`);
                                                }}
                                            >
                                                <MaterialCommunityIcons name={btn.icon as any} size={17} color={btn.color} />
                                                <Text style={{ color: btn.color, fontWeight: "700", fontSize: 14 }}>{btn.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            );
                        })()}
                    </Pressable>
                </Pressable>
            </Modal>

            {/* ── EXPORT MODAL ── */}
            <Modal visible={showExportModal} transparent animationType="slide" onRequestClose={() => setShowExportModal(false)}>
                <Pressable style={s.modalOverlay} onPress={() => setShowExportModal(false)}>
                    <View style={[s.exportSheet, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
                        <View style={s.modalHandle} />
                        <Text style={[s.exportSheetTitle, { color: colors.text }]}>Export Reports</Text>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20 }}>
                            Select format to download the complete analytics or report summary.
                        </Text>
                        {exporting ? (
                            <View style={{ alignItems: "center", paddingVertical: 30 }}>
                                <ActivityIndicator size="large" color={BLUE} />
                                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginTop: 12 }}>Generating export file...</Text>
                            </View>
                        ) : (
                            <View style={{ gap: 10 }}>
                                {[
                                    { format: "PDF Document (.pdf)", icon: "file-pdf-box", color: "#DC2626" },
                                    { format: "Excel Spreadsheet (.xlsx)", icon: "file-excel-box", color: "#16A34A" },
                                    { format: "CSV Data File (.csv)", icon: "file-delimited-outline", color: BLUE },
                                ].map(item => (
                                    <TouchableOpacity
                                        key={item.format}
                                        style={[s.exportOptBtn, C]}
                                        onPress={() => handleExport(item.format)}
                                        activeOpacity={0.8}
                                    >
                                        <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
                                        <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text, flex: 1 }}>{item.format}</Text>
                                        <MaterialCommunityIcons name="chevron-right" size={18} color="#94A3B8" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </Pressable>
            </Modal>

            {/* ── TOAST ── */}
            {toastMsg ? (
                <View style={s.toast}>
                    <MaterialCommunityIcons name="check-circle" size={17} color="#FFFFFF" />
                    <Text style={s.toastTxt}>{toastMsg}</Text>
                </View>
            ) : null}

        </SafeAreaView>
    );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root: { flex: 1 },

    // Header
    header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
    pageTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
    pageSub: { fontSize: 12, fontWeight: "500", marginTop: 1 },
    exportBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, flexShrink: 0 },

    // Tabs — underline indicator bar
    tabBar: { flexDirection: "row", borderBottomWidth: 1, marginBottom: 4, paddingHorizontal: 8 },
    tabItem: { flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", paddingVertical: 10, gap: 3, borderBottomWidth: 2, borderBottomColor: "transparent" },
    tabItemTxt: { fontSize: 11, fontWeight: "700" },
    tabTxt: { fontSize: 12, fontWeight: "700" },
    scroll: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 48 },

    // Stats
    statsScroll: { gap: 8, marginBottom: 12 },
    statCard: { borderRadius: 16, borderWidth: 1, padding: 12, minWidth: 90, alignItems: "flex-start" },
    statIco: { width: 30, height: 30, borderRadius: 8, justifyContent: "center", alignItems: "center", marginBottom: 6 },
    statVal: { fontSize: 18, fontWeight: "800" },
    statLbl: { fontSize: 10, fontWeight: "600", marginTop: 1 },

    // Search
    searchWrap: { marginBottom: 10 },
    searchBar: { flexDirection: "row", alignItems: "center", gap: 10, height: 46, borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 14 },
    searchInput: { flex: 1, fontSize: 13, fontWeight: "500" },

    // Filters
    filterScroll: { gap: 8, marginBottom: 10 },
    filterChip: { flexDirection: "row", alignItems: "center", gap: 5, height: 34, paddingHorizontal: 12, borderRadius: 17, borderWidth: 1 },
    filterChipActive: { backgroundColor: BLUE, borderColor: BLUE, shadowColor: BLUE, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 3 },
    filterChipTxt: { fontSize: 11, fontWeight: "700" },

    // Sort row
    sortRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    resultsCount: { fontSize: 12, fontWeight: "600" },
    resetTxt: { fontSize: 12, fontWeight: "700", color: BLUE },
    sortBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
    sortBtnTxt: { fontSize: 11, fontWeight: "700", maxWidth: 90 },
    sortMenu: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 10 },
    sortMenuRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10 },
    sortMenuTxt: { fontSize: 12, fontWeight: "600" },

    // Loading / Empty
    loadingBox: { alignItems: "center", paddingVertical: 50 },
    emptyBox: { alignItems: "center", paddingVertical: 50, paddingHorizontal: 24 },
    emptyIcoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center", marginBottom: 12 },
    emptyTitle: { fontSize: 16, fontWeight: "800", marginBottom: 4 },
    emptySub: { fontSize: 12, fontWeight: "500", textAlign: "center", marginBottom: 16 },
    emptyResetBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: BLUE, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12 },
    emptyResetTxt: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },

    // Report Cards
    cardsList: { gap: 14 },
    reportCard: { borderRadius: 20, borderWidth: 1, padding: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 2, overflow: "hidden" },
    cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 10 },
    reportTypeIco: { width: 48, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center" },
    cardMeta: { flex: 1 },
    reportTitle: { fontSize: 14, fontWeight: "800", letterSpacing: -0.2 },
    reportId: { fontSize: 11, fontWeight: "700", marginTop: 2 },
    typeBadge: { alignSelf: "flex-start", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
    typeBadgeTxt: { fontSize: 10, fontWeight: "800" },
    statusPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9 },
    statusPillTxt: { fontSize: 10, fontWeight: "800" },

    // Info Bar
    infoBar: { flexDirection: "row", alignItems: "center", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 8 },
    infoBarItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
    infoBarDivider: { width: 1, height: 28, backgroundColor: "rgba(148,163,184,0.25)", marginHorizontal: 8 },
    infoBarLbl: { fontSize: 9, fontWeight: "700" },
    infoBarVal: { fontSize: 12, fontWeight: "700" },
    miniAvt: { width: 26, height: 26, borderRadius: 13, justifyContent: "center", alignItems: "center" },
    miniAvtTxt: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" },

    // Result preview
    resultPreview: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 10, padding: 10, marginBottom: 8 },
    resultPreviewTxt: { flex: 1, fontSize: 12, fontWeight: "500", lineHeight: 17 },

    // Meta row
    metaRow: { flexDirection: "row", gap: 14, marginBottom: 10 },
    metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    metaTxt: { fontSize: 10, color: "#94A3B8", fontWeight: "600" },

    // Action buttons
    actionsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, height: 32, borderRadius: 9 },
    actionBtnTxt: { fontSize: 11, fontWeight: "700" },
    actionBtnIcon: { width: 32, height: 32, borderRadius: 9, justifyContent: "center", alignItems: "center" },

    // Overview / Chart
    heroBanner: { borderRadius: 22, padding: 20, marginBottom: 22, flexDirection: "row", alignItems: "center" },
    kpiCard: { borderRadius: 18, borderWidth: 1, padding: 14 },
    kpiIco: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    sectionTitle: { fontSize: 15, fontWeight: "800", marginBottom: 12, letterSpacing: -0.2 },
    chartCard: { borderRadius: 18, borderWidth: 1, padding: 16 },
    docRow: { flexDirection: "row", alignItems: "center", borderRadius: 16, borderWidth: 1, padding: 14 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    modalSheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36, maxHeight: "92%" },
    modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#CBD5E1", alignSelf: "center", marginBottom: 16 },
    detailHero: { borderRadius: 18, padding: 20, alignItems: "center", marginBottom: 12 },
    detailReportIco: { width: 72, height: 72, borderRadius: 20, justifyContent: "center", alignItems: "center" },

    // PDF Thumbnail
    pdfThumb: { borderRadius: 16, borderWidth: 1.5, borderStyle: "dashed", padding: 20, alignItems: "center", marginBottom: 12 },
    pdfThumbLbl: { fontSize: 14, fontWeight: "700", marginTop: 8, textAlign: "center" },
    pdfThumbSub: { fontSize: 11, marginTop: 4 },
    pdfViewBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, marginTop: 12 },

    // Modal detail rows
    dRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, borderBottomWidth: 1, paddingHorizontal: 2 },
    dIco: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    modalActionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 14 },

    // Export sheet
    exportSheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 36 },
    exportSheetTitle: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
    exportOptBtn: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },

    // Toast
    toast: { position: "absolute", bottom: 90, left: 20, right: 20, backgroundColor: "#16A34A", borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 },
    toastTxt: { color: "#FFFFFF", fontSize: 13, fontWeight: "700", flex: 1 },
});
