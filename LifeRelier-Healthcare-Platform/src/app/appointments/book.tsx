import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Image,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatDateShort } from "@/utils/calendarUtils";
import { useRouter, useLocalSearchParams } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useAppointments, ReschedulePayload } from "@/context/AppointmentsContext";
import { useNotifications } from "@/context/NotificationsContext";
import { useTheme } from "@/utils/themeManager";

import { useAuth } from "@/context/AuthContext";

const { width } = Dimensions.get("window");

interface Doctor {
    id: string;
    name: string;
    specialty: string;
    clinic: string;
    avatar: any;
    rating: string;
}

const mockDoctors: Record<string, Doctor[]> = {
    Cardiology: [
        { id: "d1", name: "Dr. James Anderson", specialty: "Cardiologist", clinic: "HeartCare Clinic, NY", avatar: require("@/assets/images/dashboard/doctor.png"), rating: "4.9 (124 reviews)" },
        { id: "d2", name: "Dr. Arun Sen", specialty: "Cardiologist", clinic: "LifeRelier Cardiac Hosp", avatar: require("@/assets/images/dashboard/doctor.png"), rating: "4.8 (98 reviews)" }
    ],
    Physician: [
        { id: "d3", name: "Dr. Sarah Thompson", specialty: "General Physician", clinic: "CityCare Hospital, NY", avatar: require("@/assets/images/dashboard/doctor.png"), rating: "4.9 (210 reviews)" },
        { id: "d4", name: "Dr. Priya Nair", specialty: "General Physician", clinic: "LifeRelier Care Clinic", avatar: require("@/assets/images/dashboard/doctor.png"), rating: "4.7 (145 reviews)" }
    ],
    Dermatology: [
        { id: "d5", name: "Dr. Michael Lee", specialty: "Dermatologist", clinic: "Skin & You Clinic, NY", avatar: require("@/assets/images/dashboard/doctor.png"), rating: "4.8 (88 reviews)" }
    ],
};

const timeSlots = ["09:00 AM", "10:30 AM", "11:15 AM", "02:00 PM", "03:30 PM", "04:30 PM"];
const insuranceProviders = ["Aetna Insurance", "HealthShield Insurance", "BlueCross BlueShield", "Self-Pay (No Insurance)"];

