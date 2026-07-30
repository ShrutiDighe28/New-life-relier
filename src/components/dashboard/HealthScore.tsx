import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useTheme } from "@/utils/themeManager";
import { useMedicines } from "@/context/MedicinesContext";

export default function MedicineReminder() {
    const router = useRouter();
    const slideAnim = useMemo(() => new Animated.Value(20), []);
    const fadeAnim = useMemo(() => new Animated.Value(0), []);
    const { colors, isDark } = useTheme();
    const { medicines } = useMedicines();
    
    const hasMedicines = medicines.length > 0;
    const nextMedicine = hasMedicines ? medicines[0] : null;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 8, delay: 200, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    const handleNavigate = () => {
        router.push("/profile/medicines");
    };

    return (
        <Animated.View style={[styles.wrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.header}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Medicine Reminder</Text>
                <TouchableOpacity onPress={handleNavigate}>
                    <Text style={{ color: "#2563EB", fontSize: 13, fontWeight: "600" }}>All Meds</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: isDark ? 1 : 0 }]}
                activeOpacity={0.9}
                onPress={handleNavigate}
            >
                <View style={styles.iconContainer}>
                    <View style={styles.iconBackground}>
                        <MaterialCommunityIcons name="pill" size={28} color="#8B5CF6" />
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    {nextMedicine ? (
                        <>
                            <Text style={[styles.medName, { color: colors.text }]}>{nextMedicine.name}</Text>
                            <Text style={[styles.medDosage, { color: colors.textSecondary }]}>{nextMedicine.dosage} • {nextMedicine.schedule}</Text>
                        </>
                    ) : (
                        <>
                            <Text style={[styles.medName, { color: colors.text }]}>No Medicines</Text>
                            <Text style={[styles.medDosage, { color: colors.textSecondary }]}>Add your prescriptions to get reminders.</Text>
                        </>
                    )}
                </View>

                <View style={styles.actionContainer}>
                    {nextMedicine ? (
                        <View style={styles.timeBadge}>
                            <MaterialCommunityIcons name="clock-outline" size={12} color="#8B5CF6" />
                            <Text style={styles.timeText}>After Food</Text>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.addButton} onPress={handleNavigate}>
                            <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrapper: { marginHorizontal: 20, marginTop: 24 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: "700", letterSpacing: -0.3 },
    card: {
        borderRadius: 20,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    iconContainer: { marginRight: 16 },
    iconBackground: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    infoContainer: { flex: 1, paddingRight: 10 },
    medName: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
    medDosage: { fontSize: 13, lineHeight: 18 },
    actionContainer: {
        alignItems: "flex-end",
    },
    timeBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    timeText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#8B5CF6",
        marginLeft: 4,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
    }
});