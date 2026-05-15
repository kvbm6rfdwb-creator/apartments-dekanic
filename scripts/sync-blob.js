const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

async function syncBlob() {
  try {
    // Read current local data
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/apartments.json'), 'utf-8'));
    
    // Upload to Blob storage
    const blob = await put('dekanic/apartments.json', JSON.stringify(data, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    console.log('✅ Blob storage updated successfully:', blob.url);
    console.log('Reviews count:', data.reviews.length);
  } catch (error) {
    console.error('❌ Error syncing to Blob:', error.message);
    process.exit(1);
  }
}

syncBlob();
