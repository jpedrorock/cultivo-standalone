// Manus CDN storage using manus-upload-file CLI
// Uploads files to Manus CDN and returns public URLs

import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const TMP_DIR = '/tmp';

// Generate unique filename with random suffix
function generateFileName(originalName: string): string {
  const ext = originalName.split('.').pop() || 'bin';
  const randomSuffix = randomBytes(8).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${randomSuffix}.${ext}`;
}

/**
 * Upload file to Manus CDN
 * @param relKey - Relative path/key for the file (e.g., "plants/photo.jpg")
 * @param data - File data as Buffer, Uint8Array, or string
 * @param contentType - MIME type (optional, not used by manus-upload-file)
 * @returns Object with key and public CDN URL
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  console.log('[storagePut] Starting CDN upload:', { relKey, dataSize: data.length, contentType });
  
  // Generate unique filename
  const normalizedKey = relKey.replace(/^\/+/, '');
  const fileName = generateFileName(normalizedKey.split('/').pop() || 'file');
  const tmpFilePath = join(TMP_DIR, fileName);
  
  try {
    // Write to temporary file
    console.log('[storagePut] Writing to temp file:', tmpFilePath);
    const buffer = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data);
    await writeFile(tmpFilePath, buffer);
    
    // Upload to Manus CDN using CLI
    console.log('[storagePut] Uploading to Manus CDN...');
    const { stdout, stderr } = await execFileAsync('manus-upload-file', [tmpFilePath]);
    
    if (stderr) {
      console.error('[storagePut] CLI stderr:', stderr);
    }
    
    // Parse CDN URL from output (format: "CDN URL: https://...")
    const cdnUrlMatch = stdout.match(/CDN URL:\s*(https:\/\/[^\s]+)/);
    if (!cdnUrlMatch) {
      throw new Error(`Failed to parse CDN URL from output: ${stdout}`);
    }
    
    const url = cdnUrlMatch[1].trim();
    console.log('[storagePut] Upload complete:', { key: normalizedKey, url });
    
    // Clean up temp file
    await unlink(tmpFilePath);
    
    return { key: normalizedKey, url };
  } catch (error) {
    // Clean up temp file on error
    try {
      await unlink(tmpFilePath);
    } catch {}
    
    console.error('[storagePut] Upload failed:', error);
    throw error;
  }
}

/**
 * Get public URL for a file (not applicable for CDN storage)
 * @param relKey - Relative path/key for the file
 * @returns Object with key and empty URL (CDN URLs are generated at upload time)
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  console.warn('[storageGet] Not supported for CDN storage - URLs are generated at upload time');
  return {
    key: relKey,
    url: '', // CDN URLs are generated at upload time, not retrievable later
  };
}
