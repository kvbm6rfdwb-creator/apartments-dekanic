/**
 * POST /api/admin/translate
 *
 * Auto-translates messages/en.json into all other locales using the
 * Google Cloud Translation API (Basic / v2).
 *
 * ──────────────────────────────────────────────────────────────────
 * WHY GOOGLE TRANSLATE:
 *   • 500,000 characters FREE every month — resets automatically
 *   • No one-time credit, no expiry, no subscription needed
 *   • Supports all 9 locales used on this site
 *   • Simple REST API — no SDK needed
 *
 * HOW TO GET A FREE API KEY (takes ~3 minutes):
 *   1. Go to https://console.cloud.google.com
 *   2. Create a project (or use an existing one)
 *   3. Enable "Cloud Translation API"
 *      → APIs & Services → Library → search "Cloud Translation API" → Enable
 *   4. Create an API key
 *      → APIs & Services → Credentials → Create Credentials → API Key
 *   5. (Recommended) Restrict the key to "Cloud Translation API" only
 *   6. Add to Vercel env vars: GOOGLE_TRANSLATE_API_KEY=AIza...
 *
 * Required env vars:
 *   GOOGLE_TRANSLATE_API_KEY  — Google Cloud API key
 *   GITHUB_TOKEN              — GitHub PAT with repo write scope (optional;
 *                               falls back to local file write in dev mode)
 *   GITHUB_REPO               — e.g. "kvbm6rfdwb-creator/apartments-dekanic"
 *   GITHUB_BRANCH             — defaults to "main"
 *
 * Request body (all optional):
 *   { "locales": ["hr", "de"] }  — translate only specific locales
 *   {}                           — translate all 9 non-English locales
 * ──────────────────────────────────────────────────────────────────
 */

import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ─── Auth (same pattern as /api/admin/save) ───────────────────────────────────
async function isAuthenticated(req: Request): Promise<boolean> {
  const cookieHeader = req.headers.get('cookie') || '';
  try {
    const setup = JSON.parse(
      await readFile(path.join(process.cwd(), 'data', 'setup.json'), 'utf-8')
    );
    const secret = process.env.ADMIN_SESSION_SECRET || 'dekanic_admin_2024';
    return cookieHeader.includes(`admin_session=${setup.password}_${secret}`);
  } catch {}
  const secret = process.env.ADMIN_SESSION_SECRET || 'dekanic_admin_2024';
  const pw = process.env.ADMIN_PASSWORD || '';
  return cookieHeader.includes(`admin_session=${pw}_${secret}`);
}

// ─── Locale → Google language code map ───────────────────────────────────────
const ALL_LOCALES = ['hr', 'de', 'it', 'fr', 'es', 'hu', 'cs', 'pl', 'sl'] as const;
type SupportedLocale = (typeof ALL_LOCALES)[number];

// Google uses ISO 639-1 codes; most match our locale codes exactly.
const GOOGLE_LANG_MAP: Record<SupportedLocale, string> = {
  hr: 'hr', // Croatian
  de: 'de', // German
  it: 'it', // Italian
  fr: 'fr', // French
  es: 'es', // Spanish
  hu: 'hu', // Hungarian
  cs: 'cs', // Czech
  pl: 'pl', // Polish
  sl: 'sl', // Slovenian
};

// ─── Google Translate (REST v2, no SDK) ───────────────────────────────────────
/**
 * Translates an array of strings in a single batched API call.
 * Google's v2 API accepts up to 128 q[] params per request and
 * returns translations in the same order.
 *
 * Placeholders like {n}, {name} are protected by wrapping them in
 * <span translate="no"> tags before sending and unwrapping afterward.
 */
async function translateWithGoogle(
  texts: string[],
  targetLang: string,
  apiKey: string
): Promise<string[]> {
  // Protect i18n placeholders: {anything} → <span class="notranslate">{anything}</span>
  const PLACEHOLDER_RE = /\{[^}]+\}/g;
  const protectedTexts = texts.map((t) =>
    t.replace(PLACEHOLDER_RE, (m) => `<span class="notranslate">${m}</span>`)
  );

  // Build query string — Google v2 uses repeated 'q' params
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
    // Unwrap protection spans and decode HTML entities Google re-encodes
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

