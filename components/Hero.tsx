"use client";
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Weather from '@/components/WeatherSimple';
import { useTranslations } from 'next-intl';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80';

interface HeroProps {
  heroImage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroButtonText?: string;
  [key: string]: any;
}

export default function Hero({
  heroImage      = '/images/hero.jpg',
  heroTitle,
  heroSubtitle,
  heroButtonText,
}: HeroProps) {
  const t = useTranslations('hero');
  const bgRef = useRef<HTMLDivElement>(null);
  const [imgSrc, setImgSrc] = useState(heroImage || FALLBACK_IMAGE);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const fn = () => {
      if (bgRef.current) bgRef.current.style.transform = `translateY(${window.scrollY * 0.38}px)`;
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const subtitle   = heroSubtitle   ?? t('subtitle');
  const buttonText = heroButtonText ?? t('cta');

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      <div ref={bgRef} className="absolute inset-0 will-change-transform bg-stone-900">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-800 via-stone-700 to-stone-900" />
        <img
          key={imgSrc}
          src={imgSrc}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            if (imgSrc !== FALLBACK_IMAGE) {
              setImgSrc(FALLBACK_IMAGE);
            }
          }}
        />
      </div>

      <div className="absolute inset-0 hero-overlay" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-sand-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-terra-600/10 blur-3xl" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="text-sand-300 text-xs tracking-[.35em] uppercase font-medium mb-5 opacity-0 animate-[fadeIn_1s_.2s_ease_forwards]">
          {subtitle}
        </p>
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-light leading-[1.08] mb-6 opacity-0 animate-[fadeUp_.9s_.4s_cubic-bezier(.16,1,.3,1)_forwards]">
          {heroTitle || 'Apartments Dekanić'}
        </h1>
        <a
          href="#apartments"
          className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl text-sm tracking-wide opacity-0 animate-[fadeIn_1s_.8s_ease_forwards]"
        >
          {buttonText}
        </a>
      </div>

      <div className="absolute bottom-24 left-0 right-0 px-6 z-20">
        <div className="max-w-4xl mx-auto">
          <Weather />
        </div>
      </div>

      <button
        onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors animate-bounce"
      >
        <ChevronDown size={28} />
      </button>
    </section>
  );
}
