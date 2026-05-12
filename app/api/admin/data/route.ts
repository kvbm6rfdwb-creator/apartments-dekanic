import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { loadSiteData } from '@/lib/loadData';

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

export async function GET(req: Request) {
  if (!(await isAuthenticated(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const data = await loadSiteData();
    return NextResponse.json(data);
  } catch (e: any) {
    console.error('[DATA READ ERROR]', e?.message);
    return NextResponse.json({ error: 'Could not read data' }, { status: 500 });
  }
}
