import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@/utils/themeManager";

export default function AddAppointmentScreen() {
    const { colors, isDark } = useTheme();
    const router = useRouter();

    const [form, setForm] = useState({
        patientName: "",
        date: "",
        time: "",
        type: "New",
        duration: "30 mins"
    });

    const appointmentTypes = ["New", "Follow-up", "Online", "Emergency"];
    const durations = ["15 mins", "30 mins", "45 mins", "60 mins"];

    return (
        <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={["top"]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? colors.card : "#F1F5F9" }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>New Appointment</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Patient Name</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: isDark ? colors.card : "#F8FAFC", color: colors.text, borderColor: colors.cardBorder }]}
                        placeholder="Enter patient's full name"
                        placeholderTextColor="#94A3B8"
                        value={form.patientName}
                        onChangeText={(t) => setForm({ ...form, patientName: t })}
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Date</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? colors.card : "#F8FAFC", color: colors.text, borderColor: colors.cardBorder }]}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#94A3B8"
                            value={form.date}
                            onChangeText={(t) => setForm({ ...form, date: t })}
                        />
                    </View>
                    <View style={{ width: 16 }} />
                    <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Time</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? colors.card : "#F8FAFC", color: colors.text, borderColor: colors.cardBorder }]}
                            placeholder="e.g. 10:30 AM"
                            placeholderTextColor="#94A3B8"
                            value={form.time}
                            onChangeText={(t) => setForm({ ...form, time: t })}
                        />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Consultation Type</Text>
                    <View style={styles.chipsContainer}>
                        {appointmentTypes.map((type) => {
                            const isSelected = form.type === type;
                            return (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.typeChip,
                                        { backgroundColor: isDark ? colors.card : "#F1F5F9", borderColor: colors.cardBorder },
                                        isSelected && { backgroundColor: "#0D9488", borderColor: "#0D9488" }
                                    ]}
                                    onPress={() => setForm({ ...form, type })}
                                >
                                    <Text style={[styles.chipText, { color: colors.textSecondary }, isSelected && { color: "#FFFFFF" }]}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Duration</Text>
                    <View style={styles.chipsContainer}>
                        {durations.map((duration) => {
                            const isSelected = form.duration === duration;
                            return (
                                <TouchableOpacity
                                    key={duration}
                                    style={[
                                        styles.typeChip,
                                        { backgroundColor: isDark ? colors.card : "#F1F5F9", borderColor: colors.cardBorder },
                                        isSelected && { backgroundColor: "#2563EB", borderColor: "#2563EB" }
                                    ]}
                                    onPress={() => setForm({ ...form, duration })}
                                >
                                    <Text style={[styles.chipText, { color: colors.textSecondary }, isSelected && { color: "#FFFFFF" }]}>
                                        {duration}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                    activeOpacity={0.8}
                    onPress={() => {
                        // For now just navigate back since backend logic is not implemented
                        router.back();
                    }}
                >
                    <Text style={styles.saveBtnText}>Save Appointment</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
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
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        height: 52,
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        fontSize: 15,
        fontWeight: "500",
    },
    row: {
        flexDirection: "row",
    },
    chipsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    typeChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 13,
        fontWeight: "600",
    },
    saveBtn: {
        height: 56,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    saveBtnText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
});
