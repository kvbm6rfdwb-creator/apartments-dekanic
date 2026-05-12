"use client";
import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer } from 'lucide-react';
import { useParams } from 'next/navigation';

// Baška, Island Krk coordinates
const LAT = 44.9695;
const LNG = 14.7452;

interface DayForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
}

function wmoToIcon(code: number, size = 18) {
  if (code <= 1) return <Sun size={size} className="text-amber-400" />;
  if (code <= 3) return <Cloud size={size} className="text-stone-400" />;
  if (code <= 48) return <Cloud size={size} className="text-stone-300" />;
  if (code <= 67) return <CloudRain size={size} className="text-blue-400" />;
  if (code <= 77) return <CloudRain size={size} className="text-blue-300" />;
  if (code <= 82) return <CloudRain size={size} className="text-blue-500" />;
  if (code <= 99) return <CloudRain size={size} className="text-indigo-400" />;
  return <Sun size={size} className="text-amber-400" />;
}

function dayName(dateStr: string, locale: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return 'Today';
  return d.toLocaleDateString(locale, { weekday: 'short' });
}

export default function Weather() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [weekly, setWeekly] = useState<DayForecast[]>([]);
  const [monthly, setMonthly] = useState<DayForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'week' | 'month'>('week');

  useEffect(() => {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysLeftInMonth = Math.min(30, Math.max(7, endOfMonth.getDate() - now.getDate() + 1));

    Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=Europe/Zagreb&forecast_days=7`).then(r => r.json()),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=Europe/Zagreb&forecast_days=${daysLeftInMonth}`).then(r => r.json()),
    ]).then(([weekData, monthData]) => {
      const parse = (data: any): DayForecast[] => {
        const ds = data.daily;
        return ds.time.map((t: string, i: number) => ({
          date: t,
          maxTemp: Math.round(ds.temperature_2m_max[i]),
          minTemp: Math.round(ds.temperature_2m_min[i]),
          precipitation: Math.round(ds.precipitation_sum[i] * 10) / 10,
          windSpeed: Math.round(ds.windspeed_10m_max[i]),
          weatherCode: ds.weather_code[i],
        }));
      };
      setWeekly(parse(weekData));
      setMonthly(parse(monthData));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const data = view === 'week' ? weekly : monthly;
  const avgHigh = data.length ? Math.round(data.reduce((s, d) => s + d.maxTemp, 0) / data.length) : 0;
  const avgLow = data.length ? Math.round(data.reduce((s, d) => s + d.minTemp, 0) / data.length) : 0;
  const totalRain = data.length ? Math.round(data.reduce((s, d) => s + d.precipitation, 0) * 10) / 10 : 0;

  if (loading) return null;
  if (!data.length) return null;

  return (
    <section className="bg-stone-50 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 reveal">
          <p className="text-sand-600 text-xs tracking-[.3em] uppercase font-semibold mb-3">Weather</p>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-900 font-light">Baška Forecast</h2>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-8 max-w-lg mx-auto">
          <div className="bg-white rounded-2xl border border-stone-100 p-4 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <Thermometer size={16} className="mx-auto mb-1 text-sand-500" />
            <p className="text-lg font-bold text-stone-800">{avgHigh}°</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">Avg high</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 p-4 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <Thermometer size={16} className="mx-auto mb-1 text-blue-400" />
            <p className="text-lg font-bold text-stone-800">{avgLow}°</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">Avg low</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 p-4 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <Droplets size={16} className="mx-auto mb-1 text-blue-500" />
            <p className="text-lg font-bold text-stone-800">{totalRain} mm</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">Total rain</p>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-white rounded-xl border border-stone-200 p-0.5">
            <button onClick={() => setView('week')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'week' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-800'}`}>This Week</button>
            <button onClick={() => setView('month')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'month' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-800'}`}>This Month</button>
          </div>
        </div>

        {/* Forecast grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {data.map(d => (
            <div key={d.date} className="bg-white rounded-2xl border border-stone-100 p-3 text-center flex flex-col items-center gap-2" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{dayName(d.date, locale)}</p>
              <p className="text-[10px] text-stone-300">{new Date(d.date).getDate()} {new Date(d.date).toLocaleDateString(locale, { month: 'short' })}</p>
              <div className="py-1">{wmoToIcon(d.weatherCode)}</div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-sm font-bold text-stone-800">{d.maxTemp}°</span>
                <span className="text-[11px] text-stone-400">{d.minTemp}°</span>
              </div>
              {d.precipitation > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-blue-500">
                  <Droplets size={10} />
                  {d.precipitation} mm
                </div>
              )}
              <div className="flex items-center gap-1 text-[10px] text-stone-400">
                <Wind size={10} />
                {d.windSpeed} km/h
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[10px] text-stone-300 mt-4">Data from Open-Meteo · Forecast for Baška, Island Krk</p>
      </div>
    </section>
  );
}
