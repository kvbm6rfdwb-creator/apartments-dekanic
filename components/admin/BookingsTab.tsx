"use client";
import React, { useState, useMemo, useEffect, useCallback, Component } from 'react';
import { ChevronLeft, ChevronRight, X, Download, Plus, Check } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  apartment: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  source: string;
  totalPrice: number;
  notes: string;
}
interface Apartment { id: string; name: string; ical?: Record<string, string>; pricing?: any; }
// source must match CellInfo type: 'airbnb' | 'booking' | 'private'
interface BlockedRange { start: string; end: string; source: 'airbnb' | 'booking' | 'private'; }

// ─── Helpers ─────────────────────────────────────────────────────────────────
function toISO(d: Date) { return d.toISOString().slice(0, 10); }
function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr); d.setDate(d.getDate() + n); return toISO(d);
}
function nights(ci: string, co: string) {
  return Math.max(0, Math.round((new Date(co).getTime() - new Date(ci).getTime()) / 86400000));
}
function fmt(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}
function calcPrice(apt: any, checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const n = nights(checkIn, checkOut);
  if (n <= 0) return 0;
  const pricing = apt?.pricing || {};
  const defaultNightly = pricing.defaultNightly || 80;
  const seasons = pricing.seasons || [];
  function seasonForDate(ds: string) {
    const md = ds.slice(5, 10);
    for (const s of seasons) {
      if (s.from <= s.to) { if (md >= s.from && md <= s.to) return s; }
      else { if (md >= s.from || md <= s.to) return s; }
    }
    return null;
  }
  let total = 0;
  const start = new Date(checkIn);
  for (let i = 0; i < n; i++) {
    const d = new Date(start); d.setDate(d.getDate() + i);
    const s = seasonForDate(toISO(d));
    total += s ? s.nightly : defaultNightly;
  }
  return total;
}

