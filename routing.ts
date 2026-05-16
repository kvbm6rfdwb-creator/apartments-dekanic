import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['hr', 'en', 'de', 'it', 'fr', 'es', 'hu', 'cs', 'pl', 'sl'],
  defaultLocale: 'hr',
  localePrefix: 'always',
});

// Convenience re-exports — safe to import from client components
export const locales = routing.locales;
export const defaultLocale = routing.defaultLocale;
