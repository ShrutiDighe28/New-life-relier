import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { COLORS, SPACING } from '@/constants/theme';

export default function HeroSection() {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Prescription Scanner</Text>
        <Text style={styles.subtitle}>
          Scan your prescription to get medicine details, safety information and AI insights.
        </Text>
      </View>
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Sparkles size={40} color={COLORS.primaryBlue} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  textContainer: {
    flex: 0.65,
    paddingRight: SPACING.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primaryText,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.secondaryText,
    lineHeight: 20,
  },
  imageContainer: {
    flex: 0.35,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
});
