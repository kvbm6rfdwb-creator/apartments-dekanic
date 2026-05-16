import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Cache translations in memory to avoid redundant API calls
const translationCache = new Map<string, { messages: any; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Locale → Google language code map
const ALL_LOCALES = ['hr', 'de', 'it', 'fr', 'es', 'hu', 'cs', 'pl', 'sl'] as const;
type SupportedLocale = (typeof ALL_LOCALES)[number];

const GOOGLE_LANG_MAP: Record<SupportedLocale, string> = {
  hr: 'hr',
  de: 'de',
  it: 'it',
  fr: 'fr',
  es: 'es',
  hu: 'hu',
  cs: 'cs',
  pl: 'pl',
  sl: 'sl',
};

// Google Translate function
async function translateWithGoogle(
  texts: string[],
  targetLang: string,
  apiKey: string
): Promise<string[]> {
  const PLACEHOLDER_RE = /\{[^}]+\}/g;
  const protectedTexts = texts.map((t) =>
    t.replace(PLACEHOLDER_RE, (m) => `<span class="notranslate">${m}</span>`)
  );

  const params = new URLSearchParams({ key: apiKey, source: 'en', target: targetLang, format: 'html' });
  protectedTexts.forEach((t) => params.append('q', t));

  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2?${params.toString()}`,
    { method: 'GET' }
  );

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Google Translate API error ${res.status}: ${errorBody}`);
  }

  const data = await res.json();
  const translations: string[] = (
    data.data.translations as Array<{ translatedText: string }>
  ).map((t) => {
    return t.translatedText
      .replace(/<span class="notranslate">([^<]+)<\/span>/g, '$1')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  });

  return translations;
}

// JSON flatten / unflatten
function flattenObject(
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, string> {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null) {
        Object.assign(acc, flattenObject(value as Record<string, unknown>, fullKey));
      } else if (typeof value === 'string') {
        acc[fullKey] = value;
      }
      return acc;
    },
    {} as Record<string, string>
  );
}

function unflattenObject(flat: Record<string, string>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let current: Record<string, unknown> = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) current[parts[i]] = {};
      current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get('locale') || 'en';

  // Return English messages directly
  if (locale === 'en') {
    try {
      const raw = await readFile(path.join(process.cwd(), 'messages', 'en.json'), 'utf-8');
      return NextResponse.json(JSON.parse(raw));
    } catch {
      return NextResponse.json({ error: 'Could not read messages/en.json' }, { status: 500 });
    }
  }

  // Validate locale
  if (!ALL_LOCALES.includes(locale as SupportedLocale)) {
    return NextResponse.json({ error: `Unsupported locale: ${locale}` }, { status: 400 });
  }

  // Check cache
  const cached = translationCache.get(locale);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.messages);
  }

  const googleKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!googleKey) {
    return NextResponse.json(
      { error: 'GOOGLE_TRANSLATE_API_KEY is not set' },
      { status: 500 }
    );
  }

  try {
    // Read English source
    const raw = await readFile(path.join(process.cwd(), 'messages', 'en.json'), 'utf-8');
    const enMessages = JSON.parse(raw);

    const flatEn = flattenObject(enMessages);
    const keys = Object.keys(flatEn);
    const values = Object.values(flatEn);

    const googleLang = GOOGLE_LANG_MAP[locale as SupportedLocale];

    // Translate in chunks (Google supports up to 128 strings per request)
    const CHUNK_SIZE = 100;
    let translated: string[] = [];
    for (let i = 0; i < values.length; i += CHUNK_SIZE) {
      const chunk = values.slice(i, i + CHUNK_SIZE);
      const chunkResult = await translateWithGoogle(chunk, googleLang, googleKey);
      translated = translated.concat(chunkResult);
    }

    const flatTranslated: Record<string, string> = {};
    keys.forEach((k, i) => { flatTranslated[k] = translated[i]; });

    const nested = unflattenObject(flatTranslated);

    // Cache the result
    translationCache.set(locale, { messages: nested, timestamp: Date.now() });

    return NextResponse.json(nested);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Translation failed' },
      { status: 500 }
    );
  }
}
