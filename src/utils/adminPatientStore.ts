import AsyncStorage from "@react-native-async-storage/async-storage";

export type PatientStatus = "Active" | "Admitted" | "Discharged" | "Critical" | "New";

export interface Patient {
    id: string;
    name: string;
    patientId: string;
    age: number;
    gender: "Male" | "Female" | "Other";
    bloodGroup: string;
    phone: string;
    email?: string;
    address?: string;
    condition: string;
    assignedDoctor: string;
    status: PatientStatus;
    lastVisit: string;
    nextAppointment: string;
    initials: string;
    ward: string;
    avatarColor: string;
    medicalHistory: string[];
    recentReports: { title: string; date: string; result: string }[];
    emergencyContact?: string;
    notes?: string;
}

const STORAGE_KEY = "@admin_patients_registry_v1";

const INITIAL_PATIENTS: Patient[] = [
    {
        id: "1", name: "Aarav Sharma", patientId: "PT-10234", age: 34, gender: "Male",
        bloodGroup: "O+", phone: "+91 98765 43210", email: "aarav@gmail.com", address: "12 Bandra West, Mumbai",
        condition: "Hypertension", assignedDoctor: "Dr. Sarah Jenkins", emergencyContact: "+91 98765 00000",
        status: "Active", lastVisit: "Today", nextAppointment: "Aug 5, 2026",
        initials: "AS", ward: "OPD", avatarColor: "#2563EB",
        medicalHistory: ["Hypertension (2019)", "Mild Asthma (2017)"],
        recentReports: [
            { title: "Blood Pressure Report", date: "Jul 25, 2026", result: "140/90 mmHg" },
            { title: "ECG", date: "Jul 10, 2026", result: "Normal Sinus Rhythm" },
        ],
    },
    {
        id: "2", name: "Priya Patel", patientId: "PT-10456", age: 28, gender: "Female",
        bloodGroup: "A+", phone: "+91 87654 32109", email: "priya@gmail.com", address: "45 MG Road, Bengaluru",
        condition: "Cardiac Arrhythmia", assignedDoctor: "Dr. Sarah Jenkins", emergencyContact: "+91 87654 00000",
        status: "Critical", lastVisit: "Today", nextAppointment: "Immediate",
        initials: "PP", ward: "ICU", avatarColor: "#DC2626",
        medicalHistory: ["Cardiac Arrhythmia (2024)", "Anxiety Disorder (2022)"],
        recentReports: [
            { title: "Holter Monitor", date: "Jul 27, 2026", result: "Irregular rhythm detected" },
            { title: "Echocardiogram", date: "Jul 20, 2026", result: "EF 45% — Moderate" },
        ],
    },
    {
        id: "3", name: "Rajesh Verma", patientId: "PT-10789", age: 52, gender: "Male",
        bloodGroup: "B+", phone: "+91 76543 21098", email: "rajesh@gmail.com", address: "88 Park Street, Kolkata",
        condition: "Diabetes Type-2", assignedDoctor: "Dr. Vikram Singh", emergencyContact: "+91 76543 00000",
        status: "Active", lastVisit: "1 week ago", nextAppointment: "Aug 12, 2026",
        initials: "RV", ward: "OPD", avatarColor: "#1D4ED8",
        medicalHistory: ["Diabetes Type-2 (2020)", "Obesity (2019)"],
        recentReports: [
            { title: "HbA1c", date: "Jul 15, 2026", result: "7.8% — Borderline" },
            { title: "Fasting Blood Sugar", date: "Jul 15, 2026", result: "148 mg/dL" },
        ],
    },
    {
        id: "4", name: "Ananya Sen", patientId: "PT-10321", age: 24, gender: "Female",
        bloodGroup: "AB+", phone: "+91 65432 10987", email: "ananya@gmail.com", address: "23 Salt Lake, Kolkata",
        condition: "General Checkup", assignedDoctor: "Dr. Vikram Singh", emergencyContact: "+91 65432 00000",
        status: "New", lastVisit: "First Visit", nextAppointment: "Aug 2, 2026",
        initials: "AS", ward: "OPD", avatarColor: "#475569",
        medicalHistory: ["No significant history"],
        recentReports: [
            { title: "CBC (Complete Blood Count)", date: "Jul 28, 2026", result: "All values normal" },
        ],
    },
    {
        id: "5", name: "Vikram Malhotra", patientId: "PT-10654", age: 61, gender: "Male",
        bloodGroup: "O-", phone: "+91 54321 09876", email: "vikram.m@gmail.com", address: "14 Connaught Place, New Delhi",
        condition: "Post-op Recovery", assignedDoctor: "Dr. Rohit Sharma", emergencyContact: "+91 54321 00000",
        status: "Admitted", lastVisit: "Yesterday", nextAppointment: "Aug 8, 2026",
        initials: "VM", ward: "Ward B", avatarColor: "#1E40AF",
        medicalHistory: ["Appendectomy (Jul 2026)", "High Cholesterol (2021)"],
        recentReports: [
            { title: "Post-op Assessment", date: "Jul 26, 2026", result: "Stable — Monitoring" },
            { title: "WBC Count", date: "Jul 26, 2026", result: "9,200 /μL — Slightly elevated" },
        ],
    },
    {
        id: "6", name: "Meera Nair", patientId: "PT-10987", age: 43, gender: "Female",
        bloodGroup: "A-", phone: "+91 43210 98765", email: "meera.nair@gmail.com", address: "9 Indiranagar, Bengaluru",
        condition: "Chronic Migraine", assignedDoctor: "Dr. Meera Nair", emergencyContact: "+91 43210 00000",
        status: "Active", lastVisit: "2 weeks ago", nextAppointment: "Sep 1, 2026",
        initials: "MN", ward: "OPD", avatarColor: "#3B82F6",
        medicalHistory: ["Chronic Migraine (2016)", "Cervical Spondylosis (2020)"],
        recentReports: [
            { title: "MRI Brain", date: "Jun 30, 2026", result: "No structural abnormality" },
        ],
    },
    {
        id: "7", name: "Karan Singh", patientId: "PT-11002", age: 38, gender: "Male",
        bloodGroup: "B-", phone: "+91 32109 87654", email: "karan@gmail.com", address: "77 Jubilee Hills, Hyderabad",
        condition: "Fracture — L. Forearm", assignedDoctor: "Dr. Rohit Sharma", emergencyContact: "+91 32109 00000",
        status: "Admitted", lastVisit: "3 days ago", nextAppointment: "Aug 10, 2026",
        initials: "KS", ward: "Ortho", avatarColor: "#64748B",
        medicalHistory: ["Fracture L. Forearm (Jul 2026)", "Sports Injury Knee (2023)"],
        recentReports: [
            { title: "X-Ray L. Forearm", date: "Jul 25, 2026", result: "Radius fracture — casting done" },
        ],
    },
    {
        id: "8", name: "Sunita Joshi", patientId: "PT-11034", age: 55, gender: "Female",
        bloodGroup: "O+", phone: "+91 21098 76543", email: "sunita@gmail.com", address: "55 Sector 17, Chandigarh",
        condition: "Kidney Stone", assignedDoctor: "Dr. Arjun Mehta", emergencyContact: "+91 21098 00000",
        status: "Discharged", lastVisit: "1 month ago", nextAppointment: "Sep 15, 2026",
        initials: "SJ", ward: "Urology", avatarColor: "#94A3B8",
        medicalHistory: ["Kidney Stone — Right (2026)", "UTI (2024)"],
        recentReports: [
            { title: "Ultrasound Abdomen", date: "Jun 28, 2026", result: "Stone passed — Clear" },
            { title: "Urine Routine", date: "Jun 28, 2026", result: "Normal" },
        ],
    },
    {
        id: "9", name: "Divya Kapoor", patientId: "PT-11120", age: 31, gender: "Female",
        bloodGroup: "AB-", phone: "+91 90123 45678", email: "divya@gmail.com", address: "19 Koregaon Park, Pune",
        condition: "Pregnancy Follow-up", assignedDoctor: "Dr. Priya Kapoor", emergencyContact: "+91 90123 00000",
        status: "New", lastVisit: "First Visit", nextAppointment: "Aug 3, 2026",
        initials: "DK", ward: "OPD", avatarColor: "#2563EB",
        medicalHistory: ["No significant history"],
        recentReports: [
            { title: "Obstetric Ultrasound", date: "Jul 28, 2026", result: "28 weeks — Normal fetal growth" },
        ],
    },
];

