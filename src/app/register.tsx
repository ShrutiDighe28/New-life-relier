import LogoBrand from "@/components/LogoBrand";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/utils/themeManager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated, Image,
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
import Svg, { Path } from "react-native-svg";

// ── Validators ────────────────────────────────────────────────────────────────
const isValidEmail     = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidMobile    = (v: string) => /^[6-9]\d{9}$/.test(v);
const isStrongPassword = (v: string) =>
    v.length >= 8 && /[A-Z]/.test(v) && /[0-9]/.test(v);

function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string } {
    if (!pw) return { level: 0, label: "" };
    if (pw.length < 6) return { level: 1, label: "Weak" };
    if (pw.length < 8 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { level: 2, label: "Fair" };
    return { level: 3, label: "Strong" };
}

// ── Animated Input Row ────────────────────────────────────────────────────────
function InputRow({
    icon, label, placeholder, value, onChangeText,
    secureTextEntry, keyboardType, autoCapitalize, maxLength,
    rightElement, hasError, colors, isDark,
}: {
    icon: string; label?: string; placeholder: string; value: string;
    onChangeText: (v: string) => void; secureTextEntry?: boolean;
    keyboardType?: any; autoCapitalize?: any; maxLength?: number;
    rightElement?: React.ReactNode; hasError?: boolean;
    colors: any; isDark: boolean;
}) {
    const [focused, setFocused] = useState(false);
    const anim = useRef(new Animated.Value(0)).current;

    const onFocus = () => { setFocused(true);  Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: false }).start(); };
    const onBlur  = () => { setFocused(false); Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: false }).start(); };

    const borderColor = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [
            hasError ? "#EF4444" : (isDark ? "#334155" : "#E2E8F0"),
            hasError ? "#EF4444" : "#2563EB",
        ],
    });

    return (
        <View style={{ marginBottom: 14 }}>
            {label ? <Text style={[st.fieldLabel, { color: colors.textSecondary }]}>{label}</Text> : null}
            <Animated.View style={[
                st.inputWrap,
                {
                    backgroundColor: isDark ? colors.inputBg : "#F8FAFC",
                    borderColor,
                    borderWidth: focused ? 1.5 : 1,
                    shadowColor: focused ? "#2563EB" : "#000",
                    shadowOpacity: focused ? 0.08 : 0.02,
                    shadowRadius: focused ? 10 : 4,
                    elevation: focused ? 4 : 1,
                },
            ]}>
                <MaterialCommunityIcons name={icon as any} size={18} color={focused ? "#2563EB" : "#94A3B8"} style={{ marginRight: 10 }} />
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                    value={value}
                    onChangeText={onChangeText}
                    style={[st.inputText, { color: colors.text }]}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType ?? "default"}
                    autoCapitalize={autoCapitalize ?? "sentences"}
                    autoCorrect={false}
                    maxLength={maxLength}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
                {rightElement}
            </Animated.View>
        </View>
    );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function PatientRegisterScreen() {
    const router = useRouter();
    const { requestOtp } = useAuth();
    const { colors, isDark } = useTheme();

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);

    // Step 1 — Personal
    const [fullName, setFullName] = useState("");
    const [email, setEmail]       = useState("");
    const [mobile, setMobile]     = useState("");

    // Step 2 — Security
    const [password, setPassword]               = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword]       = useState(false);
    const [showConfirm, setShowConfirm]         = useState(false);
    const [acceptedTerms, setAcceptedTerms]     = useState(false);

    const [errors, setErrors]   = useState<Record<string, string>>({});
    const fadeAnim  = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(28)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    const animateStep = (next: 1 | 2 | 3) => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
            setStep(next);
            slideAnim.setValue(24);
            Animated.parallel([
                Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]).start();
        });
    };

    const clearErr = (f: string) => setErrors(p => { const e = { ...p }; delete e[f]; return e; });

    const validateStep1 = () => {
        const e: Record<string, string> = {};
        if (!fullName.trim() || fullName.trim().length < 2) e.fullName = "Enter your full name.";
        if (!isValidEmail(email.trim()))   e.email  = "Enter a valid email address.";
        if (!isValidMobile(mobile.trim())) e.mobile = "Enter a valid 10-digit mobile number.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep2 = () => {
        const e: Record<string, string> = {};
        if (!isStrongPassword(password))       e.password        = "Min 8 chars, 1 uppercase, 1 number.";
        if (password !== confirmPassword)      e.confirmPassword = "Passwords do not match.";
        if (!acceptedTerms)                    e.terms           = "You must accept the Terms & Conditions.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) animateStep(2);
        else if (step === 2 && validateStep2()) animateStep(3);
    };

    const handleSubmit = async () => {
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
                animateStep(1);
            } else {
                setErrors({ general: msg || "Registration failed. Please try again." });
            }
        } finally {
            setLoading(false);
        }
    };

    const ErrMsg = ({ field }: { field: string }) =>
        errors[field] ? (
            <View style={st.errRow}>
                <MaterialCommunityIcons name="information-outline" size={13} color="#EF4444" />
                <Text style={st.errText}>{errors[field]}</Text>
            </View>
        ) : null;

    const pwStrength = getPasswordStrength(password);
    const strengthColors     = ["#E2E8F0", "#EF4444", "#F59E0B", "#10B981"];
    const strengthTextColors = ["#94A3B8", "#EF4444", "#F59E0B", "#10B981"];
    const HERO_GRAD: [string, string] = isDark ? ["#1E3A8A", "#1D4ED8"] : ["#2563EB", "#1E40AF"];
    const C = { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isDark ? colors.cardBorder : "#E8EFF5" };

    return (
        <SafeAreaView style={[st.root, { backgroundColor: isDark ? "#0F172A" : "#EFF6FF" }]} edges={["top", "left", "right"]}>

            {/* ── HERO HEADER ── */}
            <LinearGradient colors={HERO_GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.hero}>
                <View style={st.blobA} />
                <View style={st.blobB} />

                {/* Back button */}
                <TouchableOpacity
                    style={st.backBtn}
                    onPress={() => step > 1 ? animateStep((step - 1) as 1 | 2 | 3) : router.back()}
                    activeOpacity={0.75}
                >
                    <MaterialCommunityIcons name="arrow-left" size={22} color="#FFF" />
                </TouchableOpacity>

                {/* Logo + badge + title */}
                <LogoBrand size={36} fontSize={23} variant="light" style={{ marginBottom: 12 }} />
                <View style={st.portalBadge}>
                    <MaterialCommunityIcons name="account-heart-outline" size={13} color="#BFDBFE" />
                    <Text style={st.portalBadgeText}>Patient Portal</Text>
                </View>
                <Text style={st.heroTitle}>Create Your Account 🏥</Text>
                <Text style={st.heroSub}>Join Life Relier to manage your health securely</Text>

                {/* Step indicator */}
                <View style={st.stepRow}>
                    {[1, 2, 3].map((n) => (
                        <React.Fragment key={n}>
                            <View style={[st.stepDot, step >= n && { backgroundColor: "#FFF" }, step === n && st.stepDotActive]}>
                                {step > n
                                    ? <MaterialCommunityIcons name="check" size={12} color="#2563EB" />
                                    : <Text style={[st.stepNum, step >= n && { color: "#2563EB" }]}>{n}</Text>}
                            </View>
                            {n < 3 && <View style={[st.stepLine, step > n && { backgroundColor: "#FFF" }]} />}
                        </React.Fragment>
                    ))}
                </View>
                <View style={st.stepLabelRow}>
                    {["Personal Info", "Security", "Review"].map((l, i) => (
                        <Text key={i} style={[st.stepLabel, step === i + 1 && { color: "#FFF", fontWeight: "700" }]}>{l}</Text>
                    ))}
                </View>
            </LinearGradient>

            {/* ── FORM ── */}
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView
                    contentContainerStyle={st.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View style={[st.card, C, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

                        {/* General error */}
                        {errors.general ? (
                            <View style={st.errorBanner}>
                                <View style={st.errorAccent} />
                                <MaterialCommunityIcons name="alert-circle-outline" size={17} color="#DC2626" style={{ marginLeft: 10 }} />
                                <Text style={st.errorBannerText}>{errors.general}</Text>
                            </View>
                        ) : null}

                        {/* ══ STEP 1: PERSONAL INFO ══════════════════════════════ */}
                        {step === 1 && (
                            <>
                                <View style={st.sectionHeader}>
                                    <View style={[st.sectionDot, { backgroundColor: "#2563EB" }]} />
                                    <Text style={[st.sectionLabel, { color: colors.textSecondary }]}>PERSONAL INFORMATION</Text>
                                </View>

                                <InputRow icon="account-outline" label="Full Name" placeholder="e.g. Ananya Sharma"
                                    value={fullName} onChangeText={v => { setFullName(v); clearErr("fullName"); }}
                                    autoCapitalize="words" hasError={!!errors.fullName} colors={colors} isDark={isDark} />
                                <ErrMsg field="fullName" />

                                <InputRow icon="email-outline" label="Email Address" placeholder="patient@email.com"
                                    value={email} onChangeText={v => { setEmail(v); clearErr("email"); }}
                                    keyboardType="email-address" autoCapitalize="none"
                                    hasError={!!errors.email} colors={colors} isDark={isDark} />
                                <ErrMsg field="email" />

                                <InputRow icon="phone-outline" label="Mobile Number" placeholder="10-digit number"
                                    value={mobile} onChangeText={v => { setMobile(v); clearErr("mobile"); }}
                                    keyboardType="phone-pad" autoCapitalize="none" maxLength={10}
                                    hasError={!!errors.mobile} colors={colors} isDark={isDark} />
                                <ErrMsg field="mobile" />

                                {/* Health info hint */}
                                <View style={[st.hintBox, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF", borderColor: isDark ? "#334155" : "#BFDBFE" }]}>
                                    <MaterialCommunityIcons name="information-outline" size={14} color="#2563EB" />
                                    <Text style={[st.hintText, { color: isDark ? "#93C5FD" : "#1E40AF" }]}>
                                        Your details are used for appointment booking and health record management.
                                    </Text>
                                </View>
                            </>
                        )}

                        {/* ══ STEP 2: SECURITY ══════════════════════════════════ */}
                        {step === 2 && (
                            <>
                                <View style={st.sectionHeader}>
                                    <View style={[st.sectionDot, { backgroundColor: "#2563EB" }]} />
                                    <Text style={[st.sectionLabel, { color: colors.textSecondary }]}>ACCOUNT SECURITY</Text>
                                </View>

                                <InputRow icon="lock-outline" label="Password" placeholder="Min 8 chars, 1 uppercase, 1 number"
                                    value={password} onChangeText={v => { setPassword(v); clearErr("password"); }}
                                    secureTextEntry={!showPassword} autoCapitalize="none"
                                    hasError={!!errors.password} colors={colors} isDark={isDark}
                                    rightElement={
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                                            <MaterialCommunityIcons name={showPassword ? "eye-outline" : "eye-off-outline"} size={18} color="#94A3B8" />
                                        </TouchableOpacity>
                                    } />

                                {/* Password strength */}
                                {password.length > 0 && (
                                    <View style={st.strengthRow}>
                                        <View style={st.strengthBars}>
                                            {[1, 2, 3].map(seg => (
                                                <View key={seg} style={[st.strengthSeg, {
                                                    backgroundColor: pwStrength.level >= seg
                                                        ? strengthColors[pwStrength.level]
                                                        : (isDark ? "#334155" : "#E2E8F0"),
                                                }]} />
                                            ))}
                                        </View>
                                        {pwStrength.label ? (
                                            <Text style={[st.strengthLabel, { color: strengthTextColors[pwStrength.level] }]}>
                                                {pwStrength.label}
                                            </Text>
                                        ) : null}
                                    </View>
                                )}
                                <ErrMsg field="password" />

                                <InputRow icon="lock-check-outline" label="Confirm Password" placeholder="Re-enter your password"
                                    value={confirmPassword} onChangeText={v => { setConfirmPassword(v); clearErr("confirmPassword"); }}
                                    secureTextEntry={!showConfirm} autoCapitalize="none"
                                    hasError={!!errors.confirmPassword} colors={colors} isDark={isDark}
                                    rightElement={
                                        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} hitSlop={8}>
                                            <MaterialCommunityIcons name={showConfirm ? "eye-outline" : "eye-off-outline"} size={18} color="#94A3B8" />
                                        </TouchableOpacity>
                                    } />
                                <ErrMsg field="confirmPassword" />

                                {/* Terms */}
                                <TouchableOpacity
                                    style={[st.termsCard, {
                                        backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                                        borderColor: acceptedTerms ? "#2563EB" : (isDark ? "#334155" : "#E2E8F0"),
                                        borderWidth: acceptedTerms ? 1.5 : 1,
                                    }]}
                                    onPress={() => { setAcceptedTerms(!acceptedTerms); clearErr("terms"); }}
                                    activeOpacity={0.8}
                                >
                                    <View style={[st.checkbox, acceptedTerms && { backgroundColor: "#2563EB", borderColor: "#2563EB" }]}>
                                        {acceptedTerms && <MaterialCommunityIcons name="check" size={12} color="#FFF" />}
                                    </View>
                                    <Text style={[st.termsText, { color: colors.textSecondary }]}>
                                        I agree to the{" "}
                                        <Text style={[st.termsLink, { color: "#2563EB" }]}>Terms & Conditions</Text>
                                        {" "}and{" "}
                                        <Text style={[st.termsLink, { color: "#2563EB" }]}>Privacy Policy</Text>
                                    </Text>
                                </TouchableOpacity>
                                <ErrMsg field="terms" />
                            </>
                        )}

                        {/* ══ STEP 3: REVIEW ════════════════════════════════════ */}
                        {step === 3 && (
                            <>
                                <View style={st.sectionHeader}>
                                    <View style={[st.sectionDot, { backgroundColor: "#10B981" }]} />
                                    <Text style={[st.sectionLabel, { color: colors.textSecondary }]}>REVIEW YOUR DETAILS</Text>
                                </View>

                                <View style={[st.reviewCard, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                                    {[
                                        { icon: "account-outline", label: "Full Name",     val: fullName },
                                        { icon: "email-outline",   label: "Email",         val: email    },
                                        { icon: "phone-outline",   label: "Mobile",        val: `+91 ${mobile}` },
                                        { icon: "lock-outline",    label: "Password",      val: "••••••••" },
                                    ].map(row => (
                                        <View key={row.label} style={[st.reviewRow, { borderColor: isDark ? "#334155" : "#F1F5F9" }]}>
                                            <View style={[st.reviewIco, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                                                <MaterialCommunityIcons name={row.icon as any} size={16} color="#2563EB" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: "600" }}>{row.label}</Text>
                                                <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text, marginTop: 1 }}>{row.val || "—"}</Text>
                                            </View>
                                            <TouchableOpacity onPress={() => animateStep(row.label === "Password" ? 2 : 1)} hitSlop={8}>
                                                <MaterialCommunityIcons name="pencil-outline" size={16} color="#2563EB" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>

                                <View style={[st.hintBox, { backgroundColor: isDark ? "#052e16" : "#ECFDF5", borderColor: isDark ? "#166534" : "#86EFAC" }]}>
                                    <MaterialCommunityIcons name="shield-check-outline" size={14} color="#10B981" />
                                    <Text style={{ color: isDark ? "#4ADE80" : "#166534", fontSize: 12, fontWeight: "600", flex: 1 }}>
                                        An OTP will be sent to your email and mobile to verify your account.
                                    </Text>
                                </View>
                            </>
                        )}

                        {/* ── Navigation Buttons ── */}
                        {step < 3 ? (
                            <TouchableOpacity style={st.primaryBtn} onPress={handleNext} activeOpacity={0.88}>
                                <LinearGradient colors={["#1E3A8A", "#2563EB"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={st.btnGrad}>
                                    <Text style={st.btnText}>Continue</Text>
                                    <View style={st.arrowCircle}>
                                        <MaterialCommunityIcons name="arrow-right" size={18} color="#2563EB" />
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[st.primaryBtn, loading && { opacity: 0.7 }]}
                                onPress={handleSubmit}
                                disabled={loading}
                                activeOpacity={0.88}
                            >
                                <LinearGradient colors={["#1E3A8A", "#2563EB"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={st.btnGrad}>
                                    {loading ? <ActivityIndicator color="#FFF" /> : (
                                        <>
                                            <Text style={st.btnText}>Create Account</Text>
                                            <View style={st.arrowCircle}>
                                                <MaterialCommunityIcons name="check" size={18} color="#2563EB" />
                                            </View>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        {/* Sign in link */}
                        <View style={st.footerRow}>
                            <Text style={[{ fontSize: 14, color: colors.textSecondary }]}>Already have an account?</Text>
                            <TouchableOpacity onPress={() => router.replace("/login")} activeOpacity={0.7}>
                                <Text style={[st.footerLink, { color: "#2563EB" }]}>  Sign In</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Divider + Google (step 1 only) */}
                        {step === 1 && (
                            <>
                                <View style={st.dividerRow}>
                                    <View style={[st.divLine, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]} />
                                    <Text style={[st.divText, { color: colors.textMuted }]}>OR</Text>
                                    <View style={[st.divLine, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]} />
                                </View>
                                <TouchableOpacity
                                    style={[st.googleBtn, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                                    activeOpacity={0.8}
                                >
                                    <Image source={require("@/assets/images/auth/google.png")} style={st.googleIcon} />
                                    <Text style={[st.googleText, { color: colors.text }]}>Continue with Google</Text>
                                </TouchableOpacity>
                            </>
                        )}
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
    hero: { paddingTop: 14, paddingBottom: 28, paddingHorizontal: 22, overflow: "hidden" },
    blobA: { position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(255,255,255,0.07)", right: -55, top: -55 },
    blobB: { position: "absolute", width: 140, height: 140, borderRadius: 70,  backgroundColor: "rgba(255,255,255,0.04)", right: 60, top: 90 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", justifyContent: "center", alignItems: "center", marginBottom: 16 },
    portalBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginBottom: 10 },
    portalBadgeText: { fontSize: 11, fontWeight: "700", color: "#BFDBFE", letterSpacing: 1.0, textTransform: "uppercase" },
    heroTitle: { fontSize: 22, fontWeight: "800", color: "#FFF", letterSpacing: -0.3, marginBottom: 5 },
    heroSub:   { fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 19, marginBottom: 20 },

    // Step indicator
    stepRow:      { flexDirection: "row", alignItems: "center", marginBottom: 6 },
    stepDot:      { width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center" },
    stepDotActive:{ shadowColor: "#FFF", shadowOpacity: 0.4, shadowRadius: 6, elevation: 4 },
    stepNum:      { fontSize: 12, fontWeight: "800", color: "rgba(255,255,255,0.6)" },
    stepLine:     { flex: 1, height: 2, backgroundColor: "rgba(255,255,255,0.25)", marginHorizontal: 4 },
    stepLabelRow: { flexDirection: "row", justifyContent: "space-between" },
    stepLabel:    { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.5)", flex: 1, textAlign: "center" },

    // ── Scroll / Card ─────────────────────────────────────────────────────
    scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 90 },
    card:   { borderRadius: 24, borderWidth: 1, padding: 22, shadowColor: "#2563EB", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.07, shadowRadius: 20, elevation: 5 },

    // ── Error banner ──────────────────────────────────────────────────────
    errorBanner:     { flexDirection: "row", alignItems: "center", borderRadius: 12, backgroundColor: "#FEF2F2", overflow: "hidden", marginBottom: 18, paddingVertical: 12, paddingRight: 14 },
    errorAccent:     { width: 4, alignSelf: "stretch", backgroundColor: "#DC2626", borderRadius: 2, marginRight: 6 },
    errorBannerText: { color: "#DC2626", fontSize: 13, fontWeight: "500", flex: 1, marginLeft: 8 },

    // ── Section header ────────────────────────────────────────────────────
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
    sectionDot:    { width: 8, height: 8, borderRadius: 4 },
    sectionLabel:  { fontSize: 11, fontWeight: "700", letterSpacing: 1.1 },

    // ── Input ─────────────────────────────────────────────────────────────
    fieldLabel: { fontSize: 12, fontWeight: "700", marginBottom: 6, letterSpacing: 0.1 },
    inputWrap:  { flexDirection: "row", alignItems: "center", height: 50, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, shadowOffset: { width: 0, height: 2 } },
    inputText:  { flex: 1, fontSize: 14, fontWeight: "500", height: "100%" },
    errRow:     { flexDirection: "row", alignItems: "center", gap: 4, marginTop: -8, marginBottom: 10, marginLeft: 2 },
    errText:    { color: "#EF4444", fontSize: 12, fontWeight: "500" },

    // ── Hint box ──────────────────────────────────────────────────────────
    hintBox:  { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 6 },
    hintText: { fontSize: 12, fontWeight: "500", flex: 1, lineHeight: 17 },

    // ── Password strength ─────────────────────────────────────────────────
    strengthRow:  { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10, marginTop: -4 },
    strengthBars: { flexDirection: "row", gap: 4, flex: 1 },
    strengthSeg:  { flex: 1, height: 4, borderRadius: 2 },
    strengthLabel:{ fontSize: 12, fontWeight: "700" },

    // ── Terms ─────────────────────────────────────────────────────────────
    termsCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, padding: 12, marginBottom: 10 },
    checkbox:  { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: "#CBD5E1", justifyContent: "center", alignItems: "center", marginTop: 1 },
    termsText: { flex: 1, fontSize: 13, lineHeight: 19 },
    termsLink: { fontWeight: "700" },

    // ── Review card ───────────────────────────────────────────────────────
    reviewCard: { borderRadius: 16, borderWidth: 1, marginBottom: 14, overflow: "hidden" },
    reviewRow:  { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderBottomWidth: 1 },
    reviewIco:  { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },

    // ── Button ────────────────────────────────────────────────────────────
    primaryBtn: { borderRadius: 16, overflow: "hidden", marginTop: 6, marginBottom: 18 },
    btnGrad:    { height: 52, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 },
    btnText:    { color: "#FFF", fontSize: 16, fontWeight: "800" },
    arrowCircle:{ width: 30, height: 30, borderRadius: 15, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center" },

    // ── Footer / Divider / Google ─────────────────────────────────────────
    footerRow:  { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 18 },
    footerLink: { fontSize: 14, fontWeight: "700" },
    dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
    divLine:    { flex: 1, height: 1 },
    divText:    { fontSize: 12, fontWeight: "600" },
    googleBtn:  { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 50, borderRadius: 14, borderWidth: 1, gap: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
    googleIcon: { width: 20, height: 20, resizeMode: "contain" },
    googleText: { fontSize: 14, fontWeight: "600" },

    // ── Wave ──────────────────────────────────────────────────────────────
    wave: { position: "absolute", bottom: 0, left: 0, right: 0, zIndex: -1 },
});
