"use client";
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Weather from '@/components/WeatherSimple';
import { useTranslations } from 'next-intl';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80';

interface HeroProps {
  heroImage?:      string;
  heroTitle?:      string;
  heroSubtitle?:   string;
  heroButtonText?: string;
  [key: string]:   any;
}

export default function Hero({
  heroImage      = '/images/hero.jpg',
  heroTitle,
  heroSubtitle,
  heroButtonText,
}: HeroProps) {
  const t      = useTranslations('hero');
  const bgRef  = useRef<HTMLDivElement>(null);
  const [imgSrc,    setImgSrc]    = useState(heroImage || FALLBACK_IMAGE);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Parallax only on large screens — avoids layout shift on mobile
  useEffect(() => {
    const fn = () => {
      if (bgRef.current && window.innerWidth >= 1024) {
        bgRef.current.style.transform = `translateY(${window.scrollY * 0.22}px)`;
      }
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const subtitle   = heroSubtitle   ?? t('subtitle');
  const buttonText = heroButtonText ?? t('cta');

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      {/* Background */}
      <div ref={bgRef} className="absolute inset-0 will-change-transform bg-stone-900">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-800 via-stone-700 to-stone-900" />
        <img
          key={imgSrc}
          src={imgSrc}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImgLoaded(true)}
          onError={() => { if (imgSrc !== FALLBACK_IMAGE) setImgSrc(FALLBACK_IMAGE); }}
        />
      </div>

      <div className="absolute inset-0 hero-overlay" />

      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-sand-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-terra-600/10 blur-3xl" />
      </div>

      {/* Content — flexbox column so weather sits below hero copy on ALL screen sizes */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-between px-6 pt-28 pb-12 sm:pt-32 lg:pt-40">

        {/* Hero text + CTA */}
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-5 text-xs font-medium uppercase tracking-[.35em] text-sand-300 opacity-0 animate-[fadeIn_1s_.2s_ease_forwards]">
            {subtitle}
          </p>
          <h1 className="font-serif text-5xl font-light leading-[1.02] text-white sm:text-6xl md:text-7xl lg:text-8xl opacity-0 animate-[fadeUp_.9s_.4s_cubic-bezier(.16,1,.3,1)_forwards]">
            {heroTitle || 'Apartments Dekanić'}
          </h1>
          <div className="mt-6 sm:mt-8">
            <a
              href="#apartments"
              className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-8 py-4 text-sm font-semibold tracking-wide text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 hover:shadow-2xl opacity-0 animate-[fadeIn_1s_.8s_ease_forwards]"
            >
              {buttonText}
            </a>
          </div>
        </div>

        {/* Weather widget — always below hero copy, never overlapping */}
        <div className="mt-10 sm:mt-12 lg:mt-0">
          <Weather />
        </div>
      </div>

      {/* Scroll cue */}
      <button
        onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
        className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 text-white/60 transition-colors hover:text-white animate-bounce"
        aria-label="Scroll down"
      >
        <ChevronDown size={28} />
      </button>
    </section>
  );
}
