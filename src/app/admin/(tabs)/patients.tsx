import React from "react";
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    TextInput, Modal, Pressable, FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@/utils/themeManager";
import LogoBrand from "@/components/LogoBrand";

const BLUE = "#2563EB";

type PatientStatus = "Active" | "Admitted" | "Discharged" | "Critical";

interface Patient {
    id: string; name: string; patientId: string; age: number;
    gender: "Male" | "Female"; bloodGroup: string; phone: string;
    condition: string; assignedDoctor: string; status: PatientStatus;
    lastVisit: string; initials: string; ward: string;
}

const PATIENTS: Patient[] = [
    { id: "1",  name: "Aarav Sharma",    patientId: "PT10234", age: 34, gender: "Male",   bloodGroup: "O+",  phone: "+91 98765 43210", condition: "Hypertension",       assignedDoctor: "Dr. Sarah Jenkins", status: "Active",    lastVisit: "Today",       initials: "AS", ward: "OPD"     },
    { id: "2",  name: "Priya Patel",     patientId: "PT10456", age: 28, gender: "Female", bloodGroup: "A+",  phone: "+91 87654 32109", condition: "Cardiac Arrhythmia", assignedDoctor: "Dr. Sarah Jenkins", status: "Critical",  lastVisit: "Today",       initials: "PP", ward: "ICU"     },
    { id: "3",  name: "Rajesh Verma",    patientId: "PT10789", age: 52, gender: "Male",   bloodGroup: "B+",  phone: "+91 76543 21098", condition: "Diabetes Type-2",    assignedDoctor: "Dr. Sarah Jenkins", status: "Active",    lastVisit: "1 week ago",  initials: "RV", ward: "OPD"     },
    { id: "4",  name: "Ananya Sen",      patientId: "PT10321", age: 24, gender: "Female", bloodGroup: "AB+", phone: "+91 65432 10987", condition: "General Checkup",    assignedDoctor: "Dr. Vikram Singh",  status: "Active",    lastVisit: "3 months ago",initials: "AS", ward: "OPD"     },
    { id: "5",  name: "Vikram Malhotra", patientId: "PT10654", age: 61, gender: "Male",   bloodGroup: "O-",  phone: "+91 54321 09876", condition: "Post-op Recovery",   assignedDoctor: "Dr. Sarah Jenkins", status: "Admitted",  lastVisit: "Yesterday",   initials: "VM", ward: "Ward B"  },
    { id: "6",  name: "Meera Nair",      patientId: "PT10987", age: 43, gender: "Female", bloodGroup: "A-",  phone: "+91 43210 98765", condition: "Migraine",           assignedDoctor: "Dr. Meera Nair",    status: "Active",    lastVisit: "2 weeks ago", initials: "MN", ward: "OPD"     },
    { id: "7",  name: "Karan Singh",     patientId: "PT11002", age: 38, gender: "Male",   bloodGroup: "B-",  phone: "+91 32109 87654", condition: "Fracture — L. Arm",  assignedDoctor: "Dr. Rohit Sharma",  status: "Admitted",  lastVisit: "3 days ago",  initials: "KS", ward: "Ortho"   },
    { id: "8",  name: "Sunita Joshi",    patientId: "PT11034", age: 55, gender: "Female", bloodGroup: "O+",  phone: "+91 21098 76543", condition: "Kidney Stone",       assignedDoctor: "Dr. Arjun Mehta",   status: "Discharged",lastVisit: "1 month ago", initials: "SJ", ward: "Urology" },
];

const STATUS_CFG: Record<PatientStatus, { color: string; bg: string; icon: string }> = {
    "Active":    { color: "#10B981", bg: "#ECFDF5", icon: "check-circle-outline"  },
    "Admitted":  { color: "#2563EB", bg: "#EFF6FF", icon: "hospital-building"     },
    "Discharged":{ color: "#64748B", bg: "#F1F5F9", icon: "exit-run"              },
    "Critical":  { color: "#EF4444", bg: "#FEF2F2", icon: "alert-circle-outline"  },
};

const FILTERS: Array<PatientStatus | "All"> = ["All", "Active", "Admitted", "Critical", "Discharged"];

