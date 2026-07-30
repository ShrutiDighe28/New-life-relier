import React from "react";
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    FlatList, ScrollView, Modal, Pressable, Animated, Linking,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/utils/themeManager";
import LogoBrand from "@/components/LogoBrand";

// ─── Types ────────────────────────────────────────────────────────────────────

type PatientStatus = "Waiting" | "In Consultation" | "Completed" | "Cancelled" | "Critical";
type PatientPriority = "Normal" | "High" | "Emergency";

interface Vital { label: string; value: string; unit: string; icon: string; color: string; bg: string; }
interface Medication { name: string; dosage: string; freq: string; duration: string; }
interface LabReport { id: string; name: string; date: string; category: string; status: "Normal"|"Abnormal"|"Pending"; }
interface TimelineEvent { id: string; date: string; type: string; title: string; desc: string; }
interface Patient {
    id: string; name: string; patientId: string; age: number; gender: "Male"|"Female";
    bloodGroup: string; phone: string; appointmentTime: string; disease: string;
    status: PatientStatus; priority: PatientPriority; lastVisit: string;
    initials: string; avatarBg: string; avatarColor: string;
    isNew: boolean; isFollowUp: boolean; age_num: number;
    allergies: string[]; vitals: Vital[]; medications: Medication[];
    reports: LabReport[]; timeline: TimelineEvent[];
    healthScore: number; weight: string; height: string; bmi: string;
    emergencyContact: string; emergencyPhone: string; insurance: string; doctorNotes: string;
}

// ─── Patient Data Store ────────────────────────────────────────────────────────

const MOCK: Patient[] = [];

const STATUS_CFG: Record<PatientStatus, {color:string;bg:string;icon:string}> = {
    "Waiting":         {color:"#D97706",bg:"#FFFBEB",icon:"clock-outline"},
    "In Consultation": {color:"#2563EB",bg:"#EFF6FF",icon:"stethoscope"},
    "Completed":       {color:"#10B981",bg:"#ECFDF5",icon:"check-circle-outline"},
    "Cancelled":       {color:"#94A3B8",bg:"#F1F5F9",icon:"close-circle-outline"},
    "Critical":        {color:"#EF4444",bg:"#FEF2F2",icon:"alert-circle-outline"},
};
const PRIORITY_CFG: Record<PatientPriority, {color:string;bg:string}> = {
    "Normal":    {color:"#10B981",bg:"#ECFDF5"},
    "High":      {color:"#F59E0B",bg:"#FFFBEB"},
    "Emergency": {color:"#EF4444",bg:"#FEF2F2"},
};
const REPORT_CFG: Record<string,{icon:string;color:string;bg:string}> = {
    "Blood Test":{icon:"water",color:"#EF4444",bg:"#FEF2F2"},
    "MRI":       {icon:"brain",color:"#8B5CF6",bg:"#F5F3FF"},
    "X-Ray":     {icon:"radiobox-marked",color:"#2563EB",bg:"#EFF6FF"},
    "CT Scan":   {icon:"layers-outline",color:"#0D9488",bg:"#F0FDFA"},
    "Other":     {icon:"file-document-outline",color:"#D97706",bg:"#FFFBEB"},
};
const TIMELINE_CFG: Record<string,{icon:string;color:string;bg:string}> = {
    "Visit":       {icon:"hospital-building",color:"#2563EB",bg:"#EFF6FF"},
    "Diagnosis":   {icon:"stethoscope",color:"#0D9488",bg:"#F0FDFA"},
    "Prescription":{icon:"pill",color:"#10B981",bg:"#ECFDF5"},
    "Surgery":     {icon:"needle",color:"#EF4444",bg:"#FEF2F2"},
};
const FILTERS = [
    {key:"All",label:"All",icon:"format-list-bulleted"},
    {key:"Waiting",label:"Waiting",icon:"clock-outline"},
    {key:"In Consultation",label:"In Consult",icon:"stethoscope"},
    {key:"Completed",label:"Completed",icon:"check-circle-outline"},
    {key:"Critical",label:"Critical",icon:"alert-circle-outline"},
    {key:"New",label:"New",icon:"account-plus-outline"},
    {key:"Follow-up",label:"Follow-up",icon:"calendar-sync-outline"},
];

// ─── Reusable: Section title ─────────────────────────────────────────────────
function SectionTitle({ title, colors }: { title: string; colors: any }) {
    return <Text style={{ fontSize: 14, fontWeight: "800", color: colors.text, marginBottom: 12, letterSpacing: -0.2 }}>{title}</Text>;
}

