import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['hr', 'en', 'de', 'it', 'hu', 'cs', 'pl', 'sl', 'es', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});
