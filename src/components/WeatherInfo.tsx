'use client';

import { useWeather } from '@/hooks/useWeather';

export default function WeatherInfo() {
  const { weatherInfo } = useWeather();

  return (
    <div id="weather-info">
      <span>{weatherInfo.icon}</span>
      <span>{weatherInfo.city}</span>
      <span className="weather-sep">·</span>
      <span>{weatherInfo.temp}</span>°
      <span className="weather-sep">·</span>
      <span>{weatherInfo.desc}</span>
    </div>
  );
}
