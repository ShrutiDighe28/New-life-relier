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

// ── Premium Animated Input ────────────────────────────────────────────────────
function InputField({
    iconName,
    imageIcon,
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
}: {
    iconName?: string;
    imageIcon?: any;
    placeholder: string;
    value: string;
    onChangeText: (v: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: any;
    autoCapitalize?: any;
    autoCorrect?: boolean;
    maxLength?: number;
    rightElement?: React.ReactNode;
    hasError?: boolean;
}) {
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
        outputRange: [hasError ? "#EF4444" : "#E2E8F0", hasError ? "#EF4444" : "#2563EB"],
    });

    return (
        <Animated.View
            style={[
                styles.inputWrapper,
                {
                    borderColor,
                    borderWidth: focused ? 1.5 : 1,
                    shadowColor: focused ? "#2563EB" : "#000",
                    shadowOpacity: focused ? 0.1 : 0.03,
                    shadowRadius: focused ? 12 : 4,
                    elevation: focused ? 5 : 1,
                },
            ]}
        >
            <View style={styles.inputIconWrap}>
                {iconName ? (
                    <MaterialCommunityIcons name={iconName as any} size={20} color={focused ? "#2563EB" : "#94A3B8"} />
                ) : (
                    <Image source={imageIcon} style={[styles.inputIcon, { tintColor: focused ? "#2563EB" : "#94A3B8" }]} />
                )}
            </View>
            <TextInput
                placeholder={placeholder}
                placeholderTextColor="#94A3B8"
                value={value}
                onChangeText={onChangeText}
                style={styles.input}
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

    // Entry animation
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

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

    return (
        <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>

            {/* ── Hero Header ─────────────────────────────────────────── */}
            <LinearGradient
                colors={["#2563EB", "#1E40AF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
            >
                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                    activeOpacity={0.75}
                >
                    <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Decorative blobs */}
                <View style={styles.blobA} />
                <View style={styles.blobB} />

                <View style={styles.heroContent}>
                    <LogoBrand size={36} fontSize={24} centered style={styles.logoBrand} />
                    <Text style={styles.heroTag}>Patient Portal</Text>
                    <Text style={styles.heroHeading}>Create Your Account 🏥</Text>
                    <Text style={styles.heroSub}>Join Life Relier to manage your health securely</Text>
                </View>
            </LinearGradient>

            {/* ── Form ────────────────────────────────────────────────── */}
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View
                        style={[
                            styles.formCard,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        {/* General Error Banner */}
                        {errors.general ? (
                            <View style={styles.errorBanner}>
                                <View style={styles.errorAccentBar} />
                                <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#DC2626" style={{ marginLeft: 10 }} />
                                <Text style={styles.errorBannerText}>{errors.general}</Text>
                            </View>
                        ) : null}

                        {/* ── Section: Personal Info ─────────────────── */}
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionDot, { backgroundColor: "#2563EB" }]} />
                            <Text style={styles.sectionLabel}>PERSONAL INFORMATION</Text>
                        </View>

                        {/* Full Name */}
                        <InputField
                            iconName="account-outline"
                            placeholder="Full Name"
                            value={fullName}
                            onChangeText={(v) => { setFullName(v); clearError("fullName"); }}
                            autoCapitalize="words"
                            hasError={!!errors.fullName}
                        />
                        <ErrMsg field="fullName" />

                        {/* Email */}
                        <InputField
                            imageIcon={require("@/assets/images/auth/email.png")}
                            placeholder="Email Address"
                            value={email}
                            onChangeText={(v) => { setEmail(v); clearError("email"); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            hasError={!!errors.email}
                        />
                        <ErrMsg field="email" />

                        {/* Mobile */}
                        <InputField
                            imageIcon={require("@/assets/images/auth/phone.png")}
                            placeholder="Mobile Number (10 digits)"
                            value={mobile}
                            onChangeText={(v) => { setMobile(v); clearError("mobile"); }}
                            keyboardType="phone-pad"
                            autoCapitalize="none"
                            maxLength={10}
                            hasError={!!errors.mobile}
                        />
                        <ErrMsg field="mobile" />

                        {/* ── Section: Security ─────────────────────── */}
                        <View style={[styles.sectionHeader, { marginTop: 8 }]}>
                            <View style={[styles.sectionDot, { backgroundColor: "#0D9488" }]} />
                            <Text style={styles.sectionLabel}>ACCOUNT SECURITY</Text>
                        </View>

                        {/* Password */}
                        <InputField
                            iconName="lock-outline"
                            placeholder="Password (min 8, 1 Upper, 1 Number)"
                            value={password}
                            onChangeText={(v) => { setPassword(v); clearError("password"); }}
                            secureTextEntry={securePassword}
                            autoCapitalize="none"
                            hasError={!!errors.password}
                            rightElement={
                                <TouchableOpacity onPress={() => setSecurePassword(!securePassword)} style={styles.eyeBtn}>
                                    <MaterialCommunityIcons
                                        name={securePassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color="#94A3B8"
                                    />
                                </TouchableOpacity>
                            }
                        />

                        {/* Password strength */}
                        {password.length > 0 && (
                            <View style={styles.strengthContainer}>
                                <View style={styles.strengthBars}>
                                    {[1, 2, 3].map((seg) => (
                                        <View
                                            key={seg}
                                            style={[
                                                styles.strengthSeg,
                                                { backgroundColor: pwStrength.level >= seg ? strengthColors[pwStrength.level] : "#E2E8F0" },
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
                            iconName="lock-check-outline"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChangeText={(v) => { setConfirmPassword(v); clearError("confirmPassword"); }}
                            secureTextEntry={secureConfirmPassword}
                            autoCapitalize="none"
                            hasError={!!errors.confirmPassword}
                            rightElement={
                                <TouchableOpacity onPress={() => setSecureConfirmPassword(!secureConfirmPassword)} style={styles.eyeBtn}>
                                    <MaterialCommunityIcons
                                        name={secureConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color="#94A3B8"
                                    />
                                </TouchableOpacity>
                            }
                        />
                        <ErrMsg field="confirmPassword" />

                        {/* Terms Checkbox Card */}
                        <TouchableOpacity
                            style={[
                                styles.termsCard,
                                { borderColor: acceptedTerms ? "#2563EB" : "#E2E8F0", borderWidth: acceptedTerms ? 1.5 : 1 },
                            ]}
                            onPress={() => { setAcceptedTerms(!acceptedTerms); clearError("terms"); }}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.checkbox, acceptedTerms && styles.checkboxSelected]}>
                                {acceptedTerms && <MaterialCommunityIcons name="check" size={13} color="#FFFFFF" />}
                            </View>
                            <Text style={styles.termsText}>
                                I agree to the{" "}
                                <Text style={styles.termsLink}>Terms & Conditions</Text>
                                {" "}and{" "}
                                <Text style={styles.termsLink}>Privacy Policy</Text>
                            </Text>
                        </TouchableOpacity>
                        <ErrMsg field="terms" />

                        {/* Create Account Button */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={handleRegister}
                            disabled={loading}
                            style={[styles.btnTouchable, loading && { opacity: 0.65 }]}
                        >
                            <LinearGradient
                                colors={["#2563EB", "#1E40AF"]}
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
                                            <MaterialCommunityIcons name="arrow-right" size={20} color="#2563EB" />
                                        </View>
                                    </View>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Already have account */}
                        <View style={styles.footerRow}>
                            <Text style={styles.footerText}>Already have an account?</Text>
                            <TouchableOpacity onPress={() => router.replace("/login")} activeOpacity={0.7}>
                                <Text style={styles.footerLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Divider */}
                        <View style={styles.dividerRow}>
                            <View style={styles.divLine} />
                            <Text style={styles.divText}>OR</Text>
                            <View style={styles.divLine} />
                        </View>

                        {/* Google */}
                        <TouchableOpacity style={styles.googleBtn} activeOpacity={0.9}>
                            <Image source={require("@/assets/images/auth/google.png")} style={styles.googleIcon} />
                            <Text style={styles.googleText}>Continue with Google</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom wave */}
            <Svg width="100%" height={80} style={styles.wave} viewBox="0 0 430 80" preserveAspectRatio="xMidYMax slice">
                <Path d="M0 40 C120 10 280 70 430 35 L430 80 L0 80 Z" fill="#2563EB22" />
                <Path d="M0 55 C150 25 290 75 430 50 L430 80 L0 80 Z" fill="#2563EB44" />
            </Svg>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    root: {
        flex: 1,
        backgroundColor: "#EFF6FF",
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
    blobA: {
        position: "absolute",
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: "rgba(255,255,255,0.07)",
        right: -50,
        top: -50,
    },
    blobB: {
        position: "absolute",
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: "rgba(255,255,255,0.05)",
        right: 70,
        top: 90,
    },
    heroContent: {
        alignItems: "flex-start",
    },
    logoBrand: {
        marginBottom: 12,
    },
    heroTag: {
        fontSize: 11,
        fontWeight: "700",
        color: "rgba(255,255,255,0.7)",
        letterSpacing: 1.6,
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
        backgroundColor: "#FFFFFF",
        padding: 24,
        shadowColor: "#2563EB",
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
        color: "#94A3B8",
    },

    // ── Error Banner ──────────────────────────────────────────────────────
    errorBanner: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 14,
        backgroundColor: "#FEF2F2",
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
        backgroundColor: "#F8FAFC",
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
        color: "#071739",
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
        backgroundColor: "#F8FAFC",
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
        borderColor: "#CBD5E1",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
    },
    checkboxSelected: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
    termsText: {
        fontSize: 13,
        color: "#64748B",
        flex: 1,
        lineHeight: 19,
    },
    termsLink: {
        color: "#2563EB",
        fontWeight: "700",
    },

    // ── Button ────────────────────────────────────────────────────────────
    btnTouchable: {
        width: "100%",
        marginTop: 12,
        marginBottom: 20,
    },
    createBtn: {
        height: 56,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#2563EB",
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

    // ── Footer / Divider / Google ─────────────────────────────────────────
    footerRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        marginBottom: 22,
    },
    footerText: {
        fontSize: 14,
        color: "#64748B",
    },
    footerLink: {
        fontSize: 14,
        fontWeight: "700",
        color: "#2563EB",
    },
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
    },
    divLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#E2E8F0",
    },
    divText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#94A3B8",
    },
    googleBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        gap: 10,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    googleIcon: {
        width: 20,
        height: 20,
        resizeMode: "contain",
    },
    googleText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#071739",
    },

    // ── Success State ─────────────────────────────────────────────────────
    successContainer: {
        alignItems: "center",
        padding: 40,
    },
    successTitle: {
        fontSize: 26,
        fontWeight: "800",
        color: "#071739",
        marginTop: 16,
    },
    successDesc: {
        fontSize: 15,
        color: "#64748B",
        marginTop: 8,
    },

    // ── Wave ──────────────────────────────────────────────────────────────
    wave: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: -1,
    },
});