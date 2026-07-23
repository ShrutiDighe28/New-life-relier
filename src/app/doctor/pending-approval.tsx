import React from "react";
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
import LogoBrand from "@/components/LogoBrand";
import { useTheme } from "@/utils/themeManager";

export default function DoctorPendingApprovalScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "left", "right", "bottom"]}>
            {/* Background Decorations */}
            <Image source={require("@/assets/images/decorations/plus.png")} style={[styles.plus, { top: 60, left: 25 }]} />
            <Image source={require("@/assets/images/decorations/hexagon.png")} style={[styles.hexagon, { top: 120, right: -20 }]} />
            <Image source={require("@/assets/images/decorations/dots.png")} style={[styles.dots, { top: 220, left: 10 }]} />

            <View style={styles.content}>
                {/* Branding */}
                <View style={styles.brandingBlock}>
                    <LogoBrand size={40} fontSize={28} centered />
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Healthcare Platform</Text>
                </View>

                {/* Animated / Large Clock Icon */}
                <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="clock-time-four-outline" size={80} color="#0D9488" />
                </View>

                {/* Heading & Subtext */}
                <Text style={[styles.heading, { color: colors.text }]}>Application Submitted!</Text>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    Your profile is under review. We'll notify you once verified by our admin team.
                </Text>

                {/* Status Checklist */}
                <View style={[styles.checklistCard, { backgroundColor: isDark ? colors.card : "#F8FAFC", borderColor: colors.cardBorder }]}>
                    <View style={styles.checkItem}>
                        <MaterialCommunityIcons name="check-circle" size={22} color="#10B981" />
                        <Text style={[styles.checkTextDone, { color: colors.text }]}>Profile information saved</Text>
                    </View>

                    <View style={styles.checkItem}>
                        <MaterialCommunityIcons name="check-circle" size={22} color="#10B981" />
                        <Text style={[styles.checkTextDone, { color: colors.text }]}>Documents uploaded</Text>
                    </View>

                    <View style={styles.checkItem}>
                        <MaterialCommunityIcons name="clock-outline" size={22} color="#0D9488" />
                        <Text style={[styles.checkTextPending, { color: "#0D9488" }]}>Admin verification pending</Text>
                    </View>

                    <View style={styles.checkItem}>
                        <MaterialCommunityIcons name="circle-outline" size={22} color="#94A3B8" />
                        <Text style={[styles.checkTextUpcoming, { color: colors.textSecondary }]}>Account activation</Text>
                    </View>
                </View>

                {/* Info Banner */}
                <View style={styles.infoCard}>
                    <MaterialCommunityIcons name="information-outline" size={22} color="#0D9488" />
                    <Text style={styles.infoText}>
                        Verification usually takes 24-48 hours. You'll receive an email and SMS once approved.
                    </Text>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonBlock}>
                {/* Contact Support Button */}
                <TouchableOpacity
                    style={[styles.supportButton, { borderColor: "#0D9488" }]}
                    onPress={() => router.push("/doctor/(tabs)/dashboard")}
                >
                    <Text style={styles.supportButtonText}>Preview Dashboard</Text>
                </TouchableOpacity>

                {/* Back to Home Button */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.homeButtonContainer}
                    onPress={() => router.replace("/welcome")}
                >
                    <LinearGradient
                        colors={["#0D9488", "#0A7870"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.homeButton}
                    >
                        <Text style={styles.homeButtonText}>Back to Welcome</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    content: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    brandingBlock: {
        alignItems: "center",
        marginBottom: 24,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: "500",
        marginTop: 4,
    },
    iconCircle: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: "#F0FDFA",
        borderWidth: 2,
        borderColor: "#CCFBF1",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 4,
    },
    heading: {
        fontSize: 26,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 24,
        paddingHorizontal: 12,
    },
    checklistCard: {
        width: "100%",
        borderRadius: 20,
        borderWidth: 1.5,
        padding: 18,
        gap: 14,
        marginBottom: 16,
    },
    checkItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    checkTextDone: {
        fontSize: 14,
        fontWeight: "600",
    },
    checkTextPending: {
        fontSize: 14,
        fontWeight: "700",
    },
    checkTextUpcoming: {
        fontSize: 14,
        fontWeight: "500",
    },
    infoCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0FDFA",
        borderWidth: 1.5,
        borderColor: "#CCFBF1",
        borderRadius: 16,
        padding: 14,
        width: "100%",
        gap: 10,
    },
    infoText: {
        flex: 1,
        color: "#0F766E",
        fontSize: 13,
        lineHeight: 18,
        fontWeight: "500",
    },
    buttonBlock: {
        width: "100%",
        gap: 12,
    },
    supportButton: {
        height: 56,
        borderRadius: 28,
        borderWidth: 1.5,
        justifyContent: "center",
        alignItems: "center",
    },
    supportButtonText: {
        color: "#0D9488",
        fontSize: 16,
        fontWeight: "700",
    },
    homeButtonContainer: {
        width: "100%",
    },
    homeButton: {
        height: 58,
        borderRadius: 29,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
    },
    homeButtonText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
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
});
