import { NextResponse } from 'next/server';
import { loadSiteData } from '@/lib/loadData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const googleCache = new Map<string, { reviews: any[]; fetchedAt: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

const LANGS = ['en', 'hr', 'de', 'cs', 'es', 'fr', 'it', 'pl', 'hu'];

async function fetchGoogleReviews(locale: string = 'en'): Promise<any[]> {
  const PLACE_ID = process.env.GOOGLE_PLACE_ID || '';
  const API_KEY  = process.env.GOOGLE_PLACES_API_KEY || '';
  if (!PLACE_ID || !API_KEY) return [];

  // Cache key includes locale
  const cacheKey = `${locale}`;
  const cached = googleCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.reviews;
  }

  try {
    // Fetch reviews in the requested locale first, then fall back to other languages for more coverage
    const primaryLang = LANGS.includes(locale) ? locale : 'en';
    const fallbackLangs = LANGS.filter(l => l !== primaryLang);
    
    const responses = await Promise.all([
      // Primary language request
      fetch(`https://places.googleapis.com/v1/places/${PLACE_ID}?fields=reviews,rating,userRatingCount&languageCode=${primaryLang}`, {
        headers: { 'X-Goog-Api-Key': API_KEY, 'X-Goog-FieldMask': 'reviews,rating,userRatingCount' },
        cache: 'no-store',
      }).then(r => r.ok ? r.json() : { reviews: [] }),
      // Fallback languages for more coverage
      ...fallbackLangs.slice(0, 3).map(lang =>
        fetch(`https://places.googleapis.com/v1/places/${PLACE_ID}?fields=reviews,rating,userRatingCount&languageCode=${lang}`, {
          headers: { 'X-Goog-Api-Key': API_KEY, 'X-Goog-FieldMask': 'reviews,rating,userRatingCount' },
          cache: 'no-store',
        }).then(r => r.ok ? r.json() : { reviews: [] })
      )
    ]);

    const allRaw = responses.flatMap((d: any) => d.reviews || []);

    // Deduplicate by author name + text hash (same person, different language = same review)
    const seen = new Set<string>();
    const unique = allRaw.filter((r: any) => {
      const author = r.authorAttribution?.displayName || '';
      const text = (r.text?.text || r.originalText?.text || '').trim().slice(0, 60);
      const key = `${author}::${text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const reviews = unique
      .filter((r: any) => {
        const text = r.text?.text || r.originalText?.text || '';
        return text.trim().length > 0;
      })
      .map((r: any, i: number) => ({
        id:        `google_live_${i}`,
        author:    r.authorAttribution?.displayName || 'Google Guest',
        country:   '',
        rating:    r.rating ?? 5,
        date:      r.publishTime ? r.publishTime.slice(0, 10) : new Date().toISOString().slice(0, 10),
        text:      r.text?.text || r.originalText?.text || '',
        platform:  'Google',
        apartment: '',
        photoUri:  r.authorAttribution?.photoUri || '',
        source:    'live',
      }));

    googleCache.set(cacheKey, { reviews, fetchedAt: Date.now() });
    return reviews;
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get('locale') || 'en';
  
  try {
    const [siteData, googleReviews] = await Promise.all([
      loadSiteData(),
      fetchGoogleReviews(locale),
    ]);

    const manualReviews: any[] = siteData.reviews || [];
    const manualGoogleAuthors = new Set(
      manualReviews.filter((r: any) => r.platform === 'Google').map((r: any) => r.author.trim())
    );

    const newGoogleReviews = googleReviews.filter(
      (r: any) => !manualGoogleAuthors.has(r.author.trim())
    );

    const mergedReviews = [...manualReviews, ...newGoogleReviews]
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      ...siteData,
      reviews: mergedReviews,
      _googleLiveCount: newGoogleReviews.length,
    });
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}
