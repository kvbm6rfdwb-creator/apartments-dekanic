import React from 'react';
import { loadSiteData } from '@/lib/loadData';
import Hero from '@/components/Hero';
import ApartmentsSection from '@/components/ApartmentsSection';
import Reviews from '@/components/Reviews';
import Location from '@/components/Location';
import Contact from '@/components/Contact';
import WhyBookDirectly from '@/components/WhyBookDirectly';
import Weather from '@/components/WeatherSimple';

import { routing } from '@/routing';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

// Force dynamic so Next.js always reads the latest apartments.json from disk
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Read file at request time — not statically bundled
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

  const enabled = sections.filter(s => s.enabled).map(s => s.id);

  return (
    <>
      {enabled.map(id => {
        if (id === 'hero') {
          return (
            <Hero
              key="hero"
              heroImage={site.heroImage}
              heroTitle={site.heroTitle}
              heroSubtitle={site.heroSubtitle}
              heroButtonText={site.heroButtonText}
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
