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

// ── Validators ────────────────────────────────────────────────────────────────
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidMobile = (v: string) => /^[6-9]\d{9}$/.test(v);
const isStrongPassword = (v: string) =>
    v.length >= 8 && /[A-Z]/.test(v) && /[0-9]/.test(v);

export default function RegisterScreen() {
    const router = useRouter();
    const { requestOtp } = useAuth();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [securePassword, setSecurePassword] = useState(true);
    const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Error states
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
        const newUser = {
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            mobile: mobile.trim(),
            password,
        };
        await requestOtp(newUser.email, newUser);
        router.replace("/otp");
    } catch (err: any) {
        const msg: string = err?.message || "";
        if (msg.includes("already exists")) {
            setErrors({ email: "An account with this email or mobile already exists. Please log in." });
        } else {
            setErrors({ general: "Failed to start registration. Please try again." });
        }
    } finally {
        setLoading(false);
    }
};

    if (success) {
        return (
            <SafeAreaView style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
                <View style={styles.successContainer}>
                    <MaterialCommunityIcons name="check-circle" size={72} color="#10B981" />
                    <Text style={styles.successTitle}>Account Created!</Text>
                    <Text style={styles.successDesc}>Redirecting you to login…</Text>
                </View>
            </SafeAreaView>
        );
    }

    const ErrMsg = ({ field }: { field: string }) =>
        errors[field] ? <Text style={styles.fieldError}>{errors[field]}</Text> : null;

    return (
        <View style={styles.root}>
            {/* Bottom Waves */}
            <Svg width="100%" height={200} viewBox="0 0 430 200" preserveAspectRatio="xMidYMax slice" style={styles.wave}>
                <Path d="M0 60 C120 10 250 120 430 70 L430 200 L0 200 Z" fill="#EEF5FF" />
                <Path d="M0 95 C140 50 260 150 430 95 L430 200 L0 200 Z" fill="#DCEBFF" />
                <Path d="M0 125 C150 80 260 180 430 135 L430 200 L0 200 Z" fill="#2563EB" />
            </Svg>

            <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
                <KeyboardAvoidingView
                    style={{ flex: 1, width: "100%" }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Decorations */}
                        <Image source={require("@/assets/images/decorations/plus.png")} style={[styles.plus, { top: 60, left: 25 }]} />
                        <Image source={require("@/assets/images/decorations/hexagon.png")} style={[styles.hexagon, { top: 120, right: -20 }]} />
                        <Image source={require("@/assets/images/decorations/dots.png")} style={[styles.dots, { top: 220, left: 10 }]} />

                        {/* Back Button */}
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#071739" />
                        </TouchableOpacity>

                        {/* Branding */}
                        <View style={styles.brandingBlock}>
                            <LogoBrand size={40} fontSize={28} centered />
                            <Text style={styles.subtitle}>Healthcare Platform</Text>
                        </View>

                        {/* Heading */}
                        <Text style={styles.heading}>Create Account</Text>
                        <Text style={styles.description}>
                            Join Life Relier to manage{"\n"}your health securely.
                        </Text>

                        {/* General Error */}
                        {errors.general ? (
                            <View style={styles.errorBanner}>
                                <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#DC2626" />
                                <Text style={styles.errorBannerText}>{errors.general}</Text>
                            </View>
                        ) : null}

                        {/* Full Name */}
                        <View style={[styles.inputContainer, errors.fullName ? styles.inputError : null]}>
                            <Image source={require("@/assets/images/auth/person.png")} style={styles.icon} />
                            <TextInput
                                placeholder="Full Name"
                                placeholderTextColor="#94A3B8"
                                style={styles.input}
                                value={fullName}
                                onChangeText={(v) => { setFullName(v); clearError("fullName"); }}
                                autoCapitalize="words"
                            />
                        </View>
                        <ErrMsg field="fullName" />

                        {/* Email */}
                        <View style={[styles.inputContainer, errors.email ? styles.inputError : null]}>
                            <Image source={require("@/assets/images/auth/email.png")} style={styles.icon} />
                            <TextInput
                                placeholder="Email Address"
                                placeholderTextColor="#94A3B8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={styles.input}
                                value={email}
                                onChangeText={(v) => { setEmail(v); clearError("email"); }}
                            />
                        </View>
                        <ErrMsg field="email" />

                        {/* Mobile */}
                        <View style={[styles.inputContainer, errors.mobile ? styles.inputError : null]}>
                            <Image source={require("@/assets/images/auth/phone.png")} style={styles.icon} />
                            <TextInput
                                placeholder="Mobile Number"
                                placeholderTextColor="#94A3B8"
                                keyboardType="phone-pad"
                                maxLength={10}
                                style={styles.input}
                                value={mobile}
                                onChangeText={(v) => { setMobile(v); clearError("mobile"); }}
                            />
                        </View>
                        <ErrMsg field="mobile" />

                        {/* Password */}
                        <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
                            <Image source={require("@/assets/images/auth/password.png")} style={styles.icon} />
                            <TextInput
                                placeholder="Password"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={securePassword}
                                style={styles.input}
                                value={password}
                                onChangeText={(v) => { setPassword(v); clearError("password"); }}
                            />
                            <TouchableOpacity onPress={() => setSecurePassword(!securePassword)}>
                                <Image
                                    source={securePassword ? require("@/assets/images/auth/eye-off.png") : require("@/assets/images/auth/eye.png")}
                                    style={styles.eyeIcon}
                                />
                            </TouchableOpacity>
                        </View>
                        <ErrMsg field="password" />

                        {/* Confirm Password */}
                        <View style={[styles.inputContainer, errors.confirmPassword ? styles.inputError : null]}>
                            <Image source={require("@/assets/images/auth/password.png")} style={styles.icon} />
                            <TextInput
                                placeholder="Confirm Password"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={secureConfirmPassword}
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={(v) => { setConfirmPassword(v); clearError("confirmPassword"); }}
                            />
                            <TouchableOpacity onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}>
                                <Image
                                    source={secureConfirmPassword ? require("@/assets/images/auth/eye-off.png") : require("@/assets/images/auth/eye.png")}
                                    style={styles.eyeIcon}
                                />
                            </TouchableOpacity>
                        </View>
                        <ErrMsg field="confirmPassword" />

                        {/* Terms */}
                        <TouchableOpacity
                            style={[styles.termsContainer, errors.terms ? { borderColor: "#FCA5A5", borderWidth: 1, borderRadius: 10, padding: 8 } : null]}
                            onPress={() => { setAcceptedTerms(!acceptedTerms); clearError("terms"); }}
                        >
                            <View style={[styles.checkbox, acceptedTerms && styles.checkboxSelected]}>
                                {acceptedTerms && <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />}
                            </View>
                            <Text style={styles.termsText}>
                                I agree to the{" "}
                                <Text style={styles.link}>Terms & Conditions</Text>
                            </Text>
                        </TouchableOpacity>
                        <ErrMsg field="terms" />

                        {/* Register Button */}
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={handleRegister}
                            style={styles.buttonContainer}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={["#2563EB", "#0A48D6"]}
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
                                                <MaterialCommunityIcons name="arrow-right" size={24} color="#2563EB" />
                                            </View>
                                        </>
                                    )}
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Already have account */}
                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account?</Text>
                            <TouchableOpacity onPress={() => router.replace("/login")}>
                                <Text style={styles.signInText}>Sign In</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.line} />
                            <Text style={styles.orText}>OR</Text>
                            <View style={styles.line} />
                        </View>

                        {/* Google */}
                        <TouchableOpacity style={styles.googleButton} activeOpacity={0.9}>
                            <Image source={require("@/assets/images/auth/google.png")} style={styles.googleIcon} />
                            <Text style={styles.googleText}>Continue with Google</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    container: {
        flex: 1,
    },

    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 220,
        alignItems: "center",
    },

    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 16,
        alignSelf: "flex-start",
    },

    brandingBlock: {
        alignItems: "center",
        marginBottom: 4,
    },

    subtitle: {
        textAlign: "center",
        fontSize: 14,
        color: "#64748B",
        marginTop: 4,
        marginBottom: 16,
        fontWeight: "500",
    },

    heading: {
        fontSize: 30,
        fontWeight: "800",
        color: "#071739",
        textAlign: "center",
    },

    description: {
        textAlign: "center",
        fontSize: 15,
        color: "#64748B",
        lineHeight: 22,
        marginTop: 8,
        marginBottom: 20,
    },

    errorBanner: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FECACA",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 14,
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
        width: "100%",
        height: 60,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingHorizontal: 18,
        marginBottom: 6,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 4,
    },

    inputError: {
        borderColor: "#FCA5A5",
        backgroundColor: "#FFF9F9",
    },

    icon: {
        width: 24,
        height: 24,
        resizeMode: "contain",
        marginRight: 12,
    },

    input: {
        flex: 1,
        fontSize: 15,
        color: "#071739",
    },

    eyeIcon: {
        width: 22,
        height: 22,
        resizeMode: "contain",
    },

    fieldError: {
        width: "100%",
        color: "#DC2626",
        fontSize: 12,
        marginBottom: 8,
        marginLeft: 4,
    },

    termsContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
        marginBottom: 8,
        width: "100%",
    },

    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#CBD5E1",
        justifyContent: "center",
        alignItems: "center",
    },

    checkboxSelected: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },

    termsText: {
        marginLeft: 10,
        color: "#475569",
        fontSize: 14,
        flex: 1,
    },

    link: {
        color: "#2563EB",
        fontWeight: "700",
    },

    buttonContainer: {
        width: "100%",
        marginTop: 16,
    },

    button: {
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },

    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
    },

    buttonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "700",
        marginRight: 14,
    },

    arrowCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },

    loginContainer: {
        alignItems: "center",
        marginTop: 20,
    },

    loginText: {
        color: "#64748B",
        fontSize: 14,
    },

    signInText: {
        marginTop: 6,
        color: "#2563EB",
        fontSize: 16,
        fontWeight: "700",
    },

    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 22,
        width: "100%",
    },

    line: {
        flex: 1,
        height: 1,
        backgroundColor: "#E2E8F0",
    },

    orText: {
        marginHorizontal: 14,
        color: "#94A3B8",
        fontWeight: "700",
        fontSize: 13,
    },

    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: 58,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 4,
        marginBottom: 40,
    },

    googleIcon: {
        width: 24,
        height: 24,
        resizeMode: "contain",
        marginRight: 12,
    },

    googleText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#071739",
    },

    plus: {
        position: "absolute",
        width: 22,
        height: 22,
        resizeMode: "contain",
        opacity: 0.45,
    },

    hexagon: {
        position: "absolute",
        width: 80,
        height: 80,
        resizeMode: "contain",
        opacity: 0.35,
    },

    dots: {
        position: "absolute",
        width: 58,
        height: 58,
        resizeMode: "contain",
        opacity: 0.45,
    },

    wave: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
    },

    successContainer: {
        alignItems: "center",
        padding: 40,
    },

    successTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#071739",
        marginTop: 20,
        marginBottom: 10,
    },

    successDesc: {
        fontSize: 16,
        color: "#64748B",
        textAlign: "center",
    },
});