import { readFile } from 'fs/promises';
import path from 'path';

export async function loadSiteData(): Promise<any> {
  // On Vercel: read from Blob storage (where admin saves to)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { list } = await import('@vercel/blob');
      const { blobs } = await list({
        prefix: 'dekanic/apartments.json',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      if (blobs.length > 0) {
        // Sort descending by uploadedAt to always get the latest version
        const latest = blobs.sort(
          (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        )[0];
        const res = await fetch(latest.url, { cache: 'no-store' });
        if (res.ok) {
          return await res.json();
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
