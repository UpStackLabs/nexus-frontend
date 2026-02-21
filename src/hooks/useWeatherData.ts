import { useState, useEffect } from 'react';
import { fetchWeather, CurrentWeather } from '../services/weather';
import { WEATHER_LOCATIONS } from '../config';

export interface LocationWeather {
  name: string;
  country: string;
  lat: number;
  lon: number;
  current: CurrentWeather | null;
  error?: string;
}

const REFRESH_MS = 5 * 60_000; // 5 min

export function useWeatherData() {
  const [data, setData] = useState<LocationWeather[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function refresh() {
      const results = await Promise.allSettled(
        WEATHER_LOCATIONS.map(loc => fetchWeather(loc.lat, loc.lon))
      );

      if (!mounted) return;

      const items: LocationWeather[] = WEATHER_LOCATIONS.map((loc, i) => {
        const r = results[i];
        return {
          ...loc,
          current: r.status === 'fulfilled' ? r.value.current : null,
          error: r.status === 'rejected' ? 'Unavailable' : undefined,
        };
      });

      setData(items);
      setLoading(false);
    }

    refresh();
    const id = setInterval(refresh, REFRESH_MS);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return { data, loading };
}
