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

    const C = { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isDark ? colors.cardBorder : "#E2E8F0" };

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
        <SafeAreaView style={[s.root, { backgroundColor: colors.background }]} edges={["top"]}>

            {/* ── HEADER ── */}
            <View style={s.header}>
                <LogoBrand size={22} fontSize={15} style={{ marginBottom: 6 }} />
                <View style={s.headerRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={[s.pageTitle, { color: colors.text }]}>Patients Registry</Text>
                        <Text style={[s.pageSub, { color: colors.textSecondary }]}>{patients.length} patients on record</Text>
                    </View>
                    <TouchableOpacity
                        style={s.addPatBtn}
                        onPress={() => router.push("/admin/add-patient")}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={["#1E3A8A", "#2563EB"]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={s.addPatGrad}
                        >
                            <MaterialCommunityIcons name="plus" size={16} color="#FFFFFF" />
                            <Text style={s.addPatTxt}>Add Patient</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

                {/* ── 1. SUMMARY CARDS ── */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.statsScroll}>
                    {[
                        { label: "Total",      val: stats.total,      icon: "account-group-outline",  color: BLUE,       bg: isDark ? "#1E293B" : "#EFF6FF" },
                        { label: "Active",     val: stats.active,     icon: "check-circle-outline",   color: "#16A34A",  bg: isDark ? "#14532D20" : "#F0FDF4" },
                        { label: "New",        val: stats.newP,       icon: "account-plus-outline",   color: BLUE,       bg: isDark ? "#1E3A8A20" : "#EFF6FF" },
                        { label: "Critical",   val: stats.critical,   icon: "alert-circle-outline",   color: "#DC2626",  bg: isDark ? "#7F1D1D20" : "#FEF2F2" },
                        { label: "Admitted",   val: stats.admitted,   icon: "hospital-building",      color: "#1E40AF",  bg: isDark ? "#1E3A8A20" : "#DBEAFE" },
                        { label: "Discharged", val: stats.discharged, icon: "exit-run",               color: "#64748B",  bg: isDark ? "#33415520" : "#F1F5F9" },
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

                {/* ── 2. SEARCH BAR ── */}
                <View style={s.searchWrap}>
                    <View style={[s.searchBar, C]}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
                        <TextInput
                            style={[s.searchInput, { color: colors.text }]}
                            placeholder="Search by name, ID, phone, or condition..."
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

                {/* ── 3. STATUS FILTER CHIPS ── */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
                    {FILTER_BUTTONS.map(btn => {
                        const isSel = activeFilter === btn.key;
                        return (
                            <TouchableOpacity
                                key={btn.key}
                                onPress={() => handleFilterChange(btn.key as any)}
                                activeOpacity={0.8}
                                style={[
                                    s.filterPill,
                                    isSel ? s.filterPillActive : [C, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }],
                                ]}
                            >
                                <MaterialCommunityIcons
                                    name={btn.icon as any}
                                    size={14}
                                    color={isSel ? "#FFFFFF" : colors.textSecondary}
                                />
                                <Text style={[s.filterPillTxt, { color: isSel ? "#FFFFFF" : colors.textSecondary }]}>
                                    {btn.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* ── 4. WARD CHIPS + SORT ROW ── */}
                <View style={s.subRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, flex: 1 }}>
                        {WARDS.map(w => {
                            const isSel = selectedWard === w;
                            return (
                                <TouchableOpacity
                                    key={w}
                                    onPress={() => setSelectedWard(w)}
                                    activeOpacity={0.75}
                                    style={[
                                        s.wardChip,
                                        isSel ? { backgroundColor: BLUE } : { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
                                    ]}
                                >
                                    <Text style={[s.wardChipTxt, { color: isSel ? "#FFFFFF" : colors.textSecondary }]}>
                                        {w}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <TouchableOpacity
                        style={[s.sortBtn, C]}
                        onPress={() => setShowSortMenu(!showSortMenu)}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="sort-variant" size={15} color={BLUE} />
                        <Text style={[s.sortBtnTxt, { color: colors.text }]} numberOfLines={1}>
                            {SORT_OPTIONS.find(o => o.key === sortBy)?.label}
                        </Text>
                        <MaterialCommunityIcons name="chevron-down" size={14} color="#94A3B8" />
                    </TouchableOpacity>
                </View>

                {/* Sort dropdown */}
                {showSortMenu && (
                    <View style={[s.sortMenu, C, { marginHorizontal: 16 }]}>
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

                {/* ── RESULTS BAR ── */}
                <View style={s.resultsBar}>
                    <Text style={[s.resultsCount, { color: colors.textSecondary }]}>
                        {filtered.length} patient{filtered.length !== 1 ? "s" : ""}
                        {activeFilter !== "All" ? ` · ${activeFilter}` : ""}
                        {selectedWard !== "All Wards" ? ` · ${selectedWard}` : ""}
                    </Text>
                    {(search || activeFilter !== "All" || selectedWard !== "All Wards") && (
                        <TouchableOpacity onPress={resetFilters}>
                            <Text style={s.resetTxt}>Reset</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* ── 5. PATIENT CARDS LIST ── */}
                {isLoading ? (
                    <View style={s.loadingBox}>
                        <ActivityIndicator size="small" color={BLUE} />
                        <Text style={[{ fontSize: 13, marginTop: 8, color: colors.textSecondary }]}>Loading patients...</Text>
                    </View>
                ) : filtered.length === 0 ? (
                    <View style={s.emptyBox}>
                        <View style={s.emptyIcoCircle}>
                            <MaterialCommunityIcons name="account-search-outline" size={44} color="#94A3B8" style={{ opacity: 0.5 }} />
                        </View>
                        <Text style={[s.emptyTitle, { color: colors.text }]}>No Patients Found</Text>
                        <Text style={[s.emptySub, { color: colors.textSecondary }]}>
                            No patient profiles match your search or active filters.
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
                            return (
                                <View
                                    key={p.id}
                                    style={[
                                        s.patCard, C,
                                        p.status === "Critical" && { borderLeftWidth: 3, borderLeftColor: "#DC2626" },
                                    ]}
                                >
                                    {/* ── Card Header ── */}
                                    <View style={s.cardHeader}>
                                        <View style={s.avatarWrap}>
                                            <View style={[s.avatarCircle, { backgroundColor: p.avatarColor }]}>
                                                <Text style={s.avatarTxt}>{p.initials}</Text>
                                            </View>
                                            {p.status === "Critical" && <View style={s.critDot} />}
                                        </View>

                                        <View style={s.cardMeta}>
                                            <Text style={[s.patName, { color: colors.text }]} numberOfLines={1}>
                                                {p.name}
                                            </Text>
                                            <Text style={[s.patId, { color: BLUE }]}>{p.patientId}</Text>
                                            <Text style={[s.patInfo, { color: colors.textSecondary }]}>
                                                {p.age} yrs · {p.gender} · {p.bloodGroup}
                                            </Text>
                                        </View>

                                        <View style={[s.statusPill, { backgroundColor: sc.bg }]}>
                                            <MaterialCommunityIcons name={sc.icon as any} size={11} color={sc.color} />
                                            <Text style={[s.statusPillTxt, { color: sc.color }]}>{sc.label}</Text>
                                        </View>
                                    </View>

                                    {/* ── Condition + Doctor row ── */}
                                    <View style={[s.condRow, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                                        <View style={s.condItem}>
                                            <MaterialCommunityIcons name="stethoscope" size={13} color={BLUE} />
                                            <Text style={[s.condTxt, { color: colors.text }]} numberOfLines={1}>
                                                {p.condition}
                                            </Text>
                                        </View>
                                        <View style={s.condDivider} />
                                        <View style={s.condItem}>
                                            <MaterialCommunityIcons name="doctor" size={13} color="#64748B" />
                                            <Text style={[s.condTxt, { color: colors.textSecondary }]} numberOfLines={1}>
                                                {p.assignedDoctor.replace("Dr. ", "")}
                                            </Text>
                                        </View>
                                        <View style={s.condDivider} />
                                        <View style={s.condItem}>
                                            <MaterialCommunityIcons name="map-marker-outline" size={13} color="#64748B" />
                                            <Text style={[s.condTxt, { color: colors.textSecondary }]}>{p.ward}</Text>
                                        </View>
                                    </View>

                                    {/* ── Visit & Appointment row ── */}
                                    <View style={s.visitRow}>
                                        <View style={s.visitItem}>
                                            <MaterialCommunityIcons name="clock-outline" size={12} color="#64748B" />
                                            <Text style={[s.visitLbl, { color: colors.textSecondary }]}>Last Visit:</Text>
                                            <Text style={[s.visitVal, { color: colors.text }]}>{p.lastVisit}</Text>
                                        </View>
                                        <View style={s.visitItem}>
                                            <MaterialCommunityIcons name="calendar-check-outline" size={12} color={BLUE} />
                                            <Text style={[s.visitLbl, { color: colors.textSecondary }]}>Next Appt:</Text>
                                            <Text style={[s.visitVal, { color: BLUE }]}>{p.nextAppointment}</Text>
                                        </View>
                                    </View>

                                    {/* ── Medical History Preview ── */}
                                    <View style={[s.historyBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                                        <View style={s.historyHeader}>
                                            <MaterialCommunityIcons name="clipboard-text-outline" size={13} color={BLUE} />
                                            <Text style={[s.historyTitle, { color: BLUE }]}>Medical History</Text>
                                        </View>
                                        {p.medicalHistory.map((h, i) => (
                                            <Text key={i} style={[s.historyItem, { color: colors.textSecondary }]}>
                                                • {h}
                                            </Text>
                                        ))}
                                    </View>

                                    {/* ── Recent Report chips ── */}
                                    {p.recentReports.length > 0 && (
                                        <View style={s.reportsRow}>
                                            <Text style={[s.reportsSectionLbl, { color: colors.textSecondary }]}>Recent Reports</Text>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                                                {p.recentReports.map((r, i) => (
                                                    <View key={i} style={[s.reportChip, C]}>
                                                        <MaterialCommunityIcons name="file-document-outline" size={12} color={BLUE} />
                                                        <View>
                                                            <Text style={[s.reportChipTitle, { color: colors.text }]} numberOfLines={1}>
                                                                {r.title}
                                                            </Text>
                                                            <Text style={[s.reportChipResult, { color: colors.textSecondary }]} numberOfLines={1}>
                                                                {r.result}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    )}

                                    {/* ── Action Buttons ── */}
                                    <View style={s.actionsRow}>
                                        <TouchableOpacity
                                            style={[s.actionBtn, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}
                                            onPress={() => { setSelectedPatient(p); setShowDetailModal(true); }}
                                            activeOpacity={0.75}
                                        >
                                            <MaterialCommunityIcons name="eye-outline" size={13} color={BLUE} />
                                            <Text style={[s.actionBtnTxt, { color: BLUE }]}>View</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[s.actionBtn, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}
                                            onPress={() => openEditModal(p)}
                                            activeOpacity={0.75}
                                        >
                                            <MaterialCommunityIcons name="pencil-outline" size={13} color="#64748B" />
                                            <Text style={[s.actionBtnTxt, { color: "#64748B" }]}>Edit</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[s.actionBtn, { backgroundColor: isDark ? "#134E4A22" : "#F0FDF9" }]}
                                            onPress={() => { setRecordsPatient(p); setShowRecordsModal(true); }}
                                            activeOpacity={0.75}
                                        >
                                            <MaterialCommunityIcons name="folder-open-outline" size={13} color="#0D9488" />
                                            <Text style={[s.actionBtnTxt, { color: "#0D9488" }]}>Records</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[s.actionBtnIcon, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}
                                            onPress={() => { setSelectedPatient(p); setShowDetailModal(true); }}
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

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root: { flex: 1 },
    header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
    pageTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
    pageSub: { fontSize: 12, fontWeight: "500", marginTop: 1 },
    addPatBtn: { borderRadius: 12, overflow: "hidden", flexShrink: 0 },
    addPatGrad: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8 },
    addPatTxt: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
    scroll: { paddingBottom: 48 },

    // Stats
    statsScroll: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
    statCard: { borderRadius: 16, borderWidth: 1, padding: 12, minWidth: 90, gap: 2, alignItems: "flex-start" },
    statIco: { width: 30, height: 30, borderRadius: 8, justifyContent: "center", alignItems: "center", marginBottom: 4 },
    statVal: { fontSize: 18, fontWeight: "800" },
    statLbl: { fontSize: 10, fontWeight: "600" },

    // Search
    searchWrap: { paddingHorizontal: 16, marginBottom: 8 },
    searchBar: { flexDirection: "row", alignItems: "center", gap: 10, height: 46, borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 14 },
    searchInput: { flex: 1, fontSize: 13, fontWeight: "500" },

    // Filters
    filterScroll: { paddingHorizontal: 16, gap: 8, marginBottom: 8 },
    filterPill: { flexDirection: "row", alignItems: "center", gap: 5, height: 36, paddingHorizontal: 13, borderRadius: 18, borderWidth: 1 },
    filterPillActive: { backgroundColor: BLUE, borderColor: BLUE, shadowColor: BLUE, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 5, elevation: 3 },
    filterPillTxt: { fontSize: 12, fontWeight: "700" },

    // Sub filters
    subRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 8, marginBottom: 6 },
    wardChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    wardChipTxt: { fontSize: 11, fontWeight: "700" },
    sortBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, flexShrink: 0 },
    sortBtnTxt: { fontSize: 11, fontWeight: "700", maxWidth: 80 },
    sortMenu: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 8 },
    sortMenuRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10 },
    sortMenuTxt: { fontSize: 12, fontWeight: "600" },

    // Results bar
    resultsBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, marginBottom: 8 },
    resultsCount: { fontSize: 12, fontWeight: "600" },
    resetTxt: { fontSize: 12, fontWeight: "700", color: BLUE },

    // Loading / Empty
    loadingBox: { alignItems: "center", paddingVertical: 50 },
    emptyBox: { alignItems: "center", paddingVertical: 50, paddingHorizontal: 24 },
    emptyIcoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center", marginBottom: 12 },
    emptyTitle: { fontSize: 16, fontWeight: "800", marginBottom: 4 },
    emptySub: { fontSize: 12, fontWeight: "500", textAlign: "center", marginBottom: 16 },
    emptyResetBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: BLUE, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12 },
    emptyResetTxt: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },

    // Patient Cards
    cardsList: { paddingHorizontal: 16, gap: 14 },
    patCard: { borderRadius: 20, borderWidth: 1, padding: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 2, overflow: "hidden" },
    cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 10 },
    avatarWrap: { position: "relative" },
    avatarCircle: { width: 46, height: 46, borderRadius: 23, justifyContent: "center", alignItems: "center" },
    avatarTxt: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
    critDot: { position: "absolute", bottom: 2, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: "#DC2626", borderWidth: 2, borderColor: "#FFFFFF" },
    cardMeta: { flex: 1 },
    patName: { fontSize: 15, fontWeight: "800", letterSpacing: -0.2 },
    patId: { fontSize: 11, fontWeight: "700", marginTop: 1 },
    patInfo: { fontSize: 11, fontWeight: "500", marginTop: 2 },
    statusPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9 },
    statusPillTxt: { fontSize: 10, fontWeight: "800" },

    // Condition bar
    condRow: { flexDirection: "row", alignItems: "center", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, marginBottom: 8 },
    condItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 4 },
    condTxt: { fontSize: 11, fontWeight: "600", flexShrink: 1 },
    condDivider: { width: 1, height: 14, backgroundColor: "rgba(148,163,184,0.25)", marginHorizontal: 4 },

    // Visit row
    visitRow: { flexDirection: "row", gap: 16, marginBottom: 10 },
    visitItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    visitLbl: { fontSize: 10, fontWeight: "600" },
    visitVal: { fontSize: 11, fontWeight: "700" },

    // History preview
    historyBox: { borderRadius: 10, padding: 10, marginBottom: 10 },
    historyHeader: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 4 },
    historyTitle: { fontSize: 11, fontWeight: "800" },
    historyItem: { fontSize: 11, fontWeight: "500", lineHeight: 18 },

    // Reports
    reportsRow: { marginBottom: 10 },
    reportsSectionLbl: { fontSize: 10, fontWeight: "700", marginBottom: 5 },
    reportChip: { flexDirection: "row", alignItems: "flex-start", gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1, maxWidth: 200 },
    reportChipTitle: { fontSize: 11, fontWeight: "700" },
    reportChipResult: { fontSize: 10, fontWeight: "500", marginTop: 1 },

    // Action buttons
    actionsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, height: 33, borderRadius: 9 },
    actionBtnTxt: { fontSize: 11, fontWeight: "700" },
    actionBtnIcon: { width: 33, height: 33, borderRadius: 9, justifyContent: "center", alignItems: "center" },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    modalSheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36, maxHeight: "90%" },
    modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#CBD5E1", alignSelf: "center", marginBottom: 16 },
    detailHero: { borderRadius: 18, padding: 20, alignItems: "center", marginBottom: 12 },
    detailAvt: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" },
    sectionLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5, marginBottom: 8, paddingHorizontal: 2 },
    statusBtnRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 },
    statusOptBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
    dRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, borderBottomWidth: 1, paddingHorizontal: 2 },
    dIco: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    primaryModalBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 14 },

    // Toast
    toast: { position: "absolute", bottom: 90, left: 20, right: 20, backgroundColor: "#16A34A", borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 },
    toastTxt: { color: "#FFFFFF", fontSize: 13, fontWeight: "700", flex: 1 },

    // Edit Modal styles
    editLabel: { fontSize: 11, fontWeight: "700", marginBottom: 4 },
    editInput: { height: 42, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, fontSize: 13, fontWeight: "500" },
    genderPill: { flex: 1, height: 36, borderRadius: 8, justifyContent: "center", alignItems: "center" },
    wardPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },

    // Records Modal styles
    recAvatar: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
    recInfoStrip: { borderRadius: 12, padding: 12, gap: 6, marginBottom: 16 },
    recInfoItem: { flexDirection: "row", alignItems: "center", gap: 7 },
    recSectionLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6, marginBottom: 8, paddingHorizontal: 2 },
    recTimeline: { gap: 0, marginBottom: 16 },
    recTimelineRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    recDot: { width: 16, alignItems: "center", paddingTop: 14 },
    recDotInner: { width: 10, height: 10, borderRadius: 5 },
    recLine: { width: 2, flex: 1, backgroundColor: "#E2E8F0", marginTop: 3 },
    recTimelineCard: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 8 },
    recReportCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
    recReportIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    recResultPill: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginTop: 4, alignSelf: "flex-start", maxWidth: "100%" },
    recEmptyBox: { borderRadius: 12, alignItems: "center", justifyContent: "center", padding: 24, marginBottom: 8 },
    recContactBox: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 4 },
    recContactRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
    recContactIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    recNotesBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 4 },
    recVisitCard: { borderRadius: 12, padding: 12, alignItems: "center" },
});
