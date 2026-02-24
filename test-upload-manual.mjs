// Manual test to reproduce photo upload issue
import { storagePut } from './server/storage.ts';

async function testUpload() {
  try {
    console.log('Testing photo upload...');
    
    // Create a small test image (1x1 red pixel PNG)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
    const buffer = Buffer.from(testImageBase64, 'base64');
    
    console.log('Buffer size:', buffer.length, 'bytes');
    
    const result = await storagePut('health/90001/test.jpg', buffer, 'image/jpeg');
    
    console.log('✅ Upload successful!');
    console.log('Key:', result.key);
    console.log('URL:', result.url);
  } catch (error) {
    console.error('❌ Upload failed:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testUpload();
