import React, { memo } from 'react';
import { Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { LucideIcon } from 'lucide-react-native';
import { ICON_SIZES } from '../constants/icons';

interface PrimaryButtonProps {
  title: string;
  onPress?: () => void;
  icon?: LucideIcon;
  isLoading?: boolean;
}

const PrimaryButton = memo(({ title, onPress, icon: Icon, isLoading }: PrimaryButtonProps) => {
  const theme = useTheme();

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.button, 
        { backgroundColor: theme.text },
        pressed && styles.pressed
      ]} 
      onPress={onPress}
      disabled={isLoading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isLoading }}
    >
      {isLoading ? (
        <ActivityIndicator color={theme.background} />
      ) : (
        <>
          {Icon && <Icon size={ICON_SIZES.medium} color={theme.background} />}
          <ThemedText style={[styles.text, { color: theme.background }]}>{title}</ThemedText>
        </>
      )}
    </Pressable>
  );
});

PrimaryButton.displayName = 'PrimaryButton';

export default PrimaryButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
  },
});
