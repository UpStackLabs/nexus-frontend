import { API } from '../config';

export interface CurrentWeather {
  time: string;
  temperature_2m: number;
  wind_speed_10m: number;
  precipitation: number;
  surface_pressure: number;
}

export interface WeatherResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  current_units: {
    temperature_2m: string;
    wind_speed_10m: string;
    precipitation: string;
    surface_pressure: string;
  };
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherResponse> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'temperature_2m,wind_speed_10m,precipitation,surface_pressure',
    wind_speed_unit: 'kmh',
    timezone: 'UTC',
  });
  const res = await fetch(`${API.openMeteo}/forecast?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  return res.json();
}
