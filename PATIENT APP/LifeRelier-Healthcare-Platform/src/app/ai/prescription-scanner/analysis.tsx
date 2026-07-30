import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle, Calendar, ShieldAlert, Terminal } from 'lucide-react-native';
import { analyzePrescription } from '@/services/geminiService';
import { PrescriptionAnalysis } from '@/types/prescription';
import { COLORS, SPACING, SHADOWS } from '@/constants/theme';
import { prescriptionService } from '../../prescriptions/services/prescriptionService';

export default function AnalysisScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { text, uri } = useLocalSearchParams<{ text: string; uri?: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<PrescriptionAnalysis | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);

  const runAnalysis = async () => {
    if (!text) {
      setError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(false);
    try {
      const result = await analyzePrescription(text);
      router.replace({
        pathname: '/ai/prescription-scanner/review-edit' as any,
        params: {
          analysisData: JSON.stringify(result),
          uri: uri || '',
          text: text || '',
        },
      });
    } catch (err) {
      console.error(err);
      setError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [text]);

  const handleScanAgain = () => {
    router.dismissAll();
    router.navigate('/ai/prescription-scanner');
  };

  const handleSavePrescription = async () => {
    if (!analysis) return;
    setIsSaving(true);
    try {
      await prescriptionService.savePrescription({
        doctorName: analysis.doctorName || "Unknown Doctor",
        hospitalName: analysis.hospitalName || "Unknown Hospital",
        patientName: analysis.patientName || "Gauresh Shinde",
        diagnosis: analysis.diagnosis || "No diagnosed condition",
        prescriptionDate: analysis.date || new Date().toISOString().split('T')[0],
        scanDate: new Date().toISOString(),
        medicines: analysis.medicines,
        warnings: analysis.warnings,
        confidence: analysis.confidence,
        originalImageUri: uri || "",
        ocrText: text || "",
        followUp: analysis.followUp || "",
      });

      Alert.alert(
        "Prescription Saved",
        "Your prescription has been successfully saved to your digital health record.",
        [
          {
            text: "OK",
            onPress: () => {
              router.navigate('/prescriptions' as any);
            }
          }
        ]
      );
    } catch (err: any) {
      console.error(err);
      Alert.alert("Save Failed", err?.message || "Could not save prescription.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
        <Text style={styles.loadingText}>Analyzing your prescription with AI...</Text>
        <Text style={styles.loadingSubtext}>Extracting medicine names, dosages, and safety guidelines.</Text>
      </View>
    );
  }

  if (error || !analysis) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.errorCard}>
          <View style={styles.errorIconContainer}>
            <AlertTriangle size={48} color="#EF4444" />
          </View>
          <Text style={styles.errorTitle}>Analysis Failed</Text>
          <Text style={styles.errorDescription}>
            We couldn't analyze this prescription. Please try again.
          </Text>

          <TouchableOpacity 
            style={styles.retryButton}
            onPress={runAnalysis}
            accessibilityRole="button"
            accessibilityLabel="Retry prescription analysis"
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.scanAgainErrorButton}
            onPress={handleScanAgain}
            accessibilityRole="button"
            accessibilityLabel="Scan another prescription"
          >
            <Text style={styles.scanAgainErrorText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color={COLORS.primaryText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Medical Analysis</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.navigate('/ai/prescription-scanner/debug' as any)}
          accessibilityRole="button"
          accessibilityLabel="Open Developer Debug Inspector"
        >
          <Terminal size={22} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Confidence Row */}
        <View style={styles.confidenceRow}>
          <CheckCircle size={16} color="#10B981" />
          <Text style={styles.confidenceText}>
            Confidence: <Text style={styles.confidenceValue}>{analysis.confidence}%</Text>
          </Text>
        </View>

        {/* Doctor & Hospital Details Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Prescribing Authority</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Doctor:</Text>
            <Text style={styles.infoValue}>{analysis.doctorName || "Not specified"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hospital/Clinic:</Text>
            <Text style={styles.infoValue}>{analysis.hospitalName || "Not specified"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{analysis.date || "Not specified"}</Text>
          </View>
        </View>

        {/* Patient & Diagnosis details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Patient details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Patient Name:</Text>
            <Text style={styles.infoValue}>{analysis.patientName || "Not specified"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Diagnosis/Reason:</Text>
            <Text style={styles.infoValue}>{analysis.diagnosis || "Not specified"}</Text>
          </View>
        </View>

        {/* Medicines Section */}
        <Text style={styles.listSectionTitle}>Prescribed Medicines</Text>
        
        {analysis.medicines.length === 0 ? (
          <View style={styles.emptyMedicinesCard}>
            <Text style={styles.emptyMedicinesText}>No medicines could be identified in the prescription text.</Text>
          </View>
        ) : (
          analysis.medicines.map((med, index) => (
            <View key={index} style={styles.medicineCard}>
              <View style={styles.medHeader}>
                <Text style={styles.medName}>{med.name}</Text>
                {med.strength ? (
                  <View style={styles.strengthBadge}>
                    <Text style={styles.strengthText}>{med.strength}</Text>
                  </View>
                ) : null}
              </View>
              
              <View style={styles.medDetailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Dosage</Text>
                  <Text style={styles.detailValue}>{med.dosage || "As directed"}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Frequency</Text>
                  <Text style={styles.detailValue}>{med.frequency || "As directed"}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Duration</Text>
                  <Text style={styles.detailValue}>{med.duration || "N/A"}</Text>
                </View>
              </View>

              {med.instructions ? (
                <View style={styles.instructionsContainer}>
                  <Text style={styles.instructionsLabel}>Instructions:</Text>
                  <Text style={styles.instructionsValue}>{med.instructions}</Text>
                </View>
              ) : null}
            </View>
          ))
        )}

        {/* Warnings Section */}
        {analysis.warnings.length > 0 && (
          <View style={styles.warningsCard}>
            <View style={styles.warningsHeader}>
              <ShieldAlert size={20} color="#D97706" style={styles.warningIcon} />
              <Text style={styles.warningsTitle}>Safety Warnings & Advisory</Text>
            </View>
            <View style={styles.warningList}>
              {analysis.warnings.map((warn, index) => (
                <Text key={index} style={styles.warningItem}>
                  • {warn}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Follow up card */}
        {analysis.followUp ? (
          <View style={styles.followUpCard}>
            <View style={styles.followUpHeader}>
              <Calendar size={18} color={COLORS.primaryBlue} style={styles.followUpIcon} />
              <Text style={styles.followUpTitle}>Follow-up Instructions</Text>
            </View>
            <Text style={styles.followUpText}>{analysis.followUp}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.doneButtonSecondary}
          onPress={handleScanAgain}
          accessibilityRole="button"
          accessibilityLabel="Done and return to scanner"
          disabled={isSaving}
        >
          <Text style={styles.doneButtonTextSecondary}>Discard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.buttonDisabled]}
          onPress={handleSavePrescription}
          accessibilityRole="button"
          accessibilityLabel="Save prescription to record"
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Record</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonPlaceholder: {
    width: 44,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryText,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 24,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  confidenceText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
    marginLeft: 6,
  },
  confidenceValue: {
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.soft,
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.secondaryText,
    flex: 0.35,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryText,
    textAlign: 'right',
    flex: 0.65,
  },
  listSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryText,
    marginTop: 8,
    marginBottom: 12,
  },
  emptyMedicinesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyMedicinesText: {
    fontSize: 13,
    color: COLORS.secondaryText,
    textAlign: 'center',
  },
  medicineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.soft,
  },
  medHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryText,
    flex: 1,
    marginRight: 8,
  },
  strengthBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  strengthText: {
    color: COLORS.primaryBlue,
    fontSize: 11,
    fontWeight: '700',
  },
  medDetailsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 10,
    marginBottom: 10,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 10,
    color: COLORS.secondaryText,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryText,
  },
  instructionsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
  },
  instructionsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondaryText,
    marginBottom: 2,
  },
  instructionsValue: {
    fontSize: 12,
    color: COLORS.primaryText,
    lineHeight: 16,
  },
  warningsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 16,
    marginBottom: 16,
  },
  warningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningIcon: {
    marginRight: 8,
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  warningList: {
    gap: 6,
  },
  warningItem: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
  followUpCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 16,
    marginBottom: 8,
  },
  followUpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  followUpIcon: {
    marginRight: 8,
  },
  followUpTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
  },
  followUpText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  doneButtonSecondary: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonTextSecondary: {
    color: COLORS.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1.5,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryText,
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.secondaryText,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  errorCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryText,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 14,
    color: COLORS.secondaryText,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  retryButton: {
    backgroundColor: COLORS.primaryBlue,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  scanAgainErrorButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  scanAgainErrorText: {
    color: COLORS.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
});
