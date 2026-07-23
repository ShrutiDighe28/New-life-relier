import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Header } from "@/components/dashboard";
import { useTheme } from "@/utils/themeManager";
import { useAuth } from "@/context/AuthContext";
import { useHealth, HealthMetrics } from "@/context/HealthContext";

const { width } = Dimensions.get("window");

interface Metric {
    label: string;
    value: string;
    status: string;
    icon: string;
    iconColor: string;
    iconBg: string;
    statusBg: string;
    statusColor: string;
}

// Dynamic mapping of health metrics happens inside the component now

interface NavigationItem {
    label: string;
    description: string;
    icon: string;
    iconColor: string;
    iconBg: string;
    route: string;
}

const myHealthItems: NavigationItem[] = [
    {
        label: "My Reports",
        description: "View your lab reports and history",
        icon: "file-document-outline",
        iconColor: "#2563EB",
        iconBg: "#EFF6FF",
        route: "/reports",
    },
    {
        label: "My Medicines",
        description: "Manage your medicines and reminders",
        icon: "pill",
        iconColor: "#10B981",
        iconBg: "#E8F5E9",
        route: "/profile/medicines",
    },
    {
        label: "My Appointments",
        description: "View and manage your appointments",
        icon: "calendar-clock",
        iconColor: "#9333EA",
        iconBg: "#F3E8FF",
        route: "/appointments",
    },
    {
        label: "Health Goals",
        description: "Track and achieve your health goals",
        icon: "heart-outline",
        iconColor: "#EF4444",
        iconBg: "#FEE2E2",
        route: "/profile/goals",
    },
    {
        label: "Family & Caregivers",
        description: "Manage your family health profiles",
        icon: "account-group-outline",
        iconColor: "#D97706",
        iconBg: "#FFF3E0",
        route: "/profile/family",
    },
];

const preferenceItems: NavigationItem[] = [
    {
        label: "Account Settings",
        description: "Profile, security, password & privacy",
        icon: "cog-outline",
        iconColor: "#2563EB",
        iconBg: "#EFF6FF",
        route: "/settings/account",
    },
    {
        label: "Privacy & Security",
        description: "Manage your privacy and data",
        icon: "shield-check-outline",
        iconColor: "#0D9488",
        iconBg: "#F0FDFA",
        route: "/settings/privacy",
    },
    {
        label: "Notifications",
        description: "Manage your notification preferences",
        icon: "bell-outline",
        iconColor: "#9333EA",
        iconBg: "#F3E8FF",
        route: "/settings/notifications",
    },
    {
        label: "Help & Support",
        description: "Get help and support",
        icon: "help-circle-outline",
        iconColor: "#0F766E",
        iconBg: "#E0F2F1",
        route: "/settings/help",
    },
    {
        label: "Log Out",
        description: "Sign out from your account",
        icon: "logout",
        iconColor: "#EF4444",
        iconBg: "#FEE2E2",
        route: "/login",
    },
];

