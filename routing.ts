import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Croatian first — it's the default language for this property
  locales: ['hr', 'en', 'de', 'it', 'fr', 'es', 'hu', 'cs', 'pl', 'sl'],
  defaultLocale: 'hr',
  // 'always' ensures every locale gets a URL prefix (/hr, /en, /de …)
  // so the language switcher works correctly for ALL languages,
  // including the default one.
  localePrefix: 'always',
});