let patientsStore: Patient[] = [];
let isInitialized = false;
type Listener = () => void;
const listeners: Set<Listener> = new Set();

const AVATAR_COLORS = ["#2563EB", "#0D9488", "#7C3AED", "#DC2626", "#B45309", "#1D4ED8", "#1E40AF"];

async function persistData() {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(patientsStore));
    } catch (e) {
        console.error("Failed to persist patients data:", e);
    }
}

async function loadData() {
    if (isInitialized) return;
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
            patientsStore = JSON.parse(stored);
        } else {
            patientsStore = INITIAL_PATIENTS;
            await persistData();
        }
    } catch (e) {
        console.error("Failed to load patients data:", e);
        patientsStore = INITIAL_PATIENTS;
    } finally {
        isInitialized = true;
        notifyListeners();
    }
}

function notifyListeners() {
    listeners.forEach((l) => l());
}

loadData();

export const adminPatientStore = {
    async init(): Promise<void> {
        await loadData();
    },

    getPatients(): Patient[] {
        if (!isInitialized) return INITIAL_PATIENTS;
        return patientsStore;
    },

    async addPatient(data: {
        name: string;
        age: number;
        gender: "Male" | "Female" | "Other";
        phone: string;
        email?: string;
        bloodGroup: string;
        address: string;
        ward: string;
        assignedDoctor: string;
        condition: string;
        emergencyContact: string;
        notes?: string;
    }): Promise<Patient> {
        await loadData();

        const nameParts = data.name.trim().split(/\s+/);
        const initials = nameParts.length >= 2
            ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
            : data.name.trim().substring(0, 2).toUpperCase();

        const patientId = `PT-${Math.floor(10000 + Math.random() * 90000)}`;
        const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

        const newPatient: Patient = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
            name: data.name.trim(),
            patientId,
            age: data.age,
            gender: data.gender,
            bloodGroup: data.bloodGroup || "O+",
            phone: data.phone.trim(),
            email: data.email?.trim() || `${data.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
            address: data.address.trim(),
            condition: data.condition.trim(),
            assignedDoctor: data.assignedDoctor || "Dr. Sarah Jenkins",
            status: "New",
            lastVisit: "Today",
            nextAppointment: "Scheduled",
            initials,
            ward: data.ward || "OPD",
            avatarColor,
            medicalHistory: data.notes?.trim() ? [data.notes.trim()] : ["No significant history recorded"],
            recentReports: [
                { title: "Initial Admission Assessment", date: "Today", result: "Registration completed — Pending baseline labs" },
            ],
            emergencyContact: data.emergencyContact.trim(),
            notes: data.notes?.trim(),
        };

        patientsStore = [newPatient, ...patientsStore];
        await persistData();
        notifyListeners();

        return newPatient;
    },

    async updateStatus(id: string, newStatus: PatientStatus): Promise<void> {
        await loadData();
        patientsStore = patientsStore.map(p => p.id === id ? { ...p, status: newStatus } : p);
        await persistData();
        notifyListeners();
    },

    async updatePatient(id: string, updatedData: Partial<Patient>): Promise<Patient | undefined> {
        await loadData();
        let updated: Patient | undefined;
        patientsStore = patientsStore.map(p => {
            if (p.id === id) {
                const nameStr = updatedData.name || p.name;
                const nameParts = nameStr.trim().split(/\s+/);
                const initials = nameParts.length >= 2
                    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
                    : nameStr.trim().substring(0, 2).toUpperCase();

                updated = { ...p, ...updatedData, initials };
                return updated;
            }
            return p;
        });
        await persistData();
        notifyListeners();
        return updated;
    },

    async removePatient(id: string): Promise<void> {
        await loadData();
        patientsStore = patientsStore.filter(p => p.id !== id);
        await persistData();
        notifyListeners();
    },

    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        listener();
        return () => listeners.delete(listener);
    },
};
