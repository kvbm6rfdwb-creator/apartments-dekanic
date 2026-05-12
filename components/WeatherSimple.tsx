"use client";
import React, { useState } from 'react';
import { Cloud, Sun, MapPin, Thermometer } from 'lucide-react';

export default function WeatherSimple() {
  const [mounted, setMounted] = useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Simple static weather data that will always work
  const weatherData = [
    { day: 'Today', high: 22, low: 16, icon: 'sun', condition: 'Sunny' },
    { day: 'Tomorrow', high: 23, low: 17, icon: 'sun', condition: 'Sunny' },
    { day: 'Wed', high: 21, low: 15, icon: 'cloud', condition: 'Partly Cloudy' },
    { day: 'Thu', high: 20, low: 14, icon: 'cloud', condition: 'Cloudy' },
    { day: 'Fri', high: 22, low: 16, icon: 'sun', condition: 'Sunny' },
    { day: 'Sat', high: 24, low: 18, icon: 'sun', condition: 'Sunny' },
    { day: 'Sun', high: 23, low: 17, icon: 'cloud', condition: 'Partly Cloudy' }
  ];

  if (!mounted) return null;

  return (
    <div className="w-full bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
      {/* Minimal Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-sand-600" />
          <span className="text-sm font-medium text-stone-700">Baška Weather</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-stone-500">
          <span>Today {weatherData[0].high}°</span>
          <span>•</span>
          <span>Avg 22°</span>
        </div>
      </div>

      {/* Single Row Weather */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {weatherData.map((day, index) => (
          <div
            key={index}
            className={`flex-shrink-0 text-center px-3 py-2 rounded-xl border transition-all ${
              index === 0 
                ? 'bg-sand-50 border-sand-200' 
                : 'bg-stone-50 border-stone-200'
            }`}
          >
            <div className="text-xs font-medium text-stone-600 mb-1">{day.day}</div>
            
            <div className="flex justify-center mb-1">
              {day.icon === 'sun' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Cloud className="w-4 h-4 text-stone-400" />
              )}
            </div>
            
            <div className="text-sm font-bold text-stone-900">{day.high}°</div>
            <div className="text-xs text-stone-500">{day.low}°</div>
          </div>
        ))}
      </div>
    </div>
  );
}
