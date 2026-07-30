import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { SecurityCardProps } from '../types';
import { SHADOW_STYLES } from '../constants/styles';

const SecurityCard = memo(({ title, description, hipaaCompliant }: SecurityCardProps) => {
  const theme = useTheme();

  if (!title) return null;

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }, SHADOW_STYLES.small]}>
      <ShieldCheck size={28} color={theme.text} />
      <View style={styles.content}>
        <ThemedText type="default" style={styles.title}>{title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">{description}</ThemedText>
        {hipaaCompliant && (
          <View style={[styles.badge, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="smallBold" style={{ fontSize: 10, color: theme.text }}>HIPAA COMPLIANT</ThemedText>
          </View>
        )}
      </View>
    </View>
  );
});

SecurityCard.displayName = 'SecurityCard';
export default SecurityCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.three,
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    gap: Spacing.one,
    alignItems: 'flex-start',
  },
  title: {
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
    marginTop: Spacing.one,
  }
});
