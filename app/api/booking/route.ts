import { NextResponse } from 'next/server';
import { loadSiteData } from '@/lib/loadData';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Simple in-memory sliding-window rate limiter: 10 requests per 60s per IP
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const ipMap = new Map<string, number[]>();

function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipMap.get(ip) || [];
  const recent = timestamps.filter(t => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    ipMap.set(ip, recent);
    return true;
  }
  recent.push(now);
  ipMap.set(ip, recent);
  return false;
}

export async function POST(req: Request) {
  const ip = getClientIP(req);
  if (isRateLimited(ip)) {
    console.log('[RATE LIMIT] Blocked booking from IP:', ip);
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }
  const { aptId, name, email, phone, guests, checkIn, checkOut, message, locale } = await req.json();

  if (!aptId || !name || !email || !checkIn || !checkOut)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  let property: any = {};
  try {
    property = await loadSiteData();
  } catch {}

  const apt = property.apartments?.find((a: any) => a.id === aptId);
  if (!apt) return NextResponse.json({ error: 'Apartment not found' }, { status: 404 });

  const hostEmail = property.property?.notificationEmail || property.property?.email || 'dekanic.lucija@gmail.com';
  console.log('[BOOKING] Sending to:', hostEmail, '| notificationEmail:', property.property?.notificationEmail, '| email:', property.property?.email);
  const secondaryEmail = property.property?.secondaryEmail;
  const toEmails = secondaryEmail ? [hostEmail, secondaryEmail] : [hostEmail];

  const rows = [
    ['Apartment', apt.name],
    ['Guest name', name],
    ['Email', email],
    ['Phone', phone || '—'],
    ['Guests', guests],
    ['Check-in', checkIn],
    ['Check-out', checkOut],
    ['Language', locale || 'en'],
    ['Message', message || '—'],
  ];

  const htmlBody = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto">
      <div style="background:#7d4c27;padding:28px 32px;border-radius:16px 16px 0 0">
        <h1 style="color:#f9f0e3;margin:0;font-size:22px;font-weight:400">📅 New Reservation Request</h1>
        <p style="color:#e8c99a;margin:6px 0 0;font-size:13px">${apt.name} · ${checkIn} → ${checkOut}</p>
      </div>
      <div style="background:#fdf9f3;padding:28px 32px;border:1px solid #e8c99a;border-top:none;border-radius:0 0 16px 16px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${rows.map(([k,v]) => `<tr><td style="padding:10px 12px;border-bottom:1px solid #f0e4d0;font-weight:600;color:#7d4c27;width:140px;vertical-align:top">${k}</td><td style="padding:10px 12px;border-bottom:1px solid #f0e4d0;color:#443932">${v}</td></tr>`).join('')}
        </table>
        <div style="margin-top:20px;padding:16px;background:#fff8f0;border-radius:10px;border:1px solid #e8c99a">
          <p style="margin:0;font-size:13px;color:#9a7a5a">Reply directly to this email to respond to ${name}. Their email is: <strong>${email}</strong></p>
        </div>
      </div>
    </div>`;

  const textBody = rows.map(([k,v]) => `${k}: ${v}`).join('\n');

  let sent = false;
  console.log('[EMAIL DEBUG] RESEND:', !!process.env.RESEND_API_KEY, '| WEB3FORMS:', !!process.env.WEB3FORMS_KEY, '| LEN:', (process.env.WEB3FORMS_KEY||'').length);

  // 1. Try Resend
  const RESEND = process.env.RESEND_API_KEY;
  const RESEND_OWNER = process.env.RESEND_OWNER_EMAIL || 'dekanic.karlo@gmail.com';
  if (RESEND && !sent) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Apartments Dekanić <onboarding@resend.dev>',
          to: [RESEND_OWNER, 'dekanic.lucija@gmail.com'],
          reply_to: email,
          subject: `📅 Booking Request — ${apt.name} | ${checkIn} → ${checkOut}`,
          html: htmlBody,
        }),
      });
      const resBody = await res.json().catch(() => ({}));
      console.log('[RESEND] status:', res.status, '| response:', JSON.stringify(resBody));
      if (res.ok) sent = true;
    } catch {}
  }

  // 2. Try Formspree (if configured)
  const FORMSPREE = process.env.FORMSPREE_ID;
  if (FORMSPREE && !sent) {
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, email, phone, guests, checkIn, checkOut, message, apartment: apt.name, _replyto: email }),
      });
      if (res.ok) sent = true;
    } catch {}
  }

  // 3. Web3Forms
  const W3F = process.env.WEB3FORMS_KEY;
  if (W3F) {
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: W3F,
          subject: `📅 Booking Request — ${apt.name} | ${checkIn} → ${checkOut}`,
          from_name: name,
          from_email: email,
          message: textBody,
          botcheck: '',
        }),
      });
      const w3fBody = await res.json().catch(() => ({}));
      console.log('[WEB3FORMS] status:', res.status, '| response:', JSON.stringify(w3fBody));
      if (res.ok) sent = true;
    } catch {}
  }

  console.log('[BOOKING REQUEST]', JSON.stringify({ aptId, name, email, checkIn, checkOut, guests, sent }));

  // CRM: Create guest profile and inquiry (fail silently)
  try {
    const siteData = await loadSiteData();
    const guests = siteData.guests || [];
    const inquiries = siteData.inquiries || [];
    
    // Check if guest already exists (case-insensitive email)
    const existingGuest = guests.find((g: any) => g.email.toLowerCase() === email.toLowerCase());
    let guestId: string;
    
    if (existingGuest) {
      guestId = existingGuest.id;
      // Add repeat tag if not already present
      if (!existingGuest.tags.includes('repeat')) {
        existingGuest.tags.push('repeat');
      }
    } else {
      // Create new guest profile
      guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const newGuest = {
        id: guestId,
        name,
        email,
        phone: phone || '',
        country: '', // Could be derived from locale
        tags: [],
        notes: '',
        createdAt: new Date().toISOString(),
        source: 'Direct'
      };
      guests.push(newGuest);
    }
    
    // Create inquiry
    const inquiryId = `inquiry_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newInquiry = {
      id: inquiryId,
      guestId,
      guestName: name,
      guestEmail: email,
      guestPhone: phone || '',
      apartmentId: aptId,
      checkIn,
      checkOut,
      guests,
      message: message || '',
      status: 'inquiry' as const,
      source: 'Direct',
      totalPrice: undefined,
      createdAt: new Date().toISOString(),
      notes: '',
      locale: locale || 'en'
    };
    inquiries.push(newInquiry);
    
    // Save updated data
    const updatedData = { ...siteData, guests, inquiries };
    const json = JSON.stringify(updatedData, null, 2);
    
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob');
      await put('dekanic/apartments.json', json, {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    } else {
      const { writeFile } = await import('fs/promises');
      await writeFile(path.join(process.cwd(), 'data', 'apartments.json'), json, 'utf-8');
    }
    
    console.log('[CRM] Created guest and inquiry:', guestId, inquiryId);
  } catch (error) {
    console.error('[CRM ERROR] Failed to create guest/inquiry:', error);
    // Fail silently - don't block booking confirmation
  }

  return NextResponse.json({ success: true, delivered: sent });
}