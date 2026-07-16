import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@/utils/themeManager";
import { mockReports, ReportData } from "@/utils/mockReportsData";

export default function ReportAIScreen() {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors, isDark);
    const router = useRouter();
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Current active report
    const activeReport = useMemo(() => {
        return mockReports.find((r) => r.id === selectedReportId) || null;
    }, [selectedReportId]);

    const handleSelectReport = (id: string) => {
        setAnalyzing(true);
        setSelectedReportId(id);
        setTimeout(() => {
            setAnalyzing(false);
        }, 1200);
    };

    const handleUploadSim = () => {
        setUploading(true);
        setTimeout(() => {
            setUploading(false);
            handleSelectReport("lipid"); // fallback to lipid profile as scanned result simulation
        }, 2000);
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Report Explainer AI</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Upload Section Banner */}
                <TouchableOpacity
                    style={styles.uploadCard}
                    activeOpacity={0.8}
                    onPress={handleUploadSim}
                >
                    {uploading ? (
                        <View style={styles.uploadLoading}>
                            <ActivityIndicator size="large" color="#2563EB" />
                            <Text style={styles.uploadLoadingText}>Uploading & decrypting file (4.2 MB)...</Text>
                        </View>
                    ) : (
                        <View style={styles.uploadInner}>
                            <MaterialCommunityIcons name="file-upload-outline" size={48} color="#2563EB" />
                            <Text style={styles.uploadTitle}>Scan or Upload PDF Report</Text>
                            <Text style={styles.uploadSubtitle}>Supported: PDF, JPG, PNG up to 10MB</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <Text style={styles.sectionDivider}>OR SELECT RECENT LAB RECORD</Text>

                {/* Selection pills for mockup reports */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
                    {mockReports.map((rep) => (
                        <TouchableOpacity
                            key={rep.id}
                            style={[
                                styles.pillChip,
                                selectedReportId === rep.id && styles.pillChipActive,
                            ]}
                            onPress={() => handleSelectReport(rep.id)}
                        >
                            <Text style={[styles.pillChipText, selectedReportId === rep.id && styles.pillChipTextActive]}>
                                {rep.title.split(" (")[0]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Analysis Loading State */}
                {analyzing && (
                    <View style={styles.analyzingCard}>
                        <ActivityIndicator size="small" color="#2563EB" style={{ marginBottom: 10 }} />
                        <Text style={styles.analyzingText}>AI is reading diagnostic metrics...</Text>
                    </View>
                )}

                {/* AI Explanation Dashboard */}
                {!analyzing && activeReport && (
                    <View style={styles.explanationCard}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="robot" size={24} color="#15803D" />
                            <View style={styles.headerText}>
                                <Text style={styles.reportTitle}>{activeReport.title}</Text>
                                <Text style={styles.reportDate}>Analyzed on {activeReport.date}</Text>
                            </View>
                        </View>

                        {/* Layman Verdict Banner */}
                        <View
                            style={[
                                styles.verdictBox,
                                {
                                    backgroundColor:
                                        activeReport.status === "Normal"
                                            ? "#F0FDF4"
                                            : "#FFFBEB",
                                    borderColor:
                                        activeReport.status === "Normal"
                                            ? "#BBF7D0"
                                            : "#FDE68A",
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.verdictTitle,
                                    { color: activeReport.status === "Normal" ? "#166534" : "#B45309" },
                                ]}
                            >
                                AI Health Summary: {activeReport.status}
                            </Text>
                            <Text style={styles.verdictDesc}>
                                {activeReport.status === "Normal"
                                    ? "All parameters analyzed in this panel are within standard physiological limits. Your immune, clotting, and vascular markers represent healthy overall function."
                                    : "We found borderline or elevated levels in your lipids. Bad cholesterol (LDL) is above target. A heart-healthy diet and active lifestyle adjustments are recommended."}
                            </Text>
                        </View>

                        {/* Parameter Flags */}
                        <Text style={styles.cardSectionTitle}>Key Parameter Breakdown</Text>
                        {activeReport.parameters && activeReport.parameters.map((param, index) => {
                            const isAttention = param.status !== "Normal";
                            return (
                                <View key={index} style={styles.paramRow}>
                                    <View style={styles.paramMeta}>
                                        <Text style={styles.paramName}>{param.name}</Text>
                                        <Text style={styles.paramReason}>
                                            {isAttention
                                                ? `Value ${param.value} is higher than reference max of ${param.maxNormal}.`
                                                : `Perfect reading of ${param.value} within normal bounds.`}
                                        </Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.paramBadge,
                                            { backgroundColor: isAttention ? "#FEE2E2" : "#E8F5E9" },
                                        ]}
                                    >
                                        <Text style={[styles.paramBadgeText, { color: isAttention ? "#EF4444" : "#10B981" }]}>
                                            {param.status}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}

                        {/* Key Suggestions */}
                        <Text style={styles.cardSectionTitle}>Actionable AI Tips</Text>
                        <View style={styles.aiTipsBlock}>
                            {activeReport.aiInsights.map((insight, idx) => (
                                <View key={idx} style={styles.tipRow}>
                                    <View style={styles.tipBullet} />
                                    <Text style={styles.tipText}>{insight}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Quick navigations */}
                        <TouchableOpacity
                            style={styles.detailsBtn}
                            onPress={() => router.push(`/reports/report-details?id=${activeReport.id}`)}
                        >
                            <Text style={styles.detailsBtnText}>View Clinical Reference & Gauges</Text>
                            <MaterialCommunityIcons name="arrow-right" size={16} color="#2563EB" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Default Empty State */}
                {!analyzing && !activeReport && (
                    <View style={styles.emptyExplain}>
                        <MaterialCommunityIcons name="text-search" size={48} color="#94A3B8" />
                        <Text style={styles.emptyTitle}>No report selected</Text>
                        <Text style={styles.emptySubtitle}>
                            Upload a scan or choose one of the mock items from the list above to get an instant AI-powered plain English explanation.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
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
    },
    uploadCard: {
        backgroundColor: colors.card,
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: isDark ? "rgba(37, 99, 235, 0.3)" : "#BFDBFE",
        borderStyle: "dashed",
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    uploadInner: {
        alignItems: "center",
    },
    uploadTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: isDark ? colors.text : "#1E3A8A",
        marginTop: 10,
    },
    uploadSubtitle: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 4,
    },
    uploadLoading: {
        alignItems: "center",
        paddingVertical: 10,
    },
    uploadLoadingText: {
        fontSize: 12,
        color: "#2563EB",
        fontWeight: "600",
        marginTop: 10,
    },
    sectionDivider: {
        fontSize: 11,
        fontWeight: "700",
        color: "#94A3B8",
        textAlign: "center",
        marginVertical: 20,
        letterSpacing: 1,
    },
    pillsRow: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    pillChip: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 14,
        marginRight: 8,
    },
    pillChipActive: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
    pillChipText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.textSecondary,
    },
    pillChipTextActive: {
        color: "#FFFFFF",
    },
    analyzingCard: {
        backgroundColor: colors.card,
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 20,
        alignItems: "center",
    },
    analyzingText: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: "500",
    },
    explanationCard: {
        backgroundColor: colors.card,
        marginHorizontal: 20,
        borderRadius: 24,
        padding: 20,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        paddingBottom: 12,
    },
    headerText: {
        marginLeft: 10,
    },
    reportTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.text,
    },
    reportDate: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 2,
    },
    verdictBox: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        marginBottom: 20,
    },
    verdictTitle: {
        fontSize: 14,
        fontWeight: "700",
    },
    verdictDesc: {
        fontSize: 12,
        color: isDark ? colors.textSecondary : "#334155",
        marginTop: 6,
        lineHeight: 18,
    },
    cardSectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 12,
    },
    paramRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F8FAFC",
    },
    paramMeta: {
        flex: 1,
        paddingRight: 10,
    },
    paramName: {
        fontSize: 13,
        fontWeight: "700",
        color: isDark ? colors.textSecondary : "#334155",
    },
    paramReason: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 2,
        lineHeight: 14,
    },
    paramBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    paramBadgeText: {
        fontSize: 10,
        fontWeight: "700",
    },
    aiTipsBlock: {
        marginBottom: 20,
    },
    tipRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    tipBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#166534",
        marginTop: 6,
        marginRight: 8,
    },
    tipText: {
        fontSize: 12,
        color: colors.textSecondary,
        lineHeight: 16,
        flex: 1,
    },
    detailsBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: "#2563EB",
        borderRadius: 14,
        paddingVertical: 12,
    },
    detailsBtnText: {
        color: "#2563EB",
        fontSize: 13,
        fontWeight: "700",
        marginRight: 6,
    },
    emptyExplain: {
        backgroundColor: colors.card,
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.textSecondary,
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: "center",
        marginTop: 6,
        lineHeight: 18,
    },
});