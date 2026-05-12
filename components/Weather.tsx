"use client";
import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, MapPin, Calendar } from 'lucide-react';
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

function wmoToIcon(code: number, size = 24) {
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
  console.log('Weather component rendering');
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [weekly, setWeekly] = useState<DayForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      console.log('Fetching weather data...');
      try {
        // Fetch 7-day forecast from Open-Meteo
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=auto`
        );
        
        console.log('Weather API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Weather data received:', data);
          const forecast = data.daily.time.map((date: string, index: number) => ({
            date,
            maxTemp: Math.round(data.daily.temperature_2m_max[index]),
            minTemp: Math.round(data.daily.temperature_2m_min[index]),
            precipitation: Math.round(data.daily.precipitation_sum[index] * 10) / 10,
            windSpeed: Math.round(data.daily.windspeed_10m_max[index]),
            weatherCode: data.daily.weather_code[index]
          }));
          
          console.log('Processed forecast:', forecast);
          setWeekly(forecast.slice(0, 7));
        } else {
          console.error('Weather API error:', response.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-sand-50 rounded-3xl p-8 border border-stone-200">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-stone-200 rounded-xl w-1/4"></div>
          <div className="grid grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-32 bg-stone-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (weekly.length === 0) {
    return (
      <section className="bg-gradient-to-r from-blue-50 via-white to-sand-50 rounded-3xl p-8 border border-stone-200 shadow-sm">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-stone-600 mb-4">
            <MapPin size={20} />
            <span className="font-medium">Baška, Krk</span>
          </div>
          <p className="text-stone-500">Weather data temporarily unavailable</p>
        </div>
      </section>
    );
  }

  const today = weekly[0];
  const avgTemp = Math.round(weekly.reduce((sum, day) => sum + day.maxTemp, 0) / weekly.length);

  return (
    <section className="bg-gradient-to-r from-blue-50 via-white to-sand-50 rounded-3xl p-8 border border-stone-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-stone-600">
            <MapPin size={20} />
            <span className="font-medium">Baška, Krk</span>
          </div>
          <div className="h-6 w-px bg-stone-300"></div>
          <div className="flex items-center gap-2 text-stone-600">
            <Calendar size={20} />
            <span className="font-medium">7-Day Forecast</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-3xl font-bold text-stone-900">{today.maxTemp}°</div>
            <div className="text-sm text-stone-600">Today's High</div>
          </div>
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl">
            {wmoToIcon(today.weatherCode, 32)}
          </div>
        </div>
      </div>

      {/* Weekly Forecast */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {weekly.map((day, index) => {
          const isToday = index === 0;
          return (
            <div
              key={day.date}
              className={`bg-white rounded-2xl p-4 border transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
                isToday 
                  ? 'border-sand-300 shadow-md ring-2 ring-sand-100' 
                  : 'border-stone-200'
              }`}
            >
              {/* Day Name */}
              <div className="text-center mb-3">
                <div className={`text-sm font-medium ${
                  isToday ? 'text-sand-700' : 'text-stone-700'
                }`}>
                  {dayName(day.date, locale)}
                </div>
                {isToday && (
                  <div className="text-xs text-sand-600 font-medium">Current</div>
                )}
              </div>

              {/* Weather Icon */}
              <div className="flex justify-center mb-3">
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                  isToday ? 'bg-sand-50' : 'bg-stone-50'
                }`}>
                  {wmoToIcon(day.weatherCode)}
                </div>
              </div>

              {/* Temperature */}
              <div className="text-center mb-3">
                <div className="text-lg font-bold text-stone-900">
                  {day.maxTemp}°
                </div>
                <div className="text-xs text-stone-500">
                  {day.minTemp}°
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-2">
                {day.precipitation > 0 && (
                  <div className="flex items-center justify-center gap-1 text-xs text-blue-600">
                    <Droplets size={12} />
                    <span>{day.precipitation}mm</span>
                  </div>
                )}
                
                {day.windSpeed > 15 && (
                  <div className="flex items-center justify-center gap-1 text-xs text-stone-500">
                    <Wind size={12} />
                    <span>{day.windSpeed}km/h</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 pt-6 border-t border-stone-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-stone-600">
                Week Avg: <span className="font-semibold text-stone-900">{avgTemp}°</span>
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-stone-600">
                Mostly Sunny
              </span>
            </div>
          </div>

          <div className="text-xs text-stone-500">
            Perfect weather for beach activities and island exploration
          </div>
        </div>
      </div>
    </section>
  );
}
