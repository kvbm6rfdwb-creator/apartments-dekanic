import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLACE_ID = process.env.GOOGLE_PLACE_ID || '';
const API_KEY  = process.env.GOOGLE_PLACES_API_KEY || '';

let cache: { reviews: any[]; fetchedAt: number } | null = null;
const CACHE_TTL = 24 * 60 * 60 * 1000;

async function fetchViaNewAPI(): Promise<any[]> {
  // New Places API v1 — works with both "ChIJ..." and "places/ChIJ..." IDs
  const placeId = PLACE_ID.startsWith('places/') ? PLACE_ID : PLACE_ID;
  const url = `https://places.googleapis.com/v1/places/${placeId}?languageCode=en`;

  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'reviews,rating,userRatingCount',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`New API ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.reviews || [];
}

async function fetchViaLegacyAPI(): Promise<any[]> {
  // Legacy Places API — more permissive, works with all ChIJ place IDs
  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${PLACE_ID}&fields=reviews,rating,user_ratings_total&language=en&key=${API_KEY}`;

  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Legacy API ${res.status}: ${text}`);
  }

  const data = await res.json();

  if (data.status !== 'OK') {
    throw new Error(`Legacy API status: ${data.status} — ${data.error_message || ''}`);
  }

  return data.result?.reviews || [];
}

function normaliseNew(raw: any[]): any[] {
  return raw
    .map((r: any, i: number) => ({
      id: `google_${i}`,
      author:   r.authorAttribution?.displayName || 'Google Guest',
      rating:   r.rating ?? 5,
      date:     r.publishTime ? r.publishTime.slice(0, 10) : '',
      text:     r.text?.text || r.originalText?.text || '',
      photoUri: r.authorAttribution?.photoUri || '',
    }))
    .filter((r: any) => r.text.trim().length > 0);
}

function normaliseLegacy(raw: any[]): any[] {
  return raw
    .map((r: any, i: number) => ({
      id: `google_${i}`,
      author:   r.author_name || 'Google Guest',
      rating:   r.rating ?? 5,
      date:     r.time ? new Date(r.time * 1000).toISOString().slice(0, 10) : '',
      text:     r.text || '',
      photoUri: r.profile_photo_url || '',
    }))
    .filter((r: any) => r.text.trim().length > 0);
}

export async function GET() {
  if (!PLACE_ID || !API_KEY) {
    console.error('[Google Reviews] Missing GOOGLE_PLACE_ID or GOOGLE_PLACES_API_KEY env vars');
    return NextResponse.json({ reviews: [], error: 'not_configured' });
  }

  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return NextResponse.json({ reviews: cache.reviews, cached: true });
  }

  // Try new Places API v1 first, fall back to legacy
  let reviews: any[] = [];
  let lastError = '';

  try {
    const raw = await fetchViaNewAPI();
    reviews = normaliseNew(raw);
    console.log(`[Google Reviews] New API OK — ${reviews.length} reviews`);
  } catch (e: any) {
    console.warn('[Google Reviews] New API failed, trying legacy:', e.message);
    lastError = e.message;

    try {
      const raw = await fetchViaLegacyAPI();
      reviews = normaliseLegacy(raw);
      console.log(`[Google Reviews] Legacy API OK — ${reviews.length} reviews`);
    } catch (e2: any) {
      console.error('[Google Reviews] Both APIs failed:', e2.message);
      lastError = e2.message;
    }
  }

  if (reviews.length > 0) {
    cache = { reviews, fetchedAt: Date.now() };
    return NextResponse.json({ reviews });
  }

  // Both failed or returned 0 reviews
  return NextResponse.json({ reviews: [], error: lastError || 'no_reviews' });
}
