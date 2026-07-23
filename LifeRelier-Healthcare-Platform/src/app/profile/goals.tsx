import React, { useState } from "react";
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

interface Goal {
    id: string;
    title: string;
    current: number;
    target: number;
    unit: string;
    icon: string;
    color: string;
}

export default function GoalsScreen() {
    const router = useRouter();

    const [waterCurrent, setWaterCurrent] = useState(1.75); // in liters
    const [stepsCurrent, setStepsCurrent] = useState(7842);
    const [customGoals, setCustomGoals] = useState<Goal[]>([]);
    const [newTitle, setNewTitle] = useState("");
    const [newTarget, setNewTarget] = useState("");
    const [newUnit, setNewUnit] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const handleAddWater = (amount: number) => {
        setWaterCurrent((prev) => Math.min(3.0, prev + amount));
    };

    const handleAddGoal = () => {
        if (!newTitle.trim() || !newTarget.trim()) return;

        const targetNum = parseFloat(newTarget) || 10;
        const newGoal: Goal = {
            id: Date.now().toString(),
            title: newTitle,
            current: 0,
            target: targetNum,
            unit: newUnit.trim() || "times",
            icon: "star-outline",
            color: "#9333EA",
        };

        setCustomGoals((prev) => [...prev, newGoal]);
        setNewTitle("");
        setNewTarget("");
        setNewUnit("");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#071739" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Health Goals</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionHeading}>Daily Goal Trackers</Text>

                {/* Steps Tracker */}
                <View style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                        <View style={[styles.iconWrapper, { backgroundColor: "#EFF6FF" }]}>
                            <MaterialCommunityIcons name="run" size={22} color="#2563EB" />
                        </View>
                        <View style={styles.goalMeta}>
                            <Text style={styles.goalTitle}>Daily Footsteps</Text>
                            <Text style={styles.goalSub}>Target: 10,000 steps</Text>
                        </View>
                        <Text style={styles.goalRatioText}>{stepsCurrent} / 10,000</Text>
                    </View>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${(stepsCurrent / 10000) * 100}%`, backgroundColor: "#2563EB" }]} />
                        </View>
                        <Text style={styles.progressPercentText}>
                            {((stepsCurrent / 10000) * 100).toFixed(0)}% Completed
                        </Text>
                    </View>
                </View>

                {/* Water Intake Tracker (INTERACTIVE) */}
                <View style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                        <View style={[styles.iconWrapper, { backgroundColor: "#E0F2F1" }]}>
                            <MaterialCommunityIcons name="water" size={22} color="#008080" />
                        </View>
                        <View style={styles.goalMeta}>
                            <Text style={styles.goalTitle}>Hydration Log</Text>
                            <Text style={styles.goalSub}>Target: 3.0 Liters</Text>
                        </View>
                        <Text style={styles.goalRatioText}>{waterCurrent.toFixed(2)} / 3.00 L</Text>
                    </View>
                    
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${(waterCurrent / 3) * 100}%`, backgroundColor: "#008080" }]} />
                        </View>
                        <View style={styles.hydrationActionRow}>
                            <TouchableOpacity style={styles.waterLogBtn} onPress={() => handleAddWater(0.25)}>
                                <Text style={styles.waterLogBtnText}>+ 250 ml</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.waterLogBtn} onPress={() => handleAddWater(0.5)}>
                                <Text style={styles.waterLogBtnText}>+ 500 ml</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.waterLogBtn, { backgroundColor: "#ECEFF1" }]} onPress={() => setWaterCurrent(0)}>
                                <Text style={[styles.waterLogBtnText, { color: "#475569" }]}>Reset</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Custom Goals List */}
                {customGoals.length > 0 && (
                    <>
                        <Text style={styles.sectionHeading}>Your Custom Goals</Text>
                        {customGoals.map((goal) => (
                            <View key={goal.id} style={styles.goalCard}>
                                <View style={styles.goalHeader}>
                                    <View style={[styles.iconWrapper, { backgroundColor: "#F3E8FF" }]}>
                                        <MaterialCommunityIcons name={goal.icon as any} size={22} color={goal.color} />
                                    </View>
                                    <View style={styles.goalMeta}>
                                        <Text style={styles.goalTitle}>{goal.title}</Text>
                                        <Text style={styles.goalSub}>Target: {goal.target} {goal.unit}</Text>
                                    </View>
                                    <Text style={styles.goalRatioText}>0 / {goal.target} {goal.unit}</Text>
                                </View>
                            </View>
                        ))}
                    </>
                )}

                {/* Create Goal Form */}
                <Text style={styles.sectionHeading}>Create Custom Goal</Text>
                <View style={styles.formCard}>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Goal Name</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g. Active Exercise Time"
                            placeholderTextColor="#94A3B8"
                            value={newTitle}
                            onChangeText={setNewTitle}
                        />
                    </View>

                    <View style={styles.gridRow}>
                        <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.inputLabel}>Target Value</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g. 30"
                                keyboardType="numeric"
                                value={newTarget}
                                onChangeText={setNewTarget}
                            />
                        </View>

                        <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.inputLabel}>Unit</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g. mins, steps, cups"
                                value={newUnit}
                                onChangeText={setNewUnit}
                            />
                        </View>
                    </View>

                    <TouchableOpacity style={styles.submitBtn} onPress={handleAddGoal}>
                        <Text style={styles.submitBtnText}>Add Custom Goal</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Success toast toast notification */}
            {showSuccess && (
                <View style={styles.toast}>
                    <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.toastText}>Custom goal added successfully!</Text>
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
        marginBottom: 12,
    },
    goalCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    goalHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconWrapper: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    goalMeta: {
        marginLeft: 12,
        flex: 1,
    },
    goalTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
    },
    goalSub: {
        fontSize: 11,
        color: "#64748B",
        marginTop: 2,
    },
    goalRatioText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#334155",
    },
    progressContainer: {
        marginTop: 14,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: "#F1F5F9",
        borderRadius: 4,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 4,
    },
    progressPercentText: {
        fontSize: 10,
        color: "#94A3B8",
        fontWeight: "600",
        marginTop: 6,
        textAlign: "right",
    },
    hydrationActionRow: {
        flexDirection: "row",
        marginTop: 12,
    },
    waterLogBtn: {
        backgroundColor: "#E0F2F1",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
    },
    waterLogBtnText: {
        color: "#008080",
        fontSize: 11,
        fontWeight: "700",
    },
    formCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: "#E2E8F0",
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
    gridRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    submitBtn: {
        backgroundColor: "#2563EB",
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 10,
    },
    submitBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
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