export default function BookAppointmentScreen() {
    const router = useRouter();
    const { rescheduleId } = useLocalSearchParams<{ rescheduleId?: string }>();
    const { colors, isDark } = useTheme();
    const { user } = useAuth();
    const { appointments, addAppointment, rescheduleAppointment } = useAppointments();
    const { addNotification } = useNotifications();

    const availableDates = useMemo(() => {
        const dates: string[] = [];
        const now = new Date();
        for (let i = 0; i < 14; i++) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
            dates.push(formatDateShort(d));
        }
        return dates;
    }, []);

    const existingApp = useMemo(() => {
        if (rescheduleId) {
            return appointments.find(a => a.id === rescheduleId);
        }
        return null;
    }, [rescheduleId, appointments]);

    const [selectedSpecialty, setSelectedSpecialty] = useState<"Cardiology" | "Physician" | "Dermatology">(
        (existingApp?.specialty as any) || "Cardiology"
    );
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>("d1");
    const [selectedDate, setSelectedDate] = useState(
        existingApp ? existingApp.date.split(" • ")[0] : availableDates[0]
    );
    const [selectedTime, setSelectedTime] = useState(
        existingApp ? existingApp.date.split(" • ")[1] : "10:30 AM"
    );
    const [selectedInsurance, setSelectedInsurance] = useState(existingApp?.insurance || "Aetna Insurance");

    // Form inputs for SaveAppointment API
    const [firstName, setFirstName] = useState(user?.firstName || user?.fullName?.split(" ")[0] || "Veena");
    const [lastName, setLastName] = useState(user?.lastName || user?.fullName?.split(" ")[1] || "Jagtap");
    const [mobile, setMobile] = useState(user?.mobile || "9420536458");
    const [address, setAddress] = useState("Pune");
    const [createdAppResult, setCreatedAppResult] = useState<any>(null);

    const [booking, setBooking] = useState(false);
    const [booked, setBooked] = useState(false);

    // List doctors based on selected specialty
    const doctors = useMemo(() => {
        return mockDoctors[selectedSpecialty] || [];
    }, [selectedSpecialty]);

    const handleConfirm = async () => {
        setBooking(true);
        try {
            if (rescheduleId) {
                // Build YYYY-MM-DD from display date if possible
                const isoDate = selectedDate; // already in display format; pass as-is
                const reschedulePayload: ReschedulePayload = {
                    AppointmentDate: isoDate,
                    Slot: selectedTime,
                    Address: address.trim() || "Pune",
                    DrId: 20,
                    FirstName: firstName.trim() || "Veena",
                    LastName: lastName.trim() || "Jagtap",
                    Mobile: mobile.trim() || "9420536458",
                    BranchId: user?.branchId || 1,
                    UpdatedBy: user?.userName || user?.fullName || "Admin",
                    doctorName: selectedDoctor?.name || "Doctor",
                    specialty: selectedSpecialty,
                    specialtyIcon: 'stethoscope',
                    specialtyColor: '#2563EB',
                    clinic: selectedDoctor?.clinic || address || "LifeRelier Clinic",
                    insurance: selectedInsurance,
                    avatar: selectedDoctor?.avatar,
                    hasVideo: true,
                    displayDate: `${selectedDate} • ${selectedTime}`,
                };
                const updatedApp = await rescheduleAppointment(rescheduleId as string, reschedulePayload);
                setCreatedAppResult(updatedApp);
                addNotification({
                    title: "Appointment Rescheduled",
                    message: `Your appointment with ${selectedDoctor?.name || 'your doctor'} has been rescheduled to ${selectedDate} at ${selectedTime}.`,
                    category: "Appointments",
                    route: "/(tabs)/appointments"
                });
            } else {
                const newApp = await addAppointment({
                    DrId: 20,
                    FirstName: firstName.trim() || "Veena",
                    LastName: lastName.trim() || "Jagtap",
                    Mobile: mobile.trim() || "9420536458",
                    AppointmentDate: "2026-06-29",
                    Slot: selectedTime || "20 Minutes",
                    Address: address.trim() || "Pune",
                    GenderId: 1,
                    InitialId: 1,
                    BirthDate: "1998-05-14",
                    BranchId: user?.branchId || 1,
                    CreatedBy: user?.userName || user?.fullName || "Admin",
                    doctorName: selectedDoctor?.name || "Dr. Veena Jagtap",
                    specialty: selectedSpecialty,
                    date: `${selectedDate} • ${selectedTime}`,
                    clinic: selectedDoctor?.clinic || address || "Pune Clinic",
                    insurance: selectedInsurance,
                    avatar: selectedDoctor?.avatar,
                    hasVideo: true,
                });
                setCreatedAppResult(newApp);
                addNotification({
                    title: "Appointment Booked",
                    message: `Your appointment with ${selectedDoctor?.name || 'your doctor'} is confirmed for ${selectedDate} at ${selectedTime}.`,
                    category: "Appointments",
                    route: "/(tabs)/appointments"
                });
            }
            setBooked(true);
        } catch (e) {
            console.error("Booking error:", e);
        } finally {
            setBooking(false);
        }
    };

    const selectedDoctor = useMemo(() => {
        return doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
    }, [doctors, selectedDoctorId]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    {rescheduleId ? "Reschedule Appointment" : "Book Appointment"}
                </Text>
                <View style={{ width: 38 }} />
            </View>

            {!booked ? (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Specialty Tabs */}
                    <Text style={[styles.sectionLabel, { color: colors.text }]}>Select Specialty</Text>
                    <View style={styles.specialtyRow}>
                        {(["Cardiology", "Physician", "Dermatology"] as const).map((spec) => (
                            <TouchableOpacity
                                key={spec}
                                style={[
                                    styles.specialtyTab,
                                    { backgroundColor: colors.card, borderColor: colors.cardBorder },
                                    selectedSpecialty === spec && styles.specialtyTabActive,
                                ]}
                                onPress={() => {
                                    setSelectedSpecialty(spec);
                                    // Auto-select first doctor of new specialty
                                    const docs = mockDoctors[spec] || [];
                                    if (docs.length > 0) setSelectedDoctorId(docs[0].id);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.specialtyTabText,
                                        { color: colors.textSecondary },
                                        selectedSpecialty === spec && styles.specialtyTabTextActive,
                                    ]}
                                >
                                    {spec}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Doctors List */}
                    <Text style={[styles.sectionLabel, { color: colors.text }]}>Select Doctor</Text>
                    {doctors.map((doc) => (
                        <TouchableOpacity
                            key={doc.id}
                            style={[
                                styles.doctorCard,
                                { backgroundColor: colors.card, borderColor: colors.cardBorder },
                                selectedDoctorId === doc.id && styles.doctorCardActive,
                                isDark && selectedDoctorId === doc.id && { backgroundColor: '#1E3A8A' }
                            ]}
                            onPress={() => setSelectedDoctorId(doc.id)}
                        >
                            <Image source={doc.avatar} style={styles.doctorAvatar} />
                            <View style={styles.doctorMeta}>
                                <Text style={[styles.doctorName, { color: selectedDoctorId === doc.id && isDark ? '#FFFFFF' : colors.text }]}>{doc.name}</Text>
                                <Text style={[styles.doctorClinic, { color: selectedDoctorId === doc.id && isDark ? '#93C5FD' : colors.textSecondary }]}>{doc.clinic}</Text>
                                <View style={styles.ratingRow}>
                                    <MaterialCommunityIcons name="star" size={14} color="#F59E0B" />
                                    <Text style={[styles.ratingText, { color: selectedDoctorId === doc.id && isDark ? '#BFDBFE' : colors.textSecondary }]}>{doc.rating}</Text>
                                </View>
                            </View>
                            {selectedDoctorId === doc.id && (
                                <MaterialCommunityIcons name="check-circle" size={22} color={isDark ? "#60A5FA" : "#2563EB"} />
                            )}
                        </TouchableOpacity>
                    ))}

                    {/* Date picker */}
                    <Text style={[styles.sectionLabel, { color: colors.text }]}>Select Date</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesRow}>
                        {availableDates.map((date) => (
                            <TouchableOpacity
                                key={date}
                                style={[
                                    styles.dateChip,
                                    { backgroundColor: colors.card, borderColor: colors.cardBorder },
                                    selectedDate === date && styles.dateChipActive
                                ]}
                                onPress={() => setSelectedDate(date)}
                            >
                                <Text style={[
                                    styles.dateChipText, 
                                    { color: colors.textSecondary },
                                    selectedDate === date && styles.dateChipTextActive
                                ]}>
                                    {date.split(",")[0]}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Slots grid */}
                    <Text style={[styles.sectionLabel, { color: colors.text }]}>Available Time Slots</Text>
                    <View style={styles.slotsGrid}>
                        {timeSlots.map((slot) => (
                            <TouchableOpacity
                                key={slot}
                                style={[
                                    styles.slotChip,
                                    { backgroundColor: colors.card, borderColor: colors.cardBorder },
                                    selectedTime === slot && styles.slotChipActive
                                ]}
                                onPress={() => setSelectedTime(slot)}
                            >
                                <Text style={[
                                    styles.slotChipText, 
                                    { color: colors.textSecondary },
                                    selectedTime === slot && styles.slotChipTextActive
                                ]}>
                                    {slot}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Insurance select */}
                    <Text style={[styles.sectionLabel, { color: colors.text }]}>Insurance Carrier</Text>
                    <View style={[styles.insuranceBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        {insuranceProviders.map((prov) => (
                            <TouchableOpacity
                                key={prov}
                                style={[
                                    styles.insuranceOption,
                                    { borderBottomColor: colors.divider },
                                    selectedInsurance === prov && styles.insuranceOptionActive,
                                ]}
                                onPress={() => setSelectedInsurance(prov)}
                            >
                                <Text
                                    style={[
                                        styles.insuranceText,
                                        { color: colors.textSecondary },
                                        selectedInsurance === prov && styles.insuranceTextActive,
                                        isDark && selectedInsurance === prov && { color: "#60A5FA" }
                                    ]}
                                >
                                    {prov}
                                </Text>
                                {selectedInsurance === prov && (
                                    <MaterialCommunityIcons name="check" size={16} color={isDark ? "#60A5FA" : "#2563EB"} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Submit booking button */}
                    <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={booking}>
                        {booking ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.confirmBtnText}>Confirm Appointment Booking</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            ) : (
                /* Successful Booking confirmation Page */
                <View style={[styles.successContainer, { backgroundColor: colors.background }]}>
                    <View style={styles.successIconWrapper}>
                        <MaterialCommunityIcons name="check-decagram" size={68} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.successTitle, { color: colors.text }]}>
                        {rescheduleId ? "Reschedule Confirmed!" : "Booking Confirmed!"}
                    </Text>
                    <Text style={[styles.successSub, { color: colors.textSecondary }]}>
                        Your appointment has been {rescheduleId ? "rescheduled" : "registered"} in the LifeRelier clinic scheduling database.
                    </Text>

                    {/* Booking / Reschedule metadata display cards */}
                    <View style={[styles.receiptCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.cardBorder }]}>
                        {createdAppResult?.appointmentId ? (
                            <View style={[styles.receiptRow, { borderBottomColor: colors.cardBorder }]}>
                                <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Appointment ID:</Text>
                                <Text style={[styles.receiptVal, { color: colors.primary, fontWeight: "800" }]}>
                                    #{createdAppResult.appointmentId}
                                </Text>
                            </View>
                        ) : null}
                        <View style={[styles.receiptRow, { borderBottomColor: colors.cardBorder }]}>
                            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Patient Name:</Text>
                            <Text style={[styles.receiptVal, { color: colors.text }]}>{firstName} {lastName}</Text>
                        </View>
                        <View style={[styles.receiptRow, { borderBottomColor: colors.cardBorder }]}>
                            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Mobile:</Text>
                            <Text style={[styles.receiptVal, { color: colors.text }]}>{mobile}</Text>
                        </View>
                        <View style={[styles.receiptRow, { borderBottomColor: colors.cardBorder }]}>
                            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Physician:</Text>
                            <Text style={[styles.receiptVal, { color: colors.text }]}>
                                {createdAppResult?.doctorName || selectedDoctor?.name || "—"}
                            </Text>
                        </View>
                        <View style={[styles.receiptRow, { borderBottomColor: colors.cardBorder }]}>
                            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Specialty:</Text>
                            <Text style={[styles.receiptVal, { color: colors.text }]}>
                                {createdAppResult?.specialty || selectedSpecialty}
                            </Text>
                        </View>
                        <View style={[styles.receiptRow, { borderBottomColor: colors.cardBorder }]}>
                            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Date & Time:</Text>
                            <Text style={[styles.receiptVal, { color: colors.text }]}>
                                {createdAppResult?.date || `${selectedDate} • ${selectedTime}`}
                            </Text>
                        </View>
                        <View style={[styles.receiptRow, { borderBottomColor: colors.cardBorder }]}>
                            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Location:</Text>
                            <Text style={[styles.receiptVal, { color: colors.text }]} numberOfLines={1}>
                                {createdAppResult?.clinic || address || selectedDoctor?.clinic}
                            </Text>
                        </View>
                        <View style={[styles.receiptRow, { borderBottomWidth: 0 }]}>
                            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Insurance:</Text>
                            <Text style={[styles.receiptVal, { color: colors.text }]}>
                                {createdAppResult?.insurance || selectedInsurance}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.replace("/(tabs)/appointments")}>
                        <Text style={styles.backHomeBtnText}>Go to Appointments Dashboard</Text>
                    </TouchableOpacity>
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
    sectionLabel: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
        marginTop: 20,
        marginBottom: 10,
    },
    specialtyRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    specialtyTab: {
        flex: 1,
        paddingVertical: 10,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        borderRadius: 12,
        alignItems: "center",
        marginHorizontal: 3,
        backgroundColor: "#FFFFFF",
    },
    specialtyTabActive: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
    specialtyTabText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#64748B",
    },
    specialtyTabTextActive: {
        color: "#FFFFFF",
    },
    doctorCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
    },
    doctorCardActive: {
        borderColor: "#2563EB",
        backgroundColor: "#EFF6FF",
    },
    doctorAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    doctorMeta: {
        flex: 1,
    },
    doctorName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
    },
    doctorClinic: {
        fontSize: 11,
        color: "#64748B",
        marginTop: 2,
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    ratingText: {
        fontSize: 11,
        color: "#64748B",
        marginLeft: 4,
    },
    datesRow: {
        paddingVertical: 4,
    },
    dateChip: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
    },
    dateChipActive: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
    dateChipText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#475569",
    },
    dateChipTextActive: {
        color: "#FFFFFF",
    },
    slotsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    slotChip: {
        width: (width - 56) / 3, // 3 columns
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: "center",
        marginBottom: 8,
    },
    slotChipActive: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
    slotChipText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#475569",
    },
    slotChipTextActive: {
        color: "#FFFFFF",
    },
    insuranceBox: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    insuranceOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    insuranceOptionActive: {},
    insuranceText: {
        fontSize: 13,
        color: "#475569",
        fontWeight: "500",
    },
    insuranceTextActive: {
        color: "#2563EB",
        fontWeight: "700",
    },
    confirmBtn: {
        backgroundColor: "#2563EB",
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 24,
    },
    confirmBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },
    successContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
        backgroundColor: "#FFFFFF",
    },
    successIconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#10B981",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#0F172A",
    },
    successSub: {
        fontSize: 13,
        color: "#64748B",
        textAlign: "center",
        marginTop: 8,
        lineHeight: 18,
        marginBottom: 24,
    },
    receiptCard: {
        width: "100%",
        backgroundColor: "#F8FAFC",
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        borderRadius: 20,
        padding: 16,
        marginBottom: 30,
    },
    receiptRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    receiptLabel: {
        fontSize: 12,
        color: "#64748B",
        fontWeight: "600",
    },
    receiptVal: {
        fontSize: 12,
        fontWeight: "700",
        color: "#0F172A",
        flex: 1,
        textAlign: "right",
        marginLeft: 10,
    },
    backHomeBtn: {
        backgroundColor: "#2563EB",
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 24,
        width: "100%",
        alignItems: "center",
    },
    backHomeBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },
});
