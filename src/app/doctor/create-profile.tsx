import LogoBrand from "@/components/LogoBrand";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/utils/themeManager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
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

const SPECIALIZATIONS = [
    "General Physician",
    "Cardiologist",
    "Dermatologist",
    "Neurologist",
    "Orthopedic",
    "Pediatrician",
    "Gynecologist",
    "Psychiatrist",
    "ENT",
    "Other",
];

const LANGUAGES = [
    "English",
    "Hindi",
    "Marathi",
    "Tamil",
    "Telugu",
    "Bengali",
    "Gujarati",
    "Other",
];

export default function DoctorCreateProfileScreen() {
    const router = useRouter();
    const { user, pendingUser, updateProfile } = useAuth();
    const { colors, isDark } = useTheme();

    // Pre-fill from existing profile data
    const rawData = (user as any)?.rawApiData || {};
    const isEditing = !!user?.fullName;

    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);

    // Step 1: Personal Info — pre-filled
    const [fullName, setFullName] = useState(user?.fullName || pendingUser?.fullName || "");
    const [dob, setDob] = useState(rawData.dob || "");
    const [gender, setGender] = useState<"Male" | "Female" | "Other">(rawData.gender || "Male");
    const [hasPhoto, setHasPhoto] = useState(false);

    // Step 2: Professional Info — pre-filled
    const [regNumber, setRegNumber] = useState(rawData.regNumber || "");
    const [specialization, setSpecialization] = useState(rawData.specialization || "General Physician");
    const [experience, setExperience] = useState(rawData.experience ? String(rawData.experience) : "");
    const [qualification, setQualification] = useState(rawData.qualification || "");
    const [hospitalName, setHospitalName] = useState(rawData.hospitalName || "");
    const [hospitalCity, setHospitalCity] = useState(rawData.hospitalCity || "");
    const [consultationFee, setConsultationFee] = useState(rawData.consultationFee ? String(rawData.consultationFee) : "");
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(rawData.languages?.length ? rawData.languages : ["English", "Hindi"]);

    // Step 3: Documents — pre-filled if already uploaded
    const [degreeDoc, setDegreeDoc] = useState<string | null>(rawData.degreeDoc || null);
    const [regDoc, setRegDoc] = useState<string | null>(rawData.regDoc || null);

    // Error message
    const [stepError, setStepError] = useState("");

    const toggleLanguage = (lang: string) => {
        setSelectedLanguages((prev) =>
            prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
        );
    };

    const validateStep1 = () => {
        if (!fullName.trim()) {
            setStepError("Full name is required.");
            return false;
        }
        if (!dob.trim()) {
            setStepError("Date of Birth is required.");
            return false;
        }
        setStepError("");
        return true;
    };

    const validateStep2 = () => {
        if (!regNumber.trim()) {
            setStepError("Medical Registration Number is required.");
            return false;
        }
        if (!experience.trim()) {
            setStepError("Years of Experience is required.");
            return false;
        }
        if (!qualification.trim()) {
            setStepError("Highest Qualification is required.");
            return false;
        }
        if (!hospitalName.trim()) {
            setStepError("Hospital/Clinic Name is required.");
            return false;
        }
        if (!consultationFee.trim()) {
            setStepError("Consultation Fee is required.");
            return false;
        }
        setStepError("");
        return true;
    };

    const handleNext = () => {
        if (currentStep === 1) {
            if (!validateStep1()) return;
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!validateStep2()) return;
            setCurrentStep(3);
        }
    };

    const handleBack = () => {
        setStepError("");
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
        } else {
            router.back();
        }
    };

    const handleSubmit = async () => {
        if (!degreeDoc || !regDoc) {
            setStepError("Please upload both required verification documents.");
            return;
        }

        setLoading(true);
        setStepError("");
        try {
            const doctorProfile = {
                fullName,
                dob,
                gender,
                userType: "doctor",
                roleName: "doctor",
                rawApiData: {
                    regNumber,
                    specialization,
                    experience,
                    qualification,
                    hospitalName,
                    hospitalCity,
                    consultationFee,
                    languages: selectedLanguages,
                    degreeDoc,
                    regDoc,
                    // Preserve existing status when editing; set pending_approval for new registration
                    status: isEditing ? (rawData.status || "approved") : "pending_approval",
                },
            };

            await updateProfile(doctorProfile);
            if (isEditing) {
                router.back();
            } else {
                router.replace("/doctor/pending-approval");
            }
        } catch (err: any) {
            setStepError(err?.message || "Failed to save profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
            {/* Background Decorations */}
            <Image source={require("@/assets/images/decorations/plus.png")} style={[styles.plus, { top: 60, left: 25 }]} />
            <Image source={require("@/assets/images/decorations/hexagon.png")} style={[styles.hexagon, { top: 110, right: -20 }]} />
            <Image source={require("@/assets/images/decorations/dots.png")} style={[styles.dots, { top: 220, left: 10 }]} />

            {/* Back Button */}
            <TouchableOpacity
                style={[styles.backButton, { backgroundColor: isDark ? colors.card : "#FFFFFF" }]}
                onPress={handleBack}
            >
                <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>

            <KeyboardAvoidingView
                style={{ flex: 1, width: "100%" }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Branding */}
                    <View style={styles.brandingBlock}>
                        <LogoBrand size={38} fontSize={26} centered />
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            {isEditing ? "Edit Profile" : "Doctor Registration"}
                        </Text>
                    </View>

                    {/* Progress Indicator */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressStep}>
                            <View style={[styles.dot, currentStep >= 1 ? styles.dotActive : styles.dotInactive]}>
                                {currentStep >= 1 && <View style={styles.dotInner} />}
                            </View>
                            <Text style={[styles.stepLabel, currentStep >= 1 ? styles.stepLabelActive : { color: colors.textSecondary }]}>Basic</Text>
                        </View>

                        <View style={[styles.line, currentStep >= 2 ? styles.lineActive : { backgroundColor: colors.cardBorder }]} />

                        <View style={styles.progressStep}>
                            <View style={[styles.dot, currentStep >= 2 ? styles.dotActive : styles.dotInactive]}>
                                {currentStep >= 2 && <View style={styles.dotInner} />}
                            </View>
                            <Text style={[styles.stepLabel, currentStep >= 2 ? styles.stepLabelActive : { color: colors.textSecondary }]}>Professional</Text>
                        </View>

                        <View style={[styles.line, currentStep >= 3 ? styles.lineActive : { backgroundColor: colors.cardBorder }]} />

                        <View style={styles.progressStep}>
                            <View style={[styles.dot, currentStep >= 3 ? styles.dotActive : styles.dotInactive]}>
                                {currentStep >= 3 && <View style={styles.dotInner} />}
                            </View>
                            <Text style={[styles.stepLabel, currentStep >= 3 ? styles.stepLabelActive : { color: colors.textSecondary }]}>Documents</Text>
                        </View>
                    </View>

                    {/* Error Banner */}
                    {stepError ? (
                        <View style={styles.errorBanner}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#DC2626" />
                            <Text style={styles.errorBannerText}>{stepError}</Text>
                        </View>
                    ) : null}

                    {/* STEP 1: Personal Info */}
                    {currentStep === 1 && (
                        <View style={styles.stepForm}>
                            <Text style={[styles.sectionHeading, { color: colors.text }]}>Personal Details</Text>
                            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>Set up your public medical profile</Text>

                            {/* Photo Upload Circle */}
                            <TouchableOpacity
                                style={[styles.avatarCircle, { borderColor: "#0D9488", backgroundColor: isDark ? colors.card : "#F0FDFA" }]}
                                onPress={() => setHasPhoto(!hasPhoto)}
                            >
                                {hasPhoto ? (
                                    <Image source={require("@/assets/images/dashboard/doctor.png")} style={styles.avatarImage} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <MaterialCommunityIcons name="camera-outline" size={36} color="#0D9488" />
                                        <Text style={styles.avatarText}>Upload Photo</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            <Text style={[styles.photoSubText, { color: colors.textSecondary }]}>Tap to choose a picture</Text>

                            {/* Full Name */}
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name</Text>
                            <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}>
                                <Image source={require("@/assets/images/auth/person.png")} style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Dr. Full Name"
                                    placeholderTextColor="#94A3B8"
                                    value={fullName}
                                    onChangeText={setFullName}
                                    style={[styles.input, { color: colors.text }]}
                                />
                            </View>

                            {/* DOB */}
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Date of Birth (DD/MM/YYYY)</Text>
                            <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}>
                                <MaterialCommunityIcons name="calendar-month-outline" size={22} color="#64748B" style={styles.vectorIcon} />
                                <TextInput
                                    placeholder="DD/MM/YYYY"
                                    placeholderTextColor="#94A3B8"
                                    value={dob}
                                    onChangeText={setDob}
                                    style={[styles.input, { color: colors.text }]}
                                    keyboardType="numeric"
                                />
                            </View>

                            {/* Gender Chip Selector */}
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Gender</Text>
                            <View style={styles.chipRow}>
                                {(["Male", "Female", "Other"] as const).map((g) => (
                                    <TouchableOpacity
                                        key={g}
                                        style={[
                                            styles.genderChip,
                                            { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder },
                                            gender === g && styles.genderChipSelected,
                                        ]}
                                        onPress={() => setGender(g)}
                                    >
                                        <Text style={[styles.genderChipText, { color: colors.text }, gender === g && styles.chipTextSelected]}>
                                            {g}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* STEP 2: Professional Info */}
                    {currentStep === 2 && (
                        <View style={styles.stepForm}>
                            <Text style={[styles.sectionHeading, { color: colors.text }]}>Professional Information</Text>
                            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>Enter your credentials and practice details</Text>

                            {/* Registration Number */}
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Medical Registration Number</Text>
                            <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}>
                                <MaterialCommunityIcons name="stethoscope" size={22} color="#64748B" style={styles.vectorIcon} />
                                <TextInput
                                    placeholder="Reg No. e.g. MCI-12345"
                                    placeholderTextColor="#94A3B8"
                                    value={regNumber}
                                    onChangeText={setRegNumber}
                                    style={[styles.input, { color: colors.text }]}
                                />
                            </View>

                            {/* Specialization Horizontal Chip Scroll */}
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Specialization</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specScroll}>
                                {SPECIALIZATIONS.map((spec) => (
                                    <TouchableOpacity
                                        key={spec}
                                        style={[
                                            styles.specChip,
                                            { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder },
                                            specialization === spec && styles.specChipSelected,
                                        ]}
                                        onPress={() => setSpecialization(spec)}
                                    >
                                        <Text style={[styles.specChipText, { color: colors.text }, specialization === spec && styles.chipTextSelected]}>
                                            {spec}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Experience */}
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Years of Experience</Text>
                            <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}>
                                <MaterialCommunityIcons name="briefcase-outline" size={22} color="#64748B" style={styles.vectorIcon} />
                                <TextInput
                                    placeholder="e.g. 8"
                                    placeholderTextColor="#94A3B8"
                                    value={experience}
                                    onChangeText={setExperience}
                                    keyboardType="numeric"
                                    style={[styles.input, { color: colors.text }]}
                                />
                            </View>

                            {/* Qualification */}
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Highest Qualification</Text>
                            <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}>
                                <MaterialCommunityIcons name="school-outline" size={22} color="#64748B" style={styles.vectorIcon} />
                                <TextInput
                                    placeholder="e.g. MBBS, MD (Cardiology)"
                                    placeholderTextColor="#94A3B8"
                                    value={qualification}
                                    onChangeText={setQualification}
                                    style={[styles.input, { color: colors.text }]}
                                />
                            </View>

                            {/* Hospital Name & City */}
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Hospital / Clinic Name</Text>
                            <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}>
                                <MaterialCommunityIcons name="hospital-building" size={22} color="#64748B" style={styles.vectorIcon} />
                                <TextInput
                                    placeholder="Hospital/Clinic Name"
                                    placeholderTextColor="#94A3B8"
                                    value={hospitalName}
                                    onChangeText={setHospitalName}
                                    style={[styles.input, { color: colors.text }]}
                                />
                            </View>

                            <Text style={[styles.inputLabel, { color: colors.text }]}>Hospital / Clinic City</Text>
                            <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}>
                                <MaterialCommunityIcons name="map-marker-outline" size={22} color="#64748B" style={styles.vectorIcon} />
                                <TextInput
                                    placeholder="City (e.g. Mumbai)"
                                    placeholderTextColor="#94A3B8"
                                    value={hospitalCity}
                                    onChangeText={setHospitalCity}
                                    style={[styles.input, { color: colors.text }]}
                                />
                            </View>

                            {/* Consultation Fee */}
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Consultation Fee (₹)</Text>
                            <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}>
                                <MaterialCommunityIcons name="currency-inr" size={22} color="#64748B" style={styles.vectorIcon} />
                                <TextInput
                                    placeholder="e.g. 500"
                                    placeholderTextColor="#94A3B8"
                                    value={consultationFee}
                                    onChangeText={setConsultationFee}
                                    keyboardType="numeric"
                                    style={[styles.input, { color: colors.text }]}
                                />
                            </View>

                            {/* Available Languages Grid */}
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Available Languages</Text>
                            <View style={styles.langGrid}>
                                {LANGUAGES.map((lang) => {
                                    const isSelected = selectedLanguages.includes(lang);
                                    return (
                                        <TouchableOpacity
                                            key={lang}
                                            style={[
                                                styles.langChip,
                                                { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder },
                                                isSelected && styles.langChipSelected,
                                            ]}
                                            onPress={() => toggleLanguage(lang)}
                                        >
                                            <Text style={[styles.langChipText, { color: colors.text }, isSelected && styles.chipTextSelected]}>
                                                {lang}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* STEP 3: Documents */}
                    {currentStep === 3 && (
                        <View style={styles.stepForm}>
                            <Text style={[styles.sectionHeading, { color: colors.text }]}>Upload Verification Documents</Text>
                            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                                Required for account approval. Accepted: JPG, PNG, PDF
                            </Text>

                            {/* Document Box 1 */}
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Medical Degree Certificate</Text>
                            <TouchableOpacity
                                style={[styles.uploadBox, degreeDoc ? styles.uploadBoxSelected : null]}
                                onPress={() => setDegreeDoc(degreeDoc ? null : "Medical_Degree_Certificate.pdf")}
                            >
                                <MaterialCommunityIcons
                                    name={degreeDoc ? "file-check-outline" : "cloud-upload-outline"}
                                    size={36}
                                    color="#0D9488"
                                />
                                <Text style={[styles.uploadBoxTitle, { color: colors.text }]}>
                                    {degreeDoc ? degreeDoc : "Tap to upload Degree Certificate"}
                                </Text>
                                <Text style={[styles.uploadBoxSub, { color: colors.textSecondary }]}>
                                    {degreeDoc ? "Uploaded (Tap to change)" : "Max file size: 10MB"}
                                </Text>
                            </TouchableOpacity>

                            {/* Document Box 2 */}
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Medical Registration Certificate</Text>
                            <TouchableOpacity
                                style={[styles.uploadBox, regDoc ? styles.uploadBoxSelected : null]}
                                onPress={() => setRegDoc(regDoc ? null : "Medical_Registration_Cert.pdf")}
                            >
                                <MaterialCommunityIcons
                                    name={regDoc ? "file-check-outline" : "cloud-upload-outline"}
                                    size={36}
                                    color="#0D9488"
                                />
                                <Text style={[styles.uploadBoxTitle, { color: colors.text }]}>
                                    {regDoc ? regDoc : "Tap to upload Registration Certificate"}
                                </Text>
                                <Text style={[styles.uploadBoxSub, { color: colors.textSecondary }]}>
                                    {regDoc ? "Uploaded (Tap to change)" : "Max file size: 10MB"}
                                </Text>
                            </TouchableOpacity>

                            {/* Info Card */}
                            <View style={styles.infoCard}>
                                <MaterialCommunityIcons name="shield-check-outline" size={24} color="#0D9488" />
                                <Text style={styles.infoCardText}>
                                    Documents are encrypted and reviewed within 24-48 hours by our admin team.
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Navigation Buttons */}
                    <View style={styles.navRow}>
                        {currentStep > 1 && (
                            <TouchableOpacity style={styles.backStepButton} onPress={handleBack}>
                                <Text style={styles.backStepText}>← Back</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={currentStep === 3 ? handleSubmit : handleNext}
                            style={[styles.nextButtonContainer, currentStep === 1 && { width: "100%" }]}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={["#0D9488", "#0A7870"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.nextButton}
                            >
                                <View style={styles.nextButtonContent}>
                                    {loading ? (
                                        <ActivityIndicator color="#FFFFFF" size="small" />
                                    ) : (
                                        <>
                                            <Text style={styles.nextButtonText}>
                                                {currentStep === 3
                                                    ? (isEditing ? "Save Changes" : "Submit Application")
                                                    : "Next →"}
                                            </Text>
                                        </>
                                    )}
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 80,
        paddingBottom: 60,
        alignItems: "center",
        width: "100%",
    },
    backButton: {
        position: "absolute",
        top: 55,
        left: 24,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        zIndex: 10,
    },
    brandingBlock: {
        alignItems: "center",
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: "500",
        marginTop: 4,
    },
    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    progressStep: {
        alignItems: "center",
    },
    dot: {
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: "center",
        alignItems: "center",
    },
    dotActive: {
        backgroundColor: "#0D9488",
    },
    dotInactive: {
        borderWidth: 2,
        borderColor: "#CBD5E1",
        backgroundColor: "transparent",
    },
    dotInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#FFFFFF",
    },
    stepLabel: {
        fontSize: 12,
        fontWeight: "600",
        marginTop: 6,
    },
    stepLabelActive: {
        color: "#0D9488",
    },
    line: {
        flex: 1,
        height: 2,
        marginHorizontal: 8,
        marginTop: -16,
    },
    lineActive: {
        backgroundColor: "#0D9488",
    },
    errorBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FCA5A5",
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        width: "100%",
        marginBottom: 16,
        gap: 8,
    },
    errorBannerText: {
        color: "#DC2626",
        fontSize: 13,
        fontWeight: "500",
        flex: 1,
    },
    stepForm: {
        width: "100%",
    },
    sectionHeading: {
        fontSize: 22,
        fontWeight: "800",
        marginBottom: 4,
    },
    sectionSub: {
        fontSize: 14,
        marginBottom: 20,
    },
    avatarCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderStyle: "dashed",
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        marginBottom: 6,
    },
    avatarPlaceholder: {
        alignItems: "center",
    },
    avatarText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#0D9488",
        marginTop: 4,
    },
    avatarImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    photoSubText: {
        textAlign: "center",
        fontSize: 12,
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 6,
        marginTop: 10,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: 56,
        borderRadius: 18,
        borderWidth: 1.5,
        paddingHorizontal: 16,
        width: "100%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    inputIcon: {
        width: 20,
        height: 20,
        resizeMode: "contain",
        marginRight: 12,
    },
    vectorIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        height: "100%",
    },
    chipRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 4,
        marginBottom: 10,
    },
    genderChip: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        borderWidth: 1.5,
        justifyContent: "center",
        alignItems: "center",
    },
    genderChipSelected: {
        backgroundColor: "#0D9488",
        borderColor: "#0D9488",
    },
    genderChipText: {
        fontSize: 14,
        fontWeight: "600",
    },
    chipTextSelected: {
        color: "#FFFFFF",
    },
    specScroll: {
        marginVertical: 4,
        marginBottom: 10,
    },
    specChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1.5,
        marginRight: 8,
    },
    specChipSelected: {
        backgroundColor: "#0D9488",
        borderColor: "#0D9488",
    },
    specChipText: {
        fontSize: 13,
        fontWeight: "600",
    },
    langGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 4,
        marginBottom: 16,
    },
    langChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1.5,
    },
    langChipSelected: {
        backgroundColor: "#0D9488",
        borderColor: "#0D9488",
    },
    langChipText: {
        fontSize: 13,
        fontWeight: "600",
    },
    uploadBox: {
        width: "100%",
        height: 110,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: "#0D9488",
        borderStyle: "dashed",
        backgroundColor: "#F0FDFA",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
        paddingHorizontal: 16,
    },
    uploadBoxSelected: {
        backgroundColor: "#CCFBF1",
        borderColor: "#0A7870",
    },
    uploadBoxTitle: {
        fontSize: 14,
        fontWeight: "700",
        marginTop: 6,
        textAlign: "center",
    },
    uploadBoxSub: {
        fontSize: 12,
        marginTop: 2,
    },
    infoCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0FDFA",
        borderWidth: 1.5,
        borderColor: "#CCFBF1",
        borderRadius: 16,
        padding: 14,
        marginTop: 16,
        gap: 12,
    },
    infoCardText: {
        flex: 1,
        color: "#0F766E",
        fontSize: 13,
        lineHeight: 18,
        fontWeight: "500",
    },
    navRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 28,
        gap: 12,
    },
    backStepButton: {
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    backStepText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0D9488",
    },
    nextButtonContainer: {
        flex: 1,
    },
    nextButton: {
        height: 58,
        borderRadius: 29,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
    },
    nextButtonContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    nextButtonText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
    },
    plus: {
        position: "absolute",
        width: 22,
        height: 22,
        opacity: 0.35,
        resizeMode: "contain",
    },
    hexagon: {
        position: "absolute",
        width: 70,
        height: 70,
        opacity: 0.25,
        resizeMode: "contain",
    },
    dots: {
        position: "absolute",
        width: 50,
        height: 50,
        opacity: 0.35,
        resizeMode: "contain",
    },
});
