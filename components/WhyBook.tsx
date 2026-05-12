'use client';
import { Shield, CreditCard, MessageCircle, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

const perks = [
  { icon: Shield,         title: 'direct',           desc: 'directDesc' },
  { icon: CreditCard,     title: 'price',           desc: 'priceDesc' },
  { icon: MessageCircle,  title: 'available',        desc: 'availableDesc' },
  { icon: Star,           title: 'verified',         desc: 'verifiedDesc' },
];

export default function WhyBook() {
  const t = useTranslations('whyBook');
  
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 reveal">
          <p className="text-sand-600 text-xs tracking-[.3em] uppercase font-semibold mb-3">{t('title')}</p>
          <h2 className="font-serif text-4xl md:text-5xl text-stone-900 font-light">{t('subtitle')}</h2>
        </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {perks.map((p, i) => (
            <div key={i} className={`reveal delay-${i + 1} text-center group`}>
              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-sand-50 flex items-center justify-center group-hover:bg-sand-100 transition-colors">
                <p.icon size={24} className="text-sand-600" />
              </div>
              <h3 className="font-serif text-xl text-stone-800 mb-2">{p.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* HTZ Trust Badge */}
        <div className="reveal mt-14 flex justify-center">
          <div className="inline-flex items-center gap-4 bg-white border border-sand-200 rounded-2xl px-6 py-4 shadow-sm">
            <img
              src="/HTZ Local Host logo RGB-1.png"
              alt="Hrvatska turistička zajednica – Croatian National Tourist Board"
              className="h-10 w-auto object-contain opacity-80"
              loading="lazy"
              width={80}
              height={40}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="w-px h-8 bg-sand-200" />
            <div>
              <p className="text-xs font-bold text-stone-800 leading-tight">{t('registered')}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">{t('registeredDesc')}</p>
            </div>
          </div>
      </div>

    </section>
  );
}
