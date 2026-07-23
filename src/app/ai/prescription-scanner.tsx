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
import { useTheme } from "@/utils/themeManager";

interface Medicine {
    name: string;
    dosage: string;
    schedule: string; // e.g. 1-0-1
    relation: string; // e.g. After Food
    purpose: string;
    days: number;
}

export default function PrescriptionScannerScreen() {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors, isDark);
    const router = useRouter();
    const [scanning, setScanning] = useState(false);
    const [scannedResult, setScannedResult] = useState<boolean>(false);
    const [remindersAdded, setRemindersAdded] = useState(false);

    const mockMedicines: Medicine[] = [
        {
            name: "Metformin HCl",
            dosage: "500 mg",
            schedule: "1 - 0 - 1",
            relation: "After Meals",
            purpose: "Type 2 Diabetes Control",
            days: 30
        },
        {
            name: "Atorvastatin",
            dosage: "10 mg",
            schedule: "0 - 0 - 1",
            relation: "Before Bed",
            purpose: "Lower LDL Cholesterol",
            days: 30
        },
        {
            name: "Amoxicillin Trihydrate",
            dosage: "500 mg",
            schedule: "1 - 1 - 1",
            relation: "After Meals",
            purpose: "Bacterial Infection Treatment",
            days: 7
        }
    ];

    const handleScanSim = () => {
        setScanning(true);
        setRemindersAdded(false);
        setTimeout(() => {
            setScanning(false);
            setScannedResult(true);
        }, 2200);
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Prescription Scanner</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Viewfinder Mockup */}
                <View style={styles.viewfinderCard}>
                    {scanning ? (
                        <View style={styles.scanningOverlay}>
                            <ActivityIndicator size="large" color="#10B981" />
                            <Text style={styles.scanningText}>AI is scanning text & parsing dosages...</Text>
                            <View style={styles.laserLine} />
                        </View>
                    ) : (
                        <View style={styles.viewfinderInner}>
                            <MaterialCommunityIcons name="camera-outline" size={44} color={colors.textSecondary} />
                            <Text style={styles.viewfinderTitle}>Capture Prescription Document</Text>
                            <Text style={styles.viewfinderDesc}>Align doctor's written note within the camera guidelines</Text>
                            
                            <TouchableOpacity style={styles.scanActionBtn} onPress={handleScanSim}>
                                <Text style={styles.scanActionBtnText}>Simulate Camera Scan</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Scanned Results */}
                {scannedResult && !scanning && (
                    <View style={styles.resultsContainer}>
                        <View style={styles.resultsHeader}>
                            <MaterialCommunityIcons name="clipboard-text-play-outline" size={22} color="#10B981" />
                            <Text style={styles.resultsTitle}>AI Extracted Medications</Text>
                        </View>

                        {mockMedicines.map((med, index) => (
                            <View key={index} style={styles.medCard}>
                                <View style={styles.medHeader}>
                                    <View>
                                        <Text style={styles.medName}>{med.name}</Text>
                                        <Text style={styles.medDosage}>{med.dosage} • {med.purpose}</Text>
                                    </View>
                                    <View style={styles.durationBadge}>
                                        <Text style={styles.durationBadgeText}>{med.days} Days</Text>
                                    </View>
                                </View>

                                <View style={styles.medDetailsGrid}>
                                    <View style={styles.detailItem}>
                                        <Text style={styles.detailLabel}>Frequency</Text>
                                        <Text style={styles.detailVal}>{med.schedule}</Text>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <Text style={styles.detailLabel}>Timing</Text>
                                        <Text style={styles.detailVal}>{med.relation}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}

                        {/* AI Drug Interactions Safety Alert */}
                        <View style={styles.safetyAlertCard}>
                            <View style={styles.alertHeader}>
                                <MaterialCommunityIcons name="alert-decagram" size={20} color="#B45309" />
                                <Text style={styles.alertTitle}>AI Drug Interactions Check</Text>
                            </View>
                            <View style={styles.alertBody}>
                                <Text style={styles.alertBullet}>
                                    • <Text style={{ fontWeight: "700" }}>Atorvastatin Warning</Text>: Avoid consuming Grapefruit Juice as it may raise cholesterol medication concentration to toxic levels.
                                </Text>
                                <Text style={styles.alertBullet}>
                                    • <Text style={{ fontWeight: "700" }}>Antibiotic completion</Text>: Amoxicillin must be finished for the full 7 days. Do not halt early, even if symptoms subside.
                                </Text>
                            </View>
                        </View>

                        {/* Add reminders action */}
                        <TouchableOpacity
                            style={[styles.reminderBtn, remindersAdded && styles.reminderBtnSuccess]}
                            onPress={() => setRemindersAdded(true)}
                            disabled={remindersAdded}
                        >
                            <MaterialCommunityIcons
                                name={remindersAdded ? "calendar-check" : "calendar-plus"}
                                size={20}
                                color="#FFFFFF"
                                style={{ marginRight: 8 }}
                            />
                            <Text style={styles.reminderBtnText}>
                                {remindersAdded ? "Schedules Synced to Calendar!" : "Add Reminders to Calendar"}
                            </Text>
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
    },
    viewfinderCard: {
        backgroundColor: "#0F172A",
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 24,
        height: 240,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
    },
    viewfinderInner: {
        alignItems: "center",
        paddingHorizontal: 24,
    },
    viewfinderTitle: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
        marginTop: 12,
    },
    viewfinderDesc: {
        color: "#94A3B8",
        fontSize: 11,
        textAlign: "center",
        marginTop: 6,
        lineHeight: 16,
    },
    scanActionBtn: {
        backgroundColor: "#10B981",
        borderRadius: 14,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 20,
    },
    scanActionBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 13,
    },
    scanningOverlay: {
        alignItems: "center",
    },
    scanningText: {
        color: "#10B981",
        fontSize: 13,
        fontWeight: "600",
        marginTop: 14,
    },
    laserLine: {
        position: "absolute",
        top: 20,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: "rgba(16, 185, 129, 0.5)",
    },
    resultsContainer: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    resultsHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.text,
        marginLeft: 8,
    },
    medCard: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    medHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        paddingBottom: 12,
        marginBottom: 12,
    },
    medName: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.text,
    },
    medDosage: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    durationBadge: {
        backgroundColor: "#E8F5E9",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    durationBadgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#10B981",
    },
    medDetailsGrid: {
        flexDirection: "row",
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 11,
        color: "#94A3B8",
        textTransform: "uppercase",
        fontWeight: "600",
    },
    detailVal: {
        fontSize: 13,
        fontWeight: "700",
        color: isDark ? colors.textSecondary : "#334155",
        marginTop: 2,
    },
    safetyAlertCard: {
        backgroundColor: isDark ? colors.card : "#FFFBEB",
        borderWidth: 1,
        borderColor: isDark ? colors.cardBorder : "#FDE68A",
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
    },
    alertHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    alertTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#B45309",
        marginLeft: 6,
    },
    alertBody: {
        paddingLeft: 4,
    },
    alertBullet: {
        fontSize: 12,
        color: "#78350F",
        lineHeight: 18,
        marginBottom: 8,
    },
    reminderBtn: {
        backgroundColor: "#2563EB",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 16,
    },
    reminderBtnSuccess: {
        backgroundColor: "#10B981",
    },
    reminderBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },
});
