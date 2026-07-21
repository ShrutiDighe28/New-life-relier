import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@/utils/themeManager";

interface FamilyMember {
    id: string;
    name: string;
    relationship: string;
    age: number;
    email: string;
    avatar: any;
}

interface Caregiver {
    id: string;
    name: string;
    role: string;
    clinic: string;
    avatar: any;
}

export default function FamilyScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();

    const [members, setMembers] = useState<FamilyMember[]>([
        {
            id: "f1",
            name: "Jane Doe",
            relationship: "Spouse",
            age: 30,
            email: "jane.doe@email.com",
            avatar: require("@/assets/images/dashboard/profile.png"),
        },
        {
            id: "f2",
            name: "Bobby Doe",
            relationship: "Son",
            age: 8,
            email: "bobby.doe@email.com",
            avatar: require("@/assets/images/dashboard/profile.png"),
        }
    ]);

    const [caregivers] = useState<Caregiver[]>([
        {
            id: "c1",
            name: "Dr. James Anderson",
            role: "Primary Cardiologist",
            clinic: "HeartCare Clinic, NY",
            avatar: require("@/assets/images/dashboard/doctor.png"),
        }
    ]);

    const [rel, setRel] = useState("");
    const [email, setEmail] = useState("");
    const [age, setAge] = useState("");
    const [name, setName] = useState("");
    const [invited, setInvited] = useState(false);

    const handleInvite = () => {
        if (!name.trim() || !email.trim()) return;

        const newMem: FamilyMember = {
            id: Date.now().toString(),
            name,
            relationship: rel.trim() || "Family Member",
            age: parseInt(age) || 18,
            email,
            avatar: require("@/assets/images/dashboard/profile.png"),
        };

        setMembers((prev) => [...prev, newMem]);
        setName("");
        setEmail("");
        setAge("");
        setRel("");
        setInvited(true);
        setTimeout(() => setInvited(false), 2000);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.divider }]}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Family & Caregivers</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Caregivers / Doctors list */}
                <Text style={[styles.sectionHeading, { color: colors.text, marginTop: 10 }]}>Primary Caregivers & Doctors</Text>
                {caregivers.map((doc) => (
                    <View key={doc.id} style={[styles.memberCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <Image source={doc.avatar} style={styles.memberAvatar} />
                        <View style={styles.memberMeta}>
                            <View style={styles.nameRow}>
                                <Text style={[styles.memberName, { color: colors.text }]}>{doc.name}</Text>
                                <View style={[styles.relBadge, { backgroundColor: isDark ? "#451A03" : "#FFF7ED" }]}>
                                    <Text style={[styles.relBadgeText, { color: "#D97706" }]}>Doctor</Text>
                                </View>
                            </View>
                            <Text style={[styles.memberSub, { color: colors.textSecondary }]}>{doc.role}</Text>
                            <Text style={[styles.memberSub, { color: colors.textSecondary }]}>{doc.clinic}</Text>
                        </View>
                        <TouchableOpacity style={[styles.manageBtn, { backgroundColor: isDark ? colors.backgroundSecondary : "#F8FAFC" }]}>
                            <MaterialCommunityIcons name="cog-outline" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: isDark ? colors.backgroundSecondary : "#F1F5F9", marginTop: 10, marginBottom: 20 }]}>
                    <MaterialCommunityIcons name="plus" size={20} color={colors.primary} />
                    <Text style={[styles.submitBtnText, { color: colors.primary, marginLeft: 8 }]}>Add Primary Doctor</Text>
                </TouchableOpacity>

                {/* Family Members list */}
                <Text style={[styles.sectionHeading, { color: colors.text }]}>Linked Family Members</Text>
                {members.map((member) => (
                    <View key={member.id} style={[styles.memberCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <Image source={member.avatar} style={styles.memberAvatar} />
                        <View style={styles.memberMeta}>
                            <View style={styles.nameRow}>
                                <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
                                <View style={[styles.relBadge, { backgroundColor: isDark ? colors.backgroundSecondary : "#EFF6FF" }]}>
                                    <Text style={[styles.relBadgeText, { color: colors.primary }]}>{member.relationship}</Text>
                                </View>
                            </View>
                            <Text style={[styles.memberSub, { color: colors.textSecondary }]}>{member.age} Years Old • {member.email}</Text>
                        </View>
                        <TouchableOpacity style={[styles.manageBtn, { backgroundColor: isDark ? colors.backgroundSecondary : "#F8FAFC" }]}>
                            <MaterialCommunityIcons name="cog-outline" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                ))}

                {/* Add Family Member Form */}
                <Text style={[styles.sectionHeading, { color: colors.text }]}>Link New Family Member</Text>
                <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View style={styles.inputWrapper}>
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Full Name</Text>
                        <TextInput
                            style={[styles.textInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                            placeholder="e.g. John Doe"
                            placeholderTextColor={colors.textSecondary}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.gridRow}>
                        <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Relationship</Text>
                            <TextInput
                                style={[styles.textInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                                placeholder="e.g. Spouse"
                                placeholderTextColor={colors.textSecondary}
                                value={rel}
                                onChangeText={setRel}
                            />
                        </View>
                        <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Age</Text>
                            <TextInput
                                style={[styles.textInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                                placeholder="e.g. 30"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="numeric"
                                value={age}
                                onChangeText={setAge}
                            />
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email ID (Optional)</Text>
                        <TextInput
                            style={[styles.textInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                            placeholder="To send an invite link"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <TouchableOpacity style={styles.submitBtn} onPress={handleInvite}>
                        <Text style={styles.submitBtnText}>Add Family Profile</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* Success toast toast notification */}
            {invited && (
                <View style={styles.toast}>
                    <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.toastText}>Family profile linked successfully!</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        height: 60,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
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
        color: "#071739",
    },
    scrollContent: {
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    sectionHeading: {
        fontSize: 13,
        fontWeight: "700",
        color: "#0F172A",
        marginTop: 24,
        marginBottom: 12,
    },
    memberCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    memberAvatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
    },
    memberMeta: {
        marginLeft: 12,
        flex: 1,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    memberName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
    },
    relBadge: {
        backgroundColor: "#EFF6FF",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        marginLeft: 6,
    },
    relBadgeText: {
        fontSize: 9,
        fontWeight: "700",
        color: "#2563EB",
    },
    memberSub: {
        fontSize: 10,
        color: "#64748B",
        marginTop: 2,
    },
    manageBtn: {
        padding: 4,
    },
    formCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: 16,
    },
    inputWrapper: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#64748B",
        marginBottom: 6,
    },
    textInput: {
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
        color: "#334155",
        backgroundColor: "#F8FAFC",
    },
    gridRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    submitBtn: {
        backgroundColor: "#2563EB",
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 10,
    },
    submitBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },
    caregiverCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    caregiverAvatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
    },
    caregiverMeta: {
        marginLeft: 12,
        flex: 1,
    },
    caregiverName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
    },
    caregiverRole: {
        fontSize: 11,
        color: "#2563EB",
        fontWeight: "600",
        marginTop: 2,
    },
    caregiverClinic: {
        fontSize: 10,
        color: "#64748B",
        marginTop: 1,
    },
    activeAccessBadge: {
        backgroundColor: "#E8F5E9",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    accessText: {
        fontSize: 9,
        fontWeight: "700",
        color: "#10B981",
    },
    toast: {
        position: "absolute",
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: "#10B981",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    toastText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600",
        marginLeft: 8,
        flex: 1,
    },
});
