"use client";
import ReactDOM from 'react-dom';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save, LogOut, Plus, Trash2, Home, Star, MapPin, Settings,
  ChevronDown, ChevronUp, Loader2, CheckCircle, AlertCircle,
  Wifi, BarChart2, BookOpen, TrendingUp, DollarSign, Calendar, Users
} from 'lucide-react';
import { AMENITY_CATEGORIES } from '@/lib/amenities';
import PhotoUploader from '@/components/admin/PhotoUploader';
import HeroUploader from '@/components/admin/HeroUploader';
import SectionManager from '@/components/admin/SectionManager';
import KPITab from '@/components/admin/KPITab';
import BookingsTab from '@/components/admin/BookingsTab';
import CRMTab from '@/components/admin/CRMTab';

// ─── Types ────────────────────────────────────────────────────
interface Site {
  heroImage: string; heroTitle: string; heroSubtitle: string;
  heroButtonText: string; accentColor: string; fontStyle: string;
  logoText: string; showReviews: boolean; showLocation: boolean;
  showWhyBook: boolean; footerText: string;
  googleReviewsUrl?: string;
  sections?: Array<{ id: string; label: string; enabled: boolean; locked?: boolean }>;
  [key: string]: any;
}
interface Apartment {
  id: string; slug: string; name: string; tagline: string; description: string;
  maxGuests: number; extraGuests?: number; extraGuestNote?: string;
  bedrooms: number; bathrooms: number; sizeSqm: number;
  features: { balcony: boolean; seaView: boolean; parking: boolean };
  amenities: string[];
  images: string[];
  ical: Record<string, string>;
  pricing?: Record<string, number>;
  priceFrom?: number;
  [key: string]: any;
}
interface Property {
  name: string; tagline: string; address: string;
  phone: string; email: string; whatsapp: string;
  mapLat: number; mapLng: number;
  lat?: number; lng?: number;
  minimumStay: number; instantApproval: boolean;
  [key: string]: any;
}
interface Data { apartments: Apartment[]; property: Property; site: Site; [key: string]: any; }

// Amenities loaded from @/lib/amenities

// ─── Reusable field components ────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1.5">{children}</label>;
}
function Input({ value, onChange, type = 'text', placeholder = '', step }: { value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string; step?: string | number }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} step={step}
      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 transition-all" />
  );
}
function Textarea({ value, onChange, rows = 4, placeholder = '' }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 transition-all resize-none" />
  );
}
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? 'bg-sand-600' : 'bg-stone-300'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
      </div>
      <span className="text-sm text-stone-700 group-hover:text-stone-900">{label}</span>
    </label>
  );
}


function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-stone-200" style={{overflow: "visible"}}>
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-stone-50 transition-colors">
        <h3 className="font-semibold text-stone-800">{title}</h3>
        {open ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 space-y-4 border-t border-stone-100">{children}</div>}
    </div>
  );
}



