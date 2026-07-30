import React from 'react';
import { Slot } from 'expo-router';
import DoctorRouteGuard from '@/components/DoctorRouteGuard';

export default function DoctorLayout() {
  return (
    <DoctorRouteGuard>
      <Slot />
    </DoctorRouteGuard>
  );
}
