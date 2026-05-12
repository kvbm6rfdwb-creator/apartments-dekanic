import React from 'react';
import { loadSiteData } from '@/lib/loadData';
import Hero from '@/components/Hero';
import ApartmentsSection from '@/components/ApartmentsSection';
import Reviews from '@/components/Reviews';
import Location from '@/components/Location';
import Contact from '@/components/Contact';
import WhyBook from '@/components/WhyBook';
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
    { id: 'weather',    enabled: true },
    { id: 'whyBook',    enabled: true },
    { id: 'apartments', enabled: true },
    { id: 'reviews',    enabled: true },
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
            <React.Fragment key="hero">
              <div className="relative">
                <Hero
                  heroImage={site.heroImage}
                  heroTitle={site.heroTitle}
                  heroSubtitle={site.heroSubtitle}
                  heroButtonText={site.heroButtonText}
                />
                {/* Weather widget positioned in hero wallpaper area */}
                <div className="absolute bottom-8 left-0 right-0 px-6 lg:px-8">
                  <div className="max-w-4xl mx-auto">
                    <Weather key="weather" />
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        }
        if (id === 'whyBook')    return <WhyBook key="whyBook" />;
        if (id === 'apartments') return <ApartmentsSection key="apartments" locale={locale} apartments={data?.apartments || []} />;
        if (id === 'reviews')    return <Reviews key="reviews" />;
        if (id === 'weather')    return null; {/* Skip since we're showing it after hero */};
        if (id === 'location')   return <Location key="location" />;
        if (id === 'contact')    return <Contact key="contact" />;
        return null;
      })}
    </>
  );
}
