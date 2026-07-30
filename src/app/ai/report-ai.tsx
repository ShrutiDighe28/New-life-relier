import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Animated,
  Easing,
  Share,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/utils/themeManager';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import { readFileAsBase64, getFileSize } from '@/utils/fileReader';
import {
  analyzeReportImage,
  getCachedAnalysis,
  ReportAnalysis,
} from '@/services/geminiService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit

interface SelectedFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
  type: 'pdf' | 'image';
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Pulsing Loading Indicator Component ──────────────────────────────────────
function PulsingDots({ color }: { color: string }) {
  const anim1 = useRef(new Animated.Value(0.3)).current;
  const anim2 = useRef(new Animated.Value(0.3)).current;
  const anim3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 400, easing: Easing.ease, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 400, easing: Easing.ease, useNativeDriver: true }),
        ]),
      );
    pulse(anim1, 0).start();
    pulse(anim2, 200).start();
    pulse(anim3, 400).start();
  }, []);

  return (
    <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
      {[anim1, anim2, anim3].map((a, i) => (
        <Animated.View
          key={i}
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: color,
            opacity: a,
            transform: [{ scale: a }],
          }}
        />
      ))}
    </View>
  );
}

export default function ReportAIScreen() {
  const { colors, isDark } = useTheme();
  const s = createStyles(colors, isDark);
  const router = useRouter();

  // ── State ────────────────────────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ReportAnalysis | null>(null);
  const [error, setError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    // Load cached analysis on mount for offline support
    (async () => {
      try {
        const cached = await getCachedAnalysis();
        if (cached) {
          console.log('[ReportAIScreen] Loaded cached analysis');
          setAnalysis(cached);
        }
      } catch (e) {
        console.warn('[ReportAIScreen] Error loading cache:', e);
      }
    })();
  }, []);

  // ── File Reset & Validation ─────────────────────────────────────────────

  const resetSelection = () => {
    setSelectedFile(null);
    setAnalysis(null);
    setError('');
    setUploadProgress(0);
  };

  const validateAndSetFile = async (
    uri: string,
    name: string,
    providedSize?: number,
    providedMime?: string
  ) => {
    try {
      setError('');
      console.log(`[ReportAIScreen] Validating file: ${name}, URI: ${uri}`);

      const size = providedSize && providedSize > 0 ? providedSize : await getFileSize(uri);
      const mime = (providedMime || (name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg')).toLowerCase();

      if (size > MAX_FILE_SIZE) {
        const sizeMb = (size / (1024 * 1024)).toFixed(1);
        setError(`File is too large (${sizeMb} MB). Maximum permitted size is 10 MB.`);
        return;
      }

      const isPdf = mime.includes('pdf') || name.toLowerCase().endsWith('.pdf');
      const isImage = mime.includes('image') || /\.(png|jpe?g|webp|heic)$/i.test(name);

      if (!isPdf && !isImage) {
        setError(`Unsupported file format (${mime}). Please select a PDF document or JPG/PNG image.`);
        return;
      }

      const fileObj: SelectedFile = {
        uri,
        name: name || (isPdf ? 'lab-report.pdf' : 'lab-report.jpg'),
        size,
        mimeType: isPdf ? 'application/pdf' : mime || 'image/jpeg',
        type: isPdf ? 'pdf' : 'image',
      };

      console.log('[ReportAIScreen] Selected file validated:', fileObj);
      setSelectedFile(fileObj);
      setAnalysis(null);
    } catch (err: any) {
      console.error('[ReportAIScreen] File validation error:', err);
      setError(`Could not read file metadata: ${err?.message || 'Unknown error'}`);
    }
  };

  // ── Document / Camera / Gallery Selection ────────────────────────────────

  const pickPdf = useCallback(async () => {
    try {
      setError('');
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      await validateAndSetFile(asset.uri, asset.name, asset.size ?? undefined, asset.mimeType ?? undefined);
    } catch (err: any) {
      console.error('[ReportAIScreen] DocumentPicker error:', err);
      setError('Failed to select document. Please try again.');
    }
  }, []);

  const captureCamera = useCallback(async () => {
    try {
      setError('');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setError('Camera permission is required to capture a lab report photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.85,
        base64: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      await validateAndSetFile(asset.uri, 'camera-capture.jpg', asset.fileSize, asset.mimeType);
    } catch (err: any) {
      console.error('[ReportAIScreen] Camera capture error:', err);
      setError('Failed to open camera. Please try again.');
    }
  }, []);

  const pickGallery = useCallback(async () => {
    try {
      setError('');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Photo library permission is required to pick a report image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        base64: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      await validateAndSetFile(asset.uri, asset.fileName || 'gallery-report.jpg', asset.fileSize, asset.mimeType);
    } catch (err: any) {
      console.error('[ReportAIScreen] Gallery pick error:', err);
      setError('Failed to open photo library. Please try again.');
    }
  }, []);

  // ── Perform Gemini Analysis ───────────────────────────────────────────────

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) {
      setError('Please select or capture a report first.');
      return;
    }

    setAnalyzing(true);
    setError('');
    setUploadProgress(15);

    const timer = setInterval(() => {
      setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 15));
    }, 400);

    try {
      console.log('[ReportAIScreen] Reading file content to Base64...');
      const base64Data = await readFileAsBase64(selectedFile.uri);

      console.log(`[ReportAIScreen] File Base64 read successfully (${base64Data.length} chars). Sending to Gemini...`);
      setUploadProgress(60);

      const result = await analyzeReportImage(base64Data, selectedFile.mimeType);
      
      clearInterval(timer);
      setUploadProgress(100);
      setAnalysis(result);
      console.log('[ReportAIScreen] Report Analysis complete & set');

      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 300);
    } catch (err: any) {
      clearInterval(timer);
      setUploadProgress(0);
      console.error('[ReportAIScreen] Analysis failed:', err);
      setError(err?.message || 'Failed to analyze report. Please check your connection and try again.');
    } finally {
      setAnalyzing(false);
    }
  }, [selectedFile]);

  // ── Share & Export PDF ───────────────────────────────────────────────────

  const handleShare = useCallback(async () => {
    if (!analysis) return;
    try {
      let text = `📋 LifeRelier AI Report Analysis Summary\n\n`;
      text += `Status: ${analysis.overallStatus}\nSummary: ${analysis.summary}\n\n`;
      text += `Key Test Parameters:\n`;
      analysis.parameters.forEach((p) => {
        text += `• ${p.name}: ${p.value} ${p.unit} (${p.status}) - ${p.explanation}\n`;
      });
      if (analysis.healthImplications.length) {
        text += `\nHealth Implications:\n${analysis.healthImplications.map((h) => `• ${h}`).join('\n')}\n`;
      }
      text += `\n${analysis.disclaimer}`;

      await Share.share({ message: text, title: 'AI Lab Report Summary' });
    } catch (err) {
      console.warn('Share cancelled or failed', err);
    }
  }, [analysis]);

  const handleDownloadPdf = useCallback(async () => {
    if (!analysis || generatingPdf) return;
    setGeneratingPdf(true);

    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>LifeRelier Report Summary</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 24px; color: #0F172A; line-height: 1.5; background-color: #FFFFFF; }
            .header { border-bottom: 2px solid #2563EB; padding-bottom: 12px; margin-bottom: 20px; }
            .title { color: #1E3A8A; font-size: 22px; font-weight: 800; margin: 0; }
            .subtitle { color: #64748B; font-size: 12px; margin-top: 4px; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
            .badge-High { background-color: #FEE2E2; color: #DC2626; }
            .badge-Low { background-color: #FEF3C7; color: #D97706; }
            .badge-Borderline { background-color: #FFF7ED; color: #EA580C; }
            .badge-Normal { background-color: #DCFCE7; color: #16A34A; }
            .card { background-color: #EFF6FF; border: 1px solid #BFDBFE; padding: 16px; border-radius: 12px; margin-bottom: 20px; }
            .card-title { font-size: 14px; font-weight: 700; color: #1E3A8A; margin-bottom: 4px; }
            .card-text { font-size: 12px; color: #1E293B; margin: 0; }
            .section-title { font-size: 15px; font-weight: 700; color: #0F172A; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; }
            th { background-color: #2563EB; color: #FFFFFF; padding: 8px 10px; text-align: left; font-size: 12px; }
            td { padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 12px; color: #334155; vertical-align: top; }
            tr:nth-child(even) { background-color: #F8FAFC; }
            ul { margin: 0; padding-left: 18px; }
            li { font-size: 12px; color: #334155; margin-bottom: 4px; }
            .triage-box { padding: 14px; border-radius: 10px; margin-top: 20px; border: 1px solid #E2E8F0; }
            .disclaimer { background-color: #FFFBEB; border: 1px solid #FDE68A; color: #92400E; padding: 12px; border-radius: 10px; font-size: 11px; margin-top: 24px; line-height: 1.5; }
            .footer { text-align: center; font-size: 10px; color: #94A3B8; margin-top: 24px; border-top: 1px solid #F1F5F9; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">📋 LifeRelier AI Report Analysis</h1>
            <div class="subtitle">Generated on ${new Date(analysis.analyzedAt).toLocaleString()}</div>
          </div>

          <div class="card">
            <div class="card-title">Overall Status: ${escapeHtml(analysis.overallStatus)}</div>
            <p class="card-text">${escapeHtml(analysis.summary)}</p>
          </div>

          <div class="section-title">Diagnostic Test Parameters</div>
          <table>
            <thead>
              <tr>
                <th style="width: 32%;">Parameter</th>
                <th style="width: 20%;">Result</th>
                <th style="width: 25%;">Reference Range</th>
                <th style="width: 23%;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${analysis.parameters
                .map(
                  (p) => `
                <tr>
                  <td><strong>${escapeHtml(p.name)}</strong><br/><span style="color:#64748B;font-size:11px;">${escapeHtml(p.explanation)}</span></td>
                  <td><strong>${escapeHtml(p.value)}</strong> ${escapeHtml(p.unit)}</td>
                  <td>${escapeHtml(p.referenceRange || 'N/A')}</td>
                  <td><span class="badge badge-${escapeHtml(p.status)}">${escapeHtml(p.status)}</span></td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>

          ${
            analysis.healthImplications.length > 0
              ? `
            <div class="section-title">Health Implications</div>
            <ul>
              ${analysis.healthImplications.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>`
              : ''
          }

          ${
            analysis.lifestyleRecommendations.length > 0
              ? `
            <div class="section-title">Lifestyle Guidance</div>
            <ul>
              ${analysis.lifestyleRecommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>`
              : ''
          }

          ${
            analysis.dietSuggestions.length > 0
              ? `
            <div class="section-title">Dietary Guidance</div>
            <ul>
              ${analysis.dietSuggestions.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>`
              : ''
          }

          <div class="triage-box" style="background-color: ${analysis.immediateConsultation ? '#FEF2F2' : '#F0FDF4'}; border-color: ${analysis.immediateConsultation ? '#FECACA' : '#BBF7D0'};">
            <strong style="color: ${analysis.immediateConsultation ? '#DC2626' : '#16A34A'}; font-size: 13px;">
              ${analysis.immediateConsultation ? '⚠️ Doctor Consultation Recommended' : '✅ No Immediate Consultation Needed'}
            </strong>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #334155;">${escapeHtml(analysis.consultationReason)}</p>
          </div>

          <div class="disclaimer">${escapeHtml(analysis.disclaimer)}</div>
          <div class="footer">LifeRelier Healthcare Platform • AI Diagnostic Summary Document</div>
        </body>
        </html>
      `;

      console.log('[handleDownloadPdf] Generating PDF using expo-print...');

      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
      } else {
        let rawUri = '';
        try {
          const fileResult = await Print.printToFileAsync({ html });
          rawUri = fileResult.uri;
          console.log(`[handleDownloadPdf] Raw PDF generated at: ${rawUri}`);
        } catch (fileErr) {
          console.warn('[handleDownloadPdf] printToFileAsync failed, falling back to printAsync:', fileErr);
          await Print.printAsync({ html });
          return;
        }

        // Copy raw print URI to LegacyFileSystem.cacheDirectory so Android FileProvider permits reading
        let shareTargetUri = rawUri;
        try {
          const destName = `Report_Analysis_${Date.now()}.pdf`;
          const destUri = `${LegacyFileSystem.cacheDirectory}${destName}`;
          await LegacyFileSystem.copyAsync({ from: rawUri, to: destUri });
          shareTargetUri = destUri;
          console.log(`[handleDownloadPdf] Copied PDF to readable cache: ${shareTargetUri}`);
        } catch (copyErr) {
          console.warn('[handleDownloadPdf] Copy to cache failed, attempting raw URI:', copyErr);
        }

        // Try Sharing API first; if rejected by Android FileProvider, fallback gracefully to native Print dialog!
        let shared = false;
        if (await Sharing.isAvailableAsync()) {
          try {
            await Sharing.shareAsync(shareTargetUri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Save Report Summary PDF',
            });
            shared = true;
          } catch (shareErr: any) {
            console.warn('[handleDownloadPdf] shareAsync rejected, falling back to Print.printAsync:', shareErr);
          }
        }

        if (!shared) {
          // Reliable fallback for Android when shareAsync is rejected: opens native Print / Save as PDF modal directly
          await Print.printAsync({ html });
        }
      }
    } catch (err: any) {
      console.error('[handleDownloadPdf] PDF generation error:', err);
      Alert.alert(
        'PDF Generation Error',
        err?.message || 'Could not generate PDF document. Please try again.'
      );
    } finally {
      setGeneratingPdf(false);
    }
  }, [analysis, generatingPdf]);

  // ── Status Styling Helpers ───────────────────────────────────────────────

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'High': return { bg: '#FEE2E2', text: '#DC2626' };
      case 'Low': return { bg: '#FEF3C7', text: '#D97706' };
      case 'Borderline': return { bg: '#FFF7ED', text: '#EA580C' };
      default: return { bg: '#DCFCE7', text: '#16A34A' };
    }
  };

  const getOverallCardStyle = (status: string) => {
    switch (status) {
      case 'Critical': return { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626', icon: 'alert-circle' as const };
      case 'Attention Required': return { bg: '#FFF7ED', border: '#FED7AA', text: '#EA580C', icon: 'alert' as const };
      default: return { bg: '#F0FDF4', border: '#BBF7D0', text: '#16A34A', icon: 'check-circle' as const };
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═════════════════════════════════════════════════════════════════════════

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Report Explainer AI</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          {/* Safety Disclaimer Strip */}
          <View style={s.topDisclaimer}>
            <MaterialCommunityIcons name="shield-alert-outline" size={16} color={colors.textSecondary} />
            <Text style={s.topDisclaimerText}>
              AI-assisted analysis for patient education. Not a substitute for clinical doctor evaluation.
            </Text>
          </View>

          {/* Error Banner with Retry */}
          {error ? (
            <View style={s.errorBanner}>
              <View style={s.errorAccentBar} />
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#DC2626" style={{ marginLeft: 8 }} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={s.errorTextTitle}>Analysis Error</Text>
                <Text style={s.errorTextSub}>{error}</Text>
              </View>
              {selectedFile ? (
                <TouchableOpacity style={s.retryBtn} onPress={handleAnalyze}>
                  <MaterialCommunityIcons name="refresh" size={16} color="#FFFFFF" />
                  <Text style={s.retryBtnText}>Retry</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          {/* ═══ Upload Section ══════════════════════════════════════════ */}
          {!analysis && (
            <>
              <View style={s.uploadCard}>
                <View style={s.uploadIconCircle}>
                  <MaterialCommunityIcons name="file-document-edit-outline" size={38} color="#2563EB" />
                </View>
                <Text style={s.uploadTitle}>Scan or Upload Lab Report</Text>
                <Text style={s.uploadSubtitle}>Select PDF, camera photo, or gallery image (Max 10 MB)</Text>

                {/* Upload Buttons */}
                <View style={s.uploadActionsRow}>
                  <TouchableOpacity style={s.actionOptionBtn} onPress={pickPdf} activeOpacity={0.75}>
                    <View style={[s.actionOptionIcon, { backgroundColor: isDark ? '#1E3A5F' : '#EFF6FF' }]}>
                      <MaterialCommunityIcons name="file-pdf-box" size={26} color="#2563EB" />
                    </View>
                    <Text style={s.actionOptionText}>PDF File</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={s.actionOptionBtn} onPress={captureCamera} activeOpacity={0.75}>
                    <View style={[s.actionOptionIcon, { backgroundColor: isDark ? '#1A3B2E' : '#ECFDF5' }]}>
                      <MaterialCommunityIcons name="camera" size={26} color="#10B981" />
                    </View>
                    <Text style={s.actionOptionText}>Camera</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={s.actionOptionBtn} onPress={pickGallery} activeOpacity={0.75}>
                    <View style={[s.actionOptionIcon, { backgroundColor: isDark ? '#3B2E1A' : '#FFF7ED' }]}>
                      <MaterialCommunityIcons name="image-multiple" size={26} color="#F59E0B" />
                    </View>
                    <Text style={s.actionOptionText}>Gallery</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* ── File Preview Card ────────────────────────────────────── */}
              {selectedFile && (
                <View style={s.previewCard}>
                  <View style={s.previewHeader}>
                    <MaterialCommunityIcons
                      name={selectedFile.type === 'pdf' ? 'file-pdf-box' : 'file-image'}
                      size={30}
                      color={selectedFile.type === 'pdf' ? '#DC2626' : '#2563EB'}
                    />
                    <View style={s.previewMeta}>
                      <Text style={s.previewName} numberOfLines={1}>
                        {selectedFile.name}
                      </Text>
                      <Text style={s.previewDetails}>
                        {selectedFile.size > 0 ? `${(selectedFile.size / 1024).toFixed(0)} KB • ` : ''}
                        {selectedFile.type.toUpperCase()}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={resetSelection} style={s.removeFileBtn}>
                      <MaterialCommunityIcons name="close-circle" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  {selectedFile.type === 'image' && (
                    <Image source={{ uri: selectedFile.uri }} style={s.previewImage} resizeMode="contain" />
                  )}

                  {/* Primary Analyze Action Button */}
                  <TouchableOpacity
                    style={[s.analyzeBtn, analyzing && { opacity: 0.7 }]}
                    onPress={handleAnalyze}
                    disabled={analyzing}
                    activeOpacity={0.85}
                  >
                    {analyzing ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="brain" size={22} color="#FFFFFF" />
                        <Text style={s.analyzeBtnText}>Analyze Report with Gemini AI</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* ── Analyzing State Indicator ───────────────────────────── */}
              {analyzing && (
                <View style={s.analyzingBox}>
                  <View style={s.brainPulseCircle}>
                    <MaterialCommunityIcons name="robot" size={32} color="#2563EB" />
                  </View>
                  <Text style={s.analyzingTitle}>Gemini AI is Extracting Report Data…</Text>
                  <Text style={s.analyzingSubtitle}>Reading medical parameters, values & reference bounds</Text>
                  <PulsingDots color="#2563EB" />

                  {/* Progress Bar */}
                  <View style={s.progressBarBg}>
                    <View style={[s.progressBarFill, { width: `${uploadProgress}%` }]} />
                  </View>
                  <Text style={s.progressText}>{uploadProgress}% Complete</Text>
                </View>
              )}
            </>
          )}

          {/* ═══ Analysis Results Display ═════════════════════════════════ */}
          {analysis && !analyzing && (
            <>
              {/* Summary Hero Card */}
              <View style={s.resultCard}>
                <View style={s.resultCardHeader}>
                  <View style={s.aiAvatarCircle}>
                    <MaterialCommunityIcons name="robot" size={24} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.resultCardTitle}>Diagnostic Analysis Complete</Text>
                    <Text style={s.resultCardTimestamp}>
                      {new Date(analysis.analyzedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>

                {/* Overall Verdict Strip */}
                {(() => {
                  const ov = getOverallCardStyle(analysis.overallStatus);
                  return (
                    <View style={[s.overallBanner, { backgroundColor: ov.bg, borderColor: ov.border }]}>
                      <MaterialCommunityIcons name={ov.icon} size={24} color={ov.text} />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[s.overallTitle, { color: ov.text }]}>
                          Status: {analysis.overallStatus}
                        </Text>
                        <Text style={s.overallSummaryText}>{analysis.summary}</Text>
                      </View>
                    </View>
                  );
                })()}
              </View>

              {/* Parameter Breakdown */}
              {analysis.parameters.length > 0 && (
                <View style={s.sectionBox}>
                  <View style={s.sectionHeaderRow}>
                    <MaterialCommunityIcons name="test-tube" size={22} color="#2563EB" />
                    <Text style={s.sectionTitleText}>Extracted Test Parameters</Text>
                    <View style={s.badgeCounter}>
                      <Text style={s.badgeCounterText}>{analysis.parameters.length}</Text>
                    </View>
                  </View>

                  {analysis.parameters.map((param, idx) => {
                    const badge = getStatusBadge(param.status);
                    return (
                      <View
                        key={idx}
                        style={[s.paramRow, idx === analysis.parameters.length - 1 && { borderBottomWidth: 0 }]}
                      >
                        <View style={{ flex: 1 }}>
                          <View style={s.paramTopRow}>
                            <Text style={s.paramName}>{param.name}</Text>
                            <View style={[s.paramBadge, { backgroundColor: badge.bg }]}>
                              <Text style={[s.paramBadgeText, { color: badge.text }]}>{param.status}</Text>
                            </View>
                          </View>
                          <View style={s.paramValueRow}>
                            <Text style={s.paramValueText}>
                              {param.value} {param.unit}
                            </Text>
                            {param.referenceRange ? (
                              <Text style={s.paramRefText}>Normal: {param.referenceRange}</Text>
                            ) : null}
                          </View>
                          <Text style={s.paramExplanationText}>{param.explanation}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Health Implications */}
              {analysis.healthImplications.length > 0 && (
                <View style={s.sectionBox}>
                  <View style={s.sectionHeaderRow}>
                    <MaterialCommunityIcons name="heart-pulse" size={22} color="#EF4444" />
                    <Text style={s.sectionTitleText}>Possible Health Implications</Text>
                  </View>
                  {analysis.healthImplications.map((imp, i) => (
                    <View key={i} style={s.bulletItem}>
                      <View style={[s.bulletDot, { backgroundColor: '#EF4444' }]} />
                      <Text style={s.bulletText}>{imp}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Lifestyle Recommendations */}
              {analysis.lifestyleRecommendations.length > 0 && (
                <View style={s.sectionBox}>
                  <View style={s.sectionHeaderRow}>
                    <MaterialCommunityIcons name="run-fast" size={22} color="#10B981" />
                    <Text style={s.sectionTitleText}>Lifestyle & Activity Guidance</Text>
                  </View>
                  {analysis.lifestyleRecommendations.map((rec, i) => (
                    <View key={i} style={s.bulletItem}>
                      <View style={[s.bulletDot, { backgroundColor: '#10B981' }]} />
                      <Text style={s.bulletText}>{rec}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Diet Suggestions */}
              {analysis.dietSuggestions.length > 0 && (
                <View style={s.sectionBox}>
                  <View style={s.sectionHeaderRow}>
                    <MaterialCommunityIcons name="food-apple" size={22} color="#F59E0B" />
                    <Text style={s.sectionTitleText}>Dietary Suggestions</Text>
                  </View>
                  {analysis.dietSuggestions.map((diet, i) => (
                    <View key={i} style={s.bulletItem}>
                      <View style={[s.bulletDot, { backgroundColor: '#F59E0B' }]} />
                      <Text style={s.bulletText}>{diet}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Doctor Consultation Triage Card */}
              <View
                style={[
                  s.triageCard,
                  {
                    backgroundColor: analysis.immediateConsultation
                      ? (isDark ? '#3B1515' : '#FEF2F2')
                      : (isDark ? '#153B2A' : '#F0FDF4'),
                    borderColor: analysis.immediateConsultation ? '#FECACA' : '#BBF7D0',
                  },
                ]}
              >
                <View style={s.triageHeader}>
                  <MaterialCommunityIcons
                    name={analysis.immediateConsultation ? 'hospital-building' : 'check-decagram'}
                    size={26}
                    color={analysis.immediateConsultation ? '#DC2626' : '#16A34A'}
                  />
                  <Text
                    style={[
                      s.triageTitle,
                      { color: analysis.immediateConsultation ? '#DC2626' : '#16A34A' },
                    ]}
                  >
                    {analysis.immediateConsultation
                      ? 'Doctor Consultation Advised'
                      : 'No Immediate Doctor Consultation Required'}
                  </Text>
                </View>
                <Text style={s.triageReason}>{analysis.consultationReason}</Text>
              </View>

              {/* AI Disclaimer */}
              <View style={s.disclaimerCard}>
                <MaterialCommunityIcons name="information" size={20} color={isDark ? colors.textSecondary : '#92400E'} />
                <Text style={s.disclaimerCardText}>{analysis.disclaimer}</Text>
              </View>

              {/* Actions Footer */}
              <View style={s.actionsFooterRow}>
                <TouchableOpacity style={s.primaryActionBtn} onPress={resetSelection} activeOpacity={0.85}>
                  <MaterialCommunityIcons name="refresh" size={18} color="#FFFFFF" />
                  <Text style={s.primaryActionBtnText}>Analyze Another Report</Text>
                </TouchableOpacity>
              </View>

              <View style={s.secondaryActionsRow}>
                <TouchableOpacity style={s.secondaryOutlineBtn} onPress={handleShare} activeOpacity={0.8}>
                  <MaterialCommunityIcons name="share-variant" size={18} color="#2563EB" />
                  <Text style={s.secondaryOutlineText}>Share Summary</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.secondaryOutlineBtn, generatingPdf && { opacity: 0.7 }]}
                  onPress={handleDownloadPdf}
                  disabled={generatingPdf}
                  activeOpacity={0.8}
                >
                  {generatingPdf ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="download" size={18} color="#2563EB" />
                      <Text style={s.secondaryOutlineText}>Download PDF</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Empty Default State */}
          {!selectedFile && !analysis && !analyzing && (
            <View style={s.emptyStateBox}>
              <MaterialCommunityIcons name="text-search" size={52} color="#94A3B8" />
              <Text style={s.emptyStateTitle}>No Report Uploaded</Text>
              <Text style={s.emptyStateSubtitle}>
                Upload a lab report PDF or capture a photo above to get an instant AI plain-English medical breakdown.
              </Text>
            </View>
          )}

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  STYLES
// ═════════════════════════════════════════════════════════════════════════════
const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      height: 60,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    headerBtn: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
    scrollContent: { paddingBottom: 60 },

    topDisclaimer: {
      flexDirection: 'row',
      backgroundColor: isDark ? colors.background : '#F1F5F9',
      borderRadius: 12,
      padding: 12,
      marginHorizontal: 20,
      marginTop: 16,
      alignItems: 'center',
    },
    topDisclaimerText: {
      fontSize: 11,
      color: colors.textSecondary,
      marginLeft: 8,
      flex: 1,
      lineHeight: 15,
      fontWeight: '500',
    },

    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 14,
      backgroundColor: isDark ? '#3B1515' : '#FEF2F2',
      marginHorizontal: 20,
      marginTop: 12,
      paddingVertical: 12,
      paddingRight: 12,
      borderWidth: 1,
      borderColor: '#FECACA',
    },
    errorAccentBar: {
      width: 4,
      alignSelf: 'stretch',
      backgroundColor: '#DC2626',
      borderRadius: 2,
    },
    errorTextTitle: {
      color: '#DC2626',
      fontSize: 13,
      fontWeight: '700',
    },
    errorTextSub: {
      color: isDark ? '#FCA5A5' : '#991B1B',
      fontSize: 11,
      marginTop: 2,
      lineHeight: 15,
    },
    retryBtn: {
      backgroundColor: '#DC2626',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginLeft: 8,
    },
    retryBtnText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
    },

    uploadCard: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginTop: 16,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: isDark ? 'rgba(37, 99, 235, 0.3)' : '#BFDBFE',
      borderStyle: 'dashed',
      padding: 24,
      alignItems: 'center',
    },
    uploadIconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: isDark ? 'rgba(37, 99, 235, 0.15)' : '#EFF6FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
    },
    uploadTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: isDark ? colors.text : '#1E3A8A',
    },
    uploadSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
      marginBottom: 20,
      textAlign: 'center',
    },
    uploadActionsRow: {
      flexDirection: 'row',
      gap: 18,
    },
    actionOptionBtn: {
      alignItems: 'center',
      gap: 6,
    },
    actionOptionIcon: {
      width: 58,
      height: 58,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionOptionText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    },

    previewCard: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginTop: 14,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    previewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    previewMeta: { flex: 1, marginLeft: 12 },
    previewName: { fontSize: 14, fontWeight: '700', color: colors.text },
    previewDetails: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
    removeFileBtn: { padding: 4 },
    previewImage: {
      width: '100%',
      height: 210,
      borderRadius: 14,
      marginTop: 14,
      backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
    },

    analyzeBtn: {
      backgroundColor: '#2563EB',
      borderRadius: 16,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 16,
      shadowColor: '#2563EB',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 5,
    },
    analyzeBtnText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 15,
    },

    analyzingBox: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginTop: 16,
      borderRadius: 24,
      padding: 28,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    brainPulseCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: isDark ? 'rgba(37, 99, 235, 0.15)' : '#EFF6FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    analyzingTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    analyzingSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
      textAlign: 'center',
    },
    progressBarBg: {
      width: '85%',
      height: 6,
      borderRadius: 3,
      backgroundColor: isDark ? '#334155' : '#E2E8F0',
      marginTop: 20,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 3,
      backgroundColor: '#2563EB',
    },
    progressText: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 6,
      fontWeight: '600',
    },

    resultCard: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginTop: 16,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 2,
    },
    resultCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    aiAvatarCircle: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: '#2563EB',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    resultCardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    resultCardTimestamp: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },

    overallBanner: {
      flexDirection: 'row',
      borderWidth: 1,
      borderRadius: 16,
      padding: 14,
      alignItems: 'flex-start',
    },
    overallTitle: {
      fontSize: 14,
      fontWeight: '700',
    },
    overallSummaryText: {
      fontSize: 12,
      color: isDark ? colors.textSecondary : '#475569',
      marginTop: 4,
      lineHeight: 18,
    },

    sectionBox: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginTop: 14,
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    sectionTitleText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginLeft: 8,
      flex: 1,
    },
    badgeCounter: {
      backgroundColor: isDark ? '#334155' : '#EFF6FF',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    badgeCounterText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#2563EB',
    },

    paramRow: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    paramTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    paramName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    paramBadge: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 8,
      marginLeft: 8,
    },
    paramBadgeText: {
      fontSize: 10,
      fontWeight: '800',
    },
    paramValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 4,
    },
    paramValueText: {
      fontSize: 13,
      fontWeight: '600',
      color: isDark ? colors.textSecondary : '#334155',
    },
    paramRefText: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    paramExplanationText: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 17,
    },

    bulletItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    bulletDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 7,
      marginRight: 10,
    },
    bulletText: {
      flex: 1,
      fontSize: 12,
      color: isDark ? colors.textSecondary : '#334155',
      lineHeight: 18,
    },

    triageCard: {
      marginHorizontal: 20,
      marginTop: 14,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
    },
    triageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 10,
    },
    triageTitle: {
      fontSize: 14,
      fontWeight: '700',
      flex: 1,
    },
    triageReason: {
      fontSize: 12,
      color: isDark ? colors.textSecondary : '#475569',
      lineHeight: 18,
      marginLeft: 36,
    },

    disclaimerCard: {
      flexDirection: 'row',
      backgroundColor: isDark ? 'rgba(249, 115, 22, 0.1)' : '#FFFBEB',
      borderRadius: 14,
      padding: 14,
      marginHorizontal: 20,
      marginTop: 14,
      alignItems: 'flex-start',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(249, 115, 22, 0.2)' : '#FDE68A',
    },
    disclaimerCardText: {
      fontSize: 11,
      color: isDark ? colors.textSecondary : '#92400E',
      marginLeft: 8,
      flex: 1,
      lineHeight: 16,
    },

    actionsFooterRow: {
      marginHorizontal: 20,
      marginTop: 18,
    },
    primaryActionBtn: {
      backgroundColor: '#2563EB',
      borderRadius: 16,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      shadowColor: '#2563EB',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryActionBtnText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 15,
    },

    secondaryActionsRow: {
      flexDirection: 'row',
      gap: 12,
      marginHorizontal: 20,
      marginTop: 12,
    },
    secondaryOutlineBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: '#2563EB',
      backgroundColor: isDark ? 'rgba(37, 99, 235, 0.1)' : '#FFFFFF',
    },
    secondaryOutlineText: {
      color: '#2563EB',
      fontWeight: '700',
      fontSize: 13,
    },

    emptyStateBox: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginTop: 16,
      borderRadius: 24,
      padding: 32,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    emptyStateTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textSecondary,
      marginTop: 14,
    },
    emptyStateSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 6,
      lineHeight: 19,
    },
  });