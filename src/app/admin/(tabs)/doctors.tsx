import LogoBrand from "@/components/LogoBrand";
import { useTheme } from "@/utils/themeManager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
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

type DoctorStatus = "Active" | "On Leave" | "Pending" | "Suspended";

interface Doctor {
    id: string;
    name: string;
    spec: string;
    initials: string;
    patients: number;
    rating: number;
    experience: string;
    status: DoctorStatus;
    phone: string;
    email: string;
    hospital: string;
    joined: string;
    consultFee: string;
    avatarColor?: string;
}

const INITIAL_DOCTORS: Doctor[] = [
    { id: "1", name: "Dr. Sarah Jenkins", spec: "Cardiology", initials: "SJ", patients: 340, rating: 4.9, experience: "8 yrs", status: "Active", phone: "+91 98765 43210", email: "sarah@liferelier.com", hospital: "LR Super Speciality", joined: "Jan 2020", consultFee: "Rs. 800", avatarColor: "#2563EB" },
    { id: "2", name: "Dr. Arjun Mehta", spec: "Neurology", initials: "AM", patients: 210, rating: 4.7, experience: "12 yrs", status: "Active", phone: "+91 87654 32109", email: "arjun@liferelier.com", hospital: "LR Neuro Centre", joined: "Mar 2018", consultFee: "Rs. 1000", avatarColor: "#1D4ED8" },
    { id: "3", name: "Dr. Priya Kapoor", spec: "Dermatology", initials: "PK", patients: 178, rating: 4.8, experience: "6 yrs", status: "On Leave", phone: "+91 76543 21098", email: "priya@liferelier.com", hospital: "LR Skin Clinic", joined: "Jun 2021", consultFee: "Rs. 600", avatarColor: "#475569" },
    { id: "4", name: "Dr. Rohit Sharma", spec: "Orthopedics", initials: "RS", patients: 295, rating: 4.6, experience: "10 yrs", status: "Active", phone: "+91 65432 10987", email: "rohit@liferelier.com", hospital: "LR Ortho Centre", joined: "Aug 2019", consultFee: "Rs. 900", avatarColor: "#1E40AF" },
    { id: "5", name: "Dr. Kavya Reddy", spec: "Pediatrics", initials: "KR", patients: 142, rating: 4.9, experience: "5 yrs", status: "Pending", phone: "+91 54321 09876", email: "kavya@liferelier.com", hospital: "LR Child Care", joined: "Jul 2026", consultFee: "Rs. 500", avatarColor: "#64748B" },
    { id: "6", name: "Dr. Vikram Singh", spec: "General Medicine", initials: "VS", patients: 520, rating: 4.5, experience: "15 yrs", status: "Active", phone: "+91 43210 98765", email: "vikram@liferelier.com", hospital: "LR General Hospital", joined: "Feb 2015", consultFee: "Rs. 400", avatarColor: "#3B82F6" },
    { id: "7", name: "Dr. Meera Nair", spec: "Psychiatry", initials: "MN", patients: 98, rating: 4.8, experience: "9 yrs", status: "Active", phone: "+91 32109 87654", email: "meera@liferelier.com", hospital: "LR Mind Clinic", joined: "Nov 2019", consultFee: "Rs. 1200", avatarColor: "#2563EB" },
    { id: "8", name: "Dr. Rajan Pillai", spec: "ENT", initials: "RP", patients: 187, rating: 4.3, experience: "7 yrs", status: "Suspended", phone: "+91 21098 76543", email: "rajan@liferelier.com", hospital: "LR ENT Centre", joined: "May 2020", consultFee: "Rs. 700", avatarColor: "#94A3B8" },
];

const STATUS_CFG: Record<DoctorStatus, { color: string; bg: string; icon: string }> = {
    "Active": { color: "#16A34A", bg: "#F0FDF4", icon: "check-circle-outline" },
    "On Leave": { color: "#64748B", bg: "#F1F5F9", icon: "calendar-minus" },
    "Pending": { color: "#2563EB", bg: "#EFF6FF", icon: "clock-outline" },
    "Suspended": { color: "#DC2626", bg: "#FEF2F2", icon: "alert-octagon-outline" },
};

const FILTER_BUTTONS = [
    { key: "All", label: "All Doctors", icon: "view-grid-outline" },
    { key: "Active", label: "Active", icon: "check-circle-outline" },
    { key: "Pending", label: "Pending", icon: "clock-outline" },
    { key: "On Leave", label: "On Leave", icon: "calendar-minus" },
    { key: "Suspended", label: "Suspended", icon: "alert-octagon-outline" },
] as const;

const SPECIALTIES = [
    "All Specialties",
    "Cardiology",
    "Neurology",
    "Dermatology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "General Medicine",
    "ENT",
];

