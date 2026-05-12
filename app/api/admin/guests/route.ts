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

export async function GET(req: Request) {
  if (!(await isAuthenticated(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const data = await loadSiteData();
    const guests = data.guests || [];
    return NextResponse.json(guests);
  } catch (error) {
    console.error('[GUESTS GET ERROR]', error);
    return NextResponse.json({ error: 'Failed to load guests' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAuthenticated(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const guestData = await req.json();
    const data = await loadSiteData();
    const guests = data.guests || [];
    
    // Check if updating existing guest
    if (guestData.id) {
      const index = guests.findIndex((g: any) => g.id === guestData.id);
      if (index !== -1) {
        guests[index] = { ...guests[index], ...guestData };
      } else {
        return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
      }
    } else {
      // Create new guest
      const newGuest = {
        id: `guest_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: guestData.name || '',
        email: guestData.email || '',
        phone: guestData.phone || '',
        country: guestData.country || '',
        tags: guestData.tags || [],
        notes: guestData.notes || '',
        createdAt: new Date().toISOString(),
        source: guestData.source || 'Direct'
      };
      guests.push(newGuest);
    }
    
    // Save updated data
    const updatedData = { ...data, guests };
    const json = JSON.stringify(updatedData, null, 2);
    
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put('dekanic/apartments.json', json, {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      console.log('[GUESTS SAVE] Blob stored at:', blob.url);
    } else {
      await writeFile(path.join(process.cwd(), 'data', 'apartments.json'), json, 'utf-8');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[GUESTS POST ERROR]', error);
    return NextResponse.json({ error: 'Failed to save guest' }, { status: 500 });
  }
}
