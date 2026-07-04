'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Lock, UserCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function WhyBookDirectly() {
  const t = useTranslations('whyBook');

  return (
    <section className="py-12 bg-[#fdf9f3]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2
            className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-stone-900 mb-3"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t('title')}
          </motion.h2>
          <motion.p
            className="text-base text-stone-600 leading-relaxed"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t('subtitle')}
          </motion.p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-3">

          {/* Card 1 - Price */}
          <motion.article
            className="bg-white rounded-xl border border-stone-200/50 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-180 p-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="font-serif text-4xl text-[#b97a3a] font-medium mb-2">10%</div>
            <h3 className="font-semibold text-base text-stone-900 mb-2">{t('price')}</h3>
            <p className="text-sm text-stone-600 leading-relaxed">{t('priceDesc')}</p>
          </motion.article>

          {/* Card 2 - Direct */}
          <motion.article
            className="bg-white rounded-xl border border-stone-200/50 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-180 p-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f9f0e3] rounded-full text-xs text-[#b97a3a] font-medium">
                <span>✓</span>
                <span>{t('direct')}</span>
              </div>
            </div>
            <h3 className="font-semibold text-base text-stone-900 mb-2">{t('available')}</h3>
            <p className="text-sm text-stone-600 leading-relaxed">{t('availableDesc')}</p>
          </motion.article>

          {/* Card 3 - Licensed */}
          <motion.article
            className="bg-white rounded-xl border-2 border-[#b97a3a] shadow-[0_4px_12px_rgba(185,122,58,0.15),0_8px_24px_rgba(185,122,58,0.1)] hover:shadow-[0_8px_20px_rgba(185,122,58,0.2),0_12px_32px_rgba(185,122,58,0.15)] transition-all duration-180 p-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#b97a3a] opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#b97a3a] opacity-5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <ShieldCheck className="h-8 w-8 text-[#b97a3a] mb-4 relative z-10" />
            <h3 className="font-semibold text-lg text-stone-900 mb-2 relative z-10">{t('registered')}</h3>
            <p className="text-sm text-stone-600 leading-relaxed mb-6 relative z-10">{t('registeredDesc')}</p>
            <img
              src="/HTZ%20Local%20Host%20logo%20RGB-1.png"
              alt="HTZ Local Host Certified"
              className="mx-auto block h-auto w-auto max-w-[200px] relative z-10 object-contain"
            />
          </motion.article>
        </div>

        {/* Bottom Trust Strip */}
        <motion.div
          className="mt-4 bg-[#ede8df] rounded-xl py-4 px-6"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5" />
              <span>{t('verified')}</span>
            </div>
            <div className="hidden sm:block w-px h-3 bg-stone-300" />
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{t('verifiedDesc')}</span>
            </div>
            <div className="hidden sm:block w-px h-3 bg-stone-300" />
            <div className="flex items-center gap-2">
              <UserCheck className="h-3.5 w-3.5" />
              <span>{t('directDesc')}</span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
