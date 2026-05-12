import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLACE_ID  = process.env.GOOGLE_PLACE_ID  || '';
const API_KEY   = process.env.GOOGLE_PLACES_API_KEY || '';

// Cache in-memory for 24h so we don't burn API quota on every page load
let cache: { reviews: any[]; fetchedAt: number } | null = null;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  if (!PLACE_ID || !API_KEY) {
    return NextResponse.json({ reviews: [], error: 'Google Places not configured' });
  }

  // Return cache if still fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return NextResponse.json({ reviews: cache.reviews, cached: true });
  }

  try {
    const url =
      `https://places.googleapis.com/v1/places/${PLACE_ID}` +
      `?fields=reviews,rating,userRatingCount` +
      `&languageCode=en`;

    const res = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'reviews,rating,userRatingCount',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Google Reviews] API error:', res.status, errText);
      return NextResponse.json({ reviews: [], error: `API error ${res.status}` }, { status: 200 });
    }

    const data = await res.json();
    const raw: any[] = data.reviews || [];

    // Normalise to our internal Review shape
    const reviews = raw.map((r: any, i: number) => ({
      id: `google_${i}_${Date.now()}`,
      author:    r.authorAttribution?.displayName || 'Google Guest',
      country:   '',                          // Google doesn't provide country
      rating:    r.rating ?? 5,              // 1–5 scale
      date:      r.publishTime
                   ? r.publishTime.slice(0, 10)
                   : new Date().toISOString().slice(0, 10),
      text:      r.text?.text || r.originalText?.text || '',
      platform:  'Google',
      apartment: '',
      photoUri:  r.authorAttribution?.photoUri || '',
    })).filter((r: any) => r.text.trim().length > 0);

    cache = { reviews, fetchedAt: Date.now() };
    return NextResponse.json({ reviews, placeRating: data.rating, totalRatings: data.userRatingCount });

  } catch (err: any) {
    console.error('[Google Reviews] Fetch failed:', err.message);
    return NextResponse.json({ reviews: [], error: err.message }, { status: 200 });
  }
}
