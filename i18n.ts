import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export const locales = routing.locales;
export type Locale = (typeof routing.locales)[number];
export const defaultLocale = routing.defaultLocale;

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate locale — fall back to default
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  // For English, use static file (no translation needed)
  if (locale === 'en') {
    return {
      locale,
      messages: (await import(`./messages/${locale}.json`)).default,
    };
  }

  // For other locales, use runtime translation API
  try {
    // Use relative URL to work in both dev and production
    const res = await fetch(`/api/translate?locale=${locale}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Translation API failed: ${res.status}`);
    }
    const messages = await res.json();
    return {
      locale,
      messages,
    };
  } catch (error) {
    console.error(`Failed to fetch translations for ${locale}:`, error);
    // Fallback to static file if API fails
    try {
      return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default,
      };
    } catch {
      // Final fallback to English
      return {
        locale,
        messages: (await import(`./messages/en.json`)).default,
      };
    }
  }
});
