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
    <div className="w-full max-w-5xl mx-auto px-6">
      {/* Exquisite Apple-style Glass Weather Widget */}
      <div className="backdrop-blur-xl bg-white/8 border border-white/15 rounded-3xl shadow-2xl overflow-hidden">
        {/* Enhanced Header with Location Details */}
        <div className="bg-gradient-to-r from-white/10 to-white/5 px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <MapPin className="w-5 h-5 text-white/90" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Baška, Krk</h3>
                <p className="text-white/60 text-xs flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  Adriatic Coast • Croatia
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white text-2xl font-bold">{weatherData[selectedDay].high}°</div>
              <div className="text-white/60 text-xs">Feels like {weatherData[selectedDay].feelsLike}°</div>
            </div>
          </div>
        </div>

        {/* Main Weather Grid */}
        <div className="p-6">
          {/* 7-Day Forecast Grid */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {weatherData.map((day, index) => (
              <div
                key={index}
                onClick={() => setSelectedDay(index)}
                className={`aspect-square flex flex-col items-center justify-center rounded-2xl backdrop-blur-sm border transition-all cursor-pointer hover:scale-105 ${
                  index === selectedDay 
                    ? 'bg-white/25 border-white/40 shadow-lg' 
                    : 'bg-white/8 border-white/15 hover:bg-white/12'
                }`}
              >
                <div className="text-white/90 text-xs font-medium mb-1">{day.day}</div>
                <div className="text-white/70 text-xs mb-2">{day.moonPhase}</div>
                
                <div className="mb-2">
                  {day.icon === 'sun' ? (
                    <Sun className="w-6 h-6 text-amber-300" />
                  ) : day.icon === 'cloud' ? (
                    <Cloud className="w-6 h-6 text-white/70" />
                  ) : (
                    <CloudRain className="w-6 h-6 text-blue-300" />
                  )}
                </div>
                
                <div className="text-white font-bold text-lg">{day.high}°</div>
                <div className="text-white/60 text-xs">{day.low}°</div>
                
                {day.precipitation > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Droplets className="w-3 h-3 text-blue-300" />
                    <span className="text-xs text-blue-300">{day.precipitation}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Detailed Weather Information Panel */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Current Conditions */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-orange-300" />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">Temperature</div>
                  <div className="text-white/70 text-xs">{weatherData[selectedDay].high}°/{weatherData[selectedDay].low}°C</div>
                </div>
              </div>

              {/* Humidity */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">Humidity</div>
                  <div className="text-white/70 text-xs">{weatherData[selectedDay].humidity}%</div>
                </div>
              </div>

              {/* Wind */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Wind className="w-5 h-5 text-gray-300" />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">Wind</div>
                  <div className="text-white/70 text-xs">{weatherData[selectedDay].windSpeed} km/h</div>
                </div>
              </div>

              {/* UV Index */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Sun className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">UV Index</div>
                  <div className="text-white/70 text-xs">{weatherData[selectedDay].uvIndex}</div>
                </div>
              </div>
            </div>

            {/* Secondary Information Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/10">
              {/* Visibility */}
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-white/50" />
                <div>
                  <div className="text-white/80 text-xs">Visibility</div>
                  <div className="text-white/60 text-xs">{weatherData[selectedDay].visibility} km</div>
                </div>
              </div>

              {/* Pressure */}
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-white/50" />
                <div>
                  <div className="text-white/80 text-xs">Pressure</div>
                  <div className="text-white/60 text-xs">{weatherData[selectedDay].pressure} hPa</div>
                </div>
              </div>

              {/* Sunrise */}
              <div className="flex items-center gap-2">
                <Sunrise className="w-4 h-4 text-orange-400/70" />
                <div>
                  <div className="text-white/80 text-xs">Sunrise</div>
                  <div className="text-white/60 text-xs">{weatherData[selectedDay].sunrise}</div>
                </div>
              </div>

              {/* Sunset */}
              <div className="flex items-center gap-2">
                <Sunset className="w-4 h-4 text-orange-500/70" />
                <div>
                  <div className="text-white/80 text-xs">Sunset</div>
                  <div className="text-white/60 text-xs">{weatherData[selectedDay].sunset}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Beach Activity Indicator */}
          <div className="mt-4 flex items-center justify-center">
            <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
              <div className="flex items-center gap-2 text-white/90 text-xs">
                <Sun className="w-4 h-4 text-amber-300" />
                <span className="font-medium">
                  {weatherData[selectedDay].condition} • Perfect for 
                  {weatherData[selectedDay].icon === 'sun' ? ' swimming and beach activities' : ' indoor activities'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
