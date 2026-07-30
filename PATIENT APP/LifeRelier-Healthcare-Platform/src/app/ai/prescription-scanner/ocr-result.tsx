import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, RefreshCw, Cpu } from 'lucide-react-native';
import { COLORS, SPACING, SIZES, SHADOWS } from '@/constants/theme';

export default function OcrResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { text, uri } = useLocalSearchParams<{ text: string; uri?: string }>();

  const handleContinueAI = () => {
    router.push({
      pathname: '/ai/prescription-scanner/analysis',
      params: { text, uri },
    });
  };

  const handleScanAgain = () => {
    router.dismissAll();
    router.navigate('/ai/prescription-scanner');
  };

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
        <Text style={styles.headerTitle}>Extracted Text</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Prescription Details</Text>
        <Text style={styles.subtitle}>
          Below is the raw text extracted from your prescription. Confirm readability before AI extraction.
        </Text>

        {/* Scrollable text card */}
        <View style={styles.textCard}>
          <ScrollView nestedScrollEnabled style={styles.textScroll}>
            <Text style={styles.ocrText}>{text || "No text could be extracted."}</Text>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        {/* Scan Again Button */}
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={handleScanAgain}
          accessibilityRole="button"
          accessibilityLabel="Scan another prescription"
        >
          <RefreshCw size={18} color={COLORS.primaryText} style={styles.buttonIcon} />
          <Text style={styles.scanAgainText}>Scan Again</Text>
        </TouchableOpacity>

        {/* Continue AI Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinueAI}
          accessibilityRole="button"
          accessibilityLabel="Continue to AI medical analysis"
        >
          <Cpu size={18} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.continueText}>Continue to AI</Text>
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
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryText,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.secondaryText,
    lineHeight: 20,
    marginBottom: 20,
  },
  textCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    height: SIZES.screenWidth * 0.9, // Responsive height card
    ...SHADOWS.soft,
  },
  textScroll: {
    flex: 1,
  },
  ocrText: {
    fontSize: 14,
    color: COLORS.primaryText,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
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
  scanAgainButton: {
    flex: 1,
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanAgainText: {
    color: COLORS.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    flex: 1.2,
    flexDirection: 'row',
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
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonIcon: {
    marginRight: 8,
  },
});
