import React, { useState, useMemo, useEffect } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useAppointments, ReschedulePayload } from "@/context/AppointmentsContext";
import { useNotifications } from "@/context/NotificationsContext";
import { useTheme } from "@/utils/themeManager";
import { useAuth } from "@/context/AuthContext";
import ModernCalendar from "@/components/appointments/ModernCalendar";
import { formatDateShort } from "@/utils/calendarUtils";

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

const FEE_MAP: Record<string, string> = {
    Cardiology: "$150.00",
    Physician: "$80.00",
    Dermatology: "$120.00"
};

const allTimeSlots = ["09:00 AM", "10:30 AM", "11:15 AM", "02:00 PM", "03:30 PM", "04:30 PM"];
const insuranceProviders = ["Aetna Insurance", "HealthShield Insurance", "BlueCross BlueShield", "Self-Pay (No Insurance)"];

export default function BookAppointmentScreen() {
    const router = useRouter();
    const { rescheduleId } = useLocalSearchParams<{ rescheduleId?: string }>();
    const { colors, isDark } = useTheme();
    const { user } = useAuth();
    const { appointments, addAppointment, rescheduleAppointment } = useAppointments();
    const { addNotification } = useNotifications();

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
    
    // Convert existing display date back to a Date object, or use today
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        if (existingApp?.date) {
            const dateStr = existingApp.date.split(" • ")[0];
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) return d;
        }
        return new Date();
    });
    
    const [selectedTime, setSelectedTime] = useState(
        existingApp ? existingApp.date.split(" • ")[1] : ""
    );
    const [selectedInsurance, setSelectedInsurance] = useState(existingApp?.insurance || "Aetna Insurance");

    // Pre-fill user details from auth context
    const [firstName, setFirstName] = useState(user?.firstName || (user?.fullName ? user.fullName.split(" ")[0] : ""));
    const [lastName, setLastName] = useState(user?.lastName || (user?.fullName ? user.fullName.split(" ").slice(1).join(" ") : ""));
    const [mobile, setMobile] = useState(user?.mobile || "");
    const [address, setAddress] = useState(user?.address1 || "");
    
    // New fields
    const [symptoms, setSymptoms] = useState(existingApp?.symptoms || "");
    const [hasVideo, setHasVideo] = useState(existingApp?.hasVideo ?? true);
    
    const [createdAppResult, setCreatedAppResult] = useState<any>(null);
    const [booking, setBooking] = useState(false);
    const [booked, setBooked] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // List doctors based on selected specialty
    const doctors = useMemo(() => {
        return mockDoctors[selectedSpecialty] || [];
    }, [selectedSpecialty]);
    
    const selectedDoctor = useMemo(() => {
        return doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
    }, [doctors, selectedDoctorId]);

    // Compute dynamic time slots by checking existing appointments for the selected date and doctor
    const availableSlots = useMemo(() => {
        const y = selectedDate.getFullYear();
        const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const d = String(selectedDate.getDate()).padStart(2, '0');
        const isoDate = `${y}-${m}-${d}`;
        const displayDatePrefix = formatDateShort(selectedDate);

        // Find taken slots for this doctor on this day
        const takenSlots = appointments
            .filter(a => 
                a.status !== 'cancelled' && 
                a.doctorName === selectedDoctor?.name && 
                (a.date.startsWith(displayDatePrefix) || a.apiData?.AppointmentDate === isoDate)
            )
            .map(a => a.date.split(' • ')[1] || a.apiData?.Slot);

        return allTimeSlots.map(slot => ({
            time: slot,
            isAvailable: !takenSlots.includes(slot) || (existingApp && existingApp.date.split(" • ")[1] === slot)
        }));
    }, [selectedDate, selectedDoctor, appointments, existingApp]);

    // Auto-select first available time slot if selectedTime is invalid
    useEffect(() => {
        if (!selectedTime || !availableSlots.find(s => s.time === selectedTime)?.isAvailable) {
            const firstAvailable = availableSlots.find(s => s.isAvailable);
            setSelectedTime(firstAvailable ? firstAvailable.time : "");
        }
    }, [availableSlots]);

    const estimatedFee = FEE_MAP[selectedSpecialty] || "$100.00";

    const handleConfirm = async () => {
        if (!firstName.trim() || !lastName.trim() || !mobile.trim()) {
            setErrorMsg("Please fill in your name and mobile number.");
            return;
        }
        if (!selectedTime) {
            setErrorMsg("Please select an available time slot.");
            return;
        }
        if (!symptoms.trim()) {
            setErrorMsg("Please provide a reason for visit.");
            return;
        }
        
        setErrorMsg("");
        setBooking(true);
        
        // Format YYYY-MM-DD for API
        const y = selectedDate.getFullYear();
        const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const d = String(selectedDate.getDate()).padStart(2, '0');
        const isoDate = `${y}-${m}-${d}`;
        const displayDate = `${formatDateShort(selectedDate)} • ${selectedTime}`;

        try {
            if (rescheduleId) {
                const reschedulePayload: ReschedulePayload = {
                    AppointmentDate: isoDate,
                    Slot: selectedTime,
                    Address: address.trim(),
                    DrId: 20, // Mock ID
                    FirstName: firstName.trim(),
                    LastName: lastName.trim(),
                    Mobile: mobile.trim(),
                    BranchId: user?.branchId || 1,
                    UpdatedBy: user?.userName || user?.fullName || "User",
                    doctorName: selectedDoctor?.name || "Doctor",
                    specialty: selectedSpecialty,
                    specialtyIcon: 'stethoscope',
                    specialtyColor: '#2563EB',
                    clinic: selectedDoctor?.clinic || address || "LifeRelier Clinic",
                    insurance: selectedInsurance,
                    avatar: selectedDoctor?.avatar,
                    hasVideo,
                    symptoms: symptoms.trim(),
                    consultationFee: estimatedFee,
                    displayDate,
                };
                const updatedApp = await rescheduleAppointment(rescheduleId as string, reschedulePayload);
                setCreatedAppResult(updatedApp);
                addNotification({
                    title: "Appointment Rescheduled",
                    message: `Your appointment with ${selectedDoctor?.name || 'your doctor'} has been rescheduled to ${displayDate}.`,
                    category: "Appointments",
                    route: "/(tabs)/appointments"
                });
            } else {
                const newApp = await addAppointment({
                    DrId: 20, // Mock ID
                    FirstName: firstName.trim(),
                    LastName: lastName.trim(),
                    Mobile: mobile.trim(),
                    AppointmentDate: isoDate,
                    Slot: selectedTime || "20 Minutes",
                    Address: address.trim(),
                    GenderId: 1,
                    InitialId: 1,
                    BirthDate: user?.dob || new Date().toISOString().split('T')[0],
                    BranchId: user?.branchId || 1,
                    CreatedBy: user?.userName || user?.fullName || "User",
                    doctorName: selectedDoctor?.name,
                    specialty: selectedSpecialty,
                    date: displayDate,
                    clinic: selectedDoctor?.clinic || address || "LifeRelier Clinic",
                    insurance: selectedInsurance,
                    avatar: selectedDoctor?.avatar,
                    hasVideo,
                    symptoms: symptoms.trim(),
                    consultationFee: estimatedFee,
                });
                setCreatedAppResult(newApp);
                addNotification({
                    title: "Appointment Booked",
                    message: `Your appointment with ${selectedDoctor?.name || 'your doctor'} is confirmed for ${displayDate}.`,
                    category: "Appointments",
                    route: "/(tabs)/appointments"
                });
            }
            setBooked(true);
        } catch (e) {
            console.error("Booking error:", e);
            setErrorMsg("An error occurred while booking. Please try again.");
        } finally {
            setBooking(false);
        }
    };

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
                    
                    {/* Patient Details Form */}
                    <Text style={[styles.sectionLabel, { color: colors.text, marginTop: 10 }]}>Patient Details</Text>
                    <View style={styles.formRow}>
                        <View style={styles.formCol}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>First Name</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }]}
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholder="Jane"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>
                        <View style={styles.formCol}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Last Name</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }]}
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder="Doe"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>
                    </View>
                    <View style={styles.formRow}>
                        <View style={styles.formCol}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Mobile Number</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }]}
                                value={mobile}
                                onChangeText={setMobile}
                                keyboardType="phone-pad"
                                placeholder="+1 234 567 890"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>
                    </View>

                    {/* Pre-Consultation Intake */}
                    <Text style={[styles.sectionLabel, { color: colors.text }]}>Reason for Visit / Symptoms</Text>
                    <TextInput
                        style={[styles.inputMulti, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }]}
                        value={symptoms}
                        onChangeText={setSymptoms}
                        placeholder="Please describe your symptoms briefly..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    {/* Visit Type Toggle */}
                    <Text style={[styles.sectionLabel, { color: colors.text }]}>Consultation Type</Text>
                    <View style={styles.specialtyRow}>
                        <TouchableOpacity
                            style={[
                                styles.specialtyTab,
                                { backgroundColor: colors.card, borderColor: colors.cardBorder },
                                !hasVideo && styles.specialtyTabActive,
                            ]}
                            onPress={() => setHasVideo(false)}
                        >
                            <MaterialCommunityIcons name="hospital-building" size={20} color={!hasVideo ? "#FFFFFF" : colors.textSecondary} />
                            <Text style={[
                                styles.specialtyTabText, { color: colors.textSecondary, marginTop: 4 },
                                !hasVideo && styles.specialtyTabTextActive
                            ]}>In-Person</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.specialtyTab,
                                { backgroundColor: colors.card, borderColor: colors.cardBorder },
                                hasVideo && styles.specialtyTabActive,
                            ]}
                            onPress={() => setHasVideo(true)}
                        >
                            <MaterialCommunityIcons name="video" size={20} color={hasVideo ? "#FFFFFF" : colors.textSecondary} />
                            <Text style={[
                                styles.specialtyTabText, { color: colors.textSecondary, marginTop: 4 },
                                hasVideo && styles.specialtyTabTextActive
                            ]}>Video Call</Text>
                        </TouchableOpacity>
                    </View>

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

                    {/* Date picker (Modern Calendar) */}
                    <Text style={[styles.sectionLabel, { color: colors.text }]}>Select Date</Text>
                    <View style={{ marginHorizontal: -20, paddingBottom: 10 }}>
                        <ModernCalendar
                            appointments={[]}
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                        />
                    </View>

                    {/* Dynamic Slots grid */}
                    <Text style={[styles.sectionLabel, { color: colors.text }]}>Available Time Slots</Text>
                    <View style={styles.slotsGrid}>
                        {availableSlots.map((slotObj) => (
                            <TouchableOpacity
                                key={slotObj.time}
                                style={[
                                    styles.slotChip,
                                    { backgroundColor: colors.card, borderColor: colors.cardBorder },
                                    selectedTime === slotObj.time && styles.slotChipActive,
                                    !slotObj.isAvailable && { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: 'transparent', opacity: 0.5 }
                                ]}
                                onPress={() => {
                                    if (slotObj.isAvailable) {
                                        setSelectedTime(slotObj.time);
                                    }
                                }}
                                disabled={!slotObj.isAvailable}
                            >
                                <Text style={[
                                    styles.slotChipText, 
                                    { color: colors.textSecondary },
                                    selectedTime === slotObj.time && styles.slotChipTextActive,
                                    !slotObj.isAvailable && { textDecorationLine: 'line-through' }
                                ]}>
                                    {slotObj.time}
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

                    {/* Estimated Fee */}
                    <View style={[styles.feeContainer, { backgroundColor: `${colors.primary}12`, borderColor: colors.primary }]}>
                        <View style={styles.feeLeft}>
                            <MaterialCommunityIcons name="cash-check" size={24} color={colors.primary} />
                            <View style={{ marginLeft: 12 }}>
                                <Text style={[styles.feeLabel, { color: colors.primary }]}>Estimated Consultation Fee</Text>
                                <Text style={[styles.feeSub, { color: colors.textSecondary }]}>Pay securely at clinic desk.</Text>
                            </View>
                        </View>
                        <Text style={[styles.feeAmount, { color: colors.primary }]}>{estimatedFee}</Text>
                    </View>

                    {errorMsg ? (
                        <Text style={styles.errorText}>{errorMsg}</Text>
                    ) : null}

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
                        {createdAppResult?.appointmentId || createdAppResult?.id ? (
                            <View style={[styles.receiptRow, { borderBottomColor: colors.cardBorder }]}>
                                <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Appointment ID:</Text>
                                <Text style={[styles.receiptVal, { color: colors.primary, fontWeight: "800" }]}>
                                    {createdAppResult.appointmentId ? `APT-${String(createdAppResult.appointmentId).padStart(4, '0')}` : `APT-${createdAppResult.id.slice(-6).toUpperCase()}`}
                                </Text>
                            </View>
                        ) : null}
                        <View style={[styles.receiptRow, { borderBottomColor: colors.cardBorder }]}>
                            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Patient Name:</Text>
                            <Text style={[styles.receiptVal, { color: colors.text }]}>{firstName} {lastName}</Text>
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
                            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Type:</Text>
                            <Text style={[styles.receiptVal, { color: colors.text }]}>
                                {createdAppResult?.hasVideo ? "Video Call" : "In-Person Clinic"}
                            </Text>
                        </View>
                        <View style={[styles.receiptRow, { borderBottomColor: colors.cardBorder }]}>
                            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Date & Time:</Text>
                            <Text style={[styles.receiptVal, { color: colors.text }]}>
                                {createdAppResult?.date || `${formatDateShort(selectedDate)} • ${selectedTime}`}
                            </Text>
                        </View>
                        <View style={[styles.receiptRow, { borderBottomColor: colors.cardBorder }]}>
                            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Fee:</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={[styles.receiptVal, { color: colors.text }]}>{createdAppResult?.consultationFee || estimatedFee}</Text>
                                <View style={styles.payBadge}>
                                    <Text style={styles.payBadgeText}>Pay at Clinic</Text>
                                </View>
                            </View>
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
    formRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },
    formCol: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 6,
        color: "#64748B",
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 48,
        fontSize: 14,
    },
    inputMulti: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        minHeight: 100,
        fontSize: 14,
    },
    errorText: {
        color: "#EF4444",
        fontSize: 13,
        marginTop: 16,
        textAlign: "center",
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
    feeContainer: {
        marginTop: 24,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    feeLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    feeLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    feeSub: {
        fontSize: 11,
        marginTop: 2,
    },
    feeAmount: {
        fontSize: 18,
        fontWeight: '800',
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
    payBadge: {
        backgroundColor: '#10B98115',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 8,
    },
    payBadgeText: {
        color: '#10B981',
        fontSize: 10,
        fontWeight: '700',
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
