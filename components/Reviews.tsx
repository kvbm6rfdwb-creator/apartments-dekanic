"use client";
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GoogleReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  photoUri?: string;
}

// Google logo SVG inline (official colours)
function GoogleLogo({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function Reviews() {
  const t = useTranslations('reviews');
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/google-reviews')
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

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

        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-2 border-[#b97a3a] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <p className="text-center text-stone-400 py-12">Reviews unavailable at the moment.</p>
        )}

        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => (
              <motion.div
                key={r.id}
                className="bg-[#fdf9f3] rounded-2xl p-6 border border-stone-200/50"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {r.photoUri ? (
                      <img
                        src={r.photoUri}
                        alt={r.author}
                        className="w-7 h-7 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-xs font-semibold text-stone-500">
                        {r.author.charAt(0)}
                      </div>
                    )}
                    <span className="font-semibold text-stone-800 text-sm">{r.author}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-400 bg-white px-2 py-0.5 rounded-full border border-stone-200">
                    <GoogleLogo size={12} />
                    <span>Google</span>
                  </div>
                </div>
                {r.date && (
                  <p className="text-xs text-stone-300 mt-2">
                    {new Date(r.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <a
            href="https://www.google.com/maps/search/?api=1&query=Apartments+Dekanic+Baska+Krk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border border-stone-200 hover:border-[#b97a3a] text-stone-600 hover:text-[#b97a3a] font-medium rounded-full transition-all duration-200 text-sm"
          >
            <GoogleLogo size={16} />
            {t('viewAll')}
          </a>
        </div>
      </div>
    </section>
  );
}
