import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Switch,
    Dimensions,
    Share,
    Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { mockReports, ReportData } from "@/utils/mockReportsData";
import { useTheme } from "@/utils/themeManager";

const { width } = Dimensions.get("window");

interface Doctor {
    id: string;
    name: string;
    specialty: string;
    hospital: string;
    email: string;
}

const mockDoctors: Doctor[] = [
    {
        id: "dr-sandeep",
        name: "Dr. Sandeep Kumar",
        specialty: "MD, Pathologist",
        hospital: "LifeRelier Diagnostics Center",
        email: "sandeep.kumar@liferelier.com"
    },
    {
        id: "dr-priya",
        name: "Dr. Priya Nair",
        specialty: "MD, General Physician",
        hospital: "LifeRelier Care Clinic",
        email: "priya.nair@liferelier.com"
    },
    {
        id: "dr-arun",
        name: "Dr. Arun Sen",
        specialty: "DM, Cardiologist",
        hospital: "LifeRelier Cardiac Hospital",
        email: "arun.sen@liferelier.com"
    }
];

export default function ReportShareScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { colors, isDark } = useTheme();

    // Tab state: "doctor" | "link"
    const [activeTab, setActiveTab] = useState<"doctor" | "link">("doctor");

    // Doctor share states
    const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
    const [customDoctorEmail, setCustomDoctorEmail] = useState("");
    const [referralNote, setReferralNote] = useState("");

    // Link share states
    const [expiry, setExpiry] = useState<"1h" | "1d" | "7d" | "never">("1d");
    const [passwordProtect, setPasswordProtect] = useState(false);
    const [passwordVal, setPasswordVal] = useState("LR-SECURE");
    const [oneTimeView, setOneTimeView] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);

    // Toast status
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Find current report
    const report = useMemo(() => {
        return mockReports.find((r) => r.id === id) || mockReports[0];
    }, [id]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleShareWithDoctor = () => {
        const doc = mockDoctors.find((d) => d.id === selectedDoctorId);
        const recipient = doc ? doc.name : customDoctorEmail;

        if (!recipient) {
            showToast("Please select a doctor or enter an email address");
            return;
        }

        showToast(`Report shared securely with ${recipient}!`);
        setReferralNote("");
        setSelectedDoctorId(null);
        setCustomDoctorEmail("");
    };

    const handleGenerateLink = () => {
        const randomHash = Math.random().toString(36).substring(2, 8).toUpperCase();
        const link = `https://patient.liferelier.com/share/${report.id}-${randomHash}`;
        setGeneratedLink(link);
        showToast("Secure Link Generated successfully!");
    };

    const getSharePayload = () => {
        const targetLink = generatedLink || `https://patient.liferelier.com/share/${report.id}`;
        return `Here is my Life Relier health report: "${report.title}"\nSecure Access Link: ${targetLink}`;
    };

    const shareViaWhatsApp = () => {
        const msg = getSharePayload();
        const url = `whatsapp://send?text=${encodeURIComponent(msg)}`;
        Linking.openURL(url).catch(() => {
            Share.share({
                message: msg,
                title: `Share ${report.title}`,
            });
        });
    };

    const shareViaEmail = () => {
        const msg = getSharePayload();
        const url = `mailto:?subject=${encodeURIComponent(`Health Report: ${report.title}`)}&body=${encodeURIComponent(msg)}`;
        Linking.openURL(url).catch(() => {
            Share.share({
                message: msg,
                title: `Share ${report.title}`,
            });
        });
    };

    const shareViaTelegram = () => {
        const msg = getSharePayload();
        const url = `tg://msg?text=${encodeURIComponent(msg)}`;
        Linking.openURL(url).catch(() => {
            Share.share({
                message: msg,
                title: `Share ${report.title}`,
            });
        });
    };

    const shareViaSystem = () => {
        const msg = getSharePayload();
        Share.share({
            message: msg,
            title: `Share ${report.title}`,
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            {/* Toolbar Header */}
            <View style={[styles.header, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.divider }]}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Secure Share</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Selected Report Preview Header */}
                <View style={[styles.reportSummaryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View style={styles.summaryIconWrapper}>
                        <MaterialCommunityIcons name="shield-lock-outline" size={26} color={colors.primary} />
                    </View>
                    <View style={styles.summaryTextContent}>
                        <Text style={[styles.summaryTitle, { color: colors.text }]} numberOfLines={1}>
                            {report.title}
                        </Text>
                        <Text style={[styles.summaryMeta, { color: colors.textSecondary }]}>
                            ID: {report.patientInfo.id} • {report.date}
                        </Text>
                    </View>
                    <View style={[styles.secureBadge, isDark && { backgroundColor: "#14532D" }]}>
                        <MaterialCommunityIcons name="lock" size={12} color={isDark ? "#4ADE80" : "#15803D"} />
                        <Text style={[styles.secureBadgeText, isDark && { color: "#4ADE80" }]}>AES-256</Text>
                    </View>
                </View>

                {/* Secure Share Tabs */}
                <View style={[styles.tabContainer, { borderBottomColor: colors.divider }]}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === "doctor" && [styles.tabButtonActive, { borderBottomColor: colors.primary }]]}
                        onPress={() => setActiveTab("doctor")}
                    >
                        <MaterialCommunityIcons
                            name="doctor"
                            size={18}
                            color={activeTab === "doctor" ? colors.primary : colors.textSecondary}
                        />
                        <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === "doctor" && [styles.tabTextActive, { color: colors.primary }]]}>
                            Share with Doctor
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === "link" && [styles.tabButtonActive, { borderBottomColor: colors.primary }]]}
                        onPress={() => setActiveTab("link")}
                    >
                        <MaterialCommunityIcons
                            name="link-variant"
                            size={18}
                            color={activeTab === "link" ? colors.primary : colors.textSecondary}
                        />
                        <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === "link" && [styles.tabTextActive, { color: colors.primary }]]}>
                            Secure Link
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content: Doctor Directory */}
                {activeTab === "doctor" && (
                    <View style={styles.tabContent}>
                        <Text style={[styles.contentTitle, { color: colors.text }]}>Select Physician from Directory</Text>
                        
                        {mockDoctors.map((doc) => (
                            <TouchableOpacity
                                key={doc.id}
                                style={[
                                    styles.doctorCard,
                                    { backgroundColor: colors.card, borderColor: colors.cardBorder },
                                    selectedDoctorId === doc.id && { borderColor: colors.primary },
                                ]}
                                onPress={() => {
                                    setSelectedDoctorId(doc.id);
                                    setCustomDoctorEmail("");
                                }}
                            >
                                <View style={styles.doctorInfoRow}>
                                    <View style={[styles.doctorAvatar, { backgroundColor: colors.inputBg }]}>
                                        <MaterialCommunityIcons name="doctor" size={22} color={colors.primary} />
                                    </View>
                                    <View style={styles.doctorMeta}>
                                        <Text style={[styles.doctorName, { color: colors.text }]}>{doc.name}</Text>
                                        <Text style={[styles.doctorSub, { color: colors.textSecondary }]}>{doc.specialty} • {doc.hospital}</Text>
                                    </View>
                                </View>
                                {selectedDoctorId === doc.id && (
                                    <MaterialCommunityIcons name="check-circle" size={22} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}

                        <Text style={[styles.sectionDivider, { color: colors.textSecondary }]}>OR SHARE WITH ANY PHYSICIAN</Text>

                        <View style={styles.inputWrapper}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Doctor&apos;s Email Address</Text>
                            <TextInput
                                style={[styles.textInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                                placeholder="e.g. physician@clinic.com"
                                placeholderTextColor={colors.textSecondary}
                                value={customDoctorEmail}
                                onChangeText={(val) => {
                                    setCustomDoctorEmail(val);
                                    setSelectedDoctorId(null);
                                }}
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Add a Note / Question (Optional)</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                                placeholder="Hi doctor, here is my report for consultation..."
                                placeholderTextColor={colors.textSecondary}
                                multiline
                                numberOfLines={3}
                                value={referralNote}
                                onChangeText={setReferralNote}
                            />
                        </View>

                        <TouchableOpacity style={[styles.actionBtnSolid, { backgroundColor: colors.primary }]} onPress={handleShareWithDoctor}>
                            <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text style={styles.actionBtnSolidText}>Send Encrypted Referral</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Tab Content: Secure Link Settings */}
                {activeTab === "link" && (
                    <View style={styles.tabContent}>
                        <Text style={[styles.contentTitle, { color: colors.text }]}>Link Security Settings</Text>

                        {/* Expiration Settings */}
                        <Text style={[styles.settingLabel, { color: colors.text }]}>Link Expiration Time</Text>
                        <View style={styles.expiryChipsRow}>
                            <TouchableOpacity
                                style={[
                                    styles.expiryChip,
                                    { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                                    expiry === "1h" && { backgroundColor: colors.badgeBg, borderColor: colors.primary }
                                ]}
                                onPress={() => setExpiry("1h")}
                            >
                                <Text style={[styles.expiryChipText, { color: colors.textSecondary }, expiry === "1h" && { color: colors.primary, fontWeight: "700" }]}>
                                    1 Hour
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.expiryChip,
                                    { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                                    expiry === "7d" && { backgroundColor: colors.badgeBg, borderColor: colors.primary }
                                ]}
                                onPress={() => setExpiry("7d")}
                            >
                                <Text style={[styles.expiryChipText, { color: colors.textSecondary }, expiry === "7d" && { color: colors.primary, fontWeight: "700" }]}>
                                    7 Days
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.expiryChip,
                                    { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                                    expiry === "never" && { backgroundColor: colors.badgeBg, borderColor: colors.primary }
                                ]}
                                onPress={() => setExpiry("never")}
                            >
                                <Text style={[styles.expiryChipText, { color: colors.textSecondary }, expiry === "never" && { color: colors.primary, fontWeight: "700" }]}>
                                    Never
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Password toggle */}
                        <View style={[styles.switchRow, { borderBottomColor: colors.divider }]}>
                            <View style={styles.switchTextContainer}>
                                <Text style={[styles.switchTitle, { color: colors.text }]}>Enable Password Protection</Text>
                                <Text style={[styles.switchSubtitle, { color: colors.textSecondary }]}>Recipients must input code to unlock</Text>
                            </View>
                            <Switch
                                value={passwordProtect}
                                onValueChange={setPasswordProtect}
                                trackColor={{ false: colors.divider, true: "#93C5FD" }}
                                thumbColor={passwordProtect ? colors.primary : "#F1F5F9"}
                            />
                        </View>

                        {passwordProtect && (
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.inputLabel, { color: colors.text }]}>Enter Share Access Password</Text>
                                <TextInput
                                    style={[styles.textInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                                    value={passwordVal}
                                    onChangeText={setPasswordVal}
                                    placeholder="Enter access code"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>
                        )}

                        {/* One-Time View toggle */}
                        <View style={[styles.switchRow, { borderBottomColor: colors.divider }]}>
                            <View style={styles.switchTextContainer}>
                                <Text style={[styles.switchTitle, { color: colors.text }]}>One-time View Only</Text>
                                <Text style={[styles.switchSubtitle, { color: colors.textSecondary }]}>Link automatically self-destructs after viewing</Text>
                            </View>
                            <Switch
                                value={oneTimeView}
                                onValueChange={setOneTimeView}
                                trackColor={{ false: colors.divider, true: "#93C5FD" }}
                                thumbColor={oneTimeView ? colors.primary : "#F1F5F9"}
                            />
                        </View>

                        <TouchableOpacity style={[styles.actionBtnSolid, { backgroundColor: colors.primary }]} onPress={handleGenerateLink}>
                            <MaterialCommunityIcons name="cog-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text style={styles.actionBtnSolidText}>Generate Secure Shared Link</Text>
                        </TouchableOpacity>

                        {generatedLink && (
                            <View style={[styles.generatedLinkCard, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                                <Text style={[styles.generatedLinkLabel, { color: colors.text }]}>Generated Shared Access Link</Text>
                                <View style={styles.linkDisplayRow}>
                                    <Text style={[styles.linkDisplayText, { color: colors.textSecondary }]} numberOfLines={1}>
                                        {generatedLink}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.linkCopyBtn}
                                        onPress={() => showToast("Copied Link to Clipboard!")}
                                    >
                                        <MaterialCommunityIcons name="content-copy" size={16} color={colors.primary} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* Third-party Sharing Options */}
                <View style={styles.thirdPartyContainer}>
                    <Text style={[styles.thirdPartyTitle, { color: colors.text }]}>Share Directly to Health Channels</Text>
                    <View style={styles.socialButtonsRow}>
                        <TouchableOpacity
                            style={styles.socialBtn}
                            onPress={shareViaWhatsApp}
                        >
                            <View style={[styles.socialIconBg, { backgroundColor: isDark ? "#14532D" : "#DCFCE7" }]}>
                                <MaterialCommunityIcons name="whatsapp" size={26} color={isDark ? "#4ADE80" : "#15803D"} />
                            </View>
                            <Text style={[styles.socialBtnLabel, { color: colors.text }]}>WhatsApp</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.socialBtn}
                            onPress={shareViaEmail}
                        >
                            <View style={[styles.socialIconBg, { backgroundColor: isDark ? "#1E3A8A" : "#EFF6FF" }]}>
                                <MaterialCommunityIcons name="email-outline" size={26} color={isDark ? "#93C5FD" : "#2563EB"} />
                            </View>
                            <Text style={[styles.socialBtnLabel, { color: colors.text }]}>Email</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.socialBtn}
                            onPress={shareViaTelegram}
                        >
                            <View style={[styles.socialIconBg, { backgroundColor: isDark ? "#0C4A6E" : "#E0F2FE" }]}>
                                <MaterialCommunityIcons name={"telegram" as any} size={26} color={isDark ? "#38BDF8" : "#0284C7"} />
                            </View>
                            <Text style={[styles.socialBtnLabel, { color: colors.text }]}>Telegram</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.socialBtn}
                            onPress={shareViaSystem}
                        >
                            <View style={[styles.socialIconBg, { backgroundColor: colors.inputBg }]}>
                                <MaterialCommunityIcons name="share-variant-outline" size={26} color={colors.textSecondary} />
                            </View>
                            <Text style={[styles.socialBtnLabel, { color: colors.text }]}>More Apps</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Link View Audit Logs */}
                <View style={styles.auditLogContainer}>
                    <Text style={[styles.auditLogTitle, { color: colors.text }]}>Shared Access Audit Logs</Text>
                    <Text style={[styles.auditLogSub, { color: colors.textSecondary }]}>Track views and access logs of your reports</Text>

                    <View style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <View style={[styles.logRow, { borderBottomColor: colors.divider }]}>
                            <View style={[styles.logLeftIcon, { backgroundColor: isDark ? "#14532D" : "#DCFCE7" }]}>
                                <MaterialCommunityIcons name="eye-check-outline" size={16} color={isDark ? "#4ADE80" : "#166534"} />
                            </View>
                            <View style={styles.logMain}>
                                <Text style={[styles.logReader, { color: colors.text }]}>Dr. Priya Nair (Consultation Referral)</Text>
                                <Text style={[styles.logMeta, { color: colors.textSecondary }]}>Opened on 20 May 2026, 09:12 AM</Text>
                                <Text style={[styles.logGeo, { color: colors.textSecondary }]}>Location: LifeRelier Care Clinic • IP: 103.4.192.12</Text>
                            </View>
                            <View style={styles.statusVerifiedBadge}>
                                <Text style={styles.statusVerifiedBadgeText}>Verified</Text>
                            </View>
                        </View>

                        <View style={[styles.logRow, { borderBottomWidth: 0 }]}>
                            <View style={[styles.logLeftIcon, { backgroundColor: isDark ? "#14532D" : "#DCFCE7" }]}>
                                <MaterialCommunityIcons name="eye-check-outline" size={16} color={isDark ? "#4ADE80" : "#166534"} />
                            </View>
                            <View style={styles.logMain}>
                                <Text style={[styles.logReader, { color: colors.text }]}>Public Link Access (AES Encryption Key)</Text>
                                <Text style={[styles.logMeta, { color: colors.textSecondary }]}>Opened on 19 May 2026, 11:44 PM</Text>
                                <Text style={[styles.logGeo, { color: colors.textSecondary }]}>Location: Delhi, India • IP: 182.90.11.45</Text>
                            </View>
                            <View style={styles.statusVerifiedBadge}>
                                <Text style={styles.statusVerifiedBadgeText}>Verified</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Custom Toast Alert */}
            {toastMessage && (
                <View style={styles.toast}>
                    <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.toastText}>{toastMessage}</Text>
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
        paddingHorizontal: 20,
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
        fontSize: 17,
        fontWeight: "700",
        color: "#071739",
    },
    scrollContent: {
        paddingBottom: 40,
    },
    reportSummaryCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    summaryIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#EFF6FF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    summaryTextContent: {
        flex: 1,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
    },
    summaryMeta: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 2,
    },
    secureBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#DCFCE7",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    secureBadgeText: {
        fontSize: 10,
        fontWeight: "800",
        color: "#166534",
        marginLeft: 4,
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: "#E2E8F0",
        borderRadius: 14,
        marginHorizontal: 20,
        marginTop: 20,
        padding: 4,
    },
    tabButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 10,
    },
    tabButtonActive: {
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    tabText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#64748B",
        marginLeft: 6,
    },
    tabTextActive: {
        color: "#2563EB",
    },
    tabContent: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    contentTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 16,
    },
    doctorCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    doctorCardSelected: {
        backgroundColor: "#F8FAFC",
    },
    doctorInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    doctorAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#EFF6FF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    doctorMeta: {
        flex: 1,
    },
    doctorName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#334155",
    },
    doctorSub: {
        fontSize: 11,
        color: "#64748B",
        marginTop: 2,
    },
    sectionDivider: {
        fontSize: 11,
        fontWeight: "700",
        color: "#94A3B8",
        textAlign: "center",
        marginVertical: 20,
        letterSpacing: 1,
    },
    inputWrapper: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#64748B",
        marginBottom: 6,
    },
    textInput: {
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
        color: "#334155",
        backgroundColor: "#F8FAFC",
    },
    textArea: {
        height: 80,
        textAlignVertical: "top",
    },
    actionBtnSolid: {
        backgroundColor: "#2563EB",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
        paddingVertical: 14,
        marginTop: 10,
    },
    actionBtnSolidText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },
    settingLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#64748B",
        marginBottom: 10,
    },
    expiryChipsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    expiryChip: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        alignItems: "center",
        marginRight: 6,
    },
    expiryChipActive: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
    expiryChipText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#64748B",
    },
    expiryChipTextActive: {
        color: "#FFFFFF",
    },
    switchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    switchTextContainer: {
        flex: 1,
        paddingRight: 10,
    },
    switchTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#334155",
    },
    switchSubtitle: {
        fontSize: 11,
        color: "#64748B",
        marginTop: 2,
    },
    generatedLinkCard: {
        marginTop: 20,
        padding: 14,
        backgroundColor: "#EFF6FF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#DBEAFE",
    },
    generatedLinkLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: "#2563EB",
        textTransform: "uppercase",
    },
    linkDisplayRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 6,
    },
    linkDisplayText: {
        flex: 1,
        fontSize: 13,
        color: "#1E40AF",
        fontWeight: "600",
    },
    linkCopyBtn: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
        borderWidth: 1,
        borderColor: "#BFDBFE",
    },
    thirdPartyContainer: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    thirdPartyTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 12,
    },
    socialButtonsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    socialBtn: {
        alignItems: "center",
        width: (width - 40) / 4 - 8,
    },
    socialIconBg: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    socialBtnLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#475569",
    },
    auditLogContainer: {
        paddingHorizontal: 20,
        marginTop: 28,
    },
    auditLogTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0F172A",
    },
    auditLogSub: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 2,
        marginBottom: 14,
    },
    logCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    logRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    logLeftIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#DCFCE7",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    logMain: {
        flex: 1,
    },
    logReader: {
        fontSize: 12,
        fontWeight: "700",
        color: "#334155",
    },
    logMeta: {
        fontSize: 11,
        color: "#64748B",
        marginTop: 2,
    },
    logGeo: {
        fontSize: 10,
        color: "#94A3B8",
        marginTop: 2,
    },
    statusVerifiedBadge: {
        backgroundColor: "#DCFCE7",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusVerifiedBadgeText: {
        fontSize: 9,
        fontWeight: "800",
        color: "#166534",
    },
    toast: {
        position: "absolute",
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: "#334155",
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
        zIndex: 9999,
    },
    toastText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600",
        marginLeft: 8,
        flex: 1,
    },
});
