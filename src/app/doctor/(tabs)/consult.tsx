import { useTheme } from "@/utils/themeManager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DoctorHeader from "../components/DoctorHeader";

// ─── Mock Data (unchanged) ────────────────────────────────────────────────────
const UPCOMING_CALLS = [
    { id: "1", patient: "Aarav Sharma",  time: "10:30 AM", type: "Video Call", status: "Ready to Join", initials: "AS", age: 34, gender: "Male",   reason: "Hypertension Follow-up", avatarBg: "#CCFBF1", avatarColor: "#2563EB" },
    { id: "2", patient: "Priya Patel",   time: "11:45 AM", type: "Audio Call", status: "Scheduled",     initials: "PP", age: 28, gender: "Female", reason: "Diabetes Check-up",      avatarBg: "#EDE9FE", avatarColor: "#7C3AED" },
    { id: "3", patient: "Rajesh Verma",  time: "02:15 PM", type: "Video Call", status: "Scheduled",     initials: "RV", age: 52, gender: "Male",   reason: "Cardiac Review",         avatarBg: "#FEE2E2", avatarColor: "#DC2626" },
];

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { bg: string; color: string; icon: string }> = {
    "Ready to Join": { bg: "#F0FDF4", color: "#16A34A", icon: "check-circle-outline" },
    "Scheduled":     { bg: "#EFF6FF", color: "#2563EB", icon: "clock-outline" },
    "In Progress":   { bg: "#FFFBEB", color: "#D97706", icon: "progress-clock" },
};
const TYPE_CFG: Record<string, { icon: string; color: string; bg: string }> = {
    "Video Call": { icon: "video-outline",  color: "#2563EB", bg: "#F0FDFA" },
    "Audio Call": { icon: "phone-outline",  color: "#7C3AED", bg: "#EDE9FE" },
    "Chat":       { icon: "chat-outline",   color: "#2563EB", bg: "#EFF6FF" },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, bg, iconColor, valueColor, isDark, colors }: {
    icon: string; label: string; value: number;
    bg: string; iconColor: string; valueColor?: string;
    isDark: boolean; colors: any;
}) {
    return (
        <View style={[sc.card, { backgroundColor: isDark ? colors.card : "#FFF", borderColor: isDark ? colors.cardBorder : "#E8EFF5" }]}>
            <View style={[sc.iconWrap, { backgroundColor: bg }]}>
                <MaterialCommunityIcons name={icon as any} size={18} color={iconColor} />
            </View>
            <Text style={[sc.val, { color: valueColor ?? colors.text }]}>{value}</Text>
            <Text style={[sc.lbl, { color: colors.textSecondary }]}>{label}</Text>
        </View>
    );
}
const sc = StyleSheet.create({
    card:     { flex: 1, borderRadius: 18, borderWidth: 1, padding: 14, alignItems: "center", gap: 4 },
    iconWrap: { width: 38, height: 38, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 4 },
    val:      { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
    lbl:      { fontSize: 11, fontWeight: "600", textAlign: "center" },
});

// ─── Tool Card ────────────────────────────────────────────────────────────────
function ToolCard({ icon, title, subtitle, bg, iconColor, isDark, colors, onPress }: {
    icon: string; title: string; subtitle: string;
    bg: string; iconColor: string;
    isDark: boolean; colors: any; onPress: () => void;
}) {
    return (
        <TouchableOpacity activeOpacity={0.82} onPress={onPress}
            style={[tc.card, { backgroundColor: isDark ? colors.card : "#FFF", borderColor: isDark ? colors.cardBorder : "#E8EFF5" }]}>
            <View style={[tc.iconWrap, { backgroundColor: bg }]}>
                <MaterialCommunityIcons name={icon as any} size={22} color={iconColor} />
            </View>
            <Text style={[tc.title, { color: colors.text }]}>{title}</Text>
            <Text style={[tc.sub, { color: colors.textSecondary }]} numberOfLines={2}>{subtitle}</Text>
            <View style={tc.arrow}>
                <MaterialCommunityIcons name="chevron-right" size={14} color={iconColor} />
            </View>
        </TouchableOpacity>
    );
}
const tc = StyleSheet.create({
    card:     { flex: 1, borderRadius: 20, borderWidth: 1.5, padding: 16, gap: 4, position: "relative" },
    iconWrap: { width: 46, height: 46, borderRadius: 14, justifyContent: "center", alignItems: "center", marginBottom: 8 },
    title:    { fontSize: 14, fontWeight: "800", letterSpacing: -0.2 },
    sub:      { fontSize: 12, fontWeight: "500", lineHeight: 17 },
    arrow:    { position: "absolute", top: 14, right: 14 },
});

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, colors }: { title: string; subtitle?: string; colors: any }) {
    return (
        <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: colors.text, letterSpacing: -0.3 }}>{title}</Text>
            {subtitle ? <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2, fontWeight: "500" }}>{subtitle}</Text> : null}
        </View>
    );
}

