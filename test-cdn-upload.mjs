import { storagePut } from './server/storage.ts';
import { readFile } from 'fs/promises';

// Read test image
const imageData = await readFile('/home/ubuntu/test-image-large.jpg');
console.log(`[Test] Image loaded: ${imageData.length} bytes`);

// Upload to CDN
try {
  const result = await storagePut('health/test/test-cdn-photo.jpg', imageData, 'image/jpeg');
  console.log('[Test] Upload successful!');
  console.log('[Test] Key:', result.key);
  console.log('[Test] URL:', result.url);
} catch (error) {
  console.error('[Test] Upload failed:', error.message);
  process.exit(1);
}
