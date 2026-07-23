import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@/utils/themeManager";

const UPCOMING_CALLS = [
    { id: "1", patient: "Aarav Sharma", time: "10:30 AM", type: "Video Call", status: "Ready to Join", initials: "AS" },
    { id: "2", patient: "Priya Patel", time: "11:45 AM", type: "Audio Call", status: "Scheduled", initials: "PP" },
    { id: "3", patient: "Rajesh Verma", time: "02:15 PM", type: "Video Call", status: "Scheduled", initials: "RV" },
];

export default function DoctorConsultScreen() {
    const { colors, isDark } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, { color: colors.text }]}>Virtual Clinic</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Live Teleconsultations</Text>
                    </View>
                    <View style={styles.statusBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.statusText}>Online</Text>
                    </View>
                </View>

                {/* Main Active Lobby Banner */}
                <LinearGradient
                    colors={["#0D9488", "#0A7870"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.lobbyCard}
                >
                    <View style={styles.lobbyHeader}>
                        <MaterialCommunityIcons name="video" size={24} color="#FFFFFF" />
                        <Text style={styles.lobbyHeaderTitle}>Active Waiting Room</Text>
                    </View>

                    <View style={styles.patientRow}>
                        <View style={styles.patientAvatar}>
                            <Text style={styles.avatarText}>AS</Text>
                        </View>
                        <View style={styles.patientDetails}>
                            <Text style={styles.patientName}>Aarav Sharma</Text>
                            <Text style={styles.patientReason}>Hypertension Follow-up • 10:30 AM</Text>
                        </View>
                    </View>

                    <View style={styles.vitalsRow}>
                        <View style={styles.vitalBox}>
                            <Text style={styles.vitalLabel}>BP</Text>
                            <Text style={styles.vitalVal}>120/80</Text>
                        </View>
                        <View style={styles.vitalBox}>
                            <Text style={styles.vitalLabel}>Heart Rate</Text>
                            <Text style={styles.vitalVal}>72 bpm</Text>
                        </View>
                        <View style={styles.vitalBox}>
                            <Text style={styles.vitalLabel}>Temp</Text>
                            <Text style={styles.vitalVal}>98.6 °F</Text>
                        </View>
                    </View>

                    <TouchableOpacity activeOpacity={0.9} style={styles.joinCallBtn}>
                        <MaterialCommunityIcons name="video" size={20} color="#0D9488" />
                        <Text style={styles.joinCallText}>Join Consultation Room</Text>
                    </TouchableOpacity>
                </LinearGradient>

                {/* Consultation Tools */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Consultation Tools</Text>
                <View style={styles.toolsRow}>
                    <TouchableOpacity style={[styles.toolCard, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}>
                        <View style={[styles.toolIconBg, { backgroundColor: "#F0FDFA" }]}>
                            <MaterialCommunityIcons name="file-document-edit-outline" size={24} color="#0D9488" />
                        </View>
                        <Text style={[styles.toolTitle, { color: colors.text }]}>E-Prescription</Text>
                        <Text style={[styles.toolSub, { color: colors.textSecondary }]}>Write & send digital Rx</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.toolCard, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}>
                        <View style={[styles.toolIconBg, { backgroundColor: "#EFF6FF" }]}>
                            <MaterialCommunityIcons name="notebook-outline" size={24} color="#2563EB" />
                        </View>
                        <Text style={[styles.toolTitle, { color: colors.text }]}>Clinical Notes</Text>
                        <Text style={[styles.toolSub, { color: colors.textSecondary }]}>Add patient SOAP notes</Text>
                    </TouchableOpacity>
                </View>

                {/* Upcoming Consultations */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Consultations</Text>
                <View style={styles.callsList}>
                    {UPCOMING_CALLS.map((call) => (
                        <View
                            key={call.id}
                            style={[styles.callCard, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}
                        >
                            <View style={styles.callAvatar}>
                                <Text style={styles.callAvatarText}>{call.initials}</Text>
                            </View>
                            <View style={styles.callInfo}>
                                <Text style={[styles.callPatient, { color: colors.text }]}>{call.patient}</Text>
                                <Text style={[styles.callMeta, { color: colors.textSecondary }]}>{call.time} • {call.type}</Text>
                            </View>
                            <TouchableOpacity style={styles.actionBtn}>
                                <MaterialCommunityIcons name="video-outline" size={20} color="#0D9488" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 40,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
    },
    subtitle: {
        fontSize: 14,
        fontWeight: "500",
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0FDF4",
        borderWidth: 1,
        borderColor: "#DCFCE7",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#16A34A",
    },
    statusText: {
        color: "#166534",
        fontSize: 12,
        fontWeight: "700",
    },
    lobbyCard: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    lobbyHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },
    lobbyHeaderTitle: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "800",
    },
    patientRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        marginBottom: 16,
    },
    patientAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#0D9488",
        fontSize: 16,
        fontWeight: "800",
    },
    patientDetails: {
        flex: 1,
    },
    patientName: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "800",
    },
    patientReason: {
        color: "#E6FFFA",
        fontSize: 13,
        marginTop: 2,
    },
    vitalsRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 20,
    },
    vitalBox: {
        flex: 1,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 12,
        padding: 10,
        alignItems: "center",
    },
    vitalLabel: {
        color: "#CCFBF1",
        fontSize: 11,
        fontWeight: "600",
    },
    vitalVal: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "800",
        marginTop: 2,
    },
    joinCallBtn: {
        backgroundColor: "#FFFFFF",
        height: 48,
        borderRadius: 24,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    joinCallText: {
        color: "#0D9488",
        fontSize: 15,
        fontWeight: "700",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 14,
    },
    toolsRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    toolCard: {
        flex: 1,
        borderRadius: 20,
        borderWidth: 1.5,
        padding: 16,
    },
    toolIconBg: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    toolTitle: {
        fontSize: 15,
        fontWeight: "700",
    },
    toolSub: {
        fontSize: 12,
        marginTop: 2,
    },
    callsList: {
        gap: 10,
    },
    callCard: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 18,
        borderWidth: 1.5,
        padding: 14,
        gap: 12,
    },
    callAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "#F0FDFA",
        justifyContent: "center",
        alignItems: "center",
    },
    callAvatarText: {
        color: "#0D9488",
        fontSize: 15,
        fontWeight: "800",
    },
    callInfo: {
        flex: 1,
    },
    callPatient: {
        fontSize: 15,
        fontWeight: "700",
    },
    callMeta: {
        fontSize: 13,
        marginTop: 2,
    },
    actionBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F0FDFA",
        justifyContent: "center",
        alignItems: "center",
    },
});
