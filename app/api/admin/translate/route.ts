/**
 * POST /api/admin/translate
 *
 * Auto-translates the English messages/en.json into all other configured locales.
 * Uses DeepL Free API when DEEPL_API_KEY is set in env, otherwise returns a
 * structured error so the caller can handle it gracefully.
 *
 * Request body (optional):
 *   { "locales": ["hr", "de"] }   — translate only these locales
 *   {}                             — translate all non-English locales
 *
 * The route writes updated JSON files into messages/ in the repo via the
 * GitHub Contents API so changes are committed and trigger a Vercel redeploy.
 * Requires env vars:
 *   DEEPL_API_KEY       — DeepL Free or Pro API key
 *   GITHUB_TOKEN        — Personal access token with repo write scope
 *   GITHUB_REPO         — e.g. "kvbm6rfdwb-creator/apartments-dekanic"
 *   GITHUB_BRANCH       — defaults to "main"
 */

import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Translations can take a while for 9 locales
export const maxDuration = 60;

// ─── Auth helper (reused from other admin routes) ────────────────────────────
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

// ─── Locale config ────────────────────────────────────────────────────────────
const ALL_LOCALES = ['hr', 'de', 'it', 'fr', 'es', 'hu', 'cs', 'pl', 'sl'] as const;

// DeepL language codes differ from our locale codes in a few cases
const DEEPL_LANG_MAP: Record<string, string> = {
  hr: 'HR',
  de: 'DE',
  it: 'IT',
  fr: 'FR',
  es: 'ES',
  hu: 'HU',
  cs: 'CS',
  pl: 'PL',
  sl: 'SL',
};

// ─── DeepL translator ─────────────────────────────────────────────────────────
async function translateWithDeepl(
  texts: string[],
  targetLang: string,
  apiKey: string
): Promise<string[]> {
  const params = new URLSearchParams();
  params.append('auth_key', apiKey);
  params.append('target_lang', targetLang);
  params.append('source_lang', 'EN');
  // Preserve i18n placeholders like {n}, {name}
  params.append('tag_handling', 'xml');
  params.append('ignore_tags', 'x');
  texts.forEach((t) => params.append('text', t));

  // DeepL Free uses api-free.deepl.com; Pro uses api.deepl.com
  const baseUrl = apiKey.endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate';

  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`DeepL API error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  return (data.translations as Array<{ text: string }>).map((t) => t.text);
}

// ─── Flatten / unflatten JSON for batch translation ──────────────────────────
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

  // Get current SHA so we can update the file
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
    message: `chore(i18n): auto-translate ${filePath}`,
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

  const deeplKey = process.env.DEEPL_API_KEY;
  if (!deeplKey) {
    return NextResponse.json(
      {
        error:
          'DEEPL_API_KEY is not set. Add it to your Vercel environment variables. ' +
          'Get a free key at https://www.deepl.com/pro-api (500k chars/month free).',
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

  // Determine which locales to translate
  let body: { locales?: string[] } = {};
  try {
    body = await req.json();
  } catch {}
  const targetLocales = (
    body.locales ? body.locales.filter((l) => ALL_LOCALES.includes(l as any)) : [...ALL_LOCALES]
  ) as string[];

  const flatEn = flattenObject(enMessages);
  const keys = Object.keys(flatEn);
  const values = Object.values(flatEn);

  const results: Record<string, 'ok' | 'error'> = {};
  const errors: Record<string, string> = {};

  for (const locale of targetLocales) {
    const deeplLang = DEEPL_LANG_MAP[locale];
    if (!deeplLang) continue;

    try {
      const translated = await translateWithDeepl(values, deeplLang, deeplKey);
      const flatTranslated: Record<string, string> = {};
      keys.forEach((k, i) => {
        flatTranslated[k] = translated[i];
      });
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
        // Fallback: write locally (dev mode)
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
