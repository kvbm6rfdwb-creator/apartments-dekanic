"use client";
import { useState, useCallback, useEffect } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import { addDays, isBefore, startOfToday, differenceInCalendarDays, format, isWithinInterval, parseISO } from 'date-fns';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Loader2, Check, ChevronRight, ChevronLeft, X, Minus, Plus, CalendarDays } from 'lucide-react';
import { calcPrice, fmtEur, type Pricing } from '@/lib/pricing';
import 'react-day-picker/style.css';

interface Blocked { start: string; end: string;
  [key: string]: any;
}
interface Props { apt: any; locale: string; calendarTitle: string; whatsapp: string;
  [key: string]: any;
}

const INPUT = 'w-full px-4 py-3 rounded-xl border border-sand-200 bg-white text-stone-800 text-sm placeholder:text-stone-300 focus:border-sand-500 focus:outline-none focus:ring-2 focus:ring-sand-100 transition-all duration-200';

const SAND = '#b97a3a';
const SAND_LIGHT = '#f9f0e3';
const SAND_MID = '#f2dfc4';

function isBlockedFn(date: Date, list: Blocked[]) {
  return list.some(r => {
    try { return isWithinInterval(date, { start: parseISO(r.start), end: addDays(parseISO(r.end), -1) }); }
    catch { return false; }
  });
}

