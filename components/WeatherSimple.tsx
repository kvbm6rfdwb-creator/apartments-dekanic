"use client";
import React, { useState } from 'react';
import { Cloud, Sun, MapPin, Thermometer, Wind, Droplets, Eye, Gauge, Sunrise, Sunset, Moon, CloudRain, CloudSnow, Navigation } from 'lucide-react';

export default function WeatherSimple() {
  const [mounted, setMounted] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Enhanced weather data with rich information
  const weatherData = [
    { 
      day: 'Mon', 
      high: 22, 
      low: 16, 
      icon: 'sun', 
      condition: 'Sunny',
      humidity: 65,
      windSpeed: 12,
      uvIndex: 6,
      visibility: 10,
      pressure: 1013,
      sunrise: '05:42',
      sunset: '20:15',
      feelsLike: 21,
      precipitation: 0,
      moonPhase: '🌓'
    },
    { 
      day: 'Tue', 
      high: 23, 
      low: 17, 
      icon: 'sun', 
      condition: 'Sunny',
      humidity: 62,
      windSpeed: 10,
      uvIndex: 7,
      visibility: 10,
      pressure: 1015,
      sunrise: '05:41',
      sunset: '20:16',
      feelsLike: 22,
      precipitation: 0,
      moonPhase: '🌔'
    },
    { 
      day: 'Wed', 
      high: 21, 
      low: 15, 
      icon: 'cloud', 
      condition: 'Partly Cloudy',
      humidity: 70,
      windSpeed: 15,
      uvIndex: 4,
      visibility: 8,
      pressure: 1011,
      sunrise: '05:43',
      sunset: '20:14',
      feelsLike: 19,
      precipitation: 20,
      moonPhase: '🌗'
    },
    { 
      day: 'Thu', 
      high: 20, 
      low: 14, 
      icon: 'cloud', 
      condition: 'Cloudy',
      humidity: 75,
      windSpeed: 18,
      uvIndex: 3,
      visibility: 7,
      pressure: 1009,
      sunrise: '05:44',
      sunset: '20:13',
      feelsLike: 18,
      precipitation: 40,
      moonPhase: '🌘'
    },
    { 
      day: 'Fri', 
      high: 22, 
      low: 16, 
      icon: 'sun', 
      condition: 'Sunny',
      humidity: 60,
      windSpeed: 8,
      uvIndex: 8,
      visibility: 10,
      pressure: 1016,
      sunrise: '05:40',
      sunset: '20:17',
      feelsLike: 23,
      precipitation: 5,
      moonPhase: '🌑'
    },
    { 
      day: 'Sat', 
      high: 24, 
      low: 18, 
      icon: 'sun', 
      condition: 'Sunny',
      humidity: 58,
      windSpeed: 6,
      uvIndex: 9,
      visibility: 10,
      pressure: 1018,
      sunrise: '05:39',
      sunset: '20:18',
      feelsLike: 25,
      precipitation: 0,
      moonPhase: '🌒'
    },
    { 
      day: 'Sun', 
      high: 23, 
      low: 17, 
      icon: 'cloud', 
      condition: 'Partly Cloudy',
      humidity: 68,
      windSpeed: 14,
      uvIndex: 5,
      visibility: 9,
      pressure: 1012,
      sunrise: '05:45',
      sunset: '20:12',
      feelsLike: 22,
      precipitation: 15,
      moonPhase: '🌓'
    }
  ];

  if (!mounted) return null;

  return (
    <div className="w-full max-w-6xl mx-auto px-6">
      {/* Apple-Quality Weather Widget */}
      <div className="flex flex-col space-y-3">
        {/* Premium Info Pills Row */}
        <div className="flex items-center justify-center space-x-3">
          {/* Location Pill */}
          <div className="group relative">
            <div className="backdrop-blur-xl bg-white/8 border border-white/12 rounded-full px-4 py-2.5 flex items-center gap-2.5 transition-all duration-300 hover:bg-white/12 hover:border-white/20 hover:scale-105 cursor-pointer">
              <div className="w-4 h-4 bg-gradient-to-br from-white/20 to-white/5 rounded-full flex items-center justify-center">
                <MapPin className="w-2.5 h-2.5 text-white/90" />
              </div>
              <span className="text-white text-xs font-medium tracking-wide">Baška</span>
            </div>
          </div>

          {/* Avg Temp Pill */}
          <div className="group relative">
            <div className="backdrop-blur-xl bg-white/8 border border-white/12 rounded-full px-4 py-2.5 flex items-center gap-2.5 transition-all duration-300 hover:bg-white/12 hover:border-white/20 hover:scale-105 cursor-pointer">
              <div className="w-4 h-4 bg-gradient-to-br from-orange-400/20 to-orange-400/5 rounded-full flex items-center justify-center">
                <Thermometer className="w-2.5 h-2.5 text-orange-300" />
              </div>
              <span className="text-white text-xs font-medium tracking-wide">22°C</span>
            </div>
          </div>

          {/* Humidity Pill */}
          <div className="group relative">
            <div className="backdrop-blur-xl bg-white/8 border border-white/12 rounded-full px-4 py-2.5 flex items-center gap-2.5 transition-all duration-300 hover:bg-white/12 hover:border-white/20 hover:scale-105 cursor-pointer">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-400/20 to-blue-400/5 rounded-full flex items-center justify-center">
                <Droplets className="w-2.5 h-2.5 text-blue-300" />
              </div>
              <span className="text-white text-xs font-medium tracking-wide">65%</span>
            </div>
          </div>

          {/* Air Quality Pill */}
          <div className="group relative">
            <div className="backdrop-blur-xl bg-white/8 border border-white/12 rounded-full px-4 py-2.5 flex items-center gap-2.5 transition-all duration-300 hover:bg-white/12 hover:border-white/20 hover:scale-105 cursor-pointer">
              <div className="w-4 h-4 bg-gradient-to-br from-green-400/20 to-green-400/5 rounded-full flex items-center justify-center">
                <Wind className="w-2.5 h-2.5 text-green-300" />
              </div>
              <span className="text-white text-xs font-medium tracking-wide">Good</span>
            </div>
          </div>
        </div>

        {/* Premium 7-Day Forecast Grid */}
        <div className="grid grid-cols-7 gap-1 px-8">
          {weatherData.map((day, index) => (
            <div
              key={index}
              className={`group relative aspect-square flex flex-col items-center justify-center rounded-xl border transition-all duration-300 cursor-pointer ${
                index === 0 
                  ? 'backdrop-blur-xl bg-white/15 border-white/30 shadow-lg shadow-white/10 hover:bg-white/20 hover:border-white/40 hover:shadow-xl hover:shadow-white/15' 
                  : 'backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {/* Subtle gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl pointer-events-none" />
              
              {/* Day Name */}
              <div className={`font-medium mb-1.5 transition-colors duration-300 ${
                index === 0 ? 'text-white/95 text-xs tracking-wide' : 'text-white/80 text-xs tracking-wide'
              }`}>
                {day.day}
              </div>
              
              {/* Weather Icon */}
              <div className="mb-2 transition-transform duration-300 group-hover:scale-110">
                {day.icon === 'sun' ? (
                  <Sun className={`transition-colors duration-300 ${
                    index === 0 ? 'w-4 h-4 text-amber-300' : 'w-3.5 h-3.5 text-amber-300/80'
                  }`} />
                ) : (
                  <Cloud className={`transition-colors duration-300 ${
                    index === 0 ? 'w-4 h-4 text-white/70' : 'w-3.5 h-3.5 text-white/50'
                  }`} />
                )}
              </div>
              
              {/* Temperature */}
              <div className="flex flex-col items-center space-y-0.5">
                <div className={`font-bold transition-colors duration-300 ${
                  index === 0 ? 'text-white text-sm' : 'text-white/90 text-sm'
                }`}>
                  {day.high}°
                </div>
                <div className={`transition-colors duration-300 ${
                  index === 0 ? 'text-white/60 text-xs' : 'text-white/50 text-xs'
                }`}>
                  {day.low}°
                </div>
              </div>

              {/* Subtle hover indicator */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
