import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@/utils/themeManager";

interface PollenLevel {
    type: string;
    level: string;
    status: "low" | "moderate" | "high";
    color: string;
}

export default function EnvironmentalTrackerScreen() {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors, isDark);
    const router = useRouter();

    const pollenLevels: PollenLevel[] = [
        { type: "Grass Pollen", level: "High", status: "high", color: "#EF4444" },
        { type: "Tree Pollen", level: "Moderate", status: "moderate", color: "#F59E0B" },
        { type: "Weed Pollen", level: "Low", status: "low", color: "#10B981" },
    ];

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Environmental Tracker</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Location Bar */}
                <View style={styles.locationBar}>
                    <MaterialCommunityIcons name="map-marker" size={18} color="#2563EB" />
                    <Text style={styles.locationText}>New Delhi, DL • Current Location</Text>
                </View>

                {/* AQI Indicator Card */}
                <View style={styles.aqiCard}>
                    <View style={styles.aqiLeft}>
                        <Text style={styles.aqiLabel}>Air Quality Index</Text>
                        <Text style={styles.aqiValue}>142</Text>
                        <View style={styles.aqiBadge}>
                            <Text style={styles.aqiBadgeText}>Unhealthy (Sensitive Groups)</Text>
                        </View>
                    </View>

                    <View style={styles.aqiRadialMock}>
                        <View style={styles.radialRingOuter}>
                            <View style={styles.radialRingInner}>
                                <MaterialCommunityIcons name="weather-fog" size={26} color="#D97706" />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Air Pollutants Breakdown */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Key Air Pollutants</Text>
                    
                    <View style={styles.pollutantsGrid}>
                        <View style={styles.pollutantCol}>
                            <Text style={styles.pollutantName}>PM2.5</Text>
                            <Text style={styles.pollutantVal}>52.4 µg/m³</Text>
                            <Text style={[styles.pollutantStatus, { color: "#EF4444" }]}>High</Text>
                        </View>

                        <View style={styles.pollutantCol}>
                            <Text style={styles.pollutantName}>PM10</Text>
                            <Text style={styles.pollutantVal}>84.1 µg/m³</Text>
                            <Text style={[styles.pollutantStatus, { color: "#F59E0B" }]}>Moderate</Text>
                        </View>

                        <View style={styles.pollutantCol}>
                            <Text style={styles.pollutantName}>Ozone (O₃)</Text>
                            <Text style={styles.pollutantVal}>18.2 µg/m³</Text>
                            <Text style={[styles.pollutantStatus, { color: "#10B981" }]}>Good</Text>
                        </View>
                    </View>
                </View>

                {/* Pollen Tracker */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Allergen & Pollen Count</Text>
                    
                    {pollenLevels.map((pol, idx) => (
                        <View key={idx} style={styles.pollenRow}>
                            <View style={styles.pollenLeft}>
                                <MaterialCommunityIcons name="flower" size={16} color={colors.textSecondary} />
                                <Text style={styles.pollenName}>{pol.type}</Text>
                            </View>
                            <View style={styles.pollenRight}>
                                <Text style={[styles.pollenLevelVal, { color: pol.color }]}>{pol.level}</Text>
                                <View style={[styles.statusDotMini, { backgroundColor: pol.color }]} />
                            </View>
                        </View>
                    ))}
                </View>

                {/* Weather & UV Index */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Weather & Sun Safety</Text>
                    
                    <View style={styles.weatherRow}>
                        <View style={styles.weatherItem}>
                            <MaterialCommunityIcons name="thermometer" size={24} color="#EF4444" />
                            <View style={{ marginLeft: 8 }}>
                                <Text style={styles.weatherLabel}>Temperature</Text>
                                <Text style={styles.weatherVal}>34°C</Text>
                            </View>
                        </View>

                        <View style={styles.weatherItem}>
                            <MaterialCommunityIcons name="white-balance-sunny" size={24} color="#F59E0B" />
                            <View style={{ marginLeft: 8 }}>
                                <Text style={styles.weatherLabel}>UV Index</Text>
                                <Text style={styles.weatherVal}>8 (Very High)</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* AI Tailored Health Warning Recommendations */}
                <View style={styles.aiWarningCard}>
                    <View style={styles.aiWarningHeader}>
                        <MaterialCommunityIcons name="robot" size={20} color={isDark ? colors.secondary : "#1E3A8A"} />
                        <Text style={styles.aiWarningTitle}>AI Personal Risk Warnings</Text>
                    </View>
                    
                    <View style={styles.warningList}>
                        <View style={styles.warningRow}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#D97706" style={{ marginTop: 2 }} />
                            <Text style={styles.warningText}>
                                <Text style={{ fontWeight: "700" }}>Asthma & Respiratory Alert</Text>: Due to elevated PM2.5 and High Grass Pollen, consider wearing a mask during outdoor walks.
                            </Text>
                        </View>

                        <View style={styles.warningRow}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#D97706" style={{ marginTop: 2 }} />
                            <Text style={styles.warningText}>
                                <Text style={{ fontWeight: "700" }}>UV / Sun Safety</Text>: UV index is 8. Peak intensity is between 11 AM - 3 PM. Apply SPF 30+ sunscreen if stepping out.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        height: 60,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    headerBtn: {
        width: 38,
        height: 38,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.text,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    locationBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.card,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    locationText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.textSecondary,
        marginLeft: 6,
    },
    aqiCard: {
        backgroundColor: isDark ? "rgba(249, 115, 22, 0.12)" : "#FFF7ED",
        borderWidth: 1,
        borderColor: isDark ? "rgba(249, 115, 22, 0.3)" : "#FED7AA",
        borderRadius: 24,
        marginHorizontal: 20,
        marginTop: 20,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    aqiLeft: {
        flex: 1,
    },
    aqiLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#C2410C",
        textTransform: "uppercase",
    },
    aqiValue: {
        fontSize: 48,
        fontWeight: "900",
        color: "#9A3412",
        marginVertical: 4,
    },
    aqiBadge: {
        backgroundColor: "#FDBA74",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: "flex-start",
    },
    aqiBadgeText: {
        fontSize: 10,
        fontWeight: "800",
        color: "#7C2D12",
    },
    aqiRadialMock: {
        width: 90,
        height: 90,
        justifyContent: "center",
        alignItems: "center",
    },
    radialRingOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 6,
        borderColor: "#FDBA74",
        borderTopColor: "#EA580C", // offset color for mock progress
        justifyContent: "center",
        alignItems: "center",
    },
    radialRingInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.card,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    sectionCard: {
        backgroundColor: colors.card,
        borderRadius: 20,
        marginHorizontal: 20,
        marginTop: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 14,
    },
    pollutantsGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    pollutantCol: {
        flex: 1,
        alignItems: "center",
    },
    pollutantName: {
        fontSize: 11,
        color: "#94A3B8",
        fontWeight: "700",
    },
    pollutantVal: {
        fontSize: 14,
        fontWeight: "800",
        color: isDark ? colors.textSecondary : "#334155",
        marginTop: 4,
    },
    pollutantStatus: {
        fontSize: 11,
        fontWeight: "700",
        marginTop: 2,
    },
    pollenRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    pollenLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    pollenName: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textSecondary,
        marginLeft: 8,
    },
    pollenRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    pollenLevelVal: {
        fontSize: 12,
        fontWeight: "700",
        marginRight: 6,
    },
    statusDotMini: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    weatherRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    weatherItem: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    weatherLabel: {
        fontSize: 10,
        color: "#94A3B8",
        fontWeight: "600",
        textTransform: "uppercase",
    },
    weatherVal: {
        fontSize: 14,
        fontWeight: "700",
        color: isDark ? colors.textSecondary : "#334155",
        marginTop: 2,
    },
    aiWarningCard: {
        backgroundColor: isDark ? "rgba(37, 99, 235, 0.12)" : "#EFF6FF",
        borderWidth: 1,
        borderColor: "#DBEAFE",
        borderRadius: 24,
        marginHorizontal: 20,
        marginTop: 20,
        padding: 16,
    },
    aiWarningHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    aiWarningTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: isDark ? colors.text : "#1E3A8A",
        marginLeft: 8,
    },
    warningList: {},
    warningRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 10,
    },
    warningText: {
        fontSize: 12,
        color: isDark ? colors.textSecondary : "#334155",
        lineHeight: 18,
        flex: 1,
        marginLeft: 8,
    },
});