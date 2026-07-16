import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import LogoBrand from "@/components/LogoBrand";
import { useAuth } from "@/context/AuthContext";

export default function CreateProfileScreen() {
    const router = useRouter();
    const { user, updateProfile } = useAuth();

    const [name, setName] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");
    const [emergencyContact, setEmergencyContact] = useState("");
    const [allergies, setAllergies] = useState("");
    const [medicalHistory, setMedicalHistory] = useState("");

    // Prefill name if user context becomes available
    useEffect(() => {
        if (user?.fullName) {
            setName(user.fullName);
        }
    }, [user]);

    const handleComplete = async () => {
        try {
            await updateProfile({
                fullName: name,
                dob,
                gender,
                bloodGroup,
                emergencyContact,
                allergies,
                medicalHistory,
            });
            router.replace("/(tabs)/home");
        } catch (err) {
            console.error("Failed to complete profile registration:", err);
        }
    };

    return (
        <View style={styles.root}>

            {/* Bottom Waves */}

            <Svg
                width="100%"
                height={220}
                viewBox="0 0 430 220"
                preserveAspectRatio="xMidYMax slice"
                style={styles.wave}
            >
                <Path
                    d="M0 60 C120 10 250 120 430 70 L430 220 L0 220 Z"
                    fill="#EEF5FF"
                />

                <Path
                    d="M0 95 C140 50 260 150 430 95 L430 220 L0 220 Z"
                    fill="#DCEBFF"
                />

                <Path
                    d="M0 125 C150 80 260 180 430 135 L430 220 L0 220 Z"
                    fill="#2563EB"
                />
            </Svg>

            <SafeAreaView
                style={styles.container}
                edges={["top", "left", "right"]}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: 50,
                    }}
                >

                    {/* Decorations */}

                    <Image
                        source={require("@/assets/images/decorations/plus.png")}
                        style={[styles.plus, { top: 70, left: 25 }]}
                    />

                    <Image
                        source={require("@/assets/images/decorations/hexagon.png")}
                        style={[styles.hexagon, { top: 120, right: -20 }]}
                    />

                    <Image
                        source={require("@/assets/images/decorations/dots.png")}
                        style={[styles.dots, { top: 230, left: 10 }]}
                    />

                    {/* Back */}

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color="#071739"
                        />
                    </TouchableOpacity>

                    {/* Logo */}

                    <LogoBrand size={40} fontSize={28} style={{ marginTop: 24 }} centered />

                    <Text style={styles.subtitle}>
                        Healthcare Platform
                    </Text>

                    <Text style={styles.heading}>
                        Complete Profile
                    </Text>

                    <Text style={styles.description}>
                        Help us personalize your healthcare
                        experience.
                    </Text>
                    {/* ================= Profile Photo ================= */}

                    <TouchableOpacity style={styles.profileContainer}>

                        <View style={styles.avatarCircle}>

                            <MaterialCommunityIcons
                                name="account"
                                size={54}
                                color="#94A3B8"
                            />

                        </View>

                        <Text style={styles.uploadText}>
                            Upload Profile Photo
                        </Text>

                        <Text style={styles.uploadSubText}>
                            Tap to choose a profile picture
                        </Text>

                    </TouchableOpacity>

                    {/* ================= Full Name ================= */}

                    <View style={styles.inputContainer}>

                        <Image
                            source={require("@/assets/images/auth/person.png")}
                            style={styles.icon}
                        />

                        <TextInput
                            placeholder="Full Name"
                            placeholderTextColor="#94A3B8"
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                        />

                    </View>

                    {/* ================= Date of Birth ================= */}

                    <View style={styles.inputContainer}>

                        <MaterialCommunityIcons
                            name="calendar-month-outline"
                            size={24}
                            color="#64748B"
                            style={styles.materialIcon}
                        />

                        <TextInput
                            placeholder="Date of Birth (DD/MM/YYYY)"
                            placeholderTextColor="#94A3B8"
                            style={styles.input}
                            value={dob}
                            onChangeText={setDob}
                        />

                    </View>

                    {/* ================= Gender ================= */}

                    <Text style={styles.sectionTitle}>
                        Gender
                    </Text>

                    <View style={styles.genderContainer}>

                        <TouchableOpacity
                            style={[
                                styles.genderChip,
                                gender === "Male" && styles.genderSelected,
                            ]}
                            onPress={() => setGender("Male")}
                        >
                            <Text
                                style={[
                                    styles.genderText,
                                    gender === "Male" &&
                                    styles.genderTextSelected,
                                ]}
                            >
                                Male
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.genderChip,
                                gender === "Female" &&
                                styles.genderSelected,
                            ]}
                            onPress={() => setGender("Female")}
                        >
                            <Text
                                style={[
                                    styles.genderText,
                                    gender === "Female" &&
                                    styles.genderTextSelected,
                                ]}
                            >
                                Female
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.genderChip,
                                gender === "Other" &&
                                styles.genderSelected,
                            ]}
                            onPress={() => setGender("Other")}
                        >
                            <Text
                                style={[
                                    styles.genderText,
                                    gender === "Other" &&
                                    styles.genderTextSelected,
                                ]}
                            >
                                Other
                            </Text>
                        </TouchableOpacity>

                    </View>
                    {/* ================= Blood Group ================= */}

                    <Text style={styles.sectionTitle}>
                        Blood Group
                    </Text>

                    <View style={styles.bloodGroupContainer}>

                        {[
                            "A+",
                            "A-",
                            "B+",
                            "B-",
                            "AB+",
                            "AB-",
                            "O+",
                            "O-",
                        ].map((group) => (
                            <TouchableOpacity
                                key={group}
                                style={[
                                    styles.bloodChip,
                                    bloodGroup === group &&
                                    styles.bloodSelected,
                                ]}
                                onPress={() =>
                                    setBloodGroup(group)
                                }
                            >
                                <Text
                                    style={[
                                        styles.bloodText,
                                        bloodGroup === group &&
                                        styles.bloodTextSelected,
                                    ]}
                                >
                                    {group}
                                </Text>
                            </TouchableOpacity>
                        ))}

                    </View>

                    {/* ================= Emergency Contact ================= */}

                    <View style={styles.inputContainer}>

                        <Image
                            source={require("@/assets/images/auth/phone.png")}
                            style={styles.icon}
                        />

                        <TextInput
                            placeholder="Emergency Contact Number"
                            placeholderTextColor="#94A3B8"
                            keyboardType="phone-pad"
                            maxLength={10}
                            style={styles.input}
                            value={emergencyContact}
                            onChangeText={setEmergencyContact}
                        />

                    </View>

                    {/* ================= Allergies ================= */}

                    <View style={styles.multilineContainer}>

                        <MaterialCommunityIcons
                            name="alert-circle-outline"
                            size={24}
                            color="#64748B"
                            style={styles.materialIcon}
                        />

                        <TextInput
                            placeholder="Allergies (Optional)"
                            placeholderTextColor="#94A3B8"
                            multiline
                            numberOfLines={3}
                            style={styles.multilineInput}
                            value={allergies}
                            onChangeText={setAllergies}
                        />

                    </View>

                    {/* ================= Medical History ================= */}

                    <View style={styles.multilineContainer}>

                        <MaterialCommunityIcons
                            name="hospital-box-outline"
                            size={24}
                            color="#64748B"
                            style={styles.materialIcon}
                        />

                        <TextInput
                            placeholder="Medical History (Optional)"
                            placeholderTextColor="#94A3B8"
                            multiline
                            numberOfLines={4}
                            style={styles.multilineInput}
                            value={medicalHistory}
                            onChangeText={setMedicalHistory}
                        />

                    </View>
                    {/* ================= Complete Profile Button ================= */}

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handleComplete}
                        style={styles.buttonContainer}
                    >
                        <LinearGradient
                            colors={["#2563EB", "#0A48D6"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.button}
                        >
                            <View style={styles.buttonContent}>

                                <Text style={styles.buttonText}>
                                    Complete Profile
                                </Text>

                                <View style={styles.arrowCircle}>
                                    <MaterialCommunityIcons
                                        name="arrow-right"
                                        size={24}
                                        color="#2563EB"
                                    />
                                </View>

                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* ================= Information ================= */}

                    <View style={styles.infoContainer}>

                        <MaterialCommunityIcons
                            name="shield-check-outline"
                            size={22}
                            color="#2563EB"
                        />

                        <Text style={styles.infoText}>
                            Your information is securely encrypted and
                            will only be shared with authorized healthcare
                            providers when required.
                        </Text>

                    </View>

                </ScrollView>

            </SafeAreaView>

        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    container: {
        flex: 1,
        paddingHorizontal: 24,
    },

    backButton: {
        alignSelf: "flex-start",
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,

        elevation: 4,
        marginBottom: 20,
    },

    logo: {
        width: 270,
        height: 74,
        resizeMode: "contain",
        alignSelf: "center",
        marginTop: 8,
    },

    subtitle: {
        textAlign: "center",
        fontSize: 18,
        color: "#64748B",
        marginTop: -5,
        marginBottom: 22,
    },

    heading: {
        fontSize: 34,
        fontWeight: "800",
        color: "#071739",
        textAlign: "center",
    },

    description: {
        textAlign: "center",
        fontSize: 17,
        color: "#64748B",
        lineHeight: 26,
        marginTop: 10,
        marginBottom: 28,
    },

    profileContainer: {
        alignItems: "center",
        marginBottom: 30,
    },

    avatarCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#EEF5FF",
        justifyContent: "center",
        alignItems: "center",

        borderWidth: 2,
        borderColor: "#DCEBFF",
    },

    uploadText: {
        marginTop: 14,
        fontSize: 18,
        fontWeight: "700",
        color: "#071739",
    },

    uploadSubText: {
        marginTop: 6,
        fontSize: 15,
        color: "#64748B",
    },

    inputContainer: {
        flexDirection: "row",
        alignItems: "center",

        width: "100%",
        height: 64,

        backgroundColor: "#FFFFFF",

        borderRadius: 22,

        paddingHorizontal: 18,

        marginBottom: 18,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,

        elevation: 6,
    },

    multilineContainer: {
        flexDirection: "row",
        alignItems: "flex-start",

        width: "100%",

        backgroundColor: "#FFFFFF",

        borderRadius: 22,

        paddingHorizontal: 18,
        paddingTop: 18,

        marginBottom: 18,

        minHeight: 120,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,

        elevation: 6,
    },

    icon: {
        width: 26,
        height: 26,
        resizeMode: "contain",
        marginRight: 14,
    },

    materialIcon: {
        marginRight: 14,
        marginTop: 2,
    },

    input: {
        flex: 1,
        fontSize: 16,
        color: "#071739",
    },

    multilineInput: {
        flex: 1,
        fontSize: 16,
        color: "#071739",
        textAlignVertical: "top",
        minHeight: 90,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#071739",
        marginBottom: 14,
        marginTop: 6,
    },

    genderContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 22,
    },

    genderChip: {
        flex: 1,
        marginHorizontal: 4,
        height: 46,

        justifyContent: "center",
        alignItems: "center",

        borderRadius: 24,

        borderWidth: 1,
        borderColor: "#CBD5E1",

        backgroundColor: "#FFFFFF",
    },

    genderSelected: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },

    genderText: {
        fontWeight: "600",
        color: "#64748B",
    },

    genderTextSelected: {
        color: "#FFFFFF",
    },

    bloodGroupContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 22,
    },

    bloodChip: {
        width: "22%",
        margin: "1.5%",
        height: 44,

        justifyContent: "center",
        alignItems: "center",

        borderRadius: 22,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#CBD5E1",
    },

    bloodSelected: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },

    bloodText: {
        fontWeight: "700",
        color: "#64748B",
    },

    bloodTextSelected: {
        color: "#FFFFFF",
    },

    buttonContainer: {
        marginTop: 12,
        marginBottom: 26,
    },

    button: {
        height: 64,
        borderRadius: 32,

        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#2563EB",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.30,
        shadowRadius: 12,

        elevation: 10,
    },

    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
    },

    buttonText: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "700",
        marginRight: 14,
    },

    arrowCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "#FFFFFF",

        justifyContent: "center",
        alignItems: "center",
    },

    infoContainer: {
        flexDirection: "row",
        alignItems: "flex-start",

        backgroundColor: "#EEF5FF",

        padding: 16,

        borderRadius: 18,

        marginBottom: 50,
    },

    infoText: {
        flex: 1,
        marginLeft: 12,
        color: "#475569",
        lineHeight: 22,
        fontSize: 15,
    },

    plus: {
        position: "absolute",
        width: 22,
        height: 22,
        opacity: 0.45,
        resizeMode: "contain",
    },

    hexagon: {
        position: "absolute",
        width: 82,
        height: 82,
        opacity: 0.35,
        resizeMode: "contain",
    },

    dots: {
        position: "absolute",
        width: 58,
        height: 58,
        opacity: 0.45,
        resizeMode: "contain",
    },

    wave: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
    },
});