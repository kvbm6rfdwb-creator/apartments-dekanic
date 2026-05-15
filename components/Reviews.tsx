"use client";
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const REVIEWS = [
  { author: 'Maria S.', platform: 'Airbnb', rating: 5, text: 'Absolutely stunning apartment with an incredible sea view. The hosts were incredibly responsive and helpful throughout our stay.' },
  { author: 'Thomas K.', platform: 'Booking.com', rating: 5, text: 'Perfect location in Baška, walking distance to the beach. The apartment was spotlessly clean and well-equipped.' },
  { author: 'Sophie L.', platform: 'Airbnb', rating: 5, text: 'Magical stay on Krk island. The apartment exceeded all expectations — beautiful design, great amenities, and the hosts were wonderful.' },
  { author: 'Marco R.', platform: 'Booking.com', rating: 5, text: 'Exceptional value for money. The sea view from the balcony was breathtaking. Will definitely return next summer!' },
  { author: 'Anna B.', platform: 'Airbnb', rating: 5, text: 'Best accommodation in Baška! The apartment is beautifully decorated, very clean, and in a perfect location.' },
  { author: 'Peter H.', platform: 'Booking.com', rating: 5, text: 'Outstanding stay from beginning to end. The hosts went above and beyond to make our holiday special.' },
];

export default function Reviews() {
  const t = useTranslations('reviews');

  return (
    <section id="reviews" className="py-16 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif text-4xl md:text-5xl text-stone-900 font-light mb-3">{t('title')}</h2>
          <p className="text-stone-400 text-base">{t('subtitle')}</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <motion.div
              key={i}
              className="bg-[#fdf9f3] rounded-2xl p-6 border border-stone-200/50"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Star key={j} size={14} className="fill-sand-500 text-sand-500" />
                ))}
              </div>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-800 text-sm">{r.author}</span>
                <span className="text-xs text-stone-400 bg-white px-2 py-0.5 rounded-full border border-stone-200">{r.platform}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="https://www.airbnb.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border border-stone-200 hover:border-sand-400 text-stone-600 hover:text-sand-700 font-medium rounded-full transition-all duration-200 text-sm"
          >
            {t('viewAll')}
          </a>
        </div>
      </div>
    </section>
  );
}
