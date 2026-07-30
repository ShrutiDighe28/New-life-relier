import React, { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { UploadCloud, Camera, Image as ImageIcon } from 'lucide-react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import { SHADOW_STYLES } from '../constants/styles';
import { STRINGS } from '../constants/strings';
import { ICON_SIZES } from '../constants/icons';
import { MODULE_SPACING } from '../constants/spacing';

interface UploadCardProps {
  onCapture?: () => void;
  onGallery?: () => void;
  formatsText?: string;
}

const UploadCard = memo(({ onCapture, onGallery, formatsText }: UploadCardProps) => {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }, SHADOW_STYLES.medium]}>
      <Pressable 
        style={({ pressed }) => [
          styles.dropZone, 
          { borderColor: theme.backgroundSelected },
          pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
        ]}
        onPress={onGallery}
        accessibilityRole="button"
        accessibilityLabel={STRINGS.upload.title}
        accessibilityHint={STRINGS.upload.accessibilityHint}
      >
        <View style={[styles.iconWrapper, { backgroundColor: theme.backgroundSelected }]}>
          <UploadCloud size={ICON_SIZES.xlarge} color={theme.text} />
        </View>
        <ThemedText type="default" style={styles.title}>
          {STRINGS.upload.title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.formats}>
          {formatsText || STRINGS.upload.formats}
        </ThemedText>
      </Pressable>

      <View style={styles.buttonContainer}>
        <PrimaryButton 
          title={STRINGS.upload.captureBtn} 
          icon={Camera} 
          onPress={onCapture} 
        />
        <SecondaryButton 
          title={STRINGS.upload.galleryBtn} 
          icon={ImageIcon} 
          onPress={onGallery} 
        />
      </View>
    </View>
  );
});

UploadCard.displayName = 'UploadCard';

export default UploadCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  dropZone: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.five,
    borderRadius: Spacing.three,
    gap: Spacing.one,
    borderStyle: 'dashed',
    borderWidth: MODULE_SPACING.uploadBorderWidth,
  },
  iconWrapper: {
    width: MODULE_SPACING.uploadIconSize,
    height: MODULE_SPACING.uploadIconSize,
    borderRadius: MODULE_SPACING.uploadIconRadius,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
  },
  formats: {
    fontSize: 12,
  },
  buttonContainer: {
    gap: Spacing.two,
  },
});