// ─── Vital Pill ───────────────────────────────────────────────────────────────
function VitalPill({ label, value, icon }: { label: string; value: string; icon: string }) {
    return (
        <View style={vp.wrap}>
            <MaterialCommunityIcons name={icon as any} size={13} color="rgba(255,255,255,0.75)" />
            <View>
                <Text style={vp.label}>{label}</Text>
                <Text style={vp.value}>{value}</Text>
            </View>
        </View>
    );
}
const vp = StyleSheet.create({
    wrap:  { flex: 1, flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "rgba(255,255,255,0.14)", borderRadius: 14, paddingHorizontal: 10, paddingVertical: 10 },
    label: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: "600" },
    value: { color: "#FFFFFF", fontSize: 13, fontWeight: "800", marginTop: 1 },
});

// ─── Consult Card ─────────────────────────────────────────────────────────────
function ConsultCard({ call, isDark, colors }: { call: typeof UPCOMING_CALLS[0]; isDark: boolean; colors: any }) {
    const st = STATUS_CFG[call.status] ?? STATUS_CFG["Scheduled"];
    const tp = TYPE_CFG[call.type] ?? TYPE_CFG["Video Call"];
    const isReady = call.status === "Ready to Join";
    return (
        <View style={[cc.card, {
            backgroundColor: isDark ? colors.card : "#FFF",
            borderColor: isReady ? "#16A34A40" : (isDark ? colors.cardBorder : "#E8EFF5"),
            borderLeftColor: isReady ? "#16A34A" : (isDark ? colors.cardBorder : "#E8EFF5"),
            borderLeftWidth: isReady ? 3 : 1,
        }]}>
            {/* Avatar + name + badges */}
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                <View style={[cc.avatar, { backgroundColor: call.avatarBg }]}>
                    <Text style={[cc.avatarTxt, { color: call.avatarColor }]}>{call.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[cc.name, { color: colors.text }]}>{call.patient}</Text>
                    <Text style={[cc.meta, { color: colors.textSecondary }]}>{call.age} yrs · {call.gender}</Text>
                    <View style={cc.reasonRow}>
                        <MaterialCommunityIcons name="stethoscope" size={11} color="#2563EB" />
                        <Text style={cc.reasonTxt} numberOfLines={1}>{call.reason}</Text>
                    </View>
                </View>
                <View style={{ alignItems: "flex-end", gap: 5 }}>
                    <View style={[cc.badge, { backgroundColor: st.bg }]}>
                        <MaterialCommunityIcons name={st.icon as any} size={9} color={st.color} />
                        <Text style={[cc.badgeTxt, { color: st.color }]}>{call.status}</Text>
                    </View>
                    <View style={[cc.badge, { backgroundColor: tp.bg }]}>
                        <MaterialCommunityIcons name={tp.icon as any} size={9} color={tp.color} />
                        <Text style={[cc.badgeTxt, { color: tp.color }]}>{call.type}</Text>
                    </View>
                </View>
            </View>
            {/* Divider */}
            <View style={{ height: 1, backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }} />
            {/* Time + actions */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <MaterialCommunityIcons name="clock-outline" size={13} color={colors.textSecondary} />
                    <Text style={{ fontSize: 13, fontWeight: "700", color: colors.textSecondary }}>{call.time}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity style={[cc.iconBtn, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}
                        onPress={() => Alert.alert("Message", `Send message to ${call.patient}`)} activeOpacity={0.75}>
                        <MaterialCommunityIcons name="message-text-outline" size={15} color="#2563EB" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[cc.iconBtn, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}
                        onPress={() => Alert.alert("Notes", `Opening notes for ${call.patient}`)} activeOpacity={0.75}>
                        <MaterialCommunityIcons name="notebook-outline" size={15} color="#7C3AED" />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.82}
                        style={[cc.joinBtn, { backgroundColor: isReady ? "#16A34A" : "#2563EB" }]}
                        onPress={() => Alert.alert("Join Consultation", `Starting ${call.type} with ${call.patient}`)}>
                        <MaterialCommunityIcons name={isReady ? "video" : "video-outline"} size={14} color="#FFF" />
                        <Text style={cc.joinTxt}>{isReady ? "Join Now" : "Start"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
const cc = StyleSheet.create({
    card:      { borderRadius: 20, borderWidth: 1, padding: 16, gap: 12, overflow: "hidden" },
    avatar:    { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
    avatarTxt: { fontSize: 16, fontWeight: "800" },
    name:      { fontSize: 15, fontWeight: "800", letterSpacing: -0.2 },
    meta:      { fontSize: 12, marginTop: 2, fontWeight: "500" },
    reasonRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5, backgroundColor: "#F0FDFA", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: "flex-start" },
    reasonTxt: { fontSize: 11, color: "#0F766E", fontWeight: "600" },
    badge:     { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    badgeTxt:  { fontSize: 9, fontWeight: "800" },
    iconBtn:   { width: 34, height: 34, borderRadius: 11, justifyContent: "center", alignItems: "center" },
    joinBtn:   { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
    joinTxt:   { color: "#FFF", fontSize: 13, fontWeight: "700" },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DoctorConsultScreen() {
    const { colors, isDark } = useTheme();

    const stats = React.useMemo(() => ({
        total:   UPCOMING_CALLS.length,
        waiting: UPCOMING_CALLS.filter((c) => c.status === "Scheduled").length,
        ready:   UPCOMING_CALLS.filter((c) => c.status === "Ready to Join").length,
    }), []);

    const active = UPCOMING_CALLS[0];

    return (
        <SafeAreaView style={[s.root, { backgroundColor: colors.background }]} edges={["top"]}>
            <DoctorHeader title="Virtual Clinic" showThemeToggle />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

                {/* Online status badge */}
                <View style={s.header}>
                    <View style={{ flex: 1 }} />
                    <View style={s.onlineBadge}>
                        <View style={s.pulseDot} />
                        <Text style={s.onlineText}>Online</Text>
                    </View>
                </View>

                {/* STATS */}
                <View style={s.statRow}>
                    <StatCard icon="account-group-outline" label="Today"   value={stats.total}   bg="#F0FDFA" iconColor="#2563EB"                    isDark={isDark} colors={colors} />
                    <StatCard icon="clock-outline"         label="Waiting" value={stats.waiting} bg="#EFF6FF" iconColor="#2563EB" valueColor="#2563EB" isDark={isDark} colors={colors} />
                    <StatCard icon="check-circle-outline"  label="Ready"   value={stats.ready}   bg="#F0FDF4" iconColor="#16A34A" valueColor="#16A34A" isDark={isDark} colors={colors} />
                </View>

                {/* ACTIVE WAITING ROOM */}
                <LinearGradient colors={["#2563EB", "#0A6E66"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.lobbyCard}>
                    <View style={s.lobbyLabelRow}>
                        <View style={s.liveChip}>
                            <View style={s.liveDot} />
                            <Text style={s.liveText}>LIVE</Text>
                        </View>
                        <Text style={s.lobbyLabel}>Active Waiting Room</Text>
                    </View>
                    <View style={s.lobbyPatientRow}>
                        <View style={[s.lobbyAvatar, { backgroundColor: active.avatarBg }]}>
                            <Text style={[s.lobbyAvatarTxt, { color: active.avatarColor }]}>{active.initials}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.lobbyPatientName}>{active.patient}</Text>
                            <Text style={s.lobbyPatientSub}>{active.age} yrs · {active.gender} · {active.time}</Text>
                            <View style={s.lobbyReasonChip}>
                                <MaterialCommunityIcons name="stethoscope" size={11} color="rgba(255,255,255,0.8)" />
                                <Text style={s.lobbyReasonTxt}>{active.reason}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={s.vitalsRow}>
                        <VitalPill label="Blood Pressure" value="120/80"  icon="heart-pulse" />
                        <VitalPill label="Heart Rate"     value="72 bpm"  icon="heart-outline" />
                        <VitalPill label="Temp"           value="98.6 °F" icon="thermometer" />
                    </View>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                        <TouchableOpacity activeOpacity={0.88} style={s.joinBtn}
                            onPress={() => Alert.alert("Join Consultation", `Starting Video Call with ${active.patient}`)}>
                            <MaterialCommunityIcons name="video" size={18} color="#2563EB" />
                            <Text style={s.joinBtnTxt}>Join Consultation Room</Text>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.82} style={s.notesBtn}
                            onPress={() => Alert.alert("Patient Notes", `Opening notes for ${active.patient}`)}>
                            <MaterialCommunityIcons name="notebook-outline" size={18} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* TOOLS */}
                <SectionHeader title="Consultation Tools" subtitle="Quick access to clinical utilities" colors={colors} />
                <View style={s.toolsRow}>
                    <ToolCard icon="file-document-edit-outline" title="E-Prescription" subtitle="Write & send digital Rx to patient"
                        bg="#F0FDFA" iconColor="#2563EB" isDark={isDark} colors={colors}
                        onPress={() => Alert.alert("E-Prescription", "Opening prescription editor")} />
                    <ToolCard icon="notebook-outline" title="Clinical Notes" subtitle="Add SOAP notes & observations"
                        bg="#EFF6FF" iconColor="#2563EB" isDark={isDark} colors={colors}
                        onPress={() => Alert.alert("Clinical Notes", "Opening notes editor")} />
                </View>
                <View style={[s.toolsRow, { marginBottom: 28 }]}>
                    <ToolCard icon="test-tube-outline" title="Lab Orders" subtitle="Request diagnostic tests"
                        bg="#FEF3C7" iconColor="#D97706" isDark={isDark} colors={colors}
                        onPress={() => Alert.alert("Lab Orders", "Opening lab order form")} />
                    <ToolCard icon="calendar-plus-outline" title="Follow-up" subtitle="Schedule next appointment"
                        bg="#FDF4FF" iconColor="#9333EA" isDark={isDark} colors={colors}
                        onPress={() => Alert.alert("Follow-up", "Opening follow-up scheduler")} />
                </View>

                {/* UPCOMING LIST */}
                <SectionHeader title="Upcoming Consultations" subtitle={`${UPCOMING_CALLS.length} sessions scheduled today`} colors={colors} />
                <View style={{ gap: 12, paddingBottom: 40 }}>
                    {UPCOMING_CALLS.map((call) => (
                        <ConsultCard key={call.id} call={call} isDark={isDark} colors={colors} />
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Main Styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root:   { flex: 1 },
    scroll: { paddingHorizontal: 16, paddingTop: 16 },
    // Header
    header:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    headerTitle: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
    headerSub:   { fontSize: 13, fontWeight: "500", marginTop: 3 },
    onlineBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#F0FDF4", borderWidth: 1, borderColor: "#BBF7D0", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
    pulseDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: "#16A34A" },
    onlineText:  { color: "#166534", fontSize: 12, fontWeight: "700" },
    // Stats
    statRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
    // Lobby
    lobbyCard:        { borderRadius: 26, padding: 20, marginBottom: 28, shadowColor: "#2563EB", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.28, shadowRadius: 16, elevation: 8 },
    lobbyLabelRow:    { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 },
    liveChip:         { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.22)", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10, gap: 5 },
    liveDot:          { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FFFFFF" },
    liveText:         { color: "#FFFFFF", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
    lobbyLabel:       { color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: "700" },
    lobbyPatientRow:  { flexDirection: "row", alignItems: "flex-start", gap: 14, marginBottom: 18 },
    lobbyAvatar:      { width: 54, height: 54, borderRadius: 27, justifyContent: "center", alignItems: "center" },
    lobbyAvatarTxt:   { fontSize: 18, fontWeight: "800" },
    lobbyPatientName: { color: "#FFFFFF", fontSize: 19, fontWeight: "800", letterSpacing: -0.3 },
    lobbyPatientSub:  { color: "rgba(255,255,255,0.72)", fontSize: 12, fontWeight: "500", marginTop: 3 },
    lobbyReasonChip:  { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10, marginTop: 8, alignSelf: "flex-start" },
    lobbyReasonTxt:   { color: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: "600" },
    vitalsRow:        { flexDirection: "row", gap: 8, marginBottom: 18 },
    joinBtn:          { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", height: 50, borderRadius: 16, gap: 8 },
    joinBtnTxt:       { color: "#2563EB", fontSize: 15, fontWeight: "800" },
    notesBtn:         { width: 50, height: 50, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
    // Tools
    toolsRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
});
