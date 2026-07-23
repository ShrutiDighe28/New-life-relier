import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppointmentsProvider } from '@/context/AppointmentsContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import React from 'react';

import { ReportsProvider } from '@/context/ReportsContext';
import { HealthProvider } from '@/context/HealthContext';
import { MedicinesProvider } from '@/context/MedicinesContext';

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
        <ReportsProvider userEmail={userEmail}>
          <HealthProvider userEmail={userEmail}>
            <MedicinesProvider userEmail={userEmail}>
              {children}
            </MedicinesProvider>
          </HealthProvider>
        </ReportsProvider>
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