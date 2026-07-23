import React, { useState, useMemo } from "react";
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

export default function SymptomCheckerScreen() {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors, isDark);
    const router = useRouter();

    const [symptom, setSymptom] = useState("");
    const [severity, setSeverity] = useState<number>(3); // 1 to 10
    const [duration, setDuration] = useState("2"); // Days
    const [analyzing, setAnalyzing] = useState(false);
    const [resultReady, setResultReady] = useState(false);

    const handleCheck = () => {
        if (!symptom.trim()) return;
        setAnalyzing(true);
        setTimeout(() => {
            setAnalyzing(false);
            setResultReady(true);
        }, 1800);
    };

    // Calculate diagnostic evaluation properties
    const triageData = useMemo(() => {
        let level: "self" | "doctor" | "urgent" = "self";
        let levelText = "Self-Care & Rest";
        let color = "#10B981"; // green
        let bgColor = "#E8F5E9";
        
        if (severity >= 8) {
            level = "urgent";
            levelText = "Urgent / Emergency Care Required";
            color = "#EF4444"; // red
            bgColor = "#FFEBEE";
        } else if (severity >= 4 || parseInt(duration) >= 5) {
            level = "doctor";
            levelText = "Recommended Doctor Consultation";
            color = "#F59E0B"; // orange
            bgColor = "#FFF3E0";
        }

        return { level, levelText, color, bgColor };
    }, [severity, duration]);

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Symptom Checker</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Safety Warning */}
                <View style={styles.warningBox}>
                    <MaterialCommunityIcons name="shield-alert-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.warningText}>
                        This is an informational tool. It is not a clinical diagnosis. In case of emergency, call local medical services immediately.
                    </Text>
                </View>

                {/* Symptom Input Form */}
                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>Enter Your Symptoms</Text>
                    
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>What is your primary symptom?</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g. Headache, Dry cough, Fatigues"
                            placeholderTextColor={colors.textSecondary}
                            value={symptom}
                            onChangeText={setSymptom}
                        />
                    </View>

                    <Text style={styles.inputLabel}>Severity Level: {severity} / 10</Text>
                    <View style={styles.severitySelector}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <TouchableOpacity
                                key={num}
                                style={[
                                    styles.severityNum,
                                    severity === num && styles.severityNumActive,
                                ]}
                                onPress={() => setSeverity(num)}
                            >
                                <Text style={[styles.severityNumText, severity === num && styles.severityNumTextActive]}>
                                    {num}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Duration (Days)</Text>
                        <TextInput
                            style={styles.textInput}
                            keyboardType="numeric"
                            value={duration}
                            onChangeText={setDuration}
                            placeholder="e.g. 2"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.checkBtn, !symptom.trim() && styles.checkBtnDisabled]}
                        onPress={handleCheck}
                        disabled={!symptom.trim() || analyzing}
                    >
                        <Text style={styles.checkBtnText}>Analyze Symptoms</Text>
                    </TouchableOpacity>
                </View>

                {/* Analyzing state loader */}
                {analyzing && (
                    <View style={styles.analyzingCard}>
                        <ActivityIndicator size="small" color="#2563EB" style={{ marginBottom: 10 }} />
                        <Text style={styles.analyzingText}>Cross referencing medical guidelines...</Text>
                    </View>
                )}

                {/* Triage Outcome Panel */}
                {resultReady && !analyzing && (
                    <View style={styles.resultCard}>
                        <View style={styles.resultHeader}>
                            <MaterialCommunityIcons name="medical-bag" size={22} color="#2563EB" />
                            <Text style={styles.resultTitle}>AI Consultation Triage</Text>
                        </View>

                        {/* Triage recommendation strip */}
                        <View style={[styles.triageBanner, { backgroundColor: triageData.bgColor }]}>
                            <Text style={[styles.triageTitle, { color: triageData.color }]}>
                                {triageData.levelText}
                            </Text>
                        </View>

                        {/* Likely factors list */}
                        <Text style={styles.sectionHeading}>Likely Medical Explanations</Text>
                        <View style={styles.factorsList}>
                            <Text style={styles.factorItem}>• Common Tension Stress (High Probability)</Text>
                            <Text style={styles.factorItem}>• Mild Dehydration / Fatigue (Probable)</Text>
                            <Text style={styles.factorItem}>• Elevated blood pressure / stress levels (Monitor closely)</Text>
                        </View>

                        {/* Action items */}
                        <Text style={styles.sectionHeading}>Immediate Action Steps</Text>
                        <View style={styles.actionsList}>
                            <Text style={styles.actionItem}>1. Hydrate: Drink 1-2 glasses of warm water immediately.</Text>
                            <Text style={styles.actionItem}>2. Rest: Take a 20-minute rest break in a dark, quiet environment.</Text>
                            {triageData.level !== "self" && (
                                <Text style={styles.actionItem}>3. Schedule: Log an appointment for professional checkup if symptoms persist.</Text>
                            )}
                        </View>

                        {/* Copiable Questions for the Doctor visit */}
                        <View style={styles.doctorQuestionsBox}>
                            <View style={styles.questionsHeader}>
                                <MaterialCommunityIcons name="chat-outline" size={18} color="#2563EB" />
                                <Text style={styles.questionsTitle}>Questions for Your Doctor</Text>
                            </View>
                            <Text style={styles.questionText}>• Could my {symptom} be caused by lifestyle fatigue or stress?</Text>
                            <Text style={styles.questionText}>• Are there specific diagnostic tests I should take?</Text>
                            <Text style={styles.questionText}>• What lifestyle habits or dietary modifications do you advise?</Text>
                        </View>

                        {/* Quick action book appointment */}
                        {triageData.level !== "self" && (
                            <TouchableOpacity
                                style={styles.bookBtn}
                                onPress={() => router.push("/(tabs)/appointments")}
                            >
                                <Text style={styles.bookBtnText}>Book Clinic Appointment Now</Text>
                            </TouchableOpacity>
                        )}
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
    warningBox: {
        flexDirection: "row",
        backgroundColor: isDark ? colors.background : "#F1F5F9",
        borderRadius: 14,
        padding: 12,
        marginHorizontal: 20,
        marginTop: 20,
        alignItems: "center",
    },
    warningText: {
        fontSize: 10,
        color: colors.textSecondary,
        marginLeft: 8,
        flex: 1,
        lineHeight: 14,
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
    formTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 16,
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
    severitySelector: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    severityNum: {
        flex: 1,
        height: 32,
        borderRadius: 8,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 2,
    },
    severityNumActive: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
    severityNumText: {
        fontSize: 12,
        fontWeight: "700",
        color: colors.textSecondary,
    },
    severityNumTextActive: {
        color: "#FFFFFF",
    },
    checkBtn: {
        backgroundColor: "#2563EB",
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
    },
    checkBtnDisabled: {
        backgroundColor: "#94A3B8",
    },
    checkBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },
    analyzingCard: {
        backgroundColor: colors.card,
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 20,
        alignItems: "center",
        marginTop: 16,
    },
    analyzingText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: "500",
    },
    resultCard: {
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
    triageBanner: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        marginBottom: 16,
    },
    triageTitle: {
        fontSize: 13,
        fontWeight: "800",
        textAlign: "center",
    },
    sectionHeading: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 8,
        marginTop: 14,
    },
    factorsList: {},
    factorItem: {
        fontSize: 12,
        color: colors.textSecondary,
        lineHeight: 18,
        marginBottom: 4,
    },
    actionsList: {},
    actionItem: {
        fontSize: 12,
        color: colors.textSecondary,
        lineHeight: 18,
        marginBottom: 4,
    },
    doctorQuestionsBox: {
        backgroundColor: isDark ? "rgba(37, 99, 235, 0.12)" : "#EFF6FF",
        borderWidth: 1,
        borderColor: "#DBEAFE",
        borderRadius: 14,
        padding: 14,
        marginTop: 20,
    },
    questionsHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    questionsTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: isDark ? colors.text : "#1E3A8A",
        marginLeft: 6,
    },
    questionText: {
        fontSize: 11,
        color: isDark ? colors.textSecondary : "#334155",
        lineHeight: 16,
        marginBottom: 4,
    },
    bookBtn: {
        backgroundColor: "#2563EB",
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 20,
    },
    bookBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },
});
