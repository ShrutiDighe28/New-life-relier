import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@/utils/themeManager";

interface DietaryFilter {
    id: string;
    label: string;
    icon: string;
}

export default function GroceryScannerScreen() {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors, isDark);
    const router = useRouter();

    const [selectedFilters, setSelectedFilters] = useState<string[]>(["sugar"]);
    const [scanning, setScanning] = useState(false);
    const [hasScanned, setHasScanned] = useState(false);

    const dietaryFilters: DietaryFilter[] = [
        { id: "nuts", label: "Nut Allergy", icon: "peanut-off" },
        { id: "gluten", label: "Gluten Free", icon: "corn-off" },
        { id: "sugar", label: "Low Sugar (Diabetic)", icon: "candy-off" },
        { id: "sodium", label: "Low Sodium (Hypertension)", icon: "salt-off" },
    ];

    const toggleFilter = (id: string) => {
        if (selectedFilters.includes(id)) {
            setSelectedFilters((prev) => prev.filter((item) => item !== id));
        } else {
            setSelectedFilters((prev) => [...prev, id]);
        }
    };

    const handleScanSim = () => {
        setScanning(true);
        setTimeout(() => {
            setScanning(false);
            setHasScanned(true);
        }, 1800);
    };

    // Calculate match results dynamically based on active filter selections!
    const scanVerdict = useMemo(() => {
        const triggers: string[] = [];
        let status: "safe" | "caution" | "avoid" = "safe";

        if (selectedFilters.includes("nuts")) {
            triggers.push("Traces of Almonds/Peanuts");
            status = "avoid";
        }
        if (selectedFilters.includes("sugar")) {
            triggers.push("High Sugar (18g per serving)");
            status = status === "avoid" ? "avoid" : "caution";
        }
        if (selectedFilters.includes("sodium")) {
            triggers.push("Sodium (320mg - Moderate)");
            if (status === "safe") status = "caution";
        }

        return {
            status,
            triggers,
            productName: "Choco-Oat Energy Granola Bar",
            ingredients: "Whole grain rolled oats, palm oil, organic honey, chocolate chips (sugar, cocoa butter), peanut flour, almonds, iodized salt, soy lecithin.",
        };
    }, [selectedFilters]);

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Grocery Scanner</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Dietary Profile Checklist */}
                <View style={styles.filterSection}>
                    <Text style={styles.sectionTitle}>Set Your Dietary Profile Filters</Text>
                    <Text style={styles.sectionSub}>AI will scan ingredients list against these selections</Text>
                    
                    <View style={styles.filterGrid}>
                        {dietaryFilters.map((filter) => {
                            const active = selectedFilters.includes(filter.id);
                            return (
                                <TouchableOpacity
                                    key={filter.id}
                                    style={[styles.filterChip, active && styles.filterChipActive]}
                                    onPress={() => toggleFilter(filter.id)}
                                >
                                    <MaterialCommunityIcons
                                        name={filter.icon as any}
                                        size={18}
                                        color={active ? "#FFFFFF" : "#64748B"}
                                        style={{ marginRight: 6 }}
                                    />
                                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                                        {filter.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Scan Button Card */}
                <TouchableOpacity style={styles.scanPlaceholderCard} activeOpacity={0.8} onPress={handleScanSim}>
                    {scanning ? (
                        <View style={styles.loadingInner}>
                            <ActivityIndicator size="large" color="#D97706" />
                            <Text style={styles.loadingText}>Reading ingredients database...</Text>
                        </View>
                    ) : (
                        <View style={styles.scanCardInner}>
                            <MaterialCommunityIcons name="barcode-scan" size={44} color="#D97706" />
                            <Text style={styles.scanCardTitle}>Scan Food Item Barcode</Text>
                            <Text style={styles.scanCardSubtitle}>Analyze nutritional facts & allergens instantly</Text>
                            <TouchableOpacity style={styles.triggerBtn} onPress={handleScanSim}>
                                <Text style={styles.triggerBtnText}>Simulate Barcode Scan</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Scanned verdict details panel */}
                {hasScanned && !scanning && (
                    <View style={styles.verdictCard}>
                        <View style={styles.verdictHeader}>
                            <Text style={styles.productName}>{scanVerdict.productName}</Text>
                            
                            {/* Verdict Badge */}
                            <View
                                style={[
                                    styles.verdictBadge,
                                    {
                                        backgroundColor:
                                            scanVerdict.status === "safe"
                                                ? "#E8F5E9"
                                                : scanVerdict.status === "caution"
                                                ? "#FFF3E0"
                                                : "#FFEBEE",
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.verdictBadgeText,
                                        {
                                            color:
                                                scanVerdict.status === "safe"
                                                    ? "#2E7D32"
                                                    : scanVerdict.status === "caution"
                                                    ? "#EF6C00"
                                                    : "#C62828",
                                        },
                                    ]}
                                >
                                    {scanVerdict.status.toUpperCase()}
                                </Text>
                            </View>
                        </View>

                        {/* Summary Verdict Advice */}
                        <View style={styles.adviceBox}>
                            <Text style={styles.adviceTitle}>AI Ingredients Evaluation:</Text>
                            {scanVerdict.status === "safe" && (
                                <Text style={styles.adviceText}>
                                    This product matches your dietary requirements. No allergy triggers or nutritional limits were exceeded.
                                </Text>
                            )}
                            {scanVerdict.status === "caution" && (
                                <Text style={styles.adviceText}>
                                    Contains moderate amounts of sodium or sugar. Monitor your daily portions accordingly.
                                </Text>
                            )}
                            {scanVerdict.status === "avoid" && (
                                <Text style={styles.adviceText}>
                                    Contains allergens or sugar levels that conflict with your active dietary profile filters.
                                </Text>
                            )}
                        </View>

                        {/* List of triggers detected */}
                        {scanVerdict.triggers.length > 0 && (
                            <View style={styles.triggersSection}>
                                <Text style={styles.triggerLabel}>Triggers Found:</Text>
                                {scanVerdict.triggers.map((trig, idx) => (
                                    <View key={idx} style={styles.triggerBulletRow}>
                                        <MaterialCommunityIcons name="close-circle-outline" size={16} color="#EF4444" />
                                        <Text style={styles.triggerBulletText}>{trig}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Product Ingredients Text Panel */}
                        <Text style={styles.ingredientsTitle}>Ingredients Panel</Text>
                        <View style={styles.ingredientsBox}>
                            <Text style={styles.ingredientsText}>{scanVerdict.ingredients}</Text>
                        </View>
                    </View>
                )}
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
    filterSection: {
        backgroundColor: colors.card,
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.text,
    },
    sectionSub: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 4,
    },
    filterGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 14,
    },
    filterChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        borderWidth: 1.5,
        borderColor: colors.cardBorder,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        margin: 4,
    },
    filterChipActive: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
    filterChipText: {
        fontSize: 11,
        color: colors.textSecondary,
        fontWeight: "600",
    },
    filterChipTextActive: {
        color: "#FFFFFF",
    },
    scanPlaceholderCard: {
        backgroundColor: colors.card,
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 6,
        elevation: 2,
    },
    scanCardInner: {
        alignItems: "center",
    },
    scanCardTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.text,
        marginTop: 12,
    },
    scanCardSubtitle: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 4,
        textAlign: "center",
    },
    triggerBtn: {
        backgroundColor: "#D97706",
        borderRadius: 14,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 18,
    },
    triggerBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 13,
    },
    loadingInner: {
        alignItems: "center",
        paddingVertical: 20,
    },
    loadingText: {
        fontSize: 12,
        color: "#D97706",
        fontWeight: "600",
        marginTop: 10,
    },
    verdictCard: {
        backgroundColor: colors.card,
        marginHorizontal: 20,
        marginTop: 24,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    verdictHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        paddingBottom: 14,
        marginBottom: 14,
    },
    productName: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.text,
        flex: 1,
        paddingRight: 8,
    },
    verdictBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    verdictBadgeText: {
        fontSize: 10,
        fontWeight: "800",
    },
    adviceBox: {
        backgroundColor: colors.background,
        borderRadius: 14,
        padding: 12,
        marginBottom: 16,
    },
    adviceTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: isDark ? colors.textSecondary : "#334155",
        marginBottom: 4,
    },
    adviceText: {
        fontSize: 12,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    triggersSection: {
        marginBottom: 18,
    },
    triggerLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: "#EF4444",
        marginBottom: 8,
    },
    triggerBulletRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
        paddingLeft: 4,
    },
    triggerBulletText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginLeft: 6,
        fontWeight: "600",
    },
    ingredientsTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 8,
    },
    ingredientsBox: {
        borderWidth: 1,
        borderColor: colors.cardBorder,
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 12,
    },
    ingredientsText: {
        fontSize: 11,
        color: colors.textSecondary,
        lineHeight: 16,
    },
});
