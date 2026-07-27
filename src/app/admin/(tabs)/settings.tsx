import React from "react";
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Switch, Alert, Modal, Pressable, TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/utils/themeManager";
import LogoBrand from "@/components/LogoBrand";

const BLUE = "#2563EB";

export default function AdminSettingsScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { colors, isDark, toggleTheme } = useTheme();

    const [notifAppointments, setNotifAppointments] = React.useState(true);
    const [notifEmergency,    setNotifEmergency]    = React.useState(true);
    const [notifReports,      setNotifReports]      = React.useState(true);
    const [notifSystem,       setNotifSystem]       = React.useState(false);
    const [twoFA,             setTwoFA]             = React.useState(false);
    const [autoBackup,        setAutoBackup]        = React.useState(true);
    const [showPassModal,     setShowPassModal]      = React.useState(false);
    const [showEditModal,     setShowEditModal]      = React.useState(false);

    const adminName  = user?.fullName  || "Admin User";
    const adminEmail = user?.email     || "admin@liferelier.com";
    const adminPhone = user?.mobile    || "+91 98765 00000";
    const C = { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isDark ? colors.cardBorder : "#E8EFF5" };

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to log out of the admin portal?", [
            { text: "Cancel", style: "cancel" },
            { text: "Logout", style: "destructive", onPress: async () => { await logout(); router.replace("/admin/login"); } },
        ]);
    };

    const Row = ({ icon, label, subtitle, onPress, danger = false }: {
        icon: string; label: string; subtitle?: string; onPress?: () => void; danger?: boolean;
    }) => (
        <TouchableOpacity style={[s.menuRow, { borderColor: isDark ? "#334155" : "#F1F5F9" }]} onPress={onPress} activeOpacity={0.7}>
            <View style={[s.menuIco, { backgroundColor: danger ? "#FEF2F2" : (isDark ? "#1E293B" : "#EFF6FF") }]}>
                <MaterialCommunityIcons name={icon as any} size={18} color={danger ? "#EF4444" : BLUE} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: danger ? "#EF4444" : colors.text }}>{label}</Text>
                {subtitle && <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 1 }}>{subtitle}</Text>}
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color="#94A3B8" />
        </TouchableOpacity>
    );

    const SwitchRow = ({ icon, label, subtitle, value, onChange }: {
        icon: string; label: string; subtitle?: string; value: boolean; onChange: (v: boolean) => void;
    }) => (
        <View style={[s.menuRow, { borderColor: isDark ? "#334155" : "#F1F5F9" }]}>
            <View style={[s.menuIco, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                <MaterialCommunityIcons name={icon as any} size={18} color={BLUE} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>{label}</Text>
                {subtitle && <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 1 }}>{subtitle}</Text>}
            </View>
            <Switch value={value} onValueChange={onChange} trackColor={{ false: "#767577", true: BLUE }} />
        </View>
    );

    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <View style={{ marginBottom: 22 }}>
            <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>{title.toUpperCase()}</Text>
            <View style={[s.sectionCard, C]}>
                {children}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[s.root, { backgroundColor: colors.background }]} edges={["top"]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

                {/* HEADER */}
                <View style={s.header}>
                    <LogoBrand size={24} fontSize={16} style={{ marginBottom: 5 }} />
                    <Text style={[s.title, { color: colors.text }]}>Settings</Text>
                </View>

                {/* ADMIN PROFILE HERO */}
                <LinearGradient colors={["#1E3A8A","#2563EB"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.profileCard}>
                    <View style={s.profileAvt}>
                        <Text style={{ color: BLUE, fontSize: 22, fontWeight: "800" }}>{adminName.slice(0, 2).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={{ color: "#FFF", fontSize: 17, fontWeight: "800" }}>{adminName}</Text>
                        <Text style={{ color: "#BFDBFE", fontSize: 12, marginTop: 2 }}>{adminEmail}</Text>
                        <View style={s.adminBadge}>
                            <MaterialCommunityIcons name="shield-crown-outline" size={11} color="#FFF" />
                            <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "700" }}>Super Administrator</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => setShowEditModal(true)} hitSlop={8} activeOpacity={0.8}>
                        <MaterialCommunityIcons name="pencil-outline" size={20} color="#BFDBFE" />
                    </TouchableOpacity>
                </LinearGradient>

                {/* QUICK STATS */}
                <View style={{ flexDirection: "row", gap: 10, marginBottom: 22 }}>
                    {[
                        { val: "48",    label: "Doctors"     },
                        { val: "2.8k",  label: "Patients"    },
                        { val: "99.8%", label: "Uptime"      },
                        { val: "v4.2",  label: "App Version" },
                    ].map((item, i) => (
                        <View key={i} style={[s.statBox, C]}>
                            <Text style={{ fontSize: 15, fontWeight: "800", color: colors.text }}>{item.val}</Text>
                            <Text style={{ fontSize: 9, color: colors.textSecondary, fontWeight: "600", marginTop: 2 }}>{item.label}</Text>
                        </View>
                    ))}
                </View>

                {/* ACCOUNT */}
                <Section title="Account">
                    <Row icon="account-edit-outline"   label="Edit Profile"       subtitle="Update name, phone, photo"  onPress={() => setShowEditModal(true)} />
                    <Row icon="lock-reset"             label="Change Password"    subtitle="Update login password"       onPress={() => setShowPassModal(true)} />
                    <Row icon="email-outline"          label="Email"              subtitle={adminEmail} />
                    <Row icon="phone-outline"          label="Phone"              subtitle={adminPhone} />
                </Section>

                {/* NOTIFICATIONS */}
                <Section title="Notifications">
                    <SwitchRow icon="calendar-clock"       label="Appointment Alerts"  subtitle="New and updated appointments" value={notifAppointments} onChange={setNotifAppointments} />
                    <SwitchRow icon="alarm-light-outline"  label="Emergency Alerts"    subtitle="Critical patient events"      value={notifEmergency}    onChange={setNotifEmergency}    />
                    <SwitchRow icon="file-chart-outline"   label="Report Notifications"subtitle="When reports are generated"   value={notifReports}      onChange={setNotifReports}      />
                    <SwitchRow icon="cog-outline"          label="System Alerts"       subtitle="Server and system events"     value={notifSystem}       onChange={setNotifSystem}       />
                </Section>

                {/* SECURITY */}
                <Section title="Security">
                    <SwitchRow icon="shield-key-outline"   label="Two-Factor Authentication" subtitle="Extra login protection" value={twoFA} onChange={setTwoFA} />
                    <Row icon="history"                    label="Login History"              subtitle="View recent sign-ins"  />
                    <Row icon="devices"                    label="Active Sessions"            subtitle="Manage logged-in devices" />
                </Section>

                {/* SYSTEM */}
                <Section title="System">
                    <SwitchRow icon="cloud-sync-outline"  label="Auto Backup"      subtitle="Daily data backup to cloud" value={autoBackup} onChange={setAutoBackup} />
                    <View style={[s.menuRow, { borderColor: isDark ? "#334155" : "#F1F5F9" }]}>
                        <View style={[s.menuIco, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                            <MaterialCommunityIcons name="weather-night" size={18} color={BLUE} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>Dark Mode</Text>
                            <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 1 }}>Toggle light / dark theme</Text>
                        </View>
                        <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: "#767577", true: BLUE }} />
                    </View>
                    <Row icon="database-settings-outline" label="Database Management" subtitle="Manage platform data" />
                    <Row icon="api"                        label="API Configuration"   subtitle="Manage endpoints and keys" />
                </Section>

                {/* SUPPORT */}
                <Section title="Support">
                    <Row icon="help-circle-outline"    label="Help & Documentation"  subtitle="Admin guides and FAQs" />
                    <Row icon="bug-outline"            label="Report a Bug"          subtitle="Send feedback to engineering" />
                    <Row icon="information-outline"    label="About LifeRelier"      subtitle="App version 4.2.0  •  Build 1024" />
                </Section>

                {/* DANGER ZONE */}
                <Section title="Danger Zone">
                    <Row icon="logout" label="Logout" subtitle="Sign out of admin portal" onPress={handleLogout} danger />
                    <Row icon="delete-sweep-outline" label="Clear All Data" subtitle="Permanently remove all records" danger
                        onPress={() => Alert.alert("Danger", "This action cannot be undone. All platform data will be permanently deleted.", [{ text: "Cancel", style: "cancel" }])} />
                </Section>

            </ScrollView>

            {/* CHANGE PASSWORD MODAL */}
            <Modal visible={showPassModal} transparent animationType="slide" onRequestClose={() => setShowPassModal(false)}>
                <Pressable style={s.overlay} onPress={() => setShowPassModal(false)}>
                    <View style={[s.sheet, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
                        <View style={[s.handle, { backgroundColor: isDark ? "#334155" : "#CBD5E1" }]} />
                        <Text style={[s.sheetTitle, { color: colors.text }]}>Change Password</Text>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20 }}>Enter your current password and choose a new one.</Text>
                        {["Current Password", "New Password", "Confirm New Password"].map((label) => (
                            <View key={label} style={{ marginBottom: 14 }}>
                                <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textSecondary, marginBottom: 5 }}>{label}</Text>
                                <View style={[s.formInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                                    <MaterialCommunityIcons name="lock-outline" size={16} color="#94A3B8" />
                                    <TextInput placeholder="••••••••" placeholderTextColor="#94A3B8" secureTextEntry
                                        style={{ flex: 1, color: colors.text, fontSize: 13, marginLeft: 8 }} />
                                </View>
                            </View>
                        ))}
                        <TouchableOpacity style={{ borderRadius: 16, overflow: "hidden", marginTop: 8 }} onPress={() => setShowPassModal(false)} activeOpacity={0.88}>
                            <LinearGradient colors={["#1E3A8A","#2563EB"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 50, justifyContent: "center", alignItems: "center" }}>
                                <Text style={{ color: "#FFF", fontSize: 15, fontWeight: "800" }}>Update Password</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            {/* EDIT PROFILE MODAL */}
            <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
                <Pressable style={s.overlay} onPress={() => setShowEditModal(false)}>
                    <View style={[s.sheet, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
                        <View style={[s.handle, { backgroundColor: isDark ? "#334155" : "#CBD5E1" }]} />
                        <Text style={[s.sheetTitle, { color: colors.text }]}>Edit Profile</Text>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20 }}>Update your admin profile information.</Text>
                        {[
                            { label: "Full Name",   val: adminName,  icon: "account-outline" },
                            { label: "Email",       val: adminEmail, icon: "email-outline"   },
                            { label: "Phone",       val: adminPhone, icon: "phone-outline"   },
                        ].map((field) => (
                            <View key={field.label} style={{ marginBottom: 14 }}>
                                <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textSecondary, marginBottom: 5 }}>{field.label}</Text>
                                <View style={[s.formInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                                    <MaterialCommunityIcons name={field.icon as any} size={16} color="#94A3B8" />
                                    <TextInput defaultValue={field.val} style={{ flex: 1, color: colors.text, fontSize: 13, marginLeft: 8 }} placeholderTextColor="#94A3B8" />
                                </View>
                            </View>
                        ))}
                        <TouchableOpacity style={{ borderRadius: 16, overflow: "hidden", marginTop: 8 }} onPress={() => setShowEditModal(false)} activeOpacity={0.88}>
                            <LinearGradient colors={["#1E3A8A","#2563EB"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 50, justifyContent: "center", alignItems: "center" }}>
                                <Text style={{ color: "#FFF", fontSize: 15, fontWeight: "800" }}>Save Changes</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1 },
    scroll: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 },
    header: { marginBottom: 18 },
    title: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3, marginTop: 6 },
    profileCard: { flexDirection: "row", alignItems: "center", borderRadius: 22, padding: 18, marginBottom: 16 },
    profileAvt: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center" },
    adminBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: "flex-start", marginTop: 6 },
    statBox: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 10, alignItems: "center" },
    sectionTitle: { fontSize: 11, fontWeight: "800", letterSpacing: 0.8, marginBottom: 8, marginLeft: 2 },
    sectionCard: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
    menuRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 14, borderBottomWidth: 1 },
    menuIco: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 36, maxHeight: "88%" },
    handle: { width: 44, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
    sheetTitle: { fontSize: 19, fontWeight: "800", marginBottom: 4 },
    formInput: { flexDirection: "row", alignItems: "center", height: 46, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 12 },
});