export default function ProfileScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { user, logout } = useAuth();
    const { metrics } = useHealth();
    
    const displayMetrics: Metric[] = [
        {
            label: "Heart Rate",
            value: metrics.heartRate,
            status: metrics.heartRate === "-- bpm" ? "No Data" : "Logged",
            icon: "heart-pulse",
            iconColor: "#EF4444",
            iconBg: "#FEE2E2",
            statusBg: "#FEE2E2",
            statusColor: "#EF4444",
        },
        {
            label: "Steps (Today)",
            value: metrics.steps,
            status: metrics.steps === "0" ? "No Data" : "Active",
            icon: "run",
            iconColor: "#2563EB",
            iconBg: "#EFF6FF",
            statusBg: "#EFF6FF",
            statusColor: "#2563EB",
        },
        {
            label: "Sleep (Avg)",
            value: metrics.sleep,
            status: metrics.sleep === "--h --m" ? "No Data" : "Logged",
            icon: "weather-night",
            iconColor: "#10B981",
            iconBg: "#E8F5E9",
            statusBg: "#E8F5E9",
            statusColor: "#10B981",
        },
        {
            label: "Weight",
            value: metrics.weight,
            status: metrics.weight === "-- kg" ? "No Data" : "Logged",
            icon: "scale-bathroom",
            iconColor: "#D97706",
            iconBg: "#FFF3E0",
            statusBg: "#FEF3C7",
            statusColor: "#B45309",
        },
    ];

    const handleNavigate = async (route: string) => {
        if (route === "/login") {
            await logout();
            router.replace("/login");
        } else {
            router.push(route as any);
        }
    };

    // Calculate age dynamically from dob
    const calculateAge = (dobString?: string): string => {
        if (!dobString) return "";
        const parts = dobString.split("/");
        if (parts.length !== 3) return "";
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        
        const birthDate = new Date(year, month, day);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age > 0 ? `${age} Years` : "";
    };

    // Format personal stats dynamically
    const getPersonalStats = () => {
        const stats: string[] = [];
        
        if (user?.dob) {
            const ageStr = calculateAge(user.dob);
            if (ageStr) stats.push(ageStr);
        } else if (user?.age) {
            stats.push(`${user.age} Years`);
        }

        if (user?.gender) stats.push(user.gender);
        if (user?.height) stats.push(user.height);
        if (user?.weight) stats.push(user.weight);
        if (user?.bloodGroup) stats.push(`Blood: ${user.bloodGroup}`);

        return stats.length > 0 ? stats.join(" • ") : "Setup your profile details";
    };

    const displayStats = getPersonalStats();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            {/* Custom reusable header */}
            <Header />

            <ScrollView
                style={{ backgroundColor: colors.background }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Hero Profile Block */}
                <View style={[styles.heroSection, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.divider }]}>
                    <View style={styles.heroInner}>
                        {/* Circle Avatar with Edit Badge */}
                        <View style={styles.avatarContainer}>
                            <Image
                                source={require("@/assets/images/dashboard/profile.png")}
                                style={styles.avatarImage}
                            />
                            <TouchableOpacity style={styles.cameraBadge}>
                                <MaterialCommunityIcons name="camera" size={14} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        {/* Middle Info Details */}
                        <View style={styles.profileMeta}>
                            <View style={styles.nameRow}>
                                <Text style={[styles.profileName, isDark && { color: "#FFFFFF" }]}>
                                    {user?.fullName || "User Name"}
                                </Text>
                                <View style={styles.premiumBadge}>
                                    <MaterialCommunityIcons name="crown-outline" size={10} color="#2563EB" style={{ marginRight: 2 }} />
                                    <Text style={styles.premiumText}>Premium Member</Text>
                                </View>
                            </View>

                            <Text style={[styles.personalStats, isDark && { color: "#94A3B8" }]}>{displayStats}</Text>

                            <View style={styles.contactRow}>
                                <MaterialCommunityIcons name="email-outline" size={12} color={isDark ? "#94A3B8" : "#64748B"} />
                                <Text style={[styles.contactText, isDark && { color: "#E2E8F0" }]}>
                                    {user?.email || "No Email"}
                                </Text>
                            </View>
                            <View style={styles.contactRow}>
                                <MaterialCommunityIcons name="phone-outline" size={12} color={isDark ? "#94A3B8" : "#64748B"} />
                                <Text style={[styles.contactText, isDark && { color: "#E2E8F0" }]}>
                                    {user?.mobile || "No Mobile"}
                                </Text>
                            </View>
                        </View>

                        {/* Account Settings Button */}
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => router.push("/settings/account")}
                        >
                            <MaterialCommunityIcons name="cog-outline" size={12} color="#2563EB" style={{ marginRight: 4 }} />
                            <Text style={styles.editBtnText}>Account Settings</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Health Summary Metrics Card Slider */}
                <View style={styles.metricsHeader}>
                    <Text style={[styles.sectionHeading, isDark && { color: "#FFFFFF" }]}>Health Summary</Text>
                    <TouchableOpacity>
                        <View style={styles.viewAllRow}>
                            <Text style={styles.viewAllText}>View All</Text>
                            <MaterialCommunityIcons name="arrow-right" size={14} color="#2563EB" style={{ marginLeft: 2 }} />
                        </View>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.metricsSlider}
                >
                    {displayMetrics.map((met, idx) => (
                        <View key={idx} style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <View style={[styles.metricIconBg, { backgroundColor: met.iconBg }]}>
                                <MaterialCommunityIcons name={met.icon as any} size={22} color={met.iconColor} />
                            </View>
                            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{met.label}</Text>
                            <Text style={[styles.metricValue, { color: colors.text }]}>{met.value}</Text>
                            
                            <View style={[styles.metricStatusBadge, { backgroundColor: met.statusBg }]}>
                                <Text style={[styles.metricStatusText, { color: met.statusColor }]}>
                                    {met.status}
                                </Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Secure trust encryption banner */}
                <View style={[styles.secureBanner, { backgroundColor: isDark ? colors.card : "#EFF6FF", borderColor: isDark ? colors.cardBorder : "#DBEAFE" }]}>
                    <View style={styles.secureLeft}>
                        <View style={[styles.shieldWrapper, { backgroundColor: isDark ? colors.background : "#FFFFFF" }]}>
                            <MaterialCommunityIcons name="shield-lock-outline" size={20} color="#2563EB" />
                        </View>
                        <View style={styles.secureTextContent}>
                            <Text style={[styles.secureTitle, { color: isDark ? colors.text : "#1E3A8A" }]}>Your data is safe and secure</Text>
                            <Text style={[styles.secureDesc, { color: isDark ? colors.textSecondary : "#475569" }]}>
                                We use advanced encryption to keep your health information confidential.
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.learnMoreRow}>
                        <Text style={styles.learnMoreText}>Learn More</Text>
                        <MaterialCommunityIcons name="arrow-right" size={14} color="#2563EB" style={{ marginLeft: 2 }} />
                    </TouchableOpacity>
                </View>

                {/* My Health Options List */}
                <Text style={[styles.listSectionHeading, isDark && { color: "#FFFFFF" }]}>My Health</Text>
                <View style={[styles.optionsList, isDark && { backgroundColor: "#071739", borderColor: "#1E293B" }]}>
                    {myHealthItems.map((item, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={[styles.listItem, isDark && { borderBottomColor: "#1E293B" }]}
                            onPress={() => handleNavigate(item.route)}
                        >
                            <View style={styles.listItemLeft}>
                                <View style={[styles.listItemIconWrapper, { backgroundColor: item.iconBg }]}>
                                    <MaterialCommunityIcons name={item.icon as any} size={20} color={item.iconColor} />
                                </View>
                                <View style={styles.listItemMeta}>
                                    <Text style={[styles.listItemLabel, isDark && { color: "#FFFFFF" }]}>{item.label}</Text>
                                    <Text style={[styles.listItemDesc, isDark && { color: "#94A3B8" }]}>{item.description}</Text>
                                </View>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#94A3B8" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Account & Preferences Options List */}
                <Text style={[styles.listSectionHeading, isDark && { color: "#FFFFFF" }]}>Account & Preferences</Text>
                <View style={[styles.optionsList, isDark && { backgroundColor: "#071739", borderColor: "#1E293B" }]}>
                    {preferenceItems.map((item, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={[styles.listItem, isDark && { borderBottomColor: "#1E293B" }]}
                            onPress={() => handleNavigate(item.route)}
                        >
                            <View style={styles.listItemLeft}>
                                <View style={[styles.listItemIconWrapper, { backgroundColor: item.iconBg }]}>
                                    <MaterialCommunityIcons name={item.icon as any} size={20} color={item.iconColor} />
                                </View>
                                <View style={styles.listItemMeta}>
                                    <Text style={[styles.listItemLabel, isDark && { color: "#FFFFFF" }]}>{item.label}</Text>
                                    <Text style={[styles.listItemDesc, isDark && { color: "#94A3B8" }]}>{item.description}</Text>
                                </View>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#94A3B8" />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    scrollContent: {
        paddingBottom: 40,
    },
    heroSection: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    heroInner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    avatarContainer: {
        position: "relative",
    },
    avatarImage: {
        width: 76,
        height: 76,
        borderRadius: 38,
    },
    cameraBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#2563EB",
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    profileMeta: {
        flex: 1,
        marginLeft: 14,
        paddingRight: 8,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileName: {
        fontSize: 18,
        fontWeight: "800",
        color: "#0F172A",
    },
    premiumBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EFF6FF",
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
        marginLeft: 6,
    },
    premiumText: {
        fontSize: 9,
        fontWeight: "800",
        color: "#2563EB",
    },
    personalStats: {
        fontSize: 11,
        color: "#64748B",
        marginTop: 4,
        fontWeight: "500",
    },
    contactRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    contactText: {
        fontSize: 11,
        color: "#475569",
        marginLeft: 6,
        fontWeight: "500",
    },
    editBtn: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#2563EB",
        borderRadius: 12,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    editBtnText: {
        fontSize: 11,
        color: "#2563EB",
        fontWeight: "700",
    },
    metricsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 12,
    },
    sectionHeading: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0F172A",
    },
    viewAllRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    viewAllText: {
        fontSize: 12,
        color: "#2563EB",
        fontWeight: "700",
    },
    metricsSlider: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    metricCard: {
        backgroundColor: "#FFFFFF",
        width: (width - 64) / 3, // fits 3 visual cards before side scroll
        borderRadius: 20,
        padding: 12,
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#F1F5F9",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.01,
        shadowRadius: 4,
        elevation: 1,
    },
    metricIconBg: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    metricLabel: {
        fontSize: 10,
        color: "#94A3B8",
        fontWeight: "600",
    },
    metricValue: {
        fontSize: 14,
        fontWeight: "800",
        color: "#334155",
        marginVertical: 4,
    },
    metricStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginTop: 2,
    },
    metricStatusText: {
        fontSize: 9,
        fontWeight: "800",
    },
    secureBanner: {
        marginHorizontal: 20,
        marginTop: 16,
        backgroundColor: "#EFF6FF",
        borderRadius: 20,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#DBEAFE",
    },
    secureLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        paddingRight: 8,
    },
    shieldWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    secureTextContent: {
        flex: 1,
    },
    secureTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: "#1E3A8A",
    },
    secureDesc: {
        fontSize: 9,
        color: "#475569",
        marginTop: 2,
        lineHeight: 13,
    },
    learnMoreRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    learnMoreText: {
        fontSize: 11,
        color: "#2563EB",
        fontWeight: "700",
    },
    listSectionHeading: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
        marginHorizontal: 20,
        marginTop: 24,
        marginBottom: 10,
    },
    optionsList: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    listItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    listItemLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        paddingRight: 10,
    },
    listItemIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    listItemMeta: {
        flex: 1,
    },
    listItemLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#334155",
    },
    listItemDesc: {
        fontSize: 10,
        color: "#64748B",
        marginTop: 2,
    },
});