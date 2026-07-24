import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    ActivityIndicator,
    Animated,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Svg, { Path } from "react-native-svg";
import LogoBrand from "@/components/LogoBrand";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/utils/themeManager";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// ── Premium Input Field Component ────────────────────────────────────────────
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

export default function DoctorLoginScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const { colors, isDark } = useTheme();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [secureText, setSecureText] = useState(true);
    const [loading, setLoading] = useState(false);

    // Errors
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [authError, setAuthError] = useState("");

    // Entry animation
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(28)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 520, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 520, useNativeDriver: true }),
        ]).start();
    }, []);

    const validateFields = (): boolean => {
        let valid = true;
        setEmailError("");
        setPasswordError("");
        setAuthError("");

        const trimmed = email.trim();
        if (!trimmed) {
            setEmailError("Email address is required.");
            valid = false;
        } else if (!isValidEmail(trimmed)) {
            setEmailError("Please enter a valid email address.");
            valid = false;
        }

        if (!password) {
            setPasswordError("Password is required.");
            valid = false;
        }

        return valid;
    };

    const handleLogin = async () => {
        if (!validateFields()) return;
        setLoading(true);
        try {
            const success = await login(email.trim().toLowerCase(), password);
            if (success) {
                router.replace("/doctor/(tabs)/dashboard");
            } else {
                setAuthError("Invalid doctor credentials. Please check your email and password.");
            }
        } catch (err: any) {
            setAuthError(err?.message || "Invalid doctor credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const isFormFilled = email.trim().length > 0 && password.length > 0;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0F172A" : "#F0FDFA" }]} edges={["top", "left", "right"]}>

            {/* ── Hero Header ─────────────────────────────────────────── */}
            <LinearGradient
                colors={isDark ? ["#0F766E", "#134E4A"] : ["#0D9488", "#0A7870"]}
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
                    <LogoBrand size={38} fontSize={26} centered style={styles.logoBrand} />
                    <Text style={styles.heroTag}>Doctor Portal</Text>
                    <Text style={styles.heroHeading}>Welcome Back, Doctor 👨‍⚕️</Text>
                    <Text style={styles.heroSub}>Sign in to manage appointments & patient care</Text>
                </View>
            </LinearGradient>

            {/* ── Form Card ───────────────────────────────────────────── */}
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
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
                        {/* Auth Error Banner */}
                        {authError ? (
                            <View style={[styles.errorBanner, { backgroundColor: isDark ? "#450A0A" : "#FEF2F2" }]}>
                                <View style={styles.errorAccentBar} />
                                <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#DC2626" style={{ marginLeft: 10 }} />
                                <Text style={styles.errorBannerText}>{authError}</Text>
                            </View>
                        ) : null}

                        {/* Section label */}
                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>CREDENTIALS</Text>

                        {/* Email Input */}
                        <InputField
                            icon={require("@/assets/images/auth/email.png")}
                            placeholder="Doctor Email Address"
                            value={email}
                            onChangeText={(v: string) => { setEmail(v); setEmailError(""); setAuthError(""); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            hasError={!!emailError}
                            isDark={isDark}
                            colors={colors}
                        />
                        {emailError ? (
                            <View style={styles.fieldErrRow}>
                                <MaterialCommunityIcons name="information-outline" size={13} color="#EF4444" />
                                <Text style={styles.fieldError}>{emailError}</Text>
                            </View>
                        ) : null}

                        {/* Password Input */}
                        <InputField
                            icon={require("@/assets/images/auth/password.png")}
                            placeholder="Password"
                            value={password}
                            onChangeText={(v: string) => { setPassword(v); setPasswordError(""); setAuthError(""); }}
                            secureTextEntry={secureText}
                            hasError={!!passwordError}
                            isDark={isDark}
                            colors={colors}
                            rightElement={
                                <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeBtn}>
                                    <MaterialCommunityIcons
                                        name={secureText ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={isDark ? "#64748B" : "#94A3B8"}
                                    />
                                </TouchableOpacity>
                            }
                        />
                        {passwordError ? (
                            <View style={styles.fieldErrRow}>
                                <MaterialCommunityIcons name="information-outline" size={13} color="#EF4444" />
                                <Text style={styles.fieldError}>{passwordError}</Text>
                            </View>
                        ) : null}

                        {/* Remember Me + Forgot Password */}
                        <View style={styles.optionsRow}>
                            <TouchableOpacity style={styles.rememberContainer} onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.7}>
                                <View style={[styles.checkbox, { borderColor: isDark ? "#334155" : "#CBD5E1" }, rememberMe && styles.checkboxSelected]}>
                                    {rememberMe && <MaterialCommunityIcons name="check" size={13} color="#FFFFFF" />}
                                </View>
                                <Text style={[styles.rememberText, { color: colors.textSecondary }]}>Remember Me</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push("/forgot-password")} activeOpacity={0.7}>
                                <Text style={styles.forgotText}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Sign In Button */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={handleLogin}
                            disabled={loading}
                            style={[styles.btnTouchable, (!isFormFilled || loading) && { opacity: 0.65 }]}
                        >
                            <LinearGradient
                                colors={isFormFilled ? ["#0D9488", "#0569A8"] : ["#94A3B8", "#94A3B8"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.signInBtn}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <View style={styles.btnInner}>
                                        <Text style={styles.btnText}>Sign In</Text>
                                        <View style={styles.arrowCircle}>
                                            <MaterialCommunityIcons
                                                name="arrow-right"
                                                size={20}
                                                color={isFormFilled ? "#0D9488" : "#94A3B8"}
                                            />
                                        </View>
                                    </View>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerRow}>
                            <View style={[styles.divLine, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]} />
                            <Text style={[styles.divText, { color: colors.textSecondary }]}>OR</Text>
                            <View style={[styles.divLine, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]} />
                        </View>

                        {/* Google */}
                        <TouchableOpacity
                            style={[styles.googleBtn, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                            activeOpacity={0.8}
                        >
                            <Image source={require("@/assets/images/auth/google.png")} style={styles.googleIcon} />
                            <Text style={[styles.googleText, { color: colors.text }]}>Continue with Google</Text>
                        </TouchableOpacity>

                        {/* Register link */}
                        <View style={styles.footerRow}>
                            <Text style={[styles.footerText, { color: colors.textSecondary }]}>New doctor?</Text>
                            <TouchableOpacity onPress={() => router.push("/doctor/register")} activeOpacity={0.7}>
                                <Text style={styles.footerLink}>Register here</Text>
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
        paddingBottom: 36,
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
        marginBottom: 14,
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
        fontSize: 26,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: -0.4,
        marginBottom: 6,
    },
    heroSub: {
        fontSize: 14,
        color: "rgba(255,255,255,0.72)",
        lineHeight: 20,
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
    sectionLabel: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1.2,
        marginBottom: 14,
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

    // ── Options Row ───────────────────────────────────────────────────────
    optionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
        marginBottom: 24,
    },
    rememberContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1.5,
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxSelected: {
        backgroundColor: "#0D9488",
        borderColor: "#0D9488",
    },
    rememberText: {
        fontSize: 13,
        fontWeight: "500",
    },
    forgotText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#0D9488",
    },

    // ── Button ────────────────────────────────────────────────────────────
    btnTouchable: {
        width: "100%",
        marginBottom: 22,
    },
    signInBtn: {
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

    // ── Divider / Google / Footer ─────────────────────────────────────────
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        gap: 10,
    },
    divLine: {
        flex: 1,
        height: 1,
    },
    divText: {
        fontSize: 12,
        fontWeight: "600",
    },
    googleBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        gap: 10,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
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
    },
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