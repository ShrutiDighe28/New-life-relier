import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppointmentsProvider } from '@/context/AppointmentsContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import React from 'react';

/**
 * AuthBridge sits inside AuthProvider so it can read the current user
 * and pass the email down to data providers, ensuring each account's
 * data is fully isolated in its own AsyncStorage namespace.
 */
function AuthBridge({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userEmail = user?.email;
  return (
    <NotificationsProvider userEmail={userEmail}>
      <AppointmentsProvider userEmail={userEmail}>
        {children}
      </AppointmentsProvider>
    </NotificationsProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AuthBridge>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </AuthBridge>
      </AuthProvider>
    </SafeAreaProvider>
  );
}