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
  date:  string;
  label: string;
  high:  number | null;
  low:   number | null;
  icon:  WeatherKind;
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
  days: Array<{ date: string; high: number | null; low: number | null; icon: WeatherKind }>;
};

function capitalizeFirst(str: string): string {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

/** A single stat pill — always centered, icon left of label+value */
function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="shrink-0">{icon}</div>
      <div className="flex flex-col items-start">
        <span className="text-white/60 text-[11px] leading-tight whitespace-nowrap">{label}</span>
        <span className="text-white text-[16px] font-medium leading-tight whitespace-nowrap">{value}</span>
      </div>
    </div>
  );
}

export default function WeatherSimple() {
  const t      = useTranslations('weather');
  const locale = useLocale();

  const [loading, setLoading] = useState(true);
  const [data,    setData]    = useState<WeatherPayload | null>(null);

  const aqiKeys = ['good', 'moderate', 'usg', 'unhealthy', 'veryUnhealthy', 'hazardous'] as const;
  const airQuality = data && data.airQualityIndex >= 0 ? t(`aqi.${aqiKeys[data.airQualityIndex]}`) : '—';

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res  = await fetch('/api/weather', { cache: 'force-cache' });
        const json = await res.json();
        if (!cancelled && res.ok) setData(json);
      } catch {}
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const fallbackDays: DayRow[] = useMemo(() =>
    Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() + idx);
      return {
        date:  d.toISOString().slice(0, 10),
        label: idx === 0 ? t('today') : capitalizeFirst(d.toLocaleDateString(locale, { weekday: 'short' })),
        high:  null,
        low:   null,
        icon:  'cloud' as WeatherKind,
      };
    })
  , [locale, t]);

  const renderDays: DayRow[] = (data?.days?.length ? data.days : fallbackDays).map((day, idx) => ({
    ...day,
    label: idx === 0
      ? t('today')
      : capitalizeFirst(new Date(`${day.date}T12:00:00`).toLocaleDateString(locale, { weekday: 'short' })),
    icon: (idx === 0 ? data?.current?.kind ?? day.icon : day.icon) as WeatherKind,
  }));

  if (loading) return null;

  const tempVal = data?.current?.tempC    == null ? '—' : `${Math.round(data.current.tempC)}°C`;
  const humVal  = data?.current?.humidity == null ? '—' : `${Math.round(data.current.humidity)}%`;
  const windVal = data?.current?.windKmh  == null ? '—' : `${Math.round(data.current.windKmh)}km/h`;

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium text-center mb-3">
        {t('currentConditions')}
      </p>

      <div className="mx-auto w-full max-w-xl flex flex-col items-center gap-4">

        {/* Location — always centered, same on mobile and desktop */}
        <div className="flex items-center justify-center gap-2">
          <StatLocationGlyph className="w-[24px] h-[24px]" />
          <span className="text-white text-[17px] font-medium leading-tight">
            {data?.location || 'Baška'}
          </span>
        </div>

        {/* Stats: 2×2 grid on mobile, single row on md+ */}
        <div className="w-full grid grid-cols-2 gap-x-4 gap-y-3 md:flex md:flex-row md:justify-center md:gap-x-8">
          <Stat icon={<StatTempGlyph className="w-[24px] h-[24px]" />}         label={t('temperature')} value={tempVal}    />
          <Stat icon={<StatHumidityGlyph className="w-[24px] h-[24px]" />}     label={t('humidity')}    value={humVal}     />
          <Stat icon={<StatAirQualityGlyph className="w-[24px] h-[24px]" />}   label={t('airQuality')}  value={airQuality} />
          <Stat icon={<StatWindGlyph className="w-[24px] h-[24px]" />}         label={t('wind')}        value={windVal}    />
        </div>

        {/* 7-day forecast */}
        <div className="flex w-full items-stretch gap-1">
          {renderDays.map((day, index) => (
            <div
              key={day.date || index}
              className={`flex flex-col items-center justify-center rounded-lg backdrop-blur-md border transition-all py-2 px-1 flex-1 min-w-0 ${
                index === 0 ? 'bg-white/25 border-white/35 shadow-md' : 'bg-white/10 border-white/20'
              }`}
            >
              <div className="text-white/90 text-xs font-medium mb-1 text-center">{day.label}</div>
              <div className="mb-1"><WeatherGlyph kind={day.icon} className="w-[20px] h-[20px]" /></div>
              <div className="text-white font-bold text-xs">{day.high == null ? '—' : `${day.high}°`}</div>
              <div className="text-white/50 text-xs">{day.low == null ? '—' : `${day.low}°`}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
