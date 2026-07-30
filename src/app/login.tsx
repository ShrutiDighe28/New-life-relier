import LogoBrand from "@/components/LogoBrand";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/utils/themeManager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
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

// ── Animated Input Field ──────────────────────────────────────────────────────
function InputField({
    icon,
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry,
    keyboardType,
    autoCapitalize,
    autoCorrect,
    rightElement,
    hasError,
    colors,
    isDark,
}: {
    icon: string;
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (v: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: any;
    autoCapitalize?: any;
    autoCorrect?: boolean;
    rightElement?: React.ReactNode;
    hasError?: boolean;
    colors: any;
    isDark: boolean;
}) {
    const [focused, setFocused] = useState(false);
    const anim = useRef(new Animated.Value(0)).current;

    const onFocus = () => {
        setFocused(true);
        Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: false }).start();
    };
    const onBlur = () => {
        setFocused(false);
        Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: false }).start();
    };

    const borderColor = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [
            hasError ? "#EF4444" : (isDark ? "#334155" : "#E2E8F0"),
            hasError ? "#EF4444" : colors.primary,
        ],
    });

    return (
        <View style={{ marginBottom: 14 }}>
            <Text style={[st.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
            <Animated.View
                style={[
                    st.inputWrap,
                    {
                        backgroundColor: isDark ? colors.inputBg : "#F8FAFC",
                        borderColor,
                        borderWidth: focused ? 1.5 : 1,
                        shadowColor: focused ? "#059669" : "#000",
                        shadowOpacity: focused ? 0.08 : 0.02,
                        shadowRadius: focused ? 10 : 4,
                        elevation: focused ? 4 : 1,
                    },
                ]}
            >
                <MaterialCommunityIcons
                    name={icon as any}
                    size={20}
                    color={focused ? "#059669" : "#94A3B8"}
                    style={{ marginRight: 10 }}
                />
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                    value={value}
                    onChangeText={onChangeText}
                    style={[st.inputText, { color: colors.text }]}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType ?? "default"}
                    autoCapitalize={autoCapitalize ?? "sentences"}
                    autoCorrect={autoCorrect ?? false}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
                {rightElement}
            </Animated.View>
        </View>
    );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function PatientLoginScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const { colors, isDark } = useTheme();

    const [username, setUsername]       = useState("");
    const [password, setPassword]       = useState("");
    const [rememberMe, setRememberMe]   = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading]         = useState(false);

    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [authError, setAuthError]         = useState("");

    const fadeAnim  = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(28)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    const validate = (): boolean => {
        let valid = true;
        setUsernameError(""); setPasswordError(""); setAuthError("");
        if (!username.trim()) { setUsernameError("Email or mobile number is required."); valid = false; }
        if (!password)        { setPasswordError("Password is required."); valid = false; }
        return valid;
    };

    const handleLogin = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const ok = await login(username.trim(), password);
            if (ok) router.replace("/(tabs)/home");
            else setAuthError("Invalid credentials. Please check your email and password.");
        } catch (err: any) {
            setAuthError(err?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const isFormFilled = username.trim().length > 0 && password.length > 0;

    const HERO_GRAD: [string, string] = isDark
        ? ["#0F172A", "#1E3A8A"]
        : ["#1E40AF", "#2563EB"];
    const BG_COLOR = isDark ? "#0F172A" : "#F0F6FF";

    return (
        <SafeAreaView style={[st.container, { backgroundColor: BG_COLOR }]} edges={["top", "left", "right"]}>

            {/* ── HERO HEADER ─────────────────────────────────────────── */}
            <LinearGradient colors={HERO_GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.hero}>
                {/* Decorative blobs */}
                <View style={st.blobA} />
                <View style={st.blobB} />

                {/* Top nav row */}
                <View style={st.topRow}>
                    <TouchableOpacity style={st.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
                        <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={st.roleSwitchBtn}
                        onPress={() => router.replace("/doctor/login")}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="account-sync" size={16} color="#BFDBFE" />
                        <Text style={st.roleSwitchText}>Doctor Login</Text>
                    </TouchableOpacity>
                </View>

                {/* Logo + badge + title */}
                <View style={st.heroContent}>
                    {/* Logo — no container, blends with gradient */}
                    <LogoBrand size={40} fontSize={26} variant="light" style={{ marginBottom: 14 }} />
                    <View style={st.portalBadge}>
                        <MaterialCommunityIcons name="account-heart-outline" size={13} color="#BFDBFE" />
                        <Text style={st.portalBadgeText}>Patient Portal</Text>
                    </View>
                    <Text style={st.heroHeading}>Welcome Back 👋</Text>
                    <Text style={st.heroSub}>Sign in to continue your healthcare journey</Text>
                </View>
            </LinearGradient>

            {/* ── FORM ────────────────────────────────────────────────── */}
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView
                    contentContainerStyle={st.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View
                        style={[
                            st.card,
                            {
                                backgroundColor: isDark ? colors.card : "#FFFFFF",
                                borderColor: isDark ? colors.cardBorder : "#E8EFF5",
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        {/* Auth error banner */}
                        {authError ? (
                            <View style={st.errorBanner}>
                                <View style={st.errorAccent} />
                                <MaterialCommunityIcons name="alert-circle-outline" size={17} color="#DC2626" style={{ marginLeft: 10 }} />
                                <Text style={st.errorBannerText}>{authError}</Text>
                            </View>
                        ) : null}

                        <Text style={[st.cardTitle, { color: colors.text }]}>Sign In to Dashboard</Text>

                        {/* ── Email / Mobile ── */}
                        <InputField
                            icon="account-outline"
                            label="Username / Mobile / Email"
                            placeholder="e.g. username, 9876543210 or email@domain.com"
                            value={username}
                            onChangeText={(v) => { setUsername(v); setUsernameError(""); setAuthError(""); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            hasError={!!usernameError}
                            colors={colors}
                            isDark={isDark}
                        />
                        {usernameError ? (
                            <View style={st.errRow}>
                                <MaterialCommunityIcons name="information-outline" size={13} color="#EF4444" />
                                <Text style={st.errText}>{usernameError}</Text>
                            </View>
                        ) : null}

                        {/* ── Password ── */}
                        <InputField
                            icon="lock-outline"
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={(v) => { setPassword(v); setPasswordError(""); setAuthError(""); }}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            hasError={!!passwordError}
                            colors={colors}
                            isDark={isDark}
                            rightElement={
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                                    <MaterialCommunityIcons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color="#94A3B8"
                                    />
                                </TouchableOpacity>
                            }
                        />
                        {passwordError ? (
                            <View style={st.errRow}>
                                <MaterialCommunityIcons name="information-outline" size={13} color="#EF4444" />
                                <Text style={st.errText}>{passwordError}</Text>
                            </View>
                        ) : null}

                        {/* ── Remember Me + Forgot ── */}
                        <View style={st.optionsRow}>
                            <TouchableOpacity style={st.rememberRow} onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.7}>
                                <View style={[st.checkbox, rememberMe && { backgroundColor: "#2563EB", borderColor: "#2563EB" }]}>
                                    {rememberMe && <MaterialCommunityIcons name="check" size={12} color="#FFF" />}
                                </View>
                                <Text style={[st.rememberText, { color: colors.textSecondary }]}>Remember Me</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push("/forgot-password" as any)} activeOpacity={0.7}>
                                <Text style={[st.forgotText, { color: "#2563EB" }]}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>

                        {/* ── Sign In Button ── */}
                        <TouchableOpacity
                            activeOpacity={0.88}
                            onPress={handleLogin}
                            disabled={loading}
                            style={[st.loginBtnWrap, (!isFormFilled || loading) && { opacity: 0.65 }]}
                        >
                            <LinearGradient
                                colors={isFormFilled ? ["#2563EB", "#1D4ED8"] : ["#94A3B8", "#94A3B8"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={st.loginGrad}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <>
                                        <Text style={st.loginBtnText}>Sign In</Text>
                                        <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* ── Security badge ── */}
                        <View style={st.securityBadge}>
                            <MaterialCommunityIcons name="shield-check" size={15} color={colors.success} />
                            <Text style={[st.securityText, { color: colors.textSecondary }]}>
                                HIPAA-compliant 256-bit encrypted session
                            </Text>
                        </View>

                        {/* ── Create account link ── */}
                        <View style={st.footerRow}>
                            <Text style={[st.footerText, { color: colors.textSecondary }]}>Don't have an account?</Text>
                            <TouchableOpacity onPress={() => router.push("/register")} activeOpacity={0.7}>
                                <Text style={st.footerLink}>Create Account</Text>
                            </TouchableOpacity>
                        </View>

                        {/* ── Divider ── */}
                        <View style={st.dividerRow}>
                            <View style={[st.divLine, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]} />
                            <Text style={[st.divText, { color: colors.textMuted }]}>OR</Text>
                            <View style={[st.divLine, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]} />
                        </View>

                        {/* ── Google ── */}
                        <TouchableOpacity
                            style={[
                                st.googleBtn,
                                { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" },
                            ]}
                            activeOpacity={0.8}
                        >
                            <Image source={require("@/assets/images/auth/google.png")} style={st.googleIcon} />
                            <Text style={[st.googleText, { color: colors.text }]}>Continue with Google</Text>
                        </TouchableOpacity>

                        {/* ── UI Preview Bypass (Temporary) ── */}
                        <TouchableOpacity
                            style={{
                                marginTop: 15,
                                padding: 12,
                                backgroundColor: "#FEF2F2",
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: "#FCA5A5",
                                alignItems: "center",
                            }}
                            activeOpacity={0.8}
                            onPress={() => router.replace("/(tabs)/home")}
                        >
                            <Text style={{ color: "#EF4444", fontWeight: "bold" }}>UI Preview Mode (Bypass API)</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const st = StyleSheet.create({
    container: { flex: 1 },

    // ── Hero ──────────────────────────────────────────────────────────────
    hero: {
        paddingTop: 14,
        paddingBottom: 32,
        paddingHorizontal: 22,
        overflow: "hidden",
    },
    blobA: {
        position: "absolute",
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: "rgba(255,255,255,0.07)",
        right: -55,
        top: -55,
    },
    blobB: {
        position: "absolute",
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: "rgba(255,255,255,0.04)",
        right: 60,
        top: 90,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.18)",
        justifyContent: "center",
        alignItems: "center",
    },
    roleSwitchBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(255,255,255,0.15)",
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
    },
    roleSwitchText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#BFDBFE",
        letterSpacing: 0.2,
    },
    heroContent: { alignItems: "flex-start" },
    portalBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "rgba(255,255,255,0.15)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        marginBottom: 10,
    },
    portalBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#BFDBFE",
        letterSpacing: 1.0,
        textTransform: "uppercase",
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
    scroll: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 48,
    },
    card: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 22,
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.07,
        shadowRadius: 20,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 20,
        letterSpacing: -0.3,
    },

    // ── Error banner ──────────────────────────────────────────────────────
    errorBanner: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        backgroundColor: "#FEF2F2",
        overflow: "hidden",
        marginBottom: 18,
        paddingVertical: 12,
        paddingRight: 14,
    },
    errorAccent: {
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

    // ── Input ─────────────────────────────────────────────────────────────
    fieldLabel: {
        fontSize: 12,
        fontWeight: "700",
        marginBottom: 6,
        letterSpacing: 0.1,
    },
    inputWrap: {
        flexDirection: "row",
        alignItems: "center",
        height: 50,
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 14,
        shadowOffset: { width: 0, height: 2 },
    },
    inputText: {
        flex: 1,
        fontSize: 14,
        fontWeight: "500",
        height: "100%",
    },
    errRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: -8,
        marginBottom: 10,
        marginLeft: 2,
    },
    errText: { color: "#EF4444", fontSize: 12, fontWeight: "500" },

    // ── Options ───────────────────────────────────────────────────────────
    optionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
        marginBottom: 22,
    },
    rememberRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: "#CBD5E1",
        justifyContent: "center",
        alignItems: "center",
    },
    rememberText: { fontSize: 13, fontWeight: "500" },
    forgotText: { fontSize: 13, fontWeight: "700", color: "#2563EB" },

    // ── Sign In Button ────────────────────────────────────────────────────
    loginBtnWrap: { borderRadius: 16, overflow: "hidden", marginBottom: 16 },
    loginGrad: {
        height: 52,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
    },
    loginBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },

    // ── Security badge ────────────────────────────────────────────────────
    securityBadge: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        marginBottom: 20,
    },
    securityText: { fontSize: 11, fontWeight: "500" },

    // ── Footer ────────────────────────────────────────────────────────────
    footerRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 5,
        marginBottom: 20,
    },
    footerText: { fontSize: 14 },
    footerLink: { fontSize: 14, fontWeight: "700", color: "#2563EB" },

    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
    },
    divLine: { flex: 1, height: 1 },
    divText: { fontSize: 12, fontWeight: "600" },

    googleBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 50,
        borderRadius: 14,
        borderWidth: 1,
        gap: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    googleIcon: { width: 20, height: 20, resizeMode: "contain" },
    googleText: { fontSize: 14, fontWeight: "600" },
});
