"use client";
import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { locales } from '@/routing';
import { Menu, X, Globe } from 'lucide-react';

const FLAG: Record<string,string> = { hr:'🇭🇷',en:'🇬🇧',de:'🇩🇪',it:'🇮🇹',hu:'🇭🇺',cs:'🇨🇿',pl:'🇵🇱',sl:'🇸🇮',es:'🇪🇸',fr:'🇫🇷' };

export default function Navbar({ locale }: { locale: string }) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const isHome = pathname === '/' || pathname === `/${locale}` || pathname === `/${locale}/`;

  const [scrolled, setScrolled] = useState(!isHome);
  const [mobileOpen, setMobile] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, [isHome]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const homeUrl = locale === 'en' ? '/' : `/${locale}`;
  const sectionHref = (hash: string) => isHome ? hash : `${homeUrl}${hash}`;

  const links = [
    { hash: '#apartments', label: t('apartments') },
    { hash: '#location',   label: t('location') },
    { hash: '#contact',    label: t('contact') },
  ];

  const navText = scrolled ? 'text-stone-700' : 'text-white/90';
  const navHover = 'hover:text-sand-500';

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'nav-glass py-3 shadow-sm' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        <a
          href={homeUrl}
          onClick={e => {
            if (isHome) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center gap-3 group">
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none" className="flex-shrink-0">
            <circle cx="19" cy="19" r="18" stroke="#b97a3a" strokeWidth="1.2"/>
            <path d="M11 26 L19 10 L27 26" stroke="#b97a3a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="13.5" y1="21.5" x2="24.5" y2="21.5" stroke="#b97a3a" strokeWidth="1.1" strokeLinecap="round"/>
            <circle cx="19" cy="28" r="1.5" fill="#b97a3a"/>
          </svg>
          <div className={`transition-colors duration-300 ${scrolled ? 'text-stone-800' : 'text-white'}`}>
            <div className="font-serif text-lg leading-tight">Apartments Dekanić</div>
            <div className={`text-[10px] tracking-widest uppercase ${scrolled ? 'text-sand-600' : 'text-sand-300'}`}>Baška · Krk</div>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.hash} href={sectionHref(l.hash)}
              className={`text-sm font-medium tracking-wide transition-colors ${navText} ${navHover}`}>
              {l.label}
            </a>
          ))}

          {/* Language switcher */}
          <div className="relative" ref={langRef}>
            <button onClick={() => setLangOpen(v => !v)}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${navText} ${navHover}`}>
              <Globe size={14}/>
              <span suppressHydrationWarning>{FLAG[locale]} {locale.toUpperCase()}</span>
              <svg className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-3 w-36 bg-white rounded-2xl shadow-2xl border border-sand-100 overflow-hidden py-1">
                {locales.map(loc => (
                  <a key={loc} href={`/${loc}`}
                    onClick={() => setLangOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-sand-50 ${loc === locale ? 'text-sand-700 font-semibold bg-sand-50' : 'text-stone-700'}`}>
                    <span suppressHydrationWarning>{FLAG[loc]}</span>
                    <span className="uppercase">{loc}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          <a href={sectionHref('#apartments')}
            className="px-5 py-2.5 bg-sand-600 hover:bg-sand-700 text-white text-sm font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
            {t('bookNow')}
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button className={`md:hidden p-1 ${scrolled ? 'text-stone-800' : 'text-white'}`}
          onClick={() => setMobile(v => !v)} aria-label="Menu">
          {mobileOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-500 ${mobileOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="nav-glass border-t border-sand-100 px-6 py-6 space-y-4">
          {links.map(l => (
            <a key={l.hash} href={sectionHref(l.hash)}
              onClick={() => setMobile(false)}
              className="block text-base font-medium text-stone-800 py-1">
              {l.label}
            </a>
          ))}
          <div className="flex flex-wrap gap-2 pt-2">
            {locales.map(loc => (
              <a key={loc} href={`/${loc}`}
                onClick={() => setMobile(false)}
                className={`px-3 py-1.5 rounded-full text-xs uppercase font-semibold border transition-all ${loc === locale ? 'bg-sand-600 text-white border-sand-600' : 'border-sand-300 text-stone-600'}`}>
                <span suppressHydrationWarning>{FLAG[loc]}</span> {loc}
              </a>
            ))}
          </div>
          <a href={sectionHref('#apartments')}
            onClick={() => setMobile(false)}
            className="block text-center px-5 py-3 bg-sand-600 text-white font-semibold rounded-full">
            {t('bookNow')}
          </a>
        </div>
      </div>
    </header>
  );
}
