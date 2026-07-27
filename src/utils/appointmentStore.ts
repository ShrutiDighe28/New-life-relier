import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Appointment {
    id: string;
    time: string;
    patient: string;
    phone?: string;
    initials: string;
    type: string;
    typeColor: string;
    status: string;
    statusColor: string;
    notes?: string;
    date: string;
}

const STORAGE_KEY = "@doctor_schedule_appointments_v1";

const INITIAL_SCHEDULE_DATA: Record<string, Appointment[]> = {
    "2026-07-24": [
        { id: "1", date: "2026-07-24", time: "09:30 AM", patient: "Rahul Gupta", phone: "+91 98765 43210", initials: "RG", type: "New", typeColor: "#2563EB", status: "Confirmed", statusColor: "#10B981" },
        { id: "2", date: "2026-07-24", time: "10:30 AM", patient: "Aarav Sharma", phone: "+91 98765 43211", initials: "AS", type: "New", typeColor: "#2563EB", status: "Confirmed", statusColor: "#10B981" },
        { id: "3", date: "2026-07-24", time: "11:45 AM", patient: "Priya Patel", phone: "+91 98765 43212", initials: "PP", type: "Follow-up", typeColor: "#0D9488", status: "Pending", statusColor: "#F59E0B" },
        { id: "4", date: "2026-07-24", time: "02:00 PM", patient: "Vikram Malhotra", phone: "+91 98765 43213", initials: "VM", type: "Emergency", typeColor: "#EF4444", status: "Confirmed", statusColor: "#10B981" },
        { id: "5", date: "2026-07-24", time: "04:30 PM", patient: "Sneha Reddy", phone: "+91 98765 43214", initials: "SR", type: "Follow-up", typeColor: "#0D9488", status: "Cancelled", statusColor: "#94A3B8" },
    ],
    "2026-07-25": [
        { id: "6", date: "2026-07-25", time: "10:00 AM", patient: "Meera Nair", phone: "+91 98765 43215", initials: "MN", type: "Follow-up", typeColor: "#0D9488", status: "Confirmed", statusColor: "#10B981" },
        { id: "7", date: "2026-07-25", time: "01:30 PM", patient: "Karan Johar", phone: "+91 98765 43216", initials: "KJ", type: "New", typeColor: "#2563EB", status: "Confirmed", statusColor: "#10B981" },
    ],
};

let scheduleDataStore: Record<string, Appointment[]> = { ...INITIAL_SCHEDULE_DATA };
let isInitialized = false;
type Listener = () => void;
const listeners: Set<Listener> = new Set();

function parseTimeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3] ? match[3].toUpperCase() : null;

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
}

async function persistData() {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(scheduleDataStore));
    } catch (e) {
        console.error("Failed to persist schedule data:", e);
    }
}

async function loadData() {
    if (isInitialized) return;
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
            scheduleDataStore = JSON.parse(stored);
        } else {
            await persistData();
        }
    } catch (e) {
        console.error("Failed to load schedule data:", e);
    } finally {
        isInitialized = true;
        notifyListeners();
    }
}

function notifyListeners() {
    listeners.forEach((l) => l());
}

// Start auto loading
loadData();

export const appointmentStore = {
    async init(): Promise<void> {
        await loadData();
    },

    getAppointmentsForDate(dateStr: string): Appointment[] {
        return scheduleDataStore[dateStr] || [];
    },

    checkConflict(dateStr: string, timeStr: string): Appointment | null {
        const list = scheduleDataStore[dateStr] || [];
        const targetMins = parseTimeToMinutes(timeStr);
        return list.find((item) => parseTimeToMinutes(item.time) === targetMins) || null;
    },

    async addAppointment(newAppt: {
        patientName: string;
        phone: string;
        date: string;
        time: string;
        type: string;
        status: string;
        notes?: string;
    }): Promise<Appointment> {
        await loadData();

        const initials = newAppt.patientName.trim().split(/\s+/).length >= 2
            ? (newAppt.patientName.trim().split(/\s+/)[0][0] + newAppt.patientName.trim().split(/\s+/).slice(-1)[0][0]).toUpperCase()
            : newAppt.patientName.substring(0, 2).toUpperCase();

        const typeColor = newAppt.type === "Emergency" ? "#EF4444" : newAppt.type === "Follow-up" ? "#0D9488" : "#2563EB";
        const statusColor = newAppt.status === "Confirmed" ? "#10B981" : "#F59E0B";

        const apptRecord: Appointment = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
            date: newAppt.date,
            time: newAppt.time,
            patient: newAppt.patientName,
            phone: newAppt.phone,
            initials,
            type: newAppt.type,
            typeColor,
            status: newAppt.status,
            statusColor,
            notes: newAppt.notes,
        };

        const existing = scheduleDataStore[newAppt.date] || [];
        const updatedList = [...existing, apptRecord];

        // Sort chronologically by time
        updatedList.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));

        scheduleDataStore[newAppt.date] = updatedList;

        await persistData();
        notifyListeners();

        return apptRecord;
    },

    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        // Call immediately to pass latest state
        listener();
        return () => listeners.delete(listener);
    },
};
