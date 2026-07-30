import { Header } from "@/components/dashboard";
import { useTheme } from "@/utils/themeManager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface AITool {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    bgColor: string;
    route: string;
}

const aiTools: AITool[] = [
    {
        id: "report-explainer",
        title: "Report Explainer AI",
        description: "Understand your lab reports in simple language.",
        icon: "file-document-edit-outline",
        color: "#2563EB",
        bgColor: "#EFF6FF",
        route: "/ai/report-ai",
    },
    {
        id: "prescription-scanner",
        title: "Prescription Scanner",
        description: "Scan and analyze your prescription for drug details and safety.",
        icon: "barcode-scan",
        color: "#10B981",
        bgColor: "#E8F5E9",
        route: "/ai/prescription-scanner",
    },
    {
        id: "grocery-scanner",
        title: "Grocery Scanner",
        description: "Scan food items to detect allergens and dietary risks.",
        icon: "cart-outline",
        color: "#D97706",
        bgColor: "#FFF3E0",
        route: "/ai/grocery-scanner",
    },
    {
        id: "environmental-tracker",
        title: "Environmental Tracker",
        description: "Track air quality, pollen, weather and get health risk alerts.",
        icon: "leaf-maple",
        color: "#9333EA",
        bgColor: "#F3E8FF",
        route: "/ai/environment",
    },
    {
        id: "sleep-optimizer",
        title: "Sleep Optimizer",
        description: "Improve sleep with personalized circadian rhythm insights.",
        icon: "weather-night",
        color: "#1D4ED8",
        bgColor: "#EBF2FF",
        route: "/ai/sleep",
    },
    {
        id: "symptom-checker",
        title: "Symptom Checker",
        description: "Check your symptoms and get possible conditions.",
        icon: "heart-pulse",
        color: "#EF4444",
        bgColor: "#FEE2E2",
        route: "/ai/symptom-checker",
    },
    {
        id: "second-opinion",
        title: "AI Second Opinion",
        description: "Get a second opinion and treatment insights from AI.",
        icon: "chat-question-outline",
        color: "#0D9488",
        bgColor: "#F0FDFA",
        route: "/ai/second-opinion",
    },
    {
        id: "health-assistant",
        title: "Health Assistant",
        description: "Ask anything about your health. Get instant AI-powered answers.",
        icon: "robot-happy-outline",
        color: "#B45309",
        bgColor: "#FEF3C7",
        route: "/ai/assistant",
    },
];

