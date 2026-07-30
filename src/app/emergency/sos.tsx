import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Linking,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTheme } from "@/utils/themeManager";

// ─── Emergency contacts ───────────────────────────────────────────────────────

const EMERGENCY_NUMBERS = [
    { label: "Ambulance",       number: "108", icon: "ambulance",           color: "#EF4444", bg: "#FEF2F2" },
    { label: "Police",          number: "100", icon: "police-badge-outline", color: "#2563EB", bg: "#EFF6FF" },
    { label: "Fire Brigade",    number: "101", icon: "fire-truck",           color: "#F97316", bg: "#FFF7ED" },
    { label: "Disaster Mgmt",   number: "108", icon: "shield-alert-outline", color: "#8B5CF6", bg: "#F5F3FF" },
    { label: "Women Helpline",  number: "1091", icon: "human-female",        color: "#EC4899", bg: "#FDF2F8" },
    { label: "Child Helpline",  number: "1098", icon: "baby-face-outline",   color: "#0D9488", bg: "#F0FDFA" },
];

// ─── Quick tips ───────────────────────────────────────────────────────────────

const TIPS = [
    { icon: "heart-pulse",         text: "Stay calm and breathe slowly." },
    { icon: "map-marker-outline",  text: "Share your exact location with the dispatcher." },
    { icon: "phone-in-talk",       text: "Stay on the line until help arrives." },
    { icon: "medical-bag",         text: "Do not move an injured person unless in immediate danger." },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SOSScreen() {
    const router  = useRouter();
    const { colors, isDark } = useTheme();
    const [calling, setCalling] = useState<string | null>(null);

    const handleCall = (number: string, label: string) => {
        Alert.alert(
            `Call ${label}`,
            `Dial ${number}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: `Call ${number}`,
                    style: "destructive",
                    onPress: () => {
                        setCalling(number);
                        Linking.openURL(`tel:${number}`).finally(() =>
                            setTimeout(() => setCalling(null), 3000)
                        );
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView
            style={[styles.root, { backgroundColor: colors.background }]}
            edges={["top"]}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.backBtn, { backgroundColor: isDark ? colors.card : "#F8FAFC" }]}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="arrow-left" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Emergency SOS</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* SOS Hero banner */}
                <LinearGradient
                    colors={["#DC2626", "#EF4444"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sosBanner}
                >
                    <View style={styles.sosPulse}>
                        <MaterialCommunityIcons name="sos" size={52} color="#FFFFFF" />
                    </View>
                    <Text style={styles.sosTitle}>Emergency SOS</Text>
                    <Text style={styles.sosSub}>
                        Tap any service below to call immediately.{"\n"}
                        Your safety is the top priority.
                    </Text>
                </LinearGradient>

                {/* Emergency numbers grid */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Emergency Services
                </Text>
                <View style={styles.grid}>
                    {EMERGENCY_NUMBERS.map((item) => (
                        <TouchableOpacity
                            key={item.label}
                            style={[
                                styles.emergencyCard,
                                {
                                    backgroundColor: isDark ? colors.card : "#FFFFFF",
                                    borderColor: isDark ? colors.cardBorder : "#F1F5F9",
                                },
                                calling === item.number && { borderColor: item.color, borderWidth: 2 },
                            ]}
                            activeOpacity={0.82}
                            onPress={() => handleCall(item.number, item.label)}
                        >
                            <View style={[styles.emergencyIcon, { backgroundColor: item.bg }]}>
                                <MaterialCommunityIcons
                                    name={item.icon as any}
                                    size={26}
                                    color={item.color}
                                />
                            </View>
                            <Text style={[styles.emergencyLabel, { color: colors.text }]}>
                                {item.label}
                            </Text>
                            <View style={[styles.numberPill, { backgroundColor: item.bg }]}>
                                <MaterialCommunityIcons
                                    name="phone-outline"
                                    size={11}
                                    color={item.color}
                                />
                                <Text style={[styles.numberText, { color: item.color }]}>
                                    {item.number}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Quick tips */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    What to do in an Emergency
                </Text>
                <View
                    style={[
                        styles.tipsCard,
                        {
                            backgroundColor: isDark ? colors.card : "#FFFFFF",
                            borderColor: isDark ? colors.cardBorder : "#F1F5F9",
                        },
                    ]}
                >
                    {TIPS.map((tip, i) => (
                        <View key={i} style={[styles.tipRow, i < TIPS.length - 1 && styles.tipRowBorder, { borderColor: isDark ? colors.cardBorder : "#F1F5F9" }]}>
                            <View style={styles.tipIcon}>
                                <MaterialCommunityIcons
                                    name={tip.icon as any}
                                    size={18}
                                    color="#EF4444"
                                />
                            </View>
                            <Text style={[styles.tipText, { color: colors.text }]}>
                                {tip.text}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Health card link */}
                <TouchableOpacity
                    style={[
                        styles.healthCardBtn,
                        { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isDark ? colors.cardBorder : "#F1F5F9" },
                    ]}
                    activeOpacity={0.85}
                    onPress={() => router.push("/emergency/emergency-card")}
                >
                    <View style={[styles.healthCardIcon, { backgroundColor: "#FEF2F2" }]}>
                        <MaterialCommunityIcons name="card-account-details-outline" size={24} color="#EF4444" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.healthCardTitle, { color: colors.text }]}>
                            My Emergency Health Card
                        </Text>
                        <Text style={[styles.healthCardSub, { color: colors.textSecondary }]}>
                            Blood group, allergies, medications & contacts
                        </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#94A3B8" />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1 },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "800",
        letterSpacing: -0.3,
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 50,
        gap: 20,
    },

    // SOS Banner
    sosBanner: {
        borderRadius: 24,
        padding: 28,
        alignItems: "center",
        gap: 10,
    },
    sosPulse: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 4,
    },
    sosTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: -0.4,
    },
    sosSub: {
        fontSize: 14,
        color: "rgba(255,255,255,0.85)",
        textAlign: "center",
        lineHeight: 21,
    },

    // Section title
    sectionTitle: {
        fontSize: 17,
        fontWeight: "800",
        letterSpacing: -0.3,
        marginBottom: 4,
    },

    // Emergency grid
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    emergencyCard: {
        width: "47%",
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
        alignItems: "center",
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    emergencyIcon: {
        width: 54,
        height: 54,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    emergencyLabel: {
        fontSize: 13,
        fontWeight: "700",
        textAlign: "center",
    },
    numberPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    numberText: {
        fontSize: 12,
        fontWeight: "800",
    },

    // Tips card
    tipsCard: {
        borderRadius: 18,
        borderWidth: 1,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    tipRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        gap: 12,
    },
    tipRowBorder: {
        borderBottomWidth: 1,
    },
    tipIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: "#FEF2F2",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
    },
    tipText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 19,
        fontWeight: "500",
    },

    // Health card button
    healthCardBtn: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
        gap: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    healthCardIcon: {
        width: 46,
        height: 46,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    healthCardTitle: {
        fontSize: 14,
        fontWeight: "700",
    },
    healthCardSub: {
        fontSize: 12,
        marginTop: 2,
        lineHeight: 17,
    },
});
