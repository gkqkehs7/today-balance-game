'use client';

import { useState, useEffect } from 'react';
import { WeatherType, TimePhase } from '@/types';

interface WeatherInfo {
  icon: string;
  city: string;
  temp: string;
  desc: string;
}

interface UseWeatherReturn {
  weatherType: WeatherType;
  timePhase: TimePhase;
  weatherInfo: WeatherInfo;
  ready: boolean;
}

function getTimePhase(): TimePhase {
  const h = new Date().getHours() + new Date().getMinutes() / 60;
  if (h >= 5 && h < 6.5) return 'dawn';
  if (h >= 6.5 && h < 18.5) return 'day';
  if (h >= 18.5 && h < 20.5) return 'dusk';
  return 'night';
}

function isLightBackground(type: WeatherType, phase: TimePhase): boolean {
  if (phase === 'night' || phase === 'dusk') return false;
  return ['clear', 'snow', 'mist'].includes(type) && phase === 'day';
}

function classifyWeather(id: number, temp: number): WeatherType {
  if (id >= 200 && id < 300) return 'thunder';
  if (id >= 300 && id < 600) return 'rain';
  if (id >= 600 && id < 700) return 'snow';
  if (id >= 700 && id < 800) return 'mist';
  if (id === 800) return temp >= 33 ? 'heat' : 'clear';
  if (id > 800) return 'clouds';
  return 'clear';
}

function getWeatherIcon(type: WeatherType, phase: TimePhase): string {
  const icons: Record<WeatherType, string> = {
    clear:   phase === 'night' ? '🌙' : (phase === 'dawn' || phase === 'dusk') ? '🌅' : '☀️',
    clouds:  '☁️',
    rain:    '🌧️',
    snow:    phase === 'night' ? '🌨️' : '❄️',
    mist:    '🌫️',
    heat:    '🔥',
    thunder: '⛈️',
  };
  return icons[type] || '🌤️';
}

function applyBodyClasses(type: WeatherType, phase: TimePhase) {
  if (typeof document === 'undefined') return;

  const weatherAll = ['weather-clear', 'weather-clouds', 'weather-rain', 'weather-snow', 'weather-mist', 'weather-heat', 'weather-thunder'];
  document.body.classList.remove(...weatherAll);
  document.body.classList.add(`weather-${type}`);

  const timeAll = ['time-dawn', 'time-day', 'time-dusk', 'time-night'];
  document.body.classList.remove(...timeAll);
  document.body.classList.add(`time-${phase}`);

  document.body.classList.remove('theme-light', 'theme-dark');
  document.body.classList.add(isLightBackground(type, phase) ? 'theme-light' : 'theme-dark');
}

export function useWeather(): UseWeatherReturn {
  const [weatherType, setWeatherType] = useState<WeatherType>('clear');
  const [timePhase, setTimePhase] = useState<TimePhase>('day');
  const [ready, setReady] = useState(false);
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo>({
    icon: '☀️',
    city: '--',
    temp: '--',
    desc: '--',
  });

  useEffect(() => {
    const phase = getTimePhase();
    setTimePhase(phase);

    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;

    if (!apiKey || !navigator.geolocation) {
      applyBodyClasses('clear', phase);
      setWeatherInfo(prev => ({ ...prev, icon: getWeatherIcon('clear', phase) }));
      setReady(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`;
          const data = await fetch(url).then(r => r.json());

          const id = data.weather[0].id;
          const temp = Math.round(data.main.temp);
          const desc = data.weather[0].description;

          let city = data.name;
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ko`,
              { headers: { 'User-Agent': 'today-balance-game' } }
            );
            const geoData = await geoRes.json();
            city =
              geoData.address?.city ||
              geoData.address?.town ||
              geoData.address?.village ||
              geoData.address?.county ||
              data.name;
          } catch {
            // fallback to English name
          }

          const currentPhase = getTimePhase();
          const type = classifyWeather(id, temp);

          setWeatherType(type);
          setTimePhase(currentPhase);
          setWeatherInfo({
            icon: getWeatherIcon(type, currentPhase),
            city,
            temp: String(temp),
            desc,
          });

          applyBodyClasses(type, currentPhase);
        } catch {
          applyBodyClasses('clear', phase);
          setWeatherInfo(prev => ({ ...prev, icon: getWeatherIcon('clear', phase) }));
        }
        setReady(true);
      },
      () => {
        applyBodyClasses('clear', phase);
        setWeatherInfo(prev => ({ ...prev, icon: getWeatherIcon('clear', phase) }));
        setReady(true);
      },
      { timeout: 6000 }
    );
  }, []);

  return { weatherType, timePhase, weatherInfo, ready };
}
