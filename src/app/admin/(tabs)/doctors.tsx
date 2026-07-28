import React, { useState, useMemo } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    TextInput, Modal, Pressable, FlatList, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/utils/themeManager";
import LogoBrand from "@/components/LogoBrand";

const BLUE = "#2563EB";

type DoctorStatus = "Active" | "On Leave" | "Pending" | "Suspended";

interface Doctor {
    id: string; name: string; spec: string; initials: string;
    patients: number; rating: number; experience: string;
    status: DoctorStatus; phone: string; email: string;
    hospital: string; joined: string; consultFee: string;
}

const INITIAL_DOCTORS: Doctor[] = [
    { id: "1", name: "Dr. Sarah Jenkins", spec: "Cardiologist", initials: "SJ", patients: 340, rating: 4.9, experience: "8 yrs", status: "Active", phone: "+91 98765 43210", email: "sarah@liferelier.com", hospital: "LR Super Speciality", joined: "Jan 2020", consultFee: "Rs. 800" },
    { id: "2", name: "Dr. Arjun Mehta", spec: "Neurologist", initials: "AM", patients: 210, rating: 4.7, experience: "12 yrs", status: "Active", phone: "+91 87654 32109", email: "arjun@liferelier.com", hospital: "LR Neuro Centre", joined: "Mar 2018", consultFee: "Rs. 1000" },
    { id: "3", name: "Dr. Priya Kapoor", spec: "Dermatologist", initials: "PK", patients: 178, rating: 4.8, experience: "6 yrs", status: "On Leave", phone: "+91 76543 21098", email: "priya@liferelier.com", hospital: "LR Skin Clinic", joined: "Jun 2021", consultFee: "Rs. 600" },
    { id: "4", name: "Dr. Rohit Sharma", spec: "Orthopedic", initials: "RS", patients: 295, rating: 4.6, experience: "10 yrs", status: "Active", phone: "+91 65432 10987", email: "rohit@liferelier.com", hospital: "LR Ortho Centre", joined: "Aug 2019", consultFee: "Rs. 900" },
    { id: "5", name: "Dr. Kavya Reddy", spec: "Pediatrician", initials: "KR", patients: 142, rating: 4.9, experience: "5 yrs", status: "Pending", phone: "+91 54321 09876", email: "kavya@liferelier.com", hospital: "LR Child Care", joined: "Jul 2026", consultFee: "Rs. 500" },
    { id: "6", name: "Dr. Vikram Singh", spec: "General Physician", initials: "VS", patients: 520, rating: 4.5, experience: "15 yrs", status: "Active", phone: "+91 43210 98765", email: "vikram@liferelier.com", hospital: "LR General Hospital", joined: "Feb 2015", consultFee: "Rs. 400" },
    { id: "7", name: "Dr. Meera Nair", spec: "Psychiatrist", initials: "MN", patients: 98, rating: 4.8, experience: "9 yrs", status: "Active", phone: "+91 32109 87654", email: "meera@liferelier.com", hospital: "LR Mind Clinic", joined: "Nov 2019", consultFee: "Rs. 1200" },
    { id: "8", name: "Dr. Rajan Pillai", spec: "ENT Specialist", initials: "RP", patients: 187, rating: 4.3, experience: "7 yrs", status: "Suspended", phone: "+91 21098 76543", email: "rajan@liferelier.com", hospital: "LR ENT Centre", joined: "May 2020", consultFee: "Rs. 700" },
];

const STATUS_CFG: Record<DoctorStatus, { color: string; bg: string }> = {
    "Active": { color: "#10B981", bg: "#ECFDF5" },
    "On Leave": { color: "#D97706", bg: "#FFFBEB" },
    "Pending": { color: "#2563EB", bg: "#EFF6FF" },
    "Suspended": { color: "#EF4444", bg: "#FEF2F2" },
};

const FILTERS: Array<DoctorStatus | "All"> = ["All", "Active", "Pending", "On Leave", "Suspended"];

