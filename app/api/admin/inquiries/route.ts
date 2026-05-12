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
    const inquiries = data.inquiries || [];
    const guests = data.guests || [];
    
    // Join inquiries with guest profiles
    const inquiriesWithGuests = inquiries.map((inquiry: any) => {
      const guest = guests.find((g: any) => g.id === inquiry.guestId);
      return {
        ...inquiry,
        guest: guest || null
      };
    });
    
    return NextResponse.json(inquiriesWithGuests);
  } catch (error) {
    console.error('[INQUIRIES GET ERROR]', error);
    return NextResponse.json({ error: 'Failed to load inquiries' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAuthenticated(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const inquiryData = await req.json();
    const data = await loadSiteData();
    const inquiries = data.inquiries || [];
    
    // Check if updating existing inquiry
    if (inquiryData.id) {
      const index = inquiries.findIndex((i: any) => i.id === inquiryData.id);
      if (index !== -1) {
        inquiries[index] = { ...inquiries[index], ...inquiryData };
      } else {
        return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
      }
    } else {
      // Create new inquiry
      const newInquiry = {
        id: `inquiry_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        guestId: inquiryData.guestId || '',
        guestName: inquiryData.guestName || '',
        guestEmail: inquiryData.guestEmail || '',
        guestPhone: inquiryData.guestPhone || '',
        apartmentId: inquiryData.apartmentId || '',
        checkIn: inquiryData.checkIn || '',
        checkOut: inquiryData.checkOut || '',
        guests: inquiryData.guests || 1,
        message: inquiryData.message || '',
        status: inquiryData.status || 'inquiry',
        source: inquiryData.source || 'Direct',
        totalPrice: inquiryData.totalPrice,
        createdAt: new Date().toISOString(),
        notes: inquiryData.notes || '',
        locale: inquiryData.locale || 'en'
      };
      inquiries.push(newInquiry);
    }
    
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
      console.log('[INQUIRIES SAVE] Blob stored at:', blob.url);
    } else {
      await writeFile(path.join(process.cwd(), 'data', 'apartments.json'), json, 'utf-8');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[INQUIRIES POST ERROR]', error);
    return NextResponse.json({ error: 'Failed to save inquiry' }, { status: 500 });
  }
}
