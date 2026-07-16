import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Svg, { Path } from "react-native-svg";

import RoleCard from "@/components/RoleCard";
import { roles } from "@/constants/roles";

type Role = "patient" | "doctor" | "admin";

export default function RoleSelectionScreen() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<Role>("patient");

    const handleContinue = () => {
        switch (selectedRole) {
            case "patient":
                router.replace("/login");
                break;
            case "doctor":
                router.replace("/doctor/login");
                break;
            case "admin":
                router.replace("/admin/login");
                break;
            default:
                router.replace("/login");
        }
    };

    return (
        <View style={styles.root}>
            {/* Bottom Waves - Placed in the root container so they ignore 
              SafeArea insets and touch the absolute bottom of the screen.
            */}
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

            {/* Main Content Area */}
            <SafeAreaView
                style={styles.container}
                edges={["top", "left", "right"]}
            >
                {/* Background Decorations */}
                <Image
                    source={require("@/assets/images/decorations/plus.png")}
                    style={[styles.plus, { top: 70, left: 28 }]}
                />
                <Image
                    source={require("@/assets/images/decorations/plus.png")}
                    style={[styles.plus, { top: 110, right: 36 }]}
                />
                <Image
                    source={require("@/assets/images/decorations/hexagon.png")}
                    style={[styles.hexagon, { top: 150, left: -18 }]}
                />
                <Image
                    source={require("@/assets/images/decorations/hexagon.png")}
                    style={[styles.hexagon, { top: 105, right: -12 }]}
                />
                <Image
                    source={require("@/assets/images/decorations/dots.png")}
                    style={[styles.dots, { top: 255, left: 14 }]}
                />
                <Image
                    source={require("@/assets/images/decorations/dots.png")}
                    style={[styles.dots, { bottom: 185, right: 16 }]}
                />

                {/* Header Section */}
                <Image
                    source={require("@/assets/images/dashboard/profile.png")}
                    style={styles.logo}
                />
                <Text style={styles.subtitle}>Healthcare Platform</Text>

                <Text style={styles.heading}>Choose your role</Text>
                <Text style={styles.small}>to continue</Text>

                {/* Role Cards List */}
                <View style={styles.cards}>
                    {roles.map((role) => (
                        <RoleCard
                            key={role.id}
                            title={role.title}
                            description={role.description}
                            role={role.id as Role}
                            selected={selectedRole === role.id}
                            onPress={() => setSelectedRole(role.id as Role)}
                        />
                    ))}
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.buttonContainer}
                    onPress={handleContinue}
                >
                    <LinearGradient
                        colors={["#2563EB", "#0A48D6"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.button}
                    >
                        <View style={styles.buttonContent}>
                            <Text style={styles.buttonText}>Continue</Text>
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
    logo: {
        width: 285,
        height: 78,
        resizeMode: "contain",
        marginTop: 22,
        shadowColor: "#2563EB",
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 3,
    },
    subtitle: {
        marginTop: -5,
        fontSize: 18,
        fontWeight: "500",
        color: "#64748B",
    },
    heading: {
        marginTop: 30,
        fontSize: 34,
        fontWeight: "800",
        color: "#071739",
        textAlign: "center",
    },
    small: {
        marginTop: 8,
        fontSize: 18,
        color: "#64748B",
        textAlign: "center",
    },
    cards: {
        width: "100%",
        marginTop: 32,
        gap: 18,
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
        justifyContent: "center",
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
    plus: {
        position: "absolute",
        width: 22,
        height: 22,
        opacity: 0.45,
        resizeMode: "contain",
    },
    hexagon: {
        position: "absolute",
        width: 82,
        height: 82,
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
    },
});