function MapPicker({ lat, lng, onChange }: { lat: number; lng: number; onChange: (lat: number, lng: number) => void }) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const latRef = React.useRef(lat);
  const lngRef = React.useRef(lng);

  // Update iframe when lat/lng props change externally (e.g. from address autocomplete)
  React.useEffect(() => {
    if (latRef.current !== lat || lngRef.current !== lng) {
      latRef.current = lat;
      lngRef.current = lng;
      iframeRef.current?.contentWindow?.postMessage({ type: 'setMarker', lat, lng }, '*');
    }
  }, [lat, lng]);

  // Listen for clicks from iframe
  React.useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'mapClick') {
        latRef.current = e.data.lat;
        lngRef.current = e.data.lng;
        onChange(Math.round(e.data.lat * 1000000) / 1000000, Math.round(e.data.lng * 1000000) / 1000000);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onChange]);

  const html = `<!DOCTYPE html><html><head>
<meta charset="utf-8"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>html,body,#map{margin:0;padding:0;height:100%;width:100%;cursor:crosshair;}</style>
</head><body><div id="map"></div><script>
var lat=${lat},lng=${lng};
var map=L.map('map').setView([lat,lng],16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OSM'}).addTo(map);
var marker=L.marker([lat,lng],{draggable:true}).addTo(map);
marker.on('dragend',function(e){var p=e.target.getLatLng();parent.postMessage({type:'mapClick',lat:p.lat,lng:p.lng},'*');});
map.on('click',function(e){marker.setLatLng(e.latlng);parent.postMessage({type:'mapClick',lat:e.latlng.lat,lng:e.latlng.lng},'*');});
window.addEventListener('message',function(e){if(e.data&&e.data.type==='setMarker'){map.setView([e.data.lat,e.data.lng],16);marker.setLatLng([e.data.lat,e.data.lng]);}});
<\/script></body></html>`;

  return (
    <div style={{ borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #e7e5e4', height: 280 }}>
      <iframe
        ref={iframeRef}
        srcDoc={html}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        title="Map picker"
      />
    </div>
  );
}

function AddressAutocomplete({ value, onChange }: {
  value: string;
  onChange: (address: string, lat: number, lng: number) => void;
}) {
  const [query, setQuery] = React.useState(value);
  const [results, setResults] = React.useState<any[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [rect, setRect] = React.useState<DOMRect | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const timerRef = React.useRef<any>(null);

  React.useEffect(() => { setQuery(value); }, [value]);

  const search = (q: string) => {
    setQuery(q);
    clearTimeout(timerRef.current);
    if (q.length < 3) { setResults([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=8&addressdetails=1&namedetails=1`,
          { headers: { 'Accept-Language': 'en', 'User-Agent': 'DekanicApartments/1.0' } }
        );
        const data = await res.json();
        setResults(data);
        if (data.length > 0 && inputRef.current) {
          setRect(inputRef.current.getBoundingClientRect());
          setOpen(true);
        } else {
          setOpen(false);
        }
      } catch {}
      setLoading(false);
    }, 400);
  };

  const pick = (item: any) => {
    // Extract house number from what user typed
    const houseNum = query.match(/\d+[a-zA-Z]?/)?.[0] || '';
    const road = item.address?.road || item.display_name.split(',')[0];
    const city = item.address?.city_district || item.address?.city || item.address?.town || item.address?.village || '';
    const postcode = item.address?.postcode || '';
    const country = item.address?.country || '';
    const streetWithNum = houseNum ? `${road} ${houseNum}` : road;
    const addr = [streetWithNum, city, postcode, country].filter(Boolean).join(', ');
    setQuery(addr);
    setOpen(false);
    setResults([]);
    onChange(addr, parseFloat(item.lat), parseFloat(item.lon));
  };

  const dropdown = open && results.length > 0 && rect ? (
    <div
      style={{
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
        backgroundColor: 'white',
        border: '1px solid #e7e5e4',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        overflow: 'visible',
      }}
    >
      {results.map((item, i) => (
        <button
          key={i}
          type="button"
          onMouseDown={() => pick(item)}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'left',
            padding: '10px 16px',
            fontSize: '0.875rem',
            color: '#44403c',
            borderBottom: i < results.length - 1 ? '1px solid #f5f5f4' : 'none',
            background: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fdf8f0')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <span style={{ fontWeight: 600 }}>
            {[item.address?.road || item.display_name.split(',')[0], query.match(/\d+[a-zA-Z]?/)?.[0]].filter(Boolean).join(' ')}
          </span>
          <span style={{ color: '#a8a29e', fontSize: '0.75rem', marginLeft: 4 }}>
            {[item.address?.city_district || item.address?.city || item.address?.town, item.address?.postcode, item.address?.country].filter(Boolean).join(', ')}
          </span>
        </button>
      ))}
    </div>
  ) : null;

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => search(e.target.value)}
        onFocus={() => {
          if (results.length > 0 && inputRef.current) {
            setRect(inputRef.current.getBoundingClientRect());
            setOpen(true);
          }
        }}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="Start typing an address…"
        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 transition-all"
      />
      {loading && (
        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
          <div className="w-4 h-4 border-2 border-sand-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {typeof document !== 'undefined' && ReactDOM.createPortal(dropdown, document.body)}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<Data | null>(null);
  const [activeTab, setActiveTab] = useState<string>('property');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetch('/api/admin/data').then(r => {
      if (r.status === 401) { router.push('/admin/login'); return null; }
      return r.json();
    }).then(d => { if (d) setData(d); });
  }, []);

  const save = async () => {
    setSaving(true); setSaved(false); setSaveError('');
    const res = await fetch('/api/admin/save', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    else setSaveError('Save failed. Make sure the dev server is running.');
  };

  const logout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  const updateProperty = (key: keyof Property, value: any) =>
    setData(d => d ? { ...d, property: { ...d.property, [key]: value } } : d);

  const updateSite = (key: keyof Site, value: any) =>
    setData(d => d ? { ...d, site: { ...d.site, [key]: value } } : d);

  
  const updatePricing = (aptIdx: number, key: string, value: any) =>
    setData(d => {
      if (!d) return d;
      const apts = [...d.apartments];
      apts[aptIdx] = { ...apts[aptIdx], pricing: { ...(apts[aptIdx] as any).pricing, [key]: value } };
      return { ...d, apartments: apts };
    });

  const updateSeason = (aptIdx: number, sIdx: number, key: string, value: any) =>
    setData(d => {
      if (!d) return d;
      const apts = [...d.apartments];
      const seasons = [...((apts[aptIdx] as any).pricing?.seasons || [])];
      seasons[sIdx] = { ...seasons[sIdx], [key]: value };
      apts[aptIdx] = { ...apts[aptIdx], pricing: { ...(apts[aptIdx] as any).pricing, seasons } };
      return { ...d, apartments: apts };
    });

  // ── Bookings helpers ──
  const removeBooking = (bIdx: number) => {
    setData((d: any) => ({ ...d, bookings: (d.bookings || []).filter((_: any, i: number) => i !== bIdx) }));
  };
  const updateBooking = (bIdx: number, key: string, value: any) => {
    setData((d: any) => {
      const bk = [...(d.bookings || [])];
      bk[bIdx] = { ...bk[bIdx], [key]: value };
      return { ...d, bookings: bk };
    });
  };

  const addSeason = (aptIdx: number) =>
    setData(d => {
      if (!d) return d;
      const apts = [...d.apartments];
      const seasons = [...((apts[aptIdx] as any).pricing?.seasons || [])];
      seasons.push({ name: 'New Season', from: '06-01', to: '08-31', nightly: 100, minStay: 3 });
      apts[aptIdx] = { ...apts[aptIdx], pricing: { ...(apts[aptIdx] as any).pricing, seasons } };
      return { ...d, apartments: apts };
    });


  const updateFee = (aptIdx: number, fIdx: number, key: string, value: any) =>
    setData(d => {
      if (!d) return d;
      const apts = [...d.apartments];
      const fees = [...((apts[aptIdx] as any).pricing?.fees || [])];
      fees[fIdx] = { ...fees[fIdx], [key]: value };
      apts[aptIdx] = { ...apts[aptIdx], pricing: { ...(apts[aptIdx] as any).pricing, fees } };
      return { ...d, apartments: apts };
    });


  const addReview = () =>
    setData((d: any) => {
      if (!d) return d;
      const id = 'r' + Date.now();
      return { ...d, reviews: [...(d.reviews || []), { id, author: '', country: 'DE', rating: 5, date: new Date().toISOString().slice(0,10), text: '', platform: 'Google', apartment: d.apartments?.[0]?.id || '' }] };
    });

  const updateReview = (rIdx: number, key: string, value: any) =>
    setData((d: any) => {
      if (!d) return d;
      const reviews = [...(d.reviews || [])];
      reviews[rIdx] = { ...reviews[rIdx], [key]: value };
      return { ...d, reviews };
    });

  const removeReview = (rIdx: number) =>
    setData((d: any) => {
      if (!d) return d;
      return { ...d, reviews: (d.reviews || []).filter((_: any, i: number) => i !== rIdx) };
    });

  const addFee = (aptIdx: number) =>
    setData(d => {
      if (!d) return d;
      const apts = [...d.apartments];
      const fees = [...((apts[aptIdx] as any).pricing?.fees || [])];
      fees.push({ name: 'New Fee', amount: 0, type: 'per_stay', showGuest: false });
      apts[aptIdx] = { ...apts[aptIdx], pricing: { ...(apts[aptIdx] as any).pricing, fees } };
      return { ...d, apartments: apts };
    });

  const removeFee = (aptIdx: number, fIdx: number) =>
    setData(d => {
      if (!d) return d;
      const apts = [...d.apartments];
      const fees = ((apts[aptIdx] as any).pricing?.fees || []).filter((_: any, i: number) => i !== fIdx);
      apts[aptIdx] = { ...apts[aptIdx], pricing: { ...(apts[aptIdx] as any).pricing, fees } };
      return { ...d, apartments: apts };
    });

  const removeSeason = (aptIdx: number, sIdx: number) =>
    setData(d => {
      if (!d) return d;
      const apts = [...d.apartments];
      const seasons = ((apts[aptIdx] as any).pricing?.seasons || []).filter((_: any, i: number) => i !== sIdx);
      apts[aptIdx] = { ...apts[aptIdx], pricing: { ...(apts[aptIdx] as any).pricing, seasons } };
      return { ...d, apartments: apts };
    });

  // ── Min Stay helpers ──
  const updateMinStaySeason = (aptIdx: number, sIdx: number, key: string, value: any) =>
    setData(d => {
      if (!d) return d;
      const apts = [...d.apartments];
      const minStaySeasons = [...((apts[aptIdx] as any).minStaySeasons || [])];
      minStaySeasons[sIdx] = { ...minStaySeasons[sIdx], [key]: value };
      apts[aptIdx] = { ...apts[aptIdx], minStaySeasons };
      return { ...d, apartments: apts };
    });

  const addMinStaySeason = (aptIdx: number) =>
    setData(d => {
      if (!d) return d;
      const apts = [...d.apartments];
      const minStaySeasons = [...((apts[aptIdx] as any).minStaySeasons || [])];
      minStaySeasons.push({ name: 'New Season', from: '06-01', to: '08-31', minStay: 3 });
      apts[aptIdx] = { ...apts[aptIdx], minStaySeasons };
      return { ...d, apartments: apts };
    });

  const removeMinStaySeason = (aptIdx: number, sIdx: number) =>
    setData(d => {
      if (!d) return d;
      const apts = [...d.apartments];
      const minStaySeasons = ((apts[aptIdx] as any).minStaySeasons || []).filter((_: any, i: number) => i !== sIdx);
      apts[aptIdx] = { ...apts[aptIdx], minStaySeasons };
      return { ...d, apartments: apts };
    });

  const updateApt = (idx: number, key: keyof Apartment, value: any) =>
    setData(d => {
      if (!d) return d;
      const apts = [...d.apartments];
      apts[idx] = { ...apts[idx], [key]: value };
      return { ...d, apartments: apts };
    });

  const updateFeature = (idx: number, key: keyof Apartment['features'], value: boolean) =>
    setData(d => {
      if (!d) return d;
      const apts = [...d.apartments];
      apts[idx] = { ...apts[idx], features: { ...apts[idx].features, [key]: value } };
      return { ...d, apartments: apts };
    });

  const toggleAmenity = (idx: number, key: string) =>
    setData(d => {
      if (!d) return d;
      const apts = [...d.apartments];
      const curr = apts[idx].amenities;
      apts[idx] = { ...apts[idx], amenities: curr.includes(key) ? curr.filter(a => a !== key) : [...curr, key] };
      return { ...d, apartments: apts };
    });

  const updateIcal = (idx: number, key: string, value: string) =>
    setData(d => {
      if (!d) return d;
      const apts = [...d.apartments];
      apts[idx] = { ...apts[idx], ical: { ...apts[idx].ical, [key]: value } };
      return { ...d, apartments: apts };
    });

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-sand-600" />
    </div>
  );

  const tabs = [
    { id: 'property', label: 'Property Info', icon: Home },
    { id: 'design', label: 'Site Design', icon: MapPin },
    ...data.apartments.map((a, i) => ({ id: `apt-${i}`, label: a.name || `Apartment ${i+1}`, icon: Star })),
    { id: 'bookings', label: 'Reservations', icon: Calendar },
    { id: 'crm', label: 'CRM', icon: Users },
    { id: 'kpi', label: 'KPI & Finance', icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-stone-100">
      {/* ── Top bar ── */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sand-600 rounded-lg flex items-center justify-center">
              <Settings size={16} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-stone-900 text-sm leading-tight">Admin Panel</p>
              <p className="text-stone-400 text-xs">Apartments Dekanić</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                <CheckCircle size={16} /> Saved!
              </span>
            )}
            {saveError && (
              <span className="flex items-center gap-1.5 text-red-500 text-sm font-medium">
                <AlertCircle size={16} /> {saveError}
              </span>
            )}
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-sand-600 hover:bg-sand-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button onClick={logout}
              className="flex items-center gap-1.5 px-4 py-2 text-stone-500 hover:text-stone-800 text-sm font-medium rounded-xl hover:bg-stone-100 transition-all">
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-6">
        {/* ── Sidebar tabs ── */}
        <aside className="w-56 flex-shrink-0">
          <nav className="space-y-1 sticky top-24">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${activeTab === tab.id ? 'bg-sand-600 text-white shadow-sm' : 'text-stone-600 hover:bg-white hover:text-stone-900'}`}>
                <tab.icon size={16} className="flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 space-y-4 min-w-0">

          {/* ── PROPERTY TAB ── */}
          {activeTab === 'property' && (
            <>
              <Section title="General Info">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Property name</Label><Input value={data.property.name} onChange={v => updateProperty('name', v)} /></div>
                  <div><Label>Tagline</Label><Input value={data.property.tagline} onChange={v => updateProperty('tagline', v)} /></div>
                </div>
                <div><Label>Full address</Label><AddressAutocomplete
                  value={data.property.address}
                  onChange={(address, lat, lng) => {
                    updateProperty('address', address);
                    updateProperty('mapLat', lat);
                    updateProperty('mapLng', lng);
                  }}
                /></div>
              </Section>

              <Section title="Contact Details">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Phone</Label><Input value={data.property.phone} onChange={v => updateProperty('phone', v)} placeholder="+385 98 484 133" /></div>
                  <div><Label>Email (shown publicly)</Label><Input value={data.property.email} onChange={v => updateProperty('email', v)} type="email" /></div>
                  <div><Label>WhatsApp number</Label><Input value={data.property.whatsapp} onChange={v => updateProperty('whatsapp', v)} placeholder="+38598484133" /></div>
                  <div>
                    <Label>Booking notification email</Label>
                    <Input value={data.property.notificationEmail || ''} onChange={v => updateProperty('notificationEmail', v)} type="email" placeholder="Same as public email if empty" />
                    <p className="text-xs text-stone-400 mt-1">Reservation requests will be sent to this address. Leave empty to use the public email above.</p>
                  </div>
                </div>
              </Section>

              <Section title="Map Location">
                <p className="text-xs text-stone-500 mb-1">Click on the map to set the exact pin location.</p>
                <MapPicker
                  lat={data.property.mapLat ?? 44.9695}
                  lng={data.property.mapLng ?? 14.7452}
                  onChange={(lat, lng) => { updateProperty('mapLat', lat); updateProperty('mapLng', lng); }}
                />
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div><Label>Latitude</Label><Input type="text" value={String(data.property.mapLat ?? 44.9695)} onChange={v => updateProperty('mapLat', parseFloat(v))} placeholder="44.9695" /></div>
                  <div><Label>Longitude</Label><Input type="text" value={String(data.property.mapLng ?? 14.7452)} onChange={v => updateProperty('mapLng', parseFloat(v))} placeholder="14.7452" /></div>
                </div>
              </Section>

              <Section title="Booking Rules">
                <Toggle checked={data.property.instantApproval} onChange={v => updateProperty('instantApproval', v)}
                  label="Instant approval (guests confirmed automatically without your review)" />
                {!data.property.instantApproval && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                    ⏳ <strong>Manual approval mode:</strong> You will receive an email for each reservation request and must confirm or decline manually.
                  </div>
                )}
              </Section>

              <Section title="Platform Fee Rates">
                <p className="text-xs text-stone-400 -mt-1 mb-4">
                  Set the commission rates you pay to each platform. These are used to auto-calculate platform fees in KPI reports. You can still override per-booking.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Airbnb host fee (%)</Label>
                    <Input type="number" step="0.1"
                      value={data.property.platformFeeRates?.airbnb ?? 3}
                      onChange={v => updateProperty('platformFeeRates', { ...(data.property.platformFeeRates || {}), airbnb: parseFloat(v) || 0 })} />
                    <p className="text-[10px] text-stone-400 mt-1">Usually ~3%</p>
                  </div>
                  <div>
                    <Label>Booking.com commission (%)</Label>
                    <Input type="number" step="0.1"
                      value={data.property.platformFeeRates?.booking ?? 15}
                      onChange={v => updateProperty('platformFeeRates', { ...(data.property.platformFeeRates || {}), booking: parseFloat(v) || 0 })} />
                    <p className="text-[10px] text-stone-400 mt-1">Usually ~15%</p>
                  </div>
                  <div>
                    <Label>Government tourist tax (%)</Label>
                    <Input type="number" step="0.1"
                      value={data.property.platformFeeRates?.governmentTax ?? 0}
                      onChange={v => updateProperty('platformFeeRates', { ...(data.property.platformFeeRates || {}), governmentTax: parseFloat(v) || 0 })} />
                    <p className="text-[10px] text-stone-400 mt-1">If applicable</p>
                  </div>
                </div>
              </Section>
            </>
          )}

          {/* ── SITE DESIGN TAB ── */}
          {activeTab === 'design' && data.site && (
            <>
              <Section title="Hero / Wallpaper">
                <p className="text-xs text-stone-400 -mt-1 mb-3">
                  This is the large full-screen photo guests see first when they open your website.
                  Best size: <strong>1920×1080px</strong> landscape.
                </p>
                <HeroUploader
                  current={data.site.heroImage}
                  folder="hero"
                  label="hero photo"
                  onChange={v => updateSite('heroImage', v)}
                />
              </Section>

              <Section title="Hero Text">
                <div className="space-y-4">
                  <div>
                    <Label>Main headline</Label>
                    <Input value={data.site.heroTitle}
                      onChange={v => updateSite('heroTitle', v)}
                      placeholder="Your paradise on Island Krk" />
                    <p className="text-xs text-stone-400 mt-1">The big white text shown over the hero photo</p>
                  </div>
                  <div>
                    <Label>Subtitle</Label>
                    <Input value={data.site.heroSubtitle}
                      onChange={v => updateSite('heroSubtitle', v)}
                      placeholder="Directly on the Adriatic coast · Baška · Croatia" />
                  </div>
                  <div>
                    <Label>Button text</Label>
                    <Input value={data.site.heroButtonText}
                      onChange={v => updateSite('heroButtonText', v)}
                      placeholder="Explore apartments" />
                  </div>
                </div>
              </Section>

              <Section title="Logo & Branding">
                <div className="space-y-4">
                  <div>
                    <Label>Logo / site name</Label>
                    <Input value={data.site.logoText}
                      onChange={v => updateSite('logoText', v)}
                      placeholder="Apartments Dekanić" />
                    <p className="text-xs text-stone-400 mt-1">Shown in the navigation bar top-left</p>
                  </div>
                  <div>
                    <Label>Accent color</Label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={data.site.accentColor}
                        onChange={e => updateSite('accentColor', e.target.value)}
                        className="w-12 h-10 rounded-lg border border-stone-200 cursor-pointer p-0.5 bg-white" />
                      <Input value={data.site.accentColor}
                        onChange={v => updateSite('accentColor', v)}
                        placeholder="#b97a3a" />
                    </div>
                    <p className="text-xs text-stone-400 mt-1">Used for buttons, highlights and accents throughout the site</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {[
                        { name: 'Sand (default)', color: '#b97a3a' },
                        { name: 'Ocean blue',     color: '#0e7490' },
                        { name: 'Olive green',    color: '#4d7c0f' },
                        { name: 'Terracotta',     color: '#c2410c' },
                        { name: 'Slate',          color: '#475569' },
                        { name: 'Rose gold',      color: '#be7c7c' },
                        { name: 'Deep navy',      color: '#1e3a5f' },
                        { name: 'Lavender',       color: '#7c3aed' },
                      ].map(p => (
                        <button key={p.color} type="button"
                          onClick={() => updateSite('accentColor', p.color)}
                          title={p.name}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:shadow-md"
                          style={{
                            borderColor: data.site.accentColor === p.color ? p.color : '#e7e5e4',
                            backgroundColor: data.site.accentColor === p.color ? p.color + '18' : 'white',
                            color: data.site.accentColor === p.color ? p.color : '#78716c',
                          }}>
                          <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Font style</Label>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      {[
                        { value: 'serif',     label: 'Serif (elegant)',  preview: 'Apartments Dekanić' },
                        { value: 'sans',      label: 'Sans-serif (modern)', preview: 'Apartments Dekanić' },
                      ].map(f => (
                        <button key={f.value} type="button"
                          onClick={() => updateSite('fontStyle', f.value)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${data.site.fontStyle === f.value ? 'border-sand-500 bg-sand-50' : 'border-stone-200 hover:border-stone-300'}`}>
                          <p className={`text-lg mb-1 ${f.value === 'serif' ? 'font-serif' : 'font-sans'}`}>{f.preview}</p>
                          <p className="text-xs text-stone-400">{f.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Page Sections & Order" defaultOpen={true}>
                <p className="text-xs text-stone-400 -mt-1 mb-4">
                  Control which sections appear on your homepage and in what order.
                  Changes take effect after saving.
                </p>
                <SectionManager
                  sections={(data.site as any).sections || []}
                  onChange={v => updateSite('sections' as any, v)}
                />
              </Section>

              <Section title="Footer">
                <div>
                  <Label>Footer text</Label>
                  <Input value={data.site.footerText}
                    onChange={v => updateSite('footerText', v)}
                    placeholder="© 2025 Apartments Dekanić · Baška, Island Krk, Croatia" />
                </div>
              </Section>
            </>
          )}


          {/* ── REVIEWS ── */}
          {activeTab === '__site__' && (
            <Section title={`Guest Reviews (${(data.reviews||[]).length})`} defaultOpen={false}>

              {/* How-to banner */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5 flex gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                <div className="text-xs text-blue-700 space-y-1">
                  <p className="font-bold">Airbnb & Booking.com do not allow automatic review import.</p>
                  <p>You need to copy reviews manually from each platform. Here&apos;s how:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-blue-600">
                    <li><span className="font-semibold">Airbnb:</span> Go to airbnb.com → Hosting → Reviews → copy each review text + guest name + date</li>
                    <li><span className="font-semibold">Booking.com:</span> Go to extranet.booking.com → Reviews → copy text. Rating is out of 10 — enter the exact score (e.g. 9.2)</li>
                    <li><span className="font-semibold">Google:</span> Open your Google Business profile → Reviews → copy text + star count</li>
                  </ul>
                  <p className="pt-1 text-blue-500">After adding all reviews, press <span className="font-bold">Save</span> once at the top. No need to save after each one.</p>
                </div>
              </div>

              {/* Quick-add shortcuts */}
              <div className="flex flex-wrap gap-2 mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 w-full">Quick add:</p>
                {(['Airbnb', 'Booking.com', 'Google', 'Direct'] as const).map(platform => (
                  <button key={platform} type="button"
                    onClick={() => {
                      const id = `r_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
                      const defaultRating = platform === 'Booking.com' ? 9.0 : 5;
                      setData((d: any) => ({ ...d, reviews: [...(d.reviews || []), {
                        id, author: '', country: 'DE', rating: defaultRating,
                        date: new Date().toISOString().slice(0,10),
                        text: '', platform, apartment: d.apartments?.[0]?.id || ''
                      }]}));
                      setTimeout(() => {
                        const els = document.querySelectorAll('[data-review-author]');
                        const last = els[els.length - 1] as HTMLInputElement;
                        last?.focus();
                      }, 50);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      platform === 'Airbnb' ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100' :
                      platform === 'Booking.com' ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' :
                      platform === 'Google' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' :
                      'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                    + {platform}
                  </button>
                ))}
              </div>

              {/* Column headers */}
              {(data.reviews?.length > 0) && (
                <div className="grid grid-cols-[1fr_72px_100px_90px_44px] gap-2 px-1 mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Author</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Country</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Platform</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 text-center">Rating</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400"></p>
                </div>
              )}

              <div className="space-y-3">
                {(data.reviews || []).map((review: any, rIdx: number) => (
                  <div key={review.id} className="bg-stone-50 rounded-2xl p-4 border border-stone-100 space-y-2">
                    {/* Row 1: name, country, platform, stars, delete */}
                    <div className="grid grid-cols-[1fr_72px_100px_90px_44px] gap-2 items-center">
                      <input data-review-author value={review.author} onChange={e => updateReview(rIdx, 'author', e.target.value)} placeholder="Guest name (e.g. Maria K.)"
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sand-200" />
                      <Input value={review.country} onChange={v => updateReview(rIdx, 'country', v.toUpperCase().slice(0,2))} placeholder="DE" />
                      <select value={review.platform} onChange={e => updateReview(rIdx, 'platform', e.target.value)}
                        className="w-full px-2 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sand-200">
                        <option>Google</option>
                        <option>Airbnb</option>
                        <option>Booking.com</option>
                        <option>Direct</option>
                      </select>
                      {/* Star/score rating — Booking.com /10, others /5 */}
                      <div className="flex flex-col items-center gap-0.5">
                        {review.platform === 'Booking.com' ? (
                          <div className="flex items-center gap-1">
                            <input type="number" min="1" max="10" step="0.1"
                              value={review.rating}
                              onChange={e => updateReview(rIdx, 'rating', Math.min(10, Math.max(1, Number(e.target.value))))}
                              className="w-14 px-1.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-800 text-sm text-center focus:outline-none focus:ring-2 focus:ring-sand-200" />
                            <span className="text-xs text-stone-400">/10</span>
                          </div>
                        ) : (
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <button key={s} type="button" onClick={() => updateReview(rIdx, 'rating', s)}
                                className={`text-lg leading-none transition-colors ${s <= review.rating ? 'text-amber-400' : 'text-stone-200 hover:text-amber-300'}`}>
                                ★
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button type="button" onClick={() => removeReview(rIdx)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-200">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                      </button>
                    </div>
                    {/* Row 2: review text */}
                    <textarea
                      value={review.text}
                      onChange={e => updateReview(rIdx, 'text', e.target.value)}
                      rows={2}
                      placeholder="Paste the review text here…"
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sand-200"
                    />
                    {/* Row 3: date + apartment */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Date</Label>
                        <Input type="date" value={review.date} onChange={v => updateReview(rIdx, 'date', v)} />
                      </div>
                      <div>
                        <Label>Apartment</Label>
                        <select value={review.apartment} onChange={e => updateReview(rIdx, 'apartment', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sand-200">
                          <option value="">All apartments</option>
                          {data.apartments.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!(data.reviews?.length) && (
                <div className="text-center py-8 text-stone-400 text-xs border-2 border-dashed border-stone-200 rounded-2xl">
                  <p className="font-semibold mb-1 text-sm">No reviews yet</p>
                  <p>Click "Add review" to add your first guest review.</p>
                </div>
              )}

              {/* bottom add button removed — use Quick Add above */}
            </Section>
          )}

          {/* ── APARTMENT TABS ── */}
          {data.apartments.map((apt, idx) => activeTab === `apt-${idx}` && (
            <div key={apt.id} className="space-y-4">
              <Section title="Basic Info">
                {/* Name & Tagline */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Apartment name</Label>
                    <Input value={apt.name} onChange={v => updateApt(idx, 'name', v)} placeholder="e.g. Studio with Sea View" />
                  </div>
                  <div>
                    <Label>Tagline</Label>
                    <Input value={apt.tagline} onChange={v => updateApt(idx, 'tagline', v)} placeholder="e.g. Perfect for couples" />
                  </div>
                </div>

                {/* Capacity & Size — big visual tiles */}
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Capacity &amp; Size</p>
                  <div className="grid grid-cols-4 gap-3">
                    {/* Max Guests */}
                    <div className="flex flex-col items-center gap-2 bg-sand-50 border border-sand-200 rounded-2xl py-4 px-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b97a3a" strokeWidth="1.8">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      <div className="flex items-center gap-1">
                        <button type="button"
                          onClick={(e) => { e.preventDefault(); updateApt(idx, 'maxGuests', Math.max(1, ((apt as any).maxGuests || 1) - 1)); }}
                          className="w-6 h-6 rounded-lg bg-white border border-sand-200 flex items-center justify-center text-sand-600 hover:bg-sand-100 transition-colors text-xs font-bold">−</button>
                        <span className="w-6 text-center font-bold text-lg text-stone-900 tabular-nums">{(apt as any).maxGuests || 0}</span>
                        <button type="button"
                          onClick={(e) => { e.preventDefault(); updateApt(idx, 'maxGuests', ((apt as any).maxGuests || 0) + 1); }}
                          className="w-6 h-6 rounded-lg bg-white border border-sand-200 flex items-center justify-center text-sand-600 hover:bg-sand-100 transition-colors text-xs font-bold">+</button>
                      </div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 text-center">Max guests</p>
                    </div>

                    {/* Bedrooms */}
                    <div className="flex flex-col items-center gap-2 bg-sand-50 border border-sand-200 rounded-2xl py-4 px-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b97a3a" strokeWidth="1.8">
                        <path d="M2 9V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4"/><path d="M2 13v7h20v-7"/>
                        <path d="M6 13v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/>
                      </svg>
                      <div className="flex items-center gap-1">
                        <button type="button"
                          onClick={(e) => { e.preventDefault(); updateApt(idx, 'bedrooms', Math.max(0, ((apt as any).bedrooms || 0) - 1)); }}
                          className="w-6 h-6 rounded-lg bg-white border border-sand-200 flex items-center justify-center text-sand-600 hover:bg-sand-100 transition-colors text-xs font-bold">−</button>
                        <span className="w-6 text-center font-bold text-lg text-stone-900 tabular-nums">{(apt as any).bedrooms || 0}</span>
                        <button type="button"
                          onClick={(e) => { e.preventDefault(); updateApt(idx, 'bedrooms', ((apt as any).bedrooms || 0) + 1); }}
                          className="w-6 h-6 rounded-lg bg-white border border-sand-200 flex items-center justify-center text-sand-600 hover:bg-sand-100 transition-colors text-xs font-bold">+</button>
                      </div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 text-center">Bedrooms</p>
                    </div>

                    {/* Bathrooms */}
                    <div className="flex flex-col items-center gap-2 bg-sand-50 border border-sand-200 rounded-2xl py-4 px-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b97a3a" strokeWidth="1.8">
                        <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>
                        <line x1="10" y1="5" x2="8" y2="7"/><line x1="2" y1="12" x2="22" y2="12"/>
                      </svg>
                      <div className="flex items-center gap-1">
                        <button type="button"
                          onClick={(e) => { e.preventDefault(); updateApt(idx, 'bathrooms', Math.max(0, ((apt as any).bathrooms || 0) - 1)); }}
                          className="w-6 h-6 rounded-lg bg-white border border-sand-200 flex items-center justify-center text-sand-600 hover:bg-sand-100 transition-colors text-xs font-bold">−</button>
                        <span className="w-6 text-center font-bold text-lg text-stone-900 tabular-nums">{(apt as any).bathrooms || 0}</span>
                        <button type="button"
                          onClick={(e) => { e.preventDefault(); updateApt(idx, 'bathrooms', ((apt as any).bathrooms || 0) + 1); }}
                          className="w-6 h-6 rounded-lg bg-white border border-sand-200 flex items-center justify-center text-sand-600 hover:bg-sand-100 transition-colors text-xs font-bold">+</button>
                      </div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 text-center">Bathrooms</p>
                    </div>

                    {/* Size m² */}
                    <div className="flex flex-col items-center gap-2 bg-sand-50 border border-sand-200 rounded-2xl py-4 px-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b97a3a" strokeWidth="1.8">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/>
                      </svg>
                      <div className="flex items-center gap-1">
                        <button type="button"
                          onClick={(e) => { e.preventDefault(); updateApt(idx, 'sizeSqm', Math.max(0, ((apt as any).sizeSqm || 0) - 5)); }}
                          className="w-6 h-6 rounded-lg bg-white border border-sand-200 flex items-center justify-center text-sand-600 hover:bg-sand-100 transition-colors text-xs font-bold">−</button>
                        <span className="w-8 text-center font-bold text-lg text-stone-900 tabular-nums">{(apt as any).sizeSqm || 0}</span>
                        <button type="button"
                          onClick={(e) => { e.preventDefault(); updateApt(idx, 'sizeSqm', ((apt as any).sizeSqm || 0) + 5); }}
                          className="w-6 h-6 rounded-lg bg-white border border-sand-200 flex items-center justify-center text-sand-600 hover:bg-sand-100 transition-colors text-xs font-bold">+</button>
                      </div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 text-center">Size (m²)</p>
                    </div>
                  </div>
                  <p className="text-xs text-stone-400 mt-2">Size increments by 5 m². These values appear on the apartment listing page.</p>
                </div>

                {/* Description */}
                <div>
                  <Label>Description</Label>
                  <Textarea value={apt.description} onChange={v => updateApt(idx, 'description', v)} rows={5}
                    placeholder="Describe the apartment — views, atmosphere, what makes it special…" />
                </div>
              </Section>

              <Section title="Capacity & Size">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div><Label>Bedrooms</Label><Input type="number" value={apt.bedrooms} onChange={v => updateApt(idx, 'bedrooms', parseInt(v) || 0)} /></div>
                  <div><Label>Bathrooms</Label><Input type="number" value={apt.bathrooms} onChange={v => updateApt(idx, 'bathrooms', parseInt(v) || 0)} /></div>
                  <div><Label>Size (m²)</Label><Input type="number" value={apt.sizeSqm} onChange={v => updateApt(idx, 'sizeSqm', parseInt(v) || 0)} /></div>
                </div>

                {/* Guest capacity with +extra support */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-stone-700 mb-0.5">Guest capacity</p>
                    <p className="text-xs text-stone-400">Supports formats like 2+2, 4+2 (main beds + sofa/extra beds)</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Main guests</Label>
                      <Input type="number" value={apt.maxGuests}
                        onChange={v => updateApt(idx, 'maxGuests', parseInt(v) || 0)} />
                      <p className="text-xs text-stone-400 mt-1">In proper beds / bedrooms</p>
                    </div>
                    <div>
                      <Label>Extra guests</Label>
                      <Input type="number" value={(apt as any).extraGuests || 0}
                        onChange={v => updateApt(idx, 'extraGuests' as any, parseInt(v) || 0)} />
                      <p className="text-xs text-stone-400 mt-1">On sofa bed / pull-out / rollaway</p>
                    </div>
                  </div>
                  {/* Live preview */}
                  <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-stone-800">
                      {apt.maxGuests}{(apt as any).extraGuests > 0 ? `+${(apt as any).extraGuests}` : ''} guests
                    </span>
                    <span className="text-xs text-stone-400">
                      Total: {apt.maxGuests + ((apt as any).extraGuests || 0)} people maximum
                    </span>
                  </div>
                  {(apt as any).extraGuests > 0 && (
                    <div>
                      <Label>Extra sleeping note</Label>
                      <Input type="text" value={(apt as any).extraGuestNote || ''}
                        onChange={v => updateApt(idx, 'extraGuestNote' as any, v)}
                        placeholder="e.g. Sofa bed in the living room (suitable for 2 adults)" />
                    </div>
                  )}
                  {/* Quick presets */}
                  <div>
                    <p className="text-xs text-stone-400 mb-2">Quick presets:</p>
                    <div className="flex flex-wrap gap-2">
                      {[['2+0','2','0'],['2+1','2','1'],['2+2','2','2'],['4+0','4','0'],['4+2','4','2'],['6+2','6','2']].map(([label,m,e])=>(
                        <button key={label} type="button"
                          onClick={() => { updateApt(idx,'maxGuests',parseInt(m)); updateApt(idx,'extraGuests' as any,parseInt(e)); }}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                            ${apt.maxGuests===parseInt(m)&&((apt as any).extraGuests||0)===parseInt(e)
                              ?'bg-sand-600 text-white border-sand-600'
                              :'bg-white text-stone-600 border-stone-200 hover:border-sand-400'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Features">
                <div className="space-y-3">
                  <Toggle checked={apt.features.seaView} onChange={v => updateFeature(idx, 'seaView', v)} label="🌊 Sea view" />
                  <Toggle checked={apt.features.balcony} onChange={v => updateFeature(idx, 'balcony', v)} label="🌅 Balcony / terrace" />
                  <Toggle checked={apt.features.parking} onChange={v => updateFeature(idx, 'parking', v)} label="🅿️ Free parking" />
                </div>
              </Section>

              <Section title={apt.amenities.length > 0 ? `Amenities · ${apt.amenities.length} selected` : "Amenities"}>
                <div className="space-y-5">
                  {AMENITY_CATEGORIES.map(cat => (
                    <div key={cat.category}>
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{cat.category}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {cat.items.map(a => {
                          const active = apt.amenities.includes(a.key);
                          return (
                            <button key={a.key} type="button" onClick={() => toggleAmenity(idx, a.key)}
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${active ? 'bg-sand-600 text-white border-sand-600' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-sand-400'}`}>
                              <span className="text-base leading-none flex-shrink-0">{a.icon}</span>
                              <span className="leading-tight">{a.label}</span>
                              {active && <CheckCircle size={13} className="ml-auto flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title={apt.images.length > 0 ? `Photos · ${apt.images.length} photos` : "Photos"} defaultOpen={true}>
                <PhotoUploader
                  folder={`apt${idx+1}`}
                  photos={apt.images}
                  onChange={imgs => updateApt(idx, 'images', imgs)}
                />
              </Section>

              <Section title="Minimum Stay Rules" defaultOpen={true}>
                <p className="text-xs text-stone-400 -mt-1 mb-4">
                  Set minimum night requirements per season. Guests will be blocked from booking shorter stays. Dates use MM-DD format.
                </p>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-stone-600 uppercase tracking-widest">Seasonal Minimum Stays</p>
                  <button type="button" onClick={() => addMinStaySeason(idx)}
                    className="text-xs font-semibold text-sand-700 hover:text-sand-900 bg-sand-50 hover:bg-sand-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                    + Add season
                  </button>
                </div>
                <div className="space-y-3">
                  {((apt as any).minStaySeasons || []).map((season: any, sIdx: number) => (
                    <div key={sIdx} className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
                      <div className="grid grid-cols-[1fr_72px_72px_72px_32px] gap-2 items-end">
                        <div>
                          <Label>Season name</Label>
                          <Input value={season.name} onChange={v => updateMinStaySeason(idx, sIdx, 'name', v)} placeholder="High Season" />
                        </div>
                        <div>
                          <Label>From (MM-DD)</Label>
                          <Input value={season.from} onChange={v => updateMinStaySeason(idx, sIdx, 'from', v)} placeholder="07-01" />
                        </div>
                        <div>
                          <Label>To (MM-DD)</Label>
                          <Input value={season.to} onChange={v => updateMinStaySeason(idx, sIdx, 'to', v)} placeholder="08-31" />
                        </div>
                        <div>
                          <Label>Min nights</Label>
                          <Input type="number" value={season.minStay} onChange={v => updateMinStaySeason(idx, sIdx, 'minStay', Number(v))} placeholder="3" />
                        </div>
                        <button type="button" onClick={() => removeMinStaySeason(idx, sIdx)}
                          className="mb-0.5 self-end text-stone-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                      <p className="text-[10px] text-stone-400 mt-2">
                        {season.name}: {season.from} → {season.to} · min {season.minStay} nights
                        {season.from > season.to ? ' · ⚠ Wraps year end' : ''}
                      </p>
                    </div>
                  ))}
                  {!((apt as any).minStaySeasons?.length) && (
                    <p className="text-xs text-stone-400 text-center py-4">No minimum-stay seasons yet — all dates use a default of 1 night.</p>
                  )}
                </div>
              </Section>

              <Section title="Calendar Sync (iCal)" defaultOpen={false}>
                <p className="text-xs text-stone-400 -mt-1 mb-3">Paste your iCal export URLs from Airbnb and Booking.com. Booked dates will automatically show as unavailable on your website.</p>
                <div className="space-y-3">
                  <div>
                    <Label>Airbnb iCal URL</Label>
                    <Input value={apt.ical.airbnb || ''} onChange={v => updateIcal(idx, 'airbnb', v)}
                      placeholder="https://www.airbnb.com/calendar/ical/XXXXX.ics?t=..." />
                  </div>
                  <div>
                    <Label>Booking.com iCal URL</Label>
                    <Input value={apt.ical.booking || ''} onChange={v => updateIcal(idx, 'booking', v)}
                      placeholder="https://ical.booking.com/v1/export?t=..." />
                  </div>
                  <div>
                    <Label>Other platform (optional)</Label>
                    <Input value={apt.ical.other || ''} onChange={v => updateIcal(idx, 'other', v)}
                      placeholder="https://..." />
                  </div>
                </div>
                <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 space-y-1">
                  <p><strong>Airbnb:</strong> Listing → Availability → Export Calendar</p>
                  <p><strong>Booking.com:</strong> Property → Calendar → iCal Export</p>
                </div>
              </Section>

              <Section title="Pricing" defaultOpen={true}>
                <p className="text-xs text-stone-400 -mt-1 mb-4">
                  Set your nightly rates. Add seasons to override the base price for specific periods.
                  Dates use MM-DD format (e.g. 07-01 = July 1st). First matching season wins.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <Label>Base nightly rate (€)</Label>
                    <Input type="number" value={(apt as any).pricing?.defaultNightly ?? 80}
                      onChange={v => updatePricing(idx, 'defaultNightly', Number(v))}
                      placeholder="80" />
                    <p className="text-xs text-stone-400 mt-1">Used when no season matches</p>
                  </div>

                </div>

                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-stone-600 uppercase tracking-widest">Seasonal Prices</p>
                  <button type="button" onClick={() => addSeason(idx)}
                    className="text-xs font-semibold text-sand-700 hover:text-sand-900 bg-sand-50 hover:bg-sand-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                    + Add season
                  </button>
                </div>

                <div className="space-y-3">
                  {((apt as any).pricing?.seasons || []).map((season: any, sIdx: number) => (
                    <div key={sIdx} className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
                      <div className="grid grid-cols-[1fr_72px_72px_72px_32px] gap-2 items-end">
                        <div>
                          <Label>Season name</Label>
                          <Input value={season.name} onChange={v => updateSeason(idx, sIdx, 'name', v)} placeholder="High Season" />
                        </div>
                        <div>
                          <Label>From (MM-DD)</Label>
                          <Input value={season.from} onChange={v => updateSeason(idx, sIdx, 'from', v)} placeholder="07-01" />
                        </div>
                        <div>
                          <Label>To (MM-DD)</Label>
                          <Input value={season.to} onChange={v => updateSeason(idx, sIdx, 'to', v)} placeholder="08-31" />
                        </div>
                        <div>
                          <Label>€/night</Label>
                          <Input type="number" value={season.nightly} onChange={v => updateSeason(idx, sIdx, 'nightly', Number(v))} placeholder="120" />
                        </div>
                        <button type="button" onClick={() => removeSeason(idx, sIdx)}
                          className="mb-0.5 self-end text-stone-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                      <p className="text-[10px] text-stone-400 mt-2">
                        {season.name}: {season.from} → {season.to} · €{season.nightly}/night
                        {season.from > season.to ? ' · ⚠ Wraps year end (Oct→May style)' : ''}
                      </p>
                    </div>
                  ))}
                  {!((apt as any).pricing?.seasons?.length) && (
                    <p className="text-xs text-stone-400 text-center py-4">No seasons yet — all dates use the base rate.</p>
                  )}
                </div>
              
                {/* ── Costs & Fees ── */}
                <div className="mt-6 pt-5 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-bold text-stone-700 uppercase tracking-widest">Costs & Fees</p>
                      <p className="text-xs text-stone-400 mt-0.5">Add all your costs. Toggle the eye icon to control what guests see in the price breakdown.</p>
                    </div>
                    <button type="button" onClick={() => addFee(idx)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-sand-700 hover:text-sand-900 bg-sand-50 hover:bg-sand-100 border border-sand-200 px-3 py-2 rounded-xl transition-colors whitespace-nowrap">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                      Add cost
                    </button>
                  </div>

                  {/* Column headers */}
                  {((apt as any).pricing?.fees?.length > 0) && (
                    <div className="grid grid-cols-[1fr_90px_130px_44px_44px] gap-2 px-1 mb-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Name</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Amount</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Type</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 text-center">Guest</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400"></p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {((apt as any).pricing?.fees || []).map((fee: any, fIdx: number) => (
                      <div key={fIdx} className="grid grid-cols-[1fr_90px_130px_44px_44px] gap-2 items-center bg-stone-50 rounded-xl p-2.5 border border-stone-100">
                        {/* Name */}
                        <Input value={fee.name} onChange={v => updateFee(idx, fIdx, 'name', v)} placeholder="e.g. Cleaning fee" />
                        {/* Amount */}
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-medium">€</span>
                          <input
                            type="number" min="0" step="0.5"
                            value={fee.amount}
                            onChange={e => updateFee(idx, fIdx, 'amount', Number(e.target.value))}
                            className="w-full pl-6 pr-2 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sand-200"
                          />
                        </div>
                        {/* Type */}
                        <select
                          value={fee.type}
                          onChange={e => updateFee(idx, fIdx, 'type', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sand-200">
                          <option value="per_stay">Per stay (flat)</option>
                          <option value="per_night">Per night</option>
                          <option value="per_person">Per person</option>
                        </select>
                        {/* Show guest toggle */}
                        <button
                          type="button"
                          title={fee.showGuest ? 'Shown to guest — click to hide' : 'Hidden from guest — click to show'}
                          onClick={() => updateFee(idx, fIdx, 'showGuest', !fee.showGuest)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border
                            ${fee.showGuest
                              ? 'bg-sand-50 border-sand-300 text-sand-700 hover:bg-sand-100'
                              : 'bg-stone-100 border-stone-200 text-stone-400 hover:bg-stone-200'}`}>
                          {fee.showGuest ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          )}
                        </button>
                        {/* Delete */}
                        <button type="button" onClick={() => removeFee(idx, fIdx)}
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-200">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  {!((apt as any).pricing?.fees?.length) && (
                    <div className="text-center py-6 text-stone-400 text-xs border-2 border-dashed border-stone-200 rounded-2xl">
                      <p className="font-semibold mb-1">No costs added yet</p>
                      <p>Click "Add cost" to add cleaning fees, tourist tax, linen, etc.</p>
                    </div>
                  )}

                  {/* Legend */}
                  {((apt as any).pricing?.fees?.length > 0) && (
                    <div className="flex gap-4 mt-3 text-xs text-stone-400">
                      <span className="flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#b97a3a" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        Shown in guest price breakdown
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a89885" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        Hidden (host view only — for profit tracking)
                      </span>
                    </div>
                  )}
                </div>

              </Section>

            </div>
          ))}

          {/* ══════════════════════════════════════════════
              KPI & FINANCE TAB
          ══════════════════════════════════════════════ */}
          {/* ── MANUAL RESERVATIONS TAB ── */}
          {activeTab === 'bookings' && (
            <BookingsTab data={data} setData={setData} />
          )}

          {activeTab === 'crm' && (
            <CRMTab data={data} setData={setData} />
          )}

          {activeTab === 'kpi' && (
            <KPITab data={data} setData={setData} />
          )}
        </main>
      </div>
    </div>
  );
}
