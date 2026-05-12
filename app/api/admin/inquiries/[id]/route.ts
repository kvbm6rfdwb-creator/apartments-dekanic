import { NextResponse } from 'next/server';
import { loadSiteData } from '@/lib/loadData';
import { put } from '@vercel/blob';
import { readFile, writeFile } from 'fs/promises';
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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const { id } = await params;
    const updates = await req.json();
    const data = await loadSiteData();
    const inquiries = data.inquiries || [];
    
    const index = inquiries.findIndex((i: any) => i.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }
    
    // Update only allowed fields
    const allowedFields = ['status', 'notes', 'totalPrice'];
    const filteredUpdates: any = {};
    
    for (const field of allowedFields) {
      if (field in updates) {
        filteredUpdates[field] = updates[field];
      }
    }
    
    inquiries[index] = { ...inquiries[index], ...filteredUpdates };
    
    // Save updated data
    const updatedData = { ...data, inquiries };
    const json = JSON.stringify(updatedData, null, 2);
    
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put('dekanic/apartments.json', json, {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      console.log('[INQUIRY PATCH] Blob stored at:', blob.url);
    } else {
      await writeFile(path.join(process.cwd(), 'data', 'apartments.json'), json, 'utf-8');
    }
    
    return NextResponse.json({ success: true, inquiry: inquiries[index] });
  } catch (error) {
    console.error('[INQUIRY PATCH ERROR]', error);
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
  }
}
