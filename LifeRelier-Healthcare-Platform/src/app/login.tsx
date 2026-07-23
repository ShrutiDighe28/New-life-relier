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

const isValidEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
const isValidMobile = (val: string) => /^[6-9]\d{9}$/.test(val);

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useAuth();

    const [emailOrMobile, setEmailOrMobile] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [secureText, setSecureText] = useState(true);
    const [loading, setLoading] = useState(false);

    // Error states
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [authError, setAuthError] = useState("");

    const validateFields = (): boolean => {
        let valid = true;
        setEmailError("");
        setPasswordError("");
        setAuthError("");

        const trimmed = emailOrMobile.trim();
        if (!trimmed) {
            setEmailError("Email or mobile number is required.");
            valid = false;
        } else if (!isValidEmail(trimmed) && !isValidMobile(trimmed)) {
            setEmailError("Enter a valid email address or 10-digit mobile number.");
            valid = false;
        }

        if (!password) {
            setPasswordError("Password is required.");
            valid = false;
        } else if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters.");
            valid = false;
        }

        return valid;
    };

    const handleLogin = async () => {
        if (!validateFields()) return;
        setLoading(true);
        try {
            const success = await login(emailOrMobile.trim(), password);
            if (success) {
                router.replace("/(tabs)/home");
            } else {
                setAuthError("Invalid credentials. Please check your email/mobile and password.");
            }
        } catch {
            setAuthError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const isFormFilled = emailOrMobile.trim().length > 0 && password.length >= 6;

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>

            {/* Decorations */}
            <Image source={require("@/assets/images/decorations/plus.png")} style={[styles.plus, { top: 70, left: 30 }]} />
            <Image source={require("@/assets/images/decorations/plus.png")} style={[styles.plus, { top: 180, right: 32 }]} />
            <Image source={require("@/assets/images/decorations/hexagon.png")} style={[styles.hexagon, { top: 150, left: -18 }]} />
            <Image source={require("@/assets/images/decorations/hexagon.png")} style={[styles.hexagon, { top: 260, right: -12 }]} />
            <Image source={require("@/assets/images/decorations/dots.png")} style={[styles.dots, { top: 260, right: 18 }]} />

            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#071739" />
            </TouchableOpacity>

            <KeyboardAvoidingView
                style={{ flex: 1, width: "100%" }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={0}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Branding */}
                    <View style={styles.brandingBlock}>
                        <LogoBrand size={44} fontSize={30} centered />
                        <Text style={styles.subtitle}>Healthcare Platform</Text>
                    </View>

                    {/* Heading */}
                    <Text style={styles.heading}>Welcome Back! 👋</Text>
                    <Text style={styles.description}>
                        Sign in to continue your{"\n"}healthcare journey
                    </Text>

                    {/* Auth Error Banner */}
                    {authError ? (
                        <View style={styles.errorBanner}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#DC2626" />
                            <Text style={styles.errorBannerText}>{authError}</Text>
                        </View>
                    ) : null}

                    {/* Email / Mobile Input */}
                    <View style={[styles.inputContainer, emailError ? styles.inputError : null]}>
                        <MaterialCommunityIcons name="account-outline" size={24} color="#64748B" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Email or Mobile Number"
                            placeholderTextColor="#94A3B8"
                            value={emailOrMobile}
                            onChangeText={(v) => { setEmailOrMobile(v); setEmailError(""); setAuthError(""); }}
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>
                    {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

                    {/* Password Input */}
                    <View style={[styles.inputContainer, passwordError ? styles.inputError : null]}>
                        <MaterialCommunityIcons name="lock-outline" size={24} color="#64748B" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Password"
                            placeholderTextColor="#94A3B8"
                            secureTextEntry={secureText}
                            value={password}
                            onChangeText={(v) => { setPassword(v); setPasswordError(""); setAuthError(""); }}
                            style={styles.input}
                        />
                        <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                            <MaterialCommunityIcons name={secureText ? "eye-off-outline" : "eye-outline"} size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>
                    {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}

                    {/* Remember Me + Forgot Password */}
                    <View style={styles.optionsRow}>
                        <TouchableOpacity style={styles.rememberContainer} onPress={() => setRememberMe(!rememberMe)}>
                            <View style={[styles.checkbox, rememberMe && styles.checkboxSelected]}>
                                {rememberMe && <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />}
                            </View>
                            <Text style={styles.rememberText}>Remember Me</Text>
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
                            colors={isFormFilled ? ["#2563EB", "#0A48D6"] : ["#94A3B8", "#94A3B8"]}
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
                                            <MaterialCommunityIcons name="arrow-right" size={24} color={isFormFilled ? "#2563EB" : "#94A3B8"} />
                                        </View>
                                    </>
                                )}
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Create Account */}
                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>{"Don't have an account?"}</Text>
                        <TouchableOpacity onPress={() => router.push("/register")}>
                            <Text style={styles.createAccount}>Create Account</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.line} />
                        <Text style={styles.orText}>OR</Text>
                        <View style={styles.line} />
                    </View>

                    {/* Google */}
                    <TouchableOpacity style={styles.googleButton}>
                        <Image source={require("@/assets/images/auth/google.png")} style={styles.googleIcon} />
                        <Text style={styles.googleText}>Continue with Google</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Waves */}
            <Svg width="100%" height={160} style={styles.wave}>
                <Path d="M0 70 C120 15 250 120 430 70 L430 160 L0 160 Z" fill="#EEF5FF" />
                <Path d="M0 100 C150 55 280 160 430 105 L430 160 L0 160 Z" fill="#D8E9FF" />
                <Path d="M0 130 C170 85 290 180 430 130 L430 160 L0 160 Z" fill="#2563EB" />
            </Svg>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
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
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        zIndex: 10,
    },

    brandingBlock: {
        alignItems: "center",
        marginBottom: 8,
    },

    subtitle: {
        marginTop: 4,
        fontSize: 15,
        color: "#64748B",
        fontWeight: "500",
        letterSpacing: 0.3,
    },

    heading: {
        marginTop: 20,
        fontSize: 30,
        fontWeight: "800",
        color: "#071739",
        textAlign: "center",
    },

    description: {
        marginTop: 10,
        fontSize: 16,
        color: "#64748B",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 24,
    },

    errorBanner: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FECACA",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
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
        width: "100%",
        height: 60,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 18,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        marginBottom: 6,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 4,
    },

    inputError: {
        borderColor: "#FCA5A5",
        backgroundColor: "#FFF9F9",
    },

    inputIcon: {
        marginRight: 12,
    },

    input: {
        flex: 1,
        fontSize: 16,
        color: "#071739",
    },

    fieldError: {
        width: "100%",
        color: "#DC2626",
        fontSize: 12,
        marginBottom: 10,
        marginLeft: 4,
    },

    optionsRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
        marginBottom: 24,
    },

    rememberContainer: {
        flexDirection: "row",
        alignItems: "center",
    },

    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#CBD5E1",
        justifyContent: "center",
        alignItems: "center",
    },

    checkboxSelected: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },

    rememberText: {
        marginLeft: 8,
        fontSize: 14,
        color: "#071739",
        fontWeight: "500",
    },

    forgotText: {
        color: "#2563EB",
        fontSize: 14,
        fontWeight: "600",
    },

    buttonContainer: {
        width: "100%",
    },

    buttonDisabled: {
        opacity: 0.7,
    },

    button: {
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },

    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
    },

    buttonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "700",
        marginRight: 16,
    },

    arrowCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },

    registerContainer: {
        alignItems: "center",
        marginTop: 22,
    },

    registerText: {
        color: "#64748B",
        fontSize: 15,
    },

    createAccount: {
        marginTop: 6,
        color: "#2563EB",
        fontSize: 16,
        fontWeight: "700",
    },

    dividerContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 24,
    },

    line: {
        flex: 1,
        height: 1,
        backgroundColor: "#E2E8F0",
    },

    orText: {
        marginHorizontal: 16,
        color: "#94A3B8",
        fontWeight: "700",
        fontSize: 14,
    },

    googleButton: {
        width: "100%",
        height: 58,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 4,
    },

    googleIcon: {
        width: 24,
        height: 24,
        resizeMode: "contain",
        marginRight: 12,
    },

    googleText: {
        color: "#071739",
        fontSize: 16,
        fontWeight: "600",
    },

    plus: {
        position: "absolute",
        width: 22,
        height: 22,
        resizeMode: "contain",
        opacity: 0.45,
    },

    hexagon: {
        position: "absolute",
        width: 82,
        height: 82,
        resizeMode: "contain",
        opacity: 0.3,
    },

    dots: {
        position: "absolute",
        width: 56,
        height: 56,
        resizeMode: "contain",
        opacity: 0.4,
    },

    wave: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: -1,
    },
});