"use client";
import { useState, useEffect, useCallback } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import { useTranslations } from 'next-intl';
import { addDays, isWithinInterval, parseISO, isBefore, startOfToday } from 'date-fns';
import 'react-day-picker/dist/style.css';
interface Blocked { start: string; end: string;
  [key: string]: any;
}
function isBlocked(date: Date, list: Blocked[]) {
  return list.some(r => { try { return isWithinInterval(date,{start:parseISO(r.start),end:addDays(parseISO(r.end),-1)}); } catch{return false;} });
}
export default function AvailabilityCalendar({ aptId, onRangeSelect }: { aptId:string; onRangeSelect?:(r:DateRange|undefined)=>void }) {
  const t = useTranslations('calendar');
  const [blocked,setBlocked] = useState<Blocked[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError]     = useState(false);
  const [range,setRange]     = useState<DateRange|undefined>();
  const today = startOfToday();
  useEffect(()=>{
    setLoading(true); setError(false);
    fetch(`/api/calendar?apt=${aptId}`).then(r=>r.json()).then(d=>{setBlocked(d.blocked||[]);setLoading(false);}).catch(()=>{setError(true);setLoading(false);});
  },[aptId]);
  const disabled = useCallback((date:Date)=>isBefore(date,today)||isBlocked(date,blocked),[blocked,today]);
  const handleSelect=(r:DateRange|undefined)=>{
    if(r?.from&&r?.to){let d=new Date(r.from);while(d<=r.to){if(isBlocked(d,blocked))return;d=addDays(d,1);}}
    setRange(r); onRangeSelect?.(r);
  };
  const nights=range?.from&&range?.to?Math.round((range.to.getTime()-range.from.getTime())/86400000):0;
  if(loading) return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-7 w-7 border-2 border-sand-300 border-t-sand-600"/><span className="ml-3 text-stone-400 text-sm">{t('loading')}</span></div>;
  if(error) return <p className="text-center text-red-500 text-sm py-8">{t('error')}</p>;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-sand-200 inline-block"/>{t('available')}</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-200 inline-block"/>{t('booked')}</span>
      </div>
      <DayPicker mode="range" selected={range} onSelect={handleSelect} disabled={disabled}
        modifiers={{booked:(d)=>isBlocked(d,blocked)}} modifiersClassNames={{booked:'day-booked'}}
        numberOfMonths={2} fromDate={today} className="!font-sans"/>
      {nights>0 && (
        <div className="bg-sand-50 rounded-2xl p-4 text-sm text-stone-700 border border-sand-100">
          <span className="font-semibold">{nights} {t('nights')}</span>
          <span className="mx-2 text-stone-300">·</span>
          {range?.from?.toLocaleDateString()} → {range?.to?.toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
