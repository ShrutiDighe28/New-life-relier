import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

/**
 * Requests media library permission and launches the device image library.
 * Restricts selection to single image and validates JPG, JPEG, and PNG formats.
 * Returns the selected image URI, or null if canceled/denied.
 */
export async function pickPrescriptionImage(): Promise<string | null> {
  try {
    // 1. Request/Verify permissions
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    
    let permissionGranted = status === 'granted';
    
    if (!permissionGranted) {
      const requestResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      permissionGranted = requestResult.granted;
    }

    if (!permissionGranted) {
      Alert.alert(
        'Gallery Permission Required',
        'Life Relier needs gallery access to let you select a prescription image. Please enable it in Settings.',
        [{ text: 'OK' }]
      );
      return null;
    }

    // 2. Launch image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.85,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const selectedAsset = result.assets[0];
    
    // Check if file format is JPG, JPEG, or PNG
    const fileUri = selectedAsset.uri.toLowerCase();
    const isAcceptedFormat = fileUri.endsWith('.jpg') || fileUri.endsWith('.jpeg') || fileUri.endsWith('.png');

    const mimeType = selectedAsset.mimeType?.toLowerCase() || '';
    const isAcceptedMimeType = mimeType.includes('jpeg') || mimeType.includes('jpg') || mimeType.includes('png');

    if (!isAcceptedFormat && !isAcceptedMimeType) {
      Alert.alert(
        'Unsupported Format',
        'Please select a JPG, JPEG, or PNG prescription image.',
        [{ text: 'OK' }]
      );
      return null;
    }

    return selectedAsset.uri;
  } catch (error) {
    console.error('Failed to pick image from gallery:', error);
    Alert.alert('Error', 'An error occurred while opening the gallery.');
    return null;
  }
}