function Steps({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {labels.map((label, i) => {
        const done = i < step, active = i === step;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                ${done ? 'bg-sand-600 text-white' : active ? 'bg-sand-600 text-white ring-4 ring-sand-200' : 'bg-stone-100 text-stone-400'}`}>
                {done ? <Check size={12} strokeWidth={3}/> : i + 1}
              </div>
              <span className={`text-[9px] font-bold tracking-widest uppercase ${active ? 'text-sand-700' : done ? 'text-sand-500' : 'text-stone-300'}`}>{label}</span>
            </div>
            {i < 2 && <div className={`w-10 h-px mx-1 mb-4 ${done ? 'bg-sand-400' : 'bg-stone-200'}`}/>}
          </div>
        );
      })}
    </div>
  );
}

function PriceBox({ from, to, pricing, guests, totalLabel }: { from: Date; to: Date; pricing: Pricing; guests: number; totalLabel: string }) {
  const p = calcPrice(from, to, pricing, guests);
  if (p.nights < 1) return null;
  return (
    <div className="rounded-2xl border border-sand-200 overflow-hidden text-sm mt-3">
      {p.nightGroups.map((g, i) => (
        <div key={i} className="flex justify-between px-4 py-2.5 border-b border-sand-100 bg-white">
          <span className="text-stone-500">{g.label} · {fmtEur(g.rate)} × {g.nights}n</span>
          <span className="font-medium text-stone-700">{fmtEur(g.subtotal)}</span>
        </div>
      ))}
      {p.feesGuest.map((f, i) => (
        <div key={i} className="flex justify-between px-4 py-2.5 border-b border-sand-100 bg-white">
          <span className="text-stone-500">{f.name}</span>
          <span className="font-medium text-stone-700">{fmtEur(f.amount)}</span>
        </div>
      ))}
      <div className="flex justify-between px-4 py-3 bg-sand-600 text-white font-bold">
        <span>{totalLabel}</span>
        <span className="text-base">{fmtEur(p.totalGuest)}</span>
      </div>
    </div>
  );
}

export default function ApartmentBookingSidebar({ apt, locale, calendarTitle, whatsapp }: Props) {
  const t   = useTranslations('booking');
  const tc  = useTranslations('calendar');
  const today = startOfToday();
  const phone = whatsapp.replace(/\D/g, '');

  const [blocked,    setBlocked]    = useState<Blocked[]>([]);
  const [calLoad,    setCalLoad]    = useState(true);
  const [range,      setRange]      = useState<DateRange | undefined>();
  const [step,       setStep]       = useState(0);
  const [sending,    setSending]    = useState(false);
  const [done,       setDone]       = useState(false);
  const [guestCount, setGuestCount] = useState(2);
  const [form,       setForm]       = useState({ name: '', email: '', phone: '', message: '' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const nights  = range?.from && range?.to ? differenceInCalendarDays(range.to, range.from) : 0;
  const fmtD    = (d: Date) => format(d, 'd MMM yyyy');
  const pricing: Pricing | null = apt.pricing || null;

  useEffect(() => {
    fetch(`/api/calendar?apt=${apt.id}`)
      .then(r => r.json())
      .then(d => { setBlocked(d.blocked || []); setCalLoad(false); })
      .catch(() => setCalLoad(false));
  }, [apt.id]);

  const disabled = useCallback((d: Date) => isBefore(d, today) || isBlockedFn(d, blocked), [blocked, today]);

  const getMinStay = (from: Date): number => {
    const seasons = pricing?.seasons || [];
    const mmdd = format(from, 'MM-dd');
    for (const s of seasons) {
      if (s.from <= mmdd && mmdd <= s.to) return (s as any).minStay ?? 1;
    }
    return (pricing as any)?.minStay ?? 1;
  };

  const [minStayWarn, setMinStayWarn] = useState('');

  const handleSelect = (r: DateRange | undefined) => {
    setMinStayWarn('');
    if (r?.from && r?.to) {
      let d = new Date(r.from);
      while (d <= r.to) { if (isBlockedFn(d, blocked)) return; d = addDays(d, 1); }
      const min = getMinStay(r.from);
      const n = differenceInCalendarDays(r.to, r.from);
      if (n < min) {
        setMinStayWarn(t('minStayWarning', { n: min }));
        setRange({ from: r.from, to: undefined });
        return;
      }
    }
    setRange(r);
  };

  const handleSubmit = async () => {
    setSending(true);
    try {
      const res = await fetch('/api/booking', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aptId: apt.id, locale, ...form, guests: String(guestCount),
          checkIn: range!.from!.toISOString().slice(0, 10), checkOut: range!.to!.toISOString().slice(0, 10) }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch { toast.error(t('error')); }
    finally { setSending(false); }
  };

  const PrimaryBtn = ({ children, onClick, disabled: dis }: any) => (
    <button onClick={onClick} disabled={dis}
      className="w-full py-4 rounded-2xl bg-sand-600 hover:bg-sand-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg active:scale-[.98] disabled:opacity-30 disabled:cursor-not-allowed">
      {children}
    </button>
  );
  const BackBtn = ({ onClick }: any) => (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl border border-sand-200 text-sand-700 text-sm font-semibold hover:bg-sand-50 transition-all duration-200 active:scale-[.98]">
      <ChevronLeft size={15}/> {t('back')}
    </button>
  );

  if (done) return (
    <div className="bg-white rounded-3xl border border-sand-100 shadow-xl overflow-hidden w-full">
      <div className="flex flex-col items-center text-center px-8 py-14 gap-5">
        <div className="w-14 h-14 rounded-full bg-sand-600 flex items-center justify-center">
          <Check size={26} strokeWidth={2.5} className="text-white"/>
        </div>
        <div>
          <h3 className="font-serif text-2xl text-stone-900 mb-2">{t('requestSent')}</h3>
          <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
            {t.rich('confirmReply', {
              email: () => <strong className="text-stone-700">{form.email}</strong>
            })}
          </p>
        </div>
        <div className="w-full bg-sand-50 rounded-2xl px-5 py-4 text-sm space-y-2.5 text-left border border-sand-100">
          {([[t('apartmentLabel'), apt.name],[tc('checkIn'),fmtD(range!.from!)],[tc('checkOut'),fmtD(range!.to!)],[t('guests'),String(guestCount)]] as [string,string][]).map(([k,v])=>(
            <div key={k} className="flex justify-between"><span className="text-stone-400">{k}</span><span className="font-semibold text-stone-800">{v}</span></div>
          ))}
          {pricing && nights > 0 && (
            <div className="flex justify-between pt-2.5 border-t border-sand-200">
              <span className="text-stone-400">{t('estimatedTotal')}</span>
              <span className="font-bold text-sand-700">{fmtEur(calcPrice(range!.from!, range!.to!, pricing, guestCount).totalGuest)}</span>
            </div>
          )}
        </div>
        {phone && (
          <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer"
            className="text-sm text-[#25D366] font-semibold flex items-center gap-2 hover:underline">
            <svg className="w-4 h-4 opacity-60" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            {t('followUpWhatsapp')}
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <style>{`
        .dk-cal {
          --rdp-accent-color: ${SAND};
          --rdp-accent-background-color: ${SAND_LIGHT};
          --rdp-month-width: 100%;
          --rdp-day-width: 100%;
          --rdp-day-height: auto;
          width: 100%;
          display: block;
        }
        .dk-cal .rdp-root {
          width: 100% !important;
          max-width: 100% !important;
          --rdp-month-width: 100%;
        }
        .dk-cal .rdp-months {
          width: 100% !important;
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 32px !important;
          align-items: start;
        }
        .dk-cal .rdp-month {
          width: 100% !important;
          min-width: 0 !important;
          overflow: visible;
        }
        .dk-cal .rdp-month_grid {
          width: 100% !important;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .dk-cal .rdp-month_caption {
          display: flex; align-items: center; justify-content: space-between;
          padding-bottom: 12px; margin-bottom: 8px;
          border-bottom: 1px solid #f2dfc4;
          width: 100%;
        }
        .dk-cal .rdp-month_caption_label {
          font-family: 'Playfair Display', Georgia, serif !important;
          font-size: 16px !important; font-weight: 500 !important;
          color: #443932 !important;
        }
        .dk-cal .rdp-nav {
          display: flex; gap: 4px; align-items: center;
        }
        .dk-cal .rdp-button_previous,
        .dk-cal .rdp-button_next {
          width: 30px; height: 30px; border-radius: 8px;
          color: ${SAND} !important;
          background: transparent !important;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .dk-cal .rdp-button_previous svg,
        .dk-cal .rdp-button_next svg {
          stroke: ${SAND} !important;
          fill: ${SAND} !important;
          color: ${SAND} !important;
        }
        .dk-cal .rdp-button_previous:hover,
        .dk-cal .rdp-button_next:hover {
          background: ${SAND_LIGHT} !important;
        }
        .dk-cal .rdp-weekdays {
          display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 4px;
          width: 100%;
        }
        .dk-cal .rdp-weekday {
          text-align: center; font-size: 10px; font-weight: 700;
          color: #c4b49a; letter-spacing: 0.08em; text-transform: uppercase;
          padding: 6px 0;
        }
        .dk-cal .rdp-week {
          display: grid; grid-template-columns: repeat(7, 1fr);
          width: 100%;
        }
        .dk-cal .rdp-day { padding: 1px; }
        .dk-cal .rdp-day_button {
          width: 100%; aspect-ratio: 1; border-radius: 6px; border: none;
          font-size: 13px; font-weight: 400; color: #443932;
          background: transparent; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.1s, color 0.1s;
        }
        .dk-cal .rdp-day_button:hover {
          background: ${SAND_LIGHT};
          color: ${SAND};
        }
        .dk-cal .rdp-today .rdp-day_button {
          color: ${SAND}; font-weight: 700;
          box-shadow: inset 0 0 0 1.5px ${SAND};
          border-radius: 6px;
        }
        .dk-cal .rdp-range_start .rdp-day_button {
          background: ${SAND} !important; color: white !important;
          border-radius: 6px 0 0 6px !important; font-weight: 600 !important;
        }
        .dk-cal .rdp-range_end .rdp-day_button {
          background: ${SAND} !important; color: white !important;
          border-radius: 0 6px 6px 0 !important; font-weight: 600 !important;
        }
        .dk-cal .rdp-range_middle .rdp-day_button {
          background: ${SAND_MID} !important;
          color: #7d4c27 !important;
          border-radius: 0 !important;
        }
        .dk-cal .rdp-disabled .rdp-day_button {
          color: #e0d9d0 !important; cursor: not-allowed !important; pointer-events: none;
        }
        .dk-cal .day-booked .rdp-day_button {
          background: #f5f0eb !important; color: #ccc5bb !important;
          text-decoration: line-through !important; pointer-events: none;
          font-size: 11px !important;
        }
        .dk-cal .rdp-outside .rdp-day_button { color: #e0d9d0; }
      `}</style>

      <div className="bg-white rounded-3xl border border-sand-100 shadow-xl overflow-hidden w-full">
        <div className="px-6 pt-6 pb-4 border-b border-sand-100 bg-gradient-to-r from-sand-50 to-white">
          <p className="text-[10px] font-bold tracking-[.2em] uppercase text-sand-600 mb-0.5">{t('directBooking')}</p>
          <h3 className="font-serif text-xl text-stone-900 leading-tight">{apt.name}</h3>
          <p className="text-stone-400 text-xs mt-0.5">{t('noFeesBestPrice')}</p>
        </div>

        <div className="py-6">
          <div className="px-6 mb-6"><Steps step={step} labels={[t('steps.0'), t('steps.1'), t('steps.2')]}/></div>

          {step === 0 && (
            <div>
              {calLoad ? (
                <div className="flex items-center justify-center py-16 gap-3 px-6">
                  <Loader2 size={18} className="animate-spin text-sand-400"/>
                  <span className="text-stone-400 text-sm">{tc('loading')}</span>
                </div>
              ) : (
                <div className="dk-cal px-3">
                  <DayPicker
                    mode="range"
                    selected={range}
                    onSelect={handleSelect}
                    disabled={disabled}
                    modifiers={{ booked: (d: Date) => isBlockedFn(d, blocked) }}
                    modifiersClassNames={{ booked: 'day-booked' }}
                    numberOfMonths={2}
                    fromDate={today}
                    showOutsideDays={false}
                    formatters={{
                      formatWeekdayName: (day: Date) => ['Su','Mo','Tu','We','Th','Fr','Sa'][day.getDay()],
                    }}
                  />
                </div>
              )}

              {minStayWarn && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mt-3 mb-1 flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {minStayWarn}
                </p>
              )}
              <div className="flex gap-5 text-xs text-stone-400 mt-4 mb-3 px-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{background:SAND}}/>{tc('available')}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{background:'#e8e0d6', border:'1px solid #c4bbad'}}/>{tc('booked')}
                </span>
              </div>

              {range?.from && range?.to ? (
                <>
                  <div className="flex items-center bg-sand-50 border border-sand-200 rounded-2xl px-4 py-3 mb-1">
                    <div className="flex-1 text-center">
                      <p className="text-[9px] uppercase tracking-widest text-sand-600 font-bold mb-0.5">{tc('checkIn')}</p>
                      <p className="text-sm font-semibold text-stone-900">{fmtD(range.from)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2">
                      <div className="h-px w-3 bg-sand-300"/>
                      <span className="text-xs font-bold text-sand-600 whitespace-nowrap">{nights}n</span>
                      <div className="h-px w-3 bg-sand-300"/>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-[9px] uppercase tracking-widest text-sand-600 font-bold mb-0.5">{tc('checkOut')}</p>
                      <p className="text-sm font-semibold text-stone-900">{fmtD(range.to)}</p>
                    </div>
                    <button onClick={() => setRange(undefined)} className="ml-2 text-sand-300 hover:text-red-400 transition-colors">
                      <X size={14}/>
                    </button>
                  </div>
                  {pricing && <PriceBox from={range.from} to={range.to} pricing={pricing} guests={guestCount} totalLabel={t('total')}/>}
                </>
              ) : (
                <div className="flex items-center justify-center gap-2 py-3 text-stone-400 text-xs">
                  <CalendarDays size={13}/> {t('selectCheckDates')}
                </div>
              )}

              <PrimaryBtn onClick={() => setStep(1)} disabled={!range?.from || !range?.to || nights < 1}>
                {t('continue')} <ChevronRight size={15} strokeWidth={2.5}/>
              </PrimaryBtn>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 px-6">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-1.5">{t('fullNameRequired')}</label>
                <input className={INPUT} type="text" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Maria Müller"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-1.5">{t('emailRequired')}</label>
                <input className={INPUT} type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="maria@email.com"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-1.5">{t('phoneShort')}</label>
                <input className={INPUT} type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+49 123 456 789"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-1.5">{t('guestsRequired')}</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-xl border border-sand-200 bg-white overflow-hidden shrink-0">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setGuestCount(g => Math.max(1, g - 1)); }}
                      disabled={guestCount <= 1}
                      className="w-9 h-9 flex items-center justify-center text-sand-600 hover:bg-sand-50 active:bg-sand-100 transition-colors disabled:text-stone-200 disabled:cursor-not-allowed border-r border-sand-200">
                      <Minus size={13} strokeWidth={2.5}/>
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-stone-900 select-none tabular-nums">
                      {guestCount}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setGuestCount(g => Math.min(apt.maxGuests ?? 10, g + 1)); }}
                      disabled={guestCount >= (apt.maxGuests ?? 10)}
                      className="w-9 h-9 flex items-center justify-center text-sand-600 hover:bg-sand-50 active:bg-sand-100 transition-colors disabled:text-stone-200 disabled:cursor-not-allowed border-l border-sand-200">
                      <Plus size={13} strokeWidth={2.5}/>
                    </button>
                  </div>
                  <span className="text-sm text-stone-500">
                    {guestCount === 1 ? t('guestOne') : t('guestMany', { count: guestCount })}
                    {apt.maxGuests ? <span className="text-stone-300 text-xs ml-1">{t('maxGuests', { count: apt.maxGuests })}</span> : null}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-1.5">{t('specialRequests')}</label>
                <textarea className={INPUT + ' resize-none'} rows={3} value={form.message} onChange={e => set('message', e.target.value)} placeholder="Early check-in, baby cot, allergies…"/>
              </div>
              <div className="flex gap-3 pt-1">
                <BackBtn onClick={() => setStep(0)}/>
                <button onClick={() => setStep(2)} disabled={!form.name || !form.email}
                  className="flex-1 py-3.5 rounded-2xl bg-sand-600 hover:bg-sand-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg active:scale-[.98] disabled:opacity-30 disabled:cursor-not-allowed">
                  {t('review')} <ChevronRight size={15} strokeWidth={2.5}/>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-sand-100 overflow-hidden text-sm">
                {([
                  [t('apartmentLabel'), apt.name],
                  [tc('checkIn'),  range?.from ? fmtD(range.from) : ''],
                  [tc('checkOut'), range?.to   ? fmtD(range.to)   : ''],
                  [t('duration'),  `${nights} ${nights !== 1 ? t('nightsLabel') : t('night')}`],
                  [t('guests'),    `${guestCount}`],
                  [t('name'),      form.name],
                  [t('email'),     form.email],
                  ...(form.phone   ? [[t('phoneShort'),   form.phone]]   : []),
                  ...(form.message ? [[t('notes'),   form.message]] : []),
                ] as [string,string][]).map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between px-4 py-2.5 border-b border-sand-100 last:border-0 even:bg-sand-50/40">
                    <span className="text-stone-400 text-xs font-semibold uppercase tracking-wider shrink-0 mr-4">{label}</span>
                    <span className="text-stone-800 text-xs font-medium text-right">{value}</span>
                  </div>
                ))}
              </div>
              {pricing && range?.from && range?.to && <PriceBox from={range.from} to={range.to} pricing={pricing} guests={guestCount} totalLabel={t('total')}/>}
              <p className="text-center text-stone-400 text-xs">{t('noPaymentNow')}</p>
              <div className="flex gap-3">
                <BackBtn onClick={() => setStep(1)}/>
                <button onClick={handleSubmit} disabled={sending}
                  className="flex-1 py-3.5 rounded-2xl bg-sand-600 hover:bg-sand-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg active:scale-[.98] disabled:opacity-60">
                  {sending ? <Loader2 size={15} className="animate-spin"/> : <Check size={15} strokeWidth={2.5}/>}
                  {sending ? t('pending') : t('submit')}
                </button>
              </div>
            </div>
          )}
        </div>

        {phone && step < 2 && (
          <div className="px-6 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-sand-100"/>
              <span className="text-[10px] uppercase tracking-widest text-stone-300 font-semibold">{t('orContactDirectly')}</span>
              <div className="flex-1 h-px bg-sand-100"/>
            </div>
            <a href={`https://wa.me/${phone}?text=${encodeURIComponent('Hi! I\'m interested in ' + apt.name)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full py-3 rounded-2xl border border-stone-200 text-stone-400 text-sm font-medium hover:border-stone-300 hover:text-stone-600 transition-all duration-200 active:scale-[.98]">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              {t('chatOnWhatsapp')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
