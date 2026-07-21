import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@/utils/themeManager";

export default function PrivacySettingsScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();

    const [biometric, setBiometric] = useState(true);
    const [sharing, setSharing] = useState(true);
    const [research, setResearch] = useState(false);
    const [twoFactor, setTwoFactor] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [cleared, setCleared] = useState(false);
    const [exported, setExported] = useState(false);

    const handleClearCache = () => {
        setClearing(true);
        setTimeout(() => {
            setClearing(false);
            setCleared(true);
            setTimeout(() => setCleared(false), 2000);
        }, 1500);
    };

    const handleExport = () => {
        setExported(true);
        setTimeout(() => setExported(false), 2500);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.divider }]}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy & Security</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Security Section */}
                <Text style={[styles.sectionHeading, { color: colors.text }]}>Security Settings</Text>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    {/* Biometrics */}
                    <View style={[styles.switchRow, { borderBottomColor: colors.divider }]}>
                        <View style={styles.rowMeta}>
                            <Text style={[styles.rowLabel, { color: colors.text }]}>Biometric Access</Text>
                            <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>Enable FaceID or Fingerprint authentication on app launch.</Text>
                        </View>
                        <Switch
                            value={biometric}
                            onValueChange={setBiometric}
                            trackColor={{ false: isDark ? colors.cardBorder : "#E2E8F0", true: "#93C5FD" }}
                            thumbColor={biometric ? colors.primary : "#94A3B8"}
                        />
                    </View>

                    {/* 2FA */}
                    <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
                        <View style={styles.rowMeta}>
                            <Text style={[styles.rowLabel, { color: colors.text }]}>Two-Factor Auth (2FA)</Text>
                            <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>Request SMS verification OTP code on credentials login.</Text>
                        </View>
                        <Switch
                            value={twoFactor}
                            onValueChange={setTwoFactor}
                            trackColor={{ false: isDark ? colors.cardBorder : "#E2E8F0", true: "#93C5FD" }}
                            thumbColor={twoFactor ? colors.primary : "#94A3B8"}
                        />
                    </View>
                </View>

                {/* Privacy & Data Section */}
                <Text style={[styles.sectionHeading, { color: colors.text }]}>Data Privacy</Text>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View style={[styles.switchRow, { borderBottomColor: colors.divider }]}>
                        <View style={styles.rowMeta}>
                            <Text style={[styles.rowLabel, { color: colors.text }]}>Data Sharing Analytics</Text>
                            <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>Allow telemetry data to improve AI diagnostic models.</Text>
                        </View>
                        <Switch
                            value={sharing}
                            onValueChange={setSharing}
                            trackColor={{ false: isDark ? colors.cardBorder : "#E2E8F0", true: "#93C5FD" }}
                            thumbColor={sharing ? colors.primary : "#94A3B8"}
                        />
                    </View>

                    {/* Research */}
                    <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
                        <View style={styles.rowMeta}>
                            <Text style={[styles.rowLabel, { color: colors.text }]}>Medical Research Opt-In</Text>
                            <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>Donate anonymized condition reports to clinical researchers anonymously.</Text>
                        </View>
                        <Switch
                            value={research}
                            onValueChange={setResearch}
                            trackColor={{ false: isDark ? colors.cardBorder : "#E2E8F0", true: "#93C5FD" }}
                            thumbColor={research ? colors.primary : "#94A3B8"}
                        />
                    </View>
                </View>

                {/* Account Actions Section */}
                <Text style={[styles.sectionHeading, { color: colors.text }]}>Data Actions</Text>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder, marginBottom: 16 }]} onPress={handleClearCache} disabled={clearing}>
                    {clearing ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="delete-outline" size={20} color="#EF4444" />
                            <Text style={[styles.actionBtnText, { color: "#EF4444" }]}>Clear Local Device Data</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={handleExport}>
                    <MaterialCommunityIcons name="cloud-download-outline" size={20} color={colors.primary} />
                    <Text style={[styles.actionBtnText, { color: colors.primary }]}>Request Data Export</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Toasts */}
            {cleared && (
                <View style={[styles.toast, { backgroundColor: "#10B981" }]}>
                    <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.toastText}>Local application cache cleared!</Text>
                </View>
            )}
            {exported && (
                <View style={[styles.toast, { backgroundColor: "#2563EB" }]}>
                    <MaterialCommunityIcons name="email-check" size={18} color="#FFFFFF" />
                    <Text style={styles.toastText}>Export payload sent to john.doe@email.com!</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        height: 60,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    headerBtn: {
        width: 38,
        height: 38,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#071739",
    },
    scrollContent: {
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    sectionHeading: {
        fontSize: 13,
        fontWeight: "700",
        color: "#0F172A",
        marginTop: 24,
        marginBottom: 10,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    rowMeta: {
        flex: 1,
        paddingRight: 16,
    },
    rowLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#334155",
    },
    rowDesc: {
        fontSize: 10,
        color: "#64748B",
        marginTop: 2,
        lineHeight: 14,
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    actionBtnText: {
        fontSize: 14,
        fontWeight: "700",
        marginLeft: 8,
    },
    toast: {
        position: "absolute",
        bottom: 40,
        left: 20,
        right: 20,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    toastText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600",
        marginLeft: 8,
        flex: 1,
    },
});
