import { readFile } from 'fs/promises';
import path from 'path';

export async function loadSiteData(): Promise<any> {
  // On Vercel: read from Blob storage (where admin saves to)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blobUrl = `https://blob.vercel-storage.com/dekanic/apartments.json`;
      // Use the Vercel Blob API to list and get the correct URL
      const { list } = await import('@vercel/blob');
      const { blobs } = await list({
        prefix: 'dekanic/apartments.json',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          return data;
        }
      }
    } catch (e) {
      console.warn('[loadSiteData] Blob read failed, falling back to local file:', e);
    }
  }

  // Local development fallback: read from data/apartments.json
  const raw = await readFile(path.join(process.cwd(), 'data', 'apartments.json'), 'utf-8');
  return JSON.parse(raw);
}