// ─── Add Patient Modal ───────────────────────────────────────────────────────
function AddPatientModal({
    visible,
    onClose,
    onSave,
    colors,
    isDark,
}: {
    visible: boolean;
    onClose: () => void;
    onSave: (p: Patient) => void;
    colors: any;
    isDark: boolean;
}) {
    const [name, setName] = React.useState("");
    const [age, setAge] = React.useState("");
    const [gender, setGender] = React.useState<"Male" | "Female">("Male");
    const [phone, setPhone] = React.useState("");
    const [disease, setDisease] = React.useState("");
    const [bloodGroup, setBloodGroup] = React.useState("O+");
    const [status, setStatus] = React.useState<PatientStatus>("Waiting");
    const [priority, setPriority] = React.useState<PatientPriority>("Normal");
    const [emergencyContact, setEmergencyContact] = React.useState("");
    const [emergencyPhone, setEmergencyPhone] = React.useState("");
    const [doctorNotes, setDoctorNotes] = React.useState("");

    const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

    const handleSave = () => {
        const newErrors: { [key: string]: string } = {};
        if (!name.trim()) newErrors.name = "Patient name is required";
        if (!age.trim() || isNaN(Number(age))) newErrors.age = "Valid age is required";
        if (!phone.trim()) newErrors.phone = "Phone number is required";
        if (!disease.trim()) newErrors.disease = "Condition/Disease is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const nameParts = name.trim().split(" ");
        const initials = nameParts.length > 1 
            ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
            : name.trim().substring(0, 2).toUpperCase();

        const colorPalettes = [
            { bg: "#EFF6FF", color: "#2563EB" },
            { bg: "#F0FDFA", color: "#0D9488" },
            { bg: "#F5F3FF", color: "#7C3AED" },
            { bg: "#FEF2F2", color: "#EF4444" },
            { bg: "#FFFBEB", color: "#D97706" },
        ];
        const avatarStyle = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
        const ageNum = parseInt(age.trim(), 10) || 30;

        const newPatient: Patient = {
            id: Date.now().toString(),
            name: name.trim(),
            patientId: `PT${Math.floor(10000 + Math.random() * 90000)}`,
            age: ageNum,
            age_num: ageNum,
            gender,
            bloodGroup,
            phone: phone.trim(),
            appointmentTime: "Just Now",
            disease: disease.trim(),
            status,
            priority,
            lastVisit: "Today",
            initials,
            avatarBg: avatarStyle.bg,
            avatarColor: avatarStyle.color,
            isNew: true,
            isFollowUp: false,
            allergies: [],
            vitals: [
                { label: "BP", value: "120/80", unit: "mmHg", icon: "heart-pulse", color: "#10B981", bg: "#ECFDF5" },
                { label: "Heart", value: "72", unit: "bpm", icon: "heart", color: "#10B981", bg: "#ECFDF5" },
                { label: "SpO₂", value: "98", unit: "%", icon: "lungs", color: "#10B981", bg: "#ECFDF5" },
                { label: "Temp", value: "98.6", unit: "°F", icon: "thermometer", color: "#10B981", bg: "#ECFDF5" },
            ],
            medications: [],
            reports: [],
            timeline: [
                { id: `t_${Date.now()}`, date: "Today", type: "Visit", title: "Patient Registered", desc: `Registered with ${disease.trim()}` }
            ],
            healthScore: 88,
            weight: "70 kg",
            height: "170 cm",
            bmi: "24.2",
            emergencyContact: emergencyContact.trim() || "N/A",
            emergencyPhone: emergencyPhone.trim() || "N/A",
            insurance: "Standard",
            doctorNotes: doctorNotes.trim() || "Initial patient registration.",
        };

        onSave(newPatient);

        // Reset Form
        setName("");
        setAge("");
        setGender("Male");
        setPhone("");
        setDisease("");
        setBloodGroup("O+");
        setStatus("Waiting");
        setPriority("Normal");
        setEmergencyContact("");
        setEmergencyPhone("");
        setDoctorNotes("");
        setErrors({});
        onClose();
    };

    const inputStyle = [
        dsInput.input,
        { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: colors.text, borderColor: isDark ? "#334155" : "#E2E8F0" }
    ];

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={ds.overlay}>
                <View style={[ds.sheet, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF", height: "90%" }]}>
                    {/* Header */}
                    <View style={ds.handleRow}>
                        <View style={[ds.handle, { backgroundColor: isDark ? "#334155" : "#CBD5E1" }]} />
                        <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>Add New Patient</Text>
                        <TouchableOpacity onPress={onClose} style={[ds.closeBtn, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
                            <MaterialCommunityIcons name="close" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 16 }}>
                        {/* Full Name */}
                        <View>
                            <Text style={dsInput.label}>Full Name *</Text>
                            <TextInput
                                style={[inputStyle, errors.name && { borderColor: "#EF4444" }]}
                                placeholder="e.g. Rahul Sharma"
                                placeholderTextColor="#94A3B8"
                                value={name}
                                onChangeText={(t) => { setName(t); if (errors.name) setErrors(e => ({ ...e, name: "" })); }}
                            />
                            {errors.name ? <Text style={dsInput.errText}>{errors.name}</Text> : null}
                        </View>

                        {/* Age & Gender */}
                        <View style={{ flexDirection: "row", gap: 12 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={dsInput.label}>Age *</Text>
                                <TextInput
                                    style={[inputStyle, errors.age && { borderColor: "#EF4444" }]}
                                    placeholder="e.g. 35"
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="numeric"
                                    value={age}
                                    onChangeText={(t) => { setAge(t); if (errors.age) setErrors(e => ({ ...e, age: "" })); }}
                                />
                                {errors.age ? <Text style={dsInput.errText}>{errors.age}</Text> : null}
                            </View>
                            <View style={{ flex: 1.2 }}>
                                <Text style={dsInput.label}>Gender</Text>
                                <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
                                    {(["Male", "Female"] as const).map((g) => (
                                        <TouchableOpacity
                                            key={g}
                                            onPress={() => setGender(g)}
                                            style={[
                                                dsInput.chip,
                                                gender === g ? { backgroundColor: "#0D9488", borderColor: "#0D9488" } : { backgroundColor: isDark ? "#1E293B" : "#F1F5F9", borderColor: "transparent" }
                                            ]}
                                        >
                                            <Text style={{ fontSize: 12, fontWeight: "700", color: gender === g ? "#FFF" : colors.textSecondary }}>{g}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>

                        {/* Phone */}
                        <View>
                            <Text style={dsInput.label}>Phone Number *</Text>
                            <TextInput
                                style={[inputStyle, errors.phone && { borderColor: "#EF4444" }]}
                                placeholder="e.g. +91 98765 43210"
                                placeholderTextColor="#94A3B8"
                                keyboardType="phone-pad"
                                value={phone}
                                onChangeText={(t) => { setPhone(t); if (errors.phone) setErrors(e => ({ ...e, phone: "" })); }}
                            />
                            {errors.phone ? <Text style={dsInput.errText}>{errors.phone}</Text> : null}
                        </View>

                        {/* Disease / Condition */}
                        <View>
                            <Text style={dsInput.label}>Disease / Chief Complaint *</Text>
                            <TextInput
                                style={[inputStyle, errors.disease && { borderColor: "#EF4444" }]}
                                placeholder="e.g. Fever & Cough, Hypertension"
                                placeholderTextColor="#94A3B8"
                                value={disease}
                                onChangeText={(t) => { setDisease(t); if (errors.disease) setErrors(e => ({ ...e, disease: "" })); }}
                            />
                            {errors.disease ? <Text style={dsInput.errText}>{errors.disease}</Text> : null}
                        </View>

                        {/* Blood Group */}
                        <View>
                            <Text style={dsInput.label}>Blood Group</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 4 }}>
                                {["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"].map((bg) => (
                                    <TouchableOpacity
                                        key={bg}
                                        onPress={() => setBloodGroup(bg)}
                                        style={[
                                            dsInput.bgChip,
                                            bloodGroup === bg ? { backgroundColor: "#0D9488" } : { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }
                                        ]}
                                    >
                                        <Text style={{ fontSize: 12, fontWeight: "700", color: bloodGroup === bg ? "#FFF" : colors.textSecondary }}>{bg}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Initial Status */}
                        <View>
                            <Text style={dsInput.label}>Status</Text>
                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                                {(["Waiting", "In Consultation", "Completed", "Critical"] as const).map((st) => (
                                    <TouchableOpacity
                                        key={st}
                                        onPress={() => setStatus(st)}
                                        style={[
                                            dsInput.chip,
                                            status === st ? { backgroundColor: "#0D9488", borderColor: "#0D9488" } : { backgroundColor: isDark ? "#1E293B" : "#F1F5F9", borderColor: "transparent" }
                                        ]}
                                    >
                                        <Text style={{ fontSize: 12, fontWeight: "700", color: status === st ? "#FFF" : colors.textSecondary }}>{st}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Priority */}
                        <View>
                            <Text style={dsInput.label}>Priority Level</Text>
                            <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                                {(["Normal", "High", "Emergency"] as const).map((pr) => (
                                    <TouchableOpacity
                                        key={pr}
                                        onPress={() => setPriority(pr)}
                                        style={[
                                            dsInput.chip,
                                            priority === pr ? { backgroundColor: pr === "Emergency" ? "#EF4444" : pr === "High" ? "#F59E0B" : "#10B981" } : { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }
                                        ]}
                                    >
                                        <Text style={{ fontSize: 12, fontWeight: "700", color: priority === pr ? "#FFF" : colors.textSecondary }}>{pr}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Emergency Contact */}
                        <View style={{ flexDirection: "row", gap: 12 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={dsInput.label}>Emergency Contact Name</Text>
                                <TextInput
                                    style={inputStyle}
                                    placeholder="Relative name"
                                    placeholderTextColor="#94A3B8"
                                    value={emergencyContact}
                                    onChangeText={setEmergencyContact}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={dsInput.label}>Emergency Phone</Text>
                                <TextInput
                                    style={inputStyle}
                                    placeholder="Phone number"
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="phone-pad"
                                    value={emergencyPhone}
                                    onChangeText={setEmergencyPhone}
                                />
                            </View>
                        </View>

                        {/* Doctor Notes */}
                        <View>
                            <Text style={dsInput.label}>Doctor Notes</Text>
                            <TextInput
                                style={[inputStyle, { height: 70, textAlignVertical: "top", paddingTop: 10 }]}
                                placeholder="Additional clinical notes..."
                                placeholderTextColor="#94A3B8"
                                multiline
                                numberOfLines={3}
                                value={doctorNotes}
                                onChangeText={setDoctorNotes}
                            />
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity style={dsInput.saveBtn} onPress={handleSave} activeOpacity={0.88}>
                            <MaterialCommunityIcons name="check-circle-outline" size={20} color="#FFF" />
                            <Text style={dsInput.saveBtnText}>Save Patient</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

// ─── Patient Detail Modal ─────────────────────────────────────────────────────
function PatientDetail({ p, visible, onClose, colors, isDark }: {
    p: Patient | null; visible: boolean; onClose: () => void; colors: any; isDark: boolean;
}) {
    const [tab, setTab] = React.useState<"Overview"|"Vitals"|"History"|"Reports"|"AI">("Overview");
    if (!p) return null;
    const sc = STATUS_CFG[p.status];
    const pc = PRIORITY_CFG[p.priority];
    const scoreColor = p.healthScore >= 85 ? "#10B981" : p.healthScore >= 65 ? "#F59E0B" : "#EF4444";
    const C = { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: isDark ? "#334155" : "#E8EFF5" };
    const TABS = ["Overview","Vitals","History","Reports","AI"] as const;
    const TABICONS: Record<string,string> = {Overview:"account-outline",Vitals:"heart-pulse",History:"timeline-clock-outline",Reports:"file-chart-outline",AI:"robot-outline"};

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={ds.overlay}>
                <View style={[ds.sheet, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                    {/* Handle + close */}
                    <View style={ds.handleRow}>
                        <View style={[ds.handle, { backgroundColor: isDark ? "#334155" : "#CBD5E1" }]} />
                        <TouchableOpacity onPress={onClose} style={[ds.closeBtn, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
                            <MaterialCommunityIcons name="close" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Patient hero */}
                    <View style={[ds.heroCard, C]}>
                        <View style={[ds.bigAvatar, { backgroundColor: p.avatarBg }]}>
                            <Text style={[ds.bigAvatarText, { color: p.avatarColor }]}>{p.initials}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[ds.heroName, { color: colors.text }]}>{p.name}</Text>
                            <Text style={[ds.heroMeta, { color: colors.textSecondary }]}>{p.patientId}  •  {p.age} yrs, {p.gender}  •  {p.bloodGroup}</Text>
                            <View style={ds.heroBadges}>
                                <View style={[ds.sBadge, { backgroundColor: sc.bg }]}>
                                    <MaterialCommunityIcons name={sc.icon as any} size={10} color={sc.color} />
                                    <Text style={[ds.sBadgeTxt, { color: sc.color }]}>{p.status}</Text>
                                </View>
                                {p.priority !== "Normal" && (
                                    <View style={[ds.sBadge, { backgroundColor: pc.bg }]}>
                                        <Text style={[ds.sBadgeTxt, { color: pc.color }]}>{p.priority}</Text>
                                    </View>
                                )}
                                {p.isNew && <View style={[ds.sBadge, { backgroundColor: "#F0FDFA" }]}>
                                    <Text style={[ds.sBadgeTxt, { color: "#0D9488" }]}>NEW</Text>
                                </View>}
                            </View>
                        </View>
                        {/* Health score ring */}
                        <View style={[ds.scoreRing, { borderColor: scoreColor }]}>
                            <Text style={[ds.scoreNum, { color: scoreColor }]}>{p.healthScore}</Text>
                            <Text style={[ds.scoreLabel, { color: colors.textSecondary }]}>Score</Text>
                        </View>
                    </View>

                    {/* Quick actions */}
                    <View style={ds.qaRow}>
                        {[
                            {icon:"phone-outline",color:"#10B981",label:"Call",onPress:()=>Linking.openURL(`tel:${p.phone}`)},
                            {icon:"message-text-outline",color:"#2563EB",label:"Message",onPress:()=>Linking.openURL(`sms:${p.phone}`)},
                            {icon:"video-outline",color:"#0D9488",label:"Consult",onPress:()=>{}},
                            {icon:"file-document-edit",color:"#8B5CF6",label:"Prescribe",onPress:()=>{}},
                            {icon:"calendar-plus-outline",color:"#D97706",label:"Schedule",onPress:()=>{}},
                        ].map((a,i) => (
                            <TouchableOpacity key={i} style={ds.qaItem} onPress={a.onPress} activeOpacity={0.75}>
                                <View style={[ds.qaIcon, { backgroundColor: a.color + "18" }]}>
                                    <MaterialCommunityIcons name={a.icon as any} size={18} color={a.color} />
                                </View>
                                <Text style={[ds.qaLabel, { color: colors.textSecondary }]}>{a.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Tab bar */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}
                        style={[ds.tabBar, { borderBottomColor: isDark ? "#1E293B" : "#F1F5F9" }]}
                        contentContainerStyle={ds.tabBarContent}>
                        {TABS.map((t) => (
                            <TouchableOpacity key={t} onPress={() => setTab(t)}
                                style={[ds.tabItem, tab === t && { backgroundColor: "#F0FDFA" }]}>
                                <MaterialCommunityIcons name={TABICONS[t] as any} size={14}
                                    color={tab === t ? "#0D9488" : colors.textSecondary} />
                                <Text style={[ds.tabTxt, { color: tab === t ? "#0D9488" : colors.textSecondary },
                                    tab === t && { fontWeight: "800" }]}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Tab content */}
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ds.tabContent}>
                        {tab === "Overview" && <OverviewTab p={p} colors={colors} isDark={isDark} C={C} />}
                        {tab === "Vitals"   && <VitalsTab   p={p} colors={colors} isDark={isDark} C={C} scoreColor={scoreColor} />}
                        {tab === "History"  && <HistoryTab  p={p} colors={colors} isDark={isDark} C={C} />}
                        {tab === "Reports"  && <ReportsTab  p={p} colors={colors} isDark={isDark} C={C} />}
                        {tab === "AI"       && <AITab       p={p} colors={colors} isDark={isDark} C={C} />}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────
function OverviewTab({ p, colors, isDark, C }: any) {
    const rows = [
        {icon:"calendar-outline",label:"Appointment",val:p.appointmentTime,color:"#2563EB"},
        {icon:"stethoscope",label:"Chief Complaint",val:p.disease,color:"#0D9488"},
        {icon:"phone-outline",label:"Phone",val:p.phone,color:"#10B981"},
        {icon:"weight",label:"Weight / Height",val:`${p.weight}  ·  ${p.height}`,color:"#2563EB"},
        {icon:"calculator-variant-outline",label:"BMI",val:p.bmi,color:"#0D9488"},
        {icon:"shield-account-outline",label:"Insurance",val:p.insurance,color:"#8B5CF6"},
    ];
    return (
        <View>
            <View style={[ds.card, C]}>
                <SectionTitle title="Basic Information" colors={colors} />
                {rows.map((r) => (
                    <View key={r.label} style={ds.infoRow}>
                        <View style={[ds.infoIco, { backgroundColor: r.color + "18" }]}>
                            <MaterialCommunityIcons name={r.icon as any} size={15} color={r.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: "600" }}>{r.label}</Text>
                            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text, marginTop: 1 }}>{r.val}</Text>
                        </View>
                    </View>
                ))}
            </View>
            {/* Emergency */}
            <View style={[ds.card, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
                <SectionTitle title="Emergency Contact" colors={{ text: "#991B1B" }} />
                {[{icon:"account-outline",label:"Name",val:p.emergencyContact},{icon:"phone-outline",label:"Phone",val:p.emergencyPhone}].map(r => (
                    <View key={r.label} style={ds.infoRow}>
                        <View style={[ds.infoIco, { backgroundColor: "#FEE2E2" }]}>
                            <MaterialCommunityIcons name={r.icon as any} size={15} color="#EF4444" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 10, color: "#B91C1C", fontWeight: "600" }}>{r.label}</Text>
                            <Text style={{ fontSize: 13, fontWeight: "700", color: "#991B1B", marginTop: 1 }}>{r.val}</Text>
                        </View>
                    </View>
                ))}
            </View>
            {/* Allergies */}
            <View style={[ds.card, C]}>
                <SectionTitle title="Allergies & Alerts" colors={colors} />
                {p.allergies.length === 0
                    ? <Text style={{ fontSize: 13, color: colors.textSecondary }}>No known allergies</Text>
                    : <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                        {p.allergies.map((a: string) => (
                            <View key={a} style={ds.allergyChip}>
                                <MaterialCommunityIcons name="alert-circle" size={11} color="#EF4444" />
                                <Text style={{ color: "#EF4444", fontSize: 12, fontWeight: "700" }}>{a}</Text>
                            </View>
                        ))}
                    </View>}
            </View>
            {/* Doctor notes */}
            <View style={[ds.card, C]}>
                <SectionTitle title="Doctor Notes" colors={colors} />
                <Text style={{ fontSize: 13, lineHeight: 20, color: colors.text }}>{p.doctorNotes}</Text>
            </View>
        </View>
    );
}

// ─── Tab: Vitals ──────────────────────────────────────────────────────────────
function VitalsTab({ p, colors, isDark, C, scoreColor }: any) {
    return (
        <View>
            <View style={[ds.card, C]}>
                <SectionTitle title="Current Vitals" colors={colors} />
                <View style={ds.vitalsGrid}>
                    {p.vitals.map((v: Vital, i: number) => (
                        <View key={i} style={[ds.vitalCard, { backgroundColor: v.bg }]}>
                            <MaterialCommunityIcons name={v.icon as any} size={20} color={v.color} />
                            <Text style={[ds.vitalVal, { color: v.color }]}>{v.value}</Text>
                            <Text style={[ds.vitalUnit, { color: v.color + "AA" }]}>{v.unit}</Text>
                            <Text style={[ds.vitalLabel, { color: colors.textSecondary }]}>{v.label}</Text>
                        </View>
                    ))}
                </View>
            </View>
            <View style={[ds.card, C]}>
                <SectionTitle title="Health Score" colors={colors} />
                <View style={[ds.scoreBar, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]}>
                    <View style={[ds.scoreFill, { width: `${p.healthScore}%` as any, backgroundColor: scoreColor }]} />
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                        {p.healthScore >= 85 ? "Excellent" : p.healthScore >= 65 ? "Good" : "Needs Attention"}
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: "800", color: scoreColor }}>{p.healthScore}/100</Text>
                </View>
            </View>
            <View style={[ds.card, C]}>
                <SectionTitle title="Body Metrics" colors={colors} />
                <View style={{ flexDirection: "row", gap: 10 }}>
                    {[{label:"Weight",val:p.weight,icon:"weight",color:"#2563EB"},{label:"Height",val:p.height,icon:"human-male-height",color:"#0D9488"},{label:"BMI",val:p.bmi,icon:"calculator-variant",color:"#D97706"}].map(m => (
                        <View key={m.label} style={[ds.metricBox, { backgroundColor: m.color + "12", flex: 1 }]}>
                            <MaterialCommunityIcons name={m.icon as any} size={20} color={m.color} />
                            <Text style={{ fontSize: 13, fontWeight: "800", color: m.color, marginTop: 6 }}>{m.val}</Text>
                            <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: "600" }}>{m.label}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

// ─── Tab: History ─────────────────────────────────────────────────────────────
function HistoryTab({ p, colors, isDark, C }: any) {
    return (
        <View style={[ds.card, C]}>
            <SectionTitle title="Medical Timeline" colors={colors} />
            {p.timeline.map((ev: TimelineEvent, i: number) => {
                const cfg = TIMELINE_CFG[ev.type] || TIMELINE_CFG["Visit"];
                return (
                    <View key={ev.id} style={{ flexDirection: "row", marginBottom: 4 }}>
                        <View style={{ width: 40, alignItems: "center", marginRight: 12 }}>
                            <View style={[ds.tlIco, { backgroundColor: cfg.bg }]}>
                                <MaterialCommunityIcons name={cfg.icon as any} size={14} color={cfg.color} />
                            </View>
                            {i < p.timeline.length - 1 && <View style={[ds.tlLine, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]} />}
                        </View>
                        <View style={{ flex: 1, paddingBottom: 20 }}>
                            <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: "600" }}>{ev.date}</Text>
                            <Text style={{ fontSize: 13, fontWeight: "800", color: colors.text, marginTop: 2 }}>{ev.title}</Text>
                            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{ev.desc}</Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

// ─── Tab: Reports ─────────────────────────────────────────────────────────────
function ReportsTab({ p, colors, isDark, C }: any) {
    return (
        <View style={[ds.card, C]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: colors.text }}>Lab Reports</Text>
                <TouchableOpacity style={[ds.uploadBtn]} activeOpacity={0.8}>
                    <MaterialCommunityIcons name="upload-outline" size={13} color="#0D9488" />
                    <Text style={{ color: "#0D9488", fontSize: 12, fontWeight: "700" }}>Upload</Text>
                </TouchableOpacity>
            </View>
            {p.reports.length === 0
                ? <View style={{ alignItems: "center", paddingVertical: 24 }}>
                    <MaterialCommunityIcons name="file-search-outline" size={40} color="#94A3B8" style={{ opacity: 0.5 }} />
                    <Text style={{ color: colors.textSecondary, marginTop: 8, fontSize: 13 }}>No reports yet</Text>
                  </View>
                : p.reports.map((r: LabReport) => {
                    const cfg = REPORT_CFG[r.category] || REPORT_CFG["Other"];
                    const sColor = r.status === "Normal" ? "#10B981" : r.status === "Abnormal" ? "#EF4444" : "#F59E0B";
                    return (
                        <View key={r.id} style={[ds.reportRow, { borderColor: isDark ? "#334155" : "#F1F5F9" }]}>
                            <View style={[ds.reportIco, { backgroundColor: cfg.bg }]}>
                                <MaterialCommunityIcons name={cfg.icon as any} size={18} color={cfg.color} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>{r.name}</Text>
                                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 1 }}>{r.date}  ·  {r.category}</Text>
                            </View>
                            <View style={[ds.statusPill, { backgroundColor: sColor + "18" }]}>
                                <Text style={{ color: sColor, fontSize: 10, fontWeight: "700" }}>{r.status}</Text>
                            </View>
                            <TouchableOpacity style={ds.dlBtn} activeOpacity={0.8}>
                                <MaterialCommunityIcons name="download-outline" size={16} color="#0D9488" />
                            </TouchableOpacity>
                        </View>
                    );
                })}
        </View>
    );
}

// ─── Tab: AI ──────────────────────────────────────────────────────────────────
function AITab({ p, colors, isDark, C }: any) {
    const risk = p.healthScore < 65 ? "High Risk" : p.healthScore < 80 ? "Moderate" : "Low Risk";
    const rColor = p.healthScore < 65 ? "#EF4444" : p.healthScore < 80 ? "#F59E0B" : "#10B981";
    return (
        <View>
            <LinearGradient colors={["#0D9488","#0A7870"]} style={[ds.card, { marginBottom: 14 }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <MaterialCommunityIcons name="brain" size={20} color="#FFF" />
                    <Text style={{ color: "#FFF", fontSize: 14, fontWeight: "800", flex: 1 }}>AI Health Summary</Text>
                    <View style={{ backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 }}>
                        <Text style={{ color: "#FFF", fontSize: 9, fontWeight: "800" }}>BETA</Text>
                    </View>
                </View>
                <Text style={{ color: "#CCFBF1", fontSize: 13, lineHeight: 19 }}>
                    {p.name.split(" ")[0]} is a {p.age}-year-old {p.gender.toLowerCase()} presenting with {p.disease}. Health score: {p.healthScore}/100. {p.allergies.length > 0 ? `Known allergies: ${p.allergies.join(", ")}.` : "No known allergies."} {p.medications.length > 0 ? `On ${p.medications.length} active medication(s).` : "No current medications."}
                </Text>
            </LinearGradient>
            <View style={[ds.card, C]}>
                <SectionTitle title="Risk Assessment" colors={colors} />
                <View style={[ds.riskBox, { backgroundColor: rColor + "15" }]}>
                    <MaterialCommunityIcons name="shield-alert-outline" size={26} color={rColor} />
                    <View style={{ marginLeft: 12 }}>
                        <Text style={{ fontSize: 15, fontWeight: "800", color: rColor }}>{risk}</Text>
                        <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>Based on vitals, history & medications</Text>
                    </View>
                </View>
            </View>
            <View style={[ds.card, C]}>
                <SectionTitle title="AI Suggestions" colors={colors} />
                {[
                    {icon:"calendar-sync-outline",color:"#2563EB",text:"Schedule follow-up in 14 days"},
                    {icon:"pill",color:"#10B981",text:"Review medication adherence at next visit"},
                    {icon:"food-apple-outline",color:"#D97706",text:"Recommend dietary consultation"},
                    {icon:"run",color:"#0D9488",text:"Advise 30 min light exercise daily"},
                ].map((s,i) => (
                    <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <View style={[ds.suggIco, { backgroundColor: s.color + "18" }]}>
                            <MaterialCommunityIcons name={s.icon as any} size={14} color={s.color} />
                        </View>
                        <Text style={{ fontSize: 13, color: colors.text, flex: 1 }}>{s.text}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

// ─── Patient Card ─────────────────────────────────────────────────────────────
function PatientCard({ p, colors, isDark, onPress }: { p: Patient; colors: any; isDark: boolean; onPress: () => void }) {
    const sc = STATUS_CFG[p.status];
    const pc = PRIORITY_CFG[p.priority];
    const isCrit = p.status === "Critical" || p.priority === "Emergency";
    const C = { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isCrit ? "#EF444440" : (isDark ? colors.cardBorder : "#E8EFF5") };
    return (
        <TouchableOpacity style={[s.patCard, C, isCrit && { borderLeftWidth: 4, borderLeftColor: "#EF4444" }]}
            onPress={onPress} activeOpacity={0.88}>
            {/* Row 1: Avatar + name + status */}
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                <View style={[s.avatar, { backgroundColor: p.avatarBg }]}>
                    <Text style={[s.avatarTxt, { color: p.avatarColor }]}>{p.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <Text style={[s.patName, { color: colors.text }]} numberOfLines={1}>{p.name}</Text>
                        {p.isNew && <View style={s.newPill}><Text style={s.newPillTxt}>NEW</Text></View>}
                    </View>
                    <Text style={[s.patId, { color: "#0D9488" }]}>{p.patientId}</Text>
                    <Text style={[s.patMeta, { color: colors.textSecondary }]}>{p.age} yrs  ·  {p.gender}  ·  {p.bloodGroup}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <View style={[s.statusPill, { backgroundColor: sc.bg }]}>
                        <MaterialCommunityIcons name={sc.icon as any} size={9} color={sc.color} />
                        <Text style={[s.statusTxt, { color: sc.color }]}>{p.status === "In Consultation" ? "Consult" : p.status}</Text>
                    </View>
                    {p.priority !== "Normal" && (
                        <View style={[s.priorityPill, { backgroundColor: pc.bg }]}>
                            <Text style={[s.priorityTxt, { color: pc.color }]}>{p.priority}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Row 2: Disease + time */}
            <View style={[s.row2, { borderTopColor: isDark ? "#334155" : "#F1F5F9" }]}>
                <View style={s.diseaseTag}>
                    <MaterialCommunityIcons name="stethoscope" size={11} color="#0D9488" />
                    <Text style={s.diseaseTxt} numberOfLines={1}>{p.disease}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <MaterialCommunityIcons name="clock-outline" size={11} color={colors.textSecondary} />
                    <Text style={[s.timeTxt, { color: colors.textSecondary }]}>{p.appointmentTime}</Text>
                </View>
            </View>

            {/* Row 3: Last visit + actions */}
            <View style={[s.row3]}>
                <Text style={[s.lastVisit, { color: colors.textSecondary }]}>Last: {p.lastVisit}</Text>
                <View style={{ flexDirection: "row", gap: 6 }}>
                    {[
                        {icon:"phone-outline",color:"#10B981",onPress:()=>Linking.openURL(`tel:${p.phone}`)},
                        {icon:"message-text-outline",color:"#2563EB",onPress:()=>Linking.openURL(`sms:${p.phone}`)},
                        {icon:"eye-outline",color:"#0D9488",onPress},
                    ].map((btn,i) => (
                        <TouchableOpacity key={i}
                            style={[s.qBtn, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}
                            onPress={btn.onPress} activeOpacity={0.75}>
                            <MaterialCommunityIcons name={btn.icon as any} size={13} color={btn.color} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DoctorPatientsScreen() {
    const { colors, isDark } = useTheme();

    const [patients, setPatients]   = React.useState<Patient[]>(MOCK);
    const [search, setSearch]       = React.useState("");
    const [filter, setFilter]       = React.useState("All");
    const [sortBy, setSortBy]       = React.useState("Appointment Time");
    const [showSort, setShowSort]   = React.useState(false);
    const [selected, setSelected]   = React.useState<Patient | null>(null);
    const [showDetail, setShowDetail] = React.useState(false);
    const [showAddModal, setShowAddModal] = React.useState(false);

    const stats = React.useMemo(() => ({
        total:     patients.length,
        waiting:   patients.filter(p => p.status === "Waiting").length,
        inConsult: patients.filter(p => p.status === "In Consultation").length,
        completed: patients.filter(p => p.status === "Completed").length,
        critical:  patients.filter(p => p.status === "Critical" || p.priority === "Emergency").length,
        newP:      patients.filter(p => p.isNew).length,
    }), [patients]);

    const filtered = React.useMemo(() => {
        let list = patients;
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.patientId.toLowerCase().includes(q) ||
                p.phone.includes(q) ||
                p.disease.toLowerCase().includes(q)
            );
        }
        if (filter === "New")          list = list.filter(p => p.isNew);
        else if (filter === "Follow-up") list = list.filter(p => p.isFollowUp);
        else if (filter === "Critical")  list = list.filter(p => p.status === "Critical" || p.priority === "Emergency");
        else if (filter !== "All")       list = list.filter(p => p.status === filter);

        if (sortBy === "Name")   list = [...list].sort((a,b) => a.name.localeCompare(b.name));
        if (sortBy === "Age")    list = [...list].sort((a,b) => a.age_num - b.age_num);
        if (sortBy === "Priority") {
            const ord = {Emergency:3,High:2,Normal:1};
            list = [...list].sort((a,b) => ord[b.priority] - ord[a.priority]);
        }
        return list;
    }, [patients, search, filter, sortBy]);

    const handleAddPatient = (newPatient: Patient) => {
        setPatients(prev => [newPatient, ...prev]);
    };

    const C = { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: isDark ? colors.cardBorder : "#E8EFF5" };

    const STAT_ITEMS = [
        { label: "Total",    val: stats.total,     icon: "account-group-outline", color: "#0D9488", bg: "#F0FDFA", filterKey: "All" },
        { label: "Waiting",  val: stats.waiting,   icon: "clock-outline",         color: "#D97706", bg: "#FFFBEB", filterKey: "Waiting" },
        { label: "Consult",  val: stats.inConsult, icon: "stethoscope",           color: "#2563EB", bg: "#EFF6FF", filterKey: "In Consultation" },
        { label: "Done",     val: stats.completed, icon: "check-circle-outline",   color: "#10B981", bg: "#ECFDF5", filterKey: "Completed" },
        { label: "Critical", val: stats.critical,  icon: "alert-circle-outline",  color: "#EF4444", bg: "#FEF2F2", filterKey: "Critical" },
    ];

    return (
        <SafeAreaView style={[s.root, { backgroundColor: colors.background }]} edges={["top"]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 110 }}
            >
                {/* 1. HEADER */}
                <View style={s.header}>
                    <View style={{ flex: 1 }}>
                        <LogoBrand size={24} fontSize={16} style={{ marginBottom: 5 }} />
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <Text style={[s.title, { color: colors.text }]}>My Patients</Text>
                            <View style={[s.countPill, { backgroundColor: isDark ? "#1E293B" : "#F0FDFA" }]}>
                                <Text style={{ color: "#0D9488", fontSize: 12, fontWeight: "800" }}>{patients.length}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* 2. TOP 5 STATISTICS CARDS - SINGLE HORIZONTAL ROW */}
                <View style={s.statsRow}>
                    {STAT_ITEMS.map((item) => {
                        const isActive = filter === item.filterKey;
                        return (
                            <TouchableOpacity
                                key={item.label}
                                activeOpacity={0.8}
                                onPress={() => setFilter(filter === item.filterKey ? "All" : item.filterKey)}
                                style={[
                                    s.statCardRow,
                                    C,
                                    isActive && { borderColor: item.color, borderWidth: 2, backgroundColor: item.bg }
                                ]}
                            >
                                <View style={[s.statIconWrapSmall, { backgroundColor: item.bg }]}>
                                    <MaterialCommunityIcons name={item.icon as any} size={15} color={item.color} />
                                </View>
                                <Text style={[s.statValSmall, { color: colors.text }]}>{item.val}</Text>
                                <Text style={[s.statLabelSmall, { color: colors.textSecondary }]} numberOfLines={1} adjustsFontSizeToFit>{item.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* 3. SEARCH BAR - BELOW STATS ROW */}
                <View style={[s.searchWrap, C]}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
                    <TextInput
                        style={[s.searchInput, { color: colors.text }]}
                        placeholder="Search by name, ID, phone, disease..."
                        placeholderTextColor="#94A3B8"
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}>
                            <MaterialCommunityIcons name="close-circle" size={16} color="#94A3B8" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* 4. FILTER CHIPS & SORT - BELOW SEARCH BAR */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8, paddingLeft: 16 }} style={{ flex: 1 }}>
                        {FILTERS.map((f) => (
                            <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)} activeOpacity={0.8}
                                style={[s.filterPill, filter === f.key ? { backgroundColor: "#0D9488" } : { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
                                <MaterialCommunityIcons name={f.icon as any} size={12}
                                    color={filter === f.key ? "#FFF" : colors.textSecondary} />
                                <Text style={[s.filterTxt, { color: filter === f.key ? "#FFF" : colors.textSecondary }]}>{f.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity style={[s.sortBtn, C, { marginRight: 16 }]} onPress={() => setShowSort(true)}>
                        <MaterialCommunityIcons name="sort-variant" size={17} color="#0D9488" />
                    </TouchableOpacity>
                </View>

                {/* 5. RESULTS COUNT */}
                <Text style={[s.resultCount, { color: colors.textSecondary }]}>
                    {filtered.length} patient{filtered.length !== 1 ? "s" : ""}{sortBy !== "Appointment Time" ? `  ·  Sorted by ${sortBy}` : ""}
                </Text>

                {/* 6. PATIENT LIST */}
                <View style={{ paddingHorizontal: 16, gap: 10 }}>
                    {filtered.length === 0 ? (
                        <View style={s.empty}>
                            <MaterialCommunityIcons name="account-search-outline" size={60} color="#94A3B8" style={{ opacity: 0.4 }} />
                            <Text style={[s.emptyTitle, { color: colors.text }]}>No Patients Found</Text>
                            <Text style={[s.emptySub, { color: colors.textSecondary }]}>Adjust your search or filter.</Text>
                            <TouchableOpacity style={s.clearBtn} onPress={() => { setSearch(""); setFilter("All"); }}>
                                <Text style={{ color: "#0D9488", fontWeight: "700", fontSize: 14 }}>Clear Filters</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        filtered.map((item) => (
                            <PatientCard
                                key={item.id}
                                p={item}
                                colors={colors}
                                isDark={isDark}
                                onPress={() => { setSelected(item); setShowDetail(true); }}
                            />
                        ))
                    )}
                </View>
            </ScrollView>

            {/* 7. FLOATING "+ ADD PATIENT" BUTTON */}
            <TouchableOpacity
                style={s.fab}
                activeOpacity={0.85}
                onPress={() => setShowAddModal(true)}
            >
                <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
                <Text style={s.fabText}>Add Patient</Text>
            </TouchableOpacity>

            {/* ADD PATIENT MODAL */}
            <AddPatientModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={handleAddPatient}
                colors={colors}
                isDark={isDark}
            />

            {/* SORT MODAL */}
            <Modal visible={showSort} transparent animationType="fade" onRequestClose={() => setShowSort(false)}>
                <Pressable style={s.sortOverlay} onPress={() => setShowSort(false)}>
                    <View style={[s.sortSheet, { backgroundColor: isDark ? "#1E293B" : "#FFF" }]}>
                        <View style={[s.sheetHandle, { backgroundColor: isDark ? "#334155" : "#CBD5E1" }]} />
                        <Text style={[s.sheetTitle, { color: colors.text }]}>Sort Patients By</Text>
                        {["Appointment Time","Name","Age","Priority","Recent Visit"].map((opt) => (
                            <TouchableOpacity key={opt}
                                style={[s.sortOption, { borderColor: isDark ? "#334155" : "#F1F5F9" }]}
                                onPress={() => { setSortBy(opt); setShowSort(false); }}>
                                <Text style={[s.sortOptionTxt, { color: sortBy === opt ? "#0D9488" : colors.text }]}>{opt}</Text>
                                {sortBy === opt && <MaterialCommunityIcons name="check-circle" size={17} color="#0D9488" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>

            {/* DETAIL MODAL */}
            <PatientDetail p={selected} visible={showDetail} onClose={() => setShowDetail(false)} colors={colors} isDark={isDark} />

        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    root:   { flex: 1 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
    title:  { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
    countPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },

    // Single Horizontal Row for Top 5 Stats
    statsRow: {
        flexDirection: "row",
        paddingHorizontal: 16,
        gap: 6,
        marginBottom: 14,
    },
    statCardRow: {
        flex: 1,
        borderRadius: 14,
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 2,
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    statIconWrapSmall: {
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 2,
    },
    statValSmall: {
        fontSize: 16,
        fontWeight: "800",
        letterSpacing: -0.3,
    },
    statLabelSmall: {
        fontSize: 9,
        fontWeight: "700",
        textAlign: "center",
    },

    searchWrap: { flexDirection: "row", alignItems: "center", gap: 10, height: 46, borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, marginHorizontal: 16, marginBottom: 12 },
    searchInput: { flex: 1, fontSize: 14, fontWeight: "500" },
    filterPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 13, paddingVertical: 7, borderRadius: 18 },
    filterTxt:  { fontSize: 12, fontWeight: "700" },
    sortBtn:    { width: 38, height: 38, borderRadius: 12, borderWidth: 1, justifyContent: "center", alignItems: "center" },
    resultCount:{ fontSize: 12, fontWeight: "600", paddingHorizontal: 16, marginBottom: 8 },
    // Patient card
    patCard:    { borderRadius: 18, borderWidth: 1, padding: 14, gap: 10, overflow: "hidden" },
    avatar:     { width: 46, height: 46, borderRadius: 23, justifyContent: "center", alignItems: "center" },
    avatarTxt:  { fontSize: 16, fontWeight: "800" },
    patName:    { fontSize: 15, fontWeight: "800", letterSpacing: -0.2 },
    patId:      { fontSize: 11, fontWeight: "700", marginTop: 1 },
    patMeta:    { fontSize: 12, marginTop: 2 },
    newPill:    { backgroundColor: "#F0FDFA", borderWidth: 1, borderColor: "#CCFBF1", paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
    newPillTxt: { color: "#0D9488", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
    statusPill: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    statusTxt:  { fontSize: 10, fontWeight: "700" },
    priorityPill:{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
    priorityTxt: { fontSize: 10, fontWeight: "700" },
    row2: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, paddingTop: 8 },
    diseaseTag: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#F0FDFA", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, flexShrink: 1, marginRight: 8 },
    diseaseTxt: { color: "#0F766E", fontSize: 12, fontWeight: "600" },
    timeTxt:    { fontSize: 11, fontWeight: "600" },
    row3:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    lastVisit:  { fontSize: 11, fontWeight: "500" },
    qBtn:       { width: 30, height: 30, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    // Empty
    empty:      { alignItems: "center", paddingTop: 60 },
    emptyTitle: { fontSize: 17, fontWeight: "800", marginTop: 12 },
    emptySub:   { fontSize: 13, marginTop: 4 },
    clearBtn:   { marginTop: 18, backgroundColor: "#F0FDFA", borderRadius: 14, paddingHorizontal: 22, paddingVertical: 10 },

    // Floating Action Button
    fab: {
        position: "absolute",
        bottom: 24,
        right: 18,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: "#0D9488",
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 6,
        zIndex: 999,
    },
    fabText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "700",
        letterSpacing: -0.2,
    },

    // Sort modal
    sortOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    sortSheet:   { borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 36 },
    sheetHandle: { width: 44, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
    sheetTitle:  { fontSize: 18, fontWeight: "800", marginBottom: 16 },
    sortOption:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 50, borderBottomWidth: 1 },
    sortOptionTxt:{ fontSize: 15, fontWeight: "600" },
});

// ─── Input Form Styles ────────────────────────────────────────────────────────

const dsInput = StyleSheet.create({
    label: { fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 6 },
    input: { height: 46, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 14, fontWeight: "500" },
    errText: { fontSize: 11, color: "#EF4444", marginTop: 4, fontWeight: "600" },
    chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
    bgChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    saveBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 50,
        borderRadius: 16,
        backgroundColor: "#0D9488",
        marginTop: 10,
        marginBottom: 20,
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});

// ─── Detail Modal Styles ──────────────────────────────────────────────────────

const ds = StyleSheet.create({
    overlay:   { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
    sheet:     { height: "95%", borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden" },
    handleRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingTop: 12, paddingHorizontal: 20, paddingBottom: 6, position: "relative" },
    handle:    { width: 44, height: 5, borderRadius: 3 },
    closeBtn:  { position: "absolute", right: 20, width: 30, height: 30, borderRadius: 15, justifyContent: "center", alignItems: "center" },
    // Hero
    heroCard:  { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 10, borderRadius: 20, borderWidth: 1, padding: 14, gap: 12 },
    bigAvatar: { width: 52, height: 52, borderRadius: 26, justifyContent: "center", alignItems: "center" },
    bigAvatarText:{ fontSize: 18, fontWeight: "800" },
    heroName:  { fontSize: 16, fontWeight: "800", letterSpacing: -0.2 },
    heroMeta:  { fontSize: 11, fontWeight: "500", marginTop: 2 },
    heroBadges:{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 6 },
    sBadge:    { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
    sBadgeTxt: { fontSize: 10, fontWeight: "700" },
    scoreRing: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, justifyContent: "center", alignItems: "center" },
    scoreNum:  { fontSize: 16, fontWeight: "800" },
    scoreLabel:{ fontSize: 9, fontWeight: "600" },
    // Quick actions
    qaRow:     { flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 16, paddingBottom: 10 },
    qaItem:    { alignItems: "center", gap: 4 },
    qaIcon:    { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    qaLabel:   { fontSize: 10, fontWeight: "600" },
    // Tabs
    tabBar:        { maxHeight: 46, flexGrow: 0, flexShrink: 0 },
    tabBarContent: { paddingHorizontal: 16, gap: 4 },
    tabItem:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 9, gap: 5, borderRadius: 10 },
    tabTxt:        { fontSize: 12, fontWeight: "600" },
    tabContent:    { padding: 16, paddingBottom: 40 },
    // Cards
    card:      { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 12 },
    infoRow:   { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
    infoIco:   { width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    allergyChip:{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FEF2F2", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    // Vitals
    vitalsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    vitalCard:  { width: "47%", borderRadius: 14, padding: 12 },
    vitalVal:   { fontSize: 22, fontWeight: "800", marginTop: 6 },
    vitalUnit:  { fontSize: 11, fontWeight: "700" },
    vitalLabel: { fontSize: 11, fontWeight: "600", marginTop: 4 },
    scoreBar:   { height: 10, borderRadius: 5, overflow: "hidden" },
    scoreFill:  { height: "100%", borderRadius: 5 },
    metricBox:  { borderRadius: 14, padding: 12, alignItems: "center", gap: 2 },
    // Timeline
    tlIco:  { width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    tlLine: { width: 2, flex: 1, marginTop: 4, borderRadius: 1, minHeight: 20 },
    // Reports
    reportRow:  { flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, paddingBottom: 10, marginBottom: 10 },
    reportIco:  { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    dlBtn:      { width: 30, height: 30, borderRadius: 8, backgroundColor: "#F0FDFA", justifyContent: "center", alignItems: "center" },
    uploadBtn:  { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F0FDFA", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    // AI
    riskBox:    { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 14 },
    suggIco:    { width: 30, height: 30, borderRadius: 9, justifyContent: "center", alignItems: "center" },
});
