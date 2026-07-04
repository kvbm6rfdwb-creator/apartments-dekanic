"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { WeatherGlyph, type WeatherKind } from './WeatherGlyphs';
import {
  StatAirQualityGlyph,
  StatHumidityGlyph,
  StatLocationGlyph,
  StatTempGlyph,
  StatWindGlyph,
} from './WeatherStatGlyphs';
import { useLocale, useTranslations } from 'next-intl';

type DayRow = {
  date:   string;
  label?: string;
  high:   number | null;
  low:    number | null;
  icon:   WeatherKind;
};

type WeatherPayload = {
  location: string;
  current: {
    tempC:       number | null;
    humidity:    number | null;
    windKmh:     number | null;
    weatherCode: number | null;
    kind:        WeatherKind;
  };
  airQualityIndex: number;
  days: Array<{
    date: string;
    high: number | null;
    low:  number | null;
    icon: WeatherKind;
  }>;
};

function capitalizeFirst(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function WeatherSimple() {
  const t      = useTranslations('weather');
  const locale = useLocale();

  const [loading, setLoading] = useState(true);
  const [data,    setData]    = useState<WeatherPayload | null>(null);

  const aqiKeys = ['good', 'moderate', 'usg', 'unhealthy', 'veryUnhealthy', 'hazardous'] as const;
  const airQuality =
    data && data.airQualityIndex >= 0
      ? t(`aqi.${aqiKeys[data.airQualityIndex]}`)
      : '—';

  // Single fetch to our cached server route — no double client-side Open-Meteo calls
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res  = await fetch('/api/weather', { cache: 'force-cache' });
        const json = await res.json();
        if (!cancelled && res.ok) setData(json);
      } catch { /* keep skeleton on failure */ }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Skeleton day rows before data arrives
  const fallbackDays: DayRow[] = useMemo(() =>
    Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() + idx);
      return {
        date:  d.toISOString().slice(0, 10),
        label: idx === 0
          ? t('today')
          : capitalizeFirst(d.toLocaleDateString(locale, { weekday: 'short' })),
        high: null,
        low:  null,
        icon: 'cloud' as WeatherKind,
      };
    })
  , [locale, t]);

  const days: DayRow[] = (data?.days?.length ? data.days : fallbackDays).map((day, idx) => ({
    ...day,
    label: idx === 0
      ? t('today')
      : capitalizeFirst(
          new Date(`${day.date}T12:00:00`).toLocaleDateString(locale, { weekday: 'short' })
        ),
    icon: (idx === 0 ? data?.current?.kind ?? day.icon : day.icon) as WeatherKind,
  }));

  return (
    <div className="mx-auto w-full max-w-5xl px-2 sm:px-4">
      <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
        {t('currentConditions')}
      </p>

      <div className="mx-auto max-w-4xl rounded-[28px] border border-white/20 bg-white/10 px-4 py-4 shadow-[0_10px_40px_rgba(0,0,0,.12)] backdrop-blur-md sm:px-5">

        {/* Stats row — 2 cols on mobile, 3 on sm, 5 on lg */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2.5">
            <StatLocationGlyph className="h-[22px] w-[22px] shrink-0" />
            <span className="truncate text-[15px] font-medium text-white">
              {data?.location || 'Baška'}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2.5">
            <StatTempGlyph className="h-[22px] w-[22px] shrink-0" />
            <div>
              <div className="text-[11px] leading-none text-white/55">{t('temperature')}</div>
              <div className="text-[15px] font-medium text-white">
                {data?.current?.tempC == null ? '—' : `${Math.round(data.current.tempC)}°C`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2.5">
            <StatHumidityGlyph className="h-[22px] w-[22px] shrink-0" />
            <div>
              <div className="text-[11px] leading-none text-white/55">{t('humidity')}</div>
              <div className="text-[15px] font-medium text-white">
                {data?.current?.humidity == null ? '—' : `${Math.round(data.current.humidity)}%`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2.5">
            <StatAirQualityGlyph className="h-[22px] w-[22px] shrink-0" />
            <div>
              <div className="text-[11px] leading-none text-white/55">{t('airQuality')}</div>
              <div className="text-[15px] font-medium text-white">{airQuality}</div>
            </div>
          </div>

          <div className="col-span-2 flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2.5 sm:col-span-1">
            <StatWindGlyph className="h-[22px] w-[22px] shrink-0" />
            <div>
              <div className="text-[11px] leading-none text-white/55">{t('wind')}</div>
              <div className="text-[15px] font-medium text-white">
                {data?.current?.windKmh == null ? '—' : `${Math.round(data.current.windKmh)}km/h`}
              </div>
            </div>
          </div>
        </div>

        {/* 7-day forecast — 4 cols on mobile, 7 on sm+ */}
        <div className="mt-3 grid grid-cols-4 gap-1.5 sm:grid-cols-7">
          {days.map((day, index) => (
            <div
              key={day.date || index}
              className={`flex min-w-0 flex-col items-center justify-center rounded-2xl border py-2.5 ${
                index === 0
                  ? 'border-white/35 bg-white/25 shadow-md'
                  : 'border-white/15 bg-white/8'
              }`}
            >
              <div className="mb-1 text-center text-[11px] font-medium text-white/90">{day.label}</div>
              <WeatherGlyph kind={day.icon} className="mb-1 h-[20px] w-[20px]" />
              <div className="text-[12px] font-bold text-white">{day.high == null ? '—' : `${day.high}°`}</div>
              <div className="text-[11px] text-white/50">{day.low == null ? '—' : `${day.low}°`}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
