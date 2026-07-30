import React from 'react';
import { Slot } from 'expo-router';
import { DoctorAuthProvider } from '@/context/DoctorAuthContext';

export default function Layout() {
  return (
    <DoctorAuthProvider>
      <Slot />
    </DoctorAuthProvider>
  );
}
