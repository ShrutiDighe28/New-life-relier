import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/utils/themeManager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Section Card (collapsible) ───────────────────────────────────────────────
function SectionCard({
    title, icon, iconColor, iconBg, children, isDark, colors, defaultOpen = true,
}: {
    title: string; icon: string; iconColor: string; iconBg: string;
    children: React.ReactNode; isDark: boolean; colors: any; defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <View style={[sx.card, { backgroundColor: isDark ? colors.card : "#FFF", borderColor: isDark ? colors.cardBorder : "#E8EFF5" }]}>
            <TouchableOpacity style={sx.header} onPress={() => setOpen(o => !o)} activeOpacity={0.7}>
                <View style={[sx.iconWrap, { backgroundColor: iconBg }]}>
                    <MaterialCommunityIcons name={icon as any} size={17} color={iconColor} />
                </View>
                <Text style={[sx.title, { color: colors.text }]}>{title}</Text>
                <MaterialCommunityIcons
                    name={open ? "chevron-up" : "chevron-down"}
                    size={20} color={colors.textSecondary}
                />
            </TouchableOpacity>
            {open && <View style={sx.body}>{children}</View>}
        </View>
    );
}

const sx = StyleSheet.create({
    card:    { borderRadius: 20, borderWidth: 1, marginBottom: 14, overflow: "hidden" },
    header:  { flexDirection: "row", alignItems: "center", gap: 10, padding: 16 },
    iconWrap:{ width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    title:   { flex: 1, fontSize: 15, fontWeight: "800", letterSpacing: -0.2 },
    body:    { paddingHorizontal: 16, paddingBottom: 16 },
});

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: any }) {
    return (
        <View style={ir.row}>
            <View style={ir.iconWrap}>
                <MaterialCommunityIcons name={icon as any} size={16} color="#64748B" />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[ir.label, { color: colors.textSecondary }]}>{label}</Text>
                <Text style={[ir.value, { color: colors.text }]}>{value}</Text>
            </View>
        </View>
    );
}

const ir = StyleSheet.create({
    row:     { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
    iconWrap:{ width: 34, height: 34, borderRadius: 10, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
    label:   { fontSize: 11, fontWeight: "500" },
    value:   { fontSize: 14, fontWeight: "700", marginTop: 1 },
});

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, color, bg, isDark, colors }: {
    icon: string; value: string; label: string;
    color: string; bg: string; isDark: boolean; colors: any;
}) {
    return (
        <View style={[st.card, { backgroundColor: isDark ? colors.card : "#FFF", borderColor: isDark ? colors.cardBorder : "#E8EFF5" }]}>
            <View style={[st.iconWrap, { backgroundColor: bg }]}>
                <MaterialCommunityIcons name={icon as any} size={18} color={color} />
            </View>
            <Text style={[st.value, { color }]}>{value}</Text>
            <Text style={[st.label, { color: colors.textSecondary }]}>{label}</Text>
        </View>
    );
}

