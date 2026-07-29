import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, Check, Lock } from 'lucide-react-native';
import { COLORS, SPACING } from '@/constants/theme';

export default function SecurityCard() {
  const points = [
    "Your prescription is processed securely.",
    "Images are never stored without your permission.",
    "AI analysis happens only after your confirmation.",
    "You remain in control of your health data."
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your Privacy Matters</Text>
      <Text style={styles.sectionSubtitle}>
        Your health information is protected with industry-standard security practices.
      </Text>

      <View 
        style={styles.card} 
        accessibilityLabel="Security & Privacy details. Your prescription data is processed securely and kept private."
      >
        {/* Top Row */}
        <View style={styles.topRow}>
          <View style={styles.iconWrapper}>
            <ShieldCheck size={24} color="#2563EB" />
          </View>
          <Text style={styles.cardTitle}>Secure & Private</Text>
        </View>

        {/* Body Points */}
        <View style={styles.pointsContainer}>
          {points.map((point, index) => (
            <View key={index} style={styles.pointRow}>
              <Check size={16} color="#2563EB" style={styles.checkIcon} />
              <Text style={styles.pointText}>{point}</Text>
            </View>
          ))}
        </View>

        {/* Bottom Info Box */}
        <View style={styles.bottomInfoBox}>
          <Lock size={16} color="#475569" style={styles.lockIcon} />
          <Text style={styles.infoText}>
            Life Relier follows healthcare privacy best practices to protect your medical information.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    marginTop: 24, // Margin Top
    marginBottom: 40, // Margin Bottom
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#475569',
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 20,
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  pointsContainer: {
    gap: 12,
    marginBottom: SPACING.md,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  pointText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  bottomInfoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
  },
  lockIcon: {
    marginTop: 1,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
});
