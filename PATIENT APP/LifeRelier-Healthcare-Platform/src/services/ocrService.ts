import { Platform } from 'react-native';

export interface OcrResult {
  fullText: string;
  blocks: any[];
  lines: string[];
}

/**
 * Universal OCR service interface.
 * Routes dynamically to Tesseract.js on Web and Google ML Kit on Native platforms.
 */
export async function extractText(imageUri: string): Promise<OcrResult> {
  if (Platform.OS === 'web') {
    // Dynamically load web implementation to avoid importing native modules in browser bundle
    const webService = require('./ocrService.web');
    return webService.extractText(imageUri);
  } else {
    // Dynamically load native implementation to avoid browser dependency issues in native bundles
    const nativeService = require('./ocrService.native');
    return nativeService.extractText(imageUri);
  }
}
