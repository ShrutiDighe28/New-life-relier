import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    TextInput,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useAppointments } from "@/context/AppointmentsContext";
import { useNotifications } from "@/context/NotificationsContext";
import { useTheme } from "@/utils/themeManager";

export default function AppointmentDetailsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { appointments, cancelAppointment } = useAppointments();
    const { addNotification } = useNotifications();
    const { colors, isDark } = useTheme();

    const appDetails = appointments.find(a => a.id === id);

    const [notes, setNotes] = useState("");
    const [fileUploaded, setFileUploaded] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showCancelAlert, setShowCancelAlert] = useState(false);
    const [isCancelled, setIsCancelled] = useState(false);

    const handleUploadSim = () => {
        setUploading(true);
        setTimeout(() => {
            setUploading(false);
            setFileUploaded(true);
        }, 1500);
    };

    const handleCancelSim = async () => {
        if (id) {
            await cancelAppointment(id as string);
            if (appDetails) {
                addNotification({
                    title: "Appointment Cancelled",
                    message: `Your appointment with ${appDetails.doctorName} on ${appDetails.date} has been cancelled.`,
                    category: "Appointments",
                    route: "/(tabs)/appointments"
                });
            }
        }
        setIsCancelled(true);
        setShowCancelAlert(false);
    };

    if (!appDetails && !isCancelled) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
                <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
                    <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Appointment Details</Text>
                    <View style={{ width: 38 }} />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: colors.text }}>Appointment not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Appointment Details</Text>
                <View style={{ width: 38 }} />
            </View>

            {!isCancelled && appDetails ? (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Doctor Card */}
                    <View style={[styles.doctorCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <Image
                            source={appDetails.avatar || require("@/assets/images/dashboard/doctor.png")}
                            style={styles.doctorAvatar}
                        />
                        <View style={styles.doctorMeta}>
                            <Text style={[styles.doctorName, { color: colors.text }]}>
                                {appDetails.doctorName}{' '}
                                <MaterialCommunityIcons name={"check-decagram" as any} size={14} color="#2563EB" />
                            </Text>
                            <Text style={[styles.specialtyText, { color: appDetails.specialtyColor || "#2563EB" }]}>{appDetails.specialty}</Text>
                            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>4.9 ★ (124 reviews)</Text>
                        </View>
                    </View>

                    {/* Date/Time Banner */}
                    <View style={[styles.dateTimeCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <View style={styles.dateTimeCol}>
                            <MaterialCommunityIcons name="calendar" size={18} color="#2563EB" />
                            <Text style={[styles.dateTimeLabel, { color: colors.textSecondary }]}>DATE</Text>
                            <Text style={[styles.dateTimeVal, { color: colors.text }]}>{appDetails.date.split(" • ")[0]}</Text>
                        </View>
                        <View style={[styles.dividerCol, { backgroundColor: colors.cardBorder }]} />
                        <View style={styles.dateTimeCol}>
                            <MaterialCommunityIcons name="clock-outline" size={18} color="#2563EB" />
                            <Text style={[styles.dateTimeLabel, { color: colors.textSecondary }]}>TIME</Text>
                            <Text style={[styles.dateTimeVal, { color: colors.text }]}>{appDetails.date.split(" • ")[1]}</Text>
                        </View>
                    </View>

                    {/* Visit Checklist */}
                    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preparation Checklist</Text>
                        <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>AI suggested tasks to complete before your visit</Text>

                        {/* Task 1: Upload scans */}
                        <View style={[styles.checklistRow, { borderTopColor: colors.divider }]}>
                            <TouchableOpacity
                                style={styles.checkbox}
                                onPress={handleUploadSim}
                            >
                                <MaterialCommunityIcons
                                    name={fileUploaded ? "checkbox-marked" : "checkbox-blank-outline"}
                                    size={22}
                                    color={fileUploaded ? "#2563EB" : colors.textSecondary}
                                />
                            </TouchableOpacity>
                            <View style={styles.checklistMeta}>
                                <Text style={[styles.checklistTitle, { color: colors.text }]}>Upload prior Pathology report scans</Text>
                                <Text style={[styles.checklistDesc, { color: colors.textSecondary }]}>Helps doctor analyze blood levels baseline.</Text>
                                
                                {uploading ? (
                                    <ActivityIndicator size="small" color="#2563EB" style={{ alignSelf: "flex-start", marginTop: 4 }} />
                                ) : fileUploaded ? (
                                    <Text style={styles.uploadSuccessText}>✓ CBC_Report_2026.pdf Uploaded</Text>
                                ) : (
                                    <TouchableOpacity style={[styles.uploadBtn, isDark && { backgroundColor: '#1E3A8A', borderColor: '#2563EB' }]} onPress={handleUploadSim}>
                                        <Text style={[styles.uploadBtnText, isDark && { color: '#BFDBFE' }]}>Upload PDF</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Task 2: Symptom Notes */}
                        <View style={[styles.checklistRow, { borderTopColor: colors.divider }]}>
                            <View style={styles.checkbox}>
                                <MaterialCommunityIcons
                                    name={notes.trim() ? "checkbox-marked" : "checkbox-blank-outline"}
                                    size={22}
                                    color={notes.trim() ? "#2563EB" : colors.textSecondary}
                                />
                            </View>
                            <View style={styles.checklistMeta}>
                                <Text style={[styles.checklistTitle, { color: colors.text }]}>State active symptoms or queries</Text>
                                <Text style={[styles.checklistDesc, { color: colors.textSecondary }]}>Write down issues you wish to discuss.</Text>
                                <TextInput
                                    style={[styles.notesInput, { 
                                        backgroundColor: colors.backgroundSecondary, 
                                        borderColor: colors.cardBorder,
                                        color: colors.text
                                    }]}
                                    placeholder="Add notes for your doctor..."
                                    placeholderTextColor={colors.textSecondary}
                                    value={notes}
                                    onChangeText={setNotes}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Directions / Clinic Map */}
                    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Location & Directions</Text>
                        
                        <View style={styles.clinicLocationRow}>
                            <MaterialCommunityIcons name="office-building" size={20} color={colors.textSecondary} />
                            <View style={{ marginLeft: 10, flex: 1 }}>
                                <Text style={[styles.clinicNameText, { color: colors.text }]}>{appDetails.clinic.split(",")[0]}</Text>
                                <Text style={[styles.clinicAddressText, { color: colors.textSecondary }]}>{appDetails.clinic}</Text>
                            </View>
                        </View>

                        {/* Map placeholder */}
                        <View style={[styles.mapMock, { backgroundColor: colors.backgroundSecondary }]}>
                            <View style={[styles.mapGridLines, { backgroundColor: colors.cardBorder }]} />
                            <MaterialCommunityIcons name="map-marker-radius" size={32} color="#EF4444" style={{ zIndex: 1 }} />
                            <TouchableOpacity style={[styles.navigateBtn, { zIndex: 2 }]}>
                                <Text style={styles.navigateBtnText}>Open in Google Maps</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Cancel button */}
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCancelAlert(true)}>
                        <Text style={styles.cancelBtnText}>Cancel Scheduled Appointment</Text>
                    </TouchableOpacity>
                </ScrollView>
            ) : (
                /* Cancel Confirmation Screen */
                <View style={[styles.cancelConfirmContainer, { backgroundColor: colors.background }]}>
                    <View style={styles.cancelIconCircle}>
                        <MaterialCommunityIcons name="close-circle-outline" size={68} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.cancelConfirmTitle, { color: colors.text }]}>Appointment Cancelled</Text>
                    <Text style={[styles.cancelConfirmSub, { color: colors.textSecondary }]}>
                        The scheduling slots have been released. No fee was charged.
                    </Text>
                    <TouchableOpacity style={styles.dismissBtn} onPress={() => router.replace("/(tabs)/appointments")}>
                        <Text style={styles.dismissBtnText}>Return to Appointments</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Custom cancel alert overlay modal */}
            {showCancelAlert && appDetails && (
                <View style={styles.overlayModal}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Cancel Appointment?</Text>
                        <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
                            Are you sure you want to cancel this visit with {appDetails.doctorName}? There is no penalty fee.
                        </Text>
                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={[styles.modalBtnCancel, { borderColor: colors.cardBorder }]} onPress={() => setShowCancelAlert(false)}>
                                <Text style={[styles.modalBtnCancelText, { color: colors.textSecondary }]}>No, Keep</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalBtnConfirm} onPress={handleCancelSim}>
                                <Text style={styles.modalBtnConfirmText}>Yes, Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
    doctorCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 16,
        marginTop: 20,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
    },
    doctorAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 14,
    },
    doctorMeta: {
        flex: 1,
    },
    verifiedRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    doctorName: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0F172A",
    },
    specialtyText: {
        fontSize: 12,
        color: "#2563EB",
        fontWeight: "600",
        marginTop: 2,
    },
    ratingText: {
        fontSize: 11,
        color: "#64748B",
        marginTop: 4,
    },
    dateTimeCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 16,
        marginTop: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
    },
    dateTimeCol: {
        flex: 1,
        alignItems: "center",
    },
    dateTimeLabel: {
        fontSize: 9,
        fontWeight: "700",
        color: "#94A3B8",
        marginTop: 4,
        letterSpacing: 0.5,
    },
    dateTimeVal: {
        fontSize: 13,
        fontWeight: "700",
        color: "#334155",
        marginTop: 2,
    },
    dividerCol: {
        width: 1.5,
        backgroundColor: "#E2E8F0",
        height: "80%",
        alignSelf: "center",
    },
    sectionCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 18,
        marginTop: 16,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
    },
    sectionSub: {
        fontSize: 11,
        color: "#64748B",
        marginTop: 2,
    },
    checklistRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        paddingTop: 14,
    },
    checkbox: {
        marginRight: 10,
        marginTop: 2,
    },
    checklistMeta: {
        flex: 1,
    },
    checklistTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#334155",
    },
    checklistDesc: {
        fontSize: 11,
        color: "#64748B",
        marginTop: 2,
        lineHeight: 15,
    },
    uploadBtn: {
        alignSelf: "flex-start",
        backgroundColor: "#EFF6FF",
        borderWidth: 1,
        borderColor: "#BFDBFE",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginTop: 8,
    },
    uploadBtnText: {
        color: "#2563EB",
        fontSize: 11,
        fontWeight: "700",
    },
    uploadSuccessText: {
        fontSize: 11,
        color: "#10B981",
        fontWeight: "700",
        marginTop: 6,
    },
    notesInput: {
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 12,
        color: "#334155",
        backgroundColor: "#F8FAFC",
        marginTop: 8,
        minHeight: 50,
        textAlignVertical: "top",
    },
    clinicLocationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 14,
        marginBottom: 14,
    },
    clinicNameText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#334155",
    },
    clinicAddressText: {
        fontSize: 11,
        color: "#64748B",
        marginTop: 1,
    },
    mapMock: {
        backgroundColor: "#F1F5F9",
        borderRadius: 16,
        height: 120,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
    },
    mapGridLines: {
        ...StyleSheet.absoluteFill,
        backgroundColor: "#E2E8F0",
        justifyContent: "center",
        alignItems: "center",
    },
    navigateBtn: {
        position: "absolute",
        bottom: 10,
        backgroundColor: "#2563EB",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    navigateBtnText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "700",
    },
    cancelBtn: {
        borderWidth: 1.5,
        borderColor: "#EF4444",
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 24,
    },
    cancelBtnText: {
        color: "#EF4444",
        fontWeight: "700",
        fontSize: 13,
    },
    cancelConfirmContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
        backgroundColor: "#FFFFFF",
    },
    cancelIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#EF4444",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#EF4444",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
        marginBottom: 20,
    },
    cancelConfirmTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#0F172A",
    },
    cancelConfirmSub: {
        fontSize: 13,
        color: "#64748B",
        textAlign: "center",
        marginTop: 8,
        lineHeight: 18,
        marginBottom: 30,
    },
    dismissBtn: {
        backgroundColor: "#2563EB",
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 24,
        width: "100%",
        alignItems: "center",
    },
    dismissBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },
    overlayModal: {
        ...StyleSheet.absoluteFill,
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99,
    },
    modalContent: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 20,
        width: "80%",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 10,
    },
    modalDesc: {
        fontSize: 12,
        color: "#64748B",
        textAlign: "center",
        lineHeight: 18,
        marginBottom: 20,
    },
    modalBtns: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
    },
    modalBtnCancel: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: "center",
        marginRight: 6,
    },
    modalBtnCancelText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#475569",
    },
    modalBtnConfirm: {
        flex: 1,
        backgroundColor: "#EF4444",
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: "center",
        marginLeft: 6,
    },
    modalBtnConfirmText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#FFFFFF",
    },
});