const st = StyleSheet.create({
    card:    { flex: 1, borderRadius: 16, borderWidth: 1, padding: 12, alignItems: "center", gap: 3 },
    iconWrap:{ width: 36, height: 36, borderRadius: 11, justifyContent: "center", alignItems: "center", marginBottom: 4 },
    value:   { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
    label:   { fontSize: 10, fontWeight: "600", textAlign: "center" },
});

// ─── Quick Action Button ──────────────────────────────────────────────────────
function QuickAction({ icon, label, color, bg, onPress }: {
    icon: string; label: string; color: string; bg: string; onPress: () => void;
}) {
    return (
        <TouchableOpacity style={qa.btn} onPress={onPress} activeOpacity={0.8}>
            <View style={[qa.iconWrap, { backgroundColor: bg }]}>
                <MaterialCommunityIcons name={icon as any} size={20} color={color} />
            </View>
            <Text style={qa.label} numberOfLines={1}>{label}</Text>
        </TouchableOpacity>
    );
}

const qa = StyleSheet.create({
    btn:     { flex: 1, alignItems: "center", gap: 6 },
    iconWrap:{ width: 52, height: 52, borderRadius: 16, justifyContent: "center", alignItems: "center" },
    label:   { fontSize: 11, fontWeight: "600", color: "#64748B", textAlign: "center" },
});

// ─── Menu Item ────────────────────────────────────────────────────────────────
function MenuItem({
    icon, iconColor, iconBg, label, labelColor, onPress, isDark, colors,
    trailing, isLast,
}: {
    icon: string; iconColor: string; iconBg: string; label: string;
    labelColor?: string; onPress?: () => void; isDark: boolean; colors: any;
    trailing?: React.ReactNode; isLast?: boolean;
}) {
    return (
        <TouchableOpacity
            style={[mi.row, !isLast && { borderBottomWidth: 1, borderBottomColor: isDark ? "#1E293B" : "#F1F5F9" }]}
            onPress={onPress} activeOpacity={0.7}
        >
            <View style={[mi.iconWrap, { backgroundColor: iconBg }]}>
                <MaterialCommunityIcons name={icon as any} size={17} color={iconColor} />
            </View>
            <Text style={[mi.label, { color: labelColor ?? colors.text }]}>{label}</Text>
            {trailing ?? <MaterialCommunityIcons name="chevron-right" size={18} color="#CBD5E1" />}
        </TouchableOpacity>
    );
}

const mi = StyleSheet.create({
    row:     { flexDirection: "row", alignItems: "center", paddingVertical: 13, gap: 12 },
    iconWrap:{ width: 36, height: 36, borderRadius: 11, justifyContent: "center", alignItems: "center" },
    label:   { flex: 1, fontSize: 14, fontWeight: "600" },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DoctorProfileScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { colors, isDark, toggleTheme } = useTheme();

    // ── All existing data bindings (unchanged) ──
    const doctorName      = user?.fullName || "Dr. Sarah Jenkins";
    const doctorEmail     = user?.email    || "sarah.jenkins@liferelier.com";
    const doctorMobile    = user?.mobile   || "+91 98765 43210";
    const rawData         = (user as any)?.rawApiData || {};
    const specialization  = rawData.specialization   || "Cardiologist";
    const qualification   = rawData.qualification    || "MBBS, MD (Cardiology)";
    const regNumber       = rawData.regNumber        || "MCI-884920";
    const hospitalName    = rawData.hospitalName     || "LifeRelier Cardiac Super Speciality Hospital";
    const consultationFee = rawData.consultationFee  ? `₹ ${rawData.consultationFee}` : "₹ 800";
    const experience      = rawData.experience       ? `${rawData.experience}+ Yrs` : "8+ Yrs";
    const displayName     = doctorName.startsWith("Dr.") ? doctorName : `Dr. ${doctorName}`;

    // ── Local UI state ──
    const [notifEnabled, setNotifEnabled] = useState(true);

    const handleLogout = async () => {
        Alert.alert("Logout", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout", style: "destructive",
                onPress: async () => { await logout(); router.replace("/welcome"); },
            },
        ]);
    };

    const C = { backgroundColor: isDark ? colors.card : "#FFF", borderColor: isDark ? colors.cardBorder : "#E8EFF5" };

    return (
        <SafeAreaView style={[s.root, { backgroundColor: colors.background }]} edges={["top"]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

                {/* ── HERO HEADER ── */}
                <LinearGradient
                    colors={["#0D9488", "#0A6E66"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={s.hero}
                >
                    {/* Edit button top-right */}
                    <TouchableOpacity
                        style={s.editBtn}
                        onPress={() => router.push("/doctor/create-profile")}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="pencil-outline" size={17} color="#FFF" />
                    </TouchableOpacity>

                    {/* Avatar */}
                    <View style={s.avatarRing}>
                        <Image
                            source={require("@/assets/images/dashboard/doctor.png")}
                            style={s.avatarImg}
                        />
                    </View>

                    {/* Verified badge */}
                    <View style={s.verifiedBadge}>
                        <MaterialCommunityIcons name="shield-check" size={13} color="#0D9488" />
                        <Text style={s.verifiedTxt}>Verified</Text>
                    </View>

                    <Text style={s.heroName}>{displayName}</Text>
                    <Text style={s.heroSpec}>{specialization}</Text>
                    <Text style={s.heroHosp} numberOfLines={1}>{hospitalName}</Text>

                    {/* Badges row */}
                    <View style={s.heroBadges}>
                        <View style={s.heroBadge}>
                            <MaterialCommunityIcons name="star" size={13} color="#FCD34D" />
                            <Text style={s.heroBadgeTxt}>4.9 · 128 reviews</Text>
                        </View>
                        <View style={s.heroBadge}>
                            <MaterialCommunityIcons name="briefcase-outline" size={13} color="#FFF" />
                            <Text style={s.heroBadgeTxt}>{experience} Experience</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* ── STATS ROW ── */}
                <View style={s.statsRow}>
                    <StatCard icon="account-group-outline" value="340+"  label="Patients"      color="#0D9488" bg="#F0FDFA" isDark={isDark} colors={colors} />
                    <StatCard icon="calendar-check-outline" value="1.2k" label="Appointments"  color="#2563EB" bg="#EFF6FF" isDark={isDark} colors={colors} />
                    <StatCard icon="clock-outline"          value={experience} label="Experience" color="#D97706" bg="#FEF3C7" isDark={isDark} colors={colors} />
                    <StatCard icon="star-outline"           value="4.9"   label="Rating"       color="#9333EA" bg="#FDF4FF" isDark={isDark} colors={colors} />
                </View>

                {/* ── QUICK ACTIONS ── */}
                <View style={[s.quickCard, C]}>
                    <QuickAction icon="calendar-month-outline" label="Schedule"  color="#0D9488" bg="#F0FDFA"
                        onPress={() => router.push("/(tabs)/schedule" as any)} />
                    <QuickAction icon="account-group-outline"  label="Patients"  color="#2563EB" bg="#EFF6FF"
                        onPress={() => router.push("/(tabs)/patients" as any)} />
                    <QuickAction icon="file-chart-outline"     label="Reports"   color="#D97706" bg="#FEF3C7"
                        onPress={() => Alert.alert("Reports", "No reports screen yet. Coming soon!")} />
                    <QuickAction icon="cog-outline"            label="Settings"  color="#7C3AED" bg="#EDE9FE"
                        onPress={() => router.push("/doctor/create-profile")} />
                </View>

                {/* ── CONTACT INFO ── */}
                <SectionCard title="Contact Information" icon="card-account-details-outline"
                    iconColor="#0D9488" iconBg="#F0FDFA" isDark={isDark} colors={colors}>
                    <InfoRow icon="email-outline"    label="Email Address" value={doctorEmail}  colors={colors} />
                    <InfoRow icon="phone-outline"    label="Mobile Number" value={doctorMobile} colors={colors} />
                    <InfoRow icon="map-marker-outline" label="Clinic Address" value="Apollo Towers, Sector 12, Navi Mumbai, MH 400703" colors={colors} />
                </SectionCard>

                {/* ── PROFESSIONAL DETAILS ── */}
                <SectionCard title="Professional Details" icon="stethoscope"
                    iconColor="#2563EB" iconBg="#EFF6FF" isDark={isDark} colors={colors}>
                    <InfoRow icon="school-outline"        label="Qualification"       value={qualification}   colors={colors} />
                    <InfoRow icon="card-text-outline"     label="Registration Number" value={regNumber}       colors={colors} />
                    <InfoRow icon="hospital-building"     label="Hospital / Clinic"   value={hospitalName}   colors={colors} />
                    <InfoRow icon="currency-inr"          label="Consultation Fee"    value={consultationFee} colors={colors} />
                    <InfoRow icon="briefcase-outline"     label="Experience"          value={experience}      colors={colors} />
                    <InfoRow icon="heart-pulse"           label="Department"          value="Cardiology"      colors={colors} />
                </SectionCard>

                {/* ── AVAILABILITY ── */}
                <SectionCard title="Availability & Hours" icon="clock-outline"
                    iconColor="#D97706" iconBg="#FEF3C7" isDark={isDark} colors={colors} defaultOpen={false}>
                    {[
                        { day: "Monday – Friday", time: "09:00 AM – 05:00 PM", active: true  },
                        { day: "Saturday",         time: "09:00 AM – 01:00 PM", active: true  },
                        { day: "Sunday",           time: "Off",                  active: false },
                    ].map((row, i) => (
                        <View key={i} style={[av.row, i < 2 && { borderBottomWidth: 1, borderBottomColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
                            <Text style={[av.day, { color: colors.text }]}>{row.day}</Text>
                            <View style={[av.timePill, { backgroundColor: row.active ? "#F0FDFA" : "#F8FAFC" }]}>
                                <Text style={[av.time, { color: row.active ? "#0D9488" : "#94A3B8" }]}>{row.time}</Text>
                            </View>
                        </View>
                    ))}
                </SectionCard>

                {/* ── ABOUT ── */}
                <SectionCard title="About" icon="information-outline"
                    iconColor="#9333EA" iconBg="#FDF4FF" isDark={isDark} colors={colors} defaultOpen={false}>
                    <Text style={[s.aboutTxt, { color: colors.textSecondary }]}>
                        Senior Consultant Cardiologist with over 8 years of clinical experience specialising in non-invasive cardiology, heart failure management, and preventive cardiac care. Committed to evidence-based practice and patient-centred healthcare delivery.
                    </Text>
                </SectionCard>

                {/* ── SETTINGS ── */}
                <View style={[s.menuCard, C]}>
                    <Text style={[s.menuSection, { color: colors.textSecondary }]}>ACCOUNT</Text>

                    <MenuItem icon="account-edit-outline" iconColor="#0D9488" iconBg="#F0FDFA"
                        label="Edit Profile" isDark={isDark} colors={colors}
                        onPress={() => router.push("/doctor/create-profile")} />

                    <MenuItem icon="clock-edit-outline" iconColor="#2563EB" iconBg="#EFF6FF"
                        label="Availability Settings" isDark={isDark} colors={colors}
                        onPress={() => router.push("/(tabs)/schedule" as any)} />

                    <MenuItem icon="currency-inr" iconColor="#D97706" iconBg="#FEF3C7"
                        label="Consultation Fee" isDark={isDark} colors={colors}
                        onPress={() => Alert.alert("Consultation Fee", `Current fee: ${consultationFee}`)} />

                    <Text style={[s.menuSection, { color: colors.textSecondary, marginTop: 16 }]}>PREFERENCES</Text>

                    <MenuItem icon="bell-outline" iconColor="#7C3AED" iconBg="#EDE9FE"
                        label="Notifications" isDark={isDark} colors={colors}
                        trailing={
                            <Switch
                                value={notifEnabled}
                                onValueChange={setNotifEnabled}
                                trackColor={{ false: "#CBD5E1", true: "#0D9488" }}
                                thumbColor="#FFF"
                                style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                            />
                        }
                    />

                    <MenuItem icon="theme-light-dark" iconColor="#0D9488" iconBg="#F0FDFA"
                        label="Dark Mode" isDark={isDark} colors={colors}
                        trailing={
                            <Switch
                                value={isDark}
                                onValueChange={() => toggleTheme()}
                                trackColor={{ false: "#CBD5E1", true: "#0D9488" }}
                                thumbColor="#FFF"
                                style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                            />
                        }
                    />

                    <Text style={[s.menuSection, { color: colors.textSecondary, marginTop: 16 }]}>SECURITY & SUPPORT</Text>

                    <MenuItem icon="shield-lock-outline" iconColor="#DC2626" iconBg="#FEF2F2"
                        label="Privacy & Security" isDark={isDark} colors={colors}
                        onPress={() => Alert.alert("Privacy & Security", "Opening security settings")} />

                    <MenuItem icon="lock-reset" iconColor="#64748B" iconBg="#F1F5F9"
                        label="Change Password" isDark={isDark} colors={colors}
                        onPress={() => Alert.alert("Change Password", "Opening password change")} />

                    <MenuItem icon="help-circle-outline" iconColor="#2563EB" iconBg="#EFF6FF"
                        label="Help & Support" isDark={isDark} colors={colors}
                        onPress={() => Alert.alert("Help & Support", "Opening support center")} />

                    <MenuItem icon="information-outline" iconColor="#64748B" iconBg="#F1F5F9"
                        label="About App" isDark={isDark} colors={colors}
                        onPress={() => Alert.alert("LifeRelier", "Version 1.0.0\nBuilt with ❤️ for healthcare")}
                        isLast />
                </View>

                {/* ── LOGOUT ── */}
                <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
                    <MaterialCommunityIcons name="logout" size={18} color="#DC2626" />
                    <Text style={s.logoutTxt}>Log Out</Text>
                </TouchableOpacity>

                <Text style={[s.version, { color: colors.textSecondary }]}>LifeRelier v1.0.0</Text>

            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Availability row styles ──────────────────────────────────────────────────
const av = StyleSheet.create({
    row:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 11 },
    day:     { fontSize: 13, fontWeight: "600" },
    timePill:{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9 },
    time:    { fontSize: 12, fontWeight: "700" },
});

// ─── Main styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root:   { flex: 1 },
    scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },

    // Hero
    hero:          { borderRadius: 26, padding: 24, alignItems: "center", marginBottom: 16, shadowColor: "#0D9488", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.28, shadowRadius: 16, elevation: 8 },
    editBtn:       { position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
    avatarRing:    { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "#FFF", overflow: "hidden", marginBottom: 6 },
    avatarImg:     { width: "100%", height: "100%", resizeMode: "cover" },
    verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FFF", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginBottom: 10 },
    verifiedTxt:   { fontSize: 11, fontWeight: "800", color: "#0D9488" },
    heroName:      { color: "#FFF", fontSize: 21, fontWeight: "800", letterSpacing: -0.4, textAlign: "center" },
    heroSpec:      { color: "#CCFBF1", fontSize: 13, fontWeight: "600", marginTop: 3 },
    heroHosp:      { color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: "500", marginTop: 3, textAlign: "center", paddingHorizontal: 20 },
    heroBadges:    { flexDirection: "row", gap: 9, marginTop: 14 },
    heroBadge:     { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    heroBadgeTxt:  { color: "#FFF", fontSize: 12, fontWeight: "700" },

    // Stats
    statsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },

    // Quick actions
    quickCard: { borderRadius: 20, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 18, marginBottom: 14 },

    // About
    aboutTxt: { fontSize: 13, lineHeight: 21, fontWeight: "400" },

    // Settings card
    menuCard:    { borderRadius: 20, borderWidth: 1, paddingHorizontal: 16, marginBottom: 14 },
    menuSection: { fontSize: 10, fontWeight: "800", letterSpacing: 1, marginTop: 8, marginBottom: 2 },

    // Logout
    logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA", height: 52, borderRadius: 16, marginBottom: 16 },
    logoutTxt: { color: "#DC2626", fontSize: 15, fontWeight: "700" },

    // Version
    version: { textAlign: "center", fontSize: 11, fontWeight: "500", marginBottom: 8 },
});
