import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScanLine, FileImage, FileText } from 'lucide-react-native';
import { COLORS, SPACING, SIZES, SHADOWS } from '@/constants/theme';

interface UploadCardProps {
  onPress?: () => void;
}

export default function UploadCard({ onPress }: UploadCardProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.8}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Upload Prescription Card"
        accessibilityHint="Double tap to capture a photo or upload an existing prescription"
      >
        <View style={styles.iconContainer}>
          <ScanLine size={48} color={COLORS.primaryBlue} style={styles.scanIcon} />
          <View style={styles.subIconContainer}>
            <FileImage size={18} color={COLORS.primaryBlue} />
            <FileText size={18} color={COLORS.primaryBlue} />
          </View>
        </View>

        <Text style={styles.title}>Align your prescription within the frame</Text>
        <Text style={styles.subtitle}>
          Capture a photo or upload an existing prescription for AI-powered analysis.
        </Text>
        
        <View style={styles.divider} />
        
        <View style={styles.footerRow}>
          <Text style={styles.supportedText}>JPG • PNG • PDF</Text>
          <Text style={styles.infoText}>Maximum file size: 10 MB</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    ...SHADOWS.soft,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    position: 'relative',
  },
  scanIcon: {
    position: 'absolute',
  },
  subIconContainer: {
    flexDirection: 'row',
    gap: 4,
    opacity: 0.8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryText,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.secondaryText,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: SPACING.md,
  },
  footerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  supportedText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryBlue,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.secondaryText,
  },
});
