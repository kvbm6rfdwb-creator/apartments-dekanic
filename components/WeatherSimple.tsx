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
      day: 'Today', 
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
      day: 'Tomorrow', 
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
    <div className="w-full max-w-4xl mx-auto px-6">
      {/* Minimal Apple-style Glass Weather Widget */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 shadow-xl">
        {/* Simple Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-white/80" />
            <span className="text-white text-sm font-medium">Baška Weather</span>
          </div>
          <div className="text-right">
            <div className="text-white text-lg font-semibold">{weatherData[0].high}°</div>
            <div className="text-white/60 text-xs">Today</div>
          </div>
        </div>

        {/* Minimal 7-Day Grid */}
        <div className="grid grid-cols-7 gap-1">
          {weatherData.map((day, index) => (
            <div
              key={index}
              className={`aspect-square flex flex-col items-center justify-center rounded-xl backdrop-blur-sm border transition-all ${
                index === 0 
                  ? 'bg-white/20 border-white/30' 
                  : 'bg-white/10 border-white/15'
              }`}
            >
              <div className="text-white/80 text-xs font-medium mb-1">{day.day.slice(0, 3)}</div>
              
              <div className="mb-1">
                {day.icon === 'sun' ? (
                  <Sun className="w-4 h-4 text-amber-300" />
                ) : (
                  <Cloud className="w-4 h-4 text-white/60" />
                )}
              </div>
              
              <div className="text-white font-bold text-sm">{day.high}°</div>
              <div className="text-white/50 text-xs">{day.low}°</div>
            </div>
          ))}
        </div>

        {/* Minimal Footer */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-white/60 text-xs">
            <div className="flex items-center gap-2">
              <Droplets className="w-3 h-3" />
              <span>{weatherData[0].humidity}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-3 h-3" />
              <span>{weatherData[0].windSpeed} km/h</span>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="w-3 h-3" />
              <span>UV {weatherData[0].uvIndex}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
