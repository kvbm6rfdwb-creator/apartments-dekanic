import type { Metadata } from 'next';
import { loadSiteData } from '@/lib/loadData';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import ApartmentGallery from '@/components/ApartmentGallery';
import ApartmentBookingSidebar from '@/components/ApartmentBookingSidebar';
import { ALL_AMENITIES } from '@/lib/amenities';
import { Users, BedDouble, Bath, Eye, ParkingCircle, Wind, Maximize2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function loadData() {
  return loadSiteData();
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const data = await loadData();
    const apt = data.apartments.find((a: any) => a.id === id || a.slug === id);
    if (!apt) return {};
    return {
      title: apt.name,
      description: apt.description?.slice(0, 160) || `Book ${apt.name} directly in Baška, Island Krk.`,
      openGraph: {
        title: `${apt.name} | Apartments Dekanić`,
        description: apt.description?.slice(0, 160) || '',
        images: apt.images?.[0] ? [{ url: apt.images[0], width: 1200, height: 800, alt: apt.name }] : [],
      },
    };
  } catch { return {}; }
}

const AMENITY_MAP = Object.fromEntries(ALL_AMENITIES.map(a => [a.key, { label: a.label, icon: a.icon }]));

function Stat({ icon, label, highlight }: { icon: React.ReactNode; label: string; highlight?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border ${highlight ? 'bg-ocean-500/10 border-ocean-400/30 text-ocean-600' : 'bg-white border-sand-200 text-stone-700'}`}>
      {icon} {label}
    </span>
  );
}

export default async function ApartmentPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const data = await loadData();
  const apt  = data.apartments.find((a: any) => a.id === id || a.slug === id);
  if (!apt) notFound();

  const t  = await getTranslations({ locale, namespace: 'apartments' });
  const tc = await getTranslations({ locale, namespace: 'calendar' });

  // Sanitize whatsapp number — strip non-digits, ensure starts with 385
  const rawWa = String(data.property?.whatsapp || '');
  const whatsapp = rawWa.replace(/[^0-9]/g, '') || '385984841330';

  return (
    <div className="min-h-screen bg-sand-50 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <Link href={`/${locale}#apartments`} className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-sand-600 transition-colors">
          <ChevronLeft size={16} /> All Apartments
        </Link>
      </div>

      <ApartmentGallery images={apt.images || []} name={apt.name} />

      <div className="max-w-7xl mx-auto px-6 pb-16 space-y-8">
        <div className="space-y-10">
          <div>
            <p className="text-sand-600 text-xs tracking-widest uppercase font-semibold mb-1">Baška, Island Krk · Croatia</p>
            <h1 className="font-serif text-4xl md:text-5xl text-stone-900 font-light">{apt.name}</h1>
            <p className="text-stone-400 italic mt-2">{apt.tagline}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {apt.maxGuests > 0 && (
              <Stat icon={<Users size={15} />} label={
                apt.extraGuests > 0
                  ? `${apt.maxGuests}+${apt.extraGuests} ${t('guests')}`
                  : `${apt.maxGuests} ${t('guests')}`
              } />
            )}
            {apt.extraGuests > 0 && apt.extraGuestNote && (
              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border bg-amber-50 border-amber-200 text-amber-700">
                🛋️ {apt.extraGuestNote}
              </span>
            )}
            {apt.bedrooms  > 0 && <Stat icon={<BedDouble size={15} />}    label={`${apt.bedrooms} ${t('bedrooms')}`} />}
            {apt.bathrooms > 0 && <Stat icon={<Bath size={15} />}         label={`${apt.bathrooms} ${t('bathrooms')}`} />}
            {apt.sizeSqm   > 0 && <Stat icon={<Maximize2 size={15} />}    label={`${apt.sizeSqm} m²`} />}
            {apt.features?.seaView  && <Stat icon={<Eye size={15} />}           label={t('seaView')} highlight />}
            {apt.features?.balcony  && <Stat icon={<Wind size={15} />}          label={t('balcony')} />}
            {apt.features?.parking  && <Stat icon={<ParkingCircle size={15} />} label={t('parking')} />}
          </div>

          <div>
            <h2 className="font-serif text-3xl text-stone-900 mb-4">About this apartment</h2>
            <p className="text-stone-600 leading-relaxed">{apt.description || 'No description yet.'}</p>
          </div>

          {apt.amenities?.length > 0 && (
            <div>
              <h2 className="font-serif text-3xl text-stone-900 mb-5">{t('amenities')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {apt.amenities.map((key: string) => {
                  const am = AMENITY_MAP[key];
                  return (
                    <div key={key} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 text-sm text-stone-700 border border-sand-100">
                      <span className="text-lg">{am?.icon || '✓'}</span>
                      <span>{am?.label || key}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <ApartmentBookingSidebar
          apt={apt}
          locale={locale}
          calendarTitle={tc('title')}
          whatsapp={whatsapp}
        />
      </div>
    </div>
  );
}
