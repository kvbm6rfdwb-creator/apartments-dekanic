"use client";
import Link from 'next/link';
import { fmtEur } from '@/lib/pricing';
import { useTranslations, useLocale } from 'next-intl';
import { Users, BedDouble, Bath, Eye, ParkingCircle, Wind } from 'lucide-react';
function Badge({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-stone-500 font-medium bg-sand-50 px-3 py-1.5 rounded-full border border-sand-100">
      <Icon size={11} className="text-sand-600"/>{label}
    </span>
  );
}
interface Apartment { id: string; name: string; tagline: string; images: string[]; maxGuests: number; extraGuests?: number; extraGuestNote?: string; bedrooms: number; bathrooms: number; sizeSqm: number; features: Record<string,boolean>; amenities: string[]; priceFrom: number; description?: string; slug?: string; ical?: Record<string,string>; pricing?: Record<string,number>;
  [key: string]: any;
}

export default function ApartmentsSection({ locale, apartments }: { locale: string; apartments: Apartment[] }) {
  const t = useTranslations('apartments');
  const currentLocale = useLocale();
  return (
    <section id="apartments" className="py-12 px-6 bg-sand-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 reveal">
          <p className="text-sand-600 text-xs tracking-[.3em] uppercase font-semibold mb-3">Baška · Island Krk</p>
          <h2 className="font-serif text-4xl md:text-5xl text-stone-900 font-light mb-4">{t('title')}</h2>
          <p className="text-stone-500 text-lg max-w-xl mx-auto">{t('subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {apartments.map((apt,i)=>(
            <Link key={apt.id} href={`/${currentLocale}/apartments/${apt.id}`} className={`reveal delay-${i+1} bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col cursor-pointer`}>
              <div className="relative aspect-[4/3] overflow-hidden bg-sand-100">
                <img src={apt.images[0]} alt={apt.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={e => { (e.target as HTMLImageElement).src='https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80'; }} />
                {apt.features.seaView && (
                  <span className="absolute top-4 left-4 bg-ocean-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Eye size={11}/>{t('seaView')}
                  </span>
                )}
              </div>
              <div className="p-7 flex flex-col flex-1">
                <p className="text-sand-600 text-xs tracking-widest uppercase font-semibold mb-1">Baška, Krk</p>
                <h3 className="font-serif text-2xl text-stone-900">{apt.name}</h3>
                <p className="text-stone-400 text-sm italic mt-0.5 mb-4">{apt.tagline}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {apt.maxGuests>0 && <Badge icon={Users} label={
                    (apt as any).extraGuests > 0
                      ? `${apt.maxGuests}+${(apt as any).extraGuests} ${t('guests')}`
                      : `${apt.maxGuests} ${t('guests')}`
                  }/>}
                  {apt.bedrooms>0  && <Badge icon={BedDouble} label={`${apt.bedrooms} ${t('bedrooms')}`}/>}
                  {apt.bathrooms>0 && <Badge icon={Bath} label={`${apt.bathrooms} ${t('bathrooms')}`}/>}
                  {apt.features.parking && <Badge icon={ParkingCircle} label={t('parking')}/>}
                  {apt.features.balcony  && <Badge icon={Wind} label={t('balcony')}/>}
                </div>
                <p className="text-stone-500 text-sm leading-relaxed flex-1 mb-4 line-clamp-3">{apt.description}</p>
                {/* Price */}
                <div className="flex items-baseline justify-between mb-5 pt-3 border-t border-sand-100">
                  <div>
                    <span className="font-serif text-2xl text-stone-900 font-light">
                      {fmtEur((apt as any).pricing?.seasons?.reduce((min: number, s: any) => Math.min(min, s.nightly), (apt as any).pricing?.defaultNightly || (apt as any).priceFrom || 0) || (apt as any).priceFrom || 0)}
                    </span>
                    <span className="text-stone-400 text-sm ml-1">/ night</span>
                  </div>
                  <span className="text-xs text-stone-400">from</span>
                </div>
                <div className="flex items-center justify-center gap-2 w-full py-3.5 bg-stone-900 group-hover:bg-sand-700 text-white text-sm font-semibold rounded-2xl transition-all duration-300">
                  {t('viewApartment')}
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
