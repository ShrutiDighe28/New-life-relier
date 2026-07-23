import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HealthMetrics {
    heartRate: string;
    steps: string;
    sleep: string;
    weight: string;
    height: string;
}

interface HealthContextType {
    metrics: HealthMetrics;
    isLoading: boolean;
    updateMetrics: (newMetrics: Partial<HealthMetrics>) => Promise<void>;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

const getStorageKey = (userEmail: string) => `@health_metrics_${userEmail.toLowerCase()}`;

const DEFAULT_METRICS: HealthMetrics = {
    heartRate: "-- bpm",
    steps: "0",
    sleep: "--h --m",
    weight: "-- kg",
    height: "-- cm"
};

interface HealthProviderProps {
    children: React.ReactNode;
    userEmail: string | undefined;
}

export const HealthProvider: React.FC<HealthProviderProps> = ({ children, userEmail }) => {
    const [metrics, setMetrics] = useState<HealthMetrics>(DEFAULT_METRICS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setMetrics(DEFAULT_METRICS); // Clear

            if (!userEmail) {
                setIsLoading(false);
                return;
            }

            try {
                const stored = await AsyncStorage.getItem(getStorageKey(userEmail));
                if (stored) {
                    setMetrics(JSON.parse(stored));
                }
            } catch (e) {
                console.error('Failed to load health metrics', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [userEmail]);

    const updateMetrics = async (newMetrics: Partial<HealthMetrics>) => {
        if (!userEmail) return;
        try {
            const updated = { ...metrics, ...newMetrics };
            setMetrics(updated);
            await AsyncStorage.setItem(getStorageKey(userEmail), JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to save health metrics', e);
        }
    };

    return (
        <HealthContext.Provider value={{ metrics, isLoading, updateMetrics }}>
            {children}
        </HealthContext.Provider>
    );
};

export const useHealth = () => {
    const context = useContext(HealthContext);
    if (context === undefined) {
        throw new Error('useHealth must be used within a HealthProvider');
    }
    return context;
};
