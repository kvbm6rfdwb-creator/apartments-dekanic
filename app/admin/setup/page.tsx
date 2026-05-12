"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft,
  Home, User, Building2, Wifi, Camera, Calendar, Rocket, Lock
} from 'lucide-react';
import { AMENITY_CATEGORIES } from '@/lib/amenities';
import PhotoUploader from '@/components/admin/PhotoUploader';

// ── Step definitions ──────────────────────────────────────────
const STEPS = [
  { id: 'welcome',   title: 'Welcome',          icon: Rocket },
  { id: 'account',   title: 'Create Account',   icon: Lock },
  { id: 'property',  title: 'Property Details', icon: Home },
  { id: 'apartment', title: 'Your Apartment',   icon: Building2 },
  { id: 'amenities', title: 'Amenities',        icon: Wifi },
  { id: 'photos',    title: 'Photos',           icon: Camera },
  { id: 'calendar',  title: 'Calendar Sync',    icon: Calendar },
  { id: 'done',      title: 'All Done!',        icon: CheckCircle },
];

const AMENITY_OPTIONS = [
  { key: 'wifi',        label: 'Wi-Fi',            icon: '📶' },
  { key: 'ac',          label: 'Air Conditioning',  icon: '❄️' },
  { key: 'kitchen',     label: 'Full Kitchen',      icon: '🍳' },
  { key: 'tv',          label: 'Smart TV',          icon: '📺' },
  { key: 'washer',      label: 'Washing Machine',   icon: '🫧' },
  { key: 'dishwasher',  label: 'Dishwasher',        icon: '🍽️' },
  { key: 'coffee',      label: 'Coffee Machine',    icon: '☕' },
  { key: 'bbq',         label: 'BBQ Grill',         icon: '🔥' },
  { key: 'pool',        label: 'Swimming Pool',     icon: '🏊' },
  { key: 'parking',     label: 'Free Parking',      icon: '🅿️' },
  { key: 'petFriendly', label: 'Pet Friendly',      icon: '🐾' },
  { key: 'beachTowels', label: 'Beach Towels',      icon: '🏖️' },
  { key: 'beachAccess', label: 'Beach Access',      icon: '🌊' },
  { key: 'terrace',     label: 'Terrace',           icon: '🌅' },
  { key: 'seaView',     label: 'Sea View',          icon: '👁️' },
];

