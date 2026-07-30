import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Camera, ImagePlus } from 'lucide-react-native';
import { COLORS, SPACING, SHADOWS } from '@/constants/theme';

interface ActionButtonsProps {
  onCapturePress?: () => void;
  onGalleryPress?: () => void;
}

export default function ActionButtons({ onCapturePress, onGalleryPress }: ActionButtonsProps) {
  return (
    <View style={styles.container}>
      {/* Primary Capture Button */}
      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.pressedState,
        ]}
        onPress={onCapturePress}
        accessibilityRole="button"
        accessibilityLabel="Capture prescription document using camera"
      >
        <Camera size={20} color="#FFFFFF" style={styles.icon} />
        <Text style={styles.primaryText}>Capture Prescription</Text>
      </Pressable>

      {/* Secondary Gallery Button */}
      <Pressable
        style={({ pressed }) => [
          styles.secondaryButton,
          pressed && styles.pressedState,
        ]}
        onPress={onGalleryPress}
        accessibilityRole="button"
        accessibilityLabel="Upload prescription document from photo gallery"
      >
        <ImagePlus size={20} color={COLORS.primaryBlue} style={styles.icon} />
        <Text style={styles.secondaryText}>Upload from Gallery</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    marginTop: 24, // Spacing from Upload Card
    marginBottom: 24, // Spacing below buttons
    gap: 16, // Vertical spacing between buttons
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryBlue,
    height: 56,
    borderRadius: 16,
    ...SHADOWS.soft, // Subtle elevation shadow
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  pressedState: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  icon: {
    marginRight: SPACING.sm,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryText: {
    color: COLORS.primaryBlue,
    fontSize: 16,
    fontWeight: '700',
  },
});
