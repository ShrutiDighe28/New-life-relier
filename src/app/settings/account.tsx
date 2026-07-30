import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/utils/themeManager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Reusable Row Components ────────────────────────────────────────────────

interface SettingsRowProps {
    icon: string;
    iconColor: string;
    iconBg: string;
    label: string;
    subtitle?: string;
    onPress?: () => void;
    showChevron?: boolean;
    danger?: boolean;
    colors: any;
    styles: any;
}

const SettingsRow = ({ icon, iconColor, iconBg, label, subtitle, onPress, showChevron = true, danger = false, colors, styles }: SettingsRowProps) => (
    <TouchableOpacity style={[styles.settingsRow, { borderBottomColor: colors.divider }]} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.rowIconBg, { backgroundColor: iconBg }]}>
            <MaterialCommunityIcons name={icon as any} size={18} color={iconColor} />
        </View>
        <View style={styles.rowTextGroup}>
            <Text style={[styles.rowLabel, { color: danger ? colors.error : colors.text }]}>{label}</Text>
            {subtitle ? <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
        </View>
        {showChevron && (
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
        )}
    </TouchableOpacity>
);

interface SectionCardProps {
    title: string;
    children: React.ReactNode;
    colors: any;
    styles: any;
}

const SectionCard = ({ title, children, colors, styles }: SectionCardProps) => (
    <View style={styles.sectionGroup}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{title.toUpperCase()}</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {children}
        </View>
    </View>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function AccountSettingsScreen() {
    const router = useRouter();
    const { user, updateProfile, logout } = useAuth();
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors);

    // Profile edit state
    const [editingProfile, setEditingProfile] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.fullName || "");
            setPhone(user.mobile || "");
            setDob(user.dob || "");
            setGender(user.gender || "");
            setBloodGroup(user.bloodGroup || "");
            setHeight(user.height || "");
            setWeight(user.weight || "");
        }
    }, [user]);

    const handleSaveProfile = async () => {
        if (!name.trim()) return;
        setSaving(true);
        try {
            // Split full name into first + last for the API
            const parts = name.trim().split(" ");
            const firstName = parts[0] || "";
            const lastName  = parts.slice(1).join(" ") || "";

            await updateProfile({
                fullName:    name.trim(),
                firstName,
                lastName,
                mobile:      phone.trim(),
                dob,
                gender,
                bloodGroup,
                height,
                weight,
            });
            setSaved(true);
            setEditingProfile(false);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            console.error("Failed to update profile:", err);
            Alert.alert("Update Failed", "Could not save profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "This action is permanent and cannot be undone. All your data will be erased.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete Account",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                        router.replace("/login");
                    },
                },
            ]
        );
    };

    const InputField = ({ label, value, onChangeText, keyboardType = "default", placeholder = "" }: any) => (
        <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
            <TextInput
                style={[styles.textInput, { backgroundColor: isDark ? colors.backgroundSecondary : colors.background, borderColor: isDark ? colors.cardBorder : colors.cardBorder }]}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                placeholder={placeholder}
                placeholderTextColor={colors.textSecondary}
                editable={editingProfile}
            />
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.divider }]}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Account Settings</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Avatar + Name Hero */}
                <View style={[styles.heroBlock, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={require("@/assets/images/dashboard/profile.png")}
                            style={styles.avatarImage}
                        />
                        <TouchableOpacity style={styles.editPhotoBadge}>
                            <MaterialCommunityIcons name="camera" size={13} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.heroText}>
                        <Text style={[styles.heroName, { color: colors.text }]}>{user?.fullName || "Your Name"}</Text>
                        <Text style={[styles.heroEmail, { color: colors.textSecondary }]}>{user?.email || "your@email.com"}</Text>
                        <View style={[styles.verifiedBadge, { backgroundColor: isDark ? "#064E3B" : "#E8F5E9" }]}>
                            <MaterialCommunityIcons name="check-decagram" size={12} color={colors.success} style={{ marginRight: 4 }} />
                            <Text style={[styles.verifiedText, { color: colors.success }]}>Verified Account</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.editToggleBtn, { backgroundColor: editingProfile ? colors.text : (isDark ? colors.backgroundSecondary : colors.card), borderColor: isDark ? colors.cardBorder : colors.cardBorder }]}
                        onPress={() => setEditingProfile(!editingProfile)}
                    >
                        <MaterialCommunityIcons name={editingProfile ? "close" : "pencil-outline"} size={14} color={colors.text} />
                        <Text style={[styles.editToggleText, { color: editingProfile ? colors.card : colors.primary }]}>
                            {editingProfile ? "Cancel" : "Edit"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ── PROFILE Section ── */}
                <SectionCard title="Profile Information" colors={colors} styles={styles}>
                    <View style={styles.formPadding}>
                        <InputField label="Full Name" value={name} onChangeText={setName} placeholder="Enter your full name" />
                        <View style={[styles.readOnlyRow, { backgroundColor: isDark ? colors.backgroundSecondary : "#F8FAFC", borderColor: isDark ? colors.cardBorder : "#E2E8F0" }]}>
                            <MaterialCommunityIcons name="email-lock-outline" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                            <Text style={[styles.readOnlyLabel, { color: colors.textSecondary }]}>Email (non-editable)</Text>
                            <Text style={[styles.readOnlyValue, { color: colors.text }]} numberOfLines={1}>{user?.email || "—"}</Text>
                        </View>
                        <InputField label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="e.g. 9876543210" />
                        <InputField label="Date of Birth (DD/MM/YYYY)" value={dob} onChangeText={setDob} placeholder="e.g. 15/08/1995" />
                        <View style={styles.gridRow}>
                            <View style={{ flex: 1, marginRight: 6 }}>
                                <InputField label="Gender" value={gender} onChangeText={setGender} placeholder="Male / Female" />
                            </View>
                            <View style={{ flex: 1, marginLeft: 6 }}>
                                <InputField label="Blood Group" value={bloodGroup} onChangeText={setBloodGroup} placeholder="e.g. A+" />
                            </View>
                        </View>
                        <View style={styles.gridRow}>
                            <View style={{ flex: 1, marginRight: 6 }}>
                                <InputField label="Height" value={height} onChangeText={setHeight} placeholder="e.g. 5'8&quot;" />
                            </View>
                            <View style={{ flex: 1, marginLeft: 6 }}>
                                <InputField label="Weight" value={weight} onChangeText={setWeight} placeholder="e.g. 70 kg" />
                            </View>
                        </View>

                        {editingProfile && (
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={saving}>
                                {saving ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="content-save-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                                        <Text style={styles.saveBtnText}>Save Profile Changes</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </SectionCard>

                {/* ── API USER DETAILS Section ── */}
                <SectionCard title="API System Account Data" colors={colors} styles={styles}>
                    <View style={styles.formPadding}>
                        {[
                            { label: "User ID", val: user?.id },
                            { label: "Username", val: user?.userName },
                            { label: "Full Name", val: user?.fullName },
                            { label: "First Name", val: user?.firstName },
                            { label: "Last Name", val: user?.lastName },
                            { label: "Mobile", val: user?.mobile },
                            { label: "Email", val: user?.email },
                            { label: "User Type", val: user?.userType },
                            { label: "Role Name", val: user?.roleName },
                            { label: "Role ID", val: user?.roleId },
                            { label: "Company Name", val: user?.companyName },
                            { label: "Print Name", val: user?.printName },
                            { label: "Alias", val: user?.alias },
                            { label: "Branch ID", val: user?.branchId },
                            { label: "Company ID", val: user?.companyId },
                            { label: "State ID", val: user?.stateId },
                            { label: "District ID", val: user?.districtId },
                            { label: "Time Zone", val: user?.zoneName },
                            { label: "IANA ID", val: user?.ianaId },
                            { label: "Super Admin Status", val: user?.isSuperAdmin !== undefined ? (user.isSuperAdmin ? "Yes (Super Admin)" : "No") : undefined },
                        ]
                            .filter((item) => item.val !== undefined && item.val !== null && item.val !== "")
                            .map((item, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.readOnlyRow,
                                        {
                                            backgroundColor: isDark ? colors.backgroundSecondary : "#F8FAFC",
                                            borderColor: isDark ? colors.cardBorder : "#E2E8F0",
                                            marginVertical: 4,
                                        },
                                    ]}
                                >
                                    <MaterialCommunityIcons name="api" size={16} color={colors.primary} style={{ marginRight: 8 }} />
                                    <Text style={[styles.readOnlyLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                                    <Text style={[styles.readOnlyValue, { color: colors.text }]} numberOfLines={1}>
                                        {String(item.val)}
                                    </Text>
                                </View>
                            ))}
                    </View>
                </SectionCard>

                {/* ── SECURITY Section ── */}
                <SectionCard title="Security" colors={colors} styles={styles}>
                    <SettingsRow
                        icon="lock-reset"
                        iconColor={colors.text} iconBg={isDark ? colors.cardBorder : colors.card}
                        label="Change Password"
                        subtitle="Update your login password"
                        onPress={() => router.push("/settings/change-password" as any)}
                        colors={colors}
                        styles={styles}
                    />
                    <SettingsRow
                        icon="shield-key-outline"
                        iconColor={colors.text} iconBg={isDark ? colors.cardBorder : colors.card}
                        label="Two-Factor Authentication"
                        subtitle="Extra security for your account"
                        onPress={() => Alert.alert("Coming Soon", "Two-factor authentication will be available in the next update.")}
                        colors={colors}
                        styles={styles}
                    />
                    <SettingsRow
                        icon="devices"
                        iconColor={colors.text} iconBg={isDark ? colors.cardBorder : colors.card}
                        label="Active Sessions"
                        subtitle="View & manage logged-in devices"
                        onPress={() => Alert.alert("Coming Soon", "Session management will be available in the next update.")}
                        colors={colors}
                        styles={styles}
                    />
                </SectionCard>

                {/* ── PREFERENCES Section ── */}
                <SectionCard title="Preferences" colors={colors} styles={styles}>
                    <SettingsRow
                        icon="bell-outline"
                        iconColor={colors.text} iconBg={isDark ? colors.cardBorder : colors.card}
                        label="Notifications"
                        subtitle="Manage alerts and reminders"
                        onPress={() => router.push("/settings/notifications" as any)}
                        colors={colors}
                        styles={styles}
                    />
                    <SettingsRow
                        icon="shield-check-outline"
                        iconColor={colors.text} iconBg={isDark ? colors.cardBorder : colors.card}
                        label="Privacy & Data"
                        subtitle="Control your data and permissions"
                        onPress={() => router.push("/settings/privacy" as any)}
                        colors={colors}
                        styles={styles}
                    />
                    <SettingsRow
                        icon="help-circle-outline"
                        iconColor={colors.text} iconBg={isDark ? colors.cardBorder : colors.card}
                        label="Help & Support"
                        subtitle="FAQs, contact and feedback"
                        onPress={() => router.push("/settings/help" as any)}
                        colors={colors}
                        styles={styles}
                    />
                </SectionCard>

                {/* ── DANGER ZONE ── */}
                <SectionCard title="Danger Zone" colors={colors} styles={styles}>
                    <SettingsRow
                        icon="delete-outline"
                        iconColor={colors.error} iconBg={isDark ? colors.cardBorder : colors.card}
                        label="Delete Account"
                        subtitle="Permanently erase all your data"
                        onPress={handleDeleteAccount}
                        danger
                        colors={colors}
                        styles={styles}
                    />
                </SectionCard>

                <View style={{ height: 20 }} />
            </ScrollView>

            {/* Toast */}
            {saved && (
                <View style={styles.toast}>
                    <MaterialCommunityIcons name="check-circle" size={18} color={colors.text} />
                    <Text style={styles.toastText}>Profile updated successfully!</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        height: 60,
        borderBottomWidth: 1,
    },
    headerBtn: { width: 38, height: 38, justifyContent: "center", alignItems: "center" },
    headerTitle: { fontSize: 16, fontWeight: "700" },
    scrollContent: { paddingBottom: 50, paddingHorizontal: 16 },

    // Hero
    heroBlock: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 20,
        padding: 16,
        marginTop: 20,
        marginBottom: 8,
        borderWidth: 1,
    },
    avatarWrapper: { position: "relative", marginRight: 14 },
    avatarImage: { width: 72, height: 72, borderRadius: 36 },
    editPhotoBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: colors.text,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: colors.cardBorder,
    },
    heroText: { flex: 1 },
    heroName: { fontSize: 16, fontWeight: "700" },
    heroEmail: { fontSize: 12, marginTop: 2, marginBottom: 6 },
    verifiedBadge: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    verifiedText: { fontSize: 11, fontWeight: "600" },
    editToggleBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        gap: 4,
    },
    editToggleText: { fontSize: 12, fontWeight: "700" },

    // Sections
    sectionGroup: { marginTop: 20 },
    sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 },
    sectionCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },

    // Settings Row
    settingsRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
    },
    rowIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
    rowTextGroup: { flex: 1 },
    rowLabel: { fontSize: 14, fontWeight: "600" },
    rowSubtitle: { fontSize: 12, marginTop: 2 },

    // Form
    formPadding: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 6 },
    inputWrapper: { marginBottom: 14 },
    inputLabel: { fontSize: 11, fontWeight: "600", marginBottom: 5, letterSpacing: 0.3 },
    textInput: {
        borderWidth: 1.5,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
    },
    readOnlyRow: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 14,
    },
    readOnlyLabel: { fontSize: 12, flex: 1 },
    readOnlyValue: { fontSize: 13, fontWeight: "600" },
    gridRow: { flexDirection: "row" },
    saveBtn: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 13,
        marginTop: 6,
        marginBottom: 8,
    },
    saveBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },

    // Toast
    toast: {
        position: "absolute",
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: colors.success,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 6,
    },
    toastText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600", marginLeft: 8, flex: 1 },
});


