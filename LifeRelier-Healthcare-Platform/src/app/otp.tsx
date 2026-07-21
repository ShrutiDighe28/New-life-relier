import React, { useRef, useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    ActivityIndicator,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import LogoBrand from "@/components/LogoBrand";
import { useAuth } from "@/context/AuthContext";

export default function OtpScreen() {
    const router = useRouter();
    const { pendingUser, verifyOtp, requestOtp } = useAuth();

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const inputs = useRef<TextInput[]>([]);

    const [seconds, setSeconds] = useState(30);

    useEffect(() => {
        if (seconds === 0) return;

        const timer = setInterval(() => {
            setSeconds((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [seconds]);

    const handleChange = (
        value: string,
        index: number
    ) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleBackspace = (
        value: string,
        index: number
    ) => {
        if (!value && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        setErrorMsg("");
        const code = otp.join("");
        if (code.length < 6) {
            setErrorMsg("Please enter the complete 6-digit OTP.");
            return;
        }

        if (!pendingUser) {
            // No active registration session — force back to register
            setErrorMsg("Session expired. Please restart registration.");
            setTimeout(() => router.replace("/register"), 1500);
            return;
        }

        setLoading(true);
        const success = await verifyOtp(pendingUser.email.toLowerCase(), code);
        setLoading(false);
        
        if (success) {
            router.replace("/create-profile");
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
        } catch {
            setErrorMsg("Failed to resend OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>

            {/* Bottom Waves */}

            <Svg
                width="100%"
                height={220}
                viewBox="0 0 430 220"
                preserveAspectRatio="xMidYMax slice"
                style={styles.wave}
            >
                <Path
                    d="M0 60 C120 10 250 120 430 70 L430 220 L0 220 Z"
                    fill="#EEF5FF"
                />

                <Path
                    d="M0 95 C140 50 260 150 430 95 L430 220 L0 220 Z"
                    fill="#DCEBFF"
                />

                <Path
                    d="M0 125 C150 80 260 180 430 135 L430 220 L0 220 Z"
                    fill="#2563EB"
                />
            </Svg>

            <SafeAreaView
                style={styles.container}
                edges={["top", "left", "right"]}
            >

                {/* Decorations */}

                <Image
                    source={require("@/assets/images/decorations/plus.png")}
                    style={[styles.plus, { top: 70, left: 25 }]}
                />

                <Image
                    source={require("@/assets/images/decorations/hexagon.png")}
                    style={[styles.hexagon, { top: 120, right: -20 }]}
                />

                <Image
                    source={require("@/assets/images/decorations/dots.png")}
                    style={[styles.dots, { top: 220, left: 10 }]}
                />

                {/* Back Button */}

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <MaterialCommunityIcons
                        name="arrow-left"
                        size={24}
                        color="#071739"
                    />
                </TouchableOpacity>

                {/* Logo */}

                <LogoBrand size={40} fontSize={28} style={{ marginTop: 24 }} centered />

                <Text style={styles.subtitle}>
                    Healthcare Platform
                </Text>

                {/* Heading */}

                <Text style={styles.heading}>
                    OTP Verification
                </Text>

                <Text style={styles.description}>
                    {pendingUser 
                        ? `We've sent a 6-digit verification\ncode to ${pendingUser.email} and ${pendingUser.mobile}.`
                        : "We've sent a 6-digit verification\ncode to your registered email/mobile."}
                </Text>

                {errorMsg ? (
                    <Text style={styles.errorText}>{errorMsg}</Text>
                ) : null}

                {/* OTP Boxes */}

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => {
                                if (ref) inputs.current[index] = ref;
                            }}
                            style={styles.otpInput}
                            value={digit}
                            onChangeText={(value) =>
                                handleChange(value, index)
                            }
                            onKeyPress={({ nativeEvent }) => {
                                if (nativeEvent.key === "Backspace") {
                                    handleBackspace(digit, index);
                                }
                            }}
                            keyboardType="number-pad"
                            maxLength={1}
                            textAlign="center"
                        />
                    ))}
                </View>

                {/* Timer */}

                <Text style={styles.timerText}>
                    {seconds > 0
                        ? `Resend OTP in 00:${seconds
                            .toString()
                            .padStart(2, "0")}`
                        : "Didn't receive the code?"}
                </Text>

                {/* ================= Resend OTP ================= */}

                <TouchableOpacity
                    disabled={seconds > 0}
                    onPress={handleResend}
                >
                    <Text
                        style={[
                            styles.resendText,
                            {
                                opacity: seconds > 0 ? 0.5 : 1,
                            },
                        ]}
                    >
                        Resend OTP
                    </Text>
                </TouchableOpacity>

                {/* ================= Verify Button ================= */}

                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleVerify}
                    style={styles.buttonContainer}
                >
                    <LinearGradient
                        colors={["#2563EB", "#0A48D6"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.button}
                    >
                        <View style={styles.buttonContent}>
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <>
                                    <Text style={styles.buttonText}>
                                        Verify OTP
                                    </Text>

                                    <View style={styles.arrowCircle}>
                                        <MaterialCommunityIcons
                                            name="arrow-right"
                                            size={24}
                                            color="#2563EB"
                                        />
                                    </View>
                                </>
                            )}
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

            </SafeAreaView>

        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    container: {
        flex: 1,
        paddingHorizontal: 24,
        alignItems: "center",
    },

    backButton: {
        alignSelf: "flex-start",

        width: 44,
        height: 44,

        borderRadius: 22,

        backgroundColor: "#FFFFFF",

        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,

        elevation: 4,

        marginBottom: 18,
    },

    logo: {
        width: 260,
        height: 72,
        resizeMode: "contain",
        marginTop: 10,
    },

    subtitle: {
        marginTop: -6,
        fontSize: 18,
        color: "#64748B",
        fontWeight: "500",
    },

    heading: {
        marginTop: 28,
        fontSize: 34,
        fontWeight: "800",
        color: "#071739",
        textAlign: "center",
    },

    description: {
        marginTop: 12,
        marginBottom: 34,

        textAlign: "center",

        fontSize: 17,
        color: "#64748B",

        lineHeight: 26,
    },

    otpContainer: {
        width: "100%",

        flexDirection: "row",
        justifyContent: "space-between",

        marginBottom: 34,
    },

    otpInput: {
        width: 52,
        height: 60,

        backgroundColor: "#FFFFFF",

        borderRadius: 18,

        fontSize: 24,
        fontWeight: "700",

        color: "#071739",

        borderWidth: 1,
        borderColor: "#E2E8F0",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.06,
        shadowRadius: 10,

        elevation: 5,
    },

    timerText: {
        fontSize: 16,
        color: "#64748B",
        marginBottom: 10,
    },

    resendText: {
        fontSize: 17,
        color: "#2563EB",
        fontWeight: "700",
        marginBottom: 34,
    },

    buttonContainer: {
        width: "100%",
    },

    button: {
        height: 64,

        borderRadius: 32,

        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#2563EB",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.30,
        shadowRadius: 12,

        elevation: 10,
    },

    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
    },

    buttonText: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "700",
        marginRight: 16,
    },

    arrowCircle: {
        width: 42,
        height: 42,

        borderRadius: 21,

        backgroundColor: "#FFFFFF",

        justifyContent: "center",
        alignItems: "center",
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
        opacity: 0.35,
    },

    dots: {
        position: "absolute",
        width: 58,
        height: 58,
        resizeMode: "contain",
        opacity: 0.45,
    },

    wave: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
    },
    errorText: {
        color: "#DC2626",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 16,
    },
});