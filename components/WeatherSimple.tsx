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
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

type DayRow = {
  date:   string;
  label:  string;
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

function capitalizeFirst(str: string): string {
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

  const fallbackDays: DayRow[] = useMemo(() =>
    Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() + idx);
      const iso = d.toISOString().slice(0, 10);
      const label = idx === 0
        ? t('today')
        : capitalizeFirst(d.toLocaleDateString(locale, { weekday: 'short' }));
      return { date: iso, label, high: null, low: null, icon: 'cloud' as WeatherKind };
    })
  , [locale, t]);

  const renderDays: DayRow[] = (data?.days?.length ? data.days : fallbackDays).map((day, idx) => ({
    ...day,
    label: idx === 0
      ? t('today')
      : capitalizeFirst(
          new Date(`${day.date}T12:00:00`).toLocaleDateString(locale, { weekday: 'short' })
        ),
    icon: (idx === 0 ? data?.current?.kind ?? day.icon : day.icon) as WeatherKind,
  }));

  if (loading) return null;

  return (
    <div className="w-full max-w-3xl mx-auto px-6">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium text-center mb-1.5">
        {t('currentConditions')}
      </p>

      <div className="mx-auto w-full max-w-xl">

        {/* ── Mobile: location full-width, then 2×2 grid for the 4 stats
             ── md+:  single flex row (original desktop layout) */}

        {/* Location — full width on mobile, hidden on md+ (shown in the flex row below) */}
        <div className="flex items-center justify-center gap-2 mb-2 md:hidden">
          <StatLocationGlyph className="w-[26px] h-[26px]" />
          <span className="text-white text-[17px] font-medium leading-tight">
            {data?.location || 'Baška'}
          </span>
        </div>

        {/* 4 stats: 2×2 grid on mobile, hidden on md+ */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-3 md:hidden">
          <div className="flex items-center gap-2">
            <StatTempGlyph className="w-[26px] h-[26px]" />
            <div className="flex flex-col">
              <span className="text-white/60 text-[12px] leading-tight">{t('temperature')}</span>
              <span className="text-white text-[17px] font-medium leading-tight">
                {data?.current?.tempC == null ? '—' : `${Math.round(data.current.tempC)}°C`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatHumidityGlyph className="w-[26px] h-[26px]" />
            <div className="flex flex-col">
              <span className="text-white/60 text-[12px] leading-tight">{t('humidity')}</span>
              <span className="text-white text-[17px] font-medium leading-tight">
                {data?.current?.humidity == null ? '—' : `${Math.round(data.current.humidity)}%`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatAirQualityGlyph className="w-[26px] h-[26px]" />
            <div className="flex flex-col">
              <span className="text-white/60 text-[12px] leading-tight">{t('airQuality')}</span>
              <span className="text-white text-[17px] font-medium leading-tight">{airQuality}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatWindGlyph className="w-[26px] h-[26px]" />
            <div className="flex flex-col">
              <span className="text-white/60 text-[12px] leading-tight">{t('wind')}</span>
              <span className="text-white text-[17px] font-medium leading-tight">
                {data?.current?.windKmh == null ? '—' : `${Math.round(data.current.windKmh)}km/h`}
              </span>
            </div>
          </div>
        </div>

        {/* Desktop: original single flex row — hidden on mobile */}
        <div className="hidden md:flex w-full flex-nowrap items-center justify-between gap-x-6 gap-y-2 mb-3 py-1.5">
          <div className="flex items-center gap-2">
            <StatLocationGlyph className="w-[26px] h-[26px]" />
            <span className="text-white text-[17px] font-medium leading-tight">
              {data?.location || 'Baška'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <StatTempGlyph className="w-[26px] h-[26px]" />
            <div className="flex flex-col">
              <span className="text-white/60 text-[12px] leading-tight">{t('temperature')}</span>
              <span className="text-white text-[17px] font-medium leading-tight">
                {data?.current?.tempC == null ? '—' : `${Math.round(data.current.tempC)}°C`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatHumidityGlyph className="w-[26px] h-[26px]" />
            <div className="flex flex-col">
              <span className="text-white/60 text-[12px] leading-tight">{t('humidity')}</span>
              <span className="text-white text-[17px] font-medium leading-tight">
                {data?.current?.humidity == null ? '—' : `${Math.round(data.current.humidity)}%`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatAirQualityGlyph className="w-[26px] h-[26px]" />
            <div className="flex flex-col">
              <span className="text-white/60 text-[12px] leading-tight">{t('airQuality')}</span>
              <span className="text-white text-[17px] font-medium leading-tight">{airQuality}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatWindGlyph className="w-[26px] h-[26px]" />
            <div className="flex flex-col">
              <span className="text-white/60 text-[12px] leading-tight">{t('wind')}</span>
              <span className="text-white text-[17px] font-medium leading-tight">
                {data?.current?.windKmh == null ? '—' : `${Math.round(data.current.windKmh)}km/h`}
              </span>
            </div>
          </div>
        </div>

        {/* 7-day forecast row — unchanged on all screen sizes */}
        <div className="flex w-full items-stretch gap-1">
          {renderDays.map((day, index) => (
            <div
              key={day.date || index}
              className={`flex flex-col items-center justify-center rounded-lg backdrop-blur-md border transition-all py-2 px-2.5 flex-1 min-w-0 ${
                index === 0
                  ? 'bg-white/25 border-white/35 shadow-md'
                  : 'bg-white/10 border-white/20'
              }`}
            >
              <div className="text-white/90 text-xs font-medium mb-1">{day.label}</div>
              <div className="mb-1">
                <WeatherGlyph kind={day.icon} className="w-[22px] h-[22px]" />
              </div>
              <div className="text-white font-bold text-xs">{day.high == null ? '—' : `${day.high}°`}</div>
              <div className="text-white/50 text-xs">{day.low == null ? '—' : `${day.low}°`}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
