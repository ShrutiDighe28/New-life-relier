import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  purpose: string;
  schedule: string;
  relation: string;
  remaining: number;
  total: number;
  refillStatus: 'none' | 'requested' | 'approved';
}

interface MedicationsContextType {
  medications: Medication[];
  addMedication: (med: Omit<Medication, 'id'>) => Promise<void>;
  updateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  removeMedication: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const MedicationsContext = createContext<MedicationsContextType | undefined>(undefined);

export const MedicationsProvider = ({ children, userEmail }: { children: ReactNode; userEmail?: string }) => {
  const auth = useAuth();
  const user = userEmail ? { email: userEmail } as any : auth.user;
  const [medications, setMedications] = useState<Medication[]>([]);

  const storageKey = user?.email ? `@medications_${user.email.toLowerCase()}` : '@medications_unknown';

  const loadMedications = async () => {
    if (!user?.email) return;
    const stored = await AsyncStorage.getItem(storageKey);
    if (stored) setMedications(JSON.parse(stored));
    else setMedications([]);
  };

  useEffect(() => {
    loadMedications();
  }, [user?.email]);

  const persist = async (newMeds: Medication[]) => {
    await AsyncStorage.setItem(storageKey, JSON.stringify(newMeds));
    setMedications(newMeds);
  };

  const addMedication = async (med: Omit<Medication, 'id'>) => {
    const newMed: Medication = { ...med, id: Date.now().toString() };
    const newList = [...medications, newMed];
    await persist(newList);
  };

  const updateMedication = async (id: string, updates: Partial<Medication>) => {
    const newList = medications.map(m => (m.id === id ? { ...m, ...updates } : m));
    await persist(newList);
  };

  const removeMedication = async (id: string) => {
    const newList = medications.filter(m => m.id !== id);
    await persist(newList);
  };

  const refresh = async () => {
    await loadMedications();
  };

  return (
    <MedicationsContext.Provider value={{ medications, addMedication, updateMedication, removeMedication, refresh }}>
      {children}
    </MedicationsContext.Provider>
  );
};

export const useMedications = () => {
  const ctx = useContext(MedicationsContext);
  if (!ctx) throw new Error('useMedications must be used within MedicationsProvider');
  return ctx;
};
