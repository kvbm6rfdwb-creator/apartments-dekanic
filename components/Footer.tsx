'use client';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-white/60 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Logo + name */}
        <div className="flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 38 38" fill="none">
            <circle cx="19" cy="19" r="18" stroke="#b97a3a" strokeWidth="1.2" />
            <path d="M11 26 L19 10 L27 26" stroke="#b97a3a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="13.5" y1="21.5" x2="24.5" y2="21.5" stroke="#b97a3a" strokeWidth="1.1" strokeLinecap="round" />
            <circle cx="19" cy="28" r="1.5" fill="#b97a3a" />
          </svg>
          <div>
            <p className="text-white font-serif text-base">Apartments Dekani</p>
            <p className="text-white/40 text-xs">Baška · Island Krk · Croatia</p>
          </div>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-6 text-sm">
          <a href="#apartments" className="hover:text-white transition-colors">Apartments</a>
          <a href="#location"   className="hover:text-white transition-colors">Location</a>
          <a href="#contact"    className="hover:text-white transition-colors">Contact</a>
        </div>

        {/* Copyright + HTZ badge */}
        <div className="flex flex-col items-center md:items-end gap-2">
          <p className="text-xs text-white/30">© {year} Apartments Dekani. All rights reserved.</p>
          <div className="flex items-center gap-2 opacity-50 hover:opacity-80 transition-opacity">
            <img
              src="/htz-logo.png"
              alt="Hrvatska turistička zajednica"
              className="h-5 w-auto object-contain brightness-0 invert"
              loading="lazy"
              width={50}
              height={20}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="text-[10px] text-white/40 font-medium">Official Registration</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