export default function AIHubScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            {/* Top Header (reuses dashboard header: logo + bell with badge + profile) */}
            <Header pageTitle="AI Hub" />

            <ScrollView
                style={{ backgroundColor: colors.background }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Title Section with Floating Brain Asset */}
                <View style={styles.titleSection}>
                    <View style={styles.titleLeft}>
                        <Text style={[styles.pageTitle, { color: colors.text }]}>AI Health Hub</Text>
                        <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
                            Smart tools powered by AI to help you understand, analyze & improve your health.
                        </Text>
                    </View>
                    <View style={[styles.brainIconWrapper, { backgroundColor: isDark ? colors.card : "#EFF6FF" }]}>
                        <MaterialCommunityIcons name="brain" size={54} color="#2563EB" />
                    </View>
                </View>

                {/* Primary Hero Companion Card */}
                <TouchableOpacity
                    style={styles.heroCard}
                    activeOpacity={0.95}
                    onPress={() => router.push("/ai/assistant")}
                >
                    <LinearGradient
                        colors={isDark ? [colors.card, "#1E293B"] : ["#EFF6FF", "#DBEAFE"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroGradient}
                    >
                        <View style={styles.heroLeft}>
                            <View style={styles.heroSparkleWrapper}>
                                <MaterialCommunityIcons name={"auto-fix" as any} size={24} color="#FFFFFF" />
                            </View>
                            <View style={styles.heroTextContainer}>
                                <Text style={[styles.heroTitle, { color: isDark ? colors.text : "#1E3A8A" }]}>Your AI Health Companion</Text>
                                <Text style={[styles.heroSubtitle, { color: isDark ? colors.secondary : "#2563EB" }]}>
                                    Get personalized insights, explanations and recommendations in simple terms.
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.heroButton}
                            onPress={() => router.push("/ai/assistant")}
                        >
                            <Text style={styles.heroButtonText}>Ask AI Assistant</Text>
                            <MaterialCommunityIcons name="arrow-right" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                    </LinearGradient>
                </TouchableOpacity>

                {/* AI Powered Tools Section Title */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Powered Tools</Text>

                {/* Grid list of Tools (2 Columns) */}
                <View style={styles.toolsGrid}>
                    {aiTools.map((tool) => (
                        <TouchableOpacity
                            key={tool.id}
                            style={[
                                styles.toolCard,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.cardBorder,
                                },
                            ]}
                            activeOpacity={0.8}
                            onPress={() => router.push(tool.route as any)}
                        >
                            {/* Card Header Row */}
                            <View style={styles.cardHeaderRow}>
                                <View style={[styles.toolIconWrapper, { backgroundColor: isDark ? tool.color + "1A" : tool.bgColor }]}>
                                    <MaterialCommunityIcons name={tool.icon as any} size={24} color={tool.color} />
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={18} color={isDark ? colors.textSecondary : "#94A3B8"} />
                            </View>

                            {/* Card Content */}
                            <Text style={[styles.toolCardTitle, { color: colors.text }]} numberOfLines={2}>
                                {tool.title}
                            </Text>
                            <Text style={[styles.toolCardDescription, { color: colors.textSecondary }]} numberOfLines={3}>
                                {tool.description}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Secure Trust Banner at the Bottom */}
                <View style={[styles.secureBanner, { backgroundColor: isDark ? colors.card : "#EFF6FF", borderColor: isDark ? colors.cardBorder : "#DBEAFE" }]}>
                    <View style={styles.secureLeft}>
                        <View style={[styles.secureIconWrapper, { backgroundColor: isDark ? colors.background : "#FFFFFF" }]}>
                            <MaterialCommunityIcons name="shield-lock" size={22} color="#2563EB" />
                        </View>
                        <View style={styles.secureTextWrapper}>
                            <Text style={[styles.secureTitle, { color: isDark ? colors.text : "#1E3A8A" }]}>Your data is safe and secure</Text>
                            <Text style={[styles.secureSubtitle, { color: isDark ? colors.textSecondary : "#475569" }]}>
                                We use advanced encryption to keep your health information confidential.
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.learnMoreRow}>
                        <Text style={styles.learnMoreText}>Learn More</Text>
                        <MaterialCommunityIcons name="arrow-right" size={14} color="#2563EB" style={{ marginLeft: 2 }} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 110,
    },
    titleSection: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 16,
    },
    titleLeft: {
        flex: 1.2,
        paddingRight: 10,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: "800",
        letterSpacing: -0.5,
    },
    pageSubtitle: {
        fontSize: 14,
        marginTop: 6,
        lineHeight: 20,
    },
    brainIconWrapper: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: "#EFF6FF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 3,
    },
    heroCard: {
        marginHorizontal: 20,
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        marginBottom: 24,
    },
    heroGradient: {
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    heroLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        paddingRight: 8,
    },
    heroSparkleWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    heroTextContainer: {
        flex: 1,
    },
    heroTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1E3A8A",
    },
    heroSubtitle: {
        fontSize: 11,
        color: "#2563EB",
        marginTop: 2,
        lineHeight: 15,
    },
    heroButton: {
        backgroundColor: "#2563EB",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    heroButtonText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "700",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        letterSpacing: -0.3,
        marginHorizontal: 20,
        marginBottom: 16,
    },
    toolsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },
    toolCard: {
        width: (width - 50) / 2,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        minHeight: 145,
        justifyContent: "space-between",
    },
    cardHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    toolIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    toolCardTitle: {
        fontSize: 14,
        fontWeight: "700",
    },
    toolCardDescription: {
        fontSize: 11,
        marginTop: 4,
        lineHeight: 15,
    },
    secureBanner: {
        marginHorizontal: 20,
        marginTop: 12,
        borderRadius: 20,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
    },
    secureLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        paddingRight: 8,
    },
    secureIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    secureTextWrapper: {
        flex: 1,
    },
    secureTitle: {
        fontSize: 13,
        fontWeight: "700",
    },
    secureSubtitle: {
        fontSize: 10,
        marginTop: 2,
        lineHeight: 14,
    },
    learnMoreRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    learnMoreText: {
        fontSize: 12,
        color: "#2563EB",
        fontWeight: "700",
    },
});