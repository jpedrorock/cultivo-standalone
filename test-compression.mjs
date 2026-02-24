import fs from 'fs';
import { storagePut } from './server/storage.ts';

// Test compression with different image sizes
const testImages = [
  { name: 'small', path: '/home/ubuntu/test-image-small.jpg', size: '800x600' },
  { name: 'medium', path: '/home/ubuntu/test-image-medium.jpg', size: '1920x1080' },
  { name: 'large', path: '/home/ubuntu/test-image-large.jpg', size: '3840x2160' },
  { name: 'xlarge', path: '/home/ubuntu/test-image-xlarge.jpg', size: '5472x3648' }
];

console.log('=== Testing Image Compression ===\n');

for (const img of testImages) {
  const originalBuffer = fs.readFileSync(img.path);
  const originalSize = originalBuffer.length;
  
  console.log(`\n📸 ${img.name.toUpperCase()} (${img.size})`);
  console.log(`   Original: ${(originalSize / 1024).toFixed(2)} KB`);
  
  try {
    // Upload to storage (which will process and compress)
    const result = await storagePut(
      `test-compression/${img.name}.jpg`,
      originalBuffer,
      'image/jpeg'
    );
    
    // Read back the compressed file
    const compressedPath = result.key.replace(/^\//, '');
    const fullPath = `/home/ubuntu/cultivo-architecture-docs/${compressedPath}`;
    const compressedBuffer = fs.readFileSync(fullPath);
    const compressedSize = compressedBuffer.length;
    
    const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    
    console.log(`   Compressed: ${(compressedSize / 1024).toFixed(2)} KB`);
    console.log(`   Reduction: ${reduction}%`);
    console.log(`   ✅ Saved to: ${result.url}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

console.log('\n=== Compression Test Complete ===');
