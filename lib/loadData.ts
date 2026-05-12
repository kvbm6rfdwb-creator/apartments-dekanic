import { readFile } from 'fs/promises';
import path from 'path';

export async function loadSiteData(): Promise<any> {
  // Production: read from Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { head } = await import('@vercel/blob');
      const blob = await head('dekanic/apartments.json', {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      // Fetch with Authorization header — routes to Vercel origin, bypassing CDN cache
      const res = await fetch(blob.url, {
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
          'Cache-Control': 'no-cache, no-store',
        },
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('[loadSiteData] Blob read failed, falling back to file:', e);
    }
  }
  // Local dev or fallback: read from filesystem
  const raw = await readFile(path.join(process.cwd(), 'data', 'apartments.json'), 'utf-8');
  return JSON.parse(raw);
}
