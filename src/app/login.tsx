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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Svg, { Path } from "react-native-svg";
import LogoBrand from "@/components/LogoBrand";
import { useAuth } from "@/context/AuthContext";

// ── Premium Animated Input ────────────────────────────────────────────────────
function InputField({
    iconName,
    placeholder,
    value,
    onChangeText,
    secureTextEntry,
    keyboardType,
    autoCapitalize,
    autoCorrect,
    rightElement,
    hasError,
}: {
    iconName: string;
    placeholder: string;
    value: string;
    onChangeText: (v: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: any;
    autoCapitalize?: any;
    autoCorrect?: boolean;
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
                    shadowOpacity: focused ? 0.1 : 0.04,
                    shadowRadius: focused ? 12 : 4,
                    elevation: focused ? 5 : 1,
                },
            ]}
        >
            <View style={styles.inputIconWrap}>
                <MaterialCommunityIcons
                    name={iconName as any}
                    size={22}
                    color={focused ? "#2563EB" : "#94A3B8"}
                />
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
                onFocus={handleFocus}
                onBlur={handleBlur}
            />
            {rightElement}
        </Animated.View>
    );
}

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [secureText, setSecureText] = useState(true);
    const [loading, setLoading] = useState(false);

    // Error states
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [authError, setAuthError] = useState("");

    // Entry animation
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    const validateFields = (): boolean => {
        let valid = true;
        setUsernameError("");
        setPasswordError("");
        setAuthError("");

        const trimmed = username.trim();
        if (!trimmed) {
            setUsernameError("Username is required.");
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
            const success = await login(username.trim(), password);
            if (success) {
                router.replace("/(tabs)/home");
            }
        } catch (err: any) {
            setAuthError(err?.message || "Invalid username or password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const isFormFilled = username.trim().length > 0 && password.length > 0;

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>

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

                {/* Hero content */}
                <View style={styles.heroContent}>
                    <LogoBrand size={38} fontSize={26} centered style={styles.logoBrand} />
                    <Text style={styles.heroTag}>Patient Portal</Text>
                    <Text style={styles.heroHeading}>Welcome Back! 👋</Text>
                    <Text style={styles.heroSub}>Sign in to continue your healthcare journey</Text>
                </View>
            </LinearGradient>

            {/* ── Form Card ───────────────────────────────────────────── */}
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={0}
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
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        {/* Auth Error Banner */}
                        {authError ? (
                            <View style={styles.errorBanner}>
                                <View style={styles.errorAccentBar} />
                                <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#DC2626" style={{ marginLeft: 10 }} />
                                <Text style={styles.errorBannerText}>{authError}</Text>
                            </View>
                        ) : null}

                        {/* Section label */}
                        <Text style={styles.sectionLabel}>SIGN IN CREDENTIALS</Text>

                        {/* Username */}
                        <InputField
                            iconName="account-outline"
                            placeholder="Username"
                            value={username}
                            onChangeText={(v) => { setUsername(v); setUsernameError(""); setAuthError(""); }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            hasError={!!usernameError}
                        />
                        {usernameError ? (
                            <View style={styles.fieldErrRow}>
                                <MaterialCommunityIcons name="information-outline" size={13} color="#EF4444" />
                                <Text style={styles.fieldError}>{usernameError}</Text>
                            </View>
                        ) : null}

                        {/* Password */}
                        <InputField
                            iconName="lock-outline"
                            placeholder="Password"
                            value={password}
                            onChangeText={(v) => { setPassword(v); setPasswordError(""); setAuthError(""); }}
                            secureTextEntry={secureText}
                            hasError={!!passwordError}
                            rightElement={
                                <TouchableOpacity
                                    onPress={() => setSecureText(!secureText)}
                                    style={styles.eyeBtn}
                                >
                                    <MaterialCommunityIcons
                                        name={secureText ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color="#94A3B8"
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
                            <TouchableOpacity
                                style={styles.rememberContainer}
                                onPress={() => setRememberMe(!rememberMe)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.checkbox, rememberMe && styles.checkboxSelected]}>
                                    {rememberMe && <MaterialCommunityIcons name="check" size={13} color="#FFFFFF" />}
                                </View>
                                <Text style={styles.rememberText}>Remember Me</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push("/forgot-password")} activeOpacity={0.7}>
                                <Text style={styles.forgotText}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Sign In Button */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={handleLogin}
                            style={[styles.btnTouchable, (!isFormFilled || loading) && { opacity: 0.65 }]}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={isFormFilled ? ["#2563EB", "#1E40AF"] : ["#94A3B8", "#94A3B8"]}
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
                                                color={isFormFilled ? "#2563EB" : "#94A3B8"}
                                            />
                                        </View>
                                    </View>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Create Account row */}
                        <View style={styles.footerRow}>
                            <Text style={styles.footerText}>Don't have an account?</Text>
                            <TouchableOpacity onPress={() => router.push("/register")} activeOpacity={0.7}>
                                <Text style={styles.footerLink}>Create Account</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Divider */}
                        <View style={styles.dividerRow}>
                            <View style={styles.divLine} />
                            <Text style={styles.divText}>OR</Text>
                            <View style={styles.divLine} />
                        </View>

                        {/* Google */}
                        <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
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
    container: {
        flex: 1,
        backgroundColor: "#EFF6FF",
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
        marginBottom: 14,
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
        fontSize: 26,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: -0.5,
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
        backgroundColor: "#FFFFFF",
        padding: 24,
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 6,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1.2,
        color: "#94A3B8",
        marginBottom: 14,
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
        borderColor: "#CBD5E1",
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxSelected: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
    rememberText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#334155",
    },
    forgotText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#2563EB",
    },

    // ── Button ────────────────────────────────────────────────────────────
    btnTouchable: {
        width: "100%",
        marginBottom: 20,
    },
    signInBtn: {
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

    // ── Wave ──────────────────────────────────────────────────────────────
    wave: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: -1,
    },
});