import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Svg, { Path } from "react-native-svg";
import LogoBrand from "@/components/LogoBrand";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/utils/themeManager";

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

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
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
            {/* Background Decorations */}
            <Image source={require("@/assets/images/decorations/plus.png")} style={[styles.plus, { top: 70, left: 30 }]} />
            <Image source={require("@/assets/images/decorations/plus.png")} style={[styles.plus, { top: 180, right: 32 }]} />
            <Image source={require("@/assets/images/decorations/hexagon.png")} style={[styles.hexagon, { top: 150, left: -18 }]} />
            <Image source={require("@/assets/images/decorations/hexagon.png")} style={[styles.hexagon, { top: 260, right: -12 }]} />
            <Image source={require("@/assets/images/decorations/dots.png")} style={[styles.dots, { top: 260, right: 18 }]} />

            {/* Back Button */}
            <TouchableOpacity
                style={[styles.backButton, { backgroundColor: isDark ? colors.card : "#FFFFFF" }]}
                onPress={() => router.back()}
            >
                <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>

            <KeyboardAvoidingView
                style={{ flex: 1, width: "100%" }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Branding */}
                    <View style={styles.brandingBlock}>
                        <LogoBrand size={44} fontSize={30} centered />
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Healthcare Platform</Text>
                    </View>

                    {/* Heading */}
                    <Text style={[styles.heading, { color: colors.text }]}>Doctor Portal 👋</Text>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>
                        Sign in to manage your appointments and patient care
                    </Text>

                    {/* Auth Error Banner */}
                    {authError ? (
                        <View style={styles.errorBanner}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#DC2626" />
                            <Text style={styles.errorBannerText}>{authError}</Text>
                        </View>
                    ) : null}

                    {/* Email Input */}
                    <View style={[
                        styles.inputContainer,
                        { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder },
                        emailError ? styles.inputError : null
                    ]}>
                        <Image source={require("@/assets/images/auth/email.png")} style={styles.inputIcon} />
                        <TextInput
                            placeholder="Doctor Email Address"
                            placeholderTextColor="#94A3B8"
                            value={email}
                            onChangeText={(v) => { setEmail(v); setEmailError(""); setAuthError(""); }}
                            style={[styles.input, { color: colors.text }]}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoCorrect={false}
                        />
                    </View>
                    {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

                    {/* Password Input */}
                    <View style={[
                        styles.inputContainer,
                        { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder },
                        passwordError ? styles.inputError : null
                    ]}>
                        <Image source={require("@/assets/images/auth/password.png")} style={styles.inputIcon} />
                        <TextInput
                            placeholder="Password"
                            placeholderTextColor="#94A3B8"
                            secureTextEntry={secureText}
                            value={password}
                            onChangeText={(v) => { setPassword(v); setPasswordError(""); setAuthError(""); }}
                            style={[styles.input, { color: colors.text }]}
                        />
                        <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                            <Image
                                source={secureText ? require("@/assets/images/auth/eye-off.png") : require("@/assets/images/auth/eye.png")}
                                style={styles.eyeIcon}
                            />
                        </TouchableOpacity>
                    </View>
                    {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}

                    {/* Remember Me + Forgot Password */}
                    <View style={styles.optionsRow}>
                        <TouchableOpacity style={styles.rememberContainer} onPress={() => setRememberMe(!rememberMe)}>
                            <View style={[styles.checkbox, rememberMe && styles.checkboxSelected]}>
                                {rememberMe && <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />}
                            </View>
                            <Text style={[styles.rememberText, { color: colors.textSecondary }]}>Remember Me</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push("/forgot-password")}>
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign In Button */}
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handleLogin}
                        style={[styles.buttonContainer, !isFormFilled && styles.buttonDisabled]}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={isFormFilled ? ["#0D9488", "#0A7870"] : ["#94A3B8", "#94A3B8"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.button}
                        >
                            <View style={styles.buttonContent}>
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.buttonText}>Sign In</Text>
                                        <View style={styles.arrowCircle}>
                                            <MaterialCommunityIcons name="arrow-right" size={24} color={isFormFilled ? "#0D9488" : "#94A3B8"} />
                                        </View>
                                    </>
                                )}
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Register Doctor Link */}
                    <View style={styles.registerContainer}>
                        <Text style={[styles.registerText, { color: colors.textSecondary }]}>New doctor?</Text>
                        <TouchableOpacity onPress={() => router.push("/doctor/register")}>
                            <Text style={styles.createAccount}>Register here</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={[styles.line, { backgroundColor: colors.cardBorder }]} />
                        <Text style={[styles.orText, { color: colors.textSecondary }]}>OR</Text>
                        <View style={[styles.line, { backgroundColor: colors.cardBorder }]} />
                    </View>

                    {/* Google Sign In */}
                    <TouchableOpacity style={[styles.googleButton, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}>
                        <Image source={require("@/assets/images/auth/google.png")} style={styles.googleIcon} />
                        <Text style={[styles.googleText, { color: colors.text }]}>Continue with Google</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom SVG Waves - Teal Palette */}
            <Svg width="100%" height={160} style={styles.wave} viewBox="0 0 430 160" preserveAspectRatio="xMidYMax slice">
                <Path d="M0 70 C120 15 250 120 430 70 L430 160 L0 160 Z" fill={isDark ? "#115E59" : "#F0FDFA"} />
                <Path d="M0 100 C150 55 280 160 430 105 L430 160 L0 160 Z" fill={isDark ? "#0F766E" : "#CCFBF1"} />
                <Path d="M0 130 C170 85 290 180 430 130 L430 160 L0 160 Z" fill="#0D9488" />
            </Svg>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 80,
        paddingBottom: 180,
        alignItems: "center",
        width: "100%",
    },
    backButton: {
        position: "absolute",
        top: 55,
        left: 24,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        zIndex: 10,
    },
    brandingBlock: {
        alignItems: "center",
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: "500",
        marginTop: 4,
    },
    heading: {
        fontSize: 30,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 22,
    },
    errorBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FCA5A5",
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        width: "100%",
        marginBottom: 16,
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
        height: 60,
        borderRadius: 20,
        borderWidth: 1.5,
        paddingHorizontal: 16,
        width: "100%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    inputError: {
        borderColor: "#EF4444",
    },
    inputIcon: {
        width: 22,
        height: 22,
        resizeMode: "contain",
        marginRight: 12,
    },
    eyeIcon: {
        width: 22,
        height: 22,
        resizeMode: "contain",
        tintColor: "#64748B",
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: "100%",
    },
    fieldError: {
        alignSelf: "flex-start",
        color: "#EF4444",
        fontSize: 12,
        marginTop: 4,
        marginBottom: 8,
        marginLeft: 4,
    },
    optionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginTop: 16,
        marginBottom: 24,
    },
    rememberContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: "#CBD5E1",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    checkboxSelected: {
        backgroundColor: "#0D9488",
        borderColor: "#0D9488",
    },
    rememberText: {
        fontSize: 14,
    },
    forgotText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0D9488",
    },
    buttonContainer: {
        width: "100%",
        marginBottom: 20,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    button: {
        height: 62,
        borderRadius: 31,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "700",
        marginRight: 12,
    },
    arrowCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },
    registerContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 24,
    },
    registerText: {
        fontSize: 14,
    },
    createAccount: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0D9488",
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginBottom: 24,
    },
    line: {
        flex: 1,
        height: 1,
    },
    orText: {
        marginHorizontal: 12,
        fontSize: 12,
        fontWeight: "600",
    },
    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 56,
        borderRadius: 28,
        borderWidth: 1.5,
        width: "100%",
        gap: 10,
    },
    googleIcon: {
        width: 22,
        height: 22,
        resizeMode: "contain",
    },
    googleText: {
        fontSize: 16,
        fontWeight: "600",
    },
    plus: {
        position: "absolute",
        width: 22,
        height: 22,
        opacity: 0.35,
        resizeMode: "contain",
    },
    hexagon: {
        position: "absolute",
        width: 70,
        height: 70,
        opacity: 0.25,
        resizeMode: "contain",
    },
    dots: {
        position: "absolute",
        width: 50,
        height: 50,
        opacity: 0.35,
        resizeMode: "contain",
    },
    wave: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
});