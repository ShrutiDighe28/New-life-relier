import { createWorker } from 'tesseract.js';

export interface OcrResult {
  fullText: string;
  blocks: any[];
  lines: string[];
}

/**
 * Web-specific OCR implementation using Tesseract.js.
 */
export async function extractText(imageUri: string): Promise<OcrResult> {
  console.log('[Web OCR] Running Tesseract.js on:', imageUri);
  try {
    // Initialize the Tesseract worker
    const worker = await createWorker('eng');
    
    const ret = await worker.recognize(imageUri);
    const fullText = ret.data.text;
    
    // Parse lines and blocks
    const lines = fullText.split('\n').filter(line => line.trim().length > 0);
    const blocks = ret.data.blocks?.map((block: any) => ({
      text: block.text,
      bounds: { width: 0, height: 0, top: 0, left: 0 }
    })) || [];
    
    await worker.terminate();

    if (!fullText || fullText.trim().length === 0) {
      throw new Error('Tesseract.js did not detect any text in the selected image.');
    }

    return {
      fullText,
      blocks,
      lines,
    };
  } catch (error: any) {
    console.error('[Web OCR] Tesseract.js failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Web OCR text recognition failed.');
  }
}
