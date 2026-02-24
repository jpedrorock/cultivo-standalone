import { readFileSync } from 'fs';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
// Use native fetch (Node 18+)

// Create tRPC client
const client = createTRPCProxyClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
      // fetch is global in Node 18+
      transformer: superjson,
    }),
  ],
});

async function testPhotoUpload() {
  try {
    console.log('Reading test photo...');
    const photoBuffer = readFileSync('/tmp/test-photo.jpg');
    const photoBase64 = `data:image/jpeg;base64,${photoBuffer.toString('base64')}`;
    
    console.log(`Photo size: ${photoBuffer.length} bytes`);
    console.log(`Base64 length: ${photoBase64.length} chars`);
    
    console.log('\nCreating health log with photo...');
    const result = await client.plantHealth.create.mutate({
      plantId: 90001,
      healthStatus: 'HEALTHY',
      symptoms: 'Teste de upload de foto via script',
      photoBase64
    });
    
    console.log('\n✅ Success! Health log created:');
    console.log(`  ID: ${result.id}`);
    console.log(`  Photo URL: ${result.photoUrl || 'NONE'}`);
    console.log(`  Photo Key: ${result.photoKey || 'NONE'}`);
    
    if (result.photoUrl) {
      console.log(`\n🎉 Photo uploaded successfully!`);
      console.log(`   View at: http://localhost:3000${result.photoUrl}`);
    } else {
      console.log(`\n❌ Photo upload failed - no URL returned`);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.data) {
      console.error('   Data:', error.data);
    }
  }
}

testPhotoUpload();
