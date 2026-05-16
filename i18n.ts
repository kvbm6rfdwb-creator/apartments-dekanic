import { getRequestConfig } from 'next-intl/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { routing } from './routing';

export const locales = routing.locales;
export type Locale = (typeof routing.locales)[number];
export const defaultLocale = routing.defaultLocale;

// ─── Google Translate helpers (duplicated from route.ts so getRequestConfig
//     can call them directly server-side — a relative fetch() has no base URL
//     in Next.js server context and always fails, causing every locale to
//     fall back to the static hr.json file). ────────────────────────────────

const GOOGLE_LANG_MAP: Record<string, string> = {
  hr: 'hr', de: 'de', it: 'it', fr: 'fr',
  es: 'es', hu: 'hu', cs: 'cs', pl: 'pl', sl: 'sl',
};

// In-process cache so repeated page renders don't re-hit the API
const _cache = new Map<string, { messages: unknown; ts: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 h

async function translateWithGoogle(
  texts: string[],
  targetLang: string,
  apiKey: string
): Promise<string[]> {
  const PLACEHOLDER_RE = /\{[^}]+\}/g;
  const protected_ = texts.map((t) =>
    t.replace(PLACEHOLDER_RE, (m) => `<span class="notranslate">${m}</span>`)
  );

  const params = new URLSearchParams({
    key: apiKey,
    source: 'en',
    target: targetLang,
    format: 'html',
  });
  protected_.forEach((t) => params.append('q', t));

  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2?${params.toString()}`,
    { method: 'GET' }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Translate API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return (data.data.translations as Array<{ translatedText: string }>).map((t) =>
    t.translatedText
      .replace(/<span class="notranslate">([^<]+)<\/span>/g, '$1')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
  );
}

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

async function getTranslatedMessages(locale: string): Promise<unknown> {
  // Check in-process cache first
  const cached = _cache.get(locale);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.messages;
  }

  const googleKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!googleKey) {
    throw new Error('GOOGLE_TRANSLATE_API_KEY is not set');
  }

  const raw = await readFile(path.join(process.cwd(), 'messages', 'en.json'), 'utf-8');
  const enMessages = JSON.parse(raw);

  const flatEn = flattenObject(enMessages);
  const keys = Object.keys(flatEn);
  const values = Object.values(flatEn);

  const targetLang = GOOGLE_LANG_MAP[locale];
  const CHUNK_SIZE = 100;
  let translated: string[] = [];
  for (let i = 0; i < values.length; i += CHUNK_SIZE) {
    const chunk = values.slice(i, i + CHUNK_SIZE);
    const result = await translateWithGoogle(chunk, targetLang, googleKey);
    translated = translated.concat(result);
  }

  const flatTranslated: Record<string, string> = {};
  keys.forEach((k, i) => { flatTranslated[k] = translated[i]; });

  const messages = unflattenObject(flatTranslated);
  _cache.set(locale, { messages, ts: Date.now() });
  return messages;
}

// ─── next-intl config ────────────────────────────────────────────────────────

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate locale — fall back to default
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  // Locales that have a static JSON file (no API call needed)
  const staticLocales = ['en', 'hr'];

  if (staticLocales.includes(locale)) {
    return {
      locale,
      messages: (await import(`./messages/${locale}.json`)).default,
    };
  }

  // All other locales: translate from English via Google Translate directly
  try {
    const messages = await getTranslatedMessages(locale);
    return { locale, messages };
  } catch (error) {
    console.error(`Failed to translate for locale "${locale}":`, error);
    // Fallback: try static file for this locale, then English
    try {
      return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default,
      };
    } catch {
      return {
        locale,
        messages: (await import(`./messages/en.json`)).default,
      };
    }
  }
});
