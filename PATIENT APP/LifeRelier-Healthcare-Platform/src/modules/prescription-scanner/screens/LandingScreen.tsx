import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ui/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Import newly created module components
import PrescriptionHeader from '../components/PrescriptionHeader';
import HeroSection from '../components/HeroSection';
import UploadCard from '../components/UploadCard';
import FeatureCards from '../components/FeatureCards';
import SecurityCard from '../components/SecurityCard';
import { STRINGS } from '../constants/strings';
import { HERO_DATA, SUPPORTED_FORMATS_TEXT, FEATURE_CARDS_DATA, SECURITY_CARD_DATA } from '../constants/data';

export default function LandingScreen() {
  const theme = useTheme();

  const handleCapture = useCallback(() => {
    console.log(STRINGS.landingPlaceholders.capture);
  }, []);

  const handleGallery = useCallback(() => {
    console.log(STRINGS.landingPlaceholders.gallery);
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
      >
        <PrescriptionHeader />
        
        <View style={styles.headerTextContainer} accessible accessibilityRole="header">
          <ThemedText type="title">{STRINGS.landing.title}</ThemedText>
          <ThemedText type="subtitle" themeColor="textSecondary">{STRINGS.landing.subtitle}</ThemedText>
        </View>

        <HeroSection title={HERO_DATA.title} subtitle={HERO_DATA.subtitle} />
        
        <UploadCard 
          onCapture={handleCapture} 
          onGallery={handleGallery} 
          formatsText={SUPPORTED_FORMATS_TEXT}
        />

        <FeatureCards features={FEATURE_CARDS_DATA} />
        
        <SecurityCard {...SECURITY_CARD_DATA} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
    flexGrow: 1,
    paddingBottom: Spacing.six,
  },
  headerTextContainer: {
    marginVertical: Spacing.two,
    gap: Spacing.one,
  },
});
