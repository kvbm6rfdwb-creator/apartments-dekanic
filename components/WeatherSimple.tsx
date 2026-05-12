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
    <div className="w-full max-w-4xl mx-auto px-6">
      {/* Apple-style Glass Weather Widget */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
        {/* Minimal Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <MapPin className="w-4 h-4 text-white/90" />
            </div>
            <div>
              <h3 className="text-white font-medium">Baška Weather</h3>
              <p className="text-white/70 text-xs">7-Day Forecast</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white text-lg font-semibold">{weatherData[0].high}°</div>
            <div className="text-white/60 text-xs">Today's High</div>
          </div>
        </div>

        {/* Equal-sized Day Cards */}
        <div className="grid grid-cols-7 gap-2">
          {weatherData.map((day, index) => (
            <div
              key={index}
              className={`aspect-square flex flex-col items-center justify-center rounded-2xl backdrop-blur-sm border transition-all hover:scale-105 ${
                index === 0 
                  ? 'bg-white/25 border-white/30' 
                  : 'bg-white/10 border-white/20'
              }`}
            >
              <div className="text-white/80 text-xs font-medium mb-2">{day.day}</div>
              
              <div className="mb-2">
                {day.icon === 'sun' ? (
                  <Sun className="w-5 h-5 text-amber-300" />
                ) : (
                  <Cloud className="w-5 h-5 text-white/60" />
                )}
              </div>
              
              <div className="text-white font-bold text-lg">{day.high}°</div>
              <div className="text-white/60 text-xs">{day.low}°</div>
            </div>
          ))}
        </div>

        {/* Subtle Footer */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-center text-white/60 text-xs">
            <Thermometer className="w-3 h-3 mr-1" />
            Week Average 22°C • Perfect for beach activities
          </div>
        </div>
      </div>
    </div>
  );
}
