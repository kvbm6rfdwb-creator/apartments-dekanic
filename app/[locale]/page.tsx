import React from 'react';
import { loadSiteData } from '@/lib/loadData';
import Hero from '@/components/Hero';
import ApartmentsSection from '@/components/ApartmentsSection';
import Reviews from '@/components/Reviews';
import Location from '@/components/Location';
import Contact from '@/components/Contact';
import WhyBookDirectly from '@/components/WhyBookDirectly';
import Weather from '@/components/WeatherSimple';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/routing';
import { headers } from 'next/headers';
import { translateContent } from '@/lib/translateContent';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  let site: any = {};
  let data: any = null;
  let sections: Array<{ id: string; enabled: boolean }> = [
    { id: 'hero',       enabled: true },
    { id: 'whyBook',    enabled: true },
    { id: 'reviews',    enabled: true },
    { id: 'apartments', enabled: true },
    { id: 'location',   enabled: true },
    { id: 'contact',    enabled: true },
  ];
  try {
    data     = await loadSiteData();
    site     = data.site || {};
    sections = data.site?.sections || sections;
  } catch {}

  // Translate dynamic hero content from whatever language the owner typed it in
  const headersList = await headers();
  const host   = headersList.get('host') || 'localhost:3000';
  const proto  = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = `${proto}://${host}`;

  const rawTexts = [
    site.heroTitle    || '',
    site.heroSubtitle || '',
    site.heroButtonText || '',
  ];

  const [translatedTitle, translatedSubtitle, translatedButton] =
    locale !== 'en'
      ? await translateContent(rawTexts, locale, baseUrl)
      : rawTexts;

  const enabled = sections.filter((s: any) => s.enabled).map((s: any) => s.id);

  return (
    <>
      {enabled.map(id => {
        if (id === 'hero') {
          return (
            <Hero
              key="hero"
              heroImage={site.heroImage}
              heroTitle={translatedTitle || site.heroTitle}
              heroSubtitle={translatedSubtitle || site.heroSubtitle}
              heroButtonText={translatedButton || site.heroButtonText}
            />
          );
        }
        if (id === 'whyBook')    return <WhyBookDirectly key="whyBook" />;
        if (id === 'reviews')    return <Reviews key="reviews" />;
        if (id === 'apartments') return <ApartmentsSection key="apartments" locale={locale} apartments={data?.apartments || []} />;
        if (id === 'weather')    return <Weather key="weather" />;
        if (id === 'location')   return <Location key="location" />;
        if (id === 'contact')    return <Contact key="contact" />;
        return null;
      })}
    </>
  );
}
