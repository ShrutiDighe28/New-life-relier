import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Svg, { Path } from "react-native-svg";
import LogoBrand from "@/components/LogoBrand";

export default function ForgotPasswordScreen() {
    const router = useRouter();

    const [email, setEmail] = useState("");

    const handleSendOTP = () => {
        router.push("/otp");
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

                <Text style={styles.heading}>
                    Forgot Password?
                </Text>

                <Text style={styles.description}>
                    No worries! Enter your email or{"\n"}
                    mobile number to reset your password.
                </Text>

                {/* Email */}

                <View style={styles.inputContainer}>

                    <Image
                        source={require("@/assets/images/auth/email.png")}
                        style={styles.icon}
                    />

                    <TextInput
                        placeholder="Email or Mobile Number"
                        placeholderTextColor="#94A3B8"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                    />

                </View>        {/* ================= Send OTP Button ================= */}

                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleSendOTP}
                    style={styles.buttonContainer}
                >
                    <LinearGradient
                        colors={["#2563EB", "#0A48D6"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.button}
                    >
                        <View style={styles.buttonContent}>

                            <Text style={styles.buttonText}>
                                Send OTP
                            </Text>

                            <View style={styles.arrowCircle}>
                                <MaterialCommunityIcons
                                    name="arrow-right"
                                    size={24}
                                    color="#2563EB"
                                />
                            </View>

                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* ================= Back to Login ================= */}

                <View style={styles.loginContainer}>

                    <Text style={styles.loginText}>
                        Remember your password?
                    </Text>

                    <TouchableOpacity
                        onPress={() => router.replace("/login")}
                    >
                        <Text style={styles.signInText}>
                            Sign In
                        </Text>
                    </TouchableOpacity>

                </View>

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
    },

    backButton: {
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
        marginBottom: 20,
    },

    logo: {
        width: 270,
        height: 75,
        resizeMode: "contain",
        alignSelf: "center",
        marginTop: 10,
    },

    subtitle: {
        textAlign: "center",
        fontSize: 18,
        color: "#64748B",
        marginTop: -6,
        marginBottom: 26,
    },

    heading: {
        fontSize: 34,
        fontWeight: "800",
        color: "#071739",
        textAlign: "center",
    },

    description: {
        textAlign: "center",
        fontSize: 17,
        color: "#64748B",
        lineHeight: 25,
        marginTop: 12,
        marginBottom: 32,
    },

    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        height: 64,
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        paddingHorizontal: 18,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,

        elevation: 6,
    },

    icon: {
        width: 26,
        height: 26,
        resizeMode: "contain",
        marginRight: 14,
    },

    input: {
        flex: 1,
        fontSize: 16,
        color: "#071739",
    },

    buttonContainer: {
        width: "100%",
        marginTop: 34,
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
        marginRight: 14,
    },

    arrowCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },

    loginContainer: {
        alignItems: "center",
        marginTop: 28,
    },

    loginText: {
        fontSize: 16,
        color: "#64748B",
    },

    signInText: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: "700",
        color: "#2563EB",
    },

    plus: {
        position: "absolute",
        width: 22,
        height: 22,
        opacity: 0.45,
        resizeMode: "contain",
    },

    hexagon: {
        position: "absolute",
        width: 80,
        height: 80,
        opacity: 0.35,
        resizeMode: "contain",
    },

    dots: {
        position: "absolute",
        width: 58,
        height: 58,
        opacity: 0.45,
        resizeMode: "contain",
    },

    wave: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
    },
});