// ── Reusable components ───────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-stone-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-stone-400 mt-1.5">{hint}</p>}
    </div>
  );
}
function Input({ value, onChange, type = 'text', placeholder = '', required = false }:
  { value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} required={required}
      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 transition-all placeholder:text-stone-300" />
  );
}
function Textarea({ value, onChange, rows = 4, placeholder = '' }:
  { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 transition-all resize-none placeholder:text-stone-300" />
  );
}
function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div onClick={() => onChange(!checked)}
        className={`relative mt-0.5 w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? 'bg-sand-600' : 'bg-stone-300'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-stone-800">{label}</p>
        {hint && <p className="text-xs text-stone-400 mt-0.5">{hint}</p>}
      </div>
    </label>
  );
}

// ── Main Setup Wizard ─────────────────────────────────────────
export default function SetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  // Account
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  // Property
  const [propertyName, setPropertyName] = useState('Apartments Dekanić');
  const [tagline, setTagline] = useState('Baška · Island Krk · Croatia');
  const [address, setAddress] = useState('Skopalj 19, Baška, Otok Krk');
  const [phone, setPhone] = useState('+385 98 484 133');
  const [email, setEmail] = useState('dekanic.lucija@gmail.com');
  const [whatsapp, setWhatsapp] = useState('+38598484133');
  const [minimumStay, setMinimumStay] = useState('3');
  const [instantApproval, setInstantApproval] = useState(false);

  // Apartment
  const [aptName, setAptName] = useState('');
  const [aptTagline, setAptTagline] = useState('');
  const [aptDescription, setAptDescription] = useState('');
  const [maxGuests, setMaxGuests] = useState('');
  const [extraGuests, setExtraGuests] = useState('');
  const [extraGuestNote, setExtraGuestNote] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [sizeSqm, setSizeSqm] = useState('');
  const [seaView, setSeaView] = useState(false);
  const [balcony, setBalcony] = useState(false);
  const [parking, setParking] = useState(false);

  // Amenities
  const [amenities, setAmenities] = useState<string[]>([]);

  // Photos
  const [photos, setPhotos] = useState<string[]>([]);

  // iCal
  const [airbnbIcal, setAirbnbIcal] = useState('');
  const [bookingIcal, setBookingIcal] = useState('');

  const toggleAmenity = (key: string) =>
    setAmenities(prev => prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]);

  const canProceed = () => {
    if (step === 1) return password.length >= 6 && password === password2;
    if (step === 2) return !!propertyName && !!email && !!phone;
    if (step === 3) return !!aptName && !!maxGuests;
    return true;
  };

  const buildData = () => ({
    apartments: [{
      id: 'apt1', slug: 'apartment-1',
      name: aptName || 'Apartment 1',
      tagline: aptTagline,
      description: aptDescription,
      maxGuests: parseInt(maxGuests) || 0,
      extraGuests: parseInt(extraGuests) || 0,
      extraGuestNote: extraGuestNote,
      bedrooms: parseInt(bedrooms) || 0,
      bathrooms: parseInt(bathrooms) || 0,
      sizeSqm: parseInt(sizeSqm) || 0,
      features: { seaView, balcony, parking },
      amenities,
      images: photos,
      ical: { airbnb: airbnbIcal, booking: bookingIcal },
    },
    // Placeholders for remaining apartments
    { id: 'apt2', slug: 'apartment-2', name: 'Apartment 2', tagline: '', description: '', maxGuests: 0, bedrooms: 0, bathrooms: 0, sizeSqm: 0, features: { seaView: false, balcony: false, parking: false }, amenities: [], images: ['/images/apt2/01.jpg'], ical: { airbnb: '', booking: '' } },
    { id: 'apt3', slug: 'apartment-3', name: 'Apartment 3', tagline: '', description: '', maxGuests: 0, bedrooms: 0, bathrooms: 0, sizeSqm: 0, features: { seaView: false, balcony: false, parking: false }, amenities: [], images: ['/images/apt3/01.jpg'], ical: { airbnb: '', booking: '' } },
    ],
    property: {
      name: propertyName, tagline, address, phone, email,
      whatsapp: whatsapp.replace(/\s/g, ''),
      mapLat: 44.9641, mapLng: 14.7574,
      minimumStay: parseInt(minimumStay) || 3,
      instantApproval,
    },
  });

  const handleFinish = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, data: buildData() }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Something went wrong.'); setLoading(false); return;
      }
      setStep(7); // Done!
    } catch {
      setError('Network error. Make sure the server is running.'); setLoading(false);
    }
  };

  const next = () => {
    if (step === 6) { handleFinish(); return; }
    setStep(s => s + 1);
  };
  const back = () => setStep(s => s - 1);

  const progress = Math.round((step / (STEPS.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 via-white to-stone-50 flex flex-col">
      {/* ── Header ── */}
      <header className="bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 38 38" fill="none">
            <circle cx="19" cy="19" r="18" stroke="#b97a3a" strokeWidth="1.2"/>
            <path d="M11 26 L19 10 L27 26" stroke="#b97a3a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="13.5" y1="21.5" x2="24.5" y2="21.5" stroke="#b97a3a" strokeWidth="1.1" strokeLinecap="round"/>
            <circle cx="19" cy="28" r="1.5" fill="#b97a3a"/>
          </svg>
          <div>
            <p className="font-serif text-stone-900 text-base leading-tight">Apartments Dekanić</p>
            <p className="text-stone-400 text-xs">First-time setup</p>
          </div>
        </div>
        <div className="text-xs text-stone-400">Step {step + 1} of {STEPS.length}</div>
      </header>

      {/* ── Progress bar ── */}
      {step > 0 && step < STEPS.length - 1 && (
        <div className="bg-white border-b border-stone-100 px-6 py-3">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              {STEPS.slice(1, -1).map((s, i) => (
                <div key={s.id} className="flex items-center gap-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i + 1 < step ? 'bg-emerald-500 text-white' : i + 1 === step ? 'bg-sand-600 text-white ring-4 ring-sand-100' : 'bg-stone-200 text-stone-400'}`}>
                    {i + 1 < step ? <CheckCircle size={12} /> : i + 1}
                  </div>
                  {i < STEPS.length - 3 && <div className={`w-8 h-0.5 ${i + 1 < step ? 'bg-emerald-500' : 'bg-stone-200'}`} />}
                </div>
              ))}
            </div>
            <p className="text-xs text-stone-400 text-center">{STEPS[step]?.title}</p>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl">

          {/* ── STEP 0: Welcome ── */}
          {step === 0 && (
            <div className="text-center space-y-8">
              <div>
                <div className="w-20 h-20 bg-gradient-to-br from-sand-500 to-sand-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-sand-200">
                  <Rocket size={36} className="text-white" />
                </div>
                <h1 className="font-serif text-4xl text-stone-900 mb-3">Welcome to your<br /><span className="italic text-sand-600">new website!</span></h1>
                <p className="text-stone-500 text-lg max-w-md mx-auto leading-relaxed">
                  Let's get everything set up in about <strong>5 minutes</strong>. We'll walk you through it step by step.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { icon: Lock, label: 'Create your password', color: 'bg-blue-50 text-blue-600' },
                  { icon: Home, label: 'Add property details', color: 'bg-sand-50 text-sand-700' },
                  { icon: Calendar, label: 'Connect your calendars', color: 'bg-emerald-50 text-emerald-600' },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
                    <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-3`}>
                      <item.icon size={20} />
                    </div>
                    <p className="text-sm text-stone-600 font-medium leading-tight">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 text-sm text-amber-700 text-left">
                <p className="font-semibold mb-1">💡 You can always change everything later</p>
                <p>All settings are editable from the admin panel at any time. Don't worry about getting everything perfect now.</p>
              </div>
            </div>
          )}

          {/* ── STEP 1: Account ── */}
          {step === 1 && (
            <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm space-y-6">
              <div>
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <Lock size={22} className="text-blue-600" />
                </div>
                <h2 className="font-serif text-3xl text-stone-900 mb-1">Create your account</h2>
                <p className="text-stone-400 text-sm">You'll use this password every time you log into the admin panel.</p>
              </div>
              <Field label="Choose a password" hint="At least 6 characters. Use something you'll remember — you can't reset it easily.">
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="e.g. Baska2024!" autoFocus
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 transition-all" />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password.length > 0 && password.length < 6 && (
                  <p className="text-xs text-red-500 mt-1">Password is too short</p>
                )}
              </Field>
              <Field label="Confirm password">
                <div className="relative">
                  <input type={showPw2 ? 'text' : 'password'} value={password2} onChange={e => setPassword2(e.target.value)}
                    placeholder="Type your password again"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 transition-all" />
                  <button type="button" onClick={() => setShowPw2(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    {showPw2 ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password2.length > 0 && password !== password2 && (
                  <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                )}
                {password2.length > 0 && password === password2 && password.length >= 6 && (
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><CheckCircle size={12} /> Passwords match!</p>
                )}
              </Field>
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-600">
                <strong>Write this down somewhere safe.</strong> Your password is stored locally on this device. If you forget it, you can reset it by deleting the file <code className="bg-blue-100 px-1 rounded">data/setup.json</code> and running setup again.
              </div>
            </div>
          )}

          {/* ── STEP 2: Property ── */}
          {step === 2 && (
            <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm space-y-5">
              <div>
                <div className="w-12 h-12 bg-sand-50 rounded-2xl flex items-center justify-center mb-4">
                  <Home size={22} className="text-sand-600" />
                </div>
                <h2 className="font-serif text-3xl text-stone-900 mb-1">Property details</h2>
                <p className="text-stone-400 text-sm">This info appears in the footer, contact section, and booking emails.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Property name">
                  <Input value={propertyName} onChange={setPropertyName} placeholder="Apartments Dekanić" />
                </Field>
                <Field label="Tagline">
                  <Input value={tagline} onChange={setTagline} placeholder="Baška · Island Krk · Croatia" />
                </Field>
              </div>
              <Field label="Full address">
                <Input value={address} onChange={setAddress} placeholder="Skopalj 19, Baška, Otok Krk" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Phone number" hint="Shown publicly on the website">
                  <Input value={phone} onChange={setPhone} placeholder="+385 98 484 133" type="tel" />
                </Field>
                <Field label="Email address" hint="Booking confirmations go here">
                  <Input value={email} onChange={setEmail} placeholder="your@email.com" type="email" />
                </Field>
              </div>
              <Field label="WhatsApp number" hint="Format: +38598484133 (no spaces)">
                <Input value={whatsapp} onChange={setWhatsapp} placeholder="+38598484133" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Minimum stay (nights)">
                  <Input value={minimumStay} onChange={setMinimumStay} type="number" placeholder="3" />
                </Field>
              </div>
              <Toggle checked={instantApproval} onChange={setInstantApproval}
                label="Instant approval"
                hint="OFF = you receive an email for each request and confirm manually. ON = guests are confirmed automatically." />
            </div>
          )}

          {/* ── STEP 3: Apartment ── */}
          {step === 3 && (
            <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm space-y-5">
              <div>
                <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center mb-4">
                  <Building2 size={22} className="text-stone-600" />
                </div>
                <h2 className="font-serif text-3xl text-stone-900 mb-1">Your first apartment</h2>
                <p className="text-stone-400 text-sm">You can add and edit all 3 apartments from the admin panel later. Let's set up the first one now.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Apartment name *" hint="e.g. Studio with Sea View, Family Apartment">
                  <Input value={aptName} onChange={setAptName} placeholder="e.g. Apartment Luka" />
                </Field>
                <Field label="Tagline" hint="Short description under the name">
                  <Input value={aptTagline} onChange={setAptTagline} placeholder="e.g. Perfect for couples" />
                </Field>
              </div>
              <Field label="Description" hint="What makes this apartment special? Describe the view, the feel, the space.">
                <Textarea value={aptDescription} onChange={setAptDescription} rows={4}
                  placeholder="A bright and cozy apartment with a stunning sea view. Located just 5 minutes from the famous Baška beach…" />
              </Field>
              {/* ── Capacity ── */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Field label="Bedrooms"><Input value={bedrooms} onChange={setBedrooms} type="number" placeholder="2" /></Field>
                  <Field label="Bathrooms"><Input value={bathrooms} onChange={setBathrooms} type="number" placeholder="1" /></Field>
                  <Field label="Size (m²)"><Input value={sizeSqm} onChange={setSizeSqm} type="number" placeholder="45" /></Field>
                </div>

                {/* Guests capacity */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-stone-700 mb-1">Guest capacity *</p>
                    <p className="text-xs text-stone-400">Split between main beds and extra sleeping options (sofa bed, rollaway, etc.)</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Main guests" hint="In proper beds / bedrooms">
                      <Input value={maxGuests} onChange={setMaxGuests} type="number" placeholder="2" />
                    </Field>
                    <Field label="Extra guests" hint="On sofa bed, pull-out, or rollaway">
                      <Input value={extraGuests} onChange={setExtraGuests} type="number" placeholder="0" />
                    </Field>
                  </div>
                  {/* Visual preview */}
                  {(parseInt(maxGuests) > 0 || parseInt(extraGuests) > 0) && (
                    <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-center justify-between">
                      <div className="text-sm text-stone-700">
                        <span className="font-semibold text-stone-900">
                          {parseInt(maxGuests) || 0}{parseInt(extraGuests) > 0 ? `+${parseInt(extraGuests)}` : ''} guests
                        </span>
                        <span className="text-stone-400 ml-2">
                          ({parseInt(maxGuests) || 0} in beds{parseInt(extraGuests) > 0 ? `, ${parseInt(extraGuests)} on sofa bed` : ''})
                        </span>
                      </div>
                      <span className="text-lg">
                        {'🛏️'.repeat(Math.min(parseInt(maxGuests)||0, 4))}{parseInt(extraGuests) > 0 ? '🛋️' : ''}
                      </span>
                    </div>
                  )}
                  {parseInt(extraGuests) > 0 && (
                    <Field label="Note about extra sleeping" hint="Shown to guests on the website">
                      <Input value={extraGuestNote} onChange={setExtraGuestNote}
                        placeholder="e.g. Sofa bed in the living room (suitable for 2 adults)" />
                    </Field>
                  )}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700 space-y-1">
                    <p className="font-semibold">Common setups in Croatian rentals:</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1">
                      {[
                        ['2+2','2 in bedroom + 2 on sofa bed'],
                        ['2+1','2 in bedroom + 1 on single sofa'],
                        ['4+2','4 in bedrooms + 2 on sofa bed'],
                        ['6+0','6 in bedrooms, no extras'],
                      ].map(([code, desc]) => (
                        <button key={code} type="button"
                          onClick={() => {
                            const [m, e] = code.split('+');
                            setMaxGuests(m); setExtraGuests(e);
                            if (parseInt(e) > 0) setExtraGuestNote('Sofa bed in the living room');
                          }}
                          className="flex items-center gap-2 text-left hover:text-amber-900 transition-colors">
                          <span className="font-bold text-amber-800 w-8">{code}</span>
                          <span className="text-amber-600">{desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3 pt-1">
                <p className="text-sm font-semibold text-stone-700">Key features</p>
                <Toggle checked={seaView} onChange={setSeaView} label="🌊 Sea view" hint="Shows a badge on the apartment card" />
                <Toggle checked={balcony} onChange={setBalcony} label="🌅 Balcony or terrace" />
                <Toggle checked={parking} onChange={setParking} label="🅿️ Free parking" />
              </div>
            </div>
          )}

          {/* ── STEP 4: Amenities ── */}
          {step === 4 && (
            <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm space-y-6">
              <div>
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                  <Wifi size={22} className="text-emerald-600" />
                </div>
                <h2 className="font-serif text-3xl text-stone-900 mb-1">Amenities</h2>
                <p className="text-stone-400 text-sm">Tap everything available in your apartment. These appear as icons on your website and help guests find you in search filters.</p>
                {amenities.length > 0 && (
                  <p className="text-xs text-emerald-600 font-semibold mt-2">{amenities.length} selected ✓</p>
                )}
              </div>
              {AMENITY_CATEGORIES.map(cat => (
                <div key={cat.category}>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{cat.category}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {cat.items.map(a => {
                      const active = amenities.includes(a.key);
                      return (
                        <button key={a.key} type="button" onClick={() => toggleAmenity(a.key)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${active ? 'bg-sand-600 text-white border-sand-600 shadow-sm' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-sand-400 hover:bg-sand-50'}`}>
                          <span className="text-base leading-none flex-shrink-0">{a.icon}</span>
                          <span className="leading-tight">{a.label}</span>
                          {active && <CheckCircle size={13} className="ml-auto flex-shrink-0 opacity-90" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── STEP 5: Photos ── */}
          {step === 5 && (
            <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm space-y-6">
              <div>
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
                  <Camera size={22} className="text-purple-600" />
                </div>
                <h2 className="font-serif text-3xl text-stone-900 mb-1">Your photos</h2>
                <p className="text-stone-400 text-sm">Upload photos of your apartment. Drag to reorder — the first photo is the cover shown on the website.</p>
              </div>

              <PhotoUploader folder="apt1" photos={photos} onChange={setPhotos} />

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
                  <p className="font-semibold mb-1">💡 Best photo sizes</p>
                  <p>Apartment photos: 1200×900px</p>
                  <p>Cover/hero: 1920×1080px</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-600">
                  <p className="font-semibold mb-1">⏭️ Skip for now?</p>
                  <p>The site works without photos. Add them any time from the admin panel.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 6: Calendar ── */}
          {step === 6 && (
            <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm space-y-5">
              <div>
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                  <Calendar size={22} className="text-indigo-600" />
                </div>
                <h2 className="font-serif text-3xl text-stone-900 mb-1">Calendar sync</h2>
                <p className="text-stone-400 text-sm">Connect your Airbnb and Booking.com calendars so booked dates automatically show as unavailable on your website.</p>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div className="border border-red-100 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏠</span>
                    <p className="font-semibold text-stone-800">Airbnb iCal URL</p>
                  </div>
                  <div className="bg-red-50 rounded-xl px-4 py-3 text-xs text-stone-600 space-y-1">
                    <p className="font-semibold text-stone-700">How to find it:</p>
                    <p>1. Go to Airbnb.com → <strong>Listings</strong></p>
                    <p>2. Click your listing → <strong>Availability</strong> tab</p>
                    <p>3. Scroll down → <strong>Export Calendar</strong> → Copy the link</p>
                  </div>
                  <Input value={airbnbIcal} onChange={setAirbnbIcal}
                    placeholder="https://www.airbnb.com/calendar/ical/XXXXX.ics?t=..." />
                </div>

                <div className="border border-blue-100 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📘</span>
                    <p className="font-semibold text-stone-800">Booking.com iCal URL</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl px-4 py-3 text-xs text-stone-600 space-y-1">
                    <p className="font-semibold text-stone-700">How to find it:</p>
                    <p>1. Go to Booking.com Extranet → <strong>Calendar</strong></p>
                    <p>2. Click <strong>Settings</strong> → <strong>iCal export</strong></p>
                    <p>3. Copy the URL shown there</p>
                  </div>
                  <Input value={bookingIcal} onChange={setBookingIcal}
                    placeholder="https://ical.booking.com/v1/export?t=..." />
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-500">
                <strong>You can skip this for now</strong> — paste your URLs later from the admin panel under each apartment's "Calendar Sync" section.
              </div>

              {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-3 px-4 rounded-xl">{error}</p>}
            </div>
          )}

          {/* ── STEP 7: Done ── */}
          {step === 7 && (
            <div className="text-center space-y-8">
              <div>
                <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200">
                  <CheckCircle size={40} className="text-white" />
                </div>
                <h1 className="font-serif text-4xl text-stone-900 mb-3">You're all set! 🎉</h1>
                <p className="text-stone-500 text-lg max-w-md mx-auto leading-relaxed">
                  Your website is ready. You can now open it and manage everything from the admin panel.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {[
                  { icon: '🌐', title: 'View your website', desc: 'See how it looks to your guests', href: '/', color: 'bg-sand-50 border-sand-200' },
                  { icon: '⚙️', title: 'Go to admin panel', desc: 'Edit apartments, photos, settings', href: '/admin', color: 'bg-stone-50 border-stone-200' },
                ].map((item) => (
                  <a key={item.href} href={item.href}
                    className={`${item.color} border rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-all group`}>
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-stone-800 group-hover:text-sand-700 transition-colors">{item.title}</p>
                      <p className="text-sm text-stone-400">{item.desc}</p>
                    </div>
                    <ArrowRight size={16} className="ml-auto text-stone-300 group-hover:text-sand-500 transition-colors flex-shrink-0 mt-0.5" />
                  </a>
                ))}
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-4 text-sm text-blue-700 text-left space-y-2">
                <p className="font-semibold">📋 What to do next:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Add your real photos to <code className="bg-blue-100 px-1 rounded">public/images/apt1/</code></li>
                  <li>• Set up Apartments 2 and 3 from the admin panel</li>
                  <li>• Deploy to Vercel (free) — follow the README.md guide</li>
                  <li>• Set up your email in <code className="bg-blue-100 px-1 rounded">.env.local</code> to receive booking requests</li>
                </ul>
              </div>
            </div>
          )}

          {/* ── Navigation buttons ── */}
          {step < 7 && (
            <div className="flex items-center justify-between mt-8">
              <button onClick={back} disabled={step === 0}
                className="flex items-center gap-2 px-5 py-3 text-stone-500 hover:text-stone-800 disabled:opacity-0 disabled:pointer-events-none text-sm font-medium transition-colors">
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={next} disabled={!canProceed() || loading}
                className="flex items-center gap-2 px-8 py-3.5 bg-sand-600 hover:bg-sand-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 text-sm">
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {step === 6 ? (loading ? 'Setting up…' : 'Finish Setup') : step === 0 ? "Let's get started" : 'Continue'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
