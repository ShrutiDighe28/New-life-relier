import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';

export interface Reminder {
  id: string;
  title: string;
  date: string; // ISO string
}

interface RemindersContextType {
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id'>) => Promise<void>;
  removeReminder: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

export const RemindersProvider = ({ children, userEmail }: { children: ReactNode; userEmail?: string }) => {
  const auth = useAuth();
  const user = userEmail ? { email: userEmail } as any : auth.user;
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const storageKey = user?.email ? `@reminders_${user.email.toLowerCase()}` : '@reminders_guest';

  const load = async () => {
    if (!user?.email) { setReminders([]); return; }
    const stored = await AsyncStorage.getItem(storageKey);
    if (stored) setReminders(JSON.parse(stored));
    else setReminders([]);
  };

  useEffect(() => {
    load();
  }, [user?.email]);

  const persist = async (list: Reminder[]) => {
    await AsyncStorage.setItem(storageKey, JSON.stringify(list));
    setReminders(list);
  };

  const addReminder = async (rem: Omit<Reminder, 'id'>) => {
    const newRem: Reminder = { ...rem, id: Date.now().toString() };
    const updated = [...reminders, newRem];
    await persist(updated);
  };

  const removeReminder = async (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    await persist(updated);
  };

  const refresh = async () => {
    await load();
  };

  return (
    <RemindersContext.Provider value={{ reminders, addReminder, removeReminder, refresh }}>
      {children}
    </RemindersContext.Provider>
  );
};

export const useReminders = () => {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error('useReminders must be used within RemindersProvider');
  return ctx;
};
