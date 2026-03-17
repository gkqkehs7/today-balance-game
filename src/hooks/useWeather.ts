'use client';

import { useState, useEffect } from 'react';
import { WeatherType, TimePhase } from '@/types';

interface UseWeatherReturn {
  weatherType: WeatherType;
  timePhase: TimePhase;
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

// 서울 고정 좌표
const SEOUL_LAT = 37.5665;
const SEOUL_LON = 126.9780;

export function useWeather(): UseWeatherReturn {
  const [weatherType, setWeatherType] = useState<WeatherType>('clear');
  const [timePhase, setTimePhase] = useState<TimePhase>('day');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const phase = getTimePhase();
    setTimePhase(phase);

    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;

    if (!apiKey) {
      applyBodyClasses('clear', phase);
      setReady(true);
      return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${SEOUL_LAT}&lon=${SEOUL_LON}&appid=${apiKey}&units=metric`;

    // API 응답 전 기본 배경 즉시 적용
    applyBodyClasses('clear', phase);

    fetch(url)
      .then(r => r.json())
      .then(data => {
        const id = data.weather[0].id;
        const temp = Math.round(data.main.temp);
        const currentPhase = getTimePhase();
        const type = classifyWeather(id, temp);

        setWeatherType(type);
        setTimePhase(currentPhase);
        applyBodyClasses(type, currentPhase);
      })
      .catch(() => {
        applyBodyClasses('clear', phase);
      })
      .finally(() => {
        setReady(true);
      });
  }, []);

  return { weatherType, timePhase, ready };
}
