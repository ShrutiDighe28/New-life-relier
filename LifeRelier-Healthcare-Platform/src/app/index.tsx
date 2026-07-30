// src/app/index.tsx
import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useDoctorAuth } from '@/context/DoctorAuthContext';

export default function IndexScreen() {
  const router = useRouter();
  const { doctor, isLoading } = useDoctorAuth();

  useEffect(() => {
    if (!isLoading) {
      if (doctor) {
        router.replace('/doctor/dashboard');
      } else {
        router.replace('/doctor/login');
      }
    }
  }, [isLoading, doctor, router]);

  // Show a splash/loading while auth state resolves
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'hsl(220, 30%, 12%)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
