import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image as ImageIcon } from 'lucide-react-native';
import { COLORS, SPACING, SIZES } from '@/constants/theme';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

type SecondaryButtonProps = {
  title: string;
  onPress: () => void;
};

export default function SecondaryButton({ title, onPress }: SecondaryButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedTouchableOpacity
      style={[styles.button, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.7}
    >
      <ImageIcon size={20} color={COLORS.primaryRed} style={styles.icon} />
      <Text style={styles.text}>{title}</Text>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1.5,
    borderColor: COLORS.primaryRed,
    minHeight: 56,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  text: {
    color: COLORS.primaryRed,
    fontSize: 16,
    fontWeight: '700',
  },
});
