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

const todayStr = new Date().toISOString().split("T")[0];

const INITIAL_SCHEDULE_DATA: Record<string, Appointment[]> = {
    [todayStr]: [
        { id: "101", date: todayStr, time: "09:00 AM", patient: "Rahul Gupta", phone: "+91 98765 43210", initials: "RG", type: "New", typeColor: "#2563EB", status: "Confirmed", statusColor: "#10B981", notes: "First consultation regarding persistent hypertension." },
        { id: "102", date: todayStr, time: "10:30 AM", patient: "Aarav Sharma", phone: "+91 98765 43211", initials: "AS", type: "Follow-up", typeColor: "#0D9488", status: "Confirmed", statusColor: "#10B981", notes: "Review blood report parameters and ECG." },
        { id: "103", date: todayStr, time: "11:45 AM", patient: "Priya Patel", phone: "+91 98765 43212", initials: "PP", type: "Follow-up", typeColor: "#0D9488", status: "Pending", statusColor: "#F59E0B", notes: "Thyroid dosage adjustment discussion." },
        { id: "104", date: todayStr, time: "02:15 PM", patient: "Vikram Malhotra", phone: "+91 98765 43213", initials: "VM", type: "Emergency", typeColor: "#EF4444", status: "Confirmed", statusColor: "#10B981", notes: "Acute chest discomfort, needs immediate evaluation." },
        { id: "105", date: todayStr, time: "04:30 PM", patient: "Sneha Reddy", phone: "+91 98765 43214", initials: "SR", type: "New", typeColor: "#2563EB", status: "Cancelled", statusColor: "#94A3B8", notes: "Rescheduled by patient." },
    ],
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
            const parsed = JSON.parse(stored);
            // Ensure today's date has sample data if empty
            if (!parsed[todayStr] || parsed[todayStr].length === 0) {
                parsed[todayStr] = INITIAL_SCHEDULE_DATA[todayStr];
            }
            scheduleDataStore = parsed;
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
        if (!scheduleDataStore[dateStr] && dateStr === todayStr) {
            scheduleDataStore[dateStr] = INITIAL_SCHEDULE_DATA[todayStr] || [];
        }
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
        const statusColor = newAppt.status === "Confirmed" ? "#10B981" : newAppt.status === "Cancelled" ? "#94A3B8" : "#F59E0B";

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

    async deleteAppointment(id: string, dateStr: string): Promise<void> {
        await loadData();
        if (scheduleDataStore[dateStr]) {
            scheduleDataStore[dateStr] = scheduleDataStore[dateStr].filter((a) => a.id !== id);
            await persistData();
            notifyListeners();
        }
    },

    async updateStatus(id: string, dateStr: string, newStatus: string): Promise<void> {
        await loadData();
        if (scheduleDataStore[dateStr]) {
            const statusColor = newStatus === "Confirmed" ? "#10B981" : newStatus === "Cancelled" ? "#94A3B8" : "#F59E0B";
            scheduleDataStore[dateStr] = scheduleDataStore[dateStr].map((a) =>
                a.id === id ? { ...a, status: newStatus, statusColor } : a
            );
            await persistData();
            notifyListeners();
        }
    },

    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        // Call immediately to pass latest state
        listener();
        return () => listeners.delete(listener);
    },
};
