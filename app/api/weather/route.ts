import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 1800;

const LAT = 44.9695;
const LNG = 14.7452;

function aqiIndex(usAqi?: number): number {
  if (usAqi == null || Number.isNaN(usAqi)) return -1;
  if (usAqi <= 50) return 0;
  if (usAqi <= 100) return 1;
  if (usAqi <= 150) return 2;
  if (usAqi <= 200) return 3;
  if (usAqi <= 300) return 4;
  return 5;
}

function wmoToKind(code?: number): string {
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

export async function GET() {
  try {
    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${LAT}&longitude=${LNG}` +
      `&timezone=auto&forecast_days=7` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min`;

    const airUrl =
      `https://air-quality-api.open-meteo.com/v1/air-quality` +
      `?latitude=${LAT}&longitude=${LNG}` +
      `&hourly=us_aqi&timezone=auto&forecast_days=1`;

    const [weatherRes, airRes] = await Promise.all([
      fetch(weatherUrl, { next: { revalidate: 1800 } }),
      fetch(airUrl,     { next: { revalidate: 1800 } }),
    ]);

    if (!weatherRes.ok) {
      return NextResponse.json(
        { error: `weather_api_${weatherRes.status}` },
        { status: 500 }
      );
    }

    const weather = await weatherRes.json();
    const air     = airRes.ok ? await airRes.json() : null;

    const payload = {
      location: 'Baška',
      current: {
        tempC:       weather?.current?.temperature_2m          ?? null,
        humidity:    weather?.current?.relative_humidity_2m    ?? null,
        windKmh:     weather?.current?.wind_speed_10m          ?? null,
        weatherCode: weather?.current?.weather_code            ?? null,
        kind:        wmoToKind(weather?.current?.weather_code),
      },
      airQualityIndex: aqiIndex(air?.hourly?.us_aqi?.[0]),
      days: (weather?.daily?.time ?? []).slice(0, 7).map((date: string, i: number) => ({
        date,
        high: Number.isFinite(weather?.daily?.temperature_2m_max?.[i])
          ? Math.round(weather.daily.temperature_2m_max[i])
          : null,
        low: Number.isFinite(weather?.daily?.temperature_2m_min?.[i])
          ? Math.round(weather.daily.temperature_2m_min[i])
          : null,
        icon: wmoToKind(weather?.daily?.weather_code?.[i]),
      })),
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'weather_failed' },
      { status: 500 }
    );
  }
}
