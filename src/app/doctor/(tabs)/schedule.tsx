import { Appointment, appointmentStore } from "@/utils/appointmentStore";
import { useTheme } from "@/utils/themeManager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CalendarHeader from "../components/CalendarHeader";

// ─── Config ───────────────────────────────────────────────────────────────────
const FILTERS = [
    { key: "All",       icon: "view-list-outline"    },
    { key: "Confirmed", icon: "check-circle-outline" },
    { key: "Pending",   icon: "clock-outline"        },
    { key: "Emergency", icon: "alert-circle-outline" },
    { key: "Cancelled", icon: "close-circle-outline" },
];

const AVATAR_COLORS: Record<string, { bg: string; color: string }> = {
    RG: { bg: "#DBEAFE", color: "#2563EB" },
    AS: { bg: "#CCFBF1", color: "#0D9488" },
    PP: { bg: "#EDE9FE", color: "#7C3AED" },
    VM: { bg: "#FEE2E2", color: "#DC2626" },
    SR: { bg: "#FEF9C3", color: "#B45309" },
    MN: { bg: "#CCFBF1", color: "#0D9488" },
    KJ: { bg: "#DBEAFE", color: "#2563EB" },
};
function getAvatar(initials: string) {
    return AVATAR_COLORS[initials] ?? { bg: "#F0FDFA", color: "#0D9488" };
}

