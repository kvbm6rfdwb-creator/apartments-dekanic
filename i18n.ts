import 'server-only';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export type Locale = (typeof routing.locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

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

  // All other locales: call Google Translate directly (server-side)
  try {
    const { getTranslatedMessages } = await import('./lib/translate.server');
    const messages = await getTranslatedMessages(locale);
    return { locale, messages };
  } catch (error) {
    console.error(`Failed to translate for locale "${locale}":`, error);
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
