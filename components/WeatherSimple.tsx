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
    <div className="w-full bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      {/* Header with sand accent */}
      <div className="bg-gradient-to-r from-sand-50 to-stone-50 px-6 py-4 border-b border-stone-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-sand-100 rounded-xl">
              <MapPin className="w-5 h-5 text-sand-600" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-stone-900">Baška Weather</h3>
              <p className="text-xs text-stone-500">7-Day Forecast</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-sand-600">{weatherData[0].high}°</div>
            <div className="text-xs text-stone-500">Today's High</div>
          </div>
        </div>
      </div>

      {/* Weather Cards */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {weatherData.map((day, index) => (
            <div
              key={index}
              className={`bg-stone-50 rounded-2xl p-4 text-center border transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
                index === 0 
                  ? 'border-sand-200 bg-sand-50 ring-2 ring-sand-100' 
                  : 'border-stone-200'
              }`}
            >
              <div className="text-xs font-medium text-stone-700 mb-3 uppercase tracking-wider">{day.day}</div>
              
              <div className="flex justify-center mb-3">
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                  index === 0 ? 'bg-sand-100' : 'bg-stone-100'
                }`}>
                  {day.icon === 'sun' ? (
                    <Sun className="w-6 h-6 text-amber-500" />
                  ) : (
                    <Cloud className="w-6 h-6 text-stone-400" />
                  )}
                </div>
              </div>
              
              <div className="text-lg font-bold text-stone-900 mb-1">{day.high}°</div>
              <div className="text-xs text-stone-500 mb-2">{day.low}°</div>
              
              <div className="text-xs text-stone-600 font-medium">{day.condition}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-stone-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <Thermometer className="w-4 h-4 text-sand-500" />
              <span>Week Average: <span className="font-semibold text-stone-900">22°C</span></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-sand-100 rounded-full">
              <Sun className="w-4 h-4 text-sand-600" />
              <span className="text-xs font-medium text-sand-700">Perfect for beach activities</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
