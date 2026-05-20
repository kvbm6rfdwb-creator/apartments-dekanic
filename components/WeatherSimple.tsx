"use client";
import React, { useState } from 'react';
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

// Baška, Island Krk coordinates
const LAT = 44.9695;
const LNG = 14.7452;

type DayRow = {
  date: string;
  label: string;
  high: number | null;
  low: number | null;
  icon: WeatherKind;
};

function aqiIndex(usAqi?: number): number {
  if (usAqi == null || Number.isNaN(usAqi)) return -1;
  if (usAqi <= 50) return 0;
  if (usAqi <= 100) return 1;
  if (usAqi <= 150) return 2;
  if (usAqi <= 200) return 3;
  if (usAqi <= 300) return 4;
  return 5;
}

function localISODate() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function localISOHour() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:00`;
}

function wmoToKind(code?: number): WeatherKind {
  if (code == null || Number.isNaN(code)) return 'cloud';
  if (code <= 1) return 'sun';
  if (code === 2) return 'partly';
  if (code === 3) return 'cloud';
  if (code === 45 || code === 48) return 'fog';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95 && code <= 99) return 'storm';
  return 'cloud';
}

function kindForCurrentHour(opts: { weatherCode?: number; precipitation?: number }): WeatherKind {
  const code = opts.weatherCode;
  const precip = opts.precipitation ?? 0;
  const base = wmoToKind(code);
  if (base === 'storm' || base === 'snow' || base === 'rain' || base === 'fog') return base;
  if (precip >= 0.2) return 'rain';
  return base;
}

function findHourIndex(times: string[], target: string) {
  const exact = times.indexOf(target);
  if (exact >= 0) return exact;
  let best = -1;
  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    if (t <= target) best = i;
    else break;
  }
  return best;
}

function kindForDayFromHourly(dateISO: string, hourly: any): WeatherKind {
  const times: string[] = hourly?.time ?? [];
  const codes: number[] = hourly?.weather_code ?? [];
  const prec: number[] = hourly?.precipitation ?? [];
  const rad: number[] = hourly?.shortwave_radiation ?? [];
  const isDay: number[] = hourly?.is_day ?? [];

  let rainHours = 0;
  let snowHours = 0;
  let stormHours = 0;
  let fogHours = 0;
  const counts: Record<WeatherKind, number> = {
    sun: 0, partly: 0, cloud: 0, fog: 0, rain: 0, snow: 0, storm: 0,
  };

  let radSum = 0;
  let radN = 0;

  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    if (!t || !t.startsWith(dateISO)) continue;
    if (isDay[i] !== 1) continue;

    const code = codes[i];
    const kind = wmoToKind(code);
    counts[kind] += 1;

    if (kind === 'storm') stormHours += 1;
    else if (kind === 'snow') snowHours += 1;
    else if (kind === 'rain') rainHours += 1;
    else if (kind === 'fog') fogHours += 1;

    if ((prec[i] ?? 0) >= 0.2) rainHours += 1;

    if (Number.isFinite(rad[i])) {
      radSum += rad[i];
      radN += 1;
    }
  }

  if (stormHours >= 1) return 'storm';
  if (snowHours >= 2) return 'snow';
  if (rainHours >= 2) return 'rain';
  if (fogHours >= 3) return 'fog';

  const radAvg = radN ? radSum / radN : 0;
  if (radAvg >= 300) return 'sun';
  if (radAvg >= 140) return 'partly';

  const order: WeatherKind[] = ['cloud', 'partly', 'sun', 'fog', 'rain', 'snow', 'storm'];
  let best: WeatherKind = 'cloud';
  for (const k of order) {
    if (counts[k] > counts[best]) best = k;
  }
  return best;
}

export default function WeatherSimple() {
  const t = useTranslations('weather');
  const locale = useLocale();

  const [mounted, setMounted] = useState(false);
  const [tempC, setTempC] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [windKmh, setWindKmh] = useState<number | null>(null);
  const [aqiIdx, setAqiIdx] = useState<number>(-1);
  const [days, setDays] = useState<DayRow[]>([]);
  const [currentKind, setCurrentKind] = useState<WeatherKind>('cloud');

  // AQI label keys mapped by index
  const aqiKeys = ['good', 'moderate', 'usg', 'unhealthy', 'veryUnhealthy', 'hazardous'] as const;
  const airQuality = aqiIdx >= 0 ? t(`aqi.${aqiKeys[aqiIdx]}`) : '—';

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;

    let cancelled = false;

    const fetchAll = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}&timezone=auto&forecast_days=7&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min&hourly=weather_code,precipitation,shortwave_radiation,is_day`
        );
        if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
        const data = await res.json();

        if (!cancelled) {
          setTempC(data?.current?.temperature_2m ?? null);
          setHumidity(data?.current?.relative_humidity_2m ?? null);
          setWindKmh(data?.current?.wind_speed_10m ?? null);

          const hourKey = data?.current?.time ?? localISOHour();
          const timesHourly: string[] = data?.hourly?.time ?? [];
          const hourIdx =
            findHourIndex(timesHourly, hourKey) >= 0
              ? findHourIndex(timesHourly, hourKey)
              : findHourIndex(timesHourly, localISOHour());
          if (hourIdx >= 0) {
            setCurrentKind(
              kindForCurrentHour({
                weatherCode: data?.hourly?.weather_code?.[hourIdx],
                precipitation: data?.hourly?.precipitation?.[hourIdx],
              })
            );
          } else {
            setCurrentKind(wmoToKind(data?.current?.weather_code));
          }

          const times: string[] = data?.daily?.time ?? [];
          const highs: number[] = data?.daily?.temperature_2m_max ?? [];
          const lows: number[] = data?.daily?.temperature_2m_min ?? [];

          const todayStr = localISODate();
          const startIndex = Math.max(0, times.findIndex(t => t === todayStr));
          const orderedIdx = [...times.keys()].slice(startIndex).concat([...times.keys()].slice(0, startIndex));

          const nextDays: DayRow[] = orderedIdx.slice(0, 7).map((i, idx) => {
            const date = times[i];
            const label =
              idx === 0
                ? t('today')
                : new Date(date + 'T12:00:00').toLocaleDateString(locale, { weekday: 'short' });
            const icon: DayRow['icon'] = kindForDayFromHourly(date, data?.hourly);
            return {
              date,
              label,
              high: Number.isFinite(highs[i]) ? Math.round(highs[i]) : null,
              low: Number.isFinite(lows[i]) ? Math.round(lows[i]) : null,
              icon,
            };
          });

          setDays(nextDays);
        }
      } catch {
        // Keep last known values on failure
      }

      try {
        const aqRes = await fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LNG}&hourly=us_aqi&timezone=auto`
        );
        if (!aqRes.ok) throw new Error(`AQ fetch failed: ${aqRes.status}`);
        const aq = await aqRes.json();
        const aqi: number | undefined = aq?.hourly?.us_aqi?.[0];
        if (!cancelled) setAqiIdx(aqiIndex(aqi));
      } catch {
        // Keep last known value on failure
      }
    };

    fetchAll();
    const id = window.setInterval(fetchAll, 2 * 60 * 1000);
    const onVis = () => {
      if (document.visibilityState === 'visible') fetchAll();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [mounted]);

  if (!mounted) return null;

  const fallbackDays: DayRow[] = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() + idx);
    const iso = d.toISOString().slice(0, 10);
    const label = idx === 0 ? t('today') : d.toLocaleDateString(locale, { weekday: 'short' });
    return { date: iso, label, high: null, low: null, icon: 'cloud' };
  });

  const renderDays = days.length ? days : fallbackDays;
  const renderDaysWithCurrent = renderDays.map((d, idx) => (idx === 0 ? { ...d, icon: currentKind } : d));

  return (
    <div className="w-full max-w-3xl mx-auto px-6">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium text-center mb-1.5">
        {t('currentConditions')}
      </p>

      <div className="mx-auto w-full max-w-xl">
        <div className="flex w-full flex-wrap md:flex-nowrap items-center justify-center md:justify-between gap-x-6 gap-y-2 mb-3 py-1.5">
          <div className="flex items-center gap-2">
            <StatLocationGlyph className="w-[26px] h-[26px]" />
            <span className="text-white text-[17px] font-medium leading-tight">Baška</span>
          </div>
          <div className="flex items-center gap-2">
            <StatTempGlyph className="w-[26px] h-[26px]" />
            <div className="flex flex-col">
              <span className="text-white/60 text-[12px] leading-tight">{t('temperature')}</span>
              <span className="text-white text-[17px] font-medium leading-tight">{tempC == null ? '—' : `${Math.round(tempC)}°C`}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatHumidityGlyph className="w-[26px] h-[26px]" />
            <div className="flex flex-col">
              <span className="text-white/60 text-[12px] leading-tight">{t('humidity')}</span>
              <span className="text-white text-[17px] font-medium leading-tight">{humidity == null ? '—' : `${Math.round(humidity)}%`}</span>
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
              <span className="text-white text-[17px] font-medium leading-tight">{windKmh == null ? '—' : `${Math.round(windKmh)}km/h`}</span>
            </div>
          </div>
        </div>

        <div className="flex w-full items-stretch gap-1">
          {renderDaysWithCurrent.map((day, index) => (
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
