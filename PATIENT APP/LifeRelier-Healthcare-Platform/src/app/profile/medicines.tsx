import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useMedicines, Medicine } from "@/context/MedicinesContext";

export default function MedicinesScreen() {
    const router = useRouter();
    const { medicines, updateMedicine, addMedicine, removeMedicine } = useMedicines();

    const [refillingId, setRefillingId] = useState<string | null>(null);

    // Modal state
    const [isModalVisible, setModalVisible] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDosage, setNewDosage] = useState("");
    const [newPurpose, setNewPurpose] = useState("");
    const [newSchedule, setNewSchedule] = useState("");
    const [newRelation, setNewRelation] = useState("");
    const [newRemaining, setNewRemaining] = useState("");
    const [newTotal, setNewTotal] = useState("");

    const handleRefillRequest = async (id: string) => {
        setRefillingId(id);
        const med = medicines.find((m) => m.id === id);
        setTimeout(async () => {
            if (med) {
                await updateMedicine(id, { refillStatus: "requested", remaining: med.total });
            }
            setRefillingId(null);
        }, 1500);
    };

    const handleAddMedicine = async () => {
        if (!newName || !newDosage || !newTotal) return;
        
        const newMed: Medicine = {
            id: Date.now().toString(),
            name: newName,
            dosage: newDosage,
            purpose: newPurpose || "General",
            schedule: newSchedule || "1 - 0 - 1",
            relation: newRelation || "After Meals",
            remaining: parseInt(newRemaining) || parseInt(newTotal),
            total: parseInt(newTotal),
            refillStatus: "none",
        };
        
        await addMedicine(newMed);
        
        // Reset and close modal
        setNewName("");
        setNewDosage("");
        setNewPurpose("");
        setNewSchedule("");
        setNewRelation("");
        setNewRemaining("");
        setNewTotal("");
        setModalVisible(false);
    };

    const handleDelete = async (id: string) => {
        await removeMedicine(id);
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

                {medicines.length === 0 ? (
                    <Text style={{ textAlign: "center", color: "#64748B", marginTop: 20 }}>No medicines added yet.</Text>
                ) : (
                    medicines.map((med) => {
                        const ratio = med.total > 0 ? med.remaining / med.total : 0;
                        const isLow = ratio <= 0.25;
                        const progressWidth = `${Math.min(100, Math.max(0, ratio * 100)).toFixed(0)}%`;

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
                                    <TouchableOpacity onPress={() => handleDelete(med.id)} style={{ padding: 4 }}>
                                        <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
                                    </TouchableOpacity>
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
                    })
                )}

                {/* Add new medication FAB */}
                <TouchableOpacity style={styles.addMedBtn} onPress={() => setModalVisible(true)}>
                    <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.addMedBtnText}>Add Custom Reminder</Text>
                </TouchableOpacity>
            </ScrollView>
            
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Custom Reminder</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Medicine Name *</Text>
                                <TextInput style={styles.input} placeholder="e.g. Paracetamol" value={newName} onChangeText={setNewName} />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Dosage *</Text>
                                <TextInput style={styles.input} placeholder="e.g. 500 mg" value={newDosage} onChangeText={setNewDosage} />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Purpose</Text>
                                <TextInput style={styles.input} placeholder="e.g. Fever" value={newPurpose} onChangeText={setNewPurpose} />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Schedule</Text>
                                <TextInput style={styles.input} placeholder="e.g. 1 - 0 - 1" value={newSchedule} onChangeText={setNewSchedule} />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Meal Relation</Text>
                                <TextInput style={styles.input} placeholder="e.g. After Meals" value={newRelation} onChangeText={setNewRelation} />
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                    <Text style={styles.inputLabel}>Remaining Pills</Text>
                                    <TextInput style={styles.input} placeholder="e.g. 10" keyboardType="numeric" value={newRemaining} onChangeText={setNewRemaining} />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={styles.inputLabel}>Total Pills *</Text>
                                    <TextInput style={styles.input} placeholder="e.g. 30" keyboardType="numeric" value={newTotal} onChangeText={setNewTotal} />
                                </View>
                            </View>
                            
                            <TouchableOpacity style={styles.saveBtn} onPress={handleAddMedicine}>
                                <Text style={styles.saveBtnText}>Save Reminder</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: "85%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0F172A",
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#475569",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: "#0F172A",
    },
    saveBtn: {
        backgroundColor: "#2563EB",
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 40,
    },
    saveBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 16,
    },
});
