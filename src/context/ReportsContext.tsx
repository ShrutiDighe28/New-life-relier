import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReportParameter {
    name: string;
    value: number | string;
    unit: string;
    refRange: string;
    status: "Normal" | "Borderline" | "High" | "Low";
    minNormal: number;
    maxNormal: number;
    currentValue: number;
}

export interface PatientInfo {
    name: string;
    id: string;
    age: number;
    gender: string;
    refDoctor: string;
    collectionDate: string;
    reportDate: string;
}

export interface ReportData {
    id: string;
    title: string;
    type: "Pathology" | "Radiology" | "Cardiology";
    date: string;
    day: string;
    month: string;
    year: string;
    labName: string;
    status: "Normal" | "Borderline" | "Review";
    icon: string; // MaterialCommunityIcons name
    image?: any;
    patientInfo: PatientInfo;
    parameters?: ReportParameter[];
    findings?: string;
    aiInsights: string[];
    doctorNotes: string;
}

interface ReportsContextType {
    reports: ReportData[];
    isLoading: boolean;
    addReport: (report: ReportData) => Promise<void>;
    deleteReport: (id: string) => Promise<void>;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

const getStorageKey = (userEmail: string) => `@reports_${userEmail.toLowerCase()}`;

interface ReportsProviderProps {
    children: React.ReactNode;
    userEmail: string | undefined;
}

export const ReportsProvider: React.FC<ReportsProviderProps> = ({ children, userEmail }) => {
    const [reports, setReports] = useState<ReportData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setReports([]); // Clear when user changes

            if (!userEmail) {
                setIsLoading(false);
                return;
            }

            try {
                const stored = await AsyncStorage.getItem(getStorageKey(userEmail));
                if (stored) {
                    setReports(JSON.parse(stored));
                }
            } catch (e) {
                console.error('Failed to load reports', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [userEmail]);

    const addReport = async (report: ReportData) => {
        if (!userEmail) return;
        try {
            const updated = [report, ...reports];
            setReports(updated);
            await AsyncStorage.setItem(getStorageKey(userEmail), JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to save report', e);
        }
    };

    const deleteReport = async (id: string) => {
        if (!userEmail) return;
        try {
            const updated = reports.filter(r => r.id !== id);
            setReports(updated);
            await AsyncStorage.setItem(getStorageKey(userEmail), JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to delete report', e);
        }
    };

    return (
        <ReportsContext.Provider value={{ reports, isLoading, addReport, deleteReport }}>
            {children}
        </ReportsContext.Provider>
    );
};

export const useReports = () => {
    const context = useContext(ReportsContext);
    if (context === undefined) {
        throw new Error('useReports must be used within a ReportsProvider');
    }
    return context;
};
