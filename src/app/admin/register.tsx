import LogoBrand from "@/components/LogoBrand";
import { useTheme } from "@/utils/themeManager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Animated,
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

const BLUE = "#2563EB";
const BLUE_DARK = "#1E3A8A";

// ── Validators ───────────────────────────────────────────────────────────────

const isValidEmail    = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidMobile   = (v: string) => /^[6-9]\d{9}$/.test(v);
const isStrongPassword = (v: string) =>
    v.length >= 8 && /[A-Z]/.test(v) && /[0-9]/.test(v);

function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string } {
    if (!pw) return { level: 0, label: "" };
    if (pw.length < 6) return { level: 1, label: "Weak" };
    if (pw.length < 8 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { level: 2, label: "Fair" };
    return { level: 3, label: "Strong" };
}

// ── Input Field ──────────────────────────────────────────────────────────────

function InputRow({
    icon, label, placeholder, value, onChangeText,
    secureTextEntry, keyboardType, autoCapitalize, maxLength,
    rightElement, hasError, isDark, colors,
}: any) {
    const [focused, setFocused] = React.useState(false);
    const focusAnim = React.useRef(new Animated.Value(0)).current;

    const handleFocus = () => {
        setFocused(true);
        Animated.timing(focusAnim, { toValue: 1, duration: 180, useNativeDriver: false }).start();
    };
    const handleBlur = () => {
        setFocused(false);
        Animated.timing(focusAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start();
    };

    const borderColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [
            hasError ? "#EF4444" : (isDark ? "#334155" : "#E2E8F0"),
            hasError ? "#EF4444" : BLUE,
        ],
    });

    return (
        <View style={{ marginBottom: 14 }}>
            {label && <Text style={[st.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>}
            <Animated.View style={[
                st.inputWrap,
                {
                    backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                    borderColor,
                    borderWidth: focused ? 1.5 : 1,
                    shadowColor: focused ? BLUE : "#000",
                    shadowOpacity: focused ? 0.08 : 0.02,
                    shadowRadius: focused ? 10 : 4,
                    elevation: focused ? 4 : 1,
                },
            ]}>
                <MaterialCommunityIcons name={icon} size={18} color={focused ? BLUE : "#94A3B8"} style={{ marginRight: 10 }} />
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
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
                {rightElement}
            </Animated.View>
        </View>
    );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function AdminRegisterScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();

    // Step state — step 1: personal, step 2: role & security, step 3: review
    const [step, setStep] = React.useState<1 | 2 | 3>(1);

    // Step 1 fields
    const [fullName,    setFullName]    = React.useState("");
    const [email,       setEmail]       = React.useState("");
    const [mobile,      setMobile]      = React.useState("");
    const [department,  setDepartment]  = React.useState("");

    // Step 2 fields
    const [adminCode,        setAdminCode]        = React.useState("");
    const [password,         setPassword]         = React.useState("");
    const [confirmPassword,  setConfirmPassword]  = React.useState("");
    const [showPassword,     setShowPassword]     = React.useState(false);
    const [showConfirmPw,    setShowConfirmPw]     = React.useState(false);
    const [acceptedTerms,    setAcceptedTerms]     = React.useState(false);

    const [errors,  setErrors]  = React.useState<Record<string, string>>({});
    const [loading, setLoading] = React.useState(false);

    const clearErr = (f: string) => setErrors((p) => { const e = { ...p }; delete e[f]; return e; });

    const pwStrength = getPasswordStrength(password);
    const strengthColors     = ["#E2E8F0", "#EF4444", "#F59E0B", "#10B981"];
    const strengthTextColors = ["#94A3B8", "#EF4444", "#F59E0B", "#10B981"];

    const slideAnim = React.useRef(new Animated.Value(30)).current;
    const fadeAnim  = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    // Animate step change
    const animateStep = (nextStep: 1 | 2 | 3) => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
            setStep(nextStep);
            slideAnim.setValue(24);
            Animated.parallel([
                Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]).start();
        });
    };

    // ── Validation ────────────────────────────────────────────────────────

    const validateStep1 = () => {
        const e: Record<string, string> = {};
        if (!fullName.trim() || fullName.trim().length < 2) e.fullName = "Enter your full name.";
        if (!isValidEmail(email.trim()))  e.email    = "Enter a valid email address.";
        if (!isValidMobile(mobile.trim()))e.mobile   = "Enter a valid 10-digit mobile number.";
        if (!department.trim())           e.department = "Enter your department or designation.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep2 = () => {
        const e: Record<string, string> = {};
        if (!adminCode.trim())                     e.adminCode = "Organisation access code is required.";
        if (!isStrongPassword(password))           e.password  = "Min 8 chars, 1 uppercase, 1 number.";
        if (password !== confirmPassword)          e.confirmPassword = "Passwords do not match.";
        if (!acceptedTerms)                        e.terms     = "You must accept the Terms & Conditions.";
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
            // Simulated registration — in production connect to API
            await new Promise((resolve) => setTimeout(resolve, 1400));
            router.replace("/admin/(tabs)/dashboard");
        } catch (e: any) {
            setErrors({ general: "Registration failed. Please try again." });
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

    const C = { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isDark ? colors.cardBorder : "#E8EFF5" };

    const DEPARTMENTS = ["Administration", "IT & Systems", "Clinical Operations", "HR & Payroll", "Finance", "Other"];

    return (
        <SafeAreaView style={[st.root, { backgroundColor: isDark ? "#0F172A" : "#F0F9FF" }]} edges={["top", "left", "right"]}>

            {/* ── HERO HEADER ── */}
            <LinearGradient colors={[BLUE_DARK, BLUE]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.hero}>
                {/* Back */}
                <TouchableOpacity style={st.backBtn} onPress={() => step > 1 ? animateStep((step - 1) as 1 | 2 | 3) : router.back()} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color="#FFF" />
                </TouchableOpacity>

                {/* Decorative blobs */}
                <View style={[st.blobA, { backgroundColor: "rgba(255,255,255,0.07)" }]} />
                <View style={[st.blobB, { backgroundColor: "rgba(255,255,255,0.04)" }]} />

                <LogoBrand size={34} fontSize={22} style={{ marginBottom: 12 }} />
                <View style={st.heroBadge}>
                    <MaterialCommunityIcons name="shield-crown-outline" size={13} color="#BFDBFE" />
                    <Text style={st.heroBadgeText}>Administration Portal</Text>
                </View>
                <Text style={st.heroTitle}>Register Admin Account 🛡️</Text>
                <Text style={st.heroSub}>Create an account to manage the LifeRelier platform</Text>

                {/* Step Indicator */}
                <View style={st.stepRow}>
                    {[1, 2, 3].map((n) => (
                        <React.Fragment key={n}>
                            <View style={[st.stepDot, step >= n && { backgroundColor: "#FFF" }, step === n && st.stepDotActive]}>
                                {step > n
                                    ? <MaterialCommunityIcons name="check" size={12} color={BLUE} />
                                    : <Text style={[st.stepNum, step >= n && { color: BLUE }]}>{n}</Text>}
                            </View>
                            {n < 3 && <View style={[st.stepLine, step > n && { backgroundColor: "#FFF" }]} />}
                        </React.Fragment>
                    ))}
                </View>
                <View style={st.stepLabelRow}>
                    {["Personal Info", "Security", "Review"].map((l, i) => (
                        <Text key={i} style={[st.stepLabel, step === i + 1 && { color: "#FFF" }]}>{l}</Text>
                    ))}
                </View>
            </LinearGradient>

            {/* ── FORM ── */}
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <Animated.View style={[st.card, C, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

                        {/* General Error */}
                        {errors.general && (
                            <View style={st.errorBanner}>
                                <View style={st.errorAccent} />
                                <MaterialCommunityIcons name="alert-circle-outline" size={17} color="#DC2626" style={{ marginLeft: 10 }} />
                                <Text style={st.errorBannerText}>{errors.general}</Text>
                            </View>
                        )}

                        {/* ════════════════ STEP 1: PERSONAL INFO ════════════════ */}
                        {step === 1 && (
                            <>
                                <View style={st.sectionHeader}>
                                    <View style={[st.sectionDot, { backgroundColor: BLUE }]} />
                                    <Text style={[st.sectionLabel, { color: colors.textSecondary }]}>PERSONAL INFORMATION</Text>
                                </View>

                                <InputRow icon="account-outline"     label="Full Name"           placeholder="e.g. Rahul Sharma"
                                    value={fullName}   onChangeText={(v: string) => { setFullName(v);   clearErr("fullName");   }}
                                    hasError={!!errors.fullName}   isDark={isDark} colors={colors} />
                                <ErrMsg field="fullName" />

                                <InputRow icon="email-outline"       label="Email Address"        placeholder="admin@liferelier.com"
                                    value={email}      onChangeText={(v: string) => { setEmail(v);      clearErr("email");      }}
                                    keyboardType="email-address" autoCapitalize="none"
                                    hasError={!!errors.email}      isDark={isDark} colors={colors} />
                                <ErrMsg field="email" />

                                <InputRow icon="phone-outline"       label="Mobile Number"        placeholder="10-digit number"
                                    value={mobile}     onChangeText={(v: string) => { setMobile(v);     clearErr("mobile");     }}
                                    keyboardType="phone-pad" autoCapitalize="none" maxLength={10}
                                    hasError={!!errors.mobile}     isDark={isDark} colors={colors} />
                                <ErrMsg field="mobile" />

                                <InputRow icon="briefcase-outline"   label="Department / Role"   placeholder="e.g. Clinical Operations"
                                    value={department} onChangeText={(v: string) => { setDepartment(v); clearErr("department"); }}
                                    hasError={!!errors.department} isDark={isDark} colors={colors} />
                                <ErrMsg field="department" />

                                {/* Department quick-select chips */}
                                <Text style={[st.chipHint, { color: colors.textSecondary }]}>Quick select department:</Text>
                                <View style={st.chipRow}>
                                    {DEPARTMENTS.map((dep) => (
                                        <TouchableOpacity key={dep} onPress={() => { setDepartment(dep); clearErr("department"); }} activeOpacity={0.8}
                                            style={[st.chip, department === dep ? { backgroundColor: BLUE } : { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
                                            <Text style={[st.chipText, { color: department === dep ? "#FFF" : colors.textSecondary }]}>{dep}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}

                        {/* ════════════════ STEP 2: SECURITY ════════════════════ */}
                        {step === 2 && (
                            <>
                                <View style={st.sectionHeader}>
                                    <View style={[st.sectionDot, { backgroundColor: BLUE }]} />
                                    <Text style={[st.sectionLabel, { color: colors.textSecondary }]}>ORGANISATION ACCESS</Text>
                                </View>

                                {/* Admin Access Code */}
                                <InputRow icon="key-outline"         label="Admin Access Code"   placeholder="Enter organisation access code"
                                    value={adminCode}  onChangeText={(v: string) => { setAdminCode(v);  clearErr("adminCode");  }}
                                    autoCapitalize="characters"
                                    hasError={!!errors.adminCode}  isDark={isDark} colors={colors} />
                                <View style={[st.hintBox, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF", borderColor: isDark ? "#334155" : "#BFDBFE" }]}>
                                    <MaterialCommunityIcons name="information-outline" size={14} color={BLUE} />
                                    <Text style={[st.hintText, { color: isDark ? "#93C5FD" : "#1E40AF" }]}>
                                        This code is provided by your IT department or platform administrator.
                                    </Text>
                                </View>
                                <ErrMsg field="adminCode" />

                                <View style={[st.sectionHeader, { marginTop: 10 }]}>
                                    <View style={[st.sectionDot, { backgroundColor: BLUE }]} />
                                    <Text style={[st.sectionLabel, { color: colors.textSecondary }]}>ACCOUNT SECURITY</Text>
                                </View>

                                {/* Password */}
                                <InputRow icon="lock-outline"        label="Password"            placeholder="Min 8 chars, 1 uppercase, 1 number"
                                    value={password}   onChangeText={(v: string) => { setPassword(v);   clearErr("password");   }}
                                    secureTextEntry={!showPassword} autoCapitalize="none"
                                    hasError={!!errors.password}   isDark={isDark} colors={colors}
                                    rightElement={
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                                            <MaterialCommunityIcons name={showPassword ? "eye-outline" : "eye-off-outline"} size={18} color="#94A3B8" />
                                        </TouchableOpacity>
                                    } />

                                {/* Password strength bar */}
                                {password.length > 0 && (
                                    <View style={st.strengthRow}>
                                        <View style={st.strengthBars}>
                                            {[1, 2, 3].map((seg) => (
                                                <View key={seg} style={[st.strengthSeg, {
                                                    backgroundColor: pwStrength.level >= seg ? strengthColors[pwStrength.level] : (isDark ? "#334155" : "#E2E8F0"),
                                                }]} />
                                            ))}
                                        </View>
                                        {pwStrength.label && (
                                            <Text style={[st.strengthLabel, { color: strengthTextColors[pwStrength.level] }]}>{pwStrength.label}</Text>
                                        )}
                                    </View>
                                )}
                                <ErrMsg field="password" />

                                {/* Confirm Password */}
                                <InputRow icon="lock-check-outline"  label="Confirm Password"    placeholder="Re-enter your password"
                                    value={confirmPassword} onChangeText={(v: string) => { setConfirmPassword(v); clearErr("confirmPassword"); }}
                                    secureTextEntry={!showConfirmPw} autoCapitalize="none"
                                    hasError={!!errors.confirmPassword} isDark={isDark} colors={colors}
                                    rightElement={
                                        <TouchableOpacity onPress={() => setShowConfirmPw(!showConfirmPw)} hitSlop={8}>
                                            <MaterialCommunityIcons name={showConfirmPw ? "eye-outline" : "eye-off-outline"} size={18} color="#94A3B8" />
                                        </TouchableOpacity>
                                    } />
                                <ErrMsg field="confirmPassword" />

                                {/* Terms */}
                                <TouchableOpacity
                                    style={[st.termsCard, {
                                        backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                                        borderColor: acceptedTerms ? BLUE : (isDark ? "#334155" : "#E2E8F0"),
                                        borderWidth: acceptedTerms ? 1.5 : 1,
                                    }]}
                                    onPress={() => { setAcceptedTerms(!acceptedTerms); clearErr("terms"); }} activeOpacity={0.8}>
                                    <View style={[st.checkbox, acceptedTerms && { backgroundColor: BLUE, borderColor: BLUE }]}>
                                        {acceptedTerms && <MaterialCommunityIcons name="check" size={12} color="#FFF" />}
                                    </View>
                                    <Text style={[st.termsText, { color: colors.textSecondary }]}>
                                        I agree to the{" "}
                                        <Text style={[st.termsLink, { color: BLUE }]}>Terms & Conditions</Text>
                                        {" "}and{" "}
                                        <Text style={[st.termsLink, { color: BLUE }]}>Privacy Policy</Text>
                                    </Text>
                                </TouchableOpacity>
                                <ErrMsg field="terms" />
                            </>
                        )}

                        {/* ════════════════ STEP 3: REVIEW ═══════════════════════ */}
                        {step === 3 && (
                            <>
                                <View style={st.sectionHeader}>
                                    <View style={[st.sectionDot, { backgroundColor: "#10B981" }]} />
                                    <Text style={[st.sectionLabel, { color: colors.textSecondary }]}>REVIEW YOUR DETAILS</Text>
                                </View>

                                <View style={[st.reviewCard, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                                    {[
                                        { icon: "account-outline",  label: "Full Name",   val: fullName    },
                                        { icon: "email-outline",    label: "Email",       val: email       },
                                        { icon: "phone-outline",    label: "Mobile",      val: `+91 ${mobile}` },
                                        { icon: "briefcase-outline",label: "Department",  val: department  },
                                        { icon: "key-outline",      label: "Access Code", val: adminCode.replace(/./g, "•") },
                                    ].map((row) => (
                                        <View key={row.label} style={[st.reviewRow, { borderColor: isDark ? "#334155" : "#F1F5F9" }]}>
                                            <View style={[st.reviewIco, { backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }]}>
                                                <MaterialCommunityIcons name={row.icon as any} size={16} color={BLUE} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: "600" }}>{row.label}</Text>
                                                <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text, marginTop: 1 }}>{row.val || "—"}</Text>
                                            </View>
                                            <TouchableOpacity onPress={() => animateStep(row.label === "Department" || row.label === "Access Code" ? 1 : 1)} hitSlop={8}>
                                                <MaterialCommunityIcons name="pencil-outline" size={16} color={BLUE} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>

                                <View style={[st.hintBox, { backgroundColor: isDark ? "#052e16" : "#ECFDF5", borderColor: isDark ? "#166534" : "#86EFAC" }]}>
                                    <MaterialCommunityIcons name="shield-check-outline" size={14} color="#10B981" />
                                    <Text style={{ color: "#166534", fontSize: 12, fontWeight: "600", flex: 1 }}>
                                        Your account will be reviewed by the platform super-admin before activation.
                                    </Text>
                                </View>
                            </>
                        )}

                        {/* ── NAVIGATION BUTTONS ── */}
                        {step < 3 ? (
                            <TouchableOpacity style={st.primaryBtn} onPress={handleNext} activeOpacity={0.88}>
                                <LinearGradient colors={[BLUE_DARK, BLUE]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={st.btnGrad}>
                                    <Text style={st.btnText}>Continue</Text>
                                    <View style={st.arrowCircle}>
                                        <MaterialCommunityIcons name="arrow-right" size={18} color={BLUE} />
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={[st.primaryBtn, loading && { opacity: 0.7 }]} onPress={handleSubmit} activeOpacity={0.88} disabled={loading}>
                                <LinearGradient colors={[BLUE_DARK, BLUE]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={st.btnGrad}>
                                    {loading
                                        ? <ActivityIndicator color="#FFF" />
                                        : <>
                                            <Text style={st.btnText}>Create Admin Account</Text>
                                            <View style={st.arrowCircle}>
                                                <MaterialCommunityIcons name="check" size={18} color={BLUE} />
                                            </View>
                                        </>}
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        {/* Sign In link */}
                        <View style={st.footerRow}>
                            <Text style={[{ fontSize: 14, color: colors.textSecondary }]}>Already have an account?</Text>
                            <TouchableOpacity onPress={() => router.replace("/admin/login")} activeOpacity={0.7}>
                                <Text style={[st.footerLink, { color: BLUE }]}>  Sign In</Text>
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

// ── StyleSheet ────────────────────────────────────────────────────────────────

const st = StyleSheet.create({
    root:   { flex: 1 },
    wave:   { position: "absolute", bottom: 0, left: 0, right: 0 },

    // Hero
    hero:       { paddingTop: 16, paddingBottom: 32, paddingHorizontal: 22, overflow: "hidden" },
    backBtn:    { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", justifyContent: "center", alignItems: "center", marginBottom: 12 },
    blobA:      { position: "absolute", width: 180, height: 180, borderRadius: 90, right: -40, top: -40 },
    blobB:      { position: "absolute", width: 120, height: 120, borderRadius: 60, right: 60, top: 80 },
    heroBadge:  { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: "flex-start", marginBottom: 10 },
    heroBadgeText: { color: "#BFDBFE", fontSize: 12, fontWeight: "700" },
    heroTitle:  { fontSize: 22, fontWeight: "800", color: "#FFF", letterSpacing: -0.3, marginBottom: 6 },
    heroSub:    { fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 19, marginBottom: 18 },

    // Step indicator
    stepRow:       { flexDirection: "row", alignItems: "center", marginBottom: 6 },
    stepDot:       { width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center" },
    stepDotActive: { backgroundColor: "#FFF", shadowColor: "#FFF", shadowOpacity: 0.4, shadowRadius: 6, elevation: 4 },
    stepNum:       { fontSize: 12, fontWeight: "800", color: "rgba(255,255,255,0.7)" },
    stepLine:      { flex: 1, height: 2, backgroundColor: "rgba(255,255,255,0.25)", marginHorizontal: 4 },
    stepLabelRow:  { flexDirection: "row", justifyContent: "space-between" },
    stepLabel:     { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.5)", flex: 1, textAlign: "center" },

    // Form
    scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 100 },
    card:   { borderRadius: 24, borderWidth: 1, padding: 22, shadowColor: "#2563EB", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 },

    // Error banner
    errorBanner:     { flexDirection: "row", alignItems: "center", borderRadius: 14, overflow: "hidden", marginBottom: 18, paddingVertical: 11, paddingRight: 14, backgroundColor: "#FEF2F2" },
    errorAccent:     { width: 4, alignSelf: "stretch", backgroundColor: "#DC2626", borderRadius: 2, marginRight: 6 },
    errorBannerText: { color: "#DC2626", fontSize: 13, fontWeight: "500", flex: 1, marginLeft: 8 },

    // Section header
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
    sectionDot:    { width: 8, height: 8, borderRadius: 4 },
    sectionLabel:  { fontSize: 11, fontWeight: "700", letterSpacing: 1.2 },

    // Input
    fieldLabel: { fontSize: 12, fontWeight: "700", marginBottom: 6 },
    inputWrap:  { flexDirection: "row", alignItems: "center", height: 52, borderRadius: 14, paddingHorizontal: 14, marginBottom: 4, shadowOffset: { width: 0, height: 2 } },
    inputText:  { flex: 1, fontSize: 14, fontWeight: "500" },

    // Error
    errRow:  { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10, marginTop: -2, marginLeft: 2 },
    errText: { color: "#EF4444", fontSize: 12, fontWeight: "500" },

    // Hint box
    hintBox:  { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 12, borderWidth: 1, padding: 10, marginBottom: 14, marginTop: -4 },
    hintText: { fontSize: 12, fontWeight: "500", flex: 1, lineHeight: 17 },

    // Password strength
    strengthRow:   { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8, paddingHorizontal: 2 },
    strengthBars:  { flexDirection: "row", gap: 4, flex: 1 },
    strengthSeg:   { flex: 1, height: 4, borderRadius: 2 },
    strengthLabel: { fontSize: 11, fontWeight: "700", width: 44, textAlign: "right" },

    // Department chips
    chipHint: { fontSize: 11, fontWeight: "600", marginBottom: 8, marginTop: 4 },
    chipRow:  { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 6 },
    chip:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
    chipText: { fontSize: 12, fontWeight: "700" },

    // Terms
    termsCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 14, marginTop: 6, marginBottom: 8, gap: 12 },
    checkbox:  { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: "#CBD5E1", justifyContent: "center", alignItems: "center", flexShrink: 0 },
    termsText: { fontSize: 13, flex: 1, lineHeight: 19 },
    termsLink: { fontWeight: "700" },

    // Review step
    reviewCard: { borderRadius: 18, borderWidth: 1, padding: 4, marginBottom: 16 },
    reviewRow:  { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, paddingHorizontal: 12 },
    reviewIco:  { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },

    // Buttons
    primaryBtn: { borderRadius: 18, overflow: "hidden", marginTop: 18, marginBottom: 20 },
    btnGrad:    { height: 54, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12 },
    btnText:    { color: "#FFF", fontSize: 16, fontWeight: "800", letterSpacing: 0.2 },
    arrowCircle:{ width: 34, height: 34, borderRadius: 17, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center" },

    // Footer
    footerRow:  { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 8 },
    footerLink: { fontSize: 14, fontWeight: "700" },
});

