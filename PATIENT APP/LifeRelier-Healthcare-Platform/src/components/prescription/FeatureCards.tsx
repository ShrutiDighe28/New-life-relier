import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BrainCircuit, ShieldCheck, BadgeCheck } from 'lucide-react-native';
import { COLORS, SPACING, SHADOWS } from '@/constants/theme';

interface FeatureCardItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCardItem({ icon, title, description }: FeatureCardItemProps) {
  return (
    <View 
      style={styles.card}
      accessibilityLabel={`${title}. ${description}`}
    >
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
    </View>
  );
}

export default function FeatureCards() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Why Use AI Prescription Scanner?</Text>
      <Text style={styles.sectionSubtitle}>
        Experience faster, safer, and smarter prescription analysis.
      </Text>

      <View style={styles.cardsContainer}>
        <FeatureCardItem
          icon={<BrainCircuit size={24} color="#2563EB" />}
          title="AI-Powered Analysis"
          description="Understand medicines, dosage instructions, and possible interactions using advanced AI."
        />
        <FeatureCardItem
          icon={<ShieldCheck size={24} color="#2563EB" />}
          title="Secure & Private"
          description="Your prescription data is encrypted and processed securely. Nothing is stored without your permission."
        />
        <FeatureCardItem
          icon={<BadgeCheck size={24} color="#2563EB" />}
          title="High Accuracy"
          description="OCR combined with AI delivers reliable medicine extraction and prescription understanding."
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    marginTop: 24, // Section margin top
    marginBottom: 24, // Section margin bottom
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  cardsContainer: {
    gap: 16, // Space between cards
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.soft, // Very subtle shadow
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
});
