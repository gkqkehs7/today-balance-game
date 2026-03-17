'use client';

import { useState, useEffect } from 'react';

const WEATHERS = ['clear', 'clouds', 'rain', 'snow', 'mist', 'heat', 'thunder'];
const TIMES = ['dawn', 'day', 'dusk', 'night'];

export default function DebugPanel() {
  const [weather, setWeather] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setWeather(params.get('weather') || '');
    setTime(params.get('time') || '');
  }, []);

  function apply(w: string, t: string) {
    const p = new URLSearchParams();
    if (w) p.set('weather', w);
    if (t) p.set('time', t);
    window.location.search = p.toString();
  }

  return (
    <div style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', color: '#fff',
      padding: '10px 14px', borderRadius: 10, display: 'flex', gap: 8, alignItems: 'center',
      fontSize: 13, backdropFilter: 'blur(6px)',
    }}>
      <select
        value={weather}
        onChange={e => apply(e.target.value, time)}
        style={{ background: '#222', color: '#fff', border: '1px solid #555', borderRadius: 6, padding: '4px 6px' }}
      >
        <option value="">날씨 선택</option>
        {WEATHERS.map(w => <option key={w} value={w}>{w}</option>)}
      </select>
      <select
        value={time}
        onChange={e => apply(weather, e.target.value)}
        style={{ background: '#222', color: '#fff', border: '1px solid #555', borderRadius: 6, padding: '4px 6px' }}
      >
        <option value="">시간 선택</option>
        {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <button
        onClick={() => { window.location.search = ''; }}
        style={{ background: '#444', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}
      >초기화</button>
    </div>
  );
}
