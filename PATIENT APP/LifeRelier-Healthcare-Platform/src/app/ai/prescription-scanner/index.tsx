import React from 'react';
import { ScrollView, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../../../components/prescription/Header';
import HeroSection from '../../../components/prescription/HeroSection';
import UploadCard from '../../../components/prescription/UploadCard';
import ActionButtons from '../../../components/prescription/ActionButtons';
import FeatureCards from '../../../components/prescription/FeatureCards';
import SecurityCard from '../../../components/prescription/SecurityCard';
import { COLORS } from '@/constants/theme';
import { pickPrescriptionImage } from '@/services/galleryService';

export default function PrescriptionScannerScreen() {
  const router = useRouter();

  const handleUploadPress = () => {
    router.push('/ai/prescription-scanner/camera');
  };

  const handleCapturePress = () => {
    router.push('/ai/prescription-scanner/camera');
  };

  const handleGalleryPress = async () => {
    const selectedUri = await pickPrescriptionImage();
    if (selectedUri) {
      router.push({
        pathname: '/ai/prescription-scanner/preview',
        params: { uri: selectedUri },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeroSection />
        <UploadCard onPress={handleUploadPress} />
        <ActionButtons 
          onCapturePress={handleCapturePress}
          onGalleryPress={handleGalleryPress}
        />
        <FeatureCards />
        <SecurityCard />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
