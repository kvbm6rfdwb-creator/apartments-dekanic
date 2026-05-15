"use client";
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-stone-400 py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 38 38" fill="none">
            <circle cx="19" cy="19" r="18" stroke="#b97a3a" strokeWidth="1.2"/>
            <path d="M11 26 L19 10 L27 26" stroke="#b97a3a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="13.5" y1="21.5" x2="24.5" y2="21.5" stroke="#b97a3a" strokeWidth="1.1" strokeLinecap="round"/>
            <circle cx="19" cy="28" r="1.5" fill="#b97a3a"/>
          </svg>
          <span className="text-stone-300 font-medium text-sm">Apartments Dekanić</span>
        </div>
        <p className="text-xs text-stone-500">
          © {year} Apartments Dekanić. {t('rights')}
        </p>
        <div className="flex gap-6 text-xs">
          <a href="#" className="hover:text-sand-400 transition-colors">{t('privacy')}</a>
          <a href="#" className="hover:text-sand-400 transition-colors">{t('terms')}</a>
        </div>
      </div>
    </footer>
  );
}
