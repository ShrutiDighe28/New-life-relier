import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/utils/themeManager";

export default function DoctorProfileScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { colors, isDark } = useTheme();

    const doctorName = user?.fullName || "Dr. Sarah Jenkins";
    const doctorEmail = user?.email || "sarah.jenkins@liferelier.com";
    const doctorMobile = user?.mobile || "+91 98765 43210";

    const rawData = (user as any)?.rawApiData || {};
    const specialization = rawData.specialization || "Cardiologist";
    const qualification = rawData.qualification || "MBBS, MD (Cardiology)";
    const regNumber = rawData.regNumber || "MCI-884920";
    const hospitalName = rawData.hospitalName || "LifeRelier Cardiac Super Speciality Hospital";
    const consultationFee = rawData.consultationFee ? `₹ ${rawData.consultationFee}` : "₹ 800";
    const experience = rawData.experience ? `${rawData.experience}+ Yrs Exp` : "8+ Yrs Exp";

    const handleLogout = async () => {
        Alert.alert("Logout", "Are you sure you want to log out of your doctor account?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    await logout();
                    router.replace("/welcome");
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Hero Header Card */}
                <LinearGradient
                    colors={["#0D9488", "#0A7870"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroCard}
                >
                    <View style={styles.avatarBorder}>
                        <Image
                            source={require("@/assets/images/dashboard/doctor.png")}
                            style={styles.avatarImage}
                        />
                    </View>

                    <Text style={styles.heroName}>{doctorName.startsWith("Dr.") ? doctorName : `Dr. ${doctorName}`}</Text>
                    <Text style={styles.heroSpec}>{specialization}</Text>

                    <View style={styles.badgeRow}>
                        <View style={styles.heroBadge}>
                            <MaterialCommunityIcons name="star" size={14} color="#F59E0B" />
                            <Text style={styles.heroBadgeText}>4.9 (128 reviews)</Text>
                        </View>

                        <View style={styles.heroBadge}>
                            <MaterialCommunityIcons name="shield-check-outline" size={14} color="#FFFFFF" />
                            <Text style={styles.heroBadgeText}>{experience}</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Quick Stats Row */}
                <View style={styles.statsRow}>
                    <View style={[styles.statBox, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}>
                        <Text style={[styles.statNum, { color: "#0D9488" }]}>340+</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Patients</Text>
                    </View>

                    <View style={[styles.statBox, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}>
                        <Text style={[styles.statNum, { color: "#2563EB" }]}>1.2k</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Appointments</Text>
                    </View>

                    <View style={[styles.statBox, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}>
                        <Text style={[styles.statNum, { color: "#D97706" }]}>4.9</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rating</Text>
                    </View>
                </View>

                {/* Card 1: Contact Info */}
                <View style={[styles.infoCard, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}>
                    <View style={styles.infoCardHeader}>
                        <Text style={[styles.infoCardTitle, { color: colors.text }]}>Contact Information</Text>
                        <TouchableOpacity>
                            <MaterialCommunityIcons name="pencil-outline" size={18} color="#0D9488" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="email-outline" size={20} color="#64748B" />
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
                            <Text style={[styles.infoVal, { color: colors.text }]}>{doctorEmail}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="phone-outline" size={20} color="#64748B" />
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone Number</Text>
                            <Text style={[styles.infoVal, { color: colors.text }]}>{doctorMobile}</Text>
                        </View>
                    </View>
                </View>

                {/* Card 2: Professional Details */}
                <View style={[styles.infoCard, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}>
                    <Text style={[styles.infoCardTitle, { color: colors.text }]}>Professional Details</Text>

                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="school-outline" size={20} color="#64748B" />
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Qualification</Text>
                            <Text style={[styles.infoVal, { color: colors.text }]}>{qualification}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="card-text-outline" size={20} color="#64748B" />
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Registration Number</Text>
                            <Text style={[styles.infoVal, { color: colors.text }]}>{regNumber}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="hospital-building" size={20} color="#64748B" />
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Hospital / Clinic</Text>
                            <Text style={[styles.infoVal, { color: colors.text }]}>{hospitalName}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="currency-inr" size={20} color="#64748B" />
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Consultation Fee</Text>
                            <Text style={[styles.infoVal, { color: colors.text }]}>{consultationFee}</Text>
                        </View>
                    </View>
                </View>

                {/* Card 3: About / Bio */}
                <View style={[styles.infoCard, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}>
                    <Text style={[styles.infoCardTitle, { color: colors.text }]}>About</Text>
                    <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
                        Senior Consultant Cardiologist with over 8 years of clinical experience specializing in non-invasive cardiology, heart failure management, and preventive cardiac care.
                    </Text>
                </View>

                {/* Settings Section */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings & Account</Text>
                <View style={[styles.menuCard, { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder }]}>
                    <TouchableOpacity style={styles.menuItem}>
                        <MaterialCommunityIcons name="account-edit-outline" size={22} color="#0D9488" />
                        <Text style={[styles.menuText, { color: colors.text }]}>Edit Profile</Text>
                        <MaterialCommunityIcons name="chevron-right" size={22} color="#94A3B8" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <MaterialCommunityIcons name="clock-outline" size={22} color="#0D9488" />
                        <Text style={[styles.menuText, { color: colors.text }]}>Availability Settings</Text>
                        <MaterialCommunityIcons name="chevron-right" size={22} color="#94A3B8" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <MaterialCommunityIcons name="bell-outline" size={22} color="#0D9488" />
                        <Text style={[styles.menuText, { color: colors.text }]}>Notification Preferences</Text>
                        <MaterialCommunityIcons name="chevron-right" size={22} color="#94A3B8" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <MaterialCommunityIcons name="shield-lock-outline" size={22} color="#0D9488" />
                        <Text style={[styles.menuText, { color: colors.text }]}>Privacy & Security</Text>
                        <MaterialCommunityIcons name="chevron-right" size={22} color="#94A3B8" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <MaterialCommunityIcons name="help-circle-outline" size={22} color="#0D9488" />
                        <Text style={[styles.menuText, { color: colors.text }]}>Help & Support</Text>
                        <MaterialCommunityIcons name="chevron-right" size={22} color="#94A3B8" />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={handleLogout}>
                        <MaterialCommunityIcons name="logout" size={22} color="#EF4444" />
                        <Text style={[styles.menuText, { color: "#EF4444" }]}>Logout</Text>
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
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 40,
    },
    heroCard: {
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
        marginBottom: 20,
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    avatarBorder: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3,
        borderColor: "#FFFFFF",
        overflow: "hidden",
        marginBottom: 12,
    },
    avatarImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    heroName: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "800",
    },
    heroSpec: {
        color: "#CCFBF1",
        fontSize: 14,
        fontWeight: "600",
        marginTop: 2,
    },
    badgeRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 14,
    },
    heroBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    heroBadgeText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "700",
    },
    statsRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 20,
    },
    statBox: {
        flex: 1,
        borderRadius: 18,
        borderWidth: 1.5,
        padding: 14,
        alignItems: "center",
    },
    statNum: {
        fontSize: 18,
        fontWeight: "800",
    },
    statLabel: {
        fontSize: 11,
        fontWeight: "600",
        marginTop: 2,
    },
    infoCard: {
        width: "100%",
        borderRadius: 20,
        borderWidth: 1.5,
        padding: 18,
        marginBottom: 16,
    },
    infoCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    infoCardTitle: {
        fontSize: 16,
        fontWeight: "800",
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: "500",
    },
    infoVal: {
        fontSize: 14,
        fontWeight: "700",
        marginTop: 1,
    },
    aboutText: {
        fontSize: 14,
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 12,
        marginTop: 8,
    },
    menuCard: {
        width: "100%",
        borderRadius: 20,
        borderWidth: 1.5,
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        gap: 12,
    },
    menuText: {
        flex: 1,
        fontSize: 15,
        fontWeight: "600",
    },
});
