import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLACE_ID = process.env.GOOGLE_PLACE_ID || '';
const API_KEY  = process.env.GOOGLE_PLACES_API_KEY || '';

export async function GET() {
  const results: Record<string, any> = {
    env: {
      GOOGLE_PLACE_ID: PLACE_ID ? `${PLACE_ID.slice(0, 8)}...` : 'MISSING',
      GOOGLE_PLACES_API_KEY: API_KEY ? `${API_KEY.slice(0, 8)}...` : 'MISSING',
    },
    newAPI: null,
    legacyAPI: null,
  };

  // Test new Places API v1
  try {
    const url = `https://places.googleapis.com/v1/places/${PLACE_ID}?languageCode=en`;
    const res = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'reviews,rating,userRatingCount',
      },
      cache: 'no-store',
    });
    const body = await res.json();
    results.newAPI = { status: res.status, body };
  } catch (e: any) {
    results.newAPI = { error: e.message };
  }

  // Test legacy Places API
  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${PLACE_ID}&fields=reviews,rating,user_ratings_total&language=en&key=${API_KEY}`;
    const res = await fetch(url, { cache: 'no-store' });
    const body = await res.json();
    results.legacyAPI = { status: res.status, body };
  } catch (e: any) {
    results.legacyAPI = { error: e.message };
  }

  return NextResponse.json(results, {
    headers: { 'Content-Type': 'application/json' },
  });
}
