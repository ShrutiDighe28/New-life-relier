import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
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
    const primaryColor = colors.primary || "#2563EB";

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "left", "right", "bottom"]}>
            <View style={styles.content}>
                {/* Branding */}
                <View style={styles.brandingBlock}>
                    <LogoBrand size={38} fontSize={22} centered />
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Healthcare Doctor Verification</Text>
                </View>

                {/* Status Clock Icon */}
                <View style={[styles.iconCircle, { backgroundColor: isDark ? "rgba(37, 99, 235, 0.15)" : "#EFF6FF", borderColor: isDark ? "#1E3A8A" : "#DBEAFE" }]}>
                    <MaterialCommunityIcons name="clock-time-four-outline" size={70} color={primaryColor} />
                </View>

                {/* Heading & Subtext */}
                <Text style={[styles.heading, { color: colors.text }]}>Application Under Review</Text>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    Your practitioner credentials and State Medical Council registration are being verified. You can explore the Doctor Dashboard while your background check completes.
                </Text>

                {/* Status Checklist */}
                <View style={[styles.checklistCard, { backgroundColor: isDark ? colors.card : "#F8FAFC", borderColor: colors.cardBorder }]}>
                    <View style={styles.checkItem}>
                        <MaterialCommunityIcons name="check-circle" size={22} color={colors.success} />
                        <Text style={[styles.checkTextDone, { color: colors.text }]}>Doctor Profile submitted</Text>
                    </View>

                    <View style={styles.checkItem}>
                        <MaterialCommunityIcons name="check-circle" size={22} color={colors.success} />
                        <Text style={[styles.checkTextDone, { color: colors.text }]}>Medical Council Registration saved</Text>
                    </View>

                    <View style={styles.checkItem}>
                        <MaterialCommunityIcons name="clock-outline" size={22} color={primaryColor} />
                        <Text style={[styles.checkTextPending, { color: primaryColor }]}>Credential verification pending</Text>
                    </View>

                    <View style={styles.checkItem}>
                        <MaterialCommunityIcons name="shield-check-outline" size={22} color={colors.textMuted} />
                        <Text style={[styles.checkTextUpcoming, { color: colors.textSecondary }]}>Verified Practitioner Badge</Text>
                    </View>
                </View>

                {/* Info Banner */}
                <View style={[styles.infoCard, { backgroundColor: isDark ? "rgba(37, 99, 235, 0.1)" : "#EFF6FF", borderColor: isDark ? "#1E3A8A" : "#BFDBFE" }]}>
                    <MaterialCommunityIcons name="information-outline" size={20} color={primaryColor} />
                    <Text style={[styles.infoText, { color: isDark ? "#93C5FD" : "#1E40AF" }]}>
                        Verification takes up to 24 hours. Full access to digital e-prescriptions will activate upon review.
                    </Text>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonBlock}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.btnWrapper}
                    onPress={() => router.replace("/doctor/(tabs)/dashboard")}
                >
                    <LinearGradient
                        colors={isDark ? ["#3B82F6", "#1D4ED8"] : ["#2563EB", "#1D4ED8"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.primaryButton}
                    >
                        <Text style={styles.primaryButtonText}>Enter Doctor Dashboard</Text>
                        <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.secondaryButton, { borderColor: colors.cardBorder }]}
                    onPress={() => router.replace("/doctor/login")}
                >
                    <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>Return to Login</Text>
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
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: "600",
        marginTop: 4,
    },
    iconCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 2,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    checklistCard: {
        width: "100%",
        borderRadius: 20,
        borderWidth: 1,
        padding: 16,
        gap: 12,
        marginBottom: 16,
    },
    checkItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
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
        borderWidth: 1,
        borderRadius: 14,
        padding: 12,
        width: "100%",
        gap: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 17,
        fontWeight: "500",
    },
    buttonBlock: {
        width: "100%",
        gap: 10,
    },
    btnWrapper: {
        width: "100%",
        borderRadius: 16,
        overflow: "hidden",
    },
    primaryButton: {
        height: 54,
        borderRadius: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    primaryButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    secondaryButton: {
        height: 48,
        borderRadius: 16,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: "600",
    },
});
