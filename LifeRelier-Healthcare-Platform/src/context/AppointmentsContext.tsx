import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Appointment {
    id: string;
    doctorName: string;
    specialty: string;
    tag?: string;
    tagColor?: string;
    tagBg?: string;
    specialtyIcon: string;
    specialtyColor: string;
    date: string;
    clinic: string;
    insurance: string;
    avatar?: any;
    hasVideo?: boolean;
    status: 'upcoming' | 'completed' | 'cancelled';
}

interface AppointmentsContextType {
    appointments: Appointment[];
    upcomingAppointments: Appointment[];
    historyItems: Appointment[];
    aiRemindersOn: boolean;
    isLoading: boolean;
    addAppointment: (app: Omit<Appointment, 'id' | 'status'>) => Promise<void>;
    rescheduleAppointment: (id: string, newDate: string, newTime: string) => Promise<void>;
    cancelAppointment: (id: string) => Promise<void>;
    toggleAiReminders: () => Promise<void>;
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

/** Returns a user-scoped AsyncStorage key so each account has isolated data. */
const getStorageKey = (userEmail: string) => `@appointments_${userEmail.toLowerCase()}`;
const getRemindersKey = (userEmail: string) => `@ai_reminders_${userEmail.toLowerCase()}`;

interface AppointmentsProviderProps {
    children: React.ReactNode;
    /** Email of the currently logged-in user. Pass empty string / undefined when logged out. */
    userEmail: string | undefined;
}

export const AppointmentsProvider: React.FC<AppointmentsProviderProps> = ({ children, userEmail }) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [aiRemindersOn, setAiRemindersOn] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    // Reload data whenever the logged-in user changes
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            // Clear previous user's state immediately
            setAppointments([]);
            setAiRemindersOn(true);

            if (!userEmail) {
                setIsLoading(false);
                return;
            }

            try {
                const storedApps = await AsyncStorage.getItem(getStorageKey(userEmail));
                // New users start with an empty list — no pre-seeded mock data
                setAppointments(storedApps ? JSON.parse(storedApps) : []);

                const storedReminders = await AsyncStorage.getItem(getRemindersKey(userEmail));
                if (storedReminders !== null) {
                    setAiRemindersOn(JSON.parse(storedReminders));
                }
            } catch (e) {
                console.error('Failed to load appointments data.', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [userEmail]);

    const saveAppointments = async (newApps: Appointment[]) => {
        if (!userEmail) return;
        try {
            setAppointments(newApps);
            await AsyncStorage.setItem(getStorageKey(userEmail), JSON.stringify(newApps));
        } catch (e) {
            console.error('Failed to save appointments.', e);
        }
    };

    const addAppointment = async (app: Omit<Appointment, 'id' | 'status'>) => {
        const newApp: Appointment = {
            ...app,
            id: Date.now().toString(),
            status: 'upcoming'
        };
        const updated = [...appointments, newApp];
        await saveAppointments(updated);
    };

    const rescheduleAppointment = async (id: string, newDate: string, newTime: string) => {
        const updated = appointments.map(app => {
            if (app.id === id) {
                return { ...app, date: `${newDate} • ${newTime}` };
            }
            return app;
        });
        await saveAppointments(updated);
    };

    const cancelAppointment = async (id: string) => {
        const updated = appointments.map(app => {
            if (app.id === id) {
                return { ...app, status: 'cancelled' as const };
            }
            return app;
        });
        await saveAppointments(updated);
    };

    const toggleAiReminders = async () => {
        if (!userEmail) return;
        const newVal = !aiRemindersOn;
        setAiRemindersOn(newVal);
        await AsyncStorage.setItem(getRemindersKey(userEmail), JSON.stringify(newVal));
    };

    const upcomingAppointments = appointments.filter(a => a.status === 'upcoming');
    const historyItems = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

    return (
        <AppointmentsContext.Provider value={{
            appointments,
            upcomingAppointments,
            historyItems,
            aiRemindersOn,
            isLoading,
            addAppointment,
            rescheduleAppointment,
            cancelAppointment,
            toggleAiReminders
        }}>
            {children}
        </AppointmentsContext.Provider>
    );
};

export const useAppointments = () => {
    const context = useContext(AppointmentsContext);
    if (context === undefined) {
        throw new Error('useAppointments must be used within an AppointmentsProvider');
    }
    return context;
};

