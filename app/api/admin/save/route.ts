import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { readFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function isAuthenticated(req: Request): Promise<boolean> {
  const cookieHeader = req.headers.get('cookie') || '';
  try {
    const setup = JSON.parse(await readFile(path.join(process.cwd(), 'data', 'setup.json'), 'utf-8'));
    const secret = process.env.ADMIN_SESSION_SECRET || 'dekanic_admin_2024';
    return cookieHeader.includes(`admin_session=${setup.password}_${secret}`);
  } catch {}
  const secret = process.env.ADMIN_SESSION_SECRET || 'dekanic_admin_2024';
  const pw = process.env.ADMIN_PASSWORD || '';
  return cookieHeader.includes(`admin_session=${pw}_${secret}`);
}

export async function POST(req: Request) {
  if (!(await isAuthenticated(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const data = await req.json();
    const json = JSON.stringify(data, null, 2);

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put('dekanic/apartments.json', json, {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      console.log('[SAVE] Blob stored at:', blob.url);
      return NextResponse.json({ success: true, url: blob.url });
    } else {
      const { writeFile } = await import('fs/promises');
      await writeFile(path.join(process.cwd(), 'data', 'apartments.json'), json, 'utf-8');
      return NextResponse.json({ success: true });
    }
  } catch (e: any) {
    console.error('[SAVE ERROR]', e?.message);
    return NextResponse.json({ error: e?.message || 'Failed to save' }, { status: 500 });
  }
}
