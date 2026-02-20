// Local filesystem storage for standalone deployment
// Stores files in uploads/ directory and serves via /uploads route

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { randomBytes } from 'crypto';

const UPLOADS_DIR = join(process.cwd(), 'uploads');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Ensure uploads directory exists
async function ensureUploadsDir() {
  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true });
  }
}

// Generate unique filename with random suffix
function generateFileName(originalName: string): string {
  const ext = originalName.split('.').pop() || 'bin';
  const randomSuffix = randomBytes(8).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${randomSuffix}.${ext}`;
}

/**
 * Upload file to local filesystem
 * @param relKey - Relative path/key for the file (e.g., "plants/photo.jpg")
 * @param data - File data as Buffer, Uint8Array, or string
 * @param contentType - MIME type (optional, not used in local storage)
 * @returns Object with key and public URL
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  await ensureUploadsDir();
  
  // Normalize key and generate unique filename
  const normalizedKey = relKey.replace(/^\/+/, '');
  const fileName = generateFileName(normalizedKey.split('/').pop() || 'file');
  
  // Create subdirectories if needed
  const subDir = dirname(normalizedKey);
  const fullDir = join(UPLOADS_DIR, subDir);
  if (!existsSync(fullDir)) {
    await mkdir(fullDir, { recursive: true });
  }
  
  // Write file
  const filePath = join(fullDir, fileName);
  const buffer = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data);
  await writeFile(filePath, buffer);
  
  // Return key and public URL
  const key = join(subDir, fileName).replace(/\\/g, '/');
  const url = `${BASE_URL}/uploads/${key}`;
  
  return { key, url };
}

/**
 * Get public URL for a file
 * @param relKey - Relative path/key for the file
 * @returns Object with key and public URL
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const normalizedKey = relKey.replace(/^\/+/, '');
  const url = `${BASE_URL}/uploads/${normalizedKey}`;
  
  return {
    key: normalizedKey,
    url,
  };
}
