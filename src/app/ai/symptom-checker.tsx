import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/utils/themeManager";
import { analyzeSymptoms, SymptomAnalysis } from "@/services/geminiService";

const COMMON_SYMPTOMS = [
    "Headache", "Fever", "Cough", "Fatigue", "Nausea",
    "Vomiting", "Diarrhea", "Sore Throat", "Body Ache",
    "Shortness of Breath", "Chest Pain", "Dizziness",
    "Chills", "Loss of Taste", "Loss of Smell",
];

const HISTORY_KEY = "@symptom_history";

export default function SymptomCheckerScreen() {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors, isDark);
    const router = useRouter();

    // Form State
    const [manualSymptom, setManualSymptom] = useState("");
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [severity, setSeverity] = useState<"Mild" | "Moderate" | "Severe">("Mild");
    const [durationNum, setDurationNum] = useState("1");
    const [durationUnit, setDurationUnit] = useState<"Hours" | "Days" | "Weeks">("Days");
    
    // Optional Vitals
    const [age, setAge] = useState("");
    const [gender, setGender] = useState<"Male" | "Female" | "Other" | "">("");
    const [temperature, setTemperature] = useState("");

    // App State
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<SymptomAnalysis | null>(null);

    const toggleSymptom = (sym: string) => {
        if (selectedSymptoms.includes(sym)) {
            setSelectedSymptoms(prev => prev.filter(s => s !== sym));
        } else {
            setSelectedSymptoms(prev => [...prev, sym]);
        }
    };

    const addManualSymptom = () => {
        const trimmed = manualSymptom.trim();
        if (trimmed && !selectedSymptoms.includes(trimmed)) {
            setSelectedSymptoms(prev => [...prev, trimmed]);
            setManualSymptom("");
        }
    };

    const handleAnalyze = async () => {
        addManualSymptom(); // Add any typed but un-entered symptom
        const allSymptoms = [...selectedSymptoms];
        if (manualSymptom.trim() && !allSymptoms.includes(manualSymptom.trim())) {
            allSymptoms.push(manualSymptom.trim());
        }

        if (allSymptoms.length === 0) {
            Alert.alert("Required", "Please enter or select at least one symptom.");
            return;
        }

        setAnalyzing(true);

        const payload = {
            symptoms: allSymptoms,
            severity,
            duration: `${durationNum} ${durationUnit}`,
            age: age ? parseInt(age) : undefined,
            gender: gender || undefined,
            temperature: temperature ? parseFloat(temperature) : undefined,
        };

        try {
            const analysis = await analyzeSymptoms(payload);
            setResult(analysis);
            saveHistory(payload, analysis);
        } catch (error: any) {
            Alert.alert("Analysis Failed", error.message || "Failed to analyze symptoms. Please check your network and try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    const saveHistory = async (payload: any, analysis: SymptomAnalysis) => {
        try {
            const currentHistoryRaw = await AsyncStorage.getItem(HISTORY_KEY);
            const currentHistory = currentHistoryRaw ? JSON.parse(currentHistoryRaw) : [];
            const newRecord = {
                date: new Date().toISOString(),
                payload,
                analysis,
            };
            const updatedHistory = [newRecord, ...currentHistory].slice(0, 10); // Keep last 10
            await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
        } catch (e) {
            console.error("Failed to save history", e);
        }
    };

    const startNew = () => {
        setResult(null);
        setSelectedSymptoms([]);
        setManualSymptom("");
        setSeverity("Mild");
        setDurationNum("1");
        setDurationUnit("Days");
        setAge("");
        setGender("");
        setTemperature("");
    };

    const filteredSymptoms = COMMON_SYMPTOMS.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const getSeverityColor = (sev: string) => {
        if (sev === "Mild" || sev === "Low") return "#10B981"; // Green
        if (sev === "Moderate" || sev === "Medium") return "#F59E0B"; // Orange
        return "#EF4444"; // Red
    };

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
                
                {analyzing ? (
                    <View style={styles.analyzingCard}>
                        <ActivityIndicator size="large" color="#2563EB" style={{ marginBottom: 16 }} />
                        <Text style={styles.analyzingTitle}>Analyzing Symptoms...</Text>
                        <Text style={styles.analyzingText}>Cross-referencing medical guidelines and assessing severity.</Text>
                    </View>
                ) : result ? (
                    // Results View
                    <View style={styles.resultContainer}>
                        <View style={styles.warningBox}>
                            <MaterialCommunityIcons name="alert-circle" size={20} color="#D97706" />
                            <Text style={styles.warningText}>{result.disclaimer}</Text>
                        </View>

                        <View style={styles.triageCard}>
                            <Text style={styles.sectionHeading}>Assessment Summary</Text>
                            <View style={styles.badgeRow}>
                                <View style={[styles.badge, { backgroundColor: getSeverityColor(result.severity) + "20", borderColor: getSeverityColor(result.severity) }]}>
                                    <Text style={[styles.badgeText, { color: getSeverityColor(result.severity) }]}>Severity: {result.severity}</Text>
                                </View>
                                <View style={[styles.badge, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9", borderColor: colors.cardBorder }]}>
                                    <Text style={[styles.badgeText, { color: colors.text }]}>Confidence: {result.confidence}</Text>
                                </View>
                            </View>

                            {result.immediateConsultation && (
                                <View style={styles.urgentBox}>
                                    <MaterialCommunityIcons name="alert" size={20} color="#FFFFFF" />
                                    <Text style={styles.urgentText}>Immediate Doctor Consultation Recommended</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.resultCard}>
                            <Text style={styles.sectionHeading}>Possible Conditions</Text>
                            {result.conditions.length > 0 ? result.conditions.map((cond, idx) => (
                                <View key={idx} style={styles.listItem}>
                                    <Text style={styles.listItemTitle}>• {cond.name}</Text>
                                    <Text style={styles.listItemDesc}>{cond.explanation}</Text>
                                </View>
                            )) : (
                                <Text style={styles.listItemDesc}>No specific conditions identified. Please consult a doctor.</Text>
                            )}
                        </View>

                        {(result.homeCare.length > 0 || result.diet.length > 0) && (
                            <View style={styles.resultCard}>
                                <Text style={styles.sectionHeading}>Home Care & Diet</Text>
                                {result.homeCare.map((care, idx) => (
                                    <Text key={`care-${idx}`} style={styles.listItemDesc}>• {care}</Text>
                                ))}
                                {result.diet.map((diet, idx) => (
                                    <Text key={`diet-${idx}`} style={styles.listItemDesc}>• {diet}</Text>
                                ))}
                            </View>
                        )}

                        {result.redFlags.length > 0 && (
                            <View style={[styles.resultCard, { borderColor: "#FECACA", backgroundColor: isDark ? "#450a0a" : "#FEF2F2" }]}>
                                <Text style={[styles.sectionHeading, { color: "#B91C1C" }]}>Red Flags (Seek Urgent Care If)</Text>
                                {result.redFlags.map((flag, idx) => (
                                    <Text key={idx} style={[styles.listItemDesc, { color: "#991B1B" }]}>• {flag}</Text>
                                ))}
                            </View>
                        )}

                        <TouchableOpacity style={styles.primaryBtn} onPress={startNew}>
                            <Text style={styles.primaryBtnText}>Start New Assessment</Text>
                        </TouchableOpacity>

                        {result.immediateConsultation && (
                            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: "#10B981", marginTop: 12 }]} onPress={() => router.push("/(tabs)/appointments")}>
                                <Text style={styles.primaryBtnText}>Book Appointment</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    // Input Form View
                    <View style={styles.formContainer}>
                        <View style={styles.section}>
                            <Text style={styles.label}>1. Select Symptoms</Text>
                            <View style={styles.searchInputContainer}>
                                <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search symptoms..."
                                    placeholderTextColor={colors.textSecondary}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </View>
                            
                            <View style={styles.chipContainer}>
                                {filteredSymptoms.slice(0, 8).map(sym => (
                                    <TouchableOpacity 
                                        key={sym} 
                                        style={[styles.chip, selectedSymptoms.includes(sym) && styles.chipActive]}
                                        onPress={() => toggleSymptom(sym)}
                                    >
                                        <Text style={[styles.chipText, selectedSymptoms.includes(sym) && styles.chipTextActive]}>{sym}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.manualInputContainer}>
                                <TextInput
                                    style={styles.manualInput}
                                    placeholder="Other symptom..."
                                    placeholderTextColor={colors.textSecondary}
                                    value={manualSymptom}
                                    onChangeText={setManualSymptom}
                                    onSubmitEditing={addManualSymptom}
                                />
                                <TouchableOpacity style={styles.addBtn} onPress={addManualSymptom}>
                                    <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.label}>2. Severity</Text>
                            <View style={styles.segmentedControl}>
                                {["Mild", "Moderate", "Severe"].map(s => (
                                    <TouchableOpacity 
                                        key={s} 
                                        style={[styles.segmentBtn, severity === s && styles.segmentBtnActive]}
                                        onPress={() => setSeverity(s as any)}
                                    >
                                        <Text style={[styles.segmentText, severity === s && styles.segmentTextActive]}>{s}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.label}>3. Duration</Text>
                            <View style={styles.durationRow}>
                                <TextInput
                                    style={[styles.textInput, { flex: 1, marginRight: 12 }]}
                                    keyboardType="numeric"
                                    value={durationNum}
                                    onChangeText={setDurationNum}
                                />
                                <View style={[styles.segmentedControl, { flex: 2, marginBottom: 0 }]}>
                                    {["Hours", "Days", "Weeks"].map(u => (
                                        <TouchableOpacity 
                                            key={u} 
                                            style={[styles.segmentBtn, durationUnit === u && styles.segmentBtnActive]}
                                            onPress={() => setDurationUnit(u as any)}
                                        >
                                            <Text style={[styles.segmentText, durationUnit === u && styles.segmentTextActive, { fontSize: 11 }]}>{u}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.label}>4. Optional Vitals & Info</Text>
                            <View style={styles.row}>
                                <TextInput
                                    style={[styles.textInput, { flex: 1, marginRight: 8 }]}
                                    placeholder="Age"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="numeric"
                                    value={age}
                                    onChangeText={setAge}
                                />
                                <View style={[styles.textInput, { flex: 1, marginRight: 8, paddingHorizontal: 0, paddingVertical: 0 }]}>
                                     {/* Simple toggle for gender instead of complex picker for brevity */}
                                     <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 4 }}>
                                        {["Male", "Female"].map(g => (
                                            <TouchableOpacity key={g} style={{ paddingHorizontal: 8, paddingVertical: 8 }} onPress={() => setGender(g as any)}>
                                                <Text style={{ fontSize: 13, color: gender === g ? "#2563EB" : colors.textSecondary, fontWeight: gender === g ? "700" : "500" }}>{g}</Text>
                                            </TouchableOpacity>
                                        ))}
                                     </ScrollView>
                                </View>
                                <TextInput
                                    style={[styles.textInput, { flex: 1 }]}
                                    placeholder="Temp (°F)"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="numeric"
                                    value={temperature}
                                    onChangeText={setTemperature}
                                />
                            </View>
                        </View>

                        <TouchableOpacity style={styles.primaryBtn} onPress={handleAnalyze}>
                            <Text style={styles.primaryBtnText}>Analyze Symptoms</Text>
                        </TouchableOpacity>
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
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    formContainer: {},
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 12,
    },
    searchInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        color: colors.text,
        fontSize: 14,
    },
    chipContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 12,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    chipActive: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
    chipText: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: "500",
    },
    chipTextActive: {
        color: "#FFFFFF",
    },
    manualInputContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    manualInput: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: colors.cardBorder,
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 44,
        fontSize: 14,
        color: colors.text,
        backgroundColor: colors.card,
        marginRight: 10,
    },
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
    },
    segmentedControl: {
        flexDirection: "row",
        backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
        borderRadius: 12,
        padding: 4,
        marginBottom: 12,
    },
    segmentBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: 8,
    },
    segmentBtnActive: {
        backgroundColor: colors.card,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    segmentText: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textSecondary,
    },
    segmentTextActive: {
        color: colors.text,
    },
    durationRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    textInput: {
        borderWidth: 1.5,
        borderColor: colors.cardBorder,
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 44,
        fontSize: 14,
        color: colors.text,
        backgroundColor: colors.card,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    primaryBtn: {
        backgroundColor: "#2563EB",
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 10,
    },
    primaryBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 15,
    },
    analyzingCard: {
        backgroundColor: colors.card,
        padding: 30,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: colors.cardBorder,
        marginTop: 40,
    },
    analyzingTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 8,
    },
    analyzingText: {
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: "center",
        lineHeight: 20,
    },
    resultContainer: {
        flex: 1,
    },
    warningBox: {
        flexDirection: "row",
        backgroundColor: isDark ? "rgba(245, 158, 11, 0.12)" : "#FFFBEB",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: isDark ? "rgba(245, 158, 11, 0.3)" : "#FDE68A",
    },
    warningText: {
        fontSize: 11,
        color: "#B45309",
        marginLeft: 8,
        flex: 1,
        lineHeight: 16,
        fontWeight: "500",
    },
    triageCard: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        marginBottom: 16,
    },
    sectionHeading: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 12,
    },
    badgeRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 16,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "700",
    },
    urgentBox: {
        flexDirection: "row",
        backgroundColor: "#EF4444",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    urgentText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 13,
        marginLeft: 8,
    },
    resultCard: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        marginBottom: 16,
    },
    listItem: {
        marginBottom: 12,
    },
    listItemTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 4,
    },
    listItemDesc: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: 6,
        paddingLeft: 10,
    },
});
