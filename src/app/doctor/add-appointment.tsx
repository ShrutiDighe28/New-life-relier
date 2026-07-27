import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "@/utils/themeManager";
import { appointmentStore } from "@/utils/appointmentStore";

export default function AddAppointmentScreen() {
    const { colors, isDark } = useTheme();
    const router = useRouter();

    const todayStr = new Date().toISOString().split("T")[0];

    const [patientName, setPatientName] = useState("");
    const [phone, setPhone] = useState("");
    const [date, setDate] = useState(todayStr);
    const [time, setTime] = useState("10:30 AM");
    const [type, setType] = useState("New");
    const [status, setStatus] = useState("Confirmed");
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [dateObj, setDateObj] = useState(new Date());
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const appointmentTypes = ["New", "Follow-up", "Emergency"];
    const statusOptions = ["Confirmed", "Pending"];
    const quickTimeSlots = ["09:00 AM", "10:30 AM", "11:45 AM", "02:00 PM", "04:30 PM", "06:00 PM"];

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === "ios");
        if (selectedDate) {
            setDateObj(selectedDate);
            const iso = selectedDate.toISOString().split("T")[0];
            setDate(iso);
        }
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(Platform.OS === "ios");
        if (selectedTime) {
            let hours = selectedTime.getHours();
            const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
            const ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12;
            hours = hours ? hours : 12;
            const hoursStr = hours.toString().padStart(2, "0");
            setTime(`${hoursStr}:${minutes} ${ampm}`);
        }
    };

    const executeSave = async () => {
        setIsSaving(true);
        try {
            await appointmentStore.addAppointment({
                patientName: patientName.trim(),
                phone: phone.trim(),
                date: date.trim(),
                time: time.trim(),
                type,
                status,
                notes: notes.trim(),
            });

            setToastMessage("Appointment added successfully.");

            setTimeout(() => {
                router.back();
            }, 1000);
        } catch (error) {
            Alert.alert("Error", "Could not save the appointment. Please try again.");
            setIsSaving(false);
        }
    };

    const handleSave = () => {
        if (!patientName.trim()) {
            Alert.alert("Validation Error", "Please enter the patient's name.");
            return;
        }
        if (!phone.trim()) {
            Alert.alert("Validation Error", "Please enter the patient's phone number.");
            return;
        }
        if (!date.trim()) {
            Alert.alert("Validation Error", "Please select or enter the appointment date.");
            return;
        }
        if (!time.trim()) {
            Alert.alert("Validation Error", "Please select or enter the appointment time.");
            return;
        }

        // Check for time slot conflict
        const conflict = appointmentStore.checkConflict(date.trim(), time.trim());
        if (conflict) {
            Alert.alert(
                "Time Slot Conflict",
                `An appointment for ${conflict.patient} (${conflict.type}) is already scheduled at ${time} on ${date}.\n\nWould you like to schedule anyway?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Save Anyway",
                        onPress: () => {
                            executeSave();
                        },
                    },
                ]
            );
            return;
        }

        executeSave();
    };

    return (
        <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.backBtn, { backgroundColor: isDark ? colors.card : "#F1F5F9" }]}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>New Appointment</Text>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                    <Text style={styles.cancelLinkText}>Cancel</Text>
                </TouchableOpacity>
            </View>

            {/* Toast Overlay */}
            {toastMessage && (
                <View style={styles.toastContainer}>
                    <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.toastText}>{toastMessage}</Text>
                </View>
            )}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Patient Name */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                        Patient Name <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: isDark ? colors.card : "#F8FAFC",
                                color: colors.text,
                                borderColor: colors.cardBorder,
                            },
                        ]}
                        placeholder="Enter full name (e.g. Ananya Roy)"
                        placeholderTextColor="#94A3B8"
                        value={patientName}
                        onChangeText={setPatientName}
                    />
                </View>

                {/* Phone Number */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                        Phone Number <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: isDark ? colors.card : "#F8FAFC",
                                color: colors.text,
                                borderColor: colors.cardBorder,
                            },
                        ]}
                        placeholder="Enter phone number (+91 98765 43210)"
                        placeholderTextColor="#94A3B8"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                    />
                </View>

                {/* Date & Time Row */}
                <View style={styles.row}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Date <Text style={styles.requiredStar}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.pickerInput,
                                {
                                    backgroundColor: isDark ? colors.card : "#F8FAFC",
                                    borderColor: colors.cardBorder,
                                },
                            ]}
                            onPress={() => setShowDatePicker(true)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.pickerValueText, { color: colors.text }]}>{date}</Text>
                            <MaterialCommunityIcons name="calendar-month" size={20} color="#0D9488" />
                        </TouchableOpacity>
                    </View>

                    <View style={{ width: 14 }} />

                    <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Time <Text style={styles.requiredStar}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.pickerInput,
                                {
                                    backgroundColor: isDark ? colors.card : "#F8FAFC",
                                    borderColor: colors.cardBorder,
                                },
                            ]}
                            onPress={() => setShowTimePicker(true)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.pickerValueText, { color: colors.text }]}>{time}</Text>
                            <MaterialCommunityIcons name="clock-outline" size={20} color="#0D9488" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Time Slots */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Quick Time Slots</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slotsScroll}>
                        {quickTimeSlots.map((slot) => (
                            <TouchableOpacity
                                key={slot}
                                style={[
                                    styles.slotChip,
                                    { backgroundColor: isDark ? colors.card : "#F1F5F9", borderColor: colors.cardBorder },
                                    time === slot && styles.slotChipSelected,
                                ]}
                                onPress={() => setTime(slot)}
                            >
                                <Text style={[styles.slotText, { color: colors.textSecondary }, time === slot && styles.slotTextSelected]}>
                                    {slot}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Appointment Type */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Appointment Type</Text>
                    <View style={styles.chipsContainer}>
                        {appointmentTypes.map((t) => {
                            const isSelected = type === t;
                            return (
                                <TouchableOpacity
                                    key={t}
                                    style={[
                                        styles.typeChip,
                                        { backgroundColor: isDark ? colors.card : "#F1F5F9", borderColor: colors.cardBorder },
                                        isSelected && { backgroundColor: "#0D9488", borderColor: "#0D9488" },
                                    ]}
                                    onPress={() => setType(t)}
                                >
                                    <Text style={[styles.chipText, { color: colors.textSecondary }, isSelected && { color: "#FFFFFF" }]}>
                                        {t}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Status Options */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Status</Text>
                    <View style={styles.chipsContainer}>
                        {statusOptions.map((s) => {
                            const isSelected = status === s;
                            return (
                                <TouchableOpacity
                                    key={s}
                                    style={[
                                        styles.typeChip,
                                        { backgroundColor: isDark ? colors.card : "#F1F5F9", borderColor: colors.cardBorder },
                                        isSelected && { backgroundColor: "#10B981", borderColor: "#10B981" },
                                    ]}
                                    onPress={() => setStatus(s)}
                                >
                                    <Text style={[styles.chipText, { color: colors.textSecondary }, isSelected && { color: "#FFFFFF" }]}>
                                        {s}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Notes (Optional) */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Notes (Optional)</Text>
                    <TextInput
                        style={[
                            styles.input,
                            styles.textArea,
                            {
                                backgroundColor: isDark ? colors.card : "#F8FAFC",
                                color: colors.text,
                                borderColor: colors.cardBorder,
                            },
                        ]}
                        placeholder="Add medical history, symptom notes, or instructions"
                        placeholderTextColor="#94A3B8"
                        multiline
                        numberOfLines={3}
                        value={notes}
                        onChangeText={setNotes}
                    />
                </View>

                {/* Action Buttons */}
                <View style={styles.btnRow}>
                    <TouchableOpacity
                        style={[styles.cancelBtn, { borderColor: colors.cardBorder }]}
                        activeOpacity={0.7}
                        onPress={() => router.back()}
                    >
                        <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: "#0D9488" }, isSaving && { opacity: 0.7 }]}
                        activeOpacity={0.85}
                        disabled={isSaving}
                        onPress={handleSave}
                    >
                        <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
                        <Text style={styles.saveBtnText}>{isSaving ? "Saving..." : "Save Appointment"}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Native Pickers */}
            {showDatePicker && (
                <DateTimePicker
                    value={dateObj}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}

            {showTimePicker && (
                <DateTimePicker
                    value={new Date()}
                    mode="time"
                    is24Hour={false}
                    display="default"
                    onChange={handleTimeChange}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(148, 163, 184, 0.15)",
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "800",
    },
    cancelLinkText: {
        color: "#EF4444",
        fontSize: 14,
        fontWeight: "600",
    },
    toastContainer: {
        position: "absolute",
        top: 70,
        left: 20,
        right: 20,
        backgroundColor: "#10B981",
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 999,
    },
    toastText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "700",
        marginBottom: 8,
        marginLeft: 2,
    },
    requiredStar: {
        color: "#EF4444",
    },
    input: {
        height: 52,
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        fontSize: 15,
        fontWeight: "500",
    },
    pickerInput: {
        height: 52,
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    pickerValueText: {
        fontSize: 15,
        fontWeight: "600",
    },
    textArea: {
        height: 90,
        paddingTop: 12,
        textAlignVertical: "top",
    },
    row: {
        flexDirection: "row",
    },
    slotsScroll: {
        gap: 8,
    },
    slotChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
    },
    slotChipSelected: {
        backgroundColor: "#0D9488",
        borderColor: "#0D9488",
    },
    slotText: {
        fontSize: 13,
        fontWeight: "600",
    },
    slotTextSelected: {
        color: "#FFFFFF",
    },
    chipsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    typeChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    chipText: {
        fontSize: 13,
        fontWeight: "700",
    },
    btnRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 16,
    },
    cancelBtn: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        borderWidth: 1.5,
        justifyContent: "center",
        alignItems: "center",
    },
    cancelBtnText: {
        fontSize: 15,
        fontWeight: "700",
    },
    saveBtn: {
        flex: 2,
        height: 52,
        borderRadius: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    saveBtnText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },
});
