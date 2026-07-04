import { readFile } from 'fs/promises';
import path from 'path';

export async function loadSiteData(): Promise<any> {
  // On Vercel: read from Blob storage (where admin saves to)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { head } = await import('@vercel/blob');
      // head() resolves the exact public URL for this pathname without listing
      const blob = await head('dekanic/apartments.json', {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      const res = await fetch(blob.url, { cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[loadSiteData] Blob read failed, falling back to local file:', e);
    }
  }

  // Local development fallback: read from data/apartments.json
  const raw = await readFile(path.join(process.cwd(), 'data', 'apartments.json'), 'utf-8');
  return JSON.parse(raw);
}
