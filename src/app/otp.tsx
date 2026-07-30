import LogoBrand from "@/components/LogoBrand";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/utils/themeManager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator, Animated, KeyboardAvoidingView,
    Platform, ScrollView, StyleSheet,
    Text, TextInput, TouchableOpacity, View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

export default function OtpScreen() {
    const router = useRouter();
    const { pendingUser, verifyOtp, requestOtp } = useAuth();
    const { colors, isDark } = useTheme();

    const [otp, setOtp]           = useState(["", "", "", "", "", ""]);
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading]   = useState(false);
    const [seconds, setSeconds]   = useState(30);

    const inputs = useRef<TextInput[]>([]);
    const fadeAnim  = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    useEffect(() => {
        if (seconds === 0) return;
        const t = setInterval(() => setSeconds(s => s - 1), 1000);
        return () => clearInterval(t);
    }, [seconds]);

    const handleChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) inputs.current[index + 1]?.focus();
    };

    const handleBackspace = (value: string, index: number) => {
        if (!value && index > 0) inputs.current[index - 1]?.focus();
    };

    const handleVerify = async () => {
        setErrorMsg("");
        const code = otp.join("");
        if (code.length < 6) {
            setErrorMsg("Please enter the complete 6-digit OTP.");
            return;
        }
        if (!pendingUser) {
            setErrorMsg("Session expired. Please restart registration.");
            setTimeout(() => router.replace("/register"), 1500);
            return;
        }
        setLoading(true);
        const success = await verifyOtp(pendingUser.email.toLowerCase(), code);
        setLoading(false);
        if (success) {
            const isDoctor = (pendingUser as any)?.role === "doctor" || (pendingUser as any)?.userType === "doctor";
            router.replace(isDoctor ? "/doctor/create-profile" : "/create-profile");
        } else {
            setErrorMsg("Invalid or expired OTP. Check your inbox and try again.");
        }
    };

    const handleResend = async () => {
        setErrorMsg("");
        if (!pendingUser) {
            setErrorMsg("Session expired. Please restart registration.");
            setTimeout(() => router.replace("/register"), 1500);
            return;
        }
        setLoading(true);
        try {
            await requestOtp(pendingUser.email.toLowerCase(), pendingUser);
            setSeconds(30);
            setOtp(["", "", "", "", "", ""]);
        } catch {
            setErrorMsg("Failed to resend OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const isComplete = otp.every(d => d !== "");
    const HERO_GRAD: [string, string] = isDark ? ["#1E3A8A", "#1D4ED8"] : ["#2563EB", "#1E40AF"];

    return (
        <SafeAreaView style={[st.root, { backgroundColor: isDark ? "#0F172A" : "#EFF6FF" }]} edges={["top", "left", "right"]}>

            {/* ── HERO HEADER ── */}
            <LinearGradient colors={HERO_GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.hero}>
                <View style={st.blobA} />
                <View style={st.blobB} />

                {/* Back */}
                <TouchableOpacity style={st.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color="#FFF" />
                </TouchableOpacity>

                {/* Logo + badge + title */}
                <LogoBrand size={38} fontSize={24} style={{ marginBottom: 12 }} />
                <View style={st.portalBadge}>
                    <MaterialCommunityIcons name="account-heart-outline" size={13} color="#BFDBFE" />
                    <Text style={st.portalBadgeText}>Patient Portal</Text>
                </View>
                <Text style={st.heroTitle}>OTP Verification 🔐</Text>
                <Text style={st.heroSub}>
                    {pendingUser
                        ? `A 6-digit code was sent to ${pendingUser.email}`
                        : "Enter the 6-digit code sent to your registered contact"}
                </Text>
            </LinearGradient>

            {/* ── FORM CARD ── */}
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
                        {/* Channel chips */}
                        {pendingUser && (
                            <View style={st.channelRow}>
                                <View style={[st.channelChip, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                                    <MaterialCommunityIcons name="email-outline" size={14} color="#2563EB" />
                                    <Text style={[st.channelText, { color: isDark ? "#93C5FD" : "#1E40AF" }]} numberOfLines={1}>
                                        {pendingUser.email}
                                    </Text>
                                </View>
                                {pendingUser.mobile ? (
                                    <View style={[st.channelChip, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                                        <MaterialCommunityIcons name="phone-outline" size={14} color="#2563EB" />
                                        <Text style={[st.channelText, { color: isDark ? "#93C5FD" : "#1E40AF" }]}>
                                            +91 {pendingUser.mobile}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        )}

                        {/* Error banner */}
                        {errorMsg ? (
                            <View style={st.errorBanner}>
                                <View style={st.errorAccent} />
                                <MaterialCommunityIcons name="alert-circle-outline" size={17} color="#DC2626" style={{ marginLeft: 10 }} />
                                <Text style={st.errorBannerText}>{errorMsg}</Text>
                            </View>
                        ) : null}

                        {/* Section label */}
                        <View style={st.sectionHeader}>
                            <View style={[st.sectionDot, { backgroundColor: "#2563EB" }]} />
                            <Text style={[st.sectionLabel, { color: colors.textSecondary }]}>ENTER VERIFICATION CODE</Text>
                        </View>

                        {/* OTP boxes */}
                        <View style={st.otpRow}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={ref => { if (ref) inputs.current[index] = ref; }}
                                    style={[
                                        st.otpBox,
                                        {
                                            backgroundColor: isDark ? colors.inputBg : "#F8FAFC",
                                            borderColor: digit
                                                ? "#2563EB"
                                                : (isDark ? "#334155" : "#E2E8F0"),
                                            color: colors.text,
                                            shadowColor: digit ? "#2563EB" : "#000",
                                            shadowOpacity: digit ? 0.15 : 0.04,
                                        },
                                    ]}
                                    value={digit}
                                    onChangeText={v => handleChange(v, index)}
                                    onKeyPress={({ nativeEvent }) => {
                                        if (nativeEvent.key === "Backspace") handleBackspace(digit, index);
                                    }}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    textAlign="center"
                                    selectionColor="#2563EB"
                                />
                            ))}
                        </View>

                        {/* Timer + resend */}
                        <View style={st.resendRow}>
                            <Text style={[st.timerText, { color: colors.textSecondary }]}>
                                {seconds > 0
                                    ? `Resend OTP in 00:${seconds.toString().padStart(2, "0")}`
                                    : "Didn't receive the code?"}
                            </Text>
                            <TouchableOpacity disabled={seconds > 0 || loading} onPress={handleResend} activeOpacity={0.7}>
                                <Text style={[st.resendText, { opacity: seconds > 0 ? 0.4 : 1 }]}>Resend OTP</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Verify button */}
                        <TouchableOpacity
                            style={[st.verifyBtnWrap, (!isComplete || loading) && { opacity: 0.6 }]}
                            onPress={handleVerify}
                            disabled={loading || !isComplete}
                            activeOpacity={0.88}
                        >
                            <LinearGradient
                                colors={isComplete ? ["#1E3A8A", "#2563EB"] : ["#94A3B8", "#94A3B8"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={st.verifyGrad}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <>
                                        <Text style={st.verifyBtnText}>Verify & Continue</Text>
                                        <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Security note */}
                        <View style={st.securityBadge}>
                            <MaterialCommunityIcons name="shield-check" size={15} color={colors.success} />
                            <Text style={[st.securityText, { color: colors.textSecondary }]}>
                                Code expires in 10 minutes · HIPAA-compliant verification
                            </Text>
                        </View>

                        {/* Back to register */}
                        <View style={st.footerRow}>
                            <Text style={[st.footerText, { color: colors.textSecondary }]}>Wrong details?</Text>
                            <TouchableOpacity onPress={() => router.replace("/register")} activeOpacity={0.7}>
                                <Text style={st.footerLink}>Back to Register</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom wave */}
            <Svg width="100%" height={70} style={st.wave} viewBox="0 0 430 70" preserveAspectRatio="xMidYMax slice">
                <Path d="M0 35 C120 10 280 60 430 30 L430 70 L0 70 Z" fill={isDark ? "#1E3A8A22" : "#2563EB1A"} />
                <Path d="M0 48 C150 22 290 65 430 42 L430 70 L0 70 Z" fill={isDark ? "#1E3A8A44" : "#2563EB30"} />
            </Svg>
        </SafeAreaView>
    );
}

const st = StyleSheet.create({
    root: { flex: 1 },

    // ── Hero ──────────────────────────────────────────────────────────────
    hero: { paddingTop: 14, paddingBottom: 32, paddingHorizontal: 22, overflow: "hidden" },
    blobA: { position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(255,255,255,0.07)", right: -55, top: -55 },
    blobB: { position: "absolute", width: 140, height: 140, borderRadius: 70,  backgroundColor: "rgba(255,255,255,0.04)", right: 60, top: 90 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", justifyContent: "center", alignItems: "center", marginBottom: 16 },
    portalBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginBottom: 10, alignSelf: "flex-start" },
    portalBadgeText: { fontSize: 11, fontWeight: "700", color: "#BFDBFE", letterSpacing: 1.0, textTransform: "uppercase" },
    heroTitle: { fontSize: 24, fontWeight: "800", color: "#FFF", letterSpacing: -0.3, marginBottom: 6 },
    heroSub:   { fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 19 },

    // ── Card ──────────────────────────────────────────────────────────────
    scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 60 },
    card: {
        borderRadius: 24, borderWidth: 1, padding: 22,
        shadowColor: "#2563EB", shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.07, shadowRadius: 20, elevation: 5,
    },

    // ── Channel chips ─────────────────────────────────────────────────────
    channelRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
    channelChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, maxWidth: "100%" },
    channelText: { fontSize: 12, fontWeight: "600", flexShrink: 1 },

    // ── Error banner ──────────────────────────────────────────────────────
    errorBanner: { flexDirection: "row", alignItems: "center", borderRadius: 12, backgroundColor: "#FEF2F2", overflow: "hidden", marginBottom: 18, paddingVertical: 12, paddingRight: 14 },
    errorAccent: { width: 4, alignSelf: "stretch", backgroundColor: "#DC2626", borderRadius: 2, marginRight: 6 },
    errorBannerText: { color: "#DC2626", fontSize: 13, fontWeight: "500", flex: 1, marginLeft: 8 },

    // ── Section header ────────────────────────────────────────────────────
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 18 },
    sectionDot:    { width: 8, height: 8, borderRadius: 4 },
    sectionLabel:  { fontSize: 11, fontWeight: "700", letterSpacing: 1.1 },

    // ── OTP boxes ─────────────────────────────────────────────────────────
    otpRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
        marginBottom: 22,
    },
    otpBox: {
        flex: 1,
        height: 56,
        borderRadius: 14,
        borderWidth: 1.5,
        fontSize: 22,
        fontWeight: "800",
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 2,
    },

    // ── Resend row ────────────────────────────────────────────────────────
    resendRow: { alignItems: "center", marginBottom: 24, gap: 6 },
    timerText:  { fontSize: 13, fontWeight: "500" },
    resendText: { fontSize: 14, fontWeight: "800", color: "#2563EB" },

    // ── Verify button ─────────────────────────────────────────────────────
    verifyBtnWrap: { borderRadius: 16, overflow: "hidden", marginBottom: 16 },
    verifyGrad: { height: 52, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 },
    verifyBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },

    // ── Security badge ────────────────────────────────────────────────────
    securityBadge: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 20 },
    securityText:  { fontSize: 11, fontWeight: "500", textAlign: "center", flex: 1 },

    // ── Footer ────────────────────────────────────────────────────────────
    footerRow:  { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 5 },
    footerText: { fontSize: 14 },
    footerLink: { fontSize: 14, fontWeight: "700", color: "#2563EB" },

    // ── Wave ──────────────────────────────────────────────────────────────
    wave: { position: "absolute", bottom: 0, left: 0, right: 0, zIndex: -1 },
});
