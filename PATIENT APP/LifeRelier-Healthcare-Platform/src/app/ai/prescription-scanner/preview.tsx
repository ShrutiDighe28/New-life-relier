import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RefreshCw, Check, AlertTriangle, ImagePlus } from 'lucide-react-native';
import { extractText } from '@/services/ocrService';

export default function PreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { uri } = useLocalSearchParams<{ uri: string }>();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If no uri is passed, go back
  if (!uri) {
    router.back();
    return null;
  }

  const handleUsePhoto = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await extractText(uri);
      if (!result || !result.fullText.trim()) {
        throw new Error("Unable to read this prescription.");
      }
      setIsAnalyzing(false);
      router.push({
        pathname: '/ai/prescription-scanner/ocr-result',
        params: { text: result.fullText, uri },
      });
    } catch (err: any) {
      console.error(err);
      setIsAnalyzing(false);
      setError("Unable to read this prescription.");
    }
  };

  const handleChooseAnother = () => {
    router.dismissAll();
    router.navigate('/ai/prescription-scanner');
  };

  return (
    <View style={styles.container}>
      {/* Captured Image Viewer */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri }} 
          style={styles.image} 
          resizeMode="cover"
        />
      </View>

      {/* Loading Overlay */}
      {isAnalyzing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Analyzing Prescription...</Text>
        </View>
      )}

      {/* Bottom Action Controls */}
      <View style={[styles.bottomCard, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        {error ? (
          // Error State Layout
          <>
            <View style={styles.errorHeader}>
              <AlertTriangle size={24} color="#EF4444" style={styles.errorIcon} />
              <Text style={[styles.title, styles.errorTitle]}>Unable to read this prescription.</Text>
            </View>
            <Text style={styles.subtitle}>
              Please capture a clearer image. Ensure all writing is well-lit and in focus.
            </Text>

            <View style={styles.buttonRow}>
              {/* Retake Button (Left) */}
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={() => {
                  setError(null);
                  router.back();
                }}
                accessibilityRole="button"
                accessibilityLabel="Retake prescription photo"
              >
                <RefreshCw size={18} color="#0F172A" style={styles.buttonIcon} />
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>

              {/* Choose Another Button (Right) */}
              <TouchableOpacity
                style={styles.chooseAnotherButton}
                onPress={handleChooseAnother}
                accessibilityRole="button"
                accessibilityLabel="Choose another image from scanner screen"
              >
                <ImagePlus size={18} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.chooseAnotherButtonText}>Choose Another</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          // Normal State Layout
          <>
            <Text style={styles.title}>Confirm Prescription Photo</Text>
            <Text style={styles.subtitle}>
              Ensure all written words, medicine names, and dosages are clearly readable.
            </Text>

            <View style={styles.buttonRow}>
              {/* Retake Button (Left) */}
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Retake prescription photo"
                disabled={isAnalyzing}
              >
                <RefreshCw size={18} color="#0F172A" style={styles.buttonIcon} />
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>

              {/* Use Photo Button (Right) */}
              <TouchableOpacity
                style={[styles.useButton, isAnalyzing && styles.buttonDisabled]}
                onPress={handleUsePhoto}
                accessibilityRole="button"
                accessibilityLabel="Use captured photo for analysis"
                disabled={isAnalyzing}
              >
                <Check size={18} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.useButtonText}>Use Photo</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
  },
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorTitle: {
    color: '#EF4444',
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  retakeButton: {
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
  retakeButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },
  useButton: {
    flex: 1.2,
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  useButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  chooseAnotherButton: {
    flex: 1.2,
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  chooseAnotherButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