function exportCSV(bookings: Booking[]) {
  const rows = [
    ['Guest', 'Email', 'Phone', 'Apartment', 'Check-in', 'Check-out', 'Nights', 'Source', 'Total €', 'Status'].join(','),
    ...bookings.map(b => [
      `"${b.guestName || ''}"`, `"${b.guestEmail || ''}"`, `"${b.guestPhone || ''}"`,
      `"${b.apartment || ''}"`, b.checkIn, b.checkOut,
      nights(b.checkIn, b.checkOut), b.source || '', b.totalPrice || 0, b.status || ''
    ].join(','))
  ];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `dekanic-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// Source colour legend
const SOURCE_COLORS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  airbnb:  { bg: 'bg-rose-100',   text: 'text-rose-700',   dot: '#f43f5e', label: 'Airbnb' },
  booking: { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: '#3b82f6', label: 'Booking.com' },
  direct:  { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: '#10b981', label: 'Direct / Private' },
};
function sourceKey(s: string) {
  const l = (s || '').toLowerCase();
  if (l.includes('airbnb')) return 'airbnb';
  if (l.includes('booking')) return 'booking';
  return 'direct';
}

// ─── Error boundary ───────────────────────────────────────────────────────────
class TabErrorBoundary extends Component<{ children: React.ReactNode }, { error: string | null }> {
  constructor(props: any) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e: any) { return { error: e?.message || 'Unknown error' }; }
  render() {
    if (this.state.error) return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="font-semibold text-red-700 mb-1">Something went wrong</p>
        <p className="text-xs text-red-400 font-mono mb-4">{this.state.error}</p>
        <button onClick={() => this.setState({ error: null })}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-xl">Retry</button>
      </div>
    );
    return this.props.children;
  }
}

// ─── Add-Reservation Drawer ────────────────────────────────────────────────────
function AddReservationDrawer({
  open, onClose, apartments, initialCheckIn, initialApartmentId, onSave
}: {
  open: boolean;
  onClose: () => void;
  apartments: Apartment[];
  initialCheckIn?: string;
  initialApartmentId?: string;
  onSave: (b: Booking) => void;
}) {
  const today = toISO(new Date());
  const [form, setForm] = useState<Partial<Booking>>({
    guestName: '', guestEmail: '', guestPhone: '',
    apartment: initialApartmentId || apartments[0]?.id || '',
    checkIn: initialCheckIn || today,
    checkOut: initialCheckIn ? addDays(initialCheckIn, 2) : addDays(today, 2),
    guests: 2, status: 'confirmed', source: 'Direct', totalPrice: 0, notes: '',
  });

  useEffect(() => {
    if (open) {
      const ci = initialCheckIn || today;
      setForm({
        guestName: '', guestEmail: '', guestPhone: '',
        apartment: initialApartmentId || apartments[0]?.id || '',
        checkIn: ci,
        checkOut: addDays(ci, 2),
        guests: 2, status: 'confirmed', source: 'Direct', totalPrice: 0, notes: '',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialCheckIn, initialApartmentId]);

  const apt = apartments.find(a => a.id === form.apartment);
  const autoPrice = apt && form.checkIn && form.checkOut ? calcPrice(apt, form.checkIn, form.checkOut) : 0;
  const n = form.checkIn && form.checkOut ? nights(form.checkIn, form.checkOut) : 0;

  const set = (k: keyof Booking, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.guestName?.trim()) return;
    if (!form.checkIn || !form.checkOut || n <= 0) return;
    onSave({
      id: `booking_${Date.now()}`,
      guestName: form.guestName!,
      guestEmail: form.guestEmail || '',
      guestPhone: form.guestPhone || '',
      apartment: form.apartment!,
      checkIn: form.checkIn!,
      checkOut: form.checkOut!,
      guests: form.guests || 2,
      status: form.status as Booking['status'] || 'confirmed',
      source: form.source || 'Direct',
      totalPrice: form.totalPrice || autoPrice,
      notes: form.notes || '',
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ backdropFilter: 'blur(2px)', background: 'rgba(0,0,0,0.25)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
          <div>
            <h2 className="font-bold text-stone-900 text-lg">New Reservation</h2>
            {n > 0 && <p className="text-xs text-stone-400 mt-0.5">{n} night{n !== 1 ? 's' : ''}{autoPrice > 0 ? ` · ${fmt(autoPrice)}` : ''}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-400 hover:bg-stone-100"><X size={16} /></button>
        </div>

        <div className="flex-1 px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Guest name *</label>
            <input autoFocus value={form.guestName || ''} onChange={e => set('guestName', e.target.value)}
              placeholder="e.g. Ivan Horvat"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sand-400 focus:bg-white transition-all" />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Apartment</label>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(apartments.length, 3)}, 1fr)` }}>
              {apartments.map(a => (
                <button key={a.id} onClick={() => set('apartment', a.id)}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                    form.apartment === a.id
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                  }`}>{a.name}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Check-in</label>
              <input type="date" value={form.checkIn || ''}
                onChange={e => {
                  const ci = e.target.value;
                  set('checkIn', ci);
                  if (form.checkOut && ci >= form.checkOut) set('checkOut', addDays(ci, 1));
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Check-out</label>
              <input type="date" value={form.checkOut || ''} min={form.checkIn ? addDays(form.checkIn, 1) : ''}
                onChange={e => set('checkOut', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Source</label>
            <div className="flex flex-wrap gap-2">
              {['Direct', 'Phone', 'Email', 'Airbnb', 'Booking.com', 'Agency', 'Walk-in'].map(s => (
                <button key={s} onClick={() => set('source', s)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                    form.source === s ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                  }`}>{s}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Status</label>
            <div className="flex gap-2">
              {(['confirmed', 'pending', 'cancelled'] as const).map(s => (
                <button key={s} onClick={() => set('status', s)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold capitalize transition-all ${
                    form.status === s
                      ? s === 'confirmed' ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                        : s === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-300'
                        : 'bg-red-100 text-red-600 border-red-300'
                      : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
                  }`}>{s}</button>
              ))}
            </div>
          </div>

          <details className="group">
            <summary className="text-xs font-bold text-stone-400 uppercase tracking-widest cursor-pointer select-none hover:text-stone-600 list-none flex items-center gap-1.5">
              <span className="group-open:rotate-90 transition-transform inline-block">›</span> Optional details
            </summary>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Email</label>
                  <input type="email" value={form.guestEmail || ''} onChange={e => set('guestEmail', e.target.value)}
                    placeholder="guest@email.com"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Phone</label>
                  <input value={form.guestPhone || ''} onChange={e => set('guestPhone', e.target.value)}
                    placeholder="+385 91 ..."
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Guests</label>
                  <input type="number" min={1} value={form.guests || ''} onChange={e => set('guests', Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Total price (€)</label>
                  <input type="number" value={form.totalPrice || ''} onChange={e => set('totalPrice', Number(e.target.value))}
                    placeholder={autoPrice > 0 ? String(autoPrice) : '0'}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400" />
                  {autoPrice > 0 && <p className="text-[10px] text-stone-400 mt-0.5">Auto-calculated: {fmt(autoPrice)}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Notes</label>
                <textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={2}
                  placeholder="Early check-in, extra bed, etc."
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sand-400" />
              </div>
            </div>
          </details>
        </div>

        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 text-sm font-semibold hover:bg-stone-100 transition-all">Cancel</button>
          <button onClick={handleSave}
            disabled={!form.guestName?.trim() || n <= 0}
            className="flex-1 py-3 rounded-xl bg-stone-900 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <Check size={15} /> Save Reservation
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Full Calendar ─────────────────────────────────────────────────────────────
function FullCalendar({
  bookings, apartments, blockedByApt, onDayClick
}: {
  bookings: Booking[];
  apartments: Apartment[];
  blockedByApt: Record<string, BlockedRange[]>;
  onDayClick: (date: string, aptId: string) => void;
}) {
  const [monthOffset, setMonthOffset] = useState(0);
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = base.getFullYear();
  const month = base.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const todayStr = toISO(today);

  type CellInfo = { type: 'private' | 'airbnb' | 'booking' | 'free'; booking?: Booking };
  const cellMap = useMemo(() => {
    const map: Record<string, Record<string, CellInfo>> = {};
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const ds = toISO(new Date(d));
      map[ds] = {};
      for (const apt of apartments) map[ds][apt.id] = { type: 'free' };
    }

    for (const b of bookings) {
      if (!b.checkIn || !b.checkOut || b.status === 'cancelled') continue;
      const sk = sourceKey(b.source);
      const type: CellInfo['type'] = sk === 'airbnb' ? 'airbnb' : sk === 'booking' ? 'booking' : 'private';
      let cur = new Date(b.checkIn);
      const out = new Date(b.checkOut);
      while (cur < out) {
        const ds = toISO(cur);
        if (map[ds]?.[b.apartment] !== undefined) map[ds][b.apartment] = { type, booking: b };
        cur.setDate(cur.getDate() + 1);
      }
    }

    for (const apt of apartments) {
      const ranges = blockedByApt[apt.id] || [];
      for (const r of ranges) {
        let cur = new Date(r.start);
        const out = new Date(r.end);
        while (cur < out) {
          const ds = toISO(cur);
          // r.source is now typed as 'airbnb' | 'booking' | 'private' — matches CellInfo
          if (map[ds]?.[apt.id]?.type === 'free') map[ds][apt.id] = { type: r.source };
          cur.setDate(cur.getDate() + 1);
        }
      }
    }

    return map;
  }, [bookings, apartments, blockedByApt, year, month]);

  const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function cellStyle(type: string): string {
    if (type === 'airbnb')  return 'bg-rose-400';
    if (type === 'booking') return 'bg-blue-400';
    if (type === 'private') return 'bg-emerald-400';
    return 'bg-stone-100 hover:bg-stone-200 cursor-pointer';
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
        <button onClick={() => setMonthOffset(v => v - 1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-all">
          <ChevronLeft size={16} />
        </button>
        <div className="text-center">
          <p className="font-bold text-stone-900">{MONTH_NAMES[month]} {year}</p>
          <p className="text-[10px] text-stone-400">Click a free day to add a reservation</p>
        </div>
        <button onClick={() => setMonthOffset(v => v + 1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-all">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: `${32 + 7 * (daysInMonth + firstDow)}px` }}>
          <div className="flex border-b border-stone-100">
            <div className="w-32 flex-shrink-0 px-3 py-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Apartment</div>
            <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${daysInMonth + firstDow}, minmax(0, 1fr))` }}>
              {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} className="h-8" />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isToday = ds === todayStr;
                const dow = (firstDow + i) % 7;
                return (
                  <div key={day} className={`h-8 flex flex-col items-center justify-center text-[10px] font-bold ${
                    isToday ? 'text-sand-700' : dow >= 5 ? 'text-stone-400' : 'text-stone-500'
                  }`}>
                    <span>{DOW[dow].slice(0, 1)}</span>
                    <span className={isToday ? 'w-5 h-5 rounded-full bg-sand-400 text-white flex items-center justify-center text-[9px]' : ''}>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {apartments.map((apt, aptIdx) => (
            <div key={apt.id} className={`flex border-b last:border-b-0 ${aptIdx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}`}>
              <div className="w-32 flex-shrink-0 px-3 py-2 flex items-center">
                <span className="text-xs font-semibold text-stone-700 truncate">{apt.name}</span>
              </div>
              <div className="flex-1 grid py-1 gap-0.5" style={{ gridTemplateColumns: `repeat(${daysInMonth + firstDow}, minmax(0, 1fr))` }}>
                {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const cell = cellMap[ds]?.[apt.id] ?? { type: 'free' as const };
                  const isToday = ds === todayStr;
                  return (
                    <div
                      key={day}
                      title={
                        cell.booking
                          ? `${cell.booking.guestName} · ${nights(cell.booking.checkIn, cell.booking.checkOut)}n`
                          : cell.type !== 'free' ? `Blocked (${cell.type})` : 'Add reservation'
                      }
                      onClick={() => cell.type === 'free' && onDayClick(ds, apt.id)}
                      className={`h-6 rounded-sm transition-all ${cellStyle(cell.type)} ${isToday ? 'ring-1 ring-offset-0 ring-sand-400' : ''}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 px-5 py-3 border-t border-stone-100 bg-stone-50">
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Legend:</span>
        {Object.entries(SOURCE_COLORS).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1.5 text-[11px] text-stone-600">
            <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: v.dot }} />{v.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-[11px] text-stone-400">
          <span className="w-3 h-3 rounded-sm bg-stone-200 flex-shrink-0" /> Free
        </span>
      </div>
    </div>
  );
}

// ─── Bookings List ─────────────────────────────────────────────────────────────
function BookingsList({
  bookings, apartments, onDelete, onUpdate
}: {
  bookings: Booking[];
  apartments: Apartment[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, key: string, value: any) => void;
}) {
  const todayStr = toISO(new Date());
  const upcoming = [...bookings]
    .filter(b => b.checkOut >= todayStr || b.status === 'pending')
    .sort((a, b) => (a.checkIn || '').localeCompare(b.checkIn || ''));
  const past = [...bookings]
    .filter(b => b.checkOut < todayStr && b.status !== 'pending')
    .sort((a, b) => (b.checkIn || '').localeCompare(a.checkIn || ''));

  function BookingCard({ b }: { b: Booking }) {
    const apt = apartments.find(a => a.id === b.apartment);
    const n = nights(b.checkIn, b.checkOut);
    const sk = sourceKey(b.source);
    const col = SOURCE_COLORS[sk];
    const isPast = b.checkOut < todayStr;
    return (
      <div className={`border rounded-2xl p-4 transition-all ${isPast ? 'bg-stone-50 border-stone-100 opacity-60' : 'bg-white border-stone-200 shadow-sm'}`}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-sm font-bold text-stone-600 flex-shrink-0">
            {(b.guestName || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-stone-900 text-sm">{b.guestName || '(no name)'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${col.bg} ${col.text}`}>{b.source || 'Direct'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                b.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-500'
              }`}>{b.status}</span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-stone-500 flex-wrap">
              <span>{apt?.name || b.apartment}</span>
              <span>·</span>
              <span>{b.checkIn} → {b.checkOut}</span>
              <span>·</span>
              <span>{n} night{n !== 1 ? 's' : ''}</span>
              {b.totalPrice > 0 && <><span>·</span><span className="font-semibold text-stone-700">{fmt(b.totalPrice)}</span></>}
            </div>
            {b.guestPhone && <p className="text-xs text-stone-400 mt-0.5">{b.guestPhone}{b.guestEmail ? ` · ${b.guestEmail}` : ''}</p>}
            {b.notes && <p className="text-xs text-stone-400 mt-1 italic">{b.notes}</p>}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <select value={b.status} onChange={e => onUpdate(b.id, 'status', e.target.value)}
              className={`px-2 py-1 rounded-lg border text-[10px] font-bold focus:outline-none ${
                b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                b.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-red-50 text-red-500 border-red-200'
              }`}>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button onClick={() => {
              if (confirm(`Delete reservation for ${b.guestName}?`)) onDelete(b.id);
            }} className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all">
              <X size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Upcoming & Active · {upcoming.length}</h3>
        {upcoming.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-stone-200 rounded-2xl">
            <p className="text-stone-400 text-sm">No upcoming reservations</p>
            <p className="text-stone-300 text-xs mt-1">Click a free day in the calendar above to add one</p>
          </div>
        ) : (
          <div className="space-y-2">{upcoming.map(b => <BookingCard key={b.id} b={b} />)}</div>
        )}
      </div>
      {past.length > 0 && (
        <details>
          <summary className="text-xs font-bold text-stone-400 uppercase tracking-widest cursor-pointer list-none flex items-center gap-1.5 select-none hover:text-stone-500">
            <span>›</span> Past reservations · {past.length}
          </summary>
          <div className="mt-3 space-y-2">{past.map(b => <BookingCard key={b.id} b={b} />)}</div>
        </details>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function BookingsTabInner({ data, setData }: { data: any; setData: any }) {
  const bookings: Booking[] = data.bookings || [];
  const apartments: Apartment[] = data.apartments || [];

  const [blockedByApt, setBlockedByApt] = useState<Record<string, BlockedRange[]>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCheckIn, setDrawerCheckIn] = useState<string | undefined>();
  const [drawerAptId, setDrawerAptId] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const result: Record<string, BlockedRange[]> = {};
      for (const apt of apartments) {
        if (!apt.id || !apt.ical || Object.keys(apt.ical).length === 0) continue;
        try {
          const r = await fetch(`/api/calendar?apt=${encodeURIComponent(apt.id)}`);
          if (!r.ok) continue;
          const d = await r.json();
          if (Array.isArray(d.blocked)) {
            result[apt.id] = d.blocked
              .filter((b: any) => b?.start && b?.end)
              .map((b: any): BlockedRange => {
                const keys = Object.keys(apt.ical || {});
                const hasAirbnb = keys.some(k => k.toLowerCase().includes('airbnb'));
                const hasBooking = keys.some(k => k.toLowerCase().includes('booking'));
                // Map to CellInfo-compatible types only
                const source: BlockedRange['source'] = hasAirbnb ? 'airbnb' : hasBooking ? 'booking' : 'private';
                return { start: b.start, end: b.end, source };
              });
          }
        } catch {}
      }
      if (!cancelled) setBlockedByApt(result);
    };
    load();
    return () => { cancelled = true; };
  }, [apartments]);

  const addBooking = useCallback((b: Booking) => {
    setData((d: any) => ({ ...d, bookings: [...(d.bookings || []), b] }));
  }, [setData]);

  const deleteBooking = useCallback((id: string) => {
    setData((d: any) => ({ ...d, bookings: (d.bookings || []).filter((b: any) => b.id !== id) }));
  }, [setData]);

  const updateBooking = useCallback((id: string, key: string, value: any) => {
    setData((d: any) => ({
      ...d,
      bookings: (d.bookings || []).map((b: any) => b.id === id ? { ...b, [key]: value } : b),
    }));
  }, [setData]);

  const handleDayClick = (date: string, aptId: string) => {
    setDrawerCheckIn(date); setDrawerAptId(aptId); setDrawerOpen(true);
  };

  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const pending = bookings.filter(b => b.status === 'pending').length;
  const todayStr = toISO(new Date());
  const activeNow = bookings.filter(b => b.checkIn <= todayStr && b.checkOut > todayStr && b.status === 'confirmed').length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: bookings.length, color: 'text-stone-900' },
          { label: 'Confirmed', value: confirmed, color: 'text-emerald-700' },
          { label: 'Pending', value: pending, color: 'text-amber-600' },
          { label: 'Staying now', value: activeNow, color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-stone-100 rounded-2xl px-4 py-3 shadow-sm">
            <p className={`text-2xl font-black tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-stone-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => { setDrawerCheckIn(undefined); setDrawerAptId(undefined); setDrawerOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-sm font-bold rounded-xl hover:bg-stone-800 transition-all">
          <Plus size={15} /> Add Reservation
        </button>
        <div className="flex-1" />
        <button onClick={() => exportCSV(bookings)}
          className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold rounded-xl transition-all">
          <Download size={13} /> Export CSV
        </button>
      </div>

      <FullCalendar bookings={bookings} apartments={apartments} blockedByApt={blockedByApt} onDayClick={handleDayClick} />

      <BookingsList bookings={bookings} apartments={apartments} onDelete={deleteBooking} onUpdate={updateBooking} />

      <AddReservationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        apartments={apartments}
        initialCheckIn={drawerCheckIn}
        initialApartmentId={drawerAptId}
        onSave={addBooking}
      />
    </div>
  );
}

export default function BookingsTab({ data, setData }: { data: any; setData: any }) {
  return (
    <TabErrorBoundary>
      <BookingsTabInner data={data} setData={setData} />
    </TabErrorBoundary>
  );
}
