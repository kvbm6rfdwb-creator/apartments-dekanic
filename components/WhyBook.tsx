'use client';

import {
  Shield,
  CreditCard,
  MessageCircle,
  LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

type Benefit = {
  icon?: LucideIcon;
  isLogo?: boolean;
  title: string;
  description: string;
};

export default function WhyBookNew() {
  const t = useTranslations('whyBook');

  const benefits: Benefit[] = [
    {
      icon: Shield,
      title: t('direct'),
      description: t('directDesc'),
    },
    {
      icon: CreditCard,
      title: t('price'),
      description: t('priceDesc'),
    },
    {
      icon: MessageCircle,
      title: t('available'),
      description: t('availableDesc'),
    },
    {
      isLogo: true,
      title: 'Licensed Host',
      description: 'Officially registered HTZ Local Host',
    },
  ];

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-stone-900">
            Why book directly?
          </h2>
          <p className="mt-4 text-base text-stone-600 leading-relaxed">
            Better prices, personal service, and complete peace of mind.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="group flex flex-col items-center text-center p-8 rounded-2xl border border-stone-100 bg-white hover:border-stone-200 transition-all duration-300 hover:shadow-lg"
            >
              {benefit.isLogo ? (
                <img 
                  src="/HTZ Local Host logo RGB-1.png" 
                  alt="HTZ Local Host" 
                  className="h-14 w-auto opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                />
              ) : benefit.icon ? (
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-stone-50 text-stone-700 group-hover:bg-stone-100 group-hover:scale-110 transition-all duration-300">
                  <benefit.icon className="h-6 w-6" />
                </div>
              ) : null}

              <h3 className="mt-6 font-medium text-lg text-stone-900">
                {benefit.title}
              </h3>
              <p className="mt-3 text-sm text-stone-600 leading-relaxed">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}