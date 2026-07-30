/**
 * fileReader.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Safe, modern file reading utility for Expo SDK 56.
 * Uses modern `File` from 'expo-file-system' with fallback to 'expo-file-system/legacy'.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { File } from 'expo-file-system';
import * as LegacyFileSystem from 'expo-file-system/legacy';

export interface FileMetadata {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

/**
 * Reads a file URI as a Base64 encoded string.
 * Supports file:// and content:// URIs from DocumentPicker, ImagePicker, and Camera.
 */
export async function readFileAsBase64(uri: string): Promise<string> {
  if (!uri) {
    throw new Error('Invalid file URI provided.');
  }

  // 1. Try modern Expo FileSystem API (SDK 56+)
  try {
    const file = new File(uri);
    // If modern File API supports base64 method directly
    if (typeof (file as any).base64 === 'function') {
      const b64 = await (file as any).base64();
      if (b64 && typeof b64 === 'string') {
        console.log('[fileReader] Successfully read file using modern File.base64()');
        return b64;
      }
    }
    // Try arrayBuffer -> Base64
    if (typeof file.arrayBuffer === 'function') {
      const buffer = await file.arrayBuffer();
      if (buffer && buffer.byteLength > 0) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        const len = bytes.byteLength;
        // Chunk to avoid maximum call stack size exceeded
        const chunkSize = 0x8000;
        for (let i = 0; i < len; i += chunkSize) {
          const sub = bytes.subarray(i, Math.min(i + chunkSize, len));
          binary += String.fromCharCode.apply(null, Array.from(sub));
        }
        const b64 = btoa(binary);
        console.log('[fileReader] Successfully read file using File.arrayBuffer()');
        return b64;
      }
    }
  } catch (modernErr) {
    console.warn('[fileReader] Modern File API read failed, falling back to legacy FileSystem:', modernErr);
  }

  // 2. Fallback to Legacy FileSystem readAsStringAsync
  try {
    const b64 = await LegacyFileSystem.readAsStringAsync(uri, {
      encoding: LegacyFileSystem.EncodingType.Base64,
    });
    if (!b64) {
      throw new Error('File read returned empty content.');
    }
    console.log('[fileReader] Successfully read file using LegacyFileSystem.readAsStringAsync');
    return b64;
  } catch (legacyErr: any) {
    console.error('[fileReader] Legacy FileSystem read error:', legacyErr);
    throw new Error(`Failed to read file contents: ${legacyErr?.message || 'File inaccessible'}`);
  }
}

/**
 * Gets file size in bytes using modern File or Legacy FileSystem.
 */
export async function getFileSize(uri: string): Promise<number> {
  try {
    const file = new File(uri);
    if (typeof file.size === 'number' && file.size > 0) {
      return file.size;
    }
  } catch (_) {
    // fallback
  }

  try {
    const info = await LegacyFileSystem.getInfoAsync(uri);
    if (info.exists && !info.isDirectory) {
      return info.size ?? 0;
    }
  } catch (_) {
    // ignore
  }

  return 0;
}