export default function AdminPatientsScreen() {
    const { colors, isDark } = useTheme();
    const [search, setSearch]         = React.useState("");
    const [filter, setFilter]         = React.useState<PatientStatus | "All">("All");
    const [selected, setSelected]     = React.useState<Patient | null>(null);
    const [showDetail, setShowDetail] = React.useState(false);
    const C = { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isDark ? colors.cardBorder : "#E8EFF5" };

    const filtered = React.useMemo(() => {
        let list = PATIENTS;
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((p) =>
                p.name.toLowerCase().includes(q) ||
                p.patientId.toLowerCase().includes(q) ||
                p.condition.toLowerCase().includes(q) ||
                p.phone.includes(q)
            );
        }
        if (filter !== "All") list = list.filter((p) => p.status === filter);
        return list;
    }, [search, filter]);

    return (
        <SafeAreaView style={[s.root, { backgroundColor: colors.background }]} edges={["top"]}>

            {/* HEADER */}
            <View style={s.header}>
                <View style={{ flex: 1 }}>
                    <LogoBrand size={24} fontSize={16} style={{ marginBottom: 5 }} />
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={[s.title, { color: colors.text }]}>Patients</Text>
                        <View style={[s.countPill, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                            <Text style={{ color: BLUE, fontSize: 12, fontWeight: "800" }}>{PATIENTS.length}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* SUMMARY CHIPS */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 10 }}>
                {[
                    { label: "Total",      val: PATIENTS.length,                                    icon: "account-group-outline" },
                    { label: "Critical",   val: PATIENTS.filter((p) => p.status === "Critical").length,   icon: "alert-circle-outline"  },
                    { label: "Admitted",   val: PATIENTS.filter((p) => p.status === "Admitted").length,   icon: "hospital-building"     },
                    { label: "Active",     val: PATIENTS.filter((p) => p.status === "Active").length,     icon: "check-circle-outline"  },
                    { label: "Discharged", val: PATIENTS.filter((p) => p.status === "Discharged").length, icon: "exit-run"              },
                ].map((item, i) => (
                    <View key={i} style={[s.chip, C]}>
                        <MaterialCommunityIcons name={item.icon as any} size={16} color={BLUE} />
                        <Text style={{ fontSize: 15, fontWeight: "800", color: colors.text }}>{item.val}</Text>
                        <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: "600" }}>{item.label}</Text>
                    </View>
                ))}
            </ScrollView>

            {/* SEARCH */}
            <View style={[s.searchBar, C]}>
                <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
                <TextInput
                    style={[s.searchInput, { color: colors.text }]}
                    placeholder="Search by name, ID, phone, condition..."
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
                    <TouchableOpacity key={f} onPress={() => setFilter(f)} activeOpacity={0.8}
                        style={[s.filterPill, filter === f ? { backgroundColor: BLUE } : { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
                        <Text style={[s.filterTxt, { color: filter === f ? "#FFF" : colors.textSecondary }]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Text style={[s.resultCount, { color: colors.textSecondary }]}>{filtered.length} patient{filtered.length !== 1 ? "s" : ""}</Text>

            {/* PATIENT LIST */}
            <FlatList
                data={filtered}
                keyExtractor={(p) => p.id}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={{ alignItems: "center", paddingTop: 60 }}>
                        <MaterialCommunityIcons name="account-search-outline" size={56} color="#94A3B8" style={{ opacity: 0.4 }} />
                        <Text style={{ color: colors.text, fontWeight: "800", fontSize: 16, marginTop: 12 }}>No Patients Found</Text>
                    </View>
                }
                renderItem={({ item: p }) => {
                    const sc = STATUS_CFG[p.status];
                    return (
                        <TouchableOpacity style={[s.patCard, C, p.status === "Critical" && { borderLeftWidth: 4, borderLeftColor: "#EF4444" }]}
                            onPress={() => { setSelected(p); setShowDetail(true); }} activeOpacity={0.88}>
                            <View style={[s.patInit, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                                <Text style={{ color: BLUE, fontSize: 15, fontWeight: "800" }}>{p.initials}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 15, fontWeight: "800", color: colors.text }}>{p.name}</Text>
                                <Text style={{ fontSize: 11, color: BLUE, fontWeight: "700", marginTop: 1 }}>{p.patientId}</Text>
                                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{p.age} yrs, {p.gender}  •  {p.condition}</Text>
                                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>{p.assignedDoctor}  •  {p.ward}</Text>
                            </View>
                            <View style={{ alignItems: "flex-end", gap: 5 }}>
                                <View style={[s.sPill, { backgroundColor: sc.bg }]}>
                                    <MaterialCommunityIcons name={sc.icon as any} size={10} color={sc.color} />
                                    <Text style={{ color: sc.color, fontSize: 10, fontWeight: "700" }}>{p.status}</Text>
                                </View>
                                <Text style={{ fontSize: 10, color: colors.textSecondary }}>{p.lastVisit}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />

            {/* PATIENT DETAIL MODAL */}
            <Modal visible={showDetail} transparent animationType="slide" onRequestClose={() => setShowDetail(false)}>
                <Pressable style={s.overlay} onPress={() => setShowDetail(false)}>
                    <View style={[s.sheet, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
                        <View style={[s.handle, { backgroundColor: isDark ? "#334155" : "#CBD5E1" }]} />
                        {selected && (() => {
                            const sc = STATUS_CFG[selected.status];
                            return (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {/* Patient Hero */}
                                    <View style={{ alignItems: "center", paddingVertical: 20 }}>
                                        <View style={[s.bigAvt, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                                            <Text style={{ color: BLUE, fontSize: 22, fontWeight: "800" }}>{selected.initials}</Text>
                                        </View>
                                        <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text, marginTop: 10 }}>{selected.name}</Text>
                                        <Text style={{ fontSize: 13, color: BLUE, fontWeight: "700", marginTop: 2 }}>{selected.patientId}</Text>
                                        <View style={[s.sPill, { backgroundColor: sc.bg, marginTop: 8 }]}>
                                            <Text style={{ color: sc.color, fontSize: 11, fontWeight: "700" }}>{selected.status}</Text>
                                        </View>
                                    </View>

                                    {/* Info grid */}
                                    <View style={{ flexDirection: "row", justifyContent: "space-around", paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: isDark ? "#334155" : "#F1F5F9", marginBottom: 8 }}>
                                        {[
                                            { v: `${selected.age} yrs`, l: "Age"         },
                                            { v: selected.gender,       l: "Gender"      },
                                            { v: selected.bloodGroup,   l: "Blood Group" },
                                            { v: selected.ward,         l: "Ward"        },
                                        ].map((x, i) => (
                                            <View key={i} style={{ alignItems: "center" }}>
                                                <Text style={{ fontSize: 14, fontWeight: "800", color: colors.text }}>{x.v}</Text>
                                                <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 2 }}>{x.l}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {[
                                        { icon: "stethoscope",       label: "Condition",  val: selected.condition       },
                                        { icon: "doctor",            label: "Doctor",     val: selected.assignedDoctor  },
                                        { icon: "phone-outline",     label: "Phone",      val: selected.phone           },
                                        { icon: "calendar-outline",  label: "Last Visit", val: selected.lastVisit       },
                                    ].map((row) => (
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

                                    <View style={{ gap: 10, padding: 16 }}>
                                        <TouchableOpacity style={[s.mBtn, { backgroundColor: isDark ? "#0F172A" : "#EFF6FF" }]} activeOpacity={0.85}>
                                            <MaterialCommunityIcons name="file-chart-outline" size={17} color={BLUE} />
                                            <Text style={{ color: BLUE, fontWeight: "700", fontSize: 14 }}>View Full Medical Record</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[s.mBtn, { backgroundColor: "#FEF2F2" }]} activeOpacity={0.85}>
                                            <MaterialCommunityIcons name="delete-outline" size={17} color="#EF4444" />
                                            <Text style={{ color: "#EF4444", fontWeight: "700", fontSize: 14 }}>Remove Patient</Text>
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>
                            );
                        })()}
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
    title: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
    countPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    chip: { borderRadius: 16, borderWidth: 1, padding: 12, alignItems: "center", gap: 3, minWidth: 72 },
    searchBar: { flexDirection: "row", alignItems: "center", gap: 10, height: 48, borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 14, marginHorizontal: 16, marginBottom: 10 },
    searchInput: { flex: 1, fontSize: 14, fontWeight: "500" },
    filterPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18 },
    filterTxt: { fontSize: 12, fontWeight: "700" },
    resultCount: { fontSize: 12, fontWeight: "600", paddingHorizontal: 16, marginBottom: 8 },
    patCard: { borderRadius: 18, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "flex-start", gap: 12, overflow: "hidden" },
    patInit: { width: 46, height: 46, borderRadius: 23, justifyContent: "center", alignItems: "center" },
    sPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 36, maxHeight: "88%" },
    handle: { width: 44, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
    bigAvt: { width: 68, height: 68, borderRadius: 34, justifyContent: "center", alignItems: "center" },
    dRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, borderBottomWidth: 1, paddingHorizontal: 4 },
    dIco: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    mBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 14 },
});
