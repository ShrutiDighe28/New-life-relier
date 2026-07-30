import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { ChevronRight, Calendar, User, Building, Clipboard } from 'lucide-react-native';
import { Prescription } from '../types';
import { COLORS, SPACING, SHADOWS } from '@/constants/theme';

interface PrescriptionCardProps {
  prescription: Prescription;
  onPress: () => void;
}

export default function PrescriptionCard({ prescription, onPress }: PrescriptionCardProps) {
  // Format dates: e.g. "Jul 28, 2026"
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const medicineCount = prescription.medicines ? prescription.medicines.length : 0;
  const isHighConfidence = prescription.confidence >= 90;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Prescription by ${prescription.doctorName} at ${prescription.hospitalName}. Contains ${medicineCount} medicines. Scan date ${formatDate(prescription.scanDate)}.`}
    >
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
          <Calendar size={14} color="#64748B" style={styles.icon} />
          <Text style={styles.dateText}>{formatDate(prescription.scanDate)}</Text>
        </View>

        <View style={[styles.confidenceBadge, isHighConfidence ? styles.highConf : styles.midConf]}>
          <Text style={[styles.confidenceText, isHighConfidence ? styles.highConfText : styles.midConfText]}>
            {prescription.confidence}% Conf.
          </Text>
        </View>
      </View>

      <Text style={styles.doctorName} numberOfLines={1}>
        {prescription.doctorName}
      </Text>

      <View style={styles.hospitalRow}>
        <Building size={14} color="#64748B" style={styles.icon} />
        <Text style={styles.hospitalText} numberOfLines={1}>
          {prescription.hospitalName}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View style={styles.medsCountContainer}>
          <Clipboard size={14} color="#2563EB" style={styles.icon} />
          <Text style={styles.medsCountText}>
            {medicineCount} {medicineCount === 1 ? 'Medicine' : 'Medicines'}
          </Text>
        </View>

        <View style={styles.arrowContainer}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <ChevronRight size={16} color="#2563EB" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  highConf: {
    backgroundColor: '#ECFDF5',
  },
  midConf: {
    backgroundColor: '#FFFBEB',
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '700',
  },
  highConfText: {
    color: '#065F46',
  },
  midConfText: {
    color: '#92400E',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryText,
    marginBottom: 4,
  },
  hospitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hospitalText: {
    fontSize: 13,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medsCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medsCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    marginRight: 2,
  },
  icon: {
    marginRight: 6,
  },
});
