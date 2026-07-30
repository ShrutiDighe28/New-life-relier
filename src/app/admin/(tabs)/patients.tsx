import LogoBrand from "@/components/LogoBrand";
import { useTheme } from "@/utils/themeManager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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
import { adminPatientStore, Patient, PatientStatus } from "@/utils/adminPatientStore";

const BLUE = "#2563EB";



const INITIAL_PATIENTS: Patient[] = [
    {
        id: "1", name: "Aarav Sharma", patientId: "PT-10234", age: 34, gender: "Male",
        bloodGroup: "O+", phone: "+91 98765 43210", email: "aarav@gmail.com",
        condition: "Hypertension", assignedDoctor: "Dr. Sarah Jenkins",
        status: "Active", lastVisit: "Today", nextAppointment: "Aug 5, 2026",
        initials: "AS", ward: "OPD", avatarColor: "#2563EB",
        medicalHistory: ["Hypertension (2019)", "Mild Asthma (2017)"],
        recentReports: [
            { title: "Blood Pressure Report", date: "Jul 25, 2026", result: "140/90 mmHg" },
            { title: "ECG", date: "Jul 10, 2026", result: "Normal Sinus Rhythm" },
        ],
    },
    {
        id: "2", name: "Priya Patel", patientId: "PT-10456", age: 28, gender: "Female",
        bloodGroup: "A+", phone: "+91 87654 32109", email: "priya@gmail.com",
        condition: "Cardiac Arrhythmia", assignedDoctor: "Dr. Sarah Jenkins",
        status: "Critical", lastVisit: "Today", nextAppointment: "Immediate",
        initials: "PP", ward: "ICU", avatarColor: "#DC2626",
        medicalHistory: ["Cardiac Arrhythmia (2024)", "Anxiety Disorder (2022)"],
        recentReports: [
            { title: "Holter Monitor", date: "Jul 27, 2026", result: "Irregular rhythm detected" },
            { title: "Echocardiogram", date: "Jul 20, 2026", result: "EF 45% — Moderate" },
        ],
    },
    {
        id: "3", name: "Rajesh Verma", patientId: "PT-10789", age: 52, gender: "Male",
        bloodGroup: "B+", phone: "+91 76543 21098", email: "rajesh@gmail.com",
        condition: "Diabetes Type-2", assignedDoctor: "Dr. Vikram Singh",
        status: "Active", lastVisit: "1 week ago", nextAppointment: "Aug 12, 2026",
        initials: "RV", ward: "OPD", avatarColor: "#1D4ED8",
        medicalHistory: ["Diabetes Type-2 (2020)", "Obesity (2019)"],
        recentReports: [
            { title: "HbA1c", date: "Jul 15, 2026", result: "7.8% — Borderline" },
            { title: "Fasting Blood Sugar", date: "Jul 15, 2026", result: "148 mg/dL" },
        ],
    },
    {
        id: "4", name: "Ananya Sen", patientId: "PT-10321", age: 24, gender: "Female",
        bloodGroup: "AB+", phone: "+91 65432 10987", email: "ananya@gmail.com",
        condition: "General Checkup", assignedDoctor: "Dr. Vikram Singh",
        status: "New", lastVisit: "First Visit", nextAppointment: "Aug 2, 2026",
        initials: "AS", ward: "OPD", avatarColor: "#475569",
        medicalHistory: ["No significant history"],
        recentReports: [
            { title: "CBC (Complete Blood Count)", date: "Jul 28, 2026", result: "All values normal" },
        ],
    },
    {
        id: "5", name: "Vikram Malhotra", patientId: "PT-10654", age: 61, gender: "Male",
        bloodGroup: "O-", phone: "+91 54321 09876", email: "vikram.m@gmail.com",
        condition: "Post-op Recovery", assignedDoctor: "Dr. Rohit Sharma",
        status: "Admitted", lastVisit: "Yesterday", nextAppointment: "Aug 8, 2026",
        initials: "VM", ward: "Ward B", avatarColor: "#1E40AF",
        medicalHistory: ["Appendectomy (Jul 2026)", "High Cholesterol (2021)"],
        recentReports: [
            { title: "Post-op Assessment", date: "Jul 26, 2026", result: "Stable — Monitoring" },
            { title: "WBC Count", date: "Jul 26, 2026", result: "9,200 /μL — Slightly elevated" },
        ],
    },
    {
        id: "6", name: "Meera Nair", patientId: "PT-10987", age: 43, gender: "Female",
        bloodGroup: "A-", phone: "+91 43210 98765", email: "meera.nair@gmail.com",
        condition: "Chronic Migraine", assignedDoctor: "Dr. Meera Nair",
        status: "Active", lastVisit: "2 weeks ago", nextAppointment: "Sep 1, 2026",
        initials: "MN", ward: "OPD", avatarColor: "#3B82F6",
        medicalHistory: ["Chronic Migraine (2016)", "Cervical Spondylosis (2020)"],
        recentReports: [
            { title: "MRI Brain", date: "Jun 30, 2026", result: "No structural abnormality" },
        ],
    },
    {
        id: "7", name: "Karan Singh", patientId: "PT-11002", age: 38, gender: "Male",
        bloodGroup: "B-", phone: "+91 32109 87654", email: "karan@gmail.com",
        condition: "Fracture — L. Forearm", assignedDoctor: "Dr. Rohit Sharma",
        status: "Admitted", lastVisit: "3 days ago", nextAppointment: "Aug 10, 2026",
        initials: "KS", ward: "Ortho", avatarColor: "#64748B",
        medicalHistory: ["Fracture L. Forearm (Jul 2026)", "Sports Injury Knee (2023)"],
        recentReports: [
            { title: "X-Ray L. Forearm", date: "Jul 25, 2026", result: "Radius fracture — casting done" },
        ],
    },
    {
        id: "8", name: "Sunita Joshi", patientId: "PT-11034", age: 55, gender: "Female",
        bloodGroup: "O+", phone: "+91 21098 76543", email: "sunita@gmail.com",
        condition: "Kidney Stone", assignedDoctor: "Dr. Arjun Mehta",
        status: "Discharged", lastVisit: "1 month ago", nextAppointment: "Sep 15, 2026",
        initials: "SJ", ward: "Urology", avatarColor: "#94A3B8",
        medicalHistory: ["Kidney Stone — Right (2026)", "UTI (2024)"],
        recentReports: [
            { title: "Ultrasound Abdomen", date: "Jun 28, 2026", result: "Stone passed — Clear" },
            { title: "Urine Routine", date: "Jun 28, 2026", result: "Normal" },
        ],
    },
    {
        id: "9", name: "Divya Kapoor", patientId: "PT-11120", age: 31, gender: "Female",
        bloodGroup: "AB-", phone: "+91 90123 45678", email: "divya@gmail.com",
        condition: "Pregnancy Follow-up", assignedDoctor: "Dr. Priya Kapoor",
        status: "New", lastVisit: "First Visit", nextAppointment: "Aug 3, 2026",
        initials: "DK", ward: "OPD", avatarColor: "#2563EB",
        medicalHistory: ["No significant history"],
        recentReports: [
            { title: "Obstetric Ultrasound", date: "Jul 28, 2026", result: "28 weeks — Normal fetal growth" },
        ],
    },
];

const STATUS_CFG: Record<PatientStatus, { color: string; bg: string; icon: string; label: string }> = {
    "Active":     { color: "#16A34A", bg: "#F0FDF4", icon: "check-circle-outline",   label: "Active" },
    "New":        { color: BLUE,      bg: "#EFF6FF", icon: "account-plus-outline",    label: "New" },
    "Admitted":   { color: "#1E40AF", bg: "#DBEAFE", icon: "hospital-building",       label: "Admitted" },
    "Critical":   { color: "#DC2626", bg: "#FEF2F2", icon: "alert-circle-outline",    label: "Critical" },
    "Discharged": { color: "#64748B", bg: "#F1F5F9", icon: "exit-run",                label: "Discharged" },
};

