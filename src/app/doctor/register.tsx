import React, { useState, useRef, useEffect } from "react";
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
    Animated,
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

// ── Password strength helper ───────────────────────────────────────────────────
function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string } {
    if (!pw) return { level: 0, label: "" };
    if (pw.length < 6) return { level: 1, label: "Weak" };
    if (pw.length < 8 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { level: 2, label: "Fair" };
    return { level: 3, label: "Strong" };
}

// ── Premium Input Field Component ─────────────────────────────────────────────
function InputField({
    icon,
    placeholder,
    value,
    onChangeText,
    secureTextEntry,
    keyboardType,
    autoCapitalize,
    autoCorrect,
    maxLength,
    rightElement,
    hasError,
    isDark,
    colors,
}: any) {
    const [focused, setFocused] = useState(false);
    const focusAnim = useRef(new Animated.Value(0)).current;

    const handleFocus = () => {
        setFocused(true);
        Animated.timing(focusAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    };
    const handleBlur = () => {
        setFocused(false);
        Animated.timing(focusAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    };

    const borderColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [hasError ? "#EF4444" : (isDark ? "#334155" : "#E2E8F0"), hasError ? "#EF4444" : "#0D9488"],
    });

    return (
        <Animated.View
            style={[
                styles.inputWrapper,
                {
                    backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                    borderColor,
                    borderWidth: focused ? 1.5 : 1,
                    shadowColor: focused ? "#0D9488" : "#000",
                    shadowOpacity: focused ? 0.08 : 0.03,
                    shadowRadius: focused ? 10 : 4,
                    elevation: focused ? 4 : 1,
                },
            ]}
        >
            <View style={styles.inputIconWrap}>
                <Image source={icon} style={[styles.inputIcon, { tintColor: focused ? "#0D9488" : (isDark ? "#64748B" : "#94A3B8") }]} />
            </View>
            <TextInput
                placeholder={placeholder}
                placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                value={value}
                onChangeText={onChangeText}
                style={[styles.input, { color: colors.text }]}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize ?? "sentences"}
                autoCorrect={autoCorrect ?? true}
                maxLength={maxLength}
                onFocus={handleFocus}
                onBlur={handleBlur}
            />
            {rightElement}
        </Animated.View>
    );
}

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

    // Entry animation
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(28)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 520, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 520, useNativeDriver: true }),
        ]).start();
    }, []);

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
        errors[field] ? (
            <View style={styles.fieldErrRow}>
                <MaterialCommunityIcons name="information-outline" size={13} color="#EF4444" />
                <Text style={styles.fieldError}>{errors[field]}</Text>
            </View>
        ) : null;

    const pwStrength = getPasswordStrength(password);
    const strengthColors = ["#E2E8F0", "#EF4444", "#F59E0B", "#10B981"];
    const strengthTextColors = ["#94A3B8", "#EF4444", "#F59E0B", "#10B981"];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0F172A" : "#F0FDFA" }]} edges={["top", "left", "right"]}>

            {/* ── Hero Header ─────────────────────────────────────────── */}
            <LinearGradient
                colors={isDark ? ["#0F766E", "#134E4A"] : ["#0D9488", "#0569A8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
            >
                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Subtle decoration blobs */}
                <View style={[styles.heroBlobA, { backgroundColor: "rgba(255,255,255,0.08)" }]} />
                <View style={[styles.heroBlobB, { backgroundColor: "rgba(255,255,255,0.05)" }]} />

                <View style={styles.heroContent}>
                    <LogoBrand size={36} fontSize={24} centered style={styles.logoBrand} />
                    <Text style={styles.heroTag}>Doctor Portal</Text>
                    <Text style={styles.heroHeading}>Join as a Healthcare Provider 🩺</Text>
                    <Text style={styles.heroSub}>Register to connect with patients on Life Relier</Text>
                </View>
            </LinearGradient>

            {/* ── Form ────────────────────────────────────────────────── */}
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View
                        style={[
                            styles.formCard,
                            {
                                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                                shadowColor: isDark ? "#000" : "#0D9488",
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        {/* General Error Banner */}
                        {errors.general ? (
                            <View style={[styles.errorBanner, { backgroundColor: isDark ? "#450A0A" : "#FEF2F2" }]}>
                                <View style={styles.errorAccentBar} />
                                <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#DC2626" style={{ marginLeft: 10 }} />
                                <Text style={styles.errorBannerText}>{errors.general}</Text>
                            </View>
                        ) : null}

                        {/* ── Section: Personal Info ───────────────────── */}
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionDot, { backgroundColor: "#0D9488" }]} />
                            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PERSONAL INFORMATION</Text>
                        </View>

                        {/* Full Name */}
                        <InputField
                            icon={require("@/assets/images/auth/person.png")}
                            placeholder="Full Name (e.g. Dr. John Doe)"
                            value={fullName}
                            onChangeText={(v: string) => { setFullName(v); clearError("fullName"); }}
                            hasError={!!errors.fullName}
                            isDark={isDark}
                            colors={colors}
                        />
                        <ErrMsg field="fullName" />

                        {/* Email */}
                        <InputField
                            icon={require("@/assets/images/auth/email.png")}
                            placeholder="Email Address"
                            value={email}
                            onChangeText={(v: string) => { setEmail(v); clearError("email"); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            hasError={!!errors.email}
                            isDark={isDark}
                            colors={colors}
                        />
                        <ErrMsg field="email" />

                        {/* Mobile */}
                        <InputField
                            icon={require("@/assets/images/auth/phone.png")}
                            placeholder="Mobile Number (10 digits)"
                            value={mobile}
                            onChangeText={(v: string) => { setMobile(v); clearError("mobile"); }}
                            keyboardType="phone-pad"
                            autoCapitalize="none"
                            maxLength={10}
                            hasError={!!errors.mobile}
                            isDark={isDark}
                            colors={colors}
                        />
                        <ErrMsg field="mobile" />

                        {/* ── Section: Security ───────────────────────── */}
                        <View style={[styles.sectionHeader, { marginTop: 8 }]}>
                            <View style={[styles.sectionDot, { backgroundColor: "#2563EB" }]} />
                            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ACCOUNT SECURITY</Text>
                        </View>

                        {/* Password */}
                        <InputField
                            icon={require("@/assets/images/auth/password.png")}
                            placeholder="Password (min 8, 1 Upper, 1 Number)"
                            value={password}
                            onChangeText={(v: string) => { setPassword(v); clearError("password"); }}
                            secureTextEntry={securePassword}
                            autoCapitalize="none"
                            hasError={!!errors.password}
                            isDark={isDark}
                            colors={colors}
                            rightElement={
                                <TouchableOpacity onPress={() => setSecurePassword(!securePassword)} style={styles.eyeBtn}>
                                    <MaterialCommunityIcons
                                        name={securePassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={isDark ? "#64748B" : "#94A3B8"}
                                    />
                                </TouchableOpacity>
                            }
                        />

                        {/* Password strength bar */}
                        {password.length > 0 && (
                            <View style={styles.strengthContainer}>
                                <View style={styles.strengthBars}>
                                    {[1, 2, 3].map((seg) => (
                                        <View
                                            key={seg}
                                            style={[
                                                styles.strengthSeg,
                                                { backgroundColor: pwStrength.level >= seg ? strengthColors[pwStrength.level] : (isDark ? "#334155" : "#E2E8F0") },
                                            ]}
                                        />
                                    ))}
                                </View>
                                {pwStrength.label ? (
                                    <Text style={[styles.strengthLabel, { color: strengthTextColors[pwStrength.level] }]}>
                                        {pwStrength.label}
                                    </Text>
                                ) : null}
                            </View>
                        )}
                        <ErrMsg field="password" />

                        {/* Confirm Password */}
                        <InputField
                            icon={require("@/assets/images/auth/password.png")}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChangeText={(v: string) => { setConfirmPassword(v); clearError("confirmPassword"); }}
                            secureTextEntry={secureConfirmPassword}
                            autoCapitalize="none"
                            hasError={!!errors.confirmPassword}
                            isDark={isDark}
                            colors={colors}
                            rightElement={
                                <TouchableOpacity onPress={() => setSecureConfirmPassword(!secureConfirmPassword)} style={styles.eyeBtn}>
                                    <MaterialCommunityIcons
                                        name={secureConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={isDark ? "#64748B" : "#94A3B8"}
                                    />
                                </TouchableOpacity>
                            }
                        />
                        <ErrMsg field="confirmPassword" />

                        {/* ── Terms Checkbox ────────────────────────────── */}
                        <TouchableOpacity
                            style={[
                                styles.termsCard,
                                {
                                    backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                                    borderColor: acceptedTerms ? "#0D9488" : (isDark ? "#334155" : "#E2E8F0"),
                                    borderWidth: acceptedTerms ? 1.5 : 1,
                                },
                            ]}
                            onPress={() => { setAcceptedTerms(!acceptedTerms); clearError("terms"); }}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.checkbox, { borderColor: isDark ? "#334155" : "#CBD5E1" }, acceptedTerms && styles.checkboxSelected]}>
                                {acceptedTerms && <MaterialCommunityIcons name="check" size={13} color="#FFFFFF" />}
                            </View>
                            <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                                I agree to the{" "}
                                <Text style={styles.termsLink}>Terms & Conditions</Text>
                                {" "}and{" "}
                                <Text style={styles.termsLink}>Privacy Policy</Text>
                            </Text>
                        </TouchableOpacity>
                        <ErrMsg field="terms" />

                        {/* ── Create Account Button ─────────────────────── */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={handleRegister}
                            disabled={loading}
                            style={[styles.btnTouchable, loading && { opacity: 0.65 }]}
                        >
                            <LinearGradient
                                colors={["#0D9488", "#0569A8"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.createBtn}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <View style={styles.btnInner}>
                                        <Text style={styles.btnText}>Create Account</Text>
                                        <View style={styles.arrowCircle}>
                                            <MaterialCommunityIcons name="arrow-right" size={20} color="#0D9488" />
                                        </View>
                                    </View>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Sign In link */}
                        <View style={styles.footerRow}>
                            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Already registered?</Text>
                            <TouchableOpacity onPress={() => router.replace("/doctor/login")} activeOpacity={0.7}>
                                <Text style={styles.footerLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom wave decoration */}
            <Svg width="100%" height={80} style={styles.wave} viewBox="0 0 430 80" preserveAspectRatio="xMidYMax slice">
                <Path d="M0 40 C120 10 280 70 430 35 L430 80 L0 80 Z" fill={isDark ? "#0F766E22" : "#0D948822"} />
                <Path d="M0 55 C150 25 290 75 430 50 L430 80 L0 80 Z" fill={isDark ? "#0F766E44" : "#0D948844"} />
            </Svg>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    container: {
        flex: 1,
    },

    // ── Hero ──────────────────────────────────────────────────────────────
    hero: {
        paddingTop: 16,
        paddingBottom: 32,
        paddingHorizontal: 24,
        overflow: "hidden",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.18)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    heroBlobA: {
        position: "absolute",
        width: 180,
        height: 180,
        borderRadius: 90,
        right: -40,
        top: -40,
    },
    heroBlobB: {
        position: "absolute",
        width: 120,
        height: 120,
        borderRadius: 60,
        right: 60,
        top: 80,
    },
    heroContent: {
        alignItems: "flex-start",
    },
    logoBrand: {
        marginBottom: 12,
    },
    heroTag: {
        fontSize: 12,
        fontWeight: "700",
        color: "rgba(255,255,255,0.7)",
        letterSpacing: 1.5,
        textTransform: "uppercase",
        marginBottom: 6,
    },
    heroHeading: {
        fontSize: 22,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: -0.3,
        marginBottom: 5,
    },
    heroSub: {
        fontSize: 13,
        color: "rgba(255,255,255,0.72)",
        lineHeight: 19,
    },

    // ── Form Card ─────────────────────────────────────────────────────────
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 100,
    },
    formCard: {
        borderRadius: 24,
        padding: 24,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 6,
    },

    // ── Section Headers ───────────────────────────────────────────────────
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 14,
    },
    sectionDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1.2,
    },

    // ── Error Banner ──────────────────────────────────────────────────────
    errorBanner: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 20,
        paddingVertical: 12,
        paddingRight: 14,
    },
    errorAccentBar: {
        width: 4,
        alignSelf: "stretch",
        backgroundColor: "#DC2626",
        borderRadius: 2,
        marginRight: 6,
    },
    errorBannerText: {
        color: "#DC2626",
        fontSize: 13,
        fontWeight: "500",
        flex: 1,
        marginLeft: 8,
    },

    // ── Inputs ────────────────────────────────────────────────────────────
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 14,
        marginBottom: 10,
        shadowOffset: { width: 0, height: 2 },
    },
    inputIconWrap: {
        width: 34,
        alignItems: "center",
    },
    inputIcon: {
        width: 20,
        height: 20,
        resizeMode: "contain",
    },
    input: {
        flex: 1,
        fontSize: 15,
        height: "100%",
        marginLeft: 4,
    },
    eyeBtn: {
        padding: 4,
    },
    fieldErrRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: -4,
        marginBottom: 10,
        marginLeft: 4,
    },
    fieldError: {
        color: "#EF4444",
        fontSize: 12,
        fontWeight: "500",
    },

    // ── Password Strength ─────────────────────────────────────────────────
    strengthContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: -4,
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    strengthBars: {
        flexDirection: "row",
        gap: 4,
        flex: 1,
    },
    strengthSeg: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    strengthLabel: {
        fontSize: 11,
        fontWeight: "700",
        width: 44,
        textAlign: "right",
    },

    // ── Terms Card ────────────────────────────────────────────────────────
    termsCard: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 14,
        padding: 14,
        marginTop: 8,
        marginBottom: 8,
        gap: 12,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 7,
        borderWidth: 1.5,
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
    },
    checkboxSelected: {
        backgroundColor: "#0D9488",
        borderColor: "#0D9488",
    },
    termsText: {
        fontSize: 13,
        flex: 1,
        lineHeight: 19,
    },
    termsLink: {
        color: "#0D9488",
        fontWeight: "700",
    },

    // ── Button ────────────────────────────────────────────────────────────
    btnTouchable: {
        width: "100%",
        marginTop: 12,
        marginBottom: 22,
    },
    createBtn: {
        height: 56,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 12,
        elevation: 7,
    },
    btnInner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    btnText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
    arrowCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },

    // ── Footer ────────────────────────────────────────────────────────────
    footerRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
    },
    footerText: {
        fontSize: 14,
    },
    footerLink: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0D9488",
    },

    // ── Wave ──────────────────────────────────────────────────────────────
    wave: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
});
