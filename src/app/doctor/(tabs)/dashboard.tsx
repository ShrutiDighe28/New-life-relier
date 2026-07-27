import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/utils/themeManager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RECENT_PATIENTS = [
    { id: "1", name: "Aarav Sharma", age: "34, Male", condition: "Hypertension", lastVisit: "Yesterday" },
    { id: "2", name: "Priya Patel", age: "28, Female", condition: "Follow-up Checkup", lastVisit: "2 days ago" },
    { id: "3", name: "Rajesh Verma", age: "52, Male", condition: "Diabetes Type-2", lastVisit: "1 week ago" },
];

export default function DoctorDashboardScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { colors, isDark, toggleTheme } = useTheme();

    const doctorName = user?.fullName || "Dr. Sarah Jenkins";
    const doctorSpec = (user as any)?.rawApiData?.specialization || "Cardiologist";

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header Row */}
                <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        <Text style={[styles.greetingText, { color: colors.text }]}>
                            Good Morning, {doctorName.startsWith("Dr.") ? doctorName : `Dr. ${doctorName}`} 👋
                        </Text>
                        <Text style={[styles.specText, { color: colors.textSecondary }]}>{doctorSpec}</Text>
                    </View>

                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={[styles.iconBadgeBtn, { backgroundColor: isDark ? colors.card : "#F8FAFC" }]}
                            onPress={toggleTheme}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name={isDark ? "weather-sunny" : "weather-night"}
                                size={22}
                                color={isDark ? "#F59E0B" : "#64748B"}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.iconBadgeBtn, { backgroundColor: isDark ? colors.card : "#F8FAFC" }]}>
                            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.text} />
                            <View style={styles.badgeDot}>
                                <Text style={styles.badgeDotText}>3</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.push("/doctor/(tabs)/profile")}>
                            <Image
                                source={require("@/assets/images/dashboard/doctor.png")}
                                style={styles.headerAvatar}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Stats Row (4 Cards) */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: "#EFF6FF" }]}>
                        <Text style={[styles.statNumber, { color: "#2563EB" }]}>12</Text>
                        <Text style={[styles.statLabel, { color: "#1E40AF" }]}>Total Today</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: "#FFFBEB" }]}>
                        <Text style={[styles.statNumber, { color: "#D97706" }]}>3</Text>
                        <Text style={[styles.statLabel, { color: "#92400E" }]}>Pending</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: "#F0FDF4" }]}>
                        <Text style={[styles.statNumber, { color: "#16A34A" }]}>8</Text>
                        <Text style={[styles.statLabel, { color: "#166534" }]}>Completed</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: "#FEF2F2" }]}>
                        <Text style={[styles.statNumber, { color: "#DC2626" }]}>1</Text>
                        <Text style={[styles.statLabel, { color: "#991B1B" }]}>Cancelled</Text>
                    </View>
                </View>

                {/* Next Appointment Card */}
                <LinearGradient
                    colors={["#0D9488", "#0A7870"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.nextAppointmentCard}
                >
                    <View style={styles.nextHeader}>
                        <View style={styles.nextBadge}>
                            <MaterialCommunityIcons name="clock-outline" size={14} color="#FFFFFF" />
                            <Text style={styles.nextBadgeText}>Next Appointment • In 25 min</Text>
                        </View>
                        <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText}>New Patient</Text>
                        </View>
                    </View>

                    <View style={styles.nextPatientRow}>
                        <View style={styles.nextPatientAvatar}>
                            <Text style={styles.nextAvatarText}>AS</Text>
                        </View>
                        <View style={styles.nextPatientDetails}>
                            <Text style={styles.nextPatientName}>Aarav Sharma</Text>
                            <Text style={styles.nextPatientSub}>10:30 AM • Video Consultation</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={styles.startConsultBtn}
                        onPress={() => router.push("/doctor/(tabs)/consult")}
                    >
                        <MaterialCommunityIcons name="video-outline" size={20} color="#0D9488" />
                        <Text style={styles.startConsultText}>Start Consultation</Text>
                    </TouchableOpacity>
                </LinearGradient>

                {/* Quick Actions (2x2 Grid) */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
                <View style={styles.quickActionsGrid}>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}
                        onPress={() => router.push("/doctor/(tabs)/patients")}
                    >
                        <View style={[styles.actionIconBg, { backgroundColor: "#F0FDFA" }]}>
                            <MaterialCommunityIcons name="account-group-outline" size={24} color="#0D9488" />
                        </View>
                        <Text style={[styles.actionLabel, { color: colors.text }]}>My Patients</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}
                        onPress={() => router.push("/doctor/(tabs)/schedule")}
                    >
                        <View style={[styles.actionIconBg, { backgroundColor: "#EFF6FF" }]}>
                            <MaterialCommunityIcons name="calendar-month-outline" size={24} color="#2563EB" />
                        </View>
                        <Text style={[styles.actionLabel, { color: colors.text }]}>Schedule</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}
                    >
                        <View style={[styles.actionIconBg, { backgroundColor: "#F0FDF4" }]}>
                            <MaterialCommunityIcons name="file-document-outline" size={24} color="#16A34A" />
                        </View>
                        <Text style={[styles.actionLabel, { color: colors.text }]}>Prescriptions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}
                    >
                        <View style={[styles.actionIconBg, { backgroundColor: "#FFFBEB" }]}>
                            <MaterialCommunityIcons name="chart-bar" size={24} color="#D97706" />
                        </View>
                        <Text style={[styles.actionLabel, { color: colors.text }]}>Reports</Text>
                    </TouchableOpacity>
                </View>

                {/* Earnings Summary Card */}
                <View style={[styles.earningsCard, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}>
                    <View style={styles.earningsHeader}>
                        <View>
                            <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>This Week Earnings</Text>
                            <Text style={[styles.earningsValue, { color: colors.text }]}>₹ 48,500</Text>
                        </View>
                        <View style={styles.growthBadge}>
                            <Text style={styles.growthText}>vs last week ↑ 12%</Text>
                        </View>
                    </View>

                    {/* Mini Visual Bar Chart */}
                    <View style={styles.chartRow}>
                        {[40, 65, 80, 55, 95, 70, 90].map((h, i) => (
                            <View key={i} style={styles.barCol}>
                                <View style={[styles.bar, { height: h, backgroundColor: i === 4 ? "#0D9488" : "#CCFBF1" }]} />
                                <Text style={[styles.barDay, { color: colors.textSecondary }]}>
                                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Recent Patients */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Patients</Text>
                    <TouchableOpacity onPress={() => router.push("/doctor/(tabs)/patients")}>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.recentList}>
                    {RECENT_PATIENTS.map((p) => (
                        <TouchableOpacity
                            key={p.id}
                            style={[styles.patientCard, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}
                            onPress={() => router.push("/doctor/(tabs)/patients")}
                        >
                            <View style={styles.patientAvatar}>
                                <Text style={styles.patientAvatarText}>{p.name.substring(0, 2).toUpperCase()}</Text>
                            </View>
                            <View style={styles.patientInfo}>
                                <Text style={[styles.patientName, { color: colors.text }]}>{p.name}</Text>
                                <Text style={[styles.patientSub, { color: colors.textSecondary }]}>{p.age} • {p.condition}</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#94A3B8" />
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
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 40,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    headerLeft: {
        flex: 1,
    },
    greetingText: {
        fontSize: 22,
        fontWeight: "800",
    },
    specText: {
        fontSize: 14,
        fontWeight: "500",
        marginTop: 2,
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconBadgeBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },
    badgeDot: {
        position: "absolute",
        top: 6,
        right: 6,
        backgroundColor: "#EF4444",
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    badgeDotText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "800",
    },
    headerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: "#0D9488",
    },
    statsGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        padding: 12,
        alignItems: "center",
    },
    statNumber: {
        fontSize: 20,
        fontWeight: "800",
    },
    statLabel: {
        fontSize: 11,
        fontWeight: "700",
        marginTop: 2,
    },
    nextAppointmentCard: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    nextHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    nextBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    nextBadgeText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600",
    },
    typeBadge: {
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    typeBadgeText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "700",
    },
    nextPatientRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        marginBottom: 18,
    },
    nextPatientAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },
    nextAvatarText: {
        color: "#0D9488",
        fontSize: 16,
        fontWeight: "800",
    },
    nextPatientDetails: {
        flex: 1,
    },
    nextPatientName: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "800",
    },
    nextPatientSub: {
        color: "#E6FFFA",
        fontSize: 13,
        marginTop: 2,
    },
    startConsultBtn: {
        backgroundColor: "#FFFFFF",
        height: 48,
        borderRadius: 24,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    startConsultText: {
        color: "#0D9488",
        fontSize: 15,
        fontWeight: "700",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 14,
    },
    quickActionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 24,
    },
    actionCard: {
        width: "48%",
        borderRadius: 20,
        borderWidth: 1.5,
        padding: 16,
        alignItems: "center",
        flexDirection: "row",
        gap: 12,
    },
    actionIconBg: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    actionLabel: {
        fontSize: 14,
        fontWeight: "700",
        flex: 1,
    },
    earningsCard: {
        width: "100%",
        borderRadius: 20,
        borderWidth: 1.5,
        padding: 18,
        marginBottom: 24,
    },
    earningsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    earningsLabel: {
        fontSize: 13,
        fontWeight: "500",
    },
    earningsValue: {
        fontSize: 24,
        fontWeight: "800",
        marginTop: 2,
    },
    growthBadge: {
        backgroundColor: "#F0FDF4",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    growthText: {
        color: "#16A34A",
        fontSize: 12,
        fontWeight: "700",
    },
    chartRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        height: 100,
        paddingTop: 10,
    },
    barCol: {
        alignItems: "center",
        gap: 6,
    },
    bar: {
        width: 16,
        borderRadius: 8,
    },
    barDay: {
        fontSize: 11,
        fontWeight: "600",
    },
    sectionHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    seeAllText: {
        color: "#0D9488",
        fontSize: 14,
        fontWeight: "700",
    },
    recentList: {
        gap: 10,
    },
    patientCard: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 18,
        borderWidth: 1.5,
        padding: 14,
        gap: 12,
    },
    patientAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#F0FDFA",
        justifyContent: "center",
        alignItems: "center",
    },
    patientAvatarText: {
        color: "#0D9488",
        fontSize: 15,
        fontWeight: "800",
    },
    patientInfo: {
        flex: 1,
    },
    patientName: {
        fontSize: 15,
        fontWeight: "700",
    },
    patientSub: {
        fontSize: 13,
        marginTop: 2,
    },
});
