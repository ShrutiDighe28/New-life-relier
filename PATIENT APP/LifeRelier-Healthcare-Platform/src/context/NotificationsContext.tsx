import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationCategory = 'Appointments' | 'Reminders' | 'Medications' | 'Reports' | 'SOS' | 'System';

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    category: NotificationCategory;
    date: string;
    isRead: boolean;
    route?: string;
}

interface NotificationsContextType {
    notifications: AppNotification[];
    unreadCount: number;
    addNotification: (notif: Omit<AppNotification, 'id' | 'isRead' | 'date'>) => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearNotification: (id: string) => Promise<void>;
    clearAll: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

/** Returns a user-scoped AsyncStorage key so each account has isolated notification data. */
const getNotifKey = (userEmail: string) => `@notifications_${userEmail.toLowerCase()}`;

interface NotificationsProviderProps {
    children: ReactNode;
    /** Email of the currently logged-in user. Pass empty string / undefined when logged out. */
    userEmail: string | undefined;
}

export const NotificationsProvider = ({ children, userEmail }: NotificationsProviderProps) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    // Reload notifications whenever the logged-in user changes
    useEffect(() => {
        const loadNotifications = async () => {
            // Clear previous user's notifications immediately
            setNotifications([]);
            if (!userEmail) return;
            try {
                const data = await AsyncStorage.getItem(getNotifKey(userEmail));
                setNotifications(data ? JSON.parse(data) : []);
            } catch (error) {
                console.error('Failed to load notifications:', error);
            }
        };
        loadNotifications();
    }, [userEmail]);

    const saveNotifications = async (newNotifications: AppNotification[]) => {
        if (!userEmail) return;
        try {
            setNotifications(newNotifications);
            await AsyncStorage.setItem(getNotifKey(userEmail), JSON.stringify(newNotifications));
        } catch (error) {
            console.error('Failed to save notifications:', error);
        }
    };

    const addNotification = async (notif: Omit<AppNotification, 'id' | 'isRead' | 'date'>) => {
        const newNotif: AppNotification = {
            ...notif,
            id: Math.random().toString(36).substring(2, 9),
            isRead: false,
            date: new Date().toISOString(),
        };
        const updated = [newNotif, ...notifications];
        await saveNotifications(updated);
    };

    const markAsRead = async (id: string) => {
        const updated = notifications.map((n) => 
            n.id === id ? { ...n, isRead: true } : n
        );
        await saveNotifications(updated);
    };

    const markAllAsRead = async () => {
        const updated = notifications.map((n) => ({ ...n, isRead: true }));
        await saveNotifications(updated);
    };

    const clearNotification = async (id: string) => {
        const updated = notifications.filter((n) => n.id !== id);
        await saveNotifications(updated);
    };

    const clearAll = async () => {
        await saveNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <NotificationsContext.Provider
            value={{
                notifications,
                unreadCount,
                addNotification,
                markAsRead,
                markAllAsRead,
                clearNotification,
                clearAll,
            }}
        >
            {children}
        </NotificationsContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationsContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    return context;
};

