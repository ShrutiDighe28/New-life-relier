import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SaveAppointmentPayload {
    DrId?: number;
    FirstName?: string;
    LastName?: string;
    Mobile?: string;
    AppointmentDate?: string;
    Slot?: string;
    Address?: string;
    GenderId?: number;
    InitialId?: number;
    BirthDate?: string;
    BranchId?: number;
    CreatedBy?: string;

    // UI properties
    doctorName?: string;
    specialty?: string;
    tag?: string;
    tagColor?: string;
    tagBg?: string;
    specialtyIcon?: string;
    specialtyColor?: string;
    date?: string;
    clinic?: string;
    insurance?: string;
    avatar?: any;
    hasVideo?: boolean;
    symptoms?: string;
    consultationFee?: string;
}

/** Full payload passed to rescheduleAppointment â€” all fields that can change. */
export interface ReschedulePayload {
    // New API fields
    DrId?: number;
    FirstName?: string;
    LastName?: string;
    Mobile?: string;
    AppointmentDate: string;   // YYYY-MM-DD
    Slot: string;              // e.g. "10:30 AM"
    Address?: string;
    GenderId?: number;
    InitialId?: number;
    BirthDate?: string;
    BranchId?: number;
    UpdatedBy?: string;

    // New UI display fields â€” overwrite whatever was stored
    doctorName?: string;
    specialty?: string;
    specialtyIcon?: string;
    specialtyColor?: string;
    clinic?: string;
    insurance?: string;
    avatar?: any;
    hasVideo?: boolean;
    symptoms?: string;
    consultationFee?: string;
    /** Human-readable display string, e.g. "Jul 22, 2026 â€¢ 10:30 AM" */
    displayDate?: string;
}

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
    symptoms?: string;
    consultationFee?: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    appointmentId?: number;
    apiData?: any;
}

interface AppointmentsContextType {
    appointments: Appointment[];
    upcomingAppointments: Appointment[];
    historyItems: Appointment[];
    aiRemindersOn: boolean;
    isLoading: boolean;
    addAppointment: (app: SaveAppointmentPayload) => Promise<Appointment>;
    rescheduleAppointment: (id: string, payload: ReschedulePayload) => Promise<Appointment>;
    cancelAppointment: (id: string) => Promise<void>;
    deleteAppointment: (id: string) => Promise<void>;
    toggleAiReminders: () => Promise<void>;
    refreshAppointments: () => Promise<void>;
    getAppointmentById: (appointmentId: number | string) => Promise<Appointment | null>;
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

    const mapApiItemToAppointment = (item: any): Appointment => {
        const rawDate = item.AppointmentDate ? String(item.AppointmentDate).split('T')[0] : '';
        const slot = item.Slot || '20 Minutes';
        const displayDate = rawDate ? `${rawDate} • ${slot}` : slot;

        const isCancelled = item.IsActive === false || item.Status === 'Cancelled' || item.CancelledBy != null;
        const isCompleted = item.Status === 'Completed';

        let status: 'upcoming' | 'completed' | 'cancelled' = 'upcoming';
        let tag = 'Upcoming';
        let tagColor = '#2563EB';
        let tagBg = '#EFF6FF';

        if (isCancelled) {
            status = 'cancelled';
            tag = 'Cancelled';
            tagColor = '#EF4444';
            tagBg = '#FEF2F2';
        } else if (isCompleted) {
            status = 'completed';
            tag = 'Completed';
            tagColor = '#10B981';
            tagBg = '#ECFDF5';
        }

        const doctorName = item.DoctorName 
            ? (item.DoctorName.startsWith('Dr.') ? item.DoctorName : `Dr. ${item.DoctorName}`)
            : (item.DrId ? `Dr. Doctor (ID: ${item.DrId})` : 'Unknown Doctor');

        return {
            id: String(item.AppointmentId),
            appointmentId: item.AppointmentId,
            doctorName,
            specialty: 'General Physician',
            specialtyIcon: 'stethoscope',
            specialtyColor: '#2563EB',
            date: displayDate,
            clinic: item.Address || 'LifeRelier Clinic',
            insurance: 'Self-Pay',
            hasVideo: item.hasVideo ?? true,
            symptoms: item.symptoms || '',
            consultationFee: item.consultationFee || '',
            status,
            tag,
            tagColor,
            tagBg,
            apiData: item,
        };
    };

