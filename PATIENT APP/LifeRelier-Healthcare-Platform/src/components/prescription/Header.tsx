import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '@/constants/theme';

export default function Header() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
        accessibilityLabel="Go back"
      >
        <ArrowLeft size={24} color={COLORS.primaryText} />
      </TouchableOpacity>
      
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Prescription Scanner</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.notificationButton} 
        accessibilityLabel="Notifications"
      >
        <Bell size={24} color={COLORS.primaryText} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryText,
    textAlign: 'center',
  },
  notificationButton: {
    padding: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
    minWidth: 44,
  },
});
