import React, { memo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft, Bell, User } from 'lucide-react-native';

import LogoBrand from '@/components/common/LogoBrand';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { HIT_SLOP } from '../constants/styles';
import { STRINGS } from '../constants/strings';
import { ICON_SIZES } from '../constants/icons';
import { MODULE_SPACING } from '../constants/spacing';
import { MODULE_COLORS } from '../constants/colors';

const PrescriptionHeader = memo(() => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Pressable 
        style={({ pressed }) => [
          styles.iconButton, 
          { backgroundColor: theme.backgroundElement },
          pressed && styles.pressed
        ]} 
        onPress={() => console.log(STRINGS.header.placeholderBack)}
        hitSlop={HIT_SLOP.medium}
        accessibilityRole="button"
        accessibilityLabel={STRINGS.header.backLabel}
      >
        <ChevronLeft size={ICON_SIZES.large} color={theme.text} />
      </Pressable>

      <LogoBrand size={28} fontSize={18} />

      <View style={styles.rightSection}>
        <Pressable 
          style={({ pressed }) => [
            styles.iconButton, 
            { backgroundColor: theme.backgroundElement },
            pressed && styles.pressed
          ]} 
          onPress={() => console.log(STRINGS.header.placeholderNotif)}
          hitSlop={HIT_SLOP.medium}
          accessibilityRole="button"
          accessibilityLabel={STRINGS.header.notificationsLabel}
        >
          <Bell size={ICON_SIZES.medium} color={theme.text} />
        </Pressable>
        
        <Pressable 
          style={({ pressed }) => [
            styles.avatarButton, 
            { backgroundColor: theme.backgroundElement },
            pressed && styles.pressed
          ]} 
          onPress={() => console.log(STRINGS.header.placeholderProfile)}
          hitSlop={HIT_SLOP.medium}
          accessibilityRole="button"
          accessibilityLabel={STRINGS.header.profileLabel}
        >
          <User size={ICON_SIZES.medium} color={theme.text} />
        </Pressable>
      </View>
    </View>
  );
});

PrescriptionHeader.displayName = 'PrescriptionHeader';

export default PrescriptionHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
  iconButton: {
    width: MODULE_SPACING.iconButtonSize,
    height: MODULE_SPACING.iconButtonSize,
    borderRadius: MODULE_SPACING.iconButtonRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatarButton: {
    width: MODULE_SPACING.iconButtonSize,
    height: MODULE_SPACING.iconButtonSize,
    borderRadius: MODULE_SPACING.iconButtonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: MODULE_COLORS.avatarBorder,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  }
});
