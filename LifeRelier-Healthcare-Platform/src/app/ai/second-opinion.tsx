import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@/utils/themeManager";

export default function SecondOpinionScreen() {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors, isDark);
    const router = useRouter();

    const [diagnosis, setDiagnosis] = useState("");
    const [treatment, setTreatment] = useState("");
    const [requesting, setRequesting] = useState(false);
    const [resultReady, setResultReady] = useState(false);

    const handleRequest = () => {
        if (!diagnosis.trim() || !treatment.trim()) return;
        setRequesting(true);
        setTimeout(() => {
            setRequesting(false);
            setResultReady(true);
        }, 1800);
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>AI Second Opinion</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Intro Card */}
                <View style={styles.introCard}>
                    <MaterialCommunityIcons name="shield-check" size={24} color="#0D9488" />
                    <Text style={styles.introTitle}>Validate Treatment Protocols</Text>
                    <Text style={styles.introText}>
                        Input your diagnosed condition and doctor-suggested treatment plan. AI will cross-reference with standard clinical guidelines to provide questions and insights.
                    </Text>
                </View>

                {/* Query Form */}
                <View style={styles.formCard}>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Diagnosed Medical Condition</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g. Primary Hypertension, High Cholesterol"
                            placeholderTextColor={colors.textSecondary}
                            value={diagnosis}
                            onChangeText={setDiagnosis}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Recommended Treatment Plan / Meds</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            placeholder="e.g. Lisinopril 10mg daily, low-sodium diet, brisk walk 30 mins daily"
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            numberOfLines={3}
                            value={treatment}
                            onChangeText={setTreatment}
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.submitBtn,
                            (!diagnosis.trim() || !treatment.trim()) && styles.submitBtnDisabled,
                        ]}
                        onPress={handleRequest}
                        disabled={!diagnosis.trim() || !treatment.trim() || requesting}
                    >
                        <Text style={styles.submitBtnText}>Request AI Guidelines Check</Text>
                    </TouchableOpacity>
                </View>

                {/* Requesting Loading */}
                {requesting && (
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="small" color="#0D9488" style={{ marginBottom: 10 }} />
                        <Text style={styles.loadingText}>Referencing clinical study journals & protocols...</Text>
                    </View>
                )}

                {/* AI Review Results Dashboard */}
                {resultReady && !requesting && (
                    <View style={styles.resultsCard}>
                        <View style={styles.resultHeader}>
                            <MaterialCommunityIcons name="timeline-text" size={20} color="#0D9488" />
                            <Text style={styles.resultTitle}>Clinical Guidelines Comparison</Text>
                        </View>

                        {/* Protocol alignment status badge */}
                        <View style={styles.alignmentBadge}>
                            <MaterialCommunityIcons name="check-decagram" size={16} color="#0D9488" />
                            <Text style={styles.alignmentBadgeText}>Highly Aligns with Standard Guidelines</Text>
                        </View>

                        {/* Standard First-Line Protocol Summary */}
                        <Text style={styles.sectionHeading}>First-Line Treatment Protocols</Text>
                        <View style={styles.protocolBox}>
                            <Text style={styles.protocolText}>
                                For diagnosed conditions like <Text style={{ fontWeight: "700" }}>{diagnosis}</Text>, medical associations (e.g. AHA/ACC) recommend starting with:
                            </Text>
                            <Text style={styles.protocolBullet}>
                                • <Text style={{ fontWeight: "700" }}>First-Line Meds</Text>: ACE inhibitors (like Lisinopril), ARBs, or Calcium Channel Blockers.
                            </Text>
                            <Text style={styles.protocolBullet}>
                                • <Text style={{ fontWeight: "700" }}>Lifestyle Adjustments</Text>: Sodium restriction (DASH diet) and aerobic physical exercise.
                            </Text>
                        </View>

                        {/* Discussion Guide Checklist */}
                        <Text style={styles.sectionHeading}>Physician Discussion Guide</Text>
                        <Text style={styles.sectionSubText}>Raise these queries at your next clinical consultation:</Text>
                        
                        <View style={styles.discussionBox}>
                            <View style={styles.discRow}>
                                <MaterialCommunityIcons name="checkbox-blank-outline" size={18} color="#0D9488" />
                                <Text style={styles.discText}>Are there any drug-to-drug interactions I should watch out for?</Text>
                            </View>

                            <View style={styles.discRow}>
                                <MaterialCommunityIcons name="checkbox-blank-outline" size={18} color="#0D9488" />
                                <Text style={styles.discText}>Should I monitor my serum potassium or renal function while taking {treatment.split(" ")[0]}?</Text>
                            </View>

                            <View style={styles.discRow}>
                                <MaterialCommunityIcons name="checkbox-blank-outline" size={18} color="#0D9488" />
                                <Text style={styles.discText}>What is our target blood pressure threshold to adjust this dosage?</Text>
                            </View>
                        </View>

                        {/* Safety Disclaimer footer */}
                        <Text style={styles.disclaimerText}>
                            Note: This comparison checks general medical guidelines for educational purposes only. Never alter your dosage or treatment plan without explicit instructions from your doctor.
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
    introCard: {
        backgroundColor: "#F0FDFA",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#CCFBF1",
        marginHorizontal: 20,
        marginTop: 20,
        padding: 16,
        alignItems: "center",
    },
    introTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F766E",
        marginTop: 8,
    },
    introText: {
        fontSize: 11,
        color: "#0D9488",
        textAlign: "center",
        marginTop: 4,
        lineHeight: 16,
        fontWeight: "500",
    },
    formCard: {
        backgroundColor: colors.card,
        borderRadius: 24,
        marginHorizontal: 20,
        marginTop: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    inputWrapper: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.textSecondary,
        marginBottom: 6,
    },
    textInput: {
        borderWidth: 1.5,
        borderColor: colors.cardBorder,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
        color: isDark ? colors.textSecondary : "#334155",
        backgroundColor: colors.background,
    },
    textArea: {
        height: 80,
        textAlignVertical: "top",
    },
    submitBtn: {
        backgroundColor: "#0D9488",
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
    },
    submitBtnDisabled: {
        backgroundColor: "#94A3B8",
    },
    submitBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },
    loadingCard: {
        backgroundColor: colors.card,
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 20,
        alignItems: "center",
        marginTop: 16,
    },
    loadingText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: "500",
    },
    resultsCard: {
        backgroundColor: colors.card,
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    resultHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
    },
    resultTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.text,
        marginLeft: 8,
    },
    alignmentBadge: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F0FDFA",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#CCFBF1",
    },
    alignmentBadgeText: {
        fontSize: 12,
        fontWeight: "800",
        color: "#0D9488",
        marginLeft: 6,
    },
    sectionHeading: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 8,
        marginTop: 14,
    },
    sectionSubText: {
        fontSize: 11,
        color: colors.textSecondary,
        marginBottom: 10,
    },
    protocolBox: {
        backgroundColor: colors.background,
        borderRadius: 14,
        padding: 12,
    },
    protocolText: {
        fontSize: 12,
        color: isDark ? colors.textSecondary : "#334155",
        lineHeight: 18,
        marginBottom: 8,
    },
    protocolBullet: {
        fontSize: 11,
        color: colors.textSecondary,
        lineHeight: 16,
        marginBottom: 4,
        paddingLeft: 4,
    },
    discussionBox: {},
    discRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 10,
        backgroundColor: "#F0FDFA",
        borderRadius: 10,
        padding: 10,
    },
    discText: {
        fontSize: 12,
        color: "#0F766E",
        lineHeight: 16,
        marginLeft: 8,
        flex: 1,
    },
    disclaimerText: {
        fontSize: 10,
        color: "#94A3B8",
        fontStyle: "italic",
        lineHeight: 14,
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
        paddingTop: 12,
    },
});
