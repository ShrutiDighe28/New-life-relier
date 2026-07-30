import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { FeatureCard } from '../types';
import { SHADOW_STYLES } from '../constants/styles';

interface FeatureCardsProps {
  features: FeatureCard[];
}

const FeatureCards = memo(({ features }: FeatureCardsProps) => {
  const theme = useTheme();

  if (!features || features.length === 0) return null;

  return (
    <View style={styles.container}>
      {features.map((feature) => (
        <View key={feature.id} style={[styles.card, { backgroundColor: theme.backgroundElement }, SHADOW_STYLES.small]}>
          <View style={[styles.iconWrapper, { backgroundColor: theme.backgroundSelected }]}>
            <feature.icon size={24} color={theme.text} />
          </View>
          <View style={styles.content}>
            <ThemedText type="default" style={styles.title}>{feature.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">{feature.description}</ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
});

FeatureCards.displayName = 'FeatureCards';
export default FeatureCards;

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    fontWeight: '600',
  }
});
