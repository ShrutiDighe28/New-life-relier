import React, { memo } from 'react';
import { Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { LucideIcon } from 'lucide-react-native';
import { ICON_SIZES } from '../constants/icons';

interface SecondaryButtonProps {
  title: string;
  onPress?: () => void;
  icon?: LucideIcon;
  isLoading?: boolean;
}

const SecondaryButton = memo(({ title, onPress, icon: Icon, isLoading }: SecondaryButtonProps) => {
  const theme = useTheme();

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.button, 
        { backgroundColor: theme.backgroundSelected },
        pressed && styles.pressed
      ]} 
      onPress={onPress}
      disabled={isLoading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isLoading }}
    >
      {isLoading ? (
        <ActivityIndicator color={theme.text} />
      ) : (
        <>
          {Icon && <Icon size={ICON_SIZES.medium} color={theme.text} />}
          <ThemedText style={[styles.text, { color: theme.text }]}>{title}</ThemedText>
        </>
      )}
    </Pressable>
  );
});

SecondaryButton.displayName = 'SecondaryButton';

export default SecondaryButton;

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