const SORT_OPTIONS = [
    { key: "rating", label: "Highest Rated" },
    { key: "patients", label: "Most Patients" },
    { key: "name", label: "Name (A-Z)" },
    { key: "experience", label: "Experience" },
];

export default function AdminDoctorsScreen() {
    const { colors, isDark } = useTheme();

    const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<DoctorStatus | "All">("All");
    const [selectedSpec, setSelectedSpec] = useState("All Specialties");
    const [sortBy, setSortBy] = useState<"rating" | "patients" | "name" | "experience">("rating");
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Modals & Sheets
    const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [toastMsg, setToastMsg] = useState("");

    // Form State
    const [formName, setFormName] = useState("");
    const [formSpec, setFormSpec] = useState("Cardiology");
    const [formEmail, setFormEmail] = useState("");
    const [formPhone, setFormPhone] = useState("");
    const [formHospital, setFormHospital] = useState("");
    const [formFee, setFormFee] = useState("");

    const C = { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isDark ? colors.cardBorder : "#E2E8F0" };

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 3000);
    };

    // Trigger skeleton loading when switching filters
    const handleFilterChange = (key: DoctorStatus | "All") => {
        setIsLoading(true);
        setActiveFilter(key);
        setTimeout(() => setIsLoading(false), 250);
    };

    // Calculate Summary Stats
    const stats = useMemo(() => ({
        total: doctors.length,
        active: doctors.filter(d => d.status === "Active").length,
        pending: doctors.filter(d => d.status === "Pending").length,
        onLeave: doctors.filter(d => d.status === "On Leave").length,
        suspended: doctors.filter(d => d.status === "Suspended").length,
    }), [doctors]);

    // Filter & Sort Logic
    const filteredDoctors = useMemo(() => {
        let list = [...doctors];

        // Search Filter
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (d) =>
                    d.name.toLowerCase().includes(q) ||
                    d.spec.toLowerCase().includes(q) ||
                    d.hospital.toLowerCase().includes(q) ||
                    d.phone.includes(q)
            );
        }

        // Status Filter
        if (activeFilter !== "All") {
            list = list.filter((d) => d.status === activeFilter);
        }

        // Specialty Filter
        if (selectedSpec !== "All Specialties") {
            list = list.filter((d) => d.spec.toLowerCase() === selectedSpec.toLowerCase());
        }

        // Sorting
        list.sort((a, b) => {
            if (sortBy === "rating") return b.rating - a.rating;
            if (sortBy === "patients") return b.patients - a.patients;
            if (sortBy === "name") return a.name.localeCompare(b.name);
            if (sortBy === "experience") return parseInt(b.experience) - parseInt(a.experience);
            return 0;
        });

        return list;
    }, [doctors, search, activeFilter, selectedSpec, sortBy]);

    // Handlers
    const handleAddDoctor = () => {
        if (!formName.trim()) {
            Alert.alert("Required", "Please enter the doctor's full name.");
            return;
        }

        const parts = formName.trim().split(/\s+/);
        const initials = parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : formName.substring(0, 2).toUpperCase();

        const newDoc: Doctor = {
            id: Date.now().toString(),
            name: formName.startsWith("Dr.") ? formName : `Dr. ${formName}`,
            spec: formSpec || "General Medicine",
            initials,
            patients: 0,
            rating: 5.0,
            experience: "1 yr",
            status: "Active",
            phone: formPhone || "+91 98765 00000",
            email: formEmail || `${formName.toLowerCase().replace(/\s+/g, "")}@liferelier.com`,
            hospital: formHospital || "LifeRelier Super Speciality Hospital",
            joined: "Just now",
            consultFee: formFee ? (formFee.includes("Rs.") ? formFee : `Rs. ${formFee}`) : "Rs. 500",
            avatarColor: BLUE,
        };

        setDoctors((prev) => [newDoc, ...prev]);
        setShowAddModal(false);
        setFormName("");
        setFormEmail("");
        setFormPhone("");
        setFormHospital("");
        setFormFee("");
        showToast(`Doctor ${newDoc.name} registered successfully!`);
    };

    const handleApproveDoctor = (id: string) => {
        setDoctors((prev) =>
            prev.map((d) => (d.id === id ? { ...d, status: "Active" as DoctorStatus } : d))
        );
        setShowDetailModal(false);
        showToast("Doctor verification approved!");
    };

    const handleSuspendDoctor = (id: string) => {
        Alert.alert(
            "Suspend Doctor",
            "Are you sure you want to suspend this doctor's platform account?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Suspend",
                    style: "destructive",
                    onPress: () => {
                        setDoctors((prev) =>
                            prev.map((d) => (d.id === id ? { ...d, status: "Suspended" as DoctorStatus } : d))
                        );
                        setShowDetailModal(false);
                        showToast("Doctor account suspended.");
                    },
                },
            ]
        );
    };

    const resetFilters = () => {
        setSearch("");
        setActiveFilter("All");
        setSelectedSpec("All Specialties");
        setSortBy("rating");
    };

    return (
        <SafeAreaView style={[s.root, { backgroundColor: colors.background }]} edges={["top"]}>

            {/* HEADER */}
            <View style={s.topHeader}>
                <LogoBrand size={22} fontSize={15} style={{ marginBottom: 6 }} />
                <View style={s.headerRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={[s.headerTitle, { color: colors.text }]}>Doctors Portal</Text>
                        <Text style={[s.headerSub, { color: colors.textSecondary }]}>{doctors.length} practitioners registered</Text>
                    </View>
                    <TouchableOpacity
                        style={s.addBtn}
                        onPress={() => setShowAddModal(true)}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={["#1E3A8A", "#2563EB"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={s.addBtnGrad}
                        >
                            <MaterialCommunityIcons name="plus" size={16} color="#FFFFFF" />
                            <Text style={s.addBtnTxt}>Add Doctor</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContainer}>

                {/* 1. SUMMARY CARDS GRID */}
                <View style={s.statsGrid}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.statsScroll}>
                        {[
                            { label: "Total", val: stats.total, icon: "doctor", color: BLUE, bg: isDark ? "#1E293B" : "#EFF6FF" },
                            { label: "Active", val: stats.active, icon: "check-circle-outline", color: "#16A34A", bg: isDark ? "#14532D20" : "#F0FDF4" },
                            { label: "Pending", val: stats.pending, icon: "clock-outline", color: BLUE, bg: isDark ? "#1E3A8A20" : "#EFF6FF" },
                            { label: "On Leave", val: stats.onLeave, icon: "calendar-minus", color: "#64748B", bg: isDark ? "#33415520" : "#F1F5F9" },
                            { label: "Suspended", val: stats.suspended, icon: "alert-octagon-outline", color: "#DC2626", bg: isDark ? "#7F1D1D20" : "#FEF2F2" },
                        ].map((st, i) => (
                            <View key={i} style={[s.statCard, C, { backgroundColor: isDark ? colors.card : "#FFFFFF" }]}>
                                <View style={[s.statIcoCircle, { backgroundColor: st.bg }]}>
                                    <MaterialCommunityIcons name={st.icon as any} size={18} color={st.color} />
                                </View>
                                <Text style={[s.statVal, { color: colors.text }]}>{st.val}</Text>
                                <Text style={[s.statLbl, { color: colors.textSecondary }]}>{st.label}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* 2. SEARCH BAR */}
                <View style={s.searchWrap}>
                    <View style={[s.searchBar, C]}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
                        <TextInput
                            style={[s.searchInput, { color: colors.text }]}
                            placeholder="Search by doctor name, specialty, hospital..."
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

                {/* 3. RESPONSIVE STATUS FILTER CHIPS (WITH ICONS) */}
                <View style={s.filterSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterChipScroll}>
                        {FILTER_BUTTONS.map((btn) => {
                            const isSelected = activeFilter === btn.key;
                            return (
                                <TouchableOpacity
                                    key={btn.key}
                                    onPress={() => handleFilterChange(btn.key as any)}
                                    activeOpacity={0.8}
                                    style={[
                                        s.filterPillBtn,
                                        isSelected
                                            ? s.filterPillActive
                                            : [C, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }],
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name={btn.icon as any}
                                        size={15}
                                        color={isSelected ? "#FFFFFF" : colors.textSecondary}
                                    />
                                    <Text
                                        style={[
                                            s.filterPillTxt,
                                            { color: isSelected ? "#FFFFFF" : colors.textSecondary },
                                        ]}
                                    >
                                        {btn.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* 4. SECONDARY FILTERS & SORT ROW */}
                <View style={s.subFilterRow}>
                    {/* Specialty chips */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                        {SPECIALTIES.map((sp) => {
                            const isSel = selectedSpec === sp;
                            return (
                                <TouchableOpacity
                                    key={sp}
                                    onPress={() => setSelectedSpec(sp)}
                                    activeOpacity={0.75}
                                    style={[
                                        s.specChip,
                                        isSel
                                            ? { backgroundColor: BLUE }
                                            : { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
                                    ]}
                                >
                                    <Text style={[s.specChipTxt, { color: isSel ? "#FFFFFF" : colors.textSecondary }]}>
                                        {sp}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Sort Dropdown Selector */}
                    <View style={s.sortBarRow}>
                        <TouchableOpacity
                            style={[s.sortBtn, C]}
                            onPress={() => setShowSortDropdown(!showSortDropdown)}
                            activeOpacity={0.8}
                        >
                            <MaterialCommunityIcons name="sort-variant" size={16} color={BLUE} />
                            <Text style={[s.sortBtnTxt, { color: colors.text }]}>
                                Sort: {SORT_OPTIONS.find((s) => s.key === sortBy)?.label}
                            </Text>
                            <MaterialCommunityIcons name="chevron-down" size={16} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>

                    {/* Sort options inline dropdown menu */}
                    {showSortDropdown && (
                        <View style={[s.sortDropdownMenu, C]}>
                            {SORT_OPTIONS.map((opt) => (
                                <TouchableOpacity
                                    key={opt.key}
                                    style={[s.sortOptRow, sortBy === opt.key && { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}
                                    onPress={() => {
                                        setSortBy(opt.key as any);
                                        setShowSortDropdown(false);
                                    }}
                                >
                                    <Text style={[s.sortOptTxt, { color: sortBy === opt.key ? BLUE : colors.text }]}>
                                        {opt.label}
                                    </Text>
                                    {sortBy === opt.key && (
                                        <MaterialCommunityIcons name="check" size={15} color={BLUE} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* RESULTS HEADER */}
                <View style={s.resultHeaderRow}>
                    <Text style={[s.resultsCountTxt, { color: colors.textSecondary }]}>
                        Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? "s" : ""}
                        {activeFilter !== "All" ? ` • ${activeFilter}` : ""}
                        {selectedSpec !== "All Specialties" ? ` • ${selectedSpec}` : ""}
                    </Text>

                    {(search || activeFilter !== "All" || selectedSpec !== "All Specialties") && (
                        <TouchableOpacity onPress={resetFilters}>
                            <Text style={s.resetFiltersTxt}>Reset Filters</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* 5. DOCTOR LIST / LOADING SKELETONS */}
                {isLoading ? (
                    <View style={s.loadingBox}>
                        <ActivityIndicator size="small" color={BLUE} />
                        <Text style={[s.loadingTxt, { color: colors.textSecondary }]}>Filtering doctors...</Text>
                    </View>
                ) : filteredDoctors.length === 0 ? (
                    /* EMPTY STATE ILLUSTRATION */
                    <View style={s.emptyBox}>
                        <View style={s.emptyIconCircle}>
                            <MaterialCommunityIcons name="doctor" size={48} color="#94A3B8" style={{ opacity: 0.5 }} />
                        </View>
                        <Text style={[s.emptyTitle, { color: colors.text }]}>No Doctors Found</Text>
                        <Text style={[s.emptySub, { color: colors.textSecondary }]}>
                            No doctor profiles matched your search or active filters.
                        </Text>
                        <TouchableOpacity style={s.emptyResetBtn} onPress={resetFilters} activeOpacity={0.85}>
                            <MaterialCommunityIcons name="refresh" size={16} color="#FFFFFF" />
                            <Text style={s.emptyResetBtnTxt}>Clear All Filters</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    /* 6. REDESIGNED DOCTOR CARDS LIST */
                    <View style={s.cardsList}>
                        {filteredDoctors.map((doc) => {
                            const sc = STATUS_CFG[doc.status];
                            return (
                                <View key={doc.id} style={[s.doctorCard, C]}>
                                    {/* Top Card Row */}
                                    <View style={s.docCardHeader}>
                                        <View style={s.avatarWrap}>
                                            <View style={[s.avatarCircle, { backgroundColor: doc.avatarColor || BLUE }]}>
                                                <Text style={s.avatarTxt}>{doc.initials}</Text>
                                            </View>
                                            {doc.status === "Active" && <View style={s.onlineDot} />}
                                        </View>

                                        <View style={s.docMetaCol}>
                                            <View style={s.docTitleRow}>
                                                <Text style={[s.docName, { color: colors.text }]} numberOfLines={1}>
                                                    {doc.name}
                                                </Text>
                                                <MaterialCommunityIcons name="check-decagram" size={16} color={BLUE} />
                                            </View>

                                            <Text style={[s.docSpec, { color: colors.textSecondary }]}>
                                                {doc.spec} • {doc.experience} exp
                                            </Text>

                                            <Text style={[s.docHospital, { color: colors.textSecondary }]} numberOfLines={1}>
                                                📍 {doc.hospital}
                                            </Text>
                                        </View>

                                        <View style={[s.statusBadgePill, { backgroundColor: sc.bg }]}>
                                            <MaterialCommunityIcons name={sc.icon as any} size={11} color={sc.color} />
                                            <Text style={[s.statusBadgeTxt, { color: sc.color }]}>{doc.status}</Text>
                                        </View>
                                    </View>

                                    {/* Middle Stats Bar */}
                                    <View style={[s.docStatsBar, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                                        <View style={s.docStatItem}>
                                            <MaterialCommunityIcons name="star" size={14} color="#F59E0B" />
                                            <Text style={[s.docStatVal, { color: colors.text }]}>{doc.rating}</Text>
                                            <Text style={[s.docStatLbl, { color: colors.textSecondary }]}>Rating</Text>
                                        </View>

                                        <View style={s.docStatVDivider} />

                                        <View style={s.docStatItem}>
                                            <MaterialCommunityIcons name="account-group" size={14} color={BLUE} />
                                            <Text style={[s.docStatVal, { color: colors.text }]}>{doc.patients}</Text>
                                            <Text style={[s.docStatLbl, { color: colors.textSecondary }]}>Patients</Text>
                                        </View>

                                        <View style={s.docStatVDivider} />

                                        <View style={s.docStatItem}>
                                            <MaterialCommunityIcons name="currency-inr" size={14} color={BLUE} />
                                            <Text style={[s.docStatVal, { color: colors.text }]}>{doc.consultFee}</Text>
                                            <Text style={[s.docStatLbl, { color: colors.textSecondary }]}>Fee</Text>
                                        </View>
                                    </View>

                                    {/* 7. MODERN ACTION BUTTONS (View, Edit, Contact, Schedule) */}
                                    <View style={s.cardActionsRow}>
                                        <TouchableOpacity
                                            style={[s.actionBtn, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}
                                            onPress={() => {
                                                setSelectedDoc(doc);
                                                setShowDetailModal(true);
                                            }}
                                            activeOpacity={0.75}
                                        >
                                            <MaterialCommunityIcons name="eye-outline" size={14} color={BLUE} />
                                            <Text style={[s.actionBtnTxt, { color: BLUE }]}>View</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[s.actionBtn, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}
                                            onPress={() => {
                                                setSelectedDoc(doc);
                                                setShowContactModal(true);
                                            }}
                                            activeOpacity={0.75}
                                        >
                                            <MaterialCommunityIcons name="phone-outline" size={14} color={BLUE} />
                                            <Text style={[s.actionBtnTxt, { color: BLUE }]}>Contact</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[s.actionBtn, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}
                                            onPress={() => showToast(`Opening schedule for ${doc.name}`)}
                                            activeOpacity={0.75}
                                        >
                                            <MaterialCommunityIcons name="calendar-clock" size={14} color="#64748B" />
                                            <Text style={[s.actionBtnTxt, { color: "#64748B" }]}>Schedule</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[s.actionBtnIcon, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}
                                            onPress={() => {
                                                setSelectedDoc(doc);
                                                setShowDetailModal(true);
                                            }}
                                            activeOpacity={0.75}
                                        >
                                            <MaterialCommunityIcons name="dots-horizontal" size={16} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

            </ScrollView>

            {/* DOCTOR DETAIL MODAL */}
            <Modal visible={showDetailModal} transparent animationType="slide" onRequestClose={() => setShowDetailModal(false)}>
                <Pressable style={s.modalOverlay} onPress={() => setShowDetailModal(false)}>
                    <Pressable style={[s.modalSheet, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
                        <View style={s.modalHandle} />
                        {selectedDoc && (() => {
                            const sc = STATUS_CFG[selectedDoc.status];
                            return (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {/* Hero */}
                                    <LinearGradient colors={["#1E3A8A", "#2563EB"]} style={s.detailHero}>
                                        <View style={s.detailAvt}>
                                            <Text style={{ color: BLUE, fontSize: 22, fontWeight: "800" }}>{selectedDoc.initials}</Text>
                                        </View>
                                        <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "800", marginTop: 10 }}>{selectedDoc.name}</Text>
                                        <Text style={{ color: "#BFDBFE", fontSize: 13, marginTop: 2 }}>{selectedDoc.spec}</Text>
                                        <View style={[s.statusBadgePill, { backgroundColor: sc.bg, marginTop: 10 }]}>
                                            <MaterialCommunityIcons name={sc.icon as any} size={12} color={sc.color} />
                                            <Text style={[s.statusBadgeTxt, { color: sc.color }]}>{selectedDoc.status}</Text>
                                        </View>
                                    </LinearGradient>

                                    {/* Info grid */}
                                    <View style={{ flexDirection: "row", justifyContent: "space-around", paddingVertical: 14 }}>
                                        {[
                                            { val: String(selectedDoc.patients), lbl: "Patients" },
                                            { val: String(selectedDoc.rating), lbl: "Rating" },
                                            { val: selectedDoc.experience, lbl: "Experience" },
                                        ].map((x, i) => (
                                            <View key={i} style={{ alignItems: "center" }}>
                                                <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>{x.val}</Text>
                                                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>{x.lbl}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {[
                                        { icon: "hospital-building", label: "Hospital", val: selectedDoc.hospital },
                                        { icon: "phone-outline", label: "Phone", val: selectedDoc.phone },
                                        { icon: "email-outline", label: "Email", val: selectedDoc.email },
                                        { icon: "currency-inr", label: "Consultation Fee", val: selectedDoc.consultFee },
                                        { icon: "calendar-outline", label: "Registration Date", val: selectedDoc.joined },
                                    ].map((row) => (
                                        <View key={row.label} style={[s.modalDetailRow, { borderColor: isDark ? "#334155" : "#F1F5F9" }]}>
                                            <View style={[s.modalDetailIco, { backgroundColor: isDark ? "#0F172A" : "#EFF6FF" }]}>
                                                <MaterialCommunityIcons name={row.icon as any} size={16} color={BLUE} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: "600" }}>{row.label}</Text>
                                                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginTop: 1 }}>{row.val}</Text>
                                            </View>
                                        </View>
                                    ))}

                                    <View style={{ gap: 10, paddingVertical: 16 }}>
                                        {selectedDoc.status === "Pending" && (
                                            <TouchableOpacity
                                                style={[s.primaryModalBtn, { backgroundColor: "#ECFDF5" }]}
                                                onPress={() => handleApproveDoctor(selectedDoc.id)}
                                            >
                                                <MaterialCommunityIcons name="check-circle-outline" size={18} color="#10B981" />
                                                <Text style={{ color: "#10B981", fontWeight: "700", fontSize: 14 }}>Approve Doctor Verification</Text>
                                            </TouchableOpacity>
                                        )}
                                        {selectedDoc.status !== "Suspended" && (
                                            <TouchableOpacity
                                                style={[s.primaryModalBtn, { backgroundColor: "#FEF2F2" }]}
                                                onPress={() => handleSuspendDoctor(selectedDoc.id)}
                                            >
                                                <MaterialCommunityIcons name="cancel" size={18} color="#EF4444" />
                                                <Text style={{ color: "#EF4444", fontWeight: "700", fontSize: 14 }}>Suspend Doctor Account</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </ScrollView>
                            );
                        })()}
                    </Pressable>
                </Pressable>
            </Modal>

            {/* CONTACT SHEET MODAL */}
            <Modal visible={showContactModal} transparent animationType="slide" onRequestClose={() => setShowContactModal(false)}>
                <Pressable style={s.modalOverlay} onPress={() => setShowContactModal(false)}>
                    <Pressable style={[s.modalSheet, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
                        <View style={s.modalHandle} />
                        {selectedDoc && (
                            <>
                                <Text style={[s.modalSheetTitle, { color: colors.text }]}>Contact {selectedDoc.name}</Text>
                                <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 18 }}>Select a communication method to reach the doctor.</Text>

                                <TouchableOpacity
                                    style={[s.contactOptionBtn, C]}
                                    onPress={() => {
                                        setShowContactModal(false);
                                        Alert.alert("Calling", `Dialing ${selectedDoc.name} at ${selectedDoc.phone}`);
                                    }}
                                >
                                    <View style={[s.contactIconCircle, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                                        <MaterialCommunityIcons name="phone-outline" size={20} color={BLUE} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>Call Phone</Text>
                                        <Text style={{ fontSize: 12, color: colors.textSecondary }}>{selectedDoc.phone}</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[s.contactOptionBtn, C]}
                                    onPress={() => {
                                        setShowContactModal(false);
                                        Alert.alert("Email", `Opening mail client to ${selectedDoc.email}`);
                                    }}
                                >
                                    <View style={[s.contactIconCircle, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                                        <MaterialCommunityIcons name="email-outline" size={20} color={BLUE} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>Send Email</Text>
                                        <Text style={{ fontSize: 12, color: colors.textSecondary }}>{selectedDoc.email}</Text>
                                    </View>
                                </TouchableOpacity>
                            </>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>

            {/* ADD DOCTOR MODAL */}
            <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
                <Pressable style={s.modalOverlay} onPress={() => setShowAddModal(false)}>
                    <Pressable style={[s.modalSheet, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
                        <View style={s.modalHandle} />
                        <Text style={[s.modalSheetTitle, { color: colors.text }]}>Register New Doctor</Text>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>Enter practitioner details to add them to the system.</Text>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={{ marginBottom: 12 }}>
                                <Text style={s.formLabel}>Full Name</Text>
                                <View style={[s.formInputWrap, C]}>
                                    <TextInput
                                        placeholder="e.g. Dr. Kavya Reddy"
                                        placeholderTextColor="#94A3B8"
                                        value={formName}
                                        onChangeText={setFormName}
                                        style={[s.formInput, { color: colors.text }]}
                                    />
                                </View>
                            </View>

                            <View style={{ marginBottom: 12 }}>
                                <Text style={s.formLabel}>Specialization</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginVertical: 4 }}>
                                    {SPECIALTIES.filter(s => s !== "All Specialties").map((sp) => (
                                        <TouchableOpacity
                                            key={sp}
                                            onPress={() => setFormSpec(sp)}
                                            style={[
                                                s.specChip,
                                                formSpec === sp ? { backgroundColor: BLUE } : { backgroundColor: isDark ? "#0F172A" : "#F1F5F9" },
                                            ]}
                                        >
                                            <Text style={{ fontSize: 11, fontWeight: "700", color: formSpec === sp ? "#FFFFFF" : colors.textSecondary }}>
                                                {sp}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            <View style={{ marginBottom: 12 }}>
                                <Text style={s.formLabel}>Email Address</Text>
                                <View style={[s.formInputWrap, C]}>
                                    <TextInput
                                        placeholder="e.g. doctor@liferelier.com"
                                        placeholderTextColor="#94A3B8"
                                        value={formEmail}
                                        onChangeText={setFormEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        style={[s.formInput, { color: colors.text }]}
                                    />
                                </View>
                            </View>

                            <View style={{ marginBottom: 12 }}>
                                <Text style={s.formLabel}>Phone Number</Text>
                                <View style={[s.formInputWrap, C]}>
                                    <TextInput
                                        placeholder="e.g. +91 98765 43210"
                                        placeholderTextColor="#94A3B8"
                                        value={formPhone}
                                        onChangeText={setFormPhone}
                                        keyboardType="phone-pad"
                                        style={[s.formInput, { color: colors.text }]}
                                    />
                                </View>
                            </View>

                            <View style={{ marginBottom: 12 }}>
                                <Text style={s.formLabel}>Hospital / Clinic</Text>
                                <View style={[s.formInputWrap, C]}>
                                    <TextInput
                                        placeholder="e.g. LifeRelier Super Speciality"
                                        placeholderTextColor="#94A3B8"
                                        value={formHospital}
                                        onChangeText={setFormHospital}
                                        style={[s.formInput, { color: colors.text }]}
                                    />
                                </View>
                            </View>

                            <View style={{ marginBottom: 16 }}>
                                <Text style={s.formLabel}>Consultation Fee</Text>
                                <View style={[s.formInputWrap, C]}>
                                    <TextInput
                                        placeholder="e.g. Rs. 800"
                                        placeholderTextColor="#94A3B8"
                                        value={formFee}
                                        onChangeText={setFormFee}
                                        style={[s.formInput, { color: colors.text }]}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity style={s.submitFormBtn} activeOpacity={0.88} onPress={handleAddDoctor}>
                                <LinearGradient colors={["#1E3A8A", "#2563EB"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.submitGrad}>
                                    <Text style={s.submitGradTxt}>Register Doctor</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* TOAST NOTIFICATION */}
            {toastMsg ? (
                <View style={s.toastBanner}>
                    <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" />
                    <Text style={s.toastTxt}>{toastMsg}</Text>
                </View>
            ) : null}

        </SafeAreaView>
    );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root: { flex: 1 },
    topHeader: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        letterSpacing: -0.3,
    },
    headerSub: {
        fontSize: 12,
        fontWeight: "500",
        marginTop: 1,
    },
    badgePill: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgePillTxt: {
        color: BLUE,
        fontSize: 11,
        fontWeight: "800",
    },
    addBtn: {
        borderRadius: 12,
        overflow: "hidden",
        flexShrink: 0,
    },
    addBtnGrad: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    addBtnTxt: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 12,
    },
    scrollContainer: {
        paddingBottom: 40,
    },

    // Stats Grid
    statsGrid: {
        marginVertical: 6,
    },
    statsScroll: {
        paddingHorizontal: 16,
        gap: 8,
    },
    statCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 12,
        minWidth: 110,
        gap: 2,
    },
    statIcoCircle: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 4,
    },
    statVal: {
        fontSize: 18,
        fontWeight: "800",
    },
    statLbl: {
        fontSize: 10,
        fontWeight: "600",
    },

    // Search Bar
    searchWrap: {
        paddingHorizontal: 16,
        marginVertical: 6,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        height: 46,
        borderRadius: 16,
        borderWidth: 1.5,
        paddingHorizontal: 14,
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        fontWeight: "500",
    },

    // Filter Chips
    filterSection: {
        marginVertical: 4,
    },
    filterChipScroll: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterPillBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        height: 38,
        paddingHorizontal: 14,
        borderRadius: 19,
        borderWidth: 1,
    },
    filterPillActive: {
        backgroundColor: BLUE,
        borderColor: BLUE,
        shadowColor: BLUE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
    },
    filterPillTxt: {
        fontSize: 12,
        fontWeight: "700",
    },

    // Sub Filter Row
    subFilterRow: {
        paddingHorizontal: 16,
        marginTop: 6,
        gap: 8,
    },
    specChip: {
        paddingHorizontal: 11,
        paddingVertical: 5,
        borderRadius: 12,
    },
    specChipTxt: {
        fontSize: 11,
        fontWeight: "700",
    },
    sortBarRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
    },
    sortBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
    },
    sortBtnTxt: {
        fontSize: 11,
        fontWeight: "700",
    },
    sortDropdownMenu: {
        borderRadius: 14,
        borderWidth: 1,
        overflow: "hidden",
        marginTop: 4,
    },
    sortOptRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    sortOptTxt: {
        fontSize: 12,
        fontWeight: "600",
    },

    // Result Header
    resultHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        marginTop: 10,
        marginBottom: 6,
    },
    resultsCountTxt: {
        fontSize: 12,
        fontWeight: "600",
    },
    resetFiltersTxt: {
        fontSize: 12,
        fontWeight: "700",
        color: BLUE,
    },

    // Doctor Cards List
    cardsList: {
        paddingHorizontal: 16,
        gap: 12,
    },
    doctorCard: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 2,
    },
    docCardHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    avatarWrap: {
        position: "relative",
    },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarTxt: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "800",
    },
    onlineDot: {
        position: "absolute",
        bottom: 2,
        right: 2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#10B981",
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    docMetaCol: {
        flex: 1,
    },
    docTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    docName: {
        fontSize: 15,
        fontWeight: "800",
        letterSpacing: -0.2,
    },
    docSpec: {
        fontSize: 12,
        fontWeight: "600",
        marginTop: 2,
    },
    docHospital: {
        fontSize: 11,
        marginTop: 3,
    },
    statusBadgePill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    statusBadgeTxt: {
        fontSize: 10,
        fontWeight: "800",
    },

    // Card Stats Bar
    docStatsBar: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        borderRadius: 12,
        paddingVertical: 8,
        marginVertical: 10,
    },
    docStatItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    docStatVal: {
        fontSize: 12,
        fontWeight: "800",
    },
    docStatLbl: {
        fontSize: 10,
        fontWeight: "500",
    },
    docStatVDivider: {
        width: 1,
        height: 16,
        backgroundColor: "rgba(148,163,184,0.2)",
    },

    // Card Actions Bar
    cardActionsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    actionBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        height: 34,
        borderRadius: 10,
    },
    actionBtnTxt: {
        fontSize: 12,
        fontWeight: "700",
    },
    actionBtnIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },

    // Loading & Empty
    loadingBox: {
        alignItems: "center",
        paddingVertical: 50,
        gap: 8,
    },
    loadingTxt: {
        fontSize: 13,
        fontWeight: "500",
    },
    emptyBox: {
        alignItems: "center",
        paddingVertical: 50,
        paddingHorizontal: 20,
    },
    emptyIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "800",
        marginBottom: 4,
    },
    emptySub: {
        fontSize: 12,
        fontWeight: "500",
        textAlign: "center",
        marginBottom: 16,
    },
    emptyResetBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: BLUE,
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 12,
    },
    emptyResetBtnTxt: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "700",
    },

    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        justifyContent: "flex-end",
    },
    modalSheet: {
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 36,
        maxHeight: "88%",
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#CBD5E1",
        alignSelf: "center",
        marginBottom: 16,
    },
    modalSheetTitle: {
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 4,
    },
    detailHero: {
        borderRadius: 18,
        padding: 20,
        alignItems: "center",
        marginBottom: 10,
    },
    detailAvt: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },
    modalDetailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    modalDetailIco: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    primaryModalBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 48,
        borderRadius: 14,
    },
    contactOptionBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 10,
    },
    contactIconCircle: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },

    // Forms
    formLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: "#64748B",
        marginBottom: 4,
    },
    formInputWrap: {
        height: 46,
        borderRadius: 12,
        borderWidth: 1.5,
        paddingHorizontal: 12,
        justifyContent: "center",
    },
    formInput: {
        fontSize: 13,
    },
    submitFormBtn: {
        borderRadius: 16,
        overflow: "hidden",
        marginTop: 12,
        marginBottom: 20,
    },
    submitGrad: {
        height: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    submitGradTxt: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "800",
    },

    // Toast
    toastBanner: {
        position: "absolute",
        bottom: 90,
        left: 20,
        right: 20,
        backgroundColor: "#10B981",
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    toastTxt: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "700",
        flex: 1,
    },
});