const FILTER_BUTTONS = [
    { key: "All",        label: "All",        icon: "view-grid-outline" },
    { key: "Active",     label: "Active",     icon: "check-circle-outline" },
    { key: "New",        label: "New",        icon: "account-plus-outline" },
    { key: "Critical",   label: "Critical",   icon: "alert-circle-outline" },
    { key: "Admitted",   label: "Admitted",   icon: "hospital-building" },
    { key: "Discharged", label: "Discharged", icon: "exit-run" },
] as const;

const WARDS = ["All Wards", "OPD", "ICU", "Ward B", "Ortho", "Urology"];

const SORT_OPTIONS = [
    { key: "name",      label: "Name (A-Z)" },
    { key: "age",       label: "Age" },
    { key: "recent",    label: "Recent Visit" },
    { key: "status",    label: "Status" },
];

export default function AdminPatientsScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();

    const [patients, setPatients] = useState<Patient[]>(() => adminPatientStore.getPatients());
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<PatientStatus | "All">("All");
    const [selectedWard, setSelectedWard] = useState("All Wards");
    const [sortBy, setSortBy] = useState<"name" | "age" | "recent" | "status">("recent");
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [toastMsg, setToastMsg] = useState("");

    // Records modal states
    const [recordsPatient, setRecordsPatient] = useState<Patient | null>(null);
    const [showRecordsModal, setShowRecordsModal] = useState(false);

    // Edit modal states
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState("");
    const [editAge, setEditAge] = useState("");
    const [editGender, setEditGender] = useState<"Male" | "Female" | "Other">("Male");
    const [editPhone, setEditPhone] = useState("");
    const [editBloodGroup, setEditBloodGroup] = useState("O+");
    const [editAddress, setEditAddress] = useState("");
    const [editWard, setEditWard] = useState("OPD");
    const [editDoctor, setEditDoctor] = useState("");
    const [editCondition, setEditCondition] = useState("");
    const [editEmergencyContact, setEditEmergencyContact] = useState("");

    useEffect(() => {
        adminPatientStore.init().then(() => {
            setPatients(adminPatientStore.getPatients());
        });
        const unsubscribe = adminPatientStore.subscribe(() => {
            setPatients(adminPatientStore.getPatients());
        });
        return unsubscribe;
    }, []);




    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 3000);
    };

    const handleFilterChange = (key: PatientStatus | "All") => {
        setIsLoading(true);
        setActiveFilter(key);
        setTimeout(() => setIsLoading(false), 250);
    };

    const stats = useMemo(() => ({
        total: patients.length,
        active: patients.filter(p => p.status === "Active").length,
        newP: patients.filter(p => p.status === "New").length,
        critical: patients.filter(p => p.status === "Critical").length,
        admitted: patients.filter(p => p.status === "Admitted").length,
        discharged: patients.filter(p => p.status === "Discharged").length,
    }), [patients]);

    const filtered = useMemo(() => {
        let list = [...patients];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.patientId.toLowerCase().includes(q) ||
                p.condition.toLowerCase().includes(q) ||
                p.phone.includes(q) ||
                (p.email ?? "").toLowerCase().includes(q)
            );
        }
        if (activeFilter !== "All") list = list.filter(p => p.status === activeFilter);
        if (selectedWard !== "All Wards") list = list.filter(p => p.ward === selectedWard);
        list.sort((a, b) => {
            if (sortBy === "name") return a.name.localeCompare(b.name);
            if (sortBy === "age") return b.age - a.age;
            if (sortBy === "status") return a.status.localeCompare(b.status);
            return 0; // "recent" keeps original order
        });
        return list;
    }, [patients, search, activeFilter, selectedWard, sortBy]);

    const handleUpdateStatus = async (id: string, newStatus: PatientStatus) => {
        await adminPatientStore.updateStatus(id, newStatus);
        setSelectedPatient(prev => prev ? { ...prev, status: newStatus } : null);
        showToast(`Status updated to ${newStatus}`);
    };

    const handleRemove = (id: string, name: string) => {
        Alert.alert("Remove Patient", `Permanently remove ${name} from the registry?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Remove", style: "destructive",
                onPress: async () => {
                    await adminPatientStore.removePatient(id);
                    setShowDetailModal(false);
                    showToast(`Patient ${name} removed.`);
                },
            },
        ]);
    };

    const openEditModal = (p: Patient) => {
        setEditingPatient(p);
        setEditName(p.name);
        setEditAge(String(p.age));
        setEditGender((p.gender as any) || "Male");
        setEditPhone(p.phone);
        setEditBloodGroup(p.bloodGroup || "O+");
        setEditAddress(p.address || "");
        setEditWard(p.ward || "OPD");
        setEditDoctor(p.assignedDoctor || "Dr. Sarah Jenkins");
        setEditCondition(p.condition);
        setEditEmergencyContact(p.emergencyContact || "");
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editingPatient) return;
        if (!editName.trim() || !editAge.trim() || !editPhone.trim() || !editCondition.trim()) {
            Alert.alert("Validation Error", "Please fill in all required fields (Name, Age, Phone, Condition).");
            return;
        }

        const updated = await adminPatientStore.updatePatient(editingPatient.id, {
            name: editName.trim(),
            age: parseInt(editAge.trim(), 10) || editingPatient.age,
            gender: editGender,
            phone: editPhone.trim(),
            bloodGroup: editBloodGroup,
            address: editAddress.trim(),
            ward: editWard,
            assignedDoctor: editDoctor,
            condition: editCondition.trim(),
            emergencyContact: editEmergencyContact.trim(),
        });

        if (updated && selectedPatient?.id === editingPatient.id) {
            setSelectedPatient(updated);
        }

        setShowEditModal(false);
        showToast(`Updated ${editName.trim()}'s profile successfully.`);
    };

    const resetFilters = () => {
        setSearch("");
        setActiveFilter("All");
        setSelectedWard("All Wards");
        setSortBy("recent");
    };

    return (
        <SafeAreaView style={[s.root, { backgroundColor: isDark ? colors.background : "#F0F4FF" }]} edges={["top"]}>

            {/* ══════════════════════════════════════════════
                PREMIUM GRADIENT HEADER BANNER
            ══════════════════════════════════════════════ */}
            <LinearGradient
                colors={["#0F2460", "#1E40AF", "#2563EB"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.heroBanner}
            >
                {/* Logo row */}
                <View style={s.heroLogoRow}>
                    <LogoBrand size={20} fontSize={13} style={{ opacity: 0.9 }} lightColor="#FFFFFF" darkColor="#FFFFFF" />
                    <View style={[s.heroBadge, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                        <MaterialCommunityIcons name="shield-check-outline" size={11} color="rgba(255,255,255,0.9)" />
                        <Text style={s.heroBadgeTxt}>Admin Portal</Text>
                    </View>
                </View>

                {/* Title + Add Button row */}
                <View style={s.heroTitleRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={s.heroTitle}>Patients Registry</Text>
                        <Text style={s.heroSub}>Manage and monitor patient records</Text>
                    </View>
                    <TouchableOpacity
                        style={s.addPatBtn}
                        onPress={() => router.push("/admin/add-patient")}
                        activeOpacity={0.88}
                    >
                        <View style={s.addPatInner}>
                            <MaterialCommunityIcons name="account-plus" size={15} color={BLUE} />
                            <Text style={s.addPatTxt}>Add Patient</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Hero metric pills */}
                <View style={s.heroMetricRow}>
                    <View style={s.heroMetricPill}>
                        <MaterialCommunityIcons name="account-group-outline" size={13} color="rgba(255,255,255,0.85)" />
                        <Text style={s.heroMetricTxt}>{stats.total} Total Patients</Text>
                    </View>
                    {stats.critical > 0 && (
                        <View style={[s.heroMetricPill, { backgroundColor: "rgba(220,38,38,0.35)" }]}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={13} color="#FCA5A5" />
                            <Text style={[s.heroMetricTxt, { color: "#FCA5A5" }]}>{stats.critical} Critical</Text>
                        </View>
                    )}
                    <View style={[s.heroMetricPill, { backgroundColor: "rgba(22,163,74,0.25)" }]}>
                        <MaterialCommunityIcons name="check-circle-outline" size={13} color="#86EFAC" />
                        <Text style={[s.heroMetricTxt, { color: "#86EFAC" }]}>{stats.active} Active</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

                {/* ══════════════════════════════════════════════
                    1. PREMIUM STATISTICS CARDS
                ══════════════════════════════════════════════ */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.statsScroll}>
                    {[
                        { label: "Total",      val: stats.total,      icon: "account-group",         color: BLUE,       bg: isDark ? "#1E3A8A30" : "#DBEAFE",  accent: "#2563EB" },
                        { label: "Active",     val: stats.active,     icon: "heart-pulse",            color: "#16A34A",  bg: isDark ? "#14532D30" : "#DCFCE7",  accent: "#16A34A" },
                        { label: "New",        val: stats.newP,       icon: "account-plus",           color: "#7C3AED",  bg: isDark ? "#4C1D9530" : "#EDE9FE",  accent: "#7C3AED" },
                        { label: "Critical",   val: stats.critical,   icon: "alert-circle",           color: "#DC2626",  bg: isDark ? "#7F1D1D30" : "#FEE2E2",  accent: "#DC2626" },
                        { label: "Admitted",   val: stats.admitted,   icon: "hospital-building",      color: "#0891B2",  bg: isDark ? "#0E7490" + "30" : "#CFFAFE",  accent: "#0891B2" },
                        { label: "Discharged", val: stats.discharged, icon: "walk",                   color: "#64748B",  bg: isDark ? "#33415530" : "#E2E8F0",  accent: "#64748B" },
                    ].map((st, i) => (
                        <View key={i} style={[s.statCard, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isDark ? colors.cardBorder : "#E8EFFF" }]}>
                            <View style={[s.statIco, { backgroundColor: st.bg }]}>
                                <MaterialCommunityIcons name={st.icon as any} size={20} color={st.color} />
                            </View>
                            <Text style={[s.statVal, { color: colors.text }]}>{st.val}</Text>
                            <Text style={[s.statLbl, { color: colors.textSecondary }]}>{st.label}</Text>
                            <View style={[s.statAccentBar, { backgroundColor: st.accent }]} />
                        </View>
                    ))}
                </ScrollView>

                {/* ══════════════════════════════════════════════
                    2. SEARCH BAR
                ══════════════════════════════════════════════ */}
                <View style={s.searchWrap}>
                    <View style={[s.searchBar, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isDark ? colors.cardBorder : "#DDE5FF", shadowColor: "#2563EB", shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 }]}>
                        <View style={s.searchIconBg}>
                            <MaterialCommunityIcons name="magnify" size={18} color={BLUE} />
                        </View>
                        <TextInput
                            style={[s.searchInput, { color: colors.text }]}
                            placeholder="Search patients, ID, condition..."
                            placeholderTextColor="#94A3B8"
                            value={search}
                            onChangeText={setSearch}
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => setSearch("")} hitSlop={10}>
                                <View style={s.searchClearBtn}>
                                    <MaterialCommunityIcons name="close" size={12} color="#FFFFFF" />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* ══════════════════════════════════════════════
                    3. STATUS FILTER PILLS
                ══════════════════════════════════════════════ */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
                    {FILTER_BUTTONS.map(btn => {
                        const isSel = activeFilter === btn.key;
                        const cfg = btn.key !== "All" ? STATUS_CFG[btn.key as PatientStatus] : null;
                        return (
                            <TouchableOpacity
                                key={btn.key}
                                onPress={() => handleFilterChange(btn.key as any)}
                                activeOpacity={0.82}
                                style={[s.filterPill, isSel ? s.filterPillActive : { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isDark ? colors.cardBorder : "#E2E8F0" }]}
                            >
                                <MaterialCommunityIcons
                                    name={btn.icon as any}
                                    size={13}
                                    color={isSel ? "#FFFFFF" : (cfg?.color ?? colors.textSecondary)}
                                />
                                <Text style={[s.filterPillTxt, { color: isSel ? "#FFFFFF" : colors.textSecondary }]}>{btn.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* ══════════════════════════════════════════════
                    4. WARD CHIPS + SORT ROW
                ══════════════════════════════════════════════ */}
                <View style={s.subRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, flex: 1 }}>
                        {WARDS.map(w => {
                            const isSel = selectedWard === w;
                            return (
                                <TouchableOpacity
                                    key={w}
                                    onPress={() => setSelectedWard(w)}
                                    activeOpacity={0.75}
                                    style={[s.wardChip, isSel ? { backgroundColor: BLUE, borderColor: BLUE } : { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isDark ? colors.cardBorder : "#DDE5FF" }]}
                                >
                                    <Text style={[s.wardChipTxt, { color: isSel ? "#FFFFFF" : colors.textSecondary }]}>{w}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <TouchableOpacity
                        style={[s.sortBtn, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isDark ? colors.cardBorder : "#DDE5FF" }]}
                        onPress={() => setShowSortMenu(!showSortMenu)}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="sort-variant" size={14} color={BLUE} />
                        <Text style={[s.sortBtnTxt, { color: colors.text }]} numberOfLines={1}>
                            {SORT_OPTIONS.find(o => o.key === sortBy)?.label}
                        </Text>
                        <MaterialCommunityIcons name={showSortMenu ? "chevron-up" : "chevron-down"} size={13} color="#94A3B8" />
                    </TouchableOpacity>
                </View>

                {/* Sort dropdown */}
                {showSortMenu && (
                    <View style={[s.sortMenu, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isDark ? colors.cardBorder : "#E2E8F0", marginHorizontal: 16 }]}>
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

                {/* Results bar */}
                <View style={s.resultsBar}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <View style={s.resultsCountBadge}>
                            <Text style={s.resultsCountNum}>{filtered.length}</Text>
                        </View>
                        <Text style={[s.resultsCount, { color: colors.textSecondary }]}>
                            {filtered.length !== 1 ? "patients" : "patient"}
                            {activeFilter !== "All" ? ` · ${activeFilter}` : ""}
                            {selectedWard !== "All Wards" ? ` · ${selectedWard}` : ""}
                        </Text>
                    </View>
                    {(search || activeFilter !== "All" || selectedWard !== "All Wards") && (
                        <TouchableOpacity style={s.resetBtn} onPress={resetFilters}>
                            <MaterialCommunityIcons name="filter-remove-outline" size={12} color={BLUE} />
                            <Text style={s.resetTxt}>Reset</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* ══════════════════════════════════════════════
                    5. PREMIUM PATIENT CARDS
                ══════════════════════════════════════════════ */}
                {isLoading ? (
                    <View style={s.loadingBox}>
                        <ActivityIndicator size="large" color={BLUE} />
                        <Text style={[s.loadingTxt, { color: colors.textSecondary }]}>Loading patients...</Text>
                    </View>
                ) : filtered.length === 0 ? (
                    <View style={s.emptyBox}>
                        <LinearGradient colors={["#EFF6FF", "#DBEAFE"]} style={s.emptyIcoCircle}>
                            <MaterialCommunityIcons name="account-search-outline" size={48} color={BLUE} style={{ opacity: 0.6 }} />
                        </LinearGradient>
                        <Text style={[s.emptyTitle, { color: colors.text }]}>No Patients Found</Text>
                        <Text style={[s.emptySub, { color: colors.textSecondary }]}>
                            No patient profiles match your current search or filters.
                        </Text>
                        <TouchableOpacity style={s.emptyResetBtn} onPress={resetFilters}>
                            <MaterialCommunityIcons name="refresh" size={15} color="#FFFFFF" />
                            <Text style={s.emptyResetTxt}>Clear All Filters</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={s.cardsList}>
                        {filtered.map(p => {
                            const sc = STATUS_CFG[p.status];
                            const isCrit = p.status === "Critical";
                            return (
                                <View
                                    key={p.id}
                                    style={[
                                        s.patCard,
                                        { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isDark ? colors.cardBorder : "#E8EFFF" },
                                        isCrit && s.patCardCritical,
                                    ]}
                                >
                                    {/* Critical urgency banner */}
                                    {isCrit && (
                                        <View style={s.critBanner}>
                                            <MaterialCommunityIcons name="alert-circle" size={11} color="#FFFFFF" />
                                            <Text style={s.critBannerTxt}>CRITICAL — Immediate Attention Required</Text>
                                        </View>
                                    )}

                                    {/* ── Card Header: Avatar + Identity + Status ── */}
                                    <View style={s.cardHeader}>
                                        <View style={s.avatarWrap}>
                                            <LinearGradient
                                                colors={[p.avatarColor, p.avatarColor + "CC"]}
                                                style={s.avatarCircle}
                                            >
                                                <Text style={s.avatarTxt}>{p.initials}</Text>
                                            </LinearGradient>
                                            {isCrit && <View style={s.critDot} />}
                                        </View>

                                        <View style={s.cardMeta}>
                                            <Text style={[s.patName, { color: colors.text }]} numberOfLines={1}>{p.name}</Text>
                                            <View style={s.patIdBadge}>
                                                <MaterialCommunityIcons name="identifier" size={10} color={BLUE} />
                                                <Text style={[s.patId, { color: BLUE }]}>{p.patientId}</Text>
                                            </View>
                                            {/* Demographics micro-chips */}
                                            <View style={s.demoChipRow}>
                                                <View style={[s.demoChip, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                                                    <MaterialCommunityIcons name="account-outline" size={9} color={BLUE} />
                                                    <Text style={[s.demoChipTxt, { color: BLUE }]}>{p.age} yrs</Text>
                                                </View>
                                                <View style={[s.demoChip, { backgroundColor: isDark ? "#1E293B" : "#F3F4F6" }]}>
                                                    <MaterialCommunityIcons name={p.gender === "Male" ? "gender-male" : p.gender === "Female" ? "gender-female" : "gender-non-binary"} size={9} color="#64748B" />
                                                    <Text style={[s.demoChipTxt, { color: "#64748B" }]}>{p.gender}</Text>
                                                </View>
                                                <View style={[s.demoChip, { backgroundColor: isDark ? "#450A0A30" : "#FEF2F2" }]}>
                                                    <MaterialCommunityIcons name="water-outline" size={9} color="#DC2626" />
                                                    <Text style={[s.demoChipTxt, { color: "#DC2626" }]}>{p.bloodGroup}</Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={[s.statusPill, { backgroundColor: sc.bg }]}>
                                            <MaterialCommunityIcons name={sc.icon as any} size={10} color={sc.color} />
                                            <Text style={[s.statusPillTxt, { color: sc.color }]}>{sc.label}</Text>
                                        </View>
                                    </View>

                                    {/* ── Divider ── */}
                                    <View style={[s.cardDivider, { backgroundColor: isDark ? "#334155" : "#EEF2FF" }]} />

                                    {/* ── Condition / Doctor / Ward strip ── */}
                                    <View style={[s.condRow, { backgroundColor: isDark ? "#0F172A" : "#F8FAFF" }]}>
                                        <View style={s.condItem}>
                                            <MaterialCommunityIcons name="stethoscope" size={12} color={BLUE} />
                                            <Text style={[s.condTxt, { color: colors.text }]} numberOfLines={1}>{p.condition}</Text>
                                        </View>
                                        <View style={s.condDivider} />
                                        <View style={s.condItem}>
                                            <MaterialCommunityIcons name="doctor" size={12} color="#7C3AED" />
                                            <Text style={[s.condTxt, { color: colors.textSecondary }]} numberOfLines={1}>{p.assignedDoctor.replace("Dr. ", "")}</Text>
                                        </View>
                                        <View style={s.condDivider} />
                                        <View style={s.condItem}>
                                            <MaterialCommunityIcons name="hospital-marker" size={12} color="#0891B2" />
                                            <Text style={[s.condTxt, { color: "#0891B2" }]}>{p.ward}</Text>
                                        </View>
                                    </View>

                                    {/* ── Visit schedule mini-cards ── */}
                                    <View style={s.visitCardsRow}>
                                        <View style={[s.visitMiniCard, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                                            <MaterialCommunityIcons name="clock-time-four-outline" size={13} color="#64748B" />
                                            <View>
                                                <Text style={[s.visitMiniLabel, { color: colors.textSecondary }]}>Last Visit</Text>
                                                <Text style={[s.visitMiniVal, { color: colors.text }]}>{p.lastVisit}</Text>
                                            </View>
                                        </View>
                                        <View style={[s.visitMiniCard, { backgroundColor: isDark ? "#1E3A8A20" : "#EFF6FF", borderColor: isDark ? "#1E40AF" : "#BFDBFE" }]}>
                                            <MaterialCommunityIcons name="calendar-check" size={13} color={BLUE} />
                                            <View>
                                                <Text style={[s.visitMiniLabel, { color: colors.textSecondary }]}>Next Appt</Text>
                                                <Text style={[s.visitMiniVal, { color: BLUE }]}>{p.nextAppointment}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* ── Medical History chips ── */}
                                    <View style={s.historySection}>
                                        <View style={s.historySectionHeader}>
                                            <MaterialCommunityIcons name="clipboard-pulse-outline" size={12} color={BLUE} />
                                            <Text style={[s.historySectionTitle, { color: colors.textSecondary }]}>Medical History</Text>
                                        </View>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                                            {p.medicalHistory.map((h, i) => (
                                                <View key={i} style={[s.historyChip, { backgroundColor: i === 0 ? (isDark ? "#1E3A8A30" : "#EFF6FF") : (isDark ? "#1E293B" : "#F8FAFC"), borderColor: i === 0 ? "#BFDBFE" : (isDark ? "#334155" : "#E2E8F0") }]}>
                                                    <MaterialCommunityIcons name={i === 0 ? "heart-pulse" : "circle-small"} size={i === 0 ? 11 : 14} color={i === 0 ? BLUE : "#94A3B8"} />
                                                    <Text style={[s.historyChipTxt, { color: i === 0 ? BLUE : colors.textSecondary }]} numberOfLines={1}>{h}</Text>
                                                </View>
                                            ))}
                                        </ScrollView>
                                    </View>

                                    {/* ── Recent Reports ── */}
                                    {p.recentReports.length > 0 && (
                                        <View style={s.reportsSection}>
                                            <View style={s.reportsSectionHeader}>
                                                <MaterialCommunityIcons name="file-chart-outline" size={12} color="#0891B2" />
                                                <Text style={[s.reportsSectionTitle, { color: colors.textSecondary }]}>Recent Reports</Text>
                                            </View>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                                {p.recentReports.map((r, i) => {
                                                    const isNorm = r.result.toLowerCase().includes("normal") || r.result.toLowerCase().includes("clear");
                                                    const isBad = r.result.toLowerCase().includes("irregular") || r.result.toLowerCase().includes("elevated") || r.result.toLowerCase().includes("critical");
                                                    const rColor = isBad ? "#DC2626" : isNorm ? "#16A34A" : "#D97706";
                                                    const rBg = isBad ? (isDark ? "#7F1D1D20" : "#FEF2F2") : isNorm ? (isDark ? "#14532D20" : "#F0FDF4") : (isDark ? "#78350F20" : "#FFFBEB");
                                                    return (
                                                        <View key={i} style={[s.reportCard, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                                                            <View style={[s.reportCardIcon, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                                                                <MaterialCommunityIcons name="file-chart-outline" size={14} color={BLUE} />
                                                            </View>
                                                            <View style={{ flex: 1 }}>
                                                                <Text style={[s.reportCardTitle, { color: colors.text }]} numberOfLines={1}>{r.title}</Text>
                                                                <View style={[s.reportResultPill, { backgroundColor: rBg }]}>
                                                                    <MaterialCommunityIcons name={isBad ? "alert-circle-outline" : isNorm ? "check-circle-outline" : "information-outline"} size={10} color={rColor} />
                                                                    <Text style={[s.reportResultTxt, { color: rColor }]} numberOfLines={1}>{r.result}</Text>
                                                                </View>
                                                                <Text style={s.reportCardDate}>{r.date}</Text>
                                                            </View>
                                                        </View>
                                                    );
                                                })}
                                            </ScrollView>
                                        </View>
                                    )}

                                    {/* ── Premium Action Row ── */}
                                    <View style={[s.cardDivider, { backgroundColor: isDark ? "#334155" : "#EEF2FF", marginTop: 2 }]} />
                                    <View style={s.actionsRow}>
                                        <TouchableOpacity
                                            style={[s.actionBtn, { backgroundColor: isDark ? "#1E3A8A25" : "#EFF6FF", borderColor: isDark ? "#1E40AF40" : "#BFDBFE" }]}
                                            onPress={() => { setSelectedPatient(p); setShowDetailModal(true); }}
                                            activeOpacity={0.75}
                                        >
                                            <MaterialCommunityIcons name="eye-outline" size={14} color={BLUE} />
                                            <Text style={[s.actionBtnTxt, { color: BLUE }]}>View</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[s.actionBtn, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                                            onPress={() => openEditModal(p)}
                                            activeOpacity={0.75}
                                        >
                                            <MaterialCommunityIcons name="pencil-outline" size={14} color="#7C3AED" />
                                            <Text style={[s.actionBtnTxt, { color: "#7C3AED" }]}>Edit</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[s.actionBtn, { backgroundColor: isDark ? "#134E4A20" : "#F0FDFA", borderColor: isDark ? "#0D948840" : "#99F6E4" }]}
                                            onPress={() => { setRecordsPatient(p); setShowRecordsModal(true); }}
                                            activeOpacity={0.75}
                                        >
                                            <MaterialCommunityIcons name="folder-open-outline" size={14} color="#0D9488" />
                                            <Text style={[s.actionBtnTxt, { color: "#0D9488" }]}>Records</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Bottom spacer */}
                <View style={{ height: 20 }} />

            </ScrollView>

            {/* ── PATIENT DETAIL MODAL ── */}
            <Modal visible={showDetailModal} transparent animationType="slide" onRequestClose={() => setShowDetailModal(false)}>
                <Pressable style={s.modalOverlay} onPress={() => setShowDetailModal(false)}>
                    <Pressable style={[s.modalSheet, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
                        <View style={s.modalHandle} />
                        {selectedPatient && (() => {
                            const sc = STATUS_CFG[selectedPatient.status];
                            return (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {/* Hero */}
                                    <LinearGradient colors={["#1E3A8A", "#2563EB"]} style={s.detailHero}>
                                        <View style={s.detailAvt}>
                                            <Text style={{ color: BLUE, fontSize: 22, fontWeight: "800" }}>{selectedPatient.initials}</Text>
                                        </View>
                                        <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "800", marginTop: 10 }}>{selectedPatient.name}</Text>
                                        <Text style={{ color: "#BFDBFE", fontSize: 13, marginTop: 2 }}>{selectedPatient.patientId}</Text>
                                        <View style={[s.statusPill, { backgroundColor: sc.bg, marginTop: 10 }]}>
                                            <MaterialCommunityIcons name={sc.icon as any} size={11} color={sc.color} />
                                            <Text style={[s.statusPillTxt, { color: sc.color }]}>{sc.label}</Text>
                                        </View>
                                    </LinearGradient>

                                    {/* Stats row */}
                                    <View style={{ flexDirection: "row", justifyContent: "space-around", paddingVertical: 14 }}>
                                        {[
                                            { v: `${selectedPatient.age} yrs`, l: "Age" },
                                            { v: selectedPatient.gender, l: "Gender" },
                                            { v: selectedPatient.bloodGroup, l: "Blood Group" },
                                            { v: selectedPatient.ward, l: "Ward" },
                                        ].map((x, i) => (
                                            <View key={i} style={{ alignItems: "center" }}>
                                                <Text style={{ fontSize: 15, fontWeight: "800", color: colors.text }}>{x.v}</Text>
                                                <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 2 }}>{x.l}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Update Status */}
                                    <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>UPDATE STATUS</Text>
                                    <View style={s.statusBtnRow}>
                                        {(["Active", "New", "Admitted", "Critical", "Discharged"] as PatientStatus[]).map(st => (
                                            <TouchableOpacity
                                                key={st}
                                                style={[
                                                    s.statusOptBtn,
                                                    { backgroundColor: selectedPatient.status === st ? BLUE : isDark ? "#0F172A" : "#F1F5F9" },
                                                ]}
                                                onPress={() => handleUpdateStatus(selectedPatient.id, st)}
                                            >
                                                <Text style={{ fontSize: 11, fontWeight: "700", color: selectedPatient.status === st ? "#FFFFFF" : colors.textSecondary }}>
                                                    {st}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* Detail rows */}
                                    {[
                                        { icon: "stethoscope", label: "Condition", val: selectedPatient.condition },
                                        { icon: "doctor", label: "Attending Doctor", val: selectedPatient.assignedDoctor },
                                        { icon: "phone-outline", label: "Phone", val: selectedPatient.phone },
                                        { icon: "email-outline", label: "Email", val: selectedPatient.email },
                                        { icon: "clock-outline", label: "Last Visit", val: selectedPatient.lastVisit },
                                        { icon: "calendar-check-outline", label: "Next Appointment", val: selectedPatient.nextAppointment },
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

                                    {/* Medical History */}
                                    <Text style={[s.sectionLabel, { color: colors.textSecondary, marginTop: 14 }]}>MEDICAL HISTORY</Text>
                                    <View style={[s.historyBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                                        {selectedPatient.medicalHistory.map((h, i) => (
                                            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 }}>
                                                <MaterialCommunityIcons name="circle-medium" size={14} color={BLUE} />
                                                <Text style={{ fontSize: 13, color: colors.text, fontWeight: "600" }}>{h}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Recent Reports */}
                                    <Text style={[s.sectionLabel, { color: colors.textSecondary, marginTop: 14 }]}>RECENT REPORTS</Text>
                                    {selectedPatient.recentReports.map((r, i) => (
                                        <View key={i} style={[s.dRow, { borderColor: isDark ? "#334155" : "#F1F5F9" }]}>
                                            <View style={[s.dIco, { backgroundColor: isDark ? "#0F172A" : "#EFF6FF" }]}>
                                                <MaterialCommunityIcons name="file-document-outline" size={15} color={BLUE} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text }}>{r.title}</Text>
                                                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 1 }}>{r.result}</Text>
                                                <Text style={{ fontSize: 10, color: "#94A3B8", marginTop: 1 }}>{r.date}</Text>
                                            </View>
                                        </View>
                                    ))}

                                    {/* Actions */}
                                    <View style={{ gap: 10, paddingVertical: 16 }}>
                                        <TouchableOpacity
                                            style={[s.primaryModalBtn, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}
                                            onPress={() => { setShowDetailModal(false); openEditModal(selectedPatient); }}
                                        >
                                            <MaterialCommunityIcons name="pencil-outline" size={17} color={BLUE} />
                                            <Text style={{ color: BLUE, fontWeight: "700", fontSize: 14 }}>Edit Patient Details</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[s.primaryModalBtn, { backgroundColor: "#FEF2F2" }]}
                                            onPress={() => handleRemove(selectedPatient.id, selectedPatient.name)}
                                        >
                                            <MaterialCommunityIcons name="delete-outline" size={17} color="#DC2626" />
                                            <Text style={{ color: "#DC2626", fontWeight: "700", fontSize: 14 }}>Remove Patient Record</Text>
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>
                            );
                        })()}
                    </Pressable>
                </Pressable>
            </Modal>

            {/* ── PATIENT RECORDS MODAL ── */}
            <Modal visible={showRecordsModal} transparent animationType="slide" onRequestClose={() => setShowRecordsModal(false)}>
                <Pressable style={s.modalOverlay} onPress={() => setShowRecordsModal(false)}>
                    <Pressable style={[s.modalSheet, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]} onPress={(e) => e.stopPropagation()}>
                        <View style={s.modalHandle} />
                        {recordsPatient && (() => {
                            const sc = STATUS_CFG[recordsPatient.status];
                            return (
                                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
                                    {/* Header */}
                                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 }}>
                                        <View style={[s.recAvatar, { backgroundColor: recordsPatient.avatarColor }]}>
                                            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "800" }}>{recordsPatient.initials}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 17, fontWeight: "800", color: colors.text }}>{recordsPatient.name}</Text>
                                            <Text style={{ fontSize: 12, color: BLUE, fontWeight: "600", marginTop: 1 }}>{recordsPatient.patientId}</Text>
                                            <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 1 }}>
                                                {recordsPatient.age} yrs · {recordsPatient.gender} · {recordsPatient.bloodGroup}
                                            </Text>
                                        </View>
                                        <View style={[s.statusPill, { backgroundColor: sc.bg }]}>
                                            <MaterialCommunityIcons name={sc.icon as any} size={11} color={sc.color} />
                                            <Text style={[s.statusPillTxt, { color: sc.color }]}>{sc.label}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => setShowRecordsModal(false)} hitSlop={8}>
                                            <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Quick Info Strip */}
                                    <View style={[s.recInfoStrip, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                                        {[
                                            { icon: "stethoscope", val: recordsPatient.condition, color: BLUE },
                                            { icon: "doctor", val: recordsPatient.assignedDoctor.replace("Dr. ", ""), color: "#64748B" },
                                            { icon: "map-marker-outline", val: recordsPatient.ward, color: "#64748B" },
                                        ].map((item, i) => (
                                            <View key={i} style={s.recInfoItem}>
                                                <MaterialCommunityIcons name={item.icon as any} size={13} color={item.color} />
                                                <Text style={{ fontSize: 11, fontWeight: "600", color: colors.text, flex: 1 }} numberOfLines={1}>{item.val}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Medical History Timeline */}
                                    <Text style={[s.recSectionLabel, { color: colors.textSecondary }]}>MEDICAL HISTORY</Text>
                                    <View style={s.recTimeline}>
                                        {recordsPatient.medicalHistory.map((h, i) => (
                                            <View key={i} style={s.recTimelineRow}>
                                                <View style={s.recDot}>
                                                    <View style={[s.recDotInner, { backgroundColor: i === 0 ? BLUE : "#94A3B8" }]} />
                                                    {i < recordsPatient.medicalHistory.length - 1 && <View style={s.recLine} />}
                                                </View>
                                                <View style={[s.recTimelineCard, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                                                    <MaterialCommunityIcons name="clipboard-text-outline" size={13} color={i === 0 ? BLUE : "#94A3B8"} />
                                                    <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text, flex: 1 }}>{h}</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Lab Reports */}
                                    <Text style={[s.recSectionLabel, { color: colors.textSecondary, marginTop: 4 }]}>LAB REPORTS & DIAGNOSTICS</Text>
                                    {recordsPatient.recentReports.length === 0 ? (
                                        <View style={[s.recEmptyBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                                            <MaterialCommunityIcons name="file-document-outline" size={28} color="#94A3B8" />
                                            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 6 }}>No reports on file</Text>
                                        </View>
                                    ) : (
                                        recordsPatient.recentReports.map((r, i) => {
                                            const isNormal = r.result.toLowerCase().includes("normal") || r.result.toLowerCase().includes("clear");
                                            const isCritical = r.result.toLowerCase().includes("critical") || r.result.toLowerCase().includes("irregular") || r.result.toLowerCase().includes("elevated");
                                            const resultColor = isCritical ? "#DC2626" : isNormal ? "#16A34A" : "#D97706";
                                            const resultBg = isCritical ? (isDark ? "#7F1D1D20" : "#FEF2F2") : isNormal ? (isDark ? "#14532D20" : "#F0FDF4") : (isDark ? "#78350F20" : "#FFFBEB");
                                            return (
                                                <View key={i} style={[s.recReportCard, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                                                    <View style={[s.recReportIcon, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                                                        <MaterialCommunityIcons name="file-chart-outline" size={18} color={BLUE} />
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>{r.title}</Text>
                                                        <View style={[s.recResultPill, { backgroundColor: resultBg }]}>
                                                            <MaterialCommunityIcons
                                                                name={isCritical ? "alert-circle-outline" : isNormal ? "check-circle-outline" : "information-outline"}
                                                                size={11} color={resultColor}
                                                            />
                                                            <Text style={{ fontSize: 11, fontWeight: "700", color: resultColor, flex: 1 }} numberOfLines={1}>{r.result}</Text>
                                                        </View>
                                                        <Text style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>{r.date}</Text>
                                                    </View>
                                                </View>
                                            );
                                        })
                                    )}

                                    {/* Contact & Emergency Info */}
                                    <Text style={[s.recSectionLabel, { color: colors.textSecondary, marginTop: 14 }]}>CONTACT INFORMATION</Text>
                                    <View style={[s.recContactBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                                        {[
                                            { icon: "phone-outline", label: "Mobile", val: recordsPatient.phone, color: "#16A34A" },
                                            { icon: "email-outline", label: "Email", val: recordsPatient.email || "—", color: BLUE },
                                            { icon: "map-marker-outline", label: "Address", val: (recordsPatient as any).address || "—", color: "#64748B" },
                                            { icon: "ambulance", label: "Emergency Contact", val: recordsPatient.emergencyContact || "—", color: "#DC2626" },
                                        ].map((item, i) => (
                                            <View key={i} style={[s.recContactRow, i > 0 && { borderTopWidth: 1, borderTopColor: isDark ? "#334155" : "#E2E8F0" }]}>
                                                <View style={[s.recContactIcon, { backgroundColor: `${item.color}18` }]}>
                                                    <MaterialCommunityIcons name={item.icon as any} size={14} color={item.color} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: "600" }}>{item.label}</Text>
                                                    <Text style={{ fontSize: 13, color: colors.text, fontWeight: "700", marginTop: 1 }}>{item.val}</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Clinical Notes */}
                                    {(recordsPatient as any).notes && (
                                        <>
                                            <Text style={[s.recSectionLabel, { color: colors.textSecondary, marginTop: 14 }]}>CLINICAL NOTES</Text>
                                            <View style={[s.recNotesBox, { backgroundColor: isDark ? "#0F172A" : "#FFFBEB", borderColor: isDark ? "#334155" : "#FCD34D" }]}>
                                                <MaterialCommunityIcons name="note-text-outline" size={15} color="#D97706" />
                                                <Text style={{ fontSize: 13, color: colors.text, fontWeight: "500", flex: 1, lineHeight: 20 }}>{(recordsPatient as any).notes}</Text>
                                            </View>
                                        </>
                                    )}

                                    {/* Visit Timeline */}
                                    <Text style={[s.recSectionLabel, { color: colors.textSecondary, marginTop: 14 }]}>VISIT SCHEDULE</Text>
                                    <View style={{ flexDirection: "row", gap: 10 }}>
                                        <View style={[s.recVisitCard, { backgroundColor: isDark ? "#0F172A" : "#EFF6FF", flex: 1 }]}>
                                            <MaterialCommunityIcons name="clock-outline" size={18} color={BLUE} />
                                            <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: "600", marginTop: 4 }}>LAST VISIT</Text>
                                            <Text style={{ fontSize: 13, color: colors.text, fontWeight: "700", marginTop: 2 }}>{recordsPatient.lastVisit}</Text>
                                        </View>
                                        <View style={[s.recVisitCard, { backgroundColor: isDark ? "#0F172A" : "#F0FDF4", flex: 1 }]}>
                                            <MaterialCommunityIcons name="calendar-check-outline" size={18} color="#16A34A" />
                                            <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: "600", marginTop: 4 }}>NEXT APPOINTMENT</Text>
                                            <Text style={{ fontSize: 13, color: "#16A34A", fontWeight: "700", marginTop: 2 }}>{recordsPatient.nextAppointment}</Text>
                                        </View>
                                    </View>

                                    {/* Action Button */}
                                    <TouchableOpacity
                                        style={[s.primaryModalBtn, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF", marginTop: 16 }]}
                                        onPress={() => { setShowRecordsModal(false); openEditModal(recordsPatient); }}
                                    >
                                        <MaterialCommunityIcons name="pencil-outline" size={17} color={BLUE} />
                                        <Text style={{ color: BLUE, fontWeight: "700", fontSize: 14 }}>Edit Patient Details</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            );
                        })()}
                    </Pressable>
                </Pressable>
            </Modal>

            {/* ── EDIT PATIENT MODAL ── */}
            <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
                <Pressable style={s.modalOverlay} onPress={() => setShowEditModal(false)}>
                    <Pressable style={[s.modalSheet, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]} onPress={(e) => e.stopPropagation()}>
                        <View style={s.modalHandle} />
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                            <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>Edit Patient Profile</Text>
                            <TouchableOpacity onPress={() => setShowEditModal(false)} hitSlop={8}>
                                <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 20 }}>
                            {/* Patient Name */}
                            <View>
                                <Text style={s.editLabel}>Patient Name *</Text>
                                <TextInput
                                    style={[s.editInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: colors.text, borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                                    value={editName}
                                    onChangeText={setEditName}
                                />
                            </View>

                            {/* Age & Gender */}
                            <View style={{ flexDirection: "row", gap: 10 }}>
                                <View style={{ flex: 0.4 }}>
                                    <Text style={s.editLabel}>Age *</Text>
                                    <TextInput
                                        style={[s.editInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: colors.text, borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                                        keyboardType="numeric"
                                        value={editAge}
                                        onChangeText={setEditAge}
                                    />
                                </View>
                                <View style={{ flex: 0.6 }}>
                                    <Text style={s.editLabel}>Gender</Text>
                                    <View style={{ flexDirection: "row", gap: 4, marginTop: 2 }}>
                                        {(["Male", "Female", "Other"] as const).map((g) => (
                                            <TouchableOpacity
                                                key={g}
                                                style={[
                                                    s.genderPill,
                                                    { backgroundColor: editGender === g ? BLUE : isDark ? "#0F172A" : "#F1F5F9" },
                                                ]}
                                                onPress={() => setEditGender(g)}
                                            >
                                                <Text style={{ fontSize: 11, fontWeight: "700", color: editGender === g ? "#FFF" : colors.textSecondary }}>{g}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>

                            {/* Phone */}
                            <View>
                                <Text style={s.editLabel}>Mobile Number *</Text>
                                <TextInput
                                    style={[s.editInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: colors.text, borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                                    keyboardType="phone-pad"
                                    value={editPhone}
                                    onChangeText={setEditPhone}
                                />
                            </View>

                            {/* Condition */}
                            <View>
                                <Text style={s.editLabel}>Medical Condition *</Text>
                                <TextInput
                                    style={[s.editInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: colors.text, borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                                    value={editCondition}
                                    onChangeText={setEditCondition}
                                />
                            </View>

                            {/* Ward */}
                            <View>
                                <Text style={s.editLabel}>Department / Ward</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                                    {["OPD", "ICU", "Ward B", "Ortho", "Urology", "Emergency"].map((w) => (
                                        <TouchableOpacity
                                            key={w}
                                            style={[
                                                s.wardPill,
                                                { backgroundColor: editWard === w ? BLUE : isDark ? "#0F172A" : "#F1F5F9" },
                                            ]}
                                            onPress={() => setEditWard(w)}
                                        >
                                            <Text style={{ fontSize: 11, fontWeight: "700", color: editWard === w ? "#FFF" : colors.textSecondary }}>{w}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Emergency Contact */}
                            <View>
                                <Text style={s.editLabel}>Emergency Contact Phone</Text>
                                <TextInput
                                    style={[s.editInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: colors.text, borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                                    keyboardType="phone-pad"
                                    value={editEmergencyContact}
                                    onChangeText={setEditEmergencyContact}
                                />
                            </View>

                            {/* Address */}
                            <View>
                                <Text style={s.editLabel}>Residential Address</Text>
                                <TextInput
                                    style={[s.editInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: colors.text, borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                                    value={editAddress}
                                    onChangeText={setEditAddress}
                                />
                            </View>

                            {/* Action Row */}
                            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                                <TouchableOpacity
                                    style={[s.primaryModalBtn, { flex: 1, backgroundColor: isDark ? "#0F172A" : "#F1F5F9" }]}
                                    onPress={() => setShowEditModal(false)}
                                >
                                    <Text style={{ color: colors.textSecondary, fontWeight: "700" }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[s.primaryModalBtn, { flex: 1, backgroundColor: BLUE }]}
                                    onPress={handleSaveEdit}
                                >
                                    <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Save Changes</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </Pressable>
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

// ─── PREMIUM STYLES ──────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root: { flex: 1 },

    // ── Hero Banner ─────────────────────────────────────────────────────────
    heroBanner: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 22 },
    heroLogoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
    heroBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    heroBadgeTxt: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.9)", letterSpacing: 0.3 },
    heroTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 },
    heroTitle: { fontSize: 24, fontWeight: "800", color: "#FFFFFF", letterSpacing: -0.5 },
    heroSub: { fontSize: 12, fontWeight: "500", color: "rgba(255,255,255,0.7)", marginTop: 3 },
    addPatBtn: { flexShrink: 0 },
    addPatInner: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFFFFF", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
    addPatTxt: { color: BLUE, fontWeight: "800", fontSize: 13 },
    heroMetricRow: { flexDirection: "row", gap: 8 },
    heroMetricPill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    heroMetricTxt: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.9)" },

    scroll: { paddingBottom: 48 },

    // ── Stat Cards ──────────────────────────────────────────────────────────
    statsScroll: { paddingHorizontal: 16, gap: 10, paddingVertical: 12 },
    statCard: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10, minWidth: 96, alignItems: "flex-start", shadowColor: "#2563EB", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, overflow: "hidden" },
    statIco: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center", marginBottom: 8 },
    statVal: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
    statLbl: { fontSize: 10, fontWeight: "700", letterSpacing: 0.2, marginTop: 1, marginBottom: 8 },
    statAccentBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 3, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, opacity: 0.6 },

    // ── Search ──────────────────────────────────────────────────────────────
    searchWrap: { paddingHorizontal: 16, marginBottom: 10 },
    searchBar: { flexDirection: "row", alignItems: "center", gap: 10, height: 52, borderRadius: 18, borderWidth: 1.5, paddingHorizontal: 10 },
    searchIconBg: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" },
    searchInput: { flex: 1, fontSize: 14, fontWeight: "500" },
    searchClearBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#94A3B8", justifyContent: "center", alignItems: "center" },

    // ── Filter Chips ────────────────────────────────────────────────────────
    filterScroll: { paddingHorizontal: 16, gap: 8, marginBottom: 10 },
    filterPill: { flexDirection: "row", alignItems: "center", gap: 5, height: 36, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
    filterPillActive: { backgroundColor: BLUE, borderColor: BLUE, shadowColor: BLUE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    filterPillTxt: { fontSize: 12, fontWeight: "700" },

    // ── Ward + Sort ─────────────────────────────────────────────────────────
    subRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 8, marginBottom: 8 },
    wardChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
    wardChipTxt: { fontSize: 11, fontWeight: "700" },
    sortBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12, borderWidth: 1, flexShrink: 0 },
    sortBtnTxt: { fontSize: 11, fontWeight: "700", maxWidth: 80 },
    sortMenu: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
    sortMenuRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
    sortMenuTxt: { fontSize: 13, fontWeight: "600" },

    // ── Results Bar ─────────────────────────────────────────────────────────
    resultsBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, marginBottom: 10 },
    resultsCountBadge: { backgroundColor: BLUE, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
    resultsCountNum: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
    resultsCount: { fontSize: 12, fontWeight: "600" },
    resetBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#EFF6FF", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    resetTxt: { fontSize: 12, fontWeight: "700", color: BLUE },

    // ── Loading / Empty ─────────────────────────────────────────────────────
    loadingBox: { alignItems: "center", paddingVertical: 60 },
    loadingTxt: { fontSize: 13, fontWeight: "600", marginTop: 12 },
    emptyBox: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 32 },
    emptyIcoCircle: { width: 88, height: 88, borderRadius: 44, justifyContent: "center", alignItems: "center", marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
    emptySub: { fontSize: 13, fontWeight: "500", textAlign: "center", lineHeight: 20, marginBottom: 20 },
    emptyResetBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: BLUE, paddingHorizontal: 20, paddingVertical: 11, borderRadius: 14, shadowColor: BLUE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    emptyResetTxt: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },

    // ── Patient Cards ───────────────────────────────────────────────────────
    cardsList: { paddingHorizontal: 16, gap: 14 },
    patCard: { borderRadius: 20, borderWidth: 1, paddingTop: 0, paddingHorizontal: 0, paddingBottom: 0, shadowColor: "#2563EB", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3, overflow: "hidden" },
    patCardCritical: { borderColor: "#DC2626", shadowColor: "#DC2626", shadowOpacity: 0.12 },

    // Critical banner
    critBanner: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#DC2626", paddingHorizontal: 14, paddingVertical: 6 },
    critBannerTxt: { fontSize: 10, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.3, flex: 1 },

    // Card header
    cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16, paddingBottom: 12 },
    avatarWrap: { position: "relative" },
    avatarCircle: { width: 54, height: 54, borderRadius: 27, justifyContent: "center", alignItems: "center" },
    avatarTxt: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
    critDot: { position: "absolute", bottom: 1, right: 1, width: 14, height: 14, borderRadius: 7, backgroundColor: "#DC2626", borderWidth: 2.5, borderColor: "#FFFFFF" },
    cardMeta: { flex: 1 },
    patName: { fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },
    patIdBadge: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
    patId: { fontSize: 11, fontWeight: "700" },
    demoChipRow: { flexDirection: "row", gap: 5, marginTop: 5 },
    demoChip: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
    demoChipTxt: { fontSize: 10, fontWeight: "700" },
    statusPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10 },
    statusPillTxt: { fontSize: 10, fontWeight: "800" },

    // Card divider
    cardDivider: { height: 1, marginHorizontal: 16, marginBottom: 10 },

    // Condition strip
    condRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10 },
    condItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 4 },
    condTxt: { fontSize: 11, fontWeight: "600", flexShrink: 1 },
    condDivider: { width: 1, height: 16, backgroundColor: "rgba(148,163,184,0.3)", marginHorizontal: 6 },

    // Visit mini-cards
    visitCardsRow: { flexDirection: "row", gap: 8, marginHorizontal: 16, marginBottom: 12 },
    visitMiniCard: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
    visitMiniLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 0.3, textTransform: "uppercase" },
    visitMiniVal: { fontSize: 12, fontWeight: "800", marginTop: 1 },

    // Medical History chips
    historySection: { marginHorizontal: 16, marginBottom: 12 },
    historySectionHeader: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 7 },
    historySectionTitle: { fontSize: 10, fontWeight: "800", letterSpacing: 0.4 },
    historyChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
    historyChipTxt: { fontSize: 11, fontWeight: "600", maxWidth: 160 },

    // Reports section
    reportsSection: { marginHorizontal: 16, marginBottom: 12 },
    reportsSectionHeader: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 7 },
    reportsSectionTitle: { fontSize: 10, fontWeight: "800", letterSpacing: 0.4 },
    reportCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, borderWidth: 1, padding: 10, width: 195 },
    reportCardIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    reportCardTitle: { fontSize: 12, fontWeight: "700" },
    reportResultPill: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 7, paddingHorizontal: 6, paddingVertical: 3, marginTop: 4, alignSelf: "flex-start" },
    reportResultTxt: { fontSize: 10, fontWeight: "700" },
    reportCardDate: { fontSize: 9, color: "#94A3B8", marginTop: 3 },

    // Action buttons
    actionsRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, paddingTop: 8 },
    actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, height: 38, borderRadius: 11, borderWidth: 1 },
    actionBtnTxt: { fontSize: 12, fontWeight: "700" },

    // ── Modals ──────────────────────────────────────────────────────────────
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36, maxHeight: "90%" },
    modalHandle: { width: 44, height: 4, borderRadius: 2, backgroundColor: "#CBD5E1", alignSelf: "center", marginBottom: 18 },
    detailHero: { borderRadius: 20, padding: 22, alignItems: "center", marginBottom: 14 },
    detailAvt: { width: 68, height: 68, borderRadius: 34, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" },
    sectionLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6, marginBottom: 8, paddingHorizontal: 2 },
    statusBtnRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 },
    statusOptBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 11 },
    dRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, paddingHorizontal: 2 },
    dIco: { width: 36, height: 36, borderRadius: 11, justifyContent: "center", alignItems: "center" },
    primaryModalBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 15 },

    // Toast
    toast: { position: "absolute", bottom: 90, left: 20, right: 20, backgroundColor: "#16A34A", borderRadius: 16, paddingVertical: 13, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", gap: 10, shadowColor: "#16A34A", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 8 },
    toastTxt: { color: "#FFFFFF", fontSize: 13, fontWeight: "700", flex: 1 },

    // Edit Modal
    editLabel: { fontSize: 12, fontWeight: "700", marginBottom: 5 },
    editInput: { height: 46, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 14, fontWeight: "500" },
    genderPill: { flex: 1, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    wardPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 11, borderWidth: 1 },

    // Records Modal
    recAvatar: { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center" },
    recInfoStrip: { borderRadius: 14, padding: 13, gap: 7, marginBottom: 16 },
    recInfoItem: { flexDirection: "row", alignItems: "center", gap: 8 },
    recSectionLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.7, marginBottom: 9, paddingHorizontal: 2 },
    recTimeline: { gap: 0, marginBottom: 16 },
    recTimelineRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    recDot: { width: 16, alignItems: "center", paddingTop: 14 },
    recDotInner: { width: 10, height: 10, borderRadius: 5 },
    recLine: { width: 2, flex: 1, backgroundColor: "#E2E8F0", marginTop: 3 },
    recTimelineCard: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 11, borderWidth: 1, padding: 10, marginBottom: 8 },
    recReportCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, borderRadius: 14, borderWidth: 1, padding: 13, marginBottom: 9 },
    recReportIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    recResultPill: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginTop: 4, alignSelf: "flex-start", maxWidth: "100%" },
    recEmptyBox: { borderRadius: 14, alignItems: "center", justifyContent: "center", padding: 26, marginBottom: 9 },
    recContactBox: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 5 },
    recContactRow: { flexDirection: "row", alignItems: "center", gap: 13, padding: 13 },
    recContactIcon: { width: 36, height: 36, borderRadius: 11, justifyContent: "center", alignItems: "center" },
    recNotesBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 14, borderWidth: 1, padding: 13, marginBottom: 5 },
    recVisitCard: { borderRadius: 14, padding: 13, alignItems: "center" },
});
