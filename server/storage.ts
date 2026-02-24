// Storage using manus-upload-file CLI utility
// Uploads files to Manus S3 and returns public CDN URLs

import { randomBytes } from 'crypto';
import { writeFileSync, unlinkSync, mkdirSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const TEMP_DIR = '/tmp/manus-uploads';

// Ensure temp directory exists
try {
  mkdirSync(TEMP_DIR, { recursive: true });
} catch (err) {
  // Directory already exists
}

// Generate unique filename with random suffix
function generateFileName(originalName: string): string {
  const ext = originalName.split('.').pop() || 'bin';
  const randomSuffix = randomBytes(8).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${randomSuffix}.${ext}`;
}

/**
 * Upload file to Manus S3 via manus-upload-file CLI
 * @param relKey - Relative path/key for the file (e.g., "health/1/photo.jpg")
 * @param data - File data as Buffer, Uint8Array, or string
 * @param contentType - MIME type (not used by CLI, but kept for API compatibility)
 * @returns Object with key and public URL
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  // Normalize key and generate unique filename
  const normalizedKey = relKey.replace(/^\/+/, '');
  const pathParts = normalizedKey.split('/');
  const originalFileName = pathParts.pop() || 'file';
  const fileName = generateFileName(originalFileName);
  
  // Full storage key (used for reference)
  const key = normalizedKey.replace(originalFileName, fileName);
  
  // Convert data to Buffer
  const buffer = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data);
  
  // Write to temporary file
  const tempFilePath = join(TEMP_DIR, fileName);
  writeFileSync(tempFilePath, buffer);
  
  try {
    // Upload using manus-upload-file CLI
    const { stdout, stderr } = await execAsync(`manus-upload-file "${tempFilePath}"`);
    
    if (stderr && !stderr.includes('Uploading')) {
      console.error('[Storage] Upload stderr:', stderr);
    }
    
    // Extract URL from output (last line contains the URL)
    const lastLine = stdout.trim().split('\n').pop() || '';
    
    // Handle "CDN URL: https://..." format
    const url = lastLine.includes('CDN URL:') 
      ? lastLine.split('CDN URL:')[1].trim()
      : lastLine.trim();
    
    if (!url || !url.startsWith('http')) {
      throw new Error(`Invalid URL returned from manus-upload-file: ${lastLine}`);
    }
    
    console.log('[Storage] Upload successful:', { key, url });
    
    return { key, url };
  } catch (error: any) {
    console.error('[Storage] Upload failed:', error.message);
    throw new Error(`Failed to upload file: ${error.message}`);
  } finally {
    // Clean up temporary file
    try {
      unlinkSync(tempFilePath);
    } catch (err) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Get public URL for a file (not applicable for manus-upload-file)
 * Files uploaded via manus-upload-file are already public
 * @param relKey - Relative path/key for the file
 * @param expiresIn - Optional expiration time (not supported)
 * @returns Object with key and URL
 */
export async function storageGet(
  relKey: string,
  expiresIn?: number
): Promise<{ key: string; url: string }> {
  // For manus-upload-file, we can't retrieve URLs after upload
  // This function is mainly for API compatibility
  // In practice, you should store the URL returned from storagePut in your database
  throw new Error('storageGet is not supported with manus-upload-file. Store URLs from storagePut in your database.');
}
