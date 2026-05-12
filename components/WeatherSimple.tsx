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
    <div className="w-full max-w-5xl mx-auto px-6">
      {/* Weather Widget with Pill Info */}
      <div className="flex items-center justify-between mb-4">
        {/* Location Pill */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-white/80" />
          <span className="text-white text-sm font-medium">Baška</span>
        </div>

        {/* Avg Temp Pill */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-orange-300" />
          <span className="text-white text-sm font-medium">22°C</span>
        </div>

        {/* Humidity Pill */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-300" />
          <span className="text-white text-sm font-medium">65%</span>
        </div>

        {/* Air Quality Pill */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
          <Wind className="w-4 h-4 text-green-300" />
          <span className="text-white text-sm font-medium">Good</span>
        </div>
      </div>

      {/* Minimal 7-Day Grid */}
      <div className="grid grid-cols-7 gap-1">
        {weatherData.map((day, index) => (
          <div
            key={index}
            className={`aspect-square flex flex-col items-center justify-center rounded-lg border transition-all ${
              index === 0 
                ? 'bg-white/20 border-white/40 shadow-md' 
                : 'bg-white/5 border-white/20'
            }`}
          >
            <div className="text-white/90 text-sm font-medium mb-1">{day.day}</div>
            
            <div className="mb-1">
              {day.icon === 'sun' ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Cloud className="w-4 h-4 text-white/60" />
              )}
            </div>
            
            <div className="text-white font-bold text-sm">{day.high}°</div>
            <div className="text-white/50 text-sm">{day.low}°</div>
          </div>
        ))}
      </div>
    </div>
  );
}
