"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Download } from 'lucide-react';

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1.5">{children}</label>;
}
function Input({ value, onChange, type = 'text', placeholder = '', step }: { value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string; step?: string | number }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} step={step}
      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 transition-all" />
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

function fmt(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function nights(ci: string, co: string) {
  return Math.max(0, Math.round((new Date(co).getTime() - new Date(ci).getTime()) / 86400000));
}

function exportBookingsCSV(bookings: any[]) {
  const rows = [
    ['Guest Name', 'Email', 'Phone', 'Apartment', 'Check-in', 'Check-out', 'Nights', 'Platform', 'Revenue', 'Status'].join(','),
    ...bookings.map(b => [
      `"${b.guestName || ''}"`,
      `"${b.guestEmail || ''}"`,
      `"${b.guestPhone || ''}"`,
      `"${b.apartmentId || ''}"`,
      b.checkIn,
      b.checkOut,
      nights(b.checkIn, b.checkOut),
      b.platform || 'Direct',
      b.totalRevenue || 0,
      b.status || 'confirmed'
    ].join(','))
  ];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dekanic-bookings-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function calcPrice(apt: any, checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const n = nights(checkIn, checkOut);
  if (n <= 0) return 0;
  const pricing = apt?.pricing || {};
  const defaultNightly = pricing.defaultNightly || 80;
  const seasons = pricing.seasons || [];

  function seasonForDate(dateStr: string) {
    const m = Number(dateStr.slice(5, 7));
    const d = Number(dateStr.slice(8, 10));
    const md = `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    for (const s of seasons) {
      if (s.from <= s.to) { // normal range
        if (md >= s.from && md <= s.to) return s;
      } else { // wraps year end
        if (md >= s.from || md <= s.to) return s;
      }
    }
    return null;
  }

  let total = 0;
  const start = new Date(checkIn);
  for (let i = 0; i < n; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const ds = d.toISOString().slice(0, 10);
    const s = seasonForDate(ds);
    total += s ? s.nightly : defaultNightly;
  }
  return total;
}

// Mini occupancy calendar
function OccupancyCalendar({ bookings, apartments }: { bookings: any[]; apartments: any[] }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const today = new Date();
  const viewMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Fetch blocked dates from external calendars
  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        const allBlocked: string[] = [];
        for (const apt of apartments) {
          if (apt.ical) {
            const urls = Object.values(apt.ical as Record<string, string>);
            for (const url of urls) {
              try {
                const response = await fetch(`/api/calendar?apt=${apt.id}`);
                if (response.ok) {
                  const data = await response.json();
                  allBlocked.push(...data.blocked);
                }
              } catch {}
            }
          }
        }
        setBlockedDates(allBlocked);
      } catch {}
    };

    fetchBlockedDates();
  }, [apartments]);

  const occupied = useMemo(() => {
    const map = new Map<string, number>();
    
    // Mark booking dates
    bookings.forEach(b => {
      if (!b.checkIn || !b.checkOut || b.status === 'cancelled') return;
      const start = new Date(b.checkIn);
      const n = nights(b.checkIn, b.checkOut);
      for (let i = 0; i < n; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().slice(0, 10);
        map.set(dateStr, (map.get(dateStr) || 0) + 1);
      }
    });
    
    // Mark blocked dates from external calendars
    blockedDates.forEach(blocked => {
      const [start, end] = blocked.split(',').map(d => d.trim());
      if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().slice(0, 10);
          map.set(dateStr, (map.get(dateStr) || 0) + 1);
        }
      }
    });
    
    return map;
  }, [bookings, blockedDates]);

  const totalApts = apartments.length;
  const emptyStart = (firstDayOfWeek + 6) % 7; // Monday-first

  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setMonthOffset(v => v - 1)} className="text-stone-400 hover:text-stone-700">
          <ChevronLeft size={16} />
        </button>
        <p className="text-xs font-bold text-stone-700">{viewMonth.toLocaleString('en', { month: 'long', year: 'numeric' })}</p>
        <button onClick={() => setMonthOffset(v => v + 1)} className="text-stone-400 hover:text-stone-700">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {['M','T','W','T','F','S','S'].map(d => <span key={d} className="text-[9px] font-bold text-stone-300">{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: emptyStart }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const count = occupied.get(dateStr) || 0;
          const isToday = dateStr === today.toISOString().slice(0, 10);
          const pct = totalApts > 0 ? count / totalApts : 0;
          return (
            <div key={day} className={`relative h-7 rounded-md flex items-center justify-center text-[10px] font-semibold ${isToday ? 'ring-1 ring-sand-400' : ''}`}
              style={{ backgroundColor: pct === 0 ? '#f5f5f4' : pct >= 1 ? '#fecaca' : `rgba(251, 191, 36, ${pct})`, color: pct > 0.5 ? '#7f1d1d' : '#44403c' }}>
              {day}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-2 text-[10px] text-stone-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-200" /> Full</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-200" /> Partial</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-stone-100" /> Free</span>
      </div>
    </div>
  );
}

export default function BookingsTab({ data, setData }: { data: any; setData: any }) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const bookings: any[] = data.bookings || [];
  const apartments = data.apartments || [];

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

  const filteredBookings = bookings
    .filter((b: any) => {
      const statusOk = filterStatus === 'all' || b.status === filterStatus;
      const sourceOk = filterSource === 'all' || (b.source || '').toLowerCase().includes(filterSource.toLowerCase());
      return statusOk && sourceOk;
    })
    .sort((a: any, b: any) => (b.checkIn || '').localeCompare(a.checkIn || ''));

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total bookings', value: bookings.length, color: 'text-stone-900' },
          { label: 'Confirmed', value: bookings.filter((b:any)=>b.status==='confirmed').length, color: 'text-emerald-700' },
          { label: 'Pending', value: bookings.filter((b:any)=>b.status==='pending').length, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-stone-100 rounded-2xl px-4 py-3 shadow-sm">
            <p className={`text-2xl font-black tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-stone-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Occupancy calendar */}
      <OccupancyCalendar bookings={bookings} apartments={apartments} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Filters:</span>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-700 text-xs focus:outline-none focus:ring-2 focus:ring-sand-200">
          <option value="all">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-700 text-xs focus:outline-none focus:ring-2 focus:ring-sand-200">
          <option value="all">All sources</option>
          <option value="direct">Direct</option>
          <option value="phone">Phone</option>
          <option value="email">Email</option>
          <option value="walk-in">Walk-in</option>
          <option value="agency">Agency</option>
          <option value="airbnb">Airbnb</option>
          <option value="booking">Booking.com</option>
        </select>
        {(filterStatus !== 'all' || filterSource !== 'all') && (
          <button onClick={() => { setFilterStatus('all'); setFilterSource('all'); }}
            className="text-[11px] text-stone-400 hover:text-stone-700 underline">Clear</button>
        )}
        <button onClick={() => exportBookingsCSV(filteredBookings)}
          className="flex items-center gap-1.5 px-3 py-2 bg-sand-600 text-white text-xs font-semibold rounded-xl hover:bg-sand-700 transition-all">
          <Download size={13} /> Export CSV
        </button>
      </div>

      <Section title={`Reservations · ${filteredBookings.length}`} defaultOpen={true}>
        <p className="text-xs text-stone-400 -mt-1 mb-4">
          Guest info + reservation details. Price auto-calculates from apartment rates when dates are set.
        </p>

        
        {/* Bookings list */}
        <div className="space-y-3">
          {filteredBookings.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-2xl text-stone-400 text-xs">
              <p className="font-semibold text-sm mb-1">No reservations match</p>
              <p>Try adjusting the filters or add a new reservation.</p>
            </div>
          )}
          {filteredBookings.map((booking: any) => {
            const realIdx = bookings.findIndex((b: any) => b.id === booking.id);
            const n = booking.checkIn && booking.checkOut ? nights(booking.checkIn, booking.checkOut) : 0;
            const apt = apartments.find((a: any) => a.id === booking.apartment);
            const autoPrice = apt && booking.checkIn && booking.checkOut ? calcPrice(apt, booking.checkIn, booking.checkOut) : 0;
            return (
              <div key={booking.id} className="bg-stone-50 border border-stone-100 rounded-2xl p-4 space-y-3">
                {/* Row 1: guest + status + delete */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sand-100 to-sand-200 flex items-center justify-center text-sm font-bold text-sand-700 flex-shrink-0">
                    {(booking.guestName || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 grid grid-cols-[1fr_120px] gap-2">
                    <Input value={booking.guestName} onChange={v => updateBooking(realIdx, 'guestName', v)} placeholder="Guest full name" />
                    <select value={booking.status} onChange={e => updateBooking(realIdx, 'status', e.target.value)}
                      className={`w-full px-2 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sand-200 ${
                        booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        booking.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-red-50 text-red-600 border-red-200'
                      }`}>
                      <option value="confirmed">✓ Confirmed</option>
                      <option value="pending">⏳ Pending</option>
                      <option value="cancelled">✗ Cancelled</option>
                    </select>
                  </div>
                  <button type="button" onClick={() => removeBooking(realIdx)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                  </button>
                </div>

                {/* Row 2: dates + apartment + guests */}
                <div className="grid grid-cols-[1fr_1fr_1fr_60px] gap-2">
                  <div>
                    <Label>Check-in</Label>
                    <Input type="date" value={booking.checkIn} onChange={v => {
                      updateBooking(realIdx, 'checkIn', v);
                      if (v && booking.checkOut && apt) {
                        const price = calcPrice(apt, v, booking.checkOut);
                        updateBooking(realIdx, 'totalPrice', price);
                      }
                    }} />
                  </div>
                  <div>
                    <Label>Check-out</Label>
                    <Input type="date" value={booking.checkOut} onChange={v => {
                      updateBooking(realIdx, 'checkOut', v);
                      if (booking.checkIn && v && apt) {
                        const price = calcPrice(apt, booking.checkIn, v);
                        updateBooking(realIdx, 'totalPrice', price);
                      }
                    }} />
                  </div>
                  <div>
                    <Label>Apartment</Label>
                    <select value={booking.apartment} onChange={e => {
                      updateBooking(realIdx, 'apartment', e.target.value);
                      const newApt = apartments.find((a: any) => a.id === e.target.value);
                      if (booking.checkIn && booking.checkOut && newApt) {
                        const price = calcPrice(newApt, booking.checkIn, booking.checkOut);
                        updateBooking(realIdx, 'totalPrice', price);
                      }
                    }}
                      className="w-full px-2 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sand-200">
                      {apartments.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Guests</Label>
                    <Input type="number" value={booking.guests} onChange={v => updateBooking(realIdx, 'guests', Number(v))} placeholder="2" />
                  </div>
                </div>

                {/* Row 3: contact + source + price */}
                <div className="grid grid-cols-[1fr_1fr_100px_100px] gap-2">
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={booking.guestEmail} onChange={v => updateBooking(realIdx, 'guestEmail', v)} placeholder="guest@email.com" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={booking.guestPhone} onChange={v => updateBooking(realIdx, 'guestPhone', v)} placeholder="+385 91 ..." />
                  </div>
                  <div>
                    <Label>Source</Label>
                    <select value={booking.source} onChange={e => updateBooking(realIdx, 'source', e.target.value)}
                      className="w-full px-2 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sand-200">
                      {['Direct','Phone','Email','Walk-in','Agency','Airbnb','Booking.com'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Total (€)</Label>
                    <Input type="number" value={booking.totalPrice} onChange={v => updateBooking(realIdx, 'totalPrice', Number(v))} placeholder={String(autoPrice || 0)} />
                    {autoPrice > 0 && booking.totalPrice !== autoPrice && (
                      <p className="text-[10px] text-stone-400 mt-0.5">Auto: {fmt(autoPrice)}</p>
                    )}
                  </div>
                </div>

                {/* Row 4: notes + nights badge */}
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Label>Internal notes</Label>
                    <textarea value={booking.notes} onChange={e => updateBooking(realIdx, 'notes', e.target.value)}
                      rows={1} placeholder="Any notes (early check-in, extra bed, etc.)"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sand-200" />
                  </div>
                  {n > 0 && (
                    <div className="flex-shrink-0 mt-5 bg-sand-50 border border-sand-200 rounded-xl px-3 py-2 text-center">
                      <p className="text-lg font-black text-sand-800 tabular-nums leading-none">{n}</p>
                      <p className="text-[10px] text-sand-600 font-semibold">night{n!==1?'s':''}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
