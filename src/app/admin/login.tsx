import LogoBrand from "@/components/LogoBrand";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/utils/themeManager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminLoginScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const { colors, isDark } = useTheme();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setError("");
        if (!email.trim() || !password.trim()) {
            setError("Please enter both email address and password.");
            return;
        }
        setLoading(true);
        try {
            const success = await login(email.trim(), password.trim());
            if (success) {
                router.replace("/admin/(tabs)/dashboard");
            } else {
                setError("Invalid email or password. Please try again.");
            }
        } catch (e: any) {
            setError(e?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        Alert.alert(
            "Password Reset",
            "Password reset instructions have been sent to the primary super-administrator email address.",
            [{ text: "OK" }]
        );
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
                <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                    {/* Header */}
                    <View style={s.topBar}>
                        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
                            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Logo + Title */}
                    <View style={s.heroSection}>
                        <LogoBrand size={48} fontSize={30} centered />
                        <Text style={[s.heroSub, { color: colors.textSecondary }]}>Administration Portal</Text>
                    </View>

                    {/* Gradient Banner */}
                    <LinearGradient
                        colors={isDark ? ["#064E3B", "#0D1F17"] : ["#059669", "#047857"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={s.banner}
                    >
                        <View style={s.bannerIcon}>
                            <MaterialCommunityIcons name="shield-crown-outline" size={32} color="#FFFFFF" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.bannerTitle}>Admin Access Control</Text>
                            <Text style={s.bannerSub}>Authorised personnel only. All access logs are recorded.</Text>
                        </View>
                    </LinearGradient>

                    {/* Form Card */}
                    <View style={[s.formCard, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}>
                        <Text style={[s.formTitle, { color: colors.text }]}>Sign In to Dashboard</Text>

                        {error ? (
                            <View style={s.errorBox}>
                                <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#EF4444" />
                                <Text style={s.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        {/* Username / Mobile / Email */}
                        <Text style={[s.label, { color: colors.textSecondary }]}>Username / Mobile / Email</Text>
                        <View style={[s.inputWrap, { backgroundColor: isDark ? colors.background : "#F8FAFC", borderColor: colors.cardBorder }]}>
                            <MaterialCommunityIcons name="account-outline" size={18} color={colors.primary} />
                            <TextInput
                                style={[s.input, { color: colors.text }]}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Username, Mobile or Email"
                                placeholderTextColor="#94A3B8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Password */}
                        <Text style={[s.label, { color: colors.textSecondary }]}>Password</Text>
                        <View style={[s.inputWrap, { backgroundColor: isDark ? colors.background : "#F8FAFC", borderColor: colors.cardBorder }]}>
                            <MaterialCommunityIcons name="lock-outline" size={18} color={colors.primary} />
                            <TextInput
                                style={[s.input, { color: colors.text }]}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Enter password"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                                <MaterialCommunityIcons name={showPassword ? "eye-outline" : "eye-off-outline"} size={18} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={s.forgotBtn} onPress={handleForgotPassword} activeOpacity={0.7}>
                            <Text style={[s.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[s.loginBtn, loading && { opacity: 0.7 }]}
                            onPress={handleLogin}
                            activeOpacity={0.88}
                            disabled={loading}>
                            <LinearGradient colors={["#2563EB", "#1D4ED8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.loginGradient}>
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Text style={s.loginBtnText}>Sign In</Text>
                                        <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Register link */}
                    <View style={s.registerRow}>
                        <Text style={{ fontSize: 14, color: colors.textSecondary }}>New admin?</Text>
                        <TouchableOpacity onPress={() => router.push("/admin/register" as any)} activeOpacity={0.7}>
                            <Text style={{ fontSize: 14, fontWeight: "700", color: colors.primary }}>Create an account</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 32 },
    topBar: { paddingTop: 12, marginBottom: 8 },
    backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
    heroSection: { alignItems: "center", paddingVertical: 20 },
    heroSub: { fontSize: 13, fontWeight: "600", marginTop: 6, letterSpacing: 0.5 },
    banner: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 18, padding: 16, marginBottom: 20 },
    bannerIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" },
    bannerTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
    bannerSub: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "500", marginTop: 2 },
    formCard: { borderRadius: 24, borderWidth: 1, padding: 20, marginBottom: 16 },
    formTitle: { fontSize: 18, fontWeight: "800", marginBottom: 18, letterSpacing: -0.3 },
    label: { fontSize: 12, fontWeight: "700", marginBottom: 6 },
    inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, height: 50, borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, marginBottom: 14 },
    input: { flex: 1, fontSize: 14, fontWeight: "500" },
    errorBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FEF2F2", borderRadius: 10, padding: 10, marginBottom: 14 },
    errorText: { color: "#EF4444", fontSize: 13, fontWeight: "600", flex: 1 },
    forgotBtn: { alignSelf: "flex-end", marginBottom: 20 },
    forgotText: { fontSize: 13, fontWeight: "700" },
    loginBtn: { borderRadius: 16, overflow: "hidden", marginTop: 4 },
    loginGradient: { height: 52, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 },
    loginBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },

    registerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 14, gap: 6 },
});