    const fetchApiAppointments = async (): Promise<Appointment[]> => {
        try {
            const resp = await fetch('https://dn8labapi.liferelier.in/api/DrAppointment/GetAllAppointment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ BranchId: 1 }),
            });

            if (resp.ok) {
                const resText = await resp.text();
                let resData: any = [];
                try { resData = JSON.parse(resText); } catch (_) {}

                if (Array.isArray(resData)) {
                    const apiApps = resData.map(mapApiItemToAppointment);
                    console.log(`GetAllAppointment fetched ${apiApps.length} appointments from API`);
                    return apiApps;
                }
            } else {
                console.warn('GetAllAppointment API returned status:', resp.status);
            }
        } catch (e) {
            console.error('GetAllAppointment API call error:', e);
        }
        return [];
    };

    const refreshAppointments = async () => {
        if (!userEmail) return;
        setIsLoading(true);
        try {
            const apiApps = await fetchApiAppointments();
            const storedAppsStr = await AsyncStorage.getItem(getStorageKey(userEmail));
            const storedApps: Appointment[] = storedAppsStr ? JSON.parse(storedAppsStr) : [];
            const storedMap = new Map<string, Appointment>();
            storedApps.forEach(a => storedMap.set(a.id, a));

            let finalApps: Appointment[] = [];
            if (apiApps.length > 0) {
                finalApps = apiApps.map(apiApp => {
                    const existing = storedMap.get(apiApp.id);
                    if (existing) {
                        return {
                            ...apiApp,
                            avatar: existing.avatar || apiApp.avatar,
                            specialty: existing.specialty !== 'General Physician' ? existing.specialty : apiApp.specialty,
                            specialtyIcon: existing.specialtyIcon || apiApp.specialtyIcon,
                            specialtyColor: existing.specialtyColor || apiApp.specialtyColor,
                            insurance: existing.insurance || apiApp.insurance,
                        };
                    }
                    return apiApp;
                });

                storedApps.forEach(stored => {
                    if (!stored.appointmentId && !finalApps.some(f => f.id === stored.id)) {
                        finalApps.push(stored);
                    }
                });
            } else {
                finalApps = storedApps;
            }

            setAppointments(finalApps);
            await AsyncStorage.setItem(getStorageKey(userEmail), JSON.stringify(finalApps));
        } catch (e) {
            console.error('Failed to refresh appointments', e);
        } finally {
            setIsLoading(false);
        }
    };

    const getAppointmentById = async (appointmentId: number | string): Promise<Appointment | null> => {
        const numericId = typeof appointmentId === 'number' ? appointmentId : parseInt(String(appointmentId), 10);
        if (isNaN(numericId)) {
            return appointments.find(a => a.id === String(appointmentId)) || null;
        }

        try {
            const resp = await fetch('https://dn8labapi.liferelier.in/api/DrAppointment/GetAppointmentById', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    AppointmentId: numericId,
                    BranchId: 1,
                }),
            });

            if (resp.ok) {
                const resText = await resp.text();
                let resData: any = [];
                try { resData = JSON.parse(resText); } catch (_) {}

                const item = Array.isArray(resData) ? resData[0] : resData;
                if (item && (item.AppointmentId || item.DrId)) {
                    const mapped = mapApiItemToAppointment(item);
                    console.log('GetAppointmentById fetched appointment details for ID:', numericId);

                    setAppointments(prev => {
                        const exists = prev.some(a => a.id === mapped.id);
                        const nextApps = exists
                            ? prev.map(a => a.id === mapped.id ? { ...a, ...mapped, avatar: a.avatar || mapped.avatar } : a)
                            : [...prev, mapped];
                        saveAppointments(nextApps);
                        return nextApps;
                    });
                    return mapped;
                }
            } else {
                console.warn('GetAppointmentById API returned status:', resp.status);
            }
        } catch (e) {
            console.error('GetAppointmentById API call error:', e);
        }

        return appointments.find(a => a.id === String(appointmentId)) || null;
    };

    // Reload data whenever the logged-in user changes
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setAppointments([]);
            setAiRemindersOn(true);

            if (!userEmail) {
                setIsLoading(false);
                return;
            }

            try {
                const storedReminders = await AsyncStorage.getItem(getRemindersKey(userEmail));
                if (storedReminders !== null) {
                    setAiRemindersOn(JSON.parse(storedReminders));
                }
                await refreshAppointments();
            } catch (e) {
                console.error('Failed to load appointments data.', e);
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

    const addAppointment = async (app: SaveAppointmentPayload): Promise<Appointment> => {
        // Prepare payload exactly matching API requirements
        const apiBody = {
            DrId: app.DrId || 20,
            FirstName: app.FirstName || '',
            LastName: app.LastName || '',
            Mobile: app.Mobile || '',
            AppointmentDate: app.AppointmentDate || new Date().toISOString().split('T')[0],
            Slot: app.Slot || '20 Minutes',
            Address: app.Address || '',
            GenderId: app.GenderId !== undefined ? app.GenderId : 1,
            InitialId: app.InitialId !== undefined ? app.InitialId : 1,
            BirthDate: app.BirthDate || new Date().toISOString().split('T')[0],
            BranchId: app.BranchId !== undefined ? app.BranchId : 1,
            CreatedBy: app.CreatedBy || 'User',
        };

        let appointmentId: number | undefined;

        try {
            const resp = await fetch('https://dn8labapi.liferelier.in/api/DrAppointment/SaveAppointment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiBody),
            });

            const resText = await resp.text();
            let resData: any = {};
            try {
                resData = JSON.parse(resText);
            } catch (_) {}

            if (resp.ok && resData && resData.AppointmentId) {
                appointmentId = resData.AppointmentId;
            }
        } catch (e) {
            console.error('SaveAppointment API call error:', e);
        }

        const newApp: Appointment = {
            id: appointmentId ? String(appointmentId) : Date.now().toString(),
            appointmentId,
            doctorName: app.doctorName || `Doctor (ID: ${apiBody.DrId})`,
            specialty: app.specialty || 'General Physician',
            tag: 'Upcoming',
            tagColor: '#2563EB',
            tagBg: '#EFF6FF',
            specialtyIcon: app.specialtyIcon || 'stethoscope',
            specialtyColor: app.specialtyColor || '#2563EB',
            date: app.date || `${apiBody.AppointmentDate} â€¢ ${apiBody.Slot}`,
            clinic: app.clinic || apiBody.Address || 'LifeRelier Clinic',
            insurance: app.insurance || 'Self-Pay',
            avatar: app.avatar,
            hasVideo: app.hasVideo !== undefined ? app.hasVideo : true,
            symptoms: app.symptoms || '',
            consultationFee: app.consultationFee || '',
            status: 'upcoming',
            apiData: { ...apiBody, symptoms: app.symptoms, consultationFee: app.consultationFee, hasVideo: app.hasVideo },
        };

        const updated = [...appointments, newApp];
        await saveAppointments(updated);
        return newApp;
    };

    const rescheduleAppointment = async (id: string, payload: ReschedulePayload): Promise<Appointment> => {
        const target = appointments.find(a => a.id === id);

        // Build UpdateAppointment API body using NEW values from payload (not stale apiData)
        const updateBody = {
            AppointmentId: target?.appointmentId,
            DrId: payload.DrId ?? target?.apiData?.DrId ?? 20,
            FirstName: payload.FirstName ?? target?.apiData?.FirstName ?? '',
            LastName: payload.LastName ?? target?.apiData?.LastName ?? '',
            Mobile: payload.Mobile ?? target?.apiData?.Mobile ?? '',
            AppointmentDate: payload.AppointmentDate,
            Slot: payload.Slot,
            Address: payload.Address ?? target?.apiData?.Address ?? '',
            GenderId: payload.GenderId ?? target?.apiData?.GenderId ?? 1,
            InitialId: payload.InitialId ?? target?.apiData?.InitialId ?? 1,
            BirthDate: payload.BirthDate ?? target?.apiData?.BirthDate ?? new Date().toISOString().split('T')[0],
            BranchId: payload.BranchId ?? target?.apiData?.BranchId ?? 1,
            UpdatedBy: payload.UpdatedBy ?? target?.apiData?.CreatedBy ?? 'User',
        };

        // Only call API if we have a server-side appointment ID
        if (target?.appointmentId) {
            try {
                const resp = await fetch('https://dn8labapi.liferelier.in/api/DrAppointment/UpdateAppointment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateBody),
                });
                const resText = await resp.text();
                let resData: any = {};
                try { resData = JSON.parse(resText); } catch (_) {}
                if (resp.ok && resData?.Message === 'UPDATE SUCCESS') {
                    console.log('UpdateAppointment API success for ID:', target.appointmentId);
                } else {
                    console.warn('UpdateAppointment API unexpected response:', resText);
                }
            } catch (e) {
                console.error('UpdateAppointment API call error:', e);
            }
        }

        // Build the display date string
        const displayDate = payload.displayDate || `${payload.AppointmentDate} â€¢ ${payload.Slot}`;

        // Construct the fully-updated appointment â€” every visible field replaced
        const updatedApp: Appointment = {
            id,
            appointmentId: target?.appointmentId,
            status: 'upcoming',
            doctorName: payload.doctorName ?? target?.doctorName ?? '',
            specialty: payload.specialty ?? target?.specialty ?? '',
            specialtyIcon: payload.specialtyIcon ?? target?.specialtyIcon ?? 'stethoscope',
            specialtyColor: payload.specialtyColor ?? target?.specialtyColor ?? '#2563EB',
            date: displayDate,
            clinic: payload.clinic ?? target?.clinic ?? '',
            insurance: payload.insurance ?? target?.insurance ?? '',
            avatar: payload.avatar ?? target?.avatar,
            hasVideo: payload.hasVideo ?? target?.hasVideo ?? true,
            symptoms: payload.symptoms ?? target?.symptoms ?? '',
            consultationFee: payload.consultationFee ?? target?.consultationFee ?? '',
            tag: 'Rescheduled',
            tagColor: '#7C3AED',
            tagBg: '#EDE9FE',
            // Persist new API data for future updates
            apiData: { ...updateBody, symptoms: payload.symptoms, consultationFee: payload.consultationFee, hasVideo: payload.hasVideo },
        };

        // Update state and AsyncStorage atomically
        const updatedList = appointments.map(app => app.id === id ? updatedApp : app);
        await saveAppointments(updatedList);

        return updatedApp;
    };

    const cancelAppointment = async (id: string) => {
        const target = appointments.find(a => a.id === id);

        if (target?.appointmentId) {
            const deleteBody = {
                AppointmentId: target.appointmentId,
                BranchId: target.apiData?.BranchId ?? 1,
            };

            try {
                const resp = await fetch('https://dn8labapi.liferelier.in/api/DrAppointment/DeleteAppointment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(deleteBody),
                });
                const resText = await resp.text();
                let resData: any = {};
                try { resData = JSON.parse(resText); } catch (_) {}
                if (resp.ok && resData?.Message === 'DELETE SUCCESS') {
                    console.log('DeleteAppointment API success for cancel ID:', target.appointmentId);
                } else {
                    console.warn('DeleteAppointment API unexpected response:', resText);
                }
            } catch (e) {
                console.error('DeleteAppointment API call error:', e);
            }
        }

        const updated = appointments.map(app => {
            if (app.id === id) {
                return { ...app, status: 'cancelled' as const };
            }
            return app;
        });
        await saveAppointments(updated);
    };

    const deleteAppointment = async (id: string) => {
        const target = appointments.find(a => a.id === id);

        if (target?.appointmentId) {
            const deleteBody = {
                AppointmentId: target.appointmentId,
                BranchId: target.apiData?.BranchId ?? 1,
            };

            try {
                const resp = await fetch('https://dn8labapi.liferelier.in/api/DrAppointment/DeleteAppointment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(deleteBody),
                });
                const resText = await resp.text();
                let resData: any = {};
                try { resData = JSON.parse(resText); } catch (_) {}
                if (resp.ok && resData?.Message === 'DELETE SUCCESS') {
                    console.log('DeleteAppointment API success for delete ID:', target.appointmentId);
                } else {
                    console.warn('DeleteAppointment API unexpected response:', resText);
                }
            } catch (e) {
                console.error('DeleteAppointment API call error:', e);
            }
        }

        const updated = appointments.filter(app => app.id !== id);
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
            deleteAppointment,
            toggleAiReminders,
            refreshAppointments,
            getAppointmentById
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
