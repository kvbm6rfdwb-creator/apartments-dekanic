"use client";
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Send, Loader2 } from 'lucide-react';
interface Props { aptId:string; aptName:string; maxGuests:number; dateRange?:DateRange; locale:string;
  [key: string]: any;
}
export default function BookingForm({ aptId, aptName, maxGuests, dateRange, locale }: Props) {
  const t = useTranslations('booking');
  const [loading,setLoading] = useState(false);
  const [form,setForm] = useState({ name:'', email:'', phone:'', guests:'2', message:'' });
  const set=(k:string,v:string)=>setForm(f=>({...f,[k]:v}));
  const field = 'w-full px-4 py-3 rounded-xl border border-sand-200 bg-white text-stone-800 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sand-400 focus:border-transparent transition-all';
  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault();
    if(!dateRange?.from||!dateRange?.to){toast.error('Please select your check-in and check-out dates.');return;}
    setLoading(true);
    try{
      const res=await fetch('/api/booking',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({aptId,locale,name:form.name,email:form.email,phone:form.phone,guests:form.guests,message:form.message,
          checkIn:dateRange.from.toISOString().slice(0,10),checkOut:dateRange.to.toISOString().slice(0,10)})});
      if(!res.ok)throw new Error();
      toast.success(t('success'));
      setForm({name:'',email:'',phone:'',guests:'2',message:''});
    }catch{toast.error(t('error'));}finally{setLoading(false);}
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-serif text-2xl text-stone-900">{t('title')}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label className="block text-[10px] font-semibold text-stone-500 mb-1.5 uppercase tracking-widest">{t('name')} *</label>
          <input className={field} type="text" required value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Maria Mustermann"/></div>
        <div><label className="block text-[10px] font-semibold text-stone-500 mb-1.5 uppercase tracking-widest">{t('email')} *</label>
          <input className={field} type="email" required value={form.email} onChange={e=>set('email',e.target.value)} placeholder="maria@email.com"/></div>
        <div><label className="block text-[10px] font-semibold text-stone-500 mb-1.5 uppercase tracking-widest">{t('phone')}</label>
          <input className={field} type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+49 123 456 789"/></div>
        <div><label className="block text-[10px] font-semibold text-stone-500 mb-1.5 uppercase tracking-widest">{t('guests')} *</label>
          <input className={field} type="number" required min={1} max={maxGuests||10} value={form.guests} onChange={e=>set('guests',e.target.value)}/></div>
      </div>
      {dateRange?.from&&dateRange?.to?(
        <div className="bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-sm text-stone-700 flex items-center gap-3">
          <svg className="text-sand-500 flex-shrink-0" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          {dateRange.from.toLocaleDateString()} → {dateRange.to.toLocaleDateString()}
        </div>
      ):(
        <p className="text-amber-600 text-xs font-medium bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-200">⬆ Please select your dates in the calendar above first.</p>
      )}
      <div><label className="block text-[10px] font-semibold text-stone-500 mb-1.5 uppercase tracking-widest">{t('message')}</label>
        <textarea className={field+' resize-none'} rows={3} value={form.message} onChange={e=>set('message',e.target.value)} placeholder="Any questions or special requests…"/></div>
      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-4 bg-sand-600 hover:bg-sand-700 disabled:opacity-60 text-white font-semibold rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
        {loading?<Loader2 size={18} className="animate-spin"/>:<Send size={16}/>}
        {loading?t('pending'):t('submit')}
      </button>
      <p className="text-center text-stone-400 text-xs">{t('terms')}</p>
    </form>
  );
}
