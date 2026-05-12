"use client";
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Calendar, BarChart2, Home, BookOpen, Info, ChevronRight, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

// ─── Formatters ────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}
function fmtDec(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
function fmtPct(n: number) { return `${n.toFixed(1)}%`; }
function nights(ci: string, co: string) {
  return Math.max(0, Math.round((new Date(co).getTime() - new Date(ci).getTime()) / 86400000));
}
function monthLabel(m: number) {
  return new Date(2024, m - 1, 1).toLocaleString('en', { month: 'short' });
}
function currentYear() { return new Date().getFullYear(); }
function normalizeSource(src: string): 'airbnb' | 'booking' | 'direct' {
  const s = (src || '').toLowerCase();
  if (s.includes('airbnb')) return 'airbnb';
  if (s.includes('booking')) return 'booking';
  return 'direct';
}

// ─── KPI Definitions (label, formula, explanation) ─────────────
const KPI_INFO: Record<string, { title: string; formula: string; why: string; benchmark?: string }> = {
  totalRevenue: {
    title: 'Total Revenue',
    formula: 'Sum of all booking revenues',
    why: 'The gross amount earned from guests before deducting any fees or expenses. This is your top-line number.',
    benchmark: 'No universal benchmark — compare to your own previous seasons.',
  },
  netProfit: {
    title: 'Net Profit',
    formula: 'Total Revenue − Platform Fees − All Expenses',
    why: 'The actual money that stays in your pocket after paying Airbnb/Booking commissions and all operating costs.',
    benchmark: 'A healthy short-term rental targets 40–60% net profit margin.',
  },
    adr: {
    title: 'Average Daily Rate (ADR)',
    formula: 'Total Revenue ÷ Total Nights Booked',
    why: 'The average price paid per night. A rising ADR means you can charge more per night — a key pricing signal. Compare ADR across seasons to set smarter rates.',
    benchmark: 'Coastal Croatia peak season ADR typically ranges €80–€160/night.',
  },
  airbnbFees: {
    title: 'Airbnb Fees',
    formula: 'Airbnb revenue × Airbnb host fee rate',
    why: 'Commissions paid to Airbnb. Typically ~3% host fee. Shown as a separate card so you can compare OTA costs directly.',
    benchmark: 'Target: keep Airbnb fees below 5% of Airbnb revenue.',
  },
  bookingFees: {
    title: 'Booking.com Fees',
    formula: 'Booking.com revenue × Booking.com commission rate',
    why: 'Commissions paid to Booking.com. Typically 15–18%. This is usually your largest platform cost.',
    benchmark: 'Target: keep Booking.com fees below 18% of Booking.com revenue.',
  },
  totalExpenses: {
    title: 'Total Expenses',
    formula: 'Sum of all expense entries in the selected period',
    why: 'All operating costs: cleaning, utilities, maintenance, linen, insurance, taxes, etc. Understanding expense breakdown is key to improving margin.',
  },
  profitMargin: {
    title: 'Profit Margin',
    formula: 'Net Profit ÷ Total Revenue × 100',
    why: 'What percentage of revenue is actual profit. A 50% margin means for every €100 earned, €50 is profit. This is the most important single KPI for a rental host.',
    benchmark: '< 20% poor · 20–40% fair · 40–60% good · > 60% excellent',
  },
  occupancyRate: {
    title: 'Occupancy Rate',
    formula: 'Total Nights Booked ÷ (365 × Number of Apartments) × 100',
    why: 'The percentage of available nights that were actually rented. Higher occupancy means less dead time. Balance with ADR — sometimes fewer bookings at higher rates is more profitable.',
    benchmark: '< 40% low · 40–65% average · 65–80% good · > 80% excellent',
  },
  revPAR: {
    title: 'RevPAR',
    formula: 'Total Revenue ÷ Total Available Room Nights',
    why: 'Revenue Per Available Room — the gold-standard hotel KPI. Unlike ADR, RevPAR penalises empty nights. A high ADR with low occupancy gives a low RevPAR.',
    benchmark: 'RevPAR = ADR × Occupancy Rate. Maximise both together.',
  },
};

// ─── Reusable Components ───────────────────────────────────────

function InfoTooltip({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const info = KPI_INFO[id];
  if (!info) return null;

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-5 h-5 rounded-full flex items-center justify-center text-stone-300 hover:text-stone-500 hover:bg-stone-100 transition-all"
        aria-label={`Info: ${info.title}`}
      >
        <Info size={13} />
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-stone-100 p-4 text-left"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}>
          <p className="text-sm font-semibold text-stone-900 mb-1">{info.title}</p>
          <p className="text-[11px] font-mono text-stone-400 bg-stone-50 rounded-lg px-2 py-1 mb-2">{info.formula}</p>
          <p className="text-xs text-stone-600 leading-relaxed mb-2">{info.why}</p>
          {info.benchmark && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              <p className="text-[11px] text-amber-700 font-medium">📌 Benchmark</p>
              <p className="text-[11px] text-amber-600 mt-0.5">{info.benchmark}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TrendBadge({ value, suffix = '', invert = false }: { value: number; suffix?: string; invert?: boolean }) {
  const positive = invert ? value < 0 : value >= 0;
  if (value === 0) return <span className="text-[11px] text-stone-300 font-medium flex items-center gap-0.5"><Minus size={10} /> —</span>;
  return (
    <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
      {positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
      {Math.abs(value).toFixed(1)}{suffix}
    </span>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-1.5">{children}</label>;
}

function Input({ value, onChange, type = 'text', placeholder = '', className = '' }: any) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className={`w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sand-200 focus:bg-white transition-colors ${className}`} />
  );
}

function Select({ value, onChange, children, className = '' }: any) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className={`w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sand-200 focus:bg-white transition-colors ${className}`}>
      {children}
    </select>
  );
}

// Apple-style KPI card with info tooltip, trend badge, sparkline-style bar
function MetricCard({
  id, label, value, sub, valueColor = 'text-stone-900',
  trend, trendSuffix, invertTrend, accent,
}: {
  id: string; label: string; value: string | number; sub?: string;
  valueColor?: string; trend?: number; trendSuffix?: string; invertTrend?: boolean;
  accent?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-stone-100 flex flex-col gap-3 hover:shadow-md transition-all duration-200 ${accent ? `border-l-2 ${accent}` : ''}`}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 leading-tight">{label}</p>
        <InfoTooltip id={id} />
      </div>
      <div className="flex items-center justify-between flex-1">
        <p className={`text-[28px] font-bold tabular-nums leading-none tracking-tight ${valueColor}`}>{value}</p>
        <div className="text-right">
          {sub && <p className="text-[11px] text-stone-400 leading-tight">{sub}</p>}
          {trend !== undefined && <TrendBadge value={trend} suffix={trendSuffix} invert={invertTrend} />}
        </div>
      </div>
      <div className="flex items-center justify-between mt-auto pt-1 border-t border-stone-50">
      </div>
    </div>
  );
}

const EXPENSE_CATEGORIES = [
  'Cleaning', 'Maintenance & Repairs', 'Utilities (Electric/Water/Gas)',
  'Internet & TV', 'Platform Fees (Airbnb/Booking)', 'Linen & Supplies',
  'Insurance', 'Property Tax', 'Accountant/Legal', 'Marketing', 'Other',
];
const BOOKING_SOURCES = ['Airbnb', 'Booking.com', 'Direct', 'Other'];
const MONTHS = [1,2,3,4,5,6,7,8,9,10,11,12];

const CATEGORY_COLORS = [
  'bg-blue-400', 'bg-amber-400', 'bg-emerald-400', 'bg-purple-400',
  'bg-red-400', 'bg-cyan-400', 'bg-orange-400', 'bg-pink-400',
  'bg-teal-400', 'bg-indigo-400', 'bg-stone-400',
];

// ─── Main Component ────────────────────────────────────────────
export default function KPITab({ data, setData }: { data: any; setData: any }) {
  const year = currentYear();
  const [filterYear, setFilterYear] = useState(String(year));
  const [filterApt, setFilterApt] = useState('all');
  const [activeSection, setActiveSection] = useState<'overview' | 'bookings' | 'expenses'>('overview');
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const [newBooking, setNewBooking] = useState({
    aptId: data.apartments?.[0]?.id || '', guestName: '', source: 'Direct',
    checkIn: '', checkOut: '', totalRevenue: '', cleaningFee: '', platformFee: '', notes: '',
  });
  const [newExpense, setNewExpense] = useState({
    aptId: 'all', category: 'Cleaning', description: '', amount: '',
    date: new Date().toISOString().slice(0, 10), notes: '',
  });

  const bookings: any[] = data.bookings || [];
  const expenses: any[] = data.expenses || [];
  const apartments = data.apartments || [];

  const filteredBookings = useMemo(() => bookings.filter(b => {
    const aptMatch = filterApt === 'all' || b.aptId === filterApt;
    const yearMatch = filterYear === 'all' || b.checkIn?.slice(0, 4) === filterYear;
    return aptMatch && yearMatch;
  }), [bookings, filterApt, filterYear]);

  const filteredExpenses = useMemo(() => expenses.filter(e => {
    const aptMatch = filterApt === 'all' || e.aptId === 'all' || e.aptId === filterApt;
    const yearMatch = filterYear === 'all' || e.date?.slice(0, 4) === filterYear;
    return aptMatch && yearMatch;
  }), [expenses, filterApt, filterYear]);

  const platformRates = data.property?.platformFeeRates || { airbnb: 0.03, booking: 0.15, governmentTax: 0 };

  const kpi = useMemo(() => {
    // Auto-calculate platform fees from rates when not explicitly set
    const bookingsWithFees = filteredBookings.map((b: any) => {
      const src = normalizeSource(b.source);
      const rate = src === 'airbnb' ? platformRates.airbnb : src === 'booking' ? platformRates.booking : 0;
      const fee = Number(b.platformFee || 0);
      const revenue = Number(b.totalRevenue || 0);
      const computedFee = fee > 0 ? fee : revenue * rate;
      return { ...b, _computedPlatformFee: computedFee, _src: src };
    });

    const totalRevenue = bookingsWithFees.reduce((s, b) => s + Number(b.totalRevenue || 0), 0);
    const totalPlatformFees = bookingsWithFees.reduce((s, b) => s + Number(b._computedPlatformFee || 0), 0);
    const airbnbFees = bookingsWithFees.filter(b => b._src === 'airbnb').reduce((s, b) => s + Number(b._computedPlatformFee || 0), 0);
    const bookingFees = bookingsWithFees.filter(b => b._src === 'booking').reduce((s, b) => s + Number(b._computedPlatformFee || 0), 0);
    const totalExpenses = filteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const netRevenue = totalRevenue - totalPlatformFees;
    const netProfit = netRevenue - totalExpenses;
    const totalNights = bookingsWithFees.reduce((s, b) => s + nights(b.checkIn, b.checkOut), 0);
    const adr = totalNights > 0 ? totalRevenue / totalNights : 0;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Per-platform metrics
    const byPlatform = { airbnb: { revenue: 0, fees: 0, nights: 0, bookings: 0 }, booking: { revenue: 0, fees: 0, nights: 0, bookings: 0 }, direct: { revenue: 0, fees: 0, nights: 0, bookings: 0 } };
    bookingsWithFees.forEach(b => {
      const p = b._src as 'airbnb' | 'booking' | 'direct';
      byPlatform[p].revenue += Number(b.totalRevenue || 0);
      byPlatform[p].fees += Number(b._computedPlatformFee || 0);
      byPlatform[p].nights += nights(b.checkIn, b.checkOut);
      byPlatform[p].bookings += 1;
    });

    let daysInPeriod = 0;
    const yr = Number(filterYear);
    if (filterYear !== 'all' && !isNaN(yr)) {
      const isLeap = (yr % 4 === 0 && yr % 100 !== 0) || yr % 400 === 0;
      daysInPeriod = (isLeap ? 366 : 365) * (filterApt === 'all' ? apartments.length : 1);
    }
    const occupancyRate = daysInPeriod > 0 ? Math.min(100, (totalNights / daysInPeriod) * 100) : null;
    const revPAR = daysInPeriod > 0 ? totalRevenue / daysInPeriod : null;

    const monthlyRevenue: number[] = Array(12).fill(0);
    const monthlyNights: number[] = Array(12).fill(0);
    filteredBookings.forEach(b => {
      if (!b.checkIn) return;
      const m = new Date(b.checkIn).getMonth();
      monthlyRevenue[m] += Number(b.totalRevenue || 0);
      monthlyNights[m] += nights(b.checkIn, b.checkOut);
    });

    const aptRevenue: Record<string, number> = {};
    apartments.forEach((a: any) => { aptRevenue[a.id] = 0; });
    filteredBookings.forEach(b => { if (b.aptId in aptRevenue) aptRevenue[b.aptId] += Number(b.totalRevenue || 0); });

    const expByCategory: Record<string, number> = {};
    EXPENSE_CATEGORIES.forEach(c => { expByCategory[c] = 0; });
    filteredExpenses.forEach(e => { expByCategory[e.category] = (expByCategory[e.category] || 0) + Number(e.amount); });

    return { totalRevenue, totalPlatformFees, airbnbFees, bookingFees, totalExpenses, netRevenue, netProfit, totalNights,
             adr, profitMargin, occupancyRate, revPAR, monthlyRevenue, monthlyNights, aptRevenue, expByCategory, byPlatform };
  }, [filteredBookings, filteredExpenses, apartments, filterApt, filterYear, platformRates]);

  const addBooking = () => {
    if (!newBooking.checkIn || !newBooking.checkOut || !newBooking.totalRevenue) return;
    const revenue = Number(newBooking.totalRevenue);
    const src = normalizeSource(newBooking.source);
    const rate = src === 'airbnb' ? platformRates.airbnb : src === 'booking' ? platformRates.booking : 0;
    const manualFee = Number(newBooking.platformFee || 0);
    const platformFee = manualFee > 0 ? manualFee : revenue * rate;
    setData((d: any) => ({ ...d, bookings: [...(d.bookings || []), {
      id: `b_${Date.now()}`, ...newBooking,
      totalRevenue: revenue,
      cleaningFee: Number(newBooking.cleaningFee || 0),
      platformFee,
      createdAt: new Date().toISOString(),
    }]}));
    setNewBooking(s => ({ ...s, guestName: '', checkIn: '', checkOut: '', totalRevenue: '', cleaningFee: '', platformFee: '', notes: '' }));
    setShowAddBooking(false);
  };

  const addExpense = () => {
    if (!newExpense.amount || !newExpense.date) return;
    setData((d: any) => ({ ...d, expenses: [...(d.expenses || []), {
      id: `e_${Date.now()}`, ...newExpense, amount: Number(newExpense.amount),
    }]}));
    setNewExpense(s => ({ ...s, description: '', amount: '', notes: '' }));
    setShowAddExpense(false);
  };

  const removeBooking = (id: string) => setData((d: any) => ({ ...d, bookings: (d.bookings||[]).filter((b:any) => b.id !== id) }));
  const removeExpense = (id: string) => setData((d: any) => ({ ...d, expenses: (d.expenses||[]).filter((e:any) => e.id !== id) }));

  const availableYears = useMemo(() => {
    const ys = new Set([String(year)]);
    bookings.forEach(b => b.checkIn && ys.add(b.checkIn.slice(0, 4)));
    expenses.forEach(e => e.date && ys.add(e.date.slice(0, 4)));
    return Array.from(ys).sort().reverse();
  }, [bookings, expenses, year]);

  const maxMonthlyRevenue = Math.max(...kpi.monthlyRevenue, 1);
  const maxExpCat = Math.max(...Object.values(kpi.expByCategory), 1);

  const TABS = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart2 },
    { id: 'bookings' as const, label: 'Bookings', icon: Calendar },
    { id: 'expenses' as const, label: 'Expenses', icon: DollarSign },
  ];

  return (
    <div className="space-y-5">

      {/* ── Top bar ── */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)' }}>
        <div className="px-6 pt-6 pb-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">KPI & Finance</h2>
              <p className="text-xs text-stone-400 mt-0.5">Performance overview · all figures in EUR</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={filterYear} onChange={setFilterYear} className="!w-24 !py-2 !text-xs">
                <option value="all">All years</option>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </Select>
              <Select value={filterApt} onChange={setFilterApt} className="!w-36 !py-2 !text-xs">
                <option value="all">All apartments</option>
                {apartments.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
            </div>
          </div>
        </div>
        {/* Segment control tabs */}
        <div className="flex border-t border-stone-100">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveSection(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-all border-b-2 ${
                activeSection === tab.id
                  ? 'text-stone-900 border-stone-900 bg-stone-50'
                  : 'text-stone-400 border-transparent hover:text-stone-600 hover:bg-stone-50'
              }`}>
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ OVERVIEW ══ */}
      {activeSection === 'overview' && (
        <>
          {/* Row 1: Primary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard id="totalRevenue" label="Total Revenue" value={fmt(kpi.totalRevenue)}
              sub="Gross before fees" valueColor="text-emerald-600" accent="border-l-emerald-400" />
            <MetricCard id="netProfit" label="Net Profit" value={fmt(kpi.netProfit)}
              sub="After all deductions" valueColor={kpi.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}
              accent={kpi.netProfit >= 0 ? 'border-l-emerald-400' : 'border-l-red-400'} />
            <MetricCard id="adr" label="Avg. Daily Rate" value={fmtDec(kpi.adr)}
              sub={`${kpi.totalNights} nights`} accent="border-l-blue-300" />
            <MetricCard id="occupancyRate" label="Occupancy Rate"
              value={kpi.occupancyRate !== null ? fmtPct(kpi.occupancyRate) : '—'}
              sub={kpi.occupancyRate !== null ? 'Of available nights' : 'Select a year'}
              valueColor={kpi.occupancyRate !== null ? (kpi.occupancyRate >= 65 ? 'text-emerald-600' : kpi.occupancyRate >= 40 ? 'text-amber-500' : 'text-red-500') : 'text-stone-300'}
              accent={kpi.occupancyRate !== null ? (kpi.occupancyRate >= 65 ? 'border-l-emerald-400' : 'border-l-amber-400') : ''} />
          </div>

          {/* Row 2: Secondary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard id="profitMargin" label="Profit Margin"
              value={fmtPct(kpi.profitMargin)}
              sub="Net profit / gross revenue"
              valueColor={kpi.profitMargin >= 40 ? 'text-emerald-600' : kpi.profitMargin >= 20 ? 'text-amber-500' : 'text-red-500'}
              accent={kpi.profitMargin >= 40 ? 'border-l-emerald-400' : kpi.profitMargin >= 20 ? 'border-l-amber-400' : 'border-l-red-400'} />
            <MetricCard id="airbnbFees" label="Airbnb Fees" value={fmt(kpi.airbnbFees)}
              sub={`${fmtPct(platformRates.airbnb * 100)} rate`} valueColor="text-rose-500" accent="border-l-rose-300" />
            <MetricCard id="bookingFees" label="Booking.com Fees" value={fmt(kpi.bookingFees)}
              sub={`${fmtPct(platformRates.booking * 100)} rate`} valueColor="text-blue-500" accent="border-l-blue-300" />
            <MetricCard id="totalExpenses" label="Total Expenses" value={fmt(kpi.totalExpenses)}
              sub="All operating costs" valueColor="text-red-500" accent="border-l-red-300" />
          </div>

          {/* Per-platform breakdown */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-4">Performance by Channel</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {([
                { key: 'airbnb', label: 'Airbnb', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
                { key: 'booking', label: 'Booking.com', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
                { key: 'direct', label: 'Direct / Private', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
              ] as const).map(p => {
                const d = kpi.byPlatform[p.key];
                const profit = d.revenue - d.fees;
                return (
                  <div key={p.key} className={`rounded-xl p-4 border ${p.border} ${p.bg}`}>
                    <p className={`text-xs font-bold uppercase tracking-widest ${p.color} mb-3`}>{p.label}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-stone-500">Revenue</span>
                        <span className="text-sm font-bold text-stone-800">{fmt(d.revenue)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-stone-500">Platform fee</span>
                        <span className="text-sm font-bold text-stone-600">{fmt(d.fees)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-stone-500">Profit</span>
                        <span className="text-sm font-bold text-emerald-600">{fmt(profit)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-stone-500">Nights</span>
                        <span className="text-sm font-bold text-stone-800">{d.nights}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-stone-500">Bookings</span>
                        <span className="text-sm font-bold text-stone-800">{d.bookings}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RevPAR + Apartment bars */}
          {kpi.revPAR !== null && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
              <MetricCard id="revPAR" label="RevPAR"
                value={fmtDec(kpi.revPAR)} sub="Revenue per available room/night"
                accent="border-l-purple-300" valueColor="text-purple-600" />
              <div className="lg:col-span-3 bg-white rounded-2xl border border-stone-100 p-5"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-4">Revenue by Apartment</p>
                <div className="space-y-3">
                  {apartments.map((a: any) => {
                    const rev = kpi.aptRevenue[a.id] || 0;
                    const pct = kpi.totalRevenue > 0 ? (rev / kpi.totalRevenue) * 100 : 0;
                    return (
                      <div key={a.id} className="flex items-center gap-3">
                        <p className="text-xs text-stone-600 w-24 truncate flex-shrink-0 font-medium">{a.name}</p>
                        <div className="flex-1 bg-stone-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-gradient-to-r from-sand-400 to-sand-600 rounded-full h-2 transition-all duration-500"
                            style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs font-bold tabular-nums text-stone-800 w-16 text-right">{fmt(rev)}</p>
                        <p className="text-[11px] text-stone-400 w-10 text-right">{pct.toFixed(0)}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Monthly revenue chart */}
          {filterYear !== 'all' && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between mb-5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">Monthly Revenue — {filterYear}</p>
                <p className="text-xs text-stone-400 tabular-nums">{fmt(kpi.totalRevenue)} total</p>
              </div>
              <div className="flex items-end gap-1.5 h-28">
                {MONTHS.map((m, i) => {
                  const rev = kpi.monthlyRevenue[i];
                  const pct = rev > 0 ? Math.max(4, (rev / maxMonthlyRevenue) * 100) : 0;
                  const isCurrentMonth = i === new Date().getMonth() && filterYear === String(year);
                  return (
                    <div key={m} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                      {rev > 0 && (
                        <div className="absolute bottom-full mb-7 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                          {fmt(rev)}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
                        </div>
                      )}
                      <div className="w-full flex items-end" style={{ height: '100px' }}>
                        <div
                          className={`w-full rounded-lg transition-all duration-500 ${
                            rev > 0
                              ? isCurrentMonth
                                ? 'bg-gradient-to-t from-sand-600 to-sand-400'
                                : 'bg-gradient-to-t from-sand-400 to-sand-300 group-hover:from-sand-500 group-hover:to-sand-400'
                              : 'bg-stone-100'
                          }`}
                          style={{ height: rev > 0 ? `${pct}%` : '6px' }}
                        />
                      </div>
                      <p className={`text-[10px] font-medium ${isCurrentMonth ? 'text-sand-600' : 'text-stone-400'}`}>
                        {monthLabel(m)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expense breakdown */}
          {filteredExpenses.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-4">Expense Breakdown</p>
              <div className="space-y-2.5">
                {EXPENSE_CATEGORIES.map((cat, ci) => {
                  const total = kpi.expByCategory[cat] || 0;
                  if (total === 0) return null;
                  const pct = kpi.totalExpenses > 0 ? (total / kpi.totalExpenses) * 100 : 0;
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${CATEGORY_COLORS[ci]}`} />
                      <p className="text-xs text-stone-600 w-44 flex-shrink-0">{cat}</p>
                      <div className="flex-1 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                        <div className={`${CATEGORY_COLORS[ci]} rounded-full h-1.5 transition-all duration-500`}
                          style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs font-semibold tabular-nums text-stone-700 w-16 text-right">{fmt(total)}</p>
                      <p className="text-[11px] text-stone-400 w-8 text-right">{pct.toFixed(0)}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {kpi.totalExpenses === 0 && (
            <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart2 size={24} className="text-stone-400" />
              </div>
              <p className="font-semibold text-stone-700 text-base mb-1">No data yet</p>
              <p className="text-sm text-stone-400 max-w-xs mx-auto">Add bookings and expenses in the tabs above. KPIs calculate automatically.</p>
            </div>
          )}
        </>
      )}

      {/* ══ BOOKINGS ══ */}
      {activeSection === 'bookings' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-400">
              {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} · {fmt(kpi.totalRevenue)} gross revenue
            </p>
            <button onClick={() => setShowAddBooking(v => !v)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                showAddBooking
                  ? 'bg-stone-100 text-stone-600'
                  : 'bg-stone-900 text-white hover:bg-stone-700'
              }`}>
              <Plus size={14} />
              {showAddBooking ? 'Cancel' : 'Add Booking'}
            </button>
          </div>

          {/* Add booking form */}
          {showAddBooking && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4">New Booking</p>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Apartment</Label>
                  <Select value={newBooking.aptId} onChange={(v:string) => setNewBooking(s => ({...s, aptId: v}))}>
                    {apartments.map((a:any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </Select></div>
                <div><Label>Source</Label>
                  <Select value={newBooking.source} onChange={(v:string) => setNewBooking(s => ({...s, source: v}))}>
                    {BOOKING_SOURCES.map(src => <option key={src}>{src}</option>)}
                  </Select></div>
                <div><Label>Guest name</Label>
                  <Input value={newBooking.guestName} onChange={(v:string) => setNewBooking(s => ({...s, guestName: v}))} placeholder="Maria K." /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Check-in</Label>
                    <Input type="date" value={newBooking.checkIn} onChange={(v:string) => setNewBooking(s => ({...s, checkIn: v}))} /></div>
                  <div><Label>Check-out</Label>
                    <Input type="date" value={newBooking.checkOut} onChange={(v:string) => setNewBooking(s => ({...s, checkOut: v}))} /></div>
                </div>
                <div><Label>Total Revenue (€)</Label>
                  <Input type="number" value={newBooking.totalRevenue} onChange={(v:string) => setNewBooking(s => ({...s, totalRevenue: v}))} placeholder="420" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Platform fee (€)</Label>
                    <Input type="number" value={newBooking.platformFee} onChange={(v:string) => setNewBooking(s => ({...s, platformFee: v}))} placeholder="0" /></div>
                  <div><Label>Cleaning fee (€)</Label>
                    <Input type="number" value={newBooking.cleaningFee} onChange={(v:string) => setNewBooking(s => ({...s, cleaningFee: v}))} placeholder="0" /></div>
                </div>
                <div className="col-span-2"><Label>Notes</Label>
                  <Input value={newBooking.notes} onChange={(v:string) => setNewBooking(s => ({...s, notes: v}))} placeholder="Optional notes…" /></div>
              </div>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-stone-100">
                <button onClick={addBooking}
                  disabled={!newBooking.checkIn || !newBooking.checkOut || !newBooking.totalRevenue}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all">
                  Save Booking
                </button>
                {newBooking.checkIn && newBooking.checkOut && newBooking.totalRevenue && (
                  <p className="text-xs text-stone-400">
                    {nights(newBooking.checkIn, newBooking.checkOut)} nights ·{' '}
                    {fmtDec(Number(newBooking.totalRevenue) / Math.max(1, nights(newBooking.checkIn, newBooking.checkOut)))} / night
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Booking table */}
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 text-stone-400">
                <BookOpen size={28} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium text-stone-500 mb-1">No bookings yet</p>
                <p className="text-xs">Click "Add Booking" to log your first reservation.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-100 bg-stone-50">
                      {['Guest', 'Apartment', 'Dates', 'Nights', 'Revenue', 'Platform fee', 'ADR', 'Source', ''].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-[10px] font-bold text-stone-400 uppercase tracking-wider first:rounded-tl-2xl">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...filteredBookings].sort((a, b) => (b.checkIn || '').localeCompare(a.checkIn || '')).map((b, i) => {
                      const apt = apartments.find((a:any) => a.id === b.aptId);
                      const n = nights(b.checkIn, b.checkOut);
                      const adrVal = n > 0 ? b.totalRevenue / n : 0;
                      return (
                        <tr key={b.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-stone-800 text-sm">{b.guestName || '—'}</td>
                          <td className="py-3 px-4 text-stone-500 text-sm">{apt?.name || b.aptId}</td>
                          <td className="py-3 px-4 text-stone-500 text-xs whitespace-nowrap">{b.checkIn} → {b.checkOut}</td>
                          <td className="py-3 px-4 text-right tabular-nums text-stone-700 text-sm font-medium">{n}</td>
                          <td className="py-3 px-4 text-right tabular-nums font-bold text-emerald-600 text-sm">{fmt(b.totalRevenue)}</td>
                          <td className="py-3 px-4 text-right tabular-nums text-orange-500 text-sm">{b.platformFee > 0 ? fmt(b.platformFee) : <span className="text-stone-300">—</span>}</td>
                          <td className="py-3 px-4 text-right tabular-nums text-stone-500 text-xs">{fmtDec(adrVal)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                              b.source === 'Airbnb' ? 'bg-red-50 text-red-500' :
                              b.source === 'Booking.com' ? 'bg-blue-50 text-blue-500' :
                              b.source === 'Direct' ? 'bg-emerald-50 text-emerald-600' :
                              'bg-stone-100 text-stone-500'
                            }`}>{b.source}</span>
                          </td>
                          <td className="py-3 px-4">
                            <button onClick={() => removeBooking(b.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-200 hover:text-red-500 hover:bg-red-50 transition-all">
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-stone-200 bg-stone-50">
                      <td colSpan={4} className="py-3 px-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Total</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 tabular-nums text-sm">{fmt(kpi.totalRevenue)}</td>
                      <td className="py-3 px-4 text-right font-bold text-orange-500 tabular-nums text-sm">{fmt(kpi.totalPlatformFees)}</td>
                      <td className="py-3 px-4 text-right text-stone-400 tabular-nums text-xs">{fmtDec(kpi.adr)}</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ══ EXPENSES ══ */}
      {activeSection === 'expenses' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-400">
              {filteredExpenses.length} item{filteredExpenses.length !== 1 ? 's' : ''} · {fmt(kpi.totalExpenses)} total
            </p>
            <button onClick={() => setShowAddExpense(v => !v)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                showAddExpense ? 'bg-stone-100 text-stone-600' : 'bg-stone-900 text-white hover:bg-stone-700'
              }`}>
              <Plus size={14} />
              {showAddExpense ? 'Cancel' : 'Add Expense'}
            </button>
          </div>

          {showAddExpense && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4">New Expense</p>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Apartment</Label>
                  <Select value={newExpense.aptId} onChange={(v:string) => setNewExpense(s => ({...s, aptId: v}))}>
                    <option value="all">All apartments (shared)</option>
                    {apartments.map((a:any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </Select></div>
                <div><Label>Category</Label>
                  <Select value={newExpense.category} onChange={(v:string) => setNewExpense(s => ({...s, category: v}))}>
                    {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </Select></div>
                <div><Label>Description</Label>
                  <Input value={newExpense.description} onChange={(v:string) => setNewExpense(s => ({...s, description: v}))} placeholder="e.g. Plumber visit, new AC unit…" /></div>
                <div><Label>Amount (€)</Label>
                  <Input type="number" value={newExpense.amount} onChange={(v:string) => setNewExpense(s => ({...s, amount: v}))} placeholder="0.00" /></div>
                <div><Label>Date</Label>
                  <Input type="date" value={newExpense.date} onChange={(v:string) => setNewExpense(s => ({...s, date: v}))} /></div>
                <div><Label>Notes</Label>
                  <Input value={newExpense.notes} onChange={(v:string) => setNewExpense(s => ({...s, notes: v}))} placeholder="Optional…" /></div>
              </div>
              <div className="mt-4 pt-4 border-t border-stone-100">
                <button onClick={addExpense}
                  disabled={!newExpense.amount || !newExpense.date}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all">
                  Save Expense
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12 text-stone-400">
                <DollarSign size={28} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium text-stone-500 mb-1">No expenses yet</p>
                <p className="text-xs">Click "Add Expense" to log your first cost.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-100 bg-stone-50">
                      {['Date', 'Category', 'Description', 'Apartment', 'Amount', ''].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-[10px] font-bold text-stone-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...filteredExpenses].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(e => {
                      const apt = apartments.find((a:any) => a.id === e.aptId);
                      const ci = EXPENSE_CATEGORIES.indexOf(e.category);
                      return (
                        <tr key={e.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                          <td className="py-3 px-4 text-stone-500 text-xs whitespace-nowrap">{e.date}</td>
                          <td className="py-3 px-4">
                            <span className="flex items-center gap-1.5 text-xs text-stone-600">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${CATEGORY_COLORS[ci] || 'bg-stone-300'}`} />
                              {e.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-stone-700 text-sm">{e.description || <span className="text-stone-300">—</span>}</td>
                          <td className="py-3 px-4 text-stone-500 text-xs">{e.aptId === 'all' ? 'All (shared)' : (apt?.name || e.aptId)}</td>
                          <td className="py-3 px-4 text-right font-bold tabular-nums text-red-500 text-sm">{fmt(e.amount)}</td>
                          <td className="py-3 px-4">
                            <button onClick={() => removeExpense(e.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-200 hover:text-red-500 hover:bg-red-50 transition-all">
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-stone-200 bg-stone-50">
                      <td colSpan={4} className="py-3 px-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Total</td>
                      <td className="py-3 px-4 text-right font-bold text-red-500 tabular-nums text-sm">{fmt(kpi.totalExpenses)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
