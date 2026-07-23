import React, { useState } from "react";
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

interface Medication {
    id: string;
    name: string;
    dosage: string;
    purpose: string;
    schedule: string;
    relation: string;
    remaining: number;
    total: number;
    refillStatus: "none" | "requested" | "approved";
}

export default function MedicinesScreen() {
    const router = useRouter();

    const [medications, setMedications] = useState<Medication[]>([
        {
            id: "m1",
            name: "Metformin HCl",
            dosage: "500 mg",
            purpose: "Type 2 Diabetes Control",
            schedule: "1 - 0 - 1 (Morning & Night)",
            relation: "After Meals",
            remaining: 12,
            total: 60,
            refillStatus: "none"
        },
        {
            id: "m2",
            name: "Atorvastatin",
            dosage: "10 mg",
            purpose: "Lower LDL Cholesterol",
            schedule: "0 - 0 - 1 (Bedtime)",
            relation: "Before Bed",
            remaining: 45,
            total: 60,
            refillStatus: "none"
        }
    ]);

    const [refillingId, setRefillingId] = useState<string | null>(null);

    const handleRefillRequest = (id: string) => {
        setRefillingId(id);
        setTimeout(() => {
            setMedications((prev) =>
                prev.map((med) =>
                    med.id === id ? { ...med, refillStatus: "requested", remaining: med.total } : med
                )
            );
            setRefillingId(null);
        }, 1500);
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#071739" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Medicines</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionHeading}>Active Prescriptions</Text>

                {medications.map((med) => {
                    const ratio = med.remaining / med.total;
                    const isLow = ratio <= 0.25;
                    const progressWidth = `${(ratio * 100).toFixed(0)}%`;

                    return (
                        <View key={med.id} style={styles.medCard}>
                            <View style={styles.medHeader}>
                                <View style={styles.medIconWrapper}>
                                    <MaterialCommunityIcons name="pill" size={22} color="#2563EB" />
                                </View>
                                <View style={styles.medMeta}>
                                    <Text style={styles.medName}>{med.name} {med.dosage}</Text>
                                    <Text style={styles.medPurpose}>{med.purpose}</Text>
                                </View>
                            </View>

                            {/* Schedule list details */}
                            <View style={styles.detailsBlock}>
                                <View style={styles.detailRow}>
                                    <MaterialCommunityIcons name="clock-outline" size={14} color="#64748B" />
                                    <Text style={styles.detailText}>{med.schedule} • {med.relation}</Text>
                                </View>
                            </View>

                            {/* Pill inventory gauge */}
                            <View style={styles.gaugeBlock}>
                                <View style={styles.gaugeHeader}>
                                    <Text style={styles.gaugeLabel}>Pill Inventory</Text>
                                    <Text style={[styles.gaugeVal, isLow && { color: "#EF4444" }]}>
                                        {med.remaining} / {med.total} Left
                                    </Text>
                                </View>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: progressWidth as any, backgroundColor: isLow ? "#EF4444" : "#10B981" }]} />
                                </View>
                                {isLow && (
                                    <Text style={styles.lowStockWarning}>⚠️ Low stock alert! Please request a refill.</Text>
                                )}
                            </View>

                            {/* Actions refiller */}
                            <View style={styles.cardActions}>
                                {med.refillStatus === "requested" ? (
                                    <View style={styles.refillStatusBox}>
                                        <MaterialCommunityIcons name="clock-check" size={16} color="#B45309" />
                                        <Text style={styles.refillStatusText}>Refill requested (Pending doctor signature)</Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={[
                                            styles.refillBtn,
                                            !isLow && styles.refillBtnDisabled,
                                        ]}
                                        onPress={() => handleRefillRequest(med.id)}
                                        disabled={!isLow || refillingId === med.id}
                                    >
                                        {refillingId === med.id ? (
                                            <ActivityIndicator size="small" color="#FFFFFF" />
                                        ) : (
                                            <Text style={styles.refillBtnText}>
                                                {isLow ? "Request Refill" : "Stock Sufficient"}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    );
                })}

                {/* Add new medication FAB */}
                <TouchableOpacity style={styles.addMedBtn}>
                    <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.addMedBtnText}>Add Custom Reminder</Text>
                </TouchableOpacity>
            </ScrollView>
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
        marginBottom: 14,
    },
    medCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    medHeader: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        paddingBottom: 12,
    },
    medIconWrapper: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: "#EFF6FF",
        justifyContent: "center",
        alignItems: "center",
    },
    medMeta: {
        marginLeft: 12,
        flex: 1,
    },
    medName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
    },
    medPurpose: {
        fontSize: 11,
        color: "#64748B",
        marginTop: 2,
    },
    detailsBlock: {
        marginVertical: 12,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    detailText: {
        fontSize: 12,
        color: "#475569",
        marginLeft: 6,
        fontWeight: "500",
    },
    gaugeBlock: {
        marginBottom: 16,
    },
    gaugeHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    gaugeLabel: {
        fontSize: 11,
        color: "#94A3B8",
        fontWeight: "600",
    },
    gaugeVal: {
        fontSize: 11,
        fontWeight: "700",
        color: "#10B981",
    },
    progressBarBg: {
        height: 6,
        backgroundColor: "#E2E8F0",
        borderRadius: 3,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 3,
    },
    lowStockWarning: {
        fontSize: 10,
        color: "#EF4444",
        fontWeight: "600",
        marginTop: 6,
    },
    cardActions: {
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        paddingTop: 12,
    },
    refillBtn: {
        backgroundColor: "#2563EB",
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    refillBtnDisabled: {
        backgroundColor: "#F1F5F9",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    refillBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 12,
    },
    refillStatusBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFBEB",
        borderWidth: 1,
        borderColor: "#FDE68A",
        paddingVertical: 8,
        borderRadius: 12,
    },
    refillStatusText: {
        color: "#B45309",
        fontSize: 11,
        fontWeight: "700",
        marginLeft: 6,
    },
    addMedBtn: {
        backgroundColor: "#2563EB",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 16,
        marginTop: 10,
    },
    addMedBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },
});
