import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Medicine {
    id: string;
    name: string;
    dosage: string;
    purpose: string;
    schedule: string;
    relation: string;
    remaining: number;
    total: number;
    refillStatus: 'none' | 'requested' | 'approved';
    type?: 'Pill' | 'Syrup' | 'Injection' | 'Inhaler' | 'Drops'; // Optional to keep backward compatibility just in case
    icon?: string;
    color?: string;
    withFood?: boolean;
}

interface MedicinesContextType {
    medicines: Medicine[];
    isLoading: boolean;
    addMedicine: (medicine: Medicine) => Promise<void>;
    updateMedicine: (id: string, updates: Partial<Medicine>) => Promise<void>;
    removeMedicine: (id: string) => Promise<void>;
}

const MedicinesContext = createContext<MedicinesContextType | undefined>(undefined);

const getStorageKey = (userEmail: string) => `@medicines_${userEmail.toLowerCase()}`;

interface MedicinesProviderProps {
    children: React.ReactNode;
    userEmail: string | undefined;
}

export const MedicinesProvider: React.FC<MedicinesProviderProps> = ({ children, userEmail }) => {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setMedicines([]); 

            if (!userEmail) {
                setIsLoading(false);
                return;
            }

            try {
                const stored = await AsyncStorage.getItem(getStorageKey(userEmail));
                if (stored) {
                    setMedicines(JSON.parse(stored));
                }
            } catch (e) {
                console.error('Failed to load medicines', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [userEmail]);

    const addMedicine = async (medicine: Medicine) => {
        if (!userEmail) return;
        try {
            const updated = [...medicines, medicine];
            setMedicines(updated);
            await AsyncStorage.setItem(getStorageKey(userEmail), JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to save medicine', e);
        }
    };

    const updateMedicine = async (id: string, updates: Partial<Medicine>) => {
        if (!userEmail) return;
        try {
            const updated = medicines.map(m => m.id === id ? { ...m, ...updates } : m);
            setMedicines(updated);
            await AsyncStorage.setItem(getStorageKey(userEmail), JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to update medicine', e);
        }
    };

    const removeMedicine = async (id: string) => {
        if (!userEmail) return;
        try {
            const updated = medicines.filter(m => m.id !== id);
            setMedicines(updated);
            await AsyncStorage.setItem(getStorageKey(userEmail), JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to delete medicine', e);
        }
    };

    return (
        <MedicinesContext.Provider value={{ medicines, isLoading, addMedicine, updateMedicine, removeMedicine }}>
            {children}
        </MedicinesContext.Provider>
    );
};

export const useMedicines = () => {
    const context = useContext(MedicinesContext);
    if (context === undefined) {
        throw new Error('useMedicines must be used within a MedicinesProvider');
    }
    return context;
};