// ─── Appointment Card ─────────────────────────────────────────────────────────
function ApptCard({ item, isDark, colors }: { item: Appointment; isDark: boolean; colors: any }) {
    const av = getAvatar(item.initials);
    const isEmergency = item.type === "Emergency";

    return (
        <View style={[
            ac.card,
            {
                backgroundColor: isDark ? colors.card : "#FFF",
                borderColor: isEmergency ? "#DC262640" : (isDark ? colors.cardBorder : "#E8EFF5"),
                borderLeftColor: item.typeColor,
                borderLeftWidth: 3,
            },
        ]}>
            {/* Top: avatar + info + status */}
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 11 }}>
                <View style={[ac.avatar, { backgroundColor: av.bg }]}>
                    <Text style={[ac.avatarTxt, { color: av.color }]}>{item.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[ac.name, { color: colors.text }]}>{item.patient}</Text>
                    {item.phone ? (
                        <Text style={[ac.phone, { color: colors.textSecondary }]}>{item.phone}</Text>
                    ) : null}
                    <View style={[ac.typeBadge, { backgroundColor: `${item.typeColor}18` }]}>
                        <Text style={[ac.typeTxt, { color: item.typeColor }]}>{item.type}</Text>
                    </View>
                </View>
                <View style={[ac.statusBadge, { backgroundColor: `${item.statusColor}18` }]}>
                    <Text style={[ac.statusTxt, { color: item.statusColor }]}>{item.status}</Text>
                </View>
            </View>

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: isDark ? "#1E293B" : "#F1F5F9", marginVertical: 10 }} />

            {/* Bottom: time + quick actions */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <MaterialCommunityIcons name="clock-outline" size={13} color={colors.textSecondary} />
                    <Text style={{ fontSize: 13, fontWeight: "700", color: colors.textSecondary }}>{item.time}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 7 }}>
                    {item.phone ? (
                        <TouchableOpacity
                            style={[ac.iconBtn, { backgroundColor: isDark ? "#1E293B" : "#F0FDFA" }]}
                            onPress={() => Alert.alert("Call", `Calling ${item.patient}\n${item.phone}`)}
                            activeOpacity={0.75}
                        >
                            <MaterialCommunityIcons name="phone-outline" size={14} color="#0D9488" />
                        </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity
                        style={[ac.iconBtn, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}
                        onPress={() => Alert.alert("Message", `Message ${item.patient}`)}
                        activeOpacity={0.75}
                    >
                        <MaterialCommunityIcons name="message-text-outline" size={14} color="#2563EB" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[ac.iconBtn, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}
                        onPress={() => Alert.alert("Notes", item.notes ?? "No notes for this appointment.")}
                        activeOpacity={0.75}
                    >
                        <MaterialCommunityIcons name="notebook-outline" size={14} color="#7C3AED" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const ac = StyleSheet.create({
    card:       { borderRadius: 18, borderWidth: 1, padding: 14, marginBottom: 10, overflow: "hidden" },
    avatar:     { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
    avatarTxt:  { fontSize: 15, fontWeight: "800" },
    name:       { fontSize: 14, fontWeight: "800", letterSpacing: -0.2 },
    phone:      { fontSize: 11, marginTop: 2, fontWeight: "500" },
    typeBadge:  { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7, marginTop: 5 },
    typeTxt:    { fontSize: 10, fontWeight: "700" },
    statusBadge:{ paddingHorizontal: 9, paddingVertical: 4, borderRadius: 9 },
    statusTxt:  { fontSize: 10, fontWeight: "800" },
    iconBtn:    { width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center" },
});

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ colors, onAdd }: { colors: any; onAdd: () => void }) {
    return (
        <View style={es.wrap}>
            <View style={es.circle}>
                <MaterialCommunityIcons name="calendar-remove-outline" size={40} color="#94A3B8" />
            </View>
            <Text style={[es.title, { color: colors.text }]}>No Appointments</Text>
            <Text style={[es.sub, { color: colors.textSecondary }]}>Nothing scheduled for this day.</Text>
            <TouchableOpacity style={es.btn} onPress={onAdd} activeOpacity={0.82}>
                <MaterialCommunityIcons name="plus" size={16} color="#FFF" />
                <Text style={es.btnTxt}>Add Appointment</Text>
            </TouchableOpacity>
        </View>
    );
}
const es = StyleSheet.create({
    wrap:   { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60, paddingBottom: 80 },
    circle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center", marginBottom: 16 },
    title:  { fontSize: 17, fontWeight: "800", marginBottom: 4 },
    sub:    { fontSize: 13, fontWeight: "500", marginBottom: 20, textAlign: "center" },
    btn:    { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#0D9488", paddingHorizontal: 20, paddingVertical: 11, borderRadius: 14 },
    btnTxt: { color: "#FFF", fontSize: 14, fontWeight: "700" },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DoctorScheduleScreen() {
    const { colors, isDark } = useTheme();
    const router = useRouter();

    const [selectedDate, setSelectedDate] = useState("2026-07-24");
    const [appointments, setAppointments]  = useState<Appointment[]>([]);
    const [activeFilter, setActiveFilter]  = useState("All");
    const [search, setSearch]              = useState("");

    // ── Real backend logic (unchanged) ──
    useEffect(() => {
        setAppointments(appointmentStore.getAppointmentsForDate(selectedDate));
    }, [selectedDate]);

    useEffect(() => {
        const unsubscribe = appointmentStore.subscribe(() => {
            setAppointments(appointmentStore.getAppointmentsForDate(selectedDate));
        });
        return unsubscribe;
    }, [selectedDate]);

    // ── Filtered list ──
    const displayed = useMemo(() => {
        let list = appointments;
        if (activeFilter !== "All") {
            list = list.filter(a => a.status === activeFilter || a.type === activeFilter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(a =>
                a.patient.toLowerCase().includes(q) ||
                a.type.toLowerCase().includes(q) ||
                (a.phone ?? "").includes(q)
            );
        }
        return list;
    }, [appointments, activeFilter, search]);

    // ── Mini stats ──
    const stats = useMemo(() => ({
        total:     appointments.length,
        pending:   appointments.filter(a => a.status === "Pending").length,
        emergency: appointments.filter(a => a.type === "Emergency").length,
    }), [appointments]);

    return (
        <SafeAreaView style={[s.root, { backgroundColor: colors.background }]} edges={["top"]}>

            {/* HEADER */}
            <View style={s.header}>
                <View style={{ flex: 1 }}>
                    <Text style={[s.headerTitle, { color: colors.text }]}>My Schedule</Text>
                </View>
                <TouchableOpacity
                    style={[s.addBtn, { backgroundColor: isDark ? colors.card : "#F0FDFA", borderColor: isDark ? colors.cardBorder : "#CCFBF1" }]}
                    onPress={() => router.push("/doctor/add-appointment")}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="plus" size={18} color="#0D9488" />
                    <Text style={s.addBtnTxt}>Add</Text>
                </TouchableOpacity>
            </View>

            {/* CALENDAR (teammate's component — unchanged) */}
            <CalendarHeader selectedDate={selectedDate} onSelect={setSelectedDate} />

            {/* DATE STATS ROW */}
            <View style={s.statsRow}>
                <View style={[s.miniStat, { backgroundColor: "#F0FDFA" }]}>
                    <MaterialCommunityIcons name="calendar-check-outline" size={12} color="#0D9488" />
                    <Text style={[s.miniStatTxt, { color: "#0D9488" }]}>{stats.total} total</Text>
                </View>
                {stats.pending > 0 && (
                    <View style={[s.miniStat, { backgroundColor: "#FFFBEB" }]}>
                        <MaterialCommunityIcons name="clock-outline" size={12} color="#D97706" />
                        <Text style={[s.miniStatTxt, { color: "#D97706" }]}>{stats.pending} pending</Text>
                    </View>
                )}
                {stats.emergency > 0 && (
                    <View style={[s.miniStat, { backgroundColor: "#FEF2F2" }]}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={12} color="#DC2626" />
                        <Text style={[s.miniStatTxt, { color: "#DC2626" }]}>{stats.emergency} emergency</Text>
                    </View>
                )}
            </View>

            {/* SEARCH */}
            <View style={[s.searchWrap, { backgroundColor: isDark ? colors.card : "#FFF", borderColor: isDark ? colors.cardBorder : "#E8EFF5" }]}>
                <MaterialCommunityIcons name="magnify" size={18} color="#94A3B8" />
                <TextInput
                    style={[s.searchInput, { color: colors.text }]}
                    placeholder="Search patient, type, phone…"
                    placeholderTextColor="#94A3B8"
                    value={search}
                    onChangeText={setSearch}
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}>
                        <MaterialCommunityIcons name="close-circle" size={15} color="#94A3B8" />
                    </TouchableOpacity>
                )}
            </View>

            {/* FILTER CHIPS */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.filterScroll} style={{ marginBottom: 8 }}>
                {FILTERS.map((f) => {
                    const active = activeFilter === f.key;
                    return (
                        <TouchableOpacity
                            key={f.key}
                            onPress={() => setActiveFilter(f.key)}
                            activeOpacity={0.8}
                            style={[s.chip, { backgroundColor: active ? "#0D9488" : (isDark ? "#1E293B" : "#F1F5F9") }]}
                        >
                            <MaterialCommunityIcons name={f.icon as any} size={12} color={active ? "#FFF" : colors.textSecondary} />
                            <Text style={[s.chipTxt, { color: active ? "#FFF" : colors.textSecondary }]}>{f.key}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* RESULTS COUNT */}
            {displayed.length > 0 && (
                <Text style={[s.resultCount, { color: colors.textSecondary }]}>
                    {displayed.length} appointment{displayed.length !== 1 ? "s" : ""}
                    {activeFilter !== "All" ? `  ·  ${activeFilter}` : ""}
                </Text>
            )}

            {/* LIST */}
            <FlatList
                data={displayed}
                keyExtractor={(a) => a.id}
                contentContainerStyle={s.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <EmptyState colors={colors} onAdd={() => router.push("/doctor/add-appointment")} />
                }
                renderItem={({ item }) => (
                    <ApptCard item={item} isDark={isDark} colors={colors} />
                )}
            />

            {/* FAB */}
            <TouchableOpacity
                style={s.fab}
                activeOpacity={0.88}
                onPress={() => router.push("/doctor/add-appointment")}
            >
                <MaterialCommunityIcons name="plus" size={26} color="#FFF" />
            </TouchableOpacity>

        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root:        { flex: 1 },
    header:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
    headerTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
    addBtn:      { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
    addBtnTxt:   { fontSize: 13, fontWeight: "700", color: "#0D9488" },
    statsRow:    { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 10, marginTop: 4 },
    miniStat:    { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    miniStatTxt: { fontSize: 12, fontWeight: "700" },
    searchWrap:  { flexDirection: "row", alignItems: "center", gap: 9, height: 44, borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 12, marginHorizontal: 16, marginBottom: 10 },
    searchInput: { flex: 1, fontSize: 14, fontWeight: "500" },
    filterScroll:{ paddingHorizontal: 16, gap: 8 },
    chip:        { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16 },
    chipTxt:     { fontSize: 12, fontWeight: "700" },
    resultCount: { fontSize: 12, fontWeight: "600", paddingHorizontal: 16, marginBottom: 6 },
    listContent: { paddingHorizontal: 16, paddingBottom: 110 },
    fab:         { position: "absolute", bottom: 88, right: 20, width: 52, height: 52, borderRadius: 26, backgroundColor: "#0D9488", justifyContent: "center", alignItems: "center", shadowColor: "#0D9488", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 8 },
});
