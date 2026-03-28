'use client';

import { useState, useEffect } from 'react';

// WMO weather codes to emoji + label
function weatherLabel(code: number, isDay: boolean): { icon: string; label: string } {
  if (code === 0) return { icon: isDay ? '☀️' : '🌙', label: 'Clear' };
  if (code <= 3) return { icon: isDay ? '⛅' : '☁️', label: 'Partly cloudy' };
  if (code <= 48) return { icon: '🌫️', label: 'Foggy' };
  if (code <= 57) return { icon: '🌦️', label: 'Drizzle' };
  if (code <= 67) return { icon: '🌧️', label: 'Rain' };
  if (code <= 77) return { icon: '❄️', label: 'Snow' };
  if (code <= 82) return { icon: '🌧️', label: 'Rain showers' };
  if (code <= 86) return { icon: '🌨️', label: 'Snow showers' };
  if (code <= 99) return { icon: '⛈️', label: 'Thunderstorm' };
  return { icon: '🌤️', label: 'Unknown' };
}

/** Register custom city coordinates (used by geocoding-based city search) */
export function registerCityCoords(city: string, lat: number, lon: number) {
  CITY_COORDS[city.toLowerCase()] = { lat, lon };
}

// Major city coordinates (add more as needed)
const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  'dubai': { lat: 25.276987, lon: 55.296249 },
  'abu dhabi': { lat: 24.453884, lon: 54.377343 },
  'new york': { lat: 40.712776, lon: -74.005974 },
  'london': { lat: 51.507351, lon: -0.127758 },
  'tokyo': { lat: 35.689487, lon: 139.691706 },
  'singapore': { lat: 1.352083, lon: 103.819836 },
  'mumbai': { lat: 19.075983, lon: 72.877655 },
  'delhi': { lat: 28.613939, lon: 77.209023 },
  'bangalore': { lat: 12.971599, lon: 77.594566 },
  'san francisco': { lat: 37.774929, lon: -122.419418 },
  'los angeles': { lat: 34.052234, lon: -118.243685 },
  'chicago': { lat: 41.878113, lon: -87.629799 },
  'paris': { lat: 48.856614, lon: 2.352222 },
  'sydney': { lat: -33.868820, lon: 151.209296 },
  'toronto': { lat: 43.653225, lon: -79.383186 },
  'riyadh': { lat: 24.713552, lon: 46.675297 },
  'doha': { lat: 25.285447, lon: 51.531040 },
  'sharjah': { lat: 25.348766, lon: 55.405403 },
};

export function useWeather(city: string) {
  const [weather, setWeather] = useState<{ temp: number; icon: string; label: string; city: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!city) { setLoading(false); return; }

    const coords = CITY_COORDS[city.toLowerCase()];
    if (!coords) { setLoading(false); return; }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code,is_day&timezone=auto`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.current) {
          const { icon, label } = weatherLabel(data.current.weather_code, !!data.current.is_day);
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            icon,
            label,
            city,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [city]);

  return { weather, loading };
}
