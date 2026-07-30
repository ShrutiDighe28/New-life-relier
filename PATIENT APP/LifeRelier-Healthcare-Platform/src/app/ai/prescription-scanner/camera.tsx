import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { ArrowLeft, Zap, ZapOff, RefreshCw, AlertTriangle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [isCapturing, setIsCapturing] = useState(false);

  // Auto-request permission on mount
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    // Loading state while requesting permission
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Initializing camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Permission Denied State
    return (
      <View style={[styles.deniedContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.deniedCard}>
          <View style={styles.deniedIconContainer}>
            <AlertTriangle size={48} color="#EF4444" />
          </View>
          <Text style={styles.deniedTitle}>Camera Permission Required</Text>
          <Text style={styles.deniedDescription}>
            Life Relier needs camera access to scan your prescriptions and extract medicine details.
          </Text>
          
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => Linking.openSettings()}
            accessibilityRole="button"
            accessibilityLabel="Open settings to grant camera access"
          >
            <Text style={styles.settingsButtonText}>Open Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.retryButton}
            onPress={requestPermission}
            accessibilityRole="button"
            accessibilityLabel="Retry permission request"
          >
            <Text style={styles.retryButtonText}>Retry Permission</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.deniedBackButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back to landing screen"
        >
          <Text style={styles.deniedBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash((current) => (current === 'off' ? 'on' : 'off'));
  };

  const capturePhoto = async () => {
    if (cameraRef.current && !isCapturing) {
      setIsCapturing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.85,
        });
        if (photo?.uri) {
          router.push({
            pathname: '/ai/prescription-scanner/preview',
            params: { uri: photo.uri },
          });
        }
      } catch (error) {
        console.error('Failed to take picture:', error);
      } finally {
        setIsCapturing(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
      >
        {/* Full screen layout overlays */}
        <View style={styles.overlay}>
          {/* Header Row */}
          <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Capture Prescription</Text>
            <View style={styles.headerButtonPlaceholder} />
          </View>

          {/* Transparent view finder framing helper */}
          <View style={styles.viewFinderContainer}>
            <View style={styles.viewFinderFrame} />
            <Text style={styles.frameInstruction}>Align document within the frame</Text>
          </View>

          {/* Bottom Control Actions */}
          <View style={[styles.controlsContainer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            {/* Flash toggle (Left) */}
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={toggleFlash}
              accessibilityRole="button"
              accessibilityLabel={`Turn flash ${flash === 'off' ? 'on' : 'off'}`}
            >
              {flash === 'on' ? (
                <Zap size={24} color="#FBBF24" />
              ) : (
                <ZapOff size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            {/* Capture Button (Center) */}
            <TouchableOpacity 
              style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
              onPress={capturePhoto}
              disabled={isCapturing}
              accessibilityRole="button"
              accessibilityLabel="Capture photo"
            >
              {isCapturing ? (
                <ActivityIndicator size="small" color="#2563EB" />
              ) : (
                <View style={styles.captureInnerCircle} />
              )}
            </TouchableOpacity>

            {/* Rotate Camera toggle (Right) */}
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={toggleFacing}
              accessibilityRole="button"
              accessibilityLabel="Switch front or back camera"
            >
              <RefreshCw size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  deniedContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  deniedCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deniedIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  deniedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  deniedDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  settingsButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  retryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },
  deniedBackButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  deniedBackButtonText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    height: 70,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonPlaceholder: {
    width: 44,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  viewFinderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewFinderFrame: {
    width: '85%',
    height: '60%',
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderRadius: 16,
    borderStyle: 'dashed',
  },
  frameInstruction: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingTop: 24,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureInnerCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
  },
});
