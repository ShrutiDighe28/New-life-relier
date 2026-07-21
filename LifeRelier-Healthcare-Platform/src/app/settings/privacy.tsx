import React, { useState } from "react";
import { useTheme } from "../../utils/themeManager";
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

export default function PrivacySettingsScreen() {
    const { colors, isDark } = useTheme();
    const router = useRouter();

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
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy & Security</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Security Section */}
                <Text style={styles.sectionHeading}>Security Settings</Text>
                <View style={styles.card}>
                    {/* Biometrics */}
                    <View style={styles.switchRow}>
                        <View style={styles.rowMeta}>
                            <Text style={styles.rowLabel}>Biometric Access</Text>
                            <Text style={styles.rowDesc}>Enable FaceID or Fingerprint authentication on app launch.</Text>
                        </View>
                        <Switch
                            value={biometric}
                            onValueChange={setBiometric}
                            trackColor={{ false: colors.cardBorder, true: colors.primary }}
                            thumbColor={biometric ? colors.primary : colors.textSecondary}
                        />
                    </View>

                    {/* 2FA */}
                    <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
                        <View style={styles.rowMeta}>
                            <Text style={styles.rowLabel}>Two-Factor Auth (2FA)</Text>
                            <Text style={styles.rowDesc}>Request SMS verification OTP code on credentials login.</Text>
                        </View>
                        <Switch
                            value={twoFactor}
                            onValueChange={setTwoFactor}
                            trackColor={{ false: colors.cardBorder, true: colors.primary }}
                            thumbColor={twoFactor ? colors.primary : colors.textSecondary}
                        />
                    </View>
                </View>

                {/* Data Privacy Section */}
                <Text style={styles.sectionHeading}>Data Consent Policies</Text>
                <View style={styles.card}>
                    {/* Share data */}
                    <View style={styles.switchRow}>
                        <View style={styles.rowMeta}>
                            <Text style={styles.rowLabel}>Share with Providers</Text>
                            <Text style={styles.rowDesc}>Allow selected clinic doctors to inspect diagnostics logs.</Text>
                        </View>
                        <Switch
                            value={sharing}
                            onValueChange={setSharing}
                            trackColor={{ false: colors.cardBorder, true: colors.primary }}
                            thumbColor={sharing ? colors.primary : colors.textSecondary}
                        />
                    </View>

                    {/* Research */}
                    <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
                        <View style={styles.rowMeta}>
                            <Text style={styles.rowLabel}>Medical Research Consent</Text>
                            <Text style={styles.rowDesc}>Contribute anonymous metrics data to clinical healthcare studies.</Text>
                        </View>
                        <Switch
                            value={research}
                            onValueChange={setResearch}
                            trackColor={{ false: colors.cardBorder, true: colors.primary }}
                            thumbColor={research ? colors.primary : colors.textSecondary}
                        />
                    </View>
                </View>

                {/* Account Actions Section */}
                <Text style={styles.sectionHeading}>Data Controls & Actions</Text>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.actionRow} onPress={handleClearCache} disabled={clearing}>
                        <MaterialCommunityIcons name="cached" size={20} color={colors.warning} style={{ marginRight: 12 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.actionLabel}>Clear Application Cache</Text>
                            <Text style={styles.actionDesc}>Deletes temporary local asset copies (No medical logs lost).</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionRow, { borderBottomWidth: 0 }]} onPress={handleExport}>
                        <MaterialCommunityIcons name="cloud-download-outline" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.actionLabel}>Export Health Profile (JSON)</Text>
                            <Text style={styles.actionDesc}>Download a cryptographically signed backup of personal logs.</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Toasts */}
            {clearing && (
                <View style={[styles.toast, { backgroundColor: colors.warning, }]}>
                    <Text style={styles.toastText}>Clearing cache archives...</Text>
                </View>
            )}
            {cleared && (
                <View style={[styles.toast, { backgroundColor: colors.success, }]}>
                    <MaterialCommunityIcons name="check-circle" size={18} color: colors.text, />
                    <Text style={styles.toastText}>Local application cache cleared!</Text>
                </View>
            )}
            {exported && (
                <View style={[styles.toast, { backgroundColor: colors.primary, }]}>
                    <MaterialCommunityIcons name="email-check" size={18} color: colors.text, />
                    <Text style={styles.toastText}>Export payload sent to john.doe@email.com!</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        height: 60,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
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
        color: colors.text,
    },
    scrollContent: {
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    sectionHeading: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.text,
        marginTop: 24,
        marginBottom: 10,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    rowMeta: {
        flex: 1,
        paddingRight: 16,
    },
    rowLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.text,
    },
    rowDesc: {
        fontSize: 10,
        color: "#64748B",
        marginTop: 2,
        lineHeight: 14,
    },
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    actionLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.text,
    },
    actionDesc: {
        fontSize: 10,
        color: "#64748B",
        marginTop: 2,
        lineHeight: 14,
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
        color: colors.text,
        fontSize: 13,
        fontWeight: "600",
        marginLeft: 8,
        flex: 1,
    },
});
