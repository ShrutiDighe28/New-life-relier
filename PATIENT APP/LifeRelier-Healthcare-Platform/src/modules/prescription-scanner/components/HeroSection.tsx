import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Scan, FileText } from 'lucide-react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { SHADOW_STYLES } from '../constants/styles';
import { STRINGS } from '../constants/strings';
import { ICON_SIZES, ICON_STROKE_WIDTH } from '../constants/icons';
import { MODULE_SPACING } from '../constants/spacing';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
}

const HeroSection = memo(({ 
  title = STRINGS.hero.defaultTitle, 
  subtitle = STRINGS.hero.defaultSubtitle 
}: HeroSectionProps) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement }, SHADOW_STYLES.small]}>
      <View style={styles.leftContent}>
        <ThemedText type="default" style={[styles.title, { color: theme.text }]}>
          {title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      </View>
      
      <View style={[styles.illustrationContainer, { backgroundColor: theme.backgroundSelected }]}>
        <FileText size={ICON_SIZES.xlarge} color={theme.text} strokeWidth={ICON_STROKE_WIDTH.regular} />
        <View style={[styles.badge, { backgroundColor: theme.background }]}>
          <Scan size={ICON_SIZES.small} color={theme.text} strokeWidth={ICON_STROKE_WIDTH.bold} />
        </View>
      </View>
    </View>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  leftContent: {
    flex: 1,
    gap: Spacing.one,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.half,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  illustrationContainer: {
    width: MODULE_SPACING.heroIllustrationSize,
    height: MODULE_SPACING.heroIllustrationSize,
    borderRadius: MODULE_SPACING.heroIllustrationRadius,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    bottom: MODULE_SPACING.heroBadgeOffset,
    right: MODULE_SPACING.heroBadgeOffset,
    padding: Spacing.one,
    borderRadius: MODULE_SPACING.heroBadgeRadius,
  }
});
