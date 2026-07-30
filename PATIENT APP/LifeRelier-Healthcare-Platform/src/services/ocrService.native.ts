import MlkitOcr from 'react-native-mlkit-ocr';

export interface OcrResult {
  fullText: string;
  blocks: any[];
  lines: string[];
}

/**
 * Native-specific OCR implementation using Google ML Kit.
 */
export async function extractText(imageUri: string): Promise<OcrResult> {
  try {
    console.log('[Native OCR] Attempting on-device ML Kit OCR for:', imageUri);
    
    // Check if native module is available
    if (!MlkitOcr || typeof MlkitOcr.detectFromUri !== 'function') {
      throw new Error('Native MlkitOcr module not available in this environment.');
    }

    const nativeResult = await MlkitOcr.detectFromUri(imageUri);
    
    if (!nativeResult || nativeResult.length === 0) {
      throw new Error('No text detected in the captured image.');
    }

    const lines: string[] = [];
    const blocks: any[] = [];

    // Parse blocks and lines
    nativeResult.forEach((block: any) => {
      blocks.push(block);
      if (block.lines) {
        block.lines.forEach((line: any) => {
          if (line.text) {
            lines.push(line.text);
          }
        });
      }
    });

    const fullText = lines.join('\n');

    return {
      fullText,
      blocks,
      lines,
    };
  } catch (error) {
    console.error('[Native OCR] ML Kit Extraction failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Native OCR text recognition failed.');
  }
}
