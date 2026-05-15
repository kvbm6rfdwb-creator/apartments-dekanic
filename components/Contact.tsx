"use client";
import { Phone, Mail, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

const WA_SVG = (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

function cleanPhone(raw: string): string {
  // Remove everything except digits and leading +
  return '+' + raw.replace(/[^0-9]/g, '');
}

export default function Contact() {
  const [property, setProperty] = useState({
    phone: '+385 98 484 133',
    email: 'dekanic.lucija@gmail.com',
    address: 'Skopalj 19, Baška, Krk',
    whatsapp: '+38598484133',
    mapLat: 44.9695,
    mapLng: 14.7452,
  });

  useEffect(() => {
    fetch('/api/site-data')
      .then(r => r.json())
      .then(d => {
        if (d?.property) setProperty(p => ({ ...p, ...d.property }));
      })
      .catch(() => {});
  }, []);

  const waNumber = cleanPhone(property.whatsapp || property.phone);
  const waUrl = `https://wa.me/${waNumber.replace('+', '')}`;

  return (
    <section id="contact" className="py-12 px-6 bg-sand-50">
      <div className="max-w-4xl mx-auto text-center">
        <div className="reveal">
          <p className="text-sand-600 text-xs tracking-[.3em] uppercase font-semibold mb-3">Contact</p>
          <h2 className="font-serif text-4xl md:text-5xl text-stone-900 font-light mb-4">Get in Touch</h2>
          <p className="text-stone-400 text-lg mb-12">Typically responding within 1 hour — in any of our 10 supported languages.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {([
            { icon: Phone,  label: 'Phone',   value: property.phone,   href: `tel:${cleanPhone(property.phone)}`,  bg: 'bg-white', ic: 'text-sand-600' },
            { icon: Mail,   label: 'Email',   value: property.email,   href: `mailto:${property.email}`,           bg: 'bg-white', ic: 'text-terra-600' },
            { icon: MapPin, label: 'Address', value: property.address, href: `https://maps.google.com/?q=${property.mapLat},${property.mapLng}`, bg: 'bg-white', ic: 'text-stone-600' },
          ] as const).map((c, i) => (
            <a key={i} href={c.href} target={c.icon === MapPin ? '_blank' : undefined} rel="noopener noreferrer"
              className={`reveal delay-${i + 1} ${c.bg} rounded-3xl p-8 flex flex-col items-center gap-3 border border-sand-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group`}>
              <div className="w-12 h-12 rounded-2xl bg-sand-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <c.icon size={20} className={c.ic} />
              </div>
              <p className="text-xs text-stone-400 font-semibold uppercase tracking-widest">{c.label}</p>
              <p className="text-stone-800 font-medium text-sm text-center">{c.value}</p>
            </a>
          ))}
        </div>

        {/* WhatsApp */}
        <div className="reveal bg-white border border-sand-200 rounded-3xl px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <p className="font-semibold text-stone-700 text-base">Prefer to chat?</p>
            <p className="text-stone-400 text-sm mt-0.5">We&apos;re on WhatsApp — usually respond within minutes.</p>
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-sand-50 hover:bg-sand-100 border border-sand-200 hover:border-sand-300 text-stone-700 font-medium rounded-full transition-all duration-200 text-sm"
          >
            {WA_SVG}
            Open WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
