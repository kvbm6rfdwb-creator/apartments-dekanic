/**
 * Server-side helper to translate dynamic content strings via /api/translate-content.
 * Falls back to original text if translation fails or locale is 'en'.
 */
export async function translateContent(
  texts: string[],
  locale: string,
  baseUrl: string
): Promise<string[]> {
  if (locale === 'en') return texts;
  try {
    const res = await fetch(`${baseUrl}/api/translate-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, locale }),
      cache: 'no-store',
    });
    if (!res.ok) return texts;
    const data = await res.json();
    return Array.isArray(data.translations) ? data.translations : texts;
  } catch {
    return texts;
  }
}
