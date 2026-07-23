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
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#071739" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Family & Caregivers</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Family Members list */}
                <Text style={styles.sectionHeading}>Linked Family Members</Text>
                {members.map((member) => (
                    <View key={member.id} style={styles.memberCard}>
                        <Image source={member.avatar} style={styles.memberAvatar} />
                        <View style={styles.memberMeta}>
                            <View style={styles.nameRow}>
                                <Text style={styles.memberName}>{member.name}</Text>
                                <View style={styles.relBadge}>
                                    <Text style={styles.relBadgeText}>{member.relationship}</Text>
                                </View>
                            </View>
                            <Text style={styles.memberSub}>{member.age} Years Old • {member.email}</Text>
                        </View>
                        <TouchableOpacity style={styles.manageBtn}>
                            <MaterialCommunityIcons name="cog-outline" size={18} color="#64748B" />
                        </TouchableOpacity>
                    </View>
                ))}

                {/* Add Family Member Form */}
                <Text style={styles.sectionHeading}>Link New Family Member</Text>
                <View style={styles.formCard}>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Full Name</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g. Lily Doe"
                            placeholderTextColor="#94A3B8"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Email Address</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g. lily.doe@email.com"
                            placeholderTextColor="#94A3B8"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.gridRow}>
                        <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.inputLabel}>Relationship</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g. Daughter, Mother"
                                placeholderTextColor="#94A3B8"
                                value={rel}
                                onChangeText={setRel}
                            />
                        </View>

                        <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.inputLabel}>Age</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g. 12"
                                keyboardType="numeric"
                                value={age}
                                onChangeText={setAge}
                            />
                        </View>
                    </View>

                    <TouchableOpacity style={styles.submitBtn} onPress={handleInvite}>
                        <Text style={styles.submitBtnText}>Add Family Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Supervising Doctor / Caregivers */}
                <Text style={styles.sectionHeading}>Authorized Caregivers (Doctors)</Text>
                {caregivers.map((cg) => (
                    <View key={cg.id} style={styles.caregiverCard}>
                        <Image source={cg.avatar} style={styles.caregiverAvatar} />
                        <View style={styles.caregiverMeta}>
                            <Text style={styles.caregiverName}>{cg.name}</Text>
                            <Text style={styles.caregiverRole}>{cg.role}</Text>
                            <Text style={styles.caregiverClinic}>{cg.clinic}</Text>
                        </View>
                        <View style={styles.activeAccessBadge}>
                            <Text style={styles.accessText}>View Permission</Text>
                        </View>
                    </View>
                ))}
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
