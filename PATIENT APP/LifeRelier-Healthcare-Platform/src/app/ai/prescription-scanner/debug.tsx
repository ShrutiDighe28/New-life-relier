import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Trash2, Share2, AlertCircle, RefreshCw } from 'lucide-react-native';
import { debugLogger } from '@/services/debugLogger';
import { COLORS, SPACING } from '@/constants/theme';

export default function DebugScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [log, setLog] = useState(debugLogger.getLog());

  const handleClear = () => {
    debugLogger.clear();
    setLog(null);
  };

  const handleShare = async () => {
    if (!log) return;
    try {
      const shareContent = `Life Relier OCR-Gemini Pipeline Log (${log.timestamp})
      
--- 1. OCR TEXT ---
${log.ocrText}

--- 2. GEMINI PROMPT REQUEST ---
${log.geminiRequest}

--- 3. RAW GEMINI RESPONSE ---
${log.geminiResponse}

--- 4. PARSED STRUCTURED JSON ---
${log.parsedJson}`;

      await Share.share({
        message: shareContent,
        title: 'Life Relier AI Scanner Debug Log',
      });
    } catch (err) {
      console.error(err);
    }
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
        <Text style={styles.headerTitle}>Debug Inspector</Text>
        <View style={styles.headerRight}>
          {log && (
            <TouchableOpacity onPress={handleShare} style={styles.headerIcon}>
              <Share2 size={20} color="#2563EB" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleClear} style={styles.headerIcon}>
            <Trash2 size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {!log ? (
        <View style={styles.emptyContainer}>
          <AlertCircle size={48} color="#64748B" style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No Debug Logs Found</Text>
          <Text style={styles.emptyDesc}>
            Scan a prescription first. Logs of the OCR extraction and Gemini generation will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.timestampText}>Logged at: {new Date(log.timestamp).toLocaleString()}</Text>

          {/* OCR TEXT SECTION */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>1. OCR Text Received</Text>
            <ScrollView horizontal style={styles.codeScroll}>
              <Text style={styles.codeText}>{log.ocrText || '(No OCR Text)'}</Text>
            </ScrollView>
          </View>

          {/* GEMINI REQUEST PROMPT SECTION */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>2. Prompt Sent to Gemini</Text>
            <ScrollView horizontal style={styles.codeScroll}>
              <Text style={styles.codeText}>{log.geminiRequest || '(No Request)'}</Text>
            </ScrollView>
          </View>

          {/* GEMINI RAW RESPONSE SECTION */}
          <View style={[styles.card, styles.rawResponseCard]}>
            <Text style={[styles.cardTitle, styles.rawResponseTitle]}>3. Raw Gemini Response</Text>
            <ScrollView horizontal style={styles.codeScroll}>
              <Text style={[styles.codeText, styles.rawResponseText]}>{log.geminiResponse || '(No Response)'}</Text>
            </ScrollView>
          </View>

          {/* FINAL PARSED JSON SECTION */}
          <View style={[styles.card, styles.jsonCard]}>
            <Text style={[styles.cardTitle, styles.jsonTitle]}>4. Final Parsed Structured JSON</Text>
            <ScrollView horizontal style={styles.codeScroll}>
              <Text style={[styles.codeText, styles.jsonText]}>{log.parsedJson || '(No JSON)'}</Text>
            </ScrollView>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryText,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  timestampText: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'right',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  codeScroll: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    maxHeight: 300,
  },
  codeText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    lineHeight: 16,
  },
  rawResponseCard: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },
  rawResponseTitle: {
    color: '#D97706',
  },
  rawResponseText: {
    color: '#FCD34D',
  },
  jsonCard: {
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  jsonTitle: {
    color: '#2563EB',
  },
  jsonText: {
    color: '#93C5FD',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryText,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
  },
});
