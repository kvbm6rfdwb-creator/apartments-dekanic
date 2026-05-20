import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory cache: key = `${locale}::${hash}` → translated string
const cache = new Map<string, { value: string; ts: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 h

const GOOGLE_LANG_MAP: Record<string, string> = {
  hr: 'hr', de: 'de', it: 'it', fr: 'fr', es: 'es',
  hu: 'hu', cs: 'cs', pl: 'pl', sl: 'sl', en: 'en',
};

/**
 * POST /api/translate-content
 * Body: { texts: string[], locale: string }
 * Returns: { translations: string[] }
 *
 * - source language is auto-detected by Google (no hardcoded 'en')
 * - results are cached 24 h per locale+text combination
 */
export async function POST(req: Request) {
  try {
    const { texts, locale } = (await req.json()) as { texts: string[]; locale: string };

    if (!texts?.length || !locale) {
      return NextResponse.json({ error: 'Missing texts or locale' }, { status: 400 });
    }

    const targetLang = GOOGLE_LANG_MAP[locale];
    if (!targetLang) {
      return NextResponse.json({ error: `Unsupported locale: ${locale}` }, { status: 400 });
    }

    // For English just return as-is
    if (targetLang === 'en') {
      return NextResponse.json({ translations: texts });
    }

    const googleKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!googleKey) {
      // Graceful degradation – return originals
      return NextResponse.json({ translations: texts });
    }

    // Check cache for each text; only call API for misses
    const results: string[] = new Array(texts.length);
    const missingIndexes: number[] = [];
    const missingTexts: string[] = [];

    texts.forEach((text, i) => {
      const cacheKey = `${locale}::${text}`;
      const hit = cache.get(cacheKey);
      if (hit && Date.now() - hit.ts < CACHE_TTL) {
        results[i] = hit.value;
      } else {
        missingIndexes.push(i);
        missingTexts.push(text);
      }
    });

    if (missingTexts.length > 0) {
      // source omitted → Google auto-detects the input language
      const params = new URLSearchParams({
        key: googleKey,
        target: targetLang,
        format: 'text',
      });
      missingTexts.forEach(t => params.append('q', t));

      const res = await fetch(
        `https://translation.googleapis.com/language/translate/v2?${params.toString()}`,
        { method: 'GET' }
      );

      if (!res.ok) {
        const err = await res.text();
        console.error('Google Translate error:', err);
        // Graceful degradation – fill missing with originals
        missingIndexes.forEach((origIdx, j) => { results[origIdx] = missingTexts[j]; });
      } else {
        const data = await res.json();
        const translated: string[] = (data.data.translations as Array<{ translatedText: string }>)
          .map(t => t.translatedText
            .replace(/&amp;/g, '&')
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
          );

        missingIndexes.forEach((origIdx, j) => {
          results[origIdx] = translated[j];
          cache.set(`${locale}::${missingTexts[j]}`, { value: translated[j], ts: Date.now() });
        });
      }
    }

    return NextResponse.json({ translations: results });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Translation failed' }, { status: 500 });
  }
}
