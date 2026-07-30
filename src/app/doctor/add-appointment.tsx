import React, { useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Modal,
    Pressable,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@/utils/themeManager";
import { appointmentStore } from "@/utils/appointmentStore";

// ─── Inline scroll-picker (no external package needed) ───────────────────────

const ITEM_H = 44;

function WheelColumn({
    items,
    selected,
    onSelect,
    textColor,
    accentColor,
}: {
    items: string[];
    selected: string;
    onSelect: (v: string) => void;
    textColor: string;
    accentColor: string;
}) {
    const ref = useRef<ScrollView>(null);
    const idx  = items.indexOf(selected);

    React.useEffect(() => {
        if (idx >= 0) {
            ref.current?.scrollTo({ y: idx * ITEM_H, animated: false });
        }
    }, []);

    return (
        <ScrollView
            ref={ref}
            style={{ height: ITEM_H * 5 }}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_H}
            decelerationRate="fast"
            onMomentumScrollEnd={(e) => {
                const i = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
                if (i >= 0 && i < items.length) onSelect(items[i]);
            }}
        >
            {/* padding spacers so first/last items can center */}
            <View style={{ height: ITEM_H * 2 }} />
            {items.map((item) => (
                <TouchableOpacity
                    key={item}
                    style={[styles.wheelItem, item === selected && { backgroundColor: accentColor + "22" }]}
                    onPress={() => {
                        onSelect(item);
                        const i = items.indexOf(item);
                        ref.current?.scrollTo({ y: i * ITEM_H, animated: true });
                    }}
                >
                    <Text style={[
                        styles.wheelItemText,
                        { color: item === selected ? accentColor : textColor },
                        item === selected && { fontWeight: "800" },
                    ]}>
                        {item}
                    </Text>
                </TouchableOpacity>
            ))}
            <View style={{ height: ITEM_H * 2 }} />
        </ScrollView>
    );
}

// ─── Picker modal wrapper ────────────────────────────────────────────────────

function PickerModal({
    visible,
    title,
    onClose,
    children,
    isDark,
}: {
    visible: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    isDark: boolean;
}) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <Pressable
                    style={[styles.modalSheet, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}
                    onPress={() => {}}
                >
                    <View style={[styles.modalHandle, { backgroundColor: isDark ? "#475569" : "#CBD5E1" }]} />
                    <Text style={[styles.modalTitle, { color: isDark ? "#F1F5F9" : "#071739" }]}>{title}</Text>
                    {children}
                    <TouchableOpacity
                        style={[styles.modalDone, { backgroundColor: "#0D9488" }]}
                        onPress={onClose}
                    >
                        <Text style={styles.modalDoneText}>Done</Text>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

// ─── Date data ───────────────────────────────────────────────────────────────

const DAYS   = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const MONTHS = [
    "01 Jan","02 Feb","03 Mar","04 Apr","05 May","06 Jun",
    "07 Jul","08 Aug","09 Sep","10 Oct","11 Nov","12 Dec",
];
const currentYear = new Date().getFullYear();
const YEARS  = Array.from({ length: 5 }, (_, i) => String(currentYear + i));

// ─── Time data ───────────────────────────────────────────────────────────────

const HOURS   = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const AMPM    = ["AM", "PM"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildDateString(day: string, month: string, year: string): string {
    return `${year}-${month.slice(0, 2)}-${day}`;
}

function buildTimeString(hour: string, minute: string, ampm: string): string {
    return `${hour}:${minute} ${ampm}`;
}

export default function AddAppointmentScreen() {
    const { colors, isDark } = useTheme();
    const router = useRouter();

    const now      = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const [patientName, setPatientName] = useState("");
    const [phone, setPhone]             = useState("");
    const [date, setDate]               = useState(todayStr);
    const [time, setTime]               = useState("10:30 AM");
    const [type, setType]               = useState("New");
    const [status, setStatus]           = useState("Confirmed");
    const [notes, setNotes]             = useState("");
    const [isSaving, setIsSaving]       = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Date picker wheel state
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selDay,   setSelDay]   = useState(String(now.getDate()).padStart(2, "0"));
    const [selMonth, setSelMonth] = useState(MONTHS[now.getMonth()]);
    const [selYear,  setSelYear]  = useState(String(now.getFullYear()));

    // Time picker wheel state
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selHour,   setSelHour]   = useState("10");
    const [selMinute, setSelMinute] = useState("30");
    const [selAmPm,   setSelAmPm]   = useState("AM");

    const appointmentTypes = ["New", "Follow-up", "Emergency"];
    const statusOptions    = ["Confirmed", "Pending"];
    const quickTimeSlots   = ["09:00 AM", "10:30 AM", "11:45 AM", "02:00 PM", "04:30 PM", "06:00 PM"];

    const confirmDate = () => {
        setDate(buildDateString(selDay, selMonth, selYear));
        setShowDatePicker(false);
    };

    const confirmTime = () => {
        setTime(buildTimeString(selHour, selMinute, selAmPm));
        setShowTimePicker(false);
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

            {/* ── Date Picker Modal ── */}
            <PickerModal
                visible={showDatePicker}
                title="Select Date"
                onClose={confirmDate}
                isDark={isDark}
            >
                <View style={styles.wheelRow}>
                    <WheelColumn items={DAYS}   selected={selDay}   onSelect={setSelDay}   textColor={colors.text} accentColor="#0D9488" />
                    <WheelColumn items={MONTHS} selected={selMonth} onSelect={setSelMonth} textColor={colors.text} accentColor="#0D9488" />
                    <WheelColumn items={YEARS}  selected={selYear}  onSelect={setSelYear}  textColor={colors.text} accentColor="#0D9488" />
                </View>
            </PickerModal>

            {/* ── Time Picker Modal ── */}
            <PickerModal
                visible={showTimePicker}
                title="Select Time"
                onClose={confirmTime}
                isDark={isDark}
            >
                <View style={styles.wheelRow}>
                    <WheelColumn items={HOURS}   selected={selHour}   onSelect={setSelHour}   textColor={colors.text} accentColor="#0D9488" />
                    <WheelColumn items={MINUTES} selected={selMinute} onSelect={setSelMinute} textColor={colors.text} accentColor="#0D9488" />
                    <WheelColumn items={AMPM}    selected={selAmPm}   onSelect={setSelAmPm}   textColor={colors.text} accentColor="#0D9488" />
                </View>
            </PickerModal>
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

    // ── Custom wheel picker ───────────────────────────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end",
    },
    modalSheet: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 36,
    },
    modalHandle: {
        width: 44,
        height: 4,
        borderRadius: 2,
        alignSelf: "center",
        marginBottom: 14,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    wheelRow: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 20,
    },
    wheelItem: {
        height: ITEM_H,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 14,
        borderRadius: 10,
    },
    wheelItemText: {
        fontSize: 17,
        fontWeight: "600",
    },
    modalDone: {
        height: 52,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    modalDoneText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "800",
    },
});
