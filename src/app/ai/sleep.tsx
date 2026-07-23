import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@/utils/themeManager";

interface SleepRecord {
    hours: number;
    quality: "restless" | "average" | "good" | "deep";
}

export default function SleepScreen() {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors, isDark);
    const router = useRouter();

    const [hours, setHours] = useState("7.5");
    const [quality, setQuality] = useState<"restless" | "average" | "good" | "deep">("good");
    const [sleepLog, setSleepLog] = useState<SleepRecord>({ hours: 7.5, quality: "good" });
    const [logged, setLogged] = useState(false);

    const handleLogSleep = () => {
        const numHours = parseFloat(hours) || 7.0;
        setSleepLog({ hours: numHours, quality });
        setLogged(true);
        setTimeout(() => setLogged(false), 3000);
    };

    // Calculate dynamic analysis values
    const analytics = useMemo(() => {
        const score = sleepLog.quality === "deep"
            ? 96
            : sleepLog.quality === "good"
            ? 86
            : sleepLog.quality === "average"
            ? 68
            : 42;

        const sleepDebt = Math.max(0, 8 - sleepLog.hours); // base 8 hours needed
        const recommendation = sleepLog.quality === "restless"
            ? "Avoid caffeine intake after 2:00 PM today. Settle down with a 10-minute screen-free wind-down routine before sleep."
            : sleepDebt > 1.5
            ? "You have accumulated significant sleep debt. Try going to sleep 30 minutes earlier tonight to start catching up."
            : "Excellent sleep score. Maintain this rhythm by sticking to consistent sleep and wake times.";

        return { score, sleepDebt, recommendation };
    }, [sleepLog]);

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sleep Optimizer</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Sleep Log Form */}
                <View style={styles.logCard}>
                    <Text style={styles.cardTitle}>Log Last Night's Sleep</Text>
                    
                    <View style={styles.inputRow}>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Sleep Duration (Hours)</Text>
                            <TextInput
                                style={styles.textInput}
                                keyboardType="numeric"
                                value={hours}
                                onChangeText={setHours}
                                placeholder="e.g. 7.5"
                            />
                        </View>
                    </View>

                    <Text style={styles.inputLabel}>Sleep Quality</Text>
                    <View style={styles.qualityChips}>
                        {(["restless", "average", "good", "deep"] as const).map((q) => (
                            <TouchableOpacity
                                key={q}
                                style={[styles.qualityChip, quality === q && styles.qualityChipActive]}
                                onPress={() => setQuality(q)}
                            >
                                <Text style={[styles.qualityText, quality === q && styles.qualityTextActive]}>
                                    {q.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.logBtn} onPress={handleLogSleep}>
                        <Text style={styles.logBtnText}>Save Sleep Data</Text>
                    </TouchableOpacity>
                </View>

                {/* Score & Analytics */}
                <View style={styles.analyticsSection}>
                    <View style={styles.scoreRow}>
                        {/* Sleep Score circle */}
                        <View style={styles.scoreCircle}>
                            <Text style={styles.scoreVal}>{analytics.score}</Text>
                            <Text style={styles.scoreLabel}>Score</Text>
                        </View>

                        <View style={styles.analyticsMeta}>
                            <Text style={styles.analyticsTitle}>Sleep Quality Score</Text>
                            <Text style={styles.analyticsSub}>
                                Based on {sleepLog.hours} hours logged. Target is 8 hours.
                            </Text>
                            
                            {analytics.sleepDebt > 0 && (
                                <View style={styles.debtAlert}>
                                    <MaterialCommunityIcons name="clock-alert-outline" size={14} color="#D97706" />
                                    <Text style={styles.debtAlertText}>Sleep Debt: {analytics.sleepDebt} hrs</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* AI Sleep Coach Recommendations */}
                <View style={styles.coachCard}>
                    <View style={styles.coachHeader}>
                        <MaterialCommunityIcons name="robot" size={20} color="#1E3A8A" />
                        <Text style={styles.coachTitle}>Circadian Habit Coach</Text>
                    </View>
                    
                    <Text style={styles.coachRecomText}>{analytics.recommendation}</Text>

                    <View style={styles.habitsList}>
                        <View style={styles.habitRow}>
                            <MaterialCommunityIcons name="weather-sunny" size={20} color="#F59E0B" />
                            <View style={styles.habitDetails}>
                                <Text style={styles.habitTitleText}>Morning Light Exposure</Text>
                                <Text style={styles.habitDescText}>Get 10 minutes of bright sunlight before 08:30 AM.</Text>
                            </View>
                        </View>

                        <View style={styles.habitRow}>
                            <MaterialCommunityIcons name="cellphone-off" size={20} color={colors.textSecondary} />
                            <View style={styles.habitDetails}>
                                <Text style={styles.habitTitleText}>Evening Screen Restriction</Text>
                                <Text style={styles.habitDescText}>Avoid smartphones or blue light displays after 10:00 PM.</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Success toast notification */}
            {logged && (
                <View style={styles.toast}>
                    <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.toastText}>Sleep logs saved successfully!</Text>
                </View>
            )}
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
    logCard: {
        backgroundColor: colors.card,
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 16,
    },
    inputRow: {
        flexDirection: "row",
        marginBottom: 16,
    },
    inputWrapper: {
        flex: 1,
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
    qualityChips: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    qualityChip: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: colors.cardBorder,
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: "center",
        marginRight: 6,
    },
    qualityChipActive: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
    qualityText: {
        fontSize: 10,
        fontWeight: "700",
        color: colors.textSecondary,
    },
    qualityTextActive: {
        color: "#FFFFFF",
    },
    logBtn: {
        backgroundColor: "#2563EB",
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
    },
    logBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },
    analyticsSection: {
        backgroundColor: colors.card,
        borderRadius: 24,
        marginHorizontal: 20,
        marginTop: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    scoreRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    scoreCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: isDark ? "rgba(37, 99, 235, 0.12)" : "#EFF6FF",
        borderWidth: 4,
        borderColor: "#3B82F6",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    scoreVal: {
        fontSize: 26,
        fontWeight: "900",
        color: isDark ? colors.text : "#1E3A8A",
    },
    scoreLabel: {
        fontSize: 9,
        fontWeight: "700",
        color: "#2563EB",
        textTransform: "uppercase",
        marginTop: -2,
    },
    analyticsMeta: {
        flex: 1,
    },
    analyticsTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.text,
    },
    analyticsSub: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 2,
    },
    debtAlert: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        backgroundColor: isDark ? colors.card : "#FFFBEB",
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: isDark ? colors.cardBorder : "#FDE68A",
    },
    debtAlertText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#D97706",
        marginLeft: 4,
    },
    coachCard: {
        backgroundColor: isDark ? "rgba(37, 99, 235, 0.12)" : "#EFF6FF",
        borderWidth: 1,
        borderColor: "#DBEAFE",
        borderRadius: 24,
        marginHorizontal: 20,
        marginTop: 16,
        padding: 18,
    },
    coachHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    coachTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: isDark ? colors.text : "#1E3A8A",
        marginLeft: 8,
    },
    coachRecomText: {
        fontSize: 12,
        color: isDark ? colors.textSecondary : "#334155",
        lineHeight: 18,
        marginBottom: 16,
    },
    habitsList: {},
    habitRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
    },
    habitDetails: {
        marginLeft: 10,
        flex: 1,
    },
    habitTitleText: {
        fontSize: 12,
        fontWeight: "700",
        color: isDark ? colors.textSecondary : "#334155",
    },
    habitDescText: {
        fontSize: 10,
        color: colors.textSecondary,
        marginTop: 2,
    },
    toast: {
        position: "absolute",
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: "#10B981",
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