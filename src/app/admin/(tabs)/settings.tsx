import React, { useState } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Switch, Alert, Modal, Pressable, TextInput, ActivityIndicator,
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

    const [notifAppointments, setNotifAppointments] = useState(true);
    const [notifEmergency, setNotifEmergency] = useState(true);
    const [notifReports, setNotifReports] = useState(true);
    const [notifSystem, setNotifSystem] = useState(false);
    const [twoFA, setTwoFA] = useState(false);
    const [autoBackup, setAutoBackup] = useState(true);
    const [showPassModal, setShowPassModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Profile form state
    const [adminName, setAdminName] = useState(user?.fullName || "Admin User");
    const [adminEmail, setAdminEmail] = useState(user?.email || "admin@liferelier.com");
    const [adminPhone, setAdminPhone] = useState(user?.mobile || "+91 98765 00000");

    // Password form state
    const [curPass, setCurPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");

    const [backingUp, setBackingUp] = useState(false);
    const [toastMsg, setToastMsg] = useState("");

    const C = { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isDark ? colors.cardBorder : "#E8EFF5" };

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 3000);
    };

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to log out of the admin portal?", [
            { text: "Cancel", style: "cancel" },
            { text: "Logout", style: "destructive", onPress: async () => { await logout(); router.replace("/admin/login"); } },
        ]);
    };

    const handleSaveProfile = () => {
        if (!adminName.trim() || !adminEmail.trim()) {
            Alert.alert("Invalid Input", "Name and email cannot be empty.");
            return;
        }
        setShowEditModal(false);
        showToast("Admin profile updated successfully!");
    };

    const handleUpdatePassword = () => {
        if (!curPass || !newPass || !confirmPass) {
            Alert.alert("Missing Fields", "Please complete all password fields.");
            return;
        }
        if (newPass !== confirmPass) {
            Alert.alert("Mismatch", "New password and confirm password do not match.");
            return;
        }
        setShowPassModal(false);
        setCurPass("");
        setNewPass("");
        setConfirmPass("");
        showToast("Password updated successfully!");
    };

    const handleTriggerBackup = () => {
        setBackingUp(true);
        setTimeout(() => {
            setBackingUp(false);
            showToast("Cloud backup completed successfully!");
        }, 1500);
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
                    <Text style={[s.title, { color: colors.text }]}>Settings & Security</Text>
                </View>

                {/* ADMIN PROFILE HERO */}
                <LinearGradient colors={["#1E3A8A", "#2563EB"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.profileCard}>
                    <View style={s.profileAvt}>
                        <Text style={{ color: BLUE, fontSize: 22, fontWeight: "800" }}>{adminName.slice(0, 2).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "800" }}>{adminName}</Text>
                        <Text style={{ color: "#BFDBFE", fontSize: 12, marginTop: 2 }}>{adminEmail}</Text>
                        <View style={s.adminBadge}>
                            <MaterialCommunityIcons name="shield-crown-outline" size={11} color="#FFFFFF" />
                            <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "700" }}>Super Administrator</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => setShowEditModal(true)} hitSlop={8} activeOpacity={0.8}>
                        <MaterialCommunityIcons name="pencil-outline" size={20} color="#BFDBFE" />
                    </TouchableOpacity>
                </LinearGradient>

                {/* QUICK STATS */}
                <View style={{ flexDirection: "row", gap: 10, marginBottom: 22 }}>
                    {[
                        { val: "48", label: "Doctors" },
                        { val: "2.8k", label: "Patients" },
                        { val: "99.8%", label: "Uptime" },
                        { val: "v4.2", label: "App Version" },
                    ].map((item, i) => (
                        <View key={i} style={[s.statBox, C]}>
                            <Text style={{ fontSize: 15, fontWeight: "800", color: colors.text }}>{item.val}</Text>
                            <Text style={{ fontSize: 9, color: colors.textSecondary, fontWeight: "600", marginTop: 2 }}>{item.label}</Text>
                        </View>
                    ))}
                </View>

                {/* ACCOUNT */}
                <Section title="Account Settings">
                    <Row icon="account-edit-outline" label="Edit Profile" subtitle="Update name, phone, email" onPress={() => setShowEditModal(true)} />
                    <Row icon="lock-reset" label="Change Password" subtitle="Update login credentials" onPress={() => setShowPassModal(true)} />
                    <Row icon="email-outline" label="Email Address" subtitle={adminEmail} />
                    <Row icon="phone-outline" label="Phone Number" subtitle={adminPhone} />
                </Section>

                {/* NOTIFICATIONS */}
                <Section title="System Notifications">
                    <SwitchRow icon="calendar-clock" label="Appointment Alerts" subtitle="New and updated appointments" value={notifAppointments} onChange={setNotifAppointments} />
                    <SwitchRow icon="alarm-light-outline" label="Emergency Alerts" subtitle="Critical patient status events" value={notifEmergency} onChange={setNotifEmergency} />
                    <SwitchRow icon="file-chart-outline" label="Report Notifications" subtitle="When monthly reports are generated" value={notifReports} onChange={setNotifReports} />
                    <SwitchRow icon="cog-outline" label="System Alerts" subtitle="Server load and downtime warnings" value={notifSystem} onChange={setNotifSystem} />
                </Section>

                {/* SECURITY */}
                <Section title="Security & Authentication">
                    <SwitchRow icon="shield-key-outline" label="Two-Factor Authentication" subtitle="Extra login layer protection" value={twoFA} onChange={setTwoFA} />
                    <Row icon="history" label="Audit & Sign-in Logs" subtitle="View active session logs" onPress={() => showToast("Viewing recent login history")} />
                </Section>

                {/* SYSTEM & BACKUP */}
                <Section title="Database & Cloud Backup">
                    <SwitchRow icon="cloud-sync-outline" label="Auto Cloud Backup" subtitle="Daily encrypted backup to cloud" value={autoBackup} onChange={setAutoBackup} />
                    <TouchableOpacity style={[s.menuRow, { borderColor: isDark ? "#334155" : "#F1F5F9" }]} onPress={handleTriggerBackup} activeOpacity={0.7} disabled={backingUp}>
                        <View style={[s.menuIco, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                            {backingUp ? <ActivityIndicator size="small" color={BLUE} /> : <MaterialCommunityIcons name="cloud-upload-outline" size={18} color={BLUE} />}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>Trigger Manual Backup</Text>
                            <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 1 }}>Create instant full database snapshot</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={[s.menuRow, { borderColor: isDark ? "#334155" : "#F1F5F9" }]}>
                        <View style={[s.menuIco, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                            <MaterialCommunityIcons name="weather-night" size={18} color={BLUE} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>Dark Theme</Text>
                            <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 1 }}>Toggle light / dark mode</Text>
                        </View>
                        <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: "#767577", true: BLUE }} />
                    </View>
                </Section>

                {/* DANGER ZONE */}
                <Section title="Danger Zone">
                    <Row icon="logout" label="Logout" subtitle="Sign out of admin portal" onPress={handleLogout} danger />
                </Section>

            </ScrollView>

            {/* CHANGE PASSWORD MODAL */}
            <Modal visible={showPassModal} transparent animationType="slide" onRequestClose={() => setShowPassModal(false)}>
                <Pressable style={s.overlay} onPress={() => setShowPassModal(false)}>
                    <Pressable style={[s.sheet, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
                        <View style={[s.handle, { backgroundColor: isDark ? "#334155" : "#CBD5E1" }]} />
                        <Text style={[s.sheetTitle, { color: colors.text }]}>Change Admin Password</Text>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20 }}>Enter current password and enter new password.</Text>
                        
                        <View style={{ marginBottom: 14 }}>
                            <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textSecondary, marginBottom: 5 }}>Current Password</Text>
                            <View style={[s.formInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                                <MaterialCommunityIcons name="lock-outline" size={16} color="#94A3B8" />
                                <TextInput
                                    placeholder="••••••••"
                                    placeholderTextColor="#94A3B8"
                                    secureTextEntry
                                    value={curPass}
                                    onChangeText={setCurPass}
                                    style={{ flex: 1, color: colors.text, fontSize: 13, marginLeft: 8 }}
                                />
                            </View>
                        </View>

                        <View style={{ marginBottom: 14 }}>
                            <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textSecondary, marginBottom: 5 }}>New Password</Text>
                            <View style={[s.formInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                                <MaterialCommunityIcons name="lock-outline" size={16} color="#94A3B8" />
                                <TextInput
                                    placeholder="••••••••"
                                    placeholderTextColor="#94A3B8"
                                    secureTextEntry
                                    value={newPass}
                                    onChangeText={setNewPass}
                                    style={{ flex: 1, color: colors.text, fontSize: 13, marginLeft: 8 }}
                                />
                            </View>
                        </View>

                        <View style={{ marginBottom: 14 }}>
                            <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textSecondary, marginBottom: 5 }}>Confirm New Password</Text>
                            <View style={[s.formInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                                <MaterialCommunityIcons name="lock-outline" size={16} color="#94A3B8" />
                                <TextInput
                                    placeholder="••••••••"
                                    placeholderTextColor="#94A3B8"
                                    secureTextEntry
                                    value={confirmPass}
                                    onChangeText={setConfirmPass}
                                    style={{ flex: 1, color: colors.text, fontSize: 13, marginLeft: 8 }}
                                />
                            </View>
                        </View>

                        <TouchableOpacity style={{ borderRadius: 16, overflow: "hidden", marginTop: 8 }} onPress={handleUpdatePassword} activeOpacity={0.88}>
                            <LinearGradient colors={["#1E3A8A", "#2563EB"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 50, justifyContent: "center", alignItems: "center" }}>
                                <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "800" }}>Update Password</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* EDIT PROFILE MODAL */}
            <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
                <Pressable style={s.overlay} onPress={() => setShowEditModal(false)}>
                    <Pressable style={[s.sheet, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
                        <View style={[s.handle, { backgroundColor: isDark ? "#334155" : "#CBD5E1" }]} />
                        <Text style={[s.sheetTitle, { color: colors.text }]}>Edit Admin Profile</Text>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20 }}>Update your admin account details.</Text>

                        <View style={{ marginBottom: 14 }}>
                            <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textSecondary, marginBottom: 5 }}>Full Name</Text>
                            <View style={[s.formInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                                <MaterialCommunityIcons name="account-outline" size={16} color="#94A3B8" />
                                <TextInput value={adminName} onChangeText={setAdminName} style={{ flex: 1, color: colors.text, fontSize: 13, marginLeft: 8 }} placeholderTextColor="#94A3B8" />
                            </View>
                        </View>

                        <View style={{ marginBottom: 14 }}>
                            <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textSecondary, marginBottom: 5 }}>Email Address</Text>
                            <View style={[s.formInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                                <MaterialCommunityIcons name="email-outline" size={16} color="#94A3B8" />
                                <TextInput value={adminEmail} onChangeText={setAdminEmail} style={{ flex: 1, color: colors.text, fontSize: 13, marginLeft: 8 }} placeholderTextColor="#94A3B8" />
                            </View>
                        </View>

                        <View style={{ marginBottom: 14 }}>
                            <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textSecondary, marginBottom: 5 }}>Phone Number</Text>
                            <View style={[s.formInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                                <MaterialCommunityIcons name="phone-outline" size={16} color="#94A3B8" />
                                <TextInput value={adminPhone} onChangeText={setAdminPhone} style={{ flex: 1, color: colors.text, fontSize: 13, marginLeft: 8 }} placeholderTextColor="#94A3B8" />
                            </View>
                        </View>

                        <TouchableOpacity style={{ borderRadius: 16, overflow: "hidden", marginTop: 8 }} onPress={handleSaveProfile} activeOpacity={0.88}>
                            <LinearGradient colors={["#1E3A8A", "#2563EB"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 50, justifyContent: "center", alignItems: "center" }}>
                                <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "800" }}>Save Profile Changes</Text>
                            </LinearGradient>
                        </TouchableOpacity>
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
    scroll: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 },
    header: { marginBottom: 18 },
    title: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3, marginTop: 6 },
    profileCard: { flexDirection: "row", alignItems: "center", borderRadius: 22, padding: 18, marginBottom: 16 },
    profileAvt: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" },
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
    toastBanner: {
        position: "absolute", bottom: 90, left: 20, right: 20,
        backgroundColor: "#10B981", borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16,
        flexDirection: "row", alignItems: "center", gap: 10,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6,
    },
    toastTxt: { color: "#FFFFFF", fontSize: 13, fontWeight: "700", flex: 1 },
});
