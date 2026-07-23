import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Svg, { Path } from "react-native-svg";
import LogoBrand from "@/components/LogoBrand";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/utils/themeManager";

// ── Validators ────────────────────────────────────────────────────────────────
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidMobile = (v: string) => /^[6-9]\d{9}$/.test(v);
const isStrongPassword = (v: string) =>
    v.length >= 8 && /[A-Z]/.test(v) && /[0-9]/.test(v);

export default function DoctorRegisterScreen() {
    const router = useRouter();
    const { requestOtp } = useAuth();
    const { colors, isDark } = useTheme();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [securePassword, setSecurePassword] = useState(true);
    const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    // Errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    const clearError = (field: string) => {
        setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
    };

    const validateAll = (): boolean => {
        const e: Record<string, string> = {};

        if (!fullName.trim()) {
            e.fullName = "Full name is required.";
        } else if (fullName.trim().length < 2) {
            e.fullName = "Enter a valid full name.";
        }

        const emailTrimmed = email.trim();
        if (!emailTrimmed) {
            e.email = "Email address is required.";
        } else if (!isValidEmail(emailTrimmed)) {
            e.email = "Enter a valid email address.";
        }

        if (!mobile.trim()) {
            e.mobile = "Mobile number is required.";
        } else if (!isValidMobile(mobile.trim())) {
            e.mobile = "Enter a valid 10-digit Indian mobile number.";
        }

        if (!password) {
            e.password = "Password is required.";
        } else if (!isStrongPassword(password)) {
            e.password = "Min 8 chars, 1 uppercase letter, and 1 number.";
        }

        if (!confirmPassword) {
            e.confirmPassword = "Please confirm your password.";
        } else if (password !== confirmPassword) {
            e.confirmPassword = "Passwords do not match.";
        }

        if (!acceptedTerms) {
            e.terms = "You must accept the Terms & Conditions.";
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleRegister = async () => {
        if (!validateAll()) return;
        setLoading(true);
        try {
            const userData = {
                fullName: fullName.trim(),
                email: email.trim().toLowerCase(),
                mobile: mobile.trim(),
                password,
                role: "doctor",
                userType: "doctor",
            };
            await requestOtp(userData.email, userData as any);
            router.replace("/otp");
        } catch (err: any) {
            const msg: string = err?.message || "";
            if (msg.includes("already exists")) {
                setErrors({ email: "An account with this email or mobile already exists. Please log in." });
            } else {
                setErrors({ general: msg || "Failed to start registration. Please try again." });
            }
        } finally {
            setLoading(false);
        }
    };

    const ErrMsg = ({ field }: { field: string }) =>
        errors[field] ? <Text style={styles.fieldError}>{errors[field]}</Text> : null;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
            {/* Background Decorations */}
            <Image source={require("@/assets/images/decorations/plus.png")} style={[styles.plus, { top: 60, left: 25 }]} />
            <Image source={require("@/assets/images/decorations/hexagon.png")} style={[styles.hexagon, { top: 120, right: -20 }]} />
            <Image source={require("@/assets/images/decorations/dots.png")} style={[styles.dots, { top: 220, left: 10 }]} />

            {/* Back Button */}
            <TouchableOpacity
                style={[styles.backButton, { backgroundColor: isDark ? colors.card : "#FFFFFF" }]}
                onPress={() => router.back()}
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
                        <LogoBrand size={40} fontSize={28} centered />
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Healthcare Platform</Text>
                    </View>

                    {/* Heading */}
                    <Text style={[styles.heading, { color: colors.text }]}>Doctor Registration</Text>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>
                        Join Life Relier as a healthcare provider.
                    </Text>

                    {errors.general ? (
                        <View style={styles.errorBanner}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#DC2626" />
                            <Text style={styles.errorBannerText}>{errors.general}</Text>
                        </View>
                    ) : null}

                    {/* 1. Full Name */}
                    <View style={[
                        styles.inputContainer,
                        { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder },
                        errors.fullName ? styles.inputError : null
                    ]}>
                        <Image source={require("@/assets/images/auth/person.png")} style={styles.inputIcon} />
                        <TextInput
                            placeholder="Full Name (e.g. Dr. John Doe)"
                            placeholderTextColor="#94A3B8"
                            value={fullName}
                            onChangeText={(v) => { setFullName(v); clearError("fullName"); }}
                            style={[styles.input, { color: colors.text }]}
                        />
                    </View>
                    <ErrMsg field="fullName" />

                    {/* 2. Email Address */}
                    <View style={[
                        styles.inputContainer,
                        { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder },
                        errors.email ? styles.inputError : null
                    ]}>
                        <Image source={require("@/assets/images/auth/email.png")} style={styles.inputIcon} />
                        <TextInput
                            placeholder="Email Address"
                            placeholderTextColor="#94A3B8"
                            value={email}
                            onChangeText={(v) => { setEmail(v); clearError("email"); }}
                            style={[styles.input, { color: colors.text }]}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoCorrect={false}
                        />
                    </View>
                    <ErrMsg field="email" />

                    {/* 3. Mobile Number */}
                    <View style={[
                        styles.inputContainer,
                        { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder },
                        errors.mobile ? styles.inputError : null
                    ]}>
                        <Image source={require("@/assets/images/auth/phone.png")} style={styles.inputIcon} />
                        <TextInput
                            placeholder="Mobile Number (10 digits)"
                            placeholderTextColor="#94A3B8"
                            value={mobile}
                            onChangeText={(v) => { setMobile(v); clearError("mobile"); }}
                            style={[styles.input, { color: colors.text }]}
                            keyboardType="phone-pad"
                            maxLength={10}
                        />
                    </View>
                    <ErrMsg field="mobile" />

                    {/* 4. Password */}
                    <View style={[
                        styles.inputContainer,
                        { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder },
                        errors.password ? styles.inputError : null
                    ]}>
                        <Image source={require("@/assets/images/auth/password.png")} style={styles.inputIcon} />
                        <TextInput
                            placeholder="Password (min 8, 1 Upper, 1 Number)"
                            placeholderTextColor="#94A3B8"
                            secureTextEntry={securePassword}
                            value={password}
                            onChangeText={(v) => { setPassword(v); clearError("password"); }}
                            style={[styles.input, { color: colors.text }]}
                        />
                        <TouchableOpacity onPress={() => setSecurePassword(!securePassword)}>
                            <Image
                                source={securePassword ? require("@/assets/images/auth/eye-off.png") : require("@/assets/images/auth/eye.png")}
                                style={styles.eyeIcon}
                            />
                        </TouchableOpacity>
                    </View>
                    <ErrMsg field="password" />

                    {/* 5. Confirm Password */}
                    <View style={[
                        styles.inputContainer,
                        { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder },
                        errors.confirmPassword ? styles.inputError : null
                    ]}>
                        <Image source={require("@/assets/images/auth/password.png")} style={styles.inputIcon} />
                        <TextInput
                            placeholder="Confirm Password"
                            placeholderTextColor="#94A3B8"
                            secureTextEntry={secureConfirmPassword}
                            value={confirmPassword}
                            onChangeText={(v) => { setConfirmPassword(v); clearError("confirmPassword"); }}
                            style={[styles.input, { color: colors.text }]}
                        />
                        <TouchableOpacity onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}>
                            <Image
                                source={secureConfirmPassword ? require("@/assets/images/auth/eye-off.png") : require("@/assets/images/auth/eye.png")}
                                style={styles.eyeIcon}
                            />
                        </TouchableOpacity>
                    </View>
                    <ErrMsg field="confirmPassword" />

                    {/* Terms Checkbox */}
                    <View style={styles.termsBlock}>
                        <TouchableOpacity style={styles.termsContainer} onPress={() => { setAcceptedTerms(!acceptedTerms); clearError("terms"); }}>
                            <View style={[styles.checkbox, acceptedTerms && styles.checkboxSelected]}>
                                {acceptedTerms && <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />}
                            </View>
                            <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                                I agree to the <Text style={styles.linkText}>Terms & Conditions</Text> and <Text style={styles.linkText}>Privacy Policy</Text>
                            </Text>
                        </TouchableOpacity>
                        <ErrMsg field="terms" />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handleRegister}
                        style={styles.buttonContainer}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={["#0D9488", "#0A7870"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.button}
                        >
                            <View style={styles.buttonContent}>
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.buttonText}>Create Account</Text>
                                        <View style={styles.arrowCircle}>
                                            <MaterialCommunityIcons name="arrow-right" size={24} color="#0D9488" />
                                        </View>
                                    </>
                                )}
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Sign In Link */}
                    <View style={styles.loginContainer}>
                        <Text style={[styles.loginText, { color: colors.textSecondary }]}>Already registered?</Text>
                        <TouchableOpacity onPress={() => router.replace("/doctor/login")}>
                            <Text style={styles.signInText}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom SVG Waves */}
            <Svg width="100%" height={160} style={styles.wave} viewBox="0 0 430 160" preserveAspectRatio="xMidYMax slice">
                <Path d="M0 70 C120 15 250 120 430 70 L430 160 L0 160 Z" fill={isDark ? "#115E59" : "#F0FDFA"} />
                <Path d="M0 100 C150 55 280 160 430 105 L430 160 L0 160 Z" fill={isDark ? "#0F766E" : "#CCFBF1"} />
                <Path d="M0 130 C170 85 290 180 430 130 L430 160 L0 160 Z" fill="#0D9488" />
            </Svg>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 80,
        paddingBottom: 180,
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
    heading: {
        fontSize: 28,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 6,
    },
    description: {
        fontSize: 15,
        textAlign: "center",
        marginBottom: 20,
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
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: 60,
        borderRadius: 20,
        borderWidth: 1.5,
        paddingHorizontal: 16,
        width: "100%",
        marginBottom: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    inputError: {
        borderColor: "#EF4444",
    },
    inputIcon: {
        width: 22,
        height: 22,
        resizeMode: "contain",
        marginRight: 12,
    },
    eyeIcon: {
        width: 22,
        height: 22,
        resizeMode: "contain",
        tintColor: "#64748B",
    },
    input: {
        flex: 1,
        fontSize: 15,
        height: "100%",
    },
    fieldError: {
        alignSelf: "flex-start",
        color: "#EF4444",
        fontSize: 12,
        marginBottom: 8,
        marginLeft: 4,
    },
    termsBlock: {
        width: "100%",
        marginTop: 8,
        marginBottom: 20,
    },
    termsContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: "#CBD5E1",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    checkboxSelected: {
        backgroundColor: "#0D9488",
        borderColor: "#0D9488",
    },
    termsText: {
        fontSize: 13,
        flex: 1,
    },
    linkText: {
        color: "#0D9488",
        fontWeight: "600",
    },
    buttonContainer: {
        width: "100%",
        marginBottom: 20,
    },
    button: {
        height: 62,
        borderRadius: 31,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "700",
        marginRight: 12,
    },
    arrowCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },
    loginContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 20,
    },
    loginText: {
        fontSize: 14,
    },
    signInText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0D9488",
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
    wave: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
});
