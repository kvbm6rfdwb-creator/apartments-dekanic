import 'server-only';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export type Locale = (typeof routing.locales)[number];

/**
 * All locale message files are pre-built and live in messages/<locale>.json.
 * We simply load the correct file for the requested locale.
 * No API calls, no Google Translate at runtime — the translations already exist.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate — fall back to default locale
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  // Load the pre-translated static JSON for this locale.
  // Falls back to English if the file is somehow missing.
  try {
    const messages = (await import(`./messages/${locale}.json`)).default;
    return { locale, messages };
  } catch {
    console.error(`messages/${locale}.json not found, falling back to English`);
    const messages = (await import('./messages/en.json')).default;
    return { locale, messages };
  }
});
