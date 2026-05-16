/**
 * i18n.ts — next-intl request config.
 *
 * IMPORTANT: This file is imported by both server and client code (Navbar imports
 * `locales` from here). Therefore it must NOT import any Node.js built-ins
 * (fs, path, etc.). All server-only logic lives in lib/translate.server.ts.
 */
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// Re-exported for use in client components (e.g. Navbar)
export const locales = routing.locales;
export type Locale = (typeof routing.locales)[number];
export const defaultLocale = routing.defaultLocale;

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate locale — fall back to default
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  // Croatian and English have static JSON files — no API call needed
  const staticLocales = ['en', 'hr'];

  if (staticLocales.includes(locale)) {
    return {
      locale,
      messages: (await import(`./messages/${locale}.json`)).default,
    };
  }

  // All other locales: translate from English via Google Translate.
  // Import is dynamic so webpack never bundles the server-only module into
  // the client chunk that imports `locales` / `defaultLocale` from this file.
  try {
    const { getTranslatedMessages } = await import('./lib/translate.server');
    const messages = await getTranslatedMessages(locale);
    return { locale, messages };
  } catch (error) {
    console.error(`Failed to translate for locale "${locale}":`, error);
    // Fallback: static file for this locale, then English
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
