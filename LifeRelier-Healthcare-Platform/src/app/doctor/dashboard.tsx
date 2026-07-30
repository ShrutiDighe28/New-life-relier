// src/app/doctor/dashboard.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useDoctorAuth } from '@/context/DoctorAuthContext';

export default function DoctorDashboard() {
  const router = useRouter();
  const { logout, doctor } = useDoctorAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/doctor/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, Doctor {doctor?.fullName ?? ''}!</Text>
      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'hsl(220, 30%, 12%)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 24,
  },
  button: {
    backgroundColor: 'hsl(210, 80%, 55%)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
