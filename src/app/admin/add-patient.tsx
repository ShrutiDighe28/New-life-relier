import LogoBrand from "@/components/LogoBrand";
import { adminPatientStore } from "@/utils/adminPatientStore";
import { useTheme } from "@/utils/themeManager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BLUE = "#2563EB";

const GENDERS = ["Male", "Female", "Other"] as const;
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const WARDS = ["OPD", "ICU", "Ward B", "Ortho", "Urology", "Emergency", "Pediatrics", "Cardiology"];
const DOCTORS = [
    "Dr. Sarah Jenkins",
    "Dr. Vikram Singh",
    "Dr. Rohit Sharma",
    "Dr. Meera Nair",
    "Dr. Arjun Mehta",
    "Dr. Priya Kapoor",
];

interface FormErrors {
    name?: string;
    age?: string;
    gender?: string;
    phone?: string;
    bloodGroup?: string;
    address?: string;
    ward?: string;
    doctor?: string;
    condition?: string;
    emergencyContact?: string;
}

export default function AdminAddPatientScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();

    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
    const [phone, setPhone] = useState("");
    const [bloodGroup, setBloodGroup] = useState("O+");
    const [address, setAddress] = useState("");
    const [ward, setWard] = useState("OPD");
    const [assignedDoctor, setAssignedDoctor] = useState(DOCTORS[0]);
    const [condition, setCondition] = useState("");
    const [emergencyContact, setEmergencyContact] = useState("");
    const [notes, setNotes] = useState("");

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSaving, setIsSaving] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!name.trim()) {
            newErrors.name = "Patient full name is required.";
        } else if (name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters.";
        }

        const parsedAge = parseInt(age.trim(), 10);
        if (!age.trim()) {
            newErrors.age = "Age is required.";
        } else if (isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 120) {
            newErrors.age = "Enter a valid age between 1 and 120.";
        }

        if (!phone.trim()) {
            newErrors.phone = "Mobile number is required.";
        } else if (!/^\+?[\d\s-]{10,15}$/.test(phone.trim())) {
            newErrors.phone = "Enter a valid phone number (at least 10 digits).";
        }

        if (!address.trim()) {
            newErrors.address = "Patient address is required.";
        }

        if (!condition.trim()) {
            newErrors.condition = "Medical condition or diagnosis is required.";
        }

        if (!emergencyContact.trim()) {
            newErrors.emergencyContact = "Emergency contact number is required.";
        } else if (!/^\+?[\d\s-]{10,15}$/.test(emergencyContact.trim())) {
            newErrors.emergencyContact = "Enter a valid emergency contact number.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            Alert.alert("Validation Error", "Please resolve all highlighted fields before saving.");
            return;
        }

        setIsSaving(true);
        try {
            const newPatient = await adminPatientStore.addPatient({
                name,
                age: parseInt(age.trim(), 10),
                gender,
                phone,
                bloodGroup,
                address,
                ward,
                assignedDoctor,
                condition,
                emergencyContact,
                notes,
            });

            Alert.alert(
                "Patient Registered",
                `Patient ${newPatient.name} (${newPatient.patientId}) has been successfully added to the registry.`,
                [
                    {
                        text: "OK",
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (e: any) {
            Alert.alert("Error", e?.message || "Failed to register patient. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const C = {
        cardBg: isDark ? colors.card : "#FFFFFF",
        borderColor: isDark ? colors.cardBorder : "#E2E8F0",
        inputBg: isDark ? "#0F172A" : "#F8FAFC",
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <SafeAreaView style={[s.root, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
                {/* ── HEADER ── */}
                <View style={s.header}>
                    <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
                        <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[s.headerTitle, { color: colors.text }]}>Add New Patient</Text>
                        <Text style={[s.headerSub, { color: colors.textSecondary }]}>Administrator Registration</Text>
                    </View>
                    <LogoBrand size={20} fontSize={14} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={s.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── HERO BANNER ── */}
                    <LinearGradient
                        colors={["#1E3A8A", "#2563EB"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={s.heroCard}
                    >
                        <View style={s.heroIcon}>
                            <MaterialCommunityIcons name="account-plus-outline" size={28} color="#FFFFFF" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.heroTitle}>Patient Intake Form</Text>
                            <Text style={s.heroSubTxt}>
                                Fill in demographics, contact details, and department assignment.
                            </Text>
                        </View>
                    </LinearGradient>

                    {/* ── 1. DEMOGRAPHICS SECTION ── */}
                    <View style={[s.sectionCard, { backgroundColor: C.cardBg, borderColor: C.borderColor }]}>
                        <View style={s.sectionHeader}>
                            <MaterialCommunityIcons name="account-details-outline" size={18} color={BLUE} />
                            <Text style={[s.sectionTitle, { color: colors.text }]}>Patient Demographics</Text>
                        </View>

                        {/* Name Input */}
                        <View style={s.inputGroup}>
                            <Text style={[s.label, { color: colors.text }]}>
                                Patient Name <Text style={s.reqStar}>*</Text>
                            </Text>
                            <View style={[s.inputWrap, { backgroundColor: C.inputBg, borderColor: errors.name ? "#EF4444" : C.borderColor }]}>
                                <MaterialCommunityIcons name="account-outline" size={18} color="#94A3B8" />
                                <TextInput
                                    style={[s.input, { color: colors.text }]}
                                    placeholder="e.g. Aarav Sharma"
                                    placeholderTextColor="#94A3B8"
                                    value={name}
                                    onChangeText={(txt) => {
                                        setName(txt);
                                        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                                    }}
                                />
                            </View>
                            {errors.name ? <Text style={s.errorTxt}>{errors.name}</Text> : null}
                        </View>

                        {/* Age & Gender Row */}
                        <View style={s.row}>
                            {/* Age */}
                            <View style={[s.inputGroup, { flex: 0.45 }]}>
                                <Text style={[s.label, { color: colors.text }]}>
                                    Age <Text style={s.reqStar}>*</Text>
                                </Text>
                                <View style={[s.inputWrap, { backgroundColor: C.inputBg, borderColor: errors.age ? "#EF4444" : C.borderColor }]}>
                                    <MaterialCommunityIcons name="cake-variant-outline" size={18} color="#94A3B8" />
                                    <TextInput
                                        style={[s.input, { color: colors.text }]}
                                        placeholder="e.g. 34"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="numeric"
                                        maxLength={3}
                                        value={age}
                                        onChangeText={(txt) => {
                                            setAge(txt);
                                            if (errors.age) setErrors((prev) => ({ ...prev, age: undefined }));
                                        }}
                                    />
                                </View>
                                {errors.age ? <Text style={s.errorTxt}>{errors.age}</Text> : null}
                            </View>

                            {/* Gender */}
                            <View style={[s.inputGroup, { flex: 0.52 }]}>
                                <Text style={[s.label, { color: colors.text }]}>
                                    Gender <Text style={s.reqStar}>*</Text>
                                </Text>
                                <View style={s.genderGroup}>
                                    {GENDERS.map((g) => {
                                        const selected = gender === g;
                                        return (
                                            <TouchableOpacity
                                                key={g}
                                                style={[
                                                    s.genderBtn,
                                                    { backgroundColor: selected ? BLUE : C.inputBg, borderColor: selected ? BLUE : C.borderColor },
                                                ]}
                                                onPress={() => setGender(g)}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={[s.genderTxt, { color: selected ? "#FFFFFF" : colors.textSecondary }]}>
                                                    {g}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>

                        {/* Phone Number */}
                        <View style={s.inputGroup}>
                            <Text style={[s.label, { color: colors.text }]}>
                                Mobile Number <Text style={s.reqStar}>*</Text>
                            </Text>
                            <View style={[s.inputWrap, { backgroundColor: C.inputBg, borderColor: errors.phone ? "#EF4444" : C.borderColor }]}>
                                <MaterialCommunityIcons name="phone-outline" size={18} color="#94A3B8" />
                                <TextInput
                                    style={[s.input, { color: colors.text }]}
                                    placeholder="+91 98765 43210"
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="phone-pad"
                                    value={phone}
                                    onChangeText={(txt) => {
                                        setPhone(txt);
                                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                                    }}
                                />
                            </View>
                            {errors.phone ? <Text style={s.errorTxt}>{errors.phone}</Text> : null}
                        </View>

                        {/* Blood Group */}
                        <View style={s.inputGroup}>
                            <Text style={[s.label, { color: colors.text }]}>
                                Blood Group <Text style={s.reqStar}>*</Text>
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.bgScroll}>
                                {BLOOD_GROUPS.map((bg) => {
                                    const selected = bloodGroup === bg;
                                    return (
                                        <TouchableOpacity
                                            key={bg}
                                            style={[
                                                s.bgPill,
                                                { backgroundColor: selected ? "#DC2626" : C.inputBg, borderColor: selected ? "#DC2626" : C.borderColor },
                                            ]}
                                            onPress={() => setBloodGroup(bg)}
                                            activeOpacity={0.8}
                                        >
                                            <MaterialCommunityIcons name="water-outline" size={14} color={selected ? "#FFFFFF" : "#DC2626"} />
                                            <Text style={[s.bgTxt, { color: selected ? "#FFFFFF" : colors.text }]}>{bg}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        {/* Address */}
                        <View style={s.inputGroup}>
                            <Text style={[s.label, { color: colors.text }]}>
                                Residential Address <Text style={s.reqStar}>*</Text>
                            </Text>
                            <View style={[s.inputWrap, s.multilineWrap, { backgroundColor: C.inputBg, borderColor: errors.address ? "#EF4444" : C.borderColor }]}>
                                <MaterialCommunityIcons name="map-marker-outline" size={18} color="#94A3B8" style={{ marginTop: 2 }} />
                                <TextInput
                                    style={[s.input, s.multilineInput, { color: colors.text }]}
                                    placeholder="Enter complete residential address..."
                                    placeholderTextColor="#94A3B8"
                                    multiline
                                    numberOfLines={2}
                                    value={address}
                                    onChangeText={(txt) => {
                                        setAddress(txt);
                                        if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
                                    }}
                                />
                            </View>
                            {errors.address ? <Text style={s.errorTxt}>{errors.address}</Text> : null}
                        </View>
                    </View>

                    {/* ── 2. CLINICAL & ASSIGNMENT SECTION ── */}
                    <View style={[s.sectionCard, { backgroundColor: C.cardBg, borderColor: C.borderColor }]}>
                        <View style={s.sectionHeader}>
                            <MaterialCommunityIcons name="hospital-building" size={18} color={BLUE} />
                            <Text style={[s.sectionTitle, { color: colors.text }]}>Clinical & Department Assignment</Text>
                        </View>

                        {/* Ward / Department */}
                        <View style={s.inputGroup}>
                            <Text style={[s.label, { color: colors.text }]}>
                                Department / Ward <Text style={s.reqStar}>*</Text>
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.bgScroll}>
                                {WARDS.map((w) => {
                                    const selected = ward === w;
                                    return (
                                        <TouchableOpacity
                                            key={w}
                                            style={[
                                                s.wardPill,
                                                { backgroundColor: selected ? BLUE : C.inputBg, borderColor: selected ? BLUE : C.borderColor },
                                            ]}
                                            onPress={() => setWard(w)}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={[s.wardTxt, { color: selected ? "#FFFFFF" : colors.text }]}>{w}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        {/* Assigned Doctor */}
                        <View style={s.inputGroup}>
                            <Text style={[s.label, { color: colors.text }]}>
                                Assigned Doctor <Text style={s.reqStar}>*</Text>
                            </Text>
                            <View style={s.docList}>
                                {DOCTORS.map((doc) => {
                                    const selected = assignedDoctor === doc;
                                    return (
                                        <TouchableOpacity
                                            key={doc}
                                            style={[
                                                s.docItem,
                                                { backgroundColor: selected ? (isDark ? "#1E3A8A40" : "#EFF6FF") : C.inputBg, borderColor: selected ? BLUE : C.borderColor },
                                            ]}
                                            onPress={() => setAssignedDoctor(doc)}
                                            activeOpacity={0.8}
                                        >
                                            <MaterialCommunityIcons
                                                name={selected ? "stethoscope" : "account-outline"}
                                                size={16}
                                                color={selected ? BLUE : "#94A3B8"}
                                            />
                                            <Text style={[s.docTxt, { color: selected ? BLUE : colors.text }]}>{doc}</Text>
                                            {selected && <MaterialCommunityIcons name="check-circle" size={16} color={BLUE} />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Medical Condition */}
                        <View style={s.inputGroup}>
                            <Text style={[s.label, { color: colors.text }]}>
                                Medical Condition / Diagnosis <Text style={s.reqStar}>*</Text>
                            </Text>
                            <View style={[s.inputWrap, { backgroundColor: C.inputBg, borderColor: errors.condition ? "#EF4444" : C.borderColor }]}>
                                <MaterialCommunityIcons name="medical-bag" size={18} color="#94A3B8" />
                                <TextInput
                                    style={[s.input, { color: colors.text }]}
                                    placeholder="e.g. Hypertension, Cardiac Arrhythmia"
                                    placeholderTextColor="#94A3B8"
                                    value={condition}
                                    onChangeText={(txt) => {
                                        setCondition(txt);
                                        if (errors.condition) setErrors((prev) => ({ ...prev, condition: undefined }));
                                    }}
                                />
                            </View>
                            {errors.condition ? <Text style={s.errorTxt}>{errors.condition}</Text> : null}
                        </View>
                    </View>

                    {/* ── 3. EMERGENCY & NOTES SECTION ── */}
                    <View style={[s.sectionCard, { backgroundColor: C.cardBg, borderColor: C.borderColor }]}>
                        <View style={s.sectionHeader}>
                            <MaterialCommunityIcons name="phone-alert-outline" size={18} color="#DC2626" />
                            <Text style={[s.sectionTitle, { color: colors.text }]}>Emergency & Additional Notes</Text>
                        </View>

                        {/* Emergency Contact */}
                        <View style={s.inputGroup}>
                            <Text style={[s.label, { color: colors.text }]}>
                                Emergency Contact Phone <Text style={s.reqStar}>*</Text>
                            </Text>
                            <View style={[s.inputWrap, { backgroundColor: C.inputBg, borderColor: errors.emergencyContact ? "#EF4444" : C.borderColor }]}>
                                <MaterialCommunityIcons name="phone-in-talk-outline" size={18} color="#DC2626" />
                                <TextInput
                                    style={[s.input, { color: colors.text }]}
                                    placeholder="e.g. +91 98765 00000"
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="phone-pad"
                                    value={emergencyContact}
                                    onChangeText={(txt) => {
                                        setEmergencyContact(txt);
                                        if (errors.emergencyContact) setErrors((prev) => ({ ...prev, emergencyContact: undefined }));
                                    }}
                                />
                            </View>
                            {errors.emergencyContact ? <Text style={s.errorTxt}>{errors.emergencyContact}</Text> : null}
                        </View>

                        {/* Clinical Notes */}
                        <View style={s.inputGroup}>
                            <Text style={[s.label, { color: colors.text }]}>Clinical Notes / Medical History</Text>
                            <View style={[s.inputWrap, s.multilineWrap, { backgroundColor: C.inputBg, borderColor: C.borderColor }]}>
                                <MaterialCommunityIcons name="file-document-edit-outline" size={18} color="#94A3B8" style={{ marginTop: 2 }} />
                                <TextInput
                                    style={[s.input, s.multilineInput, { color: colors.text }]}
                                    placeholder="Add any prior medical history, allergies, or special instructions..."
                                    placeholderTextColor="#94A3B8"
                                    multiline
                                    numberOfLines={3}
                                    value={notes}
                                    onChangeText={setNotes}
                                />
                            </View>
                        </View>
                    </View>

                    {/* ── ACTION BUTTONS ── */}
                    <View style={s.actionRow}>
                        <TouchableOpacity
                            style={[s.cancelBtn, { borderColor: C.borderColor }]}
                            onPress={() => router.back()}
                            activeOpacity={0.8}
                            disabled={isSaving}
                        >
                            <Text style={[s.cancelTxt, { color: colors.textSecondary }]}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={s.saveBtn}
                            onPress={handleSave}
                            activeOpacity={0.88}
                            disabled={isSaving}
                        >
                            <LinearGradient
                                colors={["#1E3A8A", "#2563EB"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={s.saveGrad}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="check-circle-outline" size={18} color="#FFFFFF" />
                                        <Text style={s.saveTxt}>Save & Register Patient</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1 },

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(148, 163, 184, 0.15)",
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: "rgba(148, 163, 184, 0.12)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "800",
    },
    headerSub: {
        fontSize: 11,
        fontWeight: "500",
        marginTop: 1,
    },

    scrollContent: {
        padding: 16,
    },

    heroCard: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        gap: 12,
    },
    heroIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    heroTitle: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "800",
    },
    heroSubTxt: {
        color: "rgba(255, 255, 255, 0.85)",
        fontSize: 11,
        marginTop: 2,
        lineHeight: 15,
    },

    sectionCard: {
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 14,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(148, 163, 184, 0.15)",
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "800",
        letterSpacing: -0.2,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    inputGroup: {
        marginBottom: 14,
    },
    label: {
        fontSize: 12,
        fontWeight: "700",
        marginBottom: 6,
    },
    reqStar: {
        color: "#EF4444",
        fontWeight: "800",
    },
    inputWrap: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        height: 44,
        gap: 8,
    },
    multilineWrap: {
        height: "auto" as any,
        alignItems: "flex-start",
        paddingVertical: 10,
    },
    input: {
        flex: 1,
        fontSize: 13,
        fontWeight: "500",
    },
    multilineInput: {
        textAlignVertical: "top",
        minHeight: 48,
    },
    errorTxt: {
        color: "#EF4444",
        fontSize: 11,
        fontWeight: "600",
        marginTop: 4,
        marginLeft: 2,
    },

    genderGroup: {
        flexDirection: "row",
        gap: 4,
    },
    genderBtn: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    genderTxt: {
        fontSize: 11,
        fontWeight: "700",
    },

    bgScroll: {
        gap: 8,
        paddingVertical: 2,
    },
    bgPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
    },
    bgTxt: {
        fontSize: 12,
        fontWeight: "800",
    },

    wardPill: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
    },
    wardTxt: {
        fontSize: 12,
        fontWeight: "700",
    },

    docList: {
        gap: 8,
    },
    docItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        gap: 10,
    },
    docTxt: {
        flex: 1,
        fontSize: 13,
        fontWeight: "600",
    },

    actionRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
    cancelBtn: {
        flex: 0.35,
        height: 48,
        borderRadius: 14,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    cancelTxt: {
        fontSize: 14,
        fontWeight: "700",
    },
    saveBtn: {
        flex: 0.65,
        height: 48,
        borderRadius: 14,
        overflow: "hidden",
    },
    saveGrad: {
        width: "100%",
        height: "100%",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    saveTxt: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "800",
    },
});
