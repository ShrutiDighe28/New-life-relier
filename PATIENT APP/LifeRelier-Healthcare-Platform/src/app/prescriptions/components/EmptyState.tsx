import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { FileText } from 'lucide-react-native';
import { COLORS, SPACING, SHADOWS } from '@/constants/theme';

interface EmptyStateProps {
  onPressScan: () => void;
}

export default function EmptyState({ onPressScan }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <FileText size={48} color="#2563EB" />
      </View>
      <Text style={styles.title}>No Prescriptions Yet</Text>
      <Text style={styles.description}>
        Scan your first prescription to build your digital health record.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={onPressScan}
        accessibilityRole="button"
        accessibilityLabel="Scan your first prescription"
      >
        <Text style={styles.buttonText}>Scan Prescription</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    ...SHADOWS.soft,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primaryText,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: COLORS.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 260,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
