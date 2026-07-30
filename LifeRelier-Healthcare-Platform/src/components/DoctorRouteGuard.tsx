import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useDoctorAuth } from '@/context/DoctorAuthContext';

export default function DoctorRouteGuard({ children }: { children: React.ReactNode }) {
  const { doctor, isLoading } = useDoctorAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !doctor) {
      router.replace('/doctor/login');
    }
  }, [doctor, isLoading, router]);

  if (isLoading || !doctor) {
    return null;
  }

  return <>{children}</>;
}
