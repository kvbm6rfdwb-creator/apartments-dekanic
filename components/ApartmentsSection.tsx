"use client";
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Users, Bed, Bath, Maximize, Eye, LayoutGrid, Star } from 'lucide-react';

interface Apartment {
  id: string;
  name: string;
  description?: string;
  guests?: number;
  bedrooms?: number;
  bathrooms?: number;
  sqm?: number;
  price?: number;
  images?: string[];
  features?: string[];
  seaView?: boolean;
  balcony?: boolean;
  parking?: boolean;
}

interface ApartmentsSectionProps {
  locale: string;
  apartments: Apartment[];
}

export default function ApartmentsSection({ locale, apartments }: ApartmentsSectionProps) {
  const t = useTranslations('apartments');
  const tf = useTranslations('features');

  if (!apartments || apartments.length === 0) return null;

  return (
    <section id="apartments" className="py-16 px-6 bg-[#fdf9f3]">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif text-4xl md:text-5xl text-stone-900 font-light mb-4">{t('title')}</h2>
          <p className="text-stone-500 text-lg max-w-2xl mx-auto">{t('subtitle')}</p>
        </motion.div>

        {/* Apartment Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {apartments.map((apt, i) => (
            <motion.article
              key={apt.id}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200/50 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 group"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                {apt.images && apt.images[0] ? (
                  <img
                    src={apt.images[0]}
                    alt={apt.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <LayoutGrid size={48} />
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {apt.seaView && (
                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-stone-700 flex items-center gap-1">
                      <Eye size={10} /> {t('seaView')}
                    </span>
                  )}
                </div>
                {apt.price && (
                  <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-stone-900/80 backdrop-blur-sm rounded-full text-white text-xs font-semibold">
                    €{apt.price}/night
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-serif text-xl text-stone-900 mb-2">{apt.name}</h3>
                {apt.description && (
                  <p className="text-stone-500 text-sm leading-relaxed mb-4 line-clamp-2">{apt.description}</p>
                )}

                {/* Stats */}
                <div className="flex gap-4 text-xs text-stone-500 mb-5">
                  {apt.guests   && <span className="flex items-center gap-1"><Users size={12}/> {apt.guests} {t('guests')}</span>}
                  {apt.bedrooms && <span className="flex items-center gap-1"><Bed size={12}/> {apt.bedrooms} {t('bedrooms')}</span>}
                  {apt.bathrooms && <span className="flex items-center gap-1"><Bath size={12}/> {apt.bathrooms} {t('bathrooms')}</span>}
                  {apt.sqm      && <span className="flex items-center gap-1"><Maximize size={12}/> {apt.sqm} {t('sqm')}</span>}
                </div>

                {/* Features */}
                {apt.features && apt.features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {apt.features.slice(0, 4).map(f => (
                      <span key={f} className="px-2 py-0.5 bg-sand-50 text-sand-700 text-xs rounded-full border border-sand-200">
                        {tf(f as any) || f}
                      </span>
                    ))}
                    {apt.features.length > 4 && (
                      <span className="px-2 py-0.5 bg-stone-50 text-stone-400 text-xs rounded-full">
                        +{apt.features.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* CTA */}
                <a
                  href={`/${locale}/apartments/${apt.id}`}
                  className="block w-full text-center px-4 py-2.5 bg-stone-900 hover:bg-sand-700 text-white text-sm font-semibold rounded-xl transition-all duration-200"
                >
                  {t('viewApartment')}
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
