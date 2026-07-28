import React, { useEffect, useMemo, useState, useRef } from "react";
import {
    Alert,
    Animated,
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
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { Appointment, appointmentStore } from "@/utils/appointmentStore";
import { useTheme } from "@/utils/themeManager";
import CalendarHeader from "../components/CalendarHeader";

// ─── Filter Constants ────────────────────────────────────────────────────────
const FILTERS = [
    { key: "All", icon: "view-list-outline" },
    { key: "Confirmed", icon: "check-circle-outline" },
    { key: "Pending", icon: "clock-outline" },
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

// Timeline Hours (08:00 AM to 07:00 PM)
const TIMELINE_HOURS = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
    "06:00 PM", "07:00 PM"
];

export default function DoctorScheduleScreen() {
    const { colors, isDark } = useTheme();
    const router = useRouter();

    const todayStr = new Date().toISOString().split("T")[0];
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [activeFilter, setActiveFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<"list" | "timeline">("list");
    const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
    const [actionsModalVisible, setActionsModalVisible] = useState(false);

    // Fade animation on date switch
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0.4, duration: 100, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        ]).start();
    }, [selectedDate]);

    // Load & subscribe to store
    useEffect(() => {
        setAppointments(appointmentStore.getAppointmentsForDate(selectedDate));
    }, [selectedDate]);

    useEffect(() => {
        const unsubscribe = appointmentStore.subscribe(() => {
            setAppointments(appointmentStore.getAppointmentsForDate(selectedDate));
        });
        return unsubscribe;
    }, [selectedDate]);

    // Filtered list
    const displayed = useMemo(() => {
        let list = appointments;
        if (activeFilter !== "All") {
            list = list.filter((a) => a.status === activeFilter || a.type === activeFilter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (a) =>
                    a.patient.toLowerCase().includes(q) ||
                    a.type.toLowerCase().includes(q) ||
                    (a.phone ?? "").includes(q)
            );
        }
        return list;
    }, [appointments, activeFilter, search]);

    // Stats calculation
    const stats = useMemo(
        () => ({
            total: appointments.length,
            confirmed: appointments.filter((a) => a.status === "Confirmed").length,
            pending: appointments.filter((a) => a.status === "Pending").length,
            emergency: appointments.filter((a) => a.type === "Emergency").length,
        }),
        [appointments]
    );

    // Identify "Next Up" appointment
    const nextUpAppt = useMemo(() => {
        const validNext = appointments.find((a) => a.status !== "Cancelled");
        return validNext || null;
    }, [appointments]);

    const handleOpenActions = (appt: Appointment) => {
        setSelectedAppt(appt);
        setActionsModalVisible(true);
    };

    const handleUpdateStatus = async (newStatus: string) => {
        if (!selectedAppt) return;
        await appointmentStore.updateStatus(selectedAppt.id, selectedDate, newStatus);
        setActionsModalVisible(false);
        setSelectedAppt(null);
    };

    const handleDeleteAppointment = () => {
        if (!selectedAppt) return;
        Alert.alert(
            "Delete Appointment",
            `Are you sure you want to remove appointment for ${selectedAppt.patient}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await appointmentStore.deleteAppointment(selectedAppt.id, selectedDate);
                        setActionsModalVisible(false);
                        setSelectedAppt(null);
                    },
                },
            ]
        );
    };

    // ── Render Item Card ──────────────────────────────────────────────────────
    const renderApptCard = (item: Appointment, isNextUp = false) => {
        const av = getAvatar(item.initials);
        const isEmergency = item.type === "Emergency";
        const isCancelled = item.status === "Cancelled";

        return (
            <TouchableOpacity
                key={item.id}
                activeOpacity={0.88}
                onPress={() => handleOpenActions(item)}
                style={[
                    styles.card,
                    {
                        backgroundColor: isDark ? colors.card : "#FFFFFF",
                        borderColor: isEmergency ? "#EF444460" : isDark ? colors.cardBorder : "#E2E8F0",
                        borderLeftColor: item.typeColor,
                        opacity: isCancelled ? 0.6 : 1,
                    },
                    isNextUp && styles.nextUpCardBorder,
                ]}
            >
                {isNextUp && (
                    <View style={styles.nextUpBadge}>
                        <MaterialCommunityIcons name="lightning-bolt" size={11} color="#FFFFFF" />
                        <Text style={styles.nextUpBadgeTxt}>NEXT UP</Text>
                    </View>
                )}

                <View style={styles.cardHeaderRow}>
                    <View style={[styles.avatarCircle, { backgroundColor: av.bg }]}>
                        <Text style={[styles.avatarTxt, { color: av.color }]}>{item.initials}</Text>
                    </View>

                    <View style={styles.patientMeta}>
                        <View style={styles.nameRow}>
                            <Text style={[styles.patientName, { color: colors.text }]}>{item.patient}</Text>
                        </View>
                        {item.phone ? (
                            <Text style={[styles.patientPhone, { color: colors.textSecondary }]}>
                                {item.phone}
                            </Text>
                        ) : null}

                        <View style={styles.badgeRow}>
                            <View style={[styles.typeBadge, { backgroundColor: `${item.typeColor}15` }]}>
                                <Text style={[styles.typeTxt, { color: item.typeColor }]}>{item.type}</Text>
                            </View>
                            {item.notes ? (
                                <View style={styles.noteBadge}>
                                    <MaterialCommunityIcons name="file-document-outline" size={11} color="#7C3AED" />
                                    <Text style={styles.noteTxt} numberOfLines={1}>Note attached</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: `${item.statusColor}18` }]}>
                        <Text style={[styles.statusTxt, { color: item.statusColor }]}>{item.status}</Text>
                    </View>
                </View>

                {/* Card Divider */}
                <View style={[styles.cardDivider, { backgroundColor: isDark ? "#334155" : "#F1F5F9" }]} />

                {/* Card Footer */}
                <View style={styles.cardFooterRow}>
                    <View style={styles.timeTag}>
                        <MaterialCommunityIcons name="clock-outline" size={14} color="#0D9488" />
                        <Text style={styles.timeTagTxt}>{item.time}</Text>
                    </View>

                    <View style={styles.cardActionsGroup}>
                        {item.phone ? (
                            <TouchableOpacity
                                style={[styles.quickActionBtn, { backgroundColor: isDark ? "#1E293B" : "#F0FDFA" }]}
                                onPress={() => Alert.alert("Calling", `Dialing ${item.patient} at ${item.phone}`)}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons name="phone-outline" size={15} color="#0D9488" />
                            </TouchableOpacity>
                        ) : null}
                        <TouchableOpacity
                            style={[styles.quickActionBtn, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}
                            onPress={() => Alert.alert("Message", `Sending SMS to ${item.patient}`)}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons name="message-text-outline" size={15} color="#2563EB" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.quickActionBtn, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}
                            onPress={() => handleOpenActions(item)}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons name="dots-horizontal" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={["top"]}>
            {/* Top Navigation Header */}
            <View style={styles.topHeader}>
                <View>
                    <Text style={[styles.screenTitle, { color: colors.text }]}>Schedule</Text>
                    <Text style={[styles.screenSub, { color: colors.textSecondary }]}>
                        Doctor Appointment Portal
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.addApptBtn}
                    onPress={() => router.push("/doctor/add-appointment")}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={["#0D9488", "#0569A8"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.addBtnGradient}
                    >
                        <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
                        <Text style={styles.addBtnTxt}>Book New</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Calendar Selector */}
            <CalendarHeader selectedDate={selectedDate} onSelect={setSelectedDate} />

            {/* Main Content Area */}
            <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
                {/* Summary Banner Card */}
                <View style={styles.summaryContainer}>
                    <LinearGradient
                        colors={isDark ? ["#1E293B", "#0F172A"] : ["#F0FDFA", "#E0F2FE"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.summaryCard, { borderColor: isDark ? colors.cardBorder : "#CCFBF1" }]}
                    >
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryItem}>
                                <Text style={[styles.summaryNum, { color: colors.text }]}>{stats.total}</Text>
                                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total</Text>
                            </View>

                            <View style={styles.summaryVDivider} />

                            <View style={styles.summaryItem}>
                                <Text style={[styles.summaryNum, { color: "#10B981" }]}>{stats.confirmed}</Text>
                                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Confirmed</Text>
                            </View>

                            <View style={styles.summaryVDivider} />

                            <View style={styles.summaryItem}>
                                <Text style={[styles.summaryNum, { color: "#F59E0B" }]}>{stats.pending}</Text>
                                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Pending</Text>
                            </View>

                            <View style={styles.summaryVDivider} />

                            <View style={styles.summaryItem}>
                                <Text style={[styles.summaryNum, { color: "#EF4444" }]}>{stats.emergency}</Text>
                                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Emergency</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* View Mode Toggle + Search Bar Header */}
                <View style={styles.controlsRow}>
                    {/* View Switcher pills */}
                    <View style={[styles.viewSwitchContainer, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
                        <TouchableOpacity
                            style={[styles.viewSwitchBtn, viewMode === "list" && styles.viewSwitchActive]}
                            onPress={() => setViewMode("list")}
                            activeOpacity={0.8}
                        >
                            <MaterialCommunityIcons
                                name="format-list-bulleted"
                                size={15}
                                color={viewMode === "list" ? "#0D9488" : colors.textSecondary}
                            />
                            <Text style={[styles.viewSwitchTxt, { color: viewMode === "list" ? "#0D9488" : colors.textSecondary }]}>
                                Cards
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.viewSwitchBtn, viewMode === "timeline" && styles.viewSwitchActive]}
                            onPress={() => setViewMode("timeline")}
                            activeOpacity={0.8}
                        >
                            <MaterialCommunityIcons
                                name="clock-outline"
                                size={15}
                                color={viewMode === "timeline" ? "#0D9488" : colors.textSecondary}
                            />
                            <Text style={[styles.viewSwitchTxt, { color: viewMode === "timeline" ? "#0D9488" : colors.textSecondary }]}>
                                Timeline
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Filter chips scroll */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterScroll}
                    >
                        {FILTERS.map((f) => {
                            const active = activeFilter === f.key;
                            return (
                                <TouchableOpacity
                                    key={f.key}
                                    onPress={() => setActiveFilter(f.key)}
                                    activeOpacity={0.8}
                                    style={[
                                        styles.filterChip,
                                        {
                                            backgroundColor: active
                                                ? "#0D9488"
                                                : isDark
                                                ? "#1E293B"
                                                : "#F1F5F9",
                                        },
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name={f.icon as any}
                                        size={13}
                                        color={active ? "#FFFFFF" : colors.textSecondary}
                                    />
                                    <Text
                                        style={[
                                            styles.filterChipTxt,
                                            { color: active ? "#FFFFFF" : colors.textSecondary },
                                        ]}
                                    >
                                        {f.key}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Search Bar Input */}
                <View style={styles.searchSection}>
                    <View
                        style={[
                            styles.searchBar,
                            {
                                backgroundColor: isDark ? colors.card : "#FFFFFF",
                                borderColor: isDark ? colors.cardBorder : "#E2E8F0",
                            },
                        ]}
                    >
                        <MaterialCommunityIcons name="magnify" size={18} color="#94A3B8" />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Search patient, phone, or appointment type..."
                            placeholderTextColor="#94A3B8"
                            value={search}
                            onChangeText={setSearch}
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}>
                                <MaterialCommunityIcons name="close-circle" size={16} color="#94A3B8" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* LIST / TIMELINE CONTENT VIEW */}
                {viewMode === "list" ? (
                    <FlatList
                        data={displayed}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={
                            nextUpAppt && activeFilter === "All" && !search ? (
                                <View style={styles.nextUpSection}>
                                    <Text style={[styles.sectionTitleTxt, { color: colors.textSecondary }]}>
                                        SOONEST APPOINTMENT
                                    </Text>
                                    {renderApptCard(nextUpAppt, true)}
                                    <Text style={[styles.sectionTitleTxt, { color: colors.textSecondary, marginTop: 14 }]}>
                                        ALL SCHEDULED ({displayed.length})
                                    </Text>
                                </View>
                            ) : null
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyWrap}>
                                <View style={styles.emptyIconCircle}>
                                    <MaterialCommunityIcons name="calendar-remove-outline" size={38} color="#94A3B8" />
                                </View>
                                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                                    No Appointments Found
                                </Text>
                                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                                    {search
                                        ? `No records matching "${search}"`
                                        : `No ${activeFilter.toLowerCase()} appointments scheduled for this date.`}
                                </Text>
                                <TouchableOpacity
                                    style={styles.emptyAddBtn}
                                    onPress={() => router.push("/doctor/add-appointment")}
                                    activeOpacity={0.85}
                                >
                                    <MaterialCommunityIcons name="plus" size={16} color="#FFFFFF" />
                                    <Text style={styles.emptyAddBtnTxt}>Add New Appointment</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        renderItem={({ item }) => {
                            // Avoid duplicating nextUpAppt when rendered as top highlight
                            if (nextUpAppt && item.id === nextUpAppt.id && activeFilter === "All" && !search) {
                                return null;
                            }
                            return renderApptCard(item, false);
                        }}
                    />
                ) : (
                    /* TIMELINE VIEW */
                    <ScrollView contentContainerStyle={styles.timelineContent} showsVerticalScrollIndicator={false}>
                        {TIMELINE_HOURS.map((hourStr, idx) => {
                            // Find appointments matching this hour slot
                            const matchedAppts = displayed.filter((a) => {
                                const timeStr = a.time.toUpperCase();
                                return timeStr.includes(hourStr.substring(0, 2)) && timeStr.includes(hourStr.slice(-2));
                            });

                            return (
                                <View key={idx} style={styles.timelineRow}>
                                    <View style={styles.timelineTimeCol}>
                                        <Text style={[styles.timelineTimeTxt, { color: colors.textSecondary }]}>
                                            {hourStr}
                                        </Text>
                                    </View>

                                    <View style={[styles.timelineLineCol, { borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                                        <View style={styles.timelineDot} />
                                    </View>

                                    <View style={styles.timelineSlotCol}>
                                        {matchedAppts.length > 0 ? (
                                            matchedAppts.map((appt) => renderApptCard(appt, false))
                                        ) : (
                                            <View style={[styles.emptySlotBox, { borderColor: isDark ? "#334155" : "#F1F5F9" }]}>
                                                <Text style={[styles.emptySlotTxt, { color: colors.textSecondary }]}>
                                                    Available Slot
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </ScrollView>
                )}
            </Animated.View>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fabBtn}
                activeOpacity={0.88}
                onPress={() => router.push("/doctor/add-appointment")}
            >
                <LinearGradient
                    colors={["#0D9488", "#0569A8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.fabGradient}
                >
                    <MaterialCommunityIcons name="plus" size={26} color="#FFFFFF" />
                </LinearGradient>
            </TouchableOpacity>

            {/* ACTIONS BOTTOM MODAL */}
            <Modal
                visible={actionsModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setActionsModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setActionsModalVisible(false)}>
                    <Pressable
                        style={[
                            styles.modalCard,
                            { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
                        ]}
                    >
                        <View style={styles.modalHandle} />

                        {selectedAppt && (
                            <>
                                <View style={styles.modalHeader}>
                                    <View style={[styles.avatarCircle, { backgroundColor: getAvatar(selectedAppt.initials).bg }]}>
                                        <Text style={[styles.avatarTxt, { color: getAvatar(selectedAppt.initials).color }]}>
                                            {selectedAppt.initials}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.modalPatientName, { color: colors.text }]}>
                                            {selectedAppt.patient}
                                        </Text>
                                        <Text style={[styles.modalSubTxt, { color: colors.textSecondary }]}>
                                            {selectedAppt.time} • {selectedAppt.type}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setActionsModalVisible(false)}>
                                        <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                {selectedAppt.notes ? (
                                    <View style={[styles.notesBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                                        <MaterialCommunityIcons name="information-outline" size={16} color="#7C3AED" style={{ marginRight: 6 }} />
                                        <Text style={[styles.notesBoxTxt, { color: colors.text }]}>
                                            {selectedAppt.notes}
                                        </Text>
                                    </View>
                                ) : null}

                                <Text style={[styles.actionSectionTitle, { color: colors.textSecondary }]}>
                                    UPDATE STATUS
                                </Text>

                                <View style={styles.statusOptionRow}>
                                    <TouchableOpacity
                                        style={[styles.statusOptBtn, { backgroundColor: "#10B98115", borderColor: "#10B981" }]}
                                        onPress={() => handleUpdateStatus("Confirmed")}
                                    >
                                        <MaterialCommunityIcons name="check-circle" size={18} color="#10B981" />
                                        <Text style={[styles.statusOptTxt, { color: "#10B981" }]}>Confirm</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.statusOptBtn, { backgroundColor: "#F59E0B15", borderColor: "#F59E0B" }]}
                                        onPress={() => handleUpdateStatus("Pending")}
                                    >
                                        <MaterialCommunityIcons name="clock-outline" size={18} color="#F59E0B" />
                                        <Text style={[styles.statusOptTxt, { color: "#F59E0B" }]}>Pending</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.statusOptBtn, { backgroundColor: "#94A3B815", borderColor: "#94A3B8" }]}
                                        onPress={() => handleUpdateStatus("Cancelled")}
                                    >
                                        <MaterialCommunityIcons name="close-circle" size={18} color="#94A3B8" />
                                        <Text style={[styles.statusOptTxt, { color: "#64748B" }]}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.modalDivider} />

                                <TouchableOpacity
                                    style={styles.modalDeleteBtn}
                                    onPress={handleDeleteAppointment}
                                    activeOpacity={0.8}
                                >
                                    <MaterialCommunityIcons name="trash-can-outline" size={18} color="#EF4444" />
                                    <Text style={styles.modalDeleteTxt}>Delete Appointment</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1 },
    flex: { flex: 1 },

    // Top Navigation Header
    topHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
    },
    screenTitle: {
        fontSize: 22,
        fontWeight: "800",
        letterSpacing: -0.4,
    },
    screenSub: {
        fontSize: 12,
        fontWeight: "500",
        marginTop: 1,
    },
    addApptBtn: {
        borderRadius: 14,
        overflow: "hidden",
    },
    addBtnGradient: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 9,
    },
    addBtnTxt: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "700",
    },

    // Summary Card
    summaryContainer: {
        paddingHorizontal: 16,
        marginVertical: 6,
    },
    summaryCard: {
        borderRadius: 18,
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    summaryItem: {
        alignItems: "center",
        flex: 1,
    },
    summaryNum: {
        fontSize: 18,
        fontWeight: "800",
    },
    summaryLabel: {
        fontSize: 10,
        fontWeight: "600",
        marginTop: 2,
        textTransform: "uppercase",
    },
    summaryVDivider: {
        width: 1,
        height: 24,
        backgroundColor: "rgba(148, 163, 184, 0.2)",
    },

    // Controls Row
    controlsRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        marginTop: 4,
        marginBottom: 8,
        gap: 10,
    },
    viewSwitchContainer: {
        flexDirection: "row",
        borderRadius: 14,
        padding: 3,
    },
    viewSwitchBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 11,
    },
    viewSwitchActive: {
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    viewSwitchTxt: {
        fontSize: 11,
        fontWeight: "700",
    },
    filterScroll: {
        gap: 6,
        paddingRight: 10,
    },
    filterChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderRadius: 14,
    },
    filterChipTxt: {
        fontSize: 11,
        fontWeight: "700",
    },

    // Search Section
    searchSection: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        height: 42,
        borderRadius: 14,
        borderWidth: 1.5,
        paddingHorizontal: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        fontWeight: "500",
    },

    // Card Styles
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 110,
    },
    card: {
        borderRadius: 18,
        borderWidth: 1,
        padding: 14,
        marginBottom: 10,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 2,
    },
    nextUpCardBorder: {
        borderWidth: 2,
        borderColor: "#0D9488",
    },
    nextUpBadge: {
        position: "absolute",
        top: 0,
        right: 0,
        backgroundColor: "#0D9488",
        borderBottomLeftRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 3,
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    nextUpBadgeTxt: {
        color: "#FFFFFF",
        fontSize: 9,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    cardHeaderRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarTxt: {
        fontSize: 15,
        fontWeight: "800",
    },
    patientMeta: {
        flex: 1,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    patientName: {
        fontSize: 15,
        fontWeight: "800",
        letterSpacing: -0.2,
    },
    patientPhone: {
        fontSize: 11,
        marginTop: 2,
        fontWeight: "500",
    },
    badgeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 6,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    typeTxt: {
        fontSize: 10,
        fontWeight: "700",
    },
    noteBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        backgroundColor: "#F3E8FF",
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 8,
    },
    noteTxt: {
        fontSize: 10,
        color: "#7C3AED",
        fontWeight: "600",
    },
    statusBadge: {
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 10,
    },
    statusTxt: {
        fontSize: 10,
        fontWeight: "800",
    },
    cardDivider: {
        height: 1,
        marginVertical: 10,
    },
    cardFooterRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    timeTag: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "#F0FDFA",
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 8,
    },
    timeTagTxt: {
        fontSize: 12,
        fontWeight: "700",
        color: "#0D9488",
    },
    cardActionsGroup: {
        flexDirection: "row",
        gap: 8,
    },
    quickActionBtn: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justify.content: "center",
        alignItems: "center",
    },

    // Empty State
    emptyWrap: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 50,
        paddingBottom: 60,
    },
    emptyIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 14,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "800",
        marginBottom: 4,
    },
    emptySub: {
        fontSize: 12,
        fontWeight: "500",
        marginBottom: 20,
        textAlign: "center",
        paddingHorizontal: 30,
    },
    emptyAddBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#0D9488",
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 14,
    },
    emptyAddBtnTxt: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "700",
    },

    // Section Titles
    nextUpSection: {
        marginBottom: 4,
    },
    sectionTitleTxt: {
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 0.8,
        marginBottom: 8,
    },

    // Timeline View
    timelineContent: {
        paddingHorizontal: 16,
        paddingBottom: 110,
    },
    timelineRow: {
        flexDirection: "row",
        marginBottom: 12,
    },
    timelineTimeCol: {
        width: 65,
        paddingTop: 4,
    },
    timelineTimeTxt: {
        fontSize: 11,
        fontWeight: "700",
    },
    timelineLineCol: {
        width: 16,
        alignItems: "center",
        borderLeftWidth: 2,
        marginLeft: 4,
        marginRight: 8,
    },
    timelineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#0D9488",
        marginTop: 4,
        marginLeft: -11,
    },
    timelineSlotCol: {
        flex: 1,
    },
    emptySlotBox: {
        borderWidth: 1,
        borderStyle: "dashed",
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: "center",
    },
    emptySlotTxt: {
        fontSize: 11,
        fontWeight: "500",
    },

    // FAB
    fabBtn: {
        position: "absolute",
        bottom: 88,
        right: 20,
        width: 52,
        height: 52,
        borderRadius: 26,
        overflow: "hidden",
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
    },
    fabGradient: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },

    // Actions Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "flex-end",
    },
    modalCard: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 36,
    },
    modalHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#CBD5E1",
        alignSelf: "center",
        marginBottom: 16,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 14,
    },
    modalPatientName: {
        fontSize: 17,
        fontWeight: "800",
    },
    modalSubTxt: {
        fontSize: 12,
        marginTop: 2,
    },
    notesBox: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    notesBoxTxt: {
        fontSize: 12,
        flex: 1,
        lineHeight: 16,
    },
    actionSectionTitle: {
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 0.8,
        marginBottom: 10,
    },
    statusOptionRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 18,
    },
    statusOptBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    statusOptTxt: {
        fontSize: 12,
        fontWeight: "700",
    },
    modalDivider: {
        height: 1,
        backgroundColor: "#E2E8F0",
        marginBottom: 14,
    },
    modalDeleteBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 10,
    },
    modalDeleteTxt: {
        color: "#EF4444",
        fontSize: 14,
        fontWeight: "700",
    },
});