export default function AdminDoctorsScreen() {
    const { colors, isDark } = useTheme();

    const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<DoctorStatus | "All">("All");
    const [selected, setSelected] = useState<Doctor | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [toastMsg, setToastMsg] = useState("");

    // New Doctor Form State
    const [formName, setFormName] = useState("");
    const [formSpec, setFormSpec] = useState("");
    const [formEmail, setFormEmail] = useState("");
    const [formPhone, setFormPhone] = useState("");
    const [formHospital, setFormHospital] = useState("");
    const [formFee, setFormFee] = useState("");

    const C = { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isDark ? colors.cardBorder : "#E8EFF5" };

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 3000);
    };

    const filtered = useMemo(() => {
        let list = doctors;
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (d) =>
                    d.name.toLowerCase().includes(q) ||
                    d.spec.toLowerCase().includes(q) ||
                    d.hospital.toLowerCase().includes(q)
            );
        }
        if (filter !== "All") list = list.filter((d) => d.status === filter);
        return list;
    }, [doctors, search, filter]);

    const openDoctor = (doc: Doctor) => {
        setSelected(doc);
        setShowDetail(true);
    };

    const handleAddDoctor = () => {
        if (!formName.trim() || !formSpec.trim()) {
            Alert.alert("Missing Fields", "Please enter at least doctor's name and specialization.");
            return;
        }

        const parts = formName.trim().split(/\s+/);
        const initials = parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : formName.substring(0, 2).toUpperCase();

        const newDoc: Doctor = {
            id: Date.now().toString(),
            name: formName.startsWith("Dr.") ? formName : `Dr. ${formName}`,
            spec: formSpec,
            initials,
            patients: 0,
            rating: 5.0,
            experience: "1 yr",
            status: "Active",
            phone: formPhone || "+91 98765 00000",
            email: formEmail || `${formName.toLowerCase().replace(/\s+/g, "")}@liferelier.com`,
            hospital: formHospital || "LifeRelier Super Speciality",
            joined: "Just now",
            consultFee: formFee ? (formFee.includes("Rs.") ? formFee : `Rs. ${formFee}`) : "Rs. 500",
        };

        setDoctors((prev) => [newDoc, ...prev]);
        setShowAdd(false);
        setFormName("");
        setFormSpec("");
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
        setShowDetail(false);
        showToast("Doctor account verified and approved!");
    };

    const handleSuspendDoctor = (id: string) => {
        Alert.alert(
            "Suspend Doctor Account",
            "Are you sure you want to suspend this doctor's platform access?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Suspend",
                    style: "destructive",
                    onPress: () => {
                        setDoctors((prev) =>
                            prev.map((d) => (d.id === id ? { ...d, status: "Suspended" as DoctorStatus } : d))
                        );
                        setShowDetail(false);
                        showToast("Doctor account suspended.");
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={[s.root, { backgroundColor: colors.background }]} edges={["top"]}>

            {/* HEADER */}
            <View style={s.header}>
                <View style={{ flex: 1 }}>
                    <LogoBrand size={24} fontSize={16} style={{ marginBottom: 5 }} />
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={[s.title, { color: colors.text }]}>Doctors Portal</Text>
                        <View style={[s.countPill, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                            <Text style={{ color: BLUE, fontSize: 12, fontWeight: "800" }}>{doctors.length}</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={s.addBtn} onPress={() => setShowAdd(true)} activeOpacity={0.85}>
                    <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                    <Text style={s.addBtnTxt}>Add Doctor</Text>
                </TouchableOpacity>
            </View>

            {/* SEARCH BAR */}
            <View style={[s.searchBar, C]}>
                <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
                <TextInput
                    style={[s.searchInput, { color: colors.text }]}
                    placeholder="Search by name, specialty, hospital..."
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

            {/* STATUS FILTERS */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 10 }}>
                {FILTERS.map((f) => (
                    <TouchableOpacity
                        key={f}
                        onPress={() => setFilter(f)}
                        activeOpacity={0.8}
                        style={[
                            s.filterPill,
                            filter === f ? { backgroundColor: BLUE } : { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
                        ]}
                    >
                        <Text style={[s.filterTxt, { color: filter === f ? "#FFFFFF" : colors.textSecondary }]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* RESULTS COUNT */}
            <Text style={[s.resultCount, { color: colors.textSecondary }]}>
                {filtered.length} doctor{filtered.length !== 1 ? "s" : ""}
            </Text>

            {/* DOCTOR LIST */}
            <FlatList
                data={filtered}
                keyExtractor={(d) => d.id}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={{ alignItems: "center", paddingTop: 60 }}>
                        <MaterialCommunityIcons name="doctor" size={56} color="#94A3B8" style={{ opacity: 0.4 }} />
                        <Text style={{ color: colors.text, fontWeight: "800", fontSize: 16, marginTop: 12 }}>No Doctors Found</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>Try adjusting your search or filter criteria.</Text>
                    </View>
                }
                renderItem={({ item: doc }) => {
                    const sc = STATUS_CFG[doc.status];
                    return (
                        <TouchableOpacity style={[s.docCard, C]} onPress={() => openDoctor(doc)} activeOpacity={0.88}>
                            <View style={[s.docInitials, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                                <Text style={{ color: BLUE, fontSize: 16, fontWeight: "800" }}>{doc.initials}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                    <Text style={{ fontSize: 15, fontWeight: "800", color: colors.text }}>{doc.name}</Text>
                                    {doc.status === "Pending" && (
                                        <View style={{ backgroundColor: "#EFF6FF", paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 }}>
                                            <Text style={{ color: BLUE, fontSize: 9, fontWeight: "800" }}>NEW</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>{doc.spec}  •  {doc.experience}</Text>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                                        <MaterialCommunityIcons name="star" size={12} color="#F59E0B" />
                                        <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: "600" }}>{doc.rating}</Text>
                                    </View>
                                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>•</Text>
                                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>{doc.patients} patients</Text>
                                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>•</Text>
                                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>{doc.consultFee}</Text>
                                </View>
                            </View>
                            <View style={{ alignItems: "flex-end", gap: 6 }}>
                                <View style={[s.statusPill, { backgroundColor: sc.bg }]}>
                                    <Text style={{ color: sc.color, fontSize: 10, fontWeight: "700" }}>{doc.status}</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={16} color="#94A3B8" />
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />

            {/* DOCTOR DETAIL MODAL */}
            <Modal visible={showDetail} transparent animationType="slide" onRequestClose={() => setShowDetail(false)}>
                <Pressable style={s.overlay} onPress={() => setShowDetail(false)}>
                    <View style={[s.sheet, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
                        <View style={[s.handle, { backgroundColor: isDark ? "#334155" : "#CBD5E1" }]} />
                        {selected && (() => {
                            const sc = STATUS_CFG[selected.status];
                            return (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {/* Doctor Hero */}
                                    <LinearGradient colors={["#1E3A8A", "#2563EB"]} style={s.detailHero}>
                                        <View style={s.detailAvt}>
                                            <Text style={{ color: BLUE, fontSize: 22, fontWeight: "800" }}>{selected.initials}</Text>
                                        </View>
                                        <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "800", marginTop: 10 }}>{selected.name}</Text>
                                        <Text style={{ color: "#BFDBFE", fontSize: 13, marginTop: 2 }}>{selected.spec}</Text>
                                        <View style={[s.statusPill, { backgroundColor: sc.bg, marginTop: 10 }]}>
                                            <Text style={{ color: sc.color, fontSize: 11, fontWeight: "700" }}>{selected.status}</Text>
                                        </View>
                                    </LinearGradient>

                                    {/* Stats Row */}
                                    <View style={{ flexDirection: "row", justifyContent: "space-around", padding: 16 }}>
                                        {[
                                            { val: String(selected.patients), lbl: "Patients" },
                                            { val: String(selected.rating), lbl: "Rating" },
                                            { val: selected.experience, lbl: "Experience" },
                                        ].map((x, i) => (
                                            <View key={i} style={{ alignItems: "center" }}>
                                                <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>{x.val}</Text>
                                                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>{x.lbl}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Details */}
                                    {[
                                        { icon: "hospital-building", label: "Hospital", val: selected.hospital },
                                        { icon: "phone-outline", label: "Phone", val: selected.phone },
                                        { icon: "email-outline", label: "Email", val: selected.email },
                                        { icon: "currency-inr", label: "Consult Fee", val: selected.consultFee },
                                        { icon: "calendar-outline", label: "Joined", val: selected.joined },
                                    ].map((row) => (
                                        <View key={row.label} style={[s.detailRow, { borderColor: isDark ? "#334155" : "#F1F5F9" }]}>
                                            <View style={[s.detailIco, { backgroundColor: isDark ? "#0F172A" : "#EFF6FF" }]}>
                                                <MaterialCommunityIcons name={row.icon as any} size={16} color={BLUE} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: "600" }}>{row.label}</Text>
                                                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginTop: 1 }}>{row.val}</Text>
                                            </View>
                                        </View>
                                    ))}

                                    {/* Action Buttons */}
                                    <View style={{ gap: 10, padding: 16 }}>
                                        {selected.status === "Pending" && (
                                            <TouchableOpacity
                                                style={[s.modalBtn, { backgroundColor: "#ECFDF5" }]}
                                                onPress={() => handleApproveDoctor(selected.id)}
                                                activeOpacity={0.85}
                                            >
                                                <MaterialCommunityIcons name="check-circle-outline" size={18} color="#10B981" />
                                                <Text style={{ color: "#10B981", fontWeight: "700", fontSize: 14 }}>Approve Doctor</Text>
                                            </TouchableOpacity>
                                        )}
                                        {selected.status !== "Suspended" && (
                                            <TouchableOpacity
                                                style={[s.modalBtn, { backgroundColor: "#FEF2F2" }]}
                                                onPress={() => handleSuspendDoctor(selected.id)}
                                                activeOpacity={0.85}
                                            >
                                                <MaterialCommunityIcons name="cancel" size={18} color="#EF4444" />
                                                <Text style={{ color: "#EF4444", fontWeight: "700", fontSize: 14 }}>Suspend Account</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </ScrollView>
                            );
                        })()}
                    </View>
                </Pressable>
            </Modal>

            {/* ADD DOCTOR MODAL */}
            <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
                <Pressable style={s.overlay} onPress={() => setShowAdd(false)}>
                    <Pressable style={[s.sheet, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
                        <View style={[s.handle, { backgroundColor: isDark ? "#334155" : "#CBD5E1" }]} />
                        <Text style={[s.sheetTitle, { color: colors.text }]}>Add New Doctor</Text>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>Fill in details to register a new doctor onto the platform.</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {[
                                { label: "Full Name", val: formName, set: setFormName, ph: "e.g. Dr. Kavya Reddy" },
                                { label: "Specialization", val: formSpec, set: setFormSpec, ph: "e.g. Cardiologist" },
                                { label: "Email Address", val: formEmail, set: setFormEmail, ph: "e.g. kavya@liferelier.com" },
                                { label: "Phone Number", val: formPhone, set: setFormPhone, ph: "e.g. +91 98765 43210" },
                                { label: "Hospital / Clinic", val: formHospital, set: setFormHospital, ph: "e.g. LR Super Speciality" },
                                { label: "Consultation Fee", val: formFee, set: setFormFee, ph: "e.g. Rs. 800" },
                            ].map((field) => (
                                <View key={field.label} style={{ marginBottom: 12 }}>
                                    <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textSecondary, marginBottom: 4 }}>{field.label}</Text>
                                    <View style={[s.formInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                                        <TextInput
                                            placeholder={field.ph}
                                            placeholderTextColor="#94A3B8"
                                            value={field.val}
                                            onChangeText={field.set}
                                            style={{ flex: 1, color: colors.text, fontSize: 13 }}
                                        />
                                    </View>
                                </View>
                            ))}
                            <TouchableOpacity style={s.saveBtn} activeOpacity={0.88} onPress={handleAddDoctor}>
                                <LinearGradient colors={["#1E3A8A", "#2563EB"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.saveBtnGrad}>
                                    <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "800" }}>Register Doctor</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* TOAST BANNER */}
            {toastMsg ? (
                <View style={s.toastBanner}>
                    <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" />
                    <Text style={s.toastTxt}>{toastMsg}</Text>
                </View>
            ) : null}

        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
    title: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
    countPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    addBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: BLUE, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
    addBtnTxt: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
    searchBar: { flexDirection: "row", alignItems: "center", gap: 10, height: 48, borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 14, marginHorizontal: 16, marginBottom: 10 },
    searchInput: { flex: 1, fontSize: 14, fontWeight: "500" },
    filterPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18 },
    filterTxt: { fontSize: 12, fontWeight: "700" },
    resultCount: { fontSize: 12, fontWeight: "600", paddingHorizontal: 16, marginBottom: 8 },
    docCard: { borderRadius: 18, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "flex-start", gap: 12 },
    docInitials: { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center" },
    statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: "flex-start" },
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 36, maxHeight: "88%" },
    handle: { width: 44, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
    sheetTitle: { fontSize: 19, fontWeight: "800", marginBottom: 4 },
    detailHero: { borderRadius: 18, padding: 20, alignItems: "center", marginBottom: 4 },
    detailAvt: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" },
    detailRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, paddingHorizontal: 4 },
    detailIco: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    modalBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 14 },
    formInput: { height: 46, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 12, justifyContent: "center" },
    saveBtn: { borderRadius: 16, overflow: "hidden", marginTop: 12, marginBottom: 20 },
    saveBtnGrad: { height: 50, justifyContent: "center", alignItems: "center" },
    toastBanner: {
        position: "absolute", bottom: 90, left: 20, right: 20,
        backgroundColor: "#10B981", borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16,
        flexDirection: "row", alignItems: "center", gap: 10,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6,
    },
    toastTxt: { color: "#FFFFFF", fontSize: 13, fontWeight: "700", flex: 1 },
});