// ─── JSON flatten / unflatten ─────────────────────────────────────────────────
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

// ─── GitHub file writer ───────────────────────────────────────────────────────
async function writeFileToGithub(
  filePath: string,
  content: string,
  token: string,
  repo: string,
  branch: string
): Promise<void> {
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;

  const getRes = await fetch(`${apiUrl}?ref=${branch}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });

  let sha: string | undefined;
  if (getRes.ok) {
    const fileData = await getRes.json();
    sha = fileData.sha;
  }

  const body: Record<string, unknown> = {
    message: `chore(i18n): auto-translate ${filePath} via Google Translate`,
    content: Buffer.from(content).toString('base64'),
    branch,
  };
  if (sha) body.sha = sha;

  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!putRes.ok) {
    const err = await putRes.text();
    throw new Error(`GitHub write failed for ${filePath}: ${err}`);
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const googleKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!googleKey) {
    return NextResponse.json(
      {
        error:
          'GOOGLE_TRANSLATE_API_KEY is not set.\n\n' +
          'How to get a FREE key (3 minutes):\n' +
          '1. Go to https://console.cloud.google.com\n' +
          '2. Enable "Cloud Translation API"\n' +
          '3. Go to APIs & Services → Credentials → Create Credentials → API Key\n' +
          '4. Add GOOGLE_TRANSLATE_API_KEY to your Vercel environment variables\n\n' +
          'Free tier: 500,000 characters/month — resets every month automatically.',
      },
      { status: 422 }
    );
  }

  const githubToken = process.env.GITHUB_TOKEN;
  const githubRepo =
    process.env.GITHUB_REPO || 'kvbm6rfdwb-creator/apartments-dekanic';
  const githubBranch = process.env.GITHUB_BRANCH || 'main';

  // Read English source
  let enMessages: Record<string, unknown>;
  try {
    const raw = await readFile(
      path.join(process.cwd(), 'messages', 'en.json'),
      'utf-8'
    );
    enMessages = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: 'Could not read messages/en.json' },
      { status: 500 }
    );
  }

  // Determine which locales to process
  let body: { locales?: string[] } = {};
  try { body = await req.json(); } catch {}
  const targetLocales = (
    body.locales
      ? body.locales.filter((l) => ALL_LOCALES.includes(l as SupportedLocale))
      : [...ALL_LOCALES]
  ) as SupportedLocale[];

  const flatEn = flattenObject(enMessages);
  const keys = Object.keys(flatEn);
  const values = Object.values(flatEn);

  const results: Record<string, 'ok' | 'error'> = {};
  const errors: Record<string, string> = {};

  for (const locale of targetLocales) {
    const googleLang = GOOGLE_LANG_MAP[locale];

    try {
      // Google v2 REST supports up to 128 strings per request.
      // Our en.json has ~70 keys so one request per locale is sufficient.
      // If the file ever grows past 128 keys, batch in chunks of 100.
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
      const json = JSON.stringify(nested, null, 2) + '\n';

      if (githubToken) {
        await writeFileToGithub(
          `messages/${locale}.json`,
          json,
          githubToken,
          githubRepo,
          githubBranch
        );
      } else {
        // Dev fallback: write to local filesystem
        const { writeFile } = await import('fs/promises');
        await writeFile(
          path.join(process.cwd(), 'messages', `${locale}.json`),
          json,
          'utf-8'
        );
      }

      results[locale] = 'ok';
    } catch (e: any) {
      results[locale] = 'error';
      errors[locale] = e?.message || 'Unknown error';
    }
  }

  const allOk = Object.values(results).every((v) => v === 'ok');
  return NextResponse.json(
    {
      success: allOk,
      results,
      ...(Object.keys(errors).length > 0 && { errors }),
    },
    { status: allOk ? 200 : 207 }
  );
